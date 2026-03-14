import React from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const onFinish = async (values) => {
    try {
        const response = await login(values);
        message.success('Đăng nhập thành công!');
        
        // Role-based redirect - Authors should NOT access admin panel
        const user = response.data.user;
        
        switch (user.role) {
            case 'admin':
            case 'editor':
                // Admin và Editor vào admin panel
                navigate('/dashboard');
                break;
            case 'author':
                // ❌ Author KHÔNG được vào admin panel - redirect về workspace riêng
                window.location.href = 'http://localhost:3000/author';
                break;
            default:
                navigate('/dashboard');
        }
    } catch (error) {
        console.error('Login error:', error);
        let msg = 'Đăng nhập thất bại!';
        if (error.response?.data?.message) {
            msg = error.response.data.message;
        } else if (error.message) {
             msg = error.message;
        }
        message.error(msg);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
      <Card title="CMS Admin Login" style={{ width: 400, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
        <Form
          name="login_form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: 'Vui lòng nhập Email!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="admin@example.com" />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập Password!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="******" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
