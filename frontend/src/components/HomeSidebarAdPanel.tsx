"use client";

import AdBanner from "@/components/AdBanner";
import { useAds } from "@/contexts/AdsContext";

export default function HomeSidebarAdPanel() {
    const { getAdsByPosition, isLoading } = useAds();
    const ads = getAdsByPosition("sidebar");

    if (isLoading || ads.length === 0) {
        return null;
    }

    return (
        <div className="rounded-[2rem] border border-border/80 bg-card p-6">
            <h2 className="text-[11px] font-black uppercase tracking-[0.34em] text-primary">Quang cao</h2>
            <div className="mt-5">
                <AdBanner position="sidebar" />
            </div>
        </div>
    );
}
