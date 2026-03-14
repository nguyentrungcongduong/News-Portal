import { getPostBySlug } from "@/lib/api";
import { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";

interface PostDetailPageProps {
    params: Promise<{
        categorySlug: string;
        postSlug: string;
    }>;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export async function generateMetadata({ params }: PostDetailPageProps): Promise<Metadata> {
    const { categorySlug, postSlug } = await params;
    const result = await getPostBySlug(postSlug);

    if (!result || !result.data) {
        return { title: 'Bài viết không tồn tại' };
    }

    const post = result.data;
    const categoryName = post.categories?.[0]?.name || 'Tin tức';
    const url = `${SITE_URL}/${categorySlug}/${postSlug}`;

    return {
        title: `${post.title} | ${categoryName} - News Portal`,
        description: post.summary,
        alternates: {
            canonical: url,
        },
        openGraph: {
            title: post.title,
            description: post.summary,
            url: url,
            siteName: 'News Portal',
            images: [
                {
                    url: post.thumbnail || '/placeholder-news.jpg',
                    width: 1200,
                    height: 630,
                    alt: post.title,
                },
            ],
            locale: 'vi_VN',
            type: 'article',
            publishedTime: post.published_at,
            authors: [post.author?.name],
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.summary,
            images: [post.thumbnail || '/placeholder-news.jpg'],
        },
    };
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
    const { postSlug } = await params;
    const result = await getPostBySlug(postSlug);

    if (!result || !result.data) {
        notFound();
    }

    const post = result.data;
    const relatedPosts = result.related || [];

    // Structured Data (Schema.org) for Google News
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        'headline': post.title,
        'image': [post.thumbnail || ''],
        'datePublished': post.published_at,
        'dateModified': post.updated_at || post.published_at,
        'author': [{
            '@type': 'Person',
            'name': post.author?.name,
            'url': `${SITE_URL}/author/${post.author_id}`,
        }],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
                    {/* Main Content */}
                    <article className="lg:col-span-2" itemScope itemType="https://schema.org/NewsArticle">
                        <header className="mb-8">
                            <div className="mb-6 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-blue-600">
                                {post.categories?.map((cat: any) => (
                                    <Link key={cat.id} href={`/${cat.slug}`} className="hover:underline">
                                        {cat.name}
                                    </Link>
                                ))}
                                <span className="text-zinc-300 mx-2">|</span>
                                <time className="text-zinc-500 font-medium normal-case tracking-normal" dateTime={post.published_at}>
                                    {new Date(post.published_at).toLocaleDateString('vi-VN', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </time>
                            </div>

                            <h1 className="mb-6 text-4xl font-extrabold leading-tight text-zinc-900 dark:text-white sm:text-5xl" itemProp="headline">
                                {post.title}
                            </h1>

                            <p className="border-l-4 border-blue-600 pl-4 text-xl font-medium text-zinc-600 dark:text-zinc-400" itemProp="description">
                                {post.summary}
                            </p>

                            <div className="mt-8 flex items-center gap-4 border-y border-zinc-100 py-6 dark:border-zinc-800">
                                <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                                    {post.author?.name?.charAt(0)}
                                </div>
                                <div itemProp="author" itemScope itemType="https://schema.org/Person">
                                    <p className="text-sm font-bold text-zinc-900 dark:text-white" itemProp="name">{post.author?.name}</p>
                                    <p className="text-xs text-zinc-500 uppercase tracking-tighter">Phóng viên News Portal</p>
                                </div>
                                <div className="ml-auto flex gap-2">
                                    {/* Social Share Buttons */}
                                    <div className="flex gap-2 text-zinc-400">
                                        <button className="rounded-full border border-zinc-200 p-2 hover:bg-zinc-50 dark:border-zinc-800">
                                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </header>

                        <section className="relative mb-12 aspect-[16/9] w-full overflow-hidden rounded-2xl">
                            <Image
                                src={post.thumbnail || '/placeholder-news.jpg'}
                                alt={post.title}
                                fill
                                className="object-cover"
                                priority
                                itemProp="image"
                            />
                        </section>

                        <section className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-a:text-blue-600 prose-img:rounded-2xl" itemProp="articleBody">
                            <div dangerouslySetInnerHTML={{ __html: post.content }} />
                        </section>

                        <footer className="mt-16 border-t border-zinc-200 pt-8 dark:border-zinc-800">
                            <div className="flex flex-wrap gap-2">
                                {post.categories?.map((cat: any) => (
                                    <span key={cat.id} className="text-sm font-medium text-zinc-500 hover:text-blue-600 cursor-pointer">#{cat.name}</span>
                                ))}
                            </div>
                        </footer>
                    </article>

                    {/* Sidebar: Related Posts */}
                    <aside className="space-y-12">
                        <section>
                            <h2 className="mb-6 text-xl font-extrabold uppercase tracking-tight text-zinc-900 dark:text-white border-b-2 border-blue-600 pb-2 inline-block">
                                Tin liên quan
                            </h2>
                            <div className="space-y-8">
                                {relatedPosts.map((related: any) => (
                                    <article key={related.id} className="group space-y-3">
                                        <Link href={`/${related.categories?.[0]?.slug || 'tin-tuc'}/${related.slug}`} className="block overflow-hidden rounded-xl bg-zinc-100">
                                            <div className="aspect-video relative">
                                                <Image
                                                    src={related.thumbnail || '/placeholder-news.jpg'}
                                                    alt={related.title}
                                                    fill
                                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                            </div>
                                        </Link>
                                        <h3 className="text-lg font-bold leading-tight group-hover:text-blue-600 transition-colors">
                                            <Link href={`/${related.categories?.[0]?.slug || 'tin-tuc'}/${related.slug}`}>
                                                {related.title}
                                            </Link>
                                        </h3>
                                    </article>
                                ))}
                                {relatedPosts.length === 0 && (
                                    <p className="text-sm text-zinc-500 italic">Không có tin liên quan nào.</p>
                                )}
                            </div>
                        </section>

                        <section className="rounded-2xl bg-zinc-900 p-8 text-white">
                            <h3 className="mb-4 text-xl font-bold">Đăng ký nhận tin</h3>
                            <p className="mb-6 text-sm text-zinc-400 text-xs">Nhận những tin tức mới nhất trực tiếp vào email hàng ngày.</p>
                            <div className="space-y-2">
                                <input type="email" placeholder="Email của bạn..." className="w-full rounded-lg bg-zinc-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600" />
                                <button className="w-full rounded-lg bg-blue-600 py-3 text-sm font-bold hover:bg-blue-700 transition-colors">ĐĂNG KÝ</button>
                            </div>
                        </section>
                    </aside>
                </div>
            </div>
        </>
    );
}
