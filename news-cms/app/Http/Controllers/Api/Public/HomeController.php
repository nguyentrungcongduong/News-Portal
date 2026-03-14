<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\Category;
use App\Models\Ad;
use App\Models\Announcement;
use App\Http\Resources\Public\PostResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class HomeController extends Controller
{
    /**
     * Unified endpoint for Home Page data.
     */
    public function index()
    {
        $tenantId = app('tenant')->id;
        return Cache::remember("home_page_data_{$tenantId}", 60, function () {
            // 1. Breaking News
            $breakingNews = Announcement::where('type', 'breaking')
                ->where('status', 'active')
                ->get()
                ->filter->isActive()
                ->values();

            // 1b. Breaking News (From Posts)
            $breakingPosts = Post::published()
                ->breaking()
                ->orderBy('published_at', 'desc')
                ->get();

            // 2. Top Headline (Hero - Currently based on most views)
            $topHeadline = Post::published()
                ->with(['categories', 'author'])
                ->orderBy('views', 'desc')
                ->first();

            // 3. Featured Posts (4 posts excluding top headline)
            $featuredPosts = Post::published()
                ->with(['categories', 'author'])
                ->where('id', '!=', $topHeadline?->id)
                ->whereNotIn('id', $breakingPosts->pluck('id')) // Exclude breaking posts from featured? Optional.
                ->orderBy('published_at', 'desc')
                ->limit(4)
                ->get();

            // 4. Latest Posts (10 posts)
            $latestPosts = Post::published()
                ->with(['categories', 'author'])
                ->latest('published_at')
                ->limit(10)
                ->get();

            // 5. Category Blocks (Categories marked with show_home)
            $categoryBlocks = Category::where('show_home', true)
                ->where('status', 'active')
                ->orderBy('order')
                ->with(['posts' => function ($q) {
                    $q->published()->latest('published_at')->limit(5);
                }])
                ->get()
                ->map(function ($cat) {
                    return [
                        'category' => [
                            'id' => $cat->id,
                            'name' => $cat->name,
                            'slug' => $cat->slug
                        ],
                        'posts' => PostResource::collection($cat->posts)
                    ];
                });

            // 6. Ads
            $ads = [
                'header' => Ad::where('position', 'header')->where('status', 'active')->get()->filter->isActive()->values(),
                'sidebar' => Ad::where('position', 'sidebar')->where('status', 'active')->get()->filter->isActive()->values(),
            ];

            return response()->json([
                'breaking_posts' => PostResource::collection($breakingPosts),
                'announcements' => $breakingNews, // Keep old text announcements if needed
                'top_headline' => $topHeadline ? new PostResource($topHeadline) : null,
                'featured_posts' => PostResource::collection($featuredPosts),
                'latest_posts' => PostResource::collection($latestPosts),
                'category_blocks' => $categoryBlocks,
                'ads' => $ads
            ]);
        });
    }
}
