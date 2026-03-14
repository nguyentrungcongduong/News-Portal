'use client';

import { Form, Input, Button, message, Card, Typography } from "antd";
import axios from "@/lib/axios";
import Link from "next/link";
import SocialLoginButtons from "@/components/SocialLoginButtons";

const { Title, Text } = Typography;

export default function Register() {
    const [form] = Form.useForm();

    const onFinish = async (values: any) => {
        try {
            await axios.post("/api/auth/register", values);
            message.success("Đăng ký thành công. Vui lòng đăng nhập");
            window.location.href = "/login";
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || "Đăng ký thất bại";
            message.error(errorMsg);
        }
    };

    return (
        <div style={{ padding: '60px 20px', background: '#f5f5f5', minHeight: 'calc(100vh - 200px)' }}>
            <Card style={{ maxWidth: 450, margin: "auto", borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <div style={{ textAlign: 'center', marginBottom: 30 }}>
                    <Title level={2} style={{ marginBottom: 8 }}>Đăng ký tài khoản</Title>
                    <Text type="secondary">Tham gia cộng đồng News Portal ngay hôm nay</Text>
                </div>

                {/* Social Login - Quick Sign Up */}
                <SocialLoginButtons />

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    requiredMark={false}
                    size="large"
                >
                    <Form.Item
                        label="Họ tên"
                        name="name"
                        rules={[{ required: true, message: 'Vui lòng nhập họ tên' }, { min: 2, message: 'Họ tên phải ít nhất 2 ký tự' }]}
                    >
                        <Input placeholder="Nguyễn Văn A" />
                    </Form.Item>

                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[{ required: true, message: 'Vui lòng nhập email' }, { type: "email", message: 'Email không hợp lệ' }]}
                    >
                        <Input placeholder="example@mail.com" />
                    </Form.Item>

                    <Form.Item
                        label="Mật khẩu"
                        name="password"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }, { min: 8, message: 'Mật khẩu phải ít nhất 8 ký tự' }]}
                    >
                        <Input.Password placeholder="Tối thiểu 8 ký tự" />
                    </Form.Item>

                    <Form.Item
                        label="Nhập lại mật khẩu"
                        name="password_confirmation"
                        dependencies={["password"]}
                        rules={[
                            { required: true, message: 'Vui lòng xác nhận mật khẩu' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue("password") === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject("Mật khẩu không khớp");
                                },
                            }),
                        ]}
                    >
                        <Input.Password placeholder="Xác nhận mật khẩu" />
                    </Form.Item>

                    <Form.Item style={{ marginTop: 20 }}>
                        <Button type="primary" htmlType="submit" block style={{ height: 48, fontWeight: 'bold' }}>
                            Đăng ký ngay
                        </Button>
                    </Form.Item>

                    <div style={{ textAlign: 'center', marginTop: 16 }}>
                        <Text type="secondary">Đã có tài khoản? </Text>
                        <Link href="/login" style={{ color: '#1677ff', fontWeight: 'bold' }}>Đăng nhập</Link>
                    </div>
                </Form>
            </Card>
        </div>
    );
}
