import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Button, Space } from 'antd';
import { FileImageOutlined, BoldOutlined, ItalicOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import MediaGallery from './MediaGallery';

const TiptapEditor = ({ value, onChange }) => {
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Image,
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    // Sync content when value prop changes (e.g. after API fetch in Edit mode)
    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value);
        }
    }, [value, editor]);

    if (!editor) {
        return null;
    }

    const addImage = (url) => {
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
        setIsGalleryOpen(false);
    };

    return (
        <div style={{ border: '1px solid #d9d9d9', borderRadius: 8, padding: 8 }}>
            <div style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: 8, marginBottom: 8 }}>
                <Space>
                    <Button 
                        size="small" 
                        icon={<BoldOutlined />} 
                        type={editor.isActive('bold') ? 'primary' : 'default'}
                        onClick={() => editor.chain().focus().toggleBold().run()}
                    />
                    <Button 
                        size="small" 
                        icon={<ItalicOutlined />}
                        type={editor.isActive('italic') ? 'primary' : 'default'}
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                    />
                    <Button 
                        size="small" 
                        icon={<FileImageOutlined />}
                        onClick={() => setIsGalleryOpen(true)}
                    >
                        Chèn ảnh
                    </Button>
                </Space>
            </div>
            
            <div style={{ padding: '12px 16px', minHeight: 400 }}>
                <EditorContent editor={editor} style={{ outline: 'none' }} />
            </div>

            <MediaGallery 
                visible={isGalleryOpen} 
                onCancel={() => setIsGalleryOpen(false)}
                onSelect={addImage}
            />
        </div>
    );
};

export default TiptapEditor;
