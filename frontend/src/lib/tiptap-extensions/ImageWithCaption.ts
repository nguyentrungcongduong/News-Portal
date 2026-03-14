import Image from '@tiptap/extension-image';
import { mergeAttributes, ReactRenderer } from '@tiptap/react';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Node as ProseMirrorNode } from '@tiptap/pm/model';
import React from 'react';

export interface ImageWithCaptionOptions {
    inline: boolean;
    allowBase64: boolean;
    HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        imageWithCaption: {
            setImage: (options: {
                src: string;
                alt?: string;
                caption?: string;
            }) => ReturnType;
        };
    }
}

const ImageWithCaption = Image.extend<ImageWithCaptionOptions>({
    name: 'imageWithCaption',

    addOptions() {
        return {
            ...this.parent?.(),
            inline: true,
            allowBase64: false,
            HTMLAttributes: {
                class: 'max-w-full h-auto rounded-lg',
            },
        };
    },

    addAttributes() {
        return {
            ...this.parent?.(),
            src: {
                default: null,
            },
            alt: {
                default: null,
            },
            caption: {
                default: null,
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'figure',
                getAttrs: (node) => {
                    const img = (node as HTMLElement).querySelector('img');
                    const figcaption = (node as HTMLElement).querySelector('figcaption');
                    if (!img) return false;
                    
                    return {
                        src: img.getAttribute('src'),
                        alt: img.getAttribute('alt') || '',
                        caption: figcaption?.textContent || '',
                    };
                },
            },
            {
                tag: 'img[src]',
                getAttrs: (node) => ({
                    src: (node as HTMLElement).getAttribute('src'),
                    alt: (node as HTMLElement).getAttribute('alt') || '',
                    caption: null,
                }),
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        const { src, alt, caption } = HTMLAttributes;
        
        if (caption) {
            return [
                'figure',
                { class: 'my-4' },
                [
                    'img',
                    mergeAttributes(this.options.HTMLAttributes, {
                        src,
                        alt: alt || '',
                    }),
                ],
                ['figcaption', { class: 'text-sm text-gray-600 dark:text-gray-400 mt-2 text-center' }, caption as string],
            ];
        }
        
        return [
            'img',
            mergeAttributes(this.options.HTMLAttributes, {
                src,
                alt: alt || '',
            }),
        ];
    },

    addCommands() {
        return {
            setImage: (options: { src: string; alt?: string; caption?: string }) => ({ commands }) => {
                const { src, alt = '', caption = '' } = options;
                
                if (caption) {
                    return commands.insertContent({
                        type: this.name,
                        attrs: { src, alt, caption },
                    });
                }
                
                return commands.insertContent({
                    type: this.name,
                    attrs: { src, alt },
                });
            },
        };
    },
});

export default ImageWithCaption;

