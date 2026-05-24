import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { X, RefreshCw, Image, UserCheck, ShieldCheck, Plus, Paperclip, Download } from 'lucide-react';
import { cn } from './lib/utils';
import { writePortalAccountUserName } from './portalAccountUserName';
import {
  PORTAL_USER_IDENTITY_OPTIONS,
  type PortalUserIdentity,
  isPortalIndustryLikeUser,
} from './portalUserIdentity';
import { demoAccountDisplayName, type PortalDemoAccount } from './portalDemoAccount';
import { EnterpriseIndustryCascadeFields } from './EnterpriseIndustryCascadeFields';
import {
  EntityTypeCascaderField,
  RegionCascaderField,
} from './SharedCascadeFormFields';
import {
  EMPTY_INDUSTRY_LEVELS,
  industryLegacyLabel,
  type IndustryLevelFields,
} from './enterpriseFormShared';

/** 信用代码去空格，避免 18 位因空格导致无法企查查、无法点「下一步」 */
function normalizeCreditCode(raw: string): string {
  return raw.replace(/\s/g, '');
}

function isValidCreditCode(raw: string): boolean {
  return normalizeCreditCode(raw).length === 18;
}

export type EnterpriseFileAttachment = {
  id: string;
  name: string;
  dataUrl: string;
};

type EnterpriseHonorAttachment = EnterpriseFileAttachment;

const MAX_AWARDS_AND_HONORS = 5;

function readEnterpriseUploadFile(file: File, maxMb = 6): Promise<{ name: string; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf';
    if (!isImage && !isPdf) {
      reject(new Error('请上传图片或 PDF'));
      return;
    }
    if (file.size > maxMb * 1024 * 1024) {
      reject(new Error(`文件大小不超过 ${maxMb}MB`));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve({ name: file.name, dataUrl: String(reader.result ?? '') });
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsDataURL(file);
  });
}

