import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface PaginationMeta {
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

interface InfiniteScrollOptions<T> {
  threshold?: number;
  initialPage?: number;
  initialData?: T[];
  lastPage?: number;
}

export function useInfiniteScroll<T>(
  fetchFunction: (page: number) => Promise<{ data: T[]; meta: PaginationMeta }>,
  options: InfiniteScrollOptions<T> = {}
) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { threshold = 0.5, initialPage = 1, initialData = [], lastPage: initialLastPage = 1 } = options;

  const [items, setItems] = useState<T[]>(initialData);
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams?.get('page') || String(initialPage))
  );
  const [lastPage, setLastPage] = useState(initialLastPage);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const observerTarget = useRef<HTMLDivElement>(null);
  const hasLoadedRef = useRef(false);

  // Fetch posts for a specific page
  const loadPage = useCallback(
    async (page: number) => {
      if (isLoading || page > lastPage) return;

      setIsLoading(true);
      setHasError(false);

      try {
        const result = await fetchFunction(page);

        if (page === 1) {
          // First page: replace all items
          setItems(result.data);
        } else {
          // Subsequent pages: append items
          setItems((prev) => [...prev, ...result.data]);
        }

        setLastPage(result.meta.last_page);
        setCurrentPage(page);

        // Update URL with page parameter for SEO
        const params = new URLSearchParams();
        if (page > 1) {
          params.set('page', String(page));
        }
        const newUrl = params.toString()
          ? `?${params.toString()}`
          : location.pathname;
        router.push(newUrl, { scroll: false });
      } catch (error) {
        console.error('Failed to load page:', error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchFunction, isLoading, lastPage, router]
  );

  // Load initial page
  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadPage(currentPage);
    }
  }, []);

  // Setup Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && currentPage < lastPage) {
          loadPage(currentPage + 1);
        }
      },
      { threshold }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [isLoading, currentPage, lastPage, loadPage, threshold]);

  return {
    items,
    isLoading,
    hasError,
    hasMore: currentPage < lastPage,
    observerTarget,
    currentPage,
    lastPage,
    loadNextPage: () => {
      if (!isLoading && currentPage < lastPage) {
        loadPage(currentPage + 1);
      }
    }
  };
}
