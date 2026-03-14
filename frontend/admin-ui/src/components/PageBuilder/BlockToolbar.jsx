import React from 'react';
import {
  LayoutOutlined,
  FontSizeOutlined,
  PictureOutlined,
  PlaySquareOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  ThunderboltOutlined,
  BorderOuterOutlined,
  ColumnHeightOutlined,
} from '@ant-design/icons';

// Utility to generate ID safely
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 9);

// Block templates - Tạo block mới với cấu trúc chuẩn JSON
const BLOCK_TEMPLATES = {
  hero: () => ({
    id: generateId(),
    type: 'hero',
    hidden: false,
    data: {
      title: 'Tiêu đề Hero',
      subtitle: 'Mô tả ngắn gọn',
      background_image: 'https://picsum.photos/1920/600',
    },
    settings: {
      align: 'center',
      overlay: true,
    },
  }),

  banner: () => ({
    id: generateId(),
    type: 'banner',
    hidden: false,
    data: {
      title: 'Banner Title',
      subtitle: 'Nội dung phụ',
      background_image: '',
      button_text: 'Tìm hiểu thêm',
      button_url: '/',
    },
    settings: {
      background_color: '#1890ff',
      text_color: '#ffffff',
      align: 'center',
    },
  }),

  text: () => ({
    id: generateId(),
    type: 'text',
    hidden: false,
    data: {
      content: '<p>Nhập nội dung văn bản tại đây...</p>',
    },
    settings: {
      max_width: '800px',
    },
  }),

  image: () => ({
    id: generateId(),
    type: 'image',
    hidden: false,
    data: {
      src: '',
      alt: '',
      caption: '',
    },
    settings: {
      width: 'full',
    },
  }),

  gallery: () => ({
    id: generateId(),
    type: 'gallery',
    hidden: false,
    data: {
      images: [],
    },
    settings: {
      layout: 'grid', // grid | masonry
      columns: 3,
      gap: 8,
    },
  }),

  video: () => ({
    id: generateId(),
    type: 'video',
    hidden: false,
    data: {
      provider: 'youtube',
      video_id: '',
    },
    settings: {
      aspect_ratio: '16:9',
    },
  }),

  post_list: () => ({
    id: generateId(),
    type: 'post_list',
    hidden: false,
    data: {
      category_slug: '',
      limit: 6,
      heading: 'Bài viết mới nhất',
    },
    settings: {
      layout: 'grid', // grid | list
      columns: 3,
      show_thumbnail: true,
      show_excerpt: true,
    },
  }),

  cta: () => ({
    id: generateId(),
    type: 'cta',
    hidden: false,
    data: {
      text: 'Nhấn vào đây',
      url: '/',
    },
    settings: {
      style: 'primary',
    },
  }),

  spacer: () => ({
    id: generateId(),
    type: 'spacer',
    hidden: false,
    data: {
      height: 40,
    },
    settings: {},
  }),
};

// Visual configs for toolbar - Thumbnail style
const BLOCK_VISUALS = {
  hero: { 
    icon: <LayoutOutlined style={{ fontSize: 24 }} />, 
    label: 'Hero Banner', 
    desc: 'Banner lớn đầu trang có tiêu đề và ảnh nền',
    color: '#e6f7ff',
    iconColor: '#1890ff'
  },
  banner: { 
    icon: <BorderOuterOutlined style={{ fontSize: 24 }} />, 
    label: 'Promo Banner', 
    desc: 'Khối quảng cáo hoặc giới thiệu ngắn gọn',
    color: '#fff7e6',
    iconColor: '#fa8c16'
  },
  text: { 
    icon: <FontSizeOutlined style={{ fontSize: 24 }} />, 
    label: 'Văn bản (Rich Text)', 
    desc: 'Soạn thảo văn bản tự do, hỗ trợ định dạng',
    color: '#f6ffed',
    iconColor: '#52c41a'
  },
  image: { 
    icon: <PictureOutlined style={{ fontSize: 24 }} />, 
    label: 'Hình ảnh đơn', 
    desc: 'Hiển thị một ảnh lớn kèm chú thích',
    color: '#fff0f6',
    iconColor: '#eb2f96'
  },
  gallery: { 
    icon: <AppstoreOutlined style={{ fontSize: 24 }} />, 
    label: 'Thư viện ảnh', 
    desc: 'Bộ sưu tập nhiều ảnh dạng lưới (Grid)',
    color: '#f9f0ff',
    iconColor: '#722ed1'
  },
  post_list: { 
    icon: <UnorderedListOutlined style={{ fontSize: 24 }} />, 
    label: 'Danh sách bài viết', 
    desc: 'Tự động lấy bài viết mới nhất theo danh mục',
    color: '#e6fffb',
    iconColor: '#13c2c2'
  },
  video: { 
    icon: <PlaySquareOutlined style={{ fontSize: 24 }} />, 
    label: 'Video Player', 
    desc: 'Chèn video từ YouTube hoặc Vimeo',
    color: '#fff1f0',
    iconColor: '#f5222d'
  },
  cta: { 
    icon: <ThunderboltOutlined style={{ fontSize: 24 }} />, 
    label: 'Nút hành động (CTA)', 
    desc: 'Nút bấm điều hướng người dùng',
    color: '#fcffe6',
    iconColor: '#a0d911'
  },
  spacer: { 
    icon: <ColumnHeightOutlined style={{ fontSize: 24 }} />, 
    label: 'Khoảng trống', 
    desc: 'Tạo khoảng cách giữa các khối nội dung',
    color: '#f0f0f0',
    iconColor: '#595959'
  },
};

export default function BlockToolbar({ addBlock }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {Object.keys(BLOCK_TEMPLATES).map((type) => {
        const visual = BLOCK_VISUALS[type];
        return (
          <div
            key={type}
            onClick={() => addBlock(BLOCK_TEMPLATES[type]())}
            style={{
              cursor: 'pointer',
              padding: 12,
              border: '1px solid #f0f0f0',
              borderRadius: 8,
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              transition: 'all 0.2s',
            }}
            className="hover:border-primary hover:shadow-md block-thumbnail"
          >
            <div 
              style={{ 
                color: visual?.iconColor, 
                background: visual?.color, 
                padding: 10, 
                borderRadius: 8, 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 44,
                minHeight: 44
              }}
            >
              {visual?.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: '#262626', marginBottom: 2 }}>
                {visual?.label}
              </div>
              <div style={{ fontSize: 11, color: '#8c8c8c', lineHeight: 1.3 }}>
                {visual?.desc}
              </div>
            </div>
            {/* Hover effect icon */}
            <div className="add-icon" style={{ opacity: 0, transition: 'opacity 0.2s', color: '#1890ff' }}>
              +
            </div>
          </div>
        );
      })}
      <style>{`
        .block-thumbnail:hover .add-icon {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
}
