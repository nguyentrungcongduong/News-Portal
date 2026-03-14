<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\Category;
use App\Models\Ad;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Redis;
use App\Http\Resources\Public\PostResource;
use App\Http\Resources\Public\CategoryResource;
use App\Http\Resources\Public\PostDetailResource;

class PostController extends Controller
{
    /**
     * Get list of all categories for navigation.
     */
    public function categories()
    {
        $tenantId = app('tenant')->id;
        return Cache::remember("public.categories.{$tenantId}", 60 * 60, function () {
            return CategoryResource::collection(Category::orderBy('order')->get());
        });
    }

    /**
     * Get list of published posts.
     */
    public function index()
    {
        $tenantId = app('tenant')->id;
        $type = request('type');
        
        if ($type === 'home') {
            $posts = Cache::remember("posts.home.latest.{$tenantId}", 60, function () {
                return Post::published()
                    ->with(['categories', 'author'])
                    ->latest('published_at')
                    ->limit(15)
                    ->get();
            });
            return PostResource::collection($posts);
        }

        $posts = Cache::remember("posts.home.paginated.{$tenantId}." . request('page', 1), 60 * 5, function () {
            return Post::published()
                ->with(['categories', 'author'])
                ->latest('published_at')
                ->paginate(10);
        });

        return PostResource::collection($posts);
    }

    /**
     * Get post details by slug.
     */
    public function show($slug)
    {
        $data = Cache::remember("post_detail_full:$slug", 60, function () use ($slug) {
            $post = Post::published()
                ->where('slug', $slug)
                ->with(['categories', 'author'])
                ->firstOrFail();

            // 1. Related Posts (Same category, limited to 5)
            $related = Post::published()
                ->whereHas('categories', function($q) use ($post) {
                    $q->whereIn('categories.id', $post->categories->pluck('id'));
                })
                ->where('id', '!=', $post->id)
                ->latest('published_at')
                ->limit(5)
                ->get();

            // 2. Trending (Global)
            $trending = Post::published()
                ->orderBy('views', 'desc')
                ->limit(5)
                ->get();

            // 3. Ads
            $ads = [
                'in_article' => Ad::where('position', 'in_article')->where('status', 'active')->get()->filter->isActive()->values(),
                'sidebar' => Ad::where('position', 'sidebar')->where('status', 'active')->get()->filter->isActive()->values(),
            ];

            return [
                'post' => new PostDetailResource($post),
                'related_posts' => PostResource::collection($related),
                'trending_posts' => PostResource::collection($trending),
                'ads' => $ads
            ];
        });

        // Track view (Redis Real-time) - Safe check
        try {
            if (config('database.redis.client') !== 'null') {
                $postId = $data['post']->id;
                $tenantId = app('tenant')->id;
                $today = now()->format('Ymd');
                
                // Track Post specific views
                Redis::incr("post:{$postId}:views");
                Redis::incr("post:{$postId}:views:$today");
                Redis::expire("post:{$postId}:views:$today", 60 * 60 * 24 * 3);

                // Track Global Site views
                Redis::incr("site:{$tenantId}:views:$today");
                Redis::expire("site:{$tenantId}:views:$today", 60 * 60 * 24 * 3);
            }
        } catch (\Throwable $e) {
            // Silently fail if Redis is down to prevent blocking the response
        }

        return response()->json($data);
    }
    public function like($id)
    {
        $userId = auth()->id();
        
        $like = \App\Models\PostLike::where('post_id', $id)
            ->where('user_id', $userId)
            ->first();

        if ($like) {
            $like->delete();
            $liked = false;
        } else {
            \App\Models\PostLike::create([
                'post_id' => $id,
                'user_id' => $userId
            ]);
            $liked = true;
        }

        $count = \App\Models\PostLike::where('post_id', $id)->count();
        
        // Clear cache for this post so count updates
        $post = Post::find($id);
        if ($post) {
            Cache::forget("post_detail_full:{$post->slug}");
        }

        return response()->json([
            'liked' => $liked,
            'likes_count' => $count
        ]);
    }
}
