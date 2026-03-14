// Wrapper for fetch that automatically includes Bearer token
export const authFetch = async (url, options = {}) => {
    const token = localStorage.getItem('auth_token');
    
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
    };
    
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
        ...options,
        headers,
    });
    
    // Auto logout on 401
    if (response.status === 401) {
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
    }
    
    return response;
};