/** 授权委托书空白模板（演示：下载后填写委托人与被委托人信息） */
export function downloadAuthorizationLetterTemplate() {
  const body = [
    '授权委托书',
    '',
    '委托人（单位名称）：________________________',
    '统一社会信用代码：________________________',
    '',
    '受托人（姓名）：________________________',
    '身份证号码：________________________',
    '联系电话：________________________',
    '',
    '兹委托受托人代表本单位办理节水产业服务平台产业主体入驻、信息维护及相关业务事宜。',
    '受托人在上述授权范围内的行为，本单位均予以认可并承担相应法律责任。',
    '',
    '授权期限：自 ______ 年 ____ 月 ____ 日起至 ______ 年 ____ 月 ____ 日止。',
    '',
    '委托人（盖章）：',
    '法定代表人或负责人（签字）：',
    '日期：______ 年 ____ 月 ____ 日',
    '',
    '注：平台入驻时，联系人姓名须与本委托书受托人姓名一致，并上传加盖公章的扫描件。',
  ].join('\n');
  const blob = new Blob(['\ufeff', body], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = '授权委托书模板.txt';
  anchor.click();
  URL.revokeObjectURL(url);
}

/** 产业主体入驻：授权委托书（第 1/2 步共用） */
export function AuthorizationLetterUploadField({
  value,
  onChange,
  error,
  onErrorChange,
  compact = false,
  showTemplateDownload = false,
}: {
  value: EnterpriseFileAttachment | null;
  onChange: (file: EnterpriseFileAttachment | null) => void;
  error?: string | null;
  onErrorChange?: (message: string | null) => void;
  /** 向导第二步等较窄区域 */
  compact?: boolean;
  /** 展示「下载模板」按钮 */
  showTemplateDownload?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const pickFile = useCallback(
    async (fileList: FileList | null) => {
      const file = fileList?.[0];
      if (!file) return;
      onErrorChange?.(null);
      try {
        const { name, dataUrl } = await readEnterpriseUploadFile(file);
        onChange({ id: `auth-letter-${Date.now()}`, name, dataUrl });
      } catch (err) {
        onErrorChange?.(err instanceof Error ? err.message : '授权委托书上传失败');
      }
    },
    [onChange, onErrorChange]
  );

  return (
    <div className="flex h-full min-w-0 flex-col md:col-span-2">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-0.5">
        <label className="text-sm font-black leading-snug text-gray-700">
          授权委托书 <span className="text-red-500">*</span>
        </label>
        {showTemplateDownload ? (
          <button
            type="button"
            onClick={downloadAuthorizationLetterTemplate}
            className="inline-flex items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50 px-2.5 py-1.5 text-[11px] font-black text-teal-800 transition hover:bg-teal-100"
          >
            <Download className="h-3.5 w-3.5 shrink-0" aria-hidden />
            下载模板
          </button>
        ) : null}
      </div>
      {value ? (
        <div
          className={cn(
            'flex flex-1 flex-col justify-center rounded-2xl border border-teal-100 bg-teal-50/40 p-4',
            compact ? 'min-h-[8rem]' : 'min-h-[10rem]'
          )}
        >
          <div className="flex items-center justify-between gap-2 rounded-lg border border-gray-100 bg-white px-3 py-2.5 text-xs font-bold text-gray-700">
            <span className="flex min-w-0 items-center gap-2">
              <Paperclip className="h-4 w-4 shrink-0 text-teal-600" />
              <span className="truncate">{value.name}</span>
            </span>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="shrink-0 text-red-600 hover:underline"
            >
              移除
            </button>
          </div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-3 text-[11px] font-black text-teal-700 hover:underline"
          >
            重新上传
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            'group flex w-full flex-1 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-200 p-5 text-center transition hover:border-teal-300 hover:bg-teal-50/40',
            compact ? 'min-h-[8rem]' : 'min-h-[16rem]'
          )}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-md ring-1 ring-gray-100 transition group-hover:scale-105">
            <Paperclip className="h-6 w-6 text-gray-400 group-hover:text-teal-600" />
          </div>
          <div>
            <p className="font-black text-gray-800">点击上传授权委托书</p>
            <p className="mt-1 text-[11px] font-bold text-gray-400">支持图片或 PDF，单文件不超过 6MB</p>
          </div>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) => {
          void pickFile(e.target.files);
          e.target.value = '';
        }}
      />
      {error ? (
        <p className="mt-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-[11px] font-bold text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export type EnterpriseAuthFormProps = {
  role: 'industry' | 'user';
  registeredUserIdentity?: PortalUserIdentity;
  /** 用户认证内修改用户身份时回写（与注册数据、本地缓存一致） */
  onUserIdentityChange?: (identity: PortalUserIdentity) => void;
  onBack?: () => void;
  embedded?: boolean;
  /** 演示：提交认证申请 */
  onSubmitApplication?: () => void;
  demoAccount: PortalDemoAccount | null;
  /** 为 false 时隐藏右上角「去注册/登录」提示按钮（已登录或已注册后不再提示） */
  showHeaderAuthShortcuts?: boolean;
  /** 一键注册向导等场景：固定为产业主体，隐藏身份下拉 */
  lockUserIdentity?: PortalUserIdentity;
  /** 向导内嵌第一步：隐藏底部「提交认证申请 / 重置」由外层控制步骤 */
  hideFooterActions?: boolean;
  /** 一键注册向导：根据必填项汇总是否允许「下一步」 */
  onContinueEligibilityChange?: (canContinue: boolean) => void;
  /** 产业主体向导第一步等：隐藏「账号名称」字段 */
  hideAccountNameField?: boolean;
  /** 一键注册：点击「下一步」未通过校验时，在必填项下方展示红字提示 */
  wizardShowRequiredHints?: boolean;
  /** 产业主体向导：授权委托书（与第二步共用，受控） */
  authorizationLetter?: EnterpriseFileAttachment | null;
  onAuthorizationLetterChange?: (file: EnterpriseFileAttachment | null) => void;
};

export function EnterpriseAuthForm({
  role: _role,
  registeredUserIdentity = '产业主体',
  onUserIdentityChange,
  onBack,
  embedded = false,
  onSubmitApplication,
  demoAccount,
  showHeaderAuthShortcuts = true,
  lockUserIdentity,
  hideFooterActions = false,
  onContinueEligibilityChange,
  hideAccountNameField = false,
  wizardShowRequiredHints = false,
  authorizationLetter: authorizationLetterProp,
  onAuthorizationLetterChange,
}: EnterpriseAuthFormProps) {
  const isIndustryOnboardingWizard = Boolean(hideAccountNameField && hideFooterActions);
  const [loading, setLoading] = useState(false);
  /** 右上角「去注册/登录」：仅展开提示，不跳转路由、不打开弹窗 */
  const [registerLoginHintOpen, setRegisterLoginHintOpen] = useState(false);

  const [formData, setFormData] = useState<any>({
    creditCode: '',
    name: '',
    region: '',
    regAddress: '',
    actAddress: '',
    enterpriseIntro: '',
    industry: '',
    ...EMPTY_INDUSTRY_LEVELS,
    userIdentity: lockUserIdentity ?? registeredUserIdentity,
    accountName: '',
    contactName: isIndustryOnboardingWizard ? '' : '张孟远',
    contactPhone: '',
    email: '',
    userType: '企业法人',
    subType: '内资企业',
    subLevel3: '国有企业',
    scope: '',
    serviceScope: '',
    coreProducts: '',
    isAboveSize: '是',
    scale: isIndustryOnboardingWizard ? '' : '中型企业',
    isHighTechEnterprise: '否',
    isSpecializedLittleGiant: '否',
    awardsAndHonors: [''] as string[],
  });

  const [honorAttachments, setHonorAttachments] = useState<EnterpriseHonorAttachment[]>([]);
  const [honorUploadError, setHonorUploadError] = useState<string | null>(null);
  const honorInputRef = useRef<HTMLInputElement>(null);

  const [authorizationLetterInternal, setAuthorizationLetterInternal] = useState<EnterpriseFileAttachment | null>(
    null
  );
  const [authorizationLetterError, setAuthorizationLetterError] = useState<string | null>(null);
  const authorizationLetter =
    authorizationLetterProp !== undefined ? authorizationLetterProp : authorizationLetterInternal;
  const setAuthorizationLetter = useCallback(
    (file: EnterpriseFileAttachment | null) => {
      onAuthorizationLetterChange?.(file);
      if (authorizationLetterProp === undefined) setAuthorizationLetterInternal(file);
    },
    [authorizationLetterProp, onAuthorizationLetterChange]
  );

  const requireAuthorizationLetter = isPortalIndustryLikeUser(
    (lockUserIdentity ?? formData.userIdentity) as PortalUserIdentity
  );

  /** 注册表单仅三项；系统管理员仅样式4顶栏可选入身份，需出现在下拉中以免值失配 */
  const identitySelectOptions = useMemo((): PortalUserIdentity[] => {
    const base: PortalUserIdentity[] = [...PORTAL_USER_IDENTITY_OPTIONS];
    if (registeredUserIdentity === '系统管理员' && !base.includes('系统管理员')) {
      base.push('系统管理员');
    }
    return base;
  }, [registeredUserIdentity]);

  useEffect(() => {
    const id = lockUserIdentity ?? registeredUserIdentity;
    setFormData((prev: any) => ({ ...prev, userIdentity: id }));
  }, [registeredUserIdentity, lockUserIdentity]);

  useEffect(() => {
    if (!demoAccount?.phone) return;
    setFormData((prev: any) => ({
      ...prev,
      contactPhone: demoAccount.phone,
      accountName: demoAccountDisplayName(demoAccount.phone),
    }));
  }, [demoAccount?.phone]);

  useEffect(() => {
    const name = String(formData.name ?? '').trim();
    if (!name || !isPortalIndustryLikeUser(formData.userIdentity)) return;
    writePortalAccountUserName(name);
  }, [formData.name, formData.userIdentity]);

  const onContinueEligibilityRef = useRef(onContinueEligibilityChange);
  onContinueEligibilityRef.current = onContinueEligibilityChange;

  const fetchQichachaData = useCallback((rawCode: string) => {
    const code = normalizeCreditCode(rawCode);
    if (code.length !== 18) return;
    setLoading(true);
    setTimeout(() => {
      // 企查查仅带出：信用代码、用户名称、所属区域、注册地址、生产经营范围；其余须手动填写
      setFormData((prev: any) => ({
        ...prev,
        creditCode: code,
        name: '江苏省水利工程科技咨询股份有限公司',
        region: '江苏省南京市',
        regAddress: '南京市上海路5号水利大厦15楼',
        scope:
          '水利工程建设监理；水文学及水资源调查；水库大坝安全分析评价；水资源论证、水环境监测；节约用水、水务精细化管理技术咨询、系统开发；智慧水利系统集成；工程设计与技术咨询服务。',
      }));
      setLoading(false);
    }, 1500);
  }, []);

  const creditCodeNormalized = normalizeCreditCode(String(formData.creditCode ?? ''));

  /** 已满 18 位但未带出企业名时补拉企查查（粘贴、失焦等场景） */
  useEffect(() => {
    if (creditCodeNormalized.length !== 18) return;
    if (String(formData.name ?? '').trim()) return;
    if (loading) return;
    fetchQichachaData(creditCodeNormalized);
  }, [creditCodeNormalized, formData.name, loading, fetchQichachaData]);

  useEffect(() => {
    const notify = onContinueEligibilityRef.current;
    if (!notify) return;
    const wizardEmbedded = Boolean(hideFooterActions);
    const codeOk = isValidCreditCode(String(formData.creditCode ?? ''));
    const nameOk = Boolean(String(formData.name ?? '').trim());
    const contactNameOk = Boolean(String(formData.contactName ?? '').trim());
    const phoneOk = Boolean(String(formData.contactPhone ?? '').trim());
    const authLetterOk = !requireAuthorizationLetter || Boolean(authorizationLetter);
    const introOk = Boolean(String(formData.enterpriseIntro ?? '').trim());
    const ok = wizardEmbedded
      ? codeOk && contactNameOk && introOk && authLetterOk
      : codeOk &&
        nameOk &&
        phoneOk &&
        introOk &&
        Boolean(String(formData.serviceScope ?? '').trim()) &&
        Boolean(String(formData.coreProducts ?? '').trim()) &&
        authLetterOk;
    notify(ok);
  }, [
    formData,
    hideFooterActions,
    creditCodeNormalized,
    requireAuthorizationLetter,
    authorizationLetter,
  ]);

  /** 向导内嵌：与 onContinueEligibilityChange 判定一致，用于各字段下方红字 */
  const wizardFieldErrors = useMemo(() => {
    if (!hideFooterActions || !wizardShowRequiredHints) {
      return {
        creditCode: '',
        contactName: '',
        enterpriseIntro: '',
        authorizationLetter: '',
      };
    }
    return {
      creditCode: isValidCreditCode(String(formData.creditCode ?? ''))
        ? ''
        : '请填写有效的18位统一社会信用代码',
      contactName: String(formData.contactName ?? '').trim() ? '' : '请填写联系人姓名',
      enterpriseIntro: String(formData.enterpriseIntro ?? '').trim() ? '' : '请填写企业简介',
      authorizationLetter:
        requireAuthorizationLetter && !authorizationLetter ? '请上传授权委托书' : '',
    };
  }, [
    hideFooterActions,
    wizardShowRequiredHints,
    formData.creditCode,
    formData.contactName,
    formData.enterpriseIntro,
    requireAuthorizationLetter,
    authorizationLetter,
  ]);

  const handleSubmitApplicationClick = () => {
    onSubmitApplication?.();
  };

  const addHonorAttachments = useCallback(async (fileList: FileList | null) => {
    if (!fileList?.length) return;
    setHonorUploadError(null);
    try {
      const uploaded: EnterpriseHonorAttachment[] = [];
      for (const file of Array.from(fileList)) {
        const { name, dataUrl } = await readEnterpriseUploadFile(file);
        uploaded.push({ id: `honor-${Date.now()}-${name}`, name, dataUrl });
      }
      setHonorAttachments((prev) => [...prev, ...uploaded]);
    } catch (err) {
      setHonorUploadError(err instanceof Error ? err.message : '附件上传失败');
    }
  }, []);

  const showIndustryHonorsBlock = isPortalIndustryLikeUser(formData.userIdentity);

  const honorEntryList: string[] = Array.isArray(formData.awardsAndHonors)
    ? formData.awardsAndHonors
    : [''];

  const honorShopTags = useMemo(
    () => honorEntryList.map((s) => String(s ?? '').trim()).filter(Boolean),
    [honorEntryList]
  );

  const setHonorEntries = useCallback((next: string[]) => {
    setFormData((prev: any) => ({
      ...prev,
      awardsAndHonors: next.length > 0 ? next : [''],
    }));
  }, []);

  const updateHonorEntry = useCallback(
    (index: number, value: string) => {
      setHonorEntries(honorEntryList.map((item, i) => (i === index ? value : item)));
    },
    [honorEntryList, setHonorEntries]
  );

  const addHonorEntry = useCallback(() => {
    if (honorEntryList.length >= MAX_AWARDS_AND_HONORS) return;
    setHonorEntries([...honorEntryList, '']);
  }, [honorEntryList, setHonorEntries]);

  const removeHonorEntry = useCallback(
    (index: number) => {
      if (honorEntryList.length <= 1) return;
      setHonorEntries(honorEntryList.filter((_, i) => i !== index));
    },
    [honorEntryList, setHonorEntries]
  );

  return (
    <div className={cn(embedded ? 'w-full' : 'mx-auto max-w-5xl py-8 sm:py-10')}>
      <div
        className={cn(
          'overflow-hidden bg-white',
          embedded ? '' : 'rounded-2xl border border-gray-200/90 shadow-lg shadow-teal-900/8'
        )}
      >
        {!embedded && (
          <div className="flex items-start justify-between gap-3 border-b border-gray-100 bg-gradient-to-r from-teal-50/90 via-white to-cyan-50/50 px-6 py-5 sm:gap-4 sm:px-8 sm:py-6">
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
                <span className="h-8 w-1 shrink-0 rounded-full bg-teal-500" aria-hidden />
                <h2 className="text-xl font-black text-gray-900 sm:text-2xl">企业入驻</h2>
              </div>
              {showHeaderAuthShortcuts && registerLoginHintOpen ? (
                <p
                  role="status"
                  className="rounded-xl border border-teal-200/80 bg-teal-50/80 px-3 py-2.5 text-[11px] font-bold leading-relaxed text-teal-900 sm:px-4 sm:text-xs"
                >
                  提示：请使用页面<strong className="font-black">顶部</strong>
                  快捷栏中的「免费注册」或「用户登录」完成账号；本按钮仅作说明，不会跳转其它页面或打开弹窗。完成后可回到本页继续填写认证资料。
                </p>
              ) : null}
              <p className="text-xs font-bold text-gray-500 sm:text-sm">
                请填写以下信息完成
                {isPortalIndustryLikeUser(formData.userIdentity)
                  ? '产业企业'
                  : formData.userIdentity === '用水户主体'
                    ? '用水户'
                    : '其他主体'}
                认证；联系人及账号信息可编辑，修改后仍以本页为准（演示）
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
              {showHeaderAuthShortcuts ? (
                <button
                  type="button"
                  onClick={() => setRegisterLoginHintOpen((o) => !o)}
                  aria-expanded={registerLoginHintOpen}
                  className="inline-flex items-center justify-center rounded-xl border-2 border-teal-500/50 bg-white px-3 py-2 text-xs font-black text-teal-800 shadow-sm transition hover:border-teal-600 hover:bg-teal-50 active:scale-[0.98] sm:px-4 sm:py-2.5 sm:text-sm"
                >
                  去注册/登录
                </button>
              ) : null}
              {onBack ? (
                <button
                  type="button"
                  onClick={onBack}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-400 transition hover:border-teal-200 hover:text-teal-600"
                  aria-label="关闭"
                >
                  <X className="h-5 w-5" />
                </button>
              ) : null}
            </div>
          </div>
        )}

        <div className={cn('space-y-8 sm:space-y-10', embedded ? '' : 'p-6 sm:p-8 lg:p-10')}>
          {/* Main Identity Info */}
          <section className="space-y-6 sm:space-y-8">
            <div className="flex flex-wrap items-center gap-3 border-l-4 border-teal-500 pl-4">
              <h3 className="text-base font-black text-gray-900 sm:text-lg">主体身份信息</h3>
              <span className="rounded-full border border-teal-100 bg-teal-50 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-teal-700">
                必填项
              </span>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 lg:gap-8">
              <div className="space-y-2 md:col-span-2">
                <label className="flex flex-wrap items-center gap-2 text-sm font-black text-gray-700">
                  用户身份 <span className="text-red-500">*</span>
                  {!lockUserIdentity ? (
                    <span className="text-[10px] font-bold text-gray-400">注册默认可在此修改</span>
                  ) : (
                    <span className="text-[10px] font-bold text-gray-400">本流程固定为产业主体</span>
                  )}
                </label>
                {lockUserIdentity ? (
                  <div className="flex h-12 w-full items-center rounded-xl border border-teal-100 bg-teal-50/80 px-4 text-sm font-black text-teal-900 sm:h-14 sm:px-5">
                    {lockUserIdentity}
                  </div>
                ) : (
                  <select
                    value={formData.userIdentity}
                    onChange={(e) => {
                      const v = e.target.value as PortalUserIdentity;
                      setFormData({ ...formData, userIdentity: v });
                      onUserIdentityChange?.(v);
                    }}
                    className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-bold text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 sm:h-14 sm:px-5"
                  >
                    {identitySelectOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Credit Code */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-black text-gray-700">
                  统一社会信用代码 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.creditCode}
                    onChange={(e) => {
                      const raw = e.target.value;
                      setFormData((prev: any) => ({ ...prev, creditCode: raw }));
                      const code = normalizeCreditCode(raw);
                      if (code.length === 18) fetchQichachaData(code);
                    }}
                    onBlur={() => {
                      const code = normalizeCreditCode(String(formData.creditCode ?? ''));
                      if (code.length === 18 && !String(formData.name ?? '').trim()) {
                        fetchQichachaData(code);
                      }
                    }}
                    placeholder="请输入18位信用代码"
                    className={cn(
                      'h-12 w-full rounded-xl border bg-white px-4 text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 sm:h-14 sm:px-5',
                      wizardFieldErrors.creditCode
                        ? 'border-red-300 focus:border-red-400 focus:ring-red-500/20'
                        : 'border-gray-200 focus:border-teal-500 focus:ring-teal-500/20'
                    )}
                  />
                  {loading && (
                    <div className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center gap-2 text-xs font-bold text-teal-600">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
                      企查查查验中…
                    </div>
                  )}
                </div>
                {wizardFieldErrors.creditCode ? (
                  <p className="text-xs font-bold text-red-600">{wizardFieldErrors.creditCode}</p>
                ) : null}
              </div>

              {/* Name：企查查预填，须人工核对 */}
              <div className="space-y-2">
                <label className="text-sm font-black text-gray-700">用户名称</label>
                <input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="输入信用代码后可由企查查预填，请核对修改"
                  className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 sm:h-14 sm:px-5"
                />
              </div>

              <RegionCascaderField
                label="所属区域"
                required={isIndustryOnboardingWizard}
                region={formData.region}
                onRegionChange={(region) => setFormData({ ...formData, region })}
              />

              <div className="space-y-2">
                <label className="text-sm font-black text-gray-700">注册地址</label>
                <input
                  value={formData.regAddress}
                  onChange={(e) => setFormData({ ...formData, regAddress: e.target.value })}
                  placeholder="输入信用代码后可由企查查预填，请核对修改"
                  className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 sm:h-14 sm:px-5"
                />
              </div>
            </div>

            {/* Actual Address */}
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-700">
                实际地址
                {isIndustryOnboardingWizard ? (
                  <span className="ml-1 text-[10px] font-bold text-gray-400">须手动填写</span>
                ) : null}
              </label>
              <input
                value={formData.actAddress}
                onChange={(e) => setFormData({ ...formData, actAddress: e.target.value })}
                placeholder="请手动填写实际经营地址"
                className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 sm:h-14 sm:px-5"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-black text-gray-700">
                企业简介 <span className="text-red-500">*</span>
                {isIndustryOnboardingWizard ? (
                  <span className="text-[10px] font-bold text-gray-400">须手动填写</span>
                ) : null}
              </label>
              <textarea
                value={formData.enterpriseIntro}
                onChange={(e) => setFormData({ ...formData, enterpriseIntro: e.target.value })}
                rows={4}
                placeholder="请简要介绍企业定位、主营业务与核心优势，将展示于供方主页"
                className={cn(
                  'w-full resize-y rounded-xl border bg-white px-4 py-3 text-sm font-medium leading-relaxed text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 sm:px-5',
                  wizardFieldErrors.enterpriseIntro
                    ? 'border-red-300 focus:border-red-400 focus:ring-red-500/20'
                    : 'border-gray-200 focus:border-teal-500 focus:ring-teal-500/20'
                )}
              />
              {wizardFieldErrors.enterpriseIntro ? (
                <p className="text-xs font-bold text-red-600">{wizardFieldErrors.enterpriseIntro}</p>
              ) : null}
            </div>
          </section>

          {/* Contact Info */}
          <section className="space-y-6 sm:space-y-8">
            <div className="flex items-center gap-3 border-l-4 border-cyan-500 pl-4">
              <h3 className="text-base font-black text-gray-900 sm:text-lg">
                {hideAccountNameField ? '联系人信息' : '联系人及账号信息'}
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 lg:gap-8">
              {!hideAccountNameField ? (
                <div className="space-y-2">
                  <label className="text-sm font-black text-gray-700">账号名称</label>
                  <input
                    value={formData.accountName}
                    onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                    placeholder="可填写或修改登录账号名"
                    className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 sm:h-14 sm:px-5"
                  />
                </div>
              ) : null}
              <div className="space-y-2">
                <label className="text-sm font-black text-gray-700">
                  联系人姓名
                  {isIndustryOnboardingWizard ? <span className="text-red-500"> *</span> : null}
                </label>
                <input
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  placeholder={
                    isIndustryOnboardingWizard
                      ? '联系人姓名须与授权委托书中委托人员姓名一致'
                      : '联系人姓名'
                  }
                  className={cn(
                    'h-12 w-full rounded-xl border bg-white px-4 text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 sm:h-14 sm:px-5',
                    wizardFieldErrors.contactName
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-500/20'
                      : 'border-gray-200 focus:border-teal-500 focus:ring-teal-500/20'
                  )}
                />
                {wizardFieldErrors.contactName ? (
                  <p className="text-xs font-bold text-red-600">{wizardFieldErrors.contactName}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-gray-700">联系电话</label>
                <input
                  type="text"
                  inputMode="tel"
                  autoComplete="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  placeholder={isIndustryOnboardingWizard ? '' : '注册或登录后将自动带出，可修改'}
                  className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 sm:h-14 sm:px-5"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-gray-700">
                  联系邮箱 <span className="text-[10px] font-bold text-gray-400">选填</span>
                </label>
                <input
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="选填，用于接收审核与业务通知"
                  className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 sm:h-14 sm:px-5"
                />
              </div>
            </div>
          </section>

          {/* Detailed Classification */}
          <section className="space-y-6 sm:space-y-8">
            <div className="flex items-center gap-3 border-l-4 border-teal-600 pl-4">
              <h3 className="text-base font-black text-gray-900 sm:text-lg">业务信息</h3>
            </div>

            <EntityTypeCascaderField
              label="用户类型"
              required
              userType={formData.userType}
              subType={formData.subType}
              subLevel3={formData.subLevel3}
              onChange={(next) => setFormData({ ...formData, ...next })}
            />

            <EnterpriseIndustryCascadeFields
              required={isIndustryOnboardingWizard}
              value={{
                industryL1Code: formData.industryL1Code ?? '',
                industryL1Name: formData.industryL1Name ?? '',
                industryL2Code: formData.industryL2Code ?? '',
                industryL2Name: formData.industryL2Name ?? '',
                industryL3Code: formData.industryL3Code ?? '',
                industryL3Name: formData.industryL3Name ?? '',
                industryL4Code: formData.industryL4Code ?? '',
                industryL4Name: formData.industryL4Name ?? '',
              }}
              onChange={(levels: IndustryLevelFields) => {
                setFormData((prev: any) => ({
                  ...prev,
                  ...levels,
                  industry: industryLegacyLabel(levels),
                }));
              }}
            />

            {formData.userType === '企业法人' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-6 border-t border-gray-100 pt-6 sm:space-y-8 sm:pt-8"
              >
                <div className="space-y-2">
                  <label className="flex flex-wrap items-center gap-2 text-sm font-black text-gray-700">
                    生产经营范围
                    <span className="flex items-center gap-1 rounded-full border border-teal-100 bg-teal-50 px-2 py-0.5 text-[10px] font-black text-teal-700">
                      <RefreshCw className="h-2.5 w-2.5 animate-spin-slow" />
                      企查查可预填，请核对编辑
                    </span>
                  </label>
                  <textarea
                    value={formData.scope}
                    onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                    placeholder="输入信用代码后企查查可预填工商范围，请核对、补充或修改"
                    className="h-32 w-full resize-none rounded-xl border border-gray-200 bg-white p-4 text-sm font-bold text-gray-900 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 sm:p-5"
                  />
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 lg:gap-8">
                  <div className="space-y-2">
                    <label className="px-0.5 text-sm font-black text-gray-700">
                      服务范围、业务范围 <span className="text-red-500">*</span>
                      <span className="ml-1 text-[10px] font-bold text-gray-400">须手动填写</span>
                    </label>
                    <textarea
                      value={formData.serviceScope}
                      onChange={(e) => setFormData({ ...formData, serviceScope: e.target.value })}
                      placeholder="请输入主要业务覆盖范围…"
                      className="h-32 w-full resize-none rounded-xl border border-gray-200 bg-white p-4 text-sm font-bold text-gray-900 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 sm:p-5"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="px-0.5 text-sm font-black text-gray-700">
                      核心产品或方案 <span className="text-red-500">*</span>
                      <span className="ml-1 text-[10px] font-bold text-gray-400">须手动填写</span>
                    </label>
                    <textarea
                      value={formData.coreProducts}
                      onChange={(e) => setFormData({ ...formData, coreProducts: e.target.value })}
                      placeholder="请输入最具竞争力的核心产品或解决方案…"
                      className="h-32 w-full resize-none rounded-xl border border-gray-200 bg-white p-4 text-sm font-bold text-gray-900 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 sm:p-5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 lg:gap-8">
                  <div className="space-y-2">
                    <label className="text-sm font-black text-gray-700">是否规上企业</label>
                    <select
                      value={formData.isAboveSize}
                      onChange={(e) => setFormData({ ...formData, isAboveSize: e.target.value })}
                      className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-bold text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 sm:h-14 sm:px-5"
                    >
                      <option value="是">是</option>
                      <option value="否">否</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="px-0.5 text-sm font-black text-gray-700">企业规模</label>
                    <input
                      value={formData.scale}
                      onChange={(e) => setFormData({ ...formData, scale: e.target.value })}
                      placeholder="请手动填写企业规模"
                      className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 sm:h-14 sm:px-5"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 lg:gap-8">
                  <div className="space-y-2">
                    <label className="text-sm font-black text-gray-700">是否高新技术企业</label>
                    <select
                      value={formData.isHighTechEnterprise}
                      onChange={(e) => setFormData({ ...formData, isHighTechEnterprise: e.target.value })}
                      className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-bold text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 sm:h-14 sm:px-5"
                    >
                      <option value="是">是</option>
                      <option value="否">否</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-gray-700">是否"专精特新"小巨人企业</label>
                    <select
                      value={formData.isSpecializedLittleGiant}
                      onChange={(e) => setFormData({ ...formData, isSpecializedLittleGiant: e.target.value })}
                      className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-bold text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 sm:h-14 sm:px-5"
                    >
                      <option value="是">是</option>
                      <option value="否">否</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {showIndustryHonorsBlock ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4 border-t border-gray-100 pt-6 sm:space-y-5 sm:pt-8"
              >
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="px-0.5 text-sm font-black text-gray-700">已获奖项/主要荣誉</label>
                    <p className="px-0.5 text-[11px] font-bold leading-relaxed text-gray-400">
                      一个输入框填写一项荣誉，最多 {MAX_AWARDS_AND_HONORS} 项，填写后生成店铺标签展示。
                    </p>
                  </div>
                  <div className="space-y-2">
                    {honorEntryList.map((entry, index) => (
                      <div key={`honor-entry-${index}`} className="flex gap-2">
                        <input
                          value={entry}
                          onChange={(e) => updateHonorEntry(index, e.target.value)}
                          placeholder={`荣誉 ${index + 1}，如：国家高新技术企业`}
                          className="h-12 min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-4 text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 sm:h-14"
                        />
                        {honorEntryList.length > 1 ? (
                          <button
                            type="button"
                            onClick={() => removeHonorEntry(index)}
                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 sm:h-14"
                            aria-label={`移除荣誉 ${index + 1}`}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        ) : null}
                      </div>
                    ))}
                  </div>
                  {honorEntryList.length < MAX_AWARDS_AND_HONORS ? (
                    <button
                      type="button"
                      onClick={addHonorEntry}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-teal-200 bg-teal-50/50 px-3 py-2 text-xs font-black text-teal-800 transition hover:border-teal-400 hover:bg-teal-50"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      新增一项荣誉
                    </button>
                  ) : (
                    <p className="text-[10px] font-bold text-gray-400">已达 {MAX_AWARDS_AND_HONORS} 项上限</p>
                  )}
                  {honorShopTags.length > 0 ? (
                    <div className="rounded-xl border border-teal-100 bg-teal-50/40 p-3 sm:p-4">
                      <p className="mb-2 text-[10px] font-black uppercase tracking-wide text-teal-800/80">
                        店铺标签预览
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {honorShopTags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex max-w-full items-center rounded-full border border-teal-200/80 bg-white px-2.5 py-1 text-[11px] font-black leading-snug text-teal-900 shadow-sm"
                          >
                            <span className="truncate">{tag}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
                <div className="space-y-3">
                  <label className="flex flex-wrap items-center gap-2 px-0.5 text-sm font-black text-gray-700">
                    附件资料
                    <span className="text-[10px] font-bold text-gray-400">奖项证书、荣誉证书、认定文件等</span>
                  </label>
                  <input
                    ref={honorInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      void addHonorAttachments(e.target.files);
                      e.target.value = '';
                    }}
                  />
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => honorInputRef.current?.click()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        honorInputRef.current?.click();
                      }
                    }}
                    className="group flex min-h-[10rem] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center transition hover:border-teal-300 hover:bg-teal-50/40"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-md ring-1 ring-gray-100 transition group-hover:scale-105">
                      <Paperclip className="h-6 w-6 text-gray-400 group-hover:text-teal-600" />
                    </div>
                    <p className="font-black text-gray-800">点击上传附件资料</p>
                    <p className="text-[11px] font-bold leading-relaxed text-gray-400">
                      支持 JPG、PNG、PDF，单文件不超过 6MB，可多选
                    </p>
                  </div>
                  {honorUploadError ? (
                    <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-[11px] font-bold text-red-700">
                      {honorUploadError}
                    </p>
                  ) : null}
                  {honorAttachments.length > 0 ? (
                    <ul className="space-y-2 rounded-xl border border-gray-100 bg-gray-50/80 p-3">
                      {honorAttachments.map((f) => (
                        <li
                          key={f.id}
                          className="flex items-center justify-between gap-2 rounded-lg border border-gray-100 bg-white px-3 py-2 text-xs font-bold text-gray-700"
                        >
                          <span className="min-w-0 truncate">{f.name}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setHonorAttachments((prev) => prev.filter((item) => item.id !== f.id))
                            }
                            className="shrink-0 text-red-600 hover:underline"
                          >
                            移除
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </motion.div>
            ) : null}
          </section>

          {/* Attachments */}
          <section className="space-y-6 sm:space-y-8">
            <div className="flex items-center gap-3 border-l-4 border-gray-800 pl-4">
              <h3 className="text-base font-black text-gray-900 sm:text-lg">授权与证明文件</h3>
            </div>
            <div
              className={cn(
                'grid grid-cols-1 gap-6',
                formData.userIdentity === '其他主体' ? 'w-full' : 'md:grid-cols-2 md:gap-8 lg:gap-10'
              )}
            >
              {formData.userIdentity !== '其他主体' && (
                <div className="flex h-full min-w-0 flex-col">
                  <label className="mb-3 px-0.5 text-sm font-black leading-snug text-gray-700">
                    统一社会信用代码证照（营业执照、法人证书等） <span className="text-red-500">*</span>
                  </label>
                  <div className="group flex min-h-[16rem] flex-1 cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center transition hover:border-teal-300 hover:bg-teal-50/40">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white shadow-md ring-1 ring-gray-100 transition group-hover:scale-105">
                      <Image className="h-7 w-7 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-black text-gray-800">上传证照扫描件</p>
                      <p className="mt-1 text-[11px] font-bold text-gray-400">
                        请确保内容清晰可见
                        <br />
                        且在有效期内
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex h-full min-w-0 flex-col">
                <label className="mb-3 px-0.5 text-sm font-black text-gray-700">
                  {requireAuthorizationLetter ? '委托人身份证' : '联系人身份证'}{' '}
                  <span className="text-red-500">*</span>
                  {formData.userIdentity === '其他主体' && (
                    <span className="ml-2 text-[10px] font-bold text-gray-400">（人像面与国徽面并排上传）</span>
                  )}
                </label>
                <div
                  className={cn(
                    'grid min-h-0 flex-1 gap-3',
                    formData.userIdentity === '其他主体' ? 'grid-cols-1 sm:grid-cols-2 sm:gap-4' : 'grid-cols-1'
                  )}
                >
                  <div
                    className={cn(
                      'group relative flex cursor-pointer rounded-2xl border-2 border-dashed border-gray-200 transition hover:border-teal-400 hover:bg-teal-50/30',
                      formData.userIdentity === '其他主体'
                        ? 'min-h-[11rem] flex-col items-center justify-center gap-3 p-5 text-center'
                        : 'items-center gap-4 p-4'
                    )}
                  >
                    <div
                      className={cn(
                        'flex shrink-0 items-center justify-center rounded-xl bg-white shadow-md ring-1 ring-gray-100 transition group-hover:scale-105',
                        formData.userIdentity === '其他主体' ? 'h-14 w-14' : 'h-12 w-12'
                      )}
                    >
                      <UserCheck
                        className={cn(
                          'text-gray-400 group-hover:text-teal-600',
                          formData.userIdentity === '其他主体' ? 'h-7 w-7' : 'h-6 w-6'
                        )}
                      />
                    </div>
                    <div className={cn('min-w-0', formData.userIdentity === '其他主体' ? 'text-center' : 'text-left')}>
                      <p className="text-sm font-black text-gray-800">上传人像面</p>
                      <p className="text-[11px] font-bold text-gray-400">
                        {requireAuthorizationLetter ? '委托人身份证正面' : '身份证正面照片'}
                      </p>
                    </div>
                    <div
                      className={cn(
                        'transition-opacity group-hover:opacity-100',
                        formData.userIdentity === '其他主体' ? 'mt-1 opacity-80' : 'absolute right-4 opacity-0'
                      )}
                    >
                      <Plus className="h-5 w-5 text-teal-500" />
                    </div>
                  </div>

                  <div
                    className={cn(
                      'group relative flex cursor-pointer rounded-2xl border-2 border-dashed border-gray-200 transition hover:border-cyan-400 hover:bg-cyan-50/30',
                      formData.userIdentity === '其他主体'
                        ? 'min-h-[11rem] flex-col items-center justify-center gap-3 p-5 text-center'
                        : 'items-center gap-4 p-4'
                    )}
                  >
                    <div
                      className={cn(
                        'flex shrink-0 items-center justify-center rounded-xl bg-white shadow-md ring-1 ring-gray-100 transition group-hover:scale-105',
                        formData.userIdentity === '其他主体' ? 'h-14 w-14' : 'h-12 w-12'
                      )}
                    >
                      <ShieldCheck
                        className={cn(
                          'text-gray-400 group-hover:text-cyan-600',
                          formData.userIdentity === '其他主体' ? 'h-7 w-7' : 'h-6 w-6'
                        )}
                      />
                    </div>
                    <div className={cn('min-w-0', formData.userIdentity === '其他主体' ? 'text-center' : 'text-left')}>
                      <p className="text-sm font-black text-gray-800">上传国徽面</p>
                      <p className="text-[11px] font-bold text-gray-400">
                        {requireAuthorizationLetter ? '委托人身份证背面' : '身份证背面照片'}
                      </p>
                    </div>
                    <div
                      className={cn(
                        'transition-opacity group-hover:opacity-100',
                        formData.userIdentity === '其他主体' ? 'mt-1 opacity-80' : 'absolute right-4 opacity-0'
                      )}
                    >
                      <Plus className="h-5 w-5 text-cyan-500" />
                    </div>
                  </div>
                </div>
              </div>

              {requireAuthorizationLetter ? (
                <AuthorizationLetterUploadField
                  value={authorizationLetter}
                  onChange={setAuthorizationLetter}
                  error={authorizationLetterError ?? (wizardFieldErrors.authorizationLetter || null)}
                  onErrorChange={setAuthorizationLetterError}
                  showTemplateDownload
                />
              ) : null}
            </div>
          </section>

          {!hideFooterActions && (
            <div className="flex flex-col gap-3 border-t border-gray-100 pt-8 sm:flex-row sm:gap-4">
              <button
                type="button"
                onClick={() => handleSubmitApplicationClick()}
                className="flex h-12 flex-1 items-center justify-center rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 text-sm font-black text-white shadow-md shadow-teal-600/25 ring-1 ring-teal-500/30 transition hover:from-teal-700 hover:to-teal-600 active:scale-[0.98] sm:h-14 sm:text-base"
              >
                提交认证申请
              </button>
              <button
                type="button"
                className="h-12 shrink-0 rounded-xl border border-gray-200 bg-white px-6 text-sm font-black text-gray-600 transition hover:border-teal-200 hover:bg-teal-50/50 hover:text-teal-800 sm:h-14"
              >
                重置
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
