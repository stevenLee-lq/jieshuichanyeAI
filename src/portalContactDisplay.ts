/** 门户供方联系信息展示：电话脱敏（前2 + 后2，中间密文） */

/** 仅保留数字 */
export function normalizePhoneDigits(raw: string): string {
  return raw.replace(/\D/g, '');
}

/**
 * 联系电话脱敏：仅显示前 2 位与后 2 位，其余以 * 代替。
 * 例：13812346688 → 13*******88
 */
export function maskContactPhone(raw: string): string {
  const digits = normalizePhoneDigits(raw);
  if (!digits) return '—';
  if (digits.length <= 4) {
    if (digits.length <= 2) return digits;
    const head = digits.slice(0, 2);
    return `${head}${'*'.repeat(digits.length - 2)}`;
  }
  const head = digits.slice(0, 2);
  const tail = digits.slice(-2);
  return `${head}${'*'.repeat(digits.length - 4)}${tail}`;
}

/** @deprecated 请使用 maskContactPhone */
export const maskPhoneFirst4Last4 = maskContactPhone;

/** 演示用供方联系电话（与供方名称稳定对应） */
export function demoSupplierContactPhone(supplierName: string): string {
  const name = supplierName.trim() || '供方';
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  const mid = String(10000000 + (hash % 90000000)).padStart(8, '0').slice(0, 7);
  return `138${mid}`;
}
