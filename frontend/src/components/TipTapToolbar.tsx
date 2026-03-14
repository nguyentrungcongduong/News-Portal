'use client';

import { useState } from 'react';
import { Editor } from '@tiptap/react';
import { 
    BoldOutlined, 
    ItalicOutlined, 
    UnorderedListOutlined, 
    OrderedListOutlined,
    FileImageOutlined,
    CommentOutlined
} from '@ant-design/icons';
import { Button, Space } from 'antd';
import ImageUploadModal from './ImageUploadModal';

interface TipTapToolbarProps {
    editor: Editor | null;
    onImageInsert: (url: string, alt: string, caption: string) => void;
}

const TipTapToolbar = ({ editor, onImageInsert }: TipTapToolbarProps) => {
    const [imageModalOpen, setImageModalOpen] = useState(false);
    
    if (!editor) return null;

    return (
        <div className="flex items-center gap-2 p-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
            <Space size="small" wrap>
                {/* Heading Buttons */}
                <Button
                    size="small"
                    type={editor.isActive('heading', { level: 2 }) ? 'primary' : 'default'}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className="font-bold"
                >
                    H2
                </Button>
                <Button
                    size="small"
                    type={editor.isActive('heading', { level: 3 }) ? 'primary' : 'default'}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    className="font-bold"
                >
                    H3
                </Button>

                <div className="w-px h-6 bg-zinc-300 dark:bg-zinc-700" />

                {/* Text Formatting */}
                <Button
                    size="small"
                    type={editor.isActive('bold') ? 'primary' : 'default'}
                    icon={<BoldOutlined />}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                />
                <Button
                    size="small"
                    type={editor.isActive('italic') ? 'primary' : 'default'}
                    icon={<ItalicOutlined />}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                />
                <Button
                    size="small"
                    type={editor.isActive('blockquote') ? 'primary' : 'default'}
                    icon={<CommentOutlined />}
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                />

                <div className="w-px h-6 bg-zinc-300 dark:bg-zinc-700" />

                {/* Lists */}
                <Button
                    size="small"
                    type={editor.isActive('bulletList') ? 'primary' : 'default'}
                    icon={<UnorderedListOutlined />}
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                />
                <Button
                    size="small"
                    type={editor.isActive('orderedList') ? 'primary' : 'default'}
                    icon={<OrderedListOutlined />}
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                />

                <div className="w-px h-6 bg-zinc-300 dark:bg-zinc-700" />

                {/* Image Upload */}
                <Button
                    size="small"
                    icon={<FileImageOutlined />}
                    onClick={() => setImageModalOpen(true)}
                >
                    Chèn ảnh
                </Button>
            </Space>

            {/* Image Upload Modal */}
            <ImageUploadModal
                open={imageModalOpen}
                onCancel={() => setImageModalOpen(false)}
                onSuccess={(url, alt, caption) => {
                    onImageInsert(url, alt, caption);
                    setImageModalOpen(false);
                }}
            />
        </div>
    );
};

export default TipTapToolbar;

