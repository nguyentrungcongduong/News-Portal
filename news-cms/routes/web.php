<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

// ============== PHẦN 3: SITEMAP ==============
Route::get('/sitemap.xml', [\App\Http\Controllers\SitemapController::class, 'sitemap']);
Route::get('/sitemap-index.xml', [\App\Http\Controllers\SitemapController::class, 'sitemapIndex']);
Route::get('/news-sitemap.xml', [\App\Http\Controllers\SitemapController::class, 'newsSitemap']);

// ============== PHẦN 3: SLUG REDIRECT ==============
Route::middleware(\App\Http\Middleware\RedirectOldPostSlugs::class)->group(function () {
    // Routes cho post detail sẽ được thêm vào frontend routes
});
