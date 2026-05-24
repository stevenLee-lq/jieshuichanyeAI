/** 企业管理：字段与「企业入驻」EnterpriseAuthForm 对齐 */

import type { EnterpriseFileAttachment } from './EnterpriseAuthForm';
import { formatIndustryLevelsDisplay } from './IndustrySearchCascader';

export type WorkbenchEnterpriseAuditStatus = '已通过' | '审核中' | '待审核' | '已驳回' | '草稿';

export type WorkbenchHonorFile = EnterpriseFileAttachment;

export type WorkbenchEnterpriseRecord = {
  id: string;
  auditStatus: WorkbenchEnterpriseAuditStatus;
  /** 主体身份信息 */
  userIdentity: string;
  creditCode: string;
  name: string;
  region: string;
  regAddress: string;
  actAddress: string;
  /** 主体身份信息：企业简介（必填，不含附件） */
  enterpriseIntro: string;
  /** 联系人（不含账号名称） */
  contactName: string;
  contactPhone: string;
  email: string;
  /** 用户类型（企业法人/非企业法人级联，含子类型与三级） */
  userType: string;
  subType: string;
  subLevel3: string;
  /** 所属行业四级（代码 + 名称） */
  industryL1Code: string;
  industryL1Name: string;
  industryL2Code: string;
  industryL2Name: string;
  industryL3Code: string;
  industryL3Name: string;
  industryL4Code: string;
  industryL4Name: string;
  /** 企查查预填，只读展示 */
  scope: string;
  serviceScope: string;
  /** 可编辑经营信息 */
  coreProducts: string;
  isAboveSize: string;
  enterpriseScale: string;
  isHighTechEnterprise: string;
  isSpecializedLittleGiant: string;
  awardsAndHonors: string;
  /** 荣誉相关附件（业务信息内） */
  honorFiles: WorkbenchHonorFile[];
  /** 授权与证明文件 */
  businessLicense: WorkbenchHonorFile | null;
  idCardFront: WorkbenchHonorFile | null;
  idCardBack: WorkbenchHonorFile | null;
  authorizationLetter: WorkbenchHonorFile | null;
};

export type WorkbenchEnterpriseFormState = Omit<WorkbenchEnterpriseRecord, 'id' | 'auditStatus'>;

export function createEmptyEnterpriseForm(): WorkbenchEnterpriseFormState {
  return {
    userIdentity: '产业主体',
    creditCode: '',
    name: '',
    region: '',
    regAddress: '',
    actAddress: '',
    enterpriseIntro: '',
    contactName: '',
    contactPhone: '',
    email: '',
    userType: '企业法人',
    subType: '内资企业',
    subLevel3: '国有企业',
    industryL1Code: '',
    industryL1Name: '',
    industryL2Code: '',
    industryL2Name: '',
    industryL3Code: '',
    industryL3Name: '',
    industryL4Code: '',
    industryL4Name: '',
    scope: '',
    serviceScope: '',
    coreProducts: '',
    isAboveSize: '是',
    enterpriseScale: '中型企业',
    isHighTechEnterprise: '否',
    isSpecializedLittleGiant: '否',
    awardsAndHonors: '',
    honorFiles: [],
    businessLicense: null,
    idCardFront: null,
    idCardBack: null,
    authorizationLetter: null,
  };
}

export const WORKBENCH_ENTERPRISE_AUDIT_STATUSES = [
  '已通过',
  '待审核',
  '审核中',
  '已驳回',
  '草稿',
] as const;

export function entityTypeSummary(
  record: Pick<WorkbenchEnterpriseRecord, 'userType' | 'subType' | 'subLevel3'>
): string {
  const parts = [record.userType, record.subType, record.subLevel3].filter(Boolean);
  return parts.join(' / ') || '—';
}

/** 平台用户身份统计口径（政府 / 产业 / 用水户） */
export type PlatformUserIdentityKind = '政府主体' | '产业主体' | '用水户主体';

export function classifyPlatformUserIdentity(
  record: Pick<WorkbenchEnterpriseRecord, 'userIdentity' | 'userType' | 'subType'>
): PlatformUserIdentityKind {
  const identity = record.userIdentity?.trim();
  if (identity === '用水户主体') return '用水户主体';
  if (identity === '政府主体') return '政府主体';
  if (identity === '产业主体') return '产业主体';
  if (record.userType === '非企业法人' && record.subType === '机关法人') return '政府主体';
  return '产业主体';
}

export function countUsersByPlatformIdentity(
  records: readonly Pick<WorkbenchEnterpriseRecord, 'id' | 'userIdentity' | 'userType' | 'subType'>[]
): Record<PlatformUserIdentityKind, number> {
  const counts: Record<PlatformUserIdentityKind, number> = {
    政府主体: 0,
    产业主体: 0,
    用水户主体: 0,
  };
  for (const row of records) {
    if (row.id === 'ent-self') continue;
    counts[classifyPlatformUserIdentity(row)] += 1;
  }
  return counts;
}

