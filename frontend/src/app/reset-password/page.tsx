'use client';

import { Form, Input, Button, message, Card, Typography } from "antd";
import { LockOutlined } from "@ant-design/icons";
import axios from "@/lib/axios";

const { Title, Text } = Typography;

export default function ResetPassword() {
    const onFinish = async (values: any) => {
        try {
            await axios.post("/api/auth/reset-password", values);
            message.success("Đặt lại mật khẩu thành công. Vui lòng đăng nhập với mật khẩu mới");
            window.location.href = "/login";
        } catch (err: any) {
            message.error(err.response?.data?.message || "Đặt lại mật khẩu thất bại");
        }
    };

    return (
        <div style={{ padding: '60px 20px', background: '#f5f5f5', minHeight: 'calc(100vh - 200px)' }}>
            <Card style={{ maxWidth: 450, margin: "auto", borderRadius: '16px' }}>
                <div style={{ textAlign: 'center', marginBottom: 30 }}>
                    <Title level={2}>Đặt lại mật khẩu</Title>
                    <Text type="secondary">Nhập mật khẩu mới của bạn</Text>
                </div>

                <Form layout="vertical" onFinish={onFinish} size="large">
                    <Form.Item
                        label="Mật khẩu mới"
                        name="password"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới' }, { min: 8 }]}
                    >
                        <Input.Password prefix={<LockOutlined />} />
                    </Form.Item>

                    <Form.Item
                        label="Xác nhận mật khẩu"
                        name="password_confirmation"
                        dependencies={['password']}
                        rules={[
                            { required: true },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject('Mật khẩu không khớp');
                                },
                            }),
                        ]}
                    >
                        <Input.Password prefix={<LockOutlined />} />
                    </Form.Item>

                    <Button type="primary" htmlType="submit" block style={{ height: 48 }}>
                        Cập nhật mật khẩu
                    </Button>
                </Form>
            </Card>
        </div>
    );
}
