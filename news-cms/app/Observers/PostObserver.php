<?php

namespace App\Observers;

use App\Models\Post;
use App\Models\PostSlug;
use App\Services\SeoSchemaService;
use App\Services\SitemapService;

class PostObserver
{
    protected $sitemapService;
    protected $seoSchemaService;

    public function __construct(SitemapService $sitemapService, SeoSchemaService $seoSchemaService)
    {
        $this->sitemapService = $sitemapService;
        $this->seoSchemaService = $seoSchemaService;
    }

    /**
     * Handle post update - track slug changes
     */
    public function updating(Post $post): void
    {
        // Nếu slug thay đổi
        if ($post->isDirty('slug')) {
            $oldSlug = $post->getOriginal('slug');

            // Lưu old slug để redirect
            PostSlug::firstOrCreate(
                ['old_slug' => $oldSlug],
                ['post_id' => $post->id]
            );
        }
    }

    /**
     * Handle post update - clear caches
     */
    public function updated(Post $post): void
    {
        // Clear SEO schema cache
        $this->seoSchemaService->clearSchemaCache($post);

        // Clear sitemap cache nếu published_at hoặc status thay đổi
        if ($post->wasChanged(['published_at', 'status', 'include_in_sitemap'])) {
            $this->sitemapService->clearCache();
        }
    }

    /**
     * Handle post create - clear sitemap nếu published
     */
    public function created(Post $post): void
    {
        if ($post->published_at) {
            $this->sitemapService->clearCache();
        }
    }

    /**
     * Handle post delete - clear caches
     */
    public function deleted(Post $post): void
    {
        $this->seoSchemaService->clearSchemaCache($post);
        $this->sitemapService->clearCache();
    }
}
