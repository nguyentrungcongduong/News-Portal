'use client';

import { useEffect, useState } from 'react';
import { getAuthorStats } from '@/lib/api';
import {
    FileTextOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    EyeOutlined
} from '@ant-design/icons';

export default function AuthorDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAuthorStats()
            .then(res => setStats(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div>Đang tải thống kê...</div>;

    const statCards = [
        { label: 'Tổng bài viết', value: stats?.post_count || 0, icon: <FileTextOutlined />, color: 'bg-blue-500' },
        { label: 'Đã xuất bản', value: stats?.published_count || 0, icon: <CheckCircleOutlined />, color: 'bg-green-500' },
        { label: 'Đang chờ duyệt', value: stats?.pending_count || 0, icon: <ClockCircleOutlined />, color: 'bg-orange-500' },
        { label: 'Bị từ chối', value: stats?.rejected_count || 0, icon: <FileTextOutlined />, color: 'bg-red-500' },
    ];

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map((card, index) => (
                    <div key={index} className="flex items-center gap-4 rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-lg text-white ${card.color}`}>
                            <span className="text-xl">{card.icon}</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-500">{card.label}</p>
                            <p className="text-2xl font-bold text-black dark:text-white">{card.value.toLocaleString()}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <div className="rounded-xl border border-zinc-100 p-6 dark:border-zinc-800">
                    <h3 className="mb-4 text-lg font-bold text-black dark:text-white">Thông báo mới nhất</h3>
                    <div className="flex flex-col items-center justify-center py-8 text-zinc-500">
                        <p className="text-sm italic">Không có thông báo mới.</p>
                    </div>
                </div>

                <div className="rounded-xl border border-zinc-100 p-6 dark:border-zinc-800">
                    <h3 className="mb-4 text-lg font-bold text-black dark:text-white">Quy định viết bài</h3>
                    <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
                        <li className="flex gap-2">
                            <span className="font-bold text-blue-600">01.</span>
                            Nội dung không vi phạm bản quyền và chính sách cộng đồng.
                        </li>
                        <li className="flex gap-2">
                            <span className="font-bold text-blue-600">02.</span>
                            Đảm bảo tính trung thực và khách quan của thông tin.
                        </li>
                        <li className="flex gap-2">
                            <span className="font-bold text-blue-600">03.</span>
                            Hình ảnh minh họa phải có chất lượng tốt và có nguồn rõ ràng.
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
