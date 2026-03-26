'use client';

import { useEffect } from 'react';
import { startKeepAlive, stopKeepAlive } from '@/lib/keepAlive';

/**
 * Mounts the keep-alive ping loop when the app is loaded.
 * Automatically pings the backend every 10 minutes so Render's
 * free-tier service doesn't fall asleep between user visits.
 */
export default function KeepAlive() {
    useEffect(() => {
        startKeepAlive();
        return () => stopKeepAlive();
    }, []);

    return null; // Renders nothing — side-effect only
}
