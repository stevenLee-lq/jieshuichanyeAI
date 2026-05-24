import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  useWorkbenchListPagination,
  WorkbenchListPagination,
} from './workbenchListPagination';
import {
  useWorkbenchListQueryPair,
  WorkbenchListQueryActions,
  WorkbenchListQueryBar,
  WorkbenchListQueryField,
  WorkbenchListQueryInput,
  WorkbenchListQuerySelect,
} from './workbenchListQuery';
import { Calendar, ChevronLeft, Globe, Image as ImageIcon, MapPin, Plus } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { CaseCardFavoriteOverlay } from './CaseFavoriteButton';
import { cn } from './lib/utils';
import { WORKBENCH_REGION_TREE } from './workbenchRegionTree';
import {
  buildCaseAuditApplication,
  type WorkbenchApplicationRow,
  type WorkbenchCaseAuditAction,
} from './workbenchApplications';
import {
  WORKBENCH_CASE_APPLICATION_FIELD_OPTIONS,
  caseAuditStatusClass,
  formatCaseRegion,
  caseToForm,
  createEmptyCaseForm,
  formatCaseRegionShort,
  seedWorkbenchCases,
  type WorkbenchCaseFormState,
  type WorkbenchManagedCase,
} from './workbenchCase';

function readCoverImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('请上传图片文件'));
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      reject(new Error('图片不超过 4MB'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('读取失败'));
    reader.readAsDataURL(file);
  });
}

const inputClass =
  'mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-bold text-gray-900 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/30';

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <span className="text-xs font-black text-gray-700">
      {children}
      {required ? <span className="text-red-500"> *</span> : null}
    </span>
  );
}

type PanelMode = 'list' | 'form' | 'view';

