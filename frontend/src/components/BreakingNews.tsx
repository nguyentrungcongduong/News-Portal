'use strict';

import Link from 'next/link';

interface Notification {
    id: number | string;
    title: string;
    link?: string;
}

export default function BreakingNews({ news }: { news: Notification[] }) {
    if (!news || news.length === 0) return null;

    return (
        <div className="bg-red-600 text-white overflow-hidden h-10 flex items-center shadow-lg sticky top-16 z-40">
            <div className="px-4 bg-red-700 h-full flex items-center font-bold whitespace-nowrap z-10 shrink-0">
                ⚡ TIN NÓNG
            </div>
            <div className="flex-1 relative overflow-hidden h-full flex items-center">
                <div className="animate-marquee whitespace-nowrap flex gap-12 items-center">
                    {news.map((item) => (
                        <span key={item.id} className="inline-flex items-center hover:underline cursor-pointer">
                            {item.link ? (
                                <Link href={item.link}>{item.title}</Link>
                            ) : (
                                <span>{item.title}</span>
                            )}
                        </span>
                    ))}
                    {/* Duplicate news for seamless loop if needed, but for now simple marquee */}
                    {news.map((item) => (
                        <span key={`dup-${item.id}`} className="inline-flex items-center hover:underline cursor-pointer">
                            {item.link ? (
                                <Link href={item.link}>{item.title}</Link>
                            ) : (
                                <span>{item.title}</span>
                            )}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
