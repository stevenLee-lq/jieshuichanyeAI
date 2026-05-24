import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, Eye, Handshake, Pencil, Plus, Trash2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from './lib/utils';
import {
  APPLICATION_FIELD_FILTER_OPTIONS,
  ENTITY_FILTER_OPTIONS,
  TYPE_FILTER_OPTIONS,
  MATCH_STATUS_FILTER_OPTIONS,
  OUTCOME_MATCH_STATUS_OPTIONS,
  formatOutcomeApplicationFields,
  outcomeMatchesApplicationField,
  type ApplicationFieldFilter,
  type MatchStatusFilter,
  type SupplyDemandOutcome,
} from './supplyDemandOutcomes';
import { ApplicationFieldTagGroup } from './workbenchApplicationFields';
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
import {
  createEmptyDemandForm,
  deletePortalDemand,
  enterpriseName,
  formToOutcome,
  isFinanceFooter,
  listDemandTypeLabel,
  listMatchStatusLabel,
  maxBudgetDisplay,
  nextPortalDemandId,
  outcomeToForm,
  regionCityDisplay,
  markDemandAchievedBySupplier,
  upsertPortalDemand,
  usePortalDemands,
  validUntilDisplay,
  validateDemandForm,
  type WorkbenchDemandFormState,
} from './portalDemandStore';
import { resolvePortalAccountUserName } from './portalAccountUserName';
import type { PortalUserIdentity } from './portalUserIdentity';

const inputClass =
  'mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-bold text-gray-900 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/30';

type PanelMode = 'list' | 'form' | 'view';

function matchStatusBadgeClass(status: string) {
  if (status === '可对接') return 'border-teal-200 bg-teal-50 text-teal-800';
  if (status === '已联系') return 'border-blue-200 bg-blue-50 text-blue-800';
  if (status === '已达成') return 'border-emerald-200 bg-emerald-50 text-emerald-800';
  if (status === '需求取消') return 'border-gray-200 bg-gray-100 text-gray-600';
  return 'border-amber-200 bg-amber-50 text-amber-900';
}

const SUPPLIER_ACHIEVED_HINT =
  '供应商已将状态变更为已达成，若有异议请自行沟通联系。';

function SupplierAchievedHint() {
  return (
    <p className="mt-1.5 max-w-xs text-[11px] font-bold leading-relaxed text-amber-800">
      {SUPPLIER_ACHIEVED_HINT}
    </p>
  );
}

function CooperateConfirmDialog({
  title,
  onCancel,
  onConfirm,
}: {
  title: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="关闭"
        onClick={onCancel}
        className="absolute inset-0 bg-gray-900/45 backdrop-blur-[2px]"
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cooperate-confirm-title"
        className="relative w-full max-w-[440px] overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-xl shadow-teal-900/10"
      >
        <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-teal-50/80 via-white to-cyan-50/50 px-5 py-4">
          <h2 id="cooperate-confirm-title" className="text-base font-black text-gray-900">
            达成合作确认
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-700"
            aria-label="关闭"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4 p-6">
          <p className="text-sm font-bold leading-relaxed text-gray-600">
            需求「{title}」：已完成线下签订合同等事宜视为已达成合作，确认已达成合作？
          </p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-black text-gray-600 hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 px-5 py-2 text-xs font-black text-white shadow-md shadow-teal-600/20"
            >
              确认
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <motion.div layout className="flex flex-col border-b border-gray-200 last:border-b-0 sm:flex-row">
      <motion.div layout className="shrink-0 border-gray-200 bg-[#f5f6f8] px-3 py-2.5 text-xs font-black text-gray-600 sm:w-40 sm:border-r">
        {label}
      </motion.div>
      <motion.div layout className="min-w-0 flex-1 bg-white px-3 py-2.5 text-sm font-medium text-gray-900">
        {value || <span className="text-gray-300">—</span>}
      </motion.div>
    </motion.div>
  );
}

