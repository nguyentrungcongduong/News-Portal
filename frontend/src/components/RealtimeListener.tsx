'use client';

import { useEffect } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://127.0.0.1:3001';

export default function RealtimeListener() {
    useEffect(() => {
        const socket = io(SOCKET_URL);

        socket.on('connect', () => {
            console.log('Connected to socket server');
            socket.emit('join_global');
        });

        socket.on('breaking_news', (data) => {
            // Create custom Toast or trigger update
            // For now, simpler implementation details might handle state inside components
            // But we can dispatch a custom DOM event for other components to listen
            const event = new CustomEvent('breaking_news_received', { detail: data });
            window.dispatchEvent(event);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    return null;
}
