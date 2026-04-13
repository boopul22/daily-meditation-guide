import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { TableKit } from '@tiptap/extension-table';
import TextAlign from '@tiptap/extension-text-align';
import { uploadImage } from '../../lib/api';
import type { User } from '../../types';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  sessionSlug?: string;
  currentUser?: User;
}

function preprocessContent(html: string): string {
  if (!html || typeof window === 'undefined') return html;
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  doc.querySelectorAll('div').forEach(div => {
    if (div.closest('table')) return;
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
    className={`w-9 h-9 md:w-8 md:h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-colors ${active
        ? 'bg-white/10 text-zinc-100'
        : 'text-zinc-400 hover:bg-white/10 hover:text-zinc-200'
      } ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    {children}
  </button>
);

const Divider = () => <div className="w-px h-6 bg-white/10 mx-1 self-center" />;

// Visual grid picker for inserting a table
const TableGridPicker: React.FC<{
  onSelect: (rows: number, cols: number) => void;
  onClose: () => void;
  style: React.CSSProperties;
}> = ({ onSelect, onClose, style }) => {
  const [hovered, setHovered] = useState({ rows: 0, cols: 0 });
  const GRID = 6;

  return (
    <div
      className="fixed z-[9999] bg-zinc-800 border border-white/10 rounded-xl shadow-2xl p-3"
      style={style}
      onMouseLeave={onClose}
    >
      <p className="text-xs text-zinc-400 mb-2 text-center">
        {hovered.rows > 0 && hovered.cols > 0
          ? `${hovered.rows} × ${hovered.cols} table`
          : 'Hover to select size'}
      </p>
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${GRID}, 1.5rem)` }}>
        {Array.from({ length: GRID * GRID }).map((_, i) => {
          const row = Math.floor(i / GRID) + 1;
          const col = (i % GRID) + 1;
          const active = row <= hovered.rows && col <= hovered.cols;
          return (
            <div
              key={i}
              className={`w-6 h-6 rounded border cursor-pointer transition-colors ${active
                ? 'bg-indigo-500/40 border-indigo-400/60'
                : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
              onMouseEnter={() => setHovered({ rows: row, cols: col })}
              onClick={() => { onSelect(row, col); onClose(); }}
            />
          );
        })}
      </div>
    </div>
  );
};

// Contextual toolbar shown when cursor is inside a table
const TableContextBar: React.FC<{ editor: any }> = ({ editor }) => {
  const btn = (label: string, icon: string, action: () => void, danger = false) => (
    <button
      key={label}
      type="button"
      onMouseDown={e => e.preventDefault()}
      onClick={action}
      title={label}
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
        danger
          ? 'text-red-400 hover:bg-red-500/15'
          : 'text-zinc-400 hover:bg-white/10 hover:text-zinc-200'
      }`}
    >
      <iconify-icon icon={icon} width="13"></iconify-icon>
      {label}
    </button>
  );

  return (
    <div className="flex-none flex items-center gap-0.5 px-2 py-1 bg-indigo-950/40 border-b border-indigo-500/20 overflow-x-auto no-scrollbar">
      <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider px-1 mr-1">Table</span>

      {btn('Col ←', 'solar:arrow-left-linear', () => editor.chain().focus().addColumnBefore().run())}
      {btn('Col →', 'solar:arrow-right-linear', () => editor.chain().focus().addColumnAfter().run())}
      {btn('Del Col', 'solar:close-square-linear', () => editor.chain().focus().deleteColumn().run())}

      <div className="w-px h-4 bg-white/10 mx-1 self-center flex-none" />

      {btn('Row ↑', 'solar:arrow-up-linear', () => editor.chain().focus().addRowBefore().run())}
      {btn('Row ↓', 'solar:arrow-down-linear', () => editor.chain().focus().addRowAfter().run())}
      {btn('Del Row', 'solar:close-square-linear', () => editor.chain().focus().deleteRow().run())}

      <div className="w-px h-4 bg-white/10 mx-1 self-center flex-none" />

      {btn('Toggle Header', 'solar:document-text-linear', () => editor.chain().focus().toggleHeaderRow().run())}

      <div className="w-px h-4 bg-white/10 mx-1 self-center flex-none" />

      {btn('Delete Table', 'solar:trash-bin-minimalistic-linear', () => editor.chain().focus().deleteTable().run(), true)}
    </div>
  );
};

const RichTextEditor: React.FC<RichTextEditorProps> = ({ content, onChange, sessionSlug, currentUser }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tableButtonRef = useRef<HTMLDivElement>(null);
  const [uploading, setUploading] = useState(false);
  const [gridOpen, setGridOpen] = useState(false);
  const [gridPos, setGridPos] = useState({ top: 0, left: 0 });

  const lastEmittedRef = useRef<string>(content);

  const editor = useEditor({
    shouldRerenderOnTransaction: true,
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
      TableKit.configure({
        table: {
          resizable: false,
          HTMLAttributes: { class: 'rte-table' },
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
        defaultAlignment: 'left',
      }),
      Placeholder.configure({
        placeholder: 'Start writing your session content...',
      }),
    ],
    content: preprocessContent(content),
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      lastEmittedRef.current = html;
      onChange(html);
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (content === lastEmittedRef.current) return;
    if (content === editor.getHTML()) return;
    editor.commands.setContent(preprocessContent(content), { emitUpdate: false });
    lastEmittedRef.current = content;
  }, [content, editor]);

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

  const openGrid = () => {
    if (tableButtonRef.current) {
      const rect = tableButtonRef.current.getBoundingClientRect();
      setGridPos({ top: rect.bottom + 4, left: rect.left });
    }
    setGridOpen(true);
  };

  if (!editor) return null;

  const inTable = editor.isActive('table') || editor.isActive('tableCell') || editor.isActive('tableHeader');

  return (
    <div className="rte-wrapper h-full flex flex-col">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
        className="hidden"
        onChange={handleImageUpload}
      />

      {/* Main toolbar */}
      <div className="flex-none flex flex-wrap items-center gap-0.5 px-2 md:px-3 py-1 md:py-1.5 bg-zinc-900/50 border-b border-white/5">
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
          <iconify-icon icon="tabler:list" width="16"></iconify-icon>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Ordered List"
        >
          <iconify-icon icon="tabler:list-numbers" width="16"></iconify-icon>
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          active={editor.isActive({ textAlign: 'left' })}
          title="Align Left"
        >
          <iconify-icon icon="tabler:align-left" width="16"></iconify-icon>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          active={editor.isActive({ textAlign: 'center' })}
          title="Align Center"
        >
          <iconify-icon icon="tabler:align-center" width="16"></iconify-icon>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          active={editor.isActive({ textAlign: 'right' })}
          title="Align Right"
        >
          <iconify-icon icon="tabler:align-right" width="16"></iconify-icon>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          active={editor.isActive({ textAlign: 'justify' })}
          title="Justify"
        >
          <iconify-icon icon="tabler:align-justified" width="16"></iconify-icon>
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
          <iconify-icon icon="tabler:minus" width="16"></iconify-icon>
        </ToolbarButton>

        {/* Table insert button — only shown when NOT inside a table */}
        {!inTable && (
          <div ref={tableButtonRef}>
            <ToolbarButton
              onClick={openGrid}
              active={gridOpen}
              title="Insert Table"
            >
              <iconify-icon icon="tabler:table" width="16"></iconify-icon>
            </ToolbarButton>
          </div>
        )}

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

      {/* Contextual table toolbar — shown only when cursor is inside a table */}
      {inTable && <TableContextBar editor={editor} />}

      {/* Grid picker portal */}
      {gridOpen && (
        <TableGridPicker
          style={{ top: gridPos.top, left: gridPos.left }}
          onSelect={(rows, cols) =>
            editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run()
          }
          onClose={() => setGridOpen(false)}
        />
      )}

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
        .rte-wrapper .tiptap .rte-table {
          border-collapse: collapse;
          width: 100%;
          margin: 1rem 0;
          font-size: 0.875rem;
          border: 1px solid rgb(255 255 255 / 0.1);
        }
        .rte-wrapper .tiptap .rte-table th,
        .rte-wrapper .tiptap .rte-table td {
          border: 1px solid rgb(255 255 255 / 0.1);
          padding: 0.5rem 0.75rem;
          min-width: 4rem;
          vertical-align: top;
          position: relative;
        }
        .rte-wrapper .tiptap .rte-table th {
          background: rgb(99 102 241 / 0.08);
          color: #e4e4e7;
          font-weight: 500;
          text-align: left;
        }
        .rte-wrapper .tiptap .rte-table td {
          color: #a1a1aa;
        }
        .rte-wrapper .tiptap .rte-table .selectedCell:after {
          background: rgb(99 102 241 / 0.15);
          content: '';
          left: 0; right: 0; top: 0; bottom: 0;
          pointer-events: none;
          position: absolute;
          z-index: 2;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