function DemandViewPanel({
  row,
  onBack,
  onEdit,
  showEdit,
  showSupplierHint,
}: {
  row: SupplyDemandOutcome;
  onBack: () => void;
  onEdit: () => void;
  showEdit: boolean;
  showSupplierHint: boolean;
}) {
  const finance = isFinanceFooter(row);
  const status = listMatchStatusLabel(row);
  const showHint = showSupplierHint && row.supplierMarkedAchieved && status === '已达成';
  return (
    <motion.div
      key="view"
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
      className="space-y-4"
    >
      <motion.div layout className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-black text-gray-600 hover:border-teal-200 hover:text-teal-700"
        >
          <ChevronLeft className="h-4 w-4" />
          返回列表
        </button>
        {showEdit ? (
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-xs font-black text-white hover:bg-teal-700"
          >
            <Pencil className="h-3.5 w-3.5" />
            编辑
          </button>
        ) : null}
      </motion.div>
      <motion.section layout className="overflow-hidden rounded-xl border border-gray-200/90 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-4 py-3">
          <h3 className="text-base font-black text-gray-900">{row.title}</h3>
          <span
            className={cn(
              'mt-2 inline-block rounded-md border px-2 py-0.5 text-[11px] font-black',
              matchStatusBadgeClass(status)
            )}
          >
            {status}
          </span>
          {showHint ? <SupplierAchievedHint /> : null}
        </div>
        <div className="overflow-hidden rounded-b-lg border-t border-gray-200">
          <InfoRow label="需求类型" value={listDemandTypeLabel(row)} />
          <InfoRow label="有效时间" value={validUntilDisplay(row)} />
          <InfoRow label="需求企业" value={enterpriseName(row)} />
          <InfoRow label="需求主体" value={row.entity} />
          <InfoRow label="应用领域" value={formatOutcomeApplicationFields(row)} />
          {finance ? (
            <>
              <InfoRow label="融资金额(万元)" value={row.financeAmountWan} />
              <InfoRow label="贷款周期(月)" value={row.loanPeriodMonths} />
            </>
          ) : (
            <>
              <InfoRow label="所属地区" value={regionCityDisplay(row)} />
              <InfoRow label="最高预算" value={maxBudgetDisplay(row)} />
            </>
          )}
          <InfoRow label="需求详情" value={<p className="whitespace-pre-wrap leading-relaxed">{row.description}</p>} />
          <InfoRow label="联系邮箱" value={row.contactEmail} />
          <InfoRow label="联系电话" value={row.contactPhone} />
        </div>
      </motion.section>
    </motion.div>
  );
}

