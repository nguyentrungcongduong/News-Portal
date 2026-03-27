import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Card, Button, Space, Tag, Popconfirm, message, Input, Typography, Tooltip, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, SearchOutlined, CopyOutlined } from '@ant-design/icons';
import api from '../services/api';

const { Title, Text } = Typography;

export default function PagesListPage() {
  const navigate = useNavigate();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });

  useEffect(() => {
    loadPages();
  }, [pagination.current]);

  const loadPages = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/admin/pages', {
        params: { page: pagination.current, per_page: pagination.pageSize },
      });
      setPages(res.data.data || []);
      setPagination(prev => ({ ...prev, total: res.data.total || 0 }));
    } catch (err) {
      message.error('Không thể tải danh sách trang');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/admin/pages/${id}`);
      message.success('Đã xóa trang');
      loadPages();
    } catch (err) {
      message.error('Lỗi khi xóa trang');
    }
  };

  const handleDuplicate = async (id) => {
    try {
      await api.post(`/api/admin/pages/${id}/duplicate`);
      message.success('Đã nhân bản trang thành công!');
      loadPages();
    } catch (err) {
      message.error('Lỗi khi nhân bản trang');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await api.patch(`/api/admin/pages/${id}/status`);
      message.success(res.data.message);
      loadPages();
    } catch (err) {
      message.error('Lỗi thay đổi trạng thái');
    }
  };

  const columns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      render: (title, record) => (
        <a onClick={() => navigate(`/pages/${record.id}/edit`)} style={{ fontWeight: 500 }}>
          {title}
        </a>
      ),
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      render: (slug) => <code style={{ fontSize: 12 }}>/{slug}</code>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Switch
          checked={status === 'published'}
          onChange={() => handleToggleStatus(record.id)}
          checkedChildren="Published"
          unCheckedChildren="Draft"
          size="small"
        />
      ),
    },
    {
      title: 'Phiên bản',
      dataIndex: 'version',
      key: 'version',
      render: (v) => <Tag>v{v}</Tag>,
    },
    {
      title: 'Cập nhật',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (date) => new Date(date).toLocaleString('vi-VN'),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem trước">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => {
                const baseUrl = import.meta.env.VITE_FRONTEND_URL || 'https://news-portal-public-gray.vercel.app';
                window.open(`${baseUrl}/page/${record.slug}`, '_blank');
              }}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              size="small"
              type="primary"
              icon={<EditOutlined />}
              onClick={() => navigate(`/pages/${record.id}/edit`)}
            />
          </Tooltip>
          <Tooltip title="Nhân bản">
            <Button
              size="small"
              icon={<CopyOutlined />}
              onClick={() => handleDuplicate(record.id)}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa trang này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Tooltip title="Xóa">
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Filter by search
  const filteredPages = pages.filter(
    (p) => p.title?.toLowerCase().includes(search.toLowerCase()) || p.slug?.includes(search)
  );

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Title level={4} style={{ margin: 0 }}>
            📄 Quản lý trang (Page Builder)
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/pages/create')}
          >
            Tạo trang mới
          </Button>
        </div>

        <Input
          placeholder="Tìm kiếm theo tiêu đề hoặc slug..."
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginBottom: 16, maxWidth: 400 }}
          allowClear
        />

        <Table
          dataSource={filteredPages}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            onChange: (page) => setPagination(prev => ({ ...prev, current: page })),
          }}
        />
      </Card>
    </div>
  );
}
