<?php

namespace App\View\Components;

use App\Models\Post;
use App\Services\SeoSchemaService;
use Closure;
use Illuminate\View\Component;

class SeoSchema extends Component
{
    public Post $post;

    public function __construct(Post $post)
    {
        $this->post = $post;
    }

    public function render(): Closure|string
    {
        $seoService = app(SeoSchemaService::class);
        $schema = $seoService->getSchemaForPost($this->post);

        return view('components.seo-schema', [
            'schema' => $schema,
        ]);
    }
}
