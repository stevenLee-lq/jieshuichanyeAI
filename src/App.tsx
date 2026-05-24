import React, { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Search,
  User,
  Menu,
  ChevronRight,
  ChevronDown,
  Activity,
  Zap,
  FileText,
  Droplets,
  MessageSquare,
  TrendingUp,
  HelpCircle,
  Globe,
  Filter,
  X,
  Check,
  Calendar,
  Plus,
  LayoutDashboard,
  Home,
  ShieldCheck,
  Package,
  ListTodo,
  Heart,
  History,
  UserCheck,
  MapPin,
  Phone,
  Building2,
  Headset,
  LogOut,
  Trash2,
  Image,
  Paperclip,
  Send,
  SquarePen,
  RefreshCw,
  Volume2,
  VolumeX,
  Mic,
  Sparkles,
  ThumbsUp,
  Handshake,
  AlertCircle,
  Boxes,
  Store,
  ClipboardList,
  Shield,
  Layers,
  Settings,
  Database,
  Link2,
  Newspaper,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import {
  CATEGORIES_HIERARCHY,
  CATEGORIES_INDUSTRY_STYLE4_FLAT,
  HOME_HERO_PRODUCT_TILES,
  PRODUCTS,
  buildSupplyMarketFilterFromHeroTile,
  buildSupplyMarketFilterFromHomeKeyword,
  buildSupplyMarketFilterFromStyle4RowId,
  getIndustryStyle4FlatRowById,
  getProductsForHeroTile,
  type HomeHeroProductTile,
  type IndustryStyle4FlatRow,
  type WaterSavingCategoryHierarchyEntry,
  HOME_ADVANCED_CASE_TILES,
  HOME_DEMAND_ROTATION_BATCHES,
  HOME_CASES_DEMANDS_ROTATION_SYNC_LENGTH,
  HOME_ADVANCED_CASE_AUTO_ANIM_MS,
  HOME_DEMAND_ROTATION_MS,
  PORTAL_CASES_HOME_FEATURED,
  homeAdvancedCaseTileIdToPortalCaseId,
  DEMANDS,
  HOME_KIRIN_STATS,
  HOME_KIRIN_STYLE3_FALLBACK_GUIDES,
  NEWS,
  HOME_WATER_EFFICIENCY_POLICY_ITEMS,
  HOME_INDUSTRY_POLICY_SCROLL_ITEMS,
  getHomePolicyNoticeDetail,
  homeDemandTypeTagLabel,
  POLICIES,
  STANDARDS,
  type TechCase,
  type HomeWaterEfficiencyPolicyListingItem,
  type HomePolicyNoticeDetail,
} from './data';
import { HOME_SERVICE_RECOMMENDATIONS, type HomeServiceRecommendation } from './homeServiceRecommendations';
import { SupplyDemandResultsPage } from './SupplyDemandResultsPage';
import { SupplyDemandOutcomeDetailPage } from './SupplyDemandOutcomeDetailPage';
import { getPortalDemandById } from './portalDemandStore';
import { getWaterSavingDiagnosis } from './services/aiService';
import { ProductCatalogPage } from './ProductCatalogPage';
import { CompanyProfilePage, buildCompanyProfileModel, type CompanyProfileModel } from './CompanyProfilePage';
import {
  ProductSupplyDetailPage,
  supplyPayloadSupplierName,
  type ProductSupplyDetailPayload,
} from './ProductSupplyDetailPage';
import { MyMessagesPage } from './MyMessagesPage';
import {
  recordDemandContact,
  canRevealSupplierContactForMessage,
  resolveProductPayloadFromMessage,
  type PortalContactMessage,
} from './portalContactMessagesStore';
import { ProductFavoriteButton } from './ProductFavoriteButton';
import { DataOverviewDashboard } from './DataOverviewDashboard';
import { SystemAdminDashboard } from './SystemAdminDashboard';
import {
  DemandMarketPage,
  SUPPLY_MARKET_WATER_SAVING_FILTER_EMPTY,
  type SupplyMarketWaterSavingFilter,
} from './DemandMarketPage';
import { OneClickRegisterWizard } from './OneClickRegisterWizard';
import {
  clearPortalDemoAccount,
  demoAccountDisplayName,
  isDemoSessionLoggedIn,
  mergePortalDemoAccount,
  readPortalDemoAccount,
  setDemoSessionLoggedIn,
  writePortalDemoAccount,
  type PortalDemoAccount,
} from './portalDemoAccount';
import {
  readPortalAccess,
  writePortalAccess,
  clearPortalAccess,
  isPortalViewUnlocked,
  accessDeniedVariant,
  type PortalAccessState,
} from './portalAccessState';
import { getWaterUserLoginGate } from './waterUserEnterpriseRegistration';
import {
  type PortalUserIdentity,
  type PortalStyle4ToolbarRole,
  readStoredPortalUserIdentity,
  persistPortalUserIdentity,
  portalIdentityToAuthRole,
  toStyle4ToolbarRole,
  isPortalIndustryLikeUser,
  getWorkbenchDefaultMenuTab,
  PORTAL_STYLE4_TOOLBAR_ROLES,
} from './portalUserIdentity';
import { EnterpriseAuthForm } from './EnterpriseAuthForm';
import { WorkbenchProductAdminPanel } from './WorkbenchProductAdminPanel';
import { WorkbenchEnterpriseAdminListPanel } from './WorkbenchEnterpriseAdminListPanel';
import { WorkbenchEnterpriseAdminPanel } from './WorkbenchEnterpriseAdminPanel';
import { WorkbenchCasesAdminPanel } from './WorkbenchCasesAdminPanel';
import { WorkbenchIndustryCategoryParamPanel } from './WorkbenchIndustryCategoryParamPanel';
import { WorkbenchHomeAdminPanel } from './WorkbenchHomeAdminPanel';
import { WorkbenchDemandCenterPanel } from './WorkbenchDemandCenterPanel';
import { WorkbenchMyMessagesPanel } from './WorkbenchMyMessagesPanel';
import { WorkbenchMyFavoritesPanel } from './WorkbenchMyFavoritesPanel';
import { CaseCardFavoriteOverlay, CaseFavoriteButton } from './CaseFavoriteButton';
import { WorkbenchPolicyTechPanel } from './WorkbenchPolicyTechPanel';
import { WorkbenchMyApplicationsPanel } from './WorkbenchMyApplicationsPanel';
import { WorkbenchMyReviewsPanel } from './WorkbenchMyReviewsPanel';
import { WorkbenchQuotaProductLibraryPanel } from './WorkbenchQuotaProductLibraryPanel';
import { WorkbenchEquipmentMappingPanel } from './WorkbenchEquipmentMappingPanel';
import { WorkbenchNewsAdminPanel } from './WorkbenchNewsAdminPanel';
import { usePortalPolicyOnlyRecords, usePortalTechOnlyRecords } from './portalPolicyTechStore';
import {
  HomeStyle4SupplyDemandCards,
  HomeStyle4DemandsSection,
  HomeStyle4CasesSection,
  HomeStyle4TechPanels,
} from './portalHomeStyle4';
import { usePortalEnabledNewsRecords } from './portalNewsStore';
import { richTextExcerpt } from './workbenchRichText';
import {
  PortalPolicyInfoDetailPage,
  type PolicyInfoDetailKind,
} from './PortalPolicyInfoDetailPage';
import {
  WORKBENCH_DEMO_APPLICATIONS,
  WORKBENCH_WATER_USER_DEMO_APPLICATIONS,
  workbenchApplicationsForIdentity,
  type WorkbenchApplicationRow,
} from './workbenchApplications';

type AppView =
  | 'home'
  /** 主导航：市场与商机数据总览（公开浏览） */
  | 'opportunity-overview'
  | 'policy'
  /** 首页水效扶持等入口：单条政策公文详情（与产业资讯列表区分） */
  | 'policy-detail'
  /** 产业资讯：新闻 / 政策公开 / 技术标准单条详情 */
  | 'policy-info-detail'
  /** 云上展厅（主导航） */
  | 'cloud-exhibition'
  | 'about-placeholder'
  /** 首页热门入口：同类目/关键词商品列表（京东式列表） */
  | 'product-catalog'
  /** 首页产品推荐 / 服务推荐：供应详情（B2B 详情布局） */
  | 'product-detail'
  /** 进入主页：供方企业信息页 */
  | 'company-profile'
  | 'forum-supply'
  | 'forum-demand'
  | 'cases'
  | 'industry-login'
  | 'industry-dashboard'
  /** 顶栏「企业入驻」：企业认证资料整页（与工作台「用户认证」表单同源） */
  | 'enterprise-settle'
  /** 样式 3：顶栏统计点击进入 */
  | 'supply-results'
  /** 供需对接详情（从需求中心或已达成的供需对接列表进入） */
  | 'supply-outcome-detail'
  /** 样式 3：我的消息（占位页） */
  | 'messages';


/** 首页模块：白底 + teal 轻阴影，与供方市场/供应详情一致 */
const HOME_CARD_BORDER = 'rounded-xl border border-gray-200/90 bg-white shadow-sm shadow-teal-900/5';

const SEARCH_HISTORY_STORAGE_KEY = 'water_portal_search_history_v1';
const SEARCH_HISTORY_LIMIT = 10;

function loadSearchHistory(): string[] {
  try {
    const raw = localStorage.getItem(SEARCH_HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const j = JSON.parse(raw) as unknown;
    if (!Array.isArray(j)) return [];
    return j.filter((x): x is string => typeof x === 'string').slice(0, SEARCH_HISTORY_LIMIT);
  } catch {
    return [];
  }
}

function persistSearchHistory(entries: string[]) {
  try {
    localStorage.setItem(SEARCH_HISTORY_STORAGE_KEY, JSON.stringify(entries.slice(0, SEARCH_HISTORY_LIMIT)));
  } catch {
    /* 无痕/配额满时忽略 */
  }
}

function clearSearchHistoryStore() {
  try {
    localStorage.removeItem(SEARCH_HISTORY_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

const PORTAL_UI_STYLE_KEY = 'water_portal_ui_style';
const PORTAL_HOME_AUDIENCE_KEY = 'water_portal_home_audience';

/** 门户固定样式4：用水户/产业户切换、用水户独立首屏 */
const PORTAL_UI_STYLE = 4 as const;
type PortalUiStyle = typeof PORTAL_UI_STYLE;
type PortalHomeAudience = 'water_user' | 'industry_user';

function readPortalUiStyle(): PortalUiStyle {
  try {
    localStorage.setItem(PORTAL_UI_STYLE_KEY, '4');
  } catch {
    /* ignore */
  }
  return PORTAL_UI_STYLE;
}

function readPortalHomeAudience(): PortalHomeAudience {
  try {
    const s = localStorage.getItem(PORTAL_HOME_AUDIENCE_KEY);
    if (s === 'industry_user') return 'industry_user';
  } catch {
    /* ignore */
  }
  return 'water_user';
}

function persistPortalHomeAudience(v: PortalHomeAudience) {
  try {
    localStorage.setItem(PORTAL_HOME_AUDIENCE_KEY, v);
  } catch {
    /* ignore */
  }
}

/** 单行统计纵滚：两段相同内容上下无缝循环（与 portal-marquee-y-stat 关键帧配套） */
function HomeStatMarqueeYStrip({
  trackClass,
  children,
  width = 'hero',
}: {
  trackClass: 'portal-marquee-y-stat-a' | 'portal-marquee-y-stat-b';
  children: React.ReactNode;
  /** hero：搜索旁固定上限；kirin：水麒麟卡片内占满一行 */
  width?: 'hero' | 'kirin';
}) {
  const lineH =
    width === 'kirin' ? 'h-[1.625rem] sm:h-[1.875rem]' : 'h-[2.125rem] sm:h-[2.5rem]';
  const row =
    width === 'kirin'
      ? cn(lineH, 'flex shrink-0 items-center justify-center gap-1.5')
      : cn(lineH, 'flex shrink-0 items-baseline justify-end gap-1.5');
  const wrap =
    width === 'kirin'
      ? cn('flex w-full max-w-full justify-center overflow-hidden', lineH)
      : cn('w-full max-w-[min(100%,15.5rem)] overflow-hidden sm:max-w-[17rem]', lineH);
  return (
    <div className={wrap}>
      <div className={cn('flex w-full flex-col', trackClass)}>
        <div className={row}>{children}</div>
        <div className={row} aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}

/** 首页搜索条右侧：两行累计数据交替展示，每行停留 8 秒 */
const HERO_STAT_TICKER_INTERVAL_MS = 8000;

/** 搜索条右侧：单行视口内诊断 / 供需两行交替（供需行为可点击跳转成果） */
function HomeHeroSearchStatsTicker({ onOpenSupplyResults }: { onOpenSupplyResults: () => void }) {
  const s = HOME_KIRIN_STATS;
  const [visibleIndex, setVisibleIndex] = useState(0);
  const lineH = 'h-[2.5rem] sm:h-[3rem]';
  const row = cn(lineH, 'flex w-full shrink-0 items-baseline justify-start gap-2');
  const wrap = cn('w-full max-w-[min(100%,17rem)] overflow-hidden sm:max-w-[19rem]', lineH);
  const num = 'font-black tabular-nums text-[#26B39C]';
  const label = 'text-sm font-bold text-gray-600 sm:text-[15px]';
  const matchNum =
    'font-black tabular-nums text-blue-700 underline decoration-2 underline-offset-[5px] decoration-blue-500 transition-colors group-hover:text-blue-900 group-hover:decoration-blue-700';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) return;
    const id = window.setInterval(() => {
      setVisibleIndex((i) => (i === 0 ? 1 : 0));
    }, HERO_STAT_TICKER_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="flex w-full justify-start">
      <div className={wrap}>
        <div
          className="flex w-full flex-col transition-transform duration-700 ease-in-out motion-reduce:transition-none"
          style={{ transform: visibleIndex === 1 ? 'translateY(-50%)' : 'translateY(0)' }}
        >
          <div className={row} aria-hidden={visibleIndex === 1}>
            <Sparkles className="h-5 w-5 shrink-0 text-[#26B39C] sm:h-6 sm:w-6" aria-hidden />
            <span className={cn('whitespace-nowrap', label)}>累计智能诊断</span>
            <strong className={cn('text-3xl leading-none sm:text-[34px]', num)}>{s.smartDiagnosisCount}</strong>
            <span className={cn('whitespace-nowrap', label)}>次</span>
          </div>
          <button
            type="button"
            onClick={onOpenSupplyResults}
            tabIndex={visibleIndex === 1 ? 0 : -1}
            aria-hidden={visibleIndex !== 1}
            aria-label="查看供需对接成果"
            className={cn(
              row,
              'group cursor-pointer border-0 bg-transparent p-0 text-left transition-colors',
              'hover:[&_span]:text-gray-800',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70 focus-visible:ring-offset-2',
              visibleIndex !== 1 && 'pointer-events-none',
            )}
          >
            <Handshake className="h-5 w-5 shrink-0 text-blue-600 sm:h-6 sm:w-6" aria-hidden />
            <span className={cn('whitespace-nowrap', label)}>累计供需对接</span>
            <strong className={cn('text-3xl leading-none sm:text-[34px]', matchNum)}>{s.supplyDemandMatches}</strong>
            <span className={cn('whitespace-nowrap', label)}>单</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/** 首页搜索条右侧：累计数据（与搜索同一行，右对齐；单行视口内两行交替） */
const HomeHeroSearchStatsAside = ({
  onOpenSupplyResults,
}: {
  onOpenSupplyResults: () => void;
}) => {
  const s = HOME_KIRIN_STATS;
  return (
    <aside
      className="flex w-full shrink-0 flex-col items-start justify-start gap-1.5 py-0 sm:w-auto sm:min-w-0 sm:pl-0 sm:-translate-y-1 md:-translate-y-1.5"
      role="status"
      aria-label={`平台累计智能诊断 ${s.smartDiagnosisCount} 次，累计供需对接 ${s.supplyDemandMatches} 单`}
    >
      <HomeHeroSearchStatsTicker onOpenSupplyResults={onOpenSupplyResults} />
    </aside>
  );
};

/** 写入一条搜索词并返回最新列表（去重、最新在前） */
function addSearchHistory(query: string): string[] {
  const q = query.trim();
  if (!q) return loadSearchHistory();
  const next = [q, ...loadSearchHistory().filter((x) => x !== q)].slice(0, SEARCH_HISTORY_LIMIT);
  persistSearchHistory(next);
  return next;
}

/** 根据历史关键词匹配商品；不足时用热门补齐 */
function recommendedProductsByHistory(history: string[]): (typeof PRODUCTS)[number][] {
  const hot = PRODUCTS.slice(0, 8);
  const needles = history.map((s) => s.trim()).filter((s) => s.length >= 1);
  if (needles.length === 0) return hot;

  const picked: (typeof PRODUCTS)[number][] = [];
  const seen = new Set<number>();
  for (const p of PRODUCTS) {
    if (picked.length >= 8) break;
    const hit = needles.some(
      (n) =>
        p.name.includes(n) ||
        p.category.includes(n) ||
        (p.scenario?.includes(n) ?? false) ||
        p.info.includes(n)
    );
    if (hit && !seen.has(p.id)) {
      seen.add(p.id);
      picked.push(p);
    }
  }
  for (const p of hot) {
    if (picked.length >= 8) break;
    if (!seen.has(p.id)) {
      seen.add(p.id);
      picked.push(p);
    }
  }
  return picked.slice(0, 8);
}

// 门户顶栏：品牌区 + 右上登录注册 + 搜索条
const Navbar = ({
  currentView,
  onViewChange,
  onAuthClick,
  compactSearch = false,
  isHome = false,
  onEnterpriseSettle,
  onOpenOneClickRegister,
  onContactService,
  onSearchHistoryChange,
  /** 样式4：当前顶栏角色（仅三选一展示与切换） */
  style4ToolbarRole,
  onStyle4ToolbarRoleChange,
  onStyle4OpenBackend,
}: {
  currentView: string;
  onViewChange: (view: AppView) => void;
  onAuthClick: (mode: 'login' | 'register') => void;
  compactSearch?: boolean;
  /** 首页：顶栏与搜索条科技风着色 */
  isHome?: boolean;
  /** 企业入驻（进入企业入驻资料页） */
  onEnterpriseSettle: () => void;
  /** 样式4：一键注册/入驻向导 */
  onOpenOneClickRegister?: () => void;
  /** 联系客服（演示：邮件） */
  onContactService: () => void;
  /** 顶栏搜索历史变化时同步（预留扩展） */
  onSearchHistoryChange?: (entries: string[]) => void;
  style4ToolbarRole?: PortalStyle4ToolbarRole;
  onStyle4ToolbarRoleChange?: (role: PortalStyle4ToolbarRole) => void;
  /** 样式3/4：点击头像进入工作台 */
  onStyle4OpenBackend?: () => void;
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchPanelOpen, setSearchPanelOpen] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const searchWrapRef = React.useRef<HTMLDivElement>(null);
  const style4RoleMenuRef = React.useRef<HTMLDivElement>(null);
  const [style4RoleMenuOpen, setStyle4RoleMenuOpen] = React.useState(false);

  const showRoleToolbar = true;

  React.useEffect(() => {
    if (!showRoleToolbar) setStyle4RoleMenuOpen(false);
  }, [showRoleToolbar]);

  React.useEffect(() => {
    const h = loadSearchHistory();
    setSearchHistory(h);
    onSearchHistoryChange?.(h);
  }, [onSearchHistoryChange]);

  React.useEffect(() => {
    const close = (e: MouseEvent) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target as Node)) {
        setSearchPanelOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  React.useEffect(() => {
    if (!style4RoleMenuOpen) return;
    const close = (e: MouseEvent) => {
      if (style4RoleMenuRef.current && !style4RoleMenuRef.current.contains(e.target as Node)) {
        setStyle4RoleMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [style4RoleMenuOpen]);

  const submitPortalSearch = (raw: string) => {
    const q = raw.trim();
    if (!q) return;
    const next = addSearchHistory(q);
    setSearchHistory(next);
    onSearchHistoryChange?.(next);
    setSearchQuery(q);
    setSearchPanelOpen(false);
    onViewChange('forum-supply');
    window.scrollTo(0, 0);
  };

  const suggestedProducts = React.useMemo(
    () => recommendedProductsByHistory(searchHistory),
    [searchHistory]
  );

  /** 首页：搜索框下横向热词（无历史时展示热门商品名，参考京东热词行） */
  const homeSearchHotwords = React.useMemo(() => PRODUCTS.slice(0, 12).map((p) => p.name), []);
  const homeSearchRowItems = searchHistory.length > 0 ? searchHistory : homeSearchHotwords;

  const homeSearchStatsHero = isHome && compactSearch;
  /** 首页紧凑顶栏搜索：青绿描边（原样式2 天蓝分支已下线） */
  const homeCompactJdSearch = isHome && compactSearch;
  /** 样式4：顶栏收纳主搜索与统计；角色通过头像下拉切换（产业主体 / 用水户主体 / 系统管理员） */
  const homeStyle4SlimHeader = isHome;

  function PortalSearchSection() {
    const statsBesideSearch = homeSearchStatsHero;
  return (
            <div
      className={cn(
          'relative',
          statsBesideSearch
            ? 'pb-2 sm:pb-3 pt-3 sm:pt-4'
            : cn('pb-3 sm:pb-4', compactSearch ? 'pt-3 sm:pt-4' : 'pt-4 sm:pt-5')
        )}
      >
          <div className={cn('flex w-full flex-col gap-4')}>
            <div
              className={cn(
              'flex w-full flex-col gap-3',
              statsBesideSearch && 'sm:flex-row sm:items-start sm:gap-3',
              /** 与首屏主内容右缘对齐：减去右侧水麒麟列宽（与 lg:w-[min(100%,280px)] / xl:w-[300px] 一致；列间 gap 由 flex 自动吃进宽度） */
              isHome &&
                compactSearch &&
                'lg:max-w-[calc(100%-280px)] xl:max-w-[calc(100%-300px)]'
            )}
          >
          <div
                className={cn(
              'min-w-0 w-full',
              statsBesideSearch && 'sm:min-w-0 sm:flex-1'
            )}
          >
          <div
            ref={searchWrapRef}
            className={cn('relative w-full', !compactSearch && 'mx-auto max-w-4xl')}
          >
            <div
              className={cn(
              'flex items-stretch overflow-hidden',
              homeCompactJdSearch &&
                'rounded-md border-2 border-teal-600 bg-white shadow-md shadow-teal-900/8 ring-1 ring-teal-600/15',
              !isHome && 'rounded-xl border border-gray-200 bg-white shadow-sm'
              )}
            >
              <div className="relative min-w-0 flex-1 bg-transparent">
                <Search
                  className={cn(
                    'pointer-events-none absolute top-1/2 -translate-y-1/2',
                  homeCompactJdSearch && 'text-teal-500',
                  !isHome && 'text-gray-400',
                    compactSearch ? 'left-3 h-4 w-4' : 'left-4 h-5 w-5'
                  )}
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (!compactSearch) setSearchPanelOpen(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') submitPortalSearch(searchQuery);
                  }}
                  placeholder="中国专业的节水AI平台"
                  autoComplete="off"
                  aria-expanded={searchPanelOpen}
                  className={cn(
                    'w-full border-0 bg-transparent focus:outline-none',
                    isHome ? 'text-gray-900 placeholder:text-gray-400' : 'text-gray-800 placeholder:text-gray-400',
                    compactSearch ? 'h-10 sm:h-11 pl-9 pr-3 text-xs sm:text-sm' : 'h-14 pl-12 pr-4 text-base'
                  )}
                />
              </div>
              <button
                type="button"
                onClick={() => submitPortalSearch(searchQuery)}
                className={cn(
                'shrink-0 text-white transition-all',
                homeCompactJdSearch &&
                  'relative flex min-w-[5.25rem] items-center justify-center border-l border-teal-400/45 bg-teal-600 px-6 text-sm font-black tracking-wide shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)] hover:bg-teal-700 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25)] active:bg-teal-800 sm:min-w-[6rem] sm:px-8 sm:text-[15px]',
                !isHome && 'bg-[#333] font-bold hover:bg-black',
                !homeCompactJdSearch && !compactSearch && 'px-10 text-base'
                )}
              >
                搜索
              </button>
            </div>

            {isHome && (
              <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2 sm:mt-2.5 sm:gap-3">
                <div className="flex min-w-0 flex-1 flex-wrap gap-x-2.5 gap-y-1 sm:gap-x-3">
                  {homeSearchRowItems.slice(0, 8).map((word, idx) => (
                    <button
                      key={searchHistory.length > 0 ? `${word}-${idx}` : `s4-hw-${idx}`}
                      type="button"
                      className="shrink-0 whitespace-nowrap text-[11px] text-gray-500 transition-colors hover:text-teal-600 sm:text-xs"
                      onClick={() => submitPortalSearch(word)}
                    >
                      {word}
                    </button>
                  ))}
                </div>
                {searchHistory.length > 0 && (
                  <button
                    type="button"
                    className="shrink-0 text-[11px] text-gray-400 transition-colors hover:text-teal-600 sm:text-xs"
                    onClick={() => {
                      clearSearchHistoryStore();
                      setSearchHistory([]);
                      onSearchHistoryChange?.([]);
                    }}
                  >
                    清空
                  </button>
                )}
              </div>
            )}

            {compactSearch && !isHome && (
              <div className="mt-3 flex min-w-0 items-center gap-2 sm:mt-3.5 sm:gap-3">
                {searchHistory.length > 0 && (
                  <span className="shrink-0 text-[11px] font-semibold text-gray-400 sm:text-xs">历史搜索</span>
                )}
                <div className="min-w-0 flex-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <div className="flex w-max flex-nowrap items-center gap-x-3 py-0.5 pr-1 sm:gap-x-4">
                    {homeSearchRowItems.map((word, idx) => (
                      <button
                        key={searchHistory.length > 0 ? `${word}-${idx}` : `hot-${idx}`}
                        type="button"
                      className={cn(
                        'shrink-0 whitespace-nowrap text-[11px] text-gray-500 transition-colors hover:text-teal-600 sm:text-xs'
                      )}
                        onClick={() => submitPortalSearch(word)}
                      >
                        {word}
                      </button>
                    ))}
                  </div>
                </div>
                {searchHistory.length > 0 && (
                  <button
                    type="button"
                  className={cn(
                    'shrink-0 text-[11px] text-gray-400 transition-colors hover:text-teal-600 sm:text-xs'
                  )}
                    onClick={() => {
                      clearSearchHistoryStore();
                      setSearchHistory([]);
                      onSearchHistoryChange?.([]);
                    }}
                  >
                    清空
                  </button>
                )}
              </div>
            )}

            {searchPanelOpen && !compactSearch && (
              <div className="absolute left-0 right-0 top-full z-[100] mt-1 max-h-[min(70vh,22rem)] overflow-y-auto rounded-xl border border-gray-200 bg-white py-2 shadow-xl ring-1 ring-black/5">
                {searchHistory.length === 0 ? (
                  <>
                    <div className="px-3 pb-1 pt-0.5 text-[11px] font-black uppercase tracking-wide text-gray-400">
                      热门推荐
                    </div>
                    {PRODUCTS.slice(0, 8).map((p) => (
                      <button
                        key={p.id}
                        type="button"
                      className={cn(
                        'flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-bold text-gray-800',
                        'hover:bg-teal-50'
                      )}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => submitPortalSearch(p.name)}
                      >
                      <TrendingUp className="h-4 w-4 shrink-0 text-teal-500" aria-hidden />
                        <span className="min-w-0 flex-1 truncate">{p.name}</span>
                        <span className="shrink-0 text-[10px] font-semibold text-gray-400">{p.category}</span>
                      </button>
                    ))}
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 px-3 pb-1 pt-0.5">
                      <History className="h-3.5 w-3.5 text-gray-400" aria-hidden />
                      <span className="text-[11px] font-black uppercase tracking-wide text-gray-400">最近搜索</span>
                    </div>
                    {searchHistory.map((h) => (
                      <button
                        key={h}
                        type="button"
                        className="flex w-full px-3 py-2 text-left text-sm font-semibold text-gray-800 hover:bg-gray-50"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => submitPortalSearch(h)}
                      >
                        <Search className="mr-2 h-4 w-4 shrink-0 text-gray-400" aria-hidden />
                        <span className="truncate">{h}</span>
                      </button>
                    ))}
                    <div className="mx-3 my-2 border-t border-gray-100" />
                    <div className="px-3 pb-1 text-[11px] font-black uppercase tracking-wide text-gray-400">
                      为您推荐（基于历史）
                    </div>
                    {suggestedProducts.map((p) => (
                      <button
                        key={`rec-${p.id}`}
                        type="button"
                      className={cn(
                        'flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-bold text-gray-800',
                        'hover:bg-teal-50'
                      )}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => submitPortalSearch(p.name)}
                      >
                      <Package className="h-4 w-4 shrink-0 text-teal-500" aria-hidden />
                        <span className="min-w-0 truncate">{p.name}</span>
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
          {statsBesideSearch && (
            <HomeHeroSearchStatsAside onOpenSupplyResults={() => onViewChange('supply-results')} />
          )}
          </div>
          </div>
        </div>
    );
  }

  const portalToolbar = (
    <div
      className={cn(
        'flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-[11px] font-semibold text-gray-600 sm:gap-x-4 sm:text-xs',
        !homeStyle4SlimHeader && 'border-b border-gray-100 pb-1.5 sm:pb-2'
      )}
      role="toolbar"
      aria-label="快捷入口"
    >
      {onOpenOneClickRegister ? (
        <button
          type="button"
          onClick={onOpenOneClickRegister}
          className={cn(
            'inline-flex shrink-0 items-center gap-1.5 rounded-full border-2 border-teal-500/40 bg-gradient-to-r from-teal-600 to-teal-500 px-3 py-1.5 text-[11px] font-black text-white shadow-sm transition hover:from-teal-700 hover:to-teal-600 sm:px-4 sm:py-2 sm:text-xs'
          )}
        >
          <Building2 className="h-3.5 w-3.5 shrink-0 opacity-95 sm:h-4 sm:w-4" aria-hidden />
          注册/入驻/登录
        </button>
      ) : (
        <>
          <button
            type="button"
            onClick={onEnterpriseSettle}
            className={cn(
              'inline-flex shrink-0 items-center gap-1 border-0 bg-transparent p-0 transition-colors',
              'text-gray-600 hover:text-teal-600',
              currentView === 'enterprise-settle' && 'font-bold text-teal-700'
            )}
            title="进入企业入驻页面"
          >
            <Building2 className="h-3 w-3 shrink-0 opacity-85 sm:h-3.5 sm:w-3.5" aria-hidden />
            企业入驻
          </button>
          <span className="inline-flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              onClick={() => onAuthClick('register')}
              className={cn(
                'border-0 bg-transparent p-0 font-semibold transition-colors',
                'text-gray-600 hover:text-teal-600'
              )}
            >
              免费注册
            </button>
            <span className="select-none text-gray-400" aria-hidden>
              /
            </span>
            <button
              type="button"
              onClick={() => onAuthClick('login')}
              className={cn(
                'border-0 bg-transparent p-0 font-semibold transition-colors hover:underline',
                'text-teal-600 hover:text-teal-800'
              )}
            >
              用户登录
            </button>
          </span>
        </>
      )}
      {showRoleToolbar && style4ToolbarRole != null && onStyle4ToolbarRoleChange ? (
        <div ref={style4RoleMenuRef} className="relative inline-flex shrink-0 items-stretch rounded-full border border-teal-200 bg-teal-50/90 py-1 pl-1 shadow-sm transition hover:bg-teal-50 sm:pr-0">
          <button
            type="button"
            onClick={() => {
              onStyle4OpenBackend?.();
              setStyle4RoleMenuOpen(false);
            }}
            className="shrink-0 rounded-l-full border-0 bg-transparent p-0 transition hover:opacity-90"
            aria-label="进入后台管理"
            title="进入后台管理"
          >
            <span
              className={cn(
                'relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 sm:h-9 sm:w-9',
                'border-teal-600 shadow-sm ring-2 ring-teal-400/40 ring-offset-1 ring-offset-teal-50'
              )}
            >
              {style4ToolbarRole === '系统管理员' ? (
                <Shield className="h-4 w-4 text-teal-800 sm:h-[1.125rem] sm:w-[1.125rem]" aria-hidden />
              ) : (
                <img
                  src={
                    style4ToolbarRole === '用水户主体'
                      ? 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=128&h=128'
                      : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=128&h=128'
                  }
                  alt=""
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              )}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setStyle4RoleMenuOpen((o) => !o)}
            aria-expanded={style4RoleMenuOpen}
            aria-haspopup="listbox"
            aria-label={`切换角色，当前：${style4ToolbarRole}`}
            className="inline-flex shrink-0 items-center gap-0.5 rounded-r-full border-0 bg-transparent py-0 pl-0.5 pr-1.5 transition hover:bg-teal-100/60 sm:gap-1 sm:pr-2"
          >
            <span className="hidden max-w-[5.5rem] truncate text-[10px] font-black text-teal-900 sm:inline sm:max-w-[7rem] sm:text-[11px]">
              {style4ToolbarRole}
            </span>
            <ChevronDown
              className={cn(
                'h-3.5 w-3.5 shrink-0 text-teal-800 transition-transform sm:h-4 sm:w-4',
                style4RoleMenuOpen && 'rotate-180'
              )}
              aria-hidden
            />
          </button>
          {style4RoleMenuOpen ? (
            <div
              role="listbox"
              aria-label="切换门户角色"
              className="absolute right-0 top-[calc(100%+0.35rem)] z-[80] min-w-[11rem] overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg shadow-teal-900/10 ring-1 ring-black/5"
            >
              {PORTAL_STYLE4_TOOLBAR_ROLES.map((role) => (
                <button
                  key={role}
                  type="button"
                  role="option"
                  aria-selected={style4ToolbarRole === role}
                  onClick={() => {
                    onStyle4ToolbarRoleChange(role);
                    setStyle4RoleMenuOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-bold transition-colors sm:text-[13px]',
                    style4ToolbarRole === role ? 'bg-teal-50 text-teal-900' : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  {style4ToolbarRole === role ? (
                    <Check className="h-3.5 w-3.5 shrink-0 text-teal-600" aria-hidden />
                  ) : (
                    <span className="inline-block w-3.5 shrink-0" aria-hidden />
                  )}
                  {role}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
      <button
        type="button"
        onClick={onContactService}
        className={cn(
          'inline-flex shrink-0 items-center gap-1 border-0 bg-transparent p-0 transition-colors',
          'text-gray-600 hover:text-teal-600'
        )}
        title="联系客服（演示：打开邮件客户端）"
      >
        <Headset className="h-3 w-3 shrink-0 opacity-85 sm:h-3.5 sm:w-3.5" aria-hidden />
        联系客服
      </button>
      <button
        type="button"
        onClick={() => onViewChange('messages')}
        className={cn(
          'inline-flex shrink-0 items-center gap-1 border-0 bg-transparent p-0 transition-colors',
          'text-gray-600 hover:text-teal-600',
          currentView === 'messages' && 'font-bold text-teal-700'
        )}
      >
        <MessageSquare className="h-3 w-3 shrink-0 opacity-85 sm:h-3.5 sm:w-3.5" aria-hidden />
        我的消息
      </button>
    </div>
  );

  return (
    <header
      className={cn(
        'flex-shrink-0 sticky top-0 z-50 pt-2 sm:pt-3 transition-colors',
        isHome && 'border-b border-gray-200 bg-white shadow-sm',
        !isHome && 'border-b border-slate-200/80 bg-white'
      )}
    >
      <div className="relative mx-auto w-full max-w-[1440px] px-4 sm:px-6">
        {homeStyle4SlimHeader ? (
          <div className="flex flex-col gap-3 py-3 sm:gap-3.5 sm:py-3.5">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5">
              <div className="flex min-w-0 max-w-full flex-[1_1_12rem] items-center gap-2.5 sm:flex-[1_1_18rem] sm:gap-3 md:gap-4">
                <button
                  type="button"
                  onClick={() => onViewChange('home')}
                  className="border-0 bg-transparent p-0 text-left cursor-pointer focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500"
                >
                  <img
                    src="/brand-logo.png"
                    alt="水麒麟节水产业AI云平台"
                    className="block h-14 w-auto max-w-[min(52vw,280px)] object-contain object-left border-0 shadow-none sm:h-[4.25rem] lg:h-[4.75rem] lg:max-w-[min(64vw,400px)]"
                  />
                </button>
                <p className="min-w-0 max-w-[min(100%,20rem)] border-l-2 border-teal-200 pl-3 text-sm font-black leading-snug tracking-tight text-gray-900 sm:max-w-[24rem] sm:pl-4 sm:text-base md:text-lg lg:text-xl">
                  中国专业的节水AI平台
                </p>
              </div>
              <div className="flex min-w-0 shrink-0 flex-col items-stretch sm:max-w-[58%] sm:items-end">
                {portalToolbar}
              </div>
            </div>
            <div className="flex w-full flex-col gap-2.5 sm:flex-row sm:items-stretch sm:gap-3">
              <div className="min-w-0 flex-1">
                <div ref={searchWrapRef} className="relative w-full">
                  <div className="flex items-stretch overflow-hidden rounded-md border-2 border-teal-600 bg-white shadow-md shadow-teal-900/8 ring-1 ring-teal-600/15">
                    <div className="relative min-w-0 flex-1 bg-transparent">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-teal-500 sm:left-3.5" />
                      <input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') submitPortalSearch(searchQuery);
                        }}
                        placeholder="搜索节水产品、技术与服务关键词"
                        autoComplete="off"
                        className="h-10 w-full border-0 bg-transparent pl-9 pr-3 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none sm:h-11 sm:pl-10 sm:text-sm"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => submitPortalSearch(searchQuery)}
                      className="relative flex min-w-[5.25rem] shrink-0 items-center justify-center border-l border-teal-400/45 bg-teal-600 px-5 text-sm font-black tracking-wide text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)] transition hover:bg-teal-700 active:bg-teal-800 sm:min-w-[6rem] sm:px-8 sm:text-[15px]"
                    >
                      搜索
                    </button>
                  </div>
                  <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2 sm:mt-2.5 sm:gap-3">
                    <div className="flex min-w-0 flex-1 flex-wrap gap-x-2.5 gap-y-1 sm:gap-x-3">
                      {homeSearchRowItems.slice(0, 8).map((word, idx) => (
                        <button
                          key={searchHistory.length > 0 ? `${word}-${idx}` : `s4-slim-${idx}`}
                          type="button"
                          className="shrink-0 whitespace-nowrap text-[11px] text-gray-500 transition-colors hover:text-teal-600 sm:text-xs"
                          onClick={() => submitPortalSearch(word)}
                        >
                          {word}
                        </button>
                      ))}
                    </div>
                    {searchHistory.length > 0 && (
                      <button
                        type="button"
                        className="shrink-0 text-[11px] text-gray-400 transition-colors hover:text-teal-600 sm:text-xs"
                        onClick={() => {
                          clearSearchHistoryStore();
                          setSearchHistory([]);
                          onSearchHistoryChange?.([]);
                        }}
                      >
                        清空
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <HomeHeroSearchStatsAside onOpenSupplyResults={() => onViewChange('supply-results')} />
            </div>
          </div>
        ) : (
          <>
        <div
          className={cn(
            'flex min-w-0 gap-2 sm:gap-3 md:gap-4 lg:gap-5',
            'flex-col',
            homeSearchStatsHero ? 'pt-3 pb-3 sm:pt-3.5 sm:pb-3' : 'py-3 sm:py-4'
          )}
        >
            <div className="flex w-full min-w-0 flex-row items-stretch gap-3 sm:gap-4 md:gap-5">
              <div className="flex shrink-0 flex-col justify-center">
                <button
                  type="button"
                  onClick={() => onViewChange('home')}
                  className="border-0 bg-transparent p-0 text-left cursor-pointer focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500"
                >
                  <img
                    src="/brand-logo.png"
                    alt="水麒麟节水产业AI云平台"
                    className="block h-16 w-auto max-w-[min(70vw,400px)] object-contain object-left border-0 shadow-none sm:h-[4.75rem] lg:h-[5.25rem] lg:max-w-[min(76vw,460px)]"
                  />
                </button>
              </div>
              <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-center py-0.5 sm:py-1">
                {portalToolbar}
              </div>
            </div>
        </div>

        {/* 门户主搜索条：仅首页展示，内页保留顶栏品牌与登录区 */}
        {isHome && <PortalSearchSection />}
          </>
        )}
      </div>
    </header>
  );
};

type VerticalCategoriesProps = {
  /** 样式3：三级树数据源 */
  categoryHierarchy?: WaterSavingCategoryHierarchyEntry[];
  /** 样式4：扁平产业分类（左栏一级=截图「一级」列；flyout 为「二级」示例词条） */
  industryFlatRows?: IndustryStyle4FlatRow[];
  /** 样式4：点击左栏一级或「查看全量」时进入商品列表 */
  onBrowseStyle4IndustryRow?: (rowId: string) => void;
  /** 点击 flyout 中的细类名称（如「喷灌机」）：进入与热门宫格一致的商品列表页 */
  onSelectCategoryItem?: (keyword: string) => void;
  /** 点击「查看该类目全量列表」或左侧一级：该大类下全部二级+细类聚合 */
  onBrowseTopCategoryList?: (topCategoryName: string) => void;
  /** 点击 flyout 二级分组名：仅该二级及其下细类关键词聚合 */
  onBrowseSubCategoryList?: (topCategoryName: string, subCategoryName: string) => void;
  /** 左栏类目列表在固定高度内滚动（首屏与需求首行对齐时使用） */
  categoryListScrollable?: boolean;
  /** 二级 flyout 展开时通知父级提升 z-index，避免被首屏中栏遮挡 */
  onFlyoutOpenChange?: (open: boolean) => void;
};

// Vertical Categories Component with Flyout（ref 落在分类白底卡片上，供首屏按左侧自然高度对齐中右栏）
const VerticalCategories = React.forwardRef<HTMLDivElement, VerticalCategoriesProps>(
  function VerticalCategories(
    {
      categoryHierarchy = CATEGORIES_HIERARCHY,
      industryFlatRows,
      onBrowseStyle4IndustryRow,
      onSelectCategoryItem,
      onBrowseTopCategoryList,
      onBrowseSubCategoryList,
      categoryListScrollable = false,
      onFlyoutOpenChange,
    },
    ref
  ) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [flyoutAnchor, setFlyoutAnchor] = useState<{ top: number; left: number; height: number } | null>(
    null
  );
  const itemRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const flyoutCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFlatIndustry = Boolean(industryFlatRows && industryFlatRows.length > 0);

  const syncFlyoutAnchor = useCallback((id: string | null) => {
    if (!id) {
      setFlyoutAnchor(null);
      return;
    }
    const el = itemRefs.current.get(id);
    if (!el) return;
    const r = el.getBoundingClientRect();
    setFlyoutAnchor({ top: r.top, left: r.right, height: r.height });
  }, []);

  const setItemRef = useCallback((id: string, el: HTMLButtonElement | null) => {
    if (el) itemRefs.current.set(id, el);
    else itemRefs.current.delete(id);
  }, []);

  const closeCategoryFlyout = useCallback(() => {
    setHoveredCategory(null);
    setFlyoutAnchor(null);
  }, []);

  const openCategory = useCallback(
    (id: string) => {
      if (flyoutCloseTimerRef.current) {
        clearTimeout(flyoutCloseTimerRef.current);
        flyoutCloseTimerRef.current = null;
      }
      setHoveredCategory(id);
      syncFlyoutAnchor(id);
    },
    [syncFlyoutAnchor]
  );

  const scheduleCloseCategory = useCallback(() => {
    if (flyoutCloseTimerRef.current) clearTimeout(flyoutCloseTimerRef.current);
    flyoutCloseTimerRef.current = setTimeout(() => {
      closeCategoryFlyout();
      flyoutCloseTimerRef.current = null;
    }, 100);
  }, [closeCategoryFlyout]);

  const cancelCloseCategory = useCallback(() => {
    if (flyoutCloseTimerRef.current) {
      clearTimeout(flyoutCloseTimerRef.current);
      flyoutCloseTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    onFlyoutOpenChange?.(hoveredCategory != null);
  }, [hoveredCategory, onFlyoutOpenChange]);

  useLayoutEffect(() => {
    if (!hoveredCategory) return;
    syncFlyoutAnchor(hoveredCategory);
    const onUpdate = () => syncFlyoutAnchor(hoveredCategory);
    window.addEventListener('resize', onUpdate);
    window.addEventListener('scroll', onUpdate, true);
    return () => {
      window.removeEventListener('resize', onUpdate);
      window.removeEventListener('scroll', onUpdate, true);
    };
  }, [hoveredCategory, syncFlyoutAnchor]);

  return (
    <div
      className={cn('relative min-h-0 group/sidebar', categoryListScrollable && 'flex h-full min-h-0 flex-col')}
      onMouseEnter={cancelCloseCategory}
      onMouseLeave={scheduleCloseCategory}
    >
      {/* Sidebar List：lg+ 首屏对齐时由父级给高，列表区 overflow-y-auto */}
      <div
        ref={ref}
        className={cn(
          'relative z-20 flex w-full min-w-0 flex-col',
          HOME_CARD_BORDER,
          categoryListScrollable && 'min-h-0 flex-1'
        )}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-white/25 bg-gradient-to-r from-teal-500 via-teal-500 to-cyan-500 px-3 py-2.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25)] sm:px-4 sm:py-3">
          <span className="text-xs font-black uppercase tracking-wider text-white drop-shadow-sm sm:text-sm sm:tracking-wide">
            节水产品分类
          </span>
          <Menu className="h-3.5 w-3.5 shrink-0 text-white/90 sm:h-4 sm:w-4" />
        </div>
        <div
          className={cn(
            'flex flex-col bg-white',
            categoryListScrollable && 'min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain'
          )}
        >
          {isFlatIndustry
            ? industryFlatRows!.map((row) => (
                <button
                  key={row.id}
                  ref={(el) => setItemRef(row.id, el)}
                  type="button"
                  onMouseEnter={() => openCategory(row.id)}
                  onFocus={() => openCategory(row.id)}
                  onClick={() => {
                    onBrowseStyle4IndustryRow?.(row.id);
                    closeCategoryFlyout();
                  }}
                  className={cn(
                    'flex w-full min-w-0 cursor-pointer items-center justify-between gap-2 border-b border-gray-100 px-3 py-2.5 text-left text-xs transition-colors last:border-b-0 sm:px-4 sm:py-3 sm:text-sm',
                    hoveredCategory === row.id
                      ? 'bg-teal-50 font-bold text-teal-900'
                      : 'text-gray-900 hover:bg-gray-50'
                  )}
                >
                  <span className="min-w-0 truncate">{row.name}</span>
                  <ChevronRight
                    className={cn(
                      'h-3 w-3 shrink-0 text-gray-300',
                      hoveredCategory === row.id && 'text-teal-600 opacity-100'
                    )}
                  />
                </button>
              ))
            : categoryHierarchy.map((cat, i) => (
            <button
              key={i}
              ref={(el) => setItemRef(cat.id, el)}
              type="button"
              onMouseEnter={() => openCategory(cat.id)}
              onFocus={() => openCategory(cat.id)}
              onClick={() => {
                onBrowseTopCategoryList?.(cat.name);
                closeCategoryFlyout();
              }}
              className={cn(
                'w-full px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm flex justify-between items-center gap-2 min-w-0 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 text-left',
                hoveredCategory === cat.id
                  ? 'bg-teal-50 text-teal-900 font-bold'
                  : 'text-gray-900 hover:bg-gray-50'
              )}
            >
              <span className="min-w-0 truncate">{cat.name}</span>
              <ChevronRight
                className={cn(
                  'w-3 h-3 text-gray-300 shrink-0',
                  hoveredCategory === cat.id && 'text-teal-600 opacity-100'
                )}
              />
            </button>
          ))}
        </div>
      </div>

      {hoveredCategory && flyoutAnchor && typeof document !== 'undefined'
        ? createPortal(
            <AnimatePresence>
              <motion.div
                key={hoveredCategory}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onMouseEnter={cancelCloseCategory}
                onMouseLeave={scheduleCloseCategory}
                style={{
                  position: 'fixed',
                  top: Math.max(8, flyoutAnchor.top),
                  left: flyoutAnchor.left,
                  minHeight: Math.max(flyoutAnchor.height, 256),
                  maxHeight: `min(92vh, calc(100vh - ${Math.max(8, flyoutAnchor.top)}px - 8px))`,
                }}
                className={cn(
                  'z-[200] flex flex-col rounded-r-xl border border-gray-200 bg-white shadow-xl',
                  isFlatIndustry ? 'w-[min(100vw-1rem,30rem)]' : 'w-[min(100vw-1rem,600px)]'
                )}
              >
            {(() => {
              if (isFlatIndustry) {
                const row = industryFlatRows!.find((r) => r.id === hoveredCategory);
                if (!row) return null;
                return (
                  <>
                    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain px-4 py-4 sm:gap-4 sm:px-5 sm:py-5">
                      <h3 className="border-b border-gray-100 pb-2 text-sm font-black text-gray-900 sm:text-base">
                        {row.name}
                      </h3>
                      {row.examples.length > 0 ? (
                        <div className="flex flex-wrap gap-2 sm:gap-2.5">
                          {row.examples.map((ex) => (
                            <button
                              key={ex}
                              type="button"
                              onClick={() => {
                                onSelectCategoryItem?.(ex);
                                closeCategoryFlyout();
                              }}
                              className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-left text-[11px] font-semibold text-gray-700 transition-colors hover:border-teal-300 hover:bg-teal-50/80 hover:text-teal-900 sm:px-3 sm:py-1.5 sm:text-xs"
                            >
                              {ex}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] leading-relaxed text-gray-500 sm:text-xs">
                          暂无词条示例。可使用顶栏搜索浏览相关商品。
                        </p>
                      )}
                    </div>
                  </>
                );
              }

              const topNode = categoryHierarchy.find((c) => c.id === hoveredCategory);
              const topName = topNode?.name ?? '';

              return (
                <>
                  <div className="flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto p-8">
                    {topNode?.subCategories.map((sub, j) => (
                      <div key={j} className="flex gap-10">
                        <button
                          type="button"
                          onClick={() => {
                            if (topName) onBrowseSubCategoryList?.(topName, sub.name);
                            closeCategoryFlyout();
                          }}
                          className="flex w-24 shrink-0 items-center justify-end gap-2 border-r border-gray-100 pr-4 text-right text-sm font-black text-gray-800 transition-colors hover:text-cyan-700"
                        >
                          {sub.name} <ChevronRight className="h-3 w-3 text-gray-300" />
                        </button>
                        <div className="flex flex-1 flex-wrap gap-x-6 gap-y-3">
                          {sub.items.map((item, k) => (
                            <button
                              key={k}
                              type="button"
                              onClick={() => onSelectCategoryItem?.(item)}
                              className="text-left text-sm text-slate-500 transition-colors hover:text-cyan-600"
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}
              </motion.div>
            </AnimatePresence>,
            document.body
          )
        : null}
    </div>
  );
  }
);
VerticalCategories.displayName = 'VerticalCategories';

/** 水效扶持区：纯文字列表（与「文件截图/PDF 图标」样式区分） */
function WaterEfficiencyPolicyTextRow({
  title,
  hotTop,
  onClick,
}: {
  title: string;
  hotTop?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full min-w-0 items-start gap-1 border-b border-gray-100 bg-white py-2 pl-1.5 pr-1 text-left transition hover:bg-teal-50/40"
      aria-label={hotTop ? `${title}（点击量最高，热度上升快）` : title}
      title={hotTop ? '点击量最高，热度上升快' : undefined}
    >
      {hotTop ? (
        <ThumbsUp
          className="mt-0.5 h-4 w-4 shrink-0 text-amber-500 drop-shadow-sm"
          strokeWidth={2.25}
          aria-hidden
        />
      ) : (
        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500/90" aria-hidden />
      )}
      <div className="min-w-0 flex-1 pr-1">
        <p className="line-clamp-2 text-xs font-bold leading-snug text-gray-900">{title}</p>
      </div>
      <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-gray-300" aria-hidden />
    </button>
  );
}

/** 水效扶持：纵向无缝滚动（与产业政策区同源动画） */
function WaterEfficiencyPolicyScrollList({
  onItemSelect,
}: {
  onItemSelect: (item: HomeWaterEfficiencyPolicyListingItem) => void;
}) {
  const items = HOME_WATER_EFFICIENCY_POLICY_ITEMS;
  return (
    <div className="relative min-h-[6.5rem] flex-1 overflow-hidden rounded-lg border border-gray-100 bg-white shadow-inner ring-1 ring-gray-100/70 sm:min-h-[7rem]">
      <div className="scroll-text-slow flex flex-col hover:[animation-play-state:paused]">
        <div className="flex flex-col">
          {items.map((item) => (
            <React.Fragment key={item.id}>
              <WaterEfficiencyPolicyTextRow
                title={item.title}
                hotTop={item.hotTop}
                onClick={() => onItemSelect(item)}
              />
            </React.Fragment>
          ))}
        </div>
        <div className="flex flex-col" aria-hidden>
          {items.map((item) => (
            <React.Fragment key={`${item.id}-dup`}>
              <WaterEfficiencyPolicyTextRow
                title={item.title}
                hotTop={item.hotTop}
                onClick={() => onItemSelect(item)}
              />
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

function IndustryPolicyScrollRow({
  title,
  onClick,
}: {
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="flex w-full min-w-0 items-center gap-1 border-b border-gray-100 bg-white py-2 pl-1.5 pr-1 text-left transition hover:bg-teal-50/35"
      aria-label={title}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-teal-600/85" aria-hidden />
      <div className="min-w-0 flex-1 overflow-hidden pr-1">
        <p className="truncate text-left text-[11px] font-bold leading-snug text-gray-900 sm:text-xs">{title}</p>
      </div>
      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gray-300" aria-hidden />
    </button>
  );
}

/** 产业政策：纵向无缝滚动（scroll-text + 内容复制一半高度，与 DataOverview 资讯轮播同源动画） */
function IndustryPolicyScrollList({ onItemClick }: { onItemClick: () => void }) {
  const items = HOME_INDUSTRY_POLICY_SCROLL_ITEMS;
  return (
    <div className="relative min-h-[6.5rem] flex-1 overflow-hidden rounded-lg border border-gray-100 bg-white shadow-inner ring-1 ring-gray-100/70 sm:min-h-[7rem]">
      <div className="scroll-text-slow flex flex-col hover:[animation-play-state:paused]">
        <div className="flex flex-col">
          {items.map((item) => (
            <React.Fragment key={item.id}>
              <IndustryPolicyScrollRow title={item.title} onClick={onItemClick} />
            </React.Fragment>
          ))}
        </div>
        <div className="flex flex-col" aria-hidden>
          {items.map((item) => (
            <React.Fragment key={`${item.id}-dup`}>
              <IndustryPolicyScrollRow title={item.title} onClick={onItemClick} />
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

/** 首屏中间：8 个产品宫格（实拍图 + 名称，4×2 等宽等距） */
const HomeHeroCategoryTile = ({
  tile,
  onSelectProduct,
  showFavorite,
  favoriteProductId,
}: {
  tile: HomeHeroProductTile;
  onSelectProduct: (tile: HomeHeroProductTile) => void;
  showFavorite?: boolean;
  favoriteProductId?: number | null;
}) => {
  const src = tile.image;
  return (
    <div className="group relative flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-gray-200/90 bg-white text-center shadow-sm shadow-teal-900/5 transition-all hover:border-teal-400 hover:shadow-md hover:shadow-teal-900/10">
      {showFavorite ? <ProductFavoriteButton productId={favoriteProductId} size="sm" /> : null}
      <button
        type="button"
        onClick={() => onSelectProduct(tile)}
        className="flex min-h-0 flex-1 flex-col overflow-hidden border-0 bg-transparent p-0 text-center outline-none focus-visible:ring-2 focus-visible:ring-teal-400/80 focus-visible:ring-offset-2 active:scale-[0.99]"
      >
      <div className="relative min-h-0 flex-1 overflow-hidden bg-gray-100">
        {src ? (
          <img
            src={src}
            alt={tile.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex h-full min-h-[3.25rem] w-full items-center justify-center bg-gray-100 text-[10px] font-bold text-gray-400">
            暂无配图
          </div>
        )}
      </div>
      <span className="shrink-0 px-1 py-1 text-[9px] font-black leading-tight text-gray-900 line-clamp-2 sm:py-1.5 sm:text-[11px] sm:leading-snug">
        {tile.name}
      </span>
      </button>
    </div>
  );
};

const HomeHeroCategoryTiles = ({
  tiles,
  onSelectProduct,
}: {
  tiles: HomeHeroProductTile[];
  onSelectProduct: (tile: HomeHeroProductTile) => void;
}) => {
  return (
    <div className="grid min-h-0 flex-1 auto-rows-[minmax(0,1fr)] grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-2.5">
      {tiles.map((tile) => (
        <div key={tile.id} className="contents">
          <HomeHeroCategoryTile tile={tile} onSelectProduct={onSelectProduct} />
          </div>
        ))}
      </div>
  );
};

/** 样式 3 首屏中部：左一右二 — 左 2×2 热门产品四图；右上水效扶持纵向滚动文字、右下产业政策纵向滚动文字。小屏纵向堆叠 */
const HomeStyle3HeroMixedGrid = ({
  productTiles,
  onOpenSupply,
  onSelectHotProduct,
  onSelectWaterEfficiencyPolicyItem,
  onOpenPolicyList,
  onForum,
}: {
  productTiles: HomeHeroProductTile[];
  onOpenSupply: () => void;
  onSelectHotProduct: (tile: HomeHeroProductTile) => void;
  onSelectWaterEfficiencyPolicyItem: (item: HomeWaterEfficiencyPolicyListingItem) => void;
  onOpenPolicyList: () => void;
  onForum: () => void;
}) => {
  const fourProducts = productTiles.slice(0, 4);

  const sectionCard = (
    title: string,
    icon: React.ReactNode,
    children: React.ReactNode,
    rightSlot?: React.ReactNode,
    rootClassName?: string,
    /** 水效扶持：暖色高亮，体现全站最热活动 */
    tone: 'default' | 'hot' = 'default'
  ) => (
    <section
      className={cn(
        'flex min-h-0 flex-col overflow-hidden rounded-xl border p-2.5 shadow-sm sm:rounded-2xl sm:p-3.5',
        tone === 'hot'
          ? 'border-amber-200/90 bg-gradient-to-br from-amber-50/70 via-white to-orange-50/50 shadow-md shadow-orange-900/[0.06] ring-1 ring-amber-200/60'
          : 'border-gray-200/90 bg-white shadow-sm ring-1 ring-gray-100/70',
        rootClassName
      )}
    >
      <div
        className={cn(
          'mb-2.5 flex shrink-0 items-center justify-between gap-2 border-b pb-2 sm:mb-3 sm:pb-2.5',
          tone === 'hot' ? 'border-amber-100/90' : 'border-gray-100'
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-2.5">
          <span
            className={cn(
              'h-6 w-1 shrink-0 rounded-full',
              tone === 'hot' ? 'bg-gradient-to-b from-orange-500 to-amber-500' : 'bg-teal-500'
            )}
            aria-hidden
          />
          <span
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 sm:h-9 sm:w-9',
              tone === 'hot'
                ? 'bg-orange-50 text-orange-600 ring-orange-200/90'
                : 'bg-teal-50 text-teal-600 ring-teal-100/80'
            )}
          >
            {icon}
          </span>
          <h3
            className={cn(
              'min-w-0 flex-1 truncate whitespace-nowrap text-sm font-black tracking-tight sm:text-base',
              tone === 'hot' ? 'text-orange-950' : 'text-gray-900'
            )}
          >
            {title}
          </h3>
        </div>
        {rightSlot ?? null}
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </section>
  );

  const iconBtn =
    (onClick: () => void, label: string, tone: 'default' | 'hot' = 'default') =>
      (
        <button
          type="button"
          onClick={onClick}
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border bg-gray-50 text-gray-500 transition',
            tone === 'hot'
              ? 'border-amber-100 hover:border-amber-300 hover:bg-orange-50 hover:text-orange-600'
              : 'border-gray-100 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-600'
          )}
          aria-label={label}
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      );

  const productBody = (
    <div className="grid h-full min-h-[10.5rem] flex-1 grid-cols-2 gap-2 [grid-auto-rows:minmax(0,1fr)] sm:min-h-[11.5rem] sm:gap-2.5 lg:min-h-0">
      {fourProducts.map((tile, idx) => (
        <div key={`${tile.id}-${idx}`} className="min-h-0 min-w-0">
          <HomeHeroCategoryTile tile={tile} onSelectProduct={onSelectHotProduct} />
            </div>
          ))}
        </div>
  );

  const newsBody = <WaterEfficiencyPolicyScrollList onItemSelect={onSelectWaterEfficiencyPolicyItem} />;

  const discussBody = <IndustryPolicyScrollList onItemClick={onForum} />;

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pb-0.5 lg:flex-row lg:items-stretch lg:gap-3 sm:gap-4">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:min-w-0 lg:flex-[1.08]">
          {sectionCard(
            '热门产品',
            <Package className="h-4 w-4 sm:h-[18px] sm:w-[18px]" aria-hidden />,
            productBody,
            iconBtn(onOpenSupply, '进入供给市场'),
            'lg:h-full'
          )}
        </div>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 lg:min-w-0 lg:flex-[0.92]">
          <div className="flex min-h-0 flex-col lg:flex-1 lg:min-h-0">
            {sectionCard(
              '水效扶持✖️千万补贴',
              <span className="select-none text-base leading-none text-orange-600 sm:text-lg" aria-hidden>
                🔥
              </span>,
              newsBody,
              iconBtn(onOpenPolicyList, '进入产业资讯', 'hot'),
              'lg:flex-1 lg:min-h-0 lg:h-full',
              'hot'
            )}
          </div>
          <div className="flex min-h-0 flex-col lg:flex-1 lg:min-h-0">
            {sectionCard(
              '产业政策',
              <MessageSquare className="h-4 w-4 sm:h-[18px] sm:w-[18px]" aria-hidden />,
              discussBody,
              iconBtn(onForum, '进入需求中心'),
              'lg:flex-1 lg:min-h-0 lg:h-full',
              'default'
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// AIDiagnosisModal：首页水麒麟聊天弹层（布局参考节水云智能助手）
const AI_MODAL_INITIAL_GREETING =
  '您好！我是您的专属节水管家「水麒麟」。为了为您提供更贴合的节水建议，请问您目前主要的用水场景是什么？（例如：工厂制造、农业灌溉、商场物业等）';

const AI_MODAL_INPUT_PLACEHOLDER =
  '节水问题、水效分析、案例经验、产品服务推荐，都来问我吧~';

const AIDiagnosisModal = ({
  isOpen,
  onClose,
  variant = 'default',
}: {
  isOpen: boolean;
  onClose: () => void;
  /** 样式 3：参考设计稿用组件排版（非整图背景）；吉祥物视频定格首帧 */
  variant?: 'default' | 'style3';
}) => {
  const isStyle3 = variant === 'style3';
  const [messages, setMessages] = useState<{ role: 'ai' | 'user'; content: string }[]>([
    { role: 'ai', content: AI_MODAL_INITIAL_GREETING },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const footerInputRef = React.useRef<HTMLInputElement>(null);
  const heroTextareaRef = React.useRef<HTMLTextAreaElement>(null);
  const style3HeroVideoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  /** Esc 关闭，符合桌面弹层习惯 */
  React.useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  /** 防止背后页面滚动 */
  React.useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const context = messages.map((m) => `${m.role === 'ai' ? '助手' : '用户'}: ${m.content}`).join('\n');
      const response = await getWaterSavingDiagnosis(userMessage, context);
      setMessages((prev) => [...prev, { role: 'ai', content: response }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'ai', content: '抱歉，我现在遇到了一点小问题，请稍后再试。' }]);
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = () => {
    setMessages([{ role: 'ai', content: AI_MODAL_INITIAL_GREETING }]);
    setInput('');
    setLoading(false);
  };

  const showHeroLayout = messages.length <= 1;

  /** 样式 3 首屏：吉祥物定格在首帧 */
  React.useEffect(() => {
    if (!isStyle3 || !isOpen || !showHeroLayout) return;
    const v = style3HeroVideoRef.current;
    if (!v) return;
    const onLoaded = () => {
      try {
        v.pause();
        v.currentTime = 0.001;
      } catch {
        /* ignore */
      }
    };
    v.addEventListener('loadeddata', onLoaded);
    if (v.readyState >= 2) onLoaded();
    return () => v.removeEventListener('loadeddata', onLoaded);
  }, [isStyle3, isOpen, showHeroLayout]);

  /** 打开弹层后聚焦：首屏大输入框或底栏输入 */
  React.useEffect(() => {
    if (!isOpen) return;
    const id = window.requestAnimationFrame(() => {
      if (showHeroLayout && isStyle3) {
        heroTextareaRef.current?.focus();
      } else {
        footerInputRef.current?.focus();
      }
    });
    return () => window.cancelAnimationFrame(id);
  }, [isOpen, showHeroLayout, isStyle3]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
            onClick={onClose} 
          />
          
          <motion.div 
            initial={{ scale: 0.96, opacity: 0, y: 14 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 14 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="水麒麟智能助手"
            className="relative flex h-[min(90vh,860px)] w-full max-w-[1040px] flex-row overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-2xl shadow-gray-400/20"
          >
            {/* 左侧：对话管理（与截图一致；样式 3 略调色、Logo 为「水」字） */}
            <aside
              className={cn(
                'flex w-[220px] shrink-0 flex-col border-r px-4 py-5 sm:w-[248px] sm:px-5 sm:py-6',
                isStyle3 ? 'border-gray-100 bg-white' : 'border-gray-100 bg-[#f7f8fa]'
              )}
            >
              <div className="mb-6 flex items-center gap-2.5">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center bg-gradient-to-br from-teal-500 to-cyan-600 shadow-md shadow-teal-500/20',
                    isStyle3 ? 'rounded-lg' : 'rounded-xl'
                  )}
                >
                  {isStyle3 ? (
                    <span className="select-none text-lg font-black leading-none text-white" aria-hidden>
                      水
                    </span>
                  ) : (
                    <Droplets className="h-5 w-5 text-white" aria-hidden />
                  )}
                  </div>
                <span className="text-base font-black tracking-tight text-gray-900">水麒麟</span>
               </div>
              <button
                type="button"
                onClick={startNewChat}
                className={cn(
                  'mb-5 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold shadow-sm transition-colors active:scale-[0.99]',
                  isStyle3
                    ? 'border border-gray-200/80 bg-gray-50 text-gray-800 hover:border-teal-200 hover:bg-teal-50/60 hover:text-teal-900'
                    : 'border border-gray-200/90 bg-white text-gray-700 hover:border-teal-200 hover:bg-teal-50/50 hover:text-teal-800'
                )}
              >
                <Plus className="h-4 w-4 shrink-0 text-teal-600" aria-hidden />
                开启新对话
              </button>
              <div className="min-h-0 flex-1">
                <p className="mb-2 px-0.5 text-xs font-black text-gray-500">对话记录</p>
                <button
                  type="button"
                  onClick={() => {
                    if (showHeroLayout && isStyle3) {
                      heroTextareaRef.current?.focus();
                    } else {
                      footerInputRef.current?.focus();
                    }
                  }}
                  className={cn(
                    'w-full rounded-xl border border-dashed px-3 py-10 text-center text-xs font-medium leading-relaxed transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50',
                    isStyle3
                      ? 'border-gray-200/90 bg-gray-50/80 text-gray-400 hover:border-teal-200/80 hover:bg-teal-50/40 hover:text-gray-600'
                      : 'border-gray-200 bg-white/70 text-gray-400 hover:border-teal-200/70 hover:bg-teal-50/30 hover:text-gray-600'
                  )}
                >
                  你的对话记录会显示在这里
                  <span className="mt-2 block text-[10px] font-bold text-teal-600/80">点击去输入</span>
                </button>
                  </div>
            </aside>

            {/* 主区：吉祥物 / 对话 / 底部输入 */}
            <div
              className={cn(
                'relative flex min-h-0 min-w-0 flex-1 flex-col',
                isStyle3 ? 'bg-[#e8eef1]' : 'bg-gradient-to-b from-white to-gray-50/90'
              )}
            >
              <button
                type="button"
                onClick={onClose}
                className="absolute right-3 top-3 z-10 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 sm:right-4 sm:top-4"
                aria-label="关闭"
              >
                <X className="h-5 w-5" />
               </button>

              {showHeroLayout && !isStyle3 ? (
                <div className="flex min-h-0 flex-1 flex-col justify-end px-5 pb-1 pt-12 sm:px-8 sm:pb-2 sm:pt-14">
                  <div className="mb-4 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-end sm:gap-8">
                    <div className="relative h-32 w-32 shrink-0 sm:h-40 sm:w-40">
                      <div className="pointer-events-none absolute -inset-2 rounded-[2rem] bg-slate-200/45 blur-2xl" aria-hidden />
                      <video
                        className="relative z-[1] h-full w-full object-contain object-bottom drop-shadow-[0_12px_24px_rgba(30,41,59,0.08)]"
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="metadata"
                      >
                        <source src="/kirin-mascot.mp4" type="video/mp4" />
                      </video>
                    </div>
                    <div className="max-w-md pb-0.5">
                      <h2 className="text-2xl font-black leading-tight text-gray-900 sm:text-[1.75rem]">
                        我是<span className="text-teal-600">水麒麟</span>
                      </h2>
                      <p className="mt-1 text-base font-bold text-gray-500 sm:text-lg">你的智能AI助手</p>
                  </div>
               </div>
                </div>
              ) : null}

              {showHeroLayout && isStyle3 ? (
                <div className="flex min-h-0 flex-1 flex-col pt-12">
                  <div className="flex min-h-0 flex-1 flex-col justify-center px-5 pb-3 pt-1 sm:px-10 sm:pb-5">
                    <div className="mx-auto flex w-full max-w-[42rem] flex-col gap-7 sm:max-w-[48rem] sm:gap-9">
                      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-end sm:justify-center sm:gap-12">
                        <div className="relative flex w-full max-w-[13rem] shrink-0 flex-col items-center justify-end sm:max-w-[15rem]">
                          {/* 与主区 #e8eef1 同系浅灰蓝，避免青色光斑与背景割裂 */}
                          <div
                            className="pointer-events-none absolute inset-x-[-18%] bottom-0 top-[10%] rounded-[2rem] bg-[#dce5ea]/55 blur-3xl"
                            aria-hidden
                          />
                          <video
                            ref={style3HeroVideoRef}
                            className="relative z-[1] max-h-[min(40vh,300px)] w-full object-contain object-bottom drop-shadow-[0_18px_36px_rgba(30,41,59,0.1)] sm:max-h-[min(44vh,340px)]"
                            muted
                            playsInline
                            preload="auto"
                            autoPlay={false}
                            loop={false}
                            controls={false}
                            disablePictureInPicture
                          >
                            <source src="/kirin-mascot.mp4" type="video/mp4" />
                          </video>
               </div>
                        <div className="min-w-0 flex-1 pb-0.5 text-center sm:pb-2 sm:text-left">
                          <p className="text-xl font-black leading-tight text-gray-900 sm:text-2xl lg:text-[1.75rem]">
                            <span>我是</span>
                            <span className="text-[#26C2B9]">水麒麟</span>
                          </p>
                          <p className="mt-2 text-sm font-bold text-gray-800 sm:text-base">你的智能AI助手</p>
            </div>
                      </div>
                      <div className="rounded-[1.25rem] border border-gray-100/90 bg-white p-4 shadow-[0_14px_48px_-18px_rgba(15,118,110,0.18)] ring-1 ring-gray-100/80 sm:rounded-3xl sm:p-5">
                        <textarea
                          ref={heroTextareaRef}
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              void handleSend();
                            }
                          }}
                          rows={4}
                          placeholder={AI_MODAL_INPUT_PLACEHOLDER}
                          className="min-h-[7.5rem] w-full resize-none border-0 bg-transparent text-sm leading-relaxed text-gray-800 placeholder:text-gray-400 focus:outline-none sm:min-h-[8.5rem] sm:text-[15px]"
                        />
                        <div className="mt-2 flex items-center justify-end gap-2.5 sm:mt-3">
                          <button
                            type="button"
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200 hover:text-gray-700"
                            aria-label="语音输入（演示）"
                          >
                            <Mic className="h-[18px] w-[18px]" aria-hidden />
               </button>
                          <button
                            type="button"
                            onClick={() => void handleSend()}
                            disabled={!input.trim() || loading}
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#26C2B9] text-white shadow-md shadow-teal-500/25 transition hover:brightness-95 active:scale-95 disabled:pointer-events-none disabled:opacity-35"
                            aria-label="发送"
                          >
                            <Send className="h-4 w-4 sm:h-[18px] sm:w-[18px]" aria-hidden />
                          </button>
                          </div>
                       </div>
                    </div>
                  </div>
                  <p className="shrink-0 px-4 pb-2 text-center text-[10px] font-bold tracking-wide text-gray-400/95">
                    智能助手回答仅供参考 · 重要决策请以专业机构意见为准
                  </p>
               </div>
              ) : null}

              {!showHeroLayout ? (
                  <div 
                    ref={scrollRef}
                  className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-12 sm:space-y-5 sm:px-8 sm:py-14"
                  >
                    {messages.map((m, i) => (
                      <motion.div 
                        key={i}
                      initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                      className={cn('flex gap-3', m.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
                    >
                      <div
                        className={cn(
                          'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm',
                          m.role === 'ai'
                            ? 'bg-gradient-to-br from-teal-500 to-cyan-600'
                            : 'border border-gray-200 bg-white'
                        )}
                      >
                        {m.role === 'ai' ? (
                          <Droplets className="h-4 w-4 text-white" aria-hidden />
                        ) : (
                          <User className="h-4 w-4 text-gray-500" aria-hidden />
                        )}
                         </div>
                      <div
                        className={cn(
                          'max-w-[min(100%,28rem)] rounded-2xl px-4 py-3 text-sm leading-relaxed sm:text-[15px]',
                           m.role === 'ai' 
                            ? 'border border-gray-100 bg-white text-gray-800 shadow-sm'
                            : 'bg-teal-600 text-white shadow-md'
                        )}
                      >
                           {m.content.split('\n').map((line, idx) => (
                          <p key={idx} className={idx > 0 ? 'mt-2' : ''}>
                            {line}
                          </p>
                           ))}
                         </div>
                      </motion.div>
                    ))}
                    {loading && (
                    <div className="flex gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600">
                        <Droplets className="h-4 w-4 animate-pulse text-white" aria-hidden />
                         </div>
                      <div className="rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
                        <div className="flex gap-1">
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal-400 [animation-delay:-0.2s]" />
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal-400 [animation-delay:-0.1s]" />
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal-400" />
                            </div>
                         </div>
                      </div>
                    )}
                  </div>
              ) : null}

              {(!isStyle3 || !showHeroLayout) && (
                <div className="shrink-0 border-t border-gray-100 bg-white/95 px-4 py-3 sm:px-6 sm:py-4">
                  <div className="mx-auto flex max-w-[640px] items-center gap-1 rounded-full border border-gray-200 bg-white py-1 pl-4 pr-1 shadow-md shadow-gray-200/40 sm:gap-2 sm:py-1.5 sm:pl-5">
                    <input
                      ref={footerInputRef}
                      type="text"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          void handleSend();
                        }
                      }}
                      placeholder={AI_MODAL_INPUT_PLACEHOLDER}
                      className="min-w-0 flex-1 border-0 bg-transparent py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none sm:text-[15px]"
                    />
                             <button 
                      type="button"
                      className="shrink-0 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-teal-600"
                      aria-label="语音输入（演示）"
                    >
                      <Mic className="h-5 w-5" aria-hidden />
                             </button>
                             <button 
                      type="button"
                      onClick={() => void handleSend()}
                             disabled={!input.trim() || loading}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-500 text-white shadow-md shadow-teal-500/25 transition-all hover:bg-teal-600 active:scale-95 disabled:pointer-events-none disabled:opacity-35 sm:h-10 sm:w-10"
                      aria-label="发送"
                           >
                      <Send className="h-4 w-4 sm:h-[18px] sm:w-[18px]" aria-hidden />
                           </button>
                        </div>
                  <p className="mt-2 text-center text-[10px] font-bold tracking-wide text-gray-400">
                    智能助手回答仅供参考 · 重要决策请以专业机构意见为准
                     </p>
                  </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};


/** 系统管理员 · 节水产业分类树（与样式4供给侧导航同源数据） */
function WorkbenchIndustryCategoryReferencePanel() {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {CATEGORIES_INDUSTRY_STYLE4_FLAT.map((row) => (
          <div
            key={row.id}
            className="flex flex-col rounded-xl border border-gray-200/90 bg-white p-4 shadow-sm shadow-teal-900/5"
          >
            <h4 className="border-b border-gray-100 pb-2 text-sm font-black text-gray-900">{row.name}</h4>
            {row.examples.length > 0 ? (
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {row.examples.map((ex) => (
                  <li
                    key={ex}
                    className="rounded-full border border-gray-100 bg-gray-50 px-2.5 py-0.5 text-[11px] font-semibold text-gray-700"
                  >
                    {ex}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-[11px] font-bold text-gray-400">暂无示例词条</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const WORKBENCH_INDUSTRY_INFO_GROUP = '产业资讯';
const WORKBENCH_INDUSTRY_INFO_SUB_TABS = ['政策公开', '技术标准', '新闻资讯'] as const;
const WORKBENCH_FORM_MANAGEMENT_GROUP = '表单管理';
const WORKBENCH_FORM_MANAGEMENT_SUB_TABS = ['节水产业分类', '定额产品库', '设备映射表'] as const;

type WorkbenchMenuLeaf = { type: 'leaf'; name: string; icon: React.ReactNode };
type WorkbenchMenuGroup = {
  type: 'group';
  name: string;
  icon: React.ReactNode;
  children: WorkbenchMenuLeaf[];
};
type WorkbenchMenuEntry = WorkbenchMenuLeaf | WorkbenchMenuGroup;

function workbenchLeaf(name: string, icon: React.ReactNode): WorkbenchMenuLeaf {
  return { type: 'leaf', name, icon };
}

function collectWorkbenchMenuTabNames(items: WorkbenchMenuEntry[]): string[] {
  const names: string[] = [];
  for (const item of items) {
    if (item.type === 'leaf') names.push(item.name);
    else for (const child of item.children) names.push(child.name);
  }
  return names;
}

function isWorkbenchIndustryInfoSubTab(tab: string): boolean {
  return (WORKBENCH_INDUSTRY_INFO_SUB_TABS as readonly string[]).includes(tab);
}

function isWorkbenchFormManagementSubTab(tab: string): boolean {
  return (WORKBENCH_FORM_MANAGEMENT_SUB_TABS as readonly string[]).includes(tab);
}

function buildWorkbenchMenuItems(identity: PortalUserIdentity): WorkbenchMenuEntry[] {
  if (identity === '用水户主体') {
    return [
      workbenchLeaf('我的申请', <ClipboardList className="w-5 h-5" />),
      workbenchLeaf('典型案例', <Calendar className="w-5 h-5" />),
      workbenchLeaf('需求中心', <ListTodo className="w-5 h-5" />),
      workbenchLeaf('我的消息', <MessageSquare className="w-5 h-5" />),
      workbenchLeaf('我的收藏', <Heart className="w-5 h-5" />),
    ];
  }
  if (identity === '系统管理员') {
    return [
      workbenchLeaf('仪表盘', <LayoutDashboard className="w-5 h-5" />),
      workbenchLeaf('我的审核', <ShieldCheck className="w-5 h-5" />),
      {
        type: 'group',
        name: WORKBENCH_FORM_MANAGEMENT_GROUP,
        icon: <ClipboardList className="w-5 h-5" />,
        children: [
          workbenchLeaf('节水产业分类', <Layers className="w-4 h-4" />),
          workbenchLeaf('定额产品库', <Database className="w-4 h-4" />),
          workbenchLeaf('设备映射表', <Link2 className="w-4 h-4" />),
        ],
      },
      {
        type: 'group',
        name: WORKBENCH_INDUSTRY_INFO_GROUP,
        icon: <Newspaper className="w-5 h-5" />,
        children: [
          workbenchLeaf('政策公开', <FileText className="w-4 h-4" />),
          workbenchLeaf('技术标准', <Activity className="w-4 h-4" />),
          workbenchLeaf('新闻资讯', <Newspaper className="w-4 h-4" />),
        ],
      },
      workbenchLeaf('企业管理', <Store className="w-5 h-5" />),
      workbenchLeaf('产品管理', <Boxes className="w-5 h-5" />),
      workbenchLeaf('典型案例', <Calendar className="w-5 h-5" />),
      workbenchLeaf('需求中心', <ListTodo className="w-5 h-5" />),
      workbenchLeaf('我的消息', <MessageSquare className="w-5 h-5" />),
      workbenchLeaf('我的收藏', <Heart className="w-5 h-5" />),
    ];
  }
  return [
    workbenchLeaf('数据总览', <LayoutDashboard className="w-5 h-5" />),
    workbenchLeaf('我的申请', <ClipboardList className="w-5 h-5" />),
    workbenchLeaf('产品管理', <Boxes className="w-5 h-5" />),
    workbenchLeaf('企业管理', <Store className="w-5 h-5" />),
    workbenchLeaf('需求中心', <ListTodo className="w-5 h-5" />),
    workbenchLeaf('典型案例', <Calendar className="w-5 h-5" />),
    workbenchLeaf('我的消息', <MessageSquare className="w-5 h-5" />),
    workbenchLeaf('我的收藏', <Heart className="w-5 h-5" />),
  ];
}

/** 需在固定视口内自行滚动的后台页（左树右表、全屏表格等） */
const WORKBENCH_VIEWPORT_FILL_TABS = new Set(['定额产品库', '产品管理', '节水产业分类']);

const IndustryDashboard = ({
  onLogout,
  onGoHome,
  menuActiveTab,
  onMenuActiveTabChange,
  portalUserIdentity,
  demandCenterOpenCreate,
  onDemandCenterOpenCreateConsumed,
  onOpenProductFromMessage,
  onOpenProductById,
  onViewCaseFromFavorites,
}: {
  onLogout: () => void;
  onGoHome: () => void;
  menuActiveTab: string;
  onMenuActiveTabChange: (tab: string) => void;
  portalUserIdentity: PortalUserIdentity;
  demandCenterOpenCreate?: boolean;
  onDemandCenterOpenCreateConsumed?: () => void;
  onOpenProductFromMessage?: (msg: PortalContactMessage) => void;
  onOpenProductById?: (productId: number) => void;
  onViewCaseFromFavorites?: (caseId: number) => void;
}) => {
  const [applications, setApplications] = useState<WorkbenchApplicationRow[]>(() =>
    portalUserIdentity === '用水户主体'
      ? [...WORKBENCH_WATER_USER_DEMO_APPLICATIONS]
      : [...WORKBENCH_DEMO_APPLICATIONS]
  );
  const [demandHighlightFromMessage, setDemandHighlightFromMessage] = useState<number | null>(null);
  /** 我的消息 → 我的申请详情（典型案例进度） */
  const [applicationDetailFromMessageId, setApplicationDetailFromMessageId] = useState<string | null>(
    null
  );

  const applicationsForMyPanel = useMemo(
    () => workbenchApplicationsForIdentity(portalUserIdentity, applications),
    [applications, portalUserIdentity]
  );
  /** 分组菜单默认收起；选中子项时由 selectWorkbenchTab / menuActiveTab 同步展开对应分组 */
  const [expandedMenuGroups, setExpandedMenuGroups] = useState<Set<string>>(() => new Set());

  const menuItems = useMemo(
    () => buildWorkbenchMenuItems(portalUserIdentity),
    [portalUserIdentity]
  );

  const selectWorkbenchTab = useCallback(
    (tab: string) => {
      onMenuActiveTabChange(tab);
      setExpandedMenuGroups((prev) => {
        let changed = false;
        const next = new Set(prev);
        if (isWorkbenchFormManagementSubTab(tab) && !next.has(WORKBENCH_FORM_MANAGEMENT_GROUP)) {
          next.add(WORKBENCH_FORM_MANAGEMENT_GROUP);
          changed = true;
        }
        if (isWorkbenchIndustryInfoSubTab(tab) && !next.has(WORKBENCH_INDUSTRY_INFO_GROUP)) {
          next.add(WORKBENCH_INDUSTRY_INFO_GROUP);
          changed = true;
        }
        return changed ? next : prev;
      });
    },
    [onMenuActiveTabChange]
  );

  const validMenuTabNames = useMemo(() => new Set(collectWorkbenchMenuTabNames(menuItems)), [menuItems]);

  useEffect(() => {
    const groupsToOpen: string[] = [];
    if (isWorkbenchIndustryInfoSubTab(menuActiveTab)) groupsToOpen.push(WORKBENCH_INDUSTRY_INFO_GROUP);
    if (isWorkbenchFormManagementSubTab(menuActiveTab)) groupsToOpen.push(WORKBENCH_FORM_MANAGEMENT_GROUP);
    if (groupsToOpen.length === 0) return;
    setExpandedMenuGroups((prev) => {
      let changed = false;
      const next = new Set(prev);
      for (const name of groupsToOpen) {
        if (!next.has(name)) {
          next.add(name);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [menuActiveTab]);

  useEffect(() => {
    // 供方市场「一键发布产品」直达：非产业侧菜单也保留产品管理页
    if (
      !validMenuTabNames.has(menuActiveTab) &&
      menuActiveTab !== '产品管理' &&
      menuActiveTab !== '首页管理'
    ) {
      onMenuActiveTabChange(getWorkbenchDefaultMenuTab(portalUserIdentity));
    }
  }, [validMenuTabNames, menuActiveTab, onMenuActiveTabChange, portalUserIdentity]);

  const toggleMenuGroup = useCallback((groupName: string) => {
    setExpandedMenuGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupName)) next.delete(groupName);
      else next.add(groupName);
      return next;
    });
  }, []);

  const viewportFillTab = WORKBENCH_VIEWPORT_FILL_TABS.has(menuActiveTab);

  return (
    <div className="flex min-h-[min(100vh,920px)] flex-col overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-lg shadow-teal-900/8 lg:h-[min(920px,calc(100dvh-5.5rem))] lg:flex-row lg:overflow-hidden">
      {/* 侧栏：深底 + 青绿高亮；菜单区可滚动以展示系统管理员等完整 14 项 */}
      <aside className="flex w-full shrink-0 flex-col border-b border-white/10 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 lg:h-full lg:min-h-0 lg:w-72 lg:border-b-0 lg:border-r lg:border-teal-900/20">
        <div className="shrink-0 border-b border-white/10 px-5 py-6 sm:px-6">
          <button
            type="button"
            onClick={onGoHome}
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-full border border-teal-500/50 bg-transparent px-3 py-2.5 text-xs font-black text-white/95 transition hover:border-teal-400 hover:bg-white/5 hover:text-white"
            aria-label="返回首页"
          >
            <ChevronRight className="h-4 w-4 shrink-0 rotate-180" aria-hidden />
            返回首页
          </button>
          <p className="text-[10px] font-black uppercase tracking-widest text-teal-400/90">工作台</p>
          <p className="mt-1 text-lg font-black text-white">你好</p>
          <p className="mt-0.5 text-xs font-bold text-white/45">水麒麟节水产业数字化服务</p>
        </div>

        <nav className="no-scrollbar flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden overscroll-contain scroll-smooth px-3 py-4 sm:px-4">
          {menuItems.map((item) => {
            if (item.type === 'leaf') {
              const active = menuActiveTab === item.name;
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => selectWorkbenchTab(item.name)}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-xl px-4 py-2.5 text-left text-[13px] font-black transition-all',
                    active
                      ? 'bg-teal-600 text-white shadow-md shadow-teal-900/40 ring-1 ring-teal-400/35'
                      : 'text-white/45 hover:bg-white/5 hover:text-white/85'
                  )}
                >
                  <span
                    className={cn(
                      'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors',
                      active
                        ? 'border-white/20 bg-white/10 text-white'
                        : 'border-white/10 bg-white/5 text-white/35'
                    )}
                  >
                    {item.icon}
                  </span>
                  <span className="min-w-0 flex-1 break-words leading-snug">{item.name}</span>
                </button>
              );
            }

            const expanded = expandedMenuGroups.has(item.name);
            const groupChildActive = item.children.some((c) => c.name === menuActiveTab);
            return (
              <div key={item.name} className="flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => toggleMenuGroup(item.name)}
                  aria-expanded={expanded}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-xl px-4 py-2.5 text-left text-[13px] font-black transition-all',
                    groupChildActive
                      ? 'bg-white/10 text-white ring-1 ring-teal-400/25'
                      : 'text-white/45 hover:bg-white/5 hover:text-white/85'
                  )}
                >
                  <span
                    className={cn(
                      'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors',
                      groupChildActive
                        ? 'border-teal-400/35 bg-teal-600/20 text-teal-100'
                        : 'border-white/10 bg-white/5 text-white/35'
                    )}
                  >
                    {item.icon}
                  </span>
                  <span className="min-w-0 flex-1 break-words leading-snug">{item.name}</span>
                  <ChevronDown
                    className={cn(
                      'mt-2 h-4 w-4 shrink-0 text-white/50 transition-transform',
                      expanded && 'rotate-180'
                    )}
                    aria-hidden
                  />
                </button>
                <AnimatePresence initial={false}>
                  {expanded ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className="overflow-hidden"
                    >
                      <div className="ml-3 space-y-0.5 border-l border-white/10 py-1 pl-2">
                        {item.children.map((child) => {
                          const childActive = menuActiveTab === child.name;
                          return (
                            <button
                              key={child.name}
                              type="button"
                              onClick={() => selectWorkbenchTab(child.name)}
                              className={cn(
                                'flex w-full items-center gap-2.5 rounded-lg py-2 pl-2.5 pr-3 text-left text-xs font-black transition-all',
                                childActive
                                  ? 'bg-teal-600 text-white shadow-sm shadow-teal-900/30'
                                  : 'text-white/50 hover:bg-white/5 hover:text-white/90'
                              )}
                            >
                              <span
                                className={cn(
                                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-md border',
                                  childActive
                                    ? 'border-white/20 bg-white/10 text-white'
                                    : 'border-white/10 bg-white/5 text-white/40'
                                )}
                              >
                                {child.icon}
                              </span>
                              <span className="min-w-0 flex-1 truncate">{child.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-white/10 p-4 sm:p-5">
           <button 
            type="button"
             onClick={onLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-[13px] font-black text-red-300 transition hover:bg-red-500/20 hover:text-red-200"
           >
            <LogOut className="h-4 w-4 shrink-0" />
              退出登录
           </button>
        </div>
      </aside>

      {/* 主内容 */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-gradient-to-br from-gray-50/90 via-white to-teal-50/30">
        <header className="border-b border-gray-100 bg-white/80 px-5 py-4 backdrop-blur-sm sm:px-6 sm:py-5">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            <span className="h-6 w-1 shrink-0 rounded-full bg-teal-500" aria-hidden />
            <h2 className="break-words text-lg font-black text-gray-900 sm:text-xl">{menuActiveTab}</h2>
          </div>
        </header>

        <div
          className={cn(
            'flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain',
            viewportFillTab ? 'p-0' : 'p-4 sm:p-6 lg:p-8'
          )}
        >
          <div
            className={cn(
              viewportFillTab
                ? 'flex min-h-0 min-h-[min(720px,calc(100dvh-12rem))] flex-1 flex-col overflow-hidden bg-white'
                : 'w-full rounded-xl border border-gray-200/90 bg-white p-4 shadow-sm shadow-teal-900/5 sm:rounded-2xl sm:p-6 lg:p-8'
            )}
          >
            {menuActiveTab === '数据总览' ? (
              <DataOverviewDashboard />
            ) : menuActiveTab === '仪表盘' ? (
              <SystemAdminDashboard
                applications={applications}
                onNavigateTab={onMenuActiveTabChange}
              />
            ) : menuActiveTab === '我的申请' ? (
              <WorkbenchMyApplicationsPanel
                applications={applicationsForMyPanel}
                portalUserIdentity={portalUserIdentity}
                initialOpenDetailId={applicationDetailFromMessageId}
                onInitialOpenDetailConsumed={() => setApplicationDetailFromMessageId(null)}
              />
            ) : menuActiveTab === '我的审核' ? (
              <WorkbenchMyReviewsPanel
                applications={applications}
                onDecide={(id, outcome, rejectReason) =>
                  setApplications((prev) =>
                    prev.map((r) =>
                      r.id === id
                        ? {
                            ...r,
                            status: outcome,
                            rejectReason: outcome === '已驳回' ? rejectReason?.trim() || r.rejectReason : undefined,
                            reviewOpinion:
                              outcome === '已通过'
                                ? '审核通过'
                                : outcome === '已驳回'
                                  ? rejectReason?.trim() || r.reviewOpinion
                                  : r.reviewOpinion,
                          }
                        : r
                    )
                  )
                }
              />
            ) : menuActiveTab === '节水产业分类' ? (
              <WorkbenchIndustryCategoryParamPanel />
            ) : menuActiveTab === '政策公开' ? (
              <WorkbenchPolicyTechPanel kind="policy" />
            ) : menuActiveTab === '技术标准' ? (
              <WorkbenchPolicyTechPanel kind="tech" />
            ) : menuActiveTab === '新闻资讯' ? (
              <WorkbenchNewsAdminPanel />
            ) : menuActiveTab === '定额产品库' ? (
              <WorkbenchQuotaProductLibraryPanel />
            ) : menuActiveTab === '设备映射表' ? (
              <WorkbenchEquipmentMappingPanel />
            ) : menuActiveTab === '首页管理' ? (
              <WorkbenchHomeAdminPanel />
            ) : menuActiveTab === '产品管理' ? (
              <WorkbenchProductAdminPanel />
            ) : menuActiveTab === '企业管理' ? (
              portalUserIdentity === '系统管理员' ? (
                <WorkbenchEnterpriseAdminListPanel />
              ) : (
                <WorkbenchEnterpriseAdminPanel
                  onAuditApplication={(row) => setApplications((prev) => [row, ...prev])}
                />
              )
            ) : menuActiveTab === '我的消息' ? (
              <WorkbenchMyMessagesPanel
                portalUserIdentity={portalUserIdentity}
                applications={applicationsForMyPanel}
                onLocateDemand={(demandId) => {
                  setDemandHighlightFromMessage(demandId);
                  onMenuActiveTabChange('需求中心');
                }}
                onOpenProduct={(msg) => onOpenProductFromMessage?.(msg)}
                onGoApproval={() => onMenuActiveTabChange('我的审核')}
                onViewCase={(caseId) => onViewCaseFromFavorites?.(caseId)}
                onGoEnterprise={() => onMenuActiveTabChange('企业管理')}
                onViewApplicationProgress={(applicationId) => {
                  setApplicationDetailFromMessageId(applicationId);
                  onMenuActiveTabChange('我的申请');
                }}
              />
            ) : menuActiveTab === '我的收藏' ? (
              <WorkbenchMyFavoritesPanel
                onOpenProduct={(productId) => onOpenProductById?.(productId)}
                onLocateDemand={(demandId) => {
                  setDemandHighlightFromMessage(demandId);
                  onMenuActiveTabChange('需求中心');
                }}
                onViewCase={(caseId) => onViewCaseFromFavorites?.(caseId)}
              />
            ) : menuActiveTab === '需求中心' ? (
              <WorkbenchDemandCenterPanel
                portalUserIdentity={portalUserIdentity}
                initialOpenCreate={demandCenterOpenCreate}
                onInitialOpenCreateConsumed={onDemandCenterOpenCreateConsumed}
                highlightDemandId={demandHighlightFromMessage}
                onHighlightConsumed={() => setDemandHighlightFromMessage(null)}
              />
            ) : menuActiveTab === '典型案例' ? (
              <WorkbenchCasesAdminPanel onAuditApplication={(row) => setApplications((prev) => [row, ...prev])} />
            ) : (
              <div className="flex min-h-[320px] flex-col items-center justify-center px-4 py-16 text-center">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-teal-100 bg-teal-50 text-teal-500">
                  {menuItems.find((m) => m.name === menuActiveTab)?.icon}
               </div>
                <h3 className="text-lg font-black text-gray-700">功能模块「{menuActiveTab}」暂未开放</h3>
                <p className="mt-2 max-w-sm text-xs font-bold text-gray-400">后续接入后将在此展示列表与操作入口</p>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

// IndustryLogin Component
const IndustryLogin = ({ onLogin }: { onLogin: () => void }) => {
  return (
    <div className="min-h-[800px] flex items-center justify-center py-20 relative overflow-hidden">
       {/* Background Decoration */}
       <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px]" />
       </div>

       <motion.div 
         initial={{ opacity: 0, y: 30 }}
         animate={{ opacity: 1, y: 0 }}
         className="w-full max-w-[1000px] bg-white rounded-[60px] overflow-hidden border border-gray-100 shadow-2xl flex relative z-10"
       >
          {/* Left Side: Illustration & Info */}
          <div className="w-1/2 bg-blue-600 p-16 text-white flex flex-col justify-between">
             <div>
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-10">
                   <Droplets className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-4xl font-black mb-6 leading-tight">产业主体服务门户</h2>
                <p className="text-blue-50/70 text-lg font-medium leading-relaxed mb-10">
                   为节水设备商、技术提供方以及工程建设企业提供全方位的供需对接、项目申报以及产业展示服务。
                </p>
                <div className="space-y-6">
                   {[
                     { icon: <Zap className="w-4 h-4" />, text: "实时需求精准匹配" },
                     { icon: <Globe className="w-4 h-4" />, text: "3D云展厅在线入驻" },
                     { icon: <Activity className="w-4 h-4" />, text: "产业大数据分析看板" }
                   ].map((f, i) => (
                     <div key={i} className="flex items-center gap-4 text-sm font-bold">
                        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">{f.icon}</div>
                        {f.text}
                     </div>
                   ))}
                </div>
             </div>
             <div className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em]">Smart Water Saving Industrial Portal</div>
          </div>

          {/* Right Side: Login Form */}
          <div className="w-1/2 p-16 flex flex-col justify-center">
             <div className="mb-12">
                <h3 className="text-3xl font-black text-gray-800 mb-2">欢迎回来</h3>
                <p className="text-sm font-bold text-gray-400">请使用您的企业账号登录系统</p>
             </div>

             <div className="space-y-8">
                <div className="space-y-4">
                   <label className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">企业账号 / 统一信用代码</label>
                   <div className="relative group">
                      <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-blue-600 transition-colors" />
                      <input className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-16 py-5 font-bold text-gray-700 focus:bg-white focus:border-blue-200 focus:outline-none transition-all" placeholder="JS_WATER_TECH" />
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                      <label className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">访问密码</label>
                      <button className="text-[10px] text-blue-600 font-black uppercase tracking-wider hover:underline">找回密码</button>
                   </div>
                   <div className="relative group">
                      <ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-blue-600 transition-colors" />
                      <input type="password" underline className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-16 py-5 font-bold text-gray-700 focus:bg-white focus:border-blue-200 focus:outline-none transition-all" defaultValue="password123" />
                   </div>
                </div>

                <button 
                  onClick={onLogin}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-6 rounded-3xl shadow-2xl shadow-blue-100 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                   进入管理后台
                   <ChevronRight className="w-5 h-5" />
                </button>

                <div className="pt-8 border-t border-gray-50 text-center">
                   <button className="text-sm font-bold text-gray-400 hover:text-gray-800 transition-colors">
                      还没有账号？<span className="text-blue-600 font-black ml-1">立即注册申请</span>
                   </button>
                </div>
             </div>
          </div>
       </motion.div>
    </div>
  );
};

// CasesModule (New Section)
const CasesModule = ({
  initialOpenDetailCaseId = null,
  onClearedInitialDetail,
}: {
  initialOpenDetailCaseId?: number | null;
  onClearedInitialDetail?: () => void;
}) => {
  const [filter1, setFilter1] = useState<string>('全部');
  const [searchQuery, setSearchQuery] = useState('');

  const primaryCategories = ['全部', '农业节水', '工业节水', '城镇生活节水', '非常规水开发利用', '通用节水'];

  const CASES_DATA = [
    ...PORTAL_CASES_HOME_FEATURED,
    {
      id: 1,
      cat1: '农业节水',
      name: '新疆沙雅县：农业深度节水试点实现四维共赢',
      content: '新疆沙雅县地处塔克拉玛干沙漠北缘，长期受水资源时空不均、农业用水效率低等难题制约。近年来，沙雅县立足节水增收“沙雅模式”实践经验，初步实现了从“高效节水增收”向“高效用水增收”的转型升级。',
      image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=600',
      region: '新疆',
      source: '新疆维吾尔自治区水利厅',
      date: '2026-03-20',
      views: '1,280',
      fullContent: [
        { type: 'text', title: '一、背景', text: '新疆沙雅县地处塔克拉玛干沙漠北缘，长期受水资源时空不均、农业用水效率低等难题制约。近年来，沙雅县立足节水增收“沙雅模式”实践经验，初步实现了从“高效节水增收”向“高效用水增收”的转型升级，在节水、经济、社会、生态领域收获显著成效。' },
        { type: 'image', url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=1200', caption: '50万亩高效节水试点项目棉花采收' },
        { type: 'text', title: '二、做法', text: '一是工程筑基：织密多元供水网，为破解水源保障困境，该县投资7.53亿元，完成结力克水库管道供水、3个村灌溉渠道工程等项目，建成16.15万亩高标准灌溉水源保障工程，供水保证率超90%。\n二是科技赋能：高标准农田提质增效，该县推广内镶贴片式低压小流量滴灌带200万亩，安装自动化施肥罐4万亩、自动化球罐1万亩，探索试行“自动化设备+农技指导”社会化管护模式6000亩。' },
        { type: 'image', url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=1200', caption: '高标准农田滴灌管网布设' },
        { type: 'text', title: '三、成效', text: '三是制度创新：筑牢节水长效机制，该县推广初始水权分配等“六位一体”节水机制，覆盖农田250万亩，优化完善五项配套制度，形成精细化管理格局，以“制度+科技”筑牢节约水管理根基。\n棉花苗期用水量从280立方米/亩降至240立方米/亩，亩均节水40立方米，水利生产率提高至1.42kg/m³；经济方面，2025年试点区籽棉单产超500公斤，亩均增产60公斤、增收300元；社会影响方面，灌溉保证率提高至90%以上，农村居民可支配收入达2.4万元以上，农民生活水平持续改善。' }
      ]
    },
    {
      id: 2,
      cat1: '工业节水',
      name: '江苏两高校入选水利部合同节水典型案例',
      content: '8月27日，水利部办公厅印发《关于发布合同节水典型案例的通知》，江苏省内两高校入选。',
      image: 'https://images.unsplash.com/photo-1558449028-b53a39d100fc?auto=format&fit=crop&q=80&w=600',
      region: '江苏',
      source: '江苏省节约用水办公室',
      date: '2024-09-11',
      views: '2,450',
      fullContentText: '8月27日，水利部办公厅印发《关于发布合同节水典型案例的通知》，江苏省两高校入选。\n\n常州工程职业技术学院采用“节水效益分享型”合同节水管理模式，建设智慧节水管理系统，覆盖校区全部供水区域，具有远程用水监测、统计分析、漏水预警等功能；建设智慧探漏监测系统，实现管道运行及渗漏情况的实时监测和管道漏点的精确地位；建设雨水浇灌泵站和浇灌管网，将雨水作为学校绿化浇灌主要水源；改造老化供水管网120米。实施合同节水后，学校年平均用水量下降13.8万立方米，节水率为26.9%，年平均节约水费约58万元。\n\n南京钟山职业技术学院采用“用水费用托管型+节水效益分享型”合同节水管理模式，学校与节水服务企业南京联通公司签署为期5年的合作协议，节水服务企业利用通信运营商优势提供云服务平台和资金支持，再与旗下专业供应商签订协议，委托其具体实施学院管网漏损检测、维修改造、智慧节水平台搭建、自助报修系统建立等工作，并约定双方节水收益分成比例。由此形成用水单位、费用总包单位、效益分享单位三方共享节水效益的混合型合同节水模式。项目实施以来，学校人均用水量由93立方米/年降至46立方米/年，节水率达50%。合同期间，预计节水量70.5万立方米，节约水费225万元。'
    },
    {
      id: 3,
      cat1: '城镇生活节水',
      name: '感应式高效节水器',
      content: '采用高灵敏度红外感应技术，实现人走水断，有效减少写字楼及学校等公共场所的无效用水。',
      image: 'https://images.unsplash.com/photo-1504148455328-497c5ef215d0?auto=format&fit=crop&q=80&w=600',
      region: '广东',
      source: '大禹节水',
      date: '2024-05-10',
      views: '3,120'
    },
    {
      id: 4,
      cat1: '非常规水开发利用',
      name: '雨水收集与回用系统工程',
      content: '通过对园区屋面及道路雨水的统一收集、处理，用于景观绿化及道路冲洗，提高非传统水源利用效率。',
      image: 'https://images.unsplash.com/photo-1516937941344-00b4e0337589?auto=format&fit=crop&q=80&w=600',
      region: '北京',
      source: '水利部办公厅',
      date: '2024-02-15',
      views: '1,890'
    },
    {
      id: 5,
      cat1: '通用节水',
      name: '高精度数字化水平衡测试系统',
      content: '该设备能够实时捕捉各个用水支路的流量波动，精准锁定漏报点，为企业制定节水技改方案提供数据支撑。',
      image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=600',
      region: '浙江',
      source: '水麒麟科技',
      date: '2024-06-22',
      views: '2,300'
    },
    {
      id: 6,
      cat1: '农业节水',
      name: '高标准农田数字化运营管理',
      content: '结合遥感和物联网技术，提供从种植计划到精准灌溉的一体化服务，助力农业生产提效增产。',
      image: 'https://images.unsplash.com/photo-1495107336039-ab70bf3f972b?auto=format&fit=crop&q=80&w=600',
      region: '河北',
      source: '农业部',
      date: '2024-01-10',
      views: '4,560'
    }
  ];

  const [selectedCase, setSelectedCase] = useState<any | null>(null);

  const filteredCases = CASES_DATA.filter((item) => {
    const match1 = filter1 === '全部' || item.cat1 === filter1;
    const matchSearch =
      !searchQuery.trim() ||
      item.name.includes(searchQuery) ||
      item.content.includes(searchQuery);
    return match1 && matchSearch;
  });

  React.useEffect(() => {
    if (initialOpenDetailCaseId == null) return;
    const row = CASES_DATA.find((r) => r.id === initialOpenDetailCaseId);
    if (row) setSelectedCase(row);
  }, [initialOpenDetailCaseId]);

  if (selectedCase) {
    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="rounded-2xl border border-gray-100/90 bg-white p-6 shadow-sm shadow-teal-900/5 sm:rounded-[2rem] sm:p-10 md:p-16"
      >
        <button 
          type="button"
          onClick={() => {
            setSelectedCase(null);
            onClearedInitialDetail?.();
          }}
          className="mb-8 flex items-center gap-2 text-sm font-black text-teal-600 transition-all hover:gap-3 hover:text-teal-700 sm:mb-10"
        >
          <ChevronRight className="h-5 w-5 rotate-180" aria-hidden /> 返回列表
        </button>

        <div className="mx-auto max-w-4xl">
          <div className="mb-6 flex flex-wrap items-start justify-center gap-3">
            <h1 className="min-w-0 flex-1 text-center text-2xl font-black text-gray-900 md:text-4xl">
              {selectedCase.name}
            </h1>
            {typeof selectedCase.id === 'number' ? (
              <CaseFavoriteButton caseId={selectedCase.id} className="shrink-0" />
            ) : null}
          </div>

          <div className="mb-8 flex flex-wrap items-center justify-center gap-6 border-b border-teal-100/80 pb-8 text-sm font-bold text-gray-500">
             <div className="flex items-center gap-2">
              <span>时间</span>
              <span className="text-gray-800">{selectedCase.date || '2024-05-12'}</span>
             </div>
             <div className="flex items-center gap-2">
              <span>来源</span>
              <span className="text-gray-800">{selectedCase.source || '水麒麟节水平台'}</span>
             </div>
          </div>

          <div className="space-y-10">
            {selectedCase.fullContent ? (
              selectedCase.fullContent.map((block: any, i: number) => (
                <div key={i} className="space-y-6">
                  {block.type === 'text' && (
                    <div className="space-y-4">
                      {block.title && <h3 className="text-xl font-black text-gray-900">{block.title}</h3>}
                      <p className="text-lg leading-relaxed whitespace-pre-line text-gray-600">{block.text}</p>
                    </div>
                  )}
                  {block.type === 'image' && (
                    <div className="space-y-3">
                      <div className="overflow-hidden rounded-2xl border border-teal-100/60 shadow-sm">
                        <img src={block.url} className="h-auto w-full object-cover" alt="" />
                      </div>
                      <p className="text-center text-sm font-bold text-gray-500">{block.caption}</p>
                    </div>
                  )}
                </div>
              ))
            ) : selectedCase.fullContentText ? (
              <p className="text-justify text-lg leading-[2.2] whitespace-pre-line text-gray-600">{selectedCase.fullContentText}</p>
            ) : (
              <p className="text-lg leading-relaxed text-gray-600">
                {selectedCase.content}
                <br />
                <br />
                暂无更多详细内容展示。
              </p>
            )}
          </div>

          <div className="mt-16 flex items-center justify-end border-t border-gray-100 pt-8 text-sm font-bold text-gray-400">
            <div className="text-right">责任编辑: {selectedCase.author || '闫笑梅'}</div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 搜索与分类：青绿主色，与需求中心/已达成的供需对接筛选一致 */}
      <div className="space-y-6 rounded-xl border border-gray-200/90 bg-white p-5 shadow-sm shadow-teal-900/5 sm:rounded-2xl sm:p-8">
        <div className="flex flex-col items-stretch gap-4 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1 rounded-xl border-2 border-teal-100 bg-white shadow-inner shadow-teal-900/5 transition focus-within:border-teal-400 focus-within:ring-2 focus-within:ring-teal-500/15">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-teal-500/70" aria-hidden />
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索案例名称或内容…"
              className="min-w-0 flex-1 rounded-xl border-0 bg-transparent py-3.5 pl-12 pr-4 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none sm:py-4 sm:text-base"
              />
           </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:gap-3">
             <button
               type="button"
              className="h-12 rounded-xl bg-teal-600 px-6 text-sm font-black text-white shadow-md shadow-teal-600/20 transition hover:bg-teal-700 sm:h-14 sm:px-8"
             >
               立即搜索
             </button>
             <button
               type="button"
              className="h-12 rounded-xl border-2 border-teal-600 bg-white px-6 text-sm font-black text-teal-700 transition hover:bg-teal-50 sm:h-14 sm:px-8"
             >
               申请发布
             </button>
           </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:items-start sm:gap-5">
          <span className="shrink-0 pt-0.5 text-xs font-black text-gray-600 sm:text-sm">应用领域</span>
          <div className="flex flex-wrap gap-2">
            {primaryCategories.map((cat) => (
                <button 
                  key={cat}
                  type="button"
                  onClick={() => setFilter1(cat)}
                  className={cn(
                  'rounded-md border px-3 py-1.5 text-xs font-bold transition sm:text-[13px]',
                    filter1 === cat 
                    ? 'border-teal-600 bg-white text-teal-600 shadow-sm'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-teal-300 hover:text-gray-800'
                  )}
                >
                  {cat}
                </button>
              ))}
           </div>
        </div>
      </div>

      {/* 案例列表 */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredCases.map((item) => (
          <motion.div 
            layout
            key={item.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group flex min-h-0 flex-row gap-2.5 rounded-2xl border border-gray-100 bg-white p-2.5 shadow-sm shadow-teal-900/5 transition-all hover:border-teal-200 hover:shadow-md sm:gap-3 sm:p-3"
          >
            <div className="relative h-[3.25rem] w-[4.75rem] shrink-0 overflow-hidden rounded-lg bg-gray-100 ring-1 ring-gray-100 sm:h-14 sm:w-[5.25rem]">
              <img
                src={item.image}
                alt=""
                className="absolute inset-0 h-full w-full scale-[1.42] object-cover object-[50%_38%] transition-transform duration-500 group-hover:scale-[1.55]"
              />
              <span className="absolute left-0.5 top-0.5 max-w-[calc(100%-4px)] truncate rounded border border-white/80 bg-white/92 px-1 py-px text-[8px] font-black leading-tight text-teal-700 backdrop-blur-[2px]">
                {item.cat1}
              </span>
              <CaseCardFavoriteOverlay caseId={item.id} className="right-0.5 top-0.5" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-between gap-1 py-0.5">
              <div className="min-w-0">
                <div className="mb-0.5 flex items-center gap-1 text-[9px] font-bold text-gray-400">
                  <MapPin className="h-2.5 w-2.5 shrink-0 text-teal-500" aria-hidden />
                  <span className="truncate">{item.region || '全国'}</span>
                  <span className="shrink-0 text-gray-200">·</span>
                  <span className="shrink-0">{item.date || '—'}</span>
                </div>
                <h4 className="line-clamp-2 text-[13px] font-black leading-snug text-gray-900 transition-colors group-hover:text-teal-700 sm:text-sm">
                  {item.name}
                </h4>
              </div>
              <p className="line-clamp-2 text-[10px] font-medium leading-snug text-gray-500 sm:text-[11px]">{item.content}</p>
              <div className="flex items-center justify-between gap-2 pt-0.5">
                <div className="flex min-w-0 items-center gap-2 text-[9px] font-bold text-gray-400">
                  <span className="flex max-w-[55%] items-center gap-0.5 truncate">
                    <Globe className="h-2.5 w-2.5 shrink-0 text-teal-500" aria-hidden />
                    <span className="truncate">{item.source || '本站'}</span>
                  </span>
                  <span className="shrink-0 text-gray-400">{item.views || '0'}</span>
                </div>
                <button 
                  type="button"
                  onClick={() => setSelectedCase(item)}
                  className="shrink-0 rounded-lg border border-gray-100 bg-gray-50 px-2.5 py-1 text-[9px] font-black text-gray-700 transition-colors hover:border-teal-200 hover:bg-teal-600 hover:text-white"
                >
                  查看详情
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {filteredCases.length === 0 && (
        <div className="rounded-2xl border border-dashed border-teal-100 bg-teal-50/30 p-16 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-teal-300 shadow-sm">
            <Search className="h-8 w-8" aria-hidden />
           </div>
          <h3 className="text-lg font-black text-gray-600">暂无匹配的案例</h3>
          <p className="mt-2 text-sm font-bold text-gray-500">请尝试调整应用领域或搜索关键词</p>
        </div>
      )}
    </div>
  );
};

// AI 诊断入口：首页通栏线框版 / 常规版
const AIDiagnosisCard = ({
  onClick,
  compact,
  variant = 'default',
}: {
  onClick: () => void;
  compact?: boolean;
  variant?: 'default' | 'homeHero';
}) => {
  if (variant === 'homeHero') {
    return (
      <button
        type="button"
        onClick={onClick}
        className="group relative w-full overflow-hidden rounded-xl border border-teal-400/45 bg-gradient-to-r from-teal-50 via-cyan-50 to-emerald-50 px-3 py-3 sm:px-5 sm:py-4 text-left shadow-[0_8px_32px_-14px_rgba(20,184,166,0.35)] transition-all hover:border-teal-400/70 hover:shadow-[0_12px_40px_-12px_rgba(20,184,166,0.45)] flex items-center gap-3 sm:gap-4 shrink-0"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-40 bg-[linear-gradient(rgba(45,212,191,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(45,212,191,0.06)_1px,transparent_1px)] bg-[length:20px_20px]"
          aria-hidden
        />
        <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-teal-500/15 border border-teal-400/45 text-teal-700 flex items-center justify-center shrink-0 shadow-[0_4px_18px_-8px_rgba(20,184,166,0.45)] group-hover:bg-teal-500/25 transition-colors">
          <Activity className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div className="relative min-w-0 flex-1 text-left">
          <h3 className="text-sm sm:text-base font-black text-teal-950 tracking-tight">AI智能节水诊断</h3>
          <p className="text-[11px] sm:text-xs text-teal-900/70 mt-1 leading-relaxed">
            精准识别节水症结，快速分析节水潜力，智能提供解决方案
          </p>
        </div>
        <div
          className="relative flex items-center gap-0.5 sm:gap-1 shrink-0 pl-1 text-teal-800"
          aria-hidden
        >
          <span className="text-[11px] sm:text-sm font-black whitespace-nowrap">去诊断</span>
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </button>
    );
  }
  if (compact) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="bg-blue-600 rounded-lg sm:rounded-xl px-2.5 py-2 sm:px-3 sm:py-2 shadow-md shadow-blue-100/80 flex items-center gap-2 sm:gap-2.5 cursor-pointer hover:bg-blue-700 transition-all text-left w-full shrink-0 border border-blue-500/30"
      >
        <div className="w-8 h-8 sm:w-9 sm:h-9 bg-white/15 rounded-md sm:rounded-lg flex items-center justify-center border border-white/25 shrink-0">
          <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-xs sm:text-sm font-black text-white leading-tight">AI 智能节水诊断</h3>
          <p className="text-[9px] sm:text-[10px] text-blue-100/95 font-medium line-clamp-1 mt-0.5">快速获取节水建议，识别潜力与回报</p>
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-white/80 shrink-0 hidden sm:block" />
      </button>
    );
  }
  return (
    <div 
      onClick={onClick}
      className="bg-blue-600 rounded-2xl p-8 shadow-lg shadow-blue-100 flex items-center justify-between cursor-pointer hover:shadow-2xl hover:-translate-y-0.5 transition-all group relative overflow-hidden h-32"
    >
      <div className="flex items-center gap-6 relative z-10">
        <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
          <Activity className="w-8 h-8 text-white opacity-80" />
        </div>
        <div className="text-left">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-2xl font-black text-white">AI 智能节水诊断</h3>
          </div>
          <p className="text-sm text-blue-100 font-medium">快速输入专业节水建议，精准识别潜力与投资回报</p>
        </div>
      </div>

      <div className="relative z-10 flex items-center gap-10">
        <div className="text-right flex flex-col items-end">
          <p className="text-3xl font-black text-white leading-tight">98.4%</p>
        </div>
        <button type="button" className="bg-white text-blue-700 px-10 h-14 rounded-xl font-bold text-sm shadow-xl hover:bg-blue-50 transition-all flex items-center gap-3 border border-transparent">
          立即开始评估 <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

/** 首页区块标题：左侧青绿竖条 + 可选「换一批」+ 可选「更多」 */
const HomeSectionHeader = ({
  title,
  moreLabel,
  onMore,
  refreshLabel,
  onRefresh,
  className,
}: {
  title: string;
  moreLabel?: string;
  onMore?: () => void;
  /** 如「换一批」，与 onRefresh 成对传入 */
  refreshLabel?: string;
  onRefresh?: () => void;
  className?: string;
}) => (
  <div className={cn('mb-4 flex items-center justify-between gap-3', className)}>
    <div className="flex min-w-0 items-center gap-3">
      <span className="h-7 w-1 shrink-0 rounded-full bg-teal-500" aria-hidden />
      <h2 className="truncate text-lg font-black text-gray-900 sm:text-xl">{title}</h2>
    </div>
    {(refreshLabel && onRefresh) || (moreLabel && onMore) ? (
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {refreshLabel && onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-[11px] font-bold text-gray-600 shadow-sm transition-colors hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700 sm:px-2.5 sm:py-1.5 sm:text-xs"
          >
            <RefreshCw className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" aria-hidden />
            {refreshLabel}
          </button>
        )}
    {moreLabel && onMore && (
      <button
        type="button"
        onClick={onMore}
            className="flex shrink-0 items-center gap-0.5 text-sm font-bold text-teal-600 hover:text-teal-700"
      >
        {moreLabel}
            <ChevronRight className="h-4 w-4" />
      </button>
    )}
      </div>
    ) : null}
  </div>
);

/** 水麒麟引导词：固定池展示 4 条 */
function buildHomeKirinStyle3GuideRows(fallbacks: readonly string[]): string[] {
  const seen = new Set<string>();
  const rows: string[] = [];
  for (const s of fallbacks) {
    const t = s.trim();
    if (!t || seen.has(t)) continue;
    seen.add(t);
    rows.push(t);
    if (rows.length >= 4) break;
  }
  return rows;
}

/** 首页右侧：水麒麟视频完整入画（contain）；点吉祥物区打开 AI；角标按钮切换静音/有声（可反复切换，满足浏览器需用户手势开声） */
const HomeKirinAssistantPanel = ({
  onOpenAi,
  layout = 'default',
}: {
  onOpenAi: () => void;
  /** 样式 3：静态首帧 + 右侧标题 + 底部小号仅图标「聊天条」，点此打开弹层 */
  layout?: 'default' | 'style3';
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoMuted, setVideoMuted] = useState(true);
  const style3 = layout === 'style3';

  const toggleSoundMuted = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    const v = videoRef.current;
    if (!v) return;
    setVideoMuted((prev) => {
      const nextMuted = !prev;
      v.muted = nextMuted;
      if (!nextMuted) {
        v.volume = 1;
        void v.play();
      }
      return nextMuted;
    });
  }, []);

  /** 样式 3：加载后定格首帧，无循环动画、不自动播放 */
  useEffect(() => {
    if (!style3) return;
    const v = videoRef.current;
    if (!v) return;
    const onLoaded = () => {
      try {
        v.pause();
        v.currentTime = 0.001;
      } catch {
        /* ignore */
      }
    };
    v.addEventListener('loadeddata', onLoaded);
    if (v.readyState >= 2) onLoaded();
    return () => v.removeEventListener('loadeddata', onLoaded);
  }, [style3]);

  const guideRows = useMemo(() => buildHomeKirinStyle3GuideRows(HOME_KIRIN_STYLE3_FALLBACK_GUIDES), []);

  if (style3) {
    return (
      <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col rounded-2xl border border-gray-200/90 bg-white shadow-[0_8px_30px_-12px_rgba(15,118,110,0.18)] ring-1 ring-gray-100/80">
        <div className="relative shrink-0 border-b border-gray-100 px-3 pb-3 pt-3 sm:px-4 sm:pb-4 sm:pt-4">
          <div className="pr-[4.5rem] sm:pr-[5.25rem]">
            <div className="text-left text-sm font-black leading-snug text-gray-900 sm:text-[15px]">
              <p className="m-0">Hi~</p>
              <p className="m-0 mt-0.5">
                我是<span className="text-[#26B39C]">水麒麟</span>，你的AI助手
              </p>
            </div>
          </div>
          <div className="absolute right-2.5 top-2 flex h-[4.5rem] w-[4.5rem] items-end justify-center overflow-visible rounded-xl border border-teal-100 bg-teal-50/40 shadow-inner sm:right-3 sm:top-2.5 sm:h-[5.25rem] sm:w-[5.25rem]">
            <video
              ref={videoRef}
              className="pointer-events-none max-h-full w-full object-contain object-bottom"
              muted
              playsInline
              preload="auto"
              autoPlay={false}
              loop={false}
              controls={false}
              disablePictureInPicture
            >
              <source src="/kirin-mascot.mp4" type="video/mp4" />
            </video>
          </div>
        </div>

        <div className="shrink-0 overflow-visible px-3 py-2 sm:px-4">
          <div className="mb-2 flex flex-wrap items-end justify-between gap-x-2 gap-y-1">
            <p className="text-xs font-black text-gray-800">引导词</p>
            <p className="text-[10px] font-bold leading-tight text-gray-400">共 4 条</p>
          </div>
          <ul className="divide-y divide-gray-100 rounded-xl border border-gray-100 bg-gray-50/50">
            {guideRows.map((text) => (
              <li key={text}>
                <button
                  type="button"
                  onClick={onOpenAi}
                  className="group flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-white sm:gap-3 sm:px-3.5 sm:py-3"
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-full bg-[#26B39C] shadow-[0_0_0_3px_rgba(38,179,156,0.2)]"
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1 text-xs font-bold leading-snug text-gray-800 sm:text-[13px]">
                    {text}
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-gray-300 transition-colors group-hover:text-[#26B39C]" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="shrink-0 border-t border-gray-100 bg-white/95 p-3 sm:p-4">
          <div className="relative">
            <input
              type="text"
              readOnly
              placeholder="请输入文字到这里"
              onClick={onOpenAi}
              onFocus={onOpenAi}
              className="h-10 w-full cursor-pointer rounded-full border border-gray-200 bg-gray-50/90 py-2 pl-4 pr-12 text-xs font-medium text-gray-800 shadow-inner outline-none transition hover:border-teal-200 hover:bg-white focus:border-[#26B39C] focus:ring-2 focus:ring-[#26B39C]/20 sm:h-11 sm:pl-5 sm:pr-14 sm:text-sm"
              aria-label="打开智能助手输入"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenAi();
              }}
              className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[#26B39C] text-white shadow-md shadow-teal-600/25 transition hover:bg-[#1fa08a] sm:right-1.5 sm:h-9 sm:w-9"
              aria-label="发送并打开智能助手"
            >
              <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative flex h-full min-h-[8rem] w-full min-w-0 flex-1 flex-col sm:min-h-[10rem]">
      <div className="flex min-h-0 w-full flex-1 flex-col">
        <div className="relative flex min-h-0 w-full flex-1 flex-col items-stretch">
    <motion.div
            className="relative flex min-h-0 w-full flex-1 items-stretch justify-stretch transition-transform duration-300 group-hover:scale-[1.02]"
            animate={{ y: [0, -8, 0] }}
      transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
    >
      <motion.div
              className="flex min-h-0 w-full flex-1 items-center justify-center will-change-transform"
              animate={{ scale: [1, 1.025, 1] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      >
              <video
                ref={videoRef}
                className="pointer-events-none block h-full w-full min-h-0 max-h-full max-w-full border-0 bg-transparent object-contain object-center p-0 shadow-none outline-none ring-0 select-none drop-shadow-[0_12px_28px_rgba(15,118,110,0.22)]"
                autoPlay
                loop
                muted={videoMuted}
                playsInline
                preload="auto"
                controls={false}
                disablePictureInPicture
              >
                <source src="/kirin-mascot.mp4" type="video/mp4" />
              </video>
      </motion.div>
    </motion.div>

          <div
            className="pointer-events-none absolute left-1 top-[14%] z-[2] max-w-[min(11rem,42%)] select-none pl-1 sm:left-2 sm:top-[16%] sm:max-w-[min(13rem,38%)] sm:pl-0"
            aria-hidden
          >
            <p className="text-[13px] font-black leading-tight text-gray-900 drop-shadow-[0_1px_0_rgba(255,255,255,0.85)] sm:text-[15px] sm:leading-snug">
              <span className="text-gray-900">我是</span>
              <span className="text-teal-600">水麒麟</span>
            </p>
            <p className="mt-0.5 text-[11px] font-bold leading-snug text-gray-600 drop-shadow-[0_1px_0_rgba(255,255,255,0.75)] sm:mt-1 sm:text-xs">
              你的智能AI助手
            </p>
          </div>

          {/* 透明热区：点击打开 AI（不嵌套在音量按钮内） */}
          <button
            type="button"
            className="absolute inset-0 z-[1] cursor-pointer border-0 bg-transparent p-0 outline-none focus-visible:ring-2 focus-visible:ring-teal-400/80 focus-visible:ring-offset-2"
            onClick={onOpenAi}
            aria-label="打开 AI 智能节水诊断"
          />

          <button
            type="button"
            onClick={toggleSoundMuted}
            className="absolute bottom-2 right-2 z-[2] flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/40 bg-black/40 text-white shadow-md backdrop-blur-sm transition-colors hover:bg-black/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 sm:bottom-2.5 sm:right-2.5 sm:h-10 sm:w-10"
            aria-pressed={!videoMuted}
            aria-label={videoMuted ? '开启声音' : '关闭声音'}
          >
            {videoMuted ? <VolumeX className="h-4 w-4 sm:h-[1.125rem] sm:w-[1.125rem]" aria-hidden /> : <Volume2 className="h-4 w-4 sm:h-[1.125rem] sm:w-[1.125rem]" aria-hidden />}
  </button>
        </div>
      </div>
    </div>
  );
};

/** 首页案例推广：每批 4 个小卡；animationCycleKey 变化时触发过渡动效，数据仍由父级传入（典型用法为固定四条） */
const HomeIndustryCasesRow = ({
  onViewAll,
  onCaseTileClick,
  cases,
  animationCycleKey = 0,
  variant = 'standalone',
  sectionTitle = '典型案例',
  moreLinkLabel = '更多案例',
  /** split 时拆成「标题+首行 / 次行」：包住前者供首屏高度测量 */
  splitPeekRef,
}: {
  onViewAll: () => void;
  /** 点击某一宫格时带上 tileId（965 / 988 / 1052 / 986；兼容旧 9651–9654） */
  onCaseTileClick?: (tileId: number) => void;
  cases: TechCase[];
  /** 与节水需求等同步递增时触发「换一批」动效，不要求 cases 数据变化 */
  animationCycleKey?: number;
  variant?: 'standalone' | 'split';
  sectionTitle?: string;
  moreLinkLabel?: string;
  splitPeekRef?: React.Ref<HTMLDivElement>;
}) => {
  const thumbH = 'h-10 sm:h-11';
  const openTile = (tileId: number) => {
    if (onCaseTileClick) onCaseTileClick(tileId);
    else onViewAll();
  };

  const renderCaseTile = (c: TechCase, i: number) =>
    i % 2 === 0 ? (
      <button
        key={`${animationCycleKey}-teal-${i}-${c.id}`}
        type="button"
        onClick={() => openTile(c.id)}
        className="relative flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-lg border border-teal-300 bg-gradient-to-br from-teal-500 to-teal-600 text-left text-white shadow-sm transition-colors hover:from-teal-600 hover:to-teal-700"
      >
        <CaseCardFavoriteOverlay caseId={c.id} />
        <div
          className={cn(
            'flex shrink-0 items-end border-b border-white/15 px-2 pb-1 pt-1.5 sm:px-2.5 sm:pb-1.5',
            thumbH
          )}
        >
          <span className="text-[8px] font-black uppercase tracking-wider text-teal-100 sm:text-[9px]">案例精选</span>
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-0.5 px-2 pb-1.5 pt-1 sm:px-2.5 sm:pb-2 sm:pt-1.5">
          <h4 className="line-clamp-2 text-[10px] font-black leading-snug text-white sm:text-[11px]">{c.name}</h4>
          <p className="line-clamp-2 text-[9px] leading-snug text-teal-50/90">{c.description}</p>
          <span className="mt-auto flex items-center gap-0.5 pt-1 text-[10px] font-bold text-white sm:text-[11px]">
            查看详情 <ChevronRight className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
          </span>
        </div>
      </button>
    ) : (
      <button
        key={`${animationCycleKey}-img-${i}-${c.id}`}
        type="button"
        onClick={() => openTile(c.id)}
        className={cn(
          'flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-lg text-left',
          HOME_CARD_BORDER
        )}
      >
        <div className={cn('relative shrink-0 overflow-hidden bg-gray-100', thumbH)}>
          <img src={c.image} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
          <CaseCardFavoriteOverlay caseId={c.id} className="right-0.5 top-0.5 sm:right-1 sm:top-1" />
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-0.5 px-2 pb-1.5 pt-1 sm:px-2.5 sm:pb-2 sm:pt-1.5">
          <h4 className="line-clamp-2 text-[10px] font-black leading-snug text-gray-900 sm:text-[11px]">{c.name}</h4>
          <p className="line-clamp-2 text-[9px] leading-snug text-gray-500">{c.description}</p>
          <span className="mt-auto flex items-center gap-0.5 self-start pt-1 text-[10px] font-bold text-teal-600 sm:text-[11px]">
            查看详情 <ChevronRight className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
          </span>
        </div>
      </button>
    );

  const splitBand = variant === 'split' && splitPeekRef != null;

  return (
    <section
      className={cn(
        variant === 'split' ? 'flex min-h-0 w-full min-w-0 flex-1 flex-col' : 'max-w-[1440px] mx-auto w-full px-4 sm:px-6'
      )}
    >
      {splitBand ? (
        <>
          <div ref={splitPeekRef} className="flex shrink-0 flex-col">
            <HomeSectionHeader title={sectionTitle} moreLabel={moreLinkLabel} onMore={onViewAll} className="mb-2 shrink-0" />
            <div className="relative min-h-0 shrink-0">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={animationCycleKey}
                  initial={{ opacity: 0, y: -36 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 40 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="grid shrink-0 grid-cols-2 gap-2"
                >
                  {cases.slice(0, 2).map((c, j) => renderCaseTile(c, j))}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          <div className="relative flex min-h-0 flex-1 flex-col">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`${animationCycleKey}-tail`}
                initial={{ opacity: 0, y: -36 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="grid min-h-0 flex-1 grid-cols-2 gap-2 auto-rows-[minmax(0,1fr)]"
              >
                {cases.slice(2, 4).map((c, j) => renderCaseTile(c, j + 2))}
              </motion.div>
            </AnimatePresence>
          </div>
        </>
      ) : (
        <>
          <HomeSectionHeader title={sectionTitle} moreLabel={moreLinkLabel} onMore={onViewAll} className="mb-2 shrink-0" />

          <div className={cn('relative min-h-0', variant === 'split' && 'flex min-h-0 flex-1 flex-col')}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={animationCycleKey}
                initial={{ opacity: 0, y: -36 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  'grid gap-2',
                  variant === 'split'
                    ? 'min-h-0 flex-1 grid-cols-2 grid-rows-2 auto-rows-[minmax(0,1fr)]'
                    : 'min-h-0 sm:gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 sm:auto-rows-[minmax(0,1fr)]'
                )}
              >
                {cases.map((c, i) => renderCaseTile(c, i))}
              </motion.div>
            </AnimatePresence>
          </div>
        </>
      )}
    </section>
  );
};

type HomeDemandCardItem = (typeof DEMANDS)[number];

/** 首页「节水需求」：每批最多 4 条，两列两行；支持轮换动画 */
const HomeWaterDemandsRow = ({
  demands,
  onMore,
  animationCycleKey = 0,
  variant = 'standalone',
  sectionTitle = '节水需求',
  moreLinkLabel = '更多需求',
  splitPeekRef,
}: {
  demands: HomeDemandCardItem[];
  onMore: () => void;
  animationCycleKey?: number;
  variant?: 'standalone' | 'split';
  sectionTitle?: string;
  moreLinkLabel?: string;
  splitPeekRef?: React.Ref<HTMLDivElement>;
}) => {
  const demandCard = (d: HomeDemandCardItem, band: 'peek' | 'tail' | 'full') => (
    <button
      key={`${animationCycleKey}-${band}-${d.id}`}
      type="button"
      onClick={onMore}
      className={cn(
        'flex h-full min-h-0 min-w-0 flex-col gap-1 rounded-md border border-gray-200 bg-white p-2 text-left shadow-sm transition-colors hover:border-teal-300 hover:bg-teal-50/50 sm:p-2'
      )}
    >
      <span className="w-fit rounded border border-teal-200 bg-teal-50 px-1.5 py-0.5 text-[9px] font-black text-teal-700">
        {homeDemandTypeTagLabel(d.demandType)}
      </span>
      <span className="line-clamp-2 text-[11px] font-black leading-snug text-gray-900 sm:text-xs">{d.title}</span>
      <span className="mt-auto flex items-center justify-between gap-1 border-t border-gray-50 pt-1 text-[9px] text-gray-400">
        <span className="truncate font-bold">{d.time}</span>
        <span className="flex shrink-0 items-center gap-0.5 font-bold text-teal-600">
          <Heart className="h-2.5 w-2.5" aria-hidden />
          {d.likes}
        </span>
      </span>
    </button>
  );

  const splitBand = variant === 'split' && splitPeekRef != null;

  return (
    <section
      className={cn(
        variant === 'split' ? 'flex min-h-0 w-full min-w-0 flex-1 flex-col' : 'max-w-[1440px] mx-auto w-full px-4 sm:px-6'
      )}
    >
      {splitBand ? (
        <>
          <div ref={splitPeekRef} className="flex shrink-0 flex-col">
            <HomeSectionHeader title={sectionTitle} moreLabel={moreLinkLabel} onMore={onMore} className="mb-2 shrink-0" />
            <div className="relative min-h-0 shrink-0">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={animationCycleKey}
                  initial={{ opacity: 0, y: -36 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 40 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="grid shrink-0 grid-cols-2 gap-2"
                >
                  {demands.slice(0, 2).map((d) => demandCard(d, 'peek'))}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          <div className="relative flex min-h-0 flex-1 flex-col">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`${animationCycleKey}-tail`}
                initial={{ opacity: 0, y: -36 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="grid min-h-0 flex-1 grid-cols-2 gap-2 auto-rows-[minmax(0,1fr)]"
              >
                {demands.slice(2, 4).map((d) => demandCard(d, 'tail'))}
              </motion.div>
            </AnimatePresence>
          </div>
        </>
      ) : (
        <>
          <HomeSectionHeader title={sectionTitle} moreLabel={moreLinkLabel} onMore={onMore} className="mb-2 shrink-0" />

          <div className={cn('relative min-h-0', variant === 'split' && 'flex min-h-0 flex-1 flex-col')}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={animationCycleKey}
                initial={{ opacity: 0, y: -36 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  'grid gap-2',
                  variant === 'split'
                    ? 'min-h-0 flex-1 grid-cols-2 grid-rows-2 auto-rows-[minmax(0,1fr)]'
                    : 'grid-cols-2 md:gap-2'
                )}
              >
                {demands.map((d) => demandCard(d, 'full'))}
              </motion.div>
            </AnimatePresence>
          </div>
        </>
      )}
    </section>
  );
};

const HomeProductGridSection = ({
  title,
  moreLabel,
  items,
  onMore,
  onSelectProduct,
}: {
  title: string;
  moreLabel: string;
  items: typeof PRODUCTS;
  onMore: () => void;
  onSelectProduct: (p: (typeof PRODUCTS)[number]) => void;
}) => (
  <section className="max-w-[1440px] mx-auto w-full px-4 sm:px-6">
    <HomeSectionHeader title={title} moreLabel={moreLabel} onMore={onMore} />
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      {items.map((p, idx) => (
        <button
          key={`${p.id}-${idx}`}
          type="button"
          onClick={() => onSelectProduct(p)}
          className={cn(
            'group flex flex-col overflow-hidden rounded-xl text-left outline-none transition hover:border-teal-300 focus-visible:ring-2 focus-visible:ring-teal-400/50',
            HOME_CARD_BORDER
          )}
        >
          <div className="relative h-28 shrink-0 bg-gray-50 border-b border-gray-100 overflow-hidden">
            <span className="absolute top-2 left-2 z-10 text-[10px] font-black px-2 py-0.5 rounded bg-teal-500 text-white shadow-sm max-w-[calc(100%-1rem)] truncate">
              {p.category}
            </span>
            <img
              src={p.image}
              alt=""
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="p-3 flex flex-col flex-1">
            <h4 className="text-xs sm:text-sm font-black text-gray-900 line-clamp-2 leading-snug">{p.name}</h4>
            <p className="mt-1.5 truncate text-[10px] font-bold leading-snug text-gray-500 sm:text-[11px]">{p.supplier}</p>
            <span className="mt-auto pt-3 text-xs font-bold text-teal-600 self-start flex items-center gap-0.5 group-hover:underline">
              查看详情 <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </button>
      ))}
    </div>
  </section>
);

const HomeServiceRecommendSection = ({
  onMore,
  onSelectService,
}: {
  onMore: () => void;
  onSelectService: (s: HomeServiceRecommendation) => void;
}) => {
  const list = HOME_SERVICE_RECOMMENDATIONS;
  return (
    <section className="max-w-[1440px] mx-auto w-full px-4 sm:px-6">
      <HomeSectionHeader title="服务推荐" moreLabel="更多服务" onMore={onMore} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {list.map((d) => (
          <div
            key={d.id}
            title={d.content}
            className={cn('flex flex-col overflow-hidden rounded-xl p-3', HOME_CARD_BORDER)}
          >
            <span className="mb-2 w-fit rounded border border-teal-200 bg-teal-50 px-2 py-0.5 text-[10px] font-black text-teal-700">
              {d.serviceType}
            </span>
            <h4 className="text-xs font-black leading-snug text-gray-900 line-clamp-2 sm:text-sm">「{d.serviceName}」</h4>
            <p className="mt-1.5 truncate text-[10px] font-bold leading-snug text-gray-500 sm:text-[11px]">{d.entityName}</p>
            <p className="mt-2 truncate text-[10px] font-bold text-gray-400">{d.applicationField}</p>
            <button
              type="button"
              onClick={() => onSelectService(d)}
              className="mt-auto flex items-center gap-0.5 self-start pt-3 text-xs font-bold text-teal-600 hover:underline"
            >
              查看详情 <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

type CloudExhibitionHallFilter = 'all' | 'famous' | 'high-tech' | 'benchmark';

const CLOUD_EXHIBITION_HALL_FILTERS: { id: CloudExhibitionHallFilter; label: string }[] = [
  { id: 'all', label: '全部展厅' },
  { id: 'famous', label: '知名企业' },
  { id: 'high-tech', label: '高新技术' },
  { id: 'benchmark', label: '节水标杆' },
];

const CLOUD_EXHIBITION_HALLS: {
  id: string;
  image: string;
  tags: string[];
  title: string;
  company: string;
  filters: CloudExhibitionHallFilter[];
}[] = [
  {
    id: 'h1',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
    tags: ['智慧农业', '节水装备', '水权交易'],
    title: '大禹节水智慧展厅',
    company: '大禹节水集团股份有限公司',
    filters: ['all', 'famous', 'benchmark'],
  },
  {
    id: 'h2',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
    tags: ['智慧水务', '工业互联网', '泵站管理'],
    title: '威派格智慧水务馆',
    company: '上海威派格智慧水务股份有限公司',
    filters: ['all', 'famous', 'high-tech'],
  },
  {
    id: 'h3',
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80',
    tags: ['工业污水', '水土修复', '节能减排'],
    title: '博世科节能环保展区',
    company: '广西博世科环保科技股份有限公司',
    filters: ['all', 'benchmark'],
  },
  {
    id: 'h4',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80',
    tags: ['膜技术', '水再生', '关键材料'],
    title: '苏科环保膜技术馆',
    company: '苏科环保技术有限责任公司',
    filters: ['all', 'high-tech'],
  },
];

/** 主导航「云上展厅」：与智慧节水云展中心布局一致，统一青绿主题（原样式2 天蓝已下线） */
function CloudExhibitionHallPage({ onBack }: { onBack: () => void }) {
  const sky = false;
  const [filter, setFilter] = useState<CloudExhibitionHallFilter>('all');
  const list = useMemo(
    () => CLOUD_EXHIBITION_HALLS.filter((h) => h.filters.includes(filter)),
    [filter]
  );

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6 flex flex-wrap items-center gap-3 sm:mb-8 sm:gap-4">
        <button
          type="button"
          onClick={onBack}
          className={cn(
            'group flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-black text-gray-600 shadow-sm transition',
            sky
              ? 'hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700'
              : 'hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700'
          )}
        >
          <span
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg border border-gray-100 bg-gray-50 group-hover:bg-white',
              sky ? 'group-hover:border-sky-200' : 'group-hover:border-teal-200'
            )}
          >
            <ChevronRight className="h-4 w-4 rotate-180" aria-hidden />
          </span>
          返回
        </button>
        <div className="min-w-0 flex-1 sm:pl-1">
          <h1 className="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">智慧节水云展中心</h1>
          <p className="mt-1 text-xs font-bold text-gray-500 sm:text-sm">云上展厅 · 数字展示与节水产业成果浏览</p>
        </div>
      </div>

      <section
        className={cn(
          'relative mb-8 overflow-hidden rounded-2xl border px-4 py-5 shadow-sm sm:px-8 sm:py-6',
          sky
            ? 'border-sky-100/90 bg-gradient-to-r from-sky-50 via-blue-50/75 to-slate-50 shadow-sky-900/5'
            : 'border-teal-100/90 bg-gradient-to-r from-teal-50 via-cyan-50/80 to-slate-50 shadow-teal-900/5'
        )}
      >
        <div
          className={cn(
            'pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full blur-3xl',
            sky ? 'bg-sky-200/25' : 'bg-teal-200/25'
          )}
          aria-hidden
        />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p
              className={cn(
                'text-sm font-black tracking-tight sm:text-base',
                sky ? 'text-sky-900' : 'text-teal-900'
              )}
            >
              线上展厅 · 永不落幕
            </p>
            <p className="mt-1 text-xs font-bold text-gray-600 sm:text-sm">
              汇聚节水产业主体数字展厅，支持按类型筛选浏览云上展馆
            </p>
           </div>
          <div
            role="tablist"
            aria-label="展厅筛选"
            className={cn(
              'flex w-full flex-wrap items-center gap-1.5 rounded-xl border bg-white/90 p-1.5 shadow-inner sm:w-auto sm:flex-nowrap',
              sky ? 'border-sky-100/80 shadow-sky-900/5' : 'border-teal-100/80 shadow-teal-900/5'
            )}
          >
            {CLOUD_EXHIBITION_HALL_FILTERS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={filter === t.id}
                onClick={() => setFilter(t.id)}
                className={cn(
                  'min-h-[2.25rem] shrink-0 rounded-lg px-3.5 py-1.5 text-xs font-black transition sm:px-4 sm:text-sm',
                  filter === t.id
                    ? sky
                      ? 'border border-sky-600 bg-white text-sky-700 shadow-sm ring-1 ring-sky-100'
                      : 'border border-teal-600 bg-white text-teal-700 shadow-sm ring-1 ring-teal-100'
                    : sky
                      ? 'border border-transparent text-gray-600 hover:border-sky-200/80 hover:bg-sky-50/60 hover:text-gray-900'
                      : 'border border-transparent text-gray-600 hover:border-teal-200/80 hover:bg-teal-50/60 hover:text-gray-900'
                )}
              >
                {t.label}
              </button>
            ))}
           </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
        {list.map((hall) => (
          <article
            key={hall.id}
            className={cn(
              HOME_CARD_BORDER,
              'group flex flex-col overflow-hidden transition hover:shadow-md',
              sky ? 'hover:border-sky-200' : 'hover:border-teal-200'
            )}
          >
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100 ring-1 ring-gray-100/80">
              <img
                src={hall.image}
                alt=""
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
              />
            </div>
            <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
              <div className="flex flex-wrap gap-1.5">
                {hall.tags.map((tag) => (
                  <span
                    key={tag}
                    className={cn(
                      'rounded-full border px-2 py-0.5 text-[10px] font-black sm:text-[11px]',
                      sky
                        ? 'border-sky-100 bg-sky-50/95 text-sky-800'
                        : 'border-teal-100 bg-teal-50/95 text-teal-800'
                    )}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h2 className="text-base font-black leading-snug text-gray-900 sm:text-lg">{hall.title}</h2>
              <p className="text-xs font-bold text-gray-500 sm:text-sm">{hall.company}</p>
              <div className="mt-auto flex items-center justify-between gap-2 border-t border-gray-100 pt-3">
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 text-xs font-black sm:text-sm',
                    sky ? 'text-sky-800' : 'text-teal-700'
                  )}
                >
                  <Zap className={cn('h-4 w-4 shrink-0', sky ? 'text-sky-600' : 'text-teal-600')} aria-hidden />
                  展厅活跃中
                </span>
                <button
                  type="button"
                  className={cn(
                    'shrink-0 rounded-lg border px-3 py-1.5 text-xs font-black transition sm:px-3.5 sm:text-sm',
                    sky
                      ? 'border-sky-200 bg-sky-50 text-sky-800 hover:border-sky-300 hover:bg-sky-100'
                      : 'border-teal-200 bg-teal-50 text-teal-800 hover:border-teal-300 hover:bg-teal-100'
                  )}
                >
                  查看详情
        </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

// PolicyNoticeDetailPage：政策详情（有扫描图则整页展示图片，否则白卡 + 元信息 + 正文）
function PolicyNoticeDetailPage({ detail, onBack }: { detail: HomePolicyNoticeDetail; onBack: () => void }) {
  const metaRows = detail.metaRows ?? [];
  const paragraphs = detail.paragraphs ?? [];
  const issuerLine =
    metaRows.find((r) => r.label.replace(/\s+/g, '').includes('发布机构'))?.value ?? '';
  const writtenYmd =
    metaRows.find((r) => r.label.replace(/\s+/g, '').includes('成文日期'))?.value ?? '';

  if (detail.detailImageSrc) {
    return (
      <div className="mx-auto max-w-[min(100%,56rem)] px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 flex flex-wrap items-center gap-3">
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
          <span className="rounded-full border border-teal-100 bg-teal-50 px-3 py-1 text-[11px] font-black text-teal-800">
            政策文件
          </span>
        </div>

        <article className="overflow-hidden rounded-xl border border-gray-200/90 bg-white shadow-sm shadow-teal-900/5 ring-1 ring-gray-100/80">
          <img
            src={detail.detailImageSrc}
            alt={detail.title}
            className="block w-full max-w-full bg-white object-contain [image-rendering:auto]"
            loading="eager"
            decoding="async"
            referrerPolicy="no-referrer"
          />
        </article>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[920px] px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6 flex flex-wrap items-center gap-3">
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
        <span className="rounded-full border border-teal-100 bg-teal-50 px-3 py-1 text-[11px] font-black text-teal-800">
          政策文件
        </span>
      </div>

      <article className="rounded-xl border border-gray-200/90 bg-white p-6 shadow-sm shadow-teal-900/5 sm:p-10">
        <h1 className="text-center text-xl font-black leading-snug tracking-tight text-gray-900 sm:text-2xl">
          {detail.title}
        </h1>

        <dl className="mt-8 overflow-hidden rounded-lg border border-gray-200 text-sm sm:mt-10">
          {metaRows.map((row) => (
            <div
              key={row.label}
              className="grid grid-cols-1 border-b border-gray-100 last:border-b-0 sm:grid-cols-[minmax(0,10.5rem)_1fr]"
            >
              <dt className="border-gray-100 bg-teal-50/40 px-4 py-2.5 font-black text-gray-600 sm:border-r">
                {row.label}
              </dt>
              <dd className="bg-white px-4 py-2.5 font-bold leading-relaxed text-gray-900">{row.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-8 space-y-4 border-t border-gray-100 pt-8 text-sm leading-[1.9] text-gray-800 sm:text-[15px] sm:leading-[1.92]">
          {paragraphs.map((p, i) => {
            const isClause = /^[一二三四五六七八九十]+、/.test(p);
            return (
              <p
                key={i}
                className={cn(
                  'text-justify indent-8 first:indent-0 sm:indent-9 sm:first:indent-0',
                  isClause && 'indent-0 font-black text-gray-900 sm:indent-0'
                )}
              >
                {p}
              </p>
            );
          })}
        </div>

        {issuerLine ? (
          <p className="mt-10 border-t border-gray-100 pt-6 text-right text-sm font-bold text-gray-700">
            {issuerLine}
            {writtenYmd ? (
              <>
                <br />
                <span className="mt-2 inline-block text-gray-600">{writtenYmd}</span>
              </>
            ) : null}
          </p>
        ) : null}
      </article>
    </div>
  );
}

// PolicyInfoModule (Integrated Dashboard Style - Matching Screenshot)
type PolicyInfoModuleProps = {
  initialMainTab?: 'news' | 'policy' | 'tech';
  onOpenNewsDetail?: (id: string) => void;
  onOpenPolicyTechDetail?: (id: string, kind: 'policy' | 'tech') => void;
};

const PolicyInfoModule = ({
  initialMainTab = 'news',
  onOpenNewsDetail,
  onOpenPolicyTechDetail,
}: PolicyInfoModuleProps) => {
  const [activeTab, setActiveTab] = useState<'news' | 'policy' | 'tech'>(initialMainTab);
  const [subFilter, setSubFilter] = useState<'all' | 'national' | 'local'>('all');

  useEffect(() => {
    setActiveTab(initialMainTab);
    setSubFilter('all');
  }, [initialMainTab]);
  const newsRecords = usePortalEnabledNewsRecords();
  const policyRecords = usePortalPolicyOnlyRecords();
  const techRecords = usePortalTechOnlyRecords();

  const tabs = [
    { id: 'news', name: '新闻资讯', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'policy', name: '政策公开', icon: <FileText className="w-4 h-4" /> },
    { id: 'tech', name: '技术标准', icon: <Activity className="w-4 h-4" /> },
  ];

  const activeSubFilterTabs = activeTab === 'tech' 
    ? [
        { id: 'all', name: '全部' },
        { id: 'international', name: '国际标准' },
        { id: 'national_std', name: '国家标准' },
        { id: 'local_std', name: '地方标准' },
        { id: 'industry_std', name: '行业标准' },
        { id: 'group_std', name: '团体标准' },
      ]
    : [
        { id: 'all', name: '全部' },
        { id: 'national', name: '国家' },
        { id: 'local', name: '地方' },
      ];

  return (
    <div className="flex flex-col rounded-xl border border-gray-200/90 bg-white p-6 shadow-sm shadow-teal-900/5 transition-all hover:shadow-md sm:p-8">
      <div className="mb-6 flex flex-col gap-6 md:mb-8 md:flex-row md:items-center md:justify-start">
        <div className="flex w-full overflow-x-auto rounded-xl border border-gray-100 bg-gray-50 p-1.5 shadow-inner md:w-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id as 'news' | 'policy' | 'tech');
                setSubFilter('all');
              }}
              className={cn(
                'flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-black transition-all sm:px-6 sm:py-2.5 sm:rounded-xl',
                activeTab === tab.id 
                  ? 'bg-white text-teal-700 shadow-sm ring-1 ring-teal-100'
                  : 'text-gray-500 hover:text-gray-800'
              )}
            >
              {tab.icon}
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Sub-tabs with Search and Date Filter */}
      <div className="mb-6 flex flex-wrap items-center gap-4 border-b border-gray-100 pb-2 md:mb-8 md:gap-8">
        <div className="flex min-w-0 flex-1 items-center gap-4 overflow-x-auto no-scrollbar md:gap-8">
          {activeSubFilterTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSubFilter(tab.id as any)}
              className={cn(
                'relative whitespace-nowrap px-1 py-3 text-[13px] font-bold transition-colors',
                subFilter === tab.id 
                  ? 'text-teal-700 after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-0.5 after:bg-teal-600'
                  : 'text-gray-400 hover:text-gray-700'
              )}
            >
              {tab.name}
            </button>
          ))}
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-3 py-2 sm:gap-4">
          <div className="group relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-300 transition-colors group-hover:text-teal-500" />
              <input 
                type="text" 
              placeholder={activeTab === 'tech' ? '输入筛选标准' : '输入关键字筛选'}
              className="w-32 rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-[11px] font-bold text-gray-700 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/25 md:w-44"
              />
           </div>
          <button
            type="button"
            className="hidden items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-[11px] font-bold text-gray-500 transition-colors hover:border-teal-200 hover:text-teal-700 md:flex"
          >
            <Calendar className="h-3.5 w-3.5" />
              <span>请选择年份</span>
           </button>
        </div>
      </div>

      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeTab}-${subFilter}`}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className={cn(
              "grid gap-4",
              activeTab === 'tech' ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
            )}
          >
            {activeTab === 'news' &&
              newsRecords.map((item) => (
                <div
                  key={item.id}
                  role={onOpenNewsDetail ? 'button' : undefined}
                  tabIndex={onOpenNewsDetail ? 0 : undefined}
                  onClick={onOpenNewsDetail ? () => onOpenNewsDetail(item.id) : undefined}
                  onKeyDown={
                    onOpenNewsDetail
                      ? (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onOpenNewsDetail(item.id);
                          }
                        }
                      : undefined
                  }
                  className="group flex cursor-pointer flex-col gap-6 border-b border-gray-100 p-6 transition-all hover:bg-teal-50/30 sm:flex-row sm:p-8"
                >
                  <div className="flex h-40 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-gray-50 p-2 shadow-sm sm:h-36 sm:w-48">
                    <img
                      src={item.image}
                      referrerPolicy="no-referrer"
                      alt=""
                      className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <h4 className="text-lg font-bold leading-snug text-gray-900 transition-colors group-hover:text-teal-700 md:text-xl">
                      {item.title}
                    </h4>
                    <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                      {richTextExcerpt(item.content, 200)}
                    </p>
                    <div className="mt-4 text-[11px] font-bold text-gray-400">
                      {item.publisher} · {item.publishedAt}
                    </div>
                  </div>
                </div>
              ))}
            {activeTab === 'policy' &&
              policyRecords.map((item) => (
                <div
                  key={item.id}
                  role={onOpenPolicyTechDetail ? 'button' : undefined}
                  tabIndex={onOpenPolicyTechDetail ? 0 : undefined}
                  onClick={
                    onOpenPolicyTechDetail ? () => onOpenPolicyTechDetail(item.id, 'policy') : undefined
                  }
                  onKeyDown={
                    onOpenPolicyTechDetail
                      ? (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onOpenPolicyTechDetail(item.id, 'policy');
                          }
                        }
                      : undefined
                  }
                  className="group cursor-pointer border-b border-gray-100 p-6 transition-all hover:bg-teal-50/30 sm:p-8"
                >
                  <h4 className="text-lg font-bold leading-snug text-gray-900 transition-colors group-hover:text-teal-700 md:text-xl">
                    {item.title}
                  </h4>
                  <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                    {richTextExcerpt(item.content, 200)}
                  </p>
                  <div className="mt-4 text-[11px] font-bold text-gray-400">
                    {item.publisher} · {item.time} 发布
                  </div>
                </div>
              ))}
            {activeTab === 'tech' &&
              techRecords.map((item) => (
                <div
                  key={item.id}
                  role={onOpenPolicyTechDetail ? 'button' : undefined}
                  tabIndex={onOpenPolicyTechDetail ? 0 : undefined}
                  onClick={onOpenPolicyTechDetail ? () => onOpenPolicyTechDetail(item.id, 'tech') : undefined}
                  onKeyDown={
                    onOpenPolicyTechDetail
                      ? (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onOpenPolicyTechDetail(item.id, 'tech');
                          }
                        }
                      : undefined
                  }
                  className="group relative flex cursor-pointer flex-col overflow-hidden border border-gray-200 bg-white p-6 transition-all hover:border-teal-200 hover:shadow-md sm:p-8"
                >
                  <div className="absolute right-2 bottom-2 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity pointer-events-none">
                    <FileText className="w-24 h-24 text-gray-300 transform rotate-12" />
                  </div>

                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="text-xs text-gray-500 font-bold truncate">标准号 {item.code}</span>
                    </div>
                    <span className="text-[10px] font-black px-2 py-1 bg-orange-50 text-orange-600 rounded border border-orange-100 shrink-0">
                      技术标准
                    </span>
                  </div>

                  <h4 className="text-lg font-bold leading-snug text-gray-900 transition-colors group-hover:text-teal-700">
                    {item.title.replace(/[《》]/g, '')}
                  </h4>
                  <p className="relative z-[1] mt-3 text-sm leading-relaxed text-gray-600">
                    {richTextExcerpt(item.content, 200)}
                  </p>
                  <div className="mt-6 flex items-center justify-between text-[11px] font-bold text-gray-400 pb-1 relative z-[1]">
                    <span>{item.publisher || '标准化技术委员会'}</span>
                    <span>{item.time} 发布</span>
                  </div>
                </div>
              ))}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-12 flex items-center justify-center">
        <button
          type="button"
          className="group flex items-center gap-3 text-sm font-bold text-gray-500 transition-colors hover:text-teal-600"
        >
          查看更多 <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

/** 拦截详情/内页时的说明弹窗（注册 → 认证 → 管理员审核） */
const PortalDemoAccessGateModal = ({
  isOpen,
  onClose,
  variant,
  onGoRegister,
  onGoAuth,
}: {
  isOpen: boolean;
  onClose: () => void;
  variant: 'register' | 'auth' | 'pending';
  onGoRegister: () => void;
  onGoAuth: () => void;
}) => {
  if (!isOpen) return null;
  const title =
    variant === 'register'
      ? '请先完成注册'
      : variant === 'auth'
        ? '请先完成用户认证'
        : '认证审核中';
  const body =
    variant === 'register'
      ? '您可在首页浏览各模块与列表页（案例推广、节水需求、产品与服务推荐等）；查看详情、产业看板等功能需先免费注册，并完成「用户认证」后由管理员审核通过即可解锁。'
      : variant === 'auth'
        ? '您已注册，请继续完成「用户认证」并提交申请。管理员审核通过后，即可查看案例详情、供需对接详情、产品与服务详情等完整内容。'
        : '您的认证资料已提交，正在等待平台管理员审核。审核完成后即可在首页浏览详情与更多内容。';

  return (
    <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-gray-900/45 backdrop-blur-[2px]"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          className="relative w-full max-w-[480px] overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-xl shadow-teal-900/10"
          role="dialog"
          aria-modal="true"
          aria-labelledby="portal-demo-gate-title"
        >
          <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-teal-50/80 via-white to-cyan-50/50 px-5 py-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-2">
              <AlertCircle className="h-6 w-6 shrink-0 text-teal-600" aria-hidden />
              <h2 id="portal-demo-gate-title" className="truncate text-lg font-black text-gray-900 sm:text-xl">
                {title}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-transparent text-gray-400 transition hover:border-gray-200 hover:bg-gray-50 hover:text-gray-700"
              aria-label="关闭"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="space-y-5 p-6 sm:p-8">
            <p className="text-sm font-bold leading-relaxed text-gray-600 sm:text-[15px]">{body}</p>
            <div className="flex flex-col gap-2.5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm font-black text-gray-600 transition hover:border-teal-200 hover:bg-gray-50 sm:h-12 sm:px-5"
              >
                稍后再说
              </button>
              {variant === 'register' && (
                <button
                  type="button"
                  onClick={onGoRegister}
                  className="h-11 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 px-4 text-sm font-black text-white shadow-md shadow-teal-600/25 sm:h-12 sm:px-6"
                >
                  去注册
                </button>
              )}
              {variant === 'auth' && (
                <button
                  type="button"
                  onClick={onGoAuth}
                  className="h-11 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 px-4 text-sm font-black text-white shadow-md shadow-teal-600/25 sm:h-12 sm:px-6"
                >
                  去用户认证
                </button>
              )}
              {variant === 'pending' && (
                <button
                  type="button"
                  onClick={onClose}
                  className="h-11 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 px-4 text-sm font-black text-white shadow-md shadow-teal-600/25 sm:h-12 sm:px-6"
                >
                  我知道了
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
  );
};


// Auth Modal Component (Login & Register) — 与门户青绿白底体系一致
const DEFAULT_REGISTER_IDENTITY: PortalUserIdentity = '产业主体';

const AuthModal = ({ 
  isOpen, 
  onClose, 
  mode, 
  setMode, 
  subMode, 
  setSubMode,
  onLoginSuccess,
  onRegisterSuccess,
}: { 
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'register';
  setMode: (m: 'login' | 'register') => void;
  subMode: 'code' | 'password';
  setSubMode: (s: 'code' | 'password') => void;
  onLoginSuccess?: () => void;
  onRegisterSuccess?: (identity: PortalUserIdentity, creds: { phone: string; password: string }) => void;
}) => {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = () => {
    if (mode === 'login') {
      const p = phone.trim();
      if (p) {
        if (subMode === 'password') mergePortalDemoAccount({ phone: p, password });
        else mergePortalDemoAccount({ phone: p });
      }
      onLoginSuccess?.();
      onClose();
      return;
    }
    if (!agreed) return;
    const p = phone.trim();
    if (!/^1[3-9]\d{9}$/.test(p)) return;
    if (password.length < 6) return;
    if (password !== confirmPassword) return;
    onRegisterSuccess?.(DEFAULT_REGISTER_IDENTITY, { phone: p, password });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-gray-900/45 backdrop-blur-[2px]"
        />

        <motion.div 
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          className="relative w-full max-w-[480px] overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-xl shadow-teal-900/10"
        >
          <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-teal-50/80 via-white to-cyan-50/50 px-5 py-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-2">
              <span className="h-6 w-1 shrink-0 rounded-full bg-teal-500" aria-hidden />
              <h2 className="truncate text-lg font-black text-gray-900 sm:text-xl">
                {mode === 'login' ? '用户登录' : '免费注册'}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-transparent text-gray-400 transition hover:border-gray-200 hover:bg-gray-50 hover:text-gray-700"
              aria-label="关闭"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 sm:p-8">
            <div className="mb-8 flex gap-8 border-b border-gray-100">
              {mode === 'login' ? (
                <>
                  <button 
                    type="button"
                    onClick={() => setSubMode('code')}
                    className={cn(
                      'relative pb-3 text-sm font-black transition-colors sm:text-base',
                      subMode === 'code'
                        ? 'text-teal-700 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-teal-600'
                        : 'text-gray-400 hover:text-gray-700'
                    )}
                  >
                    验证码登录
                  </button>
                  <button 
                    type="button"
                    onClick={() => setSubMode('password')}
                    className={cn(
                      'relative pb-3 text-sm font-black transition-colors sm:text-base',
                      subMode === 'password'
                        ? 'text-teal-700 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-teal-600'
                        : 'text-gray-400 hover:text-gray-700'
                    )}
                  >
                    密码登录
                  </button>
                </>
              ) : (
                <span className="relative pb-3 text-sm font-black text-teal-700 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-teal-600 sm:text-base">
                  手机号注册
                </span>
              )}
            </div>

            <div className="space-y-5">
              <div className="relative">
                <input 
                  type="text" 
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder={mode === 'login' ? '请输入手机号' : '请输入注册手机号'}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 sm:h-14 sm:px-5 sm:text-[15px]"
                />
              </div>

              {mode === 'login' ? (
                subMode === 'code' ? (
                  <div className="flex gap-3">
                    <input 
                      type="text" 
                      inputMode="numeric"
                      placeholder="请输入验证码"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="h-12 min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-4 text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 sm:h-14 sm:px-5 sm:text-[15px]"
                    />
                    <button
                      type="button"
                      className="shrink-0 rounded-xl bg-teal-600 px-4 text-xs font-black text-white shadow-sm transition hover:bg-teal-700 active:scale-[0.98] sm:px-5 sm:text-sm"
                    >
                      获取验证码
                    </button>
                  </div>
                ) : (
                  <>
                    <input 
                      type="password" 
                      autoComplete="current-password"
                      placeholder="请输入密码"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 sm:h-14 sm:px-5 sm:text-[15px]"
                    />
                    <div className="flex gap-3">
                      <input 
                        type="text" 
                        placeholder="图形验证码"
                        className="h-12 min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-4 text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 sm:h-14 sm:px-5 sm:text-[15px]"
                      />
                      <div
                        className="flex h-12 w-[7.5rem] shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50 transition hover:border-teal-200 hover:bg-teal-50/50 sm:h-14"
                        title="点击刷新"
                      >
                        <svg width="100%" height="100%" viewBox="0 0 120 45" className="opacity-80">
                          {Array.from({ length: 40 }).map((_, i) => (
                            <circle
                              key={i}
                              cx={Math.random() * 120}
                              cy={Math.random() * 45}
                              r="0.6"
                              fill={['#0d9488', '#f97316', '#0891b2'][Math.floor(Math.random() * 3)]}
                              opacity="0.45"
                            />
                          ))}
                          <path
                            d="M0 22 Q 30 12 60 27 T 120 17"
                            stroke="#0d9488"
                            strokeWidth="1.5"
                            fill="none"
                            opacity="0.25"
                          />
                          <path
                            d="M10 40 Q 50 10 90 35"
                            stroke="#f97316"
                            strokeWidth="1.2"
                            fill="none"
                            opacity="0.2"
                          />
                          <text 
                            x="50%"
                            y="54%"
                            dominantBaseline="middle"
                            textAnchor="middle"
                            fontSize="22"
                            fontWeight="900"
                            fill="#334155"
                            letterSpacing="4"
                            style={{ fontFamily: 'serif', fontStyle: 'italic' }}
                          >
                            S S U S A
                          </text>
                        </svg>
                      </div>
                    </div>
                  </>
                )
              ) : (
                <>
                  <input 
                    type="password" 
                    autoComplete="new-password"
                    placeholder="设置登录密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 sm:h-14 sm:px-5 sm:text-[15px]"
                  />
                  <input 
                    type="password" 
                    autoComplete="new-password"
                    placeholder="再次输入登录密码" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 sm:h-14 sm:px-5 sm:text-[15px]"
                  />
                  <div className="flex gap-3">
                    <input 
                      type="text" 
                      inputMode="numeric"
                      placeholder="请输入短信验证码"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="h-12 min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-4 text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 sm:h-14 sm:px-5 sm:text-[15px]"
                    />
                    <button
                      type="button"
                      className="shrink-0 rounded-xl bg-teal-600 px-4 text-xs font-black text-white shadow-sm transition hover:bg-teal-700 active:scale-[0.98] sm:px-5 sm:text-sm"
                    >
                      获取验证码
                    </button>
                  </div>
                </>
              )}

              <button 
                type="button"
                onClick={handleSubmit}
                className="mt-2 flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 text-sm font-black text-white shadow-md shadow-teal-600/25 ring-1 ring-teal-500/30 transition hover:from-teal-700 hover:to-teal-600 active:scale-[0.98] sm:h-14 sm:text-base"
              >
                {mode === 'login' ? '登 录' : '注 册'}
              </button>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                {mode === 'register' ? (
                  <button
                    type="button"
                    className="flex items-center gap-2 text-left"
                    onClick={() => setAgreed(!agreed)}
                  >
                    <span
                      className={cn(
                        'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
                        agreed ? 'border-teal-600 bg-teal-600' : 'border-gray-300 bg-white'
                      )}
                    >
                      {agreed && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                    </span>
                    <span className="text-xs font-bold text-gray-500">
                      我已阅读并同意{' '}
                      <span className="text-teal-600 hover:underline">《用户须知》</span>
                    </span>
                  </button>
                ) : (
                  <span className="text-xs font-bold text-gray-400" />
                )}

                <button 
                  type="button"
                  onClick={() => (mode === 'login' ? setMode('register') : setMode('login'))}
                  className="text-xs font-bold text-teal-700 hover:underline"
                >
                  {mode === 'login' ? '没有账号，去注册' : '已有账号，去登录'}
                  {mode === 'login' && subMode === 'password' && (
                    <span className="ml-2 text-gray-400 no-underline">忘记密码</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};



/** 首页热门产品宫格：第 0 次为固定 8 格；之后每点「换一批」从 PRODUCTS 环形取 8 条 */
function pickHomeHeroProductTiles(refreshCount: number): HomeHeroProductTile[] {
  if (refreshCount === 0) return [...HOME_HERO_PRODUCT_TILES];
  const n = PRODUCTS.length;
  if (n === 0) return [...HOME_HERO_PRODUCT_TILES];
  const start = ((refreshCount - 1) * 8) % n;
  return Array.from({ length: 8 }, (_, i) => {
    const p = PRODUCTS[(start + i) % n]!;
    return {
      id: `hero-p${p.id}-r${refreshCount}-i${i}`,
      name: p.name,
      image: p.image,
      linkedProductId: p.id,
    };
  });
}

// Main App Layout
export default function App() {
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    mode: 'login' | 'register';
    subMode: 'code' | 'password';
  }>({
    isOpen: false,
    mode: 'login',
    subMode: 'code'
  });
  /** 样式4：一键注册/入驻向导 */
  const [oneClickRegisterOpen, setOneClickRegisterOpen] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>('home');
  /** 产业工作台侧栏菜单：商机总览入口打开时切至「数据总览」 */
  const [industryDashboardMenuTab, setIndustryDashboardMenuTab] = useState('数据总览');
  /** 从门户「发布需求」进入工作台时，自动打开需求中心新增表单 */
  const [demandCenterOpenCreate, setDemandCenterOpenCreate] = useState(false);
  const [casesInitialDetailId, setCasesInitialDetailId] = useState<number | null>(null);
  const [supplyOutcomeDetailId, setSupplyOutcomeDetailId] = useState<number | null>(null);
  /** 从需求中心「与我联系」进入详情时，在联系邮箱下展示手机号 */
  const [supplyOutcomeDetailRevealPhone, setSupplyOutcomeDetailRevealPhone] = useState(false);
  /** 我的消息 → 需求中心列表定位高亮 */
  const [demandHighlightId, setDemandHighlightId] = useState<number | null>(null);
    /** 供需对接详情返回页：从需求中心或已达成的供需对接列表进入 */
  const [supplyOutcomeDetailReturnView, setSupplyOutcomeDetailReturnView] = useState<
    'supply-results' | 'forum-supply' | 'forum-demand'
  >('supply-results');
  /** 供给市场：节水产品一级/二级筛选（与首页 CATEGORIES_HIERARCHY 一致） */
  const [supplyMarketWaterSavingFilter, setSupplyMarketWaterSavingFilter] =
    useState<SupplyMarketWaterSavingFilter>(SUPPLY_MARKET_WATER_SAVING_FILTER_EMPTY);
  /** 首页热门 / 产品推荐：进入同类目商品列表（京东式） */
  const [productCatalogTile, setProductCatalogTile] = useState<HomeHeroProductTile | null>(null);
  /** 首页水效扶持：带公文详情的政策 id（如江苏省水效定稿通知） */
  const [policyDetailId, setPolicyDetailId] = useState<string | null>(null);
  /** 产业资讯页默认主 Tab（首页政策公开/技术标准入口会指定 policy 或 tech） */
  const [policyInfoInitialTab, setPolicyInfoInitialTab] = useState<'news' | 'policy' | 'tech'>('news');
  /** 产业资讯单条详情（新闻 / 政策 / 标准） */
  const [policyInfoDetail, setPolicyInfoDetail] = useState<{
    kind: PolicyInfoDetailKind;
    id: string;
    returnView: AppView;
  } | null>(null);
  /** 首页产品推荐 / 服务推荐：供应详情 */
  const [supplyDetailPayload, setSupplyDetailPayload] = useState<ProductSupplyDetailPayload | null>(null);
  /** 供应详情返回页：首页服务推荐 / 供给市场商品详情 */
  const [supplyDetailReturnView, setSupplyDetailReturnView] = useState<
    'home' | 'forum-supply' | 'company-profile' | 'messages'
  >('home');
  /** 我的消息确认联系后，供应详情可展示该供方完整电话 */
  const [supplyDetailRevealContactFor, setSupplyDetailRevealContactFor] = useState<string | null>(null);
  /** 供应详情「进入主页」：企业信息页 */
  const [companyProfileModel, setCompanyProfileModel] = useState<CompanyProfileModel | null>(null);
  /** 案例推广：仅动效轮播键（15s 递增，数据固定为四条典型案例） */
  const [homeAdvancedCaseCycleKey, setHomeAdvancedCaseCycleKey] = useState(0);
  /** 节水需求：换批索引（10s 循环，驱动动效 + 数据） */
  const [homeDemandBatchIdx, setHomeDemandBatchIdx] = useState(0);
  /** 首页热门产品「换一批」计数：0 为默认宫格，递增则从 PRODUCTS 轮换 */
  const [homeHeroProductRefresh, setHomeHeroProductRefresh] = useState(0);
  const [authRole, setAuthRole] = useState<'industry' | 'user' | null>(null);
  const [registeredUserIdentity, setRegisteredUserIdentity] = useState<PortalUserIdentity>(() =>
    readStoredPortalUserIdentity()
  );
  readPortalUiStyle();
  const portalUiStyle = PORTAL_UI_STYLE;
  const [portalHomeAudience, setPortalHomeAudience] = useState<PortalHomeAudience>(() => {
    const id = readStoredPortalUserIdentity();
    return id === '用水户主体' ? 'water_user' : 'industry_user';
  });
  /** 演示：注册 / 认证提交 / 管理员审核（本地持久化） */
  const [portalAccess, setPortalAccess] = useState<PortalAccessState>(() => readPortalAccess());
  const portalAccessRef = useRef(portalAccess);
  portalAccessRef.current = portalAccess;
  const [demoGateOpen, setDemoGateOpen] = useState(false);
  const [demoGateVariant, setDemoGateVariant] = useState<'register' | 'auth' | 'pending'>('register');
  /** 与 localStorage 登录态联动，供样式4产业主体首页/商机总览切换条 */
  const [demoLoggedIn, setDemoLoggedIn] = useState(() => isDemoSessionLoggedIn());

  const markDemoUserLoggedIn = useCallback(() => {
    setDemoSessionLoggedIn();
    setDemoLoggedIn(true);
  }, []);

  /** 企业入驻 / 工作台用户认证：未注册且未登录会话时先引导完成注册或登录 */
  const enterpriseAuthNeedsGate = useMemo(() => {
    if (portalAccess.authApproved) return false;
    if (portalAccess.registered) return false;
    if (isDemoSessionLoggedIn()) return false;
    return true;
  }, [portalAccess.authApproved, portalAccess.registered]);

  const patchPortalAccess = useCallback((patch: Partial<PortalAccessState>) => {
    setPortalAccess((prev) => {
      const n = { ...prev, ...patch };
      writePortalAccess(n);
      portalAccessRef.current = n;
      return n;
    });
  }, []);

  const showAccessDeniedModal = useCallback(() => {
    setDemoGateVariant(accessDeniedVariant(portalAccessRef.current));
    setDemoGateOpen(true);
  }, []);

  const clearCasesInitialDetail = useCallback(() => setCasesInitialDetailId(null), []);

  const tryNavigate = useCallback(
    (view: AppView) => {
      const target: AppView = view === 'opportunity-overview' ? 'industry-dashboard' : view;
      if (!isPortalViewUnlocked(target, portalAccessRef.current)) {
        showAccessDeniedModal();
        return false;
      }
      if (view === 'opportunity-overview') {
        setIndustryDashboardMenuTab(getWorkbenchDefaultMenuTab(registeredUserIdentity));
      }
      if (view === 'enterprise-settle') {
        setAuthRole((prev) => prev ?? portalIdentityToAuthRole(registeredUserIdentity));
      }
      setCurrentView(target);
      window.scrollTo(0, 0);
      return true;
    },
    [showAccessDeniedModal, registeredUserIdentity]
  );

  const openPolicyInfoModule = useCallback(
    (tab: 'news' | 'policy' | 'tech') => {
      if (!isPortalViewUnlocked('policy', portalAccessRef.current)) {
        showAccessDeniedModal();
        return;
      }
      setPolicyInfoInitialTab(tab);
      setCurrentView('policy');
      window.scrollTo(0, 0);
    },
    [showAccessDeniedModal]
  );

  const openPolicyInfoDetail = useCallback(
    (kind: PolicyInfoDetailKind, id: string, returnView: AppView = 'home') => {
      if (!isPortalViewUnlocked('policy-info-detail', portalAccessRef.current)) {
        showAccessDeniedModal();
        return;
      }
      setPolicyInfoDetail({ kind, id, returnView });
      setCurrentView('policy-info-detail');
      window.scrollTo(0, 0);
    },
    [showAccessDeniedModal]
  );

  const openWaterEfficiencyPolicyFromItem = useCallback(
    (item: HomeWaterEfficiencyPolicyListingItem) => {
      if (getHomePolicyNoticeDetail(item.id)) {
        if (!isPortalViewUnlocked('policy-detail', portalAccessRef.current)) {
          showAccessDeniedModal();
          return;
        }
        setPolicyDetailId(item.id);
        setCurrentView('policy-detail');
        window.scrollTo(0, 0);
        return;
      }
      openPolicyInfoModule('policy');
    },
    [openPolicyInfoModule, showAccessDeniedModal]
  );

  /** 顶栏「企业入驻」：进入企业入驻（用户认证）整页 */
  const openEnterpriseSettle = useCallback(() => {
    tryNavigate('enterprise-settle');
  }, [tryNavigate]);

  /** 用户认证 / 企业入驻表单提交；navigateHome 为 true 时回首页（独立认证页） */
  const finishEnterpriseAuthApplication = useCallback(
    (navigateHome = false) => {
      patchPortalAccess({ authSubmitted: true });
      if (navigateHome) {
        setCurrentView('home');
        window.scrollTo(0, 0);
      }
    },
    [patchPortalAccess]
  );

  /** 顶栏「联系客服」：演示用邮件入口（正式环境可替换为 IM / 工单） */
  const openContactService = useCallback(() => {
    window.open('mailto:service@shuilin.cn', '_blank', 'noopener,noreferrer');
  }, []);

  const openEnterpriseAuthRegisterModal = useCallback(() => {
    setAuthModal({ isOpen: true, mode: 'register', subMode: 'code' });
  }, []);

  const openEnterpriseAuthLoginModal = useCallback(() => {
    setAuthModal({ isOpen: true, mode: 'login', subMode: 'code' });
  }, []);

  const resetDemoVisitor = useCallback(() => {
    clearPortalAccess();
    clearPortalDemoAccount();
    const next = readPortalAccess();
    portalAccessRef.current = next;
    setPortalAccess(next);
    setAuthRole(null);
    setDemoLoggedIn(false);
    setCurrentView('home');
    window.scrollTo(0, 0);
  }, []);

  const openStyle4Backend = useCallback(() => {
    setIndustryDashboardMenuTab(getWorkbenchDefaultMenuTab(registeredUserIdentity));
    tryNavigate('industry-dashboard');
  }, [tryNavigate, registeredUserIdentity]);

  const openHomeAdminFromToolbar = useCallback(() => {
    setIndustryDashboardMenuTab('首页管理');
    tryNavigate('industry-dashboard');
  }, [tryNavigate]);

  /** 门户登录成功：样式4产业侧默认进入商机总览（数据总览），其余保持原逻辑 */
  const finishPortalLoginSuccess = useCallback(
    (opts?: { homeWhenNotSubmitted?: boolean }) => {
      const account = readPortalDemoAccount();
      const loginPhone = account?.phone?.trim() ?? '';
      const loginIdentity =
        (account?.identity as PortalUserIdentity | undefined) ?? registeredUserIdentity;

      if (loginIdentity === '用水户主体' && loginPhone) {
        const gate = getWaterUserLoginGate(loginPhone);
        if (!gate.allowed) {
          window.alert(gate.message);
          return;
        }
      }

      markDemoUserLoggedIn();
      const a = portalAccessRef.current;
      const next: PortalAccessState = {
        ...a,
        registered: true,
        authSubmitted: loginIdentity === '用水户主体' ? true : a.authSubmitted,
        authApproved: loginIdentity === '用水户主体' ? true : a.authApproved,
      };
      writePortalAccess(next);
      portalAccessRef.current = next;
      setPortalAccess(next);
      setRegisteredUserIdentity(loginIdentity);
      persistPortalUserIdentity(loginIdentity);
      setAuthRole(portalIdentityToAuthRole(loginIdentity));

      if (loginIdentity === '用水户主体') {
        setPortalHomeAudience('water_user');
        setCurrentView('home');
        window.scrollTo(0, 0);
        return;
      }

      if (isPortalIndustryLikeUser(loginIdentity)) {
        setIndustryDashboardMenuTab(getWorkbenchDefaultMenuTab(loginIdentity));
        setCurrentView('industry-dashboard');
        window.scrollTo(0, 0);
        return;
      }

      if (next.authApproved) {
        setIndustryDashboardMenuTab(getWorkbenchDefaultMenuTab(loginIdentity));
        setCurrentView('industry-dashboard');
        window.scrollTo(0, 0);
        return;
      }
      if (!next.authSubmitted) {
        if (opts?.homeWhenNotSubmitted) {
          setCurrentView('home');
          window.scrollTo(0, 0);
        }
        return;
      }
      if (next.authSubmitted && !next.authApproved) {
        setCurrentView('home');
        window.scrollTo(0, 0);
      }
    },
    [markDemoUserLoggedIn, portalUiStyle, registeredUserIdentity]
  );

  useEffect(() => {
    if (!isPortalViewUnlocked(currentView, portalAccessRef.current)) {
      setCurrentView('home');
      window.scrollTo(0, 0);
    }
  }, [currentView, portalAccess]);

  useEffect(() => {
    if (portalAccess.authApproved) {
      setAuthRole(portalIdentityToAuthRole(registeredUserIdentity));
    }
  }, [portalAccess.authApproved, registeredUserIdentity]);

  useEffect(() => {
    persistPortalHomeAudience(portalHomeAudience);
  }, [portalHomeAudience]);

  /** 首页受众与门户身份对齐（产业主体/系统管理员 → 产业侧） */
  useEffect(() => {
    setPortalHomeAudience(registeredUserIdentity === '用水户主体' ? 'water_user' : 'industry_user');
  }, [registeredUserIdentity]);

  useEffect(() => {
    if (currentView !== 'cases') setCasesInitialDetailId(null);
  }, [currentView]);

  useEffect(() => {
    if (currentView !== 'supply-outcome-detail') {
      setSupplyOutcomeDetailId(null);
    }
  }, [currentView]);

  useEffect(() => {
    if (currentView !== 'supply-outcome-detail' || supplyOutcomeDetailId == null) return;
    if (!getPortalDemandById(supplyOutcomeDetailId)) {
      setCurrentView(supplyOutcomeDetailReturnView);
    }
  }, [currentView, supplyOutcomeDetailId, supplyOutcomeDetailReturnView]);

  /** 首页案例推广每 15s 触发「换一批」动效（数据不变） */
  useEffect(() => {
    if (currentView !== 'home') {
      setHomeAdvancedCaseCycleKey(0);
      return;
    }
    const t = window.setInterval(() => {
      setHomeAdvancedCaseCycleKey((k) => k + 1);
    }, HOME_ADVANCED_CASE_AUTO_ANIM_MS);
    return () => window.clearInterval(t);
  }, [currentView]);

  /** 首页节水需求每 10s 换批（动效 + 数据） */
  useEffect(() => {
    if (currentView !== 'home') {
      setHomeDemandBatchIdx(0);
      return;
    }
    const n = HOME_CASES_DEMANDS_ROTATION_SYNC_LENGTH;
    if (n <= 1) return;
    const t = window.setInterval(() => {
      setHomeDemandBatchIdx((i) => (i + 1) % n);
    }, HOME_DEMAND_ROTATION_MS);
    return () => window.clearInterval(t);
  }, [currentView]);

  /** lg 下首屏：样式4 按视口扣除「需求/案例首行」高度，左栏产业分类可滚动；样式3 仍以左侧分类自然高度为行高基准 */
  const homeHeroLeftCardRef = useRef<HTMLDivElement>(null);
  const homeHeroFirstSectionRef = useRef<HTMLElement | null>(null);
  const homeStyle4DemandPeekRef = useRef<HTMLDivElement>(null);
  const homeStyle4CasesPeekRef = useRef<HTMLDivElement>(null);
  const [homeHeroRowHeight, setHomeHeroRowHeight] = useState(0);
  const [homeCategoryFlyoutOpen, setHomeCategoryFlyoutOpen] = useState(false);
  /** 从子页返回首页时递增，触发首屏行高重新测量，避免 --home-hero-h 沿用错误值导致排版错乱 */
  const [homeLayoutEpoch, setHomeLayoutEpoch] = useState(0);

  const bumpHomeLayoutEpoch = useCallback(() => {
    setHomeLayoutEpoch((n) => n + 1);
  }, []);

  const syncPortalUserIdentity = (identity: PortalUserIdentity) => {
    setRegisteredUserIdentity(identity);
    persistPortalUserIdentity(identity);
    setPortalHomeAudience(identity === '用水户主体' ? 'water_user' : 'industry_user');
    if (portalAccessRef.current.authApproved) {
      setAuthRole(portalIdentityToAuthRole(identity));
    }
  };

  const handleStyle4ToolbarRoleChange = useCallback(
    (role: PortalStyle4ToolbarRole) => {
      const identity = role as PortalUserIdentity;
      setRegisteredUserIdentity(identity);
      persistPortalUserIdentity(identity);
      setPortalHomeAudience(role === '用水户主体' ? 'water_user' : 'industry_user');
      // 顶栏切换身份须立即同步工作台分流，否则「系统管理员」会沿用旧 authRole，管理后台与产业主体不一致
      setAuthRole(portalIdentityToAuthRole(identity));
      setIndustryDashboardMenuTab(getWorkbenchDefaultMenuTab(identity));
      tryNavigate('opportunity-overview');
    },
    [portalUiStyle, tryNavigate]
  );

  const homeDemandsBatch = useMemo(() => {
    const n = Math.max(1, HOME_CASES_DEMANDS_ROTATION_SYNC_LENGTH);
    const idx = homeDemandBatchIdx % n;
    return HOME_DEMAND_ROTATION_BATCHES[idx] ?? HOME_DEMAND_ROTATION_BATCHES[0];
  }, [homeDemandBatchIdx]);

  useLayoutEffect(() => {
    if (currentView !== 'home') {
      setHomeHeroRowHeight(0);
      return;
    }

    // 返回首页时先清空固定行高，待下方需求/案例区稳定后再写入，避免分类与产品推荐列高错位
    setHomeHeroRowHeight(0);

    const media = window.matchMedia('(min-width: 1024px)');
    /** 与下方「需求/案例」区块的 space-y-6 间距（tailwind 1.5rem） */
    const HOME_FOLD_SECTION_GAP_PX = 24;
    const HOME_FOLD_BOTTOM_SAFE_PX = 6;
    const MIN_HERO_ROW_PX = 260;
    /** 样式4：产品推荐 3×4 宫格 + 左栏分类 + 水麒麟侧栏的最低可视高度 */
    const STYLE4_MIN_HERO_ROW_PX = 520;
    const MAX_HERO_ROW_PX = 960;

    let ro: ResizeObserver | null = null;
    let rafWait = 0;
    let rafStabilizeOuter = 0;
    let rafStabilizeInner = 0;
    const delayedSyncIds: number[] = [];
    let cancelled = false;
    let waitFrames = 0;
    const MAX_REF_WAIT_FRAMES = 240;

    const syncHeight = () => {
      if (cancelled) return;
      if (!media.matches) {
        setHomeHeroRowHeight(0);
        return;
      }
      const heroEl = homeHeroFirstSectionRef.current;
      const dPeek = homeStyle4DemandPeekRef.current;
      const cPeek = homeStyle4CasesPeekRef.current;
      if (!heroEl || !dPeek || !cPeek) return;
      const peekH = Math.max(dPeek.offsetHeight, cPeek.offsetHeight, 96);
      const heroTop = heroEl.getBoundingClientRect().top;
      const raw = Math.floor(
        window.innerHeight - heroTop - HOME_FOLD_SECTION_GAP_PX - peekH - HOME_FOLD_BOTTOM_SAFE_PX
      );
      setHomeHeroRowHeight(
        Math.min(MAX_HERO_ROW_PX, Math.max(STYLE4_MIN_HERO_ROW_PX, raw))
      );
    };

    const attach = () => {
      if (cancelled) return;
      const heroEl = homeHeroFirstSectionRef.current;
      const dPeek = homeStyle4DemandPeekRef.current;
      const cPeek = homeStyle4CasesPeekRef.current;
      if (!heroEl || !dPeek || !cPeek) {
        if (++waitFrames > MAX_REF_WAIT_FRAMES) return;
        rafWait = requestAnimationFrame(attach);
        return;
      }
      ro = new ResizeObserver(() => syncHeight());
      ro.observe(heroEl);
      ro.observe(dPeek);
      ro.observe(cPeek);
      window.addEventListener('resize', syncHeight);
      media.addEventListener('change', syncHeight);
      syncHeight();
      rafStabilizeOuter = requestAnimationFrame(() => {
        rafStabilizeInner = requestAnimationFrame(syncHeight);
      });
    };

    const scheduleDelayedSync = () => {
      for (const ms of [0, 80, 200, 400]) {
        delayedSyncIds.push(
          window.setTimeout(() => {
            if (!cancelled) syncHeight();
          }, ms)
        );
      }
    };

    attach();
    scheduleDelayedSync();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafWait);
      cancelAnimationFrame(rafStabilizeOuter);
      cancelAnimationFrame(rafStabilizeInner);
      for (const id of delayedSyncIds) window.clearTimeout(id);
      media.removeEventListener('change', syncHeight);
      window.removeEventListener('resize', syncHeight);
      ro?.disconnect();
    };
  }, [
    currentView,
    portalUiStyle,
    homeLayoutEpoch,
    homeDemandsBatch,
    homeDemandBatchIdx,
    homeAdvancedCaseCycleKey,
  ]);

  const homeHeroTiles = useMemo(
    () => pickHomeHeroProductTiles(homeHeroProductRefresh),
    [homeHeroProductRefresh]
  );

  /** 样式4 用水户首屏：4×3 产品位，不足 12 条时在宫格内循环展示 */
  const homeStyle4WaterHeroSlots = useMemo(() => {
    const tiles = homeHeroTiles;
    if (tiles.length === 0) return [] as HomeHeroProductTile[];
    return Array.from({ length: 12 }, (_, i) => tiles[i % tiles.length]!);
  }, [homeHeroTiles]);

  const supplyOutcomeDetailData = useMemo(
    () => (supplyOutcomeDetailId != null ? getPortalDemandById(supplyOutcomeDetailId) : undefined),
    [supplyOutcomeDetailId]
  );

  const homeRecommendGridProducts = useMemo(
    () => Array.from({ length: 20 }, (_, i) => PRODUCTS[i % PRODUCTS.length]!),
    []
  );

  const openSupplyDetail = useCallback(
    (
      payload: ProductSupplyDetailPayload,
      options?: {
        returnView?: 'home' | 'forum-supply' | 'company-profile' | 'messages';
        /** 已确认联系的供方名称，匹配时展示完整电话 */
        revealContactFor?: string | null;
      }
    ) => {
      if (!isPortalViewUnlocked('product-detail', portalAccessRef.current)) {
        showAccessDeniedModal();
        return;
      }
      setSupplyDetailReturnView(options?.returnView ?? 'home');
      if (options && 'revealContactFor' in options) {
        setSupplyDetailRevealContactFor(options.revealContactFor ?? null);
      }
      setSupplyDetailPayload(payload);
      setCurrentView('product-detail');
      window.scrollTo(0, 0);
    },
    [showAccessDeniedModal]
  );

  /** 供给市场商品卡片：与样式 3 首页「服务推荐」同款 B2B 供应详情 */
  const openSupplyProductDetailFromMarket = useCallback(
    (p: (typeof PRODUCTS)[number]) => {
      openSupplyDetail({ kind: 'product', product: p }, { returnView: 'forum-supply' });
    },
    [openSupplyDetail]
  );

  const openSupplyOutcomeDetail = useCallback(
    (
      id: number,
      options: { revealContactPhone?: boolean; returnView: 'supply-results' | 'forum-supply' | 'forum-demand' }
    ) => {
      if (!isPortalViewUnlocked('supply-outcome-detail', portalAccessRef.current)) {
        showAccessDeniedModal();
        return;
      }
      if (options.revealContactPhone) {
        const row = getPortalDemandById(id);
        if (row && row.demandType !== '交流讨论') {
          recordDemandContact(row);
        }
      }
      setSupplyOutcomeDetailRevealPhone(Boolean(options.revealContactPhone));
      setSupplyOutcomeDetailReturnView(options.returnView);
      setSupplyOutcomeDetailId(id);
      setCurrentView('supply-outcome-detail');
      window.scrollTo(0, 0);
    },
    [showAccessDeniedModal]
  );

  const openDemandFromMessage = useCallback(
    (demandId: number) => {
      setDemandHighlightId(demandId);
      if (!tryNavigate('forum-demand')) return;
    },
    [tryNavigate]
  );

  const openProductFromMessage = useCallback(
    (msg: PortalContactMessage) => {
      const payload = resolveProductPayloadFromMessage(msg);
      if (!payload) return;
      openSupplyDetail(payload, {
        returnView: 'messages',
        revealContactFor: canRevealSupplierContactForMessage(msg) ? msg.peerName : null,
      });
    },
    [openSupplyDetail]
  );

  const openProductByIdFromWorkbench = useCallback(
    (productId: number) => {
      const p = PRODUCTS.find((x) => x.id === productId);
      if (!p) return;
      openSupplyDetail({ kind: 'product', product: p }, { returnView: 'home' });
    },
    [openSupplyDetail]
  );

  const openCaseFromWorkbenchFavorites = useCallback((caseId: number) => {
    setCasesInitialDetailId(caseId);
    setCurrentView('cases');
    window.scrollTo(0, 0);
  }, []);

  const openCompanyProfileFromDetail = useCallback(() => {
    if (!isPortalViewUnlocked('company-profile', portalAccessRef.current)) {
      showAccessDeniedModal();
      return;
    }
    if (!supplyDetailPayload) return;
    setCompanyProfileModel(buildCompanyProfileModel(supplyDetailPayload));
    setCurrentView('company-profile');
    window.scrollTo(0, 0);
  }, [supplyDetailPayload, showAccessDeniedModal]);

  const openProductCatalogFromTile = useCallback(
    (tile: HomeHeroProductTile) => {
      if (!isPortalViewUnlocked('product-catalog', portalAccessRef.current)) {
        showAccessDeniedModal();
        return;
      }
      setProductCatalogTile(tile);
      setCurrentView('product-catalog');
      window.scrollTo(0, 0);
    },
    [showAccessDeniedModal]
  );

  const openProductCatalogFromStyle4IndustryRow = useCallback(
    (rowId: string) => {
      const row = getIndustryStyle4FlatRowById(rowId);
      openProductCatalogFromTile({
        id: `s4-industry-${encodeURIComponent(rowId)}`,
        name: row?.name ?? rowId,
        image: '',
        style4IndustryCategoryId: rowId,
      });
    },
    [openProductCatalogFromTile]
  );

  const openProductCatalogFromSidebarItem = useCallback(
    (keyword: string) => {
      openProductCatalogFromTile({
        id: `category-item-${encodeURIComponent(keyword)}`,
        name: keyword,
        image: '',
        categoryLeafKeyword: keyword,
      });
    },
    [openProductCatalogFromTile]
  );

  const openProductCatalogFromSidebarTopCategory = useCallback(
    (topCategoryName: string) => {
      openProductCatalogFromTile({
        id: `category-top-${encodeURIComponent(topCategoryName)}`,
        name: topCategoryName,
        image: '',
        waterSavingTopCategory: topCategoryName,
      });
    },
    [openProductCatalogFromTile]
  );

  const openProductCatalogFromSidebarSubCategory = useCallback(
    (topCategoryName: string, subCategoryName: string) => {
      openProductCatalogFromTile({
        id: `category-sub-${encodeURIComponent(topCategoryName)}-${encodeURIComponent(subCategoryName)}`,
        name: `${topCategoryName} · ${subCategoryName}`,
        image: '',
        waterSavingTopCategory: topCategoryName,
        waterSavingSubCategory: subCategoryName,
      });
    },
    [openProductCatalogFromTile]
  );

  const openSupplyMarket = useCallback(
    (filter?: Partial<SupplyMarketWaterSavingFilter>) => {
      if (!tryNavigate('forum-supply')) return;
      setSupplyMarketWaterSavingFilter({
        selectedTops: filter?.selectedTops ?? [],
        selectedSubs: filter?.selectedSubs ?? [],
        leafKeyword: filter?.leafKeyword,
      });
    },
    [tryNavigate]
  );

  const openSupplyMarketFromHomeKeyword = useCallback(
    (keyword: string) => {
      openSupplyMarket(buildSupplyMarketFilterFromHomeKeyword(keyword, portalUiStyle));
    },
    [openSupplyMarket, portalUiStyle]
  );

  const openSupplyMarketFromSubCategory = useCallback(
    (topCategoryName: string, subCategoryName: string) => {
      openSupplyMarket({
        selectedTops: [],
        selectedSubs: [{ top: topCategoryName, sub: subCategoryName }],
      });
    },
    [openSupplyMarket]
  );

  const openSupplyMarketFromHeroTile = useCallback(
    (tile: HomeHeroProductTile) => {
      openSupplyMarket(buildSupplyMarketFilterFromHeroTile(tile, portalUiStyle));
    },
    [openSupplyMarket, portalUiStyle]
  );

  const openProductManagementFromPublish = useCallback(() => {
    setIndustryDashboardMenuTab('产品管理');
    setCurrentView('industry-dashboard');
    window.scrollTo(0, 0);
  }, []);

  const openDemandCenterFromPublish = useCallback(() => {
    if (!isPortalIndustryLikeUser(registeredUserIdentity)) {
      setAuthModal({ isOpen: true, mode: 'login', subMode: 'code' });
      return;
    }
    setDemandCenterOpenCreate(true);
    setIndustryDashboardMenuTab('需求中心');
    tryNavigate('industry-dashboard');
  }, [registeredUserIdentity, tryNavigate]);

  useEffect(() => {
    if (currentView === 'product-catalog' && !productCatalogTile) {
      setCurrentView('home');
    }
  }, [currentView, productCatalogTile]);

  useEffect(() => {
    if (currentView !== 'product-catalog') setProductCatalogTile(null);
  }, [currentView]);

  useEffect(() => {
    if (currentView === 'product-detail' && !supplyDetailPayload) {
      setCurrentView('home');
    }
  }, [currentView, supplyDetailPayload]);

  useEffect(() => {
    if (currentView !== 'product-detail' && currentView !== 'company-profile') {
      setSupplyDetailPayload(null);
    }
  }, [currentView]);

  useEffect(() => {
    if (currentView !== 'company-profile') {
      setCompanyProfileModel(null);
    }
  }, [currentView]);

  useEffect(() => {
    if (currentView !== 'policy-detail') {
      setPolicyDetailId(null);
      return;
    }
    if (!policyDetailId || !getHomePolicyNoticeDetail(policyDetailId)) {
      setCurrentView('home');
      window.scrollTo(0, 0);
    }
  }, [currentView, policyDetailId]);

  const productCatalogList = useMemo(
    () => (productCatalogTile ? getProductsForHeroTile(productCatalogTile) : []),
    [productCatalogTile]
  );

  const policyNoticeDetail = useMemo(
    () => (policyDetailId ? getHomePolicyNoticeDetail(policyDetailId) : null),
    [policyDetailId]
  );

  return (
    <div
      className={cn(
        'text-gray-800 font-sans flex min-h-screen flex-col',
        currentView === 'home' && 'bg-gray-50',
        currentView !== 'home' && 'bg-gray-50/50'
      )}
    >
      <Navbar 
        currentView={currentView}
        onViewChange={(v) => {
          if (v === 'cases') setCasesInitialDetailId(null);
          tryNavigate(v);
        }}
        onAuthClick={(mode) => setAuthModal({ isOpen: true, mode, subMode: 'code' })}
        compactSearch={false}
        isHome={currentView === 'home'}
        onEnterpriseSettle={openEnterpriseSettle}
        onOpenOneClickRegister={() => setOneClickRegisterOpen(true)}
        onContactService={openContactService}
        style4ToolbarRole={toStyle4ToolbarRole(registeredUserIdentity)}
        onStyle4ToolbarRoleChange={handleStyle4ToolbarRoleChange}
        onStyle4OpenBackend={openStyle4Backend}
      />

      <OneClickRegisterWizard
        isOpen={oneClickRegisterOpen}
        onClose={() => setOneClickRegisterOpen(false)}
        onRegisterSuccess={(identity, creds, options) => {
          writePortalDemoAccount({
            ...creds,
            identity,
            enterpriseId: options?.enterpriseId,
          });
          setRegisteredUserIdentity(identity as PortalUserIdentity);
          persistPortalUserIdentity(identity as PortalUserIdentity);
          if (options?.pendingWaterAudit) {
            patchPortalAccess({ registered: true, authSubmitted: true, authApproved: false });
            return;
          }
          patchPortalAccess({ registered: true });
          setAuthRole(portalIdentityToAuthRole(identity as PortalUserIdentity));
          markDemoUserLoggedIn();
          setOneClickRegisterOpen(false);
        }}
        onLoginOnly={() => {
          setOneClickRegisterOpen(false);
          setAuthModal({ isOpen: true, mode: 'login', subMode: 'code' });
        }}
      />

      <PortalDemoAccessGateModal
        isOpen={demoGateOpen}
        onClose={() => setDemoGateOpen(false)}
        variant={demoGateVariant}
        onGoRegister={() => {
          setDemoGateOpen(false);
          if (portalUiStyle === 4) setOneClickRegisterOpen(true);
          else setAuthModal({ isOpen: true, mode: 'register', subMode: 'code' });
        }}
        onGoAuth={() => {
          setDemoGateOpen(false);
          setAuthRole(portalIdentityToAuthRole(registeredUserIdentity));
          setCurrentView('enterprise-settle');
          window.scrollTo(0, 0);
        }}
      />

      <AuthModal 
        isOpen={authModal.isOpen}
        onClose={() => setAuthModal(prev => ({ ...prev, isOpen: false }))}
        mode={authModal.mode}
        setMode={(mode) => setAuthModal(prev => ({ ...prev, mode }))}
        subMode={authModal.subMode}
        setSubMode={(subMode) => setAuthModal(prev => ({ ...prev, subMode }))}
        onLoginSuccess={() => {
          setAuthModal((prev) => ({ ...prev, isOpen: false }));
          finishPortalLoginSuccess();
        }}
        onRegisterSuccess={(identity, creds) => {
          writePortalDemoAccount(creds);
          setRegisteredUserIdentity(identity);
          persistPortalUserIdentity(identity);
          patchPortalAccess({ registered: true });
          setAuthRole(portalIdentityToAuthRole(identity));
          markDemoUserLoggedIn();
          setAuthModal((prev) => ({ ...prev, isOpen: false }));
          // 注册成功后留在当前页，不自动跳转「用户认证」整页；用户可从主导航或工作台侧栏进入认证
        }}
      />

      <div className="flex min-h-0 flex-1 flex-col">
      <AnimatePresence mode="wait">
        {currentView === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            onAnimationComplete={(definition) => {
              if (definition === 'animate') bumpHomeLayoutEpoch();
            }}
            className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-gradient-to-b from-gray-50 via-teal-50/10 to-gray-50"
          >
            <div className="mx-auto w-full max-w-[1440px] space-y-6 px-4 py-5 pb-12 sm:space-y-8 sm:px-6 sm:py-6">
              {/* 首屏大屏：左侧分类卡片高度为基准（不拉伸）；中右列由 ResizeObserver 同步同高，宫格内配图随容器变矮而缩小 */}
              <section
                ref={homeHeroFirstSectionRef}
                className="flex flex-col gap-4 overflow-visible lg:flex-row lg:items-stretch lg:gap-5"
                style={
                  homeHeroRowHeight > 0
                    ? ({ ['--home-hero-h' as string]: `${homeHeroRowHeight}px` } as React.CSSProperties)
                    : undefined
                }
              >
                <aside
                  className={cn(
                    'relative flex w-full shrink-0 flex-col overflow-visible lg:w-52',
                    homeCategoryFlyoutOpen ? 'z-50' : 'z-20',
                    homeHeroRowHeight > 0 &&
                      'lg:h-[var(--home-hero-h)] lg:max-h-[var(--home-hero-h)] lg:min-h-0'
                  )}
                >
                  <VerticalCategories
                    ref={homeHeroLeftCardRef}
                    categoryHierarchy={CATEGORIES_HIERARCHY}
                    industryFlatRows={CATEGORIES_INDUSTRY_STYLE4_FLAT}
                    categoryListScrollable
                    onFlyoutOpenChange={setHomeCategoryFlyoutOpen}
                    onSelectCategoryItem={openSupplyMarketFromHomeKeyword}
                    onBrowseTopCategoryList={(top) => {
                      openSupplyMarket({ selectedTops: [top], selectedSubs: [] });
                    }}
                    onBrowseSubCategoryList={openSupplyMarketFromSubCategory}
                    onBrowseStyle4IndustryRow={(rowId) => {
                      openSupplyMarket(buildSupplyMarketFilterFromStyle4RowId(rowId));
                    }}
                  />
                </aside>

                  <div
                    className={cn(
                    'relative z-10 flex min-h-[380px] min-w-0 flex-col sm:min-h-[420px] lg:min-h-0 lg:flex-1 lg:basis-0 lg:overflow-hidden',
                    homeHeroRowHeight === 0 && 'lg:min-h-[520px]',
                    homeHeroRowHeight > 0 && 'lg:h-[var(--home-hero-h)] lg:max-h-[var(--home-hero-h)]'
                  )}
                >
                  <div
                    className={cn(
                      'flex min-h-0 flex-1 flex-col overflow-hidden p-2.5 sm:p-3 lg:h-full lg:min-h-0 lg:p-3',
                      HOME_CARD_BORDER,
                      // lg 与右侧水麒麟区相邻时去掉右描边，避免一条竖缝与浅灰背景不协调
                      'lg:border-r-0'
                    )}
                  >
                    <HomeSectionHeader
                      title="产品推荐"
                      refreshLabel="换一批"
                      onRefresh={() => setHomeHeroProductRefresh((n) => n + 1)}
                      className="mb-2 shrink-0"
                    />
                    <div className="grid min-h-[280px] flex-1 auto-rows-[minmax(5.5rem,1fr)] grid-cols-2 grid-rows-6 gap-2 sm:min-h-[300px] sm:grid-cols-4 sm:grid-rows-3 sm:gap-2.5 lg:min-h-0">
                      {homeStyle4WaterHeroSlots.map((tile, idx) => (
                        <div key={`${tile.id}-s4-${idx}`} className="contents">
                          <HomeHeroCategoryTile
                            tile={tile}
                            onSelectProduct={openSupplyMarketFromHeroTile}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div
                  className={cn(
                    'flex w-full shrink-0 flex-col lg:min-h-0 lg:w-[min(100%,280px)] xl:w-[300px]',
                    homeHeroRowHeight > 0 && 'lg:h-[var(--home-hero-h)] lg:max-h-[var(--home-hero-h)] lg:overflow-hidden'
                  )}
                >
                  <div className="flex min-h-0 flex-1 flex-col lg:min-h-0">
                    <HomeKirinAssistantPanel
                      onOpenAi={() => setIsAiModalOpen(true)}
                      layout="style3"
                    />
                  </div>
                </div>
              </section>

              <HomeStyle4SupplyDemandCards
                onOpenSupply={() => tryNavigate('forum-supply')}
                onOpenDemand={() => tryNavigate('forum-demand')}
              />

              <section aria-label="节水需求与典型案例" className="w-full">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-stretch lg:gap-5">
                  <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                    <HomeStyle4DemandsSection
                      demands={homeDemandsBatch}
                      animationCycleKey={homeDemandBatchIdx}
                      onMore={() => tryNavigate('forum-demand')}
                      splitPeekRef={homeStyle4DemandPeekRef}
                    />
                  </div>
                  <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                    <HomeStyle4CasesSection
                      cases={HOME_ADVANCED_CASE_TILES}
                      animationCycleKey={homeAdvancedCaseCycleKey}
                      splitPeekRef={homeStyle4CasesPeekRef}
                      onMore={() => {
                        setCasesInitialDetailId(null);
                        tryNavigate('cases');
                      }}
                      onCaseClick={(tileId) => {
                        const id = homeAdvancedCaseTileIdToPortalCaseId(tileId);
                        if (id != null) setCasesInitialDetailId(id);
                        else setCasesInitialDetailId(null);
                        setCurrentView('cases');
                        window.scrollTo(0, 0);
                      }}
                    />
                  </div>
                </div>
              </section>

              <HomeStyle4TechPanels
                policyItems={POLICIES.slice(0, 5).map((p) => ({
                  id: `policy-${p.id}`,
                  label: p.name,
                }))}
                standardItems={STANDARDS.slice(0, 5).map((s) => ({
                  id: `tech-${s.id}`,
                  label: s.name,
                }))}
                onOpenPolicy={() => openPolicyInfoModule('policy')}
                onOpenTech={() => openPolicyInfoModule('tech')}
                onSelectPolicy={(id) => openPolicyInfoDetail('policy', id, 'home')}
                onSelectTech={(id) => openPolicyInfoDetail('tech', id, 'home')}
              />
            </div>
          </motion.div>
        )}

        {currentView === 'industry-login' && (
          <motion.div
            key="industry-login"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="max-w-[1440px] mx-auto px-6"
          >
             <IndustryLogin
              onLogin={() => {
                finishPortalLoginSuccess({ homeWhenNotSubmitted: true });
              }}
            />
          </motion.div>
        )}

        {currentView === 'industry-dashboard' && (
          <motion.div
            key="industry-dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="min-h-0 w-full flex-1 bg-gradient-to-b from-gray-50 via-teal-50/15 to-gray-50 py-2"
          >
            <div className="mx-auto w-full max-w-[1440px] px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
             <IndustryDashboard
               menuActiveTab={industryDashboardMenuTab}
               onMenuActiveTabChange={setIndustryDashboardMenuTab}
               demandCenterOpenCreate={demandCenterOpenCreate}
               onDemandCenterOpenCreateConsumed={() => setDemandCenterOpenCreate(false)}
               portalUserIdentity={registeredUserIdentity}
               onOpenProductFromMessage={openProductFromMessage}
               onOpenProductById={openProductByIdFromWorkbench}
               onViewCaseFromFavorites={openCaseFromWorkbenchFavorites}
               onGoHome={() => {
                 setCurrentView('home');
                 bumpHomeLayoutEpoch();
                 window.scrollTo(0, 0);
               }}
               onLogout={() => {
                  resetDemoVisitor();
               }}
             />
            </div>
          </motion.div>
        )}

        {currentView === 'cases' && (
          <motion.div
            key="cases"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="min-h-0 w-full flex-1 bg-gradient-to-b from-gray-50 via-teal-50/15 to-gray-50 py-2"
          >
            <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8">
              <div className="mb-6 flex flex-wrap items-center gap-3 sm:mb-8">
                   <button 
                  type="button"
                  onClick={() => {
                    setCurrentView('home');
                    window.scrollTo(0, 0);
                  }}
                  className="group flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-black text-gray-600 shadow-sm transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-100 bg-gray-50 group-hover:border-teal-200 group-hover:bg-white">
                    <ChevronRight className="h-4 w-4 rotate-180" aria-hidden />
                  </span>
                  返回
                   </button>
                <div className="min-w-0 flex-1 sm:pl-1">
                  <h2 className="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">典型案例</h2>
                   </div>
                </div>
              <CasesModule
                initialOpenDetailCaseId={casesInitialDetailId}
                onClearedInitialDetail={clearCasesInitialDetail}
              />
             </div>
          </motion.div>
        )}

        {currentView === 'enterprise-settle' && (
          <div className="min-h-0 w-full flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 via-teal-50/15 to-gray-50 py-4 sm:py-6">
            <EnterpriseAuthForm
              role={authRole ?? portalIdentityToAuthRole(registeredUserIdentity)}
              registeredUserIdentity={registeredUserIdentity}
              onUserIdentityChange={syncPortalUserIdentity}
              demoAccount={readPortalDemoAccount()}
              onBack={() => {
                setCurrentView('home');
                window.scrollTo(0, 0);
              }}
              onSubmitApplication={() => finishEnterpriseAuthApplication(true)}
              showHeaderAuthShortcuts={!portalAccess.registered && !isDemoSessionLoggedIn()}
            />
          </div>
        )}

        {currentView === 'policy' && (
          <motion.div
            key="policy"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="min-h-0 w-full flex-1 bg-gradient-to-b from-gray-50 via-teal-50/15 to-gray-50 py-2"
          >
            <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8">
              <div className="mb-6 flex flex-wrap items-center gap-3 sm:mb-8">
                <button 
                  type="button"
                  onClick={() => {
                    setCurrentView('home');
                    window.scrollTo(0, 0);
                  }}
                  className="group flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-black text-gray-600 shadow-sm transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-100 bg-gray-50 group-hover:border-teal-200 group-hover:bg-white">
                    <ChevronRight className="h-4 w-4 rotate-180" aria-hidden />
                  </span>
                  返回
                </button>
                <div className="min-w-0 flex-1 sm:pl-1">
                  <h2 className="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">产业资讯</h2>
                </div>
             </div>
             <PolicyInfoModule
               key={policyInfoInitialTab}
               initialMainTab={policyInfoInitialTab}
               onOpenNewsDetail={(id) => openPolicyInfoDetail('news', id, 'policy')}
               onOpenPolicyTechDetail={(id, kind) => openPolicyInfoDetail(kind, id, 'policy')}
             />
            </div>
          </motion.div>
        )}

        {currentView === 'policy-detail' && policyNoticeDetail && (
          <motion.div
            key="policy-detail"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="min-h-0 w-full flex-1 bg-gradient-to-b from-gray-50 via-teal-50/15 to-gray-50 py-2"
          >
            <div className="mx-auto max-w-[1440px] px-4 pb-2 pt-4 sm:px-6 sm:pb-4 sm:pt-6">
              <div className="mb-4 flex flex-wrap items-center gap-2 sm:mb-5">
                <p className="text-xs font-black text-gray-500 sm:text-sm">产业资讯 · 政策文件</p>
              </div>
              <PolicyNoticeDetailPage
                detail={policyNoticeDetail}
                onBack={() => {
                  setCurrentView('home');
                  window.scrollTo(0, 0);
                }}
              />
            </div>
          </motion.div>
        )}

        {currentView === 'policy-info-detail' && policyInfoDetail && (
          <motion.div
            key="policy-info-detail"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="min-h-0 w-full flex-1 bg-gradient-to-b from-gray-50 via-teal-50/15 to-gray-50 py-2"
          >
            <div className="mx-auto max-w-[1440px] px-4 pb-2 pt-4 sm:px-6 sm:pb-4 sm:pt-6">
              <PortalPolicyInfoDetailPage
                kind={policyInfoDetail.kind}
                id={policyInfoDetail.id}
                onBack={() => {
                  const back = policyInfoDetail.returnView;
                  setPolicyInfoDetail(null);
                  setCurrentView(back);
                  window.scrollTo(0, 0);
                }}
              />
            </div>
          </motion.div>
        )}

        {currentView === 'cloud-exhibition' && (
          <motion.div
            key="cloud-exhibition"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
              'min-h-0 w-full flex-1 bg-gradient-to-b from-gray-50 to-gray-50 py-2',
              'via-teal-50/15'
            )}
          >
            <CloudExhibitionHallPage
              onBack={() => {
                setCurrentView('home');
                window.scrollTo(0, 0);
              }}
            />
          </motion.div>
        )}

        {currentView === 'about-placeholder' && (
          <motion.div
            key="about-placeholder"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="min-h-0 w-full flex-1 bg-gradient-to-b from-gray-50 via-teal-50/15 to-gray-50 py-2"
          >
            <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8">
              <div className="mb-6 flex flex-wrap items-center gap-3 sm:mb-8">
              <button
                type="button"
                onClick={() => setCurrentView('home')}
                className="group flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-black text-gray-600 shadow-sm transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-100 bg-gray-50 group-hover:border-teal-200 group-hover:bg-white">
                  <ChevronRight className="h-4 w-4 rotate-180" aria-hidden />
                </span>
                返回
              </button>
              <div className="min-w-0 flex-1 sm:pl-1">
                <h2 className="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">关于平台</h2>
              </div>
            </div>
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm min-h-[420px] flex flex-col items-center justify-center text-center px-8 py-16">
              <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-6 text-gray-200">
                <HelpCircle className="w-10 h-10" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-black text-gray-400">页面待建设</h3>
              <p className="text-sm text-gray-400 font-bold mt-3 max-w-md leading-relaxed">
                该模块正在建设中，敬请期待
              </p>
            </div>
            </div>
          </motion.div>
        )}

        {currentView === 'supply-results' && (
          <motion.div
            key="supply-results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="min-h-0 w-full flex-1 bg-gradient-to-b from-gray-50 via-teal-50/20 to-gray-50 py-2"
          >
            <SupplyDemandResultsPage
              onBack={() => {
                setCurrentView('home');
                window.scrollTo(0, 0);
              }}
              onOpenDetail={(id, options) =>
                openSupplyOutcomeDetail(id, {
                  revealContactPhone: options?.revealContactPhone,
                  returnView: 'supply-results',
                })
              }
            />
          </motion.div>
        )}

        {currentView === 'supply-outcome-detail' && supplyOutcomeDetailData && (
          <motion.div
            key="supply-outcome-detail"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="min-h-0 w-full flex-1 bg-gradient-to-b from-gray-50 via-teal-50/20 to-gray-50 py-2"
          >
            <SupplyDemandOutcomeDetailPage
              outcome={supplyOutcomeDetailData}
              revealContactPhone={supplyOutcomeDetailRevealPhone}
              onBack={() => {
                setSupplyOutcomeDetailRevealPhone(false);
                setCurrentView(supplyOutcomeDetailReturnView);
                window.scrollTo(0, 0);
              }}
            />
          </motion.div>
        )}

        {currentView === 'product-detail' && supplyDetailPayload && (
          <motion.div
            key="product-detail"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="min-h-0 w-full flex-1 py-2"
          >
            <ProductSupplyDetailPage
              payload={supplyDetailPayload}
              showProductFavorite
              revealContactPhone={
                supplyDetailRevealContactFor != null &&
                supplyDetailRevealContactFor === supplyPayloadSupplierName(supplyDetailPayload)
              }
              onBack={() => {
                setSupplyDetailRevealContactFor(null);
                setCurrentView(supplyDetailReturnView);
                window.scrollTo(0, 0);
              }}
              onEnterSupplyMarket={() => {
                tryNavigate('forum-supply');
              }}
              onEnterCompanyHome={openCompanyProfileFromDetail}
              onSelectRelatedProduct={(p) => {
                setSupplyDetailPayload({ kind: 'product', product: p });
                window.scrollTo(0, 0);
              }}
            />
          </motion.div>
        )}

        {currentView === 'company-profile' && companyProfileModel && (
          <motion.div
            key="company-profile"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="min-h-0 w-full flex-1 py-2"
          >
            <CompanyProfilePage
              model={companyProfileModel}
              showProductFavorite
              revealContactPhone={
                supplyDetailRevealContactFor != null &&
                supplyDetailRevealContactFor === companyProfileModel.companyName
              }
              onSelectProduct={(p) =>
                openSupplyDetail({ kind: 'product', product: p }, { returnView: 'company-profile' })
              }
              onBack={() => {
                setCurrentView('product-detail');
                window.scrollTo(0, 0);
              }}
            />
          </motion.div>
        )}

        {currentView === 'product-catalog' && productCatalogTile && (
          <motion.div
            key="product-catalog"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="min-h-0 w-full flex-1 bg-[#f4f4f4] py-2"
          >
            <ProductCatalogPage
              tile={productCatalogTile}
              products={productCatalogList}
              showProductFavorite
              onBack={() => {
                setCurrentView('home');
                window.scrollTo(0, 0);
              }}
            />
          </motion.div>
        )}

        {currentView === 'messages' && (
          <motion.div
            key="messages"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="min-h-0 w-full flex-1"
          >
            <MyMessagesPage
              onBack={() => {
                setCurrentView('home');
                window.scrollTo(0, 0);
              }}
              onLocateDemand={openDemandFromMessage}
              onOpenProduct={openProductFromMessage}
            />
          </motion.div>
        )}

        {(currentView === 'forum-supply' || currentView === 'forum-demand') && (
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="min-h-0 w-full flex-1 bg-gradient-to-b from-gray-50 via-teal-50/15 to-gray-50 py-2"
          >
            <DemandMarketPage
              variant={currentView === 'forum-supply' ? 'supply' : 'demand'}
              portalUiStyle={portalUiStyle}
              supplyWaterSavingFilter={supplyMarketWaterSavingFilter}
              onSupplyWaterSavingFilterChange={setSupplyMarketWaterSavingFilter}
              onPublishProduct={openProductManagementFromPublish}
              onPublishDemand={openDemandCenterFromPublish}
              onBack={() => {
                setCurrentView('home');
                bumpHomeLayoutEpoch();
                window.scrollTo(0, 0);
              }}
              onOpenDetail={(id, options) =>
                openSupplyOutcomeDetail(id, {
                  revealContactPhone: options?.revealContactPhone,
                  returnView: currentView === 'forum-supply' ? 'forum-supply' : 'forum-demand',
                })
              }
              highlightDemandId={currentView === 'forum-demand' ? demandHighlightId : null}
              onHighlightDemandConsumed={() => setDemandHighlightId(null)}
              onSelectSupplyProduct={openSupplyProductDetailFromMarket}
            />
          </motion.div>
        )}

      </AnimatePresence>
      </div>

      {/* Floating Diagnosis Toggle */}
      {currentView !== 'home' && (
      <button 
        onClick={() => setIsAiModalOpen(true)}
        className="fixed bottom-12 right-12 w-16 h-16 bg-blue-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-all z-40 group hover:shadow-blue-200"
      >
        <Activity className="w-8 h-8" />
        <div className="absolute -top-12 right-0 bg-blue-600 text-white text-xs px-4 py-2 rounded-xl shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
          AI 诊断
        </div>
      </button>
      )}

      <AIDiagnosisModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        variant="default"
      />
    </div>
  );
}

