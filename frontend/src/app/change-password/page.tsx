'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import axios from '@/lib/axios';

export default function ChangePasswordPage() {
    const { user, token } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.new_password !== formData.confirm_password) {
            setError('Mật khẩu mới không khớp.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await axios.post('/api/auth/change-password', formData);
            alert('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
            // Clear auth and redirect
            window.location.href = '/login';
        } catch (err: any) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-[80vh] items-center justify-center px-4">
            <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-xl">
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold">Đổi mật khẩu</h1>
                    <p className="mt-2 text-sm text-zinc-500">Bạn cần đổi mật khẩu trong lần đầu đăng nhập</p>
                </div>

                {error && <p className="mb-4 text-sm text-red-500 font-medium">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">Mật khẩu hiện tại</label>
                        <input
                            type="password"
                            required
                            className="w-full rounded-lg border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                            value={formData.current_password}
                            onChange={e => setFormData({ ...formData, current_password: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">Mật khẩu mới</label>
                        <input
                            type="password"
                            required
                            minLength={8}
                            className="w-full rounded-lg border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                            value={formData.new_password}
                            onChange={e => setFormData({ ...formData, new_password: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">Xác nhận mật khẩu mới</label>
                        <input
                            type="password"
                            required
                            className="w-full rounded-lg border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                            value={formData.confirm_password}
                            onChange={e => setFormData({ ...formData, confirm_password: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-blue-600 py-3 text-sm font-bold text-white transition-all hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Đang xử lý...' : 'Cập nhật mật khẩu'}
                    </button>
                </form>
            </div>
        </div>
    );
}
