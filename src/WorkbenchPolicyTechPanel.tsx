import React, { useCallback, useMemo, useState } from 'react';
import { ChevronLeft, Eye, Pencil, Plus, Trash2 } from 'lucide-react';
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
import { AnimatePresence, motion } from 'motion/react';
import {
  createEmptyPolicyTechFormForKind,
  deletePortalPolicyTech,
  getPortalPolicyTechById,
  upsertPortalPolicyTech,
  usePortalPolicyTechRecords,
} from './portalPolicyTechStore';
import { WorkbenchRichTextEditor, RichTextContent } from './WorkbenchRichTextEditor';
import { WorkbenchPortalTagsFields } from './WorkbenchPortalTagsFields';
import {
  formatPolicyTechTagLabels,
  formatWaterSavingCategoryDisplay,
  recordToForm,
  validatePolicyTechForm,
  WORKBENCH_INFO_SCOPE_OPTIONS,
  WORKBENCH_STANDARD_CATEGORY_OPTIONS,
  type PolicyTechKind,
  type WorkbenchPolicyTechFormState,
  type WorkbenchPolicyTechRecord,
} from './workbenchPolicyTech';

const inputClass =
  'mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-bold text-gray-900 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/30';

type PanelMode = 'list' | 'form' | 'view';

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col border-b border-gray-200 last:border-b-0 sm:flex-row">
      <div className="shrink-0 border-gray-200 bg-[#f5f6f8] px-3 py-2.5 text-xs font-black text-gray-600 sm:w-40 sm:border-r">
        {label}
      </div>
      <div className="min-w-0 flex-1 bg-white px-3 py-2.5 text-sm font-medium text-gray-900">{value}</div>
    </div>
  );
}

