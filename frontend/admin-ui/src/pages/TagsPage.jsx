import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  Button,
  Space,
  Input,
  Tag as AntTag,
  Modal,
  Form,
  message,
  Popconfirm,
  Card,
  Row,
  Col,
  Switch,
  ColorPicker,
  Tooltip,
  Badge,
  Select,
  Statistic,
  Drawer,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  StarOutlined,
  StarFilled,
  MergeCellsOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import api from '../services/api';
import EmojiPickerInput from '../components/EmojiPickerInput';

const { TextArea } = Input;

export default function TagsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 15, total: 0 });
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [mergeDrawerVisible, setMergeDrawerVisible] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [form] = Form.useForm();
  const [mergeForm] = Form.useForm();
  const [stats, setStats] = useState({ total: 0, featured: 0, totalPosts: 0 });

  const fetchTags = useCallback(async (page = 1, pageSize = 15) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        per_page: pageSize,
      });
      if (search) params.append('search', search);

      const response = await api.get(`/api/admin/tags?${params}`);
      const data = response.data;
      
      setTags(data.data || []);
      setPagination({
        current: data.current_page,
        pageSize: data.per_page,
        total: data.total,
      });
      
      // Calculate stats
      const allTags = data.data || [];
      setStats({
        total: data.total,
        featured: allTags.filter(t => t.is_featured).length,
        totalPosts: allTags.reduce((sum, t) => sum + (t.post_count || 0), 0),
      });
    } catch (error) {
      message.error('Không thể tải danh sách tags');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const handleSearch = () => {
    fetchTags(1, pagination.pageSize);
  };

  const handleTableChange = (pag) => {
    fetchTags(pag.current, pag.pageSize);
  };

  const openCreateModal = () => {
    setEditingTag(null);
    form.resetFields();
    form.setFieldsValue({ color: '#3B82F6', is_featured: false });
    setModalVisible(true);
  };

  const openEditModal = (tag) => {
    setEditingTag(tag);
    form.setFieldsValue({
      ...tag,
      color: tag.color || '#3B82F6',
      meta_title: tag.meta?.title || '',
      meta_description: tag.meta?.description || '',
      meta_keywords: tag.meta?.keywords || '',
    });
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const payload = {
        name: values.name,
        slug: values.slug || undefined,
        description: values.description,
        color: typeof values.color === 'string' ? values.color : values.color?.toHexString(),
        icon: values.icon,
        is_featured: values.is_featured || false,
        meta: {
          title: values.meta_title,
          description: values.meta_description,
          keywords: values.meta_keywords,
        },
      };

      if (editingTag) {
        await api.put(`/api/admin/tags/${editingTag.id}`, payload);
        message.success('Cập nhật tag thành công!');
      } else {
        await api.post('/api/admin/tags', payload);
        message.success('Tạo tag mới thành công!');
      }

      setModalVisible(false);
      fetchTags(pagination.current, pagination.pageSize);
    } catch (error) {
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        Object.keys(errors).forEach(key => {
          message.error(errors[key][0]);
        });
      } else {
        message.error('Có lỗi xảy ra');
      }
    }
  };

  const handleDelete = async (tag) => {
    try {
      await api.delete(`/api/admin/tags/${tag.id}`);
      message.success('Xóa tag thành công!');
      fetchTags(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error('Không thể xóa tag');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Vui lòng chọn ít nhất một tag');
      return;
    }

    try {
      await api.post('/api/admin/tags/bulk-destroy', { ids: selectedRowKeys });
      message.success(`Đã xóa ${selectedRowKeys.length} tag`);
      setSelectedRowKeys([]);
      fetchTags(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error('Không thể xóa tags');
    }
  };

  const handleToggleFeatured = async (tag) => {
    try {
      await api.patch(`/api/admin/tags/${tag.id}/featured`);
      message.success(tag.is_featured ? 'Đã bỏ nổi bật' : 'Đã đặt nổi bật');
      fetchTags(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error('Không thể cập nhật trạng thái');
    }
  };

  const handleRecalculateCounts = async () => {
    try {
      setLoading(true);
      await api.post('/api/admin/tags/recalculate-counts');
      message.success('Đã cập nhật số lượng bài viết cho tất cả tags');
      fetchTags(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error('Không thể cập nhật');
    } finally {
      setLoading(false);
    }
  };

  const handleMerge = async () => {
    try {
      const values = await mergeForm.validateFields();
      
      if (values.source_tag_ids.includes(values.target_tag_id)) {
        message.error('Tag đích không được nằm trong danh sách tags nguồn');
        return;
      }

      await api.post('/api/admin/tags/merge', {
        target_tag_id: values.target_tag_id,
        source_tag_ids: values.source_tag_ids,
      });

      message.success('Gộp tags thành công!');
      setMergeDrawerVisible(false);
      mergeForm.resetFields();
      fetchTags(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error('Không thể gộp tags');
    }
  };

  const columns = [
    {
      title: 'Tên Tag',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <Space>
          {record.icon && <span>{record.icon}</span>}
          <AntTag color={record.color} style={{ fontWeight: 500 }}>
            {name}
          </AntTag>
          {record.is_featured && (
            <StarFilled style={{ color: '#faad14' }} />
          )}
        </Space>
      ),
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      render: (slug) => <code style={{ fontSize: '12px' }}>{slug}</code>,
    },
    {
      title: 'Màu sắc',
      dataIndex: 'color',
      key: 'color',
      width: 100,
      render: (color) => (
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            backgroundColor: color,
            border: '2px solid #eee',
          }}
        />
      ),
    },
    {
      title: 'Số bài viết',
      dataIndex: 'post_count',
      key: 'post_count',
      width: 120,
      sorter: true,
      render: (count) => (
        <Badge
          count={count}
          showZero
          style={{
            backgroundColor: count > 0 ? '#52c41a' : '#d9d9d9',
          }}
        />
      ),
    },
    {
      title: 'Nổi bật',
      dataIndex: 'is_featured',
      key: 'is_featured',
      width: 100,
      render: (isFeatured, record) => (
        <Switch
          checked={isFeatured}
          onChange={() => handleToggleFeatured(record)}
          checkedChildren={<StarFilled />}
          unCheckedChildren={<StarOutlined />}
        />
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => openEditModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa tag này?"
            description={`Tag "${record.name}" sẽ bị xóa vĩnh viễn`}
            onConfirm={() => handleDelete(record)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
  };

  return (
    <div style={{ padding: 24 }}>
      {/* Header Stats */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Tổng số Tags"
              value={stats.total}
              prefix={<AntTag color="blue">#</AntTag>}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Tags Nổi bật"
              value={stats.featured}
              prefix={<StarFilled style={{ color: '#faad14' }} />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Tổng số bài viết"
              value={stats.totalPosts}
              prefix="📰"
            />
          </Card>
        </Col>
      </Row>

      {/* Toolbar */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} justify="space-between" align="middle">
          <Col>
            <Space>
              <Input
                placeholder="Tìm kiếm tag..."
                prefix={<SearchOutlined />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onPressEnter={handleSearch}
                style={{ width: 250 }}
                allowClear
              />
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                Tìm
              </Button>
            </Space>
          </Col>
          <Col>
            <Space>
              {selectedRowKeys.length > 0 && (
                <Popconfirm
                  title={`Xóa ${selectedRowKeys.length} tag đã chọn?`}
                  onConfirm={handleBulkDelete}
                  okText="Xóa"
                  cancelText="Hủy"
                  okButtonProps={{ danger: true }}
                >
                  <Button danger>
                    Xóa đã chọn ({selectedRowKeys.length})
                  </Button>
                </Popconfirm>
              )}
              <Tooltip title="Gộp tags">
                <Button
                  icon={<MergeCellsOutlined />}
                  onClick={() => setMergeDrawerVisible(true)}
                >
                  Gộp Tags
                </Button>
              </Tooltip>
              <Tooltip title="Cập nhật số lượng bài viết">
                <Button
                  icon={<SyncOutlined />}
                  onClick={handleRecalculateCounts}
                  loading={loading}
                >
                  Đồng bộ
                </Button>
              </Tooltip>
              <Button icon={<ReloadOutlined />} onClick={() => fetchTags()}>
                Làm mới
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
                Tạo Tag
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={tags}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingTag ? 'Chỉnh sửa Tag' : 'Tạo Tag mới'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
        okText={editingTag ? 'Cập nhật' : 'Tạo'}
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ color: '#3B82F6', is_featured: false }}
        >
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="name"
                label="Tên Tag"
                rules={[{ required: true, message: 'Vui lòng nhập tên tag' }]}
              >
                <Input placeholder="VD: Công nghệ" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="color" label="Màu sắc">
                <ColorPicker showText />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={16}>
              <Form.Item name="slug" label="Slug (tự động nếu để trống)">
                <Input placeholder="cong-nghe" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="icon" label="Icon (Emoji)">
                <EmojiPickerInput placeholder="Chọn emoji..." />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Mô tả">
            <TextArea rows={2} placeholder="Mô tả ngắn về tag này..." />
          </Form.Item>

          <Form.Item name="is_featured" label="Tag nổi bật" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Divider>SEO Meta</Divider>

          <Form.Item name="meta_title" label="Meta Title">
            <Input placeholder="Tiêu đề SEO (tối đa 70 ký tự)" maxLength={70} />
          </Form.Item>

          <Form.Item name="meta_description" label="Meta Description">
            <TextArea
              rows={2}
              placeholder="Mô tả SEO (tối đa 160 ký tự)"
              maxLength={160}
              showCount
            />
          </Form.Item>

          <Form.Item name="meta_keywords" label="Keywords">
            <Input placeholder="keyword1, keyword2, keyword3" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Merge Drawer */}
      <Drawer
        title="Gộp Tags"
        open={mergeDrawerVisible}
        onClose={() => setMergeDrawerVisible(false)}
        size="default"
        footer={
          <Space style={{ float: 'right' }}>
            <Button onClick={() => setMergeDrawerVisible(false)}>Hủy</Button>
            <Button type="primary" onClick={handleMerge}>
              Gộp Tags
            </Button>
          </Space>
        }
      >
        <Form form={mergeForm} layout="vertical">
          <Form.Item
            name="target_tag_id"
            label="Tag đích (giữ lại)"
            rules={[{ required: true, message: 'Chọn tag đích' }]}
          >
            <Select
              placeholder="Chọn tag để giữ lại"
              showSearch
              optionFilterProp="children"
            >
              {tags.map((tag) => (
                <Select.Option key={tag.id} value={tag.id}>
                  <Space>
                    <AntTag color={tag.color}>{tag.name}</AntTag>
                    <span style={{ color: '#999' }}>({tag.post_count} bài)</span>
                  </Space>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="source_tag_ids"
            label="Tags nguồn (sẽ bị xóa)"
            rules={[{ required: true, message: 'Chọn ít nhất một tag nguồn' }]}
          >
            <Select
              mode="multiple"
              placeholder="Chọn các tags để gộp"
              showSearch
              optionFilterProp="children"
            >
              {tags.map((tag) => (
                <Select.Option key={tag.id} value={tag.id}>
                  <Space>
                    <AntTag color={tag.color}>{tag.name}</AntTag>
                    <span style={{ color: '#999' }}>({tag.post_count} bài)</span>
                  </Space>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <div style={{ padding: 16, background: '#f0f5ff', borderRadius: 8, marginTop: 16 }}>
            <p style={{ margin: 0, color: '#1890ff' }}>
              <strong>Lưu ý:</strong> Tất cả bài viết từ các tags nguồn sẽ được chuyển sang tag đích.
              Các tags nguồn sẽ bị xóa sau khi gộp.
            </p>
          </div>
        </Form>
      </Drawer>
    </div>
  );
}
