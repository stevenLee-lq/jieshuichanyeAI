import React, { useCallback, useMemo, useState } from 'react';
import { cn } from './lib/utils';
import {
  useWorkbenchListQueryPair,
  WorkbenchListQueryActions,
  WorkbenchListQueryBar,
  WorkbenchListQueryField,
  WorkbenchListQueryInput,
  WorkbenchListQuerySelect,
} from './workbenchListQuery';
import {
  isWorkbenchApplicationPending,
  WORKBENCH_APPLICATION_STATUSES,
  WORKBENCH_APPLICATION_TYPES,
  type WorkbenchApplicationRow,
  type WorkbenchApplicationType,
} from './workbenchApplications';
import {
  useWorkbenchListPagination,
  WorkbenchListPagination,
} from './workbenchListPagination';
import {
  WorkbenchApplicationDetailView,
  WorkbenchApplicationsTable,
} from './workbenchApplicationViews';

type ReviewListTab = 'pending' | 'all';
type TypeFilter = '全部' | WorkbenchApplicationType;
type StatusFilter = '全部' | (typeof WORKBENCH_APPLICATION_STATUSES)[number];

export function WorkbenchMyReviewsPanel({
  applications,
  onDecide,
}: {
  applications: WorkbenchApplicationRow[];
  onDecide: (id: string, outcome: '已通过' | '已驳回', rejectReason?: string) => void;
}) {
  const [listTab, setListTab] = useState<ReviewListTab>('pending');
  const { draft, patchDraft, applied, applySearch, resetSearch, patchAndApply } = useWorkbenchListQueryPair({
    type: '全部',
    status: '全部',
    applicant: '',
    submittedAt: '',
    process: '',
  });
  const [detailId, setDetailId] = useState<string | null>(null);

  const detailRow = detailId ? applications.find((r) => r.id === detailId) ?? null : null;

  const baseList = useMemo(() => {
    if (listTab === 'pending') {
      return applications.filter((r) => isWorkbenchApplicationPending(r.status));
    }
    return applications;
  }, [applications, listTab]);

  const filtered = useMemo(() => {
    const typeFilter = applied.type as TypeFilter;
    const statusFilter = applied.status as StatusFilter;
    const applicantQ = applied.applicant.trim().toLowerCase();
    const submittedQ = applied.submittedAt.trim().toLowerCase();
    const processQ = applied.process.trim().toLowerCase();
    return baseList.filter((r) => {
      if (typeFilter !== '全部' && r.type !== typeFilter) return false;
      if (statusFilter !== '全部' && r.status !== statusFilter) return false;
      if (applicantQ && !r.applicant.toLowerCase().includes(applicantQ)) return false;
      if (submittedQ && !r.submittedAt.toLowerCase().includes(submittedQ)) return false;
      if (processQ && !r.processName.toLowerCase().includes(processQ)) return false;
      return true;
    });
  }, [applied, baseList]);

  const pendingCount = useMemo(
    () => applications.filter((r) => isWorkbenchApplicationPending(r.status)).length,
    [applications]
  );

  const statusOptions = useMemo((): StatusFilter[] => {
    if (listTab === 'pending') {
      const set = new Set<StatusFilter>(['全部']);
      baseList.forEach((r) => {
        if (WORKBENCH_APPLICATION_STATUSES.includes(r.status as StatusFilter)) {
          set.add(r.status as StatusFilter);
        }
      });
      return ['全部', ...WORKBENCH_APPLICATION_STATUSES.filter((s) => set.has(s))];
    }
    return ['全部', ...WORKBENCH_APPLICATION_STATUSES];
  }, [baseList, listTab]);

  const rowActionLabel = useCallback(
    (row: WorkbenchApplicationRow) => (isWorkbenchApplicationPending(row.status) ? '审核' : '查看'),
    []
  );

  const { page, pageSize, pageItems, total, setPage, setPageSize } = useWorkbenchListPagination(
    filtered,
    [listTab, applied.type, applied.status, applied.applicant, applied.submittedAt, applied.process]
  );

  const handleSearch = useCallback(() => {
    applySearch();
    setPage(1);
  }, [applySearch, setPage]);

  const handleReset = useCallback(() => {
    resetSearch();
    setPage(1);
  }, [resetSearch, setPage]);

  if (detailRow) {
    return (
      <WorkbenchApplicationDetailView
        row={detailRow}
        variant="reviewer"
        onBack={() => setDetailId(null)}
        onDecide={onDecide}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50/80 p-0.5">
          <button
            type="button"
            onClick={() => {
              setListTab('pending');
              patchAndApply({ status: '全部' });
            }}
            className={cn(
              'rounded-md px-4 py-2 text-xs font-black transition',
              listTab === 'pending' ? 'bg-white text-teal-800 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            )}
          >
            待处理
            {pendingCount > 0 ? (
              <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-900">
                {pendingCount}
              </span>
            ) : null}
          </button>
          <button
            type="button"
            onClick={() => setListTab('all')}
            className={cn(
              'rounded-md px-4 py-2 text-xs font-black transition',
              listTab === 'all' ? 'bg-white text-teal-800 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            )}
          >
            全部
          </button>
        </div>
      </div>

      <WorkbenchListQueryBar>
        <WorkbenchListQueryField label="类型">
          <WorkbenchListQuerySelect
            value={draft.type}
            onChange={(v) => patchDraft({ type: v })}
            options={['全部', ...WORKBENCH_APPLICATION_TYPES]}
          />
        </WorkbenchListQueryField>
        <WorkbenchListQueryField label="状态">
          <WorkbenchListQuerySelect
            value={draft.status}
            onChange={(v) => patchDraft({ status: v })}
            options={statusOptions}
          />
        </WorkbenchListQueryField>
        <WorkbenchListQueryField label="申请人">
          <WorkbenchListQueryInput
            value={draft.applicant}
            onChange={(v) => patchDraft({ applicant: v })}
            placeholder="姓名或单位"
          />
        </WorkbenchListQueryField>
        <WorkbenchListQueryField label="提交时间">
          <WorkbenchListQueryInput
            value={draft.submittedAt}
            onChange={(v) => patchDraft({ submittedAt: v })}
            placeholder="如 2025-03"
          />
        </WorkbenchListQueryField>
        <WorkbenchListQueryField label="流程名称" className="min-w-[12rem] sm:min-w-[14rem]">
          <WorkbenchListQueryInput
            value={draft.process}
            onChange={(v) => patchDraft({ process: v })}
            placeholder="流程关键词"
          />
        </WorkbenchListQueryField>
        <WorkbenchListQueryActions onSearch={handleSearch} onReset={handleReset} />
      </WorkbenchListQueryBar>

      <WorkbenchApplicationsTable
        rows={pageItems}
        onOpenRow={(row) => setDetailId(row.id)}
        actionLabel={rowActionLabel}
      />
      <WorkbenchListPagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
}
