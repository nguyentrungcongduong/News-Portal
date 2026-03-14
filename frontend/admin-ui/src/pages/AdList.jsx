import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, message, Card, Modal, Form, Input, Select, DatePicker, Row, Col, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, PauseCircleOutlined, PlayCircleOutlined } from '@ant-design/icons';
import api from '../services/api';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

const AdList = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingAd, setEditingAd] = useState(null);
    const [form] = Form.useForm();
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

    const fetchAds = async (params = {}) => {
        setLoading(true);
        try {
            const response = await api.get(`/api/admin/ads`, {
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
            message.error('Không thể tải danh sách quảng cáo');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAds();
    }, []);

    const showModal = (ad = null) => {
        setEditingAd(ad);
        if (ad) {
            form.setFieldsValue({
                ...ad,
                date_range: [
                    ad.start_at ? dayjs(ad.start_at) : null,
                    ad.end_at ? dayjs(ad.end_at) : null
                ]
            });
        } else {
            form.resetFields();
            form.setFieldsValue({ status: 'draft', type: 'image' });
        }
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingAd(null);
    };

    const onFinish = async (values) => {
        const payload = {
            ...values,
            start_at: values.date_range ? values.date_range[0]?.format('YYYY-MM-DD HH:mm:ss') : null,
            end_at: values.date_range ? values.date_range[1]?.format('YYYY-MM-DD HH:mm:ss') : null,
        };
        delete payload.date_range;

        try {
            if (editingAd) {
                await api.put(`/api/admin/ads/${editingAd.id}`, payload);
                message.success('Cập nhật thành công');
            } else {
                await api.post(`/api/admin/ads`, payload);
                message.success('Tạo thành công');
            }
            setIsModalVisible(false);
            fetchAds({ pagination: pagination });
        } catch (error) {
            message.error('Thao tác thất bại');
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await api.patch(`/api/admin/ads/${id}/status`, { status });
            message.success('Đã cập nhật trạng thái');
            fetchAds({ pagination: pagination });
        } catch (error) {
            message.error('Thất bại');
        }
    };

    const handleDelete = async (id) => {
        Modal.confirm({
            title: 'Bạn có chắc muốn xóa quảng cáo này?',
            onOk: async () => {
                try {
                    await api.delete(`/api/admin/ads/${id}`);
                    message.success('Đã xóa');
                    fetchAds({ pagination: pagination });
                } catch (error) {
                    message.error('Xóa thất bại');
                }
            }
        });
    };

    const columns = [
        {
            title: 'Tên quảng cáo',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <div>
                    <div style={{ fontWeight: 'bold' }}>{text}</div>
                    <Tag color="geekblue">{record.position.toUpperCase()}</Tag>
                </div>
            )
        },
        {
            title: 'Loại',
            dataIndex: 'type',
            key: 'type',
            render: (type) => <Tag>{type.toUpperCase()}</Tag>
        },
        {
            title: 'Thống kê',
            key: 'stats',
            render: (_, record) => (
                <div style={{ fontSize: '12px' }}>
                    <div>Lượt xem: <b>{record.impressions}</b> / {record.quota_impressions || '∞'}</div>
                    <div>Lượt click: <b>{record.clicks}</b> / {record.quota_clicks || '∞'}</div>
                </div>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const colors = { draft: 'orange', active: 'green', paused: 'blue', stopped: 'red' };
                return <Tag color={colors[status]}>{status.toUpperCase()}</Tag>;
            }
        },
        {
            title: 'Thời gian',
            key: 'time',
            render: (_, record) => (
                <div style={{ fontSize: '12px', color: '#888' }}>
                    {record.start_at ? dayjs(record.start_at).format('DD/MM/YYYY') : 'N/A'} - 
                    {record.end_at ? dayjs(record.end_at).format('DD/MM/YYYY') : 'N/A'}
                </div>
            )
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => showModal(record)} />
                    {record.status === 'active' ? (
                        <Button icon={<PauseCircleOutlined />} onClick={() => handleStatusUpdate(record.id, 'paused')} />
                    ) : (
                        <Button icon={<PlayCircleOutlined />} type="primary" onClick={() => handleStatusUpdate(record.id, 'active')} />
                    )}
                    <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.id)} />
                </Space>
            )
        }
    ];

    return (
        <Card 
            title="Quản lý quảng cáo" 
            extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>Thêm quảng cáo</Button>}
        >
            <Table 
                columns={columns} 
                dataSource={data} 
                rowKey="id"
                loading={loading}
                pagination={pagination}
                onChange={(p) => fetchAds({ pagination: p })}
            />

            <Modal
                title={editingAd ? "Cập nhật quảng cáo" : "Thêm quảng cáo mới"}
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                width={700}
            >
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Row gutter={16}>
                        <Col span={16}>
                            <Form.Item name="name" label="Tên quảng cáo" rules={[{ required: true }]}>
                                <Input placeholder="Ví dụ: Banner Header khuyến mãi 2026" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="position" label="Vị trí" rules={[{ required: true }]}>
                                <Select>
                                    <Option value="header">Header</Option>
                                    <Option value="sidebar">Sidebar</Option>
                                    <Option value="in_article">Trong bài viết</Option>
                                    <Option value="footer">Footer</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="type" label="Loại" rules={[{ required: true }]}>
                                <Select onChange={() => form.setFieldsValue({ html_code: '', image_url: '' })}>
                                    <Option value="image">Hình ảnh</Option>
                                    <Option value="html">HTML Code</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={16}>
                             <Form.Item noStyle shouldUpdate={(prev, curr) => prev.type !== curr.type}>
                                {({ getFieldValue }) => 
                                    getFieldValue('type') === 'image' ? (
                                        <Form.Item name="image_url" label="Link hình ảnh" rules={[{ required: true }]}>
                                            <Input placeholder="URL từ Cloudinary hoặc bên ngoài" />
                                        </Form.Item>
                                    ) : (
                                        <Form.Item name="html_code" label="Mã HTML/Iframe" rules={[{ required: true }]}>
                                            <Input.TextArea rows={3} placeholder="Dán mã nhúng quảng cáo tại đây" />
                                        </Form.Item>
                                    )
                                }
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="link" label="Đường dẫn (URL Clicks)">
                                <Input placeholder="https://example.com/promo" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="date_range" label="Thời gian chạy">
                                <RangePicker style={{ width: '100% '}} showTime />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="quota_impressions" label="Hạn mức hiển thị (Impressions)">
                                <InputNumber style={{ width: '100%' }} placeholder="Để trống nếu vô hạn" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="quota_clicks" label="Hạn mức Click">
                                <InputNumber style={{ width: '100%' }} placeholder="Để trống nếu vô hạn" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="status" label="Trạng thái ban đầu">
                                <Select>
                                    <Option value="draft">Nháp (Draft)</Option>
                                    <Option value="active">Kích hoạt (Active)</Option>
                                    <Option value="paused">Tạm dừng (Paused)</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item style={{ textAlign: 'right', marginTop: 20 }}>
                        <Space>
                            <Button onClick={handleCancel}>Hủy</Button>
                            <Button type="primary" htmlType="submit">
                                {editingAd ? "Cập nhật" : "Tạo ngay"}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default AdList;
