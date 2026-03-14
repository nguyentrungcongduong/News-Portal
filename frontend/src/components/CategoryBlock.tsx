import Link from "next/link";
import Image from "next/image";

interface Post {
  id: number;
  title: string;
  slug: string;
  thumbnail?: string;
  published_at?: string;
  author_name?: string;
}

interface CategoryBlockProps {
  title: string;
  slug: string;
  posts: Post[];
  color?: "blue" | "red" | "green" | "purple" | "orange";
}

const colorMap = {
  blue: "text-blue-600 dark:text-blue-400",
  red: "text-red-600 dark:text-red-400",
  green: "text-green-600 dark:text-green-400",
  purple: "text-purple-600 dark:text-purple-400",
  orange: "text-amber-600 dark:text-amber-400",
};

const CategoryBlock = ({
  title,
  slug,
  posts,
  color = "blue",
}: CategoryBlockProps) => {
  if (!posts || posts.length === 0) {
    return null;
  }

  const [mainPost, ...otherPosts] = posts;
  const smallPosts = otherPosts.slice(0, 3);

  return (
    <section className="mb-16 pb-8">
      {/* Category Header - Zing News Style */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-300 dark:border-gray-700">
        <h2
          className={`text-2xl md:text-3xl font-black uppercase tracking-wide ${colorMap[color]}`}
        >
          {title}
        </h2>
        <Link
          href={`/category/${slug}`}
          className="text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap ml-4"
        >
          Xem thêm →
        </Link>
      </div>

      {/* Layout: 60/40 - Main story left, small stories right */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Main Feature Story - 60% */}
        {mainPost && (
          <div className="lg:col-span-3 group">
            <Link
              href={`/post/${mainPost.slug}`}
              className="block overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <div className="relative aspect-video overflow-hidden bg-gray-200 dark:bg-gray-800">
                <Image
                  src={mainPost.thumbnail || "https://picsum.photos/800/450"}
                  alt={mainPost.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-400"
                  sizes="(max-width: 768px) 100vw, 60vw"
                  priority
                />
              </div>
            </Link>
            {/* Title and metadata */}
            <div className="mt-5 space-y-2">
              <Link href={`/post/${mainPost.slug}`}>
                <h3 className="text-xl md:text-2xl font-bold leading-snug text-gray-900 dark:text-gray-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-3">
                  {mainPost.title}
                </h3>
              </Link>
              {mainPost.published_at && (
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  {new Date(mainPost.published_at).toLocaleDateString("vi-VN", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Small Stories List - 40% */}
        {smallPosts.length > 0 && (
          <div className="lg:col-span-2 flex flex-col gap-0 divide-y divide-gray-300 dark:divide-gray-700">
            {smallPosts.map((post) => (
              <Link
                key={post.id}
                href={`/post/${post.slug}`}
                className="group flex gap-4 py-4 first:pt-0 last:pb-0 hover:opacity-75 transition-opacity"
              >
                {/* Small thumbnail - 16:9 ratio */}
                <div className="w-24 h-20 md:w-28 md:h-20 shrink-0 rounded-md overflow-hidden bg-gray-200 dark:bg-gray-800 shadow-sm">
                  <Image
                    src={post.thumbnail || "https://picsum.photos/200/150"}
                    alt={post.title}
                    width={120}
                    height={90}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                {/* Title and date */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <h4 className="font-semibold text-sm md:text-base leading-snug text-gray-900 dark:text-gray-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2">
                    {post.title}
                  </h4>
                  {post.published_at && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 font-medium mt-1">
                      {new Date(post.published_at).toLocaleDateString("vi-VN", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CategoryBlock;
