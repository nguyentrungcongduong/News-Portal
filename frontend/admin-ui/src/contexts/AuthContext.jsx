import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMe, login as loginApi, logout as logoutApi } from '../services/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const checkAuth = async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            console.log('Checking auth with token:', token.substring(0, 10) + '...');
            const response = await getMe();
            console.log('checkAuth success:', response.data.user);
            setUser(response.data.user);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('checkAuth failed:', error.response?.status, error.message);
            localStorage.removeItem('auth_token');
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = async (credentials) => {
        const response = await loginApi(credentials);
        const { token, user } = response.data;
        
        // Store token in localStorage
        localStorage.setItem('auth_token', token);
        
        setUser(user);
        setIsAuthenticated(true);
        return response;
    };

    const logout = async () => {
        try {
            await logoutApi();
        } catch (e) {
            console.error(e);
        } finally {
            localStorage.removeItem('auth_token');
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
