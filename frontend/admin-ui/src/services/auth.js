import api from './api';

export const login = async (credentials) => {
    return api.post('/api/auth/login', credentials);
};

export const register = async (data) => {
    return api.post('/api/auth/register', data);
};

export const logout = () => api.post('/api/auth/logout');

export const getMe = () => api.get('/api/auth/me');
