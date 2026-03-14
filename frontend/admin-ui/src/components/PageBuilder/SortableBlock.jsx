import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button, Space, Tag, Tooltip } from 'antd';
import {
  HolderOutlined,
  DeleteOutlined,
  CopyOutlined,
  SettingOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from '@ant-design/icons';
import BlockRenderer from './BlockRenderer';

const BLOCK_TYPE_LABELS = {
  hero: { label: 'Hero', color: 'purple' },
  banner: { label: 'Banner', color: 'magenta' },
  text: { label: 'Text', color: 'blue' },
  image: { label: 'Image', color: 'green' },
  gallery: { label: 'Gallery', color: 'cyan' },
  video: { label: 'Video', color: 'red' },
  post_list: { label: 'Posts', color: 'geekblue' },
  cta: { label: 'CTA', color: 'orange' },
  spacer: { label: 'Spacer', color: 'default' },
};

export default function SortableBlock({
  block,
  isActive,
  onSelect,
  onDelete,
  onDuplicate,
  onUpdate,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : (block.hidden ? 0.4 : 1),
    filter: block.hidden ? 'grayscale(100%)' : 'none',
  };

  const typeInfo = BLOCK_TYPE_LABELS[block.type] || { label: block.type, color: 'default' };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`block-wrapper ${isActive ? 'active' : ''}`}
      onClick={onSelect}
    >
      {/* Drag Handle & Controls */}
      <div className="block-drag-handle">
        <Space>
          {/* Drag Icon - CHỈ PHẦN NÀY ĐƯỢC KÉO */}
          <span {...attributes} {...listeners} style={{ cursor: 'grab' }}>
            <HolderOutlined style={{ fontSize: 16 }} />
          </span>
          <Tag color={typeInfo.color}>{typeInfo.label}</Tag>
          {block.hidden && <Tag color="default">Hidden</Tag>}
        </Space>

        <Space size="small">
          <Tooltip title={block.hidden ? "Hiện block" : "Ẩn block"}>
            <Button
              type="text"
              size="small"
              icon={block.hidden ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                if (onUpdate) onUpdate({ hidden: !block.hidden });
              }}
            />
          </Tooltip>
          <Tooltip title="Nhân đôi">
            <Button
              type="text"
              size="small"
              icon={<CopyOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate();
              }}
            />
          </Tooltip>
          <Tooltip title="Cài đặt">
            <Button
              type="text"
              size="small"
              icon={<SettingOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            />
          </Tooltip>
        </Space>
      </div>

      {/* Block Content Preview */}
      <div style={{ padding: 12 }}>
        <BlockRenderer block={block} editMode />
      </div>
    </div>
  );
}
