import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from './lib/utils';
import {
  getWorkbenchApplicationFormFields,
  getWorkbenchApplicationReviewOpinion,
  isWorkbenchApplicationPending,
  workbenchApplicationStatusClass,
  type WorkbenchApplicationRow,
} from './workbenchApplications';

export function WorkbenchApplicationFormInfoRow({ label, value }: { label: string; value: string }) {
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

/** 申请表单信息区块（申请人与审核人详情共用） */
export function WorkbenchApplicationFormSection({ row }: { row: WorkbenchApplicationRow }) {
  const formFields = getWorkbenchApplicationFormFields(row);
  return (
    <section className="overflow-hidden rounded-xl border border-gray-200/90 bg-white shadow-sm shadow-teal-900/5">
      <div className="border-b border-gray-100 px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-black text-gray-900">申请表单信息</h3>
          <span
            className={cn(
              'inline-flex rounded-full border px-2 py-0.5 text-[10px] font-black',
              workbenchApplicationStatusClass(row.status)
            )}
          >
            {row.status}
          </span>
        </div>
        <p className="mt-1 text-xs font-bold text-gray-500">{row.processName}</p>
      </div>
      <div className="overflow-hidden border-t border-gray-200">
        {formFields.map((field) => (
          <WorkbenchApplicationFormInfoRow key={field.label} label={field.label} value={field.value} />
        ))}
      </div>
    </section>
  );
}

type ReviewDecideHandler = (
  id: string,
  outcome: '已通过' | '已驳回',
  rejectReason?: string
) => void;

/** 审核意见：待处理可操作；已办结只读展示 */
export function WorkbenchApplicationReviewSection({
  row,
  onDecide,
  onComplete,
}: {
  row: WorkbenchApplicationRow;
  onDecide: ReviewDecideHandler;
  onComplete?: () => void;
}) {
  const pending = isWorkbenchApplicationPending(row.status);
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState<string | null>(null);

  const handleApprove = () => {
    if (!window.confirm(`确定通过申请「${row.processName}」？`)) return;
    onDecide(row.id, '已通过');
    onComplete?.();
  };

  const handleRejectSubmit = () => {
    const reason = rejectReason.trim();
    if (!reason) {
      setRejectError('请填写驳回理由');
      return;
    }
    setRejectError(null);
    if (!window.confirm(`确定驳回申请「${row.processName}」？`)) return;
    onDecide(row.id, '已驳回', reason);
    onComplete?.();
  };

  if (pending) {
    return (
      <section className="rounded-xl border border-teal-100 bg-teal-50/40 p-4 shadow-sm">
        <p className="mb-3 text-xs font-black text-gray-800">审核意见</p>
        {rejectMode ? (
          <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-3">
            <label className="block">
              <span className="text-xs font-black text-gray-700">
                驳回理由 <span className="text-red-500">*</span>
              </span>
              <textarea
                rows={4}
                value={rejectReason}
                onChange={(e) => {
                  setRejectReason(e.target.value);
                  if (rejectError) setRejectError(null);
                }}
                placeholder="请说明驳回原因，将同步至申请人"
                className="mt-1.5 w-full resize-y rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-900 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/30"
              />
            </label>
            {rejectError ? <p className="text-xs font-bold text-red-600">{rejectError}</p> : null}
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setRejectMode(false);
                  setRejectReason('');
                  setRejectError(null);
                }}
                className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-black text-gray-600 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleRejectSubmit}
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-black text-white hover:bg-red-700"
              >
                确认驳回
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleApprove}
              className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-2.5 text-xs font-black text-emerald-900 transition hover:bg-emerald-100"
            >
              通过
            </button>
            <button
              type="button"
              onClick={() => setRejectMode(true)}
              className="rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 text-xs font-black text-red-800 transition hover:bg-red-100"
            >
              驳回
            </button>
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-gray-50/80 p-4">
      <p className="mb-2 text-xs font-black text-gray-800">审核意见</p>
      {row.status === '已通过' ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-900">
          审核结果：已通过
        </p>
      ) : row.status === '已驳回' ? (
        <div className="space-y-2">
          <p className="text-sm font-black text-red-800">审核结果：已驳回</p>
          {row.rejectReason ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold leading-relaxed text-red-800">
              驳回理由：{row.rejectReason}
            </p>
          ) : (
            <p className="text-xs font-bold text-gray-500">未填写驳回理由</p>
          )}
        </div>
      ) : (
        <p className="text-xs font-bold text-gray-600">当前状态：{row.status}</p>
      )}
    </section>
  );
}

