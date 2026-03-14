<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Support\Facades\Redis;
use App\Http\Resources\Public\PostListResource;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class StatsController extends Controller
{
    /**
     * Get trending posts based on views today.
     */
    public function trending()
    {
        return Cache::remember('public.trending.v5', 60, function () {
            try {
                // If Redis is down, this might throw immediately or after timeout
                $keys = Redis::keys("post:*:views:" . now()->format('Ymd'));
                
                $scores = [];
                $prefix = config('database.redis.options.prefix', '');

                foreach ($keys as $key) {
                    $cleanKey = str_replace($prefix, '', $key);
                    if (preg_match('/post:(\d+):views/', $cleanKey, $matches)) {
                        $postId = $matches[1];
                        $scores[$postId] = (int) Redis::get($cleanKey);
                    }
                }

                arsort($scores);
                $postIds = array_slice(array_keys($scores), 0, 5);

                if (empty($postIds)) {
                    return PostListResource::collection(
                        Post::published()->orderBy('views', 'desc')->limit(5)->get()
                    );
                }

                $posts = Post::published()
                    ->whereIn('id', $postIds)
                    ->get()
                    ->sortBy(function($post) use ($postIds) {
                        return array_search($post->id, $postIds);
                    });

                return PostListResource::collection($posts);
            } catch (\Throwable $e) {
                // Return simple trending posts from DB if Redis is unreachable
                return PostListResource::collection(
                    Post::published()->orderBy('views', 'desc')->limit(5)->get()
                );
            }
        });
    }
}
