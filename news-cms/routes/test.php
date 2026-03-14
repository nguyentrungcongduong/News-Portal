<?php

use Illuminate\Support\Facades\Route;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;

Route::get('/test-cloudinary', function() {
    try {
        // Test basic config
        $config = config('cloudinary');
        
        // Try to get cloudinary instance info
        $cloudinary = app('cloudinary');
        
        return response()->json([
            'config' => $config,
            'cloudinary_loaded' => $cloudinary ? 'yes' : 'no',
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});
