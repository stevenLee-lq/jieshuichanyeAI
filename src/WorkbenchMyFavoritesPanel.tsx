import React, { useCallback, useMemo } from 'react';
import { ExternalLink, HeartOff, MapPin, Package, ScrollText } from 'lucide-react';
import { cn } from './lib/utils';
import { PRODUCTS } from './data';
import { getPortalCaseById } from './portalCaseCatalog';
import { removePortalCaseFavorite, usePortalCaseFavorites } from './portalCaseFavorites';
import { removePortalDemandFavorite, usePortalDemandFavorites } from './portalDemandFavorites';
import { removePortalProductFavorite, usePortalProductFavorites } from './portalProductFavorites';
import { getPortalDemandById, listDemandTypeLabel } from './portalDemandStore';
import {
  useWorkbenchListQueryPair,
  WorkbenchListQueryActions,
  WorkbenchListQueryBar,
  WorkbenchListQueryField,
  WorkbenchListQueryInput,
  WorkbenchListQuerySelect,
} from './workbenchListQuery';
import {
  useWorkbenchListPagination,
  WorkbenchListPagination,
} from './workbenchListPagination';

type FavoriteKind = 'product' | 'case' | 'demand';

type FavoriteRow = {
  key: string;
  kind: FavoriteKind;
  id: number;
  title: string;
  subtitle: string;
  category: string;
  image?: string;
  missing: boolean;
};

const KIND_FILTER_OPTIONS = ['全部', '产品/服务', '典型案例', '需求'] as const;
type KindFilter = (typeof KIND_FILTER_OPTIONS)[number];

const QUERY_INIT = {
  kind: '全部' as KindFilter,
  title: '',
};

function kindFilterToKind(kind: KindFilter): FavoriteKind | null {
  if (kind === '产品/服务') return 'product';
  if (kind === '典型案例') return 'case';
  if (kind === '需求') return 'demand';
  return null;
}

function kindLabel(kind: FavoriteKind): string {
  if (kind === 'product') return '产品/服务';
  if (kind === 'case') return '典型案例';
  return '需求';
}

function kindBadgeClass(kind: FavoriteKind): string {
  if (kind === 'product') return 'border-cyan-200 bg-cyan-50 text-cyan-900';
  if (kind === 'case') return 'border-amber-200 bg-amber-50 text-amber-900';
  return 'border-violet-200 bg-violet-50 text-violet-900';
}

function buildFavoriteRows(
  productIds: readonly number[],
  caseIds: readonly number[],
  demandIds: readonly number[]
): FavoriteRow[] {
  const rows: FavoriteRow[] = [];

  for (const id of productIds) {
    const p = PRODUCTS.find((x) => x.id === id);
    rows.push({
      key: `product-${id}`,
      kind: 'product',
      id,
      title: p?.name ?? `产品 #${id}`,
      subtitle: p ? `${p.category} · ${p.supplier}` : '该条目可能已从产品库移除',
      category: p?.scenario ?? '—',
      image: p?.image,
      missing: !p,
    });
  }

  for (const id of caseIds) {
    const c = getPortalCaseById(id);
    rows.push({
      key: `case-${id}`,
      kind: 'case',
      id,
      title: c?.name ?? `案例 #${id}`,
      subtitle: c
        ? [c.region, c.source].filter(Boolean).join(' · ') || c.content
        : '该条目可能已从案例库移除',
      category: c?.cat1 ?? '—',
      image: c?.image,
      missing: !c,
    });
  }

  for (const id of demandIds) {
    const d = getPortalDemandById(id);
    rows.push({
      key: `demand-${id}`,
      kind: 'demand',
      id,
      title: d?.title ?? `需求 #${id}`,
      subtitle: d ? `${d.demander} · ${d.supplier}` : '该条目可能已从需求中心移除',
      category: d ? listDemandTypeLabel(d) : '—',
      image: d?.image,
      missing: !d,
    });
  }

  return rows;
}

function removeFavorite(kind: FavoriteKind, id: number) {
  if (kind === 'product') removePortalProductFavorite(id);
  else if (kind === 'case') removePortalCaseFavorite(id);
  else removePortalDemandFavorite(id);
}

