/** 统一社会信用代码校验（入驻、一键注册、企业管理共用） */

export function normalizeCreditCode(raw: string): string {
  return raw.replace(/\s/g, '').toUpperCase();
}

export function isValidCreditCode(raw: string): boolean {
  return normalizeCreditCode(raw).length === 18;
}
