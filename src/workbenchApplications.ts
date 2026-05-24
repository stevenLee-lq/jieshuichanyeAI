export const WORKBENCH_APPLICATION_TYPES = ['注册', '企业信息', '典型案例'] as const;
export type WorkbenchApplicationType = (typeof WORKBENCH_APPLICATION_TYPES)[number];

export const WORKBENCH_APPLICATION_STATUSES = ['待审核', '审核中', '已通过', '已驳回'] as const;

export type WorkbenchApplicationFormField = { label: string; value: string };

export type WorkbenchApplicationRow = {
  id: string;
  /** 申请人（展示名） */
  applicant: string;
  type: WorkbenchApplicationType;
  status: string;
  submittedAt: string;
  processName: string;
  detail: string;
  /** 审核详情页展示的表单字段（缺省时由 getWorkbenchApplicationFormFields 生成） */
  formFields?: WorkbenchApplicationFormField[];
  /** 驳回理由（已驳回时展示） */
  rejectReason?: string;
  /** 审核意见（列表与详情展示；驳回时可与 rejectReason 同步） */
  reviewOpinion?: string;
};

export function isWorkbenchApplicationPending(status: string): boolean {
  return status === '待审核' || status === '审核中';
}

/** 我的申请列表：审核意见展示文案 */
/** 典型案例类消息解析关联的「我的申请」单号（优先消息上的 applicationId） */
export function resolveWorkbenchApplicationIdForMessage(
  msg: { kind: string; applicationId?: string; title: string },
  applications: readonly WorkbenchApplicationRow[]
): string | null {
  if (msg.applicationId) {
    return applications.some((a) => a.id === msg.applicationId) ? msg.applicationId : null;
  }
  if (msg.kind !== 'case') return null;
  const caseApps = applications.filter((a) => a.type === '典型案例');
  if (caseApps.length === 0) return null;
  for (const app of caseApps) {
    const caseTitle = app.formFields?.find((f) => f.label === '案例标题')?.value;
    if (caseTitle && msg.title.includes(caseTitle)) return app.id;
    const short = app.processName.replace(/^案例「|」上架$/g, '');
    if (short && msg.title.includes(short)) return app.id;
  }
  return caseApps[0]!.id;
}

export function getWorkbenchApplicationReviewOpinion(row: WorkbenchApplicationRow): string {
  const text = row.reviewOpinion?.trim();
  if (text) return text;
  if (row.status === '已通过') return '审核通过';
  if (row.status === '已驳回') return row.rejectReason?.trim() || '已驳回';
  return '—';
}

export function getWorkbenchApplicationFormFields(row: WorkbenchApplicationRow): WorkbenchApplicationFormField[] {
  if (row.formFields && row.formFields.length > 0) return row.formFields;
  return [
    { label: '申请单号', value: row.id },
    { label: '申请人', value: row.applicant },
    { label: '申请类型', value: row.type },
    { label: '提交时间', value: row.submittedAt },
    { label: '流程名称', value: row.processName },
    { label: '申请说明', value: row.detail },
  ];
}

/** 用水户主体「我的申请」演示：仅保留典型案例类申请 */
export const WORKBENCH_WATER_USER_DEMO_APPLICATIONS: WorkbenchApplicationRow[] = [
  {
    id: 'APP-20250320-003',
    applicant: '常州工程职业技术学院',
    type: '典型案例',
    status: '待审核',
    submittedAt: '2025-03-20 09:12',
    processName: '案例「工业园区循环水改造」上架',
    detail: '提交典型案例图文与节水成效数据，申请在案例推广栏目展示。',
    formFields: [
      { label: '申请单号', value: 'APP-20250320-003' },
      { label: '申请类型', value: '典型案例' },
      { label: '案例标题', value: '工业园区循环水改造' },
      { label: '应用领域', value: '工业节水' },
      { label: '案例地区', value: '江苏省 · 无锡市' },
      { label: '节水成效', value: '年节水量约 12 万吨，回用率提升至 85%' },
      { label: '案例摘要', value: '提交典型案例图文与节水成效数据，申请在案例推广栏目展示。' },
    ],
  },
];

