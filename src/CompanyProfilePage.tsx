import React, { useMemo, useState } from 'react';
import {
  BarChart3,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Mail,
  MapPin,
  Phone,
  Search,
  Users,
} from 'lucide-react';
import { cn } from './lib/utils';
import type { ProductRecord } from './data';
import { ProductFavoriteButton } from './ProductFavoriteButton';
import { PRODUCTS } from './data';
import { getStarProductsForSupplier } from './workbenchProductsStore';
import type { ProductSupplyDetailPayload } from './ProductSupplyDetailPage';
import {
  demoSupplierContactPhone,
  maskContactPhone,
} from './portalContactDisplay';
import { getProductSupplyMetaForRecord } from './portalProductSupplyMeta';
import { getSupplierHonorTags } from './portalSupplierHonors';
import { SupplierHonorTags } from './SupplierHonorTags';
import {
  PORTAL_BACK_BUTTON,
  PORTAL_BACK_BUTTON_ICON,
  PORTAL_PAGE_CONTENT,
  PORTAL_PAGE_GRADIENT_BG,
  PORTAL_PANEL,
  PORTAL_PRIMARY_BUTTON,
  PORTAL_PRODUCT_CARD,
  PORTAL_TAG_PRIMARY,
} from './portalSurface';
import {
  awardsHonorLines,
  entityTypeDisplay,
  resolveCompanyProfileEnterpriseInfo,
  type CompanyProfileEnterpriseInfo,
} from './companyProfileEnterprise';

export type CompanyProfileModel = {
  companyName: string;
  /** 角标，如认证供方、节水服务 */
  badge: string;
  /** 首页摘要用行业短标签 */
  industry: string;
  overview: string;
  bannerImage: string;
  starProducts: ProductRecord[];
  /** 与入驻表单一致的企业档案（不含附件） */
  enterprise: CompanyProfileEnterpriseInfo;
};

const NAV = ['首页', '企业信息', '企业产品', '服务案例', '联系我们'] as const;

function SectionTitle({
  title,
  right,
}: {
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-start justify-between gap-3 border-b border-teal-100/80 pb-2">
      <div className="flex min-w-0 items-center gap-2 border-l-4 border-teal-600 pl-3">
        <h2 className="text-base font-black text-teal-800">{title}</h2>
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}

function InfoTableRow({ label, value }: { label: string; value: React.ReactNode }) {
  const empty = value === '' || value == null;
  return (
    <div className="flex flex-col border-b border-gray-200 last:border-b-0 sm:flex-row">
      <div className="shrink-0 border-gray-200 bg-teal-50/50 px-3 py-2.5 text-xs font-black text-teal-900/80 sm:w-40 sm:border-r">
        {label}
      </div>
      <div className="min-w-0 flex-1 bg-white px-3 py-2.5 text-sm font-medium leading-relaxed text-gray-900">
        {empty ? <span className="text-gray-300">—</span> : value}
      </div>
    </div>
  );
}

function OverviewGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-gray-200 first:border-t-0">
      <div className="border-b border-gray-200 bg-teal-50/40 px-3 py-2 text-xs font-black text-teal-900">{title}</div>
      {children}
    </div>
  );
}

