import {
  createEmptyEnterpriseForm,
  type WorkbenchEnterpriseAuditStatus,
  type WorkbenchEnterpriseRecord,
} from './workbenchEnterprise';
import {
  getWorkbenchEnterpriseById,
  getWorkbenchEnterprises,
  nextWorkbenchEnterpriseId,
  upsertWorkbenchEnterprise,
} from './workbenchEnterpriseStore';
import { formatApplicationFieldsList } from './workbenchApplicationFields';
import { normalizeCreditCode } from './waterUserFormShared';
import type { IndustryLevelFields } from './enterpriseFormShared';

/** 用水户一键注册向导提交的入驻资料 */
export type WaterUserRegistrationProfile = {
  creditCode: string;
  userName: string;
  userLegalType: '企业法人' | '非企业法人';
  subType: string;
  subLevel3: string;
  regionProvince: string;
  regionCity: string;
  regionDistrict: string;
  contactName: string;
  contactPhone: string;
  industry: IndustryLevelFields;
  applicationFields: string[];
};

export type WaterUserLoginGate = {
  allowed: boolean;
  message: string;
  auditStatus?: WorkbenchEnterpriseAuditStatus;
  enterprise?: WorkbenchEnterpriseRecord;
};

export function findWaterUserEnterpriseByPhone(phone: string): WorkbenchEnterpriseRecord | undefined {
  const key = phone.trim();
  if (!key) return undefined;
  return getWorkbenchEnterprises().find(
    (e) => e.userIdentity === '用水户主体' && e.contactPhone.trim() === key
  );
}

export function getWaterUserLoginGate(phone: string): WaterUserLoginGate {
  const ent = findWaterUserEnterpriseByPhone(phone);
  if (!ent) {
    return {
      allowed: false,
      message: '未找到用水户主体入驻记录，请先完成注册入驻。',
    };
  }
  if (ent.auditStatus === '已通过') {
    return { allowed: true, message: '', auditStatus: ent.auditStatus, enterprise: ent };
  }
  if (ent.auditStatus === '已驳回') {
    return {
      allowed: false,
      message: '用水户主体入驻审核未通过，请联系系统管理员或重新提交入驻申请。',
      auditStatus: ent.auditStatus,
      enterprise: ent,
    };
  }
  return {
    allowed: false,
    message: '用水户主体入驻申请正在审核中，系统管理员审核通过后方可登录。',
    auditStatus: ent.auditStatus,
    enterprise: ent,
  };
}

export function waterUserProfileToEnterpriseRecord(
  profile: WaterUserRegistrationProfile,
  phone: string,
  id?: string
): WorkbenchEnterpriseRecord {
  const base = createEmptyEnterpriseForm();
  const region = [profile.regionProvince, profile.regionCity, profile.regionDistrict]
    .filter(Boolean)
    .join('');
  const apps = formatApplicationFieldsList(profile.applicationFields);
  return {
    id: id ?? nextWorkbenchEnterpriseId(),
    auditStatus: '待审核',
    userIdentity: '用水户主体',
    creditCode: normalizeCreditCode(profile.creditCode),
    name: profile.userName.trim(),
    region,
    regAddress: region,
    actAddress: region,
    enterpriseIntro: apps === '—' ? '用水户主体入驻申请' : `用水户主体入驻申请；应用领域：${apps}`,
    contactName: profile.contactName.trim(),
    contactPhone: phone.trim(),
    email: '',
    userType: profile.userLegalType,
    subType: profile.subType,
    subLevel3: profile.subLevel3,
    industryL1Code: profile.industry.industryL1Code,
    industryL1Name: profile.industry.industryL1Name,
    industryL2Code: profile.industry.industryL2Code,
    industryL2Name: profile.industry.industryL2Name,
    industryL3Code: profile.industry.industryL3Code,
    industryL3Name: profile.industry.industryL3Name,
    industryL4Code: profile.industry.industryL4Code,
    industryL4Name: profile.industry.industryL4Name,
    scope: '',
    serviceScope: apps === '—' ? '' : apps,
    coreProducts: '',
    isAboveSize: '否',
    enterpriseScale: '',
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

/** 提交用水户入驻：写入企业管理列表，状态为待审核 */
export function registerWaterUserEnterprise(input: {
  phone: string;
  profile: WaterUserRegistrationProfile;
}): { ok: true; enterpriseId: string } | { ok: false; message: string } {
  const phone = input.phone.trim();
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    return { ok: false, message: '请填写有效的注册手机号' };
  }
  const existing = findWaterUserEnterpriseByPhone(phone);
  if (existing) {
    if (existing.auditStatus === '已通过') {
      return { ok: false, message: '该手机号对应用水户主体已审核通过，请直接登录。' };
    }
    if (existing.auditStatus === '待审核' || existing.auditStatus === '审核中') {
      return { ok: false, message: '该手机号已有入驻申请在审核中，请等待系统管理员处理。' };
    }
  }
  const record = waterUserProfileToEnterpriseRecord(
    input.profile,
    phone,
    existing?.auditStatus === '已驳回' ? existing.id : undefined
  );
  upsertWorkbenchEnterprise(record);
  return { ok: true, enterpriseId: record.id };
}

export function getWaterUserEnterpriseById(id: string): WorkbenchEnterpriseRecord | undefined {
  const ent = getWorkbenchEnterpriseById(id);
  if (!ent || ent.userIdentity !== '用水户主体') return undefined;
  return ent;
}
