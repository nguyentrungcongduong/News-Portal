'use client';

import { useState } from 'react';
import { useBookmarks } from '@/contexts/BookmarksContext';

interface BookmarkButtonProps {
    postId: number;
    initialBookmarked?: boolean;
    variant?: 'icon' | 'pill';
    className?: string;
}

export default function BookmarkButton({
    postId,
    initialBookmarked = false,
    variant = 'pill',
    className = '',
}: BookmarkButtonProps) {
    const { isBookmarked, toggleBookmark, isLoading } = useBookmarks();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const bookmarked = isLoading ? initialBookmarked : isBookmarked(postId);

    const handleClick = async () => {
        if (isSubmitting || isLoading) {
            return;
        }

        setIsSubmitting(true);
        await toggleBookmark(postId);
        setIsSubmitting(false);
    };

    const baseClassName = variant === 'icon'
        ? `inline-flex h-10 w-10 items-center justify-center rounded-full border transition-all ${bookmarked
            ? 'border-amber-300 bg-amber-50 text-amber-600 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-300'
            : 'border-border bg-background/90 text-muted-foreground hover:border-primary/40 hover:text-primary'
        }`
        : `inline-flex items-center gap-2 rounded-full px-4 py-2 font-bold transition-all ${bookmarked
            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200'
        }`;

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={isSubmitting}
            aria-pressed={bookmarked}
            aria-label={bookmarked ? 'Bo luu bai viet' : 'Luu bai viet'}
            className={`${baseClassName} ${className}`.trim()}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill={bookmarked ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 21l-5-3-5 3V5a2 2 0 012-2h6a2 2 0 012 2z"
                />
            </svg>
            {variant === 'pill' && <span>{bookmarked ? 'Da luu' : 'Luu bai'}</span>}
        </button>
    );
}
