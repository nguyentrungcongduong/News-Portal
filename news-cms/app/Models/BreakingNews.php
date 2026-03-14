<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use App\Traits\BelongsToTenant;

class BreakingNews extends Model
{
    use BelongsToTenant;
    protected $fillable = [
        'post_id',
        'priority',
        'start_at',
        'end_at',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'start_at' => 'datetime',
        'end_at' => 'datetime',
        'priority' => 'integer',
    ];

    public function post()
    {
        return $this->belongsTo(Post::class);
    }

    /**
     * Scope for active breaking news.
     */
    public function scopeActive($query)
    {
        $now = now();
        return $query->where('is_active', true)
            ->where(function ($q) use ($now) {
                $q->whereNull('start_at')->orWhere('start_at', '<=', $now);
            })
            ->where(function ($q) use ($now) {
                $q->whereNull('end_at')->orWhere('end_at', '>=', $now);
            });
    }
}
