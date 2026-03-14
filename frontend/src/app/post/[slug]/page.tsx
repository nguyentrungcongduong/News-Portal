import { getPostBySlug } from '@/lib/api';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import EditorialPostCard from '@/components/EditorialPostCard';
import LikeButton from '@/components/LikeButton';
import CommentSection from '@/components/CommentSection';
import AdBanner from '@/components/AdBanner';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const data = await getPostBySlug(slug);
    if (!data || !data.post) return { title: 'Bài viết không tồn tại' };

    const { post } = data;
    return {
        title: post.title,
        description: post.summary,
        openGraph: {
            title: post.title,
            description: post.summary,
            images: [{ url: post.thumbnail }],
            type: 'article',
            publishedTime: post.published_at,
            authors: [post.author?.name],
        }
    };
}

export default async function PostDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const data = await getPostBySlug(slug);

    if (!data || !data.post) notFound();

    const { post, related_posts, trending_posts, ads } = data;
    const category = post.category || post.categories?.[0] || { name: 'Tin tức', slug: 'tin-tuc' };

    return (
        <main className="bg-background selection:bg-primary selection:text-white min-h-screen">
            <div className="container mx-auto px-4 py-8 lg:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Main Content Area */}
                    <article className="lg:col-span-8">
                        {/* Breadcrumbs - Editorial Style */}
                        <nav className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-10">
                            <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
                            <span className="w-1 h-1 bg-border rounded-full" />
                            <Link href={`/category/${category.slug}`} className="text-primary hover:underline">
                                {category.name}
                            </Link>
                        </nav>

                        {/* Header Section */}
                        <header className="mb-12">
                            <h1 className="text-4xl md:text-5xl lg:text-7xl font-serif font-black leading-[1.1] text-foreground mb-8">
                                {post.title}
                            </h1>

                            <div className="flex flex-wrap items-center justify-between gap-6 py-6 border-y border-border mb-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center font-black text-xs uppercase border border-border shadow-sm">
                                        {post.author?.name?.charAt(0) || 'N'}
                                    </div>
                                    <div>
                                        <div className="text-xs font-black uppercase tracking-widest text-foreground">
                                            {post.author?.name || 'News Portal Editor'}
                                        </div>
                                        <time className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                                            {new Date(post.published_at).toLocaleDateString('vi-VN', {
                                                day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </time>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <LikeButton postId={post.id} initialLikes={post.likes_count || 0} initialLiked={post.liked || false} />

                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                        {post.views?.toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            {/* Sapo / Summary */}
                            <p className="text-xl md:text-2xl font-editorial italic text-foreground/90 leading-relaxed mb-12 border-l-8 border-primary pl-8 py-2">
                                {post.summary}
                            </p>
                        </header>

                        {/* Featured Image */}
                        <div className="relative aspect-[16/9] md:aspect-[21/10] rounded-sm overflow-hidden mb-16 bg-muted shadow-2xl">
                            <Image
                                src={post.thumbnail || 'https://picsum.photos/1200/675'}
                                alt={post.title}
                                fill
                                priority
                                className="object-cover"
                                sizes="(max-width: 1024px) 100vw, 1000px"
                            />
                        </div>

                        {/* Ads In-Article Top */}
                        <AdBanner position="in_article" className="mb-16" />

                        {/* Content Body with Prose class */}
                        <div
                            className="prose prose-lg dark:prose-invert max-w-none prose-primary prose-img:rounded-sm"
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />

                        {/* Tags Section */}
                        {post.tags && post.tags.length > 0 && (
                            <div className="mt-16 flex flex-wrap gap-3 pt-10 border-t border-border">
                                {post.tags.map((tag: any) => (
                                    <Link
                                        key={tag.id}
                                        href={`/tag/${tag.slug}`}
                                        className="px-4 py-1.5 bg-muted text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-primary hover:text-white transition-all shadow-sm"
                                    >
                                        #{tag.name}
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Bottom Editorial Actions */}
                        <div className="mt-16 pt-10 border-t-4 border-foreground flex items-center justify-between">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Hết nội dung bài viết</p>
                            <div className="flex items-center gap-4">
                                <button className="p-3 bg-muted rounded-full hover:bg-primary hover:text-white transition-all"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg></button>
                                <button className="p-3 bg-muted rounded-full hover:bg-primary hover:text-white transition-all"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.791-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.209-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg></button>
                            </div>
                        </div>

                        {/* Related Posts */}
                        <section className="mt-24">
                            <h2 className="text-3xl font-serif font-black uppercase mb-12 border-b-4 border-foreground pb-4 italic">
                                Tin liên quan
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                {related_posts.map((item: any) => (
                                    <EditorialPostCard key={item.id} post={item} variant="secondary" />
                                ))}
                            </div>
                        </section>

                        {/* Comment Section */}
                        <div className="mt-24 border-t border-border pt-16">
                            <CommentSection postSlug={slug} />
                        </div>

                        {/* JSON-LD Schema */}
                        <script
                            type="application/ld+json"
                            dangerouslySetInnerHTML={{
                                __html: JSON.stringify({
                                    "@context": "https://schema.org",
                                    "@type": "NewsArticle",
                                    "headline": post.title,
                                    "image": [post.thumbnail],
                                    "datePublished": post.published_at,
                                    "dateModified": post.updated_at || post.published_at,
                                    "author": [{
                                        "@type": "Person",
                                        "name": post.author?.name || 'Ban Biên Tập',
                                        "url": `${process.env.NEXT_PUBLIC_SITE_URL}/author/${post.author?.slug || 'vnn'}`
                                    }]
                                })
                            }}
                        />
                    </article>

                    {/* Sidebar */}
                    <aside className="lg:col-span-4 border-l border-border pl-0 lg:pl-16">
                        <div className="sticky top-28 space-y-16">
                            {/* Sidebar Ad */}
                            <AdBanner position="sidebar" />

                            {/* Trending Block */}
                            <div className="space-y-10">
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] pb-3 border-b-2 border-primary w-fit">
                                    Đang được quan tâm
                                </h3>
                                <div className="space-y-8">
                                    {trending_posts.map((item: any, index: number) => (
                                        <Link key={item.id} href={`/post/${item.slug}`} className="flex gap-6 group items-start">
                                            <span className="text-4xl font-serif italic font-black text-muted/30 group-hover:text-primary transition-colors leading-none pt-1">
                                                {String(index + 1).padStart(2, '0')}
                                            </span>
                                            <p className="font-serif font-black text-lg leading-[1.3] group-hover:text-primary transition-colors line-clamp-2">
                                                {item.title}
                                            </p>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Newsletter Classic */}
                            <div className="bg-foreground text-background p-10 rounded-sm">
                                <h4 className="text-2xl font-serif font-black mb-4 leading-tight">The Insight Daily</h4>
                                <p className="text-xs font-editorial italic opacity-70 mb-8 leading-relaxed">Nhận những phân tích tin tức hàng đầu từ biên tập viên của chúng tôi trực tiếp vào hộp thư của bạn.</p>
                                <div className="flex flex-col gap-4">
                                    <input type="email" placeholder="Email Address" className="bg-transparent border-b border-background/20 py-3 text-sm outline-none focus:border-background transition-colors uppercase tracking-widest placeholder:text-background/40" />
                                    <button className="text-[10px] mt-2 font-black uppercase tracking-[0.4em] self-start hover:opacity-70 transition-opacity">Theo dõi →</button>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
}
