import { getPostBySlug } from "@/lib/api";
import { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import CommentSection from "@/components/CommentSection";

interface PostDetailPageProps {
    params: Promise<{
        slug: string;
    }>;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export async function generateMetadata({ params }: PostDetailPageProps): Promise<Metadata> {
    const { slug } = await params;
    const result = await getPostBySlug(slug);

    if (!result || !result.data) {
        return { title: 'Bài viết không tồn tại' };
    }

    const post = result.data;

    return {
        title: `${post.title} | ${post.category.name}`,
        description: post.summary,
        alternates: {
            canonical: `${SITE_URL}/post/${post.slug}`,
        },
        openGraph: {
            title: post.title,
            description: post.summary,
            url: `${SITE_URL}/post/${post.slug}`,
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
        },
    };
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
    const { slug } = await params;
    const result = await getPostBySlug(slug);

    if (!result || !result.data) {
        notFound();
    }

    const post = result.data;

    return (
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
            <article itemScope itemType="https://schema.org/NewsArticle">
                <header className="mb-8">
                    <div className="mb-6 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-blue-600">
                        {post.category && (
                            <Link href={`/category/${post.category.slug}`} className="hover:underline">
                                {post.category.name}
                            </Link>
                        )}
                        <span className="text-zinc-300 mx-2">|</span>
                        <time className="text-zinc-500 font-medium normal-case tracking-normal" dateTime={post.published_at}>
                            {new Date(post.published_at).toLocaleDateString('vi-VN', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </time>
                    </div>

                    <h1 className="mb-6 text-4xl font-extrabold leading-tight text-zinc-900 dark:text-white sm:text-5xl" itemProp="headline">
                        {post.title}
                    </h1>

                    <p className="border-l-4 border-blue-600 pl-4 text-xl font-medium text-zinc-600 dark:text-zinc-400" itemProp="description">
                        <strong>{post.summary}</strong>
                    </p>

                    <div className="mt-8 flex items-center gap-4 border-y border-zinc-100 py-6 dark:border-zinc-800">
                        <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                            {post.author.name.charAt(0)}
                        </div>
                        <div itemProp="author" itemScope itemType="https://schema.org/Person">
                            <p className="text-sm font-bold text-zinc-900 dark:text-white" itemProp="name">{post.author.name}</p>
                            <p className="text-xs text-zinc-500 uppercase tracking-tighter">Ban biên tập News Portal</p>
                        </div>
                    </div>
                </header>

                {post.thumbnail && (
                    <section className="relative mb-12 aspect-[16/9] w-full overflow-hidden rounded-2xl">
                        <Image
                            src={post.thumbnail}
                            alt={post.title}
                            fill
                            className="object-cover"
                            priority
                            itemProp="image"
                        />
                    </section>
                )}

                <section
                    className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-a:text-blue-600 prose-img:rounded-2xl"
                    itemProp="articleBody"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />

                <footer className="mt-16 border-t border-zinc-200 pt-8 dark:border-zinc-800">
                    <div className="flex flex-wrap gap-2 text-sm text-zinc-500">
                        Chuyên mục: <Link href={`/category/${post.category.slug}`} className="font-bold text-blue-600 hover:underline">{post.category.name}</Link>
                    </div>
                </footer>

                <CommentSection postSlug={post.slug} />
            </article>
        </div>
    );
}
