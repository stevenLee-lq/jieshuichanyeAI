import React from 'react';
import { cn } from './lib/utils';

/** 供方荣誉标签（入驻表单店铺标签同款圆角胶囊样式） */
export function SupplierHonorTags({
  tags,
  className,
  size = 'default',
  emptyLabel,
}: {
  tags: string[];
  className?: string;
  /** default：供应详情侧栏；compact：列表卡片 */
  size?: 'default' | 'compact';
  /** 无荣誉时占位文案，不传则不渲染 */
  emptyLabel?: string;
}) {
  if (!tags.length) {
    if (!emptyLabel) return null;
    return (
      <p className={cn('text-[10px] font-bold leading-relaxed text-gray-400', className)}>{emptyLabel}</p>
    );
  }

  const pillClass =
    size === 'compact'
      ? 'inline-flex max-w-full items-center rounded-full border border-teal-200/80 bg-white px-1.5 py-0.5 text-[9px] font-black leading-snug text-teal-900 shadow-sm sm:text-[10px]'
      : 'inline-flex max-w-full items-center rounded-full border border-teal-200/80 bg-white px-2.5 py-1 text-[10px] font-black leading-snug text-teal-900 shadow-sm sm:text-[11px]';

  return (
    <div className={cn('flex flex-wrap gap-1.5', className)} role="list" aria-label="企业荣誉标签">
      {tags.map((tag) => (
        <span key={tag} role="listitem" className={pillClass} title={tag}>
          <span className="truncate">{tag}</span>
        </span>
      ))}
    </div>
  );
}
