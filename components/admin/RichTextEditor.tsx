import React, { useCallback, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { uploadImage } from '../../lib/api';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
}

function preprocessContent(html: string): string {
  if (!html || typeof window === 'undefined') return html;
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Convert styled divs (legacy blockquotes) to semantic <blockquote>
  doc.querySelectorAll('div').forEach(div => {
    const cls = div.getAttribute('class') || '';
    if (cls.includes('border-l-') || (cls.includes('bg-zinc') && cls.includes('rounded'))) {
      const bq = doc.createElement('blockquote');
      bq.innerHTML = div.innerHTML;
      div.replaceWith(bq);
    }
  });

  return doc.body.innerHTML;
}

const ToolbarButton: React.FC<{
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}> = ({ onClick, active, disabled, title, children }) => (
  <button
    type="button"
    onMouseDown={e => e.preventDefault()}
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`w-9 h-9 md:w-8 md:h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-colors ${
      active
        ? 'bg-white/10 text-zinc-100'
        : 'text-zinc-400 hover:bg-white/10 hover:text-zinc-200'
    } ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    {children}
  </button>
);

const Divider = () => <div className="w-px h-6 bg-white/10 mx-1 self-center" />;

const RichTextEditor: React.FC<RichTextEditorProps> = ({ content, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
      }),
      Placeholder.configure({
        placeholder: 'Start writing your session content...',
      }),
    ],
    content: preprocessContent(content),
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl || 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editor || !e.target.files?.length) return;
    const file = e.target.files[0];
    setUploading(true);
    try {
      const url = await uploadImage(file);
      editor.chain().focus().setImage({ src: url, alt: file.name }).run();
    } catch (err: any) {
      alert(`Image upload failed: ${err.message}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="rte-wrapper h-full flex flex-col">
      {/* Hidden file input for image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
        className="hidden"
        onChange={handleImageUpload}
      />

      {/* Toolbar */}
      <div className="flex-none flex flex-wrap items-center gap-0.5 px-2 md:px-3 py-1 md:py-1.5 bg-zinc-900/50 border-b border-white/5 overflow-x-auto no-scrollbar">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          H3
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Bold"
        >
          <iconify-icon icon="solar:text-bold-linear" width="16"></iconify-icon>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Italic"
        >
          <iconify-icon icon="solar:text-italic-linear" width="16"></iconify-icon>
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <iconify-icon icon="solar:list-linear" width="16"></iconify-icon>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Ordered List"
        >
          <iconify-icon icon="solar:list-1-linear" width="16"></iconify-icon>
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="Blockquote"
        >
          <iconify-icon icon="solar:chat-square-linear" width="16"></iconify-icon>
        </ToolbarButton>
        <ToolbarButton
          onClick={setLink}
          active={editor.isActive('link')}
          title="Link"
        >
          <iconify-icon icon="solar:link-linear" width="16"></iconify-icon>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          title={uploading ? 'Uploading...' : 'Insert Image'}
        >
          {uploading ? (
            <span className="w-4 h-4 border-2 border-zinc-500 border-t-zinc-200 rounded-full animate-spin"></span>
          ) : (
            <iconify-icon icon="solar:gallery-linear" width="16"></iconify-icon>
          )}
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule"
        >
          <iconify-icon icon="solar:minus-linear" width="16"></iconify-icon>
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <iconify-icon icon="solar:undo-left-linear" width="16"></iconify-icon>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <iconify-icon icon="solar:undo-right-linear" width="16"></iconify-icon>
        </ToolbarButton>
      </div>

      {/* Editor Content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>

      <style>{`
        .rte-wrapper .tiptap {
          min-height: 100%;
          padding: 1rem;
          color: #a1a1aa;
          font-size: 0.9375rem;
          line-height: 1.75;
          outline: none;
          max-width: 48rem;
          margin: 0 auto;
        }
        @media (min-width: 768px) {
          .rte-wrapper .tiptap {
            padding: 1.5rem 2rem;
            font-size: 0.875rem;
          }
        }
        .rte-wrapper .tiptap h2 {
          color: #e4e4e7;
          font-weight: 500;
          font-size: 1.5rem;
          margin: 1.5rem 0 0.75rem;
          letter-spacing: -0.02em;
        }
        .rte-wrapper .tiptap h3 {
          color: #e4e4e7;
          font-weight: 500;
          font-size: 1.25rem;
          margin: 1.25rem 0 0.5rem;
          letter-spacing: -0.01em;
        }
        .rte-wrapper .tiptap p {
          margin-bottom: 0.75rem;
        }
        .rte-wrapper .tiptap ul {
          list-style: disc;
          padding-left: 1.25rem;
          margin: 0.75rem 0;
        }
        .rte-wrapper .tiptap ol {
          list-style: decimal;
          padding-left: 1.25rem;
          margin: 0.75rem 0;
        }
        .rte-wrapper .tiptap li {
          margin-bottom: 0.375rem;
        }
        .rte-wrapper .tiptap blockquote {
          border-left: 2px solid #6366f1;
          background: rgb(24 24 27 / 0.5);
          padding: 0.75rem 1rem;
          margin: 1rem 0;
          border-radius: 0.5rem;
          color: #d4d4d8;
          font-style: italic;
        }
        .rte-wrapper .tiptap a {
          color: #818cf8;
          text-decoration: underline;
          cursor: pointer;
        }
        .rte-wrapper .tiptap hr {
          border-color: rgb(255 255 255 / 0.1);
          margin: 1.5rem 0;
        }
        .rte-wrapper .tiptap img {
          max-width: 100%;
          height: auto;
          border-radius: 0.75rem;
          border: 1px solid rgb(255 255 255 / 0.1);
          margin: 1rem 0;
        }
        .rte-wrapper .tiptap p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          color: #52525b;
          pointer-events: none;
          float: left;
          height: 0;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
