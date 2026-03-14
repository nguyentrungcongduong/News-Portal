import React, { useState, useEffect } from 'react';
import { Table, Tag, Space, Button, Input, Select, Row, Col, message, Modal, Tooltip, Card, DatePicker, Form } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, CheckCircleOutlined, StopOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import dayjs from 'dayjs';

const { Option } = Select;
const { Search } = Input;

import api from '../services/api';

const PostList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [breakingModal, setBreakingModal] = useState({ open: false, postId: null });
  const [form] = Form.useForm();
  const [filters, setFilters] = useState({
      page: 1,
      status: '',
      q: ''
  });
  const [pagination, setPagination] = useState({ current: 1, pageSize: 15, total: 0 });
  
  // Set role từ user đang đăng nhập - không cho phép thay đổi
  const userRole = user?.role || 'admin';

  const fetchPosts = async () => {
      setLoading(true);
      try {
          const response = await api.get('/api/admin/posts', {
              params: {
                  status: filters.status,
                  q: filters.q,
                  page: filters.page
              }
          });
          const result = response.data;
          
          setData(result.data);
          setPagination({
              current: result.meta.current_page,
              pageSize: result.meta.per_page,
              total: result.meta.total
          });
      } catch (error) {
          console.error('Lỗi tải bài viết:', error);
          message.error('Lỗi tải danh sách bài viết');
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
      fetchPosts();
  }, [filters]);

  const handleDelete = async (id) => {
    Modal.confirm({
        title: 'Xác nhận xóa bài viết',
        content: 'Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác.',
        okText: 'Xóa',
        okType: 'danger',
        cancelText: 'Hủy',
        onOk: async () => {
            try {
                await api.delete(`/api/admin/posts/${id}`);
                message.success('Xóa bài viết thành công');
                fetchPosts();
            } catch (error) {
                message.error(error.response?.data?.message || 'Xóa thất bại');
            }
        }
    });
  }

  const handleApprove = async (id) => {
    Modal.confirm({
        title: 'Xác nhận duyệt',
        content: 'Bài viết này sẽ được chuyển sang trạng thái đã duyệt (chờ xuất bản).',
        okText: 'Duyệt',
        okType: 'primary',
        cancelText: 'Hủy',
        onOk: async () => {
            try {
                await api.post(`/api/admin/posts/${id}/approve`);
                message.success('Đã duyệt bài viết thành công!');
                fetchPosts();
            } catch (error) {
                message.error(error.response?.data?.message || 'Không thể duyệt');
            }
        }
    });
  }

  const handlePublish = async (id) => {
    Modal.confirm({
        title: 'Xác nhận xuất bản',
        content: 'Bài viết này sẽ được hiển thị công khai trên website. Bạn có chắc chắn?',
        okText: 'Xuất bản',
        okType: 'primary',
        cancelText: 'Hủy',
        onOk: async () => {
            try {
                const post = data.find(p => p.id === id);
                
                if (post?.status === 'pending') {
                    await api.post(`/api/admin/posts/${id}/approve`);
                }
                
                await api.post(`/api/admin/posts/${id}/publish`);
                message.success('Đã xuất bản bài viết thành công!');
                fetchPosts();
            } catch (error) {
                message.error(error.response?.data?.message || 'Không thể xuất bản');
            }
        }
    });
  }

  const handleArchive = async (id) => {
    Modal.confirm({
        title: 'Xác nhận gỡ bài',
        content: 'Bài viết sẽ không còn hiển thị công khai và được chuyển vào kho lưu trữ.',
        okText: 'Gỡ bài',
        okType: 'danger',
        cancelText: 'Hủy',
        onOk: async () => {
            try {
                await api.post(`/api/admin/posts/${id}/archive`);
                message.success('Đã gỡ bài viết thành công');
                fetchPosts();
            } catch (error) {
                message.error(error.response?.data?.message || 'Lỗi khi gỡ bài');
            }
        }
    });
  }

  const handleBreakingClick = (record) => {
      if (record.is_breaking) {
          Modal.confirm({
              title: 'Gỡ tin nóng',
              content: 'Gỡ bài viết này khỏi danh sách tin nóng?',
              onOk: async () => {
                  try {
                      await api.post(`/api/admin/posts/${record.id}/breaking`, { is_breaking: false });
                      message.success('Đã gỡ tin nóng');
                      fetchPosts();
                  } catch (e) {
                      message.error('Lỗi kết nối');
                  }
              }
          });
      } else {
            setBreakingModal({ open: true, postId: record.id });
            form.setFieldsValue({ breaking_until: dayjs().add(4, 'hour') });
      }
  };

  const submitBreaking = async () => {
      try {
          const values = await form.validateFields();
          await api.post(`/api/admin/posts/${breakingModal.postId}/breaking`, { 
              is_breaking: true,
              breaking_until: values.breaking_until.format('YYYY-MM-DD HH:mm:ss')
          });
          
          message.success('Đã set tin nóng thành công');
          setBreakingModal({ open: false, postId: null });
          fetchPosts();
      } catch (error) {
          message.error(error.response?.data?.message || 'Có lỗi xảy ra');
      }
  };

  const columns = [
    {
      title: 'Ảnh',
      dataIndex: 'thumbnail',
      key: 'thumbnail',
      width: 90,
      render: (img) => img ? (
        <img 
            src={img} 
            alt="thumb" 
            style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 6, border: '1px solid #f0f0f0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }} 
        />
      ) : (
        <div style={{ width: 60, height: 40, background: '#f5f5f5', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#bfbfbf', border: '1px dashed #d9d9d9' }}>No Img</div>
      )
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div style={{ maxWidth: 350 }}>
            <div 
                style={{ fontWeight: 600, fontSize: 14, color: '#1f1f1f', cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                onClick={() => navigate(`/posts/edit/${record.id}`)}
                className="post-title-hover"
            >
                {text}
            </div>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                ID: {record.id}
                {record.is_breaking && (
                    <Tag color="red" style={{ marginLeft: 6 }}>
                        <ThunderboltOutlined /> HOT
                    </Tag>
                )}
            </div>
        </div>
      ),
    },
    {
      title: 'Danh mục',
      dataIndex: 'categories',
      key: 'categories',
      render: (cats) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {/* Safely render categories, ensuring cats is an array */}
            {Array.isArray(cats) && cats.map(c => <Tag key={c.id} color="blue" variant="filled" style={{ borderRadius: 4 }}>{c.name}</Tag>)}
        </div>
      )
    },
    {
        title: 'Tác giả',
        dataIndex: 'author',
        key: 'author',
        render: (author) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{author?.name || 'Admin'}</span>
            </div>
        )
    },
    {
      title: 'Trạng thái',
      key: 'status',
      dataIndex: 'status',
      width: 120,
      render: (status) => {
        const config = {
            published: { color: '#52c41a', bg: '#f6ffed', border: '#b7eb8f', label: 'Công khai' },
            pending: { color: '#1890ff', bg: '#e6f7ff', border: '#91d5ff', label: 'Chờ duyệt' },
            approved: { color: '#13c2c2', bg: '#e6fffb', border: '#87e8de', label: 'Đã duyệt' },
            rejected: { color: '#f5222d', bg: '#fff1f0', border: '#ffa39e', label: 'Bị từ chối' },
            draft: { color: '#faad14', bg: '#fffbe6', border: '#ffe58f', label: 'Bản nháp' },
            archived: { color: '#8c8c8c', bg: '#f5f5f5', border: '#d9d9d9', label: 'Lưu trữ' }
        };
        const s = config[status] || config.draft;
        return (
          <Tag style={{ 
            color: s.color, 
            backgroundColor: s.bg, 
            borderColor: s.border,
            borderRadius: 6,
            fontWeight: 500,
            padding: '2px 8px'
          }}>
            {s.label}
          </Tag>
        );
      },
    },
    {
      title: 'Ngày cập nhật',
      dataIndex: 'updated_at',
      key: 'updated_at',
      width: 150,
      render: (date) => (
        <div style={{ fontSize: 13, color: '#595959' }}>
            {new Date(date).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}
        </div>
      )
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          {/* Duyệt - Editor và Admin có thể duyệt */}
          {record.status === 'pending' && (userRole === 'editor' || userRole === 'admin') && (
            <Tooltip title={userRole === 'editor' ? "Duyệt bài" : "Duyệt bài"}>
              <Button 
                  type="text" 
                  icon={<CheckCircleOutlined style={{ color: '#1890ff' }} />} 
                  onClick={() => handleApprove(record.id)}
                  className="action-btn-approve"
              />
            </Tooltip>
          )}
          
          {/* Xuất bản - CHỈ Admin (Editor không có quyền publish) */}
          {record.status === 'pending' && userRole === 'admin' && (
            <Tooltip title="Xuất bản ngay">
              <Button 
                  type="text" 
                  icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />} 
                  onClick={() => handlePublish(record.id)}
                  className="action-btn-publish"
              />
            </Tooltip>
          )}
          
          {/* Xuất bản - Admin có thể publish từ approved */}
          {record.status === 'approved' && userRole === 'admin' && (
            <Tooltip title="Xuất bản">
              <Button 
                  type="text" 
                  icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />} 
                  onClick={() => handlePublish(record.id)}
                  className="action-btn-publish"
              />
            </Tooltip>
          )}
          
          {/* Chỉnh sửa - Admin và Editor đều có */}
          <Tooltip title="Chỉnh sửa">
            <Button 
                type="text" 
                icon={<EditOutlined style={{ color: '#1677ff' }} />} 
                onClick={() => navigate(`/posts/edit/${record.id}`)}
                className="action-btn-edit"
            />
          </Tooltip>
          
          {/* Gỡ bài - CHỈ Admin (Editor không có quyền archive) */}
          {record.status === 'published' && userRole === 'admin' && (
            <Tooltip title="Gỡ bài">
              <Button 
                  type="text" 
                  danger
                  icon={<StopOutlined />} 
                  onClick={() => handleArchive(record.id)}
                  className="action-btn-archive"
              />
            </Tooltip>
          )}
          
          {/* Xóa - CHỈ Admin (Editor không có quyền delete) */}
          {userRole === 'admin' && (
            <Tooltip title="Xóa">
              <Button 
                  type="text" 
                  danger 
                  icon={<DeleteOutlined />} 
                  onClick={() => handleDelete(record.id)}
                  className="action-btn-delete"
              />
            </Tooltip>
          )}
          
          {/* Set tin nóng - CHỈ Admin (Editor không có quyền set breaking) */}
          {record.status === 'published' && userRole === 'admin' && (
            <Tooltip title={record.is_breaking ? "Gỡ tin nóng" : "Set tin nóng"}>
                <Button 
                    type="text"
                    icon={<ThunderboltOutlined style={{ color: record.is_breaking ? '#f5222d' : '#faad14' }} />}
                    onClick={() => handleBreakingClick(record)}
                    className={record.is_breaking ? "action-btn-delete" : "action-btn-draft"}
                />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  const handleSearch = (value) => {
      setFilters(prev => ({ ...prev, q: value, page: 1 }));
  }

  const handleStatusFilter = (value) => {
       setFilters(prev => ({ ...prev, status: value, page: 1 }));
  }

  const handleTableChange = (pagination) => {
      setFilters(prev => ({ ...prev, page: pagination.current }));
  }

  return (
    <div style={{ padding: '0 8px' }}>
      <Card variant="borderless" styles={{ body: { padding: '24px' } }} style={{ borderRadius: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
            <Col>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a' }}>Danh sách bài viết</div>
                <div style={{ color: '#8c8c8c', fontSize: 14 }}>Quản lý và biên tập nội dung hệ thống</div>
            </Col>
            <Col>
                {/* Chỉ Admin mới có quyền tạo bài viết trực tiếp - Editor chỉ duyệt */}
                {userRole === 'admin' && (
                    <Button 
                        type="primary" 
                        size="large" 
                        icon={<PlusOutlined />} 
                        onClick={() => navigate('/posts/create')}
                        style={{ borderRadius: 8, boxShadow: '0 2px 4px rgba(22, 119, 255, 0.2)' }}
                    >
                        Tạo bài viết mới
                    </Button>
                )}
            </Col>
        </Row>

        <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={6}>
                <Space>
                    <span style={{ fontSize: 12, color: '#8c8c8c' }}>Role:</span>
                    <Select 
                        value={userRole} 
                        disabled 
                        size="small" 
                        variant="borderless" 
                        style={{ 
                            background: '#f5f5f5', 
                            borderRadius: 12,
                            cursor: 'not-allowed',
                            opacity: 0.8
                        }}
                    >
                        <Option value="author">Author</Option>
                        <Option value="editor">Editor</Option>
                        <Option value="admin">Admin</Option>
                    </Select>
                </Space>
            </Col>
            <Col span={10}>
                <Input 
                    placeholder="Tìm kiếm tiêu đề bài viết..." 
                    prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />} 
                    onChange={handleSearch}
                    allowClear
                    style={{ borderRadius: 8 }}
                />
            </Col>
            <Col xs={24} sm={12} md={6}>
                <Select 
                    placeholder="Lọc theo trạng thái" 
                    style={{ width: '100%' }} 
                    onChange={handleStatusFilter} 
                    allowClear
                    classNames={{ popup: 'status-select-popup' }}
                    variant="outlined"
                >
                    <Option value="published">Đã công khai</Option>
                    <Option value="approved">Đã duyệt (Chờ đăng)</Option>
                    <Option value="pending">Chờ duyệt</Option>
                    <Option value="rejected">Bị từ chối</Option>
                    <Option value="draft">Bản nháp</Option>
                    <Option value="archived">Lưu trữ</Option>
                </Select>
            </Col>
        </Row>

        <Table 
            columns={columns} 
            dataSource={data} 
            rowKey="id" 
            loading={loading}
            pagination={{
                ...pagination,
                showSizeChanger: false,
                style: { marginTop: 24 }
            }}
            onChange={handleTableChange}
            className="premium-table"
        />
      </Card>
      
      <style>{`
        .post-title-hover:hover { color: #1677ff !important; }
        .premium-table .ant-table-thead > tr > th {
            background: #fafafc;
            font-weight: 600;
            color: #595959;
            border-bottom: 2px solid #f0f0f0;
        }
        .premium-table .ant-table-row:hover { background-color: #fcfcfd !important; }
        .action-btn-edit:hover { background: #e6f4ff !important; border-radius: 6px; }
        .action-btn-delete:hover { background: #fff1f0 !important; border-radius: 6px; }
        .action-btn-publish:hover { background: #f6ffed !important; border-radius: 6px; }
        .action-btn-draft:hover { background: #fff7e6 !important; border-radius: 6px; }
      `}</style>
      
      <Modal
        title="Thiết lập Tin nóng (Breaking News)"
        open={breakingModal.open}
        onOk={submitBreaking}
        onCancel={() => setBreakingModal({ open: false, postId: null })}
        okText="Xác nhận"
        cancelText="Hủy"
      >
          <Form form={form} layout="vertical">
              <p>Bài viết sẽ được ghim lên đầu trang chủ và hiển thị badge HOT.</p>
              <Form.Item 
                name="breaking_until" 
                label="Hiển thị đến khi nào?" 
                rules={[{ required: true, message: 'Vui lòng chọn thời gian kết thúc' }]}
              >
                  <DatePicker showTime format="HH:mm DD/MM/YYYY" style={{ width: '100%' }} />
              </Form.Item>
          </Form>
      </Modal>
    </div>
  );
};

export default PostList;