export const WORKBENCH_DEMO_APPLICATIONS: WorkbenchApplicationRow[] = [
  {
    id: 'APP-20250315-001',
    applicant: '张工',
    type: '注册',
    status: '已通过',
    submittedAt: '2025-03-15 10:20',
    processName: '产业主体门户账号注册',
    detail: '申请开通产业主体门户账号，已完成手机号验证与主体类型确认。',
    reviewOpinion: '注册信息完整，符合开通条件，予以通过。',
    formFields: [
      { label: '申请单号', value: 'APP-20250315-001' },
      { label: '申请类型', value: '注册' },
      { label: '联系人', value: '张工' },
      { label: '手机号', value: '138****5620' },
      { label: '主体类型', value: '节水装备制造企业' },
      { label: '所属区域', value: '江苏省 · 南京市' },
      { label: '申请说明', value: '申请开通产业主体门户账号，已完成手机号验证与主体类型确认。' },
    ],
  },
  {
    id: 'APP-20250319-004',
    applicant: '赵主任',
    type: '注册',
    status: '待审核',
    submittedAt: '2025-03-19 16:08',
    processName: '注册数据',
    detail: '用水户主体提交门户注册资料，待平台核验手机号、主体类型与所属区域。',
    formFields: [
      { label: '申请单号', value: 'APP-20250319-004' },
      { label: '申请类型', value: '注册' },
      { label: '联系人', value: '赵主任' },
      { label: '手机号', value: '139****2186' },
      { label: '主体类型', value: '用水户主体' },
      { label: '所属区域', value: '江苏省 · 常州市' },
      { label: '申请说明', value: '用水户主体提交门户注册资料，待平台核验手机号、主体类型与所属区域。' },
    ],
  },
  {
    id: 'APP-20250318-002',
    applicant: '李经理',
    type: '企业信息',
    status: '审核中',
    submittedAt: '2025-03-18 14:35',
    processName: '企业信息审核',
    detail: '更新统一社会信用代码关联的企业名称、所属区域及节水产业类型等信息，待平台复核。',
    reviewOpinion: '已受理，正在核验统一社会信用代码与产业类型变更材料。',
    formFields: [
      { label: '申请单号', value: 'APP-20250318-002' },
      { label: '申请类型', value: '企业信息' },
      { label: '企业名称', value: '江苏清源节水科技股份有限公司' },
      { label: '统一社会信用代码', value: '91320100MA1XXXXX8P' },
      { label: '所属区域', value: '江苏省 · 苏州市' },
      { label: '节水产业类型', value: '节水产品与装备' },
      { label: '变更说明', value: '同步更新企业简称与官网地址，申请在供给市场展示最新资料。' },
    ],
  },
  {
    id: 'APP-20250320-003',
    applicant: '王工',
    type: '典型案例',
    status: '待审核',
    submittedAt: '2025-03-20 09:12',
    processName: '案例「工业园区循环水改造」上架',
    detail: '提交典型案例图文与节水成效数据，申请在案例推广栏目展示。',
    formFields: [
      { label: '申请单号', value: 'APP-20250320-003' },
      { label: '申请类型', value: '典型案例' },
      { label: '案例标题', value: '工业园区循环水改造' },
      { label: '应用领域', value: '工业节水' },
      { label: '案例地区', value: '江苏省 · 无锡市' },
      { label: '节水成效', value: '年节水量约 12 万吨，回用率提升至 85%' },
      { label: '案例摘要', value: '提交典型案例图文与节水成效数据，申请在案例推广栏目展示。' },
    ],
  },
];

export type WorkbenchEnterpriseAuditAction = '新增' | '编辑' | '查看';

export type WorkbenchCaseAuditAction = '新增' | '编辑' | '查看';

