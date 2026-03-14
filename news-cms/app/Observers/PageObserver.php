<?php

namespace App\Observers;

use App\Models\Page;
use App\Models\PageVersion;

class PageObserver
{
    /**
     * Auto-save version snapshot after page is updated
     */
    public function updated(Page $page): void
    {
        // Only save version if blocks or SEO changed
        if ($page->wasChanged('blocks') || $page->wasChanged('seo')) {
            $this->createVersionSnapshot($page);
        }
    }

    /**
     * Save initial version when page is created
     */
    public function created(Page $page): void
    {
        $this->createVersionSnapshot($page);
    }

    /**
     * Create a version snapshot
     */
    protected function createVersionSnapshot(Page $page): void
    {
        PageVersion::create([
            'page_id' => $page->id,
            'version' => $page->version,
            'snapshot' => [
                'title' => $page->title,
                'slug' => $page->slug,
                'locale' => $page->locale,
                'status' => $page->status,
                'seo' => $page->seo,
                'blocks' => $page->blocks,
            ],
            'user_id' => auth()->id(),
            'created_at' => now(),
        ]);
    }
}
