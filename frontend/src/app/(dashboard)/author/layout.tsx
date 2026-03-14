'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import {
    DashboardOutlined,
    FileTextOutlined,
    PlusCircleOutlined,
    LogoutOutlined,
    UserOutlined,
    HomeOutlined
} from '@ant-design/icons';

export default function AuthorLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // ❌ Author workspace CHỈ dành cho Author - Admin/Editor phải vào admin panel
        if (!isLoading) {
            if (!user) {
                router.push('/login');
            } else if (user.role !== 'author') {
                // Admin/Editor redirect về admin panel
                if (user.role === 'admin' || user.role === 'editor') {
                    window.location.href = 'http://localhost:5173';
                } else {
                    router.push('/login');
                }
            }
        }
    }, [user, isLoading, router]);

    if (isLoading || !user) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    const menuItems = [
        { label: 'Tổng quan', href: '/author', icon: <DashboardOutlined /> },
        { label: 'Bài viết của tôi', href: '/author/posts', icon: <FileTextOutlined /> },
        { label: 'Viết bài mới', href: '/author/posts/create', icon: <PlusCircleOutlined /> },
        { label: 'Hồ sơ cá nhân', href: '/author/profile', icon: <UserOutlined /> },
    ];

    return (
        <div className="flex min-h-screen bg-zinc-50 dark:bg-black">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                <div className="mb-8 px-2">
                    <Link href="/" className="text-xl font-black tracking-tighter text-black dark:text-white">
                        NEWS<span className="text-blue-600">PORTAL</span>
                        <span className="ml-2 rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-zinc-500 dark:bg-zinc-800">Author</span>
                    </Link>
                </div>

                <nav className="space-y-1">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive
                                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                                    : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
                                    }`}
                            >
                                <span className="text-lg flex items-center">{item.icon}</span>
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-4 left-4 right-4">
                    <button
                        onClick={() => logout()}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-900/10"
                    >
                        <LogoutOutlined className="text-lg" />
                        Đăng xuất
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="ml-64 w-full p-8">
                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-black dark:text-white">
                            Chào buổi sáng, {user.name} 👋
                        </h1>
                        <p className="text-sm text-zinc-500">Quản lý nội dung và hiệu quả bài viết của bạn.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link href="/" className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800">
                            <HomeOutlined />
                            Về trang chủ
                        </Link>
                    </div>
                </header>

                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
                    {children}
                </div>
            </main>
        </div>
    );
}
