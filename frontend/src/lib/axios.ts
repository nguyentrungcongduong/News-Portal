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

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
    timeout: 30000, // 30 second timeout
});

// Add Bearer token interceptor
api.interceptors.request.use(config => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Handle errors
api.interceptors.response.use(
    response => response,
    error => {
        // Log detailed error info for debugging
        if (error.message === 'Network Error') {
            console.warn(`Network Error: Cannot reach ${API_BASE_URL}`);
            console.warn('Make sure the Laravel backend is running:');
            console.warn('  cd news-cms && php artisan serve --port=8010');
        }

        if (error.response?.status === 401 && typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;

