import Link from "next/link";
import Image from "next/image";

interface HeroTopStoryProps {
  post: {
    id: number;
    title: string;
    slug: string;
    summary: string;
    thumbnail: string;
    category_name?: string;
    category_slug?: string;
    published_at?: string;
  };
  className?: string;
}

export default function HeroTopStory({ post, className = "" }: HeroTopStoryProps) {
  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <section className={`group ${className}`}>
      <Link href={`/post/${post.slug}`}>
        <article className="relative overflow-hidden rounded-[32px] bg-gray-900 aspect-[5/3] shadow-[0_25px_70px_rgba(15,23,42,0.35)] hover:shadow-[0_25px_90px_rgba(59,7,7,0.45)] transition-all duration-500">
          {/* Background Image */}
          <Image
            src={post.thumbnail || "https://picsum.photos/1200/675"}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 100%"
          />

          {/* Gradient Overlays */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-tr from-gray-950/80 via-gray-900/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          </div>

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 lg:p-12">
            <div className="max-w-3xl space-y-6 backdrop-blur-lg bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
              {/* Category & Meta */}
              <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.2em] font-semibold text-white/80">
                {post.category_name && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400" />
                    {post.category_name}
                  </span>
                )}
                {formattedDate && (
                  <span className="inline-flex items-center gap-1 text-white/70">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6v6l3 3M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                      />
                    </svg>
                    {formattedDate}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight text-white drop-shadow-[0_10px_35px_rgba(0,0,0,0.55)]">
                {post.title}
              </h1>

              {/* Summary */}
              {post.summary && (
                <p className="text-base sm:text-lg text-white/85 leading-relaxed line-clamp-3">
                  {post.summary}
                </p>
              )}

              <div className="flex items-center gap-4 text-sm text-white/70">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Đang cập nhật
                </div>
                <span className="h-3 w-px bg-white/30" />
                <span>Xem chi tiết →</span>
              </div>
            </div>
          </div>
        </article>
      </Link>
    </section>
  );
}
