import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Search,
  Sparkles,
  ArrowRight,
  Plus,
  ThumbsUp,
  MessageCircle,
  Activity,
} from 'lucide-react';
import { cn } from './lib/utils';
import {
  getHomeWaterSavingSubCategories,
  getHomeWaterSavingTopCategories,
  PRODUCTS,
  productMatchesHomeWaterSavingMultiFilter,
  SUPPLY_INDUSTRY_TYPE_OPTIONS,
  productMatchesPrimaryIndustry,
  productMockHot,
  productMockPublishedTs,
  productMockViews,
  type ProductRecord,
} from './data';
import {
  APPLICATION_FIELD_FILTER_OPTIONS,
  ENTITY_FILTER_OPTIONS,
  MATCH_STATUS_FILTER_OPTIONS,
  SORT_FIELD_OPTIONS,
  TYPE_FILTER_OPTIONS,
  formatOutcomeApplicationFields,
  getOutcomeMatchStatus,
  outcomeMatchesApplicationField,
  type ApplicationFieldFilter,
  type MatchStatusFilter,
  type OutcomeDemandType,
  type SortFieldKey,
  type SupplyDemandOutcome,
} from './supplyDemandOutcomes';
import { getPortalDemandById, getPortalDemandPublishedCount, usePortalDemands } from './portalDemandStore';
import { DemandFavoriteButton } from './DemandFavoriteButton';
import { ProductFavoriteButton } from './ProductFavoriteButton';
import { getPortalProductSupplierName } from './portalProductSupplyMeta';
import {
  PORTAL_BACK_BUTTON,
  PORTAL_BACK_BUTTON_ICON,
  PORTAL_HERO_BANNER,
  PORTAL_PAGE_CONTENT,
  PORTAL_PANEL,
  PORTAL_PRODUCT_CARD,
} from './portalSurface';

export type DemandMarketPageVariant = 'supply' | 'demand';


const SUPPLY_SEARCH_PLACEHOLDER = '请以节水分类、应用领域、供方名称、产品名称搜索';

const WATER_SAVING_TAGS_COLLAPSED_MAX_H = 'max-h-[4.75rem]';

export type SupplyMarketWaterSavingFilter = {
  selectedTops: string[];
  selectedSubs: { top: string; sub: string }[];
  /** 首页细类词条：在已选二级下再按商品名称包含该词筛选 */
  leafKeyword?: string;
};

export const SUPPLY_MARKET_WATER_SAVING_FILTER_EMPTY: SupplyMarketWaterSavingFilter = {
  selectedTops: [],
  selectedSubs: [],
  leafKeyword: undefined,
};

