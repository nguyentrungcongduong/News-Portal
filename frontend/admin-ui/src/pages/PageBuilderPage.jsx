import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Spin, message, Breadcrumb, Button, Space, Modal, Table, Tag, Typography } from 'antd';
import { ArrowLeftOutlined, HistoryOutlined, RollbackOutlined } from '@ant-design/icons';
import { PageBuilder } from '../components/PageBuilder';
import api from '../services/api';

const { Text } = Typography;

export default function PageBuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pageData, setPageData] = useState(null);
  const [versions, setVersions] = useState([]);
  const [versionModalOpen, setVersionModalOpen] = useState(false);

  // Load page data if editing
  useEffect(() => {
    if (id) {
      loadPage();
    }
  }, [id]);

  const loadPage = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/admin/pages/${id}`);
      setPageData(res.data);
      setVersions(res.data.versions || []);
    } catch (err) {
      message.error('Không thể tải trang');
      navigate('/admin/pages');
    } finally {
      setLoading(false);
    }
  };

  // Restore version
  const handleRestore = async (versionId) => {
    try {
      await api.post(`/api/admin/pages/${id}/restore/${versionId}`);
      message.success('Đã khôi phục phiên bản');
      setVersionModalOpen(false);
      loadPage();
    } catch (err) {
      message.error('Lỗi khôi phục');
    }
  };

  // Version history columns
  const versionColumns = [
    {
      title: 'Phiên bản',
      dataIndex: 'version',
      render: (v) => <Tag color="blue">v{v}</Tag>,
    },
    {
      title: 'Người chỉnh sửa',
      dataIndex: ['user', 'name'],
      render: (name) => name || 'Hệ thống',
    },
    {
      title: 'Thời gian',
      dataIndex: 'created_at',
      render: (date) => new Date(date).toLocaleString('vi-VN'),
    },
    {
      title: '',
      key: 'action',
      render: (_, record) => (
        <Button
          size="small"
          icon={<RollbackOutlined />}
          onClick={() => handleRestore(record.id)}
        >
          Khôi phục
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ padding: 60, textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/pages')}>
            Quay lại
          </Button>
          <Breadcrumb
            items={[
              { title: 'Admin' },
              { title: 'Quản lý trang' },
              { title: id ? 'Chỉnh sửa trang' : 'Tạo trang mới' },
            ]}
          />
        </Space>

        {id && (
          <Button
            icon={<HistoryOutlined />}
            onClick={() => setVersionModalOpen(true)}
          >
            Lịch sử ({versions.length} phiên bản)
          </Button>
        )}
      </div>

      {/* Page Builder */}
      <PageBuilder
        pageId={id ? parseInt(id) : undefined}
        initialData={pageData}
        onSave={(data) => {
          message.success('Đã lưu trang!');
          if (!id) {
            navigate('/pages');
          }
        }}
      />

      {/* Version History Modal */}
      <Modal
        title="Lịch sử phiên bản"
        open={versionModalOpen}
        onCancel={() => setVersionModalOpen(false)}
        footer={null}
        width={700}
      >
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          Nhấn "Khôi phục" để quay về phiên bản trước. Phiên bản hiện tại sẽ được lưu trước khi khôi phục.
        </Text>
        <Table
          dataSource={versions}
          columns={versionColumns}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Modal>
    </div>
  );
}
