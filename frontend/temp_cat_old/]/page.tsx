import { getCategoryPosts } from "@/lib/api";
import PostCard from "@/components/PostCard";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

interface CategoryPageProps {
    params: Promise<{
        slug: string;
    }>;
    searchParams: Promise<{
        page?: string;
    }>;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
    const { slug } = await params;
    try {
        const data = await getCategoryPosts(slug);
        return {
            title: `${data.category.name} | Tin tức News Portal`,
            description: `Tin tức mới nhất về ${data.category.name}. Cập nhật 24/7 tại News Portal.`,
            alternates: {
                canonical: `${SITE_URL}/category/${slug}`,
            },
            openGraph: {
                title: `${data.category.name} - News Portal`,
                description: `Tin tức mới nhất về ${data.category.name}.`,
                url: `${SITE_URL}/category/${slug}`,
                siteName: 'News Portal',
                locale: 'vi_VN',
                type: 'website',
            },
        };
    } catch (e) {
        return { title: 'Chuyên mục không tồn tại' };
    }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
    const { slug } = await params;
    const sParams = await searchParams;
    const page = Number(sParams.page || 1);

    let data;
    try {
        data = await getCategoryPosts(slug, page);
    } catch (e) {
        notFound();
    }

    const posts = data.posts.data; // List of posts from the resource collection

    return (
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <main>
                <header className="mb-12 border-b border-zinc-100 pb-8 dark:border-zinc-800">
                    <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
                        {data.category.name}
                    </h1>
                    <p className="mt-4 text-xl text-zinc-600 dark:text-zinc-400">
                        Cập nhật tin tức nhanh nhất về <strong>{data.category.name}</strong>
                    </p>
                </header>

                <section className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {posts.map((post: any) => (
                        <PostCard key={post.slug} post={post} titleTag="h2" />
                    ))}
                    {posts.length === 0 && (
                        <div className="col-span-full py-20 text-center">
                            <p className="text-zinc-500 text-lg">Chưa có bài viết nào trong chuyên mục này.</p>
                            <Link href="/" className="mt-4 inline-block text-blue-600 font-bold hover:underline">Quay lại trang chủ</Link>
                        </div>
                    )}
                </section>

                {data.meta.last_page > 1 && (
                    <nav className="mt-16 flex justify-center gap-4" aria-label="Phân trang">
                        {page > 1 && (
                            <Link
                                href={`/category/${slug}?page=${page - 1}`}
                                className="rounded-lg border border-zinc-200 px-6 py-2 font-bold text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400"
                            >
                                ← Trang trước
                            </Link>
                        )}
                        {page < data.meta.last_page && (
                            <Link
                                href={`/category/${slug}?page=${page + 1}`}
                                className="rounded-lg border border-zinc-200 px-6 py-2 font-bold text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400"
                            >
                                Trang sau →
                            </Link>
                        )}
                    </nav>
                )}
            </main>
        </div>
    );
}
