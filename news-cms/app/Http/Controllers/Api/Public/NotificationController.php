<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class NotificationController extends Controller
{
    /**
     * Get recent site notifications for users (Web Push / Bell).
     */
    public function index(Request $request)
    {
        return \App\Models\SiteNotification::where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>=', now());
            })
            ->orderBy('created_at', 'desc')
            ->limit(10) // Only latest 10
            ->get();
    }
}
