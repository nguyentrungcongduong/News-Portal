<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use App\Traits\BelongsToTenant;

class Announcement extends Model
{
    use BelongsToTenant;
    protected $table = 'announcements';

    protected $fillable = [
        'title',
        'link',
        'type',
        'status',
        'start_at',
        'end_at',
    ];

    protected $casts = [
        'start_at' => 'datetime',
        'end_at' => 'datetime',
    ];

    /**
     * Scope for active announcements.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active')
            ->where(function ($q) {
                $q->whereNull('start_at')->orWhere('start_at', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('end_at')->orWhere('end_at', '>=', now());
            });
    }

    /**
     * Check if the announcement is currently active.
     */
    public function isActive(): bool
    {
        if ($this->status !== 'active') {
            return false;
        }

        if ($this->start_at && now()->lt($this->start_at)) {
            return false;
        }

        if ($this->end_at && now()->gt($this->end_at)) {
            return false;
        }

        return true;
    }
}
