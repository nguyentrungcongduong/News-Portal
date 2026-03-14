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

        $categoryData = [
            'thoi-su' => [
                'titles' => [
                    "Kế hoạch phát triển hạ tầng giao thông đô thị tầm nhìn 2030",
                    "Chính sách mới về hỗ trợ doanh nghiệp khởi nghiệp trong năm 2026",
                    "Hợp tác quốc tế: Việt Nam khẳng định vị thế trên trường quốc tế",
                    "Các dự án trọng điểm quốc gia đang đẩy nhanh tiến độ về đích",
                    "Chương trình mục tiêu quốc gia về bảo vệ môi trường và biến đổi khí hậu"
                ],
                'image_keyword' => 'city,politics'
            ],
            'kinh-doanh' => [
                'titles' => [
                    "Thị trường chứng khoán: Những mã cổ phiếu tiềm năng cuối năm",
                    "Xu hướng đầu tư bất động sản bền vững tại các đô thị vệ tinh",
                    "Thương mại điện tử bùng nổ: Cơ hội và thách thức cho DN vừa và nhỏ",
                    "Lãi suất ngân hàng có xu hướng giảm: Tin vui cho người vay vốn",
                    "Khởi nghiệp công nghệ: Thu hút dòng vốn ngoại đổ vào thị trường Việt"
                ],
                'image_keyword' => 'business,office'
            ],
            'cong-nghe' => [
                'titles' => [
                    "Trí tuệ nhân tạo (AI) đang thay đổi cách chúng ta làm việc như thế nào?",
                    "Ra mắt smartphone màn hình gập thế hệ mới với công nghệ đột phá",
                    "Blockchain và ứng dụng thực tiễn trong quản lý chuỗi cung ứng",
                    "An ninh mạng: Bảo vệ dữ liệu cá nhân trong kỷ nguyên số",
                    "Công nghệ 6G: Những bước tiến đầu tiên trong việc kết nối vạn vật"
                ],
                'image_keyword' => 'technology,coding'
            ],
            'the-thao' => [
                'titles' => [
                    "Vòng loại World Cup: Tuyển Việt Nam sẵn sàng cho trận quyết đấu",
                    "Giải ngoại hạng Anh: Những cú lội ngược dòng ngoạn mục cuối tuần",
                    "Tennis: Cuộc đua giành ngôi số 1 thế giới giữa các tay vợt trẻ",
                    "Thể thao điện tử (Esports) chính thức được công nhận là môn thi đấu",
                    "Bí quyết rèn luyện thể lực của các vận động viên đỉnh cao"
                ],
                'image_keyword' => 'sports,soccer'
            ],
            'giai-tri' => [
                'titles' => [
                    "Phim rạp cuối tuần: Bom tấn hành động thống trị doanh thu phòng vé",
                    "Nghệ sĩ Việt tỏa sáng tại các liên hoan phim quốc tế",
                    "Thị trường âm nhạc trực tuyến: EDM và Rap tiếp tục lên ngôi",
                    "Thời trang 2026: Phong cách tối giản và vật liệu tái chế dẫn đầu",
                    "Hậu trường những gameshow truyền hình ăn khách nhất hiện nay"
                ],
                'image_keyword' => 'celebrity,movie'
            ],
            'suc-khoe' => [
                'titles' => [
                    "Chế độ ăn Keto: Lợi ích và những lưu ý từ chuyên gia dinh dưỡng",
                    "Cách cải thiện giấc ngủ tự nhiên không cần dùng thuốc",
                    "Tập luyện Yoga tại nhà: 5 tư thế giúp giảm đau vai gáy hiệu quả",
                    "Thực phẩm chức năng: Hiểu đúng để sử dụng an toàn cho sức khỏe",
                    "Tầm soát ung thư định kỳ: Chìa khóa vàng để bảo vệ cuộc sống"
                ],
                'image_keyword' => 'health,fitness'
            ],
            'giao-duc' => [
                'titles' => [
                    "Đổi mới phương pháp dạy học: Lấy học sinh làm trung tâm",
                    "Du học tại chỗ: Lựa chọn thông minh trong thời đại kinh tế số",
                    "Học ngoại ngữ qua AI: Hiệu quả bất ngờ và những hạn chế",
                    "Phát triển kỹ năng mềm: Hành trang quan trọng cho sinh viên mới ra trường",
                    "Các trường đại học top đầu công bố phương thức tuyển sinh 2026"
                ],
                'image_keyword' => 'education,university'
            ],
            'xe' => [
                'titles' => [
                    "Đánh giá xe điện mới nhất: Quãng đường di chuyển ấn tượng",
                    "Thị trường ô tô cũ sôi động: Cách kiếm tra xe để tránh mua nhầm",
                    "Siêu xe thể thao ra mắt: Tốc độ tối đa phá vỡ mọi kỷ lục",
                    "Công nghệ tự lái: Mức độ an toàn đạt tiêu chuẩn 5 sao",
                    "Lưu ý bảo dưỡng xe định kỳ để đảm bảo vận hành êm ái"
                ],
                'image_keyword' => 'car,automotive'
            ],
            'doi-song' => [
                'titles' => [
                    "Phong cách sống Minimalism: Sống ít đi để hạnh phúc nhiều hơn",
                    "Trang trí nhà cửa đón Tết: Những xu hướng màu sắc nổi bật",
                    "Du lịch trải nghiệm: Khám phá những vùng đất hoang sơ tại VN",
                    "Văn hóa cà phê vỉa hè: Nét độc đáo trong đời sống người Việt",
                    "Kinh nghiệm quản lý tài chính cá nhân cho người trẻ"
                ],
                'image_keyword' => 'lifestyle,travel'
            ],
            'phap-luat' => [
                'titles' => [
                    "Luật Đất đai sửa đổi: Những điểm mới người dân cần lưu ý",
                    "Tăng cường xử phạt vi phạm nồng độ cồn khi tham gia giao thông",
                    "Bảo vệ quyền lợi người tiêu dùng trong mua sắm trực tuyến",
                    "Quy định mới về bảo hiểm xã hội và chế độ thai sản 2026",
                    "Cảnh báo các thủ đoạn lừa đảo chiếm đoạt tài sản qua mạng"
                ],
                'image_keyword' => 'law,justice'
            ],
        ];

        foreach ($categories as $category) {
            $data = $categoryData[$category->slug] ?? [
                'titles' => ["Tổng hợp tin tức về $category->name hôm nay"],
                'image_keyword' => 'news'
            ];

            $this->command->info("Đang tạo bài viết cho chuyên mục: {$category->name}");

            foreach ($data['titles'] as $index => $title) {
                $slug = Str::slug($title);
                
                if (Post::where('slug', $slug)->exists()) {
                    $slug .= '-' . Str::random(5);
                }

                $post = Post::create([
                    'author_id' => $admin->id,
                    'title' => $title,
                    'slug' => $slug,
                    'summary' => "Bài viết cung cấp thông tin chuyên sâu và phân tích mới nhất về chủ đề $title. Độc giả sẽ tìm thấy những góc nhìn đa chiều và hữu ích dành cho chuyên mục {$category->name}.",
                    'content' => "
                        <p>Hệ thống News Portal xin gửi tới quý độc giả nội dung chi tiết về: <strong>$title</strong>.</p>
                        <p>Trong bối cảnh hiện nay, việc cập nhật thông tin chính xác về {$category->name} đóng vai trò cực kỳ quan trọng. Chúng tôi đã tổng hợp từ nhiều nguồn uy tín để mang đến cái nhìn toàn cảnh nhất.</p>
                        <h3>Những tiêu điểm chính:</h3>
                        <ul>
                            <li>Phân tích cốt lõi về sự kiện và các nhân tố ảnh hưởng.</li>
                            <li>Tác động trực tiếp đến đời sống và kinh tế xã hội.</li>
                            <li>Dự báo xu hướng phát triển trong giai đoạn tiếp theo của năm 2026.</li>
                        </ul>
                        <p>Mời bạn tiếp tục theo dõi các bài viết tiếp theo để nắm bắt những diễn biến mới nhất. News Portal cam kết mang đến giá trị tri thức và sự tin cậy tuyệt đối cho mọi độc giả.</p>
                    ",
                    'thumbnail' => "https://picsum.photos/seed/news-{$category->slug}-{$index}/1200/800",
                    'status' => 'published',
                    'published_at' => now()->subHours(rand(1, 100)),
                    'views' => rand(1000, 50000),
                    'is_featured' => ($index === 0), // Bài đầu tiên mỗi mục làm featured
                ]);

                $post->categories()->attach($category->id);
            }
        }

        $this->command->info('Hoàn tất quá trình mock data chuẩn SEO.');
    }
}