function EnterpriseOverviewTable({
  ent,
  scopeExpanded,
  onToggleScope,
  honorTags,
}: {
  ent: CompanyProfileEnterpriseInfo;
  scopeExpanded: boolean;
  onToggleScope: () => void;
  honorTags: string[];
}) {
  const auditHint =
    ent.auditStatus === '已通过' ? (
      <span className="text-xs font-black text-red-500">信息已审核</span>
    ) : (
      <span className="text-xs font-black text-amber-700">审核状态：{ent.auditStatus || '—'}</span>
    );

  return (
    <>
      <SectionTitle title="企业概览" right={auditHint} />
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <OverviewGroup title="主体身份信息">
          <InfoTableRow label="用户身份" value={ent.userIdentity} />
          <InfoTableRow label="统一社会信用代码" value={ent.creditCode} />
          <InfoTableRow label="用户名称" value={ent.name} />
          <InfoTableRow label="所属区域" value={ent.region} />
          <InfoTableRow label="注册地址" value={ent.regAddress} />
          <InfoTableRow label="实际地址" value={ent.actAddress} />
          <InfoTableRow label="企业简介" value={ent.enterpriseIntro} />
        </OverviewGroup>
        <OverviewGroup title="联系人信息">
          <InfoTableRow label="联系人姓名" value={ent.contactName} />
          <InfoTableRow label="联系电话" value={ent.contactPhone} />
          <InfoTableRow label="联系邮箱" value={ent.email} />
        </OverviewGroup>
        <OverviewGroup title="用户类型">
          <InfoTableRow label="用户类型" value={entityTypeDisplay(ent)} />
        </OverviewGroup>
        <OverviewGroup title="所属行业">
          <InfoTableRow label="门类" value={ent.industryL1Label} />
          <InfoTableRow label="大类" value={ent.industryL2Label} />
          <InfoTableRow label="中类" value={ent.industryL3Label} />
          <InfoTableRow label="小类" value={ent.industryL4Label} />
        </OverviewGroup>
        <OverviewGroup title="经营信息">
          <div className="flex flex-col border-b border-gray-200 sm:flex-row">
            <div className="shrink-0 border-gray-200 bg-teal-50/50 px-3 py-2.5 text-xs font-black text-teal-900/80 sm:w-40 sm:border-r">
              经营范围
            </div>
            <div className="min-w-0 flex-1 bg-white px-3 py-2.5 text-sm font-medium leading-relaxed text-gray-800">
              {ent.scope ? (
                <>
                  <p className={cn(!scopeExpanded && 'line-clamp-3')}>{ent.scope}</p>
                  <button
                    type="button"
                    onClick={onToggleScope}
                    className="mt-1 text-sm font-black text-teal-600 hover:underline"
                  >
                    {scopeExpanded ? '收起' : '展开全部'}
                  </button>
                </>
              ) : (
                <span className="text-gray-300">—</span>
              )}
            </div>
          </div>
          <InfoTableRow label="服务范围、业务范围" value={ent.serviceScope} />
          <InfoTableRow label="核心产品或方案" value={ent.coreProducts} />
          <InfoTableRow label="是否规上企业" value={ent.isAboveSize} />
          <InfoTableRow label="企业规模" value={ent.enterpriseScale} />
          <InfoTableRow label="是否高新技术企业" value={ent.isHighTechEnterprise} />
          <InfoTableRow label="是否专精特新小巨人" value={ent.isSpecializedLittleGiant} />
        </OverviewGroup>
        <OverviewGroup title="荣誉资质">
          <InfoTableRow
            label="已获奖项/主要荣誉"
            value={honorTags.length > 0 ? <SupplierHonorTags tags={honorTags} /> : ent.awardsAndHonors || '—'}
          />
        </OverviewGroup>
      </div>
    </>
  );
}

function NineDots() {
  return (
    <span className="inline-grid grid-cols-3 gap-0.5 p-1" aria-hidden>
      {Array.from({ length: 9 }).map((_, i) => (
        <span key={i} className="h-1 w-1 rounded-full bg-teal-500/80" />
      ))}
    </span>
  );
}

/** 由企业名生成稳定伪数据，避免每刷一遍都变 */
function pickStableFromName(name: string, options: string[]): string {
  if (options.length === 0) return '';
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return options[h % options.length]!;
}

type ServiceCaseItem = {
  title: string;
  field: string;
  region: string;
  year: string;
  summary: string;
};

const SERVICE_CASE_POOL: ServiceCaseItem[] = [
  {
    title: '工业园区合同节水改造项目',
    field: '工业节水',
    region: '江苏南京',
    year: '2024',
    summary: '采用合同节水托管模式，建设智慧节水监测与管网漏损控制系统，年节水率约 26%。',
  },
  {
    title: '高校校区非常规水源利用工程',
    field: '城镇生活节水',
    region: '江苏常州',
    year: '2023',
    summary: '建设雨水收集与绿化浇灌系统，配套水平衡测试与用水定额管理，人均用水量显著下降。',
  },
  {
    title: '冷却塔循环水系统节能改造',
    field: '工业节水',
    region: '辽宁大连',
    year: '2024',
    summary: '更换高效冷却塔及变频控制系统，实现循环水系统综合能耗与补水量双降。',
  },
  {
    title: '水平衡测试与节水诊断服务',
    field: '通用节水',
    region: '广西南宁',
    year: '2023',
    summary: '完成全厂用水系统测试与漏损排查，形成节水改造清单并协助申报节水载体。',
  },
];

