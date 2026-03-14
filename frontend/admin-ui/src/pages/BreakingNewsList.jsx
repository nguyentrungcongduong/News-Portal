import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Select, DatePicker, message, Card, Row, Col, Tag, InputNumber, Switch, Checkbox } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons';
import api from '../services/api';
import dayjs from 'dayjs';

const BreakingNewsList = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [posts, setPosts] = useState([]); // For select options
    const [form] = Form.useForm();
    const [editingId, setEditingId] = useState(null);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/admin/breaking-news');
            setItems(res.data);
        } catch (error) {
            message.error('Lỗi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const fetchPosts = async (search = '') => {
        try {
             // Reusing the post list API, might need a specialized endpoint for autocomplete
             // For now assuming existing posts endpoint works
            const res = await api.get('/api/admin/posts?status=published');
            setPosts(res.data.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchItems();
        fetchPosts();
    }, []);

    const handleSubmit = async (values) => {
        const payload = {
            ...values,
            start_at: values.start_at ? values.start_at.format('YYYY-MM-DD HH:mm:ss') : null,
            end_at: values.end_at ? values.end_at.format('YYYY-MM-DD HH:mm:ss') : null,
        };

        try {
            if (editingId) {
                await api.put(`/api/admin/breaking-news/${editingId}`, payload);
                message.success('Cập nhật thành công');
            } else {
                await api.post('/api/admin/breaking-news', payload);
                message.success('Thêm tin nóng thành công');
            }
            setModalOpen(false);
            form.resetFields();
            setEditingId(null);
            fetchItems();
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleEdit = (record) => {
        setEditingId(record.id);
        form.setFieldsValue({
            post_id: record.post_id,
            priority: record.priority,
            is_active: record.is_active,
            start_at: record.start_at ? dayjs(record.start_at) : null,
            end_at: record.end_at ? dayjs(record.end_at) : null,
        });
        setModalOpen(true);
    };

    const handleDelete = (id) => {
        Modal.confirm({
            title: 'Xóa tin nóng này?',
            onOk: async () => {
                try {
                    await api.delete(`/api/admin/breaking-news/${id}`);
                    message.success('Đã xóa');
                    fetchItems();
                } catch (e) {
                    message.error('Lỗi xóa');
                }
            }
        });
    };

    const handleToggle = async (id) => {
        try {
            await api.post(`/api/admin/breaking-news/${id}/toggle`);
            message.success('Đã thay đổi trạng thái');
            fetchItems();
        } catch (e) {
             message.error(e.response?.data?.message || 'Lỗi');
        }
    };

    const columns = [
        {
            title: 'Ưu tiên',
            dataIndex: 'priority',
            key: 'priority',
            sorter: (a, b) => a.priority - b.priority,
            render: (p) => <Tag color="gold" style={{ fontWeight: 'bold' }}>{p}</Tag>
        },
        {
            title: 'Bài viết',
            dataIndex: ['post', 'title'],
            key: 'title',
            render: (text, record) => (
                <div>
                     <a href={`/post/${record.post?.slug}`} target="_blank" rel="noreferrer" style={{ fontWeight: 500 }}>{text}</a>
                     <div><small type="secondary">ID: {record.post_id}</small></div>
                </div>
            )
        },
        {
            title: 'Thời gian hiển thị',
            key: 'time',
            render: (_, record) => (
                <div style={{ fontSize: '13px' }}>
                    <div>Bắt đầu: {record.start_at ? dayjs(record.start_at).format('HH:mm DD/MM') : 'Ngay lập tức'}</div>
                    <div style={{ color: '#888' }}>Kết thúc: {record.end_at ? dayjs(record.end_at).format('HH:mm DD/MM') : 'Vô thời hạn'}</div>
                </div>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'is_active',
            key: 'status',
            render: (active, record) => {
                const now = dayjs();
                let status = 'active'; // green
                let text = 'Đang hiện';

                if (!active) {
                    status = 'inactive'; text = 'Đã tắt';
                } else if (record.end_at && dayjs(record.end_at).isBefore(now)) {
                    status = 'expired'; text = 'Hết hạn';
                } else if (record.start_at && dayjs(record.start_at).isAfter(now)) {
                    status = 'scheduled'; text = 'Sắp chạy';
                }

                const colors = { active: 'green', inactive: 'default', expired: 'red', scheduled: 'blue' };
                return <Tag color={colors[status]}>{text.toUpperCase()}</Tag>;
            }
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <div style={{ display: 'flex', gap: 8 }}>
                    <Switch 
                        size="small" 
                        checked={record.is_active} 
                        onChange={() => handleToggle(record.id)} 
                        style={{ marginRight: 8 }}
                    />
                    <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
                </div>
            )
        }
    ];

    return (
        <div style={{ padding: 24 }}>
            <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                <Col>
                    <h2>Quản lý Breaking News 🔴</h2>
                    <p style={{ color: '#888' }}>Quản lý các tin nóng hiển thị trên thanh top bar.</p>
                </Col>
                <Col>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingId(null); form.resetFields(); setModalOpen(true); }}>
                        Thêm tin nóng
                    </Button>
                </Col>
            </Row>

            <Table 
                dataSource={items} 
                columns={columns} 
                rowKey="id" 
                loading={loading}
                pagination={false}
            />

            <Modal
                title={editingId ? "Sửa tin nóng" : "Thêm tin nóng mới"}
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
                onOk={() => form.submit()}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ is_active: true, priority: 5 }}>
                    <Form.Item name="post_id" label="Chọn bài viết" rules={[{ required: true }]}>
                        <Select
                            showSearch
                            placeholder="Nhập tên bài viết..."
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            options={posts.map(p => ({ value: p.id, label: p.title }))}
                        />
                    </Form.Item>
                    
                    <Row gutter={16}>
                        <Col span={12}>
                             <Form.Item name="priority" label="Độ ưu tiên (1-10)" help="Số lớn hơn sẽ xếp trên">
                                 <InputNumber min={1} max={10} style={{ width: '100%' }} />
                             </Form.Item>
                        </Col>
                        <Col span={12}>
                             <Form.Item name="is_active" label="Trạng thái" valuePropName="checked">
                                 <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
                             </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="start_at" label="Bắt đầu (Để trống = Ngay)">
                                <DatePicker showTime format="HH:mm DD/MM/YYYY" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="end_at" label="Kết thúc (Để trống = Vô hạn)">
                                <DatePicker showTime format="HH:mm DD/MM/YYYY" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>
                    
                    <Form.Item name="send_notification" valuePropName="checked">
                        <Checkbox>Gửi thông báo đẩy đến độc giả (Web Notification) 🔔</Checkbox>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default BreakingNewsList;
