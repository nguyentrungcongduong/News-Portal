import api from './api';

export const getMenus = () => api.get('/api/admin/menus');
export const getMenu = (id) => api.get(`/api/admin/menus/${id}`);
export const createMenu = (data) => api.post('/api/admin/menus', data);
export const updateMenu = (id, data) => api.put(`/api/admin/menus/${id}`, data);
export const deleteMenu = (id) => api.delete(`/api/admin/menus/${id}`);
export const updateMenuItems = (id, items) => api.post(`/api/admin/menus/${id}/items`, { items });

// Resources for selection
export const getPages = (params) => api.get('/api/admin/pages', { params });
export const getCategories = () => api.get('/api/admin/categories');
