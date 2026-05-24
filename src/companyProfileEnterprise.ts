import { formatIndustryOption, type IndustryTreeNode } from './enterpriseFormShared';
import { ENTERPRISE_INDUSTRY_TREE } from './enterpriseFormShared';
import {
  entityTypeSummary,
  type WorkbenchEnterpriseRecord,
} from './workbenchEnterprise';
import { findWorkbenchEnterpriseByName } from './workbenchEnterpriseStore';

/** 供方主页展示：与入驻表单一致（不含附件） */
export type CompanyProfileEnterpriseInfo = {
  auditStatus: string;
  userIdentity: string;
  creditCode: string;
  name: string;
  region: string;
  regAddress: string;
  actAddress: string;
  enterpriseIntro: string;
  contactName: string;
  contactPhone: string;
  email: string;
  userType: string;
  subType: string;
  subLevel3: string;
  industryL1Label: string;
  industryL2Label: string;
  industryL3Label: string;
  industryL4Label: string;
  scope: string;
  serviceScope: string;
  coreProducts: string;
  isAboveSize: string;
  enterpriseScale: string;
  isHighTechEnterprise: string;
  isSpecializedLittleGiant: string;
  awardsAndHonors: string;
};

function industryLevelLabel(
  code: string,
  name: string,
  tree: IndustryTreeNode[],
  level: 1 | 2 | 3 | 4
): string {
  if (!code && !name) return '';
  if (code && name) return `${code} ${name}`;
  if (level === 1) {
    const n = tree.find((x) => x.code === code);
    return n ? formatIndustryOption(n) : name || code;
  }
  return name || code;
}

export function workbenchEnterpriseToProfileInfo(
  record: WorkbenchEnterpriseRecord
): CompanyProfileEnterpriseInfo {
  return {
    auditStatus: record.auditStatus,
    userIdentity: record.userIdentity,
    creditCode: record.creditCode,
    name: record.name,
    region: record.region,
    regAddress: record.regAddress,
    actAddress: record.actAddress,
    enterpriseIntro: record.enterpriseIntro,
    contactName: record.contactName,
    contactPhone: record.contactPhone,
    email: record.email,
    userType: record.userType,
    subType: record.subType,
    subLevel3: record.subLevel3,
    industryL1Label: industryLevelLabel(record.industryL1Code, record.industryL1Name, ENTERPRISE_INDUSTRY_TREE, 1),
    industryL2Label: industryLevelLabel(record.industryL2Code, record.industryL2Name, ENTERPRISE_INDUSTRY_TREE, 2),
    industryL3Label: industryLevelLabel(record.industryL3Code, record.industryL3Name, ENTERPRISE_INDUSTRY_TREE, 3),
    industryL4Label: industryLevelLabel(record.industryL4Code, record.industryL4Name, ENTERPRISE_INDUSTRY_TREE, 4),
    scope: record.scope,
    serviceScope: record.serviceScope,
    coreProducts: record.coreProducts,
    isAboveSize: record.isAboveSize,
    enterpriseScale: record.enterpriseScale,
    isHighTechEnterprise: record.isHighTechEnterprise,
    isSpecializedLittleGiant: record.isSpecializedLittleGiant,
    awardsAndHonors: record.awardsAndHonors,
  };
}

function pickStableFromName(name: string, options: string[]): string {
  if (options.length === 0) return '';
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return options[h % options.length]!;
}

/** 无入驻档案匹配时的演示兜底（字段结构仍与入驻表单一致） */
export function buildFallbackEnterpriseProfileInfo(
  companyName: string,
  industryShort: string,
  overviewSnippet: string
): CompanyProfileEnterpriseInfo {
  const contactName = pickStableFromName(companyName + 'c', ['易卫东', '张敏', '刘芳', '赵强']);
  return {
    auditStatus: '已通过',
    userIdentity: '产业主体',
    creditCode: `91320${(companyName.length % 90000000000000000).toString().padStart(14, '0').slice(0, 14)}X`,
    name: companyName,
    region: pickStableFromName(companyName, ['江苏省南京市', '江苏省苏州市', '浙江省杭州市']),
    regAddress: `${companyName}注册地址（演示）`,
    actAddress: `${companyName}实际经营地址（演示）`,
    enterpriseIntro:
      overviewSnippet.slice(0, 300) ||
      `${companyName}为节水产业服务平台认证供方，面向用水单位与园区提供节水装备、方案设计与运维服务（演示）。`,
    contactName,
    contactPhone: `138${String(10000000 + (companyName.length % 89999999)).slice(0, 8)}`,
    email: `contact@${pickStableFromName(companyName, ['demo-water', 'jswater', 'example'])}.cn`,
    userType: '企业法人',
    subType: '内资企业',
    subLevel3: pickStableFromName(companyName, ['国有企业', '私营企业', '联营企业']),
    industryL1Label: industryShort || '水利、环境和公共设施管理业',
    industryL2Label: '—',
    industryL3Label: '—',
    industryL4Label: '—',
    scope: `${companyName}经营范围包括节水与水资源专用设备制造、智能计量与监测仪器销售、合同节水管理技术服务、水平衡测试与节水诊断等（演示）。`,
    serviceScope: `面向${industryShort || '节水产业'}相关客户提供设备供货、方案设计与运维服务（演示）。`,
    coreProducts: overviewSnippet.slice(0, 200) || '节水装备与智慧水务相关产品及方案（演示）',
    isAboveSize: pickStableFromName(companyName, ['是', '否']),
    enterpriseScale: pickStableFromName(companyName, ['大型企业', '中型企业', '小型企业']),
    isHighTechEnterprise: pickStableFromName(companyName, ['是', '否']),
    isSpecializedLittleGiant: pickStableFromName(companyName, ['是', '否']),
    awardsAndHonors: pickStableFromName(companyName, ['高新技术企业', '节水载体创建示范单位', '']),
  };
}

export function resolveCompanyProfileEnterpriseInfo(
  companyName: string,
  industryShort: string,
  overviewSnippet: string
): CompanyProfileEnterpriseInfo {
  const matched = findWorkbenchEnterpriseByName(companyName);
  if (matched) return workbenchEnterpriseToProfileInfo(matched);
  return buildFallbackEnterpriseProfileInfo(companyName, industryShort, overviewSnippet);
}

export function entityTypeDisplay(info: CompanyProfileEnterpriseInfo): string {
  return entityTypeSummary(info);
}

export function awardsHonorLines(info: CompanyProfileEnterpriseInfo): string[] {
  return info.awardsAndHonors
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}
