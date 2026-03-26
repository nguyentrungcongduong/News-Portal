<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Post;
use App\Models\Category;

$total = Post::where('status', 'published')->count();
$breaking = Post::where('is_breaking', true)->count();
echo "Total published: $total\n";
echo "Breaking news: $breaking\n";
echo "\nPhan bo theo chuyen muc:\n";

$cats = Category::withCount(['posts' => function($q) { 
    $q->where('status', 'published'); 
}])->get();

foreach ($cats as $c) {
    echo "  {$c->name}: {$c->posts_count} bai\n";
}

// Sample posts with thumbnails
echo "\nSample thumbnails:\n";
$samples = Post::where('status', 'published')->limit(3)->get(['title', 'thumbnail']);
foreach ($samples as $p) {
    echo "  - {$p->title}\n    {$p->thumbnail}\n";
}
