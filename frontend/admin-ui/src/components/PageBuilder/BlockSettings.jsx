import React, { useState } from 'react';
import { Input, Select, Slider, Switch, Divider, Typography, Upload, Button, message, InputNumber, Space, ColorPicker } from 'antd';
import { UploadOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../services/api';

const { TextArea } = Input;
const { Text, Title } = Typography;

export default function BlockSettings({ block, updateBlock }) {
  if (!block) return null;

  // Helper to update data field
  const updateData = (key, value) => {
    updateBlock(block.id, {
      data: { ...block.data, [key]: value },
    });
  };

  // Helper to update settings field
  const updateSettings = (key, value) => {
    updateBlock(block.id, {
      settings: { ...block.settings, [key]: value },
    });
  };

  // Image upload handler
  const handleImageUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'pages');

    try {
      const res = await api.post('/api/admin/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data.url;
    } catch (err) {
      message.error('Lỗi upload ảnh');
      return null;
    }
  };

  switch (block.type) {
    // ======= HERO BLOCK =======
    case 'hero':
      return (
        <div>
          <Title level={5}>🎯 Hero Banner</Title>
          <Divider />

          <Text strong>Tiêu đề *</Text>
          <Input
            value={block.data.title || ''}
            onChange={e => updateData('title', e.target.value)}
            placeholder="Tiêu đề chính"
            style={{ marginBottom: 16 }}
          />

          <Text strong>Phụ đề</Text>
          <Input
            value={block.data.subtitle || ''}
            onChange={e => updateData('subtitle', e.target.value)}
            placeholder="Mô tả ngắn"
            style={{ marginBottom: 16 }}
          />

          <Text strong>Ảnh nền *</Text>
          <Input
            value={block.data.background_image || ''}
            onChange={e => updateData('background_image', e.target.value)}
            placeholder="URL ảnh nền"
            style={{ marginBottom: 8 }}
          />
          <Upload
            showUploadList={false}
            beforeUpload={async (file) => {
              const url = await handleImageUpload(file);
              if (url) updateData('background_image', url);
              return false;
            }}
          >
            <Button icon={<UploadOutlined />} size="small">Upload ảnh</Button>
          </Upload>

          <Divider>Cài đặt</Divider>

          <Text strong>Căn chỉnh</Text>
          <Select
            value={block.settings?.align || 'center'}
            onChange={v => updateSettings('align', v)}
            style={{ width: '100%', marginBottom: 16 }}
            options={[
              { value: 'left', label: 'Trái' },
              { value: 'center', label: 'Giữa' },
              { value: 'right', label: 'Phải' },
            ]}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text strong>Lớp phủ tối</Text>
            <Switch
              checked={block.settings?.overlay}
              onChange={v => updateSettings('overlay', v)}
            />
          </div>
        </div>
      );

    // ======= BANNER BLOCK =======
    case 'banner':
      return (
        <div>
          <Title level={5}>🚩 Banner</Title>
          <Divider />

          <Text strong>Tiêu đề *</Text>
          <Input
            value={block.data.title || ''}
            onChange={e => updateData('title', e.target.value)}
            placeholder="Banner title"
            style={{ marginBottom: 16 }}
          />

          <Text strong>Phụ đề</Text>
          <Input
            value={block.data.subtitle || ''}
            onChange={e => updateData('subtitle', e.target.value)}
            placeholder="Nội dung mô tả"
            style={{ marginBottom: 16 }}
          />

          <Text strong>Ảnh nền (tuỳ chọn)</Text>
          <Input
            value={block.data.background_image || ''}
            onChange={e => updateData('background_image', e.target.value)}
            placeholder="URL ảnh nền"
            style={{ marginBottom: 8 }}
          />
          <Upload
            showUploadList={false}
            beforeUpload={async (file) => {
              const url = await handleImageUpload(file);
              if (url) updateData('background_image', url);
              return false;
            }}
          >
            <Button icon={<UploadOutlined />} size="small" style={{ marginBottom: 16 }}>Upload ảnh</Button>
          </Upload>

          <Text strong>Nội dung nút</Text>
          <Input
            value={block.data.button_text || ''}
            onChange={e => updateData('button_text', e.target.value)}
            placeholder="Tìm hiểu thêm"
            style={{ marginBottom: 16 }}
          />

          <Text strong>Link nút</Text>
          <Input
            value={block.data.button_url || ''}
            onChange={e => updateData('button_url', e.target.value)}
            placeholder="/lien-he"
            style={{ marginBottom: 16 }}
          />

          <Divider>Cài đặt</Divider>

          <div style={{ marginBottom: 16 }}>
            <Text strong>Màu nền</Text>
            <div style={{ marginTop: 4 }}>
              <Input
                value={block.settings?.background_color || '#1890ff'}
                onChange={e => updateSettings('background_color', e.target.value)}
                placeholder="#1890ff"
              />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <Text strong>Màu chữ</Text>
            <div style={{ marginTop: 4 }}>
              <Input
                value={block.settings?.text_color || '#ffffff'}
                onChange={e => updateSettings('text_color', e.target.value)}
                placeholder="#ffffff"
              />
            </div>
          </div>

          <Text strong>Căn chỉnh</Text>
          <Select
            value={block.settings?.align || 'center'}
            onChange={v => updateSettings('align', v)}
            style={{ width: '100%' }}
            options={[
              { value: 'left', label: 'Trái' },
              { value: 'center', label: 'Giữa' },
              { value: 'right', label: 'Phải' },
            ]}
          />
        </div>
      );

    // ======= TEXT BLOCK =======
    case 'text':
      return (
        <div>
          <Title level={5}>📝 Văn bản</Title>
          <Divider />

          <Text strong>Nội dung HTML</Text>
          <TextArea
            rows={8}
            value={block.data.content || ''}
            onChange={e => updateData('content', e.target.value)}
            placeholder="<p>Nội dung văn bản...</p>"
            style={{ marginBottom: 16, fontFamily: 'monospace' }}
          />

          <Divider>Cài đặt</Divider>

          <Text strong>Chiều rộng tối đa</Text>
          <Select
            value={block.settings?.max_width || '800px'}
            onChange={v => updateSettings('max_width', v)}
            style={{ width: '100%' }}
            options={[
              { value: '600px', label: '600px (Hẹp)' },
              { value: '800px', label: '800px (Chuẩn)' },
              { value: '100%', label: '100% (Đầy đủ)' },
            ]}
          />
        </div>
      );

    // ======= IMAGE BLOCK =======
    case 'image':
      return (
        <div>
          <Title level={5}>🖼️ Hình ảnh</Title>
          <Divider />

          <Text strong>URL ảnh *</Text>
          <Input
            value={block.data.src || ''}
            onChange={e => updateData('src', e.target.value)}
            placeholder="https://..."
            style={{ marginBottom: 8 }}
          />
          <Upload
            showUploadList={false}
            beforeUpload={async (file) => {
              const url = await handleImageUpload(file);
              if (url) updateData('src', url);
              return false;
            }}
          >
            <Button icon={<UploadOutlined />} size="small">Upload ảnh</Button>
          </Upload>

          <div style={{ marginTop: 16 }}>
            <Text strong>Alt text * (SEO)</Text>
            <Input
              value={block.data.alt || ''}
              onChange={e => updateData('alt', e.target.value)}
              placeholder="Mô tả hình ảnh cho SEO"
              style={{ marginBottom: 16 }}
            />
          </div>

          <Text strong>Caption</Text>
          <Input
            value={block.data.caption || ''}
            onChange={e => updateData('caption', e.target.value)}
            placeholder="Chú thích ảnh"
            style={{ marginBottom: 16 }}
          />

          <Divider>Cài đặt</Divider>

          <Text strong>Chiều rộng</Text>
          <Select
            value={block.settings?.width || 'full'}
            onChange={v => updateSettings('width', v)}
            style={{ width: '100%' }}
            options={[
              { value: 'small', label: 'Nhỏ (50%)' },
              { value: 'medium', label: 'Vừa (75%)' },
              { value: 'full', label: 'Đầy đủ (100%)' },
            ]}
          />
        </div>
      );

    // ======= GALLERY BLOCK =======
    case 'gallery':
      return (
        <GallerySettings
          block={block}
          updateBlock={updateBlock}
          handleImageUpload={handleImageUpload}
          updateSettings={updateSettings}
        />
      );

    // ======= VIDEO BLOCK =======
    case 'video':
      return (
        <div>
          <Title level={5}>🎬 Video</Title>
          <Divider />

          <Text strong>Nguồn video</Text>
          <Select
            value={block.data.provider || 'youtube'}
            onChange={v => updateData('provider', v)}
            style={{ width: '100%', marginBottom: 16 }}
            options={[
              { value: 'youtube', label: 'YouTube' },
              { value: 'vimeo', label: 'Vimeo' },
            ]}
          />

          <Text strong>Video ID *</Text>
          <Input
            value={block.data.video_id || ''}
            onChange={e => updateData('video_id', e.target.value)}
            placeholder="dQw4w9WgXcQ"
            style={{ marginBottom: 16 }}
          />
          <Text type="secondary" style={{ fontSize: 12 }}>
            YouTube: lấy phần sau v= trong URL<br />
            Vimeo: lấy số cuối trong URL
          </Text>

          <Divider>Cài đặt</Divider>

          <Text strong>Tỷ lệ khung hình</Text>
          <Select
            value={block.settings?.aspect_ratio || '16:9'}
            onChange={v => updateSettings('aspect_ratio', v)}
            style={{ width: '100%' }}
            options={[
              { value: '16:9', label: '16:9 (Chuẩn)' },
              { value: '4:3', label: '4:3' },
              { value: '1:1', label: '1:1 (Vuông)' },
            ]}
          />
        </div>
      );

    // ======= POST LIST BLOCK =======
    case 'post_list':
      return (
        <div>
          <Title level={5}>📰 Danh sách bài viết</Title>
          <Divider />

          <Text strong>Tiêu đề block</Text>
          <Input
            value={block.data.heading || ''}
            onChange={e => updateData('heading', e.target.value)}
            placeholder="Bài viết mới nhất"
            style={{ marginBottom: 16 }}
          />

          <Text strong>Slug danh mục (để trống = tất cả)</Text>
          <Input
            value={block.data.category_slug || ''}
            onChange={e => updateData('category_slug', e.target.value)}
            placeholder="cong-nghe"
            style={{ marginBottom: 16 }}
          />
          <Text type="secondary" style={{ fontSize: 12, marginBottom: 16, display: 'block' }}>
            Nhập slug danh mục để lọc bài viết. Để trống sẽ hiển thị tất cả bài viết mới nhất.
          </Text>

          <Text strong>Số bài viết hiển thị</Text>
          <Slider
            min={1}
            max={12}
            value={block.data.limit || 6}
            onChange={v => updateData('limit', v)}
            marks={{ 1: '1', 3: '3', 6: '6', 9: '9', 12: '12' }}
            style={{ marginBottom: 16 }}
          />

          <Divider>Cài đặt hiển thị</Divider>

          <Text strong>Bố cục</Text>
          <Select
            value={block.settings?.layout || 'grid'}
            onChange={v => updateSettings('layout', v)}
            style={{ width: '100%', marginBottom: 16 }}
            options={[
              { value: 'grid', label: 'Dạng lưới (Grid)' },
              { value: 'list', label: 'Dạng danh sách (List)' },
            ]}
          />

          <Text strong>Số cột (Grid)</Text>
          <Select
            value={block.settings?.columns || 3}
            onChange={v => updateSettings('columns', v)}
            style={{ width: '100%', marginBottom: 16 }}
            options={[
              { value: 2, label: '2 cột' },
              { value: 3, label: '3 cột' },
              { value: 4, label: '4 cột' },
            ]}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text strong>Hiển thị thumbnail</Text>
            <Switch
              checked={block.settings?.show_thumbnail !== false}
              onChange={v => updateSettings('show_thumbnail', v)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text strong>Hiển thị tóm tắt</Text>
            <Switch
              checked={block.settings?.show_excerpt !== false}
              onChange={v => updateSettings('show_excerpt', v)}
            />
          </div>
        </div>
      );

    // ======= CTA BLOCK =======
    case 'cta':
      return (
        <div>
          <Title level={5}>🔘 Nút CTA</Title>
          <Divider />

          <Text strong>Nội dung nút *</Text>
          <Input
            value={block.data.text || ''}
            onChange={e => updateData('text', e.target.value)}
            placeholder="Liên hệ ngay"
            style={{ marginBottom: 16 }}
          />

          <Text strong>Đường dẫn *</Text>
          <Input
            value={block.data.url || ''}
            onChange={e => updateData('url', e.target.value)}
            placeholder="/lien-he"
            style={{ marginBottom: 16 }}
          />

          <Divider>Cài đặt</Divider>

          <Text strong>Kiểu nút</Text>
          <Select
            value={block.settings?.style || 'primary'}
            onChange={v => updateSettings('style', v)}
            style={{ width: '100%' }}
            options={[
              { value: 'primary', label: 'Primary (Nổi bật)' },
              { value: 'secondary', label: 'Secondary' },
              { value: 'outline', label: 'Outline' },
            ]}
          />
        </div>
      );

    // ======= SPACER BLOCK =======
    case 'spacer':
      return (
        <div>
          <Title level={5}>📐 Khoảng cách</Title>
          <Divider />

          <Text strong>Chiều cao: {block.data.height || 40}px</Text>
          <Slider
            min={10}
            max={200}
            value={block.data.height || 40}
            onChange={v => updateData('height', v)}
            marks={{ 10: '10', 50: '50', 100: '100', 200: '200' }}
          />
        </div>
      );

    default:
      return (
        <div>
          <Text type="secondary">
            Không có cài đặt cho block loại "{block.type}"
          </Text>
        </div>
      );
  }
}

/**
 * Gallery Settings - Quản lý danh sách ảnh trong gallery block
 */
function GallerySettings({ block, updateBlock, handleImageUpload, updateSettings }) {
  const images = block.data.images || [];

  const updateImages = (newImages) => {
    updateBlock(block.id, {
      data: { ...block.data, images: newImages },
    });
  };

  const addImage = () => {
    updateImages([...images, { src: '', alt: '', caption: '' }]);
  };

  const updateImage = (idx, key, value) => {
    const updated = [...images];
    updated[idx] = { ...updated[idx], [key]: value };
    updateImages(updated);
  };

  const removeImage = (idx) => {
    updateImages(images.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <Title level={5}>🖼️ Bộ sưu tập</Title>
      <Divider />

      {images.map((img, idx) => (
        <div
          key={idx}
          style={{
            border: '1px solid #f0f0f0',
            borderRadius: 8,
            padding: 12,
            marginBottom: 12,
            background: '#fafafa',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text strong style={{ fontSize: 12 }}>Ảnh {idx + 1}</Text>
            <Button
              danger
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => removeImage(idx)}
            />
          </div>

          <Input
            size="small"
            value={img.src || ''}
            onChange={e => updateImage(idx, 'src', e.target.value)}
            placeholder="URL ảnh"
            style={{ marginBottom: 6 }}
          />
          <Upload
            showUploadList={false}
            beforeUpload={async (file) => {
              const url = await handleImageUpload(file);
              if (url) updateImage(idx, 'src', url);
              return false;
            }}
          >
            <Button icon={<UploadOutlined />} size="small" style={{ marginBottom: 6 }}>Upload</Button>
          </Upload>

          <Input
            size="small"
            value={img.alt || ''}
            onChange={e => updateImage(idx, 'alt', e.target.value)}
            placeholder="Alt text (SEO)"
            style={{ marginBottom: 6 }}
          />
          <Input
            size="small"
            value={img.caption || ''}
            onChange={e => updateImage(idx, 'caption', e.target.value)}
            placeholder="Caption"
          />
        </div>
      ))}

      <Button
        type="dashed"
        block
        icon={<PlusOutlined />}
        onClick={addImage}
        style={{ marginBottom: 16 }}
      >
        Thêm ảnh
      </Button>

      <Divider>Cài đặt</Divider>

      <Text strong>Bố cục</Text>
      <Select
        value={block.settings?.layout || 'grid'}
        onChange={v => updateSettings('layout', v)}
        style={{ width: '100%', marginBottom: 16 }}
        options={[
          { value: 'grid', label: 'Grid (Đều nhau)' },
          { value: 'masonry', label: 'Masonry' },
        ]}
      />

      <Text strong>Số cột</Text>
      <Select
        value={block.settings?.columns || 3}
        onChange={v => updateSettings('columns', v)}
        style={{ width: '100%', marginBottom: 16 }}
        options={[
          { value: 2, label: '2 cột' },
          { value: 3, label: '3 cột' },
          { value: 4, label: '4 cột' },
        ]}
      />

      <Text strong>Khoảng cách: {block.settings?.gap || 8}px</Text>
      <Slider
        min={0}
        max={24}
        value={block.settings?.gap || 8}
        onChange={v => updateSettings('gap', v)}
      />
    </div>
  );
}