function DemandFormPanel({
  form,
  setForm,
  formError,
  isEdit,
  onBack,
  onSubmit,
}: {
  form: WorkbenchDemandFormState;
  setForm: React.Dispatch<React.SetStateAction<WorkbenchDemandFormState>>;
  formError: string | null;
  isEdit: boolean;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  const entityOptions = ENTITY_FILTER_OPTIONS.filter((o) => o !== '全部') as WorkbenchDemandFormState['entity'][];
  const typeOptions = TYPE_FILTER_OPTIONS.filter((o) => o !== '全部') as WorkbenchDemandFormState['demandType'][];
  const showFinance = form.footerType === 'finance' || form.demandType === '金融需求';

  return (
    <motion.form
      key="form"
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
      onSubmit={onSubmit}
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
          type="submit"
          className="rounded-lg bg-teal-600 px-5 py-2 text-xs font-black text-white hover:bg-teal-700"
        >
          {isEdit ? '保存修改' : '发布需求'}
        </button>
      </div>

      {formError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">{formError}</p>
      ) : null}

      <section className="rounded-xl border border-gray-200/90 bg-white p-4 shadow-sm sm:p-5">
        <h3 className="mb-4 border-l-4 border-teal-600 pl-3 text-sm font-black text-teal-800">
          {isEdit ? '编辑需求' : '新增需求'}
        </h3>
        <motion.div layout className="grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="text-xs font-black text-gray-700">
              需求标题 <span className="text-red-500">*</span>
            </span>
            <input
              className={inputClass}
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="如：园区二次供水泵房节能改造项目采购"
            />
          </label>
          <label>
            <span className="text-xs font-black text-gray-700">
              需求主体 <span className="text-red-500">*</span>
            </span>
            <select
              className={inputClass}
              value={form.entity}
              onChange={(e) => setForm((f) => ({ ...f, entity: e.target.value as WorkbenchDemandFormState['entity'] }))}
            >
              {entityOptions.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="text-xs font-black text-gray-700">
              需求类型 <span className="text-red-500">*</span>
            </span>
            <select
              className={inputClass}
              value={form.demandType}
              onChange={(e) => {
                const demandType = e.target.value as WorkbenchDemandFormState['demandType'];
                setForm((f) => ({
                  ...f,
                  demandType,
                  footerType: demandType === '金融需求' ? 'finance' : 'region_budget',
                }));
              }}
            >
              {typeOptions.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </label>
          <label className="sm:col-span-2">
            <span className="text-xs font-black text-gray-700">需求简介</span>
            <input
              className={inputClass}
              value={form.demandListTypeLabel}
              onChange={(e) => setForm((f) => ({ ...f, demandListTypeLabel: e.target.value }))}
              placeholder="选填，简要说明需求背景与目标"
            />
          </label>
          <label className="sm:col-span-2">
            <span className="text-xs font-black text-gray-700">
              需求企业 <span className="text-red-500">*</span>
            </span>
            <input
              className={inputClass}
              value={form.demandEnterprise}
              onChange={(e) => setForm((f) => ({ ...f, demandEnterprise: e.target.value }))}
            />
          </label>
          <div className="sm:col-span-2">
            <ApplicationFieldTagGroup
              label="应用领域"
              required
              value={form.applicationFields}
              onChange={(applicationFields) => setForm((f) => ({ ...f, applicationFields }))}
            />
          </div>
          <label>
            <span className="text-xs font-black text-gray-700">对接状态</span>
            <select
              className={inputClass}
              value={form.matchStatus}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  matchStatus: e.target.value as WorkbenchDemandFormState['matchStatus'],
                }))
              }
            >
              {OUTCOME_MATCH_STATUS_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="text-xs font-black text-gray-700">有效时间</span>
            <input
              className={inputClass}
              value={form.validUntilLabel}
              onChange={(e) => setForm((f) => ({ ...f, validUntilLabel: e.target.value }))}
              placeholder="长期有效 或 2026-06-30"
            />
          </label>
          {showFinance ? (
            <>
              <label>
                <span className="text-xs font-black text-gray-700">
                  融资金额(万元) <span className="text-red-500">*</span>
                </span>
                <input
                  className={inputClass}
                  value={form.financeAmountWan}
                  onChange={(e) => setForm((f) => ({ ...f, financeAmountWan: e.target.value }))}
                />
              </label>
              <label>
                <span className="text-xs font-black text-gray-700">
                  贷款周期(月) <span className="text-red-500">*</span>
                </span>
                <input
                  className={inputClass}
                  value={form.loanPeriodMonths}
                  onChange={(e) => setForm((f) => ({ ...f, loanPeriodMonths: e.target.value }))}
                />
              </label>
            </>
          ) : (
            <>
              <label>
                <span className="text-xs font-black text-gray-700">
                  所属地区 <span className="text-red-500">*</span>
                </span>
                <input
                  className={inputClass}
                  value={form.regionCity}
                  onChange={(e) => setForm((f) => ({ ...f, regionCity: e.target.value }))}
                  placeholder="如：南京市"
                />
              </label>
              <label>
                <span className="text-xs font-black text-gray-700">最高预算</span>
                <input
                  className={inputClass}
                  value={form.maxBudgetShort}
                  onChange={(e) => setForm((f) => ({ ...f, maxBudgetShort: e.target.value }))}
                  placeholder="面议"
                />
              </label>
            </>
          )}
          <label className="sm:col-span-2">
            <span className="text-xs font-black text-gray-700">
              需求详情 <span className="text-red-500">*</span>
            </span>
            <textarea
              className={cn(inputClass, 'min-h-[120px] resize-y')}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </label>
          <label>
            <span className="text-xs font-black text-gray-700">联系邮箱</span>
            <input
              className={inputClass}
              value={form.contactEmail}
              onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))}
            />
          </label>
          <label>
            <span className="text-xs font-black text-gray-700">联系电话</span>
            <input
              className={inputClass}
              value={form.contactPhone}
              onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))}
            />
          </label>
        </motion.div>
      </section>
    </motion.form>
  );
}

