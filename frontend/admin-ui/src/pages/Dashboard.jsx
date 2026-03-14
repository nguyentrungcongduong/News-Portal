  import React, { useState, useEffect } from 'react';
import { Card, Col, Row, Statistic, Table, Tag, Spin, Button, Result, Typography, Space } from 'antd';
import { 
  FileTextOutlined, 
  EyeOutlined, 
  CheckCircleOutlined, 
  HourglassOutlined, 
  FireOutlined,
  LineChartOutlined,
  FolderOutlined,
  UserOutlined
} from '@ant-design/icons';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import api from '../services/api';

const { Title, Text } = Typography;

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchStats = async () => {
    try {
      const response = await api.get(`/api/admin/stats/dashboard`);
      setData(response.data);
      setError(false);
    } catch (error) {
      console.error('Failed to fetch dashboard stats');
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60000); // Poll every minute
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) return (
    <div style={{ textAlign: 'center', padding: '100px' }}>
      <Spin size="large" tip="Đang tải dữ liệu analytics...">
        <div style={{ padding: '20px' }} />
      </Spin>
    </div>
  );

  if (error && !data) {
    return (
      <Result
        status="500"
        title="Analytics Error"
        subTitle="Không thể kết nối với máy chủ thống kê."
        extra={<Button type="primary" onClick={fetchStats}>Thử lại</Button>}
      />
    );
  }

  const { stats, views_chart, top_posts, categories, authors, last_updated } = data || {
    stats: { total_posts: 0, published_posts: 0, total_views: 0, pending_posts: 0 },
    views_chart: [],
    top_posts: [],
    categories: [],
    authors: []
  };

  const topPostColumns = [
    {
      title: 'Bài viết tiêu điểm',
      dataIndex: 'title',
      key: 'title',
      render: (text) => (
        <span style={{ fontWeight: 500 }}><FireOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />{text}</span>
      )
    },
    {
      title: 'Lượt xem',
      dataIndex: 'views',
      key: 'views',
      render: (val) => <Tag color="blue">{val?.toLocaleString()}</Tag>
    }
  ];

  return (
    <div style={{ padding: '0 10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <Title level={3} style={{ margin: 0 }}>Analytics Dashboard</Title>
          <Space>
            {last_updated && <Text type="secondary" style={{ fontSize: '12px' }}>Cập nhật lần cuối: {last_updated}</Text>}
            <Button size="small" onClick={fetchStats} icon={<LineChartOutlined />}>Làm mới</Button>
          </Space>
      </div>
      
      {/* KPI Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" hoverable>
            <Statistic
              title="Tổng bài viết"
              value={stats.total_posts}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" hoverable>
            <Statistic
              title="Đã xuất bản"
              value={stats.published_posts}
              styles={{ content: { color: '#3f8600' } }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" hoverable>
            <Statistic
              title="Tổng lượt xem"
              value={stats.total_views}
              styles={{ content: { color: '#1890ff' } }}
              prefix={<EyeOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" hoverable>
            <Statistic
              title="Chờ duyệt"
              value={stats.pending_posts}
              styles={{ content: { color: '#faad14' } }}
              prefix={<HourglassOutlined />}
            />
          </Card>
        </Col>
      </Row>
      
      {/* Charts Section */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="Xu hướng lượt xem (14 ngày qua)" variant="borderless">
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <AreaChart data={views_chart}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1890ff" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#1890ff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="date" />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="views" 
                    stroke="#1890ff" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorViews)" 
                    name="Lượt xem"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
           <Card title="Top 5 bài viết xem nhiều nhất" variant="borderless">
               <Table 
                 columns={topPostColumns} 
                 dataSource={top_posts} 
                 rowKey="id" 
                 pagination={false} 
                 size="middle"
               />
           </Card>
        </Col>
        
        <Col xs={24} lg={6}>
           <Card title="Theo chuyên mục" variant="borderless" styles={{ body: { padding: 0 }}}>
              <Table 
                dataSource={categories}
                rowKey="name"
                pagination={false}
                size="small"
                columns={[
                  { title: 'Chuyên mục', dataIndex: 'name', key: 'name', render: (t) => <span><FolderOutlined style={{ marginRight: 8 }} />{t}</span> },
                  { title: 'Bài viết', dataIndex: 'post_count', key: 'post_count', align: 'right' }
                ]}
              />
           </Card>
        </Col>

        <Col xs={24} lg={6}>
           <Card title="Theo tác giả" variant="borderless" styles={{ body: { padding: 0 }}}>
              <Table 
                dataSource={authors}
                rowKey="name"
                pagination={false}
                size="small"
                columns={[
                  { title: 'Tác giả', dataIndex: 'name', key: 'name', render: (t) => <span><UserOutlined style={{ marginRight: 8 }} />{t}</span> },
                  { title: 'Bài viết', dataIndex: 'post_count', key: 'post_count', align: 'right' }
                ]}
              />
           </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
