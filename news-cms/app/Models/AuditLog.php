<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Traits\BelongsToTenant;

class AuditLog extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'user_id',
        'action',
        'subject_type',
        'subject_id',
        'before',
        'after',
        'ip',
        'user_agent',
        'created_at',
    ];

    protected $casts = [
        'before' => 'array',
        'after' => 'array',
        'created_at' => 'datetime',
    ];

    // Disable updates/deletes - audit logs are immutable
    public $timestamps = false;

    protected static function boot()
    {
        parent::boot();
        
        // Only allow creating, never updating or deleting
        static::updating(function () {
            return false;
        });
        
        static::deleting(function () {
            return false;
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the subject model instance.
     */
    public function subject()
    {
        $class = 'App\\Models\\' . $this->subject_type;
        if (class_exists($class) && $this->subject_id) {
            return $class::find($this->subject_id);
        }
        return null;
    }

    /**
     * Scope: Filter by action
     */
    public function scopeAction($query, string $action)
    {
        return $query->where('action', $action);
    }

    /**
     * Scope: Filter by subject type
     */
    public function scopeSubjectType($query, string $type)
    {
        return $query->where('subject_type', $type);
    }

    /**
     * Scope: Filter by user
     */
    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope: Filter by date range
     */
    public function scopeDateRange($query, $start, $end)
    {
        return $query->whereBetween('created_at', [$start, $end]);
    }
}
