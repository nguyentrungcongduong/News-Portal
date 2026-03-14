import React, { useState, useEffect } from 'react';
import { Table, Switch, message, Card, Typography } from 'antd';
import { BellOutlined, MailOutlined } from '@ant-design/icons';
import api from '../services/api';

const { Title, Text } = Typography;

const NotificationPreferences = () => {
    const [settings, setSettings] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/notification-settings');
            setSettings(res.data);
        } catch (error) {
            message.error('Lỗi tải cài đặt');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleUpdate = async (type, channel, value) => {
        try {
            // Optimistic update
            const newSettings = settings.map(s => 
                s.type === type ? { ...s, [channel]: value } : s
            );
            setSettings(newSettings);

            await api.post('/api/notification-settings', {
                type, channel, value
            });
            message.success('Đã lưu thay đổi');
        } catch (error) {
            message.error('Lỗi lưu cài đặt');
            fetchSettings(); // Revert
        }
    };

    const typeLabels = {
        'comment': 'Bình luận mới',
        'breaking_news': 'Tin nóng (Breaking News)',
        'post_approved': 'Trạng thái bài viết',
        'system_alert': 'Cảnh báo hệ thống',
        'comment_report': 'Báo cáo vi phạm'
    };

    const columns = [
        {
            title: 'Loại thông báo',
            dataIndex: 'type',
            key: 'type',
            render: (text) => <Text strong>{typeLabels[text] || text}</Text>
        },
        {
            title: channel => <span><BellOutlined /> Thông báo trên Web</span>,
            dataIndex: 'in_app',
            key: 'in_app',
            align: 'center',
            render: (checked, record) => (
                <Switch 
                    checked={checked} 
                    onChange={(val) => handleUpdate(record.type, 'in_app', val)} 
                />
            )
        },
        {
            title: channel => <span><MailOutlined /> Email</span>,
            dataIndex: 'email',
            key: 'email',
            align: 'center',
            render: (checked, record) => (
                <Switch 
                    checked={checked} 
                    onChange={(val) => handleUpdate(record.type, 'email', val)} 
                />
            )
        }
    ];

    return (
        <Card title="Cài đặt thông báo" bordered={false}>
            <Table 
                dataSource={settings} 
                columns={columns} 
                rowKey="type" 
                loading={loading}
                pagination={false}
            />
        </Card>
    );
};

export default NotificationPreferences;