function ViewPanel({
  row,
  kind,
  onBack,
  onEdit,
}: {
  row: WorkbenchPolicyTechRecord;
  kind: PolicyTechKind;
  onBack: () => void;
  onEdit: () => void;
}) {
  const tags = formatPolicyTechTagLabels(row);
  return (
    <motion.div
      key="view"
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
      className="space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-black text-gray-600 hover:border-teal-200 hover:text-teal-700"
        >
          <ChevronLeft className="h-4 w-4" />
          返回列表
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-xs font-black text-white hover:bg-teal-700"
        >
          <Pencil className="h-3.5 w-3.5" />
          编辑
        </button>
      </div>
      <section className="overflow-hidden rounded-xl border border-gray-200/90 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-4 py-3">
          <h3 className="text-base font-black text-gray-900">{row.title}</h3>
          {tags.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-teal-100 bg-teal-50 px-2 py-0.5 text-[10px] font-black text-teal-800"
                >
                  {t}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        <div className="overflow-hidden rounded-b-lg border-t border-gray-200">
          {kind === 'policy' ? (
            <InfoRow label="发布单位" value={row.publisher} />
          ) : (
            <InfoRow label="标准号" value={row.code} />
          )}
          {kind === 'policy' ? (
            <InfoRow label="资讯范围" value={row.infoScope} />
          ) : (
            <InfoRow label="所属标准" value={row.standardCategory} />
          )}
          <InfoRow label="发布日期" value={row.time} />
          <InfoRow label="节水产业分类" value={formatWaterSavingCategoryDisplay(row)} />
          <InfoRow
            label="正文摘要"
            value={<RichTextContent html={row.content} className="text-sm text-gray-800" />}
          />
        </div>
      </section>
    </motion.div>
  );
}

function FormPanel({
  kind,
  form,
  setForm,
  formError,
  isEdit,
  onBack,
  onSubmit,
}: {
  kind: PolicyTechKind;
  form: WorkbenchPolicyTechFormState;
  setForm: React.Dispatch<React.SetStateAction<WorkbenchPolicyTechFormState>>;
  formError: string | null;
  isEdit: boolean;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  const titleLabel = kind === 'policy' ? '政策名称' : '标准名称';

  return (
    <motion.form
      key="form"
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
      onSubmit={onSubmit}
      className="space-y-4"
    >
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-black text-gray-600 hover:border-teal-200 hover:text-teal-700"
      >
        <ChevronLeft className="h-4 w-4" />
        返回列表
      </button>

      {formError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">{formError}</p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-xs font-black text-gray-700">
            {titleLabel} <span className="text-red-500">*</span>
          </span>
          <input
            className={inputClass}
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
        </label>
        {kind === 'policy' ? (
          <label className="block">
            <span className="text-xs font-black text-gray-700">
              发布单位 <span className="text-red-500">*</span>
            </span>
            <input
              className={inputClass}
              value={form.publisher}
              onChange={(e) => setForm((f) => ({ ...f, publisher: e.target.value }))}
            />
          </label>
        ) : (
          <label className="block">
            <span className="text-xs font-black text-gray-700">
              标准号 <span className="text-red-500">*</span>
            </span>
            <input
              className={inputClass}
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
            />
          </label>
        )}
        <label className="block">
          <span className="text-xs font-black text-gray-700">
            发布日期 <span className="text-red-500">*</span>
          </span>
          <input
            type="date"
            className={inputClass}
            value={form.time}
            onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
          />
        </label>
        {kind === 'policy' ? (
          <label className="block">
            <span className="text-xs font-black text-gray-700">
              资讯范围 <span className="text-red-500">*</span>
            </span>
            <select
              className={inputClass}
              value={form.infoScope}
              onChange={(e) =>
                setForm((f) => ({ ...f, infoScope: e.target.value as typeof form.infoScope }))
              }
            >
              {WORKBENCH_INFO_SCOPE_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <label className="block">
            <span className="text-xs font-black text-gray-700">
              所属标准 <span className="text-red-500">*</span>
            </span>
            <select
              className={inputClass}
              value={form.standardCategory}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  standardCategory: e.target.value as typeof form.standardCategory,
                }))
              }
            >
              {WORKBENCH_STANDARD_CATEGORY_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <WorkbenchRichTextEditor
        label="正文摘要"
        required
        value={form.content}
        onChange={(content) => setForm((f) => ({ ...f, content }))}
        placeholder={kind === 'policy' ? '请输入政策正文摘要…' : '请输入技术标准正文摘要…'}
        minHeight={240}
      />

      <WorkbenchPortalTagsFields
        value={{
          applicationFields: form.applicationFields,
          waterSavingCategorySubIds: form.waterSavingCategorySubIds,
        }}
        onChange={(tags) => setForm((f) => ({ ...f, ...tags }))}
        syncKey={isEdit ? form.title : 'create'}
      />



      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-black text-gray-600 hover:bg-gray-50"
        >
          取消
        </button>
        <button
          type="submit"
          className="rounded-lg bg-teal-600 px-5 py-2 text-xs font-black text-white hover:bg-teal-700"
        >
          {isEdit ? '保存' : '发布'}
        </button>
      </div>
    </motion.form>
  );
}

export function WorkbenchPolicyTechPanel({ kind }: { kind: PolicyTechKind }) {
  const allRecords = usePortalPolicyTechRecords();
  const records = useMemo(() => allRecords.filter((r) => r.kind === kind), [allRecords, kind]);
  const [mode, setMode] = useState<PanelMode>('list');
  const { draft, patchDraft, applied, applySearch, resetSearch } = useWorkbenchListQueryPair({
    title: '',
    publisher: '',
    date: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewId, setViewId] = useState<string | null>(null);
  const [form, setForm] = useState<WorkbenchPolicyTechFormState>(() => createEmptyPolicyTechFormForKind(kind));
  const [formError, setFormError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const viewing = viewId ? getPortalPolicyTechById(viewId) : null;
  const editing = editingId ? getPortalPolicyTechById(editingId) : null;

  const kindLabel = kind === 'policy' ? '政策' : '技术标准';

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

  const openCreate = useCallback(() => {
    setEditingId(null);
    setForm(createEmptyPolicyTechFormForKind(kind));
    setFormError(null);
    setMode('form');
  }, [kind]);

  const openEdit = useCallback((row: WorkbenchPolicyTechRecord) => {
    setEditingId(row.id);
    setForm(recordToForm(row));
    setFormError(null);
    setMode('form');
  }, []);

  const openView = useCallback((row: WorkbenchPolicyTechRecord) => {
    setViewId(row.id);
    setMode('view');
  }, []);

  const filtered = useMemo(() => {
    const titleQ = applied.title.trim().toLowerCase();
    const pubQ = applied.publisher.trim().toLowerCase();
    const dateQ = applied.date.trim().toLowerCase();
    return records.filter((r) => {
      if (titleQ && !r.title.toLowerCase().includes(titleQ)) return false;
      const pubHay = kind === 'policy' ? r.publisher : r.code;
      if (pubQ && !pubHay.toLowerCase().includes(pubQ)) return false;
      if (dateQ && !r.time.toLowerCase().includes(dateQ)) return false;
      return true;
    });
  }, [applied, kind, records]);

  const { page, pageSize, pageItems, total, setPage, setPageSize } = useWorkbenchListPagination(
    filtered,
    [applied.title, applied.publisher, applied.date, kind]
  );

  const handleSearch = useCallback(() => {
    applySearch();
    setPage(1);
  }, [applySearch, setPage]);

  const handleReset = useCallback(() => {
    resetSearch();
    setPage(1);
  }, [resetSearch, setPage]);

  const handleDelete = useCallback(
    (row: WorkbenchPolicyTechRecord) => {
      if (!window.confirm(`确定删除${kindLabel}「${row.title}」？`)) return;
      deletePortalPolicyTech(row.id);
      if (viewId === row.id || editingId === row.id) backToList();
      showToast('已删除');
    },
    [backToList, editingId, kindLabel, showToast, viewId]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const err = validatePolicyTechForm(form, kind);
      if (err) {
        setFormError(err);
        return;
      }
      setFormError(null);
      upsertPortalPolicyTech(kind, form, editingId ?? undefined);
      showToast(editingId ? '已更新，门户将同步展示' : '已发布');
      backToList();
    },
    [backToList, editingId, form, kind, showToast]
  );

  return (
    <div className="relative">
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

      <AnimatePresence mode="wait">
        {mode === 'view' && viewing ? (
          <ViewPanel row={viewing} kind={kind} onBack={backToList} onEdit={() => openEdit(viewing)} />
        ) : mode === 'form' ? (
          <FormPanel
            kind={kind}
            form={form}
            setForm={setForm}
            formError={formError}
            isEdit={Boolean(editingId)}
            onBack={backToList}
            onSubmit={handleSubmit}
          />
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={openCreate}
                className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-black text-white shadow-md hover:bg-teal-700"
              >
                <Plus className="h-4 w-4" />
                新增{kindLabel}
              </button>
            </div>

            <WorkbenchListQueryBar>
              <WorkbenchListQueryField label={kind === 'policy' ? '政策名称' : '标准名称'}>
                <WorkbenchListQueryInput
                  value={draft.title}
                  onChange={(v) => patchDraft({ title: v })}
                  placeholder="名称关键词"
                />
              </WorkbenchListQueryField>
              <WorkbenchListQueryField label={kind === 'policy' ? '发布单位' : '标准号'}>
                <WorkbenchListQueryInput
                  value={draft.publisher}
                  onChange={(v) => patchDraft({ publisher: v })}
                  placeholder={kind === 'policy' ? '发布单位' : '标准号'}
                />
              </WorkbenchListQueryField>
              <WorkbenchListQueryField label="发布日期">
                <WorkbenchListQueryInput
                  value={draft.date}
                  onChange={(v) => patchDraft({ date: v })}
                  placeholder="如 2025-03"
                />
              </WorkbenchListQueryField>
              <WorkbenchListQueryActions onSearch={handleSearch} onReset={handleReset} />
            </WorkbenchListQueryBar>

            <div className="overflow-hidden rounded-xl border border-gray-200">
              <div className="overflow-x-auto">
              <table className="w-full min-w-[1080px] text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/90 text-[11px] font-black uppercase tracking-wide text-gray-500">
                    <th className="px-3 py-3">{kind === 'policy' ? '政策名称' : '标准名称'}</th>
                    <th className="px-3 py-3">{kind === 'policy' ? '发布单位' : '标准号'}</th>
                    <th className="px-3 py-3">{kind === 'policy' ? '资讯范围' : '所属标准'}</th>
                    <th className="px-3 py-3">发布日期</th>
                    <th className="px-3 py-3">节水产业分类</th>
                    <th className="px-3 py-3">应用领域</th>
                    <th className="px-3 py-3 text-right">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {total === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-3 py-12 text-center text-xs font-bold text-gray-400">
                        暂无数据，点击「新增{kindLabel}」添加
                      </td>
                    </tr>
                  ) : (
                    pageItems.map((row) => {
                      const appTags = row.applicationFields.filter((t) => t.trim());
                      return (
                        <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/80">
                          <td className="max-w-[14rem] px-3 py-3 font-black text-gray-900">
                            <span className="line-clamp-2">{row.title}</span>
                          </td>
                          <td className="max-w-[10rem] truncate px-3 py-3 text-gray-600">
                            {kind === 'policy' ? row.publisher : row.code}
                          </td>
                          <td className="whitespace-nowrap px-3 py-3 text-gray-600">
                            {kind === 'policy' ? row.infoScope : row.standardCategory}
                          </td>
                          <td className="whitespace-nowrap px-3 py-3 text-gray-600">{row.time}</td>
                          <td className="max-w-[12rem] px-3 py-3 text-xs font-bold text-gray-600">
                            <span className="line-clamp-2">{formatWaterSavingCategoryDisplay(row)}</span>
                          </td>
                          <td className="max-w-[12rem] px-3 py-3">
                            <div className="flex flex-wrap gap-1">
                              {appTags.length === 0 ? (
                                <span className="text-xs text-gray-300">—</span>
                              ) : (
                                appTags.slice(0, 3).map((t) => (
                                  <span
                                    key={t}
                                    className="rounded border border-teal-100 bg-teal-50 px-1.5 py-0.5 text-[10px] font-black text-teal-800"
                                  >
                                    {t}
                                  </span>
                                ))
                              )}
                              {appTags.length > 3 ? (
                                <span className="text-[10px] font-bold text-gray-400">+{appTags.length - 3}</span>
                              ) : null}
                            </div>
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
                              onClick={() => openEdit(row)}
                              className="mr-1 inline-flex items-center gap-0.5 rounded-lg border border-teal-200 px-2 py-1 text-[11px] font-black text-teal-800 hover:bg-teal-50"
                            >
                              <Pencil className="h-3 w-3" />
                              编辑
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
                      );
                    })
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
