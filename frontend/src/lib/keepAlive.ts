/**
 * Keep-Alive Utility for Render Free Tier
 *
 * Render free-tier services spin down after ~15 minutes of inactivity.
 * This utility pings the backend's /api/health endpoint every 10 minutes
 * to prevent cold starts, so users don't experience 60-90 second timeouts.
 *
 * Only runs in the browser (not during SSR).
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8010';
const PING_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes
const HEALTH_ENDPOINT = `${API_BASE_URL}/api/health`;

let intervalId: ReturnType<typeof setInterval> | null = null;

async function ping() {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout for ping itself
        const res = await fetch(HEALTH_ENDPOINT, {
            method: 'GET',
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (res.ok) {
            console.debug('[keep-alive] Backend is warm ✓');
        }
    } catch {
        // Silently ignore — ping failure is non-critical
        console.debug('[keep-alive] Ping failed (backend may be asleep)');
    }
}

/**
 * Start pinging the backend at a fixed interval to prevent cold starts.
 * Safe to call multiple times — only one interval will run at a time.
 */
export function startKeepAlive() {
    if (typeof window === 'undefined') return; // SSR guard
    if (intervalId !== null) return;           // Already running

    // Ping immediately on start (wakes up backend as soon as user loads page)
    ping();

    intervalId = setInterval(ping, PING_INTERVAL_MS);
    console.debug(`[keep-alive] Started — pinging ${HEALTH_ENDPOINT} every ${PING_INTERVAL_MS / 60000} min`);
}

/**
 * Stop the keep-alive interval (e.g., on page unload).
 */
export function stopKeepAlive() {
    if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
        console.debug('[keep-alive] Stopped');
    }
}