export function validateWorkbenchEnterpriseForm(
  form: WorkbenchEnterpriseFormState,
  options?: { requireCreditCode?: boolean }
): string | null {
  if (!form.name.trim()) return '请填写企业名称';
  if (options?.requireCreditCode && !form.creditCode.trim()) return '请填写统一社会信用代码';
  if (!form.region.trim()) return '请填写所属区域';
  if (!form.actAddress.trim()) return '请填写实际地址';
  if (!form.enterpriseIntro.trim()) return '请填写企业简介';
  if (!form.contactName.trim()) return '请填写联系人姓名';
  if (!form.contactPhone.trim()) return '请填写联系电话';
  if (!form.industryL1Code || !form.industryL4Code) return '请完整选择所属行业（门类至小类）';
  if (form.userType === '企业法人' && !form.coreProducts.trim()) return '请填写核心产品或方案';
  return null;
}

export function seedWorkbenchEnterprises(): WorkbenchEnterpriseRecord[] {
  return [
    {
      id: 'ent-demo-1',
      auditStatus: '已通过',
      userIdentity: '产业主体',
      creditCode: '91320000748212345X',
      name: '江苏省水利工程科技咨询股份有限公司',
      region: '江苏省南京市',
      regAddress: '南京市上海路5号水利大厦15楼',
      actAddress: '南京市上海路5号水利大厦15楼',
      enterpriseIntro:
        '江苏省水利工程科技咨询股份有限公司深耕全省水资源与节约用水管理领域，是集技术咨询、科研创新、产业服务于一体的专业水利科技企业，为用水单位与节水产业主体搭建沟通桥梁。',
      contactName: '易卫东',
      contactPhone: '13812346688',
      email: 'contact@demo-water.cn',
      userType: '企业法人',
      subType: '内资企业',
      subLevel3: '国有企业',
      industryL1Code: 'N',
      industryL1Name: '水利、环境和公共设施管理业',
      industryL2Code: 'N76',
      industryL2Name: '水利管理业',
      industryL3Code: 'N762',
      industryL3Name: '水资源管理',
      industryL4Code: 'N7620',
      industryL4Name: '水资源管理',
      scope:
        '水利工程建设监理；水文学及水资源调查；水库大坝安全分析评价；水资源论证、水环境监测；节约用水、水务精细化管理技术咨询、系统开发；智慧水利系统集成；工程设计与技术咨询服务。',
      serviceScope: '面向全国工业园区、公共机构及灌区提供节水诊断、改造方案与运维托管服务。',
      coreProducts: '水平衡测试与智慧水务平台；合同节水托管；分区计量与漏损管控整体方案。',
      isAboveSize: '是',
      enterpriseScale: '大中型',
      isHighTechEnterprise: '是',
      isSpecializedLittleGiant: '否',
      awardsAndHonors: '高新技术企业\n节水载体创建示范单位',
      honorFiles: [],
      businessLicense: null,
      idCardFront: null,
      idCardBack: null,
      authorizationLetter: null,
    },
    {
      id: 'ent-demo-2',
      auditStatus: '待审核',
      userIdentity: '产业主体',
      creditCode: '91320115MA1WABCD2X',
      name: '南京绿源节水科技有限公司',
      region: '江苏省南京市',
      regAddress: '南京市建邺区奥体大街68号',
      actAddress: '南京市建邺区奥体大街68号国际研发总部园',
      enterpriseIntro:
        '南京绿源节水科技有限公司专注节水设备研发制造与合同节水托管，为工业园区提供智能计量、中水回用与运维一体化服务。',
      contactName: '王敏',
      contactPhone: '13900001122',
      email: 'wangmin@demo-green.cn',
      userType: '企业法人',
      subType: '内资企业',
      subLevel3: '私营企业',
      industryL1Code: 'C',
      industryL1Name: '制造业',
      industryL2Code: 'C35',
      industryL2Name: '专用设备制造业',
      industryL3Code: 'C359',
      industryL3Name: '环保、邮政、社会公共服务及其他专用设备制造',
      industryL4Code: 'C3591',
      industryL4Name: '环境保护专用设备制造',
      scope: '节水设备研发、生产与销售；合同节水托管服务。',
      serviceScope: '华东工业园区节水改造与运维。',
      coreProducts: '智能水表与分区计量系统；中水回用成套设备。',
      isAboveSize: '是',
      enterpriseScale: '中型企业',
      isHighTechEnterprise: '是',
      isSpecializedLittleGiant: '是',
      awardsAndHonors: '江苏省专精特新中小企业',
      honorFiles: [],
      businessLicense: null,
      idCardFront: null,
      idCardBack: null,
      authorizationLetter: null,
    },
    {
      id: 'ent-demo-3',
      auditStatus: '已通过',
      userIdentity: '产业主体',
      creditCode: '91320594MA7EFGH34Y',
      name: '苏州工业园区水务技术服务有限公司',
      region: '江苏省苏州市',
      regAddress: '苏州工业园区星湖街328号',
      actAddress: '苏州工业园区星湖街328号创意产业园',
      enterpriseIntro:
        '苏州工业园区水务技术服务有限公司面向公共供水企业与园区客户提供管网漏损监测、DMA 分区计量与节水技术支持服务。',
      contactName: '陈浩',
      contactPhone: '13788886666',
      email: 'chenhao@demo-sz.cn',
      userType: '企业法人',
      subType: '内资企业',
      subLevel3: '联营企业',
      industryL1Code: 'D',
      industryL1Name: '电力、热力、燃气及水生产和供应业',
      industryL2Code: 'D46',
      industryL2Name: '水的生产和供应业',
      industryL3Code: 'D461',
      industryL3Name: '自来水生产和供应',
      industryL4Code: 'D4610',
      industryL4Name: '自来水生产和供应',
      scope: '自来水供应辅助服务；节水咨询与管网检漏。',
      serviceScope: '苏州及周边公共供水企业节水技术支持。',
      coreProducts: '管网漏损监测平台；DMA 分区计量方案。',
      isAboveSize: '是',
      enterpriseScale: '大型企业',
      isHighTechEnterprise: '否',
      isSpecializedLittleGiant: '否',
      awardsAndHonors: '',
      honorFiles: [],
      businessLicense: null,
      idCardFront: null,
      idCardBack: null,
      authorizationLetter: null,
    },
    {
      id: 'ent-demo-4',
      auditStatus: '已驳回',
      userIdentity: '产业主体',
      creditCode: '91330108MA8KLMN56Z',
      name: '杭州云润节水科技股份有限公司',
      region: '浙江省杭州市',
      regAddress: '杭州市滨江区网商路699号',
      actAddress: '杭州市滨江区网商路699号1号楼',
      enterpriseIntro:
        '杭州云润节水科技股份有限公司以节水管理软件与物联网终端为核心，为数据中心冷却水系统提供节水优化与运营诊断服务。',
      contactName: '李婷',
      contactPhone: '13666667777',
      email: 'liting@demo-hz.cn',
      userType: '企业法人',
      subType: '外商投资企业',
      subLevel3: '',
      industryL1Code: 'I',
      industryL1Name: '信息传输、软件和信息技术服务业',
      industryL2Code: 'I65',
      industryL2Name: '软件和信息技术服务业',
      industryL3Code: 'I651',
      industryL3Name: '软件开发',
      industryL4Code: 'I6510',
      industryL4Name: '软件开发',
      scope: '节水管理软件与物联网终端研发。',
      serviceScope: '数据中心冷却水系统节水优化。',
      coreProducts: '冷却水系统节水诊断 SaaS。',
      isAboveSize: '否',
      enterpriseScale: '小型企业',
      isHighTechEnterprise: '是',
      isSpecializedLittleGiant: '否',
      awardsAndHonors: '',
      honorFiles: [],
      businessLicense: null,
      idCardFront: null,
      idCardBack: null,
      authorizationLetter: null,
    },
    {
      id: 'ent-demo-5',
      auditStatus: '审核中',
      userIdentity: '产业主体',
      creditCode: '91440300MA5DXYZ78A',
      name: '深圳前海智慧水务有限公司',
      region: '广东省深圳市',
      regAddress: '深圳市前海深港合作区南山街道',
      actAddress: '深圳市南山区科技园南区',
      enterpriseIntro:
        '深圳前海智慧水务有限公司从事水务信息化与节水技术推广，为华南地区公共机构节水改造提供智慧运营平台与方案实施。',
      contactName: '赵磊',
      contactPhone: '13512349876',
      email: 'zhaolei@demo-szgd.cn',
      userType: '非企业法人',
      subType: '事业单位',
      subLevel3: '',
      industryL1Code: 'N',
      industryL1Name: '水利、环境和公共设施管理业',
      industryL2Code: 'N77',
      industryL2Name: '生态保护和环境治理业',
      industryL3Code: 'N772',
      industryL3Name: '环境治理业',
      industryL4Code: 'N7721',
      industryL4Name: '水污染治理',
      scope: '水务信息化与节水技术推广。',
      serviceScope: '华南地区公共机构节水改造。',
      coreProducts: '智慧节水运营平台。',
      isAboveSize: '是',
      enterpriseScale: '中型企业',
      isHighTechEnterprise: '是',
      isSpecializedLittleGiant: '否',
      awardsAndHonors: '深圳市高新技术企业',
      honorFiles: [],
      businessLicense: null,
      idCardFront: null,
      idCardBack: null,
      authorizationLetter: null,
    },
    {
      id: 'ent-demo-6',
      auditStatus: '已通过',
      userIdentity: '用水户主体',
      creditCode: '91320100MA1WATER01X',
      name: '南京江北新区智能制造产业园',
      region: '江苏省南京市',
      regAddress: '南京市江北新区研创园',
      actAddress: '南京市江北新区智能制造产业园管理中心',
      enterpriseIntro:
        '园区集中式用水管理主体，统筹区内工业企业取水许可、水平衡测试与节水技术改造推进工作。',
      contactName: '周敏',
      contactPhone: '13951880021',
      email: 'zhoumin@demo-park.cn',
      userType: '企业法人',
      subType: '内资企业',
      subLevel3: '其他内资企业',
      industryL1Code: 'C',
      industryL1Name: '制造业',
      industryL2Code: 'C38',
      industryL2Name: '电气机械和器材制造业',
      industryL3Code: 'C382',
      industryL3Name: '输配电及控制设备制造',
      industryL4Code: 'C3821',
      industryL4Name: '变压器、整流器和电感器制造',
      scope: '园区用水统筹管理；节水技术改造组织推进。',
      serviceScope: '江北新区工业企业节水管理。',
      coreProducts: '园区节水数字化监管平台。',
      isAboveSize: '是',
      enterpriseScale: '大型企业',
      isHighTechEnterprise: '否',
      isSpecializedLittleGiant: '否',
      awardsAndHonors: '江苏省节水型园区',
      honorFiles: [],
      businessLicense: null,
      idCardFront: null,
      idCardBack: null,
      authorizationLetter: null,
    },
    {
      id: 'ent-demo-7',
      auditStatus: '已通过',
      userIdentity: '政府主体',
      creditCode: '11320100MB0GOV0001',
      name: '南京市节约用水办公室',
      region: '江苏省南京市',
      regAddress: '南京市玄武区北京东路41号',
      actAddress: '南京市玄武区北京东路41号',
      enterpriseIntro:
        '负责全市节约用水监督管理、节水载体创建与节水产业推广工作的政府主管机构。',
      contactName: '刘建华',
      contactPhone: '02583221008',
      email: 'liu.jh@demo-gov.cn',
      userType: '非企业法人',
      subType: '机关法人',
      subLevel3: '',
      industryL1Code: 'N',
      industryL1Name: '水利、环境和公共设施管理业',
      industryL2Code: 'N76',
      industryL2Name: '水利管理业',
      industryL3Code: 'N762',
      industryL3Name: '水资源管理',
      industryL4Code: 'N7620',
      industryL4Name: '水资源管理',
      scope: '节约用水监督管理；节水政策宣传与技术服务指导。',
      serviceScope: '南京市行政区域。',
      coreProducts: '节水监管与政策服务。',
      isAboveSize: '否',
      enterpriseScale: '中型企业',
      isHighTechEnterprise: '否',
      isSpecializedLittleGiant: '否',
      awardsAndHonors: '',
      honorFiles: [],
      businessLicense: null,
      idCardFront: null,
      idCardBack: null,
      authorizationLetter: null,
    },
  ];
}

export function enterpriseToForm(record: WorkbenchEnterpriseRecord): WorkbenchEnterpriseFormState {
  const { id: _id, auditStatus: _status, ...rest } = record;
  return rest;
}

export function formatAwardsAndHonorsLines(raw: string): string[] {
  return raw
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function enterpriseAuditStatusClass(status: WorkbenchEnterpriseAuditStatus): string {
  if (status === '已通过') return 'border-emerald-200 bg-emerald-50 text-emerald-800';
  if (status === '审核中') return 'border-sky-200 bg-sky-50 text-sky-800';
  if (status === '待审核') return 'border-amber-200 bg-amber-50 text-amber-800';
  if (status === '已驳回') return 'border-red-200 bg-red-50 text-red-800';
  return 'border-gray-200 bg-gray-50 text-gray-700';
}

export function industrySummaryDisplay(form: Pick<
  WorkbenchEnterpriseFormState,
  | 'industryL1Code'
  | 'industryL1Name'
  | 'industryL2Code'
  | 'industryL2Name'
  | 'industryL3Code'
  | 'industryL3Name'
  | 'industryL4Code'
  | 'industryL4Name'
>): string {
  const text = formatIndustryLevelsDisplay(form);
  return text || '—';
}
