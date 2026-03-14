import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

export interface CommentOptions {
    comments?: Array<{
        id: string;
        from: number;
        to: number;
        text: string;
        status: 'open' | 'resolved';
        user?: { id: number; name: string };
    }>;
    onAddComment?: (from: number, to: number) => void;
    onSelectComment?: (commentId: string) => void;
}

export const CommentExtension = Extension.create<CommentOptions>({
    name: 'comment',

    addOptions() {
        return {
            comments: [],
            onAddComment: () => {},
            onSelectComment: () => {},
        };
    },

    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: new PluginKey('comment'),
                props: {
                    handleDOMEvents: {
                        mouseup: (view, event) => {
                            const { selection } = view.state;
                            const { from, to } = selection;
                            
                            // If user selected text, trigger comment add
                            if (from !== to) {
                                const selectedText = view.state.doc.textBetween(from, to);
                                if (selectedText.trim().length > 0) {
                                    this.options.onAddComment?.(from, to);
                                }
                            }
                            
                            return false;
                        },
                    },
                },
            }),
        ];
    },
});

