'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UserMenu() {
    const { user, isAuthenticated, isLoading, logout } = useAuth();
    const router = useRouter();

    if (isLoading) return <div className="h-8 w-20 animate-pulse bg-zinc-200 rounded-full dark:bg-zinc-800"></div>;

    if (!isAuthenticated) {
        return (
            <Link
                href="/login"
                className="hidden rounded-full bg-black px-5 py-2 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-blue-600 dark:bg-white dark:text-black sm:block"
            >
                Đăng nhập
            </Link>
        );
    }

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    return (
        <div className="flex items-center gap-2 sm:gap-4">
            {/* Common links based on roles */}
            {(user?.role === 'admin' || user?.role === 'editor') && (
                <a
                    href="http://localhost:8010"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden lg:flex items-center gap-1.5 text-[10px] font-black uppercase tracking-tight text-white bg-blue-600 px-3 py-1.5 rounded-full hover:bg-blue-700 transition-all shadow-sm"
                >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Quản trị CMS
                </a>
            )}

            {user?.role === 'author' && (
                <Link
                    href="/author"
                    className="hidden lg:flex items-center gap-1.5 text-[10px] font-black uppercase tracking-tight text-white bg-indigo-600 px-3 py-1.5 rounded-full hover:bg-indigo-700 transition-all shadow-sm"
                >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    Kênh Tác giả
                </Link>
            )}

            {user?.role === 'user' && (
                <Link
                    href="/become-author"
                    className="hidden lg:block text-[10px] font-black uppercase tracking-tight text-blue-600 border-2 border-blue-600 px-3 py-1 rounded-full hover:bg-blue-600 hover:text-white transition-all"
                >
                    Đăng ký viết bài
                </Link>
            )}

            <div className="flex items-center gap-2 border-l border-zinc-200 dark:border-zinc-800 pl-4 ml-2">
                <span className="hidden sm:inline text-sm font-black text-red-600 dark:text-red-500">{user?.name}</span>
                <button
                    onClick={handleLogout}
                    className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                    title="Đăng xuất"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </button>
            </div>
        </div>
    );
}
