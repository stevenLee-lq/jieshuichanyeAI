import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Award,
  BarChart3,
  Building2,
  ChevronRight,
  Eye,
  FileText,
  LayoutGrid,
  MapPin,
  Newspaper,
  PieChart,
  Radio,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { CaseCardFavoriteOverlay } from './CaseFavoriteButton';
import { cn } from './lib/utils';
import {
  DEMANDS,
  NEWS,
  POLICIES,
  PORTAL_CASES_HOME_FEATURED,
  PRODUCTS,
  type ProductRecord,
} from './data';

export type DataOverviewDashboardProps = {
  /** 工作台展示的企业名称（演示默认与线稿一致） */
  companyName?: string;
};

type BrowseTab = 'product' | 'case';

const PANEL_HEADER =
  'flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-teal-100/80 bg-gradient-to-r from-white via-teal-50/30 to-cyan-50/20 px-4 py-3.5 sm:px-5';

function statFromSeed(id: number, kind: 'imp' | 'view'): number {
  const base = (id * 97 + (kind === 'imp' ? 31 : 17)) % 900;
  return kind === 'imp' ? base + 80 : Math.max(8, base % 120);
}

function DashboardPanel({
  title,
  subtitle,
  icon: Icon,
  action,
  children,
  className,
  bodyClassName,
}: {
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section
      className={cn(
        'dashboard-panel flex min-h-0 flex-col overflow-hidden rounded-2xl border border-gray-200/90 bg-white/95 backdrop-blur-sm',
        className
      )}
    >
      <div className={PANEL_HEADER}>
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-teal-200/70 bg-gradient-to-br from-teal-50 to-cyan-100/80 text-teal-700 shadow-sm shadow-teal-500/10">
            <Icon className="h-[18px] w-[18px]" aria-hidden />
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-black text-gray-900 sm:text-base">{title}</h3>
            {subtitle ? (
              <p className="mt-0.5 text-[10px] font-bold text-teal-800/75 sm:text-[11px]">{subtitle}</p>
            ) : null}
          </div>
        </div>
        {action}
      </div>
      <div className={cn('min-h-0 flex-1', bodyClassName)}>{children}</div>
    </section>
  );
}

function KpiTile({
  label,
  value,
  unit,
  tone = 'teal',
}: {
  label: string;
  value: string | number;
  unit?: string;
  tone?: 'teal' | 'cyan' | 'sky';
}) {
  const toneClass =
    tone === 'cyan'
      ? 'border-cyan-200/80 from-cyan-50/90 to-white text-cyan-800'
      : tone === 'sky'
        ? 'border-sky-200/80 from-sky-50/90 to-white text-sky-800'
        : 'border-teal-200/80 from-teal-50/90 to-white text-teal-800';
  return (
    <div
      className={cn(
        'rounded-xl border bg-gradient-to-br px-3 py-2.5 shadow-sm',
        toneClass
      )}
    >
      <p className="text-[10px] font-bold uppercase tracking-wide opacity-80">{label}</p>
      <p className="mt-1 tabular-nums text-lg font-black text-gray-900 sm:text-xl">
        {value}
        {unit ? <span className="ml-0.5 text-xs font-black text-gray-600">{unit}</span> : null}
      </p>
    </div>
  );
}

function BrowseCard({
  image,
  title,
  productId,
  caseId,
  impressionLabel = '展示',
}: {
  image: string;
  title: string;
  productId?: number;
  caseId?: number;
  impressionLabel?: string;
}) {
  const statSeed = productId ?? caseId ?? 0;
  const imp = statFromSeed(statSeed, 'imp');
  const view = statFromSeed(statSeed, 'view');
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-gray-100/90 bg-gradient-to-b from-white to-slate-50/80 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-teal-300/60 hover:shadow-md hover:shadow-teal-500/10">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={image}
          alt=""
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          referrerPolicy="no-referrer"
        />
        {caseId != null ? <CaseCardFavoriteOverlay caseId={caseId} /> : null}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/25 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <p className="line-clamp-2 text-left text-xs font-black leading-snug text-gray-900">{title}</p>
        <div className="mt-auto flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-md border border-teal-100 bg-teal-50/90 px-2 py-0.5 text-[10px] font-black text-teal-800">
            {impressionLabel} <span className="ml-1 tabular-nums text-gray-900">{imp}</span>
          </span>
          <span className="inline-flex items-center rounded-md border border-cyan-100 bg-cyan-50/90 px-2 py-0.5 text-[10px] font-black text-cyan-800">
            查看 <span className="ml-1 tabular-nums text-gray-900">{view}</span>
          </span>
        </div>
      </div>
    </article>
  );
}

