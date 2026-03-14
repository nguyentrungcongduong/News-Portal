<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotificationLog extends Model
{
    protected $fillable = [
        'notification_id',
        'channel',
        'status',
        'error_message',
    ];

    public function notification()
    {
        return $this->belongsTo(SiteNotification::class, 'notification_id');
    }
}
