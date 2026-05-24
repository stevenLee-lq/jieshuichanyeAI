import type { PortalUserIdentity } from './portalUserIdentity';
import { getOrCreateSelfEnterprise } from './workbenchEnterpriseStore';

const STORAGE_KEY = 'portal_account_user_name_v1';

/** 持久化当前账号「用户名称」（入驻/注册后写入） */
export function writePortalAccountUserName(name: string): void {
  const v = name.trim();
  if (!v) return;
  try {
    localStorage.setItem(STORAGE_KEY, v);
  } catch {
    /* ignore */
  }
}

export function readPortalAccountUserName(): string {
  try {
    return localStorage.getItem(STORAGE_KEY)?.trim() ?? '';
  } catch {
    return '';
  }
}

/**
 * 需求中心等表单默认企业名：对应该账号入驻信息中的「用户名称」。
 * 产业主体/系统管理员优先读本企业入驻档案；其余身份读注册时缓存。
 */
export function resolvePortalAccountUserName(identity: PortalUserIdentity): string {
  if (identity === '产业主体' || identity === '系统管理员') {
    const fromEnterprise = getOrCreateSelfEnterprise().name.trim();
    if (fromEnterprise) return fromEnterprise;
  }
  return readPortalAccountUserName();
}
