import React, { useMemo, useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Search,
  User,
  Heart,
  Handshake,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { cn } from './lib/utils';
import {
  ENTITY_FILTER_OPTIONS,
  SORT_FIELD_OPTIONS,
  TYPE_FILTER_OPTIONS,
  getOutcomeMatchStatus,
  type OutcomeCategoryTone,
  type SortFieldKey,
  type SupplyDemandOutcome,
} from './supplyDemandOutcomes';
import { usePortalDemands } from './portalDemandStore';

function toneToBadgeClass(tone: OutcomeCategoryTone): string {
  switch (tone) {
    case 'green':
      return 'bg-emerald-600';
    case 'purple':
      return 'bg-violet-600';
    case 'blue':
      return 'bg-cyan-600';
    case 'sky':
      return 'bg-sky-600';
    case 'orange':
      return 'bg-orange-500';
    default:
      return 'bg-gray-600';
  }
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

const SupplyOutcomeCard = ({ item, onOpen }: { item: SupplyDemandOutcome; onOpen: () => void }) => {
  const achievedLabel = item.achievedAt !== '--' ? item.achievedAt : '已确认';
  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      className={cn(
        'group relative flex cursor-pointer gap-4 overflow-hidden rounded-2xl border-2 border-teal-100/90 bg-gradient-to-br from-white via-teal-50/25 to-cyan-50/30 p-4 text-left shadow-md shadow-teal-900/8 outline-none ring-teal-500/0 transition-all',
        'hover:border-teal-300 hover:shadow-lg hover:shadow-teal-600/15 hover:ring-2 hover:ring-teal-400/25 focus-visible:ring-2 focus-visible:ring-teal-400/50'
      )}
    >
      <div
        className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-teal-400/15 blur-2xl transition-opacity group-hover:opacity-90"
        aria-hidden
      />
      <div className="pointer-events-none absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-teal-500 via-emerald-400 to-cyan-500" aria-hidden />

      <img
        src={item.image}
        alt=""
        className="relative z-[1] h-[7.5rem] w-[6.5rem] shrink-0 rounded-xl border border-white object-cover shadow-sm sm:h-32 sm:w-36"
        loading="lazy"
      />
      <div className="relative z-[1] min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/90 bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-800 shadow-sm sm:text-[11px]">
                <CheckCircle2 className="h-3 w-3 shrink-0" aria-hidden />
                撮合成功
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-teal-100 bg-white/90 px-2 py-0.5 text-[10px] font-black text-teal-800 sm:text-[11px]">
                <Handshake className="h-3 w-3 shrink-0 opacity-80" aria-hidden />
                供需对接已达成
              </span>
            </div>
            <h3 className="flex flex-wrap items-center gap-2 text-[15px] font-black leading-snug text-gray-900 sm:text-base">
              <span className="line-clamp-2">{item.title}</span>
              <span className="shrink-0 rounded-md border border-gray-100 bg-white px-2 py-0.5 text-[10px] font-bold text-gray-600 sm:text-[11px]">
                {item.province}
              </span>
            </h3>
          </div>
          <span
            className={cn(
              'shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-black text-white shadow-sm sm:text-[11px]',
              toneToBadgeClass(item.categoryTone)
            )}
          >
            {item.categoryLabel}
          </span>
        </div>
        <p className="mt-2 line-clamp-2 text-xs font-medium leading-relaxed text-gray-600">{item.description}</p>
        <div className="mt-2 flex flex-col gap-1.5 text-[11px] font-bold text-gray-600 sm:text-xs">
          <span className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 shrink-0 text-teal-600" aria-hidden />
            <span className="text-gray-500">需方</span>
            <span className="truncate text-gray-900">{item.demander}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Heart className="h-3.5 w-3.5 shrink-0 text-teal-600" aria-hidden />
            <span className="text-gray-500">供方</span>
            <span className="truncate text-gray-900">{item.supplier}</span>
          </span>
        </div>
        <p className="mt-2 text-xs font-black text-amber-800">{item.amountDisplay}</p>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 border-t border-teal-100/60 pt-2 text-[10px] font-bold sm:text-[11px]">
          <span className="text-gray-500">
            发布 <span className="tabular-nums text-gray-700">{item.publishedAt}</span>
          </span>
          <span className="text-emerald-800">
            对接达成 <span className="font-black tabular-nums text-emerald-700">{achievedLabel}</span>
          </span>
        </div>
      </div>
    </article>
  );
};

export function SupplyDemandResultsPage({
  onBack,
  onOpenDetail,
}: {
  onBack: () => void;
  onOpenDetail: (id: number, options?: { revealContactPhone?: boolean }) => void;
}) {
  const [entity, setEntity] = useState<string>('全部');
  const [demandType, setDemandType] = useState<string>('全部');
  const [sortField, setSortField] = useState<SortFieldKey>('hot');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [keyword, setKeyword] = useState('');
  const portalDemands = usePortalDemands();

  const filtered = useMemo(() => {
    let list = portalDemands.filter((x) => getOutcomeMatchStatus(x) === '已达成');
    if (entity !== '全部') {
      list = list.filter((x) => x.entity === entity);
    }
    if (demandType !== '全部') {
      list = list.filter((x) => x.demandType === demandType);
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
          x.categoryLabel.toLowerCase().includes(q)
      );
    }
    const dir = sortDir === 'asc' ? 1 : -1;
    list = [...list];
    list.sort((a, b) => {
      if (sortField === 'hot') return dir * (a.hot - b.hot);
      if (sortField === 'views') return dir * (a.views - b.views);
      return dir * (a.publishedTs - b.publishedTs);
    });
    return list;
  }, [portalDemands, entity, demandType, sortField, sortDir, keyword]);

  const recordCount = filtered.length;

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 sm:py-10">
      <div className="relative mb-6 flex justify-center sm:mb-8">
        <button
          type="button"
          onClick={onBack}
          className="absolute left-0 top-0 z-10 group flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:border-teal-200 hover:bg-teal-50 hover:text-teal-600"
          aria-label="返回"
        >
          <ChevronRight className="h-5 w-5 rotate-180 transition-transform group-hover:-translate-x-0.5" />
        </button>
        <div className="w-full max-w-3xl px-12 text-center sm:px-14">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-600/90 sm:text-[11px]">撮合成功 · 真实落地</p>
          <h1 className="mt-0.5 text-xl font-black tracking-tight text-gray-900 sm:text-2xl lg:text-3xl">
            已达成的供需对接
          </h1>
        </div>
      </div>

      <section className="relative mb-8 overflow-hidden rounded-2xl border border-teal-200/80 bg-gradient-to-r from-teal-600 via-teal-600 to-cyan-600 px-5 py-6 text-white shadow-lg shadow-teal-900/20 sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-white/10 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-16 left-1/4 h-40 w-40 rounded-full bg-cyan-300/20 blur-3xl" aria-hidden />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-3 sm:gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 sm:h-14 sm:w-14">
              <Sparkles className="h-6 w-6 text-white sm:h-7 sm:w-7" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black sm:text-base">供需撮合成功，合作已落地</p>
              <p className="mt-1 text-xs font-bold leading-relaxed text-teal-50/95 sm:text-sm">
                平台智能匹配 + 双方确认，从发起到落地全程可追溯；点击卡片可查看对接详情与时间线。
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-3 sm:justify-end">
            <div className="rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-center backdrop-blur-sm">
              <p className="text-[10px] font-black uppercase tracking-wider text-teal-50/90">本页已达成</p>
              <p className="text-2xl font-black tabular-nums text-white sm:text-3xl">{recordCount}</p>
              <p className="text-[10px] font-bold text-teal-100/90">条对接记录</p>
            </div>
          </div>
        </div>
      </section>

      <div className="rounded-xl border border-gray-200/90 bg-white px-4 py-1 shadow-sm shadow-teal-900/5 sm:rounded-2xl sm:px-6">
        <FilterRow label="需求主体" options={ENTITY_FILTER_OPTIONS} value={entity} onChange={setEntity} />
        <FilterRow label="需求类型" options={TYPE_FILTER_OPTIONS} value={demandType} onChange={setDemandType} />
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
                    <div className="inline-flex h-7 shrink-0 items-center gap-2 rounded-md border border-emerald-200/80 bg-emerald-50/90 px-2.5 py-0.5">
                      <span className="whitespace-nowrap text-[11px] font-black text-emerald-900 sm:text-xs">对接状态</span>
                      <span
                        className="select-none rounded border border-emerald-300/80 bg-white px-2 py-0.5 text-[11px] font-black text-emerald-800 shadow-sm sm:text-xs"
                        title="本页仅展示已达成对接，不可切换"
                      >
                        已达成
                      </span>
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
                placeholder="搜索需求标题、企业或关键词"
                className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm font-medium text-gray-800 placeholder:text-gray-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
            <p className="text-sm font-bold text-gray-600">
              共 <span className="font-black text-teal-600 tabular-nums">{recordCount}</span> 条已达成
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {filtered.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-teal-200/80 bg-gradient-to-b from-teal-50/50 to-white py-16 text-center">
            <Handshake className="mx-auto mb-3 h-10 w-10 text-teal-500/80" aria-hidden />
            <p className="text-sm font-black text-gray-800">当前条件下暂无已达成记录</p>
            <p className="mt-2 px-4 text-xs font-bold text-gray-500">请尝试调整需求主体、需求类型或搜索关键字</p>
          </div>
        ) : (
          filtered.map((row) => (
            <div key={row.id} className="min-h-0">
              <SupplyOutcomeCard item={row} onOpen={() => onOpenDetail(row.id)} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
