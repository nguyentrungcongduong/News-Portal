"use client";

import Link from "next/link";
import Image from "next/image";

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

    // Reading time calculation (placeholder logic)
    const readingTime = Math.ceil((post.content?.length || 500) / 1500) + " phút đọc";

    if (variant === "hero") {
        return (
            <article className="group grid grid-cols-1 lg:grid-cols-12 gap-0 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden rounded-none shadow-none mb-12">
                <div className="lg:col-span-8 relative aspect-[16/9] lg:aspect-auto lg:h-full border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-zinc-800">
                    <Image
                        src={post.thumbnail || "https://picsum.photos/1200/675"}
                        alt={post.title}
                        fill
                        className="object-cover transition-opacity duration-500 group-hover:opacity-90"
                        priority
                        sizes="(max-width: 1024px) 100vw, 800px"
                    />
                </div>
                <div className="lg:col-span-4 p-8 flex flex-col justify-center space-y-5">
                    <Link href={`/category/${category.slug}`} className="inline-block w-fit px-2 py-0.5 bg-primary text-[9px] font-black uppercase tracking-[0.2em] text-white">
                        {category.name}
                    </Link>
                    <Link href={href}>
                        <h2 className="text-3xl md:text-4xl font-serif font-black leading-tight text-slate-900 dark:text-zinc-50 hover:underline decoration-1 underline-offset-4">
                            {post.title}
                        </h2>
                    </Link>
                    {showExcerpt && (
                        <p className="text-slate-600 dark:text-zinc-400 text-base leading-relaxed font-editorial line-clamp-4">
                            {post.summary}
                        </p>
                    )}
                    <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-zinc-900">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest">{post.author?.name || "The Press"}</span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full" />
                            <span className="text-[10px] text-slate-400 uppercase tracking-widest">{readingTime}</span>
                        </div>
                    </div>
                </div>
            </article>
        );
    }

    if (variant === "secondary") {
        return (
            <article className="group flex flex-col border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-none shadow-none h-full">
                <div className="relative aspect-[3/2] border-b border-slate-200 dark:border-zinc-800 overflow-hidden">
                    <Image
                        src={post.thumbnail || "https://picsum.photos/600/400"}
                        alt={post.title}
                        fill
                        className="object-cover transition-opacity duration-500 group-hover:opacity-90"
                        sizes="(max-width: 768px) 100vw, 400px"
                    />
                </div>
                <div className="p-5 flex-1 flex flex-col space-y-3">
                    <Link href={`/category/${category.slug}`} className="text-[8px] font-black uppercase tracking-[0.2em] text-primary">
                        {category.name}
                    </Link>
                    <Link href={href} className="flex-1">
                        <h3 className="text-xl font-serif font-black leading-tight text-slate-900 dark:text-zinc-50 hover:underline decoration-1 underline-offset-2 line-clamp-2">
                            {post.title}
                        </h3>
                    </Link>
                    {showExcerpt && (
                        <p className="text-slate-500 dark:text-zinc-400 text-xs leading-relaxed font-editorial line-clamp-2">
                            {post.summary}
                        </p>
                    )}
                    <time className="text-[8px] text-slate-400 uppercase tracking-widest block pt-2">
                        {new Date(post.published_at).toLocaleDateString()}
                    </time>
                </div>
            </article>
        );
    }

    return (
        <article className="group flex gap-4 py-5 border-b border-slate-100 dark:border-zinc-900 last:border-0 items-start">
            <div className="flex-1 space-y-1.5 font-editorial">
                <Link href={`/category/${category.slug}`} className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">
                    {category.name}
                </Link>
                <Link href={href}>
                    <h4 className="text-base font-serif font-black leading-tight text-slate-900 dark:text-zinc-50 hover:underline decoration-1 underline-offset-2 line-clamp-2">
                        {post.title}
                    </h4>
                </Link>
                <div className="flex items-center gap-2 pt-1">
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest">{new Date(post.published_at).toLocaleDateString()}</span>
                    <span className="w-1 h-1 bg-slate-200 rounded-full" />
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest">{readingTime}</span>
                </div>
            </div>
            <div className="w-24 h-24 md:w-28 md:h-20 shrink-0 relative bg-slate-100 dark:bg-zinc-900 overflow-hidden border border-slate-200 dark:border-zinc-800">
                <Image
                    src={post.thumbnail || "https://picsum.photos/200/200"}
                    alt={post.title}
                    fill
                    className="object-cover grayscale transition-all duration-700 group-hover:grayscale-0"
                    sizes="120px"
                />
            </div>
        </article>
    );
}
