'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import EditorialPostCard from '@/components/EditorialPostCard';
import EmptyState from '@/components/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/axios';

interface ProfileCollectionPageProps {
    badge: string;
    title: string;
    description: string;
    endpoint: string;
    emptyTitle: string;
    emptyDescription: string;
}

const tabs = [
    { href: '/profile/bookmarks', label: 'Bookmark' },
    { href: '/profile/liked', label: 'Da thich' },
];

export default function ProfileCollectionPage({
    badge,
    title,
    description,
    endpoint,
    emptyTitle,
    emptyDescription,
}: ProfileCollectionPageProps) {
    const pathname = usePathname();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
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

        const fetchPosts = async () => {
            setIsLoading(true);

            try {
                const response = await api.get(endpoint);
                setPosts(response.data.data || []);
            } catch (error) {
                console.error(`Failed to fetch ${endpoint}`, error);
                setPosts([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPosts();
    }, [authLoading, endpoint, isAuthenticated]);

    return (
        <main className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-12 lg:py-16">
                <div className="mb-8 flex flex-col gap-4 border-b border-border pb-8 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-3">
                        <div className="text-[10px] font-black uppercase tracking-[0.35em] text-primary">{badge}</div>
                        <h1 className="text-4xl font-serif font-black tracking-[-0.03em] text-foreground md:text-5xl">
                            {title}
                        </h1>
                        <p className="max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
                            {description}
                        </p>
                    </div>
                    <Link
                        href="/profile"
                        className="inline-flex w-fit items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                        Ve ho so
                    </Link>
                </div>

                <div className="mb-10 flex flex-wrap gap-3">
                    {tabs.map((tab) => {
                        const isActive = pathname === tab.href;

                        return (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.24em] transition-colors ${
                                    isActive
                                        ? 'border-primary bg-primary text-white'
                                        : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
                                }`}
                            >
                                {tab.label}
                            </Link>
                        );
                    })}
                </div>

                {!authLoading && !isAuthenticated && (
                    <EmptyState
                        icon="inbox"
                        title="Ban chua dang nhap"
                        description="Dang nhap de dong bo danh sach da luu va bai viet da thich tren moi thiet bi."
                        action={{ label: 'Dang nhap', href: '/login' }}
                    />
                )}

                {isAuthenticated && isLoading && (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div key={index} className="h-56 animate-pulse rounded-[1.75rem] bg-muted" />
                        ))}
                    </div>
                )}

                {isAuthenticated && !isLoading && posts.length === 0 && (
                    <EmptyState
                        icon="search"
                        title={emptyTitle}
                        description={emptyDescription}
                        action={{ label: 'Kham pha bai viet', href: '/' }}
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
