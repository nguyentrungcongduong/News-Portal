<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class ContentLock extends Model
{
    protected $fillable = [
        'lockable_type',
        'lockable_id',
        'user_id',
        'locked_at',
        'expires_at',
    ];

    protected $casts = [
        'locked_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    // TTL mặc định: 10 phút
    const LOCK_DURATION_MINUTES = 10;

    /**
     * Polymorphic relationship - có thể lock bất kỳ resource nào
     */
    public function lockable()
    {
        return $this->morphTo();
    }

    /**
     * Người đang lock resource
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Tạo hoặc renew lock
     */
    public static function acquire($lockableType, $lockableId, $userId)
    {
        // Xóa lock cũ nếu hết hạn
        self::where('lockable_type', $lockableType)
            ->where('lockable_id', $lockableId)
            ->where('expires_at', '<', now())
            ->delete();

        // Kiểm tra lock đang active
        $activeLock = self::where('lockable_type', $lockableType)
            ->where('lockable_id', $lockableId)
            ->where('expires_at', '>', now())
            ->first();

        // Nếu là người cùng thì cho renew (same tab/session)
        if ($activeLock && $activeLock->user_id == $userId) {
            $activeLock->update([
                'locked_at' => now(),
                'expires_at' => now()->addMinutes(self::LOCK_DURATION_MINUTES),
            ]);
            return [
                'acquired' => true,
                'lock' => $activeLock,
                'message' => 'Lock renewed',
            ];
        }

        // Nếu có lock từ người khác
        if ($activeLock) {
            return [
                'acquired' => false,
                'lock' => $activeLock,
                'message' => 'Resource is locked by another user',
            ];
        }

        // Tạo lock mới
        $lock = self::create([
            'lockable_type' => $lockableType,
            'lockable_id' => $lockableId,
            'user_id' => $userId,
            'locked_at' => now(),
            'expires_at' => now()->addMinutes(self::LOCK_DURATION_MINUTES),
        ]);

        return [
            'acquired' => true,
            'lock' => $lock,
            'message' => 'Lock acquired',
        ];
    }

    /**
     * Release lock
     */
    public static function release($lockableType, $lockableId, $userId)
    {
        $lock = self::where('lockable_type', $lockableType)
            ->where('lockable_id', $lockableId)
            ->where('user_id', $userId)
            ->first();

        if ($lock) {
            $lock->delete();
            return ['released' => true];
        }

        return ['released' => false];
    }

    /**
     * Check lock status
     */
    public static function checkStatus($lockableType, $lockableId)
    {
        // Xóa lock hết hạn
        self::where('lockable_type', $lockableType)
            ->where('lockable_id', $lockableId)
            ->where('expires_at', '<', now())
            ->delete();

        $lock = self::where('lockable_type', $lockableType)
            ->where('lockable_id', $lockableId)
            ->where('expires_at', '>', now())
            ->with('user')
            ->first();

        if (!$lock) {
            return [
                'locked' => false,
                'lock' => null,
            ];
        }

        return [
            'locked' => true,
            'lock' => [
                'id' => $lock->id,
                'user_id' => $lock->user_id,
                'user_name' => $lock->user->name ?? 'Unknown',
                'locked_at' => $lock->locked_at->toIso8601String(),
                'expires_at' => $lock->expires_at->toIso8601String(),
                'remaining_seconds' => $lock->expires_at->diffInSeconds(now()),
            ],
        ];
    }

    /**
     * Force unlock (Admin only)
     */
    public static function forceUnlock($lockableType, $lockableId, $adminUserId)
    {
        $lock = self::where('lockable_type', $lockableType)
            ->where('lockable_id', $lockableId)
            ->first();

        if ($lock) {
            // Log audit
            \Log::info('Content lock force unlocked', [
                'lock_id' => $lock->id,
                'lockable_type' => $lockableType,
                'lockable_id' => $lockableId,
                'previous_user_id' => $lock->user_id,
                'admin_user_id' => $adminUserId,
                'timestamp' => now(),
            ]);

            $lock->delete();
            return ['force_unlocked' => true];
        }

        return ['force_unlocked' => false];
    }
}
