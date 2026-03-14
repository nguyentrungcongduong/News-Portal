import React, { useState, useEffect } from 'react';
import { Table, Tag, Space, Button, Input, message, Modal, Tooltip, Card, Typography } from 'antd';
import { EditOutlined, EyeOutlined, CheckCircleOutlined, CloseOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import dayjs from 'dayjs';

const { Search } = Input;
const { Text, Title } = Typography;

const ReviewList = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 15, total: 0 });
  const [searchText, setSearchText] = useState('');

  const fetchPosts = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, status: 'pending' };
      if (searchText) params.q = searchText;

      const response = await api.get('/api/admin/posts', { params });
      setData(response.data.data);
      setPagination({
        current: response.data.meta.current_page,
        pageSize: response.data.meta.per_page,
        total: response.data.meta.total
      });
    } catch (error) {
      message.error('Lỗi tải danh sách bài viết chờ duyệt');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(1);
  }, [searchText]);

  const handleReview = (id) => {
    navigate(`/review/${id}`);
  };

  const statusColors = {
    pending: 'orange',
    draft: 'default',
    approved: 'cyan',
    published: 'green',
    rejected: 'red',
  };

  const columns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div>
          <Text strong style={{ fontSize: '14px' }}>{text}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Slug: {record.slug}
          </Text>
        </div>
      ),
    },
    {
      title: 'Tác giả',
      dataIndex: 'author',
      key: 'author',
      render: (author) => author?.name || 'N/A',
    },
    {
      title: 'Chuyên mục',
      dataIndex: 'categories',
      key: 'categories',
      render: (categories) => (
        <Space size="small">
          {categories?.map((cat) => (
            <Tag key={cat.id} color="blue">{cat.name}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Ngày gửi',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={statusColors[status] || 'default'}>
          {status?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem và duyệt">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              onClick={() => handleReview(record.id)}
            >
              Review
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title level={4} style={{ margin: 0 }}>
            🔍 Phòng biên tập - Bài viết chờ duyệt
          </Title>
        </div>
        
        <Search
          placeholder="Tìm kiếm bài viết..."
          allowClear
          enterButton="Tìm"
          size="large"
          onSearch={(value) => {
            setSearchText(value);
            fetchPosts(1);
          }}
          style={{ maxWidth: 400, marginBottom: 16 }}
        />
      </Card>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} bài viết`,
          onChange: (page) => fetchPosts(page),
        }}
      />
    </div>
  );
};

export default ReviewList;

