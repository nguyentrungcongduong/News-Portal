'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createAuthorPost, getCategories, submitAuthorPost } from '@/lib/api';
import { Form, Input, Button, Select, message, Card, Modal } from 'antd';
import { ArrowLeftOutlined, EyeOutlined } from '@ant-design/icons';
import Link from 'next/link';
import TipTapEditor from '@/components/TipTapEditor';
import PostPreview from '@/components/PostPreview';

export default function CreatePost() {
    const router = useRouter();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [contentHtml, setContentHtml] = useState('');
    const [contentJson, setContentJson] = useState<any>(null);
    const [previewVisible, setPreviewVisible] = useState(false);

    useEffect(() => {
        getCategories().then(res => setCategories(res.data));
    }, []);

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            const payload = {
                ...values,
                content: contentHtml, // Send HTML
                content_html: contentHtml,
                content_json: contentJson ? JSON.stringify(contentJson) : null,
            };
            await createAuthorPost(payload);
            message.success('Đã tạo bài viết thành công. Bạn có thể gửi duyệt ngay bây giờ.');
            router.push('/author/posts');
        } catch (err: any) {
            message.error(err.response?.data?.message || 'Có lỗi xảy ra khi tạo bài viết');
        } finally {
            setLoading(false);
        }
    };

    const handlePreview = () => {
        const values = form.getFieldsValue();
        if (!values.title || !contentHtml) {
            message.warning('Vui lòng nhập tiêu đề và nội dung trước khi xem trước');
            return;
        }
        setPreviewVisible(true);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/author/posts" className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800">
                    <ArrowLeftOutlined />
                </Link>
                <h2 className="text-xl font-bold text-black dark:text-white">Viết bài mới</h2>
            </div>

            <Card className="dark:bg-zinc-950 dark:border-zinc-800">
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{ status: 'draft' }}
                >
                    <Form.Item
                        label="Tiêu đề"
                        name="title"
                        rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
                    >
                        <Input placeholder="Nhập tiêu đề bài viết..." size="large" />
                    </Form.Item>

                    <Form.Item
                        label="Tóm tắt"
                        name="summary"
                        rules={[{ required: true, message: 'Vui lòng nhập tóm tắt' }]}
                    >
                        <Input.TextArea rows={3} placeholder="Nhập tóm tắt ngắn..." />
                    </Form.Item>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Form.Item
                            label="Chuyên mục"
                            name="category_ids"
                            rules={[{ required: true, message: 'Vui lòng chọn ít nhất một chuyên mục' }]}
                        >
                            <Select mode="multiple" placeholder="Chọn chuyên mục">
                                {categories.map((c: any) => (
                                    <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label="URL Hình ảnh thu nhỏ"
                            name="thumbnail"
                        >
                            <Input placeholder="Https://example.com/image.jpg" />
                        </Form.Item>
                    </div>

                    <Form.Item
                        label="Nội dung"
                        name="content"
                        rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
                    >
                        <TipTapEditor
                            value={contentHtml}
                            onChange={(html, json) => {
                                setContentHtml(html);
                                setContentJson(json);
                                form.setFieldValue('content', html);
                            }}
                        />
                    </Form.Item>

                    <Form.Item className="mt-8 flex justify-end gap-2">
                        <Button
                            type="default"
                            icon={<EyeOutlined />}
                            onClick={handlePreview}
                            size="large"
                        >
                            Xem trước
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            size="large"
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            Lưu nháp
                        </Button>
                    </Form.Item>
                </Form>

                {/* Preview Modal */}
                <Modal
                    title="Xem trước bài viết"
                    open={previewVisible}
                    onCancel={() => setPreviewVisible(false)}
                    footer={null}
                    width="90%"
                    style={{ top: 20 }}
                    className="preview-modal"
                >
                    <PostPreview
                        title={form.getFieldValue('title') || ''}
                        summary={form.getFieldValue('summary') || ''}
                        content={contentHtml}
                        thumbnail={form.getFieldValue('thumbnail') || ''}
                        categories={categories
                            .filter((c: any) => form.getFieldValue('category_ids')?.includes(c.id))
                            .map((c: any) => ({ id: c.id, name: c.name, slug: c.slug }))
                        }
                        preview={true}
                    />
                </Modal>
            </Card>
        </div>
    );
}
