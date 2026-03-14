'use client';

import { useEffect, useState } from 'react';
import BreakingNews from './BreakingNews';
import api from '@/lib/axios';

export default function GlobalBreakingNews() {
    const [news, setNews] = useState([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Simple polling every 60s to refresh breaking news
        const fetchNews = () => {
            api.get('/api/public/breaking-news')
                .then(res => setNews(res.data))
                .catch(err => console.error('Failed to load breaking news', err));
        };

        fetchNews();
        const interval = setInterval(fetchNews, 60000);

        // Listen for Realtime Events
        const handleRealtime = (e: any) => {
            console.log('Realtime breaking news received:', e.detail);
            fetchNews(); // Reload immediately
        };
        window.addEventListener('breaking_news_received', handleRealtime);

        return () => {
            clearInterval(interval);
            window.removeEventListener('breaking_news_received', handleRealtime);
        };
    }, []);

    if (!mounted || news.length === 0) return null;

    return <BreakingNews news={news} />;
}
