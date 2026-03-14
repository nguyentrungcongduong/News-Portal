import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Typography } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../services/api';

const { Title } = Typography;

const NotificationAnalytics = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const res = await api.get('/api/admin/notifications/analytics');
                setStats(res.data);
            } catch (error) {
                console.error('Failed to load stats', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (!stats) return null;

    const summaryData = [
        { name: 'Tổng số thông báo', value: stats.summary.total, color: '#1890ff' },
        { name: 'Đã gửi Email', value: stats.summary.email, color: '#52c41a' },
        { name: 'Đã gửi In-App', value: stats.summary.in_app, color: '#faad14' },
    ];

    const chartData = stats.daily.map(item => ({
        date: item.date.split('T')[0],
        count: item.count
    }));

    return (
        <div style={{ padding: 24 }}>
            <Title level={3}>Thống kê hiệu quả thông báo</Title>
            
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={8}>
                    <Card>
                        <Statistic title="Tổng số thông báo đã gửi" value={stats.summary.total} prefix="📨" />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic title="Gửi qua Email" value={stats.summary.email} valueStyle={{ color: '#3f8600' }} prefix="📧" />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic title="Gửi qua In-App" value={stats.summary.in_app} valueStyle={{ color: '#cf1322' }} prefix="🔔" />
                    </Card>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={12}>
                    <Card title="Xu hướng gửi thông báo (7 ngày qua)">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="count" fill="#8884d8" name="Số lượng" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="Chi tiết theo loại">
                        <Table 
                             dataSource={stats.breakdown} 
                             columns={[
                                 { title: 'Loại thông báo', dataIndex: 'type', key: 'type' },
                                 { title: 'Kênh', dataIndex: 'channel', key: 'channel' },
                                 { title: 'Số lượng', dataIndex: 'count', key: 'count' },
                             ]}
                             pagination={false}
                             rowKey={(record) => `${record.type}-${record.channel}`}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default NotificationAnalytics;
