import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from './lib/utils';
import { CATEGORIES_HIERARCHY } from './data';
import { WATER_SAVING_SUB_CATEGORIES } from './productWorkbenchCatalog';

/** 节水产品分类：默认收起，点击后展开两级选项 */
export function WaterSavingProductCategoryField({
  topCategoryId,
  subCategoryId,
  onTopChange,
  onSubChange,
  required,
  disabled,
  className,
  placeholder = '请选择节水产品分类',
}: {
  topCategoryId: string;
  subCategoryId: string;
  onTopChange: (topId: string) => void;
  onSubChange: (subId: string) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const subOptions = useMemo(
    () => WATER_SAVING_SUB_CATEGORIES.filter((s) => s.topId === topCategoryId),
    [topCategoryId]
  );

  const displayText = useMemo(() => {
    if (subCategoryId) {
      const sub = WATER_SAVING_SUB_CATEGORIES.find((s) => s.subId === subCategoryId);
      if (sub) return `${sub.topName} / ${sub.subName}`;
    }
    if (topCategoryId) {
      const top = CATEGORIES_HIERARCHY.find((t) => t.id === topCategoryId);
      if (top) return top.name;
    }
    return '';
  }, [topCategoryId, subCategoryId]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const handleTopChange = (topId: string) => {
    onTopChange(topId);
  };

  const handleSubChange = (subId: string) => {
    onSubChange(subId);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={cn('space-y-1.5', className)}>
      <span className="text-xs font-black text-gray-700 sm:text-sm">
        节水产品分类
        {required ? <span className="text-red-500"> *</span> : null}
      </span>
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
      {open ? (
        <div
          id={listId}
          role="listbox"
          className="flex max-w-full flex-wrap rounded-lg border border-gray-200 bg-white shadow-md shadow-teal-900/5 sm:flex-nowrap"
        >
          <ul
            className="min-w-[9.5rem] shrink-0 border-b border-gray-100 sm:border-b-0 sm:border-r"
            aria-label="节水产品分类一级"
          >
            {CATEGORIES_HIERARCHY.map((top) => {
              const active = topCategoryId === top.id;
              return (
                <li key={top.id}>
                  <button
                    type="button"
                    disabled={disabled}
                    aria-selected={active}
                    onClick={() => handleTopChange(top.id)}
                    className={cn(
                      'flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-xs font-bold transition sm:text-sm',
                      active ? 'bg-teal-50 text-teal-800' : 'text-gray-800 hover:bg-gray-50',
                      disabled && 'cursor-not-allowed opacity-50'
                    )}
                  >
                    <span className="min-w-0 truncate">{top.name}</span>
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gray-300" aria-hidden />
                  </button>
                </li>
              );
            })}
          </ul>
          <ul className="min-w-[9.5rem] flex-1" aria-label="节水产品分类二级">
            {!topCategoryId ? (
              <li className="px-3 py-2.5 text-xs font-medium text-gray-400">请先选择左侧一级分类</li>
            ) : subOptions.length === 0 ? (
              <li className="px-3 py-2.5 text-xs font-medium text-gray-400">该分类下暂无二级类目</li>
            ) : (
              subOptions.map((sub) => {
                const active = subCategoryId === sub.subId;
                return (
                  <li key={sub.subId}>
                    <button
                      type="button"
                      disabled={disabled}
                      aria-selected={active}
                      onClick={() => handleSubChange(sub.subId)}
                      className={cn(
                        'flex w-full items-center px-3 py-2.5 text-left text-xs font-bold transition sm:text-sm',
                        active ? 'bg-teal-50 text-teal-800' : 'text-gray-800 hover:bg-gray-50',
                        disabled && 'cursor-not-allowed opacity-50'
                      )}
                    >
                      <span className="min-w-0 truncate">{sub.subName}</span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
