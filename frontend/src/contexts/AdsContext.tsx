"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';

interface Ad {
    id: number;
    name: string;
    image_url: string;
    link: string;
    type: string;
    position: string;
    html_code?: string;
}

interface AdsContextType {
    ads: Ad[];
    isLoading: boolean;
    getAdsByPosition: (position: string) => Ad[];
}

const AdsContext = createContext<AdsContextType | undefined>(undefined);

export function AdsProvider({ children }: { children: React.ReactNode }) {
    const [ads, setAds] = useState<Ad[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchAllAds = useCallback(async () => {
        try {
            // Fetch all active ads in one single request
            const response = await api.get('/api/public/ads');
            if (Array.isArray(response.data)) {
                setAds(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch ads bundle:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllAds();
    }, [fetchAllAds]);

    const getAdsByPosition = useCallback((position: string) => {
        return ads.filter(ad => ad.position === position);
    }, [ads]);

    return (
        <AdsContext.Provider value={{ ads, isLoading, getAdsByPosition }}>
            {children}
        </AdsContext.Provider>
    );
}

export function useAds() {
    const context = useContext(AdsContext);
    if (context === undefined) {
        throw new Error('useAds must be used within an AdsProvider');
    }
    return context;
}
