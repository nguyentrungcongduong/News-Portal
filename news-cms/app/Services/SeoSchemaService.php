<?php

namespace App\Services;

use App\Models\Post;
use Illuminate\Support\Facades\Cache;

class SeoSchemaService
{
    /**
     * Generate NewsArticle JSON-LD schema
     */
    public function generateNewsArticleSchema(Post $post): array
    {
        return [
            '@context' => 'https://schema.org',
            '@type' => 'NewsArticle',
            'headline' => $post->title,
            'description' => $post->summary,
            'image' => [
                $post->thumbnail ?? config('app.default_post_image')
            ],
            'datePublished' => $post->published_at?->toIso8601String() ?? $post->created_at->toIso8601String(),
            'dateModified' => $post->updated_at->toIso8601String(),
            'author' => [
                '@type' => 'Person',
                'name' => $post->author->name ?? 'Unknown',
                'url' => route('user.profile', ['user' => $post->author_id])
            ],
            'publisher' => [
                '@type' => 'Organization',
                'name' => config('app.name', 'News Portal'),
                'logo' => [
                    '@type' => 'ImageObject',
                    'url' => asset('images/logo.png'),
                    'width' => 600,
                    'height' => 60
                ]
            ],
            'articleBody' => strip_tags($post->content_html ?? $post->content),
        ];
    }

    /**
     * Inject schema vào HTML
     */
    public function generateSchemaTag(Post $post): string
    {
        $schema = $this->generateNewsArticleSchema($post);
        return '<script type="application/ld+json">' . json_encode($schema, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT) . '</script>';
    }

    /**
     * Get schema từ cache hoặc generate
     */
    public function getSchemaForPost(Post $post): array
    {
        $cacheKey = "post_schema.{$post->id}";

        return Cache::remember($cacheKey, now()->addHours(24), function () use ($post) {
            return $this->generateNewsArticleSchema($post);
        });
    }

    /**
     * Clear schema cache khi update post
     */
    public function clearSchemaCache(Post $post): void
    {
        Cache::forget("post_schema.{$post->id}");
    }

    /**
     * Generate Organization schema (homepage)
     */
    public function generateOrganizationSchema(): array
    {
        return [
            '@context' => 'https://schema.org',
            '@type' => 'Organization',
            'name' => config('app.name', 'News Portal'),
            'url' => config('app.url'),
            'logo' => asset('images/logo.png'),
            'description' => config('app.description', 'Vietnamese news portal'),
            'sameAs' => [
                'https://facebook.com/' . config('social.facebook'),
                'https://twitter.com/' . config('social.twitter'),
            ]
        ];
    }

    /**
     * Generate BreadcrumbList schema
     */
    public function generateBreadcrumbSchema(Post $post, $categories = []): array
    {
        $items = [
            [
                '@type' => 'ListItem',
                'position' => 1,
                'name' => 'Home',
                'item' => config('app.url')
            ]
        ];

        if (!empty($categories)) {
            foreach ($categories as $index => $category) {
                $items[] = [
                    '@type' => 'ListItem',
                    'position' => $index + 2,
                    'name' => $category->name,
                    'item' => route('category.show', ['slug' => $category->slug])
                ];
            }
        }

        $items[] = [
            '@type' => 'ListItem',
            'position' => count($items) + 1,
            'name' => $post->title,
            'item' => route('post.show', ['slug' => $post->slug])
        ];

        return [
            '@context' => 'https://schema.org',
            '@type' => 'BreadcrumbList',
            'itemListElement' => $items
        ];
    }
}
