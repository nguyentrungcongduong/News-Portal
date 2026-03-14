<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Post;
use App\Models\User;
use App\Models\ModerationLog;
use Illuminate\Http\Request;

class ModerationController extends Controller
{
    /**
     * Get overview stats for moderation dashboard.
     */
    public function overview()
    {
        return response()->json([
            'reported_comments' => Comment::where('status', 'reported')->count(),
            'pending_posts' => Post::where('status', 'pending')->count(),
            'blocked_users' => User::where('is_blocked', true)->count(),
            'hidden_comments' => Comment::where('status', 'hidden')->count(),
            'total_reports' => \App\Models\CommentReport::where('status', 'pending')->count(),
        ]);
    }

    /**
     * Recently taken moderation actions.
     */
    public function recentLogs()
    {
        $logs = \App\Models\AuditLog::with('user:id,name')
            ->latest()
            ->limit(10)
            ->get()
            ->map(function($log) {
                return [
                    'id' => $log->id,
                    'created_at' => $log->created_at,
                    'admin' => $log->user,
                    'action' => $log->action,
                    'target_type' => $log->target_type,
                    'target_id' => $log->target_id,
                    'changes' => $log->changes,
                    'ip' => $log->ip
                ];
            });
            
        return response()->json($logs);
    }

    /**
     * Get detailed comment analytics.
     */
    public function commentAnalytics()
    {
        // 1. Top controversial posts (most reports)
        $controversialPosts = Post::select('id', 'title', 'slug')
            ->withCount(['comments as reported_comments_count' => function($q) {
                $q->where('report_count', '>', 0);
            }])
            ->orderByDesc('reported_comments_count')
            ->limit(5)
            ->get();

        // 2. Risky users (low trust score or many reported comments)
        $riskyUsers = User::select('id', 'name', 'email', 'trust_score')
            ->where('trust_score', '<', 0)
            ->orWhereHas('comments', function($q) {
                $q->whereIn('status', ['reported', 'hidden']);
            })
            ->withCount(['comments as bad_comments_count' => function($q) {
                $q->whereIn('status', ['reported', 'hidden']);
            }])
            ->orderBy('trust_score', 'asc')
            ->limit(5)
            ->get();

        // 3. Stats by status
        $statsByStatus = Comment::selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->get();

        return response()->json([
            'controversial_posts' => $controversialPosts,
            'risky_users' => $riskyUsers,
            'stats_by_status' => $statsByStatus
        ]);
    }
}
