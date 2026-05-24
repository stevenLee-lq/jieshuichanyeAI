import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Droplets, Factory, HelpCircle, X } from 'lucide-react';
import { cn } from './lib/utils';
import { EnterpriseAuthForm, type EnterpriseFileAttachment } from './EnterpriseAuthForm';
import {
  EntityTypeCascaderField,
  IndustryCascaderField,
  RegionCascaderField,
} from './SharedCascadeFormFields';
import { writePortalAccountUserName } from './portalAccountUserName';
import { readPortalDemoAccount } from './portalDemoAccount';
import {
  EMPTY_INDUSTRY_LEVELS,
  type IndustryLevelFields,
} from './enterpriseFormShared';
import {
  fetchWaterUserByCreditCode,
  formatRegionFromParts,
  isValidCreditCode,
  normalizeCreditCode,
  parseRegionText,
  waterUserTypeFromPath,
  waterUserTypePathFromParts,
} from './waterUserFormShared';
import { registerWaterUserEnterprise } from './waterUserEnterpriseRegistration';

/** 与 App 中 PortalUserIdentity 一致 */
export type WizardPortalUserIdentity = '产业主体' | '用水户主体' | '其他主体';

const DRAFT_KEY = 'portal-oneclick-register-draft-v1';

export type WaterProfileDraft = {
  creditCode: string;
  userName: string;
  userLegalType: '' | '企业法人' | '非企业法人';
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

function defaultWaterProfile(): WaterProfileDraft {
  return {
    creditCode: '',
    userName: '',
    userLegalType: '',
    subType: '',
    subLevel3: '',
    regionProvince: '',
    regionCity: '',
    regionDistrict: '',
    contactName: '',
    contactPhone: '',
    industry: { ...EMPTY_INDUSTRY_LEVELS },
    applicationFields: [],
  };
}

export type IndustryProductDraft = {
  id: string;
  name: string;
  imageDataUrl: string;
  params: string;
};

export type OneClickRegisterWizardProps = {
  isOpen: boolean;
  onClose: () => void;
  /** 完成免费注册（与 AuthModal 成功回调一致） */
  onRegisterSuccess: (
    identity: WizardPortalUserIdentity,
    creds: { phone: string; password: string },
    options?: { pendingWaterAudit?: boolean; enterpriseId?: string }
  ) => void;
  /** 已有账号，仅打开登录弹窗 */
  onLoginOnly: () => void;
};

type FlowKind = 'industry' | 'water' | 'other';

function newProductRow(): IndustryProductDraft {
  return { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, name: '', imageDataUrl: '', params: '' };
}

/** 向导表单必填项标签：字段名灰色，星号红色 */
function WizardRequiredLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-black text-gray-700">
      {children}
      <span className="text-red-500"> *</span>
    </span>
  );
}

/** 与产业主体入驻 EnterpriseAuthForm「用户身份」锁定展示一致 */
function WizardLockedUserIdentityField({
  identity,
}: {
  identity: WizardPortalUserIdentity;
}) {
  return (
    <div className="space-y-2">
      <label className="flex flex-wrap items-center gap-2 text-sm font-black text-gray-700">
        用户身份 <span className="text-red-500">*</span>
      </label>
      <div
        className="flex h-12 w-full items-center rounded-xl border border-teal-100 bg-teal-50/80 px-4 text-sm font-black text-teal-900 sm:h-14 sm:px-5"
        aria-readonly
      >
        {identity}
      </div>
    </div>
  );
}

