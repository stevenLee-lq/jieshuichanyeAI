import React, { useCallback, useMemo, useState } from 'react';
import { ChevronLeft, Download, Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from './lib/utils';
import { EnterpriseIndustryCascadeFields } from './EnterpriseIndustryCascadeFields';
import {
  EntityTypeCascaderField,
  RegionCascaderField,
} from './SharedCascadeFormFields';
import {
  createEmptyEnterpriseForm,
  enterpriseAuditStatusClass,
  enterpriseToForm,
  entityTypeSummary,
  industrySummaryDisplay,
  validateWorkbenchEnterpriseForm,
  WORKBENCH_ENTERPRISE_AUDIT_STATUSES,
  type WorkbenchEnterpriseAuditStatus,
  type WorkbenchEnterpriseFormState,
  type WorkbenchEnterpriseRecord,
} from './workbenchEnterprise';
import {
  deleteWorkbenchEnterprise,
  nextWorkbenchEnterpriseId,
  upsertWorkbenchEnterprise,
  useWorkbenchEnterprises,
} from './workbenchEnterpriseStore';
import {
  useWorkbenchListQueryPair,
  WorkbenchListQueryActions,
  WorkbenchListQueryBar,
  WorkbenchListQueryField,
  WorkbenchListQueryInput,
} from './workbenchListQuery';
import {
  useWorkbenchListPagination,
  WorkbenchListPagination,
} from './workbenchListPagination';

const YES_NO_OPTIONS = ['是', '否'] as const;

const ENTERPRISE_LIST_QUERY_INIT = {
  name: '',
  creditCode: '',
  region: '',
  contactName: '',
} as const;

function csvEscape(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function downloadEnterpriseListCsv(rows: WorkbenchEnterpriseRecord[]) {
  const headers = [
    '企业名称',
    '统一社会信用代码',
    '所属区域',
    '用户类型',
    '联系人姓名',
    '联系电话',
    '联系邮箱',
    '注册地址',
    '实际地址',
  ];
  const lines = [
    headers.join(','),
    ...rows.map((r) =>
      [
        r.name,
        r.creditCode,
        r.region,
        entityTypeSummary(r),
        r.contactName,
        r.contactPhone,
        r.email,
        r.regAddress,
        r.actAddress,
      ]
        .map(csvEscape)
        .join(',')
    ),
  ];
  const blob = new Blob(['\ufeff', lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `企业管理列表_${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

const inputClass =
  'mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-bold text-gray-900 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/30';

type PanelMode = 'list' | 'view' | 'form';

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col border-b border-gray-200 last:border-b-0 sm:flex-row">
      <div className="shrink-0 border-gray-200 bg-[#f5f6f8] px-3 py-2.5 text-xs font-black text-gray-600 sm:w-40 sm:border-r">
        {label}
      </div>
      <div className="min-w-0 flex-1 whitespace-pre-wrap bg-white px-3 py-2.5 text-sm font-medium text-gray-900">
        {value}
      </div>
    </div>
  );
}

function EnterpriseEditForm({
  form,
  setForm,
  auditStatus,
  onAuditStatusChange,
}: {
  form: WorkbenchEnterpriseFormState;
  setForm: React.Dispatch<React.SetStateAction<WorkbenchEnterpriseFormState>>;
  auditStatus: WorkbenchEnterpriseAuditStatus;
  onAuditStatusChange: (s: WorkbenchEnterpriseAuditStatus) => void;
}) {
  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-gray-200/90 bg-white p-4 shadow-sm sm:p-5">
        <h3 className="mb-4 border-l-4 border-teal-600 pl-3 text-sm font-black text-teal-800">主体信息</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-xs font-black text-gray-700">
              审核状态 <span className="text-red-500">*</span>
            </span>
            <select
              className={inputClass}
              value={auditStatus}
              onChange={(e) => onAuditStatusChange(e.target.value as WorkbenchEnterpriseAuditStatus)}
            >
              {WORKBENCH_ENTERPRISE_AUDIT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs font-black text-gray-700">
              统一社会信用代码 <span className="text-red-500">*</span>
            </span>
            <input
              className={inputClass}
              value={form.creditCode}
              onChange={(e) => setForm((f) => ({ ...f, creditCode: e.target.value }))}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs font-black text-gray-700">
              企业名称 <span className="text-red-500">*</span>
            </span>
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </label>
          <div className="block sm:col-span-2">
            <RegionCascaderField
              label="所属区域"
              required
              region={form.region}
              onRegionChange={(region) => setForm((f) => ({ ...f, region }))}
            />
          </div>
          <label className="block">
            <span className="text-xs font-black text-gray-700">用户身份</span>
            <input className={cn(inputClass, 'bg-gray-50')} readOnly value={form.userIdentity} />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs font-black text-gray-700">注册地址</span>
            <input
              className={inputClass}
              value={form.regAddress}
              onChange={(e) => setForm((f) => ({ ...f, regAddress: e.target.value }))}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs font-black text-gray-700">
              实际地址 <span className="text-red-500">*</span>
            </span>
            <input
              className={inputClass}
              value={form.actAddress}
              onChange={(e) => setForm((f) => ({ ...f, actAddress: e.target.value }))}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs font-black text-gray-700">
              企业简介 <span className="text-red-500">*</span>
            </span>
            <textarea
              className={cn(inputClass, 'min-h-[96px] resize-y py-2.5')}
              rows={4}
              value={form.enterpriseIntro}
              onChange={(e) => setForm((f) => ({ ...f, enterpriseIntro: e.target.value }))}
              placeholder="企业定位、主营业务与核心优势"
            />
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200/90 bg-white p-4 shadow-sm sm:p-5">
        <h3 className="mb-4 border-l-4 border-teal-600 pl-3 text-sm font-black text-teal-800">联系人</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-black text-gray-700">
              联系人 <span className="text-red-500">*</span>
            </span>
            <input
              className={inputClass}
              value={form.contactName}
              onChange={(e) => setForm((f) => ({ ...f, contactName: e.target.value }))}
            />
          </label>
          <label className="block">
            <span className="text-xs font-black text-gray-700">
              联系电话 <span className="text-red-500">*</span>
            </span>
            <input
              className={inputClass}
              value={form.contactPhone}
              onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs font-black text-gray-700">联系邮箱</span>
            <input
              className={inputClass}
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200/90 bg-white p-4 shadow-sm sm:p-5">
        <h3 className="mb-4 border-l-4 border-sky-600 pl-3 text-sm font-black text-sky-700">业务分类</h3>
        <div className="space-y-4">
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
            onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
          />
        </div>
      </section>

      <section className="rounded-xl border border-gray-200/90 bg-white p-4 shadow-sm sm:p-5">
        <h3 className="mb-4 border-l-4 border-gray-800 pl-3 text-sm font-black text-gray-900">经营信息</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-xs font-black text-gray-700">
              核心产品或方案 <span className="text-red-500">*</span>
            </span>
            <textarea
              rows={3}
              className={inputClass}
              value={form.coreProducts}
              onChange={(e) => setForm((f) => ({ ...f, coreProducts: e.target.value }))}
            />
          </label>
          <label className="block">
            <span className="text-xs font-black text-gray-700">是否规上</span>
            <select
              className={inputClass}
              value={form.isAboveSize}
              onChange={(e) => setForm((f) => ({ ...f, isAboveSize: e.target.value }))}
            >
              {YES_NO_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-black text-gray-700">企业规模</span>
            <input
              className={inputClass}
              value={form.enterpriseScale}
              onChange={(e) => setForm((f) => ({ ...f, enterpriseScale: e.target.value }))}
            />
          </label>
          <label className="block">
            <span className="text-xs font-black text-gray-700">高新技术企业</span>
            <select
              className={inputClass}
              value={form.isHighTechEnterprise}
              onChange={(e) => setForm((f) => ({ ...f, isHighTechEnterprise: e.target.value }))}
            >
              {YES_NO_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-black text-gray-700">专精特新小巨人</span>
            <select
              className={inputClass}
              value={form.isSpecializedLittleGiant}
              onChange={(e) => setForm((f) => ({ ...f, isSpecializedLittleGiant: e.target.value }))}
            >
              {YES_NO_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs font-black text-gray-700">经营范围（企查查）</span>
            <textarea
              rows={2}
              className={cn(inputClass, 'bg-gray-50')}
              value={form.scope}
              onChange={(e) => setForm((f) => ({ ...f, scope: e.target.value }))}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs font-black text-gray-700">服务范围</span>
            <textarea
              rows={2}
              className={inputClass}
              value={form.serviceScope}
              onChange={(e) => setForm((f) => ({ ...f, serviceScope: e.target.value }))}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs font-black text-gray-700">荣誉资质</span>
            <textarea
              rows={3}
              className={inputClass}
              value={form.awardsAndHonors}
              onChange={(e) => setForm((f) => ({ ...f, awardsAndHonors: e.target.value }))}
              placeholder="每行一项"
            />
          </label>
        </div>
      </section>
    </div>
  );
}

/** 系统管理员：入驻产业主体列表与增删改查 */
export function WorkbenchEnterpriseAdminListPanel() {
  const enterprises = useWorkbenchEnterprises();
  const [mode, setMode] = useState<PanelMode>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewId, setViewId] = useState<string | null>(null);
  const [form, setForm] = useState<WorkbenchEnterpriseFormState>(() => createEmptyEnterpriseForm());
  const [auditStatus, setAuditStatus] = useState<WorkbenchEnterpriseAuditStatus>('已通过');
  const [formError, setFormError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const { draft, patchDraft, applied, applySearch, resetSearch } =
    useWorkbenchListQueryPair(ENTERPRISE_LIST_QUERY_INIT);

  const viewing = viewId ? enterprises.find((e) => e.id === viewId) ?? null : null;
  const isEdit = Boolean(editingId);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  const backToList = useCallback(() => {
    setMode('list');
    setEditingId(null);
    setViewId(null);
    setFormError(null);
  }, []);

  const filtered = useMemo(() => {
    const nameQ = applied.name.trim().toLowerCase();
    const codeQ = applied.creditCode.trim().toLowerCase();
    const regionQ = applied.region.trim().toLowerCase();
    const contactNameQ = applied.contactName.trim().toLowerCase();
    return enterprises.filter((e) => {
      if (nameQ && !e.name.toLowerCase().includes(nameQ)) return false;
      if (codeQ && !e.creditCode.toLowerCase().includes(codeQ)) return false;
      if (regionQ && !e.region.toLowerCase().includes(regionQ)) return false;
      if (contactNameQ && !e.contactName.toLowerCase().includes(contactNameQ)) return false;
      return true;
    });
  }, [applied, enterprises]);

  const { page, pageSize, pageItems, total, setPage, setPageSize } = useWorkbenchListPagination(
    filtered,
    [applied.name, applied.creditCode, applied.region, applied.contactName]
  );

  const handleSearch = useCallback(() => {
    applySearch();
    setPage(1);
  }, [applySearch, setPage]);

  const handleReset = useCallback(() => {
    resetSearch();
    setPage(1);
  }, [resetSearch, setPage]);

  const openCreate = () => {
    setEditingId(null);
    setForm(createEmptyEnterpriseForm());
    setAuditStatus('已通过');
    setFormError(null);
    setMode('form');
  };

  const openEdit = (row: WorkbenchEnterpriseRecord) => {
    setEditingId(row.id);
    setForm(enterpriseToForm(row));
    setAuditStatus(row.auditStatus);
    setFormError(null);
    setMode('form');
  };

  const openView = (row: WorkbenchEnterpriseRecord) => {
    setViewId(row.id);
    setMode('view');
  };

  const handleDelete = (row: WorkbenchEnterpriseRecord) => {
    if (!window.confirm(`确定删除企业「${row.name}」？删除后不可恢复。`)) return;
    deleteWorkbenchEnterprise(row.id);
    if (viewId === row.id || editingId === row.id) backToList();
    showToast('已删除');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateWorkbenchEnterpriseForm(form, { requireCreditCode: true });
    if (err) {
      setFormError(err);
      return;
    }
    setFormError(null);
    const id = editingId ?? nextWorkbenchEnterpriseId();
    const record: WorkbenchEnterpriseRecord = {
      id,
      auditStatus,
      ...form,
      name: form.name.trim(),
      creditCode: form.creditCode.trim(),
      actAddress: form.actAddress.trim(),
      enterpriseIntro: form.enterpriseIntro.trim(),
      contactName: form.contactName.trim(),
      contactPhone: form.contactPhone.trim(),
      coreProducts: form.coreProducts.trim(),
    };
    upsertWorkbenchEnterprise(record);
    showToast(isEdit ? '企业信息已更新' : '已新增入驻企业');
    backToList();
  };

  if (mode === 'view' && viewing) {
    return (
      <motion.div
        key="view"
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={backToList}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-black text-gray-600 hover:border-teal-200 hover:text-teal-700"
          >
            <ChevronLeft className="h-4 w-4" />
            返回列表
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => openEdit(viewing)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-xs font-black text-white hover:bg-teal-700"
            >
              <Pencil className="h-3.5 w-3.5" />
              编辑
            </button>
            <button
              type="button"
              onClick={() => handleDelete(viewing)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs font-black text-red-800 hover:bg-red-100"
            >
              <Trash2 className="h-3.5 w-3.5" />
              删除
            </button>
          </div>
        </div>
        <section className="overflow-hidden rounded-xl border border-gray-200/90 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-black text-gray-900">{viewing.name}</h3>
              <span
                className={cn(
                  'inline-flex rounded-full border px-2 py-0.5 text-[10px] font-black',
                  enterpriseAuditStatusClass(viewing.auditStatus)
                )}
              >
                {viewing.auditStatus}
              </span>
            </div>
            <p className="mt-1 font-mono text-[11px] font-bold text-gray-500">{viewing.creditCode}</p>
          </div>
          <div className="overflow-hidden border-t border-gray-200">
            <InfoRow label="所属区域" value={viewing.region} />
            <InfoRow label="用户类型" value={entityTypeSummary(viewing)} />
            <InfoRow label="所属行业" value={industrySummaryDisplay(viewing)} />
            <InfoRow label="注册地址" value={viewing.regAddress || '—'} />
            <InfoRow label="实际地址" value={viewing.actAddress} />
            <InfoRow label="企业简介" value={viewing.enterpriseIntro || '—'} />
            <InfoRow label="联系人" value={`${viewing.contactName} · ${viewing.contactPhone}`} />
            <InfoRow label="联系邮箱" value={viewing.email || '—'} />
            <InfoRow label="核心产品/方案" value={viewing.coreProducts} />
            <InfoRow
              label="企业标签"
              value={`规上 ${viewing.isAboveSize} · ${viewing.enterpriseScale} · 高新 ${viewing.isHighTechEnterprise} · 小巨人 ${viewing.isSpecializedLittleGiant}`}
            />
            <InfoRow label="经营范围" value={viewing.scope || '—'} />
            <InfoRow label="服务范围" value={viewing.serviceScope || '—'} />
            {viewing.awardsAndHonors ? (
              <InfoRow label="荣誉资质" value={viewing.awardsAndHonors} />
            ) : null}
          </div>
        </section>
      </motion.div>
    );
  }

  if (mode === 'form') {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={backToList}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-black text-gray-600 hover:border-teal-200 hover:text-teal-700"
        >
          <ChevronLeft className="h-4 w-4" />
          返回列表
        </button>
        <h3 className="text-sm font-black text-gray-900">{isEdit ? '编辑入驻企业' : '新增入驻企业'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <EnterpriseEditForm
            form={form}
            setForm={setForm}
            auditStatus={auditStatus}
            onAuditStatusChange={setAuditStatus}
          />
          {formError ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
              {formError}
            </p>
          ) : null}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={backToList}
              className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-black text-gray-600 hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-black text-white hover:bg-teal-700"
            >
              {isEdit ? '保存' : '创建'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="relative space-y-4">
      <AnimatePresence>
        {toast ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed left-1/2 top-20 z-50 -translate-x-1/2 rounded-xl border border-teal-200 bg-teal-50 px-4 py-2 text-xs font-black text-teal-900 shadow-lg"
          >
            {toast}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={() => {
            if (filtered.length === 0) {
              showToast('当前筛选结果为空，无可导出数据');
              return;
            }
            downloadEnterpriseListCsv(filtered);
            showToast(`已导出 ${filtered.length} 条企业记录`);
          }}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-black text-gray-700 shadow-sm hover:border-teal-200 hover:text-teal-700"
        >
          <Download className="h-4 w-4" />
          导出
        </button>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-black text-white shadow-md hover:bg-teal-700"
        >
          <Plus className="h-4 w-4" />
          新增企业
        </button>
      </div>

      <WorkbenchListQueryBar>
        <WorkbenchListQueryField label="企业名称">
          <WorkbenchListQueryInput
            value={draft.name}
            onChange={(v) => patchDraft({ name: v })}
            placeholder="名称关键词"
          />
        </WorkbenchListQueryField>
        <WorkbenchListQueryField label="信用代码">
          <WorkbenchListQueryInput
            value={draft.creditCode}
            onChange={(v) => patchDraft({ creditCode: v })}
            placeholder="统一社会信用代码"
          />
        </WorkbenchListQueryField>
        <WorkbenchListQueryField label="所属区域">
          <WorkbenchListQueryInput
            value={draft.region}
            onChange={(v) => patchDraft({ region: v })}
            placeholder="省/市关键词"
          />
        </WorkbenchListQueryField>
        <WorkbenchListQueryField label="联系人姓名">
          <WorkbenchListQueryInput
            value={draft.contactName}
            onChange={(v) => patchDraft({ contactName: v })}
            placeholder="联系人姓名关键词"
          />
        </WorkbenchListQueryField>
        <WorkbenchListQueryActions onSearch={handleSearch} onReset={handleReset} />
      </WorkbenchListQueryBar>

      <div className="overflow-hidden rounded-xl border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/90 text-[11px] font-black uppercase tracking-wide text-gray-500">
                <th className="px-3 py-3">企业名称</th>
                <th className="px-3 py-3">用户身份</th>
                <th className="px-3 py-3">审核状态</th>
                <th className="px-3 py-3">信用代码</th>
                <th className="px-3 py-3">所属区域</th>
                <th className="px-3 py-3">用户类型</th>
                <th className="px-3 py-3">联系人姓名</th>
                <th className="px-3 py-3">联系电话</th>
                <th className="px-3 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {total === 0 ? (
                <tr>
                  <td colSpan={10} className="px-3 py-12 text-center text-xs font-bold text-gray-400">
                    暂无入驻企业，点击「新增企业」添加
                  </td>
                </tr>
              ) : (
                pageItems.map((row) => (
                  <tr key={row.id} className="border-b border-gray-50 last:border-0 hover:bg-teal-50/20">
                    <td className="max-w-[12rem] px-3 py-3 font-black text-gray-900">
                      <span className="line-clamp-2">{row.name}</span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-xs font-bold text-gray-700">
                      {row.userIdentity}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      <span
                        className={cn(
                          'inline-block rounded-md border px-2 py-0.5 text-[10px] font-black',
                          enterpriseAuditStatusClass(row.auditStatus)
                        )}
                      >
                        {row.auditStatus}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 font-mono text-[11px] text-gray-600">
                      {row.creditCode}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-gray-600">{row.region}</td>
                    <td className="max-w-[10rem] px-3 py-3 text-xs font-bold text-gray-600">
                      <span className="line-clamp-2">{entityTypeSummary(row)}</span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-xs font-bold text-gray-700">
                      {row.contactName}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-xs font-bold text-gray-600">
                      {row.contactPhone}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => openView(row)}
                        className="mr-1 inline-flex items-center gap-0.5 rounded-lg border border-gray-200 px-2 py-1 text-[11px] font-black text-gray-600 hover:border-teal-200 hover:text-teal-700"
                      >
                        <Eye className="h-3 w-3" />
                        查看
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(row)}
                        className="inline-flex items-center gap-0.5 rounded-lg border border-red-200 px-2 py-1 text-[11px] font-black text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                        删除
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <WorkbenchListPagination
          className="px-3 pb-3 sm:px-4"
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>
    </div>
  );
}