export function formatWorkbenchSubmittedAt(d = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function buildEnterpriseAuditApplication(
  enterpriseName: string,
  action: WorkbenchEnterpriseAuditAction
): WorkbenchApplicationRow {
  const processName = action === '查看' ? '企业信息查阅审核' : '企业信息审核';
  const detail =
    action === '新增'
      ? `新增企业「${enterpriseName}」资料，已进入企业信息审核流程，待平台复核。`
      : action === '编辑'
        ? `变更企业「${enterpriseName}」资料，已进入企业信息审核流程，待平台复核。`
        : `申请查阅企业「${enterpriseName}」完整信息，已进入企业信息审核流程。`;
  return {
    id: `APP-${Date.now()}`,
    applicant: enterpriseName,
    type: '企业信息',
    status: '待审核',
    submittedAt: formatWorkbenchSubmittedAt(),
    processName,
    detail,
    formFields: [
      { label: '申请人', value: enterpriseName },
      { label: '申请类型', value: '企业信息' },
      { label: '企业名称', value: enterpriseName },
      { label: '操作类型', value: action },
      { label: '流程名称', value: processName },
      { label: '申请说明', value: detail },
    ],
  };
}

/** 典型案例：新增 / 编辑 / 查看均进入企业信息审核流程（演示：写入「我的申请」） */
export function buildCaseAuditApplication(caseTitle: string, action: WorkbenchCaseAuditAction): WorkbenchApplicationRow {
  const short = caseTitle.length > 36 ? `${caseTitle.slice(0, 36)}…` : caseTitle;
  const processName =
    action === '查看'
      ? '企业信息审核（典型案例查阅）'
      : action === '新增'
        ? '企业信息审核（典型案例新增）'
        : '企业信息审核（典型案例变更）';
  const detail =
    action === '查看'
      ? `申请查阅典型案例「${short}」全文，已进入企业信息审核流程。`
      : action === '新增'
        ? `提交典型案例「${short}」，已进入企业信息审核流程，待平台复核后在案例推广展示。`
        : `变更典型案例「${short}」，已进入企业信息审核流程，待平台复核。`;
  return {
    id: `APP-${Date.now()}`,
    applicant: '江苏省水利工程科技咨询股份有限公司',
    type: '典型案例',
    status: '待审核',
    submittedAt: formatWorkbenchSubmittedAt(),
    processName,
    detail,
    formFields: [
      { label: '申请人', value: '江苏省水利工程科技咨询股份有限公司' },
      { label: '申请类型', value: '典型案例' },
      { label: '案例标题', value: caseTitle },
      { label: '操作类型', value: action },
      { label: '流程名称', value: processName },
      { label: '申请说明', value: detail },
    ],
  };
}

export function workbenchApplicationsForIdentity(
  identity: string,
  all: readonly WorkbenchApplicationRow[]
): WorkbenchApplicationRow[] {
  if (identity === '用水户主体') {
    const cases = all.filter((r) => r.type === '典型案例');
    return cases.length > 0 ? [...cases] : [...WORKBENCH_WATER_USER_DEMO_APPLICATIONS];
  }
  return [...all];
}

export function workbenchApplicationTypeFilterOptions(
  identity: string
): readonly ('全部' | WorkbenchApplicationType)[] {
  if (identity === '用水户主体') return ['全部', '典型案例'];
  return ['全部', ...WORKBENCH_APPLICATION_TYPES];
}

export function workbenchApplicationStatusClass(status: string): string {
  if (status === '已通过') return 'border-emerald-200 bg-emerald-50 text-emerald-800';
  if (status === '审核中') return 'border-sky-200 bg-sky-50 text-sky-800';
  if (status === '待审核') return 'border-amber-200 bg-amber-50 text-amber-800';
  if (status === '已驳回') return 'border-red-200 bg-red-50 text-red-800';
  return 'border-gray-200 bg-gray-50 text-gray-700';
}
