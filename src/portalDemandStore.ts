import { useSyncExternalStore } from 'react';
import {
  SUPPLY_DEMAND_OUTCOMES,
  getOutcomeApplicationFields,
  getOutcomeMatchStatus,
  type OutcomeDemandType,
  type OutcomeMatchStatus,
  type OutcomeEntity,
  type SupplyDemandOutcome,
} from './supplyDemandOutcomes';

let demands: SupplyDemandOutcome[] = [...SUPPLY_DEMAND_OUTCOMES];
/** useSyncExternalStore 要求 getSnapshot 在数据未变时返回稳定引用，不可每次 spread 新数组 */
let demandsSnapshot: readonly SupplyDemandOutcome[] = demands;
const listeners = new Set<() => void>();

function syncSnapshot() {
  demandsSnapshot = demands;
}

function emit() {
  syncSnapshot();
  listeners.forEach((l) => l());
}

export function getPortalDemands(): readonly SupplyDemandOutcome[] {
  return demandsSnapshot;
}

export function subscribePortalDemands(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setPortalDemands(next: SupplyDemandOutcome[]) {
  demands = [...next];
  emit();
}

export function getPortalDemandById(id: number): SupplyDemandOutcome | undefined {
  return demands.find((x) => x.id === id);
}

export function upsertPortalDemand(row: SupplyDemandOutcome) {
  const idx = demands.findIndex((x) => x.id === row.id);
  if (idx >= 0) {
    const next = [...demands];
    next[idx] = row;
    setPortalDemands(next);
    return;
  }
  setPortalDemands([row, ...demands]);
}

export function deletePortalDemand(id: number) {
  setPortalDemands(demands.filter((x) => x.id !== id));
}

export function nextPortalDemandId(): number {
  const max = demands.reduce((m, x) => Math.max(m, x.id), 0);
  return max + 1;
}

export function getPortalDemandPublishedCount(): number {
  return demands.length;
}

export function usePortalDemands(): readonly SupplyDemandOutcome[] {
  return useSyncExternalStore(subscribePortalDemands, getPortalDemands, () => SUPPLY_DEMAND_OUTCOMES);
}

const DEMAND_TYPE_LIST_LABEL_MAP: Partial<Record<OutcomeDemandType, string>> = {
  研发需求: '技术需求',
};

export function listDemandTypeLabel(item: SupplyDemandOutcome): string {
  if (item.demandListTypeLabel) return item.demandListTypeLabel;
  return DEMAND_TYPE_LIST_LABEL_MAP[item.demandType] ?? item.categoryLabel;
}

export function validUntilDisplay(item: SupplyDemandOutcome): string {
  if (item.validUntilLabel) return item.validUntilLabel;
  if (item.deadline === '长期有效' || !item.deadline) return '长期有效';
  return item.deadline;
}

export function enterpriseName(item: SupplyDemandOutcome): string {
  return item.demandEnterprise ?? item.demander;
}

export function regionCityDisplay(item: SupplyDemandOutcome): string {
  if (item.regionCity) return item.regionCity;
  const loc = item.locationLine ?? item.province;
  const m = loc.match(/([\u4e00-\u9fa5]+市)/);
  return m?.[1] ?? loc;
}

export function maxBudgetDisplay(item: SupplyDemandOutcome): string {
  if (item.maxBudgetShort) return item.maxBudgetShort;
  const m = item.budgetLine?.match(/预算[^:：]*[:：]\s*([^\s]+)/);
  return m?.[1] ?? '面议';
}

export function isFinanceFooter(item: SupplyDemandOutcome): boolean {
  return item.demandCardFooter === 'finance' || item.demandType === '金融需求';
}

export function listMatchStatusLabel(item: SupplyDemandOutcome): ReturnType<typeof getOutcomeMatchStatus> {
  return getOutcomeMatchStatus(item);
}

export type WorkbenchDemandFormState = {
  title: string;
  entity: OutcomeEntity;
  demandType: OutcomeDemandType;
  demandListTypeLabel: string;
  demandEnterprise: string;
  applicationFields: string[];
  matchStatus: OutcomeMatchStatus;
  validUntilLabel: string;
  footerType: 'region_budget' | 'finance';
  regionCity: string;
  maxBudgetShort: string;
  financeAmountWan: string;
  loanPeriodMonths: string;
  description: string;
  contactEmail: string;
  contactPhone: string;
};

export function createEmptyDemandForm(options?: { demandEnterprise?: string }): WorkbenchDemandFormState {
  return {
    title: '',
    entity: '用水户需求',
    demandType: '产品需求',
    demandListTypeLabel: '',
    demandEnterprise: options?.demandEnterprise?.trim() ?? '',
    applicationFields: [],
    matchStatus: '可对接',
    validUntilLabel: '长期有效',
    footerType: 'region_budget',
    regionCity: '',
    maxBudgetShort: '面议',
    financeAmountWan: '',
    loanPeriodMonths: '',
    description: '',
    contactEmail: '',
    contactPhone: '',
  };
}

export function outcomeToForm(o: SupplyDemandOutcome): WorkbenchDemandFormState {
  const finance = isFinanceFooter(o);
  return {
    title: o.title,
    entity: o.entity,
    demandType: o.demandType,
    demandListTypeLabel: o.demandListTypeLabel ?? '',
    demandEnterprise: enterpriseName(o),
    applicationFields: getOutcomeApplicationFields(o),
    matchStatus: listMatchStatusLabel(o),
    validUntilLabel: validUntilDisplay(o),
    footerType: finance ? 'finance' : 'region_budget',
    regionCity: regionCityDisplay(o),
    maxBudgetShort: maxBudgetDisplay(o),
    financeAmountWan: o.financeAmountWan ?? '',
    loanPeriodMonths: o.loanPeriodMonths ?? '',
    description: o.description,
    contactEmail: o.contactEmail ?? '',
    contactPhone: o.contactPhone ?? '',
  };
}

function categoryToneForType(t: OutcomeDemandType): SupplyDemandOutcome['categoryTone'] {
  if (t === '金融需求') return 'orange';
  if (t === '服务需求') return 'sky';
  if (t === '研发需求' || t === '交流讨论') return 'purple';
  return 'blue';
}

function categoryLabelForType(t: OutcomeDemandType): string {
  if (t === '研发需求') return '研发需求';
  if (t === '交流讨论') return '交流讨论';
  if (t === '金融需求') return '金融需求';
  if (t === '服务需求') return '服务需求';
  if (t === '产品需求') return '产品需求';
  return '其他';
}

export function formToOutcome(
  form: WorkbenchDemandFormState,
  id: number,
  existing?: SupplyDemandOutcome
): SupplyDemandOutcome {
  const today = new Date();
  const ymd = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const finance = form.footerType === 'finance' || form.demandType === '金融需求';
  const achievedAt = form.matchStatus === '已达成' ? ymd : '--';
  const demandStatus = form.matchStatus;

  const base: SupplyDemandOutcome = {
    id,
    title: form.title.trim(),
    province: existing?.province ?? '江苏省',
    categoryLabel: categoryLabelForType(form.demandType),
    categoryTone: categoryToneForType(form.demandType),
    description: form.description.trim() || form.title.trim(),
    demander: form.demandEnterprise.trim(),
    supplier: existing?.supplier ?? '—',
    amountDisplay: finance
      ? `融资金额: ${form.financeAmountWan || '—'}万元`
      : `需求金额: ${form.maxBudgetShort || '面议'}`,
    publishedAt: existing?.publishedAt ?? ymd,
    achievedAt,
    demandStatus,
    image:
      existing?.image ??
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=400&h=300',
    entity: form.entity,
    demandType: form.demandType,
    hot: existing?.hot ?? 10,
    views: existing?.views ?? 0,
    publishedTs: existing?.publishedTs ?? Date.now(),
    contactEmail: form.contactEmail.trim() || undefined,
    contactPhone: form.contactPhone.trim() || undefined,
    publisherDisplay: form.demandEnterprise.trim(),
    locationLine: form.regionCity ? `江苏省${form.regionCity}` : existing?.locationLine,
    deadline: form.validUntilLabel === '长期有效' ? '长期有效' : form.validUntilLabel,
    demandEnterprise: form.demandEnterprise.trim(),
    validUntilLabel: form.validUntilLabel.trim() || '长期有效',
    demandListTypeLabel: form.demandListTypeLabel.trim() || undefined,
    demandCardFooter: finance ? 'finance' : 'region_budget',
    regionCity: finance ? undefined : form.regionCity.trim() || undefined,
    maxBudgetShort: finance ? undefined : form.maxBudgetShort.trim() || '面议',
    financeAmountWan: finance ? form.financeAmountWan.trim() || '—' : undefined,
    loanPeriodMonths: finance ? form.loanPeriodMonths.trim() || '—' : undefined,
    detailRichText: existing?.detailRichText ?? form.description.trim(),
    supplierMarkedAchieved:
      form.matchStatus === '已达成' ? existing?.supplierMarkedAchieved : undefined,
    applicationFields: form.applicationFields.length > 0 ? [...form.applicationFields] : undefined,
  };

  return base;
}

/** 产业主体「我的消息」确认产品联系后，同步生成需求中心记录 */
const CONTACT_CONFIRM_DEMAND_ENTERPRISE = '江苏省水利工程科技咨询股份有限公司';

export function normalizeContactProductTitle(raw: string): string {
  const t = raw.trim();
  if (t.startsWith('「') && t.endsWith('」') && t.length > 2) return t.slice(1, -1).trim();
  return t;
}

export type ProductContactDemandInput = {
  title: string;
  supplierName: string;
  description?: string;
  image?: string;
};

/** 由产品联系确认生成：产品需求 · 可对接 · 标题为产品名称 */
export function createProductDemandFromContact(input: ProductContactDemandInput): SupplyDemandOutcome {
  const title = normalizeContactProductTitle(input.title);
  const id = nextPortalDemandId();
  const desc =
    input.description?.trim() ||
    `产业主体已通过供方市场「联系我们」确认对接，寻求「${title}」相关产品供应。供方：${input.supplierName}。`;

  const form: WorkbenchDemandFormState = {
    title,
    entity: '产业主体需求',
    demandType: '产品需求',
    demandListTypeLabel: '',
    demandEnterprise: CONTACT_CONFIRM_DEMAND_ENTERPRISE,
    matchStatus: '可对接',
    validUntilLabel: '长期有效',
    footerType: 'region_budget',
    regionCity: '南京市',
    maxBudgetShort: '面议',
    financeAmountWan: '',
    loanPeriodMonths: '',
    description: desc,
    applicationFields: ['工业节水'],
    contactEmail: '',
    contactPhone: '',
  };

  const base = formToOutcome(form, id);
  const row: SupplyDemandOutcome = {
    ...base,
    supplier: input.supplierName,
    image: input.image ?? base.image,
    detailRichText: desc,
  };
  upsertPortalDemand(row);
  return row;
}

/** 门户「与我联系」后：可对接 → 已联系 */
export function markDemandContacted(id: number): SupplyDemandOutcome | null {
  const existing = getPortalDemandById(id);
  if (!existing) return null;
  if (getOutcomeMatchStatus(existing) !== '可对接') return existing;
  const row: SupplyDemandOutcome = {
    ...existing,
    demandStatus: '已联系',
    achievedAt: '--',
    supplierMarkedAchieved: undefined,
  };
  upsertPortalDemand(row);
  return row;
}

/** 产业主体后台：标记需求已达成合作（同步门户状态） */
export function markDemandAchievedBySupplier(id: number): SupplyDemandOutcome | null {
  const existing = getPortalDemandById(id);
  if (!existing) return null;
  const today = new Date();
  const ymd = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const row: SupplyDemandOutcome = {
    ...existing,
    demandStatus: '已达成',
    achievedAt: ymd,
    supplierMarkedAchieved: true,
  };
  upsertPortalDemand(row);
  return row;
}

export function validateDemandForm(form: WorkbenchDemandFormState): string | null {
  if (!form.title.trim()) return '请填写需求标题';
  if (!form.demandEnterprise.trim()) return '请填写需求企业';
  if (form.applicationFields.length === 0) return '请至少选择一项应用领域';
  if (!form.description.trim()) return '请填写需求详情';
  if (form.footerType === 'finance' || form.demandType === '金融需求') {
    if (!form.financeAmountWan.trim()) return '请填写融资金额（万元）';
    if (!form.loanPeriodMonths.trim()) return '请填写贷款周期（月）';
  } else if (!form.regionCity.trim()) {
    return '请填写所属地区（如南京市）';
  }
  return null;
}
