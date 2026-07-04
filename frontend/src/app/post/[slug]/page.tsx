import { getPostBySlug } from '@/lib/api';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import EditorialPostCard from '@/components/EditorialPostCard';
import LikeButton from '@/components/LikeButton';
import BookmarkButton from '@/components/BookmarkButton';
import ShareActions from '@/components/ShareActions';
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
                                    <BookmarkButton postId={post.id} initialBookmarked={post.bookmarked || false} />

                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                        {post.views?.toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            <ShareActions
                                title={post.title}
                                summary={post.summary}
                                slug={post.slug}
                                className="mb-10"
                            />

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
                        <div className="mt-16 flex flex-col gap-6 border-t-4 border-foreground pt-10 md:flex-row md:items-center md:justify-between">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em]">H???t n???i dung b??i vi???t</p>
                            <ShareActions
                                title={post.title}
                                summary={post.summary}
                                slug={post.slug}
                            />
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
                                        <Link key={item.id} href={`/post/${item.slug}`} className="flex gap-6 items-start">
                                            <span className="text-4xl font-serif italic font-black text-primary/80 leading-none pt-1">
                                                {String(index + 1).padStart(2, '0')}
                                            </span>
                                            <p className="font-serif font-black text-lg leading-[1.3] text-foreground line-clamp-2">
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
