import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Image as ImageIcon,
  IndentDecrease,
  IndentIncrease,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Paperclip,
  Quote,
  RemoveFormatting,
  Strikethrough,
  Underline,
} from 'lucide-react';
import { cn } from './lib/utils';

const FONT_SIZES = ['12px', '14px', '16px', '18px', '20px'] as const;
const BLOCK_FORMATS = [
  { label: '文本', value: 'p' },
  { label: '标题 1', value: 'h1' },
  { label: '标题 2', value: 'h2' },
  { label: '标题 3', value: 'h3' },
] as const;

type WorkbenchRichTextEditorProps = {
  label: string;
  required?: boolean;
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
};

function ToolbarButton({
  title,
  onClick,
  active,
  children,
}: {
  title: string;
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        'flex h-7 w-7 items-center justify-center rounded border text-gray-600 transition hover:bg-gray-100',
        active ? 'border-teal-300 bg-teal-50 text-teal-800' : 'border-transparent'
      )}
    >
      {children}
    </button>
  );
}

export function WorkbenchRichTextEditor({
  label,
  required,
  value,
  onChange,
  placeholder = '请输入内容…',
  minHeight = 220,
}: WorkbenchRichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [fontSize, setFontSize] = useState<(typeof FONT_SIZES)[number]>('14px');
  const [blockFormat, setBlockFormat] = useState<(typeof BLOCK_FORMATS)[number]['value']>('p');

  const syncFromEditor = useCallback(() => {
    const html = editorRef.current?.innerHTML ?? '';
    onChange(html);
  }, [onChange]);

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (el.innerHTML !== value) {
      el.innerHTML = value || '';
    }
  }, [value]);

  const exec = useCallback(
    (command: string, val?: string) => {
      editorRef.current?.focus();
      document.execCommand(command, false, val);
      syncFromEditor();
    },
    [syncFromEditor]
  );

  const insertLink = () => {
    const url = window.prompt('请输入链接地址', 'https://');
    if (!url?.trim()) return;
    exec('createLink', url.trim());
  };

  const insertImageFromFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      const src = String(reader.result ?? '');
      if (!src) return;
      editorRef.current?.focus();
      document.execCommand('insertImage', false, src);
      syncFromEditor();
    };
    reader.readAsDataURL(file);
  };

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) insertImageFromFile(file);
  };

  const handleAttachmentPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    editorRef.current?.focus();
    const label = file.name;
    document.execCommand(
      'insertHTML',
      false,
      `<a href="#" data-attachment="${encodeURIComponent(label)}">📎 ${label}</a>`
    );
    syncFromEditor();
  };

  const applyFontSize = (size: string) => {
    setFontSize(size as (typeof FONT_SIZES)[number]);
    exec('fontSize', '3');
    const el = editorRef.current;
    if (!el) return;
    el.querySelectorAll('font[size="3"]').forEach((node) => {
      const span = document.createElement('span');
      span.style.fontSize = size;
      span.innerHTML = node.innerHTML;
      node.replaceWith(span);
    });
    syncFromEditor();
  };

  const applyBlockFormat = (tag: (typeof BLOCK_FORMATS)[number]['value']) => {
    setBlockFormat(tag);
    exec('formatBlock', tag);
  };

  return (
    <div className="block">
      <span className="text-xs font-black text-gray-700">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </span>
      <div className="mt-1.5 overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-200 bg-gray-50/90 px-2 py-1.5">
          <ToolbarButton title="加粗" onClick={() => exec('bold')}>
            <Bold className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton title="斜体" onClick={() => exec('italic')}>
            <Italic className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton title="下划线" onClick={() => exec('underline')}>
            <Underline className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton title="删除线" onClick={() => exec('strikeThrough')}>
            <Strikethrough className="h-3.5 w-3.5" />
          </ToolbarButton>
          <span className="mx-0.5 h-5 w-px bg-gray-200" aria-hidden />
          <ToolbarButton title="引用" onClick={() => exec('formatBlock', 'blockquote')}>
            <Quote className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton title="代码" onClick={() => exec('formatBlock', 'pre')}>
            <Code className="h-3.5 w-3.5" />
          </ToolbarButton>
          <span className="mx-0.5 h-5 w-px bg-gray-200" aria-hidden />
          <ToolbarButton title="有序列表" onClick={() => exec('insertOrderedList')}>
            <ListOrdered className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton title="无序列表" onClick={() => exec('insertUnorderedList')}>
            <List className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton title="减少缩进" onClick={() => exec('outdent')}>
            <IndentDecrease className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton title="增加缩进" onClick={() => exec('indent')}>
            <IndentIncrease className="h-3.5 w-3.5" />
          </ToolbarButton>
          <span className="mx-0.5 h-5 w-px bg-gray-200" aria-hidden />
          <select
            value={fontSize}
            onChange={(e) => applyFontSize(e.target.value)}
            className="h-7 rounded border border-gray-200 bg-white px-1.5 text-[11px] font-bold text-gray-700 outline-none focus:border-teal-400"
            aria-label="字号"
          >
            {FONT_SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            value={blockFormat}
            onChange={(e) => applyBlockFormat(e.target.value as (typeof BLOCK_FORMATS)[number]['value'])}
            className="h-7 rounded border border-gray-200 bg-white px-1.5 text-[11px] font-bold text-gray-700 outline-none focus:border-teal-400"
            aria-label="段落格式"
          >
            {BLOCK_FORMATS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
          <span className="mx-0.5 h-5 w-px bg-gray-200" aria-hidden />
          <ToolbarButton title="文字颜色" onClick={() => exec('foreColor', '#111827')}>
            <span className="text-xs font-black underline decoration-gray-800">A</span>
          </ToolbarButton>
          <ToolbarButton title="背景色" onClick={() => exec('hiliteColor', '#fef9c3')}>
            <span className="rounded bg-yellow-100 px-0.5 text-[10px] font-black">A</span>
          </ToolbarButton>
          <ToolbarButton title="左对齐" onClick={() => exec('justifyLeft')}>
            <AlignLeft className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton title="居中" onClick={() => exec('justifyCenter')}>
            <AlignCenter className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton title="右对齐" onClick={() => exec('justifyRight')}>
            <AlignRight className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton title="清除格式" onClick={() => exec('removeFormat')}>
            <RemoveFormatting className="h-3.5 w-3.5" />
          </ToolbarButton>
          <span className="mx-0.5 h-5 w-px bg-gray-200" aria-hidden />
          <ToolbarButton title="插入链接" onClick={insertLink}>
            <LinkIcon className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton title="插入图片" onClick={() => imageInputRef.current?.click()}>
            <ImageIcon className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton title="插入附件" onClick={() => fileInputRef.current?.click()}>
            <Paperclip className="h-3.5 w-3.5" />
          </ToolbarButton>
          <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleAttachmentPick} />
        </div>
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-label={label}
          data-placeholder={placeholder}
          onInput={syncFromEditor}
          onBlur={syncFromEditor}
          className={cn(
            'min-w-0 px-3 py-3 text-sm leading-relaxed text-gray-900 outline-none',
            '[&:empty::before]:text-gray-400 [&:empty::before]:content-[attr(data-placeholder)]',
            '[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5',
            '[&_blockquote]:border-l-4 [&_blockquote]:border-gray-200 [&_blockquote]:pl-3 [&_blockquote]:text-gray-600',
            '[&_pre]:rounded [&_pre]:bg-gray-100 [&_pre]:p-2 [&_pre]:text-xs',
            '[&_img]:max-h-48 [&_img]:max-w-full [&_img]:rounded'
          )}
          style={{ minHeight }}
        />
      </div>
    </div>
  );
}

/** 门户/详情：渲染富文本 HTML 或纯文本 */
export function RichTextContent({ html, className }: { html: string; className?: string }) {
  const looksHtml = /<[^>]+>/.test(html);
  if (!looksHtml) {
    return <p className={cn('whitespace-pre-wrap leading-relaxed', className)}>{html}</p>;
  }
  return (
    <div
      className={cn(
        'prose prose-sm max-w-none leading-relaxed text-gray-800',
        '[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5',
        '[&_blockquote]:border-l-4 [&_blockquote]:border-gray-200 [&_blockquote]:pl-3',
        '[&_img]:max-w-full [&_img]:rounded',
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
