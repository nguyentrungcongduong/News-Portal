<?php

namespace App\Services;

use App\Models\NotificationSetting;

class NotificationPreferenceService
{
    /**
     * Check if user allows notification for specific type and channel.
     * Default to true if no setting found.
     */
    public static function allow($userId, $type, $channel)
    {
        // Global notifications (userId null) always allowed
        if (!$userId) return true;

        $setting = NotificationSetting::where([
            'user_id' => $userId,
            'type' => $type
        ])->first();

        // If no preference set, default to TRUE for 'in_app' and FALSE for 'email',
        // UNLESS it's a critical system type, then email might be true by default.
        if (!$setting) {
             if ($channel === 'in_app') return true;
             // Default email to false to avoid spam unless they opt-in
             return false; 
        }

        return $setting->$channel ?? false;
    }
}
