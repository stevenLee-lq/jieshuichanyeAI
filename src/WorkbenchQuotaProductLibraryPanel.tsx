import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from './lib/utils';
import {
  WorkbenchListQueryActions,
  WorkbenchListQueryBar,
  WorkbenchListQueryField,
  WorkbenchListQueryInput,
  workbenchTextInputClass,
} from './workbenchListQuery';
import { WorkbenchListPagination } from './workbenchListPagination';
import {
  applyQuotaIndustryChain,
  collectQuotaIndustryCodes,
  filterQuotaIndustryTree,
  findQuotaIndustryNode,
  findQuotaIndustryPath,
  formatQuotaIndustryCategoryPath,
  firstQuotaIndustryChain,
  isQuotaIndustryLevel4,
  QUOTA_INDUSTRY_TREE,
  quotaProductMatchesIndustryFilter,
  type QuotaIndustryTreeNode,
} from './quotaIndustryClassification';
import {
  getQuotaL4ApplicationFields,
  setQuotaL4ApplicationFields,
  useQuotaL4ApplicationFieldsMap,
} from './quotaIndustryApplicationFields';
import { ApplicationFieldTagGroup, formatApplicationFieldsList } from './workbenchApplicationFields';
import {
  createEmptyQuotaProductForm,
  deleteQuotaProduct,
  displayQuotaStandardCell,
  EMPTY_QUOTA_STANDARD_TRIPLE,
  upsertQuotaProduct,
  useQuotaProducts,
  validateQuotaProductForm,
  type QuotaProductRecord,
  type QuotaStandardTriple,
} from './workbenchQuotaEquipment';

const inputClass =
  'mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-bold text-gray-900 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/30';

const btnPrimary =
  'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-black text-white shadow-md transition hover:bg-teal-700';

const btnDefault =
  'inline-flex shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-black text-gray-700 transition hover:border-teal-200 hover:bg-teal-50/50';

const STANDARD_COLUMNS: {
  key: 'provincial' | 'national' | 'other';
  label: string;
  field: keyof QuotaStandardTriple;
}[] = [
  { key: 'provincial', label: '领跑值-省标', field: 'leading' },
  { key: 'provincial', label: '先进值-省标', field: 'advanced' },
  { key: 'provincial', label: '通用值-省标', field: 'general' },
  { key: 'national', label: '领跑值-国标', field: 'leading' },
  { key: 'national', label: '先进值-国标', field: 'advanced' },
  { key: 'national', label: '通用值-国标', field: 'general' },
  { key: 'other', label: '领跑值-其他', field: 'leading' },
  { key: 'other', label: '先进值-其他', field: 'advanced' },
  { key: 'other', label: '通用值-其他', field: 'general' },
];

