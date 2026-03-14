import { getCategoryData } from "@/lib/api";
import CategoryPostsList from "@/components/CategoryPostsList";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import AdBanner from "@/components/AdBanner";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getCategoryData(slug);
  if (!data) return { title: "Edition Not Found" };

  return {
    title: `${data.category.name} | The Press Archive`,
    description: data.category.description,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/category/${slug}`,
    },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const { page } = await searchParams;
  const currentPage = parseInt(page || "1");

  const data = await getCategoryData(slug, currentPage);
  if (!data) notFound();

  const { category, featured_posts, posts, trending_posts } = data;

  return (
    <main className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-12">
        {/* --- 1. EDITORIAL HEADER --- */}
        <header className="mb-20 border-b-8 border-slate-900 dark:border-zinc-800 pb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">Department Archive</span>
            <div className="h-px flex-1 bg-slate-100 dark:bg-zinc-900" />
          </div>
          <h1 className="text-6xl md:text-8xl font-serif font-black tracking-tighter uppercase mb-6">
            {category.name}
          </h1>
          <p className="text-slate-500 dark:text-zinc-400 max-w-2xl text-lg font-editorial italic leading-relaxed">
            {category.description || `In-depth reporting and analysis on ${category.name}, curated by our lead editors.`}
          </p>
        </header>

        {/* --- 2. CATEGORY HIGHLIGHTS --- */}
        {featured_posts.length > 0 && (
          <section className="mb-24">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Main Feature in Category */}
              <div className="lg:col-span-8 group border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden">
                <div className="relative aspect-[21/9] border-b border-slate-200 dark:border-zinc-800">
                  <Image
                    src={featured_posts[0].thumbnail || "https://picsum.photos/1200/500"}
                    alt={featured_posts[0].title}
                    fill
                    className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                    sizes="(max-width: 1024px) 100vw, 800px"
                  />
                </div>
                <div className="p-10">
                  <Link href={`/post/${featured_posts[0].slug}`}>
                    <h2 className="text-3xl md:text-4xl font-serif font-black hover:underline decoration-1 underline-offset-4">
                      {featured_posts[0].title}
                    </h2>
                  </Link>
                  <p className="mt-4 text-slate-500 dark:text-zinc-400 font-editorial line-clamp-2 italic">
                    {featured_posts[0].summary}
                  </p>
                  <div className="mt-8 pt-6 border-t border-slate-100 dark:border-zinc-900 flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span>{featured_posts[0].author?.name || "The Press Staff"}</span>
                    <span className="w-1 h-1 bg-slate-200 rounded-full" />
                    <span>{new Date(featured_posts[0].published_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Smaller Highlights */}
              <div className="lg:col-span-4 flex flex-col gap-8">
                {featured_posts.slice(1, 3).map((post: any) => (
                  <div key={post.id} className="group border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 h-full flex flex-col">
                    <div className="relative aspect-[16/9] border-b border-slate-200 dark:border-zinc-800">
                      <Image
                        src={post.thumbnail || "https://picsum.photos/600/350"}
                        alt={post.title}
                        fill
                        className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                        sizes="(max-width: 1024px) 100vw, 400px"
                      />
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-center">
                      <Link href={`/post/${post.slug}`}>
                        <h3 className="text-xl font-serif font-black leading-tight hover:underline decoration-1 underline-offset-2 line-clamp-2">
                          {post.title}
                        </h3>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* --- 3. MAIN ARCHIVE & SIDEBAR --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 pt-16 border-t border-slate-200 dark:border-zinc-800">
          <div className="lg:col-span-8">
            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 mb-12 flex items-center gap-4">
              Tất cả bài viết
              <div className="h-px bg-slate-100 dark:bg-zinc-900 flex-1" />
            </h2>

            <CategoryPostsList
              slug={slug}
              initialPosts={posts.data}
              initialMeta={posts.meta}
            />
          </div>

          {/* Sidebar - Consistent with Homepage */}
          <aside className="lg:col-span-4 border-l border-slate-200 dark:border-zinc-800 pl-0 lg:pl-16 space-y-16">
            <div className="sticky top-28">
              {/* Section Specific Trending */}
              <div>
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] mb-10 pb-2 border-b-2 border-primary w-fit">
                  Department Top Stories
                </h3>
                <div className="space-y-10">
                  {trending_posts.map((post: any, index: number) => (
                    <div key={post.id} className="flex gap-6 group items-start">
                      <span className="text-4xl font-serif italic font-black text-slate-100 dark:text-zinc-900 group-hover:text-primary transition-colors leading-none pt-1">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <Link
                        href={`/post/${post.slug}`}
                        className="font-serif font-black text-lg leading-[1.3] group-hover:underline decoration-1 underline-offset-2 line-clamp-2"
                      >
                        {post.title}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sidebar Ads */}
              <AdBanner position="sidebar" className="mt-16" />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
