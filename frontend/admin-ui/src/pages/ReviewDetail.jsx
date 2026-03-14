import React, { useState, useEffect } from 'react';
import { Card, Button, Space, message, Modal, Input, Tag, Typography, Descriptions, Divider, Spin, Alert } from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined, CloseOutlined, UserOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;

const ReviewDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectModal, setRejectModal] = useState({ open: false, reason: '' });

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/admin/posts/${id}`);
      setPost(response.data.data);
    } catch (error) {
      message.error('Không thể tải bài viết');
      navigate('/review');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = () => {
    Modal.confirm({
      title: 'Xác nhận duyệt bài viết',
      content: 'Bạn có chắc chắn muốn duyệt bài viết này? Sau khi duyệt, Admin sẽ được thông báo để xuất bản.',
      okText: 'Duyệt',
      okType: 'primary',
      cancelText: 'Hủy',
      onOk: async () => {
        setActionLoading(true);
        try {
          await api.post(`/api/admin/posts/${id}/approve`);
          message.success('Đã duyệt bài viết thành công!');
          navigate('/review');
        } catch (error) {
          message.error(error.response?.data?.message || 'Không thể duyệt bài viết');
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  const handleReject = () => {
    if (!rejectModal.reason.trim()) {
      message.warning('Vui lòng nhập lý do từ chối');
      return;
    }

    setActionLoading(true);
    api.post(`/api/admin/posts/${id}/reject`, { note: rejectModal.reason })
      .then(() => {
        message.success('Đã từ chối bài viết');
        navigate('/review');
      })
      .catch((error) => {
        message.error(error.response?.data?.message || 'Không thể từ chối bài viết');
      })
      .finally(() => {
        setActionLoading(false);
        setRejectModal({ open: false, reason: '' });
      });
  };

  const statusColors = {
    pending: 'orange',
    draft: 'default',
    approved: 'cyan',
    published: 'green',
    rejected: 'red',
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!post) {
    return <Alert message="Không tìm thấy bài viết" type="error" />;
  }

  if (post.status !== 'pending') {
    return (
      <Alert
        message="Bài viết này không còn ở trạng thái chờ duyệt"
        description={`Trạng thái hiện tại: ${post.status}`}
        type="warning"
        action={
          <Button onClick={() => navigate('/review')}>
            Quay lại danh sách
          </Button>
        }
      />
    );
  }

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Space style={{ marginBottom: 16 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/review')}>
            Quay lại
          </Button>
          <Title level={4} style={{ margin: 0 }}>
            Phòng biên tập - Xem và duyệt bài viết
          </Title>
        </Space>

        <Divider />

        {/* Post Info */}
        <Descriptions bordered column={2} style={{ marginBottom: 24 }}>
          <Descriptions.Item label="Tiêu đề" span={2}>
            <Text strong>{post.title}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Tác giả">
            <Space>
              <UserOutlined />
              {post.author?.name || 'N/A'}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag color={statusColors[post.status] || 'default'}>
              {post.status?.toUpperCase()}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Chuyên mục" span={2}>
            <Space>
              {post.categories?.map((cat) => (
                <Tag key={cat.id} color="blue">{cat.name}</Tag>
              ))}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">
            {dayjs(post.created_at).format('DD/MM/YYYY HH:mm')}
          </Descriptions.Item>
          <Descriptions.Item label="Cập nhật lần cuối">
            <Space>
              <ClockCircleOutlined />
              {dayjs(post.updated_at).format('DD/MM/YYYY HH:mm')}
            </Space>
          </Descriptions.Item>
        </Descriptions>

        {/* Content Preview */}
        <Card title="Tóm tắt (Sapo)" style={{ marginBottom: 16 }}>
          <Paragraph>{post.summary || '(Chưa có tóm tắt)'}</Paragraph>
        </Card>

        <Card title="Nội dung bài viết" style={{ marginBottom: 16 }}>
          <div
            dangerouslySetInnerHTML={{ __html: post.content || '(Chưa có nội dung)' }}
            style={{
              maxHeight: '600px',
              overflowY: 'auto',
              padding: '16px',
              border: '1px solid #f0f0f0',
              borderRadius: '4px',
              backgroundColor: '#fafafa',
            }}
          />
        </Card>

        {/* Approval Logs */}
        {post.approval_logs && post.approval_logs.length > 0 && (
          <Card title="Lịch sử duyệt" style={{ marginBottom: 16 }}>
            {post.approval_logs.map((log, index) => (
              <div key={index} style={{ marginBottom: 12, padding: '8px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                <Space>
                  <Tag color={log.action === 'approve' ? 'green' : log.action === 'reject' ? 'red' : 'default'}>
                    {log.action}
                  </Tag>
                  <Text type="secondary">
                    {dayjs(log.created_at).format('DD/MM/YYYY HH:mm')} - {log.user?.name || 'System'}
                  </Text>
                </Space>
                {log.note && (
                  <div style={{ marginTop: 4 }}>
                    <Text>{log.note}</Text>
                  </div>
                )}
              </div>
            ))}
          </Card>
        )}

        {/* Actions */}
        <Card>
          <Space size="large">
            <Button
              type="primary"
              size="large"
              icon={<CheckCircleOutlined />}
              onClick={handleApprove}
              loading={actionLoading}
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
            >
              ✅ Duyệt bài
            </Button>
            <Button
              danger
              size="large"
              icon={<CloseOutlined />}
              onClick={() => setRejectModal({ open: true, reason: '' })}
              loading={actionLoading}
            >
              ❌ Từ chối
            </Button>
          </Space>
        </Card>
      </Card>

      {/* Reject Modal */}
      <Modal
        title="Từ chối bài viết"
        open={rejectModal.open}
        onOk={handleReject}
        onCancel={() => setRejectModal({ open: false, reason: '' })}
        okText="Xác nhận từ chối"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <p>Vui lòng nhập lý do từ chối bài viết này. Lý do này sẽ được gửi cho tác giả.</p>
        <TextArea
          rows={4}
          placeholder="Ví dụ: Sapo quá ngắn, thiếu nguồn tham khảo, nội dung chưa đầy đủ..."
          value={rejectModal.reason}
          onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
        />
      </Modal>
    </div>
  );
};

export default ReviewDetail;

