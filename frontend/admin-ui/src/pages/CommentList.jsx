import React, { useEffect, useMemo, useState } from 'react';
import { Table, Button, Space, Tag, message, Card, Select, Input, Popconfirm, Flex } from 'antd';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';

const { Search } = Input;
const { Option } = Select;

const CommentList = () => {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [status, setStatus] = useState(searchParams.get('status') || 'pending');
  const [keyword, setKeyword] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });

  const fetchComments = async ({ current = pagination.current } = {}) => {
    setLoading(true);

    try {
      const response = await api.get('/api/admin/comments', {
        params: {
          status,
          keyword,
          page: current,
        },
      });

      setData(response.data.data);
      setPagination((prev) => ({
        ...prev,
        current,
        total: response.data.total,
        pageSize: response.data.per_page || prev.pageSize,
      }));
    } catch (error) {
      message.error('Không thể tải danh sách bình luận');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const nextStatus = searchParams.get('status') || 'pending';
    setStatus(nextStatus);
    setPagination((prev) => ({ ...prev, current: 1 }));
  }, [searchParams]);

  useEffect(() => {
    fetchComments({ current: pagination.current });
  }, [status, keyword]);

  const setRowLoading = (id, value) => {
    setActionLoading((prev) => ({ ...prev, [id]: value }));
  };

  const removeRow = (id) => {
    setData((prev) => prev.filter((item) => item.id !== id));
    setPagination((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
  };

  const patchRow = (id, updater) => {
    setData((prev) => prev.map((item) => (item.id === id ? updater(item) : item)));
  };

  const handleAction = async (id, action) => {
    setRowLoading(id, true);

    try {
      await api.post(`/api/admin/comments/${id}/${action}`);

      const msgMap = {
        approve: 'Đã duyệt bình luận',
        reject: 'Đã từ chối bình luận',
        ignore: 'Đã bỏ qua báo cáo',
        hide: 'Đã ẩn bình luận',
        'block-user': 'Đã khóa tài khoản người dùng',
        'unblock-user': 'Đã gỡ khóa tài khoản người dùng',
      };

      message.success(msgMap[action] || 'Thành công');

      if (['approve', 'reject', 'hide', 'ignore'].includes(action)) {
        removeRow(id);
      } else if (action === 'block-user') {
        patchRow(id, (item) => ({
          ...item,
          user: item.user ? { ...item.user, is_blocked: true } : item.user,
          status: 'rejected',
        }));
      } else if (action === 'unblock-user') {
        patchRow(id, (item) => ({
          ...item,
          user: item.user ? { ...item.user, is_blocked: false } : item.user,
        }));
      }
    } catch (error) {
      message.error('Thực hiện thất bại');
    } finally {
      setRowLoading(id, false);
    }
  };

  const handleDelete = async (id) => {
    setRowLoading(id, true);

    try {
      await api.delete(`/api/admin/comments/${id}`);
      message.success('Đã xóa bình luận');
      removeRow(id);
    } catch (error) {
      message.error('Xóa thất bại');
    } finally {
      setRowLoading(id, false);
    }
  };

  const columns = useMemo(() => [
    {
      title: 'Tác giả',
      key: 'author',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.user?.name || 'Ẩn danh'}</div>
          <div style={{ fontSize: '12px', color: '#888' }}>{record.user?.email}</div>
          {record.user && (
            <div style={{ fontSize: '11px', marginTop: 4 }}>
              Trust Score:
              <Tag color={record.user.trust_score >= 10 ? 'success' : 'warning'} style={{ marginLeft: 4 }}>
                {record.user.trust_score ?? 0}
              </Tag>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Nội dung',
      dataIndex: 'content',
      key: 'content',
      width: '35%',
    },
    {
      title: 'Bài viết',
      dataIndex: 'post',
      key: 'post',
      render: (post) => (post ? <a href={`/post/${post.slug}`} target="_blank" rel="noreferrer">{post.title}</a> : 'N/A'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (currentStatus, record) => {
        const colors = {
          pending: 'orange',
          approved: 'green',
          rejected: 'red',
          reported: 'volcano',
          hidden: 'gray',
        };

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <Tag color={colors[currentStatus]}>{currentStatus.toUpperCase()}</Tag>

            {record.spam_reason && (
              <div style={{ fontSize: '11px', color: '#888', fontStyle: 'italic' }}>
                Lý do: {record.spam_reason}
              </div>
            )}

            {record.reports_count > 0 && (
              <div style={{ marginTop: 4 }}>
                <Tag color="error">{record.reports_count} báo cáo</Tag>
                {record.reports?.length > 0 && (
                  <div style={{ fontSize: '11px', color: '#ff4d4f', maxWidth: '150px' }}>
                    {Array.from(new Set(record.reports.map((report) => report.reason))).join(', ')}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => {
        const busy = Boolean(actionLoading[record.id]);

        return (
          <Flex vertical gap="small">
            <Space>
              {(status === 'pending' || status === 'reported') && (
                <Button loading={busy} type="primary" size="small" onClick={() => handleAction(record.id, 'approve')}>
                  {status === 'reported' ? 'Bỏ qua & Duyệt' : 'Duyệt'}
                </Button>
              )}
              {(status === 'approved' || status === 'reported') && (
                <Button loading={busy} size="small" onClick={() => handleAction(record.id, 'hide')}>Ẩn</Button>
              )}
              {status !== 'rejected' && status !== 'hidden' && (
                <Button loading={busy} danger size="small" onClick={() => handleAction(record.id, 'reject')}>Từ chối</Button>
              )}
              <Button loading={busy} danger size="small" type="link" onClick={() => handleDelete(record.id)}>Xóa</Button>
            </Space>

            <Space>
              {!record.user?.is_blocked ? (
                <Popconfirm
                  title="Khóa tài khoản?"
                  description="Người dùng này sẽ không thể bình luận và tất cả bình luận cũ sẽ bị ẩn."
                  onConfirm={() => handleAction(record.id, 'block-user')}
                  okText="Đồng ý"
                  cancelText="Hủy"
                >
                  <Button loading={busy} danger type="dashed" size="small">Chặn User</Button>
                </Popconfirm>
              ) : (
                <Button
                  loading={busy}
                  type="dashed"
                  size="small"
                  onClick={() => handleAction(record.id, 'unblock-user')}
                  style={{ color: '#52c41a', borderColor: '#52c41a' }}
                >
                  Gỡ Chặn
                </Button>
              )}
            </Space>
          </Flex>
        );
      },
    },
  ], [actionLoading, status]);

  return (
    <Card
      title="Quản lý bình luận"
      variant="outlined"
      extra={(
        <Space>
          <Search
            placeholder="Tìm nội dung..."
            allowClear
            onSearch={(value) => {
              setPagination((prev) => ({ ...prev, current: 1 }));
              setKeyword(value.trim());
            }}
            style={{ width: 250 }}
          />
          <Select
            value={status}
            onChange={(value) => {
              setPagination((prev) => ({ ...prev, current: 1 }));
              setStatus(value);
            }}
            style={{ width: 150 }}
          >
            <Option value="pending">Chờ lọc</Option>
            <Option value="approved">Đã duyệt</Option>
            <Option value="reported">Bị báo cáo</Option>
            <Option value="hidden">Đã ẩn</Option>
            <Option value="rejected">Đã từ chối</Option>
          </Select>
        </Space>
      )}
    >
      <Table
        columns={columns}
        rowKey="id"
        dataSource={data}
        pagination={pagination}
        loading={loading}
        onChange={(nextPagination) => fetchComments({ current: nextPagination.current })}
      />
    </Card>
  );
};

export default CommentList;
