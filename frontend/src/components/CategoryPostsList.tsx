"use client";

import PostCard from "@/components/PostCard";
import SkeletonCard from "@/components/SkeletonCard";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import api from "@/lib/axios";

interface Post {
  id: number;
  title: string;
  slug: string;
  summary: string;
  thumbnail: string;
  category_name?: string;
  published_at?: string;
}

interface CategoryPostsListProps {
  slug: string;
  initialPosts: Post[];
  initialMeta: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
}

export default function CategoryPostsList({
  slug,
  initialPosts,
  initialMeta,
}: CategoryPostsListProps) {
  // Use initialData properly to avoid hydration mismatch
  const { items, isLoading, hasMore, observerTarget, currentPage, lastPage, loadNextPage } = useInfiniteScroll(
    async (page) => {
      if (!slug || slug === 'undefined') {
        return { data: [], meta: initialMeta };
      }

      console.log(`[InfiniteScroll] Loading category: ${slug}, page: ${page}`);

      try {
        // Use relative path with the pre-configured axios instance (which has baseURL set)
        const response = await api.get(`/api/public/categories/${slug}`, {
          params: { page, per_page: 5 },
          headers: {
            'Accept': 'application/json'
          }
        });

        if (typeof response.data === 'string' && response.data.trim().startsWith('<!DOCTYPE')) {
          throw new Error('Received HTML instead of JSON. Check API route or server status.');
        }

        return {
          data: response.data.posts?.data || [],
          meta: response.data.posts?.meta || {
            current_page: page,
            last_page: 1,
            total: 0,
            per_page: 10,
          },
        };
      } catch (error: any) {
        console.error(`[InfiniteScroll] Error 404 for category: ${slug}. Verify slug exists and is active.`);
        throw error;
      }
    },
    {
      initialPage: initialMeta.current_page,
      initialData: initialPosts,
      lastPage: initialMeta.last_page
    },
  );

  const displayItems = items.length > 0 ? items : initialPosts;
  const totalItems = initialMeta.total;

  return (
    <div className="w-full">
      <div className="space-y-12">
        {(displayItems as unknown[]).map((post: any) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {/* Progressive Loading / Load More UI */}
      <div className="mt-20 flex flex-col items-center gap-8 border-t border-slate-100 dark:border-zinc-900 pt-12">

        {/* Progress Indicator - The "Counter" from Option 3 */}
        {/* Progress indicator removed as requested */}

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="w-full space-y-10 animate-pulse">
            <SkeletonCard variant="list" />
            <SkeletonCard variant="list" />
            <SkeletonCard variant="list" />
          </div>
        )}

        {/* Action Button / Observer Target */}
        {hasMore ? (
          <div className="w-full flex justify-center">
            <button
              onClick={() => loadNextPage()}
              disabled={isLoading}
              className="group relative px-12 py-5 border border-slate-900 dark:border-zinc-800 hover:bg-slate-900 dark:hover:bg-zinc-800 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 font-serif text-lg tracking-tight uppercase font-black italic">
                {isLoading ? "Dispatching..." : "Xem thêm"}
              </span>
              {/* Subtle decorative corners */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-primary" />
            </button>
          </div>
        ) : (
          /* End of reports separator - Option 3 / Hybrid look */
          <div className="flex items-center w-full gap-6 px-4">
            <div className="h-[2px] flex-1 bg-slate-900 dark:bg-zinc-800" />
            <span className="text-slate-500 dark:text-zinc-500 text-[10px] uppercase tracking-[0.4em] font-serif font-black italic whitespace-nowrap">
              Hết danh sách bài viết
            </span>
            <div className="h-[2px] flex-1 bg-slate-900 dark:bg-zinc-800" />
          </div>
        )}
      </div>

      {/* Error state */}
      {displayItems.length === 0 && !isLoading && (
        <div className="mt-12 text-center py-20 border border-dashed border-slate-200 dark:border-zinc-800">
          <p className="text-slate-400 font-serif italic">No reports found in this archive.</p>
        </div>
      )}
    </div>
  );
}
