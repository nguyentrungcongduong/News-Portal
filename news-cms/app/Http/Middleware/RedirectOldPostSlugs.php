<?php

namespace App\Http\Middleware;

use App\Models\PostSlug;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RedirectOldPostSlugs
{
    /**
     * Handle redirect khi slug cũ được truy cập
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Chỉ apply cho route post.show
        if ($request->route()?->getName() === 'post.show') {
            $slug = $request->route('slug');

            // Kiểm tra có phải old slug không
            $post = PostSlug::findPostBySlug($slug);

            if ($post && $post->slug !== $slug) {
                // 301 redirect sang slug mới
                return redirect(route('post.show', ['slug' => $post->slug]), 301);
            }
        }

        return $next($request);
    }
}
