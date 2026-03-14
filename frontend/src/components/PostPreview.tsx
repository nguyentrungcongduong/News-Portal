'use client';

import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import Link from 'next/link';

interface PostPreviewProps {
    title: string;
    summary?: string;
    content: string;
    thumbnail?: string;
    categories?: Array<{ id: number; name: string; slug: string }>;
    preview?: boolean;
}

const PostPreview = ({ 
    title, 
    summary, 
    content, 
    thumbnail, 
    categories = [],
    preview = false 
}: PostPreviewProps) => {
    const { user } = useAuth();

    return (
        <article className="max-w-4xl mx-auto">
            {/* Header */}
            <header className="mb-8">
                {categories.length > 0 && (
                    <div className="flex gap-2 mb-4">
                        {categories.map((cat) => (
                            <Link
                                key={cat.id}
                                href={`/category/${cat.slug}`}
                                className="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full hover:bg-blue-700 transition"
                            >
                                {cat.name}
                            </Link>
                        ))}
                    </div>
                )}

                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-black dark:text-white mb-4 leading-tight">
                    {title}
                </h1>

                {summary && (
                    <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
                        {summary}
                    </p>
                )}

                <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
                    <span className="font-medium">{user?.name || 'Tác giả'}</span>
                    <span>•</span>
                    <span>{new Date().toLocaleDateString('vi-VN')}</span>
                    {preview && (
                        <>
                            <span>•</span>
                            <span className="bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400 px-2 py-1 rounded text-xs font-bold">
                                XEM TRƯỚC
                            </span>
                        </>
                    )}
                </div>
            </header>

            {/* Thumbnail */}
            {thumbnail && (
                <div className="relative mb-12 aspect-video w-full overflow-hidden rounded-2xl">
                    <img
                        src={thumbnail}
                        alt={title}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            {/* Content */}
            <div
                className="prose prose-lg max-w-none dark:prose-invert prose-blue prose-img:rounded-2xl prose-headings:font-black prose-a:text-blue-600 prose-blockquote:border-blue-600"
                dangerouslySetInnerHTML={{ __html: content }}
            />

            {preview && (
                <div className="mt-12 p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        <strong>Chế độ xem trước:</strong> Đây là cách bài viết sẽ hiển thị trên trang web. 
                        Bình luận, quảng cáo và các tính năng khác sẽ được hiển thị khi bài viết được xuất bản.
                    </p>
                </div>
            )}
        </article>
    );
};

export default PostPreview;

