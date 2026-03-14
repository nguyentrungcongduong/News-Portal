'use client';

import { useState, useEffect } from 'react';
import { getComments } from '@/lib/api';
import api from '@/lib/axios';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface Comment {
    id: number;
    author_name: string;
    content: string;
    status: string;
    created_at: string;
    children?: Comment[];
}

interface CommentSectionProps {
    postSlug: string;
}

const CommentSection = ({ postSlug }: CommentSectionProps) => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const [comments, setComments] = useState<Comment[]>([]);
    const [loadingComments, setLoadingComments] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form state - Only content and parent_id needed for auth'd users
    const [content, setContent] = useState('');
    const [parentId, setParentId] = useState<number | null>(null);

    const [replyTo, setReplyTo] = useState<Comment | null>(null);

    const fetchComments = async () => {
        try {
            const res = await getComments(postSlug);
            setComments(res.data.data);
        } catch (e) {
            console.error('Failed to load comments');
        } finally {
            setLoadingComments(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [postSlug]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAuthenticated) return;

        setSubmitting(true);
        setMessage(null);

        try {
            // Using axios instance (api) to ensure cookies/auth are sent
            const res = await api.post(`/api/public/posts/${postSlug}/comments`, {
                content,
                parent_id: parentId
            });

            setMessage({ type: 'success', text: res.data.message });
            setContent('');
            setParentId(null);
            setReplyTo(null);

            // Reload comments
            fetchComments();
        } catch (e: any) {
            console.error(e);
            const msg = e.response?.data?.message || 'Gửi bình luận thất bại. Vui lòng thử lại.';
            setMessage({ type: 'error', text: msg });
        } finally {
            setSubmitting(false);
        }
    };

    const handleReport = async (commentId: number) => {
        if (!isAuthenticated) {
            alert('Vui lòng đăng nhập để báo cáo vi phạm.');
            return;
        }

        const reason = window.prompt(
            'Lý do báo cáo vi phạm:\n1. Spam\n2. Ngôn ngữ thù ghét\n3. Tin giả\n4. Khác',
            'Spam'
        );

        if (!reason) return;

        try {
            await api.post(`/api/public/comments/${commentId}/report`, {
                reason: reason,
                details: 'Reported from public UI'
            });
            alert('Cảm ơn bạn. Báo cáo đã được gửi tới ban quản trị.');
        } catch (e: any) {
            alert(e.response?.data?.message || 'Gửi báo cáo thất bại');
        }
    };

    const handleReply = (comment: Comment) => {
        if (!isAuthenticated) {
            alert('Vui lòng đăng nhập để trả lời.');
            return;
        }
        setReplyTo(comment);
        setParentId(comment.id);
        // Scroll to form
        document.getElementById('comment-form')?.scrollIntoView({ behavior: 'smooth' });
    };

    const CommentItem = ({ comment, isReply = false }: { comment: Comment, isReply?: boolean }) => (
        <div className={`mb-6 ${isReply ? 'ml-8 border-l-2 border-zinc-100 pl-4 py-2' : ''}`}>
            <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-sm">
                    {comment.author_name.charAt(0)}
                </div>
                <div>
                    <span className="font-bold text-zinc-900 dark:text-white text-sm">{comment.author_name}</span>
                    <span className="text-zinc-400 text-xs ml-2">{comment.created_at}</span>
                    {comment.status !== 'approved' && (
                        <span className={`ml-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${comment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                            }`}>
                            {comment.status === 'pending' ? 'Chờ duyệt' : 'Từ chối'}
                        </span>
                    )}
                </div>
            </div>
            <p className="text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed mb-2">
                {comment.content}
            </p>
            <div className="flex items-center gap-4">
                {!isReply && (
                    <button
                        onClick={() => handleReply(comment)}
                        className="text-blue-600 text-xs font-bold hover:underline"
                    >
                        Trả lời
                    </button>
                )}
                <button
                    onClick={() => handleReport(comment.id)}
                    className="text-zinc-400 text-xs hover:text-red-500 transition-colors"
                >
                    Báo cáo
                </button>
            </div>

            {comment.children && comment.children.length > 0 && (
                <div className="mt-4">
                    {comment.children.map(child => (
                        <CommentItem key={child.id} comment={child} isReply={true} />
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <section className="mt-16 border-t border-zinc-200 pt-12 dark:border-zinc-800">
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-8">
                Bình luận ({comments.length})
            </h3>

            {/* Form Area */}
            <div id="comment-form" className="bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl p-6 mb-12">
                {isLoading ? (
                    <div className="text-sm">Đang tải trạng thái...</div>
                ) : isAuthenticated ? (
                    <>
                        <h4 className="font-bold mb-4 flex items-center justify-between">
                            <span>
                                Bình luận với tư cách <span className="text-blue-600">{user?.name}</span>
                                {replyTo && <span className="ml-2 font-normal text-zinc-500">đang trả lời <b>{replyTo.author_name}</b></span>}
                            </span>
                            {replyTo && (
                                <button
                                    onClick={() => { setReplyTo(null); setParentId(null); }}
                                    className="text-xs text-red-500 hover:underline font-normal"
                                >
                                    Hủy trả lời
                                </button>
                            )}
                        </h4>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <textarea
                                required
                                rows={4}
                                placeholder="Nội dung bình luận (tối thiểu 5 ký tự) *"
                                value={content}
                                onChange={e => setContent(e.target.value)}
                                className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm focus:border-blue-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950"
                            />

                            {message && (
                                <div className={`text-sm p-3 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {message.text}
                                </div>
                            )}

                            <div className="flex justify-end">
                                <button
                                    disabled={submitting}
                                    type="submit"
                                    className="rounded-full bg-blue-600 px-8 py-2.5 text-sm font-bold text-white transition-all hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {submitting ? 'Đang gửi...' : 'Gửi bình luận'}
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="text-center py-6">
                        <p className="text-zinc-600 dark:text-zinc-400 mb-4">Vui lòng đăng nhập để gửi bình luận.</p>
                        <Link href="/login" className="inline-block rounded-full bg-black px-6 py-2 text-sm font-bold text-white transition-all hover:bg-blue-600 dark:bg-white dark:text-black">
                            Đăng nhập ngay
                        </Link>
                    </div>
                )}
            </div>

            {/* List */}
            {loadingComments ? (
                <div className="py-10 text-center text-zinc-500">Đang tải bình luận...</div>
            ) : (
                <div className="space-y-8">
                    {comments.map(comment => (
                        <CommentItem key={comment.id} comment={comment} />
                    ))}
                    {comments.length === 0 && (
                        <div className="text-center py-10 border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-2xl">
                            <p className="text-zinc-400">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
};

export default CommentSection;
