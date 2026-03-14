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
            $target = 10;
            $needed = $target - $currentCount;

            if ($needed > 0) {
                $this->command->info("Đang tạo thêm $needed bài viết cho chuyên mục: {$category->name}");
                
                $sampleTitles = [
                    "Cập nhật tình hình mới nhất về %s hôm nay",
                    "Những xu hướng quan trọng trong lĩnh vực %s",
                    "Phân tích chuyên sâu: Tương lai của %s có gì thay đổi?",
                    "Top 10 điều bạn cần biết về %s ngay bây giờ",
                    "Phỏng vấn chuyên gia: %s và những thách thức phía trước",
                    "Lịch sử phát triển và những cột mốc của %s",
                    "Tại sao %s lại trở thành tâm điểm của dư luận?",
                    "Bí quyết để thành công khi tìm hiểu về %s",
                    "Cảnh báo: Những sai lầm thường gặp liên quan đến %s",
                    "Khám phá thế giới %s qua góc nhìn mới"
                ];

                for ($i = 0; $i < $needed; $i++) {
                    $uniqueId = Str::random(5);
                    $titlePattern = $sampleTitles[$i % count($sampleTitles)];
                    $title = sprintf($titlePattern, $category->name) . " ($uniqueId)";
                    
                    $post = Post::create([
                        'author_id' => $admin->id,
                        'title' => $title,
                        'slug' => Str::slug($title) . '-' . time() . rand(1, 1000),
                        'summary' => "Đây là bản tóm tắt nội dung về chuyên mục {$category->name}. Bài viết cung cấp cái nhìn tổng quan và những cập nhật mới nhất dành cho độc giả quan tâm đến lĩnh vực này.",
                        'content' => "
                            <p>Chào mừng quý độc giả đến với bài viết về <strong>{$category->name}</strong> trên hệ thống News Portal.</p>
                            <p>Trong bài viết này, chúng tôi sẽ đi sâu vào phân tích các khía cạnh quan trọng nhất của {$category->name}. Hệ thống báo chí của chúng tôi luôn nỗ lực mang đến những thông tin chính xác, khách quan và có chiều sâu nhất.</p>
                            <h3>Những nội dung nổi bật:</h3>
                            <ul>
                                <li>Phát triển bền vững trong lĩnh vực {$category->name} năm 2026.</li>
                                <li>Tác động của công nghệ AI và tự động hóa đến {$category->name}.</li>
                                <li>Tầm nhìn chiến lược và các giải pháp thực tiễn.</li>
                            </ul>
                            <p>Hy vọng nội dung mock data này sẽ giúp bạn kiểm tra giao diện (UI/UX) của chuyên mục {$category->name} một cách đầy đủ nhất. Mọi bài viết đều được tối ưu hóa cho hiển thị trên cả máy tính và điện thoại di động.</p>
                            <p>Cảm ơn bạn đã tin tưởng và theo dõi tin tức trên hệ thống của chúng tôi.</p>
                        ",
                        'thumbnail' => "https://picsum.photos/seed/post-" . $category->id . "-" . $i . "-" . rand(1, 999) . "/1200/800",
                        'status' => 'published',
                        'published_at' => now()->subHours(rand(1, 72)), // Tạo thời gian đăng ngẫu nhiên trong 3 ngày qua
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
