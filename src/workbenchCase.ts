import { APPLICATION_FIELD_OPTIONS } from './data';

/** 与门户供给「应用领域」筛选项一致（不含「全部」） */
export const WORKBENCH_CASE_APPLICATION_FIELD_OPTIONS = APPLICATION_FIELD_OPTIONS;

export type WorkbenchCaseAuditStatus = '已通过' | '审核中' | '待审核' | '已驳回' | '草稿';

export type WorkbenchManagedCase = {
  id: string;
  /** 与门户案例库 numeric id 对齐时，列表/详情可展示收藏 */
  portalCaseId?: number;
  auditStatus: WorkbenchCaseAuditStatus;
  title: string;
  /** 应用领域（与供给市场筛选项一致） */
  applicationField: string;
  coverImage: string;
  province: string;
  city: string;
  district: string;
  publishedDate: string;
  source: string;
  content: string;
};

export type WorkbenchCaseFormState = Omit<WorkbenchManagedCase, 'id' | 'auditStatus'>;

export function createEmptyCaseForm(): WorkbenchCaseFormState {
  return {
    title: '',
    applicationField: WORKBENCH_CASE_APPLICATION_FIELD_OPTIONS.includes('工业节水')
      ? '工业节水'
      : WORKBENCH_CASE_APPLICATION_FIELD_OPTIONS[0]!,
    coverImage: '',
    province: '',
    city: '',
    district: '',
    publishedDate: '',
    source: '',
    content: '',
  };
}

export function seedWorkbenchCases(): WorkbenchManagedCase[] {
  return [
    {
      id: 'case-demo-1',
      portalCaseId: 965,
      auditStatus: '已通过',
      title: '内蒙古锡林郭勒盟：烟气提水破局「富煤贫水」之困',
      applicationField: '工业节水',
      coverImage:
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800',
      province: '内蒙古自治区',
      city: '锡林郭勒盟',
      district: '锡林浩特市',
      publishedDate: '2026-03-19',
      source: '内蒙古自治区水利厅',
      content:
        '演示：烟气取水技术将燃煤电厂湿法脱硫后烟气中的水分回收再利用，缓解草原地区工业用水紧张。平台复核通过后将同步至案例推广栏目。',
    },
  ];
}

export function caseToForm(row: WorkbenchManagedCase): WorkbenchCaseFormState {
  const { id: _i, auditStatus: _a, ...rest } = row;
  return rest;
}

export function formatCaseRegion(row: Pick<WorkbenchManagedCase, 'province' | 'city' | 'district'>): string {
  return [row.province, row.city, row.district].filter(Boolean).join('>');
}

/** 列表/卡片左侧展示的短地区（取省级简称感） */
export function formatCaseRegionShort(row: Pick<WorkbenchManagedCase, 'province'>): string {
  const p = row.province ?? '';
  if (p.startsWith('内蒙古')) return '内蒙古';
  if (p.startsWith('广西')) return '广西';
  if (p.length >= 2) return p.replace(/省|市|自治区|壮族自治区|维吾尔自治区|回族自治区/g, '').slice(0, 4);
  return p || '—';
}

export function caseAuditStatusClass(status: WorkbenchCaseAuditStatus): string {
  if (status === '已通过') return 'border-emerald-200 bg-emerald-50 text-emerald-800';
  if (status === '审核中') return 'border-sky-200 bg-sky-50 text-sky-800';
  if (status === '待审核') return 'border-amber-200 bg-amber-50 text-amber-800';
  if (status === '已驳回') return 'border-red-200 bg-red-50 text-red-800';
  return 'border-gray-200 bg-gray-50 text-gray-700';
}
