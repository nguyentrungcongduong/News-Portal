import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Button, List, Typography, Space, message, Flex } from 'antd';
import { 
    ExclamationCircleOutlined, 
    FileTextOutlined, 
    UserDeleteOutlined, 
    EyeInvisibleOutlined,
    CheckCircleOutlined,
    HistoryOutlined
} from '@ant-design/icons';
import api from '../services/api';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const ModerationDashboard = () => {
    const [overview, setOverview] = useState({});
    const [logs, setLogs] = useState([]);
    const [analytics, setAnalytics] = useState({ controversial_posts: [], risky_users: [] });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const fetchOverview = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/admin/moderation/overview');
            setOverview(res.data);
            
            const logsRes = await api.get('/api/admin/moderation/logs');
            setLogs(logsRes.data);

            const analyticsRes = await api.get('/api/admin/moderation/comment-analytics');
            setAnalytics(analyticsRes.data);
        } catch (error) {
            message.error('Không thể tải dữ liệu kiểm duyệt');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOverview();
    }, []);

    const actionColors = {
        approve_post: 'green',
        approve_comment: 'green',
        publish_post: 'gold',
        reject_post: 'red',
        reject_comment: 'red',
        hide_comment: 'orange',
        delete_post: 'volcano',
        delete_comment: 'volcano',
        submit_post: 'blue',
        archive_post: 'gray',
        ignore_reports: 'cyan',
        block_user: 'magenta'
    };

    return (
        <div style={{ padding: '0px' }}>
            <Title level={3} style={{ marginBottom: 24 }}>Moderation Dashboard (Trung tâm kiểm soát)</Title>
            
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card onClick={() => navigate('/comments?status=reported')} style={{ cursor: 'pointer' }}>
                        <Statistic 
                            title="Bình luận bị báo cáo" 
                            value={overview.reported_comments} 
                            prefix={<ExclamationCircleOutlined />} 
                            styles={{ content: { color: '#cf1322' } }}
                        />
                        <Text type="secondary" style={{ fontSize: '12px' }}>Cần xử lý ngay</Text>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card onClick={() => navigate('/posts?status=pending')} style={{ cursor: 'pointer' }}>
                        <Statistic 
                            title="Bài viết chờ duyệt" 
                            value={overview.pending_posts} 
                            prefix={<FileTextOutlined />} 
                        />
                        <Text type="secondary" style={{ fontSize: '12px' }}>Đang đợi biên tập</Text>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card onClick={() => navigate('/comments?status=hidden')} style={{ cursor: 'pointer' }}>
                        <Statistic 
                            title="Nội dung đã ẩn" 
                            value={overview.hidden_comments} 
                            prefix={<EyeInvisibleOutlined />} 
                            styles={{ content: { color: '#fa8c16' } }}
                        />
                        <Text type="secondary" style={{ fontSize: '12px' }}>Do vi phạm hoặc auto-hide</Text>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card style={{ cursor: 'default' }}>
                        <Statistic 
                            title="Người dùng bị chặn" 
                            value={overview.blocked_users} 
                            prefix={<UserDeleteOutlined />} 
                        />
                        <Text type="secondary" style={{ fontSize: '12px' }}>Vi phạm chính sách</Text>
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col span={24} lg={16}>
                    <Card title={<><HistoryOutlined /> Nhật ký kiểm duyệt gần đây</>}>
                        <Table 
                            dataSource={logs} 
                            rowKey="id"
                            pagination={false}
                            size="small"
                            columns={[
                                {
                                    title: 'Thời gian',
                                    dataIndex: 'created_at',
                                    key: 'time',
                                    render: (t) => dayjs(t).format('HH:mm DD/MM'),
                                    width: 120
                                },
                                {
                                    title: 'Admin',
                                    dataIndex: ['admin', 'name'],
                                    key: 'admin',
                                    render: (name) => <Text strong>{name}</Text>
                                },
                                {
                                    title: 'Hành động',
                                    dataIndex: 'action',
                                    key: 'action',
                                    render: (a) => <Tag color={actionColors[a]}>{a.toUpperCase()}</Tag>
                                },
                                {
                                    title: 'Đối tượng',
                                    key: 'target',
                                    render: (_, record) => (
                                        <Text type="secondary">{record.target_type} #{record.target_id}</Text>
                                    )
                                },
                                {
                                    title: 'Lý do',
                                    dataIndex: 'reason',
                                    key: 'reason',
                                    render: (r) => r || '-'
                                }
                            ]}
                        />
                    </Card>
                </Col>
                <Col span={24} lg={8}>
                    <Card title="Quick Actions (Phím nóng)">
                        <Flex vertical gap="small" style={{ width: '100%' }}>
                            <Button 
                                block 
                                icon={<ExclamationCircleOutlined />} 
                                onClick={() => navigate('/comments?status=reported')}
                                danger
                            >
                                Xem tất cả các báo cáo
                            </Button>
                            <Button 
                                block 
                                icon={<CheckCircleOutlined />}
                                onClick={() => navigate('/posts?status=pending')}
                            >
                                Duyệt bài viết mới
                            </Button>
                        </Flex>
                        <div style={{ marginTop: 20 }}>
                            <Text strong>Quy tắc tự động ứng dụng:</Text>
                            <ul style={{ paddingLeft: 20, marginTop: 8, fontSize: '13px', color: '#666' }}>
                                <li>5 Reports &rarr; Tự động ẩn bài</li>
                                <li>Chặn user &rarr; Reject toàn bộ comment cũ</li>
                                <li>Spam content &rarr; Gắn cờ Reported</li>
                            </ul>
                        </div>
                    </Card>
                </Col>
            </Row>
            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col span={24} lg={12}>
                    <Card title="Bài viết gây tranh cãi (nhiều report nhất)">
                         <Table 
                            dataSource={analytics.controversial_posts} 
                            rowKey="id"
                            pagination={false}
                            size="small"
                            columns={[
                                {
                                    title: 'Tiêu đề',
                                    dataIndex: 'title',
                                    key: 'title',
                                    render: (title, record) => <a href={`/post/${record.slug}`} target="_blank" rel="noreferrer">{title}</a>
                                },
                                {
                                    title: 'Báo cáo',
                                    dataIndex: 'reported_comments_count',
                                    key: 'reported',
                                    render: (count) => <Tag color="error">{count} 🚩</Tag>
                                }
                            ]}
                        />
                    </Card>
                </Col>
                <Col span={24} lg={12}>
                    <Card title="Người dùng rủi ro cao">
                        <Table 
                            dataSource={analytics.risky_users} 
                            rowKey="id"
                            pagination={false}
                            size="small"
                            columns={[
                                {
                                    title: 'Người dùng',
                                    key: 'user',
                                    render: (_, record) => (
                                        <div>
                                            <div style={{ fontWeight: 'bold' }}>{record.name}</div>
                                            <div style={{ fontSize: '11px', color: '#888' }}>{record.email}</div>
                                        </div>
                                    )
                                },
                                {
                                    title: 'Trust Score',
                                    dataIndex: 'trust_score',
                                    key: 'trust',
                                    render: (s) => <Tag color={s < 0 ? 'red' : 'warning'}>{s}</Tag>
                                },
                                {
                                    title: 'Vi phạm',
                                    dataIndex: 'bad_comments_count',
                                    key: 'bad',
                                    render: (c) => <Tag color="gray">{c} lần</Tag>
                                }
                            ]}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default ModerationDashboard;
