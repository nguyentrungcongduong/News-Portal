import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Card, Row, Col, Select, message, Tag, Space, Tabs, Table, Tooltip, Modal, Spin } from 'antd';
import { SaveOutlined, ArrowLeftOutlined, SendOutlined, CheckCircleOutlined, StopOutlined, RocketOutlined, HistoryOutlined, ReloadOutlined, EditOutlined, CloseOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import TiptapEditor from '../components/TiptapEditor';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const { Option } = Select;
const { TextArea } = Input;

// Define API Base URL
const API_URL = 'http://127.0.0.1:8010/api/admin';

const CreatePost = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [form] = Form.useForm();
    const isEdit = !!id;
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(false);
    const [postTitle, setPostTitle] = useState('');
    const [currentStatus, setCurrentStatus] = useState('');
    const { user } = useAuth();
    const [userRole, setUserRole] = useState(user?.role || 'admin'); // Default to 'admin' if not loaded yet
    const [versions, setVersions] = useState([]);
    const [approvalLogs, setApprovalLogs] = useState([]);

    const fetchVersions = async () => {
        if (!isEdit) return;
        try {
            const response = await api.get(`/api/admin/posts/${id}/versions`);
            setVersions(response.data.data);
        } catch (error) {
            console.error('Lỗi tải lịch sử:', error);
        }
    };

    // Status options based on role
    const getStatusOptions = () => {
        const allOptions = [
            { value: 'draft', label: 'Bản nháp (Draft)', color: 'orange' },
            { value: 'pending', label: 'Chờ duyệt (Pending)', color: 'blue' },
            { value: 'approved', label: 'Đã duyệt (Approved)', color: 'cyan' },
            { value: 'published', label: 'Xuất bản (Published)', color: 'green' },
            { value: 'rejected', label: 'Từ chối (Rejected)', color: 'red' },
            { value: 'archived', label: 'Lưu trữ (Archived)', color: 'gray' },
        ];

        if (userRole === 'admin') return allOptions;
        if (userRole === 'editor') return allOptions.filter(opt => opt.value !== 'published');
        
        // Author can only set to Draft or Pending
        return allOptions.filter(opt => ['draft', 'pending'].includes(opt.value));
    };
    useEffect(() => {
        if (user?.role) {
            setUserRole(user.role);
        }
    }, [user]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/api/admin/categories');
                const data = response.data;
                const categoryList = Array.isArray(data) ? data : (data.data || []);
                setCategories(categoryList);
            } catch (error) {
                console.error('Lỗi tải danh mục:', error);
                message.error('Lỗi tải danh mục');
            }
        };
        fetchCategories();
    }, []);

    // Fetch Post Data if Edit mode
    useEffect(() => {
        if (isEdit) {
            const fetchPost = async () => {
                setFetchLoading(true);
                try {
                    const response = await api.get(`/api/admin/posts/${id}`);
                    const post = response.data.data;
                    
                    setPostTitle(post.title);
                    setCurrentStatus(post.status);
                    setApprovalLogs(post.approval_logs || []);
                    form.setFieldsValue({
                        ...post,
                        category_ids: post.categories?.map(c => c.id) // Map object array to ID array
                    });
                    fetchVersions();
                } catch (error) {
                    message.error('Lỗi khi tải dữ liệu bài viết');
                } finally {
                    setFetchLoading(false);
                }
            };
            fetchPost();
        }
    }, [id, isEdit, form]);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const endpoint = isEdit ? `/api/admin/posts/${id}` : `/api/admin/posts`;
            const method = isEdit ? 'put' : 'post';
            
            const response = await api[method](endpoint, values);

            message.success(isEdit ? 'Cập nhật bài viết thành công!' : 'Tạo bài viết mới thành công!');
            if (!isEdit) {
                setTimeout(() => navigate('/posts'), 500);
            } else {
                // Update state after save
                setPostTitle(values.title);
                fetchVersions();
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Thao tác thất bại';
            message.error('Lỗi: ' + errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (versionId) => {
        setLoading(true);
        try {
            const response = await api.post(`/api/admin/posts/${id}/restore/${versionId}`);
            message.success(response.data.message);
            // Refresh everything
            const res = await api.get(`/api/admin/posts/${id}`);
            const post = res.data.data;
            setPostTitle(post.title);
            setCurrentStatus(post.status);
            form.setFieldsValue({
                ...post,
                category_ids: post.categories?.map(c => c.id)
            });
            fetchVersions();
        } catch (error) {
            message.error(error.response?.data?.message || 'Khôi phục thất bại');
        } finally {
            setLoading(false);
        }
    };

    const handleWorkflowAction = async (action, note = '') => {
        setLoading(true);
        try {
            const response = await api.post(`/api/admin/posts/${id}/${action}`, { note });
            message.success(response.data.message);
            // Refresh post data
            const res = await api.get(`/api/admin/posts/${id}`);
            const post = res.data.data;
            setCurrentStatus(post.status);
            setApprovalLogs(post.approval_logs || []);
            form.setFieldsValue({ status: post.status });
            fetchVersions();
        } catch (error) {
            message.error(error.response?.data?.message || 'Thao tác thất bại');
        } finally {
            setLoading(false);
        }
    };

    const showRejectModal = () => {
        let note = '';
        Modal.confirm({
            title: 'Từ chối bài viết',
            content: (
                <div style={{ marginTop: 16 }}>
                    <p>Vui lòng nhập lý do từ chối để tác giả chỉnh sửa:</p>
                    <TextArea rows={4} onChange={(e) => note = e.target.value} placeholder="Lý do từ chối..." />
                </div>
            ),
            okText: 'Xác nhận từ chối',
            cancelText: 'Hủy',
            okType: 'danger',
            onOk: () => {
                if (!note.trim()) {
                    message.warning('Vui lòng nhập lý do!');
                    return Promise.reject();
                }
                return handleWorkflowAction('reject', note);
            }
        });
    };

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px 40px 20px' }}>
            <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Space size="middle">
                    <Button 
                        icon={<ArrowLeftOutlined />} 
                        onClick={() => navigate('/posts')} 
                        style={{ border: 'none', background: 'transparent', fontSize: 18 }} 
                    />
                    <div>
                        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>
                            {isEdit ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
                        </h2>
                        {isEdit && (
                            <Space>
                                <Tag color={
                                    currentStatus === 'published' ? 'green' : 
                                    currentStatus === 'pending' ? 'blue' : 
                                    currentStatus === 'approved' ? 'cyan' :
                                    currentStatus === 'rejected' ? 'red' :
                                    currentStatus === 'archived' ? 'error' : 'orange'
                                }>
                                    {currentStatus?.toUpperCase()}
                                </Tag>
                                <span style={{ color: '#8c8c8c', fontSize: 14 }}>{postTitle || 'Đang tải...'}</span>
                            </Space>
                        )}
                    </div>
                </Space>
                
                <Space size="middle">
                    <Select 
                        value={userRole} 
                        onChange={setUserRole} 
                        style={{ width: 100 }}
                        size="small"
                        variant="borderless"
                        className="role-switcher"
                        classNames={{ popup: 'role-select-popup' }}
                    >
                        <Option value="author">Author</Option>
                        <Option value="editor">Editor</Option>
                        <Option value="admin">Admin</Option>
                    </Select>
                    
                    {!fetchLoading && (
                        <Space>
                            {/* Actions based on Role & Status */}
                            {((userRole === 'author' || userRole === 'admin') && (['draft', 'rejected'].includes(currentStatus) || !isEdit)) && (
                                <Button 
                                    icon={<SaveOutlined />} 
                                    onClick={() => {
                                        form.setFieldsValue({ status: 'draft' });
                                        form.submit();
                                    }} 
                                    loading={loading}
                                >
                                    Lưu nháp
                                </Button>
                            )}

                            {isEdit && ['draft', 'rejected'].includes(currentStatus) && userRole === 'author' && (
                                <Button type="primary" icon={<SendOutlined />} onClick={() => handleWorkflowAction('submit')} loading={loading}>
                                    Gửi duyệt
                                </Button>
                            )}

                            {isEdit && currentStatus === 'pending' && (userRole === 'editor' || userRole === 'admin') && (
                                <Space>
                                    <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => handleWorkflowAction('approve')} loading={loading} style={{ background: '#52c41a', borderColor: '#52c41a' }}>
                                        Duyệt bài
                                    </Button>
                                    <Button danger icon={<CloseOutlined />} onClick={showRejectModal} loading={loading}>
                                        Từ chối
                                    </Button>
                                </Space>
                            )}

                            {isEdit && currentStatus === 'approved' && userRole === 'admin' && (
                                <Button type="primary" icon={<RocketOutlined />} onClick={() => handleWorkflowAction('publish')} loading={loading}>
                                    Xuất bản ngay
                                </Button>
                            )}

                            {isEdit && (currentStatus === 'draft' || currentStatus === 'pending') && userRole === 'admin' && (
                                <Button type="primary" icon={<RocketOutlined />} onClick={() => handleWorkflowAction('publish')} loading={loading}>
                                    Xuất bản nhanh (Admin)
                                </Button>
                            )}

                            {isEdit && currentStatus === 'published' && (userRole === 'editor' || userRole === 'admin') && (
                                <Button danger icon={<StopOutlined />} onClick={() => handleWorkflowAction('archive')} loading={loading}>
                                    Gỡ bài viết
                                </Button>
                            )}
                            
                            {!isEdit && userRole === 'admin' && (
                                <Button 
                                    type="primary" 
                                    icon={<RocketOutlined />} 
                                    onClick={() => {
                                        form.setFieldsValue({ status: 'published' });
                                        form.submit();
                                    }} 
                                    loading={loading}
                                    style={{ background: '#52c41a', borderColor: '#52c41a' }}
                                >
                                    Đăng bài ngay
                                </Button>
                            )}
                        </Space>
                    )}
                </Space>
            </div>
            
            <style>{`
                .role-switcher {
                    background: #f0f2f5;
                    border-radius: 20px;
                    padding: 0 4px;
                    font-size: 12px;
                    font-weight: 600;
                    color: #595959;
                }
            `}</style>

            <Spin spinning={fetchLoading} tip="Đang tải dữ liệu bài viết..." size="large">
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{ status: 'draft' }}
                    requiredMark="optional"
                >
                    <Tabs 
                        defaultActiveKey="1" 
                        type="card"
                        items={[
                            {
                                key: '1',
                                label: <span><EditOutlined /> Nội dung bài viết</span>,
                                children: (
                                    <Row gutter={24}>
                                        <Col span={17}>
                                            <Card variant="borderless" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                                                <Form.Item
                                                    label="Tiêu đề bài viết"
                                                    name="title"
                                                    rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
                                                >
                                                    <Input placeholder="Nhập tiêu đề..." size="large" />
                                                </Form.Item>

                                                <Form.Item
                                                    label="Mô tả ngắn (Sapo)"
                                                    name="summary"
                                                    rules={[{ required: true, message: 'Vui lòng nhập mô tả ngắn!' }]}
                                                >
                                                    <TextArea rows={3} placeholder="Mô tả tóm tắt nội dung..." showCount maxLength={300} />
                                                </Form.Item>

                                                <div style={{ marginBottom: 24 }}>
                                                    <Form.Item
                                                        label="Nội dung chi tiết"
                                                        name="content"
                                                        rules={[{ required: true, message: 'Nội dung không được để trống!' }]}
                                                    >
                                                        <TiptapEditor />
                                                    </Form.Item>
                                                </div>
                                            </Card>
                                        </Col>

                                        <Col span={7}>
                                            <Card 
                                                title="Thông tin bổ sung" 
                                                variant="borderless" 
                                                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: 24 }}
                                            >
                                                <Form.Item label="Ảnh đại diện (Thumbnail)">
                                                    {/* Hidden form item to track the thumbnail value */}
                                                    <Form.Item name="thumbnail" noStyle>
                                                        <Input type="hidden" />
                                                    </Form.Item>
                                                    
                                                    <Form.Item noStyle shouldUpdate={(prev, curr) => prev.thumbnail !== curr.thumbnail}>
                                                        {() => (
                                                            <div style={{ marginBottom: 12 }}>
                                                                {form.getFieldValue('thumbnail') ? (
                                                                    <img src={form.getFieldValue('thumbnail')} alt="Preview" style={{ width: '100%', borderRadius: 8, height: 160, objectFit: 'cover' }} />
                                                                ) : (
                                                                    <div style={{ height: 160, background: '#f5f5f5', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #d9d9d9' }}>Chưa có ảnh</div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </Form.Item>
                                                    <div style={{ marginTop: 8 }}>
                                                        <input 
                                                            type="file" 
                                                            accept="image/*" 
                                                            onChange={async (e) => {
                                                                const file = e.target.files[0];
                                                                if (!file) return;
                                                                const formData = new FormData();
                                                                formData.append('file', file);
                                                                setLoading(true);
                                                                try {
                                                                    const res = await api.post('/api/admin/media/upload', formData, {
                                                                        headers: { 'Content-Type': 'multipart/form-data' }
                                                                    });
                                                                    form.setFieldsValue({ thumbnail: res.data.url });
                                                                    message.success('Upload thành công');
                                                                } catch (err) { 
                                                                    message.error('Lỗi upload: ' + (err.response?.data?.message || err.message)); 
                                                                }
                                                                finally { setLoading(false); }
                                                            }}
                                                        />
                                                    </div>
                                                </Form.Item>

                                                <Form.Item
                                                    label="Chuyên mục"
                                                    name="category_ids"
                                                    rules={[{ required: true, message: 'Chọn ít nhất 1 chuyên mục!' }]}
                                                >
                                                    <Select 
                                                        mode="multiple" 
                                                        placeholder="Chọn chuyên mục..."
                                                        options={categories.map(cat => ({ label: cat.name, value: cat.id }))}
                                                    />
                                                </Form.Item>

                                                <Form.Item label="Trạng thái" name="status">
                                                    <Select 
                                                        options={getStatusOptions().map(opt => ({ 
                                                            label: <Tag color={opt.color}>{opt.label}</Tag>, 
                                                            value: opt.value 
                                                        }))} 
                                                    />
                                                </Form.Item>
                                            </Card>
                                        </Col>
                                    </Row>
                                )
                            },
                            {
                                key: '2',
                                label: <span><HistoryOutlined /> Lịch sử chỉnh sửa</span>,
                                disabled: !isEdit,
                                children: (
                                    <Card variant="borderless" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                                        <Table 
                                            dataSource={versions} 
                                            rowKey="id" 
                                            pagination={{ pageSize: 10 }}
                                            columns={[
                                                { title: 'Thời gian', dataIndex: 'created_at', key: 'created_at', render: (date) => new Date(date).toLocaleString('vi-VN') },
                                                { title: 'Người sửa', key: 'user', render: (_, r) => r.creator?.name || 'Admin' },
                                                { title: 'Tiêu đề bản ghi', dataIndex: 'title', key: 'title', ellipsis: true },
                                                { title: 'Hành động', key: 'action', render: (_, r) => (
                                                    <Space>
                                                        <Tooltip title="Khôi phục">
                                                            <Button 
                                                                type="text" 
                                                                icon={<ReloadOutlined style={{ color: '#fa8c16' }} />} 
                                                                onClick={() => {
                                                                    Modal.confirm({
                                                                        title: 'Khôi phục phiên bản này?',
                                                                        content: `Bài viết sẽ được quay lại nội dung tại thời điểm ${new Date(r.created_at).toLocaleString('vi-VN')}. Bản hiện tại cũng sẽ được lưu thành 1 bản ghi lịch sử.`,
                                                                        onOk: () => handleRestore(r.id),
                                                                        okText: 'Khôi phục',
                                                                        cancelText: 'Hủy'
                                                                    });
                                                                }} 
                                                            />
                                                        </Tooltip>
                                                    </Space>
                                                )}
                                            ]}
                                        />
                                    </Card>
                                )
                            },
                            {
                                key: '3',
                                label: <span><HistoryOutlined /> Lịch sử duyệt bài</span>,
                                disabled: !isEdit,
                                children: (
                                    <Card variant="borderless" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                                        <Table 
                                            dataSource={approvalLogs} 
                                            rowKey="id" 
                                            pagination={{ pageSize: 10 }}
                                            columns={[
                                                { title: 'Thời gian', dataIndex: 'created_at', key: 'created_at', render: (date) => new Date(date).toLocaleString('vi-VN') },
                                                { title: 'Người thao tác', key: 'user', render: (_, r) => r.user?.name || 'Admin' },
                                                { title: 'Hành động', dataIndex: 'action', key: 'action', render: (act) => {
                                                    const config = {
                                                        submit: { color: 'blue', label: 'Gửi duyệt' },
                                                        approve: { color: 'green', label: 'Duyệt bài' },
                                                        reject: { color: 'red', label: 'Từ chối' },
                                                        publish: { color: 'cyan', label: 'Xuất bản' },
                                                        archive: { color: 'gray', label: 'Gỡ bài' }
                                                    };
                                                    return <Tag color={config[act]?.color}>{config[act]?.label || act}</Tag>;
                                                }},
                                                { title: 'Ghi chú', dataIndex: 'note', key: 'note' }
                                            ]}
                                        />
                                    </Card>
                                )
                            }
                        ]}
                    />
                    <Form.Item style={{ marginTop: 32 }}>
                        <Button type="primary" htmlType="submit" icon={<SaveOutlined />} block size="large" loading={loading}>
                            {isEdit ? 'Cập nhật' : 'Lưu bài viết'}
                        </Button>
                    </Form.Item>
                </Form>
            </Spin>
        </div>
    );
};

export default CreatePost;
