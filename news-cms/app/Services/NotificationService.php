<?php

namespace App\Services;

use App\Models\User;
use App\Models\Notification;

class NotificationService
{
    public static function create($payload)
    {
        $userId = $payload['user_id'] ?? null;
        $type = $payload['type'];
        $noti = null;

        // 1. IN-APP FLOW
        if (NotificationPreferenceService::allow($userId, $type, 'in_app')) {
            $noti = Notification::create($payload);

            // Emit to User Channel or Admin Channel
            $channel = $userId ? "user:{$userId}" : 'admin';
            
            \App\Services\SocketService::emit(
                $channel,
                $type, 
                $noti
            );

            // Analytics Log
            \App\Models\UserNotificationLog::create([
                'type' => $type,
                'channel' => 'in_app',
                'sent_at' => now()
            ]);
        }

        // 2. EMAIL FLOW
        if ($userId && NotificationPreferenceService::allow($userId, $type, 'email')) {
             try {
                 $user = User::find($userId);
                 if ($user && $user->email) {
                    // Create a dummy notification object if not created above (for email content)
                    $mailNoti = $noti ?? new Notification($payload);
                    
                    \Illuminate\Support\Facades\Mail::to($user->email)->queue(
                        new \App\Mail\NotificationMail($mailNoti)
                    );

                    // Analytics Log
                    \App\Models\UserNotificationLog::create([
                        'type' => $type,
                        'channel' => 'email',
                        'sent_at' => now()
                    ]);
                 }
             } catch (\Exception $e) {
                 \Illuminate\Support\Facades\Log::error("Failed to send notification email: " . $e->getMessage());
             }
        }

        return $noti;
    }

    /**
     * Notify all admins about an event.
     */
    public static function notifyAdmins(string $type, array $data, string $message = null)
    {
        // For admins, we can create one global notification (user_id=null) if it's shared,
        // OR individual notifications.
        // The previous implementation created individual notifs. Let's keep that for unique read status.
        
        $admins = User::where('role', 'admin')->get();

        foreach ($admins as $admin) {
            self::create([
                'user_id' => $admin->id,
                'type' => $type,
                'title' => 'Thông báo hệ thống', // Default title
                'message' => $message ?? ($data['reason'] ?? 'Có thông báo mới'),
                'data' => $data,
            ]);
        }
    }
}
