'use client';

import { useState } from 'react';
import { Modal, Form, Input, Button, message, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import api from '@/lib/axios';

interface ImageUploadModalProps {
    open: boolean;
    onCancel: () => void;
    onSuccess: (url: string, alt: string, caption: string) => void;
}

const ImageUploadModal = ({ open, onCancel, onSuccess }: ImageUploadModalProps) => {
    const [form] = Form.useForm();
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const handleUpload = async () => {
        try {
            const values = await form.validateFields();
            
            if (!file) {
                message.error('Vui lòng chọn ảnh');
                return;
            }

            if (!values.alt || !values.alt.trim()) {
                message.error('Alt text là bắt buộc cho SEO!');
                return;
            }

            setUploading(true);

            const formData = new FormData();
            formData.append('file', file);

            const response = await api.post('/api/author/media/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const { url } = response.data;

            onSuccess(url, values.alt.trim(), values.caption?.trim() || '');
            
            // Reset form
            form.resetFields();
            setFile(null);
            setPreview(null);
            onCancel();
            
            message.success('Đã chèn ảnh thành công');
        } catch (error: unknown) {
            const errorMessage = error && typeof error === 'object' && 'response' in error
                ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
                : undefined;
            message.error(errorMessage || 'Không thể upload ảnh');
        } finally {
            setUploading(false);
        }
    };

    const handleFileChange = (file: File) => {
        setFile(file);
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
        
        // Auto-fill alt from filename if empty
        if (!form.getFieldValue('alt')) {
            const altFromName = file.name
                .replace(/\.[^/.]+$/, '')
                .replace(/[-_]/g, ' ')
                .trim();
            form.setFieldValue('alt', altFromName);
        }
        
        return false; // Prevent auto upload
    };

    return (
        <Modal
            title="Chèn ảnh"
            open={open}
            onCancel={onCancel}
            footer={null}
            width={600}
            forceRender
        >
            <Form form={form} layout="vertical">
                <Form.Item label="Chọn ảnh" required>
                    <Upload
                        accept="image/*"
                        beforeUpload={handleFileChange}
                        showUploadList={false}
                    >
                        <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
                    </Upload>
                    {preview && (
                        <div className="mt-4">
                            <img src={preview} alt="Preview" className="max-w-full h-auto rounded-lg" />
                        </div>
                    )}
                </Form.Item>

                <Form.Item
                    label="Alt text (Bắt buộc - Cho SEO)"
                    name="alt"
                    rules={[
                        { required: true, message: 'Alt text là bắt buộc!' },
                        { min: 3, message: 'Alt text phải ít nhất 3 ký tự' },
                    ]}
                    help="Mô tả ngắn gọn nội dung ảnh cho công cụ tìm kiếm và người dùng khiếm thị"
                >
                    <Input placeholder="VD: Bão số 3 đổ bộ vào miền Trung" />
                </Form.Item>

                <Form.Item
                    label="Chú thích (Caption)"
                    name="caption"
                    help="Chú thích hiển thị dưới ảnh (tùy chọn)"
                >
                    <Input.TextArea
                        rows={2}
                        placeholder="VD: Người dân chằng chống nhà cửa trước khi bão đổ bộ"
                    />
                </Form.Item>

                <Form.Item>
                    <Button
                        type="primary"
                        onClick={handleUpload}
                        loading={uploading}
                        block
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        Chèn ảnh
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ImageUploadModal;

