<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Http\Resources\Public\PostResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class SearchController extends Controller
{
    /**
     * Search posts by keyword.
     */
    public function search(Request $request)
    {
        $q = trim($request->get('q'));

        if (empty($q) || strlen($q) < 2) {
            return response()->json([
                'query' => $q,
                'data' => [],
                'meta' => ['total' => 0]
            ]);
        }

        $page = $request->get('page', 1);
        $cacheKey = "search_results:" . md5($q) . ":p$page";

        return Cache::remember($cacheKey, 600, function () use ($q) {
            // Using a simpler search for performance as requested (title and summary)
            // But since we are on PGSQL and have a GIN index, we can use that or simple LIKE
            
            $posts = Post::published()
                ->with(['categories', 'author'])
                ->where(function ($query) use ($q) {
                    $query->where('title', 'like', "%{$q}%")
                          ->orWhere('summary', 'like', "%{$q}%");
                })
                ->latest('published_at')
                ->paginate(12);

            return response()->json([
                'query' => $q,
                'total' => $posts->total(),
                'data' => PostResource::collection($posts),
                'meta' => [
                    'current_page' => $posts->currentPage(),
                    'last_page' => $posts->lastPage(),
                    'total' => $posts->total(),
                ],
            ]);
        });
    }
}
