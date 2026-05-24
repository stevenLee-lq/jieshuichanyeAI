import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from './lib/utils';
import { workbenchSelectClass } from './workbenchListQuery';

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

/** 工作台列表分页：筛选条件变化时自动回到第 1 页 */
export function useWorkbenchListPagination<T>(
  items: readonly T[],
  resetDeps: readonly unknown[] = [],
  defaultPageSize = 10
) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    setPage(1);
  }, [pageSize, ...resetDeps]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, pageSize, safePage]);

  return {
    page: safePage,
    pageSize,
    pageItems,
    total,
    setPage,
    setPageSize,
  };
}

export function WorkbenchListPagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  className,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  className?: string;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, total);

  const pageItems = buildPageItems(safePage, totalPages);

  return (
    <div
      className={cn(
        'flex flex-col gap-3 border-t border-gray-100 pt-3 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      <p className="text-[11px] font-bold text-gray-500">
        {total === 0 ? '共 0 条' : `第 ${start}–${end} 条，共 ${total} 条`}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-600">
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className={cn(workbenchSelectClass, 'h-8 min-w-[5.5rem]')}
            aria-label="每页条数"
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}条/页
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => onPageChange(safePage - 1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:border-teal-300 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="上一页"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {pageItems.map((item, idx) =>
            item === '…' ? (
              <span key={`ellipsis-${idx}`} className="px-1 text-xs font-bold text-gray-400">
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                className={cn(
                  'min-w-[2rem] rounded-lg px-2 py-1 text-xs font-black transition',
                  item === safePage
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'border border-gray-200 text-gray-700 hover:border-teal-300 hover:bg-teal-50'
                )}
              >
                {item}
              </button>
            )
          )}
          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => onPageChange(safePage + 1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:border-teal-300 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="下一页"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <label className="flex items-center gap-1 text-[11px] font-bold text-gray-600">
          跳至
          <JumpToPage totalPages={totalPages} onJump={onPageChange} />
          页
        </label>
      </div>
    </div>
  );
}

function JumpToPage({
  totalPages,
  onJump,
}: {
  totalPages: number;
  onJump: (page: number) => void;
}) {
  const [value, setValue] = React.useState('');
  const commit = () => {
    const n = Number.parseInt(value, 10);
    if (!Number.isFinite(n)) return;
    onJump(Math.min(totalPages, Math.max(1, n)));
    setValue('');
  };
  return (
    <input
      type="number"
      min={1}
      max={totalPages}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') commit();
      }}
      onBlur={commit}
      className="h-8 w-12 rounded-lg border border-gray-200 px-1 text-center text-xs font-bold text-gray-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
      aria-label="跳转页码"
    />
  );
}

function buildPageItems(current: number, total: number): (number | '…')[] {
  if (total <= 9) return Array.from({ length: total }, (_, i) => i + 1);
  const items: (number | '…')[] = [1];
  if (current > 3) items.push('…');
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let p = start; p <= end; p++) items.push(p);
  if (current < total - 2) items.push('…');
  items.push(total);
  return items;
}
