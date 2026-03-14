import React, { useState, useEffect } from 'react';
import { Table, Card, Select, Input, DatePicker, Button, Space, Tag, Row, Col, Drawer, Descriptions, Typography, message } from 'antd';
import { SearchOutlined, FileTextOutlined, UserOutlined, CalendarOutlined, FilterOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Text, Title } = Typography;

import api from '../services/api';

const AuditLogList = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 50, total: 0 });
  const [filters, setFilters] = useState({
    action: '',
    subject_type: '',
    user_id: '',
    date_from: '',
    date_to: '',
  });
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/admin/audit-logs', {
        params: {
          ...filters,
          page: pagination.current,
          per_page: pagination.pageSize
        }
      });

      const result = response.data;
      setData(result.data);
      setPagination(prev => ({
        ...prev,
        total: result.meta.total,
        current: result.meta.current_page,
        pageSize: result.meta.per_page,
      }));
    } catch (error) {
      if (error.response?.status === 403) {
        message.error('Chỉ Admin mới có quyền xem Audit Logs');
        navigate('/dashboard');
        return;
      }
      console.error('Error fetching audit logs:', error);
      message.error('Lỗi tải Audit Logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filters, pagination.current, pagination.pageSize]);

  const getActionColor = (action) => {
    if (action.includes('.create') || action.includes('.approve') || action.includes('.publish')) {
      return 'green'; // 🟢 Create / Approve
    }
    if (action.includes('.update') || action.includes('.review') || action.includes('.submit')) {
      return 'orange'; // 🟡 Update / Review
    }
    if (action.includes('.delete') || action.includes('.reject') || action.includes('.block')) {
      return 'red'; // 🔴 Delete / Block
    }
    return 'blue';
  };

  const getActionLabel = (action) => {
    const labels = {
      'post.create': 'Tạo bài viết',
      'post.update': 'Cập nhật bài viết',
      'post.submit_review': 'Gửi duyệt',
      'post.approve': 'Duyệt bài',
      'post.reject': 'Từ chối bài',
      'post.publish': 'Xuất bản',
      'post.delete': 'Xóa bài viết',
      'comment.delete': 'Xóa bình luận',
      'comment.block': 'Chặn bình luận',
      'user.block': 'Chặn người dùng',
      'role.assign': 'Gán quyền',
    };
    return labels[action] || action;
  };

  const handleViewDetails = (record) => {
    setSelectedLog(record);
    setDrawerVisible(true);
  };

  const columns = [
    {
      title: 'Thời gian',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY HH:mm:ss') : '-',
      sorter: (a, b) => dayjs(a.created_at).unix() - dayjs(b.created_at).unix(),
    },
    {
      title: 'Người thực hiện',
      dataIndex: 'user',
      key: 'user',
      width: 200,
      render: (user) => (
        <Space>
          <UserOutlined />
          <Text strong>{user?.name || 'System'}</Text>
          {user?.role && <Tag size="small">{user.role}</Tag>}
        </Space>
      ),
    },
    {
      title: 'Hành động',
      dataIndex: 'action',
      key: 'action',
      width: 200,
      render: (action) => (
        <Tag variant="filled" color={getActionColor(action)}>
          {getActionLabel(action)}
        </Tag>
      ),
      filters: [
        { text: 'Tạo bài viết', value: 'post.create' },
        { text: 'Cập nhật', value: 'post.update' },
        { text: 'Duyệt', value: 'post.approve' },
        { text: 'Từ chối', value: 'post.reject' },
        { text: 'Xuất bản', value: 'post.publish' },
        { text: 'Xóa', value: 'delete' },
      ],
      onFilter: (value, record) => record.action.includes(value),
    },
    {
      title: 'Module',
      dataIndex: 'subject_type',
      key: 'subject_type',
      width: 120,
      render: (type) => <Tag>{type}</Tag>,
      filters: [
        { text: 'Post', value: 'Post' },
        { text: 'Comment', value: 'Comment' },
        { text: 'User', value: 'User' },
      ],
      onFilter: (value, record) => record.subject_type === value,
    },
    {
      title: 'ID Đối tượng',
      dataIndex: 'subject_id',
      key: 'subject_id',
      width: 100,
      render: (id, record) => (
        <Text code>{id || '-'}</Text>
      ),
    },
    {
      title: 'IP Address',
      dataIndex: 'ip',
      key: 'ip',
      width: 150,
      render: (ip) => <Text type="secondary">{ip || '-'}</Text>,
    },
    {
      title: 'Chi tiết',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Button type="link" onClick={() => handleViewDetails(record)}>
          Xem
        </Button>
      ),
    },
  ];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleDateRangeChange = (dates) => {
    if (dates) {
      setFilters(prev => ({
        ...prev,
        date_from: dates[0].format('YYYY-MM-DD'),
        date_to: dates[1].format('YYYY-MM-DD 23:59:59'),
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        date_from: '',
        date_to: '',
      }));
    }
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleTableChange = (newPagination) => {
    setPagination(prev => ({
      ...prev,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    }));
  };

  return (
    <div style={{ padding: '0 8px' }}>
      <Card variant="borderless" style={{ borderRadius: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Title level={3} style={{ margin: 0 }}>Audit Logs</Title>
            <Text type="secondary">Lịch sử hoạt động hệ thống - Chỉ Admin</Text>
          </Col>
        </Row>

        {/* Filters */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Select
              placeholder="Lọc theo hành động"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => handleFilterChange('action', value)}
            >
              <Option value="post.create">Tạo bài viết</Option>
              <Option value="post.update">Cập nhật</Option>
              <Option value="post.approve">Duyệt</Option>
              <Option value="post.reject">Từ chối</Option>
              <Option value="post.publish">Xuất bản</Option>
              <Option value="post.delete">Xóa bài viết</Option>
              <Option value="comment.delete">Xóa bình luận</Option>
              <Option value="user.block">Chặn người dùng</Option>
            </Select>
          </Col>
          <Col span={6}>
            <Select
              placeholder="Lọc theo module"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => handleFilterChange('subject_type', value)}
            >
              <Option value="Post">Post</Option>
              <Option value="Comment">Comment</Option>
              <Option value="User">User</Option>
            </Select>
          </Col>
          <Col span={8}>
            <RangePicker
              style={{ width: '100%' }}
              onChange={handleDateRangeChange}
              placeholder={['Từ ngày', 'Đến ngày']}
            />
          </Col>
          <Col span={4}>
            <Button
              type="primary"
              icon={<FilterOutlined />}
              onClick={fetchLogs}
              block
            >
              Lọc
            </Button>
          </Col>
        </Row>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} bản ghi`,
            pageSizeOptions: ['20', '50', '100'],
          }}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
        />

        {/* Detail Drawer */}
        <Drawer
          title="Chi tiết Audit Log"
          placement="right"
          size="large"
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
        >
          {selectedLog && (
            <div>
              <Descriptions column={1} bordered>
                <Descriptions.Item label="Thời gian">
                  {dayjs(selectedLog.created_at).format('DD/MM/YYYY HH:mm:ss')}
                </Descriptions.Item>
                <Descriptions.Item label="Người thực hiện">
                  <Space>
                    <UserOutlined />
                    <Text strong>{selectedLog.user?.name || 'System'}</Text>
                    {selectedLog.user?.role && <Tag>{selectedLog.user.role}</Tag>}
                    {selectedLog.user?.email && <Text type="secondary">({selectedLog.user.email})</Text>}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Hành động">
                  <Tag color={getActionColor(selectedLog.action)}>
                    {getActionLabel(selectedLog.action)}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Module">
                  <Tag>{selectedLog.subject_type}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="ID Đối tượng">
                  <Text code>{selectedLog.subject_id || '-'}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="IP Address">
                  <Text code>{selectedLog.ip || '-'}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="User Agent">
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {selectedLog.user_agent || '-'}
                  </Text>
                </Descriptions.Item>
              </Descriptions>

              {/* Before/After */}
              {(selectedLog.before || selectedLog.after) && (
                <div style={{ marginTop: 24 }}>
                  <Title level={5}>Thay đổi chi tiết</Title>
                  <Row gutter={16}>
                    {selectedLog.before && (
                      <Col span={12}>
                        <Card size="small" title="Trước" style={{ backgroundColor: '#fff7e6' }}>
                          <pre style={{ fontSize: 12, margin: 0 }}>
                            {JSON.stringify(selectedLog.before, null, 2)}
                          </pre>
                        </Card>
                      </Col>
                    )}
                    {selectedLog.after && (
                      <Col span={12}>
                        <Card size="small" title="Sau" style={{ backgroundColor: '#f6ffed' }}>
                          <pre style={{ fontSize: 12, margin: 0 }}>
                            {JSON.stringify(selectedLog.after, null, 2)}
                          </pre>
                        </Card>
                      </Col>
                    )}
                  </Row>
                </div>
              )}
            </div>
          )}
        </Drawer>
      </Card>
    </div>
  );
};

export default AuditLogList;

