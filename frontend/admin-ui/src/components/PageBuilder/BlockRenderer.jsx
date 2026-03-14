import React, { useState, useEffect } from 'react';
import { Typography, Button, Empty, Spin } from 'antd';
import { PlayCircleOutlined, LinkOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

/**
 * BlockRenderer - Render từng block theo type (JSON → React Component)
 * editMode = true → hiển thị placeholder cho ảnh/video chưa có
 * editMode = false → render như public page
 */
export default function BlockRenderer({ block, editMode = false }) {
  if (!block) return null;

  // Hide in preview mode if hidden is true
  if (!editMode && block.hidden) return null;

  switch (block.type) {
    // ======= HERO BLOCK =======
    case 'hero':
      return (
        <div
          style={{
            position: 'relative',
            padding: '60px 20px',
            textAlign: block.settings?.align || 'center',
            backgroundImage: block.data.background_image
              ? `url(${block.data.background_image})`
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: 8,
            overflow: 'hidden',
          }}
        >
          {block.settings?.overlay && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0,0,0,0.4)',
              }}
            />
          )}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <Title level={1} style={{ color: '#fff', margin: 0 }}>
              {block.data.title || 'Tiêu đề Hero'}
            </Title>
            {block.data.subtitle && (
              <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 18 }}>
                {block.data.subtitle}
              </Text>
            )}
          </div>
        </div>
      );

    // ======= BANNER BLOCK =======
    case 'banner':
      return (
        <div
          style={{
            position: 'relative',
            padding: '40px 24px',
            textAlign: block.settings?.align || 'center',
            background: block.data.background_image
              ? `url(${block.data.background_image}) center/cover`
              : block.settings?.background_color || '#1890ff',
            borderRadius: 8,
            overflow: 'hidden',
          }}
        >
          {block.data.background_image && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0,0,0,0.5)',
              }}
            />
          )}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <Title level={2} style={{ color: block.settings?.text_color || '#fff', margin: '0 0 8px' }}>
              {block.data.title || 'Banner Title'}
            </Title>
            {block.data.subtitle && (
              <Text style={{ color: block.settings?.text_color || '#fff', opacity: 0.9, fontSize: 16, display: 'block', marginBottom: 16 }}>
                {block.data.subtitle}
              </Text>
            )}
            {block.data.button_text && (
              <a
                href={editMode ? undefined : (block.data.button_url || '/')}
                onClick={editMode ? (e) => e.preventDefault() : undefined}
                style={{
                  display: 'inline-block',
                  padding: '10px 24px',
                  background: '#fff',
                  color: block.settings?.background_color || '#1890ff',
                  borderRadius: 6,
                  fontWeight: 600,
                  textDecoration: 'none',
                  fontSize: 14,
                }}
              >
                {block.data.button_text}
              </a>
            )}
          </div>
        </div>
      );

    // ======= TEXT BLOCK =======
    case 'text':
      return (
        <div
          style={{
            maxWidth: block.settings?.max_width || '800px',
            margin: '0 auto',
          }}
          dangerouslySetInnerHTML={{ __html: block.data.content || '<p>Nội dung văn bản...</p>' }}
        />
      );

    // ======= IMAGE BLOCK =======
    case 'image': {
      const widthMap = { small: '50%', medium: '75%', full: '100%' };
      const imageWidth = widthMap[block.settings?.width] || '100%';

      return (
        <figure style={{ margin: 0, textAlign: 'center' }}>
          {block.data.src ? (
            <img
              src={block.data.src}
              alt={block.data.alt || ''}
              style={{
                width: imageWidth,
                borderRadius: 8,
                display: 'inline-block',
              }}
            />
          ) : editMode ? (
            <div
              style={{
                width: imageWidth,
                height: 200,
                background: '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8,
                border: '2px dashed #d9d9d9',
                margin: '0 auto',
              }}
            >
              <Text type="secondary">Chưa có ảnh</Text>
            </div>
          ) : null}
          {block.data.caption && (
            <figcaption style={{ marginTop: 8, fontSize: 14, color: '#666' }}>
              {block.data.caption}
            </figcaption>
          )}
        </figure>
      );
    }

    // ======= GALLERY BLOCK =======
    case 'gallery': {
      const images = block.data.images || [];
      const cols = block.settings?.columns || 3;
      const gap = block.settings?.gap || 8;

      if (images.length === 0) {
        return editMode ? (
          <div
            style={{
              padding: 40,
              textAlign: 'center',
              background: '#fafafa',
              borderRadius: 8,
              border: '2px dashed #d9d9d9',
            }}
          >
            <Text type="secondary">Chưa có ảnh trong gallery. Mở cài đặt để thêm ảnh.</Text>
          </div>
        ) : null;
      }

      return (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap,
          }}
        >
          {images.map((img, idx) => (
            <figure key={idx} style={{ margin: 0 }}>
              <img
                src={img.src}
                alt={img.alt || ''}
                style={{ width: '100%', borderRadius: 6, display: 'block', aspectRatio: '4/3', objectFit: 'cover' }}
              />
              {img.caption && (
                <figcaption style={{ marginTop: 4, fontSize: 12, color: '#666', textAlign: 'center' }}>
                  {img.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      );
    }

    // ======= VIDEO BLOCK =======
    case 'video': {
      const aspectMap = { '16:9': '56.25%', '4:3': '75%', '1:1': '100%' };
      const paddingTop = aspectMap[block.settings?.aspect_ratio] || '56.25%';

      if (!block.data.video_id && editMode) {
        return (
          <div
            style={{
              paddingTop,
              position: 'relative',
              background: '#f0f0f0',
              borderRadius: 8,
              border: '2px dashed #d9d9d9',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PlayCircleOutlined style={{ fontSize: 48, color: '#999' }} />
            </div>
          </div>
        );
      }

      let embedUrl = '';
      if (block.data.provider === 'youtube') {
        embedUrl = `https://www.youtube.com/embed/${block.data.video_id}`;
      } else if (block.data.provider === 'vimeo') {
        embedUrl = `https://player.vimeo.com/video/${block.data.video_id}`;
      }

      return (
        <div style={{ position: 'relative', paddingTop, borderRadius: 8, overflow: 'hidden' }}>
          <iframe
            src={embedUrl}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: 'none',
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }

    // ======= POST LIST BLOCK =======
    case 'post_list': {
      // In edit mode, show a preview placeholder
      const cols = block.settings?.columns || 3;
      
      if (editMode) {
        return (
          <div style={{ padding: 16 }}>
            <Title level={4} style={{ marginBottom: 16 }}>{block.data.heading || 'Bài viết'}</Title>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                gap: 12,
              }}
            >
              {Array.from({ length: block.data.limit || 6 }).slice(0, 6).map((_, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#fafafa',
                    borderRadius: 8,
                    border: '1px solid #f0f0f0',
                    overflow: 'hidden',
                  }}
                >
                  {block.settings?.show_thumbnail !== false && (
                    <div style={{ height: 100, background: '#e8e8e8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Text type="secondary" style={{ fontSize: 11 }}>Thumbnail</Text>
                    </div>
                  )}
                  <div style={{ padding: 10 }}>
                    <div style={{ height: 14, background: '#e8e8e8', borderRadius: 4, marginBottom: 6, width: '80%' }} />
                    {block.settings?.show_excerpt !== false && (
                      <>
                        <div style={{ height: 10, background: '#f0f0f0', borderRadius: 3, marginBottom: 4, width: '100%' }} />
                        <div style={{ height: 10, background: '#f0f0f0', borderRadius: 3, width: '60%' }} />
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {block.data.category_slug && (
              <Text type="secondary" style={{ fontSize: 12, marginTop: 8, display: 'block' }}>
                Danh mục: {block.data.category_slug} • Hiển thị {block.data.limit || 6} bài
              </Text>
            )}
          </div>
        );
      }

      // Public mode: actual posts will be fetched by the public renderer
      return (
        <PostListBlock block={block} />
      );
    }

    // ======= CTA BLOCK =======
    case 'cta': {
      const styleMap = {
        primary: { background: '#1890ff', color: '#fff', border: 'none' },
        secondary: { background: '#f0f0f0', color: '#333', border: 'none' },
        outline: { background: 'transparent', color: '#1890ff', border: '2px solid #1890ff' },
      };
      const btnStyle = styleMap[block.settings?.style] || styleMap.primary;

      return (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <a
            href={editMode ? undefined : block.data.url}
            onClick={editMode ? (e) => e.preventDefault() : undefined}
            style={{
              display: 'inline-block',
              padding: '12px 32px',
              fontSize: 16,
              fontWeight: 600,
              borderRadius: 6,
              textDecoration: 'none',
              cursor: editMode ? 'default' : 'pointer',
              ...btnStyle,
            }}
          >
            <LinkOutlined style={{ marginRight: 8 }} />
            {block.data.text || 'Nhấn vào đây'}
          </a>
        </div>
      );
    }

    // ======= SPACER BLOCK =======
    case 'spacer': {
      const height = block.data.height || 40;
      return (
        <div
          style={{
            height,
            background: editMode ? 'repeating-linear-gradient(45deg, transparent, transparent 10px, #f5f5f5 10px, #f5f5f5 20px)' : 'transparent',
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {editMode && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {height}px
            </Text>
          )}
        </div>
      );
    }

    // ======= UNKNOWN BLOCK =======
    default:
      return (
        <div style={{ padding: 20, background: '#fff2e8', borderRadius: 8 }}>
          <Text type="warning">
            Block không xác định: {block.type}
          </Text>
        </div>
      );
  }
}

/**
 * PostListBlock - Component riêng cho public rendering post_list
 * Fetch posts từ API và render
 */
function PostListBlock({ block }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
        const API_URL = `${API_BASE}/api/public`;
        
        const params = new URLSearchParams();
        if (block.data?.category_slug) params.set('category', block.data.category_slug);
        params.set('limit', block.data?.limit || 6);

        const res = await fetch(`${API_URL}/posts?${params.toString()}`);
        if (res.ok) {
          const json = await res.json();
          setPosts((json.data || json).slice(0, block.data.limit || 6));
        }
      } catch (err) {
        console.error('Failed to fetch posts for post_list block:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [block.data.category_slug, block.data.limit]);

  const cols = block.settings?.columns || 3;

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>;
  }

  return (
    <div style={{ padding: 16 }}>
      {block.data.heading && (
        <Title level={4} style={{ marginBottom: 16 }}>{block.data.heading}</Title>
      )}
      {posts.length === 0 ? (
        <Empty description="Không có bài viết nào" />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: 16,
          }}
        >
          {posts.map(post => (
            <a
              key={post.id}
              href={`/post/${post.slug}`}
              style={{
                display: 'block',
                borderRadius: 8,
                overflow: 'hidden',
                border: '1px solid #f0f0f0',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'box-shadow 0.2s',
              }}
            >
              {block.settings?.show_thumbnail !== false && post.thumbnail && (
                <img
                  src={post.thumbnail}
                  alt={post.title}
                  style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' }}
                />
              )}
              <div style={{ padding: 12 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 6px', lineHeight: 1.4 }}>{post.title}</h3>
                {block.settings?.show_excerpt !== false && post.summary && (
                  <p style={{ fontSize: 13, color: '#666', margin: 0, lineHeight: 1.5 }}>
                    {post.summary.substring(0, 100)}...
                  </p>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
