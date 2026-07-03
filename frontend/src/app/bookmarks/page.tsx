'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import EditorialPostCard from '@/components/EditorialPostCard';
import EmptyState from '@/components/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import { useBookmarks } from '@/contexts/BookmarksContext';
import api from '@/lib/axios';

export default function BookmarksPage() {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const { bookmarkIds } = useBookmarks();
    const [posts, setPosts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (authLoading) {
            return;
        }

        if (!isAuthenticated) {
            setPosts([]);
            setIsLoading(false);
            return;
        }

        const fetchBookmarks = async () => {
            setIsLoading(true);

            try {
                const response = await api.get('/api/public/me/bookmarks');
                setPosts(response.data.data || []);
            } catch (error) {
                console.error('Failed to fetch bookmarks', error);
                setPosts([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBookmarks();
    }, [authLoading, isAuthenticated, bookmarkIds]);

    return (
        <main className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-12 lg:py-16">
                <div className="mb-10 flex flex-col gap-4 border-b border-border pb-8 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-3">
                        <div className="text-[10px] font-black uppercase tracking-[0.35em] text-primary">Thu vien doc</div>
                        <h1 className="text-4xl font-serif font-black tracking-[-0.03em] text-foreground md:text-5xl">
                            Bài viết đã lưu
                        </h1>
                        <p className="max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
                            Danh sách này lưu những bài bạn muốn đọc lại sau. Bookmark được đồng bộ theo tài khoản.
                        </p>
                    </div>
                    <Link
                        href="/"
                        className="inline-flex w-fit items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                        Tiếp tục đọc
                    </Link>
                </div>

                {!authLoading && !isAuthenticated && (
                    <EmptyState
                        icon="inbox"
                        title="Bạn chưa đăng nhập"
                        description="Đăng nhập để lưu bài viết và mở lại danh sách này trên mọi thiết bị."
                        action={{ label: 'Đăng nhập', href: '/login' }}
                    />
                )}

                {isAuthenticated && isLoading && (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div key={index} className="h-56 animate-pulse rounded-[1.75rem] bg-muted" />
                        ))}
                    </div>
                )}

                {isAuthenticated && !isLoading && posts.length === 0 && (
                    <EmptyState
                        icon="search"
                        title="Chưa có bài nào được lưu"
                        description="Khi bạn bấm Lưu bài ở trang chi tiết hoặc danh sách, bài viết sẽ xuất hiện ở đây."
                        action={{ label: 'Khám phá bài viết', href: '/' }}
                    />
                )}

                {isAuthenticated && !isLoading && posts.length > 0 && (
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
                        {posts.map((post) => (
                            <EditorialPostCard key={post.id} post={post} variant="secondary" />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
