<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\Public\CategoryResource;
use App\Http\Resources\Public\PostDetailResource;
use App\Http\Resources\Public\PostResource;
use App\Models\Ad;
use App\Models\Category;
use App\Models\Post;
use App\Models\PostBookmark;
use App\Models\PostLike;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Redis;

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
        $data = Cache::remember("post_detail_full:{$slug}", 60, function () use ($slug) {
            $post = Post::published()
                ->where('slug', $slug)
                ->with(['categories', 'author', 'tags'])
                ->firstOrFail();

            $related = Post::published()
                ->with(['categories', 'author'])
                ->whereHas('categories', function ($query) use ($post) {
                    $query->whereIn('categories.id', $post->categories->pluck('id'));
                })
                ->where('id', '!=', $post->id)
                ->latest('published_at')
                ->limit(5)
                ->get();

            $trending = Post::published()
                ->with(['categories', 'author'])
                ->orderBy('views', 'desc')
                ->limit(5)
                ->get();

            $ads = [
                'in_article' => Ad::where('position', 'in_article')->where('status', 'active')->get()->filter->isActive()->values(),
                'sidebar' => Ad::where('position', 'sidebar')->where('status', 'active')->get()->filter->isActive()->values(),
            ];

            return [
                'post' => $post,
                'related_posts' => $related,
                'trending_posts' => $trending,
                'ads' => $ads,
            ];
        });

        try {
            if (config('database.redis.client') !== 'null') {
                $postId = $data['post']->id;
                $tenantId = app('tenant')->id;
                $today = now()->format('Ymd');

                Redis::incr("post:{$postId}:views");
                Redis::incr("post:{$postId}:views:{$today}");
                Redis::expire("post:{$postId}:views:{$today}", 60 * 60 * 24 * 3);

                Redis::incr("site:{$tenantId}:views:{$today}");
                Redis::expire("site:{$tenantId}:views:{$today}", 60 * 60 * 24 * 3);
            }
        } catch (\Throwable $e) {
        }

        return response()->json([
            'post' => new PostDetailResource($data['post']),
            'related_posts' => PostResource::collection($data['related_posts']),
            'trending_posts' => PostResource::collection($data['trending_posts']),
            'ads' => $data['ads'],
        ]);
    }

    public function like($id)
    {
        $userId = auth()->id();

        $like = PostLike::where('post_id', $id)
            ->where('user_id', $userId)
            ->first();

        if ($like) {
            $like->delete();
            $liked = false;
        } else {
            PostLike::create([
                'post_id' => $id,
                'user_id' => $userId,
            ]);
            $liked = true;
        }

        $count = PostLike::where('post_id', $id)->count();
        $this->forgetPostDetailCache($id);

        return response()->json([
            'liked' => $liked,
            'likes_count' => $count,
        ]);
    }

    public function bookmark($id)
    {
        $userId = auth()->id();

        $bookmark = PostBookmark::where('post_id', $id)
            ->where('user_id', $userId)
            ->first();

        if ($bookmark) {
            $bookmark->delete();
            $bookmarked = false;
        } else {
            PostBookmark::create([
                'post_id' => $id,
                'user_id' => $userId,
            ]);
            $bookmarked = true;
        }

        $this->forgetPostDetailCache($id);

        return response()->json([
            'bookmarked' => $bookmarked,
        ]);
    }

    public function bookmarkIds()
    {
        $bookmarkIds = PostBookmark::where('user_id', auth()->id())
            ->pluck('post_id')
            ->values();

        return response()->json([
            'data' => $bookmarkIds,
        ]);
    }

    public function bookmarks()
    {
        $posts = Post::published()
            ->select('posts.*')
            ->join('post_bookmarks', 'post_bookmarks.post_id', '=', 'posts.id')
            ->where('post_bookmarks.user_id', auth()->id())
            ->with(['categories', 'author'])
            ->orderByDesc('post_bookmarks.created_at')
            ->paginate(12);

        return PostResource::collection($posts);
    }

    public function likes()
    {
        $posts = Post::published()
            ->select('posts.*')
            ->join('post_likes', 'post_likes.post_id', '=', 'posts.id')
            ->where('post_likes.user_id', auth()->id())
            ->with(['categories', 'author'])
            ->orderByDesc('post_likes.created_at')
            ->paginate(12);

        return PostResource::collection($posts);
    }

    protected function forgetPostDetailCache($postId): void
    {
        $post = Post::find($postId);

        if ($post) {
            Cache::forget("post_detail_full:{$post->slug}");
        }
    }
}
