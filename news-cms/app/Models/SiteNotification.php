<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use App\Traits\BelongsToTenant;

class SiteNotification extends Model
{
    use BelongsToTenant;
    protected $table = 'site_notifications';

    protected $fillable = [
        'type',
        'title',
        'message',
        'url',
        'is_active',
        'expires_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'expires_at' => 'datetime',
    ];

    public function logs()
    {
        return $this->hasMany(NotificationLog::class, 'notification_id');
    }
}
