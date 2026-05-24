import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronLeft, Search } from 'lucide-react';
import { cn } from './lib/utils';
import {
  ENTERPRISE_INDUSTRY_TREE,
  formatIndustryOption,
  type IndustryLevelFields,
  type IndustryTreeNode,
} from './enterpriseFormShared';
import { industryFieldsFromPath, industryPathFromFields } from './waterUserFormShared';

export type IndustrySearchHit = {
  path: string[];
  leafCode: string;
  leafName: string;
  breadcrumb: string;
  searchKey: string;
};

function nodesAlongPath(path: string[]): IndustryTreeNode[] {
  const chain: IndustryTreeNode[] = [];
  let level = ENTERPRISE_INDUSTRY_TREE;
  for (const code of path) {
    const hit = level.find((n) => n.code === code);
    if (!hit) break;
    chain.push(hit);
    level = hit.children ?? [];
  }
  return chain;
}

function currentLevelOptions(path: string[]): IndustryTreeNode[] {
  if (path.length === 0) return ENTERPRISE_INDUSTRY_TREE;
  const chain = nodesAlongPath(path);
  const last = chain[chain.length - 1];
  return last?.children ?? [];
}

function walkIndustryLeaves(
  nodes: IndustryTreeNode[],
  ancestors: IndustryTreeNode[],
  out: IndustrySearchHit[]
) {
  for (const node of nodes) {
    const chain = [...ancestors, node];
    if (node.children?.length) {
      walkIndustryLeaves(node.children, chain, out);
      continue;
    }
    const path = chain.map((n) => n.code);
    const leaf = chain[chain.length - 1]!;
    const breadcrumb = chain.map((n) => n.name).join(' / ');
    const searchKey = chain
      .flatMap((n) => [n.code, n.name, formatIndustryOption(n)])
      .join(' ')
      .toLowerCase();
    out.push({
      path,
      leafCode: leaf.code,
      leafName: leaf.name,
      breadcrumb,
      searchKey,
    });
  }
}

const INDUSTRY_SEARCH_INDEX: IndustrySearchHit[] = (() => {
  const hits: IndustrySearchHit[] = [];
  walkIndustryLeaves(ENTERPRISE_INDUSTRY_TREE, [], hits);
  return hits;
})();

const LEVEL_HINTS = ['门类', '大类', '中类', '小类'] as const;

/** 已选行业：四级均展示「代码 + 中文名称」 */
export function formatIndustryLevelsDisplay(fields: IndustryLevelFields): string {
  const levels: [string, string][] = [
    [fields.industryL1Code, fields.industryL1Name],
    [fields.industryL2Code, fields.industryL2Name],
    [fields.industryL3Code, fields.industryL3Name],
    [fields.industryL4Code, fields.industryL4Name],
  ];
  const parts = levels
    .filter(([code, name]) => Boolean(code && name))
    .map(([code, name]) => `${code} ${name}`);
  return parts.join(' / ');
}

