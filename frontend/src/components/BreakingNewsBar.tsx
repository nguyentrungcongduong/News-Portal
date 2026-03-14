"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/axios";

interface BreakingNews {
  id: number;
  title: string;
  slug: string;
  thumbnail?: string;
}

export default function BreakingNewsBar() {
  const [isVisible, setIsVisible] = useState(false);
  const [breakingNewsList, setBreakingNewsList] = useState<BreakingNews[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSticky, setIsSticky] = useState(false);

  // Load breaking news from API
  useEffect(() => {
    const fetchBreakingNews = async () => {
      try {
        // Check if user has closed breaking news
        const closedNewsIds = localStorage.getItem("closedBreakingNewsIds");
        const closedArray = closedNewsIds ? JSON.parse(closedNewsIds) : [];

        // Fetch top 3 latest posts
        const response = await api.get(
          "/api/public/posts?limit=3&sort=-published_at",
        );

        if (response.data?.data && Array.isArray(response.data.data)) {
          const filteredNews = response.data.data.filter(
            (post: any) => !closedArray.includes(post.id.toString()),
          );

          if (filteredNews.length > 0) {
            setBreakingNewsList(filteredNews);
            setIsVisible(true);
          }
        }
      } catch (error) {
        console.error("Failed to fetch breaking news:", error);
      }
    };

    fetchBreakingNews();
  }, []);

  // Handle scroll for sticky behavior
  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClose = () => {
    const closedNewsIds = localStorage.getItem("closedBreakingNewsIds");
    const closedArray = closedNewsIds ? JSON.parse(closedNewsIds) : [];
    closedArray.push(breakingNewsList[currentIndex].id.toString());
    localStorage.setItem("closedBreakingNewsIds", JSON.stringify(closedArray));

    const remaining = breakingNewsList.filter((_, idx) => idx !== currentIndex);
    if (remaining.length === 0) {
      setIsVisible(false);
    } else {
      setBreakingNewsList(remaining);
      setCurrentIndex(0);
    }
  };

  const handleNextNews = () => {
    setCurrentIndex((prev) => (prev + 1) % breakingNewsList.length);
  };

  if (!isVisible || breakingNewsList.length === 0) return null;

  const currentNews = breakingNewsList[currentIndex];

  return (
    <>
      {/* Spacer when sticky */}
      {isSticky && <div className="h-14" />}

      {/* Breaking News Bar - Refined & Themed */}
      <div
        className={`${isSticky ? "fixed top-0 left-0 right-0 z-[60] shadow-xl border-b border-white/10" : "relative border-b border-zinc-100 dark:border-zinc-800"
          } bg-white dark:bg-black transition-all duration-300`}
      >
        <div className="container mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
          {/* Left: HOT Badge */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="inline-flex items-center justify-center px-3 py-1 bg-red-600 rounded-full font-black text-[10px] text-white uppercase tracking-widest shadow-lg shadow-red-500/20">
              Hot
            </span>
          </div>

          {/* Center: News Title with dot indicator */}
          <Link
            href={`/post/${currentNews.slug}`}
            className="flex-1 min-w-0 flex items-center gap-2 group"
          >
            <span className="relative inline-flex h-1.5 w-1.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
            </span>

            <span className="text-sm md:text-base text-zinc-900 dark:text-zinc-100 group-hover:text-primary transition-colors truncate font-bold">
              {currentNews.title}
            </span>
          </Link>

          {/* Right: Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Next button if multiple news */}
            {breakingNewsList.length > 1 && (
              <button
                onClick={handleNextNews}
                className="p-2 hover:bg-gray-700 rounded-md transition-colors text-gray-400 hover:text-amber-400"
                title="Tin nóng tiếp theo"
                aria-label="Tiếp theo"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            )}

            {/* Close button */}
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-700 rounded-md transition-colors text-gray-400 hover:text-gray-300"
              title="Đóng"
              aria-label="Đóng"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
