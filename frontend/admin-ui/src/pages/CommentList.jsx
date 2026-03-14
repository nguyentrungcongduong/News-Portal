import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, message, Card, Select, Input, Popconfirm, Flex } from 'antd';
const { Search } = Input;
import api from '../services/api';

const { Option } = Select;

import { useSearchParams } from 'react-router-dom';

const CommentList = () => {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(searchParams.get('status') || 'pending');
  const [keyword, setKeyword] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20 });

  const fetchComments = async (params = {}) => {
    setLoading(true);
    try {
      const response = await api.get(`/api/admin/comments`, {
        params: {
          status: status,
          keyword: keyword,
          page: params.pagination?.current || 1,
        }
      });
      setData(response.data.data);
      setPagination({
        ...params.pagination,
        total: response.data.total,
      });
    } catch (error) {
      message.error('Không thể tải danh sách bình luận');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const s = searchParams.get('status');
    if (s) setStatus(s);
  }, [searchParams]);

  useEffect(() => {
    fetchComments();
  }, [status, keyword]);

  const handleAction = async (id, action) => {
    try {
      await api.post(`/api/admin/comments/${id}/${action}`);
      const msgMap = {
        'approve': 'Đã duyệt bình luận',
        'reject': 'Đã từ chối bình luận',
        'ignore': 'Đã bỏ qua báo cáo',
        'hide': 'Đã ẩn bình luận',
        'block-user': 'Đã khóa tài khoản người dùng',
        'unblock-user': 'Đã gỡ khóa tài khoản người dùng'
      };
      message.success(msgMap[action] || 'Thành công');
      fetchComments();
    } catch (error) {
      message.error('Thực hiện thất bại');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/admin/comments/${id}`);
      message.success('Đã xóa bình luận');
      fetchComments();
    } catch (error) {
      message.error('Xóa thất bại');
    }
  };

  const columns = [
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
                    {record.user.trust_score}
                </Tag>
            </div>
          )}
          {/* <div style={{ fontSize: '10px', color: '#ccc' }}>IP: {record.ip_address}</div> */}
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
      render: (post) => post ? <a href={`/post/${post.slug}`} target="_blank" rel="noreferrer">{post.title}</a> : 'N/A',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => {
        const colors = { 
            pending: 'orange', 
            approved: 'green', 
            rejected: 'red',
            reported: 'volcano',
            hidden: 'gray'
        };
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <Tag color={colors[status]}>{status.toUpperCase()}</Tag>
            
            {record.spam_reason && (
                <div style={{ fontSize: '11px', color: '#888', fontStyle: 'italic' }}>
                    Lý do: {record.spam_reason}
                </div>
            )}

            {record.reports_count > 0 && (
              <div style={{ marginTop: 4 }}>
                <Tag color="error">
                  {record.reports_count} báo cáo
                </Tag>
                <div style={{ fontSize: '11px', color: '#ff4d4f', maxWidth: '150px' }}>
                  {Array.from(new Set(record.reports?.map(r => r.reason))).join(', ')}
                </div>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Flex vertical gap="small">
          <Space>
            {(status === 'pending' || status === 'reported') && (
              <Button type="primary" size="small" onClick={() => handleAction(record.id, 'approve')}>
                {status === 'reported' ? 'Bỏ qua & Duyệt' : 'Duyệt'}
              </Button>
            )}
            {(status === 'approved' || status === 'reported') && (
              <Button size="small" onClick={() => handleAction(record.id, 'hide')}>Ẩn</Button>
            )}
            {status !== 'rejected' && status !== 'hidden' && (
              <Button danger size="small" onClick={() => handleAction(record.id, 'reject')}>Từ chối</Button>
            )}
            <Button danger size="small" type="link" onClick={() => handleDelete(record.id)}>Xóa</Button>
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
                <Button danger type="dashed" size="small">Chặn User</Button>
              </Popconfirm>
            ) : (
              <Button type="dashed" size="small" onClick={() => handleAction(record.id, 'unblock-user')} style={{ color: '#52c41a', borderColor: '#52c41a' }}>Gỡ Chặn</Button>
            )}
          </Space>
        </Flex>
      ),
    },
  ];

  return (
    <Card 
      title="Quản lý bình luận" 
      variant="outlined"
      extra={
        <Space>
          <Search 
            placeholder="Tìm nội dung..." 
            onSearch={(val) => {
              setKeyword(val);
              fetchComments({ pagination: { current: 1 } });
            }} 
            style={{ width: 250 }} 
          />
          <Select value={status} onChange={setStatus} style={{ width: 150 }}>
            <Option value="pending">Chờ lọc</Option>
            <Option value="approved">Đã duyệt</Option>
            <Option value="reported">Bị báo cáo 🚩</Option>
            <Option value="hidden">Đã ẩn (Moderated)</Option>
            <Option value="rejected">Đã từ chối</Option>
          </Select>
        </Space>
      }
    >
      <Table
        columns={columns}
        rowKey="id"
        dataSource={data}
        pagination={pagination}
        loading={loading}
        onChange={(p) => fetchComments({ pagination: p })}
      />
    </Card>
  );
};

export default CommentList;
