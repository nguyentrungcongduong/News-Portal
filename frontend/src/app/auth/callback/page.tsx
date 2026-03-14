'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const token = searchParams.get('token');
        const error = searchParams.get('error');
        const userId = searchParams.get('user_id');

        if (error) {
            setStatus('error');
            setMessage(decodeURIComponent(error));
            return;
        }

        if (token) {
            // Save token to localStorage
            localStorage.setItem('auth_token', token);

            // Optionally fetch user info
            if (userId) {
                localStorage.setItem('user_id', userId);
            }

            setStatus('success');
            setMessage('Đăng nhập thành công! Đang chuyển hướng...');

            // Redirect to home after a short delay
            setTimeout(() => {
                router.push('/');
            }, 1500);
        } else {
            setStatus('error');
            setMessage('Không tìm thấy token xác thực.');
        }
    }, [searchParams, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="max-w-md w-full mx-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
                    {status === 'loading' && (
                        <>
                            <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-6" />
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                Đang xử lý...
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400">
                                Vui lòng chờ trong giây lát
                            </p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                Thành công!
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400">
                                {message}
                            </p>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                Đăng nhập thất bại
                            </h1>
                            <p className="text-red-500 dark:text-red-400 mb-6">
                                {message}
                            </p>
                            <div className="space-y-3">
                                <Link
                                    href="/dang-nhap"
                                    className="block w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Thử lại
                                </Link>
                                <Link
                                    href="/"
                                    className="block w-full px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Về trang chủ
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