export function IndustrySearchCascader({
  label,
  required,
  value,
  onChange,
  disabled,
  className,
}: {
  label: string;
  required?: boolean;
  value: IndustryLevelFields;
  onChange: (fields: IndustryLevelFields) => void;
  disabled?: boolean;
  className?: string;
}) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [draftPath, setDraftPath] = useState<string[]>([]);

  const valuePath = useMemo(() => industryPathFromFields(value), [value]);
  const displayText = useMemo(() => formatIndustryLevelsDisplay(value), [value]);

  const normalizedQuery = query.trim().toLowerCase();

  const searchHits = useMemo(() => {
    if (!normalizedQuery) return [];
    return INDUSTRY_SEARCH_INDEX.filter((hit) => hit.searchKey.includes(normalizedQuery)).slice(0, 12);
  }, [normalizedQuery]);

  const stepOptions = useMemo(() => currentLevelOptions(draftPath), [draftPath]);
  const stepChain = useMemo(() => nodesAlongPath(draftPath), [draftPath]);
  const stepDepth = draftPath.length;
  const stepHint = LEVEL_HINTS[Math.min(stepDepth, LEVEL_HINTS.length - 1)];

  useEffect(() => {
    if (!open) return;
    setDraftPath(valuePath);
    setQuery('');
    const t = window.setTimeout(() => searchRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [open, valuePath]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const applyPath = (path: string[]) => {
    onChange(industryFieldsFromPath(path));
    setOpen(false);
    setQuery('');
  };

  const pickStep = (node: IndustryTreeNode) => {
    const nextPath = [...draftPath, node.code];
    if (node.children?.length) {
      setDraftPath(nextPath);
      return;
    }
    applyPath(nextPath);
  };

  const stepBack = () => setDraftPath((p) => p.slice(0, -1));

  return (
    <div ref={rootRef} className={cn('space-y-1.5', className)}>
      <span className="text-xs font-black text-gray-700 sm:text-sm">
        {label}
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
          'flex min-h-11 w-full items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-sm font-bold transition',
          'hover:border-teal-300 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20',
          disabled && 'cursor-not-allowed bg-gray-50 text-gray-400',
          open && 'border-teal-400 ring-2 ring-teal-500/15'
        )}
      >
        <span
          className={cn(
            'min-w-0 flex-1 text-xs leading-snug sm:text-sm',
            !displayText && 'font-medium text-gray-400'
          )}
          title={displayText || undefined}
        >
          {displayText || '请选择'}
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
          className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg shadow-teal-900/10"
        >
          <div className="border-b border-gray-100 bg-gray-50/80 p-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="输入行业代码或名称，如 N762、水资源、精制茶"
                className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm font-bold outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
            <p className="mt-1.5 text-[10px] font-bold text-gray-400">
              优先搜索定位到小类；未输入关键词时可按层级点选。
            </p>
          </div>

          {normalizedQuery ? (
            <ul className="divide-y divide-gray-50">
              {searchHits.length === 0 ? (
                <li className="px-3 py-4 text-center text-xs font-bold text-gray-400">未找到匹配行业</li>
              ) : (
                searchHits.map((hit) => (
                  <li key={hit.path.join('/')}>
                    <button
                      type="button"
                      role="option"
                      onClick={() => applyPath(hit.path)}
                      className="flex w-full flex-col gap-0.5 px-3 py-2.5 text-left transition hover:bg-teal-50"
                    >
                      <span className="text-sm font-black text-teal-900">
                        {hit.leafCode} {hit.leafName}
                      </span>
                      <span className="text-[11px] font-bold text-gray-400">{hit.breadcrumb}</span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          ) : (
            <div className="p-2">
              {stepChain.length > 0 ? (
                <div className="mb-2 flex flex-wrap items-center gap-1">
                  <button
                    type="button"
                    onClick={stepBack}
                    className="inline-flex items-center gap-0.5 rounded-md px-1.5 py-1 text-[11px] font-black text-teal-700 hover:bg-teal-50"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    上一级
                  </button>
                  <span className="text-[11px] font-bold text-gray-400">
                    {stepChain.map((n) => n.name).join(' › ')}
                  </span>
                </div>
              ) : null}
              <p className="mb-1.5 text-[10px] font-black uppercase tracking-wide text-gray-400">
                选择{stepHint}
              </p>
              <ul className="grid gap-1 sm:grid-cols-2">
                {stepOptions.map((node) => {
                  const isLeaf = !node.children?.length;
                  const active = valuePath[stepDepth] === node.code;
                  return (
                    <li key={node.code}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={active}
                        onClick={() => pickStep(node)}
                        className={cn(
                          'flex w-full items-start gap-2 rounded-lg border px-2.5 py-2 text-left transition',
                          active
                            ? 'border-teal-200 bg-teal-50'
                            : 'border-gray-100 bg-white hover:border-teal-100 hover:bg-gray-50'
                        )}
                      >
                        <span className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[11px] font-black text-teal-800">
                          {node.code}
                        </span>
                        <span className="min-w-0 flex-1 text-xs font-bold leading-snug text-gray-800">
                          {node.name}
                          {isLeaf ? (
                            <span className="ml-1 text-[10px] font-black text-teal-600">可选</span>
                          ) : null}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