export function OneClickRegisterWizard({
  isOpen,
  onClose,
  onRegisterSuccess,
  onLoginOnly,
}: OneClickRegisterWizardProps) {
  const [pick, setPick] = useState<FlowKind | null>(null);
  const [industryStep, setIndustryStep] = useState(1);
  const [waterStep, setWaterStep] = useState(1);
  const [otherStep, setOtherStep] = useState(1);

  /** 产业主体 · 第 1/2 步共用：授权委托书 */
  const [industryAuthLetter, setIndustryAuthLetter] = useState<EnterpriseFileAttachment | null>(null);
  /** 产业主体 · 第 1 步：入驻表单必填项（含企业简介）是否满足 */
  const [industryFormReady, setIndustryFormReady] = useState(false);
  const [industryShowFieldErrors, setIndustryShowFieldErrors] = useState(false);

  const [industryProducts, setIndustryProducts] = useState<IndustryProductDraft[]>(() => [newProductRow()]);

  /** 产业主体 / 用水户 / 其他 · 最后一步：账号 */
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [agreed, setAgreed] = useState(false);

  /** 用水户主体 · 第一步 */
  const [waterProfile, setWaterProfile] = useState(() => defaultWaterProfile());
  const [waterQccLoading, setWaterQccLoading] = useState(false);

  /** 其他主体 · 第一步 */
  const [otherProfile, setOtherProfile] = useState({
    orgName: '',
    contactName: '',
    contactPhone: '',
    remark: '',
  });
  /** 用水户：提交入驻后展示审核提示，不自动登录 */
  const [waterAuditSubmitted, setWaterAuditSubmitted] = useState(false);

  const resetAll = useCallback(() => {
    setPick(null);
    setIndustryStep(1);
    setWaterStep(1);
    setIndustryFormReady(false);
    setIndustryShowFieldErrors(false);
    setOtherStep(1);
    setIndustryAuthLetter(null);
    setIndustryProducts([newProductRow()]);
    setPhone('');
    setPassword('');
    setConfirmPassword('');
    setCode('');
    setAgreed(false);
    setWaterProfile(defaultWaterProfile());
    setOtherProfile({ orgName: '', contactName: '', contactPhone: '', remark: '' });
    setWaterAuditSubmitted(false);
  }, []);

  useEffect(() => {
    if (!isOpen) resetAll();
  }, [isOpen, resetAll]);

  const validateRegister = () => {
    if (!agreed) return false;
    const p = phone.trim();
    if (!/^1[3-9]\d{9}$/.test(p)) return false;
    if (password.length < 6) return false;
    if (password !== confirmPassword) return false;
    return true;
  };

  const validateIndustryRegister = () => validateRegister() && Boolean(industryAuthLetter);

  const submitRegister = (identity: WizardPortalUserIdentity) => {
    if (identity === '产业主体' ? !validateIndustryRegister() : !validateRegister()) return;
    const creds = { phone: phone.trim(), password };

    if (identity === '用水户主体') {
      const result = registerWaterUserEnterprise({
        phone: creds.phone,
        profile: {
          creditCode: waterProfile.creditCode,
          userName: waterProfile.userName,
          userLegalType: waterProfile.userLegalType,
          subType: waterProfile.subType,
          subLevel3: waterProfile.subLevel3,
          regionProvince: waterProfile.regionProvince,
          regionCity: waterProfile.regionCity,
          regionDistrict: waterProfile.regionDistrict,
          contactName: waterProfile.contactName,
          contactPhone: waterProfile.contactPhone,
          industry: waterProfile.industry,
          applicationFields: waterProfile.applicationFields,
        },
      });
      if (!result.ok) {
        window.alert(result.message);
        return;
      }
      if (waterProfile.userName.trim()) {
        writePortalAccountUserName(waterProfile.userName);
      }
      onRegisterSuccess(identity, creds, {
        pendingWaterAudit: true,
        enterpriseId: result.enterpriseId,
      });
      setWaterAuditSubmitted(true);
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {
        /* ignore */
      }
      return;
    }

    if (identity === '其他主体' && otherProfile.orgName.trim()) {
      writePortalAccountUserName(otherProfile.orgName);
    }
    onRegisterSuccess(identity, creds);
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* ignore */
    }
    onClose();
  };

  const waterCreditNormalized = useMemo(
    () => normalizeCreditCode(waterProfile.creditCode),
    [waterProfile.creditCode]
  );

  const runWaterQccLookup = useCallback((code: string) => {
    const normalized = normalizeCreditCode(code);
    if (normalized.length !== 18) return;
    setWaterQccLoading(true);
    const cancel = fetchWaterUserByCreditCode(normalized, (data) => {
      setWaterProfile((s) => ({
        ...s,
        creditCode: normalized,
        userName: data.userName,
      }));
      setWaterQccLoading(false);
    });
    return cancel;
  }, []);

  useEffect(() => {
    if (waterCreditNormalized.length !== 18) return;
    if (waterProfile.userName.trim()) return;
    if (waterQccLoading) return;
    const cancel = runWaterQccLookup(waterCreditNormalized);
    return cancel;
  }, [waterCreditNormalized, waterProfile.userName, waterQccLoading, runWaterQccLookup]);

  const waterStep1Ok = useMemo(() => {
    if (!isValidCreditCode(waterProfile.creditCode)) return false;
    if (!waterProfile.userName.trim()) return false;
    if (!waterProfile.regionProvince || !waterProfile.regionCity || !waterProfile.regionDistrict) return false;
    if (!waterProfile.userLegalType || !waterProfile.subType.trim()) return false;
    const typePath = waterUserTypePathFromParts(
      waterProfile.userLegalType,
      waterProfile.subType,
      waterProfile.subLevel3
    );
    const needL3 = typePath.length >= 3;
    if (needL3 && !waterProfile.subLevel3.trim()) return false;
    if (!waterProfile.industry.industryL4Code) return false;
    if (!waterProfile.contactName.trim() || !waterProfile.contactPhone.trim()) return false;
    return true;
  }, [waterProfile]);

  const otherStep1Ok =
    otherProfile.orgName.trim().length > 0 &&
    otherProfile.contactName.trim().length > 0 &&
    otherProfile.contactPhone.trim().length > 0;

  if (!isOpen) return null;

  const title =
    pick == null
      ? '注册/入驻/登录'
      : pick === 'industry'
        ? `产业主体 · 第 ${industryStep} / 2 步`
        : pick === 'water'
          ? `用水户主体 · 第 ${waterStep} / 2 步`
          : `其他主体 · 第 ${otherStep} / 2 步`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-gray-900/50 backdrop-blur-[2px]"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 14 }}
          className={cn(
            'relative flex w-full flex-col overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-2xl shadow-teal-900/15',
            pick === 'industry' && industryStep === 1
              ? 'max-h-[min(94vh,56rem)] max-w-[min(92vw,64rem)]'
              : 'max-h-[min(92vh,52rem)] max-w-3xl'
          )}
        >
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-100 bg-gradient-to-r from-teal-50/90 via-white to-cyan-50/50 px-4 py-3 sm:px-6 sm:py-4">
            <div className="flex min-w-0 items-center gap-2">
              <span className="h-6 w-1 shrink-0 rounded-full bg-teal-500" aria-hidden />
              <h2 className="truncate text-base font-black text-gray-900 sm:text-lg">{title}</h2>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-transparent text-gray-400 transition hover:border-gray-200 hover:bg-gray-50 hover:text-gray-700"
                aria-label="关闭"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5">
            {pick == null && (
              <div className="space-y-5">
                <p className="text-xs font-bold leading-relaxed text-gray-600 sm:text-sm">
                  请选择注册主体类型。产业主体分两步：企业入驻信息填写与免费注册；用水户主体分两步填写资料并注册；其他主体填写基本信息后注册。
                </p>
                <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setPick('industry');
                      setIndustryStep(1);
                    }}
                    className="flex flex-col items-start gap-2 rounded-xl border-2 border-gray-200 bg-white p-4 text-left transition hover:border-teal-400 hover:bg-teal-50/40 sm:p-5"
                  >
                    <Factory className="h-8 w-8 text-teal-600" aria-hidden />
                    <span className="text-sm font-black text-gray-900">产业主体</span>
                    <span className="text-[11px] font-bold leading-snug text-gray-500">企业入驻 → 免费注册</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPick('water');
                      setWaterStep(1);
                    }}
                    className="flex flex-col items-start gap-2 rounded-xl border-2 border-gray-200 bg-white p-4 text-left transition hover:border-teal-400 hover:bg-teal-50/40 sm:p-5"
                  >
                    <Droplets className="h-8 w-8 text-cyan-600" aria-hidden />
                    <span className="text-sm font-black text-gray-900">用水户主体</span>
                    <span className="text-[11px] font-bold leading-snug text-gray-500">填写资料 → 审核通过后登录</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPick('other');
                      setOtherStep(1);
                    }}
                    className="flex flex-col items-start gap-2 rounded-xl border-2 border-gray-200 bg-white p-4 text-left transition hover:border-teal-400 hover:bg-teal-50/40 sm:p-5"
                  >
                    <HelpCircle className="h-8 w-8 text-gray-500" aria-hidden />
                    <span className="text-sm font-black text-gray-900">其他主体</span>
                    <span className="text-[11px] font-bold leading-snug text-gray-500">基本信息 → 免费注册</span>
                  </button>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onLoginOnly();
                    }}
                    className="text-xs font-black text-teal-700 underline-offset-2 hover:underline sm:text-sm"
                  >
                    已有账号？用户登录
                  </button>
                </div>
              </div>
            )}

            {pick === 'industry' && industryStep === 1 && (
              <EnterpriseAuthForm
                role="industry"
                registeredUserIdentity="产业主体"
                lockUserIdentity="产业主体"
                embedded
                hideFooterActions
                wizardShowRequiredHints={industryShowFieldErrors}
                showHeaderAuthShortcuts={false}
                demoAccount={readPortalDemoAccount()}
                hideAccountNameField
                authorizationLetter={industryAuthLetter}
                onAuthorizationLetterChange={setIndustryAuthLetter}
                onContinueEligibilityChange={setIndustryFormReady}
              />
            )}

            {pick === 'industry' && industryStep === 2 && (
              <div className="space-y-4">
                <p className="text-xs font-bold text-gray-500">第二步：免费注册</p>
                <div className="space-y-3">
                  <input
                    inputMode="tel"
                    placeholder="注册手机号"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm font-bold"
                  />
                  <input
                    type="password"
                    autoComplete="new-password"
                    placeholder="设置登录密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm font-bold"
                  />
                  <input
                    type="password"
                    autoComplete="new-password"
                    placeholder="再次输入密码"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm font-bold"
                  />
                  <div className="flex gap-2">
                    <input
                      inputMode="numeric"
                      placeholder="短信验证码"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="h-11 min-w-0 flex-1 rounded-lg border border-gray-200 px-3 text-sm font-bold"
                    />
                    <button
                      type="button"
                      className="shrink-0 rounded-lg bg-teal-600 px-3 text-xs font-black text-white"
                    >
                      获取验证码
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAgreed(!agreed)}
                    className="flex items-center gap-2 text-left"
                  >
                    <span
                      className={cn(
                        'flex h-4 w-4 shrink-0 items-center justify-center rounded border',
                        agreed ? 'border-teal-600 bg-teal-600' : 'border-gray-300 bg-white'
                      )}
                    >
                      {agreed && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                    </span>
                    <span className="text-xs font-bold text-gray-500">我已阅读并同意《用户须知》</span>
                  </button>
                </div>
              </div>
            )}

            {pick === 'water' && waterStep === 1 && (
              <div className="space-y-3">
                <WizardLockedUserIdentityField identity="用水户主体" />
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-1 sm:col-span-2">
                    <WizardRequiredLabel>统一社会信用代码</WizardRequiredLabel>
                    <div className="relative">
                      <input
                        value={waterProfile.creditCode}
                        onChange={(e) => {
                          const raw = e.target.value;
                          setWaterProfile((s) => ({ ...s, creditCode: raw }));
                          const code = normalizeCreditCode(raw);
                          if (code.length === 18) runWaterQccLookup(code);
                        }}
                        onBlur={() => {
                          const code = normalizeCreditCode(waterProfile.creditCode);
                          if (code.length === 18 && !waterProfile.userName.trim()) {
                            runWaterQccLookup(code);
                          }
                        }}
                        placeholder="请输入18位信用代码"
                        className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm font-bold"
                      />
                      {waterQccLoading ? (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-teal-600">
                          查验中…
                        </span>
                      ) : null}
                    </div>
                  </label>
                  <label className="space-y-1 sm:col-span-2">
                    <WizardRequiredLabel>用户名称</WizardRequiredLabel>
                    <input
                      value={waterProfile.userName}
                      onChange={(e) => setWaterProfile((s) => ({ ...s, userName: e.target.value }))}
                      placeholder="输入信用代码后可带出企业名称，请核对修改"
                      className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm font-bold"
                    />
                  </label>
                  <div className="sm:col-span-2">
                    <RegionCascaderField
                      label="所属区域"
                      required
                      region={formatRegionFromParts(
                        waterProfile.regionProvince,
                        waterProfile.regionCity,
                        waterProfile.regionDistrict
                      )}
                      onRegionChange={(region) => {
                        const parts = parseRegionText(region);
                        setWaterProfile((s) => ({ ...s, ...parts }));
                      }}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <EntityTypeCascaderField
                      label="用户类型"
                      required
                      userType={waterProfile.userLegalType}
                      subType={waterProfile.subType}
                      subLevel3={waterProfile.subLevel3}
                      onChange={(parts) =>
                        setWaterProfile((s) => ({
                          ...s,
                          userLegalType: parts.userType as '企业法人' | '非企业法人',
                          subType: parts.subType,
                          subLevel3: parts.subLevel3,
                        }))
                      }
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <IndustryCascaderField
                      label="所属行业"
                      required
                      value={waterProfile.industry}
                      onChange={(industry) => setWaterProfile((s) => ({ ...s, industry }))}
                    />
                  </div>
                  <label className="space-y-1">
                    <WizardRequiredLabel>联系人姓名</WizardRequiredLabel>
                    <input
                      value={waterProfile.contactName}
                      onChange={(e) => setWaterProfile((s) => ({ ...s, contactName: e.target.value }))}
                      className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm font-bold"
                    />
                  </label>
                  <label className="space-y-1">
                    <WizardRequiredLabel>联系人电话</WizardRequiredLabel>
                    <input
                      inputMode="tel"
                      value={waterProfile.contactPhone}
                      onChange={(e) => setWaterProfile((s) => ({ ...s, contactPhone: e.target.value }))}
                      className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm font-bold"
                    />
                  </label>
                </div>
              </div>
            )}

            {pick === 'water' && waterStep === 2 && waterAuditSubmitted && (
              <div className="space-y-4 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-6 text-center">
                <p className="text-base font-black text-amber-900">入驻申请已提交</p>
                <p className="mt-2 text-sm font-bold leading-relaxed text-amber-800/90">
                  您的用水户主体入驻资料已进入审核队列。系统管理员在「企业管理」中审核通过后，方可使用注册手机号登录平台。
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-4 rounded-xl bg-teal-600 px-6 py-2.5 text-sm font-black text-white hover:bg-teal-700"
                >
                  我知道了
                </button>
              </div>
            )}

            {pick === 'water' && waterStep === 2 && !waterAuditSubmitted && (
              <div className="space-y-4">
                <p className="text-xs font-bold text-gray-500">
                  第二步：免费注册（提交后须系统管理员审核通过方可登录）
                </p>
                <input
                  inputMode="tel"
                  placeholder="注册手机号"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm font-bold"
                />
                <input
                  type="password"
                  placeholder="设置登录密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm font-bold"
                />
                <input
                  type="password"
                  placeholder="再次输入密码"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm font-bold"
                />
                <div className="flex gap-2">
                  <input
                    placeholder="短信验证码"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="h-11 min-w-0 flex-1 rounded-lg border border-gray-200 px-3 text-sm font-bold"
                  />
                  <button type="button" className="shrink-0 rounded-lg bg-teal-600 px-3 text-xs font-black text-white">
                    获取验证码
                  </button>
                </div>
                <button type="button" onClick={() => setAgreed(!agreed)} className="flex items-center gap-2 text-left">
                  <span
                    className={cn(
                      'flex h-4 w-4 shrink-0 items-center justify-center rounded border',
                      agreed ? 'border-teal-600 bg-teal-600' : 'border-gray-300 bg-white'
                    )}
                  >
                    {agreed && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                  </span>
                  <span className="text-xs font-bold text-gray-500">我已阅读并同意《用户须知》</span>
                </button>
              </div>
            )}

            {pick === 'other' && otherStep === 1 && (
              <div className="space-y-3">
                <p className="text-xs font-bold text-gray-500">第一步：其他主体基本信息</p>
                <label className="space-y-1">
                  <span className="text-xs font-black text-gray-700">机构 / 组织名称 *</span>
                  <input
                    value={otherProfile.orgName}
                    onChange={(e) => setOtherProfile((s) => ({ ...s, orgName: e.target.value }))}
                    className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm font-bold"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-black text-gray-700">联系人姓名 *</span>
                  <input
                    value={otherProfile.contactName}
                    onChange={(e) => setOtherProfile((s) => ({ ...s, contactName: e.target.value }))}
                    className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm font-bold"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-black text-gray-700">联系电话 *</span>
                  <input
                    inputMode="tel"
                    value={otherProfile.contactPhone}
                    onChange={(e) => setOtherProfile((s) => ({ ...s, contactPhone: e.target.value }))}
                    className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm font-bold"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-black text-gray-700">说明（选填）</span>
                  <textarea
                    value={otherProfile.remark}
                    onChange={(e) => setOtherProfile((s) => ({ ...s, remark: e.target.value }))}
                    rows={3}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-bold"
                  />
                </label>
              </div>
            )}

            {pick === 'other' && otherStep === 2 && (
              <div className="space-y-4">
                <p className="text-xs font-bold text-gray-500">第二步：免费注册</p>
                <input
                  inputMode="tel"
                  placeholder="注册手机号"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm font-bold"
                />
                <input
                  type="password"
                  placeholder="设置登录密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm font-bold"
                />
                <input
                  type="password"
                  placeholder="再次输入密码"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm font-bold"
                />
                <div className="flex gap-2">
                  <input
                    placeholder="短信验证码"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="h-11 min-w-0 flex-1 rounded-lg border border-gray-200 px-3 text-sm font-bold"
                  />
                  <button type="button" className="shrink-0 rounded-lg bg-teal-600 px-3 text-xs font-black text-white">
                    获取验证码
                  </button>
                </div>
                <button type="button" onClick={() => setAgreed(!agreed)} className="flex items-center gap-2 text-left">
                  <span
                    className={cn(
                      'flex h-4 w-4 shrink-0 items-center justify-center rounded border',
                      agreed ? 'border-teal-600 bg-teal-600' : 'border-gray-300 bg-white'
                    )}
                  >
                    {agreed && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                  </span>
                  <span className="text-xs font-bold text-gray-500">我已阅读并同意《用户须知》</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-gray-100 bg-gray-50/80 px-4 py-3 sm:px-6">
            <div className="flex flex-wrap gap-2">
              {pick != null && (
                <button
                  type="button"
                  onClick={() => {
                    if (pick === 'industry' && industryStep > 1) setIndustryStep((s) => s - 1);
                    else if (pick === 'water' && waterStep > 1) setWaterStep((s) => s - 1);
                    else if (pick === 'other' && otherStep > 1) setOtherStep((s) => s - 1);
                    else setPick(null);
                  }}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-black text-gray-700 hover:bg-gray-50 sm:text-sm"
                >
                  上一步
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              {pick === 'industry' && industryStep < 2 && (
                <button
                  type="button"
                  onClick={() => {
                    if (!industryFormReady) {
                      setIndustryShowFieldErrors(true);
                      return;
                    }
                    setIndustryShowFieldErrors(false);
                    setIndustryStep((s) => s + 1);
                  }}
                  className="rounded-lg bg-teal-600 px-4 py-2 text-xs font-black text-white shadow-sm hover:bg-teal-700 sm:text-sm"
                >
                  下一步
                </button>
              )}
              {pick === 'industry' && industryStep === 2 && (
                <button
                  type="button"
                  disabled={!validateIndustryRegister()}
                  onClick={() => submitRegister('产业主体')}
                  className="rounded-lg bg-teal-600 px-4 py-2 text-xs font-black text-white shadow-sm hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm"
                >
                  提交
                </button>
              )}

              {pick === 'water' && waterStep === 1 && (
                <button
                  type="button"
                  disabled={!waterStep1Ok}
                  onClick={() => setWaterStep(2)}
                  className="rounded-lg bg-teal-600 px-4 py-2 text-xs font-black text-white shadow-sm hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm"
                >
                  下一步
                </button>
              )}
              {pick === 'water' && waterStep === 2 && !waterAuditSubmitted && (
                <button
                  type="button"
                  disabled={!validateRegister()}
                  onClick={() => submitRegister('用水户主体')}
                  className="rounded-lg bg-teal-600 px-4 py-2 text-xs font-black text-white shadow-sm hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm"
                >
                  提交入驻申请
                </button>
              )}

              {pick === 'other' && otherStep === 1 && (
                <button
                  type="button"
                  disabled={!otherStep1Ok}
                  onClick={() => setOtherStep(2)}
                  className="rounded-lg bg-teal-600 px-4 py-2 text-xs font-black text-white hover:bg-teal-700 disabled:opacity-40 sm:text-sm"
                >
                  下一步
                </button>
              )}
              {pick === 'other' && otherStep === 2 && (
                <button
                  type="button"
                  onClick={() => submitRegister('其他主体')}
                  className="rounded-lg bg-teal-600 px-4 py-2 text-xs font-black text-white hover:bg-teal-700 sm:text-sm"
                >
                  提交
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
