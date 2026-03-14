import Link from 'next/link';
import { getCategories, getMenu } from '@/lib/api';
import AdBanner from './AdBanner';

const Footer = async () => {
    const [{ data: categories }, footer1Menu, footer2Menu, generalFooter] = await Promise.all([
        getCategories(),
        getMenu("footer_1").catch(() => null),
        getMenu("footer_2").catch(() => null),
        getMenu("footer").catch(() => null)
    ]);

    const col1Items = footer1Menu?.items || [];
    // Use footer_2 if exists, otherwise fallback to 'footer' (legacy/general)
    const activeFooter2 = footer2Menu?.items?.length ? footer2Menu : generalFooter;
    const col2Items = activeFooter2?.items || [];

    return (
        <footer className="w-full border-t border-zinc-200 bg-zinc-50 py-12 dark:border-zinc-800 dark:bg-black">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Footer Ads Carousel */}
                <div className="mb-12 flex justify-center">
                    <AdBanner position="footer" className="w-full max-w-[970px]" />
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                    <div className="space-y-4">
                        <Link href="/" className="text-xl font-bold tracking-tighter text-black dark:text-white flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center text-white text-xs font-black">N</div>
                            NEWS<span className="text-blue-600">PORTAL</span>
                        </Link>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            Cập nhật tin tức nhanh nhất, chính xác nhất về các lĩnh vực đời sống, xã hội, công nghệ và kinh doanh.
                        </p>
                    </div>
                    <div>
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-black dark:text-white">
                            {footer1Menu?.name || "Chuyên mục"}
                        </h3>
                        <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                            {col1Items.length > 0 ? (
                                col1Items.map((item: any) => (
                                    <li key={item.id}>
                                        <Link href={item.url || "#"} target={item.target} className="hover:text-blue-600 transition-colors">
                                            {item.title}
                                        </Link>
                                    </li>
                                ))
                            ) : (
                                categories.slice(0, 6).map((cat: any) => (
                                    <li key={cat.id}>
                                        <Link href={`/category/${cat.slug}`} className="hover:text-blue-600 transition-colors">
                                            {cat.name}
                                        </Link>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>
                    <div>
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-black dark:text-white">
                            {activeFooter2?.name || "Hỗ trợ"}
                        </h3>
                        <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                            {col2Items.length > 0 ? (
                                col2Items.map((item: any) => (
                                    <li key={item.id}>
                                        <Link
                                            href={item.url || "#"}
                                            target={item.target}
                                            className="hover:text-blue-600 underline-offset-4 hover:underline"
                                        >
                                            {item.title}
                                        </Link>
                                    </li>
                                ))
                            ) : (
                                <>
                                    <li><Link href="/support" className="hover:text-blue-600 underline-offset-4 hover:underline">Hỗ trợ</Link></li>
                                    <li><Link href="/about" className="hover:text-blue-600 underline-offset-4 hover:underline">Về chúng tôi</Link></li>
                                    <li><Link href="/advertising" className="hover:text-blue-600 underline-offset-4 hover:underline">Liên hệ quảng cáo</Link></li>
                                    <li><Link href="/privacy" className="hover:text-blue-600 underline-offset-4 hover:underline">Chính sách bảo mật</Link></li>
                                </>
                            )}
                        </ul>
                    </div>
                    <div>
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-black dark:text-white">Theo dõi</h3>
                        <div className="flex gap-4">
                            <a href="#" className="h-10 w-10 flex items-center justify-center rounded-full bg-zinc-200 hover:bg-blue-600 hover:text-white transition-all dark:bg-zinc-800">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                            </a>
                            <a href="#" className="h-10 w-10 flex items-center justify-center rounded-full bg-zinc-200 hover:bg-blue-400 hover:text-white transition-all dark:bg-zinc-800">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
                            </a>
                        </div>
                    </div>
                </div>
                <div className="mt-12 border-t border-zinc-200 pt-8 text-center text-sm text-zinc-500 dark:border-zinc-800">
                    © {new Date().getFullYear()} News Portal. Tôn trọng bản quyền nội dung.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
