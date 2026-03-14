"use client";

import { useState, useEffect, useMemo } from "react";
import api from "@/lib/axios";
import { useAds } from "@/contexts/AdsContext";

interface AdBannerProps {
    position: "header" | "sidebar" | "in_article" | "footer";
    className?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8010';

export default function AdBanner({ position, className = "" }: AdBannerProps) {
    const { getAdsByPosition, isLoading } = useAds();
    const [activeIndex, setActiveIndex] = useState(0);

    // Get ads for this position from the central store
    const ads = useMemo(() => getAdsByPosition(position), [getAdsByPosition, position]);

    // Carousel Logic
    useEffect(() => {
        if (ads.length > 1) {
            const interval = setInterval(() => {
                setActiveIndex((prev) => (prev + 1) % ads.length);
            }, 6000); // Rotate every 6 seconds
            return () => clearInterval(interval);
        }
    }, [ads.length]);

    const handleTrackClick = async (adId: number) => {
        try {
            await api.post(`/api/public/ads/${adId}/click`);
        } catch (error) {
            // Silent fail
        }
    };

    if (isLoading || ads.length === 0) return null;

    // Resolve image URL
    const getFullImageUrl = (url: string) => {
        if (!url) return "";
        if (url.startsWith('http')) return url;
        return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
    };

    // Position-specific styling
    const getContainerStyles = () => {
        switch (position) {
            case 'header':
                return 'h-[80px] md:h-[100px] w-full bg-zinc-50 dark:bg-zinc-950/50';
            case 'sidebar':
                return 'aspect-square md:aspect-[3/4] w-full bg-zinc-50 dark:bg-zinc-950/50';
            case 'footer':
                return 'h-[100px] md:h-[120px] w-full bg-zinc-50 dark:bg-zinc-950/50';
            case 'in_article':
                return 'h-[200px] md:h-[250px] w-full bg-zinc-50 dark:bg-zinc-950/50';
            default:
                return 'min-h-[100px] w-full bg-zinc-50 dark:bg-zinc-950/50';
        }
    };

    return (
        <section
            aria-label={`Advertisement - ${position}`}
            className={`relative flex flex-col items-center ${className}`}
        >
            {/* Label for SEO/UX Transparency */}
            <div className="w-full flex justify-center mb-2">
                <span className="text-[9px] font-serif font-bold uppercase tracking-[0.3em] text-slate-400 dark:text-zinc-600">
                    Advertisement
                </span>
            </div>

            <div className={`relative w-full overflow-hidden border border-slate-100 dark:border-zinc-900 shadow-sm transition-all duration-500 ${getContainerStyles()}`}>
                {ads.map((ad, index) => (
                    <div
                        key={ad.id}
                        className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${index === activeIndex ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                            }`}
                    >
                        {ad.type === "image" ? (
                            <a
                                href={ad.link || "#"}
                                target="_blank"
                                rel="sponsored nofollow noopener noreferrer"
                                onClick={() => handleTrackClick(ad.id)}
                                className="block w-full h-full"
                            >
                                <img
                                    src={getFullImageUrl(ad.image_url)}
                                    alt={ad.name}
                                    className="w-full h-full object-contain md:object-cover transition-transform duration-700 hover:scale-[1.01]"
                                    loading="lazy"
                                />
                            </a>
                        ) : (
                            <div
                                dangerouslySetInnerHTML={{ __html: ad.html_code || "" }}
                                className="w-full h-full flex items-center justify-center p-4 overflow-hidden"
                            />
                        )}
                    </div>
                ))}

                {/* Carousel Indicators */}
                {ads.length > 1 && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                        {ads.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setActiveIndex(index)}
                                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${index === activeIndex
                                        ? "bg-primary w-4"
                                        : "bg-slate-300 dark:bg-zinc-700 hover:bg-slate-400"
                                    }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Subtle disclaimer below for extreme transparency */}
            <p className="mt-1.5 text-[8px] text-slate-300 dark:text-zinc-700 italic text-center w-full">
                Supporting independent journalism since 2026.
            </p>
        </section>
    );
}
