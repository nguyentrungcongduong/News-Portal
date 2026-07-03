"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getMenu, getCategories } from "@/lib/api";
import UserMenu from "./UserMenu";
import NotificationBell from "./NotificationBell";
import ThemeToggle from "./ThemeToggle";
import AdBanner from "./AdBanner";

export default function Navbar() {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [mobileMenuItems, setMobileMenuItems] = useState<any[]>([]);
  const [isSticky, setIsSticky] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        const [headerData, mobileData] = await Promise.all([
          getMenu("header"),
          getMenu("mobile").catch(() => null)
        ]);

        if (headerData && headerData.items && headerData.items.length > 0) {
          setMenuItems(headerData.items);
        } else {
          const res = await getCategories();
          const cats = res.data || [];
          const items = cats.map((cat: any) => ({
            id: `cat-${cat.id}`,
            title: cat.name,
            url: `/category/${cat.slug}`,
            children: []
          }));
          setMenuItems(items);
        }

        if (mobileData && mobileData.items && mobileData.items.length > 0) {
          setMobileMenuItems(mobileData.items);
        }
      } catch (err) {
        console.error("Error fetching menu data:", err);
      }
    };
    fetchMenuData();

    const now = new Date();
    setCurrentDate(now.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    }));

    const handleScroll = () => {
      setIsSticky(window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="w-full z-[100] border-b border-border/80 bg-background/95 backdrop-blur-sm">
      {!isSticky && (
        <div className="hidden border-b border-border/60 bg-card/60 md:block">
          <div className="container mx-auto flex items-center justify-between px-4 py-3 text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">
            <div className="flex min-w-0 items-center gap-6">
              <span>{currentDate}</span>
              <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-primary">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span>Edition dang truc tuyen</span>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/about" className="transition-colors hover:text-foreground">Ve chung toi</Link>
              <Link href="/support" className="transition-colors hover:text-foreground">Ho tro</Link>
              <Link href="/advertising" className="transition-colors hover:text-foreground">Quang cao</Link>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto flex justify-center border-b border-border/50 px-4 py-4 md:py-5">
        <AdBanner position="header" className="max-w-[728px] w-full" />
      </div>

      <div className={`transition-all duration-300 ${isSticky ? "fixed left-0 right-0 top-0 border-b border-border/70 bg-background/92 py-3 shadow-[0_12px_40px_-24px_rgba(17,24,39,0.55)] backdrop-blur-xl" : "py-6 md:py-8"}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="rounded-full border border-border/70 bg-card p-2.5 text-foreground lg:hidden"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>

            <div className="flex min-w-0 flex-1 items-center gap-4 lg:flex-none">
              <div className="hidden min-w-[12rem] lg:block">
                <div className="text-[10px] font-black uppercase tracking-[0.34em] text-primary">News Portal</div>
                <div className="mt-1 text-xs text-muted-foreground">Tin nhanh, sach, co ngu canh.</div>
              </div>
              <Link
                href="/"
                className={`min-w-0 font-serif font-black tracking-[-0.06em] text-foreground transition-all duration-500 ${isSticky ? "text-2xl md:text-3xl" : "text-4xl md:text-6xl"}`}
              >
                Daily Edition<span className="text-primary">.</span>
              </Link>
            </div>

            <div className="flex items-center gap-2 md:gap-5">
              <Link href="/search" className="hidden rounded-full border border-border/70 bg-card p-2 text-muted-foreground transition-colors hover:text-primary md:flex">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </Link>
              <ThemeToggle />
              <NotificationBell />
              <div className="mx-2 hidden h-6 w-px bg-border md:block" />
              <UserMenu />
            </div>
          </div>
        </div>
      </div>

      <nav className={`border-t border-border/60 bg-background/90 ${isSticky ? "hidden" : "block"}`}>
        <div className="container mx-auto px-4">
          <ul className="scrollbar-hide flex items-center justify-start gap-4 overflow-x-auto whitespace-nowrap py-4 lg:justify-center">
            {menuItems.map((item: any) => (
              <li key={item.id} className="relative group">
                <Link
                  href={item.url || "#"}
                  target={item.target}
                  className={`flex items-center gap-1 rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] transition-colors ${pathname === item.url
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-card hover:text-foreground"
                    }`}
                >
                  {item.title}
                  {item.children?.length > 0 && (
                    <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                  )}
                </Link>
                {item.children?.length > 0 && (
                  <ul className="absolute left-0 top-full z-[110] hidden min-w-[220px] rounded-[1.25rem] border border-border bg-card py-3 shadow-xl group-hover:block">
                    {item.children.map((child: any) => (
                      <li key={child.id}>
                        <Link
                          href={child.url || "#"}
                          className="block px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors hover:bg-background/70"
                        >
                          {child.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {isMenuOpen && (
        <div className="fixed inset-0 z-[200] lg:hidden">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-[320px] flex-col gap-10 border-r border-border bg-background p-8">
            <div className="flex items-center justify-between">
              <span className="font-serif text-3xl font-black">Daily Edition.</span>
              <button onClick={() => setIsMenuOpen(false)} className="rounded-full border border-border p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="rounded-[1.5rem] border border-border bg-card/70 p-5 text-sm text-muted-foreground">
              Ban doc cong khai danh cho doc gia. Chon chuyen muc hoac dung tim kiem de di thang vao bai viet.
            </div>
            <ul className="flex flex-col gap-4">
              {(mobileMenuItems.length > 0 ? mobileMenuItems : menuItems).map((item: any) => (
                <li key={item.id}>
                  <Link
                    href={item.url || "#"}
                    className={`flex justify-between rounded-2xl border px-4 py-4 text-base font-black uppercase tracking-[0.2em] ${pathname === item.url ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-foreground"
                      }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.title}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      )}
    </header>
  );
}
