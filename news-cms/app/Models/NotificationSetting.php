<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotificationSetting extends Model
{
    protected $fillable = [
        'user_id', 'type', 'in_app', 'email'
    ];

    protected $casts = [
        'in_app' => 'boolean',
        'email' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
