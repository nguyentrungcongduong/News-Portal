'use client';

import { useEffect, useState } from 'react';
import { getAuthorProfile, updateAuthorProfile } from '@/lib/api';
import {
    UserOutlined,
    UploadOutlined,
    FacebookOutlined,
    TwitterOutlined,
    LinkedinOutlined,
    InstagramOutlined,
    SaveOutlined,
    LoadingOutlined
} from '@ant-design/icons';
import {
    Form,
    Input,
    Button,
    Upload,
    App,
    Card,
    Row,
    Col,
    Typography,
    Divider,
    Avatar,
    Space
} from 'antd';
import api from '@/lib/axios';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export default function AuthorProfile() {
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    useEffect(() => {
        getAuthorProfile()
            .then(res => {
                const user = res.data.data;
                form.setFieldsValue({
                    name: user.name,
                    bio: user.bio,
                    social_links: user.social_links || {}
                });
                setAvatarUrl(user.avatar);
            })
            .catch(err => {
                message.error('Không thể tải thông tin cá nhân');
                console.error(err);
            })
            .finally(() => setLoading(false));
    }, [form]);

    const handleUpload = async (info: any) => {
        if (info.file.status === 'uploading') {
            return;
        }

        const file = info.file.originFileObj;
        const formData = new FormData();
        formData.append('file', file);

        try {
            message.loading({ content: 'Đang tải ảnh lên...', key: 'upload' });
            const res = await api.post('/api/author/media/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setAvatarUrl(res.data.url);
            message.success({ content: 'Tải ảnh lên thành công', key: 'upload' });
        } catch (err: any) {
            message.error({ content: 'Lỗi upload: ' + (err.response?.data?.message || err.message), key: 'upload' });
        }
    };

    const onFinish = async (values: any) => {
        setSaving(true);
        try {
            await updateAuthorProfile({
                ...values,
                avatar: avatarUrl
            });
            message.success('Cập nhật hồ sơ thành công');
        } catch (err) {
            message.error('Có lỗi xảy ra khi lưu');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingOutlined className="text-4xl text-blue-600" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto py-10 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="mb-12 border-b-4 border-black dark:border-white pb-6">
                <Title level={1} className="font-serif font-black !mb-2 uppercase tracking-tight italic">
                    Hồ sơ <span className="text-blue-600">Tác giả</span>
                </Title>
                <Text className="text-zinc-500 font-medium uppercase tracking-[0.2em] text-xs">
                    Quản lý danh tính số và tiểu sử làm văn của bạn
                </Text>
            </header>

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                requiredMark={false}
                className="space-y-12"
            >
                <Row gutter={48}>
                    {/* Left Column: Avatar and Bio */}
                    <Col xs={24} lg={8}>
                        <div className="sticky top-24 space-y-8">
                            <Card variant="borderless" className="bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl overflow-hidden shadow-sm border border-zinc-100 dark:border-zinc-800">
                                <div className="p-6 flex flex-col items-center text-center">
                                    <div className="relative group mb-6">
                                        <Avatar
                                            size={160}
                                            src={avatarUrl}
                                            icon={<UserOutlined />}
                                            className="border-4 border-white dark:border-zinc-800 shadow-xl"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer overflow-hidden">
                                            <Upload
                                                showUploadList={false}
                                                customRequest={({ onSuccess }) => onSuccess?.('ok')}
                                                onChange={handleUpload}
                                            >
                                                <Button size="small" ghost icon={<UploadOutlined />}>Đổi ảnh</Button>
                                            </Upload>
                                        </div>
                                    </div>
                                    <Title level={4} className="!mb-1">{form.getFieldValue('name')}</Title>
                                    <Text type="secondary" className="text-xs uppercase tracking-widest font-bold">Author & Journalist</Text>

                                    <Divider className="my-6 border-zinc-200 dark:border-zinc-800" />

                                    <div className="w-full space-y-4">
                                        <div className="flex justify-between items-center text-xs">
                                            <Text strong className="uppercase tracking-widest">Trạng thái</Text>
                                            <Tag color="green">Hoạt động</Tag>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <Text strong className="uppercase tracking-widest">Tin cậy</Text>
                                            <Text>98/100</Text>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <div className="p-6 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-500/20">
                                <Title level={5} className="!text-white !mb-2">Gợi ý chuyên nghiệp</Title>
                                <Paragraph className="text-white/80 text-xs leading-relaxed">
                                    Hãy sử dụng ảnh chân dung rõ mặt, ánh sáng tốt và nền trung tính để tăng độ tin cậy đối với độc giả. Tiểu sử nên ngắn gọn nhưng thể hiện được chuyên môn của bạn.
                                </Paragraph>
                            </div>
                        </div>
                    </Col>

                    {/* Right Column: Fields */}
                    <Col xs={24} lg={16}>
                        <div className="space-y-12 pb-20">
                            {/* Basic Info */}
                            <section>
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400 mb-8 flex items-center gap-4">
                                    Thông tin cơ bản
                                    <div className="flex-grow h-px bg-zinc-100 dark:bg-zinc-800" />
                                </h3>

                                <Form.Item
                                    name="name"
                                    label="Họ và tên nghệ danh"
                                    rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
                                    className="editorial-form-item"
                                >
                                    <Input size="large" className="premium-input" placeholder="Ví dụ: Nguyễn Văn News" />
                                </Form.Item>

                                <Form.Item
                                    name="bio"
                                    label="Tiểu sử (Biography)"
                                    className="editorial-form-item"
                                >
                                    <TextArea
                                        rows={6}
                                        maxLength={1000}
                                        showCount
                                        className="premium-input py-4"
                                        placeholder="Giới thiệu ngắn gọn về bản thân, kinh nghiệm viết lách..."
                                    />
                                </Form.Item>
                            </section>

                            {/* Social Links */}
                            <section>
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400 mb-8 flex items-center gap-4">
                                    Mạng xã hội
                                    <div className="flex-grow h-px bg-zinc-100 dark:bg-zinc-800" />
                                </h3>

                                <Row gutter={24}>
                                    <Col span={12}>
                                        <Form.Item name={['social_links', 'facebook']} label="Facebook">
                                            <Input prefix={<FacebookOutlined className="text-blue-600" />} className="premium-input-sm" placeholder="https://facebook.com/..." />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item name={['social_links', 'twitter']} label="X (Twitter)">
                                            <Input prefix={<TwitterOutlined className="text-zinc-900 dark:text-white" />} className="premium-input-sm" placeholder="https://twitter.com/..." />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item name={['social_links', 'linkedin']} label="LinkedIn">
                                            <Input prefix={<LinkedinOutlined className="text-blue-700" />} className="premium-input-sm" placeholder="https://linkedin.com/in/..." />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item name={['social_links', 'instagram']} label="Instagram">
                                            <Input prefix={<InstagramOutlined className="text-pink-600" />} className="premium-input-sm" placeholder="https://instagram.com/..." />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </section>

                            <div className="pt-10 border-t border-zinc-100 dark:border-zinc-800">
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    size="large"
                                    loading={saving}
                                    icon={<SaveOutlined />}
                                    className="h-14 px-10 rounded-xl bg-black dark:bg-white dark:text-black hover:!bg-blue-600 !border-none font-bold text-sm uppercase tracking-widest shadow-xl shadow-zinc-200 dark:shadow-none transition-all hover:-translate-y-1"
                                >
                                    Lưu hồ sơ tác giả
                                </Button>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Form>

            <style jsx global>{`
                .premium-input {
                    background: transparent !important;
                    border: 2px solid #f4f4f5 !important;
                    border-radius: 12px !important;
                    padding-left: 16px !important;
                    transition: all 0.3s !important;
                }
                .dark .premium-input {
                    border-color: #27272a !important;
                }
                .premium-input:focus, .premium-input:hover {
                    border-color: #3b82f6 !important;
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1) !important;
                }
                .premium-input-sm {
                    background: transparent !important;
                    border: 1px solid #f4f4f5 !important;
                    border-radius: 8px !important;
                    height: 45px !important;
                }
                .dark .premium-input-sm {
                    border-color: #27272a !important;
                }
                .editorial-form-item .ant-form-item-label label {
                    font-size: 11px !important;
                    font-weight: 800 !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.1em !important;
                    color: #71717a !important;
                }
            `}</style>
        </div>
    );
}

// Missing component for UI logic
function Tag({ children, color }: { children: React.ReactNode, color: string }) {
    const colors: any = {
        green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    };
    return (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${colors[color] || ''}`}>
            {children}
        </span>
    );
}
