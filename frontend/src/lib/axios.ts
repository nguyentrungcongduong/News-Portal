import axios from 'axios';

// Use environment variable if available, fallback to default
const getBaseUrl = () => {
    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    if (envUrl && envUrl.startsWith('http')) {
        return envUrl;
    }
    return 'http://127.0.0.1:8010';
};

const API_BASE_URL = getBaseUrl();

// Render free tier cold starts can take 50-90 seconds.
// We use a generous timeout + automatic retry to handle this gracefully.
const TIMEOUT_MS = 90000; // 90 seconds
const MAX_RETRIES = 2;

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
    timeout: TIMEOUT_MS,
});

// Add Bearer token interceptor
api.interceptors.request.use(config => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    // Track retry count on the config object
    (config as any)._retryCount = (config as any)._retryCount ?? 0;
    return config;
});

// Handle errors — with automatic retry for cold-start timeouts
api.interceptors.response.use(
    response => response,
    async error => {
        const config = error.config as any;

        // Retry on timeout (ECONNABORTED) or network errors — NOT on 4xx/5xx
        const isRetryable =
            error.code === 'ECONNABORTED' ||
            error.message === 'Network Error';

        if (isRetryable && config && config._retryCount < MAX_RETRIES) {
            config._retryCount += 1;
            const delayMs = config._retryCount * 3000; // 3s, then 6s backoff
            console.warn(
                `[API] Request timed out — backend may be waking up (Render cold start). ` +
                `Retry ${config._retryCount}/${MAX_RETRIES} in ${delayMs / 1000}s...`
            );
            await new Promise(resolve => setTimeout(resolve, delayMs));
            return api(config);
        }

        // Log detailed error info for debugging
        if (error.message === 'Network Error') {
            console.warn(`[API] Network Error: Cannot reach ${API_BASE_URL}`);
            if (API_BASE_URL.includes('127.0.0.1')) {
                console.warn('Make sure the Laravel backend is running:');
                console.warn('  cd news-cms && php artisan serve --port=8010');
            }
        }

        if (error.response?.status === 401 && typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);

export default api;
