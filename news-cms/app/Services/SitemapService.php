<?php

namespace App\Services;

use App\Models\Post;
use App\Models\Category;
use Illuminate\Support\Facades\Cache;

class SitemapService
{
    /**
     * Generate XML sitemap
     */
    public function generateSitemap(): string
    {
        return Cache::remember('sitemap.xml', now()->addMinutes(10), function () {
            return $this->buildSitemap();
        });
    }

    /**
     * Build XML content
     */
    private function buildSitemap(): string
    {
        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

        // Homepage
        $xml .= $this->formatUrl(config('app.url'), now()->toIso8601String(), 'weekly', '1.0');

        // Published posts
        $posts = Post::published()
            ->where('include_in_sitemap', true)
            ->select('slug', 'updated_at')
            ->orderBy('updated_at', 'desc')
            ->get();

        foreach ($posts as $post) {
            $url = route('post.show', ['slug' => $post->slug]);
            $xml .= $this->formatUrl(
                $url,
                $post->updated_at->toIso8601String(),
                'weekly',
                '0.8'
            );
        }

        // Categories
        $categories = Category::where('active', true)
            ->select('slug', 'updated_at')
            ->get();

        foreach ($categories as $category) {
            $url = route('category.show', ['slug' => $category->slug]);
            $xml .= $this->formatUrl(
                $url,
                $category->updated_at->toIso8601String(),
                'weekly',
                '0.7'
            );
        }

        // Trang tĩnh
        $staticPages = [
            route('about') => 'monthly',
            route('contact') => 'monthly',
            route('terms') => 'yearly',
        ];

        foreach ($staticPages as $url => $changefreq) {
            $xml .= $this->formatUrl($url, now()->toIso8601String(), $changefreq, '0.6');
        }

        $xml .= '</urlset>';

        return $xml;
    }

    /**
     * Format single URL entry
     */
    private function formatUrl(string $loc, string $lastmod, string $changefreq, string $priority): string
    {
        return sprintf(
            "  <url>\n    <loc>%s</loc>\n    <lastmod>%s</lastmod>\n    <changefreq>%s</changefreq>\n    <priority>%s</priority>\n  </url>\n",
            htmlspecialchars($loc, ENT_QUOTES, 'UTF-8'),
            $lastmod,
            $changefreq,
            $priority
        );
    }

    /**
     * Clear sitemap cache
     */
    public function clearCache(): void
    {
        Cache::forget('sitemap.xml');
    }

    /**
     * Generate sitemap index (cho multi-language hoặc large sites)
     */
    public function generateSitemapIndex(): string
    {
        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $xml .= '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

        // Main sitemap
        $xml .= sprintf(
            "  <sitemap>\n    <loc>%s</loc>\n    <lastmod>%s</lastmod>\n  </sitemap>\n",
            config('app.url') . '/sitemap.xml',
            now()->toIso8601String()
        );

        // Optional: News sitemap (cho Google News)
        $xml .= sprintf(
            "  <sitemap>\n    <loc>%s</loc>\n    <lastmod>%s</lastmod>\n  </sitemap>\n",
            config('app.url') . '/news-sitemap.xml',
            now()->toIso8601String()
        );

        $xml .= '</sitemapindex>';

        return $xml;
    }

    /**
     * Generate Google News Sitemap (cần current news)
     */
    public function generateNewsSitemap(): string
    {
        return Cache::remember('news-sitemap.xml', now()->addMinutes(5), function () {
            $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
            $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">' . "\n";

            // Lấy bài viết 48 giờ gần nhất
            $posts = Post::published()
                ->where('include_in_sitemap', true)
                ->where('published_at', '>=', now()->subHours(48))
                ->select('slug', 'title', 'published_at')
                ->orderBy('published_at', 'desc')
                ->get();

            foreach ($posts as $post) {
                $url = route('post.show', ['slug' => $post->slug]);
                $xml .= "  <url>\n";
                $xml .= sprintf("    <loc>%s</loc>\n", htmlspecialchars($url, ENT_QUOTES));
                $xml .= "    <news:news>\n";
                $xml .= sprintf("      <news:publication_date>%s</news:publication_date>\n", $post->published_at->toIso8601String());
                $xml .= sprintf("      <news:title>%s</news:title>\n", htmlspecialchars($post->title, ENT_QUOTES));
                $xml .= sprintf("      <news:publication name=\"%s\" language=\"vi\" />\n", config('app.name'));
                $xml .= "    </news:news>\n";
                $xml .= "  </url>\n";
            }

            $xml .= '</urlset>';

            return $xml;
        });
    }
}
