<?php

namespace App\Console\Commands;

use App\Services\SitemapService;
use Illuminate\Console\Command;

class GenerateSitemap extends Command
{
    protected $signature = 'sitemap:generate';
    protected $description = 'Generate and cache XML sitemaps';

    public function handle()
    {
        $sitemapService = app(SitemapService::class);

        try {
            $this->info('Generating main sitemap...');
            $mainSitemap = $sitemapService->generateSitemap();
            $this->info('✓ Main sitemap generated: ' . strlen($mainSitemap) . ' bytes');

            $this->info('Generating news sitemap...');
            $newsSitemap = $sitemapService->generateNewsSitemap();
            $this->info('✓ News sitemap generated: ' . strlen($newsSitemap) . ' bytes');

            $this->info('Generating sitemap index...');
            $index = $sitemapService->generateSitemapIndex();
            $this->info('✓ Sitemap index generated: ' . strlen($index) . ' bytes');

            $this->info("\n✓ All sitemaps generated successfully!");
            $this->info('Available at:');
            $this->line('  - ' . config('app.url') . '/sitemap.xml');
            $this->line('  - ' . config('app.url') . '/news-sitemap.xml');
            $this->line('  - ' . config('app.url') . '/sitemap-index.xml');

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error('Error generating sitemaps: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