function TripleFields({
  title,
  value,
  onChange,
}: {
  title: string;
  value: QuotaStandardTriple;
  onChange: (next: QuotaStandardTriple) => void;
}) {
  return (
    <fieldset className="rounded-xl border border-gray-200 bg-gray-50/60 p-3">
      <legend className="px-1 text-xs font-black text-gray-700">{title}</legend>
      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        {(
          [
            ['leading', '领跑值'],
            ['advanced', '先进值'],
            ['general', '通用值'],
          ] as const
        ).map(([field, label]) => (
          <label key={field} className="block">
            <span className="text-[10px] font-bold text-gray-500">{label}</span>
            <input
              className={cn(inputClass, 'mt-0.5')}
              value={value[field]}
              onChange={(e) => onChange({ ...value, [field]: e.target.value })}
            />
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function WorkbenchQuotaProductLibraryPanel() {
  const records = useQuotaProducts();
  const [industryFilter, setIndustryFilter] = useState<string | null>('B');
  const [treeKeyword, setTreeKeyword] = useState('');
  const [expandedCodes, setExpandedCodes] = useState<Set<string>>(
    () => new Set(['B', 'B06', 'B061'])
  );
  const [draftName, setDraftName] = useState('');
  const [draftCode, setDraftCode] = useState('');
  const [queryName, setQueryName] = useState('');
  const [queryCode, setQueryCode] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(() => createEmptyQuotaProductForm());
  const [formError, setFormError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [appFieldModalOpen, setAppFieldModalOpen] = useState(false);
  const [appFieldDraft, setAppFieldDraft] = useState<string[]>([]);
  const l4ApplicationFieldsMap = useQuotaL4ApplicationFieldsMap();

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  const filteredTree = useMemo(
    () => filterQuotaIndustryTree(QUOTA_INDUSTRY_TREE, treeKeyword),
    [treeKeyword]
  );

  useEffect(() => {
    if (!treeKeyword.trim()) return;
    setExpandedCodes((prev) => {
      const next = new Set(prev);
      for (const code of collectQuotaIndustryCodes(filteredTree)) {
        next.add(code);
      }
      return next;
    });
  }, [filteredTree, treeKeyword]);

  const filtered = useMemo(() => {
    const nameQ = queryName.trim().toLowerCase();
    const codeQ = queryCode.trim().toLowerCase();
    return records.filter((r) => {
      if (!quotaProductMatchesIndustryFilter(r, industryFilter)) return false;
      if (nameQ && !r.productName.toLowerCase().includes(nameQ)) return false;
      if (codeQ && !r.productCode.toLowerCase().includes(codeQ)) return false;
      return true;
    });
  }, [industryFilter, queryCode, queryName, records]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    setPage(1);
  }, [industryFilter, queryCode, queryName, pageSize]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageRows = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, pageSize, safePage]);

  const toggleExpand = (code: string) => {
    setExpandedCodes((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const handleQuery = () => {
    setQueryName(draftName);
    setQueryCode(draftCode);
    setPage(1);
  };

  const handleReset = () => {
    setDraftName('');
    setDraftCode('');
    setQueryName('');
    setQueryCode('');
    setPage(1);
  };

  const openCreate = () => {
    const node = industryFilter
      ? findQuotaIndustryNode(QUOTA_INDUSTRY_TREE, industryFilter)
      : QUOTA_INDUSTRY_TREE[1];
    const prefill = node
      ? applyQuotaIndustryChain(firstQuotaIndustryChain(node))
      : undefined;
    setEditingId(null);
    setForm(createEmptyQuotaProductForm(prefill));
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (row: QuotaProductRecord) => {
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

  const handleDelete = (row: QuotaProductRecord) => {
    if (!window.confirm(`确定删除定额产品「${row.productName}」？`)) return;
    deleteQuotaProduct(row.id);
    showToast('已删除');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateQuotaProductForm(form);
    if (err) {
      setFormError(err);
      return;
    }
    upsertQuotaProduct(form, editingId ?? undefined);
    showToast(editingId ? '已更新' : '已新增');
    closeModal();
  };

  const renderTree = (nodes: QuotaIndustryTreeNode[], depth = 0) =>
    nodes.map((node) => {
      const hasChildren = Boolean(node.children?.length);
      const isExpanded = expandedCodes.has(node.code);
      const isSelected = industryFilter === node.code;
      return (
        <div key={node.code}>
          <div
            className={cn(
              'flex items-center gap-0.5 rounded py-1 pr-1 transition',
              isSelected ? 'bg-teal-50 text-teal-900' : 'hover:bg-gray-50'
            )}
            style={{ paddingLeft: `${6 + depth * 12}px` }}
          >
            {hasChildren ? (
              <button
                type="button"
                onClick={() => toggleExpand(node.code)}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-gray-400 hover:bg-teal-50 hover:text-teal-700"
                aria-label={isExpanded ? '收起' : '展开'}
              >
                {isExpanded ? (
                  <ChevronDown className="h-3.5 w-3.5" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5" />
                )}
              </button>
            ) : (
              <span className="flex h-6 w-6 shrink-0 items-center justify-center" aria-hidden>
                <span className="h-1.5 w-1.5 rounded-full bg-teal-400/70" />
              </span>
            )}
            <button
              type="button"
              onClick={() => setIndustryFilter(node.code)}
              className="min-w-0 flex-1 truncate py-0.5 text-left text-xs font-bold text-gray-800"
            >
              <span className="font-mono text-[11px] text-teal-700">{node.code}</span>{' '}
              {node.name}
            </button>
          </div>
          {hasChildren && isExpanded ? renderTree(node.children!, depth + 1) : null}
        </div>
      );
    });

  const selectedIndustryIsL4 = Boolean(industryFilter && isQuotaIndustryLevel4(industryFilter));
  const selectedL4ApplicationFields =
    industryFilter && selectedIndustryIsL4 ? l4ApplicationFieldsMap[industryFilter] ?? [] : [];
  const selectedIndustryPathLabel = useMemo(() => {
    if (!industryFilter) return '';
    const path = findQuotaIndustryPath(QUOTA_INDUSTRY_TREE, industryFilter);
    if (!path?.length) return industryFilter;
    return path.map((n) => `${n.code} ${n.name}`).join(' / ');
  }, [industryFilter]);

  const openApplicationFieldsModal = () => {
    if (!industryFilter || !selectedIndustryIsL4) {
      showToast('请先在左侧选择第四级行业（小类）');
      return;
    }
    setAppFieldDraft(getQuotaL4ApplicationFields(industryFilter));
    setAppFieldModalOpen(true);
  };

  const saveApplicationFields = () => {
    if (!industryFilter || !selectedIndustryIsL4) return;
    setQuotaL4ApplicationFields(industryFilter, appFieldDraft);
    setAppFieldModalOpen(false);
    showToast('已保存应用领域关联');
  };

  return (
    <div className="relative flex min-h-[560px] w-full flex-1 flex-row overflow-hidden">
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

      {/* 左侧：国民经济行业分类 */}
      <aside className="flex w-[220px] shrink-0 flex-col overflow-hidden rounded-l-xl border-r border-gray-200 bg-white xl:w-[240px]">
        <div className="shrink-0 border-b border-teal-100/80 bg-gradient-to-r from-teal-50/90 via-white to-teal-50/40 px-3 py-3">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-teal-600/70"
              aria-hidden
            />
            <input
              type="search"
              value={treeKeyword}
              onChange={(e) => setTreeKeyword(e.target.value)}
              placeholder="搜索行业"
              className={cn(workbenchTextInputClass, 'h-8 pl-8 text-xs')}
            />
          </div>
          <p className="mt-2.5 text-xs font-black text-gray-900">国民经济行业分类</p>
          <p className="mt-0.5 text-[10px] font-bold leading-snug text-gray-500">行业名称前请加编号</p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto py-2">
          <button
            type="button"
            onClick={() => setIndustryFilter(null)}
            className={cn(
              'mx-2 mb-1 w-[calc(100%-1rem)] rounded px-2 py-1.5 text-left text-xs transition',
              industryFilter === null
                ? 'bg-teal-50 font-black text-teal-900'
                : 'font-bold text-gray-600 hover:bg-gray-50'
            )}
          >
            全部行业
          </button>
          {renderTree(filteredTree)}
        </div>
      </aside>

      {/* 右侧：筛选 + 表格 */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-white">
        <WorkbenchListQueryBar className="m-3 mb-0 shrink-0 sm:m-4 sm:mb-0">
          <WorkbenchListQueryField label="产品名称" className="min-w-[10rem]">
            <WorkbenchListQueryInput
              value={draftName}
              onChange={setDraftName}
              placeholder="请输入"
            />
          </WorkbenchListQueryField>
          <WorkbenchListQueryField label="产品代码" className="min-w-[10rem]">
            <WorkbenchListQueryInput
              value={draftCode}
              onChange={setDraftCode}
              placeholder="请输入"
            />
          </WorkbenchListQueryField>
          <WorkbenchListQueryActions onSearch={handleQuery} onReset={handleReset} />
        </WorkbenchListQueryBar>

        <div className="flex shrink-0 flex-wrap items-center gap-2 px-3 py-2.5 sm:px-4">
          <button type="button" onClick={openCreate} className={btnPrimary}>
            <Plus className="h-4 w-4" aria-hidden />
            新增
          </button>
          <button
            type="button"
            onClick={openApplicationFieldsModal}
            disabled={!selectedIndustryIsL4}
            title={
              selectedIndustryIsL4
                ? '为当前第四级行业配置关联应用领域'
                : '请先在左侧选择第四级行业（小类）'
            }
            className={cn(
              btnDefault,
              !selectedIndustryIsL4 && 'cursor-not-allowed opacity-50'
            )}
          >
            应用领域
          </button>
          {selectedIndustryIsL4 ? (
            <p className="text-[11px] font-bold text-teal-800">
              {selectedL4ApplicationFields.length > 0
                ? `已关联：${formatApplicationFieldsList(selectedL4ApplicationFields)}`
                : '暂未关联应用领域，点击「应用领域」进行配置'}
            </p>
          ) : null}
          {filtered.length === 0 ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] font-bold text-amber-900">
              当前筛选无数据；可点「全部行业」或「新增」
            </p>
          ) : null}
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-auto px-3 pb-3 sm:px-4 sm:pb-4">
          <div className="min-h-0 flex-1 overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[1280px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/90 text-[11px] font-black uppercase tracking-wide text-gray-500">
                  <th className="whitespace-nowrap px-3 py-3 text-center">序号</th>
                  <th className="whitespace-nowrap px-3 py-3">产品代码</th>
                  <th className="whitespace-nowrap px-3 py-3">产品名称</th>
                  <th className="whitespace-nowrap px-3 py-3 text-center">产品计量单位</th>
                  <th className="min-w-[14rem] px-3 py-3">行业类别</th>
                  {STANDARD_COLUMNS.map((col, i) => (
                    <th key={`${col.label}-${i}`} className="whitespace-nowrap px-3 py-3 text-center">
                      {col.label}
                    </th>
                  ))}
                  <th className="sticky right-0 whitespace-nowrap bg-gray-50/95 px-3 py-3 text-right shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.08)]">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageRows.length === 0 ? (
                  <tr>
                    <td colSpan={15} className="px-3 py-12 text-center text-xs font-bold text-gray-400">
                      暂无数据，可调整筛选条件或点击「新增」
                    </td>
                  </tr>
                ) : (
                  pageRows.map((row, idx) => (
                    <tr key={row.id} className="border-b border-gray-50 hover:bg-teal-50/15">
                      <td className="whitespace-nowrap px-3 py-3 text-center text-[11px] font-bold text-gray-500">
                        {(safePage - 1) * pageSize + idx + 1}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 font-mono text-[11px] text-gray-600">
                        {row.productCode}
                      </td>
                      <td className="max-w-[8rem] px-3 py-3 font-black text-gray-900">
                        <span className="line-clamp-2">{row.productName}</span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-center text-xs font-bold text-gray-600">
                        {row.measureUnit?.trim() ? row.measureUnit : '—'}
                      </td>
                      <td className="max-w-[14rem] px-3 py-3 text-[10px] font-bold leading-relaxed text-gray-600">
                        <span className="line-clamp-3">{formatQuotaIndustryCategoryPath(row)}</span>
                      </td>
                      {STANDARD_COLUMNS.map((col, i) => {
                        const triple = row[col.key] ?? EMPTY_QUOTA_STANDARD_TRIPLE;
                        return (
                          <td
                            key={`${row.id}-${i}`}
                            className="whitespace-nowrap px-3 py-3 text-center text-[11px] font-bold text-gray-700"
                          >
                            {displayQuotaStandardCell(triple[col.field])}
                          </td>
                        );
                      })}
                      <td className="sticky right-0 whitespace-nowrap bg-white px-3 py-3 text-right shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.06)]">
                        <button
                          type="button"
                          onClick={() => openEdit(row)}
                          className="mr-1 inline-flex items-center gap-0.5 rounded-lg border border-teal-200 px-2 py-1 text-[11px] font-black text-teal-800 hover:bg-teal-50"
                        >
                          <Pencil className="h-3 w-3" aria-hidden />
                          编辑
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(row)}
                          className="inline-flex items-center gap-0.5 rounded-lg border border-red-200 px-2 py-1 text-[11px] font-black text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" aria-hidden />
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
            className="mt-3 shrink-0"
            page={safePage}
            pageSize={pageSize}
            total={filtered.length}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        </div>
      </div>

      <AnimatePresence>
        {appFieldModalOpen && industryFilter && selectedIndustryIsL4 ? (
          <motion.div
            className="fixed inset-0 z-[125] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="quota-l4-application-fields-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-gray-900/45"
              aria-hidden
              onClick={() => setAppFieldModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="relative w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-5 shadow-xl sm:p-6"
            >
              <h3 id="quota-l4-application-fields-title" className="text-base font-black text-gray-900">
                关联应用领域
              </h3>
              <p className="mt-1 text-[11px] font-bold leading-relaxed text-gray-500">
                当前行业（第四级）：{selectedIndustryPathLabel}
              </p>
              {selectedL4ApplicationFields.length > 0 ? (
                <p className="mt-2 rounded-lg border border-teal-100 bg-teal-50/60 px-3 py-2 text-[11px] font-bold text-teal-900">
                  已选择：{formatApplicationFieldsList(selectedL4ApplicationFields)}
                </p>
              ) : null}
              <div className="mt-4">
                <ApplicationFieldTagGroup
                  label="请选择需要关联的应用领域（可多选）"
                  value={appFieldDraft}
                  onChange={setAppFieldDraft}
                />
              </div>
              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => setAppFieldModalOpen(false)}
                  className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-black text-gray-600 hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={saveApplicationFields}
                  className="flex-1 rounded-xl bg-teal-600 py-2.5 text-sm font-black text-white shadow-md hover:bg-teal-700"
                >
                  保存
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

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
            <div
              className="absolute inset-0 bg-gray-900/45"
              aria-hidden
              onClick={closeModal}
            />
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="relative max-h-[min(92vh,44rem)] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gray-200 bg-white p-5 shadow-xl sm:p-6"
            >
              <h3 className="text-base font-black text-gray-900">
                {editingId ? '编辑定额产品' : '新增定额产品'}
              </h3>
              <p className="mt-1 text-[11px] font-bold text-gray-500">
                行业类别：{formatQuotaIndustryCategoryPath(form)}
              </p>
              {formError ? (
                <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
                  {formError}
                </p>
              ) : null}
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-black text-gray-700">
                    产品代码 <span className="text-red-500">*</span>
                  </span>
                  <input
                    className={inputClass}
                    value={form.productCode}
                    onChange={(e) => setForm((f) => ({ ...f, productCode: e.target.value }))}
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-black text-gray-700">
                    产品名称 <span className="text-red-500">*</span>
                  </span>
                  <input
                    className={inputClass}
                    value={form.productName}
                    onChange={(e) => setForm((f) => ({ ...f, productName: e.target.value }))}
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-xs font-black text-gray-700">产品计量单位</span>
                  <input
                    className={inputClass}
                    value={form.measureUnit}
                    onChange={(e) => setForm((f) => ({ ...f, measureUnit: e.target.value }))}
                    placeholder="如 t、m³"
                  />
                </label>
              </div>
              <div className="mt-4 space-y-3">
                <TripleFields
                  title="省标"
                  value={form.provincial}
                  onChange={(provincial) => setForm((f) => ({ ...f, provincial }))}
                />
                <TripleFields
                  title="国标"
                  value={form.national}
                  onChange={(national) => setForm((f) => ({ ...f, national }))}
                />
                <TripleFields
                  title="其他"
                  value={form.other}
                  onChange={(other) => setForm((f) => ({ ...f, other }))}
                />
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
                  className="flex-1 rounded-xl bg-teal-600 py-2.5 text-sm font-black text-white shadow-md hover:bg-teal-700"
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
