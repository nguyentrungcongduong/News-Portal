import React from 'react';
import BlockRenderer from './BlockRenderer';

/**
 * PublicRenderer - Render toàn bộ blocks như trang public
 * ĐÂY LÀ RENDER DÙNG CHUNG VỚI FRONTEND PUBLIC
 * 
 * Nguyên tắc:
 * - Không render HTML raw ngoài block
 * - Dùng chung component với preview
 * - editMode = false
 */
export default function PublicRenderer({ blocks }) {
  if (!blocks || blocks.length === 0) {
    return (
      <div style={{ padding: 60, textAlign: 'center', color: '#999' }}>
        Trang chưa có nội dung
      </div>
    );
  }

  // Sort blocks by order
  const sortedBlocks = [...blocks].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="public-page-content">
      {sortedBlocks.map(block => (
        <div key={block.id} className="public-block" style={{ marginBottom: 24 }}>
          <BlockRenderer block={block} editMode={false} />
        </div>
      ))}

      <style>{`
        .public-page-content {
          max-width: 1200px;
          margin: 0 auto;
        }
        .public-page-content img {
          max-width: 100%;
          height: auto;
        }
        .public-page-content p {
          line-height: 1.8;
          font-size: 16px;
        }
        .public-page-content h1, 
        .public-page-content h2, 
        .public-page-content h3 {
          margin-top: 0;
        }
      `}</style>
    </div>
  );
}
