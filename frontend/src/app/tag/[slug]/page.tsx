import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import TagPostsList from './TagPostsList';
import TagCloud from '@/components/TagCloud';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8010/api';

interface Tag {
    id: number;
    name: string;
    slug: string;
    description?: string;
    color: string;
    icon?: string;
    post_count: number;
    meta?: {
        title?: string;
        description?: string;
        keywords?: string;
    };
}

interface Props {
    params: Promise<{ slug: string }>;
}

async function getTagData(slug: string): Promise<{ tag: Tag } | null> {
    try {
        const response = await fetch(`${API_BASE_URL}/public/tags/${slug}`, {
            next: { revalidate: 300 }, // Cache for 5 minutes
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to fetch tag:', error);
        return null;
    }
}

async function getRelatedTags(slug: string): Promise<Tag[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/public/tags/${slug}/related?limit=10`, {
            next: { revalidate: 600 },
        });

        if (!response.ok) {
            return [];
        }

        return await response.json();
    } catch (error) {
        return [];
    }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const data = await getTagData(slug);

    if (!data) {
        return {
            title: 'Tag không tồn tại',
        };
    }

    const { tag } = data;

    return {
        title: tag.meta?.title || `${tag.name} - Bài viết theo tag`,
        description: tag.meta?.description || tag.description || `Tất cả bài viết được gắn tag ${tag.name}`,
        keywords: tag.meta?.keywords,
        openGraph: {
            title: tag.meta?.title || `${tag.name} - Bài viết theo tag`,
            description: tag.meta?.description || tag.description,
            type: 'website',
        },
    };
}

export default async function TagPage({ params }: Props) {
    const { slug } = await params;
    const data = await getTagData(slug);

    if (!data) {
        notFound();
    }

    const { tag } = data;
    const relatedTags = await getRelatedTags(slug);

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Hero Section */}
            <section
                className="relative py-16 overflow-hidden"
                style={{ backgroundColor: `${tag.color}15` }}
            >
                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center max-w-3xl mx-auto">
                        {/* Tag Icon */}
                        {tag.icon && (
                            <span className="text-6xl mb-4 block">{tag.icon}</span>
                        )}

                        {/* Tag Name */}
                        <h1
                            className="text-4xl md:text-5xl font-bold mb-4"
                            style={{ color: tag.color }}
                        >
                            #{tag.name}
                        </h1>

                        {/* Description */}
                        {tag.description && (
                            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                                {tag.description}
                            </p>
                        )}

                        {/* Stats */}
                        <div className="flex items-center justify-center gap-4">
                            <div
                                className="px-4 py-2 rounded-full font-semibold"
                                style={{ backgroundColor: `${tag.color}30`, color: tag.color }}
                            >
                                📰 {tag.post_count} bài viết
                            </div>
                        </div>
                    </div>
                </div>

                {/* Decorative Background */}
                <div
                    className="absolute inset-0 opacity-5"
                    style={{
                        background: `radial-gradient(circle at 50% 0%, ${tag.color}, transparent 70%)`,
                    }}
                />
            </section>

            <div className="container mx-auto px-4 py-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main Content - Posts List */}
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <span style={{ color: tag.color }}>📚</span>
                            Tất cả bài viết
                        </h2>

                        <TagPostsList slug={slug} tagColor={tag.color} />
                    </div>

                    {/* Sidebar */}
                    <aside className="lg:w-80 space-y-8">
                        {/* Related Tags */}
                        {relatedTags.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    🔗 Tags liên quan
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {relatedTags.map((relatedTag) => (
                                        <Link
                                            key={relatedTag.id}
                                            href={`/tag/${relatedTag.slug}`}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-all hover:scale-105"
                                            style={{
                                                backgroundColor: `${relatedTag.color}20`,
                                                color: relatedTag.color,
                                            }}
                                        >
                                            {relatedTag.icon && <span>{relatedTag.icon}</span>}
                                            <span>{relatedTag.name}</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Popular Tags */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                🔥 Tags phổ biến
                            </h3>
                            <TagCloud variant="list" limit={10} />
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
}
