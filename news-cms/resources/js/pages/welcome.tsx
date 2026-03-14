import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import CategorySection from '@/components/category-section';

// Dữ liệu mẫu - sẽ thay thế bằng API thật
const sampleData = {
  kinhDoanh: {
    mainArticle: {
      id: 1,
      title: "Vingroup công bố kết quả kinh doanh quý 4/2023, lợi nhuận tăng trưởng đột phá",
      excerpt: "Tập đoàn Vingroup vừa công bố báo cáo tài chính quý 4/2023 với những con số ấn tượng, cho thấy sự phục hồi mạnh mẽ của thị trường bất động sản và bán lẻ.",
      imageUrl: "https://via.placeholder.com/800x450/ff6b6b/ffffff?text=Vingroup+Q4+2023",
      url: "/tin-tuc/vingroup-cong-bo-ket-qua-kinh-doanh-quy-4-2023",
      publishedAt: "2 giờ trước"
    },
    sideArticles: [
      {
        id: 2,
        title: "FPT Software ký hợp đồng lớn với đối tác Nhật Bản",
        imageUrl: "https://via.placeholder.com/320x180/4ecdc4/ffffff?text=FPT+Software",
        url: "/tin-tuc/fpt-software-ky-hop-dong-lon-nhat-ban",
        publishedAt: "3 giờ trước"
      },
      {
        id: 3,
        title: "Vietcombank giảm lãi suất cho vay doanh nghiệp",
        imageUrl: "https://via.placeholder.com/320x180/45b7d1/ffffff?text=Vietcombank",
        url: "/tin-tuc/vietcombank-giam-lai-suat",
        publishedAt: "5 giờ trước"
      },
      {
        id: 4,
        title: "VinFast ra mắt mẫu xe điện mới tại thị trường châu Âu",
        imageUrl: "https://via.placeholder.com/320x180/f39c12/ffffff?text=VinFast",
        url: "/tin-tuc/vinfast-ra-mat-xe-dien-moi",
        publishedAt: "6 giờ trước"
      }
    ]
  },
  congNghe: {
    mainArticle: {
      id: 5,
      title: "OpenAI ra mắt GPT-5 với khả năng vượt trội, gây chấn động giới công nghệ",
      excerpt: "Phiên bản GPT-5 mới nhất được cho là có khả năng suy luận logic và xử lý hình ảnh tốt hơn gấp 10 lần so với phiên bản tiền nhiệm.",
      imageUrl: "https://via.placeholder.com/800x450/9b59b6/ffffff?text=OpenAI+GPT-5",
      url: "/tin-tuc/openai-ra-mat-gpt-5",
      publishedAt: "1 giờ trước"
    },
    sideArticles: [
      {
        id: 6,
        title: "Apple công bố Vision Pro 2 với giá rẻ hơn",
        imageUrl: "https://via.placeholder.com/320x180/e74c3c/ffffff?text=Apple+Vision+Pro",
        url: "/tin-tuc/apple-vision-pro-2",
        publishedAt: "4 giờ trước"
      },
      {
        id: 7,
        title: "Google Gemini vượt qua ChatGPT trong bài kiểm tra mới",
        imageUrl: "https://via.placeholder.com/320x180/3498db/ffffff?text=Google+Gemini",
        url: "/tin-tuc/google-gemini-vuot-chatgpt",
        publishedAt: "7 giờ trước"
      },
      {
        id: 8,
        title: "Microsoft tích hợp AI sâu hơn vào Windows 12",
        imageUrl: "https://via.placeholder.com/320x180/2ecc71/ffffff?text=Windows+12",
        url: "/tin-tuc/microsoft-windows-12-ai",
        publishedAt: "8 giờ trước"
      }
    ]
  },
  theThao: {
    mainArticle: {
      id: 9,
      title: "Đội tuyển Việt Nam tạo nên lịch sử, lọt vào vòng loại World Cup 2026",
      excerpt: "Với chiến thắng thuyết phục trước đội tuyển Thái Lan, đội tuyển Việt Nam chính thức giành vé vào vòng loại cuối cùng của World Cup 2026.",
      imageUrl: "https://via.placeholder.com/800x450/e67e22/ffffff?text=Vietnam+World+Cup",
      url: "/tin-tuc/vietnam-nam-vong-loai-world-cup",
      publishedAt: "30 phút trước"
    },
    sideArticles: [
      {
        id: 10,
        title: "Quang Hải ghi bàn thắng đẹp nhất trận đấu",
        imageUrl: "https://via.placeholder.com/320x180/16a085/ffffff?text=Quang+Hai",
        url: "/tin-tuc/quang-hai-ghi-ban",
        publishedAt: "2 giờ trước"
      },
      {
        id: 11,
        title: "HLV Park Hang-seo có phát biểu gây sốc sau trận",
        imageUrl: "https://via.placeholder.com/320x180/c0392b/ffffff?text=Park+Hang-seo",
        url: "/tin-tuc/park-hang-seo-phat-bieu",
        publishedAt: "4 giờ trước"
      },
      {
        id: 12,
        title: "V-League có sự thay đổi lớn về format thi đấu",
        imageUrl: "https://via.placeholder.com/320x180/8e44ad/ffffff?text=V-League",
        url: "/tin-tuc/v-league-thay-doi-format",
        publishedAt: "9 giờ trước"
      }
    ]
  }
};

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
                            
                            <nav className="flex items-center gap-6">
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
                            <span className="text-sm font-medium">Đội tuyển Việt Nam tạo nên lịch sử, lọt vào vòng loại World Cup 2026</span>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Kinh doanh Section */}
                    <CategorySection
                        title="KINH DOANH"
                        viewAllUrl="/kinh-doanh"
                        mainArticle={sampleData.kinhDoanh.mainArticle}
                        sideArticles={sampleData.kinhDoanh.sideArticles}
                    />

                    {/* Công nghệ Section */}
                    <CategorySection
                        title="CÔNG NGHỆ"
                        viewAllUrl="/cong-nghe"
                        mainArticle={sampleData.congNghe.mainArticle}
                        sideArticles={sampleData.congNghe.sideArticles}
                    />

                    {/* Thể thao Section */}
                    <CategorySection
                        title="THỂ THAO"
                        viewAllUrl="/the-thao"
                        mainArticle={sampleData.theThao.mainArticle}
                        sideArticles={sampleData.theThao.sideArticles}
                    />
                </main>

                {/* Footer */}
                <footer className="bg-gray-900 text-white py-8 mt-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            <div>
                                <h3 className="text-lg font-bold mb-4">News Portal</h3>
                                <p className="text-gray-400 text-sm">Cập nhật tin tức mới nhất 24/7</p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-3">Chuyên mục</h4>
                                <ul className="space-y-2 text-sm text-gray-400">
                                    <li><a href="#" className="hover:text-white">Kinh doanh</a></li>
                                    <li><a href="#" className="hover:text-white">Công nghệ</a></li>
                                    <li><a href="#" className="hover:text-white">Thể thao</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-3">Về chúng tôi</h4>
                                <ul className="space-y-2 text-sm text-gray-400">
                                    <li><a href="#" className="hover:text-white">Giới thiệu</a></li>
                                    <li><a href="#" className="hover:text-white">Liên hệ</a></li>
                                    <li><a href="#" className="hover:text-white">Quảng cáo</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-3">Theo dõi chúng tôi</h4>
                                <div className="flex gap-3">
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