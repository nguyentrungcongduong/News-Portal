<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Post;
use App\Models\Category;
use App\Models\User;
use Illuminate\Support\Str;

class MockPostsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = Category::all();
        $admin = User::where('role', 'admin')->first() ?? User::first();

        if (!$admin) {
            $this->command->error('Không tìm thấy user admin để gán làm tác giả.');
            return;
        }

        foreach ($categories as $category) {
            // Đếm số bài viết đã xuất bản trong chuyên mục này
            $currentCount = $category->posts()->where('status', 'published')->count();
            $needed = 5 - $currentCount;

            if ($needed > 0) {
                $this->command->info("Đang tạo thêm $needed bài viết cho chuyên mục: {$category->name}");
                
                for ($i = 1; $i <= $needed; $i++) {
                    $uniqueId = Str::random(5);
                    $title = "Tìm hiểu về {$category->name} - Bài viết chuyên sâu số $i ($uniqueId)";
                    
                    $post = Post::create([
                        'author_id' => $admin->id,
                        'title' => $title,
                        'slug' => Str::slug($title) . '-' . time() . rand(1, 1000),
                        'summary' => "Đây là bản tóm tắt nội dung về chuyên mục {$category->name}. Bài viết cung cấp cái nhìn tổng quan và những cập nhật mới nhất dành cho độc giả quan tâm đến lĩnh vực này.",
                        'content' => "
                            <p>Chào mừng quý độc giả đến với bài viết về <strong>{$category->name}</strong> trên hệ thống THE PRESS.</p>
                            <p>Trong bài viết này, chúng tôi sẽ đi sâu vào phân tích các khía cạnh quan trọng nhất của {$category->name}. Hệ thống báo chí của chúng tôi luôn nỗ lực mang đến những thông tin chính xác, khách quan và có chiều sâu nhất.</p>
                            <h3>Những điểm chính cần lưu ý:</h3>
                            <ul>
                                <li>Phát triển bền vững trong lĩnh vực {$category->name}.</li>
                                <li>Tác động của công nghệ hiện đại đến {$category->name}.</li>
                                <li>Tầm nhìn chiến lược trong tương lai gần.</li>
                            </ul>
                            <p>Hy vọng nội dung mock data này sẽ giúp bạn kiểm tra giao diện (UI/UX) của chuyên mục {$category->name} một cách đầy đủ nhất. Mọi bài viết đều tuân thủ phong cách Editorial chuẩn mực với Serif Typography.</p>
                        ",
                        'thumbnail' => "https://picsum.photos/seed/cat-" . $category->id . "-" . $i . "-" . time() . "/1200/800",
                        'status' => 'published',
                        'published_at' => now(),
                        'views' => rand(500, 10000),
                    ]);

                    // Quan trọng: Gán category cho post
                    $post->categories()->attach($category->id);
                }
            } else {
                $this->command->info("Chuyên mục {$category->name} đã có đủ $currentCount bài viết.");
            }
        }

        $this->command->info('Hoàn tất quá trình mock data cho tất cả chuyên mục.');
    }
}
