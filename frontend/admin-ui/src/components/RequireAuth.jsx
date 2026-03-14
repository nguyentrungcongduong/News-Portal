import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';
import { Spin } from 'antd';

const RequireAuth = () => {
    const { user, isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Spin size="large" /></div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // ❌ Author KHÔNG được vào Admin Panel - chỉ Admin và Editor
    if (user && user.role === 'author') {
        const publicUrl = window.location.origin.includes('admin-beta') 
            ? window.location.origin.replace('admin-beta', 'public-gray') + '/author'
            : 'https://news-portal-public-gray.vercel.app/author';
        window.location.href = publicUrl;
        return null;
    }

    // Chặn các role khác không phải admin/editor
    if (user && user.role !== 'admin' && user.role !== 'editor') {
        return (
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
                <h2>403 - Unauthorized</h2>
                <p>Bạn không có quyền truy cập trang quản trị.</p>
                <a href="/login" onClick={() => localStorage.removeItem('auth_token')}>Quay lại đăng nhập</a>
            </div>
        );
    }

    return <Outlet />;
};

export default RequireAuth;
