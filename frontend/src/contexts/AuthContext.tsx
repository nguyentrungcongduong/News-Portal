'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/axios';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    token: string | null;
    login: (credentials: any) => Promise<{ user: User, requires_password_change: boolean }>;
    register: (data: any) => Promise<User>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [token, setToken] = useState<string | null>(null);

    const checkAuth = async () => {
        const storedToken = localStorage.getItem('auth_token');
        if (!storedToken) {
            setIsLoading(false);
            return;
        }
        setToken(storedToken);

        try {
            const response = await api.get('/api/auth/me');
            const userData = response.data.user;

            if (userData.is_blocked) {
                localStorage.removeItem('auth_token');
                setUser(null);
                setToken(null);
                setIsAuthenticated(false);
            } else {
                setUser(userData);
                setIsAuthenticated(true);
            }
        } catch (error) {
            localStorage.removeItem('auth_token');
            setUser(null);
            setToken(null);
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = async (credentials: any) => {
        const response = await api.post('/api/auth/login', credentials);
        const { token: receivedToken, user: receivedUser, requires_password_change } = response.data;

        localStorage.setItem('auth_token', receivedToken);
        setUser(receivedUser);
        setToken(receivedToken);
        setIsAuthenticated(true);
        return { user: receivedUser, requires_password_change };
    };

    const register = async (data: any) => {
        const response = await api.post('/api/auth/register', data);
        const { token: receivedToken, user: receivedUser } = response.data;

        localStorage.setItem('auth_token', receivedToken);
        setUser(receivedUser);
        setToken(receivedToken);
        setIsAuthenticated(true);
        return receivedUser;
    };

    const logout = async () => {
        localStorage.removeItem('auth_token');
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