function WaterSavingCategoryFilterRow({
  filter,
  onChange,
  portalUiStyle,
}: {
  filter: SupplyMarketWaterSavingFilter;
  onChange: (next: SupplyMarketWaterSavingFilter) => void;
  portalUiStyle: number;
}) {
  const { selectedTops, selectedSubs, leafKeyword } = filter;
  const [hoveredTop, setHoveredTop] = useState<string | null>(null);
  const [flyoutPos, setFlyoutPos] = useState<{ top: number; left: number } | null>(null);
  const topBtnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [expanded, setExpanded] = useState(false);
  /** 折叠态内容是否超过两行，用于决定是否显示展开/收起 */
  const [needsExpandToggle, setNeedsExpandToggle] = useState(false);
  const tagsWrapRef = useRef<HTMLDivElement>(null);
  const hoverCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const topOptions = useMemo(() => getHomeWaterSavingTopCategories(portalUiStyle), [portalUiStyle]);

  const isAll = selectedTops.length === 0 && selectedSubs.length === 0;

  const toggleTop = (top: string) => {
    if (selectedTops.includes(top)) {
      onChange({
        selectedTops: selectedTops.filter((t) => t !== top),
        selectedSubs: selectedSubs.filter((s) => s.top !== top),
      });
      return;
    }
    onChange({ selectedTops: [...selectedTops, top], selectedSubs });
  };

  const toggleSub = (top: string, sub: string) => {
    const picked = selectedSubs.some((s) => s.top === top && s.sub === sub);
    onChange({
      selectedTops,
      selectedSubs: picked
        ? selectedSubs.filter((s) => !(s.top === top && s.sub === sub))
        : [...selectedSubs, { top, sub }],
    });
  };

  const clearAll = () => onChange(SUPPLY_MARKET_WATER_SAVING_FILTER_EMPTY);

  const syncFlyoutPos = (top: string) => {
    const btn = topBtnRefs.current[top];
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    setFlyoutPos({ top: rect.bottom + 4, left: rect.left });
  };

  const openHoverPanel = (top: string) => {
    if (hoverCloseTimerRef.current) {
      clearTimeout(hoverCloseTimerRef.current);
      hoverCloseTimerRef.current = null;
    }
    setHoveredTop(top);
    requestAnimationFrame(() => syncFlyoutPos(top));
  };

  const cancelCloseHoverPanel = () => {
    if (hoverCloseTimerRef.current) {
      clearTimeout(hoverCloseTimerRef.current);
      hoverCloseTimerRef.current = null;
    }
  };

  const scheduleCloseHoverPanel = () => {
    if (hoverCloseTimerRef.current) clearTimeout(hoverCloseTimerRef.current);
    hoverCloseTimerRef.current = setTimeout(() => {
      setHoveredTop(null);
      setFlyoutPos(null);
    }, 150);
  };

  const hoveredSubOptions = useMemo(() => {
    if (!hoveredTop) return [] as string[];
    return [...getHomeWaterSavingSubCategories(hoveredTop, portalUiStyle)];
  }, [hoveredTop, portalUiStyle]);

  useLayoutEffect(() => {
    if (!hoveredTop) return;
    syncFlyoutPos(hoveredTop);
    const onReposition = () => syncFlyoutPos(hoveredTop);
    window.addEventListener('resize', onReposition);
    window.addEventListener('scroll', onReposition, true);
    return () => {
      window.removeEventListener('resize', onReposition);
      window.removeEventListener('scroll', onReposition, true);
    };
  }, [hoveredTop, expanded, topOptions]);

  useEffect(
    () => () => {
      if (hoverCloseTimerRef.current) clearTimeout(hoverCloseTimerRef.current);
    },
    []
  );

  const selectionHint = useMemo(() => {
    if (isAll) return '';
    const parts: string[] = [];
    if (selectedTops.length) parts.push(`一级：${selectedTops.join('、')}`);
    if (selectedSubs.length) parts.push(`二级：${selectedSubs.map((s) => s.sub).join('、')}`);
    if (leafKeyword?.trim()) parts.push(`细类：${leafKeyword.trim()}`);
    return parts.join('；');
  }, [isAll, selectedTops, selectedSubs, leafKeyword]);

  const tagBtnClass = (active: boolean) =>
    cn(
      'rounded-md border px-3 py-1.5 text-xs font-bold transition sm:text-[13px]',
      active
        ? 'border-teal-600 bg-white text-teal-600 shadow-sm'
        : 'border-gray-200 bg-white text-gray-600 hover:border-teal-300 hover:text-gray-800'
    );

  useEffect(() => {
    const el = tagsWrapRef.current;
    if (!el) return;
    const measure = () => {
      if (expanded) return;
      setNeedsExpandToggle(el.scrollHeight > el.clientHeight + 2);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [expanded, topOptions, selectionHint, hoveredTop]);

  const showExpandToggle = needsExpandToggle || expanded;

  return (
    <div className="flex flex-col gap-2 border-b border-gray-100 py-3.5 sm:flex-row sm:items-start sm:gap-5">
      <span className="shrink-0 pt-0.5 text-sm font-black text-gray-800">节水产品分类</span>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div
          ref={tagsWrapRef}
          className={cn(
            'flex flex-wrap items-start gap-2 overflow-hidden transition-[max-height] duration-200',
            !expanded && WATER_SAVING_TAGS_COLLAPSED_MAX_H
          )}
        >
          <button type="button" onClick={clearAll} className={tagBtnClass(isAll)}>
            全部
          </button>
          {topOptions.map((top) => {
            const topActive =
              selectedTops.includes(top) || selectedSubs.some((s) => s.top === top);
            return (
              <button
                key={top}
                ref={(el) => {
                  topBtnRefs.current[top] = el;
                }}
                type="button"
                onClick={() => toggleTop(top)}
                onMouseEnter={() => openHoverPanel(top)}
                onMouseLeave={scheduleCloseHoverPanel}
                className={tagBtnClass(topActive)}
              >
                {top}
              </button>
            );
          })}
        </div>
        {hoveredTop && flyoutPos && hoveredSubOptions.length > 0 ? (
          <div
            className="fixed z-[100] min-w-[10rem] max-w-[min(100vw-2rem,22rem)] rounded-lg border border-gray-200 bg-white p-2.5 shadow-lg shadow-teal-900/10"
            style={{ top: flyoutPos.top, left: flyoutPos.left }}
            role="group"
            aria-label={`${hoveredTop} 二级分类`}
            onMouseEnter={cancelCloseHoverPanel}
            onMouseLeave={scheduleCloseHoverPanel}
          >
            <p className="mb-2 px-0.5 text-[10px] font-black uppercase tracking-wide text-gray-400">
              {hoveredTop}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {hoveredSubOptions.map((sub) => {
                const subActive = selectedSubs.some((s) => s.top === hoveredTop && s.sub === sub);
                return (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => toggleSub(hoveredTop, sub)}
                    className={tagBtnClass(subActive)}
                  >
                    {sub}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
        <div className="flex flex-wrap items-center justify-between gap-2">
          {selectionHint ? (
            <span className="text-xs font-bold text-teal-700">已选 {selectionHint}</span>
          ) : (
            <span className="sr-only">未选择分类</span>
          )}
          {showExpandToggle ? (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="ml-auto inline-flex shrink-0 items-center gap-0.5 text-xs font-black text-teal-600 hover:text-teal-700"
              aria-expanded={expanded}
            >
              {expanded ? '收起' : '展开'}
              <ChevronDown
                className={cn('h-3.5 w-3.5 transition-transform', expanded && 'rotate-180')}
                aria-hidden
              />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function FilterRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2.5 border-b border-gray-100 py-3.5 sm:flex-row sm:items-start sm:gap-5">
      <span className="shrink-0 pt-0.5 text-sm font-black text-gray-800">{label}</span>
      <div className="flex min-w-0 flex-1 flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={cn(
              'rounded-md border px-3 py-1.5 text-xs font-bold transition sm:text-[13px]',
              value === opt
                ? 'border-teal-600 bg-white text-teal-600 shadow-sm'
                : 'border-gray-200 bg-white text-gray-600 hover:border-teal-300 hover:text-gray-800'
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

const DEMAND_TYPE_LIST_LABEL_MAP: Partial<Record<OutcomeDemandType, string>> = {
  产品需求: '采购需求',
  研发需求: '技术需求',
  金融需求: '融资需求-银行贷款',
};

function listDemandTypeLabel(item: SupplyDemandOutcome): string {
  if (item.demandListTypeLabel) return item.demandListTypeLabel;
  return DEMAND_TYPE_LIST_LABEL_MAP[item.demandType] ?? item.categoryLabel;
}

function validUntilDisplay(item: SupplyDemandOutcome): string {
  if (item.validUntilLabel) return item.validUntilLabel;
  const d = item.deadline;
  if (!d || d === '--' || d === '无') return '长期有效';
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  return d;
}

function enterpriseName(item: SupplyDemandOutcome): string {
  return item.demandEnterprise ?? item.demander;
}

function regionCityDisplay(item: SupplyDemandOutcome): string {
  if (item.regionCity) return item.regionCity;
  const line = item.locationLine ?? '';
  const m = line.match(/省(.+)/);
  if (m) return m[1];
  return line || item.province;
}

function maxBudgetDisplay(item: SupplyDemandOutcome): string {
  if (item.maxBudgetShort) return item.maxBudgetShort;
  const b = item.budgetLine ?? '';
  if (b.includes('——') || b.includes('--')) return '面议';
  const m = b.match(/(\d+(?:\.\d+)?)/);
  return m ? String(m[1]) : '面议';
}

function isFinanceFooter(item: SupplyDemandOutcome): boolean {
  return item.demandCardFooter === 'finance' || item.demandType === '金融需求';
}

function matchStatusBadgeClass(status: ReturnType<typeof getOutcomeMatchStatus>): string {
  if (status === '可对接') return 'border-teal-200 bg-teal-50 text-teal-800';
  if (status === '已联系') return 'border-blue-200 bg-blue-50 text-blue-800';
  if (status === '已达成') return 'border-slate-200 bg-slate-50 text-slate-700';
  if (status === '需求取消') return 'border-gray-200 bg-gray-100 text-gray-600';
  return 'border-amber-200 bg-amber-50 text-amber-900';
}

function DemandCenterListCard({
  item,
  onOpenCard,
  onContactMe,
}: {
  item: SupplyDemandOutcome;
  onOpenCard: () => void;
  onContactMe: () => void;
}) {
  const finance = isFinanceFooter(item);
  const leftVal = finance ? (item.financeAmountWan ?? '—') : regionCityDisplay(item);
  const rightVal = finance ? (item.loanPeriodMonths ?? '—') : maxBudgetDisplay(item);
  const leftLabel = finance ? '融资金额(万元)' : '所属地区';
  const rightLabel = finance ? '贷款周期(月)' : '最高预算';
  const matchStatus = getOutcomeMatchStatus(item);
  const connectable = matchStatus === '可对接';

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onOpenCard}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpenCard();
        }
      }}
      className={cn(
        'flex h-full cursor-pointer flex-col overflow-hidden rounded-lg border border-gray-200 bg-white text-left shadow-sm outline-none transition-shadow',
        'hover:border-teal-200 hover:shadow-md focus-visible:ring-2 focus-visible:ring-teal-400/50'
      )}
    >
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 min-w-0 flex-1 text-[15px] font-black leading-snug text-gray-900 sm:text-base">
            {item.title}
          </h3>
          <div className="flex shrink-0 items-center gap-1.5">
            <DemandFavoriteButton demandId={item.id} size="sm" />
            <span
              className={cn(
                'rounded-md border px-2 py-0.5 text-[10px] font-black sm:text-[11px]',
                matchStatusBadgeClass(matchStatus)
              )}
            >
              {matchStatus}
            </span>
          </div>
        </div>
        <dl className="mt-3 flex flex-1 flex-col gap-2 text-[13px] leading-snug">
          <div className="flex justify-between gap-3">
            <dt className="shrink-0 font-medium text-gray-500">需求类型</dt>
            <dd className="min-w-0 text-right font-bold text-gray-900">{listDemandTypeLabel(item)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="shrink-0 font-medium text-gray-500">有效时间</dt>
            <dd className="min-w-0 text-right font-bold text-gray-900">{validUntilDisplay(item)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="shrink-0 font-medium text-gray-500">需求企业</dt>
            <dd className="min-w-0 text-right font-bold text-gray-900">{enterpriseName(item)}</dd>
          </div>
        </dl>
      </div>
      <div className="grid grid-cols-2 divide-x divide-gray-200/80 border-t border-gray-100 bg-gray-50">
        <div className="flex flex-col items-center justify-center px-2 py-3 text-center sm:px-3">
          <p
            className={cn(
              'text-lg font-black tabular-nums sm:text-xl',
              finance ? 'text-gray-900' : 'text-teal-600'
            )}
          >
            {leftVal}
          </p>
          <p className="mt-0.5 text-[11px] font-bold text-gray-500 sm:text-xs">{leftLabel}</p>
        </div>
        <div className="flex flex-col items-center justify-center px-2 py-3 text-center sm:px-3">
          <p
            className={cn(
              'text-lg font-black tabular-nums sm:text-xl',
              finance ? 'text-gray-900' : 'text-teal-600'
            )}
          >
            {rightVal}
          </p>
          <p className="mt-0.5 text-[11px] font-bold text-gray-500 sm:text-xs">{rightLabel}</p>
        </div>
      </div>
      {connectable ? (
        <div className="border-t border-gray-100 bg-white p-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onContactMe();
            }}
            className="w-full rounded-lg border border-teal-200 bg-teal-50 py-2 text-center text-xs font-black text-teal-800 transition hover:bg-teal-100 hover:border-teal-300 sm:text-sm"
          >
            与我联系
          </button>
        </div>
      ) : null}
    </article>
  );
}

/** 交流合作与供需中心：左侧频道 */
type DiscussionSidebarKey = '全部动态' | '用水户专区' | '产业主体专区' | '政企沟通空间';

const DISCUSSION_TABS = ['最新发布', '热门讨论', '待解决需求'] as const;
type DiscussionTab = (typeof DISCUSSION_TABS)[number];

function defaultDiscussionTags(item: SupplyDemandOutcome): readonly [string, string] {
  if (item.discussionTags) return item.discussionTags;
  const a = item.categoryLabel.slice(0, 6);
  return [a, '交流'];
}

function DemandCenterDiscussionHub({
  discussionZone,
  setDiscussionZone,
  discussionTab,
  setDiscussionTab,
  items,
  onBack,
  onOpenDetail,
}: {
  discussionZone: DiscussionSidebarKey;
  setDiscussionZone: (z: DiscussionSidebarKey) => void;
  discussionTab: DiscussionTab;
  setDiscussionTab: (t: DiscussionTab) => void;
  items: SupplyDemandOutcome[];
  onBack: () => void;
  onOpenDetail: (id: number, options?: { revealContactPhone?: boolean }) => void;
}) {
  const sidebarItems: { key: DiscussionSidebarKey; label: string }[] = [
    { key: '全部动态', label: '全部动态' },
    { key: '用水户专区', label: '用水户专区' },
    { key: '产业主体专区', label: '产业主体专区' },
    { key: '政企沟通空间', label: '政企沟通空间' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start gap-4 sm:justify-between sm:gap-6">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={onBack}
            className="group flex shrink-0 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-black text-gray-600 shadow-sm transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-100 bg-gray-50 group-hover:border-teal-200 group-hover:bg-white">
              <ChevronRight className="h-4 w-4 rotate-180" aria-hidden />
            </span>
            返回
          </button>
          <div className="min-w-0">
            <h1 className="text-xl font-black tracking-tight text-gray-900 sm:text-2xl lg:text-3xl">
              交流合作与供需中心
            </h1>
          </div>
        </div>
        <div className="flex w-full shrink-0 items-center justify-between gap-3 rounded-2xl border border-teal-100/90 bg-white px-4 py-2.5 shadow-sm shadow-teal-900/5 sm:w-auto sm:justify-end">
          <div className="flex -space-x-2" aria-hidden>
            {[
              'from-teal-400 to-teal-600',
              'from-cyan-400 to-teal-600',
              'from-emerald-400 to-teal-600',
              'from-sky-400 to-teal-500',
            ].map((g, i) => (
              <div
                key={i}
                className={cn(
                  'h-9 w-9 rounded-full border-2 border-white bg-gradient-to-br ring-0',
                  g
                )}
              />
            ))}
          </div>
          <p className="text-right text-sm font-black leading-tight text-gray-900">
            <span className="tabular-nums text-teal-700">+2,500</span>{' '}
            <span className="block font-bold text-gray-600 sm:inline sm:font-black sm:text-gray-900">
              位用户在线交流
            </span>
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <aside className="w-full shrink-0 space-y-4 lg:w-56 xl:w-60">
          <button
            type="button"
            className="flex w-full min-h-[48px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 px-4 py-3 text-sm font-black text-white shadow-lg shadow-teal-600/25 ring-1 ring-teal-500/30 transition hover:from-teal-700 hover:to-teal-600 active:scale-[0.99]"
          >
            <Plus className="h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden />
            发布动态 / 需求
          </button>
          <nav className="space-y-0.5 rounded-xl border border-gray-200/90 bg-white p-2 shadow-sm" aria-label="交流分区">
            {sidebarItems.map(({ key, label }) => {
              const active = discussionZone === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setDiscussionZone(key)}
                  className={cn(
                    'flex w-full rounded-lg px-3 py-2.5 text-left text-sm font-black transition',
                    active ? 'bg-teal-50 text-teal-800' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  {label}
                </button>
              );
            })}
          </nav>
          <div className="rounded-xl bg-gradient-to-br from-teal-600 via-teal-600 to-cyan-700 p-4 text-white shadow-md shadow-teal-900/20">
            <h3 className="text-sm font-black">热门话题</h3>
            <p className="mt-3 text-xs font-semibold leading-relaxed text-white/95">
              「2023 城镇供水漏损控制技术交流」活动征集中：分享分区计量、夜间最小流量与压力管理实战经验，优秀方案可推荐参与省级试点申报（演示文案）。
            </p>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="flex gap-1 border-b border-gray-200 sm:gap-6" role="tablist" aria-label="动态排序">
            {DISCUSSION_TABS.map((tab) => {
              const active = discussionTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setDiscussionTab(tab)}
                  className={cn(
                    '-mb-px shrink-0 border-b-2 px-2 py-2.5 text-xs font-black transition sm:px-3 sm:text-sm',
                    active ? 'border-teal-600 text-teal-700' : 'border-transparent text-gray-500 hover:text-gray-800'
                  )}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          <div className="mt-5 space-y-4">
            {items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-teal-100/80 bg-teal-50/30 py-16 text-center text-sm font-bold text-gray-600">
                当前分区或筛选下暂无动态，可切换左侧频道或调整上方「需求主体 / 对接状态」等条件
              </div>
            ) : (
              items.map((item) => {
                const author = item.publisherDisplay ?? item.demander;
                const tags = defaultDiscussionTags(item);
                const time = item.discussionTimeLabel ?? item.publishedAt;
                const likes = item.discussionLikes ?? Math.max(1, Math.floor(item.hot / 10));
                const comments = item.discussionComments ?? Math.max(1, Math.floor(item.views / 80));
                const pulse = item.discussionPulseCta === true;

                return (
                  <article
                    key={item.id}
                    className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm shadow-gray-900/5 sm:p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex min-w-0 flex-1 gap-3">
                        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-gray-100 bg-gray-50">
                          <img
                            src={item.image}
                            alt=""
                            className="h-full w-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-gray-900">{author}</p>
                          <p className="text-xs font-bold text-gray-400">{time}</p>
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
                        <span className="rounded-md border border-gray-100 bg-gray-50 px-2 py-0.5 text-[10px] font-black text-gray-600">
                          {tags[0]}
                        </span>
                        <span className="rounded-md border border-gray-100 bg-gray-50 px-2 py-0.5 text-[10px] font-black text-gray-600">
                          {tags[1]}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onOpenDetail(item.id)}
                      className="mt-3 block w-full text-left text-base font-black leading-snug text-teal-700 transition hover:text-teal-800 hover:underline"
                    >
                      {item.title}
                    </button>
                    <p className="mt-2 line-clamp-3 text-sm font-medium leading-relaxed text-gray-600">
                      {item.description}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-50 pt-3">
                      <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
                        <span className="inline-flex items-center gap-1">
                          <ThumbsUp className="h-3.5 w-3.5 text-gray-400" aria-hidden />
                          {likes}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MessageCircle className="h-3.5 w-3.5 text-gray-400" aria-hidden />
                          {comments}
                        </span>
                      </div>
                      {pulse ? (
                        <button
                          type="button"
                          onClick={() => onOpenDetail(item.id)}
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-600 text-white shadow-md shadow-teal-600/30 transition hover:bg-teal-700"
                          aria-label="参与交流"
                        >
                          <Activity className="h-5 w-5" aria-hidden />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onOpenDetail(item.id)}
                          className="rounded-lg border border-teal-200 bg-teal-50/80 px-4 py-2 text-xs font-black text-teal-800 transition hover:border-teal-300 hover:bg-teal-100"
                        >
                          立即参与
                        </button>
                      )}
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SupplyProductGridSection({
  products,
  onSelectProduct,
  showFavorite,
}: {
  products: ProductRecord[];
  onSelectProduct: (p: ProductRecord) => void;
  showFavorite?: boolean;
}) {
  return (
    <section className="w-full">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {products.map((p, idx) => (
          <div
            key={`${p.id}-${idx}`}
            className={cn('group relative flex flex-col overflow-hidden text-left', PORTAL_PRODUCT_CARD)}
          >
            {showFavorite ? <ProductFavoriteButton productId={p.id} /> : null}
            <button
              type="button"
              onClick={() => onSelectProduct(p)}
              className="flex min-h-0 flex-1 flex-col overflow-hidden border-0 bg-transparent p-0 text-left outline-none focus-visible:ring-2 focus-visible:ring-teal-400/80 focus-visible:ring-offset-2"
            >
            <div className="relative h-28 shrink-0 overflow-hidden border-b border-gray-100 bg-gray-50">
              <span className="absolute left-2 top-2 z-10 max-w-[calc(100%-1rem)] truncate rounded bg-teal-500 px-2 py-0.5 text-[10px] font-black text-white shadow-sm">
                {p.category}
              </span>
              <img
                src={p.image}
                alt=""
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-1 flex-col p-3">
              <h4 className="line-clamp-2 text-xs font-black leading-snug text-gray-900 sm:text-sm">{p.name}</h4>
              <p className="mt-1.5 truncate text-[10px] font-bold leading-snug text-gray-500 sm:text-[11px]">
                {getPortalProductSupplierName(p)}
              </p>
              <span className="mt-auto flex items-center gap-0.5 self-start pt-3 text-xs font-bold text-teal-600 group-hover:underline">
                查看详情 <ChevronRight className="h-3 w-3" aria-hidden />
              </span>
            </div>
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

export function DemandMarketPage({
  variant = 'demand',
  onBack,
  onOpenDetail,
  onSelectSupplyProduct,
  supplyWaterSavingFilter = SUPPLY_MARKET_WATER_SAVING_FILTER_EMPTY,
  onSupplyWaterSavingFilterChange,
  onPublishProduct,
  onPublishDemand,
  portalUiStyle = 4,
  highlightDemandId = null,
  onHighlightDemandConsumed,
}: {
  variant?: DemandMarketPageVariant;
  onBack: () => void;
  onOpenDetail: (id: number, options?: { revealContactPhone?: boolean }) => void;
  onSelectSupplyProduct?: (p: ProductRecord) => void;
  supplyWaterSavingFilter?: SupplyMarketWaterSavingFilter;
  onSupplyWaterSavingFilterChange?: (next: SupplyMarketWaterSavingFilter) => void;
  onPublishProduct?: () => void;
  /** 门户「免费发布需求」：跳转工作台需求中心并打开新增表单 */
  onPublishDemand?: () => void;
  portalUiStyle?: number;
  /** 从「我的消息」定位到列表中的需求卡片 */
  highlightDemandId?: number | null;
  onHighlightDemandConsumed?: () => void;
}) {
  const portalDemands = usePortalDemands();
  const [entity, setEntity] = useState<string>('全部');
  const [demandType, setDemandType] = useState<string>('全部');
  const [applicationField, setApplicationField] = useState<ApplicationFieldFilter>('全部');
  const [sortField, setSortField] = useState<SortFieldKey>('hot');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [keyword, setKeyword] = useState('');
  const [matchStatus, setMatchStatus] = useState<MatchStatusFilter>('可对接');
  const {
    selectedTops: supplyWaterSavingTops,
    selectedSubs: supplyWaterSavingSubs,
    leafKeyword: supplyWaterSavingLeaf,
  } = supplyWaterSavingFilter;
  const setSupplyWaterSavingFilter = (next: SupplyMarketWaterSavingFilter) => {
    onSupplyWaterSavingFilterChange?.(next);
  };
  const [supplyIndustryType, setSupplyIndustryType] = useState('全部');
  const [supplySortField, setSupplySortField] = useState<SortFieldKey>('hot');
  const [supplySortDir, setSupplySortDir] = useState<'asc' | 'desc'>('desc');
  const [discussionZone, setDiscussionZone] = useState<DiscussionSidebarKey>('全部动态');
  const [discussionTab, setDiscussionTab] = useState<DiscussionTab>('最新发布');
  const [flashDemandId, setFlashDemandId] = useState<number | null>(null);

  useEffect(() => {
    if (highlightDemandId == null || variant !== 'demand') return;
    const item = getPortalDemandById(highlightDemandId);
    if (!item) {
      onHighlightDemandConsumed?.();
      return;
    }
    setEntity('全部');
    setMatchStatus('全部');
    setKeyword('');
    setDemandType(item.demandType === '交流讨论' ? '交流讨论' : item.demandType);
    const timer = window.setTimeout(() => {
      const el = document.getElementById(`portal-demand-${highlightDemandId}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setFlashDemandId(highlightDemandId);
      window.setTimeout(() => setFlashDemandId(null), 3200);
      onHighlightDemandConsumed?.();
    }, 120);
    return () => window.clearTimeout(timer);
  }, [highlightDemandId, onHighlightDemandConsumed, variant]);

  const filteredOutcomes = useMemo(() => {
    let list = [...portalDemands];
    if (entity !== '全部') {
      list = list.filter((x) => x.entity === entity);
    }
    if (demandType !== '全部') {
      list = list.filter((x) => x.demandType === demandType);
    }
    if (applicationField !== '全部') {
      list = list.filter((x) => outcomeMatchesApplicationField(x, applicationField));
    }
    const q = keyword.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (x) =>
          x.title.toLowerCase().includes(q) ||
          x.description.toLowerCase().includes(q) ||
          x.demander.toLowerCase().includes(q) ||
          (x.publisherDisplay?.toLowerCase().includes(q) ?? false) ||
          x.supplier.toLowerCase().includes(q) ||
          x.categoryLabel.toLowerCase().includes(q) ||
          (x.demandListTypeLabel?.toLowerCase().includes(q) ?? false) ||
          (x.locationLine?.toLowerCase().includes(q) ?? false) ||
          (x.regionCity?.toLowerCase().includes(q) ?? false) ||
          (x.maxBudgetShort?.toLowerCase().includes(q) ?? false) ||
          (x.financeAmountWan?.includes(q) ?? false) ||
          formatOutcomeApplicationFields(x).toLowerCase().includes(q)
      );
    }
    if (matchStatus !== '全部') {
      list = list.filter((x) => getOutcomeMatchStatus(x) === matchStatus);
    }
    const dir = sortDir === 'asc' ? 1 : -1;
    list.sort((a, b) => {
      if (sortField === 'hot') return dir * (a.hot - b.hot);
      if (sortField === 'views') return dir * (a.views - b.views);
      return dir * (a.publishedTs - b.publishedTs);
    });
    return list;
  }, [portalDemands, entity, demandType, applicationField, sortField, sortDir, keyword, matchStatus]);

  const showDiscussionHub = variant === 'demand' && demandType === '交流讨论';

  const discussionFeedItems = useMemo(() => {
    if (!showDiscussionHub) return [];
    let list = [...filteredOutcomes];
    if (discussionZone !== '全部动态') {
      const entityNeed =
        discussionZone === '用水户专区'
          ? '用水户需求'
          : discussionZone === '产业主体专区'
            ? '产业主体需求'
            : '政府部门需求';
      list = list.filter((x) => x.entity === entityNeed);
    }
    if (discussionTab === '待解决需求') {
      list = list.filter((x) => getOutcomeMatchStatus(x) === '可对接');
    }
    const sorted = [...list];
    if (discussionTab === '热门讨论') {
      sorted.sort((a, b) => b.hot - a.hot);
    } else {
      sorted.sort((a, b) => b.publishedTs - a.publishedTs);
    }
    return sorted;
  }, [showDiscussionHub, filteredOutcomes, discussionZone, discussionTab]);

  useEffect(() => {
    if (demandType !== '交流讨论') {
      setDiscussionZone('全部动态');
      setDiscussionTab('最新发布');
    }
  }, [demandType]);

  const filteredProducts = useMemo(() => {
    if (variant !== 'supply') return [];
    let list = PRODUCTS.filter((p) =>
      productMatchesHomeWaterSavingMultiFilter(p, supplyWaterSavingTops, supplyWaterSavingSubs, portalUiStyle)
    );
    const leaf = supplyWaterSavingLeaf?.trim();
    if (leaf) {
      list = list.filter((p) => p.name.includes(leaf));
    }
    list = list.filter((p) => productMatchesPrimaryIndustry(p, supplyIndustryType));
    const q = keyword.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.scenario?.toLowerCase().includes(q) ?? false) ||
          p.info.toLowerCase().includes(q) ||
          getPortalProductSupplierName(p).toLowerCase().includes(q)
      );
    }
    const dir = supplySortDir === 'asc' ? 1 : -1;
    list = [...list];
    list.sort((a, b) => {
      if (supplySortField === 'hot') return dir * (productMockHot(a.id) - productMockHot(b.id));
      if (supplySortField === 'views') return dir * (productMockViews(a.id) - productMockViews(b.id));
      return dir * (productMockPublishedTs(a.id) - productMockPublishedTs(b.id));
    });
    return list;
  }, [
    variant,
    supplyWaterSavingTops,
    supplyWaterSavingSubs,
    supplyWaterSavingLeaf,
    portalUiStyle,
    supplyIndustryType,
    supplySortField,
    supplySortDir,
    keyword,
  ]);

  const recordCount = variant === 'supply' ? filteredProducts.length : filteredOutcomes.length;

  if (variant === 'supply') {
    return (
      <div className={PORTAL_PAGE_CONTENT}>
        <div className="mb-6 flex flex-wrap items-center gap-3 sm:gap-4">
          <button type="button" onClick={onBack} className={PORTAL_BACK_BUTTON}>
            <span className={PORTAL_BACK_BUTTON_ICON}>
              <ChevronRight className="h-4 w-4 rotate-180" aria-hidden />
            </span>
            返回
          </button>
          <div className="min-w-0 flex-1 sm:pl-1">
            <h1 className="text-xl font-black tracking-tight text-gray-900 sm:text-2xl lg:text-3xl">供方市场</h1>
          </div>
        </div>

        <section className={PORTAL_HERO_BANNER}>
          <div
            className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-teal-200/25 blur-3xl"
            aria-hidden
          />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-black tracking-tight text-teal-900 sm:text-lg">一键发布产品</p>
              <p className="mt-1 text-xs font-bold text-gray-600 sm:text-sm">
                服务精准对接汇聚节水技术、产品与解决方案，智能匹配用水户与产业场景
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4 lg:justify-end">
              <button
                type="button"
                onClick={() => onPublishProduct?.()}
                className={cn(
                  'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-black text-white shadow-lg transition',
                  'bg-gradient-to-r from-teal-600 to-teal-500 shadow-teal-600/25 ring-1 ring-teal-500/30',
                  'hover:from-teal-700 hover:to-teal-600 hover:shadow-xl hover:shadow-teal-600/30',
                  'active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600'
                )}
              >
                <Sparkles className="h-4 w-4 shrink-0 opacity-95" aria-hidden />
                一键发布产品
                <ArrowRight className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
              </button>
              <div className="rounded-xl border border-teal-100/80 bg-white/90 px-4 py-2 text-center shadow-sm backdrop-blur-sm">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">供给总数</p>
                <p className="text-xl font-black tabular-nums text-teal-700 sm:text-2xl">2664</p>
              </div>
            </div>
          </div>
        </section>

        <div className={cn('mt-8', PORTAL_PANEL, 'px-4 py-1 sm:px-6')}>
          <WaterSavingCategoryFilterRow
            filter={supplyWaterSavingFilter}
            onChange={setSupplyWaterSavingFilter}
            portalUiStyle={portalUiStyle}
          />
          <FilterRow
            label="应用领域分类"
            options={SUPPLY_INDUSTRY_TYPE_OPTIONS}
            value={supplyIndustryType}
            onChange={setSupplyIndustryType}
          />
          <div className="flex flex-col gap-2.5 border-b border-gray-100 py-3.5 sm:flex-row sm:items-center sm:gap-5">
            <span className="shrink-0 pt-0.5 text-sm font-black text-gray-800">供给排序</span>
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 sm:gap-2">
              {SORT_FIELD_OPTIONS.map(({ key, label }) => {
                const active = supplySortField === key;
                return (
                  <React.Fragment key={key}>
                    <div
                      className={cn(
                        'inline-flex h-7 shrink-0 items-stretch overflow-hidden rounded-md border bg-white shadow-sm',
                        active ? 'border-teal-600 ring-1 ring-teal-600/15' : 'border-gray-200'
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setSupplySortField(key);
                          setSupplySortDir('desc');
                        }}
                        className={cn(
                          'flex items-center px-2 text-[11px] font-black leading-none transition sm:text-xs',
                          active ? 'bg-teal-50 text-teal-700' : 'text-gray-700 hover:bg-gray-50'
                        )}
                      >
                        {label}
                      </button>
                      <div className="flex w-[22px] shrink-0 flex-col border-l border-gray-200/90">
                        <button
                          type="button"
                          onClick={() => {
                            setSupplySortField(key);
                            setSupplySortDir('asc');
                          }}
                          className={cn(
                            'flex flex-1 items-center justify-center text-gray-500 transition hover:bg-gray-100 hover:text-teal-600',
                            active && supplySortDir === 'asc' && 'bg-teal-100 text-teal-700'
                          )}
                          title={`${label}升序`}
                          aria-label={`${label}升序`}
                        >
                          <ChevronUp className="h-2.5 w-2.5" aria-hidden />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSupplySortField(key);
                            setSupplySortDir('desc');
                          }}
                          className={cn(
                            'flex flex-1 items-center justify-center border-t border-gray-200/90 text-gray-500 transition hover:bg-gray-100 hover:text-teal-600',
                            active && supplySortDir === 'desc' && 'bg-teal-100 text-teal-700'
                          )}
                          title={`${label}降序`}
                          aria-label={`${label}降序`}
                        >
                          <ChevronDown className="h-2.5 w-2.5" aria-hidden />
                        </button>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
          <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:gap-6">
            <span className="shrink-0 text-sm font-black text-gray-800">供给搜索</span>
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-4">
              <div className="relative min-w-[12rem] flex-1 sm:max-w-md">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                  aria-hidden
                />
                <input
                  type="search"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder={SUPPLY_SEARCH_PLACEHOLDER}
                  className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm font-medium text-gray-800 placeholder:text-gray-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
              <p className="text-sm font-bold text-gray-600">
                共 <span className="font-black text-teal-600 tabular-nums">{recordCount}</span> 件商品
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          {filteredProducts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-teal-100/80 bg-teal-50/30 py-16 text-center text-sm font-bold text-gray-600">
              当前条件下暂无匹配商品，请调整节水产品分类、应用领域分类或关键字
            </div>
          ) : (
            <SupplyProductGridSection
              products={filteredProducts}
              onSelectProduct={(p) => onSelectSupplyProduct?.(p)}
              showFavorite
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8">
      {!showDiscussionHub && (
        <div className="mb-6 flex flex-wrap items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={onBack}
            className="group flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-black text-gray-600 shadow-sm transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-100 bg-gray-50 group-hover:border-teal-200 group-hover:bg-white">
              <ChevronRight className="h-4 w-4 rotate-180" aria-hidden />
            </span>
            返回
          </button>
          <div className="min-w-0 flex-1 sm:pl-1">
            <h1 className="text-xl font-black tracking-tight text-gray-900 sm:text-2xl lg:text-3xl">需求中心</h1>
          </div>
        </div>
      )}

      {!showDiscussionHub && (
        <section className="relative overflow-hidden rounded-2xl border border-teal-100/90 bg-gradient-to-r from-teal-50 via-cyan-50/80 to-slate-50 px-4 py-5 shadow-sm shadow-teal-900/5 sm:px-8 sm:py-7">
          <div
            className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-teal-200/25 blur-3xl"
            aria-hidden
          />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-black tracking-tight text-teal-900 sm:text-lg">需求一键发布，资源精准触达</p>
              <p className="mt-1 text-xs font-bold text-gray-600 sm:text-sm">
                汇聚用水户、产业主体与服务机构，智能匹配节水产品与方案
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4 lg:justify-end">
              <button
                type="button"
                onClick={() => onPublishDemand?.()}
                className={cn(
                  'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-black text-white shadow-lg transition',
                  'bg-gradient-to-r from-teal-600 to-teal-500 shadow-teal-600/25 ring-1 ring-teal-500/30',
                  'hover:from-teal-700 hover:to-teal-600 hover:shadow-xl hover:shadow-teal-600/30',
                  'active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600'
                )}
              >
                <Sparkles className="h-4 w-4 shrink-0 opacity-95" aria-hidden />
                免费发布需求
                <ArrowRight className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
              </button>
              <div className="rounded-xl border border-teal-100/80 bg-white/90 px-4 py-2 text-center shadow-sm backdrop-blur-sm">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">需求总数</p>
                <p className="text-xl font-black tabular-nums text-teal-700 sm:text-2xl">
                  {getPortalDemandPublishedCount().toLocaleString('zh-CN')}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      <div
        className={cn(
          'rounded-xl border border-gray-200/90 bg-white px-4 py-1 shadow-sm shadow-teal-900/5 sm:px-6',
          showDiscussionHub ? 'mt-0' : 'mt-8'
        )}
      >
        <FilterRow label="需求主体" options={ENTITY_FILTER_OPTIONS} value={entity} onChange={setEntity} />
        <FilterRow label="需求类型" options={TYPE_FILTER_OPTIONS} value={demandType} onChange={setDemandType} />
        <FilterRow
          label="应用领域"
          options={APPLICATION_FIELD_FILTER_OPTIONS}
          value={applicationField}
          onChange={(v) => setApplicationField(v as ApplicationFieldFilter)}
        />
        <div className="flex flex-col gap-2.5 border-b border-gray-100 py-3.5 sm:flex-row sm:items-center sm:gap-5">
          <span className="shrink-0 pt-0.5 text-sm font-black text-gray-800">需求排序</span>
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 sm:gap-2">
            {SORT_FIELD_OPTIONS.map(({ key, label }) => {
              const active = sortField === key;
              return (
                <React.Fragment key={key}>
                  <div
                    className={cn(
                      'inline-flex h-7 shrink-0 items-stretch overflow-hidden rounded-md border bg-white shadow-sm',
                      active ? 'border-teal-600 ring-1 ring-teal-600/15' : 'border-gray-200'
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSortField(key);
                        setSortDir('desc');
                      }}
                      className={cn(
                        'flex items-center px-2 text-[11px] font-black leading-none transition sm:text-xs',
                        active ? 'bg-teal-50 text-teal-700' : 'text-gray-700 hover:bg-gray-50'
                      )}
                    >
                      {label}
                    </button>
                    <div className="flex w-[22px] shrink-0 flex-col border-l border-gray-200/90">
                      <button
                        type="button"
                        onClick={() => {
                          setSortField(key);
                          setSortDir('asc');
                        }}
                        className={cn(
                          'flex flex-1 items-center justify-center text-gray-500 transition hover:bg-gray-100 hover:text-teal-600',
                          active && sortDir === 'asc' && 'bg-teal-100 text-teal-700'
                        )}
                        title={`${label}升序`}
                        aria-label={`${label}升序`}
                      >
                        <ChevronUp className="h-2.5 w-2.5" aria-hidden />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSortField(key);
                          setSortDir('desc');
                        }}
                        className={cn(
                          'flex flex-1 items-center justify-center border-t border-gray-200/90 text-gray-500 transition hover:bg-gray-100 hover:text-teal-600',
                          active && sortDir === 'desc' && 'bg-teal-100 text-teal-700'
                        )}
                        title={`${label}降序`}
                        aria-label={`${label}降序`}
                      >
                        <ChevronDown className="h-2.5 w-2.5" aria-hidden />
                      </button>
                    </div>
                  </div>
                  {key === 'time' ? (
                    <div className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md border border-transparent px-0.5">
                      <span className="whitespace-nowrap text-[11px] font-black text-gray-700 sm:text-xs">对接状态</span>
                      <select
                        value={matchStatus}
                        onChange={(e) => setMatchStatus(e.target.value as MatchStatusFilter)}
                        aria-label="对接状态筛选"
                        className="h-7 min-w-[5.5rem] cursor-pointer rounded-md border border-teal-200 bg-white py-0 pl-2 pr-7 text-[11px] font-bold leading-none text-gray-800 shadow-sm transition hover:border-teal-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500/30 sm:text-xs"
                      >
                        {MATCH_STATUS_FILTER_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : null}
                </React.Fragment>
              );
            })}
          </div>
        </div>
        <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:gap-6">
          <span className="shrink-0 text-sm font-black text-gray-800">需求搜索</span>
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-4">
            <div className="relative min-w-[12rem] flex-1 sm:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden />
              <input
                type="search"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="请输入关键字"
                className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm font-medium text-gray-800 placeholder:text-gray-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
            <p className="text-sm font-bold text-gray-600">
              共 <span className="font-black text-teal-600 tabular-nums">{recordCount}</span> 条记录
            </p>
          </div>
        </div>
      </div>

      {showDiscussionHub ? (
        <div className="mt-6">
          <DemandCenterDiscussionHub
            discussionZone={discussionZone}
            setDiscussionZone={setDiscussionZone}
            discussionTab={discussionTab}
            setDiscussionTab={setDiscussionTab}
            items={discussionFeedItems}
            onBack={onBack}
            onOpenDetail={onOpenDetail}
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {filteredOutcomes.length === 0 ? (
            <div className="col-span-full rounded-xl border border-dashed border-teal-100/80 bg-teal-50/30 py-16 text-center text-sm font-bold text-gray-600">
              当前条件下暂无匹配需求，请调整筛选、对接状态或关键字
            </div>
          ) : (
            filteredOutcomes.map((row) => (
              <div
                key={row.id}
                id={`portal-demand-${row.id}`}
                className={cn(
                  'h-full min-h-0 rounded-xl transition-shadow',
                  flashDemandId === row.id && 'ring-2 ring-teal-500 ring-offset-2'
                )}
              >
                <DemandCenterListCard
                  item={row}
                  onOpenCard={() => onOpenDetail(row.id)}
                  onContactMe={() => onOpenDetail(row.id, { revealContactPhone: true })}
                />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
