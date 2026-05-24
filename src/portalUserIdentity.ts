/** 门户注册/用户认证共用的用户身份（含样式4顶栏可切换的「系统管理员」，工作台同产业侧） */
export type PortalUserIdentity = '产业主体' | '用水户主体' | '其他主体' | '系统管理员';

/** 注册 / 认证表单下拉：不含系统管理员（仅样式4顶栏切换） */
export const PORTAL_USER_IDENTITY_OPTIONS: PortalUserIdentity[] = ['产业主体', '用水户主体', '其他主体'];

/** 样式4顶栏角色切换（与注册表单选项区分） */
export const PORTAL_STYLE4_TOOLBAR_ROLES = ['产业主体', '用水户主体', '系统管理员'] as const;
export type PortalStyle4ToolbarRole = (typeof PORTAL_STYLE4_TOOLBAR_ROLES)[number];

export function toStyle4ToolbarRole(id: PortalUserIdentity): PortalStyle4ToolbarRole {
  if (id === '用水户主体') return '用水户主体';
  if (id === '系统管理员') return '系统管理员';
  return '产业主体';
}

/** 产业侧工作台与表单分支：产业主体与系统管理员一致 */
export function isPortalIndustryLikeUser(id: PortalUserIdentity): boolean {
  return id === '产业主体' || id === '系统管理员';
}

export const PORTAL_USER_IDENTITY_STORAGE_KEY = 'portal_user_identity';

export function readStoredPortalUserIdentity(): PortalUserIdentity {
  try {
    const s = localStorage.getItem(PORTAL_USER_IDENTITY_STORAGE_KEY);
    if (s === '政府主体') {
      persistPortalUserIdentity('产业主体');
      return '产业主体';
    }
    if (s === '产业主体' || s === '用水户主体' || s === '其他主体' || s === '系统管理员') return s;
  } catch {
    /* ignore */
  }
  return '产业主体';
}

export function persistPortalUserIdentity(id: PortalUserIdentity) {
  try {
    localStorage.setItem(PORTAL_USER_IDENTITY_STORAGE_KEY, id);
  } catch {
    /* ignore */
  }
}

/** 工作台产业/用水户分流（产业主体、系统管理员走企业侧模板，其余走用水户侧模板） */
export function portalIdentityToAuthRole(id: PortalUserIdentity): 'industry' | 'user' {
  return isPortalIndustryLikeUser(id) ? 'industry' : 'user';
}

/** 工作台侧栏默认选中项（与各身份菜单首项一致） */
export function getWorkbenchDefaultMenuTab(id: PortalUserIdentity): string {
  if (id === '用水户主体') return '我的申请';
  if (id === '系统管理员') return '仪表盘';
  return '数据总览';
}

/** 用户认证 · 节水产业类型（与产品分类导航一致） */
export const USER_AUTH_WATER_SAVING_INDUSTRY_TYPES: readonly string[] = [
  '节水设备材料',
  '水处理设备材料',
  '计量监测设备仪器',
  '节水生活器具',
  '非常规水源供应',
  '节水数字化产品',
  '节水服务类',
  '其他',
];
