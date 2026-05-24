import React, { useMemo, useRef, useState } from 'react';
import { Image, Paperclip, Plus, UserCheck, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from './lib/utils';
import { EnterpriseIndustryCascadeFields } from './EnterpriseIndustryCascadeFields';
import { EntityTypeCascaderField } from './SharedCascadeFormFields';
import {
  buildEnterpriseAuditApplication,
  type WorkbenchApplicationRow,
  type WorkbenchEnterpriseAuditAction,
} from './workbenchApplications';
import {
  enterpriseAuditStatusClass,
  enterpriseToForm,
  formatAwardsAndHonorsLines,
  type WorkbenchEnterpriseFormState,
  type WorkbenchEnterpriseRecord,
  type WorkbenchHonorFile,
} from './workbenchEnterprise';
import { writePortalAccountUserName } from './portalAccountUserName';
import {
  getOrCreateSelfEnterprise,
  upsertWorkbenchEnterprise,
  WORKBENCH_SELF_ENTERPRISE_ID,
} from './workbenchEnterpriseStore';

const YES_NO_OPTIONS = ['是', '否'] as const;
const MAX_AWARDS_AND_HONORS = 8;

function readUploadFile(file: File, maxMb = 6): Promise<{ name: string; dataUrl: string }> {
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

function SectionTitle({ title, accent = 'teal' }: { title: string; accent?: 'sky' | 'teal' | 'gray' }) {
  const borderClass =
    accent === 'gray' ? 'border-gray-800' : accent === 'sky' ? 'border-sky-600' : 'border-teal-600';
  const textClass = accent === 'sky' ? 'text-sky-700' : 'text-gray-900';
  return (
    <motion.div className={cn('mb-4 flex items-center gap-3 border-l-4 pl-4', borderClass)}>
      <h3 className={cn('text-sm font-black sm:text-base', textClass)}>{title}</h3>
    </motion.div>
  );
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <span className="text-xs font-black text-gray-700 sm:text-sm">
      {children}
      {required ? <span className="text-red-500"> *</span> : null}
    </span>
  );
}

const inputBase =
  'w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20';
const inputEditable = cn(inputBase, 'bg-white');
const inputReadonly = cn(inputBase, 'cursor-default bg-gray-50 text-gray-800');

const selectClass = cn(inputEditable, 'h-12 sm:h-14');

function FileUploadZone({
  label,
  hint,
  file,
  onPick,
  onClear,
  icon: Icon = Image,
}: {
  label: string;
  hint: string;
  file: WorkbenchHonorFile | null;
  onPick: () => void;
  onClear: () => void;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <motion.div className="flex h-full min-w-0 flex-col">
      {label ? (
        <label className="mb-3 px-0.5 text-sm font-black leading-snug text-gray-700">{label}</label>
      ) : null}
      {file ? (
        <motion.div className="flex min-h-[10rem] flex-1 flex-col justify-between rounded-2xl border border-teal-200 bg-teal-50/30 p-4">
          <p className="truncate text-xs font-bold text-gray-800">{file.name}</p>
          <button
            type="button"
            onClick={onClear}
            className="mt-3 self-start text-xs font-black text-red-600 hover:underline"
          >
            移除并重新上传
          </button>
        </motion.div>
      ) : (
        <motion.button
          type="button"
          onClick={onPick}
          className="group flex min-h-[10rem] flex-1 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center transition hover:border-teal-300 hover:bg-teal-50/40"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-md ring-1 ring-gray-100 transition group-hover:scale-105">
            <Icon className="h-6 w-6 text-gray-400 group-hover:text-teal-600" />
          </div>
          <p className="font-black text-gray-800">{hint}</p>
        </motion.button>
      )}
    </motion.div>
  );
}

export function WorkbenchEnterpriseAdminPanel({
  onAuditApplication,
}: {
  onAuditApplication: (row: WorkbenchApplicationRow) => void;
}) {
  const [enterprise, setEnterprise] = useState<WorkbenchEnterpriseRecord>(() => {
    const ent = getOrCreateSelfEnterprise();
    if (ent.name.trim()) writePortalAccountUserName(ent.name);
    return ent;
  });
  const [form, setForm] = useState<WorkbenchEnterpriseFormState>(() => enterpriseToForm(enterprise));
  const [formError, setFormError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const honorInputRef = useRef<HTMLInputElement>(null);
  const licenseInputRef = useRef<HTMLInputElement>(null);
  const idFrontInputRef = useRef<HTMLInputElement>(null);
  const idBackInputRef = useRef<HTMLInputElement>(null);
  const authLetterInputRef = useRef<HTMLInputElement>(null);

  const honorEntries = useMemo(() => {
    const lines = formatAwardsAndHonorsLines(form.awardsAndHonors);
    return lines.length > 0 ? lines : [''];
  }, [form.awardsAndHonors]);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3200);
  };

  const submitAudit = (name: string, action: WorkbenchEnterpriseAuditAction) => {
    onAuditApplication(buildEnterpriseAuditApplication(name, action));
    showToast('已提交「企业信息」审核，可在「我的申请」查看进度');
  };

  const setHonorEntries = (entries: string[]) => {
    const trimmed = entries.map((s) => s.trim()).filter(Boolean);
    setForm((f) => ({ ...f, awardsAndHonors: trimmed.join('\n') }));
  };

  const validateForm = (): string | null => {
    if (!form.actAddress.trim()) return '请填写实际地址';
    if (!form.enterpriseIntro.trim()) return '请填写企业简介';
    if (!form.industryL1Code || !form.industryL4Code) return '请完整选择所属行业（门类至小类）';
    if (form.userType === '企业法人' && !form.coreProducts.trim()) return '请填写核心产品或方案';
    return null;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateForm();
    if (err) {
      setFormError(err);
      return;
    }
    setFormError(null);
    const payload: WorkbenchEnterpriseRecord = {
      ...enterprise,
      auditStatus: '审核中',
      ...form,
      actAddress: form.actAddress.trim(),
      enterpriseIntro: form.enterpriseIntro.trim(),
      coreProducts: form.coreProducts.trim(),
      awardsAndHonors: form.awardsAndHonors.trim(),
    };
    const saved = { ...payload, id: WORKBENCH_SELF_ENTERPRISE_ID };
    upsertWorkbenchEnterprise(saved);
    setEnterprise(saved);
    setForm(enterpriseToForm(saved));
    submitAudit(saved.name, '编辑');
  };

  const uploadSingle = async (
    files: FileList | null,
    field: 'businessLicense' | 'idCardFront' | 'idCardBack' | 'authorizationLetter'
  ) => {
    const file = files?.[0];
    if (!file) return;
    setFormError(null);
    try {
      const { name, dataUrl } = await readUploadFile(file);
      setForm((f) => ({
        ...f,
        [field]: { id: `${field}-${Date.now()}`, name, dataUrl },
      }));
    } catch (err) {
      setFormError(err instanceof Error ? err.message : '附件上传失败');
    }
  };

  const addHonorFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setFormError(null);
    try {
      const uploaded: WorkbenchHonorFile[] = [];
      for (const file of Array.from(files)) {
        const { name, dataUrl } = await readUploadFile(file);
        uploaded.push({ id: `honor-${Date.now()}-${name}`, name, dataUrl });
      }
      setForm((f) => ({ ...f, honorFiles: [...f.honorFiles, ...uploaded] }));
    } catch (err) {
      setFormError(err instanceof Error ? err.message : '附件上传失败');
    }
  };

  return (
    <div className="space-y-4">
      <motion.div className="flex flex-wrap items-center justify-end gap-3">
        <span
          className={cn(
            'rounded-full border px-2.5 py-0.5 text-[10px] font-black',
            enterpriseAuditStatusClass(enterprise.auditStatus)
          )}
        >
          {enterprise.auditStatus === '已通过' ? '信息已审核' : enterprise.auditStatus}
        </span>
      </motion.div>

      <form onSubmit={handleFormSubmit} className="space-y-6 sm:space-y-8">
        {/* 主体身份信息 */}
        <section className="rounded-xl border border-gray-200/90 bg-white p-4 shadow-sm sm:p-6">
          <SectionTitle title="主体身份信息" accent="teal" />
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
            <label className="block space-y-2">
              <FieldLabel>用户身份</FieldLabel>
              <input className={inputReadonly} readOnly value={form.userIdentity} />
            </label>
            <label className="block space-y-2 md:col-span-2">
              <FieldLabel>统一社会信用代码</FieldLabel>
              <input className={inputReadonly} readOnly value={form.creditCode} />
            </label>
            <label className="block space-y-2 md:col-span-2">
              <FieldLabel>用户名称</FieldLabel>
              <input className={inputReadonly} readOnly value={form.name} />
            </label>
            <label className="block space-y-2">
              <FieldLabel>所属区域</FieldLabel>
              <input className={inputReadonly} readOnly value={form.region} />
            </label>
            <label className="block space-y-2 md:col-span-2">
              <FieldLabel>注册地址</FieldLabel>
              <input className={inputReadonly} readOnly value={form.regAddress} />
            </label>
            <label className="block space-y-2 md:col-span-2">
              <FieldLabel required>实际地址</FieldLabel>
              <input
                className={inputEditable}
                value={form.actAddress}
                onChange={(e) => setForm((f) => ({ ...f, actAddress: e.target.value }))}
              />
            </label>
            <label className="block space-y-2 md:col-span-2">
              <FieldLabel required>企业简介</FieldLabel>
              <textarea
                className={cn(inputEditable, 'min-h-[100px] resize-y py-3')}
                rows={4}
                value={form.enterpriseIntro}
                onChange={(e) => setForm((f) => ({ ...f, enterpriseIntro: e.target.value }))}
                placeholder="企业定位、主营业务与核心优势，将展示于供方主页"
              />
            </label>
          </div>
        </section>

        {/* 联系人信息 */}
        <section className="rounded-xl border border-gray-200/90 bg-white p-4 shadow-sm sm:p-6">
          <SectionTitle title="联系人信息" accent="teal" />
          <motion.div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
            <label className="block space-y-2">
              <FieldLabel>联系人姓名</FieldLabel>
              <input className={inputReadonly} readOnly value={form.contactName} />
            </label>
            <label className="block space-y-2">
              <FieldLabel>联系电话</FieldLabel>
              <input
                className={inputReadonly}
                readOnly
                value={form.contactPhone}
                aria-label="联系电话明文显示"
              />
            </label>
            <label className="block space-y-2 md:col-span-2">
              <FieldLabel>
                联系邮箱 <span className="text-[10px] font-bold text-gray-400">选填</span>
              </FieldLabel>
              <input className={inputReadonly} readOnly value={form.email || '—'} />
            </label>
          </motion.div>
        </section>

        {/* 业务信息 */}
        <section className="rounded-xl border border-gray-200/90 bg-white p-4 shadow-sm sm:p-6">
          <SectionTitle title="业务信息" accent="teal" />

          <div className="space-y-6 sm:space-y-8">
            <EntityTypeCascaderField
              label="用户类型"
              required
              userType={form.userType}
              subType={form.subType}
              subLevel3={form.subLevel3}
              onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
            />

            <EnterpriseIndustryCascadeFields
              required
              value={{
                industryL1Code: form.industryL1Code,
                industryL1Name: form.industryL1Name,
                industryL2Code: form.industryL2Code,
                industryL2Name: form.industryL2Name,
                industryL3Code: form.industryL3Code,
                industryL3Name: form.industryL3Name,
                industryL4Code: form.industryL4Code,
                industryL4Name: form.industryL4Name,
              }}
              onChange={(levels) => setForm((f) => ({ ...f, ...levels }))}
            />

            {form.userType === '企业法人' ? (
              <motion.div className="space-y-6 border-t border-gray-100 pt-6 sm:space-y-8">
                <label className="block space-y-2">
                  <FieldLabel>生产经营范围</FieldLabel>
                  <span className="ml-2 text-[10px] font-bold text-gray-400">企查查预填，不可编辑</span>
                  <textarea className={cn(inputReadonly, 'min-h-[8rem] resize-none')} readOnly value={form.scope} />
                </label>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
                  <label className="block space-y-2">
                    <FieldLabel>服务范围、业务范围</FieldLabel>
                    <span className="ml-2 text-[10px] font-bold text-gray-400">入驻时填写，不可编辑</span>
                    <textarea
                      className={cn(inputReadonly, 'min-h-[8rem] resize-none')}
                      readOnly
                      value={form.serviceScope}
                    />
                  </label>
                  <label className="block space-y-2">
                    <FieldLabel required>核心产品或方案</FieldLabel>
                    <textarea
                      className={cn(inputEditable, 'min-h-[8rem] resize-none')}
                      value={form.coreProducts}
                      onChange={(e) => setForm((f) => ({ ...f, coreProducts: e.target.value }))}
                      placeholder="请输入最具竞争力的核心产品或解决方案…"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
                  <label className="block space-y-2">
                    <FieldLabel>是否规上企业</FieldLabel>
                    <select
                      className={selectClass}
                      value={form.isAboveSize}
                      onChange={(e) => setForm((f) => ({ ...f, isAboveSize: e.target.value }))}
                    >
                      {YES_NO_OPTIONS.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block space-y-2">
                    <FieldLabel>企业规模</FieldLabel>
                    <input
                      className={inputEditable}
                      value={form.enterpriseScale}
                      onChange={(e) => setForm((f) => ({ ...f, enterpriseScale: e.target.value }))}
                    />
                  </label>
                  <label className="block space-y-2">
                    <FieldLabel>是否高新技术企业</FieldLabel>
                    <select
                      className={selectClass}
                      value={form.isHighTechEnterprise}
                      onChange={(e) => setForm((f) => ({ ...f, isHighTechEnterprise: e.target.value }))}
                    >
                      {YES_NO_OPTIONS.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block space-y-2">
                    <FieldLabel>是否&quot;专精特新&quot;小巨人企业</FieldLabel>
                    <select
                      className={selectClass}
                      value={form.isSpecializedLittleGiant}
                      onChange={(e) => setForm((f) => ({ ...f, isSpecializedLittleGiant: e.target.value }))}
                    >
                      {YES_NO_OPTIONS.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <motion.div className="space-y-4 border-t border-gray-100 pt-6">
                  <div className="space-y-1">
                    <FieldLabel>已获奖项/主要荣誉</FieldLabel>
                    <p className="text-[11px] font-bold leading-relaxed text-gray-400">
                      一个输入框填写一项荣誉，最多 {MAX_AWARDS_AND_HONORS} 项
                    </p>
                  </div>
                  <div className="space-y-2">
                    {honorEntries.map((entry, index) => (
                      <div key={`honor-entry-${index}`} className="flex gap-2">
                        <input
                          className={cn(inputEditable, 'min-h-[3rem] flex-1')}
                          value={entry}
                          onChange={(e) => {
                            const next = [...honorEntries];
                            next[index] = e.target.value;
                            setHonorEntries(next);
                          }}
                          placeholder={`荣誉 ${index + 1}，如：国家高新技术企业`}
                        />
                        {honorEntries.length > 1 ? (
                          <button
                            type="button"
                            onClick={() => {
                              const next = honorEntries.filter((_, i) => i !== index);
                              setHonorEntries(next.length ? next : ['']);
                            }}
                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                            aria-label={`移除荣誉 ${index + 1}`}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        ) : null}
                      </div>
                    ))}
                  </div>
                  {honorEntries.length < MAX_AWARDS_AND_HONORS ? (
                    <button
                      type="button"
                      onClick={() => setHonorEntries([...honorEntries, ''])}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-teal-200 bg-teal-50/50 px-3 py-2 text-xs font-black text-teal-800 transition hover:border-teal-400 hover:bg-teal-50"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      新增一项荣誉
                    </button>
                  ) : null}

                  <div className="space-y-3 pt-2">
                    <label className="flex flex-wrap items-center gap-2 text-sm font-black text-gray-700">
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
                        void addHonorFiles(e.target.files);
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
                      <motion.div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-md ring-1 ring-gray-100 transition group-hover:scale-105">
                        <Paperclip className="h-6 w-6 text-gray-400 group-hover:text-teal-600" />
                      </motion.div>
                      <p className="font-black text-gray-800">点击上传附件资料</p>
                      <p className="text-[11px] font-bold leading-relaxed text-gray-400">
                        支持 JPG、PNG、PDF，单文件不超过 6MB，可多选
                      </p>
                    </div>
                    {form.honorFiles.length > 0 ? (
                      <ul className="space-y-2 rounded-xl border border-gray-100 bg-gray-50/80 p-3">
                        {form.honorFiles.map((f) => (
                          <li
                            key={f.id}
                            className="flex items-center justify-between gap-2 rounded-lg border border-gray-100 bg-white px-3 py-2 text-xs font-bold text-gray-700"
                          >
                            <span className="min-w-0 truncate">{f.name}</span>
                            <button
                              type="button"
                              onClick={() =>
                                setForm((s) => ({ ...s, honorFiles: s.honorFiles.filter((h) => h.id !== f.id) }))
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
              </motion.div>
            ) : null}
          </div>
        </section>

        {/* 授权与证明文件 */}
        <section className="rounded-xl border border-gray-200/90 bg-white p-4 shadow-sm sm:p-6">
          <SectionTitle title="授权与证明文件" accent="gray" />
          <input
            ref={licenseInputRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={(e) => {
              void uploadSingle(e.target.files, 'businessLicense');
              e.target.value = '';
            }}
          />
          <input
            ref={idFrontInputRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={(e) => {
              void uploadSingle(e.target.files, 'idCardFront');
              e.target.value = '';
            }}
          />
          <input
            ref={idBackInputRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={(e) => {
              void uploadSingle(e.target.files, 'idCardBack');
              e.target.value = '';
            }}
          />
          <input
            ref={authLetterInputRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={(e) => {
              void uploadSingle(e.target.files, 'authorizationLetter');
              e.target.value = '';
            }}
          />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
            <FileUploadZone
              label="统一社会信用代码证照（营业执照、法人证书等）"
              hint="上传证照扫描件"
              file={form.businessLicense}
              onPick={() => licenseInputRef.current?.click()}
              onClear={() => setForm((f) => ({ ...f, businessLicense: null }))}
              icon={Image}
            />
            <div className="flex min-w-0 flex-col">
              <label className="mb-3 px-0.5 text-sm font-black text-gray-700">委托人身份证</label>
              <motion.div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
                <FileUploadZone
                  label=""
                  hint="上传人像面"
                  file={form.idCardFront}
                  onPick={() => idFrontInputRef.current?.click()}
                  onClear={() => setForm((f) => ({ ...f, idCardFront: null }))}
                  icon={UserCheck}
                />
                <FileUploadZone
                  label=""
                  hint="上传国徽面"
                  file={form.idCardBack}
                  onPick={() => idBackInputRef.current?.click()}
                  onClear={() => setForm((f) => ({ ...f, idCardBack: null }))}
                  icon={UserCheck}
                />
              </motion.div>
            </div>
          </div>
          <div className="mt-6">
            <FileUploadZone
              label="授权委托书"
              hint="上传授权委托书扫描件"
              file={form.authorizationLetter}
              onPick={() => authLetterInputRef.current?.click()}
              onClear={() => setForm((f) => ({ ...f, authorizationLetter: null }))}
              icon={Paperclip}
            />
          </div>
        </section>

        {formError ? (
          <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-[11px] font-bold text-red-700">
            {formError}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-black text-white hover:bg-teal-700"
          >
            保存并提交审核
          </button>
        </div>
      </form>

      <AnimatePresence>
        {toast ? (
          <div className="fixed bottom-6 left-1/2 z-[130] max-w-md -translate-x-1/2 rounded-xl border border-teal-200 bg-white px-4 py-3 text-xs font-bold text-teal-900 shadow-lg">
            {toast}
          </div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
