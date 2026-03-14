<?php

namespace App\Listeners;

use App\Events\BreakingNewsActivated;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class SendBreakingNotification
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(BreakingNewsActivated $event): void
    {
        $breaking = $event->breakingNews;
        
        // Ensure post Relationship is loaded
        $breaking->load('post');
        
        if (!$breaking->post) {
            return;
        }

        // 1. Create Public Site Notification
        $notification = \App\Models\SiteNotification::create([
            'type' => 'breaking_news',
            'title' => 'TIN NÓNG MỚI NHẤT',
            'message' => $breaking->post->title,
            'url' => '/post/' . $breaking->post->slug,
            'is_active' => true,
            'expires_at' => now()->addHours(4) // Default expire like breaking news
        ]);

        // 2. Log delivery (Simulated for Web)
        \App\Models\NotificationLog::create([
            'notification_id' => $notification->id,
            'channel' => 'web',
            'status' => 'success',
        ]);

        // 3. Emit Realtime Socket Event
        \App\Services\SocketService::emit('global', 'breaking_news', [
            'id' => $notification->id,
            'title' => $notification->title,
            'message' => $notification->message,
            'url' => $notification->url,
            'type' => 'breaking_news',
            'created_at' => $notification->created_at->toIso8601String()
        ]);

        // 4. Notify Admins (Internal Notification Center)
        \App\Services\NotificationService::notifyAdmins('breaking_news', [
             'breaking_id' => $breaking->id,
             'post_id' => $breaking->post->id,
             'url' => '/post/' . $breaking->post->slug
        ], "Tin nóng đã được kích hoạt: " . $breaking->post->title);
    }
}
