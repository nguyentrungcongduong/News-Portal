<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use App\Traits\BelongsToTenant;

class Ad extends Model
{
    use BelongsToTenant;
    protected $fillable = [
        'name',
        'position',
        'type',
        'html_code',
        'image_url',
        'link',
        'quota_impressions',
        'quota_clicks',
        'impressions',
        'clicks',
        'status',
        'start_at',
        'end_at',
    ];

    protected $casts = [
        'start_at' => 'datetime',
        'end_at' => 'datetime',
        'quota_impressions' => 'integer',
        'quota_clicks' => 'integer',
        'impressions' => 'integer',
        'clicks' => 'integer',
    ];

    /**
     * Check if the ad is currently active.
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

        if ($this->quota_impressions && $this->impressions >= $this->quota_impressions) {
            return false;
        }

        if ($this->quota_clicks && $this->clicks >= $this->quota_clicks) {
            return false;
        }

        return true;
    }
}
