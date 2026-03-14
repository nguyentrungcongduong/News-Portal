<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Page;
use Illuminate\Support\Facades\Cache;

class PageController extends Controller
{
    /**
     * Get a published page by slug
     */
    public function show(string $slug)
    {
        $tenantId = app()->has('tenant') ? app('tenant')->id : 'global';
        
        return Cache::remember("page_{$slug}_{$tenantId}", 60 * 60, function () use ($slug) {
            $page = Page::published()
                ->where('slug', $slug)
                ->firstOrFail();

            return response()->json([
                'id' => $page->id,
                'title' => $page->title,
                'slug' => $page->slug,
                'locale' => $page->locale,
                'seo' => $page->seo,
                'blocks' => $page->blocks,
                'updated_at' => $page->updated_at,
            ]);
        });
    }
}
