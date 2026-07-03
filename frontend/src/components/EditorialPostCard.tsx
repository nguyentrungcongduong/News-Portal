"use client";

import Link from "next/link";
import Image from "next/image";
import BookmarkButton from "@/components/BookmarkButton";

interface EditorialPostCardProps {
    post: any;
    variant?: "hero" | "secondary" | "list" | "trending";
    showExcerpt?: boolean;
}

export default function EditorialPostCard({
    post,
    variant = "list",
    showExcerpt = true,
}: EditorialPostCardProps) {
    const category = post.category || post.categories?.[0] || { name: "Chung", slug: "chung" };
    const href = `/post/${post.slug}`;
    const readingTime = Math.ceil((post.content?.length || 500) / 1500) + " phut doc";
    const publishedAt = post.published_at ? new Date(post.published_at).toLocaleDateString("vi-VN") : "Moi cap nhat";

    if (variant === "hero") {
        return (
            <article className="group overflow-hidden rounded-[2rem] border border-border/80 bg-card shadow-[0_30px_80px_-40px_rgba(17,24,39,0.45)]">
                <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_0.9fr]">
                    <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[34rem]">
                        <Image
                            src={post.thumbnail || "https://picsum.photos/1200/675"}
                            alt={post.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                            priority
                            sizes="(max-width: 1024px) 100vw, 800px"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                        <div className="absolute left-6 top-6 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.35em] text-white backdrop-blur-md">
                            Lead Story
                        </div>
                    </div>
                    <div className="flex flex-col justify-between gap-8 p-7 md:p-10">
                        <div className="space-y-5">
                            <Link href={`/category/${category.slug}`} className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                {category.name}
                            </Link>
                            <Link href={href}>
                                <h2 className="text-3xl md:text-5xl font-serif font-black leading-[1.02] tracking-[-0.03em] text-card-foreground transition-colors group-hover:text-primary">
                                    {post.title}
                                </h2>
                            </Link>
                            {showExcerpt && (
                                <p className="max-w-xl text-base leading-8 text-muted-foreground font-editorial line-clamp-4">
                                    {post.summary}
                                </p>
                            )}
                        </div>
                        <div className="grid gap-4 border-t border-border/70 pt-6 text-sm md:grid-cols-3">
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Tac gia</div>
                                <div className="mt-2 font-semibold">{post.author?.name || "Ban bien tap"}</div>
                            </div>
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Xuat ban</div>
                                <div className="mt-2 font-semibold">{publishedAt}</div>
                            </div>
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Nhip doc</div>
                                <div className="mt-2 font-semibold">{readingTime}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </article>
        );
    }

    if (variant === "secondary") {
        return (
            <article className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-border/80 bg-card shadow-[0_20px_60px_-45px_rgba(17,24,39,0.55)] transition-transform duration-300 hover:-translate-y-1">
                <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                        src={post.thumbnail || "https://picsum.photos/600/400"}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                        sizes="(max-width: 768px) 100vw, 400px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                </div>
                <div className="flex flex-1 flex-col space-y-4 p-6">
                    <Link href={`/category/${category.slug}`} className="text-[10px] font-black uppercase tracking-[0.28em] text-primary">
                        {category.name}
                    </Link>
                    <Link href={href} className="flex-1">
                        <h3 className="text-2xl font-serif font-black leading-tight tracking-[-0.02em] text-card-foreground transition-colors group-hover:text-primary line-clamp-2">
                            {post.title}
                        </h3>
                    </Link>
                    {showExcerpt && (
                        <p className="text-sm leading-7 text-muted-foreground font-editorial line-clamp-3">
                            {post.summary}
                        </p>
                    )}
                    <div className="flex items-center justify-between border-t border-border/60 pt-4">
                        <time className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                            {publishedAt}
                        </time>
                        <div className="flex items-center gap-3">
                            <span className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                                {readingTime}
                            </span>
                            <BookmarkButton postId={post.id} initialBookmarked={post.bookmarked} variant="icon" />
                        </div>
                    </div>
                </div>
            </article>
        );
    }

    if (variant === "trending") {
        return (
            <article className="group flex items-start gap-4 rounded-[1.5rem] border border-border/70 bg-card/80 px-4 py-4 transition-colors hover:border-primary/40 hover:bg-card">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl">
                    <Image
                        src={post.thumbnail || "https://picsum.photos/200/200"}
                        alt={post.title}
                        fill
                        className="object-cover"
                        sizes="80px"
                    />
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                    <Link href={`/category/${category.slug}`} className="text-[10px] font-black uppercase tracking-[0.28em] text-primary">
                        {category.name}
                    </Link>
                    <Link href={href}>
                        <h4 className="line-clamp-2 font-serif text-lg font-black leading-tight text-card-foreground transition-colors group-hover:text-primary">
                            {post.title}
                        </h4>
                    </Link>
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                        <span>{publishedAt}</span>
                        <span className="h-1 w-1 rounded-full bg-border" />
                        <span>{readingTime}</span>
                    </div>
                </div>
                <BookmarkButton postId={post.id} initialBookmarked={post.bookmarked} variant="icon" className="shrink-0" />
            </article>
        );
    }

    return (
        <article className="group grid grid-cols-[1fr_7.5rem] gap-4 rounded-[1.4rem] border border-transparent px-3 py-4 transition-colors hover:border-border/80 hover:bg-card/70 md:grid-cols-[1fr_8.5rem]">
            <div className="space-y-2">
                <Link href={`/category/${category.slug}`} className="text-[10px] font-black uppercase tracking-[0.25em] text-primary/90">
                    {category.name}
                </Link>
                <Link href={href}>
                    <h4 className="line-clamp-2 text-lg font-serif font-black leading-tight text-card-foreground transition-colors group-hover:text-primary">
                        {post.title}
                    </h4>
                </Link>
                {showExcerpt && (
                    <p className="line-clamp-2 text-sm leading-6 text-muted-foreground font-editorial">
                        {post.summary}
                    </p>
                )}
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                    <span>{publishedAt}</span>
                    <span className="h-1 w-1 rounded-full bg-border" />
                    <span>{readingTime}</span>
                </div>
            </div>
            <div className="relative">
                <div className="absolute right-2 top-2 z-10">
                    <BookmarkButton postId={post.id} initialBookmarked={post.bookmarked} variant="icon" />
                </div>
                <div className="relative h-24 overflow-hidden rounded-2xl md:h-28">
                <Image
                    src={post.thumbnail || "https://picsum.photos/200/200"}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                    sizes="136px"
                />
                </div>
            </div>
        </article>
    );
}
