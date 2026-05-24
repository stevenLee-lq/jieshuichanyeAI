import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ChevronLeft, Eye, Image, Pencil, Plus, Trash2 } from 'lucide-react';
import {
  useWorkbenchListQueryPair,
  WorkbenchListQueryActions,
  WorkbenchListQueryBar,
  WorkbenchListQueryField,
  WorkbenchListQueryInput,
  WorkbenchListQuerySelect,
} from './workbenchListQuery';
import {
  useWorkbenchListPagination,
  WorkbenchListPagination,
} from './workbenchListPagination';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from './lib/utils';
import {
  createEmptyNewsFormForPanel,
  deletePortalNews,
  getPortalNewsById,
  upsertPortalNews,
  usePortalNewsRecords,
} from './portalNewsStore';
import {
  formatNewsTagLabels,
  formatNewsWaterSavingDisplay,
  recordToNewsForm,
  validateNewsForm,
  WORKBENCH_INFO_SCOPE_OPTIONS,
  type WorkbenchNewsFormState,
  type WorkbenchNewsRecord,
} from './workbenchNews';
import { RichTextContent, WorkbenchRichTextEditor } from './WorkbenchRichTextEditor';
import { WorkbenchPortalTagsFields } from './WorkbenchPortalTagsFields';
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

