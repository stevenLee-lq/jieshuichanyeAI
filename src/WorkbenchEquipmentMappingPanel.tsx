import React, { useCallback, useMemo, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
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
import { WATER_SAVING_SUB_CATEGORIES } from './productWorkbenchCatalog';
import {
  createEmptyEquipmentMappingForm,
  deleteEquipmentMapping,
  formatEquipmentMappingCategoryLabel,
  formatEquipmentMappingQuotaLabel,
  upsertEquipmentMapping,
  useEquipmentMappings,
  useQuotaProducts,
  validateEquipmentMappingForm,
  type EquipmentMappingRecord,
} from './workbenchQuotaEquipment';

const inputClass =
  'mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-bold text-gray-900 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/30';

const EQUIPMENT_MAPPING_QUERY_INIT = {
  code: '',
  name: '',
  status: '全部',
} as const;

export function WorkbenchEquipmentMappingPanel() {
  const mappings = useEquipmentMappings();
  const quotaProducts = useQuotaProducts();
  const { draft, patchDraft, applied, applySearch, resetSearch } =
    useWorkbenchListQueryPair(EQUIPMENT_MAPPING_QUERY_INIT);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(createEmptyEquipmentMappingForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  const filtered = useMemo(() => {
    const statusFilter = applied.status as '全部' | '启用' | '停用';
    const codeQ = applied.code.trim().toLowerCase();
    const nameQ = applied.name.trim().toLowerCase();
    return mappings.filter((r) => {
      if (statusFilter === '启用' && !r.enabled) return false;
      if (statusFilter === '停用' && r.enabled) return false;
      if (codeQ && !r.equipmentCode.toLowerCase().includes(codeQ)) return false;
      if (nameQ && !r.equipmentName.toLowerCase().includes(nameQ)) return false;
      return true;
    });
  }, [applied, mappings]);

  const { page, pageSize, pageItems, total, setPage, setPageSize } = useWorkbenchListPagination(
    filtered,
    [applied.code, applied.name, applied.status]
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
    setForm(createEmptyEquipmentMappingForm());
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (row: EquipmentMappingRecord) => {
    const { id, ...rest } = row;
    setEditingId(id);
    setForm(rest);
    setFormError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setFormError(null);
  };

  const handleDelete = (row: EquipmentMappingRecord) => {
    if (!window.confirm(`确定删除映射「${row.equipmentName}」？`)) return;
    deleteEquipmentMapping(row.id);
    showToast('已删除');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateEquipmentMappingForm(form);
    if (err) {
      setFormError(err);
      return;
    }
    upsertEquipmentMapping(form, editingId ?? undefined);
    showToast(editingId ? '已更新' : '已新增');
    closeModal();
  };

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
          disabled={quotaProducts.length === 0}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-black text-white shadow-md hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          新增映射
        </button>
      </div>

      <WorkbenchListQueryBar>
        <WorkbenchListQueryField label="设备编码">
          <WorkbenchListQueryInput
            value={draft.code}
            onChange={(v) => patchDraft({ code: v })}
            placeholder="编码"
          />
        </WorkbenchListQueryField>
        <WorkbenchListQueryField label="设备名称">
          <WorkbenchListQueryInput
            value={draft.name}
            onChange={(v) => patchDraft({ name: v })}
            placeholder="名称关键词"
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

      {quotaProducts.length === 0 ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900">
          请先在「定额产品库」中维护至少一条定额产品，再配置设备映射。
        </p>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-gray-200">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/90 text-[11px] font-black uppercase tracking-wide text-gray-500">
              <th className="px-3 py-3">设备编码</th>
              <th className="px-3 py-3">设备/产品名称</th>
              <th className="px-3 py-3">关联定额产品</th>
              <th className="px-3 py-3">节水产业分类</th>
              <th className="px-3 py-3">状态</th>
              <th className="px-3 py-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {total === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-12 text-center text-xs font-bold text-gray-400">
                  暂无映射，点击「新增映射」添加
                </td>
              </tr>
            ) : (
              pageItems.map((row) => (
                <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/80">
                  <td className="whitespace-nowrap px-3 py-3 font-mono text-[11px] text-gray-600">{row.equipmentCode}</td>
                  <td className="max-w-[14rem] px-3 py-3 font-black text-gray-900">
                    <span className="line-clamp-2">{row.equipmentName}</span>
                  </td>
                  <td className="max-w-[14rem] px-3 py-3 text-xs font-bold text-gray-700">
                    {formatEquipmentMappingQuotaLabel(row.quotaProductId)}
                  </td>
                  <td className="max-w-[12rem] px-3 py-3 text-xs font-bold text-gray-600">
                    {formatEquipmentMappingCategoryLabel(row.waterSavingCategorySubId)}
                  </td>
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

      <AnimatePresence>
        {modalOpen ? (
          <motion.div
            className="fixed inset-0 z-[120] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-gray-900/45"
              aria-hidden
              onClick={closeModal}
            />
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="relative max-h-[min(90vh,36rem)] w-full max-w-lg overflow-y-auto rounded-2xl border border-gray-200 bg-white p-5 shadow-xl sm:p-6"
            >
              <h3 className="text-base font-black text-gray-900">{editingId ? '编辑设备映射' : '新增设备映射'}</h3>
              {formError ? (
                <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
                  {formError}
                </p>
              ) : null}
              <div className="mt-4 space-y-3">
                <label className="block">
                  <span className="text-xs font-black text-gray-700">
                    设备/产品名称 <span className="text-red-500">*</span>
                  </span>
                  <input
                    className={inputClass}
                    value={form.equipmentName}
                    onChange={(e) => setForm((f) => ({ ...f, equipmentName: e.target.value }))}
                    placeholder="与门户供给市场展示名称一致"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-black text-gray-700">
                    设备编码 <span className="text-red-500">*</span>
                  </span>
                  <input
                    className={inputClass}
                    value={form.equipmentCode}
                    onChange={(e) => setForm((f) => ({ ...f, equipmentCode: e.target.value }))}
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-black text-gray-700">
                    关联定额产品 <span className="text-red-500">*</span>
                  </span>
                  <select
                    className={inputClass}
                    value={form.quotaProductId}
                    onChange={(e) => setForm((f) => ({ ...f, quotaProductId: e.target.value }))}
                  >
                    {quotaProducts.map((q) => (
                      <option key={q.id} value={q.id}>
                        {q.productCode} · {q.productName}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-black text-gray-700">
                    节水产业分类 <span className="text-red-500">*</span>
                  </span>
                  <select
                    className={inputClass}
                    value={form.waterSavingCategorySubId}
                    onChange={(e) => setForm((f) => ({ ...f, waterSavingCategorySubId: e.target.value }))}
                  >
                    {WATER_SAVING_SUB_CATEGORIES.map((s) => (
                      <option key={s.subId} value={s.subId}>
                        {s.topName} / {s.subName}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.enabled}
                    onChange={(e) => setForm((f) => ({ ...f, enabled: e.target.checked }))}
                    className="h-4 w-4 rounded border-gray-300 text-teal-600"
                  />
                  <span className="text-xs font-black text-gray-700">启用</span>
                </label>
                <label className="block">
                  <span className="text-xs font-black text-gray-700">备注</span>
                  <textarea
                    rows={2}
                    className={cn(inputClass, 'resize-y')}
                    value={form.remark}
                    onChange={(e) => setForm((f) => ({ ...f, remark: e.target.value }))}
                  />
                </label>
              </div>
              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-black text-gray-600 hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-teal-600 py-2.5 text-sm font-black text-white hover:bg-teal-700"
                >
                  保存
                </button>
              </div>
            </motion.form>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
