<?php
/**
 * Script cập nhật dữ liệu bài viết:
 * 1. Xóa các bài "Bài viết mẫu số X" xấu
 * 2. Cập nhật thumbnail đẹp cho tất cả bài viết
 * 3. Đảm bảo tất cả bài có category đúng
 * 
 * Chạy: php update_posts_data.php (từ thư mục news-cms)
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Post;
use App\Models\Category;
use App\Models\User;
use Illuminate\Support\Str;

// ============================================================
// BƯỚC 1: Xóa bài viết mẫu xấu (Bài viết mẫu số X)
// ============================================================
echo "🗑️  Đang xóa bài viết mẫu cũ...\n";
$deleted = Post::where('title', 'like', 'Bài viết mẫu số%')->delete();
echo "   ✅ Đã xóa $deleted bài viết mẫu cũ.\n\n";

// ============================================================
// BƯỚC 2: Cập nhật thumbnail đẹp (Unsplash thay vì picsum)
// ============================================================
echo "🖼️  Đang cập nhật thumbnails đẹp...\n";

// Map category slug -> unsplash query keyword
$categoryImageMap = [
    'thoi-su'    => ['government','politics','city-hall','urban-planning','vietnam'],
    'kinh-doanh' => ['business','finance','office','stock-market','startup'],
    'cong-nghe'  => ['technology','computer','artificial-intelligence','coding','robot'],
    'the-thao'   => ['sports','soccer','football','tennis','athlete'],
    'giai-tri'   => ['cinema','entertainment','concert','music','movie'],
    'suc-khoe'   => ['health','fitness','yoga','food','medicine'],
    'giao-duc'   => ['education','university','library','students','learning'],
    'xe'         => ['car','automotive','supercar','electric-car','racing'],
    'doi-song'   => ['lifestyle','coffee','travel','home-decor','minimalism'],
    'phap-luat'  => ['law','justice','courthouse','lawyer','legal'],
];

// Unsplash source images - 1200x800 đẹp, không cần API key
$unsplashImages = [
    'thoi-su'    => [
        'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1200&h=800&fit=crop',
        'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&h=800&fit=crop',
        'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&h=800&fit=crop',
        'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&h=800&fit=crop',
        'https://images.unsplash.com/photo-1542044801-29c37d6a1419?w=1200&h=800&fit=crop',
    ],
    'kinh-doanh' => [
        'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&h=800&fit=crop',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=800&fit=crop',
        'https://images.unsplash.com/photo-1460472178825-e5240623afd5?w=1200&h=800&fit=crop',
        'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&h=800&fit=crop',
        'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=1200&h=800&fit=crop',
    ],
    'cong-nghe'  => [
        'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1200&h=800&fit=crop',
        'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=800&fit=crop',
        'https://images.unsplash.com/photo-1639762681057-408e52192e55?w=1200&h=800&fit=crop',
        'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&h=800&fit=crop',
        'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&h=800&fit=crop',
    ],
    'the-thao'   => [
        'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1200&h=800&fit=crop',
        'https://images.unsplash.com/photo-1540747913346-19212a4b32ce?w=1200&h=800&fit=crop',
        'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&h=800&fit=crop',
        'https://images.unsplash.com/photo-1542144582-1ba00456b5e3?w=1200&h=800&fit=crop',
        'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1200&h=800&fit=crop',
    ],
    'giai-tri'   => [
        'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&h=800&fit=crop',
        'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=800&fit=crop',
        'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=1200&h=800&fit=crop',
        'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&h=800&fit=crop',
        'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200&h=800&fit=crop',
    ],
    'suc-khoe'   => [
        'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=1200&h=800&fit=crop',
        'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200&h=800&fit=crop',
        'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&h=800&fit=crop',
        'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&h=800&fit=crop',
        'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1200&h=800&fit=crop',
    ],
    'giao-duc'   => [
        'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&h=800&fit=crop',
        'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1200&h=800&fit=crop',
        'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200&h=800&fit=crop',
        'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&h=800&fit=crop',
        'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&h=800&fit=crop',
    ],
    'xe'         => [
        'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1200&h=800&fit=crop',
        'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1200&h=800&fit=crop',
        'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200&h=800&fit=crop',
        'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=1200&h=800&fit=crop',
        'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=1200&h=800&fit=crop',
    ],
    'doi-song'   => [
        'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1200&h=800&fit=crop',
        'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&h=800&fit=crop',
        'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200&h=800&fit=crop',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=800&fit=crop',
        'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&h=800&fit=crop',
    ],
    'phap-luat'  => [
        'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&h=800&fit=crop',
        'https://images.unsplash.com/photo-1453945619913-79ec89a82c51?w=1200&h=800&fit=crop',
        'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1200&h=800&fit=crop',
        'https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=1200&h=800&fit=crop',
        'https://images.unsplash.com/photo-1575505586569-646b2ca898fc?w=1200&h=800&fit=crop',
    ],
];

// Cập nhật thumbnail theo category
$updated = 0;
foreach ($unsplashImages as $categorySlug => $images) {
    $category = Category::where('slug', $categorySlug)->first();
    if (!$category) continue;

    $posts = $category->posts()->published()->get();
    foreach ($posts as $index => $post) {
        $imageUrl = $images[$index % count($images)];
        // Thêm unique seed để tránh trùng ảnh
        $post->thumbnail = $imageUrl . '&q=80&auto=format';
        $post->save();
        $updated++;
    }
}
echo "   ✅ Đã cập nhật thumbnail cho $updated bài viết.\n\n";

// ============================================================
// BƯỚC 3: Tạo thêm bài viết mới phong phú (nếu dưới 60 bài published)
// ============================================================
$publishedCount = Post::where('status', 'published')->count();
echo "📊 Hiện có $publishedCount bài viết published.\n";

if ($publishedCount < 60) {
    echo "📝 Đang tạo thêm bài viết mới phong phú...\n";
    
    $admin = User::where('role', 'admin')->first();
    
    $newPosts = [
        'thoi-su' => [
            [
                'title' => 'Quốc hội thông qua dự án luật kinh tế số: Bước ngoặt lớn cho Việt Nam',
                'summary' => 'Sau nhiều phiên thảo luận sôi nổi, Quốc hội đã chính thức thông qua Luật Kinh tế số với tỷ lệ 94% đại biểu tán thành.',
                'img_index' => 0,
            ],
            [
                'title' => 'APEC 2026: Việt Nam đăng cai tổ chức hội nghị thượng đỉnh kinh tế',
                'summary' => 'Việt Nam được chọn là nước chủ nhà tổ chức APEC 2026, mở ra cơ hội lớn để quảng bá hình ảnh và thu hút đầu tư.',
                'img_index' => 1,
            ],
        ],
        'kinh-doanh' => [
            [
                'title' => 'Vingroup ra mắt dòng xe điện VinFast VF9 mới: Cạnh tranh trực tiếp với Tesla',
                'summary' => 'VinFast chính thức ra mắt mẫu xe điện flagship VF9 với tầm hoạt động 520km và loạt công nghệ tiên tiến bậc nhất.',
                'img_index' => 0,
            ],
            [
                'title' => 'GDP Việt Nam quý 1/2026 tăng trưởng 7.2%: Vượt kỳ vọng các chuyên gia',
                'summary' => 'Số liệu từ Tổng cục Thống kê cho thấy kinh tế Việt Nam tiếp tục đà tăng trưởng mạnh mẽ nhờ xuất khẩu và FDI.',
                'img_index' => 1,
            ],
        ],
        'cong-nghe' => [
            [
                'title' => 'ChatGPT 5 chính thức ra mắt: Vượt qua ngưỡng trí tuệ con người?',
                'summary' => 'OpenAI công bố ChatGPT-5 với khả năng lập luận phức tạp và tạo code chuyên nghiệp, đặt ra câu hỏi về tương lai AI.',
                'img_index' => 0,
            ],
            [
                'title' => 'Việt Nam sắp phủ sóng 5G toàn quốc: Hành trình chuyển đổi số',
                'summary' => 'Bộ TT&TT công bố lộ trình phủ sóng 5G trên toàn 63 tỉnh thành trước năm 2027, thúc đẩy nền kinh tế số.',
                'img_index' => 2,
            ],
        ],
        'the-thao' => [
            [
                'title' => 'SEA Games 35: Đoàn Thể thao Việt Nam giành 80 HCV, xếp thứ 2 khu vực',
                'summary' => 'Đoàn TTVN xuất sắc về nhì tại SEA Games 35 với 80 HCV, 65 HCB, 52 HCĐ, vượt chỉ tiêu đề ra.',
                'img_index' => 0,
            ],
            [
                'title' => 'Premier League: Man City áp sát ngôi đầu sau trận đại thắng 5-0',
                'summary' => 'Erling Haaland lập hat-trick đưa Man City đến chiến thắng thuyết phục, thu hẹp khoảng cách xuống còn 2 điểm.',
                'img_index' => 3,
            ],
        ],
        'giai-tri' => [
            [
                'title' => 'Sơn Tùng M-TP phá kỷ lục Việt Nam với 100 triệu streams MV mới',
                'summary' => 'Ca khúc mới nhất của Sơn Tùng M-TP đạt 100 triệu lượt nghe trên Spotify chỉ sau 10 ngày phát hành.',
                'img_index' => 0,
            ],
            [
                'title' => 'Phim về cuộc đời Hồ Chí Minh được chọn đại diện Việt Nam thi Oscar',
                'summary' => 'Tác phẩm điện ảnh công phu về vị lãnh tụ kính yêu được Hội đồng chọn phim Việt Nam chọn gửi tranh giải Oscar.',
                'img_index' => 4,
            ],
        ],
        'suc-khoe' => [
            [
                'title' => 'Bộ Y tế phê duyệt thuốc ung thư mới: Tăng cơ hội sống cho bệnh nhân',
                'summary' => 'Việt Nam chính thức phê duyệt 3 loại thuốc điều trị ung thư thế hệ mới, mở ra hy vọng cho hàng nghìn bệnh nhân.',
                'img_index' => 4,
            ],
            [
                'title' => '5 thói quen buổi sáng của người sống thọ 100 tuổi từ Nhật Bản',
                'summary' => 'Nghiên cứu kéo dài 20 năm tại Nhật Bản tiết lộ những bí quyết đơn giản giúp người dân xứ hoa anh đào sống lâu.',
                'img_index' => 1,
            ],
        ],
        'giao-duc' => [
            [
                'title' => 'Bộ GD&ĐT công bố phương án thi tốt nghiệp THPT 2026: Nhiều thay đổi lớn',
                'summary' => 'Phương án thi tốt nghiệp THPT 2026 với môn tích hợp và đánh giá năng lực toàn diện nhận được sự đồng thuận cao.',
                'img_index' => 0,
            ],
            [
                'title' => 'Học bổng toàn phần Fulbright 2026: Cơ hội cho 50 sinh viên Việt Nam',
                'summary' => 'Chương trình học bổng Fulbright 2026 tài trợ toàn bộ chi phí học tập tại Mỹ cho 50 suất học bổng đặc biệt.',
                'img_index' => 2,
            ],
        ],
        'xe' => [
            [
                'title' => 'Toyota Camry 2026 ra mắt: Thiết kế hầm hố, động cơ hybrid tiết kiệm nhiên liệu',
                'summary' => 'Toyota Camry thế hệ mới tại Việt Nam với ngoại hình thể thao và hệ thống hybrid đạt mức tiêu thụ 4.5L/100km.',
                'img_index' => 1,
            ],
            [
                'title' => 'F1 Vietnam Grand Prix 2026: Hà Nội sắp đón mùa giải đầu tiên trở lại',
                'summary' => 'Formula 1 chính thức xác nhận Hà Nội sẽ tổ chức chặng đua F1 Grand Prix Việt Nam vào tháng 10/2026.',
                'img_index' => 4,
            ],
        ],
        'doi-song' => [
            [
                'title' => 'Xu hướng "slow living" và bài học từ người trẻ bỏ phố về quê',
                'summary' => 'Ngày càng nhiều người trẻ Việt Nam lựa chọn rời xa thành phố náo nhiệt để tìm về cuộc sống chậm rãi, ý nghĩa.',
                'img_index' => 0,
            ],
            [
                'title' => 'Top 10 quán cà phê view đẹp nhất Hà Nội không thể bỏ lỡ',
                'summary' => 'Hà Nội sở hữu nhiều quán cà phê độc đáo với góc check-in tuyệt đẹp, là địa điểm lý tưởng cho mọi dịp.',
                'img_index' => 0,
            ],
        ],
        'phap-luat' => [
            [
                'title' => 'Nghị định mới về xử phạt vi phạm giao thông: Mức phạt tăng gấp đôi',
                'summary' => 'Chính phủ ban hành nghị định tăng mức xử phạt vi phạm giao thông, trong đó vi phạm tốc độ có thể bị phạt đến 8 triệu đồng.',
                'img_index' => 0,
            ],
            [
                'title' => 'Luật bảo vệ dữ liệu cá nhân có hiệu lực: Doanh nghiệp cần làm gì?',
                'summary' => 'Từ 1/7/2026, Luật Bảo vệ Dữ liệu Cá nhân chính thức có hiệu lực, đặt ra nhiều nghĩa vụ mới cho doanh nghiệp và tổ chức.',
                'img_index' => 3,
            ],
        ],
    ];

    $createdCount = 0;
    foreach ($newPosts as $categorySlug => $posts) {
        $category = Category::where('slug', $categorySlug)->first();
        $images = $unsplashImages[$categorySlug] ?? [];
        
        if (!$category) continue;
        
        foreach ($posts as $postData) {
            $title = $postData['title'];
            $slug = Str::slug($title);
            
            if (Post::where('slug', $slug)->exists()) {
                $slug .= '-' . Str::random(4);
            }
            
            $imgIndex = $postData['img_index'] % max(1, count($images));
            $thumbnail = !empty($images) 
                ? $images[$imgIndex] . '&q=80&auto=format'
                : "https://picsum.photos/seed/{$slug}/1200/800";
            
            $post = Post::create([
                'author_id'    => $admin->id,
                'tenant_id'    => $admin->tenant_id,
                'title'        => $title,
                'slug'         => $slug,
                'summary'      => $postData['summary'],
                'content'      => "
                    <p>{$postData['summary']}</p>
                    <p>Đây là nội dung chi tiết được cập nhật bởi hệ thống News Portal. Thông tin được tổng hợp từ nhiều nguồn đáng tin cậy.</p>
                    <h3>Phân tích chuyên sâu</h3>
                    <p>Chuyên gia nhận định rằng đây là một trong những sự kiện quan trọng nhất trong lĩnh vực " . $category->name . " trong năm 2026. Tác động của nó sẽ được cảm nhận rõ rệt trong thời gian tới.</p>
                    <h3>Dự báo xu hướng</h3>
                    <ul>
                        <li>Tác động ngắn hạn đến thị trường và người dùng sẽ rõ ràng trong Q2/2026</li>
                        <li>Các chính sách phối hợp dự kiến được ban hành trong năm nay</li>
                        <li>Cộng đồng và các bên liên quan đang có phản ứng tích cực</li>
                    </ul>
                    <p>Mời quý độc giả tiếp tục theo dõi để cập nhật những thông tin mới nhất từ News Portal.</p>
                ",
                'thumbnail'    => $thumbnail,
                'status'       => 'published',
                'published_at' => now()->subHours(rand(1, 72)),
                'views'        => rand(2000, 80000),
                'is_breaking'  => rand(0, 10) > 8, // 20% cơ hội là breaking news
            ]);
            
            $post->categories()->attach($category->id);
            $createdCount++;
        }
    }
    
    echo "   ✅ Đã tạo thêm $createdCount bài viết mới.\n\n";
}

// ============================================================
// BƯỚC 4: Đánh dấu bài nổi bật (is_featured)
// ============================================================
echo "⭐ Đang đánh dấu bài viết nổi bật...\n";

// Đặt top 5 bài views cao nhất làm featured
$topPosts = Post::where('status', 'published')
    ->orderByDesc('views')
    ->limit(6)
    ->get();

foreach ($topPosts as $post) {
    if (isset($post->is_featured)) {
        $post->is_featured = true;
        $post->save();
    }
}

// Đặt 3 bài làm breaking news
$breakingPosts = Post::where('status', 'published')
    ->whereIn('category_id', [])  // skip nếu không có direct category_id
    ->limit(3)
    ->get();

// Thử cách khác - lấy từ join
$thoiSu = Category::where('slug', 'thoi-su')->first();
if ($thoiSu) {
    $breakingCandidates = $thoiSu->posts()->published()->limit(3)->get();
    foreach ($breakingCandidates as $post) {
        $post->is_breaking = true;
        $post->save();
    }
    echo "   ✅ Đã đánh dấu {$breakingCandidates->count()} bài breaking news.\n\n";
}

// ============================================================
// BƯỚC 5: Thống kê cuối
// ============================================================
$totalPublished = Post::where('status', 'published')->count();
$totalBreaking  = Post::where('is_breaking', true)->count();
$categories = Category::withCount(['posts' => function($q) {
    $q->where('status', 'published');
}])->get();

echo "📊 === THỐNG KÊ ===\n";
echo "   Tổng bài published: $totalPublished\n";
echo "   Breaking news: $totalBreaking\n";
echo "\n   Phân bổ theo chuyên mục:\n";
foreach ($categories as $cat) {
    echo "   - {$cat->name}: {$cat->posts_count} bài\n";
}
echo "\n✅ Hoàn tất! Vui lòng kiểm tra lại trang public.\n";
