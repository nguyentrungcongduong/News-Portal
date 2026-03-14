import { searchPosts } from "@/lib/api";
import PostCard from "@/components/PostCard";
import { Metadata } from "next";
import Link from "next/link";

interface SearchPageProps {
    searchParams: Promise<{
        q?: string;
        page?: string;
    }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
    const sParams = await searchParams;
    const q = sParams.q || "";

    return {
        title: q ? `Tìm kiếm "${q}" | News Portal` : "Tìm kiếm tin tức | News Portal",
        description: q ? `Kết quả tìm kiếm cho từ khóa "${q}" trên hệ thống News Portal.` : "Tìm kiếm tin tức đời sống, xã hội bản tin mới nhất.",
        robots: {
            index: true,
            follow: true,
        },
    };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
    const sParams = await searchParams;
    const q = sParams.q || "";
    const page = Number(sParams.page || 1);

    if (!q) {
        return (
            <div className="mx-auto max-w-4xl px-4 py-32 text-center">
                <div className="mb-8 flex justify-center text-zinc-200">
                    <svg className="h-24 w-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <h1 className="text-3xl font-black text-zinc-900 dark:text-white">Bạn đang tìm gì?</h1>
                <p className="mt-4 text-zinc-600 dark:text-zinc-400 text-lg">Vui lòng nhập từ khóa để khám phá kho nội dung của chúng tôi.</p>

                <div className="mt-12 max-w-lg mx-auto">
                    <form action="/search" method="GET" className="relative group">
                        <input
                            name="q"
                            type="text"
                            autoFocus
                            placeholder="Vương Anh Tú, bão số 3..."
                            className="w-full bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-2xl py-5 px-6 text-lg focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all"
                        />
                        <button type="submit" className="absolute right-4 top-4 bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/20">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </button>
                    </form>
                </div>
                <Link href="/" className="mt-12 inline-block font-bold text-zinc-400 hover:text-blue-600 transition tracking-tighter uppercase text-sm">← Quay lại trang chủ</Link>
            </div>
        );
    }

    let searchData;
    try {
        searchData = await searchPosts(q, page);
    } catch (e) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-20 text-center">
                <div className="bg-red-50 text-red-600 p-8 rounded-3xl inline-block max-w-md border border-red-100">
                    <h2 className="text-xl font-bold mb-2">Lỗi kết nối máy chủ</h2>
                    <p>Không thể thực hiện tìm kiếm lúc này. Vui lòng thử lại sau giây lát.</p>
                </div>
            </div>
        );
    }

    const { data: posts, meta } = searchData;

    return (
        <main className="min-h-screen bg-zinc-50/30">
            <div className="mx-auto max-w-7xl px-4 py-12 lg:py-20 sm:px-6 lg:px-8">
                <header className="mb-16">
                    <div className="flex items-center gap-3 text-sm font-bold text-blue-600 uppercase tracking-widest mb-4">
                        <span className="w-8 h-px bg-blue-600"></span>
                        Tìm kiếm
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white sm:text-5xl lg:text-6xl">
                        Kết quả cho: <span className="text-blue-600 italic">"{q}"</span>
                    </h1>
                    <div className="mt-6 flex items-center gap-4 text-zinc-500 text-lg">
                        <div className="h-10 w-10 flex items-center justify-center rounded-full bg-white border border-zinc-100 shadow-sm">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                        </div>
                        Tìm thấy <span className="font-bold text-zinc-900">{meta.total}</span> bài viết liên quan
                    </div>
                </header>

                <section className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-8">
                        <div className="grid grid-cols-1 gap-10">
                            {posts.map((post: any) => (
                                <PostCard key={post.slug} post={post} />
                            ))}
                        </div>

                        {posts.length === 0 && (
                            <div className="py-32 text-center bg-white rounded-3xl border border-zinc-100 shadow-sm px-8">
                                <div className="text-zinc-200 mb-6 flex justify-center">
                                    <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                </div>
                                <h3 className="text-2xl font-bold text-zinc-900">Rất tiếc, không tìm thấy kết quả</h3>
                                <p className="mt-4 text-zinc-500 text-lg max-w-sm mx-auto">Vui lòng thử lại với từ khóa khác hoặc kiểm tra lại chính tả của bạn.</p>
                                <Link href="/" className="mt-10 inline-block bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/20">Quay lại Trang chủ</Link>
                            </div>
                        )}

                        {meta.last_page > 1 && (
                            <nav className="mt-20 flex justify-center gap-2" aria-label="Phân trang">
                                {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((p) => (
                                    <Link
                                        key={p}
                                        href={`/search?q=${encodeURIComponent(q)}&page=${p}`}
                                        className={`w-12 h-12 flex items-center justify-center rounded-xl font-bold transition-all ${p === page
                                                ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20 scale-110'
                                                : 'bg-white text-zinc-600 border border-zinc-100 hover:border-blue-600 hover:text-blue-600'
                                            }`}
                                    >
                                        {p}
                                    </Link>
                                ))}
                            </nav>
                        )}
                    </div>

                    <aside className="lg:col-span-4">
                        <div className="sticky top-24 space-y-12">
                            <div className="bg-zinc-900 rounded-3xl p-8 text-white">
                                <h3 className="text-xl font-bold mb-6">Mẹo tìm kiếm</h3>
                                <ul className="space-y-4 text-zinc-400 text-sm">
                                    <li className="flex gap-3">
                                        <span className="text-blue-500 font-bold">1.</span>
                                        Sử dụng từ khóa ngắn hoặc tên riêng.
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="text-blue-500 font-bold">2.</span>
                                        Tìm theo chủ đề thay vì cả câu hỏi.
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="text-blue-500 font-bold">3.</span>
                                        Kiểm tra xem bạn đã chọn đúng chuyên mục chưa.
                                    </li>
                                </ul>
                            </div>

                            <div className="aspect-[4/5] bg-white border border-zinc-100 rounded-3xl flex items-center justify-center text-zinc-300 text-sm font-bold uppercase tracking-widest shadow-sm">
                                Sidebar Ad
                            </div>
                        </div>
                    </aside>
                </section>
            </div>
        </main>
    );
}
