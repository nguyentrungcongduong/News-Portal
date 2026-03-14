'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

interface Post {
    id: number;
    title: string;
    slug: string;
    summary?: string;
    thumbnail?: string;
    published_at: string;
    views: number;
    category?: {
        id: number;
        name: string;
        slug: string;
    };
    author?: {
        id: number;
        name: string;
        slug: string;
        avatar?: string;
    };
}

interface Props {
    slug: string;
    tagColor?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api` : 'http://127.0.0.1:8010/api';

export default function TagPostsList({ slug, tagColor = '#3B82F6' }: Props) {
    const { items, isLoading, hasError, hasMore, observerTarget } = useInfiniteScroll(
        async (page) => {
            const response = await fetch(
                `${API_BASE_URL}/public/tags/${slug}?page=${page}&per_page=12`,
                {
                    headers: {
                        'Accept': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch posts');
            }

            const result = await response.json();
            return {
                data: result.posts?.data || [],
                meta: {
                    current_page: result.posts?.current_page || 1,
                    last_page: result.posts?.last_page || 1,
                    total: result.posts?.total || 0,
                    per_page: result.posts?.per_page || 12
                }
            };
        }
    );

    const posts = items as Post[];

    if (hasError) {
        return (
            <div className="text-center py-12">
                <p className="text-red-500">Không thể tải bài viết. Vui lòng thử lại.</p>
            </div>
        );
    }

    if (!isLoading && posts.length === 0) {
        return (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
                <span className="text-6xl mb-4 block">📭</span>
                <h3 className="text-xl font-semibold mb-2">Chưa có bài viết nào</h3>
                <p className="text-gray-500">Tag này chưa có bài viết nào được đăng.</p>
            </div>
        );
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    return (
        <div className="space-y-6">
            {/* Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {posts.map((post, index) => (
                    <article
                        key={post.id}
                        className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    >
                        {/* Thumbnail */}
                        <Link href={`/bai-viet/${post.slug}`} className="block relative aspect-video overflow-hidden">
                            {post.thumbnail ? (
                                <Image
                                    src={post.thumbnail}
                                    alt={post.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                            ) : (
                                <div
                                    className="w-full h-full flex items-center justify-center"
                                    style={{ backgroundColor: `${tagColor}20` }}
                                >
                                    <span className="text-4xl opacity-50">📰</span>
                                </div>
                            )}

                            {/* Category Badge */}
                            {post.category && (
                                <span
                                    className="absolute top-3 left-3 px-3 py-1 text-xs font-semibold text-white rounded-full"
                                    style={{ backgroundColor: tagColor }}
                                >
                                    {post.category.name}
                                </span>
                            )}
                        </Link>

                        {/* Content */}
                        <div className="p-5">
                            <Link href={`/bai-viet/${post.slug}`}>
                                <h3 className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                                    {post.title}
                                </h3>
                            </Link>

                            {post.summary && (
                                <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-4">
                                    {post.summary}
                                </p>
                            )}

                            {/* Meta */}
                            <div className="flex items-center justify-between text-xs text-gray-500">
                                <div className="flex items-center gap-3">
                                    {post.author && (
                                        <Link
                                            href={`/author/${post.author.slug}`}
                                            className="flex items-center gap-1 hover:text-primary-600"
                                        >
                                            {post.author.avatar ? (
                                                <Image
                                                    src={post.author.avatar}
                                                    alt={post.author.name}
                                                    width={20}
                                                    height={20}
                                                    className="rounded-full"
                                                />
                                            ) : (
                                                <span className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px]">
                                                    👤
                                                </span>
                                            )}
                                            <span>{post.author.name}</span>
                                        </Link>
                                    )}
                                    <span>📅 {formatDate(post.published_at)}</span>
                                </div>
                                <span>👁️ {post.views.toLocaleString()}</span>
                            </div>
                        </div>
                    </article>
                ))}
            </div>

            {/* Load More Trigger */}
            <div ref={observerTarget} className="py-8 text-center">
                {isLoading && (
                    <div className="flex items-center justify-center gap-3">
                        <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full" />
                        <span className="text-gray-500">Đang tải thêm...</span>
                    </div>
                )}
                {!hasMore && posts.length > 0 && (
                    <p className="text-gray-500">
                        ✨ Bạn đã xem hết {posts.length} bài viết
                    </p>
                )}
            </div>
        </div>
    );
}
