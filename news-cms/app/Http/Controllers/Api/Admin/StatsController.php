<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\PostViewStat;
use App\Models\Category;
use App\Models\User;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class StatsController extends Controller
{
    /**
     * Get comprehensive dashboard statistics for Admin.
     */
    public function dashboard()
    {
        try {
            $tenantId = app('tenant')->id;
            Log::info("Dashboard stats requested for tenant: {$tenantId}");
            // Cache analytics per tenant
            $data = Cache::remember("admin.dashboard.stats.{$tenantId}.v1", 60, function () use ($tenantId) {
                // 1. KPI Cards
                $stats = [
                    'total_posts'     => Post::count(),
                    'published_posts' => Post::where('status', 'published')->count(),
                    'total_views'     => (int) (Post::sum('views') ?? 0),
                    'pending_posts'   => Post::where('status', 'pending')->count(),
                ];

                // 2. Views by Day (Last 14 days)
                $viewsByDay = [];
                try {
                    $startDate = now()->subDays(13)->startOfDay();
                    $endDate = now()->startOfDay();
                    
                    $dbStats = \App\Models\DailyStatistic::where('date', '>=', $startDate->format('Y-m-d'))
                        ->orderBy('date')
                        ->get()
                        ->keyBy(function($item) {
                            return $item->date->format('Y-m-d');
                        });

                    $current = $startDate->copy();
                    while ($current->lte($endDate)) {
                        $dateKey = $current->format('Y-m-d');
                        $viewsByDay[] = [
                            'date' => $current->format('d/m'),
                            'views' => isset($dbStats[$dateKey]) ? (int) $dbStats[$dateKey]->view_count : 0
                        ];
                        $current = $current->addDay();
                    }
                } catch (\Exception $e) {
                    Log::warning('DailyStatistic error: ' . $e->getMessage());
                }

                // 3. Top Posts
                $topPosts = Post::where('status', 'published')
                    ->orderBy('views', 'desc')
                    ->limit(5)
                    ->get(['id', 'title', 'views', 'slug'])
                    ->map(function ($post) {
                        return [
                            'id' => $post->id,
                            'title' => $post->title,
                            'views' => (int) $post->views,
                            'slug' => $post->slug,
                        ];
                    });

                // 4. Stats by Category
                $statsByCategory = Category::withCount('posts')
                    ->get()
                    ->map(function ($cat) {
                        return [
                            'name' => $cat->name,
                            'post_count' => $cat->posts_count,
                        ];
                    })
                    ->sortByDesc('post_count')
                    ->values();

                // 5. Stats by Author
                $statsByAuthor = User::withCount('posts')
                    ->has('posts')
                    ->get()
                    ->map(function ($user) {
                        return [
                            'name' => $user->name,
                            'post_count' => $user->posts_count,
                        ];
                    })
                    ->sortByDesc('post_count')
                    ->values();

                return [
                    'stats' => $stats,
                    'views_chart' => $viewsByDay,
                    'top_posts' => $topPosts,
                    'categories' => $statsByCategory,
                    'authors' => $statsByAuthor,
                    'last_updated' => now()->format('H:i:s d/m/Y')
                ];
            });

            return response()->json($data);
        } catch (\Throwable $e) {
            Log::error('Dashboard API Error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'error' => 'Internal Server Error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