function pickServiceCases(companyName: string, count = 3): ServiceCaseItem[] {
  let h = 0;
  for (let i = 0; i < companyName.length; i++) h = (h * 31 + companyName.charCodeAt(i)) >>> 0;
  const out: ServiceCaseItem[] = [];
  for (let i = 0; i < count; i++) {
    out.push(SERVICE_CASE_POOL[(h + i * 3) % SERVICE_CASE_POOL.length]!);
  }
  return out;
}

/** 企业产品网格：靠后的卡片展示平台标签（对齐参考页样式） */
function tagsForProductGrid(total: number, index: number): readonly string[] | undefined {
  if (total < 3) return undefined;
  if (index === total - 1 || index === total - 2) return ['龙头企业', '企业技术中心'] as const;
  if (index === total - 3) return ['龙头企业'] as const;
  return undefined;
}

function EnterpriseProductCard({
  product,
  tags,
  showFavorite,
  onViewDetail,
}: {
  product: ProductRecord;
  tags?: readonly string[];
  showFavorite?: boolean;
  onViewDetail?: () => void;
}) {
  return (
    <article className={cn('flex h-full flex-col overflow-hidden', PORTAL_PRODUCT_CARD)}>
      <div className="relative flex aspect-square items-center justify-center bg-white p-2 sm:p-3">
        {showFavorite ? <ProductFavoriteButton productId={product.id} /> : null}
        <img
          src={product.image}
          alt=""
          className="max-h-full max-w-full object-contain"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="flex min-h-0 flex-1 flex-col border-t border-gray-100 px-2 pb-2.5 pt-2 sm:px-3">
        <h3 className="line-clamp-2 text-left text-xs font-bold leading-snug text-gray-900 sm:text-sm">{product.name}</h3>
        {tags && tags.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <span
                key={t}
                className={cn(
                  'rounded border px-1.5 py-0.5 text-[10px] font-black leading-none',
                  t === '龙头企业' && 'border-orange-500 text-orange-600',
                  t === '企业技术中心' && 'border-teal-500 text-teal-700'
                )}
              >
                {t}
              </span>
            ))}
          </div>
        ) : null}
        <button
          type="button"
          onClick={onViewDetail}
          className="mt-auto w-full rounded-lg border border-teal-200 bg-white py-1.5 text-[11px] font-black text-teal-700 shadow-sm transition hover:border-teal-400 hover:bg-teal-50 sm:py-2 sm:text-xs"
        >
          查看详情
        </button>
      </div>
    </article>
  );
}