function SidebarListItem({
  title,
  meta,
  accent = 'teal',
}: {
  title: string;
  meta?: string;
  accent?: 'teal' | 'cyan';
}) {
  return (
    <li
      className={cn(
        'rounded-lg border px-3 py-2.5 text-left transition hover:shadow-sm',
        accent === 'cyan'
          ? 'border-cyan-100/90 bg-cyan-50/25 hover:border-cyan-200'
          : 'border-teal-100/90 bg-teal-50/20 hover:border-teal-200'
      )}
    >
      <p className="line-clamp-2 text-[11px] font-black leading-snug text-gray-900">{title}</p>
      {meta ? <p className="mt-1 text-[10px] font-bold text-gray-500">{meta}</p> : null}
    </li>
  );
}

/** 工作台「数据总览」：左主栏浏览与获客，右侧资讯 / 政策 / 同行 / 需求推送 */
export function DataOverviewDashboard({ companyName = '江苏海鸥冷却塔股份有限公司' }: DataOverviewDashboardProps) {
  const [browseTab, setBrowseTab] = useState<BrowseTab>('product');
  const marketScrollRef = useRef<HTMLDivElement>(null);
  const marketScrollPausedRef = useRef(false);
  const [marketAutoScroll, setMarketAutoScroll] = useState(() =>
    typeof window !== 'undefined' ? !window.matchMedia('(prefers-reduced-motion: reduce)').matches : true
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setMarketAutoScroll(!mq.matches);
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (!marketAutoScroll) return;

    let rafId = 0;
    const pxPerFrame = 0.42;

    const step = () => {
      const el = marketScrollRef.current;
      if (!el) {
        rafId = requestAnimationFrame(step);
        return;
      }
      if (marketScrollPausedRef.current) {
        rafId = requestAnimationFrame(step);
        return;
      }

      const max = el.scrollHeight - el.clientHeight;
      if (max <= 1) {
        rafId = requestAnimationFrame(step);
        return;
      }

      el.scrollTop += pxPerFrame;
      if (el.scrollTop >= max - 0.5) {
        el.scrollTop = 0;
      }
      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [marketAutoScroll]);

  useEffect(() => {
    const el = marketScrollRef.current;
    if (!el || !marketAutoScroll) return;
    const block = (e: Event) => e.preventDefault();
    el.addEventListener('wheel', block, { passive: false });
    el.addEventListener('touchmove', block, { passive: false });
    return () => {
      el.removeEventListener('wheel', block);
      el.removeEventListener('touchmove', block);
    };
  }, [marketAutoScroll]);

  const productRows = useMemo(() => {
    const cooling = PRODUCTS.filter((p) => p.name.includes('冷却') || p.name.includes('塔'));
    const list: ProductRecord[] = cooling.length >= 4 ? cooling.slice(0, 4) : PRODUCTS.slice(0, 4);
    return list;
  }, []);

  const caseRows = useMemo(
    () =>
      PORTAL_CASES_HOME_FEATURED.map((c) => ({
        id: c.id,
        name: c.name,
        image: c.image,
      })),
    []
  );

  const newsLoop = useMemo(() => [...NEWS, ...NEWS], []);
  const policyRows = useMemo(() => {
    const list = [...POLICIES];
    if (list.length < 4) {
      list.push({
        id: 9001,
        name: '《工业循环冷却水处理设计规范》局部修订（征求意见稿）',
        publisher: '住房城乡建设部',
        time: '2025-11-18',
        content:
          '修订稿强调开式与闭式循环冷却水系统的浓缩倍数控制、水质稳定与排污监测要求，鼓励与再生水、雨水等非常规水源联用，为冷却塔及旁滤设备选型提供统一设计依据。',
      });
    }
    return list.slice(0, 4);
  }, []);
  const demandRows = useMemo(() => DEMANDS.slice(0, 4), []);

  const peerFeed = useMemo(
    () => PRODUCTS.slice(0, 6).map((p) => ({ company: p.supplier, product: p.name })),
    []
  );

  const leads = useMemo(
    () => [
      { name: '苏州某化纤集团动力中心', industry: '纺织印染 · 循环冷却', region: '江苏 · 苏州' },
      { name: '江北新区数据中心运维部', industry: '信息传输 · 冷却系统', region: '江苏 · 南京' },
      { name: '浙西热电联产项目筹建处', industry: '电力热力 · 取排水', region: '浙江 · 衢州' },
    ],
    []
  );

  const marketRegionRows = useMemo(
    () => [
      '华东：38%–40%（最大市场，江苏 / 浙江 / 山东为主，化工 + 制造业集群）。',
      '华南：19%–25%（广东为主，数据中心 + 电子制造密集）。',
      '华北：18%–20%（京津冀 + 能源基地，火电 / 冶金集中）。',
      '西北：约13%（风光基地配套）。',
      '华中 / 西南：约10%（「东数西算」带动，数据中心 + 新能源产业园）。',
    ],
    []
  );

  const marketIndustryRows = useMemo(
    () => [
      '电力（火电 / 核电）：32%–45%（第一大应用，火电为主，占工业塔超 60%）。',
      '化工 / 石化：24%–25%（第二大，大型化工园区集中在华东）。',
      '冶金（钢铁 / 有色）：15%–16%（华北 / 西北为主，节能改造需求大）。',
      '数据中心：9%–12%（增速最快，年增 20%+，华东 / 华南集中）。',
      '民用 / 商业建筑：约8%（大型商超 / 写字楼，华东 / 华南为主）。',
      '其他（食品 / 造纸等）：约5%。',
    ],
    []
  );

  const applicableIndustriesTags = useMemo(
    () => ['电力', '钢铁', '化工', '数据中心', '民用', '其他'],
    []
  );

  const browseTabBtn = (tab: BrowseTab, label: string) => (
    <button
      type="button"
      onClick={() => setBrowseTab(tab)}
      className={cn(
        'rounded-lg px-3.5 py-2 text-xs font-black transition sm:text-[13px]',
        browseTab === tab
          ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-md shadow-teal-600/25'
          : 'text-gray-500 hover:bg-white/80 hover:text-teal-800'
      )}
    >
      {label}
    </button>
  );

  return (
    <div className="dashboard-tech-surface -m-4 rounded-xl p-4 sm:-m-6 sm:rounded-2xl sm:p-6 lg:-m-8 lg:p-8">
      {/* 页头 */}
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200/80 bg-teal-50 px-2.5 py-1 text-[10px] font-black text-teal-800">
              <Radio className="h-3 w-3" aria-hidden />
              <span className="dashboard-live-dot inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
              数据实时同步
            </span>
            <span className="text-[10px] font-bold text-gray-400">每日 06:00 更新</span>
          </div>
          <h2 className="mt-2 text-lg font-black text-gray-900 sm:text-xl">经营数据总览</h2>
          <p className="mt-1 max-w-2xl text-xs font-medium leading-relaxed text-gray-500">
            汇总平台展示、互动与商机线索，辅助销售与市场团队快速对齐重点。
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-teal-100 bg-white/90 px-3 py-2 shadow-sm">
          <BarChart3 className="h-4 w-4 text-teal-600" aria-hidden />
          <span className="text-[11px] font-black text-gray-700">AI 云 · 产业洞察</span>
        </div>
      </header>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
        {/* —— 左栏 —— */}
        <div className="min-w-0 space-y-5">
          {/* 企业抬头 */}
          <section className="dashboard-panel overflow-hidden rounded-2xl border border-teal-200/50 bg-gradient-to-br from-white via-teal-50/25 to-cyan-50/40 p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-teal-200/70 bg-white/90 text-teal-600 shadow-sm">
                    <Building2 className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="text-lg font-black leading-snug text-gray-900 sm:text-xl">{companyName}</h3>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-200/90 bg-amber-50/95 px-2.5 py-1 text-[11px] font-black text-amber-900">
                    <Award className="h-3.5 w-3.5" aria-hidden />
                    国家制造业单项冠军
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-teal-200/90 bg-teal-50/95 px-2.5 py-1 text-[11px] font-black text-teal-900">
                    <Sparkles className="h-3.5 w-3.5" aria-hidden />
                    江苏省高新技术企业
                  </span>
                </div>
                <p className="mt-4 text-xs font-medium leading-relaxed text-gray-600">
                  以下为平台根据贵司在节水产业 AI 云平台的展示与互动行为生成的经营态势摘要，可用于销售与市场团队快速对齐重点线索。
                </p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
              <KpiTile label="产品收藏" value={1286} tone="teal" />
              <KpiTile label="案例收藏" value={432} tone="cyan" />
              <KpiTile label="潜客线索" value={3} unit="条" tone="sky" />
              <KpiTile label="需求匹配" value={4} unit="项" tone="teal" />
            </div>
          </section>

          {/* 市场与适用对象 */}
          <DashboardPanel
            title="市场与适用对象"
            subtitle="冷却塔规模 · 区域 / 行业结构 · 服务对象"
            icon={PieChart}
            className="max-h-[min(38vh,420px)]"
            bodyClassName="flex min-h-0 flex-col"
          >
            <div
              ref={marketScrollRef}
              role="region"
              aria-label={
                marketAutoScroll ? '市场与适用对象详情（自动滚动，悬停可暂停）' : '市场与适用对象详情'
              }
              className={cn(
                'min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-y-contain p-4 sm:p-5',
                marketAutoScroll && '[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'
              )}
              style={marketAutoScroll ? { touchAction: 'none' } : undefined}
              onMouseEnter={() => {
                marketScrollPausedRef.current = true;
              }}
              onMouseLeave={() => {
                marketScrollPausedRef.current = false;
              }}
            >
              <div className="flex flex-col gap-2 rounded-xl border border-teal-100/90 bg-gradient-to-r from-teal-50/50 to-cyan-50/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 shrink-0 text-teal-600" aria-hidden />
                  <span className="text-sm font-black text-gray-800">适用对象</span>
                </div>
                <p className="text-right text-base font-black tabular-nums text-teal-700 sm:text-lg">
                  2000<span className="ml-1 text-sm font-black text-gray-900">家用水单位</span>
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-teal-100/80 bg-slate-50/50 p-3">
                  <h4 className="flex items-center gap-1.5 text-xs font-black text-teal-900">
                    <TrendingUp className="h-3.5 w-3.5" aria-hidden />
                    潜在市场
                  </h4>
                  <div className="mt-2 space-y-2 text-[11px] font-medium leading-relaxed text-gray-700">
                    <p className="rounded-lg bg-white/80 px-2.5 py-2 ring-1 ring-teal-100/60">
                      <span className="font-black text-teal-800">（1）</span> 全球市场约 120 亿美元，中国占比约 40%。
                    </p>
                    <p className="rounded-lg bg-white/80 px-2.5 py-2 ring-1 ring-teal-100/60">
                      <span className="font-black text-teal-800">（2）</span> 国内市场规模约 320 亿元人民币。
                    </p>
                  </div>
                </div>
                <div className="rounded-xl border border-cyan-100/80 bg-slate-50/50 p-3">
                  <h4 className="text-xs font-black text-cyan-900">适用行业</h4>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {applicableIndustriesTags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-cyan-200/80 bg-white px-2 py-0.5 text-[10px] font-black text-cyan-900"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-black text-gray-800">分区域占比</h4>
                <ul className="space-y-1.5">
                  {marketRegionRows.map((line, idx) => (
                    <li
                      key={`region-${idx}`}
                      className="rounded-lg border border-gray-100/90 bg-white/70 px-3 py-2 text-[11px] font-medium leading-relaxed text-gray-700"
                    >
                      {line}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-black text-gray-800">分行业占比</h4>
                <ul className="space-y-1.5">
                  {marketIndustryRows.map((line, i) => (
                    <li
                      key={`industry-${i}`}
                      className="rounded-lg border border-gray-100/90 bg-white/70 px-3 py-2 text-[11px] font-medium leading-relaxed text-gray-700"
                    >
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </DashboardPanel>

          {/* 产品 / 案例浏览 */}
          <DashboardPanel
            title="内容浏览数据"
            subtitle="产品与案例在平台的收藏与查看表现"
            icon={Eye}
            action={
              <button
                type="button"
                className="inline-flex items-center gap-0.5 text-xs font-black text-teal-700 hover:text-teal-900"
              >
                查看更多
                <ChevronRight className="h-3.5 w-3.5" aria-hidden />
              </button>
            }
          >
            <div className="border-b border-gray-100/90 px-4 py-3 sm:px-5">
              <div className="inline-flex gap-1 rounded-xl border border-gray-100 bg-gray-50/90 p-1">
                {browseTabBtn('product', '产品浏览')}
                {browseTabBtn('case', '案例浏览')}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 p-4 sm:gap-4 sm:p-5 lg:grid-cols-4">
              {browseTab === 'product'
                ? productRows.map((p) => (
                    <BrowseCard key={p.id} image={p.image} title={p.name} productId={p.id} impressionLabel="收藏" />
                  ))
                : caseRows.map((c) => (
                    <BrowseCard key={c.id} image={c.image} title={c.name} caseId={c.id} impressionLabel="收藏" />
                  ))}
            </div>
          </DashboardPanel>

          {/* 潜在客户 */}
          <DashboardPanel
            title="潜在客户分析"
            subtitle="高意向用水单位线索（演示）"
            icon={Users}
            action={
              <button
                type="button"
                className="inline-flex items-center gap-0.5 text-xs font-black text-teal-700 hover:text-teal-900"
              >
                查看更多
                <ChevronRight className="h-3.5 w-3.5" aria-hidden />
              </button>
            }
          >
            <div className="grid gap-3 p-4 sm:grid-cols-3 sm:gap-4 sm:p-5">
              {leads.map((row) => (
                <article
                  key={row.name}
                  className="flex flex-col rounded-xl border border-gray-100/90 bg-gradient-to-b from-white to-teal-50/20 p-4 shadow-sm transition hover:border-teal-200/80 hover:shadow-md"
                >
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-100/80 text-teal-700">
                      <Zap className="h-4 w-4" aria-hidden />
                    </span>
                    <p className="text-xs font-black leading-snug text-gray-900">{row.name}</p>
                  </div>
                  <dl className="mt-3 space-y-2 border-t border-gray-100/80 pt-3 text-[11px]">
                    <div>
                      <dt className="font-bold text-gray-400">所属行业</dt>
                      <dd className="mt-0.5 font-black text-gray-700">{row.industry}</dd>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-500/80" aria-hidden />
                      <div>
                        <dt className="font-bold text-gray-400">归属地</dt>
                        <dd className="mt-0.5 font-black text-gray-800">{row.region}</dd>
                      </div>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          </DashboardPanel>
        </div>

        {/* —— 右栏 —— */}
        <aside className="min-w-0 space-y-5 lg:sticky lg:top-0 lg:self-start">
          <DashboardPanel title="产业资讯与政策" subtitle="资讯速递 · 政策推送" icon={Newspaper}>
            <div className="grid divide-y divide-gray-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
              <div className="min-h-0 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="text-xs font-black text-gray-800">产业相关资讯</h4>
                  <Eye className="h-3.5 w-3.5 text-teal-500/70" aria-hidden />
                </div>
                <div className="relative max-h-[200px] overflow-hidden rounded-xl border border-teal-100/80 bg-teal-50/20">
                  <div className="scroll-text space-y-0">
                    {newsLoop.map((n, idx) => (
                      <div
                        key={`${n.id}-${idx}`}
                        className="border-b border-teal-100/50 px-3 py-2.5 last:border-b-0"
                      >
                        <p className="line-clamp-2 text-left text-[11px] font-bold leading-snug text-gray-800">
                          {n.title}
                        </p>
                        <p className="mt-1 text-[10px] font-medium text-teal-700/70">资讯速递</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h4 className="mb-2 flex items-center gap-1.5 text-xs font-black text-gray-800">
                  <FileText className="h-3.5 w-3.5 text-teal-600" aria-hidden />
                  相关政策推送
                </h4>
                <ul className="space-y-2">
                  {policyRows.map((pol) => (
                    <SidebarListItem key={pol.id} title={pol.name} meta={pol.publisher} accent="teal" />
                  ))}
                </ul>
              </div>
            </div>
          </DashboardPanel>

          <DashboardPanel title="同行业信息推送" subtitle="竞品与同类产品动态" icon={Building2}>
            <ul className="space-y-2 p-4 sm:p-5">
              {peerFeed.map((row, i) => (
                <SidebarListItem
                  key={`${row.company}-${row.product}-${i}`}
                  title={row.company}
                  meta={`产品：${row.product}`}
                  accent="cyan"
                />
              ))}
            </ul>
          </DashboardPanel>

          <DashboardPanel
            title="相关需求推送"
            subtitle="与贵司能力模型弱匹配以上"
            icon={LayoutGrid}
          >
            <ul className="space-y-2 p-4 sm:p-5">
              {demandRows.map((d) => (
                <SidebarListItem key={d.id} title={d.title} meta={`${d.scene} · ${d.time}`} accent="teal" />
              ))}
            </ul>
          </DashboardPanel>
        </aside>
      </div>
    </div>
  );
}
