import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8010',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    }
});

// Add interceptor to attach Bearer token
api.interceptors.request.use(config => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 responses
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            console.warn('Unauthorized access (401), checking if on login page...');
            
            // Only redirect and clear if we are NOT on the login page to avoid loops
            if (!window.location.pathname.includes('/login')) {
                console.warn('Redirecting to login...');
                localStorage.removeItem('auth_token');
                window.location.href = '/login';
            } else {
                console.warn('Already on login page, staying here.');
                localStorage.removeItem('auth_token'); // Still clear the bad token
            }
        }
        return Promise.reject(error);
    }
);

export default api;
