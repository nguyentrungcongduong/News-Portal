"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

interface Block {
    id: string;
    type: string;
    hidden?: boolean;
    data: Record<string, any>;
    settings?: Record<string, any>;
    order?: number;
}

/**
 * PublicBlockRenderer - Render JSON blocks thành React components
 * Dùng cho trang public /page/[slug]
 */
export default function PublicBlockRenderer({ blocks }: { blocks: Block[] }) {
    if (!blocks || blocks.length === 0) {
        return null;
    }

    const sortedBlocks = [...blocks].sort((a, b) => (a.order || 0) - (b.order || 0));

    return (
        <div className="public-page-content space-y-0">
            {sortedBlocks.map((block) => (
                <div key={block.id} className="block-wrapper">
                    <RenderBlock block={block} />
                </div>
            ))}
        </div>
    );
}

function RenderBlock({ block }: { block: Block }) {
    if (block.hidden) return null;

    switch (block.type) {
        case "hero":
            return <HeroBlock block={block} />;
        case "banner":
            return <BannerBlock block={block} />;
        case "text":
            return <RichTextBlock block={block} />;
        case "image":
            return <ImageBlock block={block} />;
        case "gallery":
            return <GalleryBlock block={block} />;
        case "video":
            return <VideoBlock block={block} />;
        case "post_list":
            return <PostListBlock block={block} />;
        case "cta":
            return <CTABlock block={block} />;
        case "spacer":
            return <SpacerBlock block={block} />;
        default:
            return null;
    }
}

