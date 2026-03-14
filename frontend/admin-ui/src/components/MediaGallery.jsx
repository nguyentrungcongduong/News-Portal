import React, { useState, useEffect } from 'react';
import { Modal, Upload, Tabs, message, Row, Col, Button, Input, Empty, Skeleton } from 'antd';
import { PlusOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import api from '../services/api';

const MediaGallery = ({ visible, onCancel, onSelect }) => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchImages = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/api/admin/media`, {
                params: { page, q: searchTerm }
            });
            const data = res.data;
            if (page === 1) {
                setImages(data.data);
            } else {
                setImages(prev => [...prev, ...data.data]);
            }
            setTotal(data.total);
        } catch (error) {
            console.error('Lỗi tải thư viện ảnh:', error);
            message.error('Không thể tải thư viện ảnh');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (visible) {
            // Reset for new search
            setImages([]);
            setPage(1);
            fetchImages();
        }
    }, [visible, searchTerm]);

    // Effect for pagination
    useEffect(() => {
        if (visible && page > 1) {
            fetchImages();
        }
    }, [page]);

    const handleUpload = async ({ file, onSuccess, onError }) => {
        const formData = new FormData();
        formData.append('file', file);
        const hide = message.loading('Đang tải ảnh lên...', 0);
        try {
            const res = await api.post(`/api/admin/media/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const data = res.data;
            hide();
            onSuccess(data);
            message.success('Tải lên thành công!');
            setPage(1); // Go to first page to see new image
            fetchImages();
        } catch (err) {
            hide();
            const errMsg = err.response?.data?.message || 'Lỗi kết nối server';
            message.error(errMsg);
            onError(err);
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: 'Bạn có chắc chắn muốn xóa ảnh này khỏi thư viện?',
            okText: 'Xóa',
            cancelText: 'Hủy',
            okType: 'danger',
            onOk: async () => {
                try {
                    await api.delete(`/api/admin/media/${id}`);
                    message.success('Đã xóa ảnh');
                    fetchImages();
                } catch (error) {
                    message.error('Lỗi khi xóa ảnh');
                }
            }
        });
    };

    return (
        <Modal
            open={visible}
            title={<span style={{ fontWeight: 700, fontSize: 18 }}>🖼️ Thư viện phương tiện</span>}
            onCancel={onCancel}
            width={900}
            footer={null}
            centered
            styles={{ body: { padding: '0 24px 24px 24px' } }}
        >
            <Tabs 
                defaultActiveKey="1" 
                className="premium-tabs"
                items={[
                {
                    key: '1',
                    label: <span style={{ padding: '0 16px' }}>Tất cả ảnh</span>,
                    children: (
                        <div style={{ minHeight: 450 }}>
                            <div style={{ marginBottom: 20 }}>
                                <Input 
                                    placeholder="Tìm kiếm ảnh theo tên..." 
                                    prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />} 
                                    onPressEnter={(e) => setSearchTerm(e.target.value)}
                                    onBlur={(e) => setSearchTerm(e.target.value)}
                                    allowClear
                                    style={{ borderRadius: 8 }}
                                />
                            </div>

                             <Row gutter={[16, 16]}>
                                <Col xs={12} sm={8} md={6}>
                                    <Upload
                                        customRequest={handleUpload}
                                        showUploadList={false}
                                        accept="image/*"
                                    >
                                        <div style={{ 
                                            height: 140, 
                                            border: '2px dashed #91caff', 
                                            borderRadius: 12, 
                                            display: 'flex', 
                                            flexDirection: 'column',
                                            justifyContent: 'center', 
                                            alignItems: 'center',
                                            cursor: 'pointer',
                                            background: '#e6f4ff',
                                            transition: 'all 0.3s ease',
                                            color: '#0958d9'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#bae0ff'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = '#e6f4ff'}
                                        >
                                            <PlusOutlined style={{ fontSize: 24, marginBottom: 8 }} />
                                            <div style={{ fontWeight: 500 }}>Tải ảnh mới</div>
                                        </div>
                                    </Upload>
                                </Col>
                                {loading && images.length === 0 ? (
                                    [...Array(7)].map((_, i) => (
                                        <Col xs={12} sm={8} md={6} key={`skeleton-${i}`}>
                                            <Skeleton.Button active style={{ width: '100%', height: 140, borderRadius: 12 }} />
                                        </Col>
                                    ))
                                ) : images.length === 0 && !loading ? (
                                    <Col span={24}>
                                        <div style={{ padding: '60px 0', textAlign: 'center' }}>
                                            <Empty description="Không tìm thấy ảnh nào" />
                                        </div>
                                    </Col>
                                ) : (
                                    images.map(img => (
                                        <Col xs={12} sm={8} md={6} key={img.id}>
                                            <div 
                                                className="media-card"
                                                style={{ 
                                                    height: 140, 
                                                    borderRadius: 12, 
                                                    cursor: 'pointer',
                                                    overflow: 'hidden',
                                                    position: 'relative',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                                    border: '1px solid #f0f0f0',
                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                                }}
                                                onClick={() => onSelect(img.file_path)}
                                            >
                                                <img 
                                                    src={img.file_path} 
                                                    alt={img.name}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                                />
                                                
                                                {/* Delete Button */}
                                                <div 
                                                    className="delete-btn"
                                                    onClick={(e) => handleDelete(e, img.id)}
                                                    style={{
                                                        position: 'absolute',
                                                        top: 8,
                                                        right: 8,
                                                        width: 30,
                                                        height: 30,
                                                        borderRadius: '50%',
                                                        background: 'rgba(255, 255, 255, 0.9)',
                                                        display: 'flex',
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                        color: '#ff4d4f',
                                                        opacity: 0,
                                                        transition: 'all 0.2s ease',
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                                                    }}
                                                >
                                                    <DeleteOutlined />
                                                </div>

                                                <div style={{
                                                    position: 'absolute',
                                                    bottom: 0,
                                                    left: 0,
                                                    right: 0,
                                                    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                                                    padding: '24px 12px 8px',
                                                    color: 'white',
                                                    fontSize: 11,
                                                    opacity: 0,
                                                    transition: 'opacity 0.3s ease',
                                                }} className="media-overlay">
                                                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
                                                        {img.name}
                                                    </div>
                                                </div>
                                                <style>{`
                                                    .media-card:hover { transform: translateY(-5px); boxShadow: 0 12px 24px rgba(0,0,0,0.15); }
                                                    .media-card:hover .media-overlay { opacity: 1; }
                                                    .media-card:hover .delete-btn { opacity: 1; }
                                                    .delete-btn:hover { background: #ff4d4f !important; color: white !important; transform: scale(1.1); }
                                                `}</style>
                                            </div>
                                        </Col>
                                    ))
                                )}
                            </Row>
                            {total > 20 && (
                                <div style={{ textAlign: 'center', marginTop: 32 }}>
                                    <Button onClick={() => setPage(p => p + 1)} loading={loading}>Xem thêm</Button>
                                </div>
                            )}
                        </div>
                    )
                }
            ]} />
        </Modal>
    );
};

export default MediaGallery;
