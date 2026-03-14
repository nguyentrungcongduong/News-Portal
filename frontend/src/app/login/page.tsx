'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SocialLoginButtons from '@/components/SocialLoginButtons';

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { user, requires_password_change } = await login({ email, password });

            if (requires_password_change) {
                router.push('/change-password');
                return;
            }

            switch (user.role) {
                case 'admin':
                case 'editor':
                    window.location.href = 'http://localhost:5173';
                    break;
                case 'author':
                    router.push('/author');
                    break;
                default:
                    router.push('/');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-[80vh] items-center justify-center px-4">
            <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-black tracking-tighter text-black dark:text-white">
                        NEWS<span className="text-blue-600">PORTAL</span>
                    </h1>
                    <p className="mt-2 text-sm text-zinc-500">Đăng nhập để bình luận và quản lý tài khoản</p>
                </div>

                {/* Social Login Buttons */}
                <SocialLoginButtons disabled={loading} />

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-black outline-none transition-all focus:border-blue-500 focus:bg-white dark:border-zinc-800 dark:bg-black dark:text-white dark:focus:border-blue-500 dark:focus:bg-zinc-900"
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Mật khẩu"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-black outline-none transition-all focus:border-blue-500 focus:bg-white dark:border-zinc-800 dark:bg-black dark:text-white dark:focus:border-blue-500 dark:focus:bg-zinc-900"
                            required
                        />
                        <div className="mt-1 text-right">
                            <Link href="/forgot-password" className="text-[10px] text-zinc-400 hover:text-blue-600">Quên mật khẩu?</Link>
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-500">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-blue-600 py-3 text-sm font-bold text-white transition-all hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                    </button>

                    <div className="mt-4 text-center text-xs text-zinc-500">
                        Chưa có tài khoản? <Link href="/register" className="text-blue-600 hover:underline">Đăng ký ngay</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
