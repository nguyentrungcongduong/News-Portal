"use client";

import { useTheme } from "@/contexts/ThemeContext";

export default function ThemeToggle() {
  const { themeMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative h-10 w-10 flex items-center justify-center rounded-xl border border-zinc-200 bg-white shadow-sm transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800 active:scale-95 overflow-hidden group"
      aria-label="Chuyển đổi giao diện"
    >
      <div className="relative h-5 w-5 transition-all duration-500 transform group-hover:rotate-12">
        {themeMode === "dark" ? (
          <svg
            className="h-full w-full text-amber-400 fill-amber-400/20"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        ) : (
          <svg
            className="h-full w-full text-zinc-600 fill-zinc-600/10"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 12.79A9 9 0 1111.21 3 7 7 0 0012 21a9 9 0 009-8.21z"
            />
          </svg>
        )}
      </div>
    </button>
  );
}
