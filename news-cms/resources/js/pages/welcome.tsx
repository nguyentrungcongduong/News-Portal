import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import CategorySection from '@/components/category-section';

// Mock data - 10 categories with 10 articles each (1 main + 3 side visible)
const categories = [
  {
    id: 1,
    name: 'KINH DOANH',
    slug: 'kinh-doanh',
    mainArticle: {
      id: 101,
      title: "Vingroup công bố kết quả kinh doanh quý 4/2023, lợi nhuận tăng trưởng đột phá 45%",
      excerpt: "Tập đoàn Vingroup vừa công bố báo cáo tài chính quý 4/2023 với những con số ấn tượng, cho thấy sự phục hồi mạnh mẽ của thị trường bất động sản và bán lẻ.",
      imageUrl: "https://via.placeholder.com/800x450/ff6b6b/ffffff?text=Vingroup+Business",
      url: "/tin-tuc/vingroup-cong-bo-ket-qua-kinh-doanh",
      publishedAt: "2 giờ trước"
    },
    sideArticles: [
      { id: 102, title: "FPT Software ký hợp đồng tỷ đô với đối tác Nhật Bản", imageUrl: "https://via.placeholder.com/320x180/4ecdc4/ffffff?text=FPT", url: "/tin-tuc/fpt-software-ky-hop-dong", publishedAt: "3 giờ trước" },
      { id: 103, title: "Vietcombank giảm lãi suất cho vay doanh nghiệp xuống 6%/năm", imageUrl: "https://via.placeholder.com/320x180/45b7d1/ffffff?text=Bank", url: "/tin-tuc/vietcombank-giam-lai-suat", publishedAt: "5 giờ trước" },
      { id: 104, title: "VinFast chuẩn bị IPO tại Mỹ với định giá 50 tỷ USD", imageUrl: "https://via.placeholder.com/320x180/f39c12/ffffff?text=VinFast", url: "/tin-tuc/vinfast-ipo-my", publishedAt: "6 giờ trước" },
    ]
  },
  {
    id: 2,
    name: 'CÔNG NGHỆ',
    slug: 'cong-nghe',
    mainArticle: {
      id: 201,
      title: "OpenAI ra mắt GPT-5 với khả năng suy luận logic vượt trội",
      excerpt: "Phiên bản GPT-5 mới nhất được cho là có khả năng suy luận logic và xử lý hình ảnh tốt hơn gấp 10 lần so với phiên bản tiền nhiệm.",
      imageUrl: "https://via.placeholder.com/800x450/9b59b6/ffffff?text=GPT-5+AI",
      url: "/tin-tuc/openai-ra-mat-gpt-5",
      publishedAt: "1 giờ trước"
    },
    sideArticles: [
      { id: 202, title: "Apple Vision Pro 2 sẽ có giá rẻ hơn 50% so với thế hệ đầu", imageUrl: "https://via.placeholder.com/320x180/e74c3c/ffffff?text=Apple", url: "/tin-tuc/apple-vision-pro-2", publishedAt: "4 giờ trước" },
      { id: 203, title: "Google Gemini vượt qua ChatGPT trong benchmark mới nhất", imageUrl: "https://via.placeholder.com/320x180/3498db/ffffff?text=Gemini", url: "/tin-tuc/google-gemini-vuot-chatgpt", publishedAt: "7 giờ trước" },
      { id: 204, title: "Microsoft tích hợp Copilot sâu hơn vào Windows 12", imageUrl: "https://via.placeholder.com/320x180/2ecc71/ffffff?text=Windows", url: "/tin-tuc/microsoft-windows-12-ai", publishedAt: "8 giờ trước" },
    ]
  },
  {
    id: 3,
    name: 'THỂ THAO',
    slug: 'the-thao',
    mainArticle: {
      id: 301,
      title: "Đội tuyển Việt Nam thắng Thái Lan 3-0, giành vé World Cup 2026",
      excerpt: "Với chiến thắng thuyết phục trước đội tuyển Thái Lan, đội tuyển Việt Nam chính thức giành vé vào vòng loại cuối cùng của World Cup 2026.",
      imageUrl: "https://via.placeholder.com/800x450/e67e22/ffffff?text=Vietnam+Football",
      url: "/tin-tuc/vietnam-world-cup-2026",
      publishedAt: "30 phút trước"
    },
    sideArticles: [
      { id: 302, title: "Quang Hải lập hat-trick, được bình chọn cầu thủ xuất sắc", imageUrl: "https://via.placeholder.com/320x180/16a085/ffffff?text=Quang+Hai", url: "/tin-tuc/quang-hai-hat-trick", publishedAt: "2 giờ trước" },
      { id: 303, title: "V-League 2025 có 14 đội tham dự với format mới", imageUrl: "https://via.placeholder.com/320x180/c0392b/ffffff?text=V-League", url: "/tin-tuc/v-league-2025-format", publishedAt: "4 giờ trước" },
      { id: 304, title: "Công Phượng trở lại ĐTQG sau 2 năm vắng bóng", imageUrl: "https://via.placeholder.com/320x180/8e44ad/ffffff?text=Cong+Phuong", url: "/tin-tuc/cong-phuong-tro-lai", publishedAt: "5 giờ trước" },
    ]
  },
  {
    id: 4,
    name: 'GIẢI TRÍ',
    slug: 'giai-tri',
    mainArticle: {
      id: 401,
      title: "Phim Việt đạt doanh thu kỷ lục 500 tỷ đồng sau 10 ngày công chiếu",
      excerpt: "Bộ phim hành động Việt Nam mới nhất đã phá vỡ mọi kỷ lục doanh thu phòng vé, trở thành hiện tượng điện ảnh của năm 2024.",
      imageUrl: "https://via.placeholder.com/800x450/e84393/ffffff?text=Vietnamese+Movie",
      url: "/tin-tuc/phim-viet-ky-luc-doanh-thu",
      publishedAt: "1 giờ trước"
    },
    sideArticles: [
      { id: 402, title: "Sơn Tùng M-TP công bố album mới sau 3 năm im ắng", imageUrl: "https://via.placeholder.com/320x180/f39c12/ffffff?text=Son+Tung", url: "/tin-tuc/son-tung-album-moi", publishedAt: "3 giờ trước" },
      { id: 403, title: "Blackpink tái hợp, công bố tour diễn toàn cầu 2025", imageUrl: "https://via.placeholder.com/320x180/9b59b6/ffffff?text=Blackpink", url: "/tin-tuc/blackpink-tai-hop", publishedAt: "5 giờ trước" },
      { id: 404, title: "Hoài Linh trở lại sân khấu sau thờigian dài vắng bóng", imageUrl: "https://via.placeholder.com/320x180/27ae60/ffffff?text=Hoai+Linh", url: "/tin-tuc/hoai-linh-tro-lai", publishedAt: "6 giờ trước" },
    ]
  },
  {
    id: 5,
    name: 'THẾ GIỚI',
    slug: 'the-gioi',
    mainArticle: {
      id: 501,
      title: "Tổng thống Mỹ công bố chính sách thương mại mới với châu Á",
      excerpt: "Chính quyền Washington vừa công bố bộ chính sách thương mại toàn diện nhằm tăng cường quan hệ kinh tế với các đối tác châu Á.",
      imageUrl: "https://via.placeholder.com/800x450/34495e/ffffff?text=World+News",
      url: "/tin-tuc/tong-thong-my-chinh-sach-thuong-mai",
      publishedAt: "2 giờ trước"
    },
    sideArticles: [
      { id: 502, title: "Nga-Ukraine đạt thỏa thuận ngừng bắn tạm thờ", imageUrl: "https://via.placeholder.com/320x180/c0392b/ffffff?text=Russia-Ukraine", url: "/tin-tuc/ngung-ban-nga-ukraine", publishedAt: "4 giờ trước" },
      { id: 503, title: "Trung Quốc phóng thành công trạm vũ trụ mới", imageUrl: "https://via.placeholder.com/320x180/e74c3c/ffffff?text=China+Space", url: "/tin-tuc/trung-quoc-vu-tru", publishedAt: "6 giờ trước" },
      { id: 504, title: "EU thông qua gói cứu trợ khí hậu 500 tỷ euro", imageUrl: "https://via.placeholder.com/320x180/3498db/ffffff?text=EU", url: "/tin-tuc/eu-khi-hau", publishedAt: "8 giờ trước" },
    ]
  },
  {
    id: 6,
    name: 'SỨC KHỎE',
    slug: 'suc-khoe',
    mainArticle: {
      id: 601,
      title: "Bộ Y tế khuyến cáo phòng chống dịch cúm mùa đang bùng phát",
      excerpt: "Số ca mắc cúm mùa tại Việt Nam đang tăng cao, đặc biệt ở các thành phố lớn. Bộ Y tế đưa ra khuyến cáo phòng bệnh cho ngưởi dân.",
      imageUrl: "https://via.placeholder.com/800x450/e74c3c/ffffff?text=Health+News",
      url: "/tin-tuc/bo-y-te-khuyen-cao-cum-mua",
      publishedAt: "30 phút trước"
    },
    sideArticles: [
      { id: 602, title: "10 loại thực phẩm giúp tăng cường miễn dịch mùa đông", imageUrl: "https://via.placeholder.com/320x180/27ae60/ffffff?text=Healthy+Food", url: "/tin-tuc/tang-cuong-mien-dich", publishedAt: "2 giờ trước" },
      { id: 603, title: "Nghiên cứu mới về liệu pháp điều trị ung thư", imageUrl: "https://via.placeholder.com/320x180/9b59b6/ffffff?text=Cancer+Research", url: "/tin-tuc/lieu-phap-ung-thu", publishedAt: "4 giờ trước" },
      { id: 604, title: "WHO cảnh báo về biến chủng virus mới", imageUrl: "https://via.placeholder.com/320x180/f39c12/ffffff?text=WHO", url: "/tin-tuc/who-virus-moi", publishedAt: "6 giờ trước" },
    ]
  },
  {
    id: 7,
    name: 'GIÁO DỤC',
    slug: 'giao-duc',
    mainArticle: {
      id: 701,
      title: "Đại học Quốc gia Hà Nội công bố điểm chuẩn năm 2024",
      excerpt: "ĐHQGHN công bố điểm chuẩn các ngành đào tạo năm 2024 với mức tăng trung bình 2-3 điểm so với năm ngoái.",
      imageUrl: "https://via.placeholder.com/800x450/3498db/ffffff?text=Education",
      url: "/tin-tuc/dhqg-ha-noi-diem-chuan",
      publishedAt: "1 giờ trước"
    },
    sideArticles: [
      { id: 702, title: "Bộ GD&ĐT đề xuất đổi mới chương trình THPT", imageUrl: "https://via.placeholder.com/320x180/16a085/ffffff?text=Education+Reform", url: "/tin-tuc/doi-moi-chuong-trinh-thpt", publishedAt: "3 giờ trước" },
      { id: 703, title: "Sinh viên Việt đạt giải Olympic Toán quốc tế", imageUrl: "https://via.placeholder.com/320x180/e67e22/ffffff?text=Olympiad", url: "/tin-tuc/sinh-vien-olympic-toan", publishedAt: "5 giờ trước" },
      { id: 704, title: "Học bổng du học toàn phần từ các trường Ivy League", imageUrl: "https://via.placeholder.com/320x180/8e44ad/ffffff?text=Scholarship", url: "/tin-tuc/hoc-bong-ivy-league", publishedAt: "7 giờ trước" },
    ]
  },
  {
    id: 8,
    name: 'DU LỊCH',
    slug: 'du-lich',
    mainArticle: {
      id: 801,
      title: "Việt Nam đón 15 triệu lượt khách quốc tế trong năm 2024",
      excerpt: "Ngành du lịch Việt Nam đạt kỷ lục mới với 15 triệu lượt khách quốc tế, vượt mục tiêu đề ra đầu năm.",
      imageUrl: "https://via.placeholder.com/800x450/1abc9c/ffffff?text=Travel+Vietnam",
      url: "/tin-tuc/viet-nam-15-trieu-khach",
      publishedAt: "2 giờ trước"
    },
    sideArticles: [
      { id: 802, title: "5 điểm đến mới nổi tại miền Trung dịp Tết Nguyên đán", imageUrl: "https://via.placeholder.com/320x180/e74c3c/ffffff?text=Travel+Central", url: "/tin-tuc/diem-den-mien-trung", publishedAt: "4 giờ trước" },
      { id: 803, title: "Vietnam Airlines mở đường bay thẳng đến Mỹ", imageUrl: "https://via.placeholder.com/320x180/3498db/ffffff?text=VNA", url: "/tin-tuc/vna-duong-bay-my", publishedAt: "6 giờ trước" },
      { id: 804, title: "Cẩm nang du lịch Nhật Bản mùa hoa anh đào", imageUrl: "https://via.placeholder.com/320x180/f39c12/ffffff?text=Japan+Cherry", url: "/tin-tuc/du-lich-nhat-ban", publishedAt: "8 giờ trước" },
    ]
  },
  {
    id: 9,
    name: 'Ô TÔ - XE MÁY',
    slug: 'o-to-xe-may',
    mainArticle: {
      id: 901,
      title: "VinFast VF8 đạt chứng nhận an toàn 5 sao tại châu Âu",
      excerpt: "Mẫu xe điện VF8 của VinFast vừa nhận được chứng nhận an toàn 5 sao từ Euro NCAP, khẳng định chất lượng sản phẩm Việt.",
      imageUrl: "https://via.placeholder.com/800x450/2c3e50/ffffff?text=VinFast+VF8",
      url: "/tin-tuc/vinfast-vf8-5-sao",
      publishedAt: "1 giờ trước"
    },
    sideArticles: [
      { id: 902, title: "Honda ra mắt xe máy điện mới giá từ 25 triệu đồng", imageUrl: "https://via.placeholder.com/320x180/e74c3c/ffffff?text=Honda+E-bike", url: "/tin-tuc/honda-xe-may-dien", publishedAt: "3 giờ trước" },
      { id: 903, title: "Toyota Camry 2025 về Việt Nam với giá từ 1,2 tỷ", imageUrl: "https://via.placeholder.com/320x180/3498db/ffffff?text=Toyota+Camry", url: "/tin-tuc/toyota-camry-2025", publishedAt: "5 giờ trước" },
      { id: 904, title: "Xe điện chiếm 30% thị phần ô tô Việt Nam năm 2024", imageUrl: "https://via.placeholder.com/320x180/27ae60/ffffff?text=EV+Market", url: "/tin-tuc/xe-dien-thi-phan", publishedAt: "7 giờ trước" },
    ]
  },
  {
    id: 10,
    name: 'BẤT ĐỘNG SẢN',
    slug: 'bat-dong-san',
    mainArticle: {
      id: 1001,
      title: "Giá nhà đất TP.HCM tăng 15% trong quý 4/2024",
      excerpt: "Thị trường bất động sản TP.HCM có dấu hiệu hồi phục mạnh mẽ với mức tăng giá trung bình 15% so với cùng kỳ năm trước.",
      imageUrl: "https://via.placeholder.com/800x450/16a085/ffffff?text=Real+Estate",
      url: "/tin-tuc/gia-nha-dat-tphcm-tang",
      publishedAt: "30 phút trước"
    },
    sideArticles: [
      { id: 1002, title: "Novaland công bố dự án căn hộ cao cấp tại Thủ Thiêm", imageUrl: "https://via.placeholder.com/320x180/e67e22/ffffff?text=Novaland", url: "/tin-tuc/novaland-thu-thiem", publishedAt: "2 giờ trước" },
      { id: 1003, title: "Ngân hàng giảm lãi suất cho vay mua nhà xuống 7,5%/năm", imageUrl: "https://via.placeholder.com/320x180/3498db/ffffff?text=Home+Loan", url: "/tin-tuc/lai-suat-mua-nha", publishedAt: "4 giờ trước" },
      { id: 1004, title: "5 khu vực đất nền đang sốt tại Hà Nội", imageUrl: "https://via.placeholder.com/320x180/9b59b6/ffffff?text=Land+Plot", url: "/tin-tuc/dat-nen-ha-noi", publishedAt: "6 giờ trước" },
    ]
  },
];

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="News Portal - Trang tin tức mới nhất">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=inter:400,500,600,700&display=swap"
                    rel="stylesheet"
                />
            </Head>
            
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center">
                                <h1 className="text-2xl font-bold text-red-600">News Portal</h1>
                            </div>
                            
                            <nav className="hidden md:flex items-center gap-6">
                                <a href="#" className="text-gray-700 hover:text-red-600 font-medium transition-colors">Kinh doanh</a>
                                <a href="#" className="text-gray-700 hover:text-red-600 font-medium transition-colors">Công nghệ</a>
                                <a href="#" className="text-gray-700 hover:text-red-600 font-medium transition-colors">Thể thao</a>
                                <a href="#" className="text-gray-700 hover:text-red-600 font-medium transition-colors">Giải trí</a>
                                <a href="#" className="text-gray-700 hover:text-red-600 font-medium transition-colors">Thế giới</a>
                                
                                {auth.user ? (
                                    <Link
                                        href={dashboard()}
                                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={login()}
                                            className="text-gray-700 hover:text-red-600 font-medium transition-colors"
                                        >
                                            Đăng nhập
                                        </Link>
                                        {canRegister && (
                                            <Link
                                                href={register()}
                                                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                                            >
                                                Đăng ký
                                            </Link>
                                        )}
                                    </>
                                )}
                            </nav>
                        </div>
                    </div>
                </header>

                {/* Breaking News Banner */}
                <div className="bg-red-600 text-white py-2">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-2">
                            <span className="bg-white text-red-600 px-2 py-1 text-xs font-bold rounded">BREAKING</span>
                            <span className="text-sm font-medium truncate">Đội tuyển Việt Nam thắng Thái Lan 3-0, chính thức giành vé dự World Cup 2026</span>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Render all 10 categories */}
                    {categories.map((category) => (
                        <CategorySection
                            key={category.id}
                            title={category.name}
                            viewAllUrl={`/${category.slug}`}
                            mainArticle={category.mainArticle}
                            sideArticles={category.sideArticles}
                        />
                    ))}
                </main>

                {/* Footer */}
                <footer className="bg-gray-900 text-white py-8 mt-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            <div>
                                <h3 className="text-lg font-bold mb-4">News Portal</h3>
                                <p className="text-gray-400 text-sm">Cập nhật tin tức mới nhất 24/7 từ các lĩnh vực kinh tế, công nghệ, thể thao, giải trí và thế giới.</p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-3">Chuyên mục</h4>
                                <ul className="space-y-2 text-sm text-gray-400">
                                    {categories.slice(0, 5).map(cat => (
                                        <li key={cat.id}><a href="#" className="hover:text-white">{cat.name}</a></li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-3">Khác</h4>
                                <ul className="space-y-2 text-sm text-gray-400">
                                    {categories.slice(5).map(cat => (
                                        <li key={cat.id}><a href="#" className="hover:text-white">{cat.name}</a></li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-3">Liên hệ</h4>
                                <ul className="space-y-2 text-sm text-gray-400">
                                    <li>Email: contact@newsportal.com</li>
                                    <li>Hotline: 1900 1234</li>
                                </ul>
                                <div className="flex gap-3 mt-4">
                                    <a href="#" className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600">f</a>
                                    <a href="#" className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600">t</a>
                                    <a href="#" className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600">in</a>
                                </div>
                            </div>
                        </div>
                        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
                            <p>&copy; 2024 News Portal. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}