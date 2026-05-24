import React, { useCallback, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { cn } from './lib/utils';

/** 工作台列表：下拉筛选统一样式 */
export const workbenchSelectClass =
  'h-9 min-w-[7.5rem] rounded-lg border border-gray-200 bg-white px-2.5 text-xs font-bold text-gray-800 shadow-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20';

/** 工作台列表：单行文本筛选 */
export const workbenchTextInputClass =
  'h-9 w-full min-w-[8rem] rounded-lg border border-gray-200 bg-white px-2.5 text-xs font-bold text-gray-800 shadow-sm outline-none transition placeholder:font-medium placeholder:text-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20';

/** 工作台列表：关键字搜索框（置于 QueryBar 内时优先用 WorkbenchListQueryInput + label） */
export const workbenchSearchInputClass =
  'w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm font-medium text-gray-800 shadow-sm placeholder:text-gray-400 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20';

export const workbenchQueryBtnPrimary =
  'inline-flex h-9 shrink-0 items-center justify-center rounded-lg bg-teal-600 px-4 text-xs font-black text-white shadow-sm transition hover:bg-teal-700';

export const workbenchQueryBtnDefault =
  'inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white px-4 text-xs font-black text-gray-700 shadow-sm transition hover:border-teal-200 hover:bg-teal-50/80';

/** 统一查询条件容器：白底平铺，无「查询条件」标题与模块边框（与「我的消息」一致） */
export function WorkbenchListQueryBar({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-wrap items-end gap-3 bg-white sm:gap-4', className)}>
      {children}
    </div>
  );
}

export function WorkbenchListQueryField({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn('flex min-w-[9.5rem] flex-col gap-1', className)}>
      <span className="text-[11px] font-black text-gray-600">{label}</span>
      {children}
    </label>
  );
}

export function WorkbenchListQuerySelect({
  value,
  onChange,
  options,
  ariaLabel,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  ariaLabel?: string;
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={ariaLabel ?? undefined}
      className={cn(workbenchSelectClass, className)}
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

export function WorkbenchListQueryInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(workbenchTextInputClass, className)}
    />
  );
}

/** 草稿条件与已应用条件分离：点「查询」后再筛选列表 */
export function useWorkbenchListQueryPair<T extends Record<string, string>>(initial: T) {
  const initialRef = useRef(initial);
  const [draft, setDraft] = useState<T>(() => ({ ...initial }));
  const [applied, setApplied] = useState<T>(() => ({ ...initial }));

  const patchDraft = useCallback((patch: Partial<T>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  const applySearch = useCallback(() => {
    setApplied({ ...draft });
  }, [draft]);

  const resetSearch = useCallback(() => {
    const init = { ...initialRef.current };
    setDraft(init);
    setApplied(init);
  }, []);

  /** 更新草稿并立即作为查询条件生效（用于页签切换等需即时筛选的场景） */
  const patchAndApply = useCallback((patch: Partial<T>) => {
    setDraft((prev) => {
      const next = { ...prev, ...patch };
      setApplied(next);
      return next;
    });
  }, []);

  return { draft, setDraft, patchDraft, applied, applySearch, resetSearch, patchAndApply };
}

/** 查询 / 重置按钮区，与查询字段同一行对齐（统一展示两个按钮） */
export function WorkbenchListQueryActions({
  onReset,
  onSearch,
  searchLabel = '查询',
}: {
  onReset: () => void;
  onSearch: () => void;
  searchLabel?: string;
}) {
  return (
    <div className="flex shrink-0 items-end gap-2">
      <button type="button" onClick={onSearch} className={workbenchQueryBtnPrimary}>
        {searchLabel}
      </button>
      <button type="button" onClick={onReset} className={workbenchQueryBtnDefault}>
        重置
      </button>
    </div>
  );
}

/** @deprecated 请改用 WorkbenchListQueryBar + WorkbenchListQueryField + WorkbenchListQueryInput */
export function WorkbenchListSearchField({
  value,
  onChange,
  placeholder = '请输入关键字',
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <WorkbenchListQueryField label="关键字" className={cn('min-w-[12rem] flex-1 sm:max-w-md', className)}>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          aria-hidden
        />
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(workbenchTextInputClass, 'pl-9')}
        />
      </div>
    </WorkbenchListQueryField>
  );
}
