'use client';

import { useEffect, useState } from 'react';
import { getAuthorPosts, deleteAuthorPost, submitAuthorPost } from '@/lib/api';
import Link from 'next/link';
import {
    EditOutlined,
    DeleteOutlined,
    SendOutlined,
    PlusOutlined,
    EyeOutlined
} from '@ant-design/icons';
import { Tag, Modal, message, Table } from 'antd';

export default function AuthorPosts() {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ current: 1, total: 0, pageSize: 10 });

    const fetchPosts = (page = 1) => {
        setLoading(true);
        getAuthorPosts(page)
            .then(res => {
                setPosts(res.data.data);
                setPagination({
                    current: res.data.meta.current_page,
                    total: res.data.meta.total,
                    pageSize: res.data.meta.per_page
                });
            })
            .catch(err => {
                message.error('Không thể tải danh sách bài viết');
                console.error(err);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleDelete = (id: number) => {
        Modal.confirm({
            title: 'Bạn có chắc chắn muốn xóa bài viết này?',
            content: 'Hành động này không thể hoàn tác.',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: () => {
                deleteAuthorPost(id)
                    .then(() => {
                        message.success('Đã xóa bài viết');
                        fetchPosts(pagination.current);
                    })
                    .catch(() => message.error('Không thể xóa bài viết'));
            }
        });
    };

    const handleSubmit = (id: number) => {
        Modal.confirm({
            title: 'Gửi duyệt bài viết?',
            content: 'Sau khi gửi, bạn sẽ không thể chỉnh sửa cho đến khi có phản hồi từ biên tập viên.',
            onOk: () => {
                submitAuthorPost(id)
                    .then(() => {
                        message.success('Đã gửi duyệt thành công');
                        fetchPosts(pagination.current);
                    })
                    .catch(() => message.error('Không thể gửi duyệt'));
            }
        });
    };

    const statusColors: any = {
        draft: 'default',
        pending: 'orange',
        approved: 'cyan',
        published: 'green',
        rejected: 'red',
        archived: 'purple'
    };

    const columns = [
        {
            title: 'Tiêu đề',
            dataIndex: 'title',
            key: 'title',
            render: (text: string, record: any) => (
                <div className="max-w-[300px]">
                    <p className="font-bold text-black dark:text-white truncate">{text}</p>
                    <p className="text-[10px] text-zinc-400">Slug: {record.slug}</p>
                </div>
            )
        },
        {
            title: 'Chuyên mục',
            dataIndex: 'categories',
            key: 'categories',
            render: (categories: any[]) => (
                <div className="flex flex-wrap gap-1">
                    {categories?.map(c => <Tag key={c.id}>{c.name}</Tag>)}
                </div>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={statusColors[status] || 'default'}>
                    {status.toUpperCase()}
                </Tag>
            )
        },
        {
            title: 'Ngày cập nhật',
            dataIndex: 'updated_at',
            key: 'updated_at',
            render: (date: string) => new Date(date).toLocaleDateString('vi-VN')
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_: any, record: any) => (
                <div className="flex items-center gap-3">
                    {record.status !== 'pending' && record.status !== 'published' && (
                        <Link href={`/author/posts/${record.id}/edit`} className="text-blue-600 hover:text-blue-800">
                            <EditOutlined />
                        </Link>
                    )}

                    {(record.status === 'draft' || record.status === 'rejected') && (
                        <>
                            <button onClick={() => handleSubmit(record.id)} className="text-orange-600 hover:text-orange-800">
                                <SendOutlined />
                            </button>
                            <button onClick={() => handleDelete(record.id)} className="text-red-600 hover:text-red-800">
                                <DeleteOutlined />
                            </button>
                        </>
                    )}

                    {record.status === 'published' && (
                        <Link href={`/post/${record.slug}`} target="_blank" className="text-zinc-600 hover:text-zinc-800">
                            <EyeOutlined />
                        </Link>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-black dark:text-white">Bài viết của tôi</h2>
                <Link href="/author/posts/create" className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-blue-700">
                    <PlusOutlined />
                    Viết bài mới
                </Link>
            </div>

            <Table
                columns={columns}
                dataSource={posts}
                rowKey="id"
                loading={loading}
                pagination={{
                    ...pagination,
                    onChange: (page) => fetchPosts(page)
                }}
                className="overflow-hidden rounded-xl border border-zinc-100 dark:border-zinc-800"
            />
        </div>
    );
}
