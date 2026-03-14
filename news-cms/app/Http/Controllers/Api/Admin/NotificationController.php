<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Get system notifications for the authenticated admin.
     */
    public function index()
    {
        $notifications = Notification::where('user_id', auth()->id())
            ->latest()
            ->paginate(20);

        return response()->json($notifications);
    }

    /**
     * Mark a specific notification as read.
     */
    public function markAsRead(int $id)
    {
        $notification = Notification::where('user_id', auth()->id())->findOrFail($id);
        $notification->update(['read_at' => now()]);

        return response()->json(['message' => 'Đã đánh dấu là đã đọc']);
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead()
    {
        Notification::where('user_id', auth()->id())
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['message' => 'Đã đánh dấu tất cả là đã đọc']);
    }

    /**
     * Get notification analytics.
     */
    public function analytics()
    {
        $logs = \App\Models\UserNotificationLog::selectRaw('type, channel, count(*) as count')
            ->groupBy('type', 'channel')
            ->get();

        $totalSent = \App\Models\UserNotificationLog::count();
        $emailCount = \App\Models\UserNotificationLog::where('channel', 'email')->count();
        $inAppCount = \App\Models\UserNotificationLog::where('channel', 'in_app')->count();

        // Group by date (last 7 days) - Postgres syntax
        $dailyStats = \App\Models\UserNotificationLog::selectRaw('created_at::date as date, count(*) as count')
            ->where('created_at', '>=', now()->subDays(7))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json([
            'breakdown' => $logs,
            'summary' => [
                'total' => $totalSent,
                'email' => $emailCount,
                'in_app' => $inAppCount
            ],
            'daily' => $dailyStats
        ]);
    }
}
