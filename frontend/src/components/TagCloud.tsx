'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Tag {
    id: number;
    name: string;
    slug: string;
    color: string;
    icon?: string;
    post_count: number;
    is_featured?: boolean;
}

interface Props {
    variant?: 'cloud' | 'list' | 'featured';
    limit?: number;
    className?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api` : 'http://127.0.0.1:8010/api';

export default function TagCloud({ variant = 'cloud', limit = 20, className = '' }: Props) {
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const endpoint = variant === 'featured'
                    ? `${API_BASE_URL}/public/tags/featured?limit=${limit}`
                    : `${API_BASE_URL}/public/tags/popular?limit=${limit}`;

                const response = await fetch(endpoint);
                if (response.ok) {
                    const data = await response.json();
                    setTags(data);
                }
            } catch (error) {
                console.error('Failed to fetch tags:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTags();
    }, [variant, limit]);

    if (loading) {
        return (
            <div className={`animate-pulse ${className}`}>
                <div className="flex flex-wrap gap-2">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
                    ))}
                </div>
            </div>
        );
    }

    if (tags.length === 0) {
        return null;
    }

    // Calculate font size based on post count for cloud view
    const maxCount = Math.max(...tags.map(t => t.post_count), 1);
    const minCount = Math.min(...tags.map(t => t.post_count), 0);

    const getTagSize = (count: number) => {
        if (variant !== 'cloud') return 'text-sm';
        const range = maxCount - minCount || 1;
        const ratio = (count - minCount) / range;
        if (ratio > 0.8) return 'text-xl font-bold';
        if (ratio > 0.6) return 'text-lg font-semibold';
        if (ratio > 0.4) return 'text-base font-medium';
        if (ratio > 0.2) return 'text-sm';
        return 'text-xs';
    };

    if (variant === 'list') {
        return (
            <div className={`space-y-2 ${className}`}>
                {tags.map((tag) => (
                    <Link
                        key={tag.id}
                        href={`/tag/${tag.slug}`}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                    >
                        <div className="flex items-center gap-2">
                            {tag.icon && <span className="text-lg">{tag.icon}</span>}
                            <span
                                className="font-medium group-hover:text-primary-600 transition-colors"
                                style={{ color: tag.color }}
                            >
                                {tag.name}
                            </span>
                        </div>
                        <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                            {tag.post_count} bài
                        </span>
                    </Link>
                ))}
            </div>
        );
    }

    if (variant === 'featured') {
        return (
            <div className={`grid grid-cols-2 sm:grid-cols-3 gap-3 ${className}`}>
                {tags.map((tag) => (
                    <Link
                        key={tag.id}
                        href={`/tag/${tag.slug}`}
                        className="group relative overflow-hidden rounded-xl p-4 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                        style={{ backgroundColor: `${tag.color}15` }}
                    >
                        <div className="flex flex-col items-center text-center">
                            {tag.icon && <span className="text-2xl mb-2">{tag.icon}</span>}
                            <span
                                className="font-bold text-sm group-hover:underline"
                                style={{ color: tag.color }}
                            >
                                {tag.name}
                            </span>
                            <span className="text-xs text-gray-500 mt-1">
                                {tag.post_count} bài viết
                            </span>
                        </div>
                        <div
                            className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity"
                            style={{ backgroundColor: tag.color }}
                        />
                    </Link>
                ))}
            </div>
        );
    }

    // Default: cloud view
    return (
        <div className={`flex flex-wrap gap-2 ${className}`}>
            {tags.map((tag) => (
                <Link
                    key={tag.id}
                    href={`/tag/${tag.slug}`}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full transition-all duration-200 hover:scale-110 hover:shadow-md ${getTagSize(tag.post_count)}`}
                    style={{
                        backgroundColor: `${tag.color}20`,
                        color: tag.color,
                        borderColor: tag.color,
                    }}
                >
                    {tag.icon && <span>{tag.icon}</span>}
                    <span>{tag.name}</span>
                    {variant === 'cloud' && tag.post_count > 0 && (
                        <span className="text-xs opacity-70">({tag.post_count})</span>
                    )}
                </Link>
            ))}
        </div>
    );
}
