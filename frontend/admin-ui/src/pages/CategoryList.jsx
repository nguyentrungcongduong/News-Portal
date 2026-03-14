import React, { useState, useEffect } from 'react';
import { Table, Tag, Space, Button, Modal, Form, Input, Select, message, Card, Row, Col, Tooltip, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FolderOutlined, HomeOutlined, SearchOutlined, LayoutOutlined } from '@ant-design/icons';
import api from '../services/api';

const { Option } = Select;

const CategoryList = () => {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [form] = Form.useForm();

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/admin/categories');
            const treeData = buildTree(response.data);
            setData(response.data); // Keep flat for select options
            setFilteredData(treeData);
        } catch (error) {
            message.error('Lỗi tải danh sách chuyên mục');
        } finally {
            setLoading(false);
        }
    };

    const buildTree = (flatData) => {
        const map = {};
        const roots = [];
        
        flatData.forEach(item => {
            map[item.id] = { ...item, key: item.id, children: [] };
        });

        flatData.forEach(item => {
            if (item.parent_id && map[item.parent_id]) {
                map[item.parent_id].children.push(map[item.id]);
            } else {
                roots.push(map[item.id]);
            }
        });

        // Clean up empty children
        const clean = (nodes) => {
            nodes.forEach(node => {
                if (node.children.length === 0) {
                    delete node.children;
                } else {
                    clean(node.children);
                }
            });
        };
        clean(roots);
        return roots;
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        let result = buildTree(data);
        if (searchQuery) {
            const filterNodes = (nodes) => {
                return nodes.filter(node => {
                    const matchesSearch = node.name.toLowerCase().includes(searchQuery.toLowerCase());
                    if (node.children) {
                        node.children = filterNodes(node.children);
                        return matchesSearch || node.children.length > 0;
                    }
                    return matchesSearch;
                });
            };
            result = filterNodes(result);
        }
        if (statusFilter !== 'all') {
            const filterStatus = (nodes) => {
                return nodes.filter(node => {
                    const matchesStatus = node.status === statusFilter;
                    if (node.children) {
                        node.children = filterStatus(node.children);
                        return matchesStatus || node.children.length > 0;
                    }
                    return matchesStatus;
                });
            };
            result = filterStatus(result);
        }
        setFilteredData(result);
    }, [searchQuery, statusFilter, data]);

    const handleCreate = () => {
        setEditingCategory(null);
        form.resetFields();
        form.setFieldsValue({ status: 'active', order: 0, show_home: false, layout: 'grid' });
        setModalVisible(true);
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        form.setFieldsValue({
            ...category,
            show_home: category.show_home === 1 || category.show_home === true
        });
        setModalVisible(true);
    };

    const handleToggleStatus = async (category) => {
        try {
            await api.patch(`/api/admin/categories/${category.id}/status`);
            message.success('Đã cập nhật trạng thái');
            fetchCategories();
        } catch (error) {
            message.error('Thao tác thất bại');
        }
    };

    const handleToggleHome = async (category) => {
        try {
            await api.patch(`/api/admin/categories/${category.id}/home`);
            message.success('Đã cập nhật hiển thị Trang chủ');
            fetchCategories();
        } catch (error) {
            message.error('Thao tác thất bại');
        }
    };

    const handleDelete = async (id) => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: 'Bạn có chắc chắn muốn xóa chuyên mục này? Lưu ý: Không thể xóa chuyên mục đang có bài viết.',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    await api.delete(`/api/admin/categories/${id}`);
                    message.success('Đã xóa chuyên mục');
                    fetchCategories();
                } catch (error) {
                    message.error(error.response?.data?.message || 'Lỗi khi xóa');
                }
            }
        });
    };

    const onFinish = async (values) => {
        try {
            if (editingCategory) {
                await api.put(`/api/admin/categories/${editingCategory.id}`, values);
                message.success('Cập nhật thành công');
            } else {
                await api.post('/api/admin/categories', values);
                message.success('Tạo chuyên mục thành công');
            }
            setModalVisible(false);
            fetchCategories();
        } catch (error) {
            message.error(error.response?.data?.message || 'Lỗi xử lý');
        }
    };

    const generateSlug = (name) => {
        return name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[đĐ]/g, "d")
            .replace(/([^0-9a-z-\s])/g, "")
            .replace(/(\s+)/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-+|-+$/g, "");
    };

    const columns = [
        {
            title: 'Thông tin chuyên mục',
            key: 'info',
            render: (text, record) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <Space size={8}>
                        <FolderOutlined style={{ color: record.parent_id ? '#8c8c8c' : '#1677ff', fontSize: '16px' }} />
                        <span style={{ fontWeight: record.parent_id ? 500 : 700, fontSize: '15px', color: '#1a1a1a' }}>{record.name}</span>
                    </Space>
                    <div style={{ paddingLeft: '24px' }}>
                        <code style={{ fontSize: '11px', color: '#8c8c8c', background: '#f8f9fa', padding: '2px 8px', borderRadius: '4px', border: '1px solid #f0f0f0' }}>/{record.slug}</code>
                    </div>
                </div>
            )
        },
        {
            title: 'Giao diện',
            dataIndex: 'layout',
            key: 'layout',
            width: 150,
            render: (layout) => {
                const config = {
                    grid: { color: 'blue', label: 'Dạng lưới' },
                    list: { color: 'cyan', label: 'Danh sách' },
                    masonry: { color: 'purple', label: 'Báo chí' },
                    timeline: { color: 'orange', label: 'Dòng thời gian' }
                };
                const item = config[layout] || config.grid;
                return (
                    <Tag 
                        variant="filled"
                        color={item.color} 
                        style={{ borderRadius: '4px', textTransform: 'uppercase', fontSize: '10px', fontWeight: 600, padding: '0 8px' }}
                    >
                        {item.label}
                    </Tag>
                );
            }
        },
        {
            title: 'Thứ tự',
            dataIndex: 'order',
            key: 'order',
            sorter: (a, b) => a.order - b.order,
            width: 100,
            align: 'center',
            render: (val) => <span style={{ fontWeight: 600, color: '#595959' }}>{val}</span>
        },
        {
            title: 'Cấu hình hiển thị',
            key: 'visibility',
            width: 280,
            render: (_, record) => {
                const isActive = record.status === 'active';
                const showHome = record.show_home === 1 || record.show_home === true;

                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        {/* Status Toggle */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '100px' }}>
                            <Switch 
                                checked={isActive} 
                                size="small"
                                onChange={() => handleToggleStatus(record)}
                                style={{ backgroundColor: isActive ? '#52c41a' : undefined }}
                            />
                            <Tag 
                                color={isActive ? 'success' : 'default'} 
                                variant="filled"
                                style={{ margin: 0, borderRadius: '12px', fontSize: '11px', padding: '0 10px' }}
                            >
                                {isActive ? 'CÔNG KHAI' : 'BẢN NHÁP'}
                            </Tag>
                        </div>

                        {/* Home Toggle */}
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '10px', 
                            opacity: isActive ? 1 : 0.4,
                            transition: 'opacity 0.3s ease'
                        }}>
                            <Switch 
                                checked={showHome} 
                                disabled={!isActive}
                                size="small"
                                onChange={() => handleToggleHome(record)}
                            />
                            <Space size={4} style={{ color: showHome && isActive ? '#1890ff' : '#8c8c8c' }}>
                                <HomeOutlined style={{ fontSize: '14px' }} />
                                <span style={{ fontSize: '12px', fontWeight: 500 }}>TRANG CHỦ</span>
                            </Space>
                        </div>
                    </div>
                );
            }
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 120,
            align: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Chỉnh sửa">
                        <Button 
                            type="text" 
                            size="small"
                            shape="circle"
                            icon={<EditOutlined style={{ color: '#1677ff' }} />} 
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Button 
                            type="text" 
                            size="small"
                            shape="circle"
                            danger 
                            icon={<DeleteOutlined />} 
                            onClick={() => handleDelete(record.id)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '0 8px' }}>
            <Card 
                variant="borderless" 
                styles={{ body: { padding: '32px' } }} 
                style={{ borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #f0f0f0' }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
                    <div>
                        <div style={{ fontSize: 28, fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>Cấu trúc chuyên mục</div>
                        <div style={{ color: '#6b7280', fontSize: 15, marginTop: 4 }}>Quản lý phân cấp, giao diện và vị trí hiển thị chuyên mục</div>
                    </div>
                    <Button 
                        type="primary" 
                        icon={<PlusOutlined />} 
                        size="large"
                        onClick={handleCreate}
                        style={{ borderRadius: 8, fontWeight: 600, height: '48px', padding: '0 24px', boxShadow: '0 4px 12px rgba(22,119,255,0.2)' }}
                    >
                        Thêm chuyên mục mới
                    </Button>
                </div>

                <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '12px', marginBottom: 24, display: 'flex', gap: '16px', border: '1px solid #f3f4f6' }}>
                    <Input 
                        placeholder="Tìm theo tên hoặc slug..." 
                        prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{ width: 300, borderRadius: 8, height: '40px' }}
                        allowClear
                    />
                    <Select 
                        value={statusFilter} 
                        onChange={setStatusFilter}
                        style={{ width: 160, height: '40px' }}
                        placeholder="Lọc trạng thái"
                    >
                        <Option value="all">Tất cả trạng thái</Option>
                        <Option value="active">Đang công khai</Option>
                        <Option value="hidden">Đang ẩn (Nháp)</Option>
                    </Select>
                    <div style={{ flex: 1 }} />
                    <Button icon={<LayoutOutlined />} onClick={fetchCategories}>Làm mới</Button>
                </div>

                <Table 
                    columns={columns} 
                    dataSource={filteredData} 
                    rowKey="id" 
                    loading={loading}
                    pagination={{ pageSize: 20, hideOnSinglePage: true }}
                    expandable={{ defaultExpandAllRows: true }}
                    className="category-table"
                />
            </Card>

            <Modal
                title={
                    <div style={{ fontSize: 20, fontWeight: 700, paddingBottom: 10 }}>
                        {editingCategory ? 'Cấu hình chuyên mục' : 'Tạo chuyên mục mới'}
                    </div>
                }
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={() => form.submit()}
                destroyOnHidden
                width={700}
                okText={editingCategory ? "Cập nhật" : "Tạo ngay"}
                cancelText="Hủy bỏ"
                okButtonProps={{ style: { height: 40, borderRadius: 6, fontWeight: 600 } }}
                cancelButtonProps={{ style: { height: 40, borderRadius: 6 } }}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{ status: 'active', layout: 'grid', order: 0 }}
                    style={{ marginTop: 20 }}
                >
                    <Row gutter={24}>
                        <Col span={12}>
                            <Form.Item
                                name="name"
                                label={<span style={{ fontWeight: 600 }}>Tên chuyên mục</span>}
                                rules={[{ required: true, message: 'Nhập tên chuyên mục' }]}
                            >
                                <Input 
                                    size="large"
                                    placeholder="Ví dụ: Đời sống, Kinh tế..." 
                                    onChange={(e) => {
                                        if (!editingCategory) {
                                            form.setFieldsValue({ slug: generateSlug(e.target.value) });
                                        }
                                    }}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="slug"
                                label={<span style={{ fontWeight: 600 }}>Slug (Đường dẫn SEO)</span>}
                                rules={[{ required: true, message: 'Nhập slug' }]}
                            >
                                <Input size="large" placeholder="doi-song" prefix="/" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={24}>
                        <Col span={12}>
                            <Form.Item
                                name="parent_id"
                                label={<span style={{ fontWeight: 600 }}>Chuyên mục cha (Cấu trúc cây)</span>}
                            >
                                <Select 
                                    size="large"
                                    placeholder="Chọn chuyên mục cha nếu có" 
                                    allowClear
                                >
                                    {data
                                        .filter(c => c.id !== editingCategory?.id)
                                        .map(c => (
                                            <Option key={c.id} value={c.id}>{c.name}</Option>
                                        ))
                                    }
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="layout"
                                label={<span style={{ fontWeight: 600 }}>Giao diện trang danh sách</span>}
                                rules={[{ required: true }]}
                            >
                                <Select size="large">
                                    <Option value="grid">Dạng lưới (Grid - Tiêu chuẩn)</Option>
                                    <Option value="list">Dạng danh sách (List)</Option>
                                    <Option value="masonry">Dạng Masonry (Báo chí hiện đại)</Option>
                                    <Option value="timeline">Dòng thời gian (Timeline)</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="description"
                        label={<span style={{ fontWeight: 600 }}>Mô tả ngắn (SEO Meta Description)</span>}
                    >
                        <Input.TextArea rows={3} placeholder="Mô tả này sẽ hiển thị trên Google Search..." />
                    </Form.Item>

                    <div style={{ background: '#f9fafb', padding: '24px', borderRadius: '12px', border: '1px solid #f3f4f6' }}>
                        <Row gutter={24} align="middle">
                            <Col span={8}>
                                <Form.Item
                                    name="status"
                                    label={<span style={{ fontWeight: 600 }}>Trạng thái</span>}
                                    style={{ marginBottom: 0 }}
                                >
                                    <Select size="middle">
                                        <Option value="active">Công khai</Option>
                                        <Option value="hidden">Lưu nháp (Ẩn)</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    name="order"
                                    label={<span style={{ fontWeight: 600 }}>Thứ tự ưu tiên</span>}
                                    style={{ marginBottom: 0 }}
                                >
                                    <Input type="number" placeholder="0" />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    noStyle
                                    shouldUpdate={(prevValues, currentValues) => prevValues.status !== currentValues.status}
                                >
                                    {({ getFieldValue }) => (
                                        <Form.Item
                                            name="show_home"
                                            label={<span style={{ fontWeight: 600, opacity: getFieldValue('status') === 'active' ? 1 : 0.5 }}>Hiện ở Trang chủ</span>}
                                            valuePropName="checked"
                                            style={{ marginBottom: 0 }}
                                        >
                                            <Switch 
                                                disabled={getFieldValue('status') !== 'active'}
                                                checkedChildren="HIỆN" 
                                                unCheckedChildren="ẨN" 
                                            />
                                        </Form.Item>
                                    )}
                                </Form.Item>
                            </Col>
                        </Row>
                    </div>
                </Form>
            </Modal>
            <style dangerouslySetInnerHTML={{ __html: `
                .category-table .ant-table-row-indent + .ant-table-row-expand-icon {
                    margin-right: 8px;
                }
                .category-table .ant-table-cell {
                    padding: 16px !important;
                }
            `}} />
        </div>
    );
};

export default CategoryList;
