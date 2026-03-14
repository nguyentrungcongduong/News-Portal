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

    // Set high-end press date format
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

  useEffect(() => {
    console.log("menuItems updated:", menuItems);
  }, [menuItems]);

  return (
    <header className="w-full z-[100] bg-background border-b border-slate-200 dark:border-zinc-800">
      {/* Top Bar - Press Style */}
      {!isSticky && (
        <div className="hidden md:block border-b border-slate-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950/50">
          <div className="container mx-auto px-4 py-2 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            <div className="flex items-center gap-6">
              <span>{currentDate}</span>
              <div className="flex items-center gap-2">
                <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" /></svg>
                <span>Hà Nội, 24°C</span>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/about" className="hover:underline">Về chúng tôi</Link>
              <Link href="/contact" className="hover:underline">Liên hệ</Link>
              <Link href="/advertise" className="hover:underline">Quảng cáo</Link>
            </div>
          </div>
        </div>
      )}

      {/* Header Ad Spot - Premium Look */}
      <div className="container mx-auto px-4 py-4 md:py-6 flex justify-center border-b border-slate-50 dark:border-zinc-900 bg-zinc-50/30 dark:bg-zinc-950/30">
        <AdBanner position="header" className="max-w-[728px] w-full" />
      </div>

      {/* Main Bar */}
      <div className={`transition-all duration-300 bg-background ${isSticky ? "fixed top-0 left-0 right-0 shadow-sm border-b py-3 bg-background/95 backdrop-blur-md" : "py-8"}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Mobile Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-foreground"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>

            {/* Empty center on mobile for mobile logo if needed, otherwise logo is left/center */}
            <Link
              href="/"
              className={`font-serif font-black tracking-tighter text-foreground border-b-4 border-primary transition-all duration-500 ${isSticky ? "text-2xl" : "text-4xl md:text-7xl"}`}
            >
              THE PRESS<span className="text-primary italic">.</span>
            </Link>

            {/* Actions */}
            <div className="flex items-center gap-2 md:gap-5">
              <Link href="/search" className="hidden md:flex p-2 text-muted-foreground hover:text-primary transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </Link>
              <ThemeToggle />
              <NotificationBell />
              <div className="h-6 w-px bg-border mx-2 hidden md:block" />
              <UserMenu />
            </div>
          </div>
        </div>
      </div>

      {/* Category Nav - Professional List */}
      <nav className={`bg-background border-t border-border ${isSticky ? "hidden" : "block shadow-sm"}`}>
        <div className="container mx-auto px-4">
          <ul className="flex items-center justify-start lg:justify-center gap-10 overflow-x-auto whitespace-nowrap scrollbar-hide py-4">
            {/* Remove hardcoded TRANG CHỦ as it's now managed via menuItems */}
            {menuItems.map((item: any) => (
              <li key={item.id} className="relative group">
                <Link
                  href={item.url || "#"}
                  target={item.target}
                  className={`text-[11px] font-black uppercase tracking-[0.2em] transition-colors py-4 flex items-center gap-1 ${pathname === item.url
                    ? "text-primary border-b-2 border-primary pb-4 -mb-4.5"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {item.title}
                  {item.children?.length > 0 && (
                    <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                  )}
                </Link>
                {/* Submenu (Optional enhancement) */}
                {item.children?.length > 0 && (
                  <ul className="absolute top-full left-0 bg-background border border-border shadow-xl py-3 min-w-[200px] hidden group-hover:block animate-in fade-in slide-in-from-top-2 duration-200 z-[110]">
                    {item.children.map((child: any) => (
                      <li key={child.id}>
                        <Link
                          href={child.url || "#"}
                          className="block px-6 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
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

      {/* Mobile Drawer */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[200] lg:hidden">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
          <aside className="absolute top-0 left-0 w-[300px] h-full bg-background p-10 flex flex-col gap-10 animate-in slide-in-from-left duration-300 border-r border-slate-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="font-serif font-black text-3xl">MENU</span>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 border border-slate-200 dark:border-zinc-800">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <ul className="flex flex-col gap-6">
              {(mobileMenuItems.length > 0 ? mobileMenuItems : menuItems).map((item: any) => (
                <li key={item.id}>
                  <Link
                    href={item.url || "#"}
                    className={`text-lg font-black uppercase tracking-widest border-b border-slate-100 dark:border-zinc-900 pb-2 flex justify-between ${pathname === item.url ? "text-primary" : "text-slate-900 dark:text-zinc-50"
                      }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.title}
                    <svg className={`w-4 h-4 ${pathname === item.url ? "text-primary" : "text-slate-300"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
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
