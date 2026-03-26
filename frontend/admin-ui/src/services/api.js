import axios from 'axios';

// Render free-tier cold starts can take 50-90 seconds.
// We use a generous timeout + automatic retry to handle this gracefully.
const TIMEOUT_MS = 90000; // 90 seconds
const MAX_RETRIES = 2;

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8010',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
    timeout: TIMEOUT_MS,
});

// Add interceptor to attach Bearer token + track retry count
api.interceptors.request.use(config => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    config._retryCount = config._retryCount ?? 0;
    return config;
});

// Handle errors — with automatic retry for cold-start timeouts.
// NOTE: When Render is cold-starting, the XHR gets no response at all.
// Browsers then report this as a "CORS" error (missing header) rather than
// a timeout. The real fix is to retry until the server wakes up.
api.interceptors.response.use(
    response => response,
    async error => {
        const config = error.config;

        // Retry on timeout (ECONNABORTED) or network errors — NOT on 4xx/5xx
        const isRetryable =
            error.code === 'ECONNABORTED' ||
            error.message === 'Network Error';

        if (isRetryable && config && config._retryCount < MAX_RETRIES) {
            config._retryCount += 1;
            const delayMs = config._retryCount * 3000; // 3s, then 6s
            console.warn(
                `[Admin API] Request timed out — backend may be waking up (Render cold start). ` +
                `Retry ${config._retryCount}/${MAX_RETRIES} in ${delayMs / 1000}s...`
            );
            await new Promise(resolve => setTimeout(resolve, delayMs));
            return api(config);
        }

        // Handle 401 — redirect to login
        if (error.response?.status === 401) {
            console.warn('[Admin API] Unauthorized (401)');
            if (!window.location.pathname.includes('/login')) {
                localStorage.removeItem('auth_token');
                window.location.href = '/login';
            } else {
                localStorage.removeItem('auth_token');
            }
        }

        return Promise.reject(error);
    }
);

export default api;
