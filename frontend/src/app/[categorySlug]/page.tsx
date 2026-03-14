import { getCategoryData } from "@/lib/api";
import PostCard from "@/components/PostCard";
import { Metadata } from "next";
import Link from "next/link";

interface CategoryPageProps {
    params: Promise<{
        categorySlug: string;
    }>;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
    const { categorySlug } = await params;
    const name = categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1).replace(/-/g, ' ');
    const url = `${SITE_URL}/category/${categorySlug}`;

    return {
        title: `${name} | Tin tức mới nhất - News Portal`,
        description: `Cập nhật tin tức nhanh chóng, chính xác về chuyên mục ${name}. Đọc ngay tại News Portal.`,
        alternates: {
            canonical: url,
        },
        openGraph: {
            title: `${name} - News Portal`,
            description: `Chuyên mục ${name} tại News Portal`,
            url: url,
            type: 'website',
        }
    };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
    const { categorySlug } = await params;
    const result = await getCategoryData(categorySlug);
    const posts = result?.data ?? [];
    const meta = result?.meta ?? null;

    const categoryName = posts[0]?.categories?.find((c: any) => c.slug === categorySlug)?.name || categorySlug.toUpperCase();

    return (
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <header className="mb-12 border-b border-zinc-200 dark:border-zinc-800 pb-8">
                <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
                    {categoryName}
                </h1>
                <p className="mt-4 text-xl text-zinc-600 dark:text-zinc-400">
                    Khám phá những tin tức và câu chuyện mới nhất trong chuyên mục <strong>{categoryName}</strong>.
                </p>
            </header>

            <main className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {posts.map((post: any) => (
                    <PostCard key={post.id} post={post} />
                ))}
                {posts.length === 0 && (
                    <div className="col-span-full py-20 text-center">
                        <p className="text-zinc-500 text-lg">Chưa có bài viết nào trong chuyên mục này.</p>
                        <Link href="/" className="mt-4 inline-block text-blue-600 font-bold hover:underline">Quay lại trang chủ</Link>
                    </div>
                )}
            </main>

            {meta && meta.last_page > 1 && (
                <nav className="mt-16 flex justify-center gap-4" aria-label="Pagination">
                    {/* Pagination placeholder */}
                </nav>
            )}
        </div>
    );
}
