<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Page;
use Illuminate\Support\Str;

$pages = [
    [
        'title' => 'Về Chúng Tôi',
        'slug' => 've-chung-toi',
        'locale' => 'vi',
        'status' => 'published',
        'menu_visible' => true,
        'seo' => [
            'meta_title' => 'Về Chúng Tôi - News Portal',
            'meta_description' => 'Tìm hiểu về sứ mệnh và đội ngũ của News Portal.',
        ],
        'blocks' => [
            [
                'id' => Str::uuid()->toString(),
                'type' => 'hero',
                'data' => [
                    'title' => 'Sứ Mệnh Của Chúng Tôi',
                    'subtitle' => 'Đưa tin tức nhanh, chính xác và trung thực nhất',
                    'background_image' => 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&q=80&w=2000',
                    'overlay_color' => 'rgba(0,0,0,0.5)'
                ]
            ],
            [
                'id' => Str::uuid()->toString(),
                'type' => 'spacer',
                'data' => [
                    'height' => 40
                ]
            ],
            [
                'id' => Str::uuid()->toString(),
                'type' => 'text',
                'data' => [
                    'content' => '<h2>Lịch sử hình thành</h2><p>News Portal được thành lập vào năm 2026 với mong muốn mang lại trải nghiệm đọc tin tức hiện đại, tối ưu và chính xác nhất cho người dùng Việt Nam. Đội ngũ của chúng tôi bao gồm những nhà báo, biên tập viên dày dạn kinh nghiệm.</p>'
                ]
            ],
            [
                'id' => Str::uuid()->toString(),
                'type' => 'gallery',
                'data' => [
                    'images' => [
                        ['src' => 'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&q=80&w=600', 'alt' => 'Tòa soạn'],
                        ['src' => 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=600', 'alt' => 'Phóng viên tác nghiệp'],
                        ['src' => 'https://images.unsplash.com/photo-1586339949916-3e9ed675663e?auto=format&fit=crop&q=80&w=600', 'alt' => 'Họp báo'],
                    ],
                    'layout' => 'grid'
                ]
            ]
        ]
    ],
    [
        'title' => 'Liên Hệ',
        'slug' => 'lien-he',
        'locale' => 'vi',
        'status' => 'published',
        'menu_visible' => true,
        'seo' => [
            'meta_title' => 'Liên Hệ - News Portal',
            'meta_description' => 'Thông tin liên hệ tòa soạn News Portal',
        ],
        'blocks' => [
            [
                'id' => Str::uuid()->toString(),
                'type' => 'banner',
                'data' => [
                    'title' => 'Kết nối với News Portal',
                    'subtitle' => 'Chúng tôi luôn lắng nghe ý kiến từ độc giả'
                ]
            ],
            [
                'id' => Str::uuid()->toString(),
                'type' => 'text',
                'data' => [
                    'content' => '<h3>Trụ sở chính:</h3><p>Tòa nhà News Tower<br>Số 1 Lê Duẩn, Quận 1, TP. Hồ Chí Minh</p><h3>Hotline:</h3><p>1900 1234</p><h3>Email:</h3><p>contact@news-portal.vn</p>'
                ]
            ],
            [
                'id' => Str::uuid()->toString(),
                'type' => 'cta',
                'data' => [
                    'text' => 'Gửi email cho chúng tôi',
                    'url' => 'mailto:contact@news-portal.vn',
                    'type' => 'primary'
                ]
            ]
        ]
    ],
    [
        'title' => 'Tuyển Dụng',
        'slug' => 'tuyen-dung',
        'locale' => 'vi',
        'status' => 'draft',
        'menu_visible' => false,
        'seo' => [
            'meta_title' => 'Tuyển dụng - News Portal',
            'meta_description' => 'Cơ hội việc làm tại News Portal',
        ],
        'blocks' => [
            [
                'id' => Str::uuid()->toString(),
                'type' => 'hero',
                'data' => [
                    'title' => 'Gia nhập đội ngũ News Portal',
                    'subtitle' => 'Môi trường sáng tạo, năng động',
                    'background_image' => 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=2000'
                ]
            ],
            [
                'id' => Str::uuid()->toString(),
                'type' => 'text',
                'data' => [
                    'content' => '<h2>Các vị trí ứng tuyển:</h2><ul><li>Phóng viên kinh tế (SL: 02)</li><li>Kiểm duyệt nội dung (SL: 05)</li><li>Chuyên viên SEO (SL: 01)</li></ul><p>Vui lòng gửi CV về tuyendung@news-portal.vn</p>'
                ]
            ]
        ]
    ]
];

foreach ($pages as $pageData) {
    $slug = $pageData['slug'];
    $page = Page::withoutGlobalScopes()->where('slug', $slug)->first();
    
    // add tenant_id just in case
    $pageData['tenant_id'] = 1;

    if ($page) {
        $page->fill($pageData);
        $page->tenant_id = 1;
        $page->save();
        echo "Updated page: {$pageData['title']}\n";
    } else {
        $page = new Page($pageData);
        $page->tenant_id = 1;
        $page->save();
        echo "Created page: {$pageData['title']}\n";
    }
}

echo "Done mapping mock pages!\n";
