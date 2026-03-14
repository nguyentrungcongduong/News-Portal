import Link from "next/link";
import Image from "next/image";

interface PostCardProps {
  post: any;
  featured?: boolean;
  titleTag?: "h2" | "h3";
}

const PostCard = ({
  post,
  featured = false,
  titleTag = "h3",
}: PostCardProps) => {
  const category = post.category ||
    post.categories?.[0] || { name: "Chung", slug: "chung" };
  const TitleTag = titleTag;
  const href = `/post/${post.slug}`;

  if (featured) {
    return (
      <article className="group relative overflow-hidden rounded-3xl bg-zinc-100 dark:bg-zinc-900 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(37,99,235,0.15)] dark:hover:shadow-[0_20px_50px_rgba(59,130,246,0.1)]">
        <div className="aspect-[21/10] w-full relative overflow-hidden">
          <Image
            src={post.thumbnail || "/placeholder-news.jpg"}
            alt={post.title}
            fill
            priority
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 1200px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        </div>

        <div className="absolute bottom-0 p-6 md:p-10 z-10 w-full">
          <Link
            href={`/category/${category.slug}`}
            className="relative z-20 mb-4 inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-blue-700 hover:scale-105"
          >
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            {category.name}
          </Link>

          <TitleTag className="mb-4 text-2xl font-black text-white sm:text-3xl md:text-4xl lg:max-w-4xl leading-tight">
            <Link
              href={href}
              className="hover:text-blue-200 transition-colors after:absolute after:inset-0 after:z-10"
            >
              {post.title}
            </Link>
          </TitleTag>

          <p className="line-clamp-2 text-white/80 lg:max-w-2xl text-base md:text-lg font-medium leading-relaxed">
            {post.summary}
          </p>
        </div>
      </article>
    );
  }

  return (
    <article className="group relative flex flex-col gap-5 overflow-hidden rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4 transition-all duration-300 hover:border-blue-200 dark:hover:border-blue-900 hover:shadow-xl hover:shadow-blue-500/5 sm:flex-row">
      <div className="aspect-[16/10] w-full shrink-0 relative overflow-hidden rounded-xl sm:w-60 md:w-72 bg-zinc-100 dark:bg-zinc-800">
        <Image
          src={post.thumbnail || "https://picsum.photos/400/250"}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 640px) 100vw, 300px"
        />
        {/* Play overlay if video or just decorative */}
        <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
      </div>

      <div className="flex flex-col flex-1 py-1">
        <div className="flex items-center gap-3 mb-3">
          <Link
            href={`/category/${category.slug}`}
            className="relative z-20 text-[10px] font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors"
          >
            {category.name}
          </Link>
          <span className="w-1 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full" />
          <time className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest" dateTime={post.published_at}>
            {new Date(post.published_at).toLocaleDateString("vi-VN")}
          </time>
        </div>

        <TitleTag className="mb-3 text-lg md:text-xl font-black text-zinc-900 dark:text-zinc-50 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all duration-300 leading-tight">
          <Link href={href} className="after:absolute after:inset-0 after:z-10">
            {post.title}
          </Link>
        </TitleTag>

        <p className="line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400 mb-4 leading-relaxed font-medium">
          {post.summary}
        </p>

        <div className="mt-auto flex items-center justify-between pt-3 border-t border-zinc-50 dark:border-zinc-800/50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-[10px] font-bold text-blue-600 dark:text-blue-400">
              {post.author?.name?.charAt(0) || "N"}
            </div>
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              {post.author?.name || "News Portal"}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {post.views || 0}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};

export default PostCard;
