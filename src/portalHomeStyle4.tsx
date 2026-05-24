import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Building2,
  ChevronRight,
  Droplets,
  FileText,
  Handshake,
  Heart,
  Package,
  Sparkles,
} from 'lucide-react';
import { cn } from './lib/utils';
import { CaseCardFavoriteOverlay, CaseFavoriteButton } from './CaseFavoriteButton';
import { homeDemandTypeTagLabel } from './data';
import type { TechCase } from './data';
import type { OutcomeDemandType } from './supplyDemandOutcomes';

export const HOME_STYLE4_PANEL =
  'rounded-2xl border border-gray-200/90 bg-white/95 shadow-sm shadow-teal-900/5 backdrop-blur-sm';

function SectionHeader({
  title,
  moreLabel,
  onMore,
  className,
}: {
  title: string;
  moreLabel?: string;
  onMore?: () => void;
  className?: string;
}) {
  return (
    <div className={cn('mb-3 flex items-center justify-between gap-2', className)}>
      <div className="flex min-w-0 items-center gap-2">
        <span className="h-6 w-1 shrink-0 rounded-full bg-gradient-to-b from-teal-500 to-cyan-500" aria-hidden />
        <h2 className="text-base font-black text-gray-900 sm:text-lg">{title}</h2>
      </div>
      {moreLabel && onMore ? (
        <button
          type="button"
          onClick={onMore}
          className="inline-flex shrink-0 items-center gap-0.5 text-sm font-bold text-teal-600 transition hover:text-teal-800"
        >
          {moreLabel}
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}

/** 供给 / 需求双卡（设计稿中部横条） */
export function HomeStyle4SupplyDemandCards({
  onOpenSupply,
  onOpenDemand,
}: {
  onOpenSupply: () => void;
  onOpenDemand: () => void;
}) {
  return (
    <section className="relative" aria-label="供给与需求入口">
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
        <button
          type="button"
          onClick={onOpenSupply}
          className="group relative overflow-hidden rounded-xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-white to-teal-50/60 px-3.5 py-3 text-left shadow-md shadow-emerald-900/5 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg sm:rounded-2xl sm:px-4 sm:py-3.5"
        >
          <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-emerald-400/10 blur-2xl" />
          <div className="relative flex items-center gap-3 sm:gap-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-600/25 sm:h-11 sm:w-11 sm:rounded-xl">
              <Package className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-base font-black text-emerald-900 sm:text-lg">供给</p>
              <p className="mt-0.5 text-[11px] font-bold leading-snug text-emerald-800/80 sm:text-xs">
                优质资源，高效供给
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-0.5 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-black text-white shadow-sm transition group-hover:bg-emerald-700 sm:px-3 sm:py-1.5 sm:text-xs">
              查看详情
              <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" aria-hidden />
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={onOpenDemand}
          className="group relative overflow-hidden rounded-xl border border-sky-200/80 bg-gradient-to-br from-sky-50 via-white to-cyan-50/60 px-3.5 py-3 text-left shadow-md shadow-sky-900/5 transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-lg sm:rounded-2xl sm:px-4 sm:py-3.5"
        >
          <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-sky-400/10 blur-2xl" />
          <div className="relative flex items-center gap-3 sm:gap-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-cyan-600 text-white shadow-md shadow-sky-600/25 sm:h-11 sm:w-11 sm:rounded-xl">
              <Building2 className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-base font-black text-sky-900 sm:text-lg">需求</p>
              <p className="mt-0.5 text-[11px] font-bold leading-snug text-sky-800/80 sm:text-xs">
                精准匹配，释放价值
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-0.5 rounded-lg bg-sky-600 px-2.5 py-1 text-[11px] font-black text-white shadow-sm transition group-hover:bg-sky-700 sm:px-3 sm:py-1.5 sm:text-xs">
              查看详情
              <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" aria-hidden />
            </span>
          </div>
        </button>
      </div>
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 sm:flex"
        aria-hidden
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-600/30">
          <Handshake className="h-5 w-5" />
        </span>
      </div>
    </section>
  );
}

const DEMAND_ICON_STYLES = [
  'border-emerald-200 bg-emerald-50 text-emerald-600',
  'border-sky-200 bg-sky-50 text-sky-600',
  'border-amber-200 bg-amber-50 text-amber-600',
  'border-rose-200 bg-rose-50 text-rose-600',
] as const;

type DemandItem = {
  id: number;
  title: string;
  demandType: string;
  time: string;
  likes: number;
};

/** 节水需求 2×2 宫格 */
export function HomeStyle4DemandsSection({
  demands,
  animationCycleKey,
  onMore,
  splitPeekRef,
}: {
  demands: DemandItem[];
  animationCycleKey: number;
  onMore: () => void;
  splitPeekRef?: React.Ref<HTMLDivElement>;
}) {
  const renderCard = (d: DemandItem, idx: number) => {
    const iconStyle = DEMAND_ICON_STYLES[idx % DEMAND_ICON_STYLES.length]!;
    return (
      <button
        key={`${animationCycleKey}-${d.id}`}
        type="button"
        onClick={onMore}
        className="flex h-full min-h-[7.5rem] flex-col gap-2 rounded-xl border border-gray-100 bg-white p-3 text-left shadow-sm transition hover:border-teal-200 hover:shadow-md sm:min-h-[8.25rem] sm:p-3.5"
      >
        <div className="flex items-start gap-2.5">
          <span
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border',
              iconStyle
            )}
          >
            <Droplets className="h-4 w-4" aria-hidden />
          </span>
          <span className="line-clamp-2 flex-1 text-xs font-black leading-snug text-gray-900 sm:text-[13px]">
            {d.title}
          </span>
        </div>
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-gray-50 pt-2 text-[10px] sm:text-[11px]">
          <span className="rounded-md border border-teal-100 bg-teal-50 px-1.5 py-0.5 font-black text-teal-700">
            {homeDemandTypeTagLabel(d.demandType as OutcomeDemandType)}
          </span>
          <span className="flex items-center gap-1 font-bold text-gray-400">
            <span>{d.time}</span>
            <Heart className="h-3 w-3 text-rose-400" aria-hidden />
            <span className="text-teal-600">{d.likes}</span>
          </span>
        </div>
      </button>
    );
  };

  return (
    <section className={cn(HOME_STYLE4_PANEL, 'flex min-h-0 flex-1 flex-col p-4 sm:p-5')}>
      <div ref={splitPeekRef} className="shrink-0">
        <SectionHeader title="节水需求" moreLabel="更多需求" onMore={onMore} />
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={animationCycleKey}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.45 }}
            className="grid grid-cols-2 gap-2.5 sm:gap-3"
          >
            {demands.slice(0, 2).map((d, i) => renderCard(d, i))}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="relative mt-2.5 flex min-h-0 flex-1 flex-col sm:mt-3">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${animationCycleKey}-tail`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.45 }}
            className="grid min-h-0 flex-1 grid-cols-2 gap-2.5 auto-rows-[minmax(0,1fr)] sm:gap-3"
          >
            {demands.slice(2, 4).map((d, i) => renderCard(d, i + 2))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

/** 典型案例：左侧大图精选 + 右侧列表 */
export function HomeStyle4CasesSection({
  cases,
  animationCycleKey,
  onMore,
  onCaseClick,
  splitPeekRef,
}: {
  cases: TechCase[];
  animationCycleKey: number;
  onMore: () => void;
  onCaseClick: (tileId: number) => void;
  splitPeekRef?: React.Ref<HTMLDivElement>;
}) {
  const featured = cases[0];
  const list = cases.slice(1, 4);

  return (
    <section className={cn(HOME_STYLE4_PANEL, 'flex min-h-0 flex-1 flex-col p-4 sm:p-5')}>
      <div ref={splitPeekRef} className="flex min-h-0 flex-1 flex-col gap-3">
        <SectionHeader title="典型案例" moreLabel="更多案例" onMore={onMore} />
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={animationCycleKey}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.45 }}
            className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-4"
          >
            {featured ? (
              <button
                type="button"
                onClick={() => onCaseClick(featured.id)}
                className="group relative flex min-h-[10rem] flex-col overflow-hidden rounded-xl border border-teal-200/80 bg-gradient-to-br from-teal-600 to-cyan-700 text-left text-white shadow-md transition hover:shadow-lg sm:min-h-[12rem]"
              >
                <CaseCardFavoriteOverlay caseId={featured.id} />
                <div className="relative h-28 shrink-0 overflow-hidden sm:h-32">
                  <img
                    src={featured.image}
                    alt=""
                    className="h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <motion.div className="absolute inset-0 bg-gradient-to-t from-teal-900/80 via-teal-900/20 to-transparent" />
                  <span className="absolute left-3 top-3 rounded-md bg-white/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-white backdrop-blur-sm">
                    案例精选
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-1.5 p-3 sm:p-4">
                  <h3 className="line-clamp-2 text-sm font-black leading-snug sm:text-base">{featured.name}</h3>
                  <p className="line-clamp-2 text-[11px] font-medium leading-relaxed text-teal-50/90">
                    {featured.description}
                  </p>
                  <span className="mt-auto inline-flex items-center gap-1 text-xs font-bold">
                    查看详情 <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </button>
            ) : null}

            <ul className="flex min-h-0 flex-col gap-2">
              {list.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => onCaseClick(c.id)}
                    className="flex w-full gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-2.5 text-left transition hover:border-teal-200 hover:bg-teal-50/40 sm:p-3"
                  >
                    <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-200 sm:h-16 sm:w-24">
                      <img
                        src={c.image}
                        alt=""
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <CaseCardFavoriteOverlay caseId={c.id} className="right-0.5 top-0.5" />
                    </div>
                    <div className="min-w-0 flex-1 py-0.5">
                      <p className="line-clamp-2 text-xs font-black leading-snug text-gray-900 sm:text-[13px]">
                        {c.name}
                      </p>
                      <p className="mt-1 line-clamp-1 text-[10px] font-bold text-gray-500">{c.description}</p>
                    </div>
                    <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-gray-300" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

/** 政策公开 / 技术标准 */
export function HomeStyle4TechPanels({
  policyItems,
  standardItems,
  onOpenPolicy,
  onOpenTech,
  onSelectPolicy,
  onSelectTech,
}: {
  policyItems: { id: string; label: string }[];
  standardItems: { id: string; label: string }[];
  onOpenPolicy: () => void;
  onOpenTech: () => void;
  onSelectPolicy: (id: string) => void;
  onSelectTech: (id: string) => void;
}) {
  const listBlock = (
    title: string,
    icon: React.ComponentType<{ className?: string }>,
    items: { id: string; label: string }[],
    onMore: () => void,
    onSelect: (id: string) => void
  ) => {
    const Icon = icon;
    return (
      <div className={cn(HOME_STYLE4_PANEL, 'flex flex-1 flex-col p-4 sm:p-5')}>
        <SectionHeader title={title} moreLabel="查看更多" onMore={onMore} className="mb-3" />
        <ul className="space-y-1.5">
          {items.map((row) => (
            <li key={row.id}>
              <button
                type="button"
                onClick={() => onSelect(row.id)}
                className="group flex w-full items-start gap-2.5 rounded-lg px-2 py-2.5 text-left transition hover:bg-teal-50/80"
              >
                <span className="mt-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 text-[10px] font-black text-white shadow-sm">
                  •
                </span>
                <span className="min-w-0 flex-1 text-xs font-bold leading-snug text-gray-800 transition group-hover:text-teal-900 sm:text-sm">
                  {row.label}
                </span>
                <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-gray-300 opacity-0 transition group-hover:opacity-100" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <section className="grid gap-5 lg:grid-cols-2 lg:gap-6">
      {listBlock('政策公开', Sparkles, policyItems, onOpenPolicy, onSelectPolicy)}
      {listBlock('技术标准', FileText, standardItems, onOpenTech, onSelectTech)}
    </section>
  );
}
