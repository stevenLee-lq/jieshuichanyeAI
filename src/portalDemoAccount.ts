/**
 * 演示用：将注册/密码登录时填写的手机号与密码写入本机，供「企业入驻 / 用户认证」页自动带出。
 * 正式环境应走服务端会话，勿在浏览器长期存放真实密码。
 */

const STORAGE_KEY = 'portal_demo_account_v1';

export type PortalDemoAccount = {
  phone: string;
  password: string;
  /** 注册时选择的主体身份 */
  identity?: string;
  /** 用水户主体入驻档案 ID（企业管理列表） */
  enterpriseId?: string;
};

export function readPortalDemoAccount(): PortalDemoAccount | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const j = JSON.parse(raw) as unknown;
    if (!j || typeof j !== 'object') return null;
    const o = j as Record<string, unknown>;
    const phone = typeof o.phone === 'string' ? o.phone.trim() : '';
    const password = typeof o.password === 'string' ? o.password : '';
    const identity = typeof o.identity === 'string' ? o.identity.trim() : undefined;
    const enterpriseId = typeof o.enterpriseId === 'string' ? o.enterpriseId.trim() : undefined;
    if (!phone) return null;
    return { phone, password, identity, enterpriseId };
  } catch {
    return null;
  }
}

export function writePortalDemoAccount(a: PortalDemoAccount): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        phone: a.phone,
        password: a.password,
        identity: a.identity,
        enterpriseId: a.enterpriseId,
      })
    );
  } catch {
    /* ignore */
  }
}

/** 验证码登录等场景只更新手机号时，保留已有密码 */
export function mergePortalDemoAccount(partial: { phone: string; password?: string }): void {
  const prev = readPortalDemoAccount();
  const phone = partial.phone.trim();
  if (!phone) return;
  const password =
    partial.password !== undefined && partial.password !== ''
      ? partial.password
      : (prev?.password ?? '');
  writePortalDemoAccount({ phone, password });
}

const SESSION_KEY = 'portal_demo_session_v1';

export function setDemoSessionLoggedIn(): void {
  try {
    localStorage.setItem(SESSION_KEY, '1');
  } catch {
    /* ignore */
  }
}

export function clearDemoSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export function isDemoSessionLoggedIn(): boolean {
  try {
    return localStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

export function clearPortalDemoAccount(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export function maskDemoPhone(phone: string): string {
  const p = phone.replace(/\D/g, '');
  if (p.length >= 11) return `${p.slice(0, 3)}****${p.slice(-4)}`;
  if (p.length >= 7) return `${p.slice(0, 3)}****${p.slice(-2)}`;
  return phone;
}

export function demoAccountDisplayName(phone: string): string {
  const p = phone.replace(/\D/g, '');
  return p.length ? `portal_user_${p.slice(-4)}` : 'portal_user';
}
