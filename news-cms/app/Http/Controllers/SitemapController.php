<?php

namespace App\Http\Controllers;

use App\Services\SitemapService;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    protected $sitemapService;

    public function __construct(SitemapService $sitemapService)
    {
        $this->sitemapService = $sitemapService;
    }

    /**
     * Main sitemap.xml
     */
    public function sitemap(): Response
    {
        $xml = $this->sitemapService->generateSitemap();

        return response($xml, 200)
            ->header('Content-Type', 'application/xml; charset=utf-8')
            ->header('Cache-Control', 'public, max-age=600'); // 10 minutes
    }

    /**
     * Sitemap index
     */
    public function sitemapIndex(): Response
    {
        $xml = $this->sitemapService->generateSitemapIndex();

        return response($xml, 200)
            ->header('Content-Type', 'application/xml; charset=utf-8')
            ->header('Cache-Control', 'public, max-age=600');
    }

    /**
     * News sitemap (Google News)
     */
    public function newsSitemap(): Response
    {
        $xml = $this->sitemapService->generateNewsSitemap();

        return response($xml, 200)
            ->header('Content-Type', 'application/xml; charset=utf-8')
            ->header('Cache-Control', 'public, max-age=300'); // 5 minutes
    }
}
