<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Get user's notifications (supports pagination).
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Notifications where user_id matches OR user_id is NULL (global)
        $notifications = Notification::where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                  ->orWhereNull('user_id');
            })
            ->latest()
            ->paginate(10);

        return response()->json($notifications);
    }

    /**
     * Get unread count.
     */
    public function unreadCount(Request $request)
    {
        $user = $request->user();
        
        $count = Notification::whereNull('read_at')
            ->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                  ->orWhereNull('user_id');
            })->count();

        return response()->json(['count' => $count]);
    }

    /**
     * Mark as read.
     */
    public function markAsRead(Request $request, $id)
    {
        $user = $request->user();
        
        $notification = Notification::where('id', $id)
            ->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                  ->orWhereNull('user_id');
            })
            ->firstOrFail();

        $notification->update(['read_at' => now()]);

        return response()->json(['message' => 'Marked as read']);
    }

    /**
     * Mark ALL as read.
     */
    public function markAllRead(Request $request)
    {
        $user = $request->user();
        
        Notification::whereNull('read_at')
            ->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                  ->orWhereNull('user_id');
            })
            ->update(['read_at' => now()]);

        return response()->json(['message' => 'All marked as read']);
    }
}
