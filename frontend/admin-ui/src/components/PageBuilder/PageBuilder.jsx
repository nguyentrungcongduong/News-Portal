import React, { useState, useCallback } from 'react';
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { Button, Space, Card, message, Input, Switch, Drawer, Typography, Tooltip, Empty, Tabs, Collapse } from 'antd';
import {
  SaveOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  SettingOutlined,
  CopyOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import SortableBlock from './SortableBlock';
import BlockToolbar from './BlockToolbar';
import BlockSettings from './BlockSettings';
import PublicRenderer from './PublicRenderer';
import api from '../../services/api';

const { Text, Title } = Typography;
const { TextArea } = Input;

// Utility to generate ID safely
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 9);

/**
 * PageBuilder Component - Full Featured
 * @param {number} pageId - ID of existing page (for edit mode)
 * @param {Object} initialData - Initial page data
 * @param {Function} onSave - Callback when page is saved
 */
export default function PageBuilder({ pageId, initialData, onSave }) {
  // === SENSORS ===
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // === STATE CHUNG ===
  const [blocks, setBlocks] = useState(initialData?.blocks || []);
  const [activeBlockId, setActiveBlockId] = useState(null);
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [seoDrawerOpen, setSeoDrawerOpen] = useState(false);

  // Page metadata
  const [pageTitle, setPageTitle] = useState(initialData?.title || '');
  const [pageSlug, setPageSlug] = useState(initialData?.slug || '');
  const [pageStatus, setPageStatus] = useState(initialData?.status || 'draft');
  const [menuVisible, setMenuVisible] = useState(initialData?.menu_visible ?? true);

  // SEO metadata
  const [seoTitle, setSeoTitle] = useState(initialData?.seo?.title || '');
  const [seoDescription, setSeoDescription] = useState(initialData?.seo?.description || '');
  const [seoOgImage, setSeoOgImage] = useState(initialData?.seo?.og_image || '');
  const [seoKeywords, setSeoKeywords] = useState(initialData?.seo?.keywords || '');

  // === BLOCK OPERATIONS ===
  const addBlock = useCallback((block) => {
    setBlocks(prev => [...prev, { ...block, id: generateId(), order: prev.length + 1 }]);
    message.success(`Đã thêm block ${block.type}`);
  }, []);

  const updateBlock = useCallback((id, patch) => {
    setBlocks(prev =>
      prev.map(b => (b.id === id ? { ...b, ...patch } : b))
    );
  }, []);

  const deleteBlock = useCallback((id) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
    if (activeBlockId === id) {
      setActiveBlockId(null);
      setSettingsOpen(false);
    }
    message.success('Đã xóa block');
  }, [activeBlockId]);

  const duplicateBlock = useCallback((id) => {
    setBlocks(prev => {
      const block = prev.find(b => b.id === id);
      if (!block) return prev;
      const newBlock = {
        ...block,
        id: generateId(),
        order: prev.length + 1,
      };
      return [...prev, newBlock];
    });
    message.success('Đã nhân đôi block');
  }, []);

  // === DRAG & DROP ===
  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setBlocks(items => {
      const oldIndex = items.findIndex(i => i.id === active.id);
      const newIndex = items.findIndex(i => i.id === over.id);
      return arrayMove(items, oldIndex, newIndex).map((item, idx) => ({
        ...item,
        order: idx + 1,
      }));
    });
  }, []);

  // === SELECT BLOCK ===
  const selectBlock = useCallback((id) => {
    setActiveBlockId(id);
    setSettingsOpen(true);
  }, []);

  const clonePage = async () => {
    if (!pageId) {
      message.warning('Vui lòng lưu trang trước khi nhân bản');
      return;
    }

    try {
      const payload = {
        title: `${pageTitle} (Copy)`,
        slug: `${pageSlug}-copy-${Date.now()}`,
        locale: 'vi',
        status: 'draft',
        menu_visible: false, // Default hidden for copies
        seo: {
          title: seoTitle,
          description: seoDescription,
          og_image: seoOgImage,
          keywords: seoKeywords,
        },
        blocks: blocks.map((b, idx) => ({ ...b, id: generateId(), order: idx + 1 })),
      };

      await api.post('/api/admin/pages', payload);
      message.success('Đã nhân bản trang thành công!');
    } catch (err) {
      console.error(err);
      message.error('Lỗi khi nhân bản trang');
    }
  };

  const savePage = async () => {
    if (!pageTitle.trim()) {
      message.error('Vui lòng nhập tiêu đề trang');
      return;
    }

    // Validate Blocks
    const errors = [];
    blocks.forEach((block, index) => {
      const pos = `Block #${index + 1} (${block.type})`;
      if (block.type === 'hero' && !block.data.title) errors.push(`${pos}: Thiếu tiêu đề`);
      if (block.type === 'image' && !block.data.src) errors.push(`${pos}: Chưa có ảnh`);
      if (block.type === 'cta' && (!block.data.url || !block.data.text)) errors.push(`${pos}: Thiếu URL hoặc Text`);
    });

    if (errors.length > 0) {
      errors.forEach(e => message.error(e));
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: pageTitle,
        slug: pageSlug || pageTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        locale: 'vi',
        status: pageStatus,
        menu_visible: menuVisible,
        seo: {
          title: seoTitle || pageTitle,
          description: seoDescription,
          og_image: seoOgImage,
          keywords: seoKeywords,
        },
        blocks: blocks.map((b, idx) => ({ ...b, order: idx + 1 })),
      };

      if (pageId) {
        await api.put(`/api/admin/pages/${pageId}`, payload);
      } else {
        await api.post('/api/admin/pages', payload);
      }

      message.success('Đã lưu trang thành công!');
      if (onSave) onSave(payload);
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.message || 'Lỗi khi lưu trang');
    } finally {
      setSaving(false);
    }
  };

  // Active block for settings panel
  const activeBlock = blocks.find(b => b.id === activeBlockId) || null;

  return (
    <div className="page-builder">
      {/* === HEADER === */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <Space>
            <Input
              placeholder="Tiêu đề trang"
              value={pageTitle}
              onChange={e => setPageTitle(e.target.value)}
              style={{ width: 250 }}
              size="large"
            />
            <Input
              placeholder="slug-trang"
              value={pageSlug}
              onChange={e => setPageSlug(e.target.value)}
              style={{ width: 180 }}
              addonBefore="/"
            />
          </Space>

          <Space>
            {/* SEO Button */}
            <Tooltip title="Cài đặt SEO">
              <Button
                icon={<SearchOutlined />}
                onClick={() => setSeoDrawerOpen(true)}
              >
                SEO
              </Button>
            </Tooltip>

            {/* Clone Button */}
            {pageId && (
              <Tooltip title="Nhân bản trang">
                <Button
                  icon={<CopyOutlined />}
                  onClick={clonePage}
                >
                  Clone
                </Button>
              </Tooltip>
            )}

            <Tooltip title={preview ? 'Chỉnh sửa' : 'Xem trước'}>
              <Button
                icon={preview ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                onClick={() => setPreview(!preview)}
              >
                {preview ? 'Thoát Preview' : 'Preview'}
              </Button>
            </Tooltip>

            <Tooltip title="Hiển thị trên menu?">
              <Switch
                checked={menuVisible}
                onChange={setMenuVisible}
                checkedChildren="In Menu"
                unCheckedChildren="Hidden"
                style={{ marginRight: 8 }}
              />
            </Tooltip>

            <Switch
              checked={pageStatus === 'published'}
              onChange={checked => setPageStatus(checked ? 'published' : 'draft')}
              checkedChildren="Published"
              unCheckedChildren="Draft"
            />

            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={savePage}
              loading={saving}
            >
              Lưu trang
            </Button>
          </Space>
        </div>
      </Card>

      {/* === MAIN CONTENT === */}
      <div style={{ display: 'flex', gap: 16 }}>
        {/* TOOLBAR - Thêm block */}
        {!preview && (
          <div style={{ width: 200, flexShrink: 0 }}>
            <Card title="Thêm Block" size="small">
              <BlockToolbar addBlock={addBlock} />
            </Card>
          </div>
        )}

        {/* CANVAS / PREVIEW */}
        <div style={{ flex: 1 }}>
          <Card
            title={preview ? '👁️ Preview Mode' : '🎨 Canvas'}
            size="small"
            style={{ minHeight: 500 }}
          >
            {preview ? (
              <PublicRenderer blocks={blocks} />
            ) : blocks.length === 0 ? (
              <Empty
                description="Chưa có block nào"
                style={{ padding: 60 }}
              >
                <Text type="secondary">
                  Nhấn vào các nút bên trái để thêm block
                </Text>
              </Empty>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={blocks.map(b => b.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {blocks.map(block => (
                    <SortableBlock
                      key={block.id}
                      block={block}
                      isActive={block.id === activeBlockId}
                      onSelect={() => selectBlock(block.id)}
                      onDelete={() => deleteBlock(block.id)}
                      onDuplicate={() => duplicateBlock(block.id)}
                      onUpdate={(patch) => updateBlock(block.id, patch)}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </Card>
        </div>
      </div>

      {/* === BLOCK SETTINGS DRAWER === */}
      <Drawer
        title="Cài đặt Block"
        placement="right"
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        width={400}
      >
        {activeBlock ? (
          <BlockSettings
            block={activeBlock}
            updateBlock={updateBlock}
          />
        ) : (
          <Text type="secondary">Chọn một block để chỉnh sửa</Text>
        )}
      </Drawer>

      {/* === SEO SETTINGS DRAWER === */}
      <Drawer
        title="🔍 Cài đặt SEO"
        placement="right"
        open={seoDrawerOpen}
        onClose={() => setSeoDrawerOpen(false)}
        width={450}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <Text strong>SEO Title</Text>
            <Input
              value={seoTitle}
              onChange={e => setSeoTitle(e.target.value)}
              placeholder={pageTitle || 'Tiêu đề hiển thị trên Google'}
              maxLength={60}
              showCount
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Tối ưu: 50-60 ký tự
            </Text>
          </div>

          <div>
            <Text strong>Meta Description</Text>
            <TextArea
              value={seoDescription}
              onChange={e => setSeoDescription(e.target.value)}
              placeholder="Mô tả ngắn gọn về trang này..."
              rows={3}
              maxLength={160}
              showCount
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Tối ưu: 120-160 ký tự
            </Text>
          </div>

          <div>
            <Text strong>Keywords (phân tách bằng dấu phẩy)</Text>
            <Input
              value={seoKeywords}
              onChange={e => setSeoKeywords(e.target.value)}
              placeholder="từ khóa 1, từ khóa 2, từ khóa 3"
            />
          </div>

          <div>
            <Text strong>OG Image URL</Text>
            <Input
              value={seoOgImage}
              onChange={e => setSeoOgImage(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Ảnh hiển thị khi chia sẻ trên mạng xã hội (1200x630px)
            </Text>
          </div>

          {/* SEO Preview */}
          <Collapse
            items={[
              {
                key: '1',
                label: '👁️ Xem trước trên Google',
                children: (
                  <div style={{ fontFamily: 'Arial, sans-serif' }}>
                    <div style={{ color: '#1a0dab', fontSize: 18 }}>
                      {seoTitle || pageTitle || 'Tiêu đề trang'}
                    </div>
                    <div style={{ color: '#006621', fontSize: 14 }}>
                      {`example.com/${pageSlug || 'duong-dan'}`}
                    </div>
                    <div style={{ color: '#545454', fontSize: 13 }}>
                      {seoDescription || 'Mô tả trang sẽ hiển thị ở đây...'}
                    </div>
                  </div>
                ),
              },
            ]}
          />
        </div>
      </Drawer>

      <style>{`
        .page-builder .block-wrapper {
          position: relative;
          margin-bottom: 12px;
          border: 2px dashed transparent;
          border-radius: 8px;
          transition: all 0.2s;
        }
        .page-builder .block-wrapper:hover {
          border-color: #1890ff;
        }
        .page-builder .block-wrapper.active {
          border-color: #1890ff;
          background: rgba(24, 144, 255, 0.05);
        }
        .page-builder .block-drag-handle {
          cursor: grab;
          padding: 4px 8px;
          background: #f0f0f0;
          border-radius: 4px 4px 0 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .page-builder .block-drag-handle:active {
          cursor: grabbing;
        }
      `}</style>
    </div>
  );
}