export function WorkbenchCasesAdminPanel({
  onAuditApplication,
}: {
  onAuditApplication: (row: WorkbenchApplicationRow) => void;
}) {
  const [cases, setCases] = useState<WorkbenchManagedCase[]>(() => seedWorkbenchCases());
  const { draft, patchDraft, applied, applySearch, resetSearch } = useWorkbenchListQueryPair({
    title: '',
    applicationField: '全部',
    region: '',
    auditStatus: '全部',
  });
  const [mode, setMode] = useState<PanelMode>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewId, setViewId] = useState<string | null>(null);
  const [form, setForm] = useState<WorkbenchCaseFormState>(() => createEmptyCaseForm());
  const [formError, setFormError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const viewing = cases.find((c) => c.id === viewId) ?? null;
  const isEdit = Boolean(editingId);

  const cityOptions = useMemo(() => {
    if (!form.province) return [] as string[];
    return Object.keys(WORKBENCH_REGION_TREE[form.province] ?? {});
  }, [form.province]);

  const districtOptions = useMemo(() => {
    if (!form.province || !form.city) return [] as readonly string[];
    return WORKBENCH_REGION_TREE[form.province]?.[form.city] ?? [];
  }, [form.province, form.city]);

  const filteredCases = useMemo(() => {
    const titleQ = applied.title.trim().toLowerCase();
    const regionQ = applied.region.trim().toLowerCase();
    return cases.filter((c) => {
      if (applied.applicationField !== '全部' && c.applicationField !== applied.applicationField) return false;
      if (applied.auditStatus !== '全部' && c.auditStatus !== applied.auditStatus) return false;
      if (titleQ && !c.title.toLowerCase().includes(titleQ)) return false;
      if (regionQ && !formatCaseRegion(c).toLowerCase().includes(regionQ)) return false;
      return true;
    });
  }, [applied, cases]);

  const { page, pageSize, pageItems, total, setPage, setPageSize } = useWorkbenchListPagination(
    filteredCases,
    [applied.title, applied.applicationField, applied.region, applied.auditStatus, cases.length]
  );

  const handleSearch = useCallback(() => {
    applySearch();
    setPage(1);
  }, [applySearch, setPage]);

  const handleReset = useCallback(() => {
    resetSearch();
    setPage(1);
  }, [resetSearch, setPage]);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3200);
  };

  const submitAudit = (title: string, action: WorkbenchCaseAuditAction) => {
    onAuditApplication(buildCaseAuditApplication(title, action));
    showToast('已提交企业信息审核流程，可在「我的申请」查看进度');
  };

  const backToList = () => {
    setMode('list');
    setEditingId(null);
    setViewId(null);
    setFormError(null);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(createEmptyCaseForm());
    setFormError(null);
    setMode('form');
  };

  const openView = (row: WorkbenchManagedCase) => {
    setViewId(row.id);
    setMode('view');
    submitAudit(row.title, '查看');
  };

  const handleDelete = (row: WorkbenchManagedCase) => {
    if (!window.confirm(`确定删除案例「${row.title}」？删除不进入审核流程。`)) return;
    setCases((prev) => prev.filter((c) => c.id !== row.id));
    if (viewId === row.id) backToList();
  };

  const onCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setFormError(null);
    try {
      const dataUrl = await readCoverImage(file);
      setForm((f) => ({ ...f, coverImage: dataUrl }));
    } catch (err) {
      setFormError(err instanceof Error ? err.message : '封面上传失败');
    }
  };

  const validateForm = (): string | null => {
    if (!form.title.trim()) return '请填写案例标题';
    if (!form.applicationField) return '请选择应用领域';
    if (!form.coverImage.trim()) return '请上传封面图片';
    if (!form.province || !form.city || !form.district) return '请完整选择省 / 盟市 / 区县';
    if (!form.publishedDate) return '请选择发布日期';
    if (!form.source.trim()) return '请填写来源';
    if (!form.content.trim()) return '请填写案例详情';
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateForm();
    if (err) {
      setFormError(err);
      return;
    }
    const action: WorkbenchCaseAuditAction = isEdit ? '编辑' : '新增';
    const payload: WorkbenchManagedCase = {
      id: editingId ?? `case-${Date.now()}`,
      auditStatus: '审核中',
      title: form.title.trim(),
      applicationField: form.applicationField,
      coverImage: form.coverImage,
      province: form.province,
      city: form.city,
      district: form.district,
      publishedDate: form.publishedDate,
      source: form.source.trim(),
      content: form.content.trim(),
    };
    if (isEdit) {
      setCases((prev) => prev.map((c) => (c.id === editingId ? payload : c)));
    } else {
      setCases((prev) => [payload, ...prev]);
    }
    submitAudit(payload.title, action);
    backToList();
  };

  if (mode === 'view' && viewing) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={backToList}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-black text-gray-700 hover:bg-gray-50"
          >
            <ChevronLeft className="h-4 w-4" />
            返回列表
          </button>
          <span
            className={cn(
              'rounded-full border px-2.5 py-0.5 text-[10px] font-black',
              caseAuditStatusClass(viewing.auditStatus)
            )}
          >
            {viewing.auditStatus}
          </span>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200/90 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative w-full shrink-0 sm:w-[min(100%,280px)]">
              <div className="relative aspect-[16/10] overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                <img src={viewing.coverImage} alt="" className="h-full w-full object-cover" />
                {viewing.portalCaseId != null ? (
                  <CaseCardFavoriteOverlay caseId={viewing.portalCaseId} />
                ) : null}
                <span className="absolute left-2 top-2 rounded border border-sky-200 bg-white/95 px-2 py-0.5 text-[10px] font-black text-sky-700 shadow-sm">
                  {viewing.applicationField}
                </span>
              </div>
            </div>
            <div className="min-w-0 flex-1 space-y-3">
              <h3 className="text-base font-black leading-snug text-gray-900 sm:text-lg">{viewing.title}</h3>
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-bold text-gray-600">
                <span className="inline-flex items-center gap-1 text-teal-800">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-teal-600" aria-hidden />
                  {formatCaseRegionShort(viewing)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden />
                  {viewing.publishedDate}
                </span>
              </div>
              <p className="inline-flex items-start gap-1 text-xs font-bold text-gray-500">
                <Globe className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden />
                <span>来源：{viewing.source}</span>
              </p>
              <p className="text-[11px] font-bold text-gray-400">地区：{formatCaseRegion(viewing)}</p>
              <div className="rounded-lg border border-gray-100 bg-gray-50/80 p-3 text-sm font-medium leading-relaxed text-gray-800">
                {viewing.content}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'form') {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={backToList}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-black text-gray-700 hover:bg-gray-50"
          >
            <ChevronLeft className="h-4 w-4" />
            返回列表
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <section className="rounded-xl border border-gray-200/90 bg-white p-4 shadow-sm sm:p-5">
            <h3 className="mb-4 border-l-4 border-sky-600 pl-3 text-sm font-black text-sky-700 sm:text-base">
              {isEdit ? '编辑典型案例' : '新增典型案例'}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <FieldLabel required>案例标题</FieldLabel>
                <input
                  className={inputClass}
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="如：内蒙古锡林郭勒盟：烟气提水破局「富煤贫水」之困"
                  maxLength={120}
                />
              </label>
              <label className="block">
                <FieldLabel required>应用领域</FieldLabel>
                <select
                  className={inputClass}
                  value={form.applicationField}
                  onChange={(e) => setForm((f) => ({ ...f, applicationField: e.target.value }))}
                >
                  {WORKBENCH_CASE_APPLICATION_FIELD_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <FieldLabel required>发布日期</FieldLabel>
                <input
                  type="date"
                  className={inputClass}
                  value={form.publishedDate}
                  onChange={(e) => setForm((f) => ({ ...f, publishedDate: e.target.value }))}
                />
              </label>
              <div className="block sm:col-span-2">
                <FieldLabel required>封面图片</FieldLabel>
                <div className="mt-1.5 flex flex-wrap items-start gap-3">
                  <div className="relative h-28 w-44 overflow-hidden rounded-lg border border-dashed border-gray-200 bg-gray-50">
                    {form.coverImage ? (
                      <img src={form.coverImage} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-gray-400">
                        <ImageIcon className="h-6 w-6" />
                        <span className="text-[10px] font-bold">上传封面</span>
                      </div>
                    )}
                    <span className="pointer-events-none absolute left-2 top-2 rounded border border-sky-200 bg-white/95 px-1.5 py-0.5 text-[9px] font-black text-sky-700">
                      {form.applicationField || '领域'}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={onCoverChange} />
                    <button
                      type="button"
                      onClick={() => coverInputRef.current?.click()}
                      className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-black text-gray-700 hover:bg-gray-50"
                    >
                      {form.coverImage ? '更换封面' : '选择图片'}
                    </button>
                    <p className="text-[10px] font-bold text-gray-400">建议 16:10 横图，不超过 4MB</p>
                  </div>
                </div>
              </div>
              <div className="block sm:col-span-2">
                <FieldLabel required>所属地区（省 / 盟市 / 区县）</FieldLabel>
                <div className="mt-1.5 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <select
                    className={inputClass + ' mt-0'}
                    value={form.province}
                    onChange={(e) => setForm((f) => ({ ...f, province: e.target.value, city: '', district: '' }))}
                  >
                    <option value="">请选择省 / 自治区</option>
                    {Object.keys(WORKBENCH_REGION_TREE).map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  <select
                    className={inputClass + ' mt-0'}
                    value={form.city}
                    disabled={!form.province}
                    onChange={(e) => setForm((f) => ({ ...f, city: e.target.value, district: '' }))}
                  >
                    <option value="">请选择市 / 盟</option>
                    {cityOptions.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <select
                    className={inputClass + ' mt-0'}
                    value={form.district}
                    disabled={!form.city}
                    onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))}
                  >
                    <option value="">请选择区县</option>
                    {districtOptions.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <label className="block sm:col-span-2">
                <FieldLabel required>来源</FieldLabel>
                <input
                  className={inputClass}
                  value={form.source}
                  onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
                  placeholder="如：内蒙古自治区水利厅"
                  maxLength={80}
                />
              </label>
              <label className="block sm:col-span-2">
                <FieldLabel required>案例详情</FieldLabel>
                <textarea
                  rows={8}
                  className={inputClass}
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  placeholder="节水成效、技术路线、适用场景等完整说明"
                  maxLength={8000}
                />
              </label>
            </div>
            {formError ? (
              <p className="mt-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-[11px] font-bold text-red-700">
                {formError}
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={backToList}
                className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-black text-gray-600 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                type="submit"
                className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-black text-white hover:bg-teal-700"
              >
                {isEdit ? '保存并提交审核' : '创建并提交审核'}
              </button>
            </div>
          </section>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-2 text-xs font-black text-white shadow-sm hover:bg-teal-700"
        >
          <Plus className="h-3.5 w-3.5" />
          新增案例
        </button>
      </div>

      <WorkbenchListQueryBar>
        <WorkbenchListQueryField label="案例标题">
          <WorkbenchListQueryInput
            value={draft.title}
            onChange={(v) => patchDraft({ title: v })}
            placeholder="标题关键词"
          />
        </WorkbenchListQueryField>
        <WorkbenchListQueryField label="应用领域">
          <WorkbenchListQuerySelect
            value={draft.applicationField}
            onChange={(v) => patchDraft({ applicationField: v })}
            options={['全部', ...WORKBENCH_CASE_APPLICATION_FIELD_OPTIONS]}
          />
        </WorkbenchListQueryField>
        <WorkbenchListQueryField label="地区">
          <WorkbenchListQueryInput
            value={draft.region}
            onChange={(v) => patchDraft({ region: v })}
            placeholder="省/市/区"
          />
        </WorkbenchListQueryField>
        <WorkbenchListQueryField label="审核状态">
          <WorkbenchListQuerySelect
            value={draft.auditStatus}
            onChange={(v) => patchDraft({ auditStatus: v })}
            options={['全部', '已通过', '待审核', '审核中', '已驳回', '草稿']}
          />
        </WorkbenchListQueryField>
        <WorkbenchListQueryActions onSearch={handleSearch} onReset={handleReset} />
      </WorkbenchListQueryBar>

      <div className="overflow-hidden rounded-xl border border-gray-200">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-xs">
          <thead className="border-b border-gray-100 bg-gray-50 text-[10px] font-black uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-3 py-2.5">封面</th>
              <th className="px-3 py-2.5">案例标题</th>
              <th className="px-3 py-2.5">应用领域</th>
              <th className="px-3 py-2.5">地区</th>
              <th className="px-3 py-2.5">发布日期</th>
              <th className="px-3 py-2.5">审核状态</th>
              <th className="px-3 py-2.5 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="font-bold text-gray-800">
            {total === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-10 text-center text-gray-400">
                  暂无案例，点击「新增案例」添加
                </td>
              </tr>
            ) : (
              pageItems.map((row) => (
                <tr key={row.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/80">
                  <td className="px-3 py-2">
                    <div className="relative h-12 w-20 overflow-hidden rounded border border-gray-100">
                      <img src={row.coverImage} alt="" className="h-full w-full object-cover" />
                      {row.portalCaseId != null ? (
                        <CaseCardFavoriteOverlay caseId={row.portalCaseId} className="right-0 top-0 scale-90" />
                      ) : null}
                    </div>
                  </td>
                  <td className="max-w-[14rem] truncate px-3 py-2">{row.title}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-gray-600">{row.applicationField}</td>
                  <td className="max-w-[8rem] truncate px-3 py-2 text-gray-600">{formatCaseRegion(row)}</td>
                  <td className="whitespace-nowrap px-3 py-2 tabular-nums text-gray-500">{row.publishedDate}</td>
                  <td className="px-3 py-2">
                    <span
                      className={cn(
                        'inline-flex rounded-full border px-2 py-0.5 text-[10px] font-black',
                        caseAuditStatusClass(row.auditStatus)
                      )}
                    >
                      {row.auditStatus}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => openView(row)}
                      className="mr-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-[11px] font-black text-gray-700 hover:bg-gray-50"
                    >
                      查看
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(row)}
                      className="rounded-lg border border-red-200 bg-white px-2 py-1 text-[11px] font-black text-red-700 hover:bg-red-50"
                    >
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
          className="px-3 pb-3"
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      <AnimatePresence>
        {toast ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-6 left-1/2 z-[130] max-w-md -translate-x-1/2 rounded-xl border border-teal-200 bg-white px-4 py-3 text-xs font-bold text-teal-900 shadow-lg"
          >
            {toast}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
