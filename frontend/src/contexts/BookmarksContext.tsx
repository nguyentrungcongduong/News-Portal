'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { useAuth } from '@/contexts/AuthContext';

interface BookmarksContextType {
    bookmarkIds: number[];
    isLoading: boolean;
    isBookmarked: (postId: number) => boolean;
    toggleBookmark: (postId: number) => Promise<boolean | null>;
    refreshBookmarks: () => Promise<void>;
}

const BookmarksContext = createContext<BookmarksContextType | null>(null);

export function BookmarksProvider({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [bookmarkIds, setBookmarkIds] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const refreshBookmarks = useCallback(async () => {
        if (!isAuthenticated) {
            setBookmarkIds([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        try {
            const response = await api.get('/api/public/me/bookmarks/ids');
            setBookmarkIds(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch bookmark ids', error);
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (authLoading) {
            return;
        }

        refreshBookmarks();
    }, [authLoading, refreshBookmarks]);

    const isBookmarked = useCallback(
        (postId: number) => bookmarkIds.includes(postId),
        [bookmarkIds]
    );

    const toggleBookmark = useCallback(async (postId: number) => {
        if (!isAuthenticated) {
            router.push('/login');
            return null;
        }

        const previousIds = bookmarkIds;
        const currentlyBookmarked = previousIds.includes(postId);

        setBookmarkIds(
            currentlyBookmarked
                ? previousIds.filter((id) => id !== postId)
                : [...previousIds, postId]
        );

        try {
            const response = await api.post(`/api/public/posts/${postId}/bookmark`);
            const bookmarked = Boolean(response.data.bookmarked);

            setBookmarkIds((currentIds) => {
                const withoutPost = currentIds.filter((id) => id !== postId);
                return bookmarked ? [...withoutPost, postId] : withoutPost;
            });

            return bookmarked;
        } catch (error) {
            console.error('Failed to toggle bookmark', error);
            setBookmarkIds(previousIds);
            return null;
        }
    }, [bookmarkIds, isAuthenticated, router]);

    const value = useMemo(() => ({
        bookmarkIds,
        isLoading,
        isBookmarked,
        toggleBookmark,
        refreshBookmarks,
    }), [bookmarkIds, isBookmarked, isLoading, refreshBookmarks, toggleBookmark]);

    return (
        <BookmarksContext.Provider value={value}>
            {children}
        </BookmarksContext.Provider>
    );
}

export function useBookmarks() {
    const context = useContext(BookmarksContext);

    if (!context) {
        throw new Error('useBookmarks must be used within a BookmarksProvider');
    }

    return context;
}
