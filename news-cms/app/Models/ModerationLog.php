<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ModerationLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'admin_id',
        'action',
        'target_type',
        'target_id',
        'reason',
    ];

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    /**
     * Helper to log an action
     */
    public static function log(string $action, string $targetType, int $targetId, ?string $reason = null)
    {
        return self::create([
            'admin_id' => auth()->id() ?? 1, // Fallback for testing/dev
            'action' => $action,
            'target_type' => $targetType,
            'target_id' => $targetId,
            'reason' => $reason
        ]);
    }
}
