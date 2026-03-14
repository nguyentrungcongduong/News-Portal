<?php

return [
    /*
    |--------------------------------------------------------------------------
    | SEO Configuration
    |--------------------------------------------------------------------------
    |
    | Cấu hình cho News Portal SEO
    |
    */

    'schema' => [
        // Organization info
        'organization' => [
            'name' => env('APP_NAME', 'News Portal'),
            'url' => env('APP_URL', 'https://newsportal.vn'),
            'logo' => env('LOGO_URL', 'https://newsportal.vn/logo.png'),
            'description' => env('APP_DESCRIPTION', 'Cổng thông tín báo điện tử'),
        ],

        // NewsArticle defaults
        'article' => [
            'default_image' => env('DEFAULT_ARTICLE_IMAGE', '/images/default-article.jpg'),
            'cache_minutes' => 24 * 60, // 24 hours
        ],

        // Languages (for multi-language future)
        'languages' => ['vi'],
    ],

    'sitemap' => [
        // Sitemap cache duration
        'cache_minutes' => 10, // Main sitemap
        'news_cache_minutes' => 5, // News sitemap

        // Post settings
        'posts' => [
            'only_published' => true,
            'include_by_default' => true,
        ],

        // News sitemap: Include posts from last X hours
        'news_hours' => 48,

        // Enable auto-submission
        'auto_submit_google' => env('SITEMAP_AUTO_SUBMIT_GOOGLE', false),
        'auto_submit_bing' => env('SITEMAP_AUTO_SUBMIT_BING', false),
    ],

    'slug_redirect' => [
        // Redirect status code
        'status_code' => 301, // Permanent redirect
        'cache_minutes' => 60,
    ],

    'content_lock' => [
        // TTL in minutes
        'duration_minutes' => 10,
        // Auto-cleanup expired locks (run in schedule)
        'cleanup_interval_minutes' => 60,
    ],

    'editorial_notes' => [
        // Default visibility for new notes
        'default_visibility' => 'editor',
        // Allowed visibilities
        'visibilities' => ['editor', 'admin'],
    ],
];
