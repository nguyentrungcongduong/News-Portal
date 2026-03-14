<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Category;
use App\Models\Post;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Artisan;

echo "FORCE MOCK DATA & ACTIVATE CATEGORIES\n";
echo "====================================\n";

$admin = User::where('role', 'admin')->first() ?? User::first();

foreach (Category::all() as $cat) {
    echo "Processing: {$cat->name}...\n";
    
    // 1. Force Active & Show Home
    $cat->update([
        'status' => 'active',
        'show_home' => true
    ]);
    
    // 2. Ensure at least 5 posts
    $currentCount = $cat->posts()->where('status', 'published')->count();
    $needed = 5 - $currentCount;

    if ($needed > 0) {
        echo "  - Creating $needed posts...\n";
        for ($i = 1; $i <= $needed; $i++) {
            $uniqueId = Str::random(5);
            $title = "Tìm hiểu chuyên sâu về {$cat->name} - Tập " . ($currentCount + $i);
            
            $post = Post::create([
                'author_id' => $admin->id,
                'title' => $title,
                'slug' => Str::slug($title) . '-' . time() . rand(1, 1000),
                'summary' => "Tổng hợp các kiến thức và tin tức quan trọng trong lĩnh vực {$cat->name}.",
                'content' => "<p>Nội dung chi tiết cho chuyên mục {$cat->name}. Đây là dữ liệu mẫu để kiểm tra hiển thị.</p>",
                'thumbnail' => "https://picsum.photos/seed/" . Str::random(10) . "/1200/800",
                'status' => 'published',
                'published_at' => now(),
                'views' => rand(100, 5000),
            ]);
            $post->categories()->attach($cat->id);
        }
    } else {
        echo "  - Done (already has $currentCount posts)\n";
    }
}

echo "Clearing application cache...\n";
Artisan::call('cache:clear');

echo "COMPLETED SUCCESSFULLY!\n";
