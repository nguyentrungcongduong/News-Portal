<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Tag;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class TagController extends Controller
{
    /**
     * Get all tags for public display.
     */
    public function index(Request $request)
    {
        $tenantId = app('tenant')?->id;
        $cacheKey = "tags:public:{$tenantId}";

        $tags = Cache::remember($cacheKey, 300, function () {
            return Tag::select('id', 'name', 'slug', 'color', 'icon', 'post_count', 'is_featured')
                      ->where('post_count', '>', 0)
                      ->orderByDesc('post_count')
                      ->get();
        });

        return response()->json($tags);
    }

    /**
     * Get featured tags.
     */
    public function featured(Request $request)
    {
        $tenantId = app('tenant')?->id;
        $limit = min($request->get('limit', 10), 20);
        $cacheKey = "tags:featured:{$tenantId}:{$limit}";

        $tags = Cache::remember($cacheKey, 300, function () use ($limit) {
            return Tag::select('id', 'name', 'slug', 'color', 'icon', 'post_count')
                      ->featured()
                      ->orderByDesc('post_count')
                      ->take($limit)
                      ->get();
        });

        return response()->json($tags);
    }

    /**
     * Get popular tags (tag cloud).
     */
    public function popular(Request $request)
    {
        $tenantId = app('tenant')?->id;
        $limit = min($request->get('limit', 30), 50);
        $cacheKey = "tags:popular:{$tenantId}:{$limit}";

        $tags = Cache::remember($cacheKey, 300, function () use ($limit) {
            return Tag::select('id', 'name', 'slug', 'color', 'post_count')
                      ->where('post_count', '>', 0)
                      ->popular()
                      ->take($limit)
                      ->get();
        });

        return response()->json($tags);
    }

    /**
     * Get tag details with paginated posts.
     */
    public function show(Request $request, string $slug)
    {
        $tenantId = app('tenant')?->id;
        
        $tag = Tag::where('slug', $slug)->first();

        if (!$tag) {
            return response()->json(['message' => 'Tag not found.'], 404);
        }

        // Get paginated posts for this tag
        $perPage = min($request->get('per_page', 12), 24);
        
        $posts = $tag->posts()
                     ->where('status', 'published')
                     ->with(['category:id,name,slug', 'author:id,name,slug,avatar'])
                     ->orderByDesc('published_at')
                     ->paginate($perPage);

        // Format response
        $response = [
            'tag' => [
                'id' => $tag->id,
                'name' => $tag->name,
                'slug' => $tag->slug,
                'description' => $tag->description,
                'color' => $tag->color,
                'icon' => $tag->icon,
                'post_count' => $tag->post_count,
                'meta' => $tag->meta,
            ],
            'posts' => $posts,
        ];

        return response()->json($response);
    }

    /**
     * Get related tags (tags that appear together with the specified tag).
     */
    public function related(Request $request, string $slug)
    {
        $tag = Tag::where('slug', $slug)->first();

        if (!$tag) {
            return response()->json(['message' => 'Tag not found.'], 404);
        }

        $tenantId = app('tenant')?->id;
        $limit = min($request->get('limit', 10), 20);
        $cacheKey = "tags:related:{$tenantId}:{$tag->id}:{$limit}";

        $relatedTags = Cache::remember($cacheKey, 600, function () use ($tag, $limit) {
            // Get post IDs that have this tag
            $postIds = $tag->posts()
                           ->where('status', 'published')
                           ->pluck('posts.id')
                           ->toArray();

            if (empty($postIds)) {
                return collect([]);
            }

            // Find other tags that are on these posts
            return Tag::select('tags.id', 'tags.name', 'tags.slug', 'tags.color', 'tags.post_count')
                      ->join('post_tag', 'tags.id', '=', 'post_tag.tag_id')
                      ->whereIn('post_tag.post_id', $postIds)
                      ->where('tags.id', '!=', $tag->id)
                      ->groupBy('tags.id', 'tags.name', 'tags.slug', 'tags.color', 'tags.post_count')
                      ->orderByRaw('COUNT(*) DESC')
                      ->take($limit)
                      ->get();
        });

        return response()->json($relatedTags);
    }
}