export function WorkbenchDemandCenterPanel({
  portalUserIdentity = '系统管理员',
  initialOpenCreate = false,
  onInitialOpenCreateConsumed,
  highlightDemandId = null,
  onHighlightConsumed,
}: {
  portalUserIdentity?: PortalUserIdentity;
  initialOpenCreate?: boolean;
  onInitialOpenCreateConsumed?: () => void;
  /** 从「我的消息」定位到列表中的需求 */
  highlightDemandId?: number | null;
  onHighlightConsumed?: () => void;
}) {
  const isIndustryEntity = portalUserIdentity === '产业主体';
  const isWaterUser = portalUserIdentity === '用水户主体';
  const canManageDemands = !isIndustryEntity;
  const defaultDemandEnterprise = useMemo(
    () => resolvePortalAccountUserName(portalUserIdentity),
    [portalUserIdentity]
  );
  const demands = usePortalDemands();
  const [mode, setMode] = useState<PanelMode>('list');
  const { draft, patchDraft, applied, applySearch, resetSearch } = useWorkbenchListQueryPair({
    title: '',
    type: '全部',
    applicationField: '全部',
    enterprise: '',
    matchStatus: '全部',
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [viewId, setViewId] = useState<number | null>(null);
  const [form, setForm] = useState<WorkbenchDemandFormState>(() => createEmptyDemandForm());
  const [formError, setFormError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [cooperateTarget, setCooperateTarget] = useState<SupplyDemandOutcome | null>(null);

  const viewing = useMemo(() => demands.find((d) => d.id === viewId) ?? null, [demands, viewId]);
  const editing = useMemo(() => demands.find((d) => d.id === editingId) ?? null, [demands, editingId]);

  useEffect(() => {
    if (highlightDemandId == null) return;
    const row = demands.find((d) => d.id === highlightDemandId);
    if (row) {
      setMode('view');
      setViewId(highlightDemandId);
      setEditingId(null);
    }
    onHighlightConsumed?.();
  }, [demands, highlightDemandId, onHighlightConsumed]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  const openCreate = useCallback(() => {
    setEditingId(null);
    setViewId(null);
    setForm(createEmptyDemandForm({ demandEnterprise: defaultDemandEnterprise }));
    setFormError(null);
    setMode('form');
  }, [defaultDemandEnterprise]);

  useEffect(() => {
    if (!initialOpenCreate) return;
    openCreate();
    onInitialOpenCreateConsumed?.();
  }, [initialOpenCreate, openCreate, onInitialOpenCreateConsumed]);

  const openEdit = useCallback((row: SupplyDemandOutcome) => {
    setEditingId(row.id);
    setViewId(null);
    setForm(outcomeToForm(row));
    setFormError(null);
    setMode('form');
  }, []);

  const openView = useCallback((row: SupplyDemandOutcome) => {
    setViewId(row.id);
    setEditingId(null);
    setMode('view');
  }, []);

  const backToList = useCallback(() => {
    setMode('list');
    setEditingId(null);
    setViewId(null);
    setFormError(null);
  }, []);

  const filtered = useMemo(() => {
    const typeFilter = applied.type as (typeof TYPE_FILTER_OPTIONS)[number];
    const applicationFieldFilter = applied.applicationField as ApplicationFieldFilter;
    const matchStatusFilter = applied.matchStatus as MatchStatusFilter;
    const titleQ = applied.title.trim().toLowerCase();
    const entQ = applied.enterprise.trim().toLowerCase();
    return demands.filter((x) => {
      if (!outcomeMatchesApplicationField(x, applicationFieldFilter)) return false;
      if (typeFilter !== '全部' && listDemandTypeLabel(x) !== typeFilter) return false;
      if (matchStatusFilter !== '全部' && listMatchStatusLabel(x) !== matchStatusFilter) return false;
      if (titleQ && !x.title.toLowerCase().includes(titleQ)) return false;
      if (entQ && !enterpriseName(x).toLowerCase().includes(entQ)) return false;
      return true;
    });
  }, [applied, demands]);

  const { page, pageSize, pageItems, total, setPage, setPageSize } = useWorkbenchListPagination(
    filtered,
    [applied.title, applied.type, applied.applicationField, applied.enterprise, applied.matchStatus]
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
    (row: SupplyDemandOutcome) => {
      if (!window.confirm(`确定删除需求「${row.title}」？删除后门户需求中心将不再展示。`)) return;
      deletePortalDemand(row.id);
      if (viewId === row.id || editingId === row.id) backToList();
      showToast('已删除');
    },
    [backToList, editingId, showToast, viewId]
  );

  const confirmCooperate = useCallback(() => {
    if (!cooperateTarget) return;
    markDemandAchievedBySupplier(cooperateTarget.id);
    setCooperateTarget(null);
    showToast('已标记为达成合作，门户需求状态已同步更新');
  }, [cooperateTarget, showToast]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const err = validateDemandForm(form);
      if (err) {
        setFormError(err);
        return;
      }
      setFormError(null);
      const id = editingId ?? nextPortalDemandId();
      const existing = editing ?? undefined;
      const row = formToOutcome(form, id, existing);
      upsertPortalDemand(row);
      showToast(editingId ? '需求已更新，门户需求中心将同步展示' : '需求已发布');
      backToList();
    },
    [backToList, editing, editingId, form, showToast]
  );

  return (
    <div className="relative">
      {cooperateTarget ? (
        <CooperateConfirmDialog
          title={cooperateTarget.title}
          onCancel={() => setCooperateTarget(null)}
          onConfirm={confirmCooperate}
        />
      ) : null}
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
          <DemandViewPanel
            row={viewing}
            onBack={backToList}
            onEdit={() => openEdit(viewing)}
            showEdit={canManageDemands}
            showSupplierHint={isWaterUser}
          />
        ) : mode === 'form' ? (
          <DemandFormPanel
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
            {canManageDemands ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="button"
                  onClick={openCreate}
                  className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-black text-white shadow-md hover:bg-teal-700"
                >
                  <Plus className="h-4 w-4" />
                  新增需求
                </button>
              </div>
            ) : null}

            <WorkbenchListQueryBar>
              <WorkbenchListQueryField label="需求标题">
                <WorkbenchListQueryInput
                  value={draft.title}
                  onChange={(v) => patchDraft({ title: v })}
                  placeholder="标题关键词"
                />
              </WorkbenchListQueryField>
              <WorkbenchListQueryField label="需求类型">
                <WorkbenchListQuerySelect
                  value={draft.type}
                  onChange={(v) => patchDraft({ type: v })}
                  options={TYPE_FILTER_OPTIONS}
                />
              </WorkbenchListQueryField>
              <WorkbenchListQueryField label="应用领域">
                <WorkbenchListQuerySelect
                  value={draft.applicationField}
                  onChange={(v) => patchDraft({ applicationField: v })}
                  options={APPLICATION_FIELD_FILTER_OPTIONS}
                  ariaLabel="应用领域筛选"
                />
              </WorkbenchListQueryField>
              <WorkbenchListQueryField label="需求企业">
                <WorkbenchListQueryInput
                  value={draft.enterprise}
                  onChange={(v) => patchDraft({ enterprise: v })}
                  placeholder="企业名称"
                />
              </WorkbenchListQueryField>
              <WorkbenchListQueryField label="对接状态">
                <WorkbenchListQuerySelect
                  value={draft.matchStatus}
                  onChange={(v) => patchDraft({ matchStatus: v })}
                  options={MATCH_STATUS_FILTER_OPTIONS}
                />
              </WorkbenchListQueryField>
              <WorkbenchListQueryActions onSearch={handleSearch} onReset={handleReset} />
            </WorkbenchListQueryBar>

            <div className="overflow-hidden rounded-xl border border-gray-200">
              <div className="overflow-x-auto">
              <table className="w-full min-w-[880px] text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/90 text-[11px] font-black uppercase tracking-wide text-gray-500">
                    <th className="px-3 py-3">需求标题</th>
                    <th className="px-3 py-3">需求类型</th>
                    <th className="px-3 py-3">应用领域</th>
                    <th className="px-3 py-3">需求企业</th>
                    <th className="px-3 py-3">对接状态</th>
                    <th className="px-3 py-3">有效时间</th>
                    <th className="px-3 py-3">地区/预算</th>
                    <th className="px-3 py-3 text-right">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {total === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-xs font-bold text-gray-400">
                        暂无需求，点击「新增需求」发布
                      </td>
                    </tr>
                  ) : (
                    pageItems.map((row) => {
                      const finance = isFinanceFooter(row);
                      const sub = finance
                        ? `${row.financeAmountWan ?? '—'}万 / ${row.loanPeriodMonths ?? '—'}月`
                        : `${regionCityDisplay(row)} · ${maxBudgetDisplay(row)}`;
                      const status = listMatchStatusLabel(row);
                      return (
                        <tr
                          key={row.id}
                          className={cn(
                            'border-b border-gray-100 last:border-0 hover:bg-teal-50/30',
                            highlightDemandId === row.id && 'bg-teal-50/60 ring-1 ring-inset ring-teal-300'
                          )}
                        >
                          <td className="max-w-[200px] px-3 py-3 font-bold text-gray-900">
                            <span className="line-clamp-2">{row.title}</span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-3 font-medium text-gray-700">
                            {listDemandTypeLabel(row)}
                          </td>
                          <td className="max-w-[120px] px-3 py-3 text-xs font-bold text-gray-600">
                            <span className="line-clamp-2">{formatOutcomeApplicationFields(row)}</span>
                          </td>
                          <td className="max-w-[140px] px-3 py-3 font-medium text-gray-700">
                            <span className="line-clamp-2">{enterpriseName(row)}</span>
                          </td>
                          <td className="px-3 py-3">
                            <span
                              className={cn(
                                'inline-block rounded-md border px-2 py-0.5 text-[10px] font-black',
                                matchStatusBadgeClass(status)
                              )}
                            >
                              {status}
                            </span>
                            {isWaterUser && row.supplierMarkedAchieved && status === '已达成' ? (
                              <SupplierAchievedHint />
                            ) : null}
                          </td>
                          <td className="whitespace-nowrap px-3 py-3 text-gray-600">{validUntilDisplay(row)}</td>
                          <td className="whitespace-nowrap px-3 py-3 text-xs font-bold text-teal-700">{sub}</td>
                          <td className="whitespace-nowrap px-3 py-3 text-right">
                            <div className="inline-flex flex-wrap items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => openView(row)}
                                className="rounded-lg px-2.5 py-1.5 text-[11px] font-black text-gray-600 hover:bg-gray-100 hover:text-teal-700"
                                title="查看"
                              >
                                <span className="inline-flex items-center gap-1">
                                  <Eye className="h-3.5 w-3.5" />
                                  查看
                                </span>
                              </button>
                              {isIndustryEntity ? (
                                status === '可对接' || status === '已联系' ? (
                                  <button
                                    type="button"
                                    onClick={() => setCooperateTarget(row)}
                                    className="rounded-lg border border-teal-200 bg-teal-50 px-2.5 py-1.5 text-[11px] font-black text-teal-800 hover:bg-teal-100"
                                    title="达成合作"
                                  >
                                    <span className="inline-flex items-center gap-1">
                                      <Handshake className="h-3.5 w-3.5" />
                                      达成合作
                                    </span>
                                  </button>
                                ) : null
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => openEdit(row)}
                                    className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-teal-700"
                                    title="编辑"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDelete(row)}
                                    className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
                                    title="删除"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                            </div>
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
