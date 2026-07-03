'use strict';

import Link from 'next/link';

interface Notification {
    id: number | string;
    title: string;
    link?: string;
}

export default function BreakingNews({ news }: { news: Notification[] }) {
    if (!news || news.length === 0) {
        return null;
    }

    return (
        <section className="sticky top-0 z-[140] border-y border-red-500/15 bg-slate-950/95 text-white shadow-[0_18px_40px_-24px_rgba(15,23,42,0.85)] backdrop-blur-md">
            <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-4 px-4 md:px-6">
                <div className="relative z-10 flex shrink-0 items-center gap-3 rounded-full border border-red-400/20 bg-red-500/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.32em] text-red-200">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-400" />
                    </span>
                    Tin nóng
                </div>

                <div className="relative min-w-0 flex-1 overflow-hidden">
                    <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent" />
                    <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-slate-950 via-slate-950/85 to-transparent" />

                    <div className="animate-marquee flex min-w-max items-center gap-10 whitespace-nowrap pr-10 text-sm font-semibold text-slate-100 hover:[animation-play-state:paused] md:text-[15px]">
                        {[...news, ...news].map((item, index) => (
                            <span key={`${item.id}-${index}`} className="inline-flex items-center gap-10">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-400/80" />
                                {item.link ? (
                                    <Link
                                        href={item.link}
                                        className="transition-colors duration-200 hover:text-red-300"
                                    >
                                        {item.title}
                                    </Link>
                                ) : (
                                    <span className="text-slate-100/95">{item.title}</span>
                                )}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
