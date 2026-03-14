import React, { useState } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { Popover, Button, Input } from 'antd';
import { SmileOutlined, CloseCircleOutlined } from '@ant-design/icons';

/**
 * Professional Emoji Picker Component - Notion-like UI
 * Compatible with Ant Design Form.Item
 * @param {string} value - Current emoji value (from Form.Item)
 * @param {function} onChange - Callback when emoji changes (from Form.Item)
 * @param {string} placeholder - Placeholder text
 */
export default function EmojiPickerInput({ value = '', onChange, placeholder = 'Chọn emoji...' }) {
  const [open, setOpen] = useState(false);

  const handleEmojiClick = (emojiData) => {
    onChange?.(emojiData.emoji);
    setOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange?.('');
  };

  const handleInputChange = (e) => {
    onChange?.(e.target.value);
  };

  const content = (
    <div style={{ margin: -12 }}>
      <EmojiPicker
        onEmojiClick={handleEmojiClick}
        autoFocusSearch={false}
        theme="light"
        height={400}
        width={350}
        searchPlaceHolder="Tìm emoji..."
        previewConfig={{
          showPreview: false,
        }}
        skinTonesDisabled
        categories={[
          { category: 'suggested', name: 'Gần đây' },
          { category: 'smileys_people', name: 'Mặt cười & Người' },
          { category: 'animals_nature', name: 'Động vật & Thiên nhiên' },
          { category: 'food_drink', name: 'Đồ ăn & Thức uống' },
          { category: 'travel_places', name: 'Du lịch & Địa điểm' },
          { category: 'activities', name: 'Hoạt động' },
          { category: 'objects', name: 'Đồ vật' },
          { category: 'symbols', name: 'Biểu tượng' },
          { category: 'flags', name: 'Cờ' },
        ]}
      />
    </div>
  );

  return (
    <div className="emoji-picker-input">
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <Popover
          content={content}
          trigger="click"
          open={open}
          onOpenChange={setOpen}
          placement="bottomLeft"
          arrow={false}
          overlayInnerStyle={{ padding: 12, borderRadius: 12 }}
        >
          <Button
            type="default"
            style={{
              width: 50,
              height: 50,
              fontSize: value ? 28 : 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 12,
              border: '1px dashed #d9d9d9',
              background: value ? '#f5f5f5' : '#fff',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {value || <SmileOutlined style={{ color: '#bfbfbf' }} />}
          </Button>
        </Popover>

        <Input
          value={value || ''}
          onChange={handleInputChange}
          placeholder={placeholder}
          style={{ flex: 1, height: 50, borderRadius: 8, fontSize: value ? 20 : 14 }}
          suffix={
            <CloseCircleOutlined
              style={{ 
                color: '#bfbfbf', 
                cursor: 'pointer',
                opacity: value ? 1 : 0,
                pointerEvents: value ? 'auto' : 'none'
              }}
              onClick={handleClear}
            />
          }
        />
      </div>

      <style>{`
        .emoji-picker-input .EmojiPickerReact {
          border: none !important;
          box-shadow: none !important;
        }
        .emoji-picker-input .epr-emoji-category-label {
          font-weight: 600;
          color: #666;
        }
        .emoji-picker-input .epr-search-container input {
          border-radius: 8px !important;
        }
      `}</style>
    </div>
  );
}