export function WorkbenchMyFavoritesPanel({
  onOpenProduct,
  onLocateDemand,
  onViewCase,
}: {
  onOpenProduct: (productId: number) => void;
  onLocateDemand: (demandId: number) => void;
  onViewCase: (caseId: number) => void;
}) {
  const productIds = usePortalProductFavorites();
  const caseIds = usePortalCaseFavorites();
  const demandIds = usePortalDemandFavorites();
  const { draft, patchDraft, applied, applySearch, resetSearch } = useWorkbenchListQueryPair(QUERY_INIT);

  const allRows = useMemo(
    () => buildFavoriteRows(productIds, caseIds, demandIds),
    [productIds, caseIds, demandIds]
  );

  const filtered = useMemo(() => {
    const kindFilter = kindFilterToKind(applied.kind as KindFilter);
    const titleQ = applied.title.trim().toLowerCase();
    return allRows.filter((r) => {
      if (kindFilter && r.kind !== kindFilter) return false;
      if (titleQ && !r.title.toLowerCase().includes(titleQ) && !r.subtitle.toLowerCase().includes(titleQ)) {
        return false;
      }
      return true;
    });
  }, [applied, allRows]);

  const { page, pageSize, pageItems, total, setPage, setPageSize } = useWorkbenchListPagination(filtered, [
    applied.kind,
    applied.title,
    productIds.length,
    caseIds.length,
    demandIds.length,
  ]);

  const handleSearch = useCallback(() => {
    applySearch();
    setPage(1);
  }, [applySearch, setPage]);

  const handleReset = useCallback(() => {
    resetSearch();
    setPage(1);
  }, [resetSearch, setPage]);

  const handleView = (row: FavoriteRow) => {
    if (row.missing) return;
    if (row.kind === 'product') onOpenProduct(row.id);
    else if (row.kind === 'demand') onLocateDemand(row.id);
    else onViewCase(row.id);
  };

  return (
    <div className="space-y-4">
      <WorkbenchListQueryBar>
        <WorkbenchListQueryField label="收藏类型">
          <WorkbenchListQuerySelect
            value={draft.kind}
            onChange={(v) => patchDraft({ kind: v as KindFilter })}
            options={[...KIND_FILTER_OPTIONS]}
            ariaLabel="收藏类型"
          />
        </WorkbenchListQueryField>
        <WorkbenchListQueryField label="标题关键词">
          <WorkbenchListQueryInput
            value={draft.title}
            onChange={(v) => patchDraft({ title: v })}
            placeholder="名称、企业或摘要"
          />
        </WorkbenchListQueryField>
        <WorkbenchListQueryActions onSearch={handleSearch} onReset={handleReset} />
      </WorkbenchListQueryBar>

      <div className="overflow-hidden rounded-xl border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/90 text-[11px] font-black uppercase tracking-wide text-gray-500">
                <th className="w-16 px-3 py-3">封面</th>
                <th className="px-3 py-3">类型</th>
                <th className="px-3 py-3">标题</th>
                <th className="px-3 py-3">分类/类型</th>
                <th className="px-3 py-3">摘要</th>
                <th className="px-3 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {total === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-14 text-center text-xs font-bold text-gray-400">
                    暂无收藏。请在门户对产品/服务、典型案例或需求点击心形图标加入收藏后，将在此统一查看与管理。
                  </td>
                </tr>
              ) : (
                pageItems.map((row) => (
                  <tr key={row.key} className="border-b border-gray-100 last:border-0 hover:bg-teal-50/25">
                    <td className="px-3 py-3">
                      {row.image ? (
                        <div className="h-11 w-11 overflow-hidden rounded-lg bg-gray-100 ring-1 ring-gray-100">
                          <img
                            src={row.image}
                            alt=""
                            className="h-full w-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      ) : (
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100 text-gray-300">
                          <Package className="h-4 w-4" aria-hidden />
                        </div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      <span
                        className={cn(
                          'inline-block rounded-md border px-2 py-0.5 text-[10px] font-black',
                          kindBadgeClass(row.kind)
                        )}
                      >
                        {kindLabel(row.kind)}
                      </span>
                    </td>
                    <td className="max-w-[220px] px-3 py-3 font-bold text-gray-900">
                      <span className="line-clamp-2">{row.title}</span>
                      {row.missing ? (
                        <p className="mt-1 text-[10px] font-bold text-amber-700">源数据已不可用，可取消收藏</p>
                      ) : null}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-xs font-bold text-gray-600">{row.category}</td>
                    <td className="max-w-[240px] px-3 py-3 text-xs font-medium text-gray-500">
                      <span className="line-clamp-2">{row.subtitle}</span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-right">
                      <div className="inline-flex flex-wrap items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => removeFavorite(row.kind, row.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[11px] font-black text-gray-600 hover:border-rose-200 hover:text-rose-700"
                        >
                          <HeartOff className="h-3 w-3" aria-hidden />
                          取消收藏
                        </button>
                        {!row.missing ? (
                          <button
                            type="button"
                            onClick={() => handleView(row)}
                            className="inline-flex items-center gap-1 rounded-lg border border-teal-200 bg-white px-2.5 py-1.5 text-[11px] font-black text-teal-800 hover:bg-teal-50"
                          >
                            {row.kind === 'product' ? (
                              <Package className="h-3 w-3" aria-hidden />
                            ) : row.kind === 'demand' ? (
                              <MapPin className="h-3 w-3" aria-hidden />
                            ) : (
                              <ScrollText className="h-3 w-3" aria-hidden />
                            )}
                            {row.kind === 'demand' ? '定位需求' : row.kind === 'case' ? '查看案例' : '查看供应'}
                            <ExternalLink className="h-3 w-3 opacity-60" aria-hidden />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <WorkbenchListPagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
}
