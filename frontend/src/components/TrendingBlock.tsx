import Link from "next/link";

interface TrendingPost {
  id: number;
  title: string;
  slug: string;
  view_count?: number;
  published_at?: string;
}

interface TrendingBlockProps {
  posts: TrendingPost[];
  limit?: number;
}

export default function TrendingBlock({
  posts,
  limit = 7,
}: TrendingBlockProps) {
  if (!posts || posts.length === 0) {
    return null;
  }

  const trendingPosts = posts.slice(0, limit);

  return (
    <section className="mb-16 bg-linear-to-br from-gray-900/50 to-gray-800/30 dark:from-gray-900 dark:to-gray-850 rounded-lg p-6 md:p-8 border border-gray-700 dark:border-gray-700 shadow-md hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-700">
        <span className="text-2xl">🔥</span>
        <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wide text-amber-600 dark:text-amber-500">
          Đang được quan tâm
        </h2>
      </div>

      {/* Trending List */}
      <div className="space-y-2">
        {trendingPosts.map((post, index) => (
          <Link
            key={post.id}
            href={`/post/${post.slug}`}
            className="group flex items-center gap-4 p-3 rounded-lg hover:bg-gray-700/40 dark:hover:bg-gray-700/60 transition-all duration-200"
          >
            {/* Ranking Number - Outline style */}
            <div className="shrink-0 min-w-fit">
              <span className="inline-flex items-center justify-center w-10 h-10 font-bold text-lg border-2 border-gray-600 dark:border-gray-500 rounded-lg text-gray-700 dark:text-gray-300 group-hover:border-amber-500 dark:group-hover:border-amber-500 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-all duration-200">
                {index + 1}
              </span>
            </div>

            {/* Title */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm md:text-base text-gray-800 dark:text-gray-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-200 line-clamp-2">
                {post.title}
              </h3>
              {post.view_count && (
                <p className="text-xs text-gray-600 dark:text-gray-500 mt-1">
                  {post.view_count.toLocaleString()} lượt xem
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
