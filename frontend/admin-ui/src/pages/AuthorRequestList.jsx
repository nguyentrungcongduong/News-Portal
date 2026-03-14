import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Modal, Input, message, Card, Space, Typography } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, UserOutlined } from '@ant-design/icons';
import api from '../services/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

const AuthorRequestList = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [processModal, setProcessModal] = useState({ open: false, record: null, status: '' });
    const [adminNote, setAdminNote] = useState('');

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/admin/author-requests?status=pending');
            setData(res.data.data);
        } catch (error) {
            message.error('Lỗi tải danh sách yêu cầu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleProcess = async () => {
        try {
            await api.post(`/api/admin/author-requests/${processModal.record.id}/process`, {
                status: processModal.status,
                admin_note: adminNote
            });
            message.success('Xử lý thành công');
            setProcessModal({ open: false, record: null, status: '' });
            setAdminNote('');
            fetchRequests();
        } catch (error) {
            message.error('Lỗi xử lý yêu cầu');
        }
    };

    const columns = [
        {
            title: 'Người dùng',
            key: 'user',
            render: (_, record) => (
                <Space>
                    <UserOutlined />
                    <div>
                        <div style={{ fontWeight: 'bold' }}>{record.user.name}</div>
                        <div style={{ fontSize: '12px', color: '#888' }}>{record.user.email}</div>
                    </div>
                </Space>
            )
        },
        {
            title: 'Bio/Giới thiệu',
            dataIndex: 'bio',
            key: 'bio',
            width: 300,
            render: (text) => <div style={{ fontSize: '13px' }}>{text}</div>
        },
        {
            title: 'Portfolio',
            dataIndex: 'portfolio_url',
            key: 'portfolio',
            render: (url) => url ? <a href={url} target="_blank" rel="noreferrer">Link</a> : '-'
        },
        {
            title: 'Thời gian',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date) => dayjs(date).format('HH:mm DD/MM/YYYY')
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button 
                        type="primary" 
                        icon={<CheckCircleOutlined />} 
                        onClick={() => setProcessModal({ open: true, record, status: 'approved' })}
                    >
                        Duyệt
                    </Button>
                    <Button 
                        danger 
                        icon={<CloseCircleOutlined />} 
                        onClick={() => setProcessModal({ open: true, record, status: 'rejected' })}
                    >
                        Từ chối
                    </Button>
                </Space>
            )
        }
    ];

    return (
        <Card title={<Title level={4}>Yêu cầu đăng ký Tác giả (Authors)</Title>}>
            <Table 
                dataSource={data} 
                columns={columns} 
                rowKey="id" 
                loading={loading}
            />

            <Modal
                title={processModal.status === 'approved' ? "Phê duyệt Tác giả" : "Từ chối yêu cầu"}
                open={processModal.open}
                onOk={handleProcess}
                onCancel={() => setProcessModal({ open: false, record: null, status: '' })}
                okText="Xác nhận"
                cancelText="Hủy"
            >
                <div style={{ marginBottom: 16 }}>
                    <Text strong>Người dùng: </Text>
                    <Text>{processModal.record?.user.name} ({processModal.record?.user.email})</Text>
                </div>
                <Text style={{ marginBottom: 8, display: 'block' }}>Ghi chú (tùy chọn):</Text>
                <TextArea 
                    rows={4} 
                    value={adminNote} 
                    onChange={e => setAdminNote(e.target.value)} 
                    placeholder="Lý do từ chối hoặc lời chào mừng..."
                />
            </Modal>
        </Card>
    );
};

export default AuthorRequestList;
