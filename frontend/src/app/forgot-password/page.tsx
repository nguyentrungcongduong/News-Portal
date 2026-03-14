'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Placeholder for real API call
        setTimeout(() => {
            setStatus({ type: 'success', text: 'Nếu email tồn tại trong hệ thống, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu.' });
            setLoading(false);
        }, 1000);
    };

    return (
        <div className="flex min-h-[80vh] items-center justify-center px-4">
            <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-xl">
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold">Quên mật khẩu</h1>
                    <p className="mt-2 text-sm text-zinc-500">Nhập email của bạn để nhận link đặt lại mật khẩu</p>
                </div>

                {status.text && (
                    <div className={`p-4 rounded-lg mb-6 ${status.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                        {status.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none focus:border-blue-500"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-blue-600 py-3 text-sm font-bold text-white transition-all hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Đang xử lý...' : 'Gửi yêu cầu'}
                    </button>

                    <div className="mt-4 text-center text-xs text-zinc-500">
                        <Link href="/login" className="text-blue-600 hover:underline">Quay lại đăng nhập</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
