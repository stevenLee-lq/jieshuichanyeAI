import type { PortalUserIdentity } from './portalUserIdentity';

/** 工作台消息类型（与联系对接类消息共用存储） */
export type PortalContactMessageKind =
  | 'approval'
  | 'case'
  | 'registration'
  | 'demand'
  | 'supply'
  | 'enterprise_info';

/** 消息可见受众：企业信息员 / 用水户 / 产业主体 */
export type PortalMessageAudience = 'enterprise_clerk' | 'water_user' | 'industry';

export const PORTAL_MESSAGE_KIND_LABELS: Record<PortalContactMessageKind, string> = {
  approval: '审批类',
  case: '典型案例类',
  registration: '注册类',
  demand: '需求类',
  supply: '供给类',
  enterprise_info: '企业信息类',
};

/** 系统管理员工作台按「企业信息员」仅展示审批类消息 */
export function portalIdentityToMessageAudience(identity: PortalUserIdentity): PortalMessageAudience {
  if (identity === '用水户主体') return 'water_user';
  if (identity === '系统管理员') return 'enterprise_clerk';
  return 'industry';
}

export function messageKindsForAudience(audience: PortalMessageAudience): PortalContactMessageKind[] {
  switch (audience) {
    case 'enterprise_clerk':
      return ['approval'];
    case 'water_user':
      return ['case', 'registration', 'demand'];
    case 'industry':
      return ['case', 'enterprise_info', 'demand', 'supply'];
  }
}

export function messageKindsForIdentity(identity: PortalUserIdentity): PortalContactMessageKind[] {
  return messageKindsForAudience(portalIdentityToMessageAudience(identity));
}

export function messageKindFilterOptionsForIdentity(identity: PortalUserIdentity): string[] {
  return ['全部', ...messageKindsForIdentity(identity).map((k) => PORTAL_MESSAGE_KIND_LABELS[k])];
}

export function messageKindFromFilterLabel(
  label: string,
  identity: PortalUserIdentity
): PortalContactMessageKind | '全部' {
  if (label === '全部') return '全部';
  const kinds = messageKindsForIdentity(identity);
  for (const k of kinds) {
    if (PORTAL_MESSAGE_KIND_LABELS[k] === label) return k;
  }
  return '全部';
}

export function messageKindBadgeClass(kind: PortalContactMessageKind): string {
  switch (kind) {
    case 'approval':
      return 'border-rose-200 bg-rose-50 text-rose-900';
    case 'case':
      return 'border-amber-200 bg-amber-50 text-amber-900';
    case 'registration':
      return 'border-sky-200 bg-sky-50 text-sky-900';
    case 'demand':
      return 'border-violet-200 bg-violet-50 text-violet-900';
    case 'supply':
      return 'border-cyan-200 bg-cyan-50 text-cyan-900';
    case 'enterprise_info':
      return 'border-teal-200 bg-teal-50 text-teal-900';
  }
}

export function messagePeerRoleLabel(kind: PortalContactMessageKind): string {
  switch (kind) {
    case 'approval':
      return '申请人';
    case 'case':
      return '发布方';
    case 'registration':
      return '用户';
    case 'demand':
      return '需方';
    case 'supply':
      return '供方';
    case 'enterprise_info':
      return '企业';
  }
}

export function migrateLegacyMessageKind(raw: unknown): PortalContactMessageKind | null {
  if (raw === 'product') return 'supply';
  if (raw === 'demand') return 'demand';
  if (
    raw === 'approval' ||
    raw === 'case' ||
    raw === 'registration' ||
    raw === 'supply' ||
    raw === 'enterprise_info'
  ) {
    return raw;
  }
  return null;
}
