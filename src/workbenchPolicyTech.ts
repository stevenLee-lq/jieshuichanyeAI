import { APPLICATION_FIELD_OPTIONS, POLICIES, STANDARDS, SUPPLY_INDUSTRY_TYPE_OPTIONS } from './data';
import { formatWaterSavingCategoryLabel, WATER_SAVING_SUB_CATEGORIES } from './productWorkbenchCatalog';
import { isRichTextEmpty } from './workbenchRichText';

export type PolicyTechKind = 'policy' | 'tech';

/** 政策公开 / 新闻资讯：资讯范围 */
export const WORKBENCH_INFO_SCOPE_OPTIONS = ['国家', '地方'] as const;
export type WorkbenchInfoScope = (typeof WORKBENCH_INFO_SCOPE_OPTIONS)[number];

/** 技术标准：所属标准 */
export const WORKBENCH_STANDARD_CATEGORY_OPTIONS = [
  '国际标准',
  '国家标准',
  '地方标准',
  '行业标准',
  '团体标准',
] as const;
export type WorkbenchStandardCategory = (typeof WORKBENCH_STANDARD_CATEGORY_OPTIONS)[number];

export function normalizeInfoScope(raw: unknown): WorkbenchInfoScope {
  return raw === '地方' ? '地方' : '国家';
}

export function normalizeStandardCategory(raw: unknown): WorkbenchStandardCategory {
  if (
    typeof raw === 'string' &&
    (WORKBENCH_STANDARD_CATEGORY_OPTIONS as readonly string[]).includes(raw)
  ) {
    return raw as WorkbenchStandardCategory;
  }
  return '国家标准';
}

/** 应用领域（与供给市场、典型案例一致，不含「全部」） */
export const WORKBENCH_POLICY_TECH_APPLICATION_OPTIONS = APPLICATION_FIELD_OPTIONS;

/** 所属行业（供给市场产业类型，不含「全部」） */
export const WORKBENCH_POLICY_TECH_INDUSTRY_OPTIONS = SUPPLY_INDUSTRY_TYPE_OPTIONS.filter(
  (o) => o !== '全部'
) as readonly string[];

export type WorkbenchPolicyTechRecord = {
  id: string;
  kind: PolicyTechKind;
  title: string;
  time: string;
  content: string;
  /** 政策：发布单位 */
  publisher: string;
  /** 标准：标准号 */
  code: string;
  applicationFields: string[];
  waterSavingCategorySubIds: string[];
  industries: string[];
  /** 政策公开：资讯范围 */
  infoScope: WorkbenchInfoScope;
  /** 技术标准：所属标准 */
  standardCategory: WorkbenchStandardCategory;
};

export type WorkbenchPolicyTechFormState = Omit<WorkbenchPolicyTechRecord, 'id' | 'kind'>;

export function createEmptyPolicyTechForm(kind: PolicyTechKind): WorkbenchPolicyTechFormState {
  return {
    title: '',
    time: new Date().toISOString().slice(0, 10),
    content: '',
    publisher: kind === 'policy' ? '' : '',
    code: kind === 'tech' ? '' : '',
    applicationFields: [],
    waterSavingCategorySubIds: [],
    industries: [],
    infoScope: '国家',
    standardCategory: '国家标准',
  };
}

function seedTagsForIndex(i: number): Pick<
  WorkbenchPolicyTechRecord,
  'applicationFields' | 'waterSavingCategorySubIds' | 'industries'
> {
  const sub = WATER_SAVING_SUB_CATEGORIES[i % WATER_SAVING_SUB_CATEGORIES.length];
  const app = WORKBENCH_POLICY_TECH_APPLICATION_OPTIONS[i % WORKBENCH_POLICY_TECH_APPLICATION_OPTIONS.length];
  const ind = WORKBENCH_POLICY_TECH_INDUSTRY_OPTIONS[i % WORKBENCH_POLICY_TECH_INDUSTRY_OPTIONS.length];
  return {
    applicationFields: app ? [app] : [],
    waterSavingCategorySubIds: sub ? [sub.subId] : [],
    industries: ind ? [ind] : [],
  };
}

export function seedWorkbenchPolicies(): WorkbenchPolicyTechRecord[] {
  return POLICIES.map((p, i) => ({
    id: `policy-${p.id}`,
    kind: 'policy' as const,
    title: p.name,
    time: p.time,
    content: p.content,
    publisher: p.publisher,
    code: '',
    infoScope: i % 2 === 0 ? '国家' : '地方',
    standardCategory: '国家标准',
    ...seedTagsForIndex(i),
  }));
}

export function seedWorkbenchStandards(): WorkbenchPolicyTechRecord[] {
  return STANDARDS.map((s, i) => ({
    id: `tech-${s.id}`,
    kind: 'tech' as const,
    title: s.name,
    time: s.time,
    content: s.content,
    publisher: '',
    code: s.code,
    infoScope: '国家',
    standardCategory: WORKBENCH_STANDARD_CATEGORY_OPTIONS[i % WORKBENCH_STANDARD_CATEGORY_OPTIONS.length]!,
    ...seedTagsForIndex(i + 2),
  }));
}

export function normalizePolicyTechRecord(
  raw: Partial<WorkbenchPolicyTechRecord> & { id: string; kind: PolicyTechKind }
): WorkbenchPolicyTechRecord {
  return {
    id: raw.id,
    kind: raw.kind,
    title: raw.title ?? '',
    time: raw.time ?? '',
    content: raw.content ?? '',
    publisher: raw.publisher ?? '',
    code: raw.code ?? '',
    applicationFields: raw.applicationFields ?? [],
    waterSavingCategorySubIds: raw.waterSavingCategorySubIds ?? [],
    industries: raw.industries ?? [],
    infoScope: normalizeInfoScope(raw.infoScope),
    standardCategory: normalizeStandardCategory(raw.standardCategory),
  };
}

export function recordToForm(row: WorkbenchPolicyTechRecord): WorkbenchPolicyTechFormState {
  const { id: _id, kind: _kind, ...rest } = row;
  return rest;
}

export function formatWaterSavingCategoryDisplay(row: WorkbenchPolicyTechRecord): string {
  const labels = row.waterSavingCategorySubIds
    .map((subId) => formatWaterSavingCategoryLabel(subId))
    .filter(Boolean);
  return labels.length > 0 ? labels.join('、') : '—';
}

export function formatIndustryDisplay(row: WorkbenchPolicyTechRecord): string {
  const labels = row.industries.map((x) => x.trim()).filter(Boolean);
  return labels.length > 0 ? labels.join('、') : '—';
}

/** 门户列表等：应用领域 + 节水产业分类 */
export function formatPolicyTechTagLabels(row: WorkbenchPolicyTechRecord): string[] {
  const out: string[] = [];
  for (const f of row.applicationFields) {
    if (f.trim()) out.push(f.trim());
  }
  for (const subId of row.waterSavingCategorySubIds) {
    const label = formatWaterSavingCategoryLabel(subId);
    if (label) out.push(label);
  }
  return out;
}

export function validatePolicyTechForm(form: WorkbenchPolicyTechFormState, kind: PolicyTechKind): string | null {
  if (!form.title.trim()) return kind === 'policy' ? '请填写政策名称' : '请填写标准名称';
  if (!form.time.trim()) return '请填写发布日期';
  if (isRichTextEmpty(form.content)) return '请填写正文摘要';
  if (kind === 'policy' && !form.publisher.trim()) return '请填写发布单位';
  if (kind === 'tech' && !form.code.trim()) return '请填写标准号';
  if (form.applicationFields.length === 0) return '请至少选择一项应用领域';
  return null;
}
