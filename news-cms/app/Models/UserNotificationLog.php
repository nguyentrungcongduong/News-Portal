<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserNotificationLog extends Model
{
    protected $fillable = [
        'type', 'channel', 'sent_at'
    ];

    protected $casts = [
        'sent_at' => 'datetime',
    ];
}
