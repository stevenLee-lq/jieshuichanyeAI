import { NEWS } from './data';
import { formatWaterSavingCategoryLabel, WATER_SAVING_SUB_CATEGORIES } from './productWorkbenchCatalog';
import { isRichTextEmpty } from './workbenchRichText';
import {
  normalizeInfoScope,
  WORKBENCH_INFO_SCOPE_OPTIONS,
  WORKBENCH_POLICY_TECH_APPLICATION_OPTIONS,
  type WorkbenchInfoScope,
} from './workbenchPolicyTech';

export { WORKBENCH_INFO_SCOPE_OPTIONS, type WorkbenchInfoScope };

export type WorkbenchNewsRecord = {
  id: string;
  title: string;
  content: string;
  image: string;
  publishedAt: string;
  publisher: string;
  /** @deprecated 旧版标签，保存时不再写入 */
  tags: string[];
  applicationFields: string[];
  waterSavingCategorySubIds: string[];
  enabled: boolean;
  /** 资讯范围 */
  infoScope: WorkbenchInfoScope;
};

export type WorkbenchNewsFormState = Omit<WorkbenchNewsRecord, 'id'>;

export function seedWorkbenchNews(): WorkbenchNewsRecord[] {
  return NEWS.map((n, i) => {
    const sub = WATER_SAVING_SUB_CATEGORIES[i % WATER_SAVING_SUB_CATEGORIES.length];
    const app = WORKBENCH_POLICY_TECH_APPLICATION_OPTIONS[i % WORKBENCH_POLICY_TECH_APPLICATION_OPTIONS.length];
    return {
      id: `news-${n.id}`,
      title: n.title,
      content: n.content,
      image: n.image,
      publishedAt: `2024-05-${String(9 - i).padStart(2, '0')}`,
      publisher: '水麒麟媒体中心',
      tags: [],
      applicationFields: app ? [app] : [],
      waterSavingCategorySubIds: sub ? [sub.subId] : [],
      enabled: true,
      infoScope: i % 2 === 0 ? '国家' : '地方',
    };
  });
}

export function normalizeWorkbenchNewsRecord(raw: Partial<WorkbenchNewsRecord> & { id: string }): WorkbenchNewsRecord {
  return {
    id: raw.id,
    title: raw.title ?? '',
    content: raw.content ?? '',
    image: raw.image ?? '',
    publishedAt: raw.publishedAt ?? '',
    publisher: raw.publisher ?? '',
    tags: raw.tags ?? [],
    applicationFields: raw.applicationFields ?? [],
    waterSavingCategorySubIds: raw.waterSavingCategorySubIds ?? [],
    enabled: raw.enabled ?? true,
    infoScope: normalizeInfoScope(raw.infoScope),
  };
}

export function createEmptyNewsForm(): WorkbenchNewsFormState {
  return {
    title: '',
    content: '',
    image: '',
    publishedAt: new Date().toISOString().slice(0, 10),
    publisher: '水麒麟媒体中心',
    tags: [],
    applicationFields: [],
    waterSavingCategorySubIds: [],
    enabled: true,
    infoScope: '国家',
  };
}

export function recordToNewsForm(row: WorkbenchNewsRecord): WorkbenchNewsFormState {
  const { id: _id, ...rest } = row;
  return rest;
}

export function formatNewsWaterSavingDisplay(row: Pick<WorkbenchNewsRecord, 'waterSavingCategorySubIds'>): string {
  const labels = row.waterSavingCategorySubIds
    .map((subId) => formatWaterSavingCategoryLabel(subId))
    .filter(Boolean);
  return labels.length > 0 ? labels.join('、') : '—';
}

export function formatNewsTagLabels(row: Pick<WorkbenchNewsRecord, 'applicationFields' | 'waterSavingCategorySubIds'>): string[] {
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

export function validateNewsForm(form: WorkbenchNewsFormState): string | null {
  if (!form.title.trim()) return '请填写新闻标题';
  if (isRichTextEmpty(form.content)) return '请填写新闻正文';
  if (!form.image.trim()) return '请上传封面图片';
  if (!form.publishedAt.trim()) return '请填写发布日期';
  if (!form.publisher.trim()) return '请填写发布来源';
  if (form.applicationFields.length === 0) return '请至少选择一项应用领域';
  return null;
}
