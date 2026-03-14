'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Heading from '@tiptap/extension-heading';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useRef } from 'react';
import TipTapToolbar from './TipTapToolbar';
import ImageWithCaption from '@/lib/tiptap-extensions/ImageWithCaption';
import { injectHeadingIDs } from '@/lib/toc-generator';

interface TipTapEditorProps {
    value?: string;
    onChange?: (html: string, json: Record<string, unknown>) => void;
    placeholder?: string;
    editable?: boolean;
}

const TipTapEditor = ({
    value = '',
    onChange,
    placeholder = 'Nhập nội dung bài viết...',
    editable = true
}: TipTapEditorProps) => {
    const isSyncingRef = useRef(false);
    const lastEditorHtmlRef = useRef('');

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: false, // Disable default heading để dùng custom
            }),
            ImageWithCaption,
            Heading.configure({
                levels: [2, 3], // CHỈ H2 và H3 - H1 chỉ dành cho title (SEO)
                HTMLAttributes: {
                    class: 'font-bold',
                },
            }),
            Placeholder.configure({
                placeholder,
            }),
        ],
        content: value,
        editable,
        immediatelyRender: false, // Disable immediate render for SSR compatibility
        onUpdate: ({ editor }) => {
            // Skip if we're syncing from prop (to prevent infinite loop)
            if (isSyncingRef.current || !onChange) return;

            const currentHtml = editor.getHTML();

            // Only process if HTML actually changed
            if (currentHtml === lastEditorHtmlRef.current) return;

            lastEditorHtmlRef.current = currentHtml;

            let html = currentHtml;
            // Inject heading IDs for TOC
            html = injectHeadingIDs(html);
            const json = editor.getJSON();

            // Call onChange
            onChange(html, json);
        },
    });

    // Sync content when value prop changes (for Edit mode)
    useEffect(() => {
        if (!editor || isSyncingRef.current) return;

        const currentHtml = editor.getHTML();
        // Only update if value actually changed and is different from current content
        if (value !== currentHtml) {
            isSyncingRef.current = true;

            // Update editor content
            editor.commands.setContent(value || '');
            lastEditorHtmlRef.current = value || '';

            // Reset sync flag after a short delay
            setTimeout(() => {
                isSyncingRef.current = false;
            }, 100);
        }
    }, [value, editor]);

    // Insert image with caption and alt
    const handleImageInsert = (url: string, alt: string, caption: string) => {
        if (!editor) return;

        editor.chain().focus().setImage({
            src: url,
            alt: alt || '',
            caption: caption || ''
        }).run();
    };

    if (!editor) {
        return (
            <div className="flex items-center justify-center h-64 border border-zinc-200 rounded-lg">
                <div className="text-zinc-500">Đang tải editor...</div>
            </div>
        );
    }

    return (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-zinc-950">
            {editable && (
                <TipTapToolbar editor={editor} onImageInsert={handleImageInsert} />
            )}

            <div className="p-6 min-h-[400px] focus-within:outline-none">
                <EditorContent editor={editor} />
            </div>

            <style jsx global>{`
                .ProseMirror {
                    outline: none;
                    color: inherit;
                }
                
                .ProseMirror p.is-editor-empty:first-child::before {
                    color: #adb5bd;
                    content: attr(data-placeholder);
                    float: left;
                    height: 0;
                    pointer-events: none;
                    font-style: italic;
                }

                .ProseMirror img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 0.5rem;
                    margin: 1rem 0;
                }

                .ProseMirror h2 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    margin-top: 1.5rem;
                    margin-bottom: 1rem;
                    line-height: 1.3;
                    color: inherit;
                }

                .ProseMirror h3 {
                    font-size: 1.25rem;
                    font-weight: 700;
                    margin-top: 1.25rem;
                    margin-bottom: 0.75rem;
                    line-height: 1.4;
                }

                .ProseMirror blockquote {
                    border-left: 4px solid #3b82f6;
                    padding-left: 1rem;
                    margin: 1rem 0;
                    font-style: italic;
                    color: #64748b;
                }

                .ProseMirror ul, .ProseMirror ol {
                    padding-left: 1.5rem;
                    margin: 0.75rem 0;
                }

                .ProseMirror ul {
                    list-style-type: disc;
                }

                .ProseMirror ol {
                    list-style-type: decimal;
                }

                .ProseMirror li {
                    margin: 0.25rem 0;
                }

                .ProseMirror strong {
                    font-weight: 700;
                }

                .ProseMirror em {
                    font-style: italic;
                }
            `}</style>
        </div>
    );
};

export default TipTapEditor;