/** 申请详情：申请人仅看表单；审核人在表单下增加审核意见区 */
export function WorkbenchApplicationDetailView({
  row,
  variant,
  onBack,
  onDecide,
}: {
  row: WorkbenchApplicationRow;
  variant: 'applicant' | 'reviewer';
  onBack: () => void;
  onDecide?: ReviewDecideHandler;
}) {
  return (
    <motion.div
      key={row.id}
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex min-h-[420px] flex-col"
    >
      <button
        type="button"
        onClick={onBack}
        className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-black text-gray-600 transition hover:border-teal-200 hover:text-teal-700"
      >
        <ChevronLeft className="h-4 w-4" />
        返回列表
      </button>

      <div className="min-h-0 flex-1 space-y-4">
        <WorkbenchApplicationFormSection row={row} />
        {variant === 'applicant' && row.status === '已驳回' ? (
          <section className="rounded-xl border border-red-200 bg-red-50/80 p-4">
            <p className="mb-2 text-xs font-black text-red-800">审核意见</p>
            <p className="text-xs font-bold leading-relaxed text-red-800">
              {getWorkbenchApplicationReviewOpinion(row)}
            </p>
          </section>
        ) : null}
        {variant === 'applicant' && row.status === '已通过' ? (
          <section className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4">
            <p className="mb-1 text-xs font-black text-emerald-900">审核意见</p>
            <p className="text-xs font-bold leading-relaxed text-emerald-900">
              {getWorkbenchApplicationReviewOpinion(row)}
            </p>
          </section>
        ) : null}
        {variant === 'reviewer' && onDecide ? (
          <WorkbenchApplicationReviewSection row={row} onDecide={onDecide} onComplete={onBack} />
        ) : null}
      </div>
    </motion.div>
  );
}

export function WorkbenchApplicationsTable({
  rows,
  onOpenRow,
  actionLabel,
  showReviewOpinion = false,
}: {
  rows: WorkbenchApplicationRow[];
  onOpenRow: (row: WorkbenchApplicationRow) => void;
  /** 固定文案，或按行返回（如待处理显示「审核」） */
  actionLabel: string | ((row: WorkbenchApplicationRow) => string);
  /** 我的申请列表展示审核意见列 */
  showReviewOpinion?: boolean;
}) {
  const colCount = showReviewOpinion ? 8 : 7;
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full min-w-[880px] text-left text-xs">
        <thead className="border-b border-gray-100 bg-gray-50/90 text-[10px] font-black uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-3 py-2.5">单号</th>
            <th className="px-3 py-2.5">申请人</th>
            <th className="px-3 py-2.5">类型</th>
            <th className="px-3 py-2.5">状态</th>
            <th className="px-3 py-2.5">提交时间</th>
            <th className="px-3 py-2.5">流程名称</th>
            {showReviewOpinion ? <th className="min-w-[10rem] px-3 py-2.5">审核意见</th> : null}
            <th className="px-3 py-2.5 text-right">操作</th>
          </tr>
        </thead>
        <tbody className="font-bold text-gray-800">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={colCount} className="px-3 py-12 text-center text-xs font-bold text-gray-400">
                暂无符合条件的记录
              </td>
            </tr>
          ) : (
            rows.map((row) => {
              const label = typeof actionLabel === 'function' ? actionLabel(row) : actionLabel;
              const pending = isWorkbenchApplicationPending(row.status);
              return (
                <tr key={row.id} className="border-b border-gray-50 last:border-0 hover:bg-teal-50/10">
                  <td className="whitespace-nowrap px-3 py-2.5 font-mono text-[10px] text-gray-500">{row.id}</td>
                  <td className="max-w-[8rem] truncate px-3 py-2.5 font-bold text-gray-800">{row.applicant}</td>
                  <td className="whitespace-nowrap px-3 py-2.5">{row.type}</td>
                  <td className="px-3 py-2.5">
                    <span
                      className={cn(
                        'inline-flex rounded-full border px-2 py-0.5 text-[10px] font-black',
                        workbenchApplicationStatusClass(row.status)
                      )}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 tabular-nums text-gray-500">{row.submittedAt}</td>
                  <td className="max-w-[14rem] truncate px-3 py-2.5 text-gray-600">{row.processName}</td>
                  {showReviewOpinion ? (
                    <td className="max-w-[12rem] px-3 py-2.5">
                      <span
                        className={cn(
                          'line-clamp-2 text-[11px] font-bold leading-snug',
                          row.status === '已驳回'
                            ? 'text-red-700'
                            : row.status === '已通过'
                              ? 'text-emerald-800'
                              : 'text-gray-500'
                        )}
                        title={getWorkbenchApplicationReviewOpinion(row)}
                      >
                        {getWorkbenchApplicationReviewOpinion(row)}
                      </span>
                    </td>
                  ) : null}
                  <td className="px-3 py-2.5 text-right">
                    <button
                      type="button"
                      onClick={() => onOpenRow(row)}
                      className={cn(
                        'rounded-lg border px-2.5 py-1 text-[11px] font-black transition',
                        pending
                          ? 'border-teal-200 bg-teal-50 text-teal-800 hover:bg-teal-100'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-teal-200 hover:text-teal-700'
                      )}
                    >
                      {label}
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
