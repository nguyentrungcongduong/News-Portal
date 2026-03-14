import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, message, Card, Modal, Form, Input, Select, DatePicker, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import api from '../services/api';
import dayjs from 'dayjs';

const { Option } = Select;

const NotificationList = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingNotification, setEditingNotification] = useState(null);
    const [form] = Form.useForm();
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

    const fetchNotifications = async (params = {}) => {
        setLoading(true);
        try {
            const response = await api.get(`/api/admin/announcements`, {
                params: {
                    page: params.pagination?.current || 1,
                }
            });
            setData(response.data.data);
            setPagination({
                ...params.pagination,
                total: response.data.total,
            });
        } catch (error) {
            message.error('Không thể tải danh sách thông báo');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const showModal = (notification = null) => {
        setEditingNotification(notification);
        if (notification) {
            form.setFieldsValue({
                ...notification,
                time_range: [
                    notification.start_at ? dayjs(notification.start_at) : null,
                    notification.end_at ? dayjs(notification.end_at) : null
                ]
            });
        } else {
            form.resetFields();
            form.setFieldsValue({ status: 'draft', type: 'breaking' });
        }
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingNotification(null);
    };

    const onFinish = async (values) => {
        const payload = {
            ...values,
            start_at: values.time_range ? values.time_range[0]?.format('YYYY-MM-DD HH:mm:ss') : null,
            end_at: values.time_range ? values.time_range[1]?.format('YYYY-MM-DD HH:mm:ss') : null,
        };
        delete payload.time_range;

        try {
            if (editingNotification) {
                await api.put(`/api/admin/announcements/${editingNotification.id}`, payload);
                message.success('Cập nhật thành công');
            } else {
                await api.post(`/api/admin/announcements`, payload);
                message.success('Tạo thành công');
            }
            setIsModalVisible(false);
            fetchNotifications({ pagination: pagination });
        } catch (error) {
            message.error('Thao tác thất bại');
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await api.patch(`/api/admin/announcements/${id}/status`, { status });
            message.success('Đã cập nhật trạng thái');
            fetchNotifications({ pagination: pagination });
        } catch (error) {
            message.error('Thất bại');
        }
    };

    const handleDelete = async (id) => {
        Modal.confirm({
            title: 'Bạn có chắc muốn xóa thông báo này?',
            onOk: async () => {
                try {
                    await api.delete(`/api/admin/announcements/${id}`);
                    message.success('Đã xóa');
                    fetchNotifications({ pagination: pagination });
                } catch (error) {
                    message.error('Xóa thất bại');
                }
            }
        });
    };

    const columns = [
        {
            title: 'Tiêu đề / Nội dung',
            dataIndex: 'title',
            key: 'title',
            render: (text, record) => (
                <div>
                    <div style={{ fontWeight: 'bold', color: record.type === 'breaking' ? '#f5222d' : 'inherit' }}>
                        {record.type === 'breaking' && <span>⚡ </span>}
                        {text}
                    </div>
                    {record.link && <a href={record.link} target="_blank" rel="noreferrer" style={{ fontSize: '11px' }}>Link chi tiết</a>}
                </div>
            )
        },
        {
            title: 'Loại',
            dataIndex: 'type',
            key: 'type',
            render: (type) => (
                <Tag color={type === 'breaking' ? 'volcano' : 'blue'}>
                    {type === 'breaking' ? 'BREAKING' : 'SYSTEM'}
                </Tag>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const colors = { draft: 'default', active: 'success', expired: 'error' };
                return <Tag color={colors[status]}>{status.toUpperCase()}</Tag>;
            }
        },
        {
            title: 'Hiệu lực',
            key: 'validity',
            render: (_, record) => (
                <div style={{ fontSize: '12px', color: '#888' }}>
                    <div>Từ: {record.start_at ? dayjs(record.start_at).format('DD/MM/YYYY HH:mm') : 'Bắt đầu ngay'}</div>
                    <div>Đến: {record.end_at ? dayjs(record.end_at).format('DD/MM/YYYY HH:mm') : 'Vô thời hạn'}</div>
                </div>
            )
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => showModal(record)} />
                    {record.status !== 'active' ? (
                        <Button icon={<CheckCircleOutlined />} type="primary" onClick={() => handleStatusUpdate(record.id, 'active')} />
                    ) : (
                        <Button icon={<ClockCircleOutlined />} onClick={() => handleStatusUpdate(record.id, 'expired')}>Hết hạn</Button>
                    )}
                    <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.id)} />
                </Space>
            )
        }
    ];

    return (
        <Card 
            title="Quản lý Tin nóng & Thông báo" 
            extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>Tạo thông báo</Button>}
        >
            <Table 
                columns={columns} 
                dataSource={data} 
                rowKey="id"
                loading={loading}
                pagination={pagination}
                onChange={(p) => fetchNotifications({ pagination: p })}
            />

            <Modal
                title={editingNotification ? "Cập nhật thông báo" : "Tạo thông báo mới"}
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                width={600}
            >
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Form.Item name="title" label="Nội dung thông báo" rules={[{ required: true, max: 255 }]}>
                        <Input.TextArea rows={2} placeholder="Ví dụ: Bão số 3 sắp đổ bộ vào miền Trung..." />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={16}>
                            <Form.Item name="link" label="Link bài viết (Nếu có)">
                                <Input placeholder="https://..." />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="type" label="Loại" rules={[{ required: true }]}>
                                <Select>
                                    <Option value="breaking">Tin nóng (Breaking)</Option>
                                    <Option value="system">Hệ thống (System)</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={14}>
                            <Form.Item name="time_range" label="Thời gian hiển thị">
                                <DatePicker.RangePicker showTime style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={10}>
                            <Form.Item name="status" label="Trạng thái">
                                <Select>
                                    <Option value="draft">Nháp (Draft)</Option>
                                    <Option value="active">Kích hoạt (Active)</Option>
                                    <Option value="expired">Hết hạn (Expired)</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item style={{ textAlign: 'right', marginTop: 20 }}>
                        <Space>
                            <Button onClick={handleCancel}>Hủy</Button>
                            <Button type="primary" htmlType="submit">
                                {editingNotification ? "Cập nhật" : "Tạo ngay"}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default NotificationList;