export function CompanyProfilePage({
  model,
  onBack,
  onSelectProduct,
  showProductFavorite = false,
  revealContactPhone = false,
}: {
  model: CompanyProfileModel;
  onBack: () => void;
  /** 企业产品 Tab：进入供应详情 */
  onSelectProduct?: (product: ProductRecord) => void;
  /** 样式4：企业主页产品卡片收藏 */
  showProductFavorite?: boolean;
  /** 我的消息已确认联系后，展示完整供方电话 */
  revealContactPhone?: boolean;
}) {
  const [navIdx, setNavIdx] = useState(0);
  const [starPage, setStarPage] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [introExpanded, setIntroExpanded] = useState(false);
  const [scopeExpanded, setScopeExpanded] = useState(false);

  const ent = model.enterprise;
  const contactPerson = ent.contactName;
  const addressLine = ent.actAddress || ent.regAddress;
  const longIntro =
    ent.enterpriseIntro ||
    [ent.serviceScope, ent.coreProducts, model.overview].filter(Boolean).join('\n\n');

  const pages = useMemo(() => {
    const list = model.starProducts.length ? model.starProducts : [];
    if (list.length === 0) return [];
    const chunk = 1;
    const out: ProductRecord[][] = [];
    for (let i = 0; i < list.length; i += chunk) {
      out.push(list.slice(i, i + chunk));
    }
    return out.length ? out : [[list[0]!]];
  }, [model.starProducts]);

  const totalStarPages = Math.max(1, pages.length);
  const safePage = Math.min(starPage, totalStarPages - 1);
  const currentStar = pages[safePage]?.[0];
  const starApplicationField = currentStar
    ? getProductSupplyMetaForRecord(currentStar).applicationField ||
      currentStar.scenario ||
      model.industry
    : '';

  /** 当前企业名下全部产品（供方主页「企业产品」）；无同名供方时用明星产品兜底 */
  const companyProductList = useMemo(() => {
    const same = PRODUCTS.filter((p) => p.supplier === model.companyName);
    if (same.length > 0) return same;
    return model.starProducts;
  }, [model.companyName, model.starProducts]);

  const honorTags = useMemo(() => {
    const fromForm = awardsHonorLines(ent);
    const flags: string[] = [];
    if (ent.isHighTechEnterprise === '是') flags.push('高新技术企业');
    if (ent.isSpecializedLittleGiant === '是') flags.push('专精特新小巨人');
    const portal = getSupplierHonorTags(model.companyName, 6);
    return [...new Set([...fromForm, ...flags, ...portal])].slice(0, 8);
  }, [ent, model.companyName]);
  const serviceCases = useMemo(() => pickServiceCases(model.companyName, 3), [model.companyName]);
  const contactPhoneRaw = ent.contactPhone || demoSupplierContactPhone(model.companyName);
  const contactPhoneDisplay = revealContactPhone ? contactPhoneRaw : maskContactPhone(contactPhoneRaw);
  const contactEmail = ent.email;
  const industrySummary =
    ent.industryL4Label || ent.industryL3Label || ent.industryL2Label || ent.industryL1Label || model.industry;
  const entityTypeLine = entityTypeDisplay(ent);

  return (
    <div className={cn(PORTAL_PAGE_GRADIENT_BG, 'pb-12')}>
      {/* 顶栏 */}
      <header className="border-b border-gray-200/90 bg-white/95 shadow-sm backdrop-blur-md">
        <div className={cn(PORTAL_PAGE_CONTENT, 'flex flex-wrap items-center justify-between gap-3 py-3')}>
          <button type="button" onClick={onBack} className={PORTAL_BACK_BUTTON}>
            <span className={PORTAL_BACK_BUTTON_ICON}>
              <ChevronLeft className="h-4 w-4" aria-hidden />
            </span>
            <span className="hidden sm:inline">返回</span>
          </button>
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="text-[10px] font-bold text-teal-700/90 sm:text-xs">节水产业AI云平台 · 供方主页</p>
            <p className="truncate text-sm font-black text-gray-900 sm:text-base">企业信息与产品展示</p>
          </div>
        </div>

        {/* 企业标题行 + 搜索 */}
        <div className="border-t border-teal-100/60 bg-gradient-to-r from-white via-teal-50/20 to-white">
          <div className={cn(PORTAL_PAGE_CONTENT, 'flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:py-5')}>
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-teal-100 bg-gradient-to-br from-teal-50 to-cyan-50 text-xl font-black text-teal-700 shadow-sm">
                {model.companyName.slice(0, 1)}
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-black leading-snug text-gray-900 sm:text-xl">{model.companyName}</h1>
                <span className={cn('mt-1 inline-block', PORTAL_TAG_PRIMARY)}>#{model.badge}</span>
                {honorTags.length > 0 ? (
                  <SupplierHonorTags tags={honorTags.slice(0, 3)} size="compact" className="mt-2" />
                ) : null}
              </div>
            </div>
            <div className="flex w-full max-w-md items-center gap-2 sm:w-auto">
              <span className="hidden shrink-0 rounded-lg border border-teal-100 bg-teal-50/80 px-2 py-1.5 text-[10px] font-black text-teal-800 sm:inline">
                全站搜索
              </span>
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-teal-400/80" />
                <input
                  type="search"
                  readOnly
                  placeholder="请输入产品名称"
                  className="h-9 w-full rounded-xl border border-gray-200/90 bg-white py-1.5 pl-9 pr-2 text-xs font-medium text-gray-700 shadow-sm shadow-teal-900/5 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/40"
                />
              </div>
              <button type="button" className={cn(PORTAL_PRIMARY_BUTTON, 'shrink-0 px-4 py-2 text-xs')}>
                搜索
              </button>
            </div>
          </div>
        </div>

        {/* 主导航 */}
        <nav
          className="bg-gradient-to-r from-teal-700 via-teal-600 to-cyan-700 shadow-inner shadow-teal-900/10"
          aria-label="企业主导航"
        >
          <div className={cn(PORTAL_PAGE_CONTENT, 'flex flex-wrap px-0')}>
            {NAV.map((label, i) => (
              <button
                key={label}
                type="button"
                onClick={() => setNavIdx(i)}
                className={cn(
                  'border-b-2 px-3 py-3 text-xs font-black transition sm:px-5 sm:text-sm',
                  navIdx === i
                    ? 'border-white bg-teal-950/40 text-white shadow-inner'
                    : 'border-transparent text-teal-50/95 hover:bg-white/10 hover:text-white'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </nav>
      </header>

      {/* Banner：仅「首页」展示 */}
      {navIdx === 0 ? (
        <div className={cn(PORTAL_PAGE_CONTENT, 'pt-4 sm:pt-5')}>
          <div className="relative h-36 overflow-hidden rounded-2xl border border-teal-100/90 shadow-sm shadow-teal-900/5 sm:h-48 md:h-56">
            <img
              src={model.bannerImage}
              alt=""
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
          </div>
        </div>
      ) : null}

      {navIdx === 1 ? (
        <div className={cn(PORTAL_PAGE_CONTENT, 'space-y-5 py-5 sm:py-6')}>
          {/* 企业概览：字段与产业主体入驻表单一致（不含附件） */}
          <section className={cn(PORTAL_PANEL, 'overflow-hidden p-5 sm:p-6')}>
            <EnterpriseOverviewTable
              ent={ent}
              scopeExpanded={scopeExpanded}
              onToggleScope={() => setScopeExpanded((e) => !e)}
              honorTags={honorTags}
            />
          </section>

          {/* 企业介绍 */}
          <section className={cn(PORTAL_PANEL, 'overflow-hidden p-5 sm:p-6')}>
            <SectionTitle title="企业介绍" />
            <p className={cn('text-sm font-medium leading-relaxed text-gray-800', !introExpanded && 'line-clamp-4')}>
              {longIntro}
            </p>
            <button
              type="button"
              onClick={() => setIntroExpanded((e) => !e)}
              className="mt-2 text-sm font-black text-teal-600 hover:underline"
            >
              {introExpanded ? '收起' : '展开全部'}
            </button>
          </section>

          {/* 核心技术 */}
          <section className={cn(PORTAL_PANEL, 'overflow-hidden p-5 sm:p-6')}>
            <SectionTitle title="核心技术" />
            <p className="text-sm font-medium leading-relaxed text-gray-500">
              围绕{model.industry}方向，企业持续投入研发与工艺改进；具体专利与工艺包可在对接后向平台申请脱敏查阅。
            </p>
          </section>

          {/* 荣誉认证 */}
          <section className={cn(PORTAL_PANEL, 'relative overflow-hidden p-5 sm:p-6')}>
            <SectionTitle title="荣誉认证" right={<NineDots />} />
            {honorTags.length > 0 ? (
              <SupplierHonorTags tags={honorTags} className="mt-1" />
            ) : (
              <p className="text-sm text-gray-400">认证与奖项材料已提交平台审核，可在平台查阅电子证照与荣誉清单。</p>
            )}
          </section>
        </div>
      ) : null}

      {navIdx === 2 ? (
        <div className={cn(PORTAL_PAGE_CONTENT, 'pb-10 pt-6')}>
            {companyProductList.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 xl:gap-5">
                  {companyProductList.map((p, idx) => (
                    <div key={p.id} className="h-full">
                      <EnterpriseProductCard
                        product={p}
                        tags={tagsForProductGrid(companyProductList.length, idx)}
                        showFavorite={showProductFavorite}
                        onViewDetail={onSelectProduct ? () => onSelectProduct(p) : undefined}
                      />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="rounded-xl border border-dashed border-gray-200 bg-white py-16 text-center text-sm font-bold text-gray-500">
                暂无企业产品展示
              </p>
            )}
        </div>
      ) : null}

      {navIdx === 3 ? (
        <div className={cn(PORTAL_PAGE_CONTENT, 'space-y-4 py-6')}>
          {serviceCases.map((item) => (
            <article key={`${item.title}-${item.year}`} className={cn(PORTAL_PANEL, 'p-5 sm:p-6')}>
              <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                <h3 className="text-base font-black text-gray-900">{item.title}</h3>
                <span className={PORTAL_TAG_PRIMARY}>{item.year}</span>
              </div>
              <div className="mb-2 flex flex-wrap gap-2 text-xs font-bold text-gray-500">
                <span>应用领域：{item.field}</span>
                <span className="text-gray-300">|</span>
                <span>项目地区：{item.region}</span>
              </div>
              <p className="text-sm font-medium leading-relaxed text-gray-700">{item.summary}</p>
            </article>
          ))}
        </div>
      ) : null}

      {navIdx === 4 ? (
        <div className={cn(PORTAL_PAGE_CONTENT, 'py-6')}>
          <section className={cn(PORTAL_PANEL, 'p-5 sm:p-6')}>
            <SectionTitle title="联系我们" />
            <dl className="mt-4 space-y-4">
              <div className="flex items-start gap-3 rounded-xl border border-teal-100/80 bg-teal-50/35 p-4">
                <Users className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" aria-hidden />
                <div>
                  <dt className="text-xs font-bold text-gray-500">联系人</dt>
                  <dd className="mt-0.5 text-sm font-black text-gray-900">{contactPerson}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-teal-100/80 bg-teal-50/35 p-4">
                <Phone className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" aria-hidden />
                <div>
                  <dt className="text-xs font-bold text-gray-500">联系电话</dt>
                  <dd
                    className="mt-0.5 text-sm font-black tabular-nums tracking-wide text-gray-900"
                    aria-label={revealContactPhone ? '联系电话' : '联系电话已脱敏'}
                  >
                    {contactPhoneDisplay}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-teal-100/80 bg-teal-50/35 p-4">
                <Mail className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" aria-hidden />
                <div>
                  <dt className="text-xs font-bold text-gray-500">电子邮箱</dt>
                  <dd className="mt-0.5 text-sm font-black text-gray-900">{contactEmail}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-teal-100/80 bg-teal-50/35 p-4">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" aria-hidden />
                <div>
                  <dt className="text-xs font-bold text-gray-500">企业地址</dt>
                  <dd className="mt-0.5 text-sm font-medium leading-relaxed text-gray-800">{addressLine}</dd>
                </div>
              </div>
            </dl>
            <button type="button" className={cn(PORTAL_PRIMARY_BUTTON, 'mt-6')}>
              <Phone className="h-4 w-4" aria-hidden />
              联系我们
            </button>
          </section>
        </div>
      ) : null}

      {navIdx === 0 ? (
      <div className={cn(PORTAL_PAGE_CONTENT, 'mt-5 space-y-5')}>
        {/* 企业概况 */}
        <section className={cn(PORTAL_PANEL, 'relative overflow-hidden p-5 sm:p-6')}>
          <div className="mb-4 flex items-center gap-2 border-l-4 border-teal-600 pl-3">
            <h2 className="text-base font-black text-gray-900">企业概况</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50/80 p-3">
              <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" aria-hidden />
              <div>
                <p className="text-[11px] font-bold text-gray-500">所属行业</p>
                <p className="mt-0.5 text-sm font-black text-gray-900">{industrySummary}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50/80 p-3">
              <Users className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" aria-hidden />
              <div>
                <p className="text-[11px] font-bold text-gray-500">用户类型</p>
                <p className="mt-0.5 text-sm font-black text-gray-900">{entityTypeLine}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50/80 p-3">
              <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" aria-hidden />
              <div>
                <p className="text-[11px] font-bold text-gray-500">企业规模</p>
                <p className="mt-0.5 text-sm font-black text-gray-900">{ent.enterpriseScale || '—'}</p>
              </div>
            </div>
          </div>
          <p
            className={cn(
              'mt-4 text-sm font-medium leading-relaxed text-gray-700',
              !expanded && 'line-clamp-4'
            )}
          >
            {model.overview}
          </p>
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              className="rounded-lg border border-teal-500 px-6 py-2 text-sm font-black text-teal-600 transition hover:bg-teal-50"
            >
              {expanded ? '收起' : '查看更多'}
            </button>
          </div>
          <BarChart3
            className="pointer-events-none absolute bottom-3 right-3 h-10 w-10 text-teal-100/80"
            strokeWidth={1.25}
            aria-hidden
          />
        </section>

        {/* 明星产品 */}
        <section className={cn(PORTAL_PANEL, 'relative overflow-hidden p-5 sm:p-6')}>
          <div className="mb-4 flex items-center gap-2 border-l-4 border-teal-600 pl-3">
            <h2 className="text-base font-black text-gray-900">明星产品</h2>
          </div>
          {currentStar ? (
            <div className="flex flex-col gap-4 md:flex-row md:items-stretch">
              <div className="relative w-full shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50 md:w-72 md:max-w-[40%]">
                {showProductFavorite ? <ProductFavoriteButton productId={currentStar.id} /> : null}
                <img
                  src={currentStar.image}
                  alt=""
                  className="aspect-[4/3] h-full w-full object-cover md:aspect-auto md:min-h-[200px]"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-center">
                <h3 className="text-lg font-black text-gray-900">{currentStar.name}</h3>
                <dl className="mt-3 space-y-2 text-sm">
                  <div>
                    <dt className="font-bold text-gray-500">应用领域</dt>
                    <dd className="font-black text-gray-900">{starApplicationField}</dd>
                  </div>
                </dl>
                <button type="button" className={cn(PORTAL_PRIMARY_BUTTON, 'mt-5 w-fit')}>
                  查看详情
                </button>
              </div>
            </div>
          ) : (
            <p className="py-8 text-center text-sm font-bold text-gray-500">暂无明星产品展示</p>
          )}

          {totalStarPages > 1 ? (
            <div className="mt-6 flex items-center justify-center gap-4">
              <button
                type="button"
                disabled={safePage <= 0}
                onClick={() => setStarPage((p) => Math.max(0, p - 1))}
                className="rounded-lg border border-gray-200 p-2 text-gray-600 transition enabled:hover:border-teal-300 enabled:hover:text-teal-700 disabled:opacity-40"
                aria-label="上一页"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-sm font-black tabular-nums text-gray-700">
                {safePage + 1} / {totalStarPages}
              </span>
              <button
                type="button"
                disabled={safePage >= totalStarPages - 1}
                onClick={() => setStarPage((p) => Math.min(totalStarPages - 1, p + 1))}
                className="rounded-lg border border-gray-200 p-2 text-gray-600 transition enabled:hover:border-teal-300 enabled:hover:text-teal-700 disabled:opacity-40"
                aria-label="下一页"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          ) : null}

          <BarChart3
            className="pointer-events-none absolute bottom-3 right-3 h-10 w-10 text-teal-100/80"
            strokeWidth={1.25}
            aria-hidden
          />
        </section>
      </div>
      ) : null}
    </div>
  );
}

const COMPANY_BANNER =
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1400';

export function buildCompanyProfileModel(p: ProductSupplyDetailPayload): CompanyProfileModel {
  if (p.kind === 'product') {
    const { product } = p;
    const supplier = product.supplier;
    const stars = getStarProductsForSupplier(supplier);
    const overview = `${supplier} 为节水产业服务平台认证供方，长期深耕「${product.category}」领域，面向用水单位、园区与工程客户提供设备、方案与运维一体化服务。${product.info}`;
    return {
      companyName: supplier,
      badge: '认证节水供方',
      industry: product.category,
      overview,
      bannerImage: COMPANY_BANNER,
      starProducts: stars,
      enterprise: resolveCompanyProfileEnterpriseInfo(supplier, product.category, overview),
    };
  }
  const { service } = p;
  const starsFromWorkbench = getStarProductsForSupplier(service.entityName);
  const idx = service.id % Math.max(PRODUCTS.length, 1);
  const filler =
    starsFromWorkbench.length > 0 ? starsFromWorkbench : PRODUCTS.slice(idx, idx + 4);
  const overviewText =
    service.content.length > 0
      ? service.content.slice(0, 480) + (service.content.length > 480 ? '…' : '')
      : `${service.entityName} 提供「${service.serviceName}」等专业节水服务，覆盖${service.applicationField}等场景。`;
  return {
    companyName: service.entityName,
    badge: '节水服务企业',
    industry: service.serviceType,
    overview: overviewText,
    bannerImage: COMPANY_BANNER,
    starProducts: filler.length > 0 ? filler : PRODUCTS.slice(0, Math.min(2, PRODUCTS.length)),
    enterprise: resolveCompanyProfileEnterpriseInfo(
      service.entityName,
      service.serviceType,
      overviewText
    ),
  };
}