function readImageFile(file: File): Promise<string> {
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

const NEWS_LIST_QUERY_INIT = {
  title: '',
  publisher: '',
  date: '',
  status: '全部',
} as const;

export function WorkbenchNewsAdminPanel() {
  const records = usePortalNewsRecords();
  const [mode, setMode] = useState<PanelMode>('list');
  const { draft, patchDraft, applied, applySearch, resetSearch } =
    useWorkbenchListQueryPair(NEWS_LIST_QUERY_INIT);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewId, setViewId] = useState<string | null>(null);
  const [form, setForm] = useState<WorkbenchNewsFormState>(() => createEmptyNewsFormForPanel());
  const [formError, setFormError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const viewing = viewId ? getPortalNewsById(viewId) : null;

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
    const statusFilter = applied.status as '全部' | '启用' | '停用';
    const titleQ = applied.title.trim().toLowerCase();
    const publisherQ = applied.publisher.trim().toLowerCase();
    const dateQ = applied.date.trim().toLowerCase();
    return records.filter((r) => {
      if (statusFilter === '启用' && !r.enabled) return false;
      if (statusFilter === '停用' && r.enabled) return false;
      if (titleQ && !r.title.toLowerCase().includes(titleQ)) return false;
      if (publisherQ && !r.publisher.toLowerCase().includes(publisherQ)) return false;
      if (dateQ && !r.publishedAt.toLowerCase().includes(dateQ)) return false;
      return true;
    });
  }, [applied, records]);

  const { page, pageSize, pageItems, total, setPage, setPageSize } = useWorkbenchListPagination(
    filtered,
    [applied.title, applied.publisher, applied.date, applied.status]
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
    setForm(createEmptyNewsFormForPanel());
    setFormError(null);
    setMode('form');
  };

  const openEdit = (row: WorkbenchNewsRecord) => {
    setEditingId(row.id);
    setForm(recordToNewsForm(row));
    setFormError(null);
    setMode('form');
  };

  const openView = (row: WorkbenchNewsRecord) => {
    setViewId(row.id);
    setMode('view');
  };

  const handleDelete = (row: WorkbenchNewsRecord) => {
    if (!window.confirm(`确定删除新闻「${row.title}」？`)) return;
    deletePortalNews(row.id);
    if (viewId === row.id || editingId === row.id) backToList();
    showToast('已删除');
  };

  const handleImagePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setImageUploading(true);
    try {
      const dataUrl = await readImageFile(file);
      setForm((f) => ({ ...f, image: dataUrl }));
    } catch (err) {
      setFormError(err instanceof Error ? err.message : '上传失败');
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateNewsForm(form);
    if (err) {
      setFormError(err);
      return;
    }
    upsertPortalNews(form, editingId ?? undefined);
    showToast(editingId ? '已更新，门户将同步展示' : '已发布');
    backToList();
  };

  if (mode === 'view' && viewing) {
    return (
      <motion.div key="view" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
        <button
          type="button"
          onClick={backToList}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-black text-gray-600 hover:border-teal-200 hover:text-teal-700"
        >
          <ChevronLeft className="h-4 w-4" />
          返回列表
        </button>
        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-4">
            <h3 className="text-base font-black text-gray-900">{viewing.title}</h3>
            {formatNewsTagLabels(viewing).length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {formatNewsTagLabels(viewing).map((t) => (
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
          {viewing.image ? (
            <div className="border-b border-gray-100 p-4">
              <img src={viewing.image} alt="" className="max-h-48 rounded-lg object-contain" />
            </div>
          ) : null}
          <div className="overflow-hidden border-t border-gray-200">
            <InfoRow label="发布来源" value={viewing.publisher} />
            <InfoRow label="资讯范围" value={viewing.infoScope} />
            <InfoRow label="发布日期" value={viewing.publishedAt} />
            <InfoRow label="节水产业分类" value={formatNewsWaterSavingDisplay(viewing)} />
            <InfoRow label="正文" value={<RichTextContent html={viewing.content} />} />
          </div>
        </section>
        <button
          type="button"
          onClick={() => openEdit(viewing)}
          className="rounded-lg bg-teal-600 px-4 py-2 text-xs font-black text-white hover:bg-teal-700"
        >
          编辑
        </button>
      </motion.div>
    );
  }

  if (mode === 'form') {
    return (
      <motion.form
        key="form"
        onSubmit={handleSubmit}
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-4"
      >
        <button
          type="button"
          onClick={backToList}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-black text-gray-600"
        >
          <ChevronLeft className="h-4 w-4" />
          返回列表
        </button>
        {formError ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">{formError}</p>
        ) : null}
        <label className="block">
          <span className="text-xs font-black text-gray-700">
            新闻标题 <span className="text-red-500">*</span>
          </span>
          <input
            className={inputClass}
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-black text-gray-700">
              发布日期 <span className="text-red-500">*</span>
            </span>
            <input
              type="date"
              className={inputClass}
              value={form.publishedAt}
              onChange={(e) => setForm((f) => ({ ...f, publishedAt: e.target.value }))}
            />
          </label>
          <label className="block">
            <span className="text-xs font-black text-gray-700">
              发布来源 <span className="text-red-500">*</span>
            </span>
            <input
              className={inputClass}
              value={form.publisher}
              onChange={(e) => setForm((f) => ({ ...f, publisher: e.target.value }))}
            />
          </label>
          <label className="block sm:col-span-2">
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
        </div>
        <div className="block text-xs font-black text-gray-700">
          封面图片 <span className="text-red-500">*</span>
          <div className="mt-1.5 flex items-start gap-3">
            <div className="h-24 w-32 overflow-hidden rounded-lg border border-dashed border-gray-200 bg-gray-50">
              {form.image ? (
                <img src={form.image} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-gray-400">
                  <Image className="h-6 w-6" />
                </div>
              )}
            </div>
            <div>
              <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
              <button
                type="button"
                disabled={imageUploading}
                onClick={() => imageInputRef.current?.click()}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-[11px] font-black text-gray-700 hover:bg-gray-50"
              >
                {imageUploading ? '上传中…' : form.image ? '更换封面' : '上传封面'}
              </button>
            </div>
          </div>
        </div>
        <WorkbenchRichTextEditor
          label="新闻正文"
          required
          value={form.content}
          onChange={(content) => setForm((f) => ({ ...f, content }))}
          placeholder="请输入新闻正文…"
          minHeight={260}
        />
        <WorkbenchPortalTagsFields
          value={{
            applicationFields: form.applicationFields,
            waterSavingCategorySubIds: form.waterSavingCategorySubIds,
          }}
          onChange={(tags) => setForm((f) => ({ ...f, ...tags }))}
          syncKey={editingId ?? 'create'}
        />
        <div className="flex justify-end gap-2">
          <button type="button" onClick={backToList} className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-black text-gray-600">
            取消
          </button>
          <button type="submit" className="rounded-lg bg-teal-600 px-5 py-2 text-xs font-black text-white hover:bg-teal-700">
            {editingId ? '保存' : '发布'}
          </button>
        </div>
      </motion.form>
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
          onClick={openCreate}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-black text-white shadow-md hover:bg-teal-700"
        >
          <Plus className="h-4 w-4" />
          新增新闻
        </button>
      </div>

      <WorkbenchListQueryBar>
        <WorkbenchListQueryField label="标题">
          <WorkbenchListQueryInput
            value={draft.title}
            onChange={(v) => patchDraft({ title: v })}
            placeholder="新闻标题"
          />
        </WorkbenchListQueryField>
        <WorkbenchListQueryField label="发布来源">
          <WorkbenchListQueryInput
            value={draft.publisher}
            onChange={(v) => patchDraft({ publisher: v })}
            placeholder="来源单位"
          />
        </WorkbenchListQueryField>
        <WorkbenchListQueryField label="发布日期">
          <WorkbenchListQueryInput
            value={draft.date}
            onChange={(v) => patchDraft({ date: v })}
            placeholder="如 2025-03"
          />
        </WorkbenchListQueryField>
        <WorkbenchListQueryField label="状态">
          <WorkbenchListQuerySelect
            value={draft.status}
            onChange={(v) => patchDraft({ status: v })}
            options={['全部', '启用', '停用']}
          />
        </WorkbenchListQueryField>
        <WorkbenchListQueryActions onSearch={handleSearch} onReset={handleReset} />
      </WorkbenchListQueryBar>

      <div className="overflow-hidden rounded-xl border border-gray-200">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/90 text-[11px] font-black uppercase tracking-wide text-gray-500">
              <th className="px-3 py-3">封面</th>
              <th className="px-3 py-3">标题</th>
              <th className="px-3 py-3">资讯范围</th>
              <th className="px-3 py-3">发布日期</th>
              <th className="px-3 py-3">来源</th>
              <th className="px-3 py-3">状态</th>
              <th className="px-3 py-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {total === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-12 text-center text-xs font-bold text-gray-400">
                  暂无新闻，点击「新增新闻」添加
                </td>
              </tr>
            ) : (
              pageItems.map((row) => (
                <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/80">
                  <td className="px-3 py-3">
                    <div className="h-10 w-14 overflow-hidden rounded border border-gray-100 bg-gray-50">
                      {row.image ? (
                        <img src={row.image} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-300">
                          <Image className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="max-w-[14rem] px-3 py-3 font-black text-gray-900">
                    <span className="line-clamp-2">{row.title}</span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-gray-600">{row.infoScope}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-gray-600">{row.publishedAt}</td>
                  <td className="px-3 py-3 text-gray-600">{row.publisher}</td>
                  <td className="px-3 py-3">
                    <span
                      className={cn(
                        'inline-flex rounded-full border px-2 py-0.5 text-[10px] font-black',
                        row.enabled
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                          : 'border-gray-200 bg-gray-50 text-gray-500'
                      )}
                    >
                      {row.enabled ? '启用' : '停用'}
                    </span>
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
