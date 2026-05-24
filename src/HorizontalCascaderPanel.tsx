import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from './lib/utils';

export type CascaderOption = {
  value: string;
  label: string;
  children?: CascaderOption[];
};

function findOption(nodes: CascaderOption[], value: string): CascaderOption | undefined {
  return nodes.find((n) => n.value === value);
}

function labelsFromPath(nodes: CascaderOption[], path: string[]): string[] {
  const labels: string[] = [];
  let level = nodes;
  for (const v of path) {
    const hit = findOption(level, v);
    if (!hit) break;
    labels.push(hit.label);
    level = hit.children ?? [];
  }
  return labels;
}

function columnsFromPath(nodes: CascaderOption[], path: string[]): CascaderOption[][] {
  const cols: CascaderOption[][] = [nodes];
  let level = nodes;
  for (const v of path) {
    const hit = findOption(level, v);
    if (!hit?.children?.length) break;
    level = hit.children;
    cols.push(level);
  }
  return cols;
}

export function HorizontalCascaderPanel({
  label,
  required,
  placeholder = '请选择',
  options,
  valuePath,
  onChange,
  disabled,
  className,
  /** 平铺展示级联列，无需点击下拉框展开 */
  inline = false,
}: {
  label: string;
  required?: boolean;
  placeholder?: string;
  options: CascaderOption[];
  valuePath: string[];
  onChange: (path: string[], labels: string[]) => void;
  disabled?: boolean;
  className?: string;
  inline?: boolean;
}) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  /** 展开期间用内部路径驱动多列展示，避免父级尚未写入二级时第二列消失 */
  const [draftPath, setDraftPath] = useState<string[]>([]);
  const wasOpenRef = useRef(false);

  const displayText = useMemo(() => {
    const labels = labelsFromPath(options, valuePath);
    return labels.length > 0 ? labels.join(' / ') : '';
  }, [options, valuePath]);

  const panelOpen = inline || open;
  const activePath = inline ? valuePath : open ? draftPath : valuePath;
  const columns = useMemo(() => columnsFromPath(options, activePath), [options, activePath]);

  useEffect(() => {
    if (inline || !open) return;
    if (open && !wasOpenRef.current) {
      setDraftPath(valuePath);
    }
    wasOpenRef.current = open;
  }, [inline, open, valuePath]);

  useEffect(() => {
    if (inline || !open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [inline, open]);

  const pickAtLevel = (level: number, opt: CascaderOption) => {
    if (disabled) return;
    const nextPath = [...activePath.slice(0, level), opt.value];
    if (!inline) setDraftPath(nextPath);
    onChange(nextPath, labelsFromPath(options, nextPath));
    if (!inline && !opt.children?.length) setOpen(false);
  };

  return (
    <div ref={rootRef} className={cn('space-y-1.5', className)}>
      <span className="text-xs font-black text-gray-700 sm:text-sm">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </span>
      {inline && displayText ? (
        <p className="text-xs font-bold text-teal-800">已选：{displayText}</p>
      ) : null}
      {!inline ? (
        <button
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          onClick={() => !disabled && setOpen((o) => !o)}
          className={cn(
            'flex h-11 w-full items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 text-left text-sm font-bold transition',
            'hover:border-teal-300 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20',
            disabled && 'cursor-not-allowed bg-gray-50 text-gray-400',
            open && 'border-teal-400 ring-2 ring-teal-500/15'
          )}
        >
          <span className={cn('min-w-0 truncate', !displayText && 'font-medium text-gray-400')}>
            {displayText || placeholder}
          </span>
          <ChevronDown
            className={cn('h-4 w-4 shrink-0 text-gray-400 transition', open && 'rotate-180 text-teal-600')}
            aria-hidden
          />
        </button>
      ) : !displayText ? (
        <p className="text-xs font-medium text-gray-400">{placeholder}</p>
      ) : null}
      {panelOpen ? (
        <div
          id={listId}
          role="listbox"
          className={cn(
            'flex max-w-full overflow-x-auto rounded-lg border border-gray-200 bg-white',
            !inline && 'shadow-lg shadow-teal-900/10'
          )}
        >
          {columns.map((col, level) => (
            <ul
              key={level}
              className="max-h-52 min-w-[9.5rem] shrink-0 overflow-y-auto border-r border-gray-100 last:border-r-0"
            >
              {col.map((opt) => {
                const active = activePath[level] === opt.value;
                const hasChildren = Boolean(opt.children?.length);
                return (
                  <li key={opt.value}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={active}
                      disabled={disabled}
                      onClick={() => pickAtLevel(level, opt)}
                      className={cn(
                        'flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-xs font-bold transition sm:text-sm',
                        active
                          ? 'bg-teal-50 text-teal-800'
                          : 'text-gray-800 hover:bg-gray-50',
                        disabled && 'cursor-not-allowed opacity-50'
                      )}
                    >
                      <span className="min-w-0 truncate">{opt.label}</span>
                      {hasChildren ? (
                        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gray-300" aria-hidden />
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          ))}
        </div>
      ) : null}
    </div>
  );
}
