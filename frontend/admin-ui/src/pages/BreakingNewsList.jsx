import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Select, DatePicker, message, Row, Col, Tag, InputNumber, Switch, Checkbox } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../services/api';
import dayjs from 'dayjs';

const BreakingNewsList = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [posts, setPosts] = useState([]);
    const [formSubmitting, setFormSubmitting] = useState(false);
    const [rowLoading, setRowLoading] = useState({});
    const [form] = Form.useForm();
    const [editingId, setEditingId] = useState(null);

    const setBusyRow = (id, value) => {
        setRowLoading((prev) => ({ ...prev, [id]: value }));
    };

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

    const fetchPosts = async () => {
        try {
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

    const closeModal = () => {
        if (formSubmitting) {
            return;
        }

        setModalOpen(false);
        form.resetFields();
        setEditingId(null);
    };

    const handleSubmit = async (values) => {
        if (formSubmitting) {
            return;
        }

        setFormSubmitting(true);

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
            await fetchItems();
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setFormSubmitting(false);
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
            okButtonProps: { loading: Boolean(rowLoading[id]) },
            onOk: async () => {
                setBusyRow(id, true);
                try {
                    await api.delete(`/api/admin/breaking-news/${id}`);
                    message.success('Đã xóa');
                    setItems((prev) => prev.filter((item) => item.id !== id));
                } catch (error) {
                    message.error('Lỗi xóa');
                } finally {
                    setBusyRow(id, false);
                }
            },
        });
    };

    const handleToggle = async (id) => {
        setBusyRow(id, true);
        try {
            const response = await api.post(`/api/admin/breaking-news/${id}/toggle`);
            message.success('Đã thay đổi trạng thái');
            setItems((prev) => prev.map((item) => (
                item.id === id
                    ? { ...item, is_active: response.data.data.is_active }
                    : item
            )));
        } catch (error) {
            message.error(error.response?.data?.message || 'Lỗi');
        } finally {
            setBusyRow(id, false);
        }
    };

    const columns = [
        {
            title: 'Ưu tiên',
            dataIndex: 'priority',
            key: 'priority',
            sorter: (a, b) => a.priority - b.priority,
            render: (priority) => <Tag color="gold" style={{ fontWeight: 'bold' }}>{priority}</Tag>,
        },
        {
            title: 'Bài viết',
            dataIndex: ['post', 'title'],
            key: 'title',
            render: (text, record) => (
                <div>
                    <a href={`/post/${record.post?.slug}`} target="_blank" rel="noreferrer" style={{ fontWeight: 500 }}>
                        {text}
                    </a>
                    <div><small>ID: {record.post_id}</small></div>
                </div>
            ),
        },
        {
            title: 'Thời gian hiển thị',
            key: 'time',
            render: (_, record) => (
                <div style={{ fontSize: '13px' }}>
                    <div>Bắt đầu: {record.start_at ? dayjs(record.start_at).format('HH:mm DD/MM') : 'Ngay lập tức'}</div>
                    <div style={{ color: '#888' }}>Kết thúc: {record.end_at ? dayjs(record.end_at).format('HH:mm DD/MM') : 'Vô thời hạn'}</div>
                </div>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'is_active',
            key: 'status',
            render: (active, record) => {
                const now = dayjs();
                let status = 'active';
                let text = 'Đang hiện';

                if (!active) {
                    status = 'inactive';
                    text = 'Đã tắt';
                } else if (record.end_at && dayjs(record.end_at).isBefore(now)) {
                    status = 'expired';
                    text = 'Hết hạn';
                } else if (record.start_at && dayjs(record.start_at).isAfter(now)) {
                    status = 'scheduled';
                    text = 'Sắp chạy';
                }

                const colors = { active: 'green', inactive: 'default', expired: 'red', scheduled: 'blue' };
                return <Tag color={colors[status]}>{text.toUpperCase()}</Tag>;
            },
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => {
                const busy = Boolean(rowLoading[record.id]);

                return (
                    <div style={{ display: 'flex', gap: 8 }}>
                        <Switch
                            size="small"
                            checked={record.is_active}
                            loading={busy}
                            disabled={busy}
                            onChange={() => handleToggle(record.id)}
                            style={{ marginRight: 8 }}
                        />
                        <Button size="small" icon={<EditOutlined />} disabled={busy} onClick={() => handleEdit(record)} />
                        <Button size="small" danger icon={<DeleteOutlined />} loading={busy} onClick={() => handleDelete(record.id)} />
                    </div>
                );
            },
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                <Col>
                    <h2>Quản lý Breaking News 🔴</h2>
                    <p style={{ color: '#888' }}>Quản lý các tin nóng hiển thị trên thanh top bar.</p>
                </Col>
                <Col>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        disabled={modalOpen}
                        onClick={() => {
                            setEditingId(null);
                            form.resetFields();
                            setModalOpen(true);
                        }}
                    >
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
                title={editingId ? 'Sửa tin nóng' : 'Thêm tin nóng mới'}
                open={modalOpen}
                onCancel={closeModal}
                onOk={() => form.submit()}
                okText={editingId ? 'Lưu thay đổi' : 'Tạo tin nóng'}
                confirmLoading={formSubmitting}
                okButtonProps={{ disabled: formSubmitting }}
                cancelButtonProps={{ disabled: formSubmitting }}
                maskClosable={!formSubmitting}
                keyboard={!formSubmitting}
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{ is_active: true, priority: 5 }}
                >
                    <Form.Item name="post_id" label="Chọn bài viết" rules={[{ required: true, message: 'Vui lòng chọn bài viết' }]}>
                        <Select
                            showSearch
                            placeholder="Nhập tên bài viết..."
                            disabled={formSubmitting || Boolean(editingId)}
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            options={posts.map((post) => ({ value: post.id, label: post.title }))}
                        />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="priority" label="Độ ưu tiên (1-10)" help="Số lớn hơn sẽ xếp trên">
                                <InputNumber min={1} max={10} style={{ width: '100%' }} disabled={formSubmitting} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="is_active" label="Trạng thái" valuePropName="checked">
                                <Switch checkedChildren="Bật" unCheckedChildren="Tắt" disabled={formSubmitting} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="start_at" label="Bắt đầu (Để trống = Ngay)">
                                <DatePicker showTime format="HH:mm DD/MM/YYYY" style={{ width: '100%' }} disabled={formSubmitting} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="end_at" label="Kết thúc (Để trống = Vô hạn)">
                                <DatePicker showTime format="HH:mm DD/MM/YYYY" style={{ width: '100%' }} disabled={formSubmitting} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="send_notification" valuePropName="checked">
                        <Checkbox disabled={formSubmitting}>Gửi thông báo đẩy đến độc giả (Web Notification) 🔔</Checkbox>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default BreakingNewsList;
