<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Post;
use App\Http\Resources\Public\PostResource;
use Illuminate\Support\Facades\Cache;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * Get posts and details for Category Page.
     */
    public function show(string $slug, Request $request)
    {
        $page = $request->get('page', 1);
        $perPage = $request->get('per_page', 5);

        $cacheKey = "category_page_{$slug}_p{$page}_s{$perPage}";

        $data = Cache::remember($cacheKey, 60, function () use ($slug, $page, $perPage) {
            $category = Category::where('slug', $slug)
                ->where('status', 'active')
                ->firstOrFail();

            // 1. Featured Posts in this Category
            $featuredPosts = $category->posts()
                ->published()
                ->orderBy('views', 'desc')
                ->limit(3)
                ->get();

            // 2. Paginated Posts
            $posts = $category->posts()
                ->published()
                ->latest('published_at')
                ->paginate($perPage);

            // 3. Trending for Sidebar
            $trendingPosts = Post::published()
                ->orderBy('views', 'desc')
                ->limit(5)
                ->get();

            return [
                'category' => [
                    'id'   => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'description' => $category->description ?? "Tổng hợp tin tức mới nhất về {$category->name}."
                ],
                'featured_posts' => PostResource::collection($featuredPosts)->resolve(),
                'posts' => PostResource::collection($posts)->response()->getData(true),
                'trending_posts' => PostResource::collection($trendingPosts)->resolve()
            ];
        });

        return response()->json($data);
    }
}