// =============== HERO ===============
function HeroBlock({ block }: { block: Block }) {
    return (
        <section
            className="relative flex items-center justify-center min-h-[400px] bg-cover bg-center overflow-hidden"
            style={{
                backgroundImage: block.data.background_image
                    ? `url(${block.data.background_image})`
                    : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
        >
            {block.settings?.overlay && (
                <div className="absolute inset-0 bg-black/40" />
            )}
            <div
                className="relative z-10 px-6 py-16 max-w-4xl mx-auto"
                style={{ textAlign: (block.settings?.align as any) || "center" }}
            >
                <h1 className="font-serif text-4xl md:text-6xl font-black text-white leading-tight tracking-tight">
                    {block.data.title}
                </h1>
                {block.data.subtitle && (
                    <p className="mt-4 text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
                        {block.data.subtitle}
                    </p>
                )}
            </div>
        </section>
    );
}

// =============== BANNER ===============
function BannerBlock({ block }: { block: Block }) {
    const bgColor = block.settings?.background_color || "#1890ff";
    const textColor = block.settings?.text_color || "#ffffff";

    return (
        <section
            className="relative overflow-hidden"
            style={{
                background: block.data.background_image
                    ? `url(${block.data.background_image}) center/cover`
                    : bgColor,
            }}
        >
            {block.data.background_image && (
                <div className="absolute inset-0 bg-black/50" />
            )}
            <div
                className="relative z-10 px-6 py-12 max-w-4xl mx-auto"
                style={{
                    textAlign: (block.settings?.align as any) || "center",
                    color: textColor,
                }}
            >
                <h2 className="text-2xl md:text-4xl font-bold mb-3">{block.data.title}</h2>
                {block.data.subtitle && (
                    <p className="text-base md:text-lg opacity-90 mb-6">{block.data.subtitle}</p>
                )}
                {block.data.button_text && (
                    <Link
                        href={block.data.button_url || "/"}
                        className="inline-block px-6 py-3 bg-white font-semibold rounded-md transition-transform hover:scale-105"
                        style={{ color: bgColor }}
                    >
                        {block.data.button_text}
                    </Link>
                )}
            </div>
        </section>
    );
}

// =============== RICH TEXT ===============
function RichTextBlock({ block }: { block: Block }) {
    return (
        <div
            className="prose prose-lg dark:prose-invert max-w-none px-6 py-8"
            style={{ maxWidth: block.settings?.max_width || "800px", margin: "0 auto" }}
            dangerouslySetInnerHTML={{ __html: block.data.content || "" }}
        />
    );
}

// =============== IMAGE ===============
function ImageBlock({ block }: { block: Block }) {
    const widthMap: Record<string, string> = { small: "50%", medium: "75%", full: "100%" };
    const width = widthMap[block.settings?.width] || "100%";

    if (!block.data.src) return null;

    return (
        <figure className="my-8 text-center px-6" style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <img
                src={block.data.src}
                alt={block.data.alt || ""}
                className="rounded-lg inline-block"
                style={{ width }}
            />
            {block.data.caption && (
                <figcaption className="mt-3 text-sm text-muted-foreground italic">
                    {block.data.caption}
                </figcaption>
            )}
        </figure>
    );
}

// =============== GALLERY ===============
function GalleryBlock({ block }: { block: Block }) {
    const images = block.data.images || [];
    const cols = block.settings?.columns || 3;
    const gap = block.settings?.gap || 8;

    if (images.length === 0) return null;

    return (
        <div
            className="px-6 py-8"
            style={{ maxWidth: "1200px", margin: "0 auto" }}
        >
            <div
                className="grid"
                style={{
                    gridTemplateColumns: `repeat(${cols}, 1fr)`,
                    gap: `${gap}px`,
                }}
            >
                {images.map((img: any, idx: number) => (
                    <figure key={idx} className="m-0">
                        <img
                            src={img.src}
                            alt={img.alt || ""}
                            className="w-full rounded-md object-cover"
                            style={{ aspectRatio: "4/3" }}
                        />
                        {img.caption && (
                            <figcaption className="mt-1 text-xs text-muted-foreground text-center">
                                {img.caption}
                            </figcaption>
                        )}
                    </figure>
                ))}
            </div>
        </div>
    );
}

// =============== VIDEO ===============
function VideoBlock({ block }: { block: Block }) {
    if (!block.data.video_id) return null;

    const aspectMap: Record<string, string> = { "16:9": "56.25%", "4:3": "75%", "1:1": "100%" };
    const paddingTop = aspectMap[block.settings?.aspect_ratio] || "56.25%";

    let embedUrl = "";
    if (block.data.provider === "youtube") {
        embedUrl = `https://www.youtube.com/embed/${block.data.video_id}`;
    } else if (block.data.provider === "vimeo") {
        embedUrl = `https://player.vimeo.com/video/${block.data.video_id}`;
    }

    return (
        <div className="px-6 py-8" style={{ maxWidth: "960px", margin: "0 auto" }}>
            <div className="relative rounded-lg overflow-hidden" style={{ paddingTop }}>
                <iframe
                    src={embedUrl}
                    className="absolute inset-0 w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            </div>
        </div>
    );
}

// =============== POST LIST ===============
function PostListBlock({ block }: { block: Block }) {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8010";
                const params = new URLSearchParams();
                if (block.data.category_slug) params.set("category", block.data.category_slug);

                const res = await fetch(`${API_URL}/api/public/posts?${params.toString()}`);
                if (res.ok) {
                    const json = await res.json();
                    const data = json.data || json;
                    setPosts(Array.isArray(data) ? data.slice(0, block.data.limit || 6) : []);
                }
            } catch (err) {
                console.error("Failed to fetch posts for post_list block:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, [block.data.category_slug, block.data.limit]);

    const cols = block.settings?.columns || 3;

    if (loading) {
        return (
            <div className="px-6 py-12 text-center text-muted-foreground">Đang tải...</div>
        );
    }

    if (posts.length === 0) return null;

    return (
        <div className="px-6 py-12" style={{ maxWidth: "1200px", margin: "0 auto" }}>
            {block.data.heading && (
                <h2 className="font-serif text-2xl font-black uppercase tracking-widest mb-8 border-b-2 border-primary pb-4 inline-block">
                    {block.data.heading}
                </h2>
            )}
            <div
                className="grid gap-6"
                style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
            >
                {posts.map((post: any) => (
                    <Link
                        key={post.id}
                        href={`/post/${post.slug}`}
                        className="group block rounded-lg overflow-hidden border border-border hover:shadow-lg transition-shadow bg-card"
                    >
                        {block.settings?.show_thumbnail !== false && post.thumbnail && (
                            <div className="aspect-video overflow-hidden">
                                <img
                                    src={post.thumbnail}
                                    alt={post.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                        )}
                        <div className="p-4">
                            <h3 className="font-bold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                                {post.title}
                            </h3>
                            {block.settings?.show_excerpt !== false && post.summary && (
                                <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                                    {post.summary}
                                </p>
                            )}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

// =============== CTA ===============
function CTABlock({ block }: { block: Block }) {
    const styleMap: Record<string, React.CSSProperties> = {
        primary: { background: "#1890ff", color: "#fff", border: "none" },
        secondary: { background: "#f0f0f0", color: "#333", border: "none" },
        outline: { background: "transparent", color: "#1890ff", border: "2px solid #1890ff" },
    };
    const btnStyle = styleMap[block.settings?.style] || styleMap.primary;

    return (
        <div className="text-center py-8 px-6">
            <Link
                href={block.data.url || "/"}
                className="inline-block px-8 py-3 text-base font-semibold rounded-md no-underline transition-transform hover:scale-105"
                style={btnStyle}
            >
                {block.data.text || "Nhấn vào đây"}
            </Link>
        </div>
    );
}

// =============== SPACER ===============
function SpacerBlock({ block }: { block: Block }) {
    return <div style={{ height: block.data.height || 40 }} />;
}
