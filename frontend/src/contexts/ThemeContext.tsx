'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ConfigProvider, theme } from 'antd';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    themeMode: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [themeMode, setThemeMode] = useState<Theme>('light');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as Theme | null;
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        const initial = savedTheme || systemTheme;

        setThemeMode(initial);
        document.documentElement.classList.toggle('dark', initial === 'dark');
        setMounted(true);
    }, []);

    const toggleTheme = () => {
        const newTheme = themeMode === 'light' ? 'dark' : 'light';
        setThemeMode(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
    };

    const { defaultAlgorithm, darkAlgorithm } = theme;

    return (
        <ThemeContext.Provider value={{ themeMode, toggleTheme }}>
            <ConfigProvider
                theme={{
                    algorithm: themeMode === 'dark' ? darkAlgorithm : defaultAlgorithm,
                    token: {
                        colorPrimary: '#2563eb', // Blue-600
                        borderRadius: 12,
                    },
                }}
            >
                {children}
            </ConfigProvider>
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within ThemeProvider');
    return context;
};
