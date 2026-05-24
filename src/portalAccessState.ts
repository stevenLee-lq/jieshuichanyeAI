/**
 * 门户访问状态（本地持久化，无后端）：注册、认证提交与审核通过标记。
 * 未过审：部分列表与公开商品/服务详情可浏览；其余详情与产业看板等仍须审核通过后解锁。
 */

export type PortalAccessState = {
  registered: boolean;
  authSubmitted: boolean;
  authApproved: boolean;
};

const STORAGE_KEY = 'portal_access_demo_v3';

/** 首次进入默认：未注册、未提交认证 */
const DEFAULT_STATE: PortalAccessState = {
  registered: false,
  authSubmitted: false,
  authApproved: false,
};

/** 未过审时可浏览的门户路由（含首页直达的产品/服务详情及关联企业主页） */
const BROWSE_VIEWS_WITHOUT_APPROVAL = new Set<string>([
  'home',
  /** 主导航「商机总览」进入工作台数据总览，未过审亦可浏览 */
  'industry-dashboard',
  'enterprise-settle',
  'industry-login',
  'cases',
  'forum-demand',
  'forum-supply',
  'product-catalog',
  /** 首页产品推荐/服务推荐等入口的供应详情；从详情进入的企业主页 */
  'product-detail',
  'company-profile',
  'policy',
  'policy-detail',
  'policy-info-detail',
  'cloud-exhibition',
  'about-placeholder',
  'supply-results',
  /** 需求中心「与我联系」/卡片进入供需详情 */
  'supply-outcome-detail',
  'messages',
]);

export function readPortalAccess(): PortalAccessState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const j = JSON.parse(raw) as unknown;
    if (!j || typeof j !== 'object') return { ...DEFAULT_STATE };
    const o = j as Record<string, unknown>;
    return {
      registered: o.registered === true,
      authSubmitted: o.authSubmitted === true,
      authApproved: o.authApproved === true,
    };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

export function writePortalAccess(s: PortalAccessState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

export function clearPortalAccess(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/** 审核通过前：未在下列集合中的路由（如部分详情、产业看板等）仍须审核通过 */
export function isPortalViewUnlocked(view: string, a: PortalAccessState): boolean {
  if (a.authApproved) return true;
  return BROWSE_VIEWS_WITHOUT_APPROVAL.has(view);
}

export function accessDeniedVariant(a: PortalAccessState): 'register' | 'auth' | 'pending' {
  if (!a.registered) return 'register';
  if (!a.authSubmitted) return 'auth';
  return 'pending';
}
