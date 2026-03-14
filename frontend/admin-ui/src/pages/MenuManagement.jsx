import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, message, Popconfirm, Tag, Switch, Tooltip, Flex } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, ApartmentOutlined } from '@ant-design/icons';
import { getMenus, createMenu, updateMenu, deleteMenu } from '../services/menuService';
import { useNavigate } from 'react-router-dom';

export default function MenuManagement() {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const fetchMenus = async () => {
    setLoading(true);
    try {
      const { data } = await getMenus();
      setMenus(data);
    } catch (error) {
      if (error.response?.status !== 404) {
          message.error('Lỗi tải danh sách menu');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const handleEdit = (record) => {
    setEditingMenu(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteMenu(id);
      message.success('Xóa menu thành công');
      fetchMenus();
    } catch (error) {
      message.error('Không thể xóa menu');
    }
  };

  const handleSave = async (values) => {
    try {
      if (editingMenu) {
        await updateMenu(editingMenu.id, values);
        message.success('Cập nhật menu thành công');
      } else {
        await createMenu(values);
        message.success('Tạo menu thành công');
      }
      setIsModalOpen(false);
      form.resetFields();
      setEditingMenu(null);
      fetchMenus();
    } catch (error) {
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Có lỗi xảy ra');
      }
    }
  };

  const handleStatusChange = async (checked, record) => {
    try {
      await updateMenu(record.id, { ...record, status: checked });
      message.success(`Đã ${checked ? 'bật' : 'tắt'} menu "${record.name}"`);
      fetchMenus();
    } catch (e) {
      message.error('Lỗi cập nhật trạng thái');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60, align: 'center' },
    { 
      title: 'Tên Menu', 
      dataIndex: 'name',
      render: (text, record) => (
        <Flex vertical gap={0}>
          <span style={{ fontWeight: 500 }}>{text}</span>
          <span style={{ fontSize: 12, color: '#888' }}>{record.description}</span>
        </Flex>
      )
    },
    { 
      title: 'Vị trí', 
      dataIndex: 'location',
      align: 'center',
      render: (loc) => {
        const colors = {
          header: 'blue',
          footer_1: 'default',
          footer_2: 'default', 
          sidebar: 'green',
          mobile: 'purple'
        };
        const labels = {
          header: 'HEADER',
          footer_1: 'FOOTER 1',
          footer_2: 'FOOTER 2',
          sidebar: 'SIDEBAR',
          mobile: 'MOBILE'
        };
        return loc ? (
          <Tag color={colors[loc] || 'default'} style={{ minWidth: 80, textAlign: 'center' }}>
            {labels[loc] || loc.toUpperCase()}
          </Tag>
        ) : <Tag>CHƯA GÁN</Tag>;
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      align: 'center',
      render: (status, record) => (
        <Switch 
          checked={!!status} 
          onChange={(checked) => handleStatusChange(checked, record)}
          size="small"
        />
      )
    },
    { 
      title: 'Số mục', 
      dataIndex: 'items_count',
      align: 'center',
      render: (count, record) => (
        <Tooltip title="Nhấn để sửa cấu trúc menu">
          <Button 
            type="link" 
            onClick={() => navigate(`/menus/${record.id}/builder`)}
            style={{ padding: 0, height: 'auto' }}
          >
            <Tag color="geekblue" style={{ cursor: 'pointer', margin: 0 }}>
              {count || 0} items <ApartmentOutlined />
            </Tag>
          </Button>
        </Tooltip>
      )
    },
    {
      title: 'Hành động',
      key: 'action',
      align: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Sửa cấu trúc (Builder)">
            <Button 
              type="primary" 
              ghost
              icon={<ApartmentOutlined />} 
              onClick={() => navigate(`/menus/${record.id}/builder`)}
            />
          </Tooltip>
          <Tooltip title="Cài đặt Menu">
            <Button 
              icon={<EditOutlined />} 
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm 
            title="Bạn có chắc muốn xóa menu này?" 
            description="Hành động này không thể hoàn tác."
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Tooltip title="Xóa Menu">
              <Button danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Quản lý Menu</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => {
          setEditingMenu(null);
          form.resetFields();
          setIsModalOpen(true);
        }}>
          Tạo Menu Mới
        </Button>
      </div>

      <Table 
        dataSource={menus} 
        columns={columns} 
        rowKey="id" 
        loading={loading} 
        pagination={false} 
      />

      <Modal
        title={editingMenu ? "Sửa Menu" : "Tạo Menu Mới"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="name" label="Tên Menu" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="location" label="Vị trí hiển thị">
            <Select allowClear>
              <Select.Option value="header">Header chính</Select.Option>
              <Select.Option value="footer_1">Footer Cột 1 (Về chúng tôi)</Select.Option>
              <Select.Option value="footer_2">Footer Cột 2 (Hỗ trợ)</Select.Option>
              <Select.Option value="sidebar">Sidebar</Select.Option>
              <Select.Option value="mobile">Mobile Menu</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
