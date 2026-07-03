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
        <h1 className="mb-4 text-4xl font-serif font-black text-foreground">Edition Unavailable</h1>
        <p className="font-editorial italic text-muted-foreground">Our servers are currently experiencing difficulties. Please stand by.</p>
        <button className="mt-10 bg-slate-900 px-8 py-3 text-[10px] font-black uppercase tracking-widest text-white">Retry Acquisition</button>
      </div>
    );
  }

  const { top_headline, featured_posts, category_blocks } = homeData;
  const spotlightPosts = featured_posts?.slice(0, 3) || [];
  const leadCategories = category_blocks?.slice(0, 3) || [];

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
    <div className="news-shell min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="container mx-auto px-4 py-8 md:py-12">
        <section className="mb-10 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="rounded-[2rem] border border-border/80 bg-card px-6 py-6 shadow-[0_30px_90px_-50px_rgba(17,24,39,0.45)] md:px-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-primary px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.34em] text-white">
                Front Page
              </span>
              <span className="rounded-full border border-border px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.28em] text-muted-foreground">
                Cap nhat theo thoi gian thuc
              </span>
            </div>
            <div className="mt-6 max-w-4xl">
              <h1 className="font-serif text-4xl font-black leading-[0.95] tracking-[-0.05em] text-foreground md:text-6xl">
                Giao dien doc tin tap trung hon, sach hon va uu tien nhip doc tren moi man hinh.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground font-editorial md:text-lg">
                Trang chu gom tin nong, diem nhan bien tap va cac tuyen noi dung chinh vao mot flow ngan, ro, it nhieu thi giac hon ban cu.
              </p>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-[1.5rem] border border-border bg-background/70 p-5">
                <div className="text-[10px] font-black uppercase tracking-[0.28em] text-primary">Tin nong</div>
                <div className="mt-3 text-2xl font-serif font-black">{trendingData?.data?.length || 0}</div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">Bai dang duoc doc nhieu nhat trong ngay.</p>
              </div>
              <div className="rounded-[1.5rem] border border-border bg-background/70 p-5">
                <div className="text-[10px] font-black uppercase tracking-[0.28em] text-primary">Chuyen muc</div>
                <div className="mt-3 text-2xl font-serif font-black">{category_blocks?.length || 0}</div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">Khoi noi dung duoc uu tien tren trang chu.</p>
              </div>
              <div className="rounded-[1.5rem] border border-border bg-background/70 p-5">
                <div className="text-[10px] font-black uppercase tracking-[0.28em] text-primary">Nhip xuat ban</div>
                <div className="mt-3 text-2xl font-serif font-black">24/7</div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">Toi uu de quet nhanh roi doc sau ngay sau do.</p>
              </div>
            </div>
          </div>
          <aside className="rounded-[2rem] border border-border/80 bg-slate-900 p-6 text-white shadow-[0_35px_100px_-55px_rgba(17,24,39,0.85)]">
            <div className="flex items-center justify-between">
              <h2 className="text-[11px] font-black uppercase tracking-[0.34em] text-amber-300">Morning Brief</h2>
              <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-white/70">Live</span>
            </div>
            <div className="mt-6 space-y-5">
              {trendingData?.data?.slice(0, 4).map((post: any, index: number) => (
                <Link key={post.id} href={`/post/${post.slug}`} className="block rounded-[1.4rem] border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10">
                  <div className="flex items-start gap-4">
                    <span className="font-serif text-3xl font-black text-amber-300/80">{String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-[0.28em] text-white/60">
                        {post.category_name || "Tin moi"}
                      </div>
                      <h3 className="mt-2 text-lg font-serif font-black leading-tight text-white">
                        {post.title}
                      </h3>
                      <div className="mt-3 text-[10px] uppercase tracking-[0.25em] text-white/50">
                        {post.views?.toLocaleString()} luot doc
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </aside>
        </section>

        <section className="mb-16 grid gap-10 lg:grid-cols-[1.25fr_0.75fr]">
          <div>
            {top_headline ? (
              <EditorialPostCard post={top_headline} variant="hero" />
            ) : (
              <div className="flex h-[400px] items-center justify-center rounded-[2rem] border border-dashed border-border">
                <EmptyState title="No Headline Story" description="Stand by for the latest edition." icon="inbox" />
              </div>
            )}
          </div>
          <div className="space-y-5">
            <div className="rounded-[2rem] border border-border/80 bg-card p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-[11px] font-black uppercase tracking-[0.34em] text-primary">Diem nhanh</h2>
                <Link href="/search" className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-primary">
                  Tim bai viet
                </Link>
              </div>
              <div className="mt-5 space-y-3">
                {spotlightPosts.map((post: any) => (
                  <EditorialPostCard key={post.id} post={post} variant="list" showExcerpt={false} />
                ))}
              </div>
            </div>
            <div className="rounded-[2rem] border border-border/80 bg-card p-6">
              <h2 className="text-[11px] font-black uppercase tracking-[0.34em] text-primary">Quang cao</h2>
              <div className="mt-5">
                <AdBanner position="sidebar" />
              </div>
            </div>
            <div className="rounded-[2rem] border border-border/80 bg-card p-6">
              <h2 className="text-[11px] font-black uppercase tracking-[0.34em] text-primary">Cac tuyen chinh</h2>
              <div className="mt-5 grid gap-3">
                {leadCategories.map((block: any) => (
                  <Link
                    key={block.category.id}
                    href={`/category/${block.category.slug}`}
                    className="rounded-[1.25rem] border border-border bg-background/70 px-4 py-4 transition-colors hover:border-primary/40"
                  >
                    <div className="text-lg font-serif font-black">{block.category.name}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{block.posts?.length || 0} bai noi bat trong muc nay</div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {category_blocks?.map((block: any, idx: number) => (
          <section key={block.category.id} className="mb-20 rounded-[2rem] border border-border/80 bg-card p-6 md:p-8">
            <div className="mb-8 flex flex-col gap-4 border-b border-border/70 pb-8 md:flex-row md:items-end md:justify-between">
              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">
                  {idx === 0 ? "Featured Desk" : "News Desk"}
                </span>
                <h2 className="text-4xl font-serif font-black tracking-[-0.04em] md:text-5xl">{block.category.name}</h2>
                <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                  Tuyen bai duoc lam lai theo dang lead story cong danh sach bo tro, giup nguoi doc vao dung trong tam roi moi doc them.
                </p>
              </div>
              <Link href={`/category/${block.category.slug}`} className="w-fit rounded-full border border-border px-5 py-3 text-[11px] font-black uppercase tracking-[0.24em] transition-colors hover:border-primary hover:text-primary">
                Xem chuyen muc
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.05fr_0.95fr]">
              <div>
                {block.posts?.[0] && <EditorialPostCard post={block.posts[0]} variant="secondary" showExcerpt={true} />}
              </div>
              <div className="grid gap-4">
                {block.posts?.slice(1, 5).map((p: any, listIndex: number) => (
                  <EditorialPostCard key={p.id} post={p} variant={listIndex === 0 ? "trending" : "list"} />
                ))}
              </div>
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
