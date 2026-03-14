import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Modal, Form, Input, Select, message, Card, Space, Typography } from 'antd';
import { UserAddOutlined, EditOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons';
import api from '../services/api';

const { Title } = Typography;
const { Option } = Select;

const UserList = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [form] = Form.useForm();

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/admin/users');
            setData(res.data.data);
        } catch (error) {
            message.error('Lỗi tải danh sách người dùng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreateOrUpdate = async (values) => {
        try {
            if (editingUser) {
                await api.put(`/api/admin/users/${editingUser.id}`, values);
                message.success('Cập nhật thành công');
            } else {
                await api.post('/api/admin/users', values);
                message.success('Tạo người dùng thành công');
            }
            setIsModalOpen(false);
            form.resetFields();
            setEditingUser(null);
            fetchUsers();
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const toggleBlock = async (user) => {
        try {
            await api.put(`/api/admin/users/${user.id}`, { is_blocked: !user.is_blocked });
            message.success(user.is_blocked ? 'Đã bỏ chặn người dùng' : 'Đã chặn người dùng');
            fetchUsers();
        } catch (error) {
            message.error('Lỗi thao tác');
        }
    };

    const columns = [
        {
            title: 'Họ tên',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <div style={{ fontWeight: 'bold' }}>
                    {text} {record.is_blocked && <Tag color="error">Blocked</Tag>}
                </div>
            )
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Vai trò',
            dataIndex: 'role',
            key: 'role',
            render: (role) => {
                const colors = { admin: 'purple', editor: 'blue', author: 'green', user: 'gray' };
                return <Tag color={colors[role]}>{role.toUpperCase()}</Tag>;
            }
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button 
                        type="text" 
                        icon={<EditOutlined />} 
                        onClick={() => {
                            setEditingUser(record);
                            form.setFieldsValue(record);
                            setIsModalOpen(true);
                        }}
                    />
                    <Button 
                        type="text" 
                        danger={!record.is_blocked}
                        icon={record.is_blocked ? <UnlockOutlined /> : <LockOutlined />} 
                        onClick={() => toggleBlock(record)}
                    />
                </Space>
            )
        }
    ];

    return (
        <Card 
            title={<Space><Title level={4} style={{ margin: 0 }}>Quản lý người dùng</Title></Space>}
            extra={
                <Button 
                    type="primary" 
                    icon={<UserAddOutlined />} 
                    onClick={() => {
                        setEditingUser(null);
                        form.resetFields();
                        setIsModalOpen(true);
                    }}
                >
                    Tạo tài khoản Editor/Admin
                </Button>
            }
        >
            <Table 
                dataSource={data} 
                columns={columns} 
                rowKey="id" 
                loading={loading}
            />

            <Modal
                title={editingUser ? "Sửa thông tin" : "Tạo tài khoản mới"}
                open={isModalOpen}
                onOk={() => form.submit()}
                onCancel={() => setIsModalOpen(false)}
                okText="Xác nhận"
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical" onFinish={handleCreateOrUpdate}>
                    <Form.Item name="name" label="Họ tên" rules={[{ required: true }]}>
                        <Input placeholder="Nguyễn Văn A" />
                    </Form.Item>
                    <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                        <Input placeholder="a@example.com" disabled={!!editingUser} />
                    </Form.Item>
                    {!editingUser && (
                        <Form.Item label="Mật khẩu" required>
                            <Space.Compact style={{ width: '100%' }}>
                                <Form.Item
                                    name="password"
                                    noStyle
                                    rules={[{ required: true, min: 8 }]}
                                >
                                    <Input.Password placeholder="Nhập hoặc tạo tự động" />
                                </Form.Item>
                                <Button 
                                    onClick={() => {
                                        const pass = Math.random().toString(36).slice(-10);
                                        form.setFieldsValue({ password: pass });
                                        message.info(`Đã tạo mật khẩu: ${pass}`);
                                    }}
                                >
                                    Tạo ngẫu nhiên
                                </Button>
                            </Space.Compact>
                        </Form.Item>
                    )}
                    <Form.Item name="role" label="Vai trò" rules={[{ required: true }]}>
                        <Select>
                            <Option value="user">User</Option>
                            <Option value="author">Author (Phóng viên)</Option>
                            <Option value="editor">Editor (Biên tập viên)</Option>
                            <Option value="admin">Admin (Quản trị viên)</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default UserList;
