'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/axios';

interface LikeButtonProps {
    postId: number;
    initialLikes: number;
    initialLiked: boolean;
}

const LikeButton = ({ postId, initialLikes, initialLiked }: LikeButtonProps) => {
    const { isAuthenticated, user } = useAuth();
    const [likes, setLikes] = useState(initialLikes);
    const [liked, setLiked] = useState(initialLiked);
    const [loading, setLoading] = useState(false);

    const handleLike = async () => {
        if (!isAuthenticated) {
            alert('Vui lòng đăng nhập để like bài viết');
            // Alternatively open login modal or redirect
            return;
        }

        setLoading(true);

        // Optimistic UI update
        const previousLiked = liked;
        const previousLikes = likes;

        setLiked(!liked);
        setLikes(liked ? likes - 1 : likes + 1);

        try {
            const res = await api.post(`/api/public/posts/${postId}/like`);
            setLikes(res.data.likes_count);
            setLiked(res.data.liked);
        } catch (error) {
            console.error('Failed to toggle like', error);
            // Revert on error
            setLiked(previousLiked);
            setLikes(previousLikes);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleLike}
            disabled={loading}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all ${liked
                    ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
                }`}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill={liked ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="2"
                className={`w-5 h-5 ${liked ? 'animate-bounce-short' : ''}`}
            >
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>{likes}</span>
        </button>
    );
};

export default LikeButton;
