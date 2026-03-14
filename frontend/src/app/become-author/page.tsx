'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import axios from '@/lib/axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AuthorRequestPage() {
    const { user, token } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<any>(null);
    const [formData, setFormData] = useState({
        bio: '',
        portfolio_url: '',
        experience: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (!token && !loading) {
            router.push('/login?redirect=/become-author');
            return;
        }
        fetchRequestStatus();
    }, [token]);

    const fetchRequestStatus = async () => {
        try {
            const res = await axios.get('/api/author-requests/status');
            setStatus(res.data.data);
        } catch (error) {
            console.error('Failed to fetch status');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            await axios.post('/api/author-requests', formData);
            setMessage({ type: 'success', text: 'Yêu cầu của bạn đã được gửi thành công!' });
            fetchRequestStatus();
        } catch (error: any) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.'
            });
        } finally {
            setLoading(false);
        }
    };

    if (status && (status.status === 'pending' || status.status === 'approved')) {
        return (
            <div className="flex-grow flex items-center justify-center p-4 bg-background">
                <div className="w-full max-w-md bg-card border border-border rounded-[2.5rem] shadow-2xl p-8 md:p-10 text-center animate-in fade-in zoom-in duration-500">
                    <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg ${status.status === 'approved'
                        ? 'bg-emerald-500/10 text-emerald-500 shadow-emerald-500/10'
                        : 'bg-primary/10 text-primary shadow-primary/10'
                        }`}>
                        {status.status === 'approved' ? (
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                        ) : (
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        )}
                    </div>

                    <h1 className="text-2xl font-black mb-3 text-foreground tracking-tight">
                        {status.status === 'approved' ? 'Chào mừng Tác giả!' : 'Đang xử lý hồ sơ'}
                    </h1>

                    <p className="text-muted-foreground mb-8 leading-relaxed font-medium">
                        {status.status === 'approved'
                            ? 'Bạn đã chính thức trở thành thành viên của đội ngũ News Portal. Bắt đầu sáng tạo ngay!'
                            : 'Yêu cầu của bạn đang được Ban biên tập xem xét. Chúng tôi sẽ thông báo cho bạn qua email sớm nhất.'}
                    </p>

                    {status.status === 'approved' ? (
                        <Link
                            href="/author"
                            className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-primary/20"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            Viết bài ngay
                        </Link>
                    ) : (
                        <Link
                            href="/"
                            className="text-xs font-bold text-primary hover:underline uppercase tracking-widest"
                        >
                            Quay lại Trang chủ
                        </Link>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="flex-grow flex items-center justify-center p-4 bg-background py-16">
            <div className="w-full max-w-lg bg-card border border-border rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="p-8 md:p-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-6">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        Trở thành Tác giả
                    </div>

                    <h1 className="text-3xl font-black mb-4 text-foreground tracking-tight">Đăng ký cộng tác</h1>
                    <p className="text-muted-foreground mb-10 font-medium leading-relaxed">
                        Hãy cho chúng tôi thấy niềm đam mê và phong cách viết lách của bạn.
                    </p>

                    {message.text && (
                        <div className={`p-4 rounded-2xl mb-8 flex items-center gap-3 animate-in slide-in-from-top-4 duration-300 ${message.type === 'error' ? 'bg-destructive/10 text-destructive border border-destructive/20' : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                            }`}>
                            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span className="text-sm font-bold">{message.text}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground ml-1">Giới thiệu bản thân *</label>
                            <textarea
                                required
                                minLength={50}
                                rows={4}
                                className="w-full px-5 py-4 rounded-2xl bg-muted/30 border border-border text-foreground placeholder:text-muted-foreground focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all resize-none text-sm font-medium leading-relaxed"
                                placeholder="Bạn là ai? Lĩnh vực chuyên môn của bạn là gì? (Tối thiểu 50 ký tự)"
                                value={formData.bio}
                                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground ml-1">Portfolio / Link tham khảo</label>
                            <input
                                type="url"
                                className="w-full px-5 py-4 rounded-2xl bg-muted/30 border border-border text-foreground placeholder:text-muted-foreground focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-sm font-medium"
                                placeholder="Link blog cá nhân, FB, LinkedIn hoặc bài viết đã đăng..."
                                value={formData.portfolio_url}
                                onChange={e => setFormData({ ...formData, portfolio_url: e.target.value })}
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground ml-1">Kinh nghiệm viết lách</label>
                            <textarea
                                rows={3}
                                className="w-full px-5 py-4 rounded-2xl bg-muted/30 border border-border text-foreground placeholder:text-muted-foreground focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all resize-none text-sm font-medium leading-relaxed"
                                placeholder="Bạn đã từng viết cho tạp chí hoặc trang tin nào chưa?"
                                value={formData.experience}
                                onChange={e => setFormData({ ...formData, experience: e.target.value })}
                            />
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary text-white py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl shadow-primary/20"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Đang gửi hồ sơ...
                                    </div>
                                ) : 'Gửi yêu cầu xét duyệt'}
                            </button>

                            <p className="text-center text-[10px] font-bold text-muted-foreground mt-6 uppercase tracking-widest leading-loose px-4">
                                Bằng cách gửi yêu cầu, bạn đồng ý với các quy định về nhuận bút & bản quyền của News Portal.
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
