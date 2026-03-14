import { getHomeData, getTrendingPosts } from "@/lib/api";
import EditorialPostCard from "@/components/EditorialPostCard";
import EmptyState from "@/components/EmptyState";
import Link from "next/link";
import AdBanner from "@/components/AdBanner";

export const metadata = {
  title: "The Press | Reliable Journalism & In-depth Reports",
  description: "Experience the news as it was meant to be: objective, deep, and focused on truth. Your trusted source for global events.",
};

export default async function HomePage() {
  let homeData;
  let trendingData;

  try {
    [homeData, trendingData] = await Promise.all([
      getHomeData(),
      getTrendingPosts(),
    ]);
  } catch (error) {
    console.error("Failed to load home data", error);
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-4xl font-serif font-black text-foreground mb-4">Edition Unavailable</h1>
        <p className="text-muted-foreground font-editorial italic">Our servers are currently experiencing difficulties. Please stand by.</p>
        <button className="mt-10 px-8 py-3 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px]">Retry Acquisition</button>
      </div>
    );
  }

  const { top_headline, featured_posts, category_blocks } = homeData;

  // Optimized NewsArticle JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    "name": "The Press",
    "url": "http://localhost:3000",
    "logo": "http://localhost:3000/logo.png",
    "foundingDate": "2026",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "http://localhost:3000"
    }
  };

  return (
    <div className="bg-background min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="container mx-auto px-4 py-12">
        {/* --- HERO BREAKING NEWS GRID --- */}
        <section className="mb-20">
          <div className="flex items-center gap-4 mb-8">
            <span className="flex items-center gap-2 px-3 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em]">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              Breaking
            </span>
            <div className="h-px flex-1 bg-slate-200 dark:bg-zinc-800" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* 65% Main Feature Column */}
            <div className="lg:col-span-8">
              {top_headline ? (
                <EditorialPostCard post={top_headline} variant="hero" />
              ) : (
                <div className="h-[400px] border border-dashed border-slate-200 flex items-center justify-center">
                  <EmptyState title="No Headline Story" description="Stand by for the latest edition." icon="inbox" />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
                {featured_posts?.slice(0, 2).map((post: any) => (
                  <EditorialPostCard key={post.id} post={post} variant="secondary" />
                ))}
              </div>
            </div>

            {/* 35% Sidebar Column */}
            <aside className="lg:col-span-4 border-l border-slate-200 dark:border-zinc-800 pl-0 lg:pl-10 h-fit">
              <div className="space-y-12">
                {/* Trending Stories (Numbers Style) */}
                <div>
                  <h3 className="text-[11px] font-black uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                    Most Read
                    <div className="h-px flex-1 bg-slate-100 dark:bg-zinc-900" />
                  </h3>
                  <div className="space-y-10">
                    {trendingData?.data?.slice(0, 5).map((post: any, index: number) => (
                      <Link key={post.id} href={`/post/${post.slug}`} className="flex gap-6 group">
                        <span className="text-4xl md:text-5xl font-serif font-black text-slate-100 dark:text-zinc-900 group-hover:text-primary transition-colors leading-none">
                          {index + 1}
                        </span>
                        <div className="flex-1 space-y-1 pt-1">
                          <span className="text-[8px] font-black uppercase text-primary tracking-widest">{post.category_name || "Updates"}</span>
                          <h4 className="text-base font-serif font-black leading-tight group-hover:underline decoration-1 underline-offset-2">
                            {post.title}
                          </h4>
                          <span className="text-[8px] text-slate-400 uppercase tracking-widest block pt-1">{post.views?.toLocaleString()} readers</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Sidebar Ad Spot */}
                <div className="py-6 border-y border-slate-50 dark:border-zinc-950">
                  <AdBanner position="sidebar" />
                </div>

                {/* Newsletter Box - Sharp & Clean */}
                <div className="border border-slate-900 dark:border-zinc-50 p-8 pt-10 relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-4">
                    <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" /></svg>
                  </div>
                  <h4 className="text-xl font-serif font-black mb-3 text-center">The Morning Dispatch</h4>
                  <p className="text-xs text-slate-500 font-editorial italic text-center leading-relaxed mb-8">
                    Essential reports delivered to your inbox every working morning. No filler, just truth.
                  </p>
                  <div className="space-y-4">
                    <input
                      type="email"
                      placeholder="ENTER EMAIL ADDRESS"
                      className="w-full bg-slate-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 p-3 text-xs outline-none focus:border-primary transition-colors font-black uppercase tracking-widest"
                    />
                    <button className="w-full bg-slate-900 dark:bg-zinc-50 text-white dark:text-slate-900 py-4 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-primary transition-colors">Subscribe Now</button>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* --- CATEGORY SECTIONS: Editorial Flow --- */}
        {category_blocks?.map((block: any, idx: number) => (
          <section key={block.category.id} className="mb-24 pt-20 border-t border-slate-200 dark:border-zinc-800">
            <div className="flex items-end justify-between mb-12">
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">Department</span>
                <h2 className="text-5xl md:text-6xl font-serif font-black tracking-tighter uppercase">{block.category.name}</h2>
              </div>
              <Link href={`/category/${block.category.slug}`} className="text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors border-b border-slate-200 pb-1">
                View Archive →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
              {/* Large Item in Category (6 Cols) */}
              <div className="lg:col-span-6 border-r border-slate-100 dark:border-zinc-900 pr-0 lg:pr-10">
                {block.posts?.[0] && <EditorialPostCard post={block.posts[0]} variant="secondary" showExcerpt={true} />}
              </div>

              {/* Small Items List (6 Cols) */}
              <div className="lg:col-span-6 space-y-2">
                {block.posts?.slice(1, 5).map((p: any) => (
                  <EditorialPostCard key={p.id} post={p} variant="list" />
                ))}
              </div>
            </div>
          </section>
        ))}
      </main>

      {/* FOOTER MASTHEAD (Branding) */}
      <footer className="border-t-[12px] border-slate-900 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 py-20">
        <div className="container mx-auto px-4 text-center space-y-10">
          <span className="font-serif font-black text-6xl md:text-9xl tracking-tighter text-slate-900/5 dark:text-zinc-50/5 block pointer-events-none">THE PRESS.</span>
          <div className="max-w-xl mx-auto space-y-6">
            <h5 className="text-xs font-black uppercase tracking-[0.3em] text-foreground">Independent Journalism</h5>
            <p className="text-sm text-muted-foreground font-editorial italic leading-relaxed">
              Founded on the belief that context is as important as content. We provide the background you need to understand the world.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
