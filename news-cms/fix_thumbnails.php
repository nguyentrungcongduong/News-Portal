<?php
/**
 * Fix thumbnails - dùng picsum với seed cố định cho từng category
 * picsum.photos hoạt động không cần API key và ổn định
 */

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Post;
use App\Models\Category;

// Seed IDs đẹp từ picsum (được test thực tế)
$categorySeeds = [
    'thoi-su'    => [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    'kinh-doanh' => [110, 120, 130, 140, 150, 160, 170, 180, 190, 200],
    'cong-nghe'  => [210, 220, 230, 240, 250, 260, 270, 280, 290, 300],
    'the-thao'   => [310, 320, 330, 340, 350, 360, 370, 380, 390, 400],
    'giai-tri'   => [410, 420, 430, 440, 450, 460, 470, 480, 490, 500],
    'suc-khoe'   => [510, 520, 530, 540, 550, 560, 570, 580, 590, 600],
    'giao-duc'   => [610, 620, 630, 640, 650, 660, 670, 680, 690, 700],
    'xe'         => [710, 720, 730, 740, 750, 760, 770, 780, 790, 800],
    'doi-song'   => [810, 820, 830, 840, 850, 860, 870, 880, 890, 900],
    'phap-luat'  => [910, 920, 930, 940, 950, 960, 970, 980, 990, 1000],
];

$updated = 0;
foreach ($categorySeeds as $slug => $seeds) {
    $category = Category::where('slug', $slug)->first();
    if (!$category) continue;

    $posts = $category->posts()->where('status', 'published')->get();
    foreach ($posts as $index => $post) {
        $seed = $seeds[$index % count($seeds)];
        // Dùng picsum với seed cố định - URL clean, không có params phức tạp
        $post->thumbnail = "https://picsum.photos/seed/{$slug}-{$seed}/1200/800";
        $post->save();
        $updated++;
    }
    echo "  Updated {$posts->count()} posts for {$category->name}\n";
}

echo "\nTotal updated: $updated\n";

// Kiểm tra mẫu
$samples = Post::where('status', 'published')->limit(5)->get(['title', 'thumbnail']);
echo "\nSample thumbnails:\n";
foreach ($samples as $p) {
    echo "  - {$p->thumbnail}\n";
}

echo "\nDone!\n";
