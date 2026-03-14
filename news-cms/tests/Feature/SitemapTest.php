<?php

namespace Tests\Feature;

use App\Models\Post;
use App\Models\PostSlug;
use Tests\TestCase;

class SitemapTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Create test posts
        Post::factory(5)->create(['status' => 'published']);
        Post::factory(2)->create(['status' => 'draft']);
    }

    /** @test */
    public function sitemap_returns_xml()
    {
        $response = $this->get('/sitemap.xml');

        $response->assertStatus(200);
        $response->assertHeader('content-type', 'application/xml; charset=utf-8');
        $this->assertStringContainsString('<?xml version="1.0"', $response->getContent());
        $this->assertStringContainsString('<urlset', $response->getContent());
    }

    /** @test */
    public function sitemap_includes_published_posts_only()
    {
        $response = $this->get('/sitemap.xml');

        $content = $response->getContent();

        // Should include published
        $published = Post::where('status', 'published')->first();
        $this->assertStringContainsString($published->slug, $content);

        // Should not include draft
        $draft = Post::where('status', 'draft')->first();
        $this->assertStringNotContainsString($draft->slug, $content);
    }

    /** @test */
    public function news_sitemap_includes_recent_posts()
    {
        // Create recent post
        $recentPost = Post::factory()->create([
            'status' => 'published',
            'published_at' => now()->subHours(12),
        ]);

        // Create old post (> 48 hours)
        $oldPost = Post::factory()->create([
            'status' => 'published',
            'published_at' => now()->subDays(3),
        ]);

        $response = $this->get('/news-sitemap.xml');
        $content = $response->getContent();

        // Should include recent
        $this->assertStringContainsString($recentPost->slug, $content);
        $this->assertStringContainsString('<news:news>', $content);

        // Should not include old
        $this->assertStringNotContainsString($oldPost->slug, $content);
    }

    /** @test */
    public function sitemap_index_exists()
    {
        $response = $this->get('/sitemap-index.xml');

        $response->assertStatus(200);
        $response->assertHeader('content-type', 'application/xml; charset=utf-8');
        $this->assertStringContainsString('<sitemapindex', $response->getContent());
    }

    /** @test */
    public function sitemap_excludes_posts_with_include_in_sitemap_false()
    {
        $post = Post::factory()->create([
            'status' => 'published',
            'include_in_sitemap' => false,
        ]);

        $response = $this->get('/sitemap.xml');
        $this->assertStringNotContainsString($post->slug, $response->getContent());
    }

    /** @test */
    public function slug_redirect_redirects_to_new_slug()
    {
        $post = Post::factory()->create(['slug' => 'old-slug']);
        $oldSlug = $post->slug;

        // Save old slug
        PostSlug::create([
            'post_id' => $post->id,
            'old_slug' => $oldSlug,
        ]);

        // Update slug
        $post->update(['slug' => 'new-slug']);

        // Visit old URL
        $response = $this->get("/posts/{$oldSlug}");

        $response->assertStatus(301);
        $response->assertRedirect("/posts/new-slug");
    }
}
