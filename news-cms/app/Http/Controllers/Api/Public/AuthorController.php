<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Post;
use App\Http\Resources\Public\AuthorResource;
use App\Http\Resources\Public\PostResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class AuthorController extends Controller
{
    /**
     * Get author details and paginated posts.
     */
    public function show($slug, Request $request)
    {
        $page = $request->get('page', 1);

        return Cache::remember("author_page_{$slug}_p{$page}", 180, function () use ($slug) {
            $author = User::where('slug', $slug)
                ->firstOrFail();

            $posts = Post::published()
                ->where('author_id', $author->id)
                ->with(['categories', 'author'])
                ->latest('published_at')
                ->paginate(12);

            return response()->json([
                'author' => new AuthorResource($author),
                'posts' => PostResource::collection($posts)->response()->getData(true)
            ]);
        });
    }
}
