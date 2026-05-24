import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { PortalUserIdentity } from './portalUserIdentity';
import {
  useWorkbenchListQueryPair,
  WorkbenchListQueryActions,
  WorkbenchListQueryBar,
  WorkbenchListQueryField,
  WorkbenchListQueryInput,
  WorkbenchListQuerySelect,
} from './workbenchListQuery';
import {
  WORKBENCH_APPLICATION_STATUSES,
  workbenchApplicationTypeFilterOptions,
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

type TypeFilter = '全部' | WorkbenchApplicationType;
type StatusFilter = '全部' | (typeof WORKBENCH_APPLICATION_STATUSES)[number];

const MY_APPLICATIONS_QUERY_INIT = {
  type: '全部',
  status: '全部',
  process: '',
} as const;

export function WorkbenchMyApplicationsPanel({
  applications,
  portalUserIdentity,
  initialOpenDetailId,
  onInitialOpenDetailConsumed,
}: {
  applications: WorkbenchApplicationRow[];
  portalUserIdentity: PortalUserIdentity;
  /** 从「我的消息」等入口直达申请详情 */
  initialOpenDetailId?: string | null;
  onInitialOpenDetailConsumed?: () => void;
}) {
  const { draft, patchDraft, applied, applySearch, resetSearch } =
    useWorkbenchListQueryPair(MY_APPLICATIONS_QUERY_INIT);
  const [detailId, setDetailId] = useState<string | null>(null);

  useEffect(() => {
    if (!initialOpenDetailId) return;
    const row = applications.find((r) => r.id === initialOpenDetailId);
    if (row) setDetailId(initialOpenDetailId);
    onInitialOpenDetailConsumed?.();
  }, [initialOpenDetailId, applications]);

  const typeOptions = useMemo(
    () => workbenchApplicationTypeFilterOptions(portalUserIdentity),
    [portalUserIdentity]
  );

  const detailRow = detailId ? applications.find((r) => r.id === detailId) ?? null : null;

  const filtered = useMemo(() => {
    const typeFilter = applied.type as TypeFilter;
    const statusFilter = applied.status as StatusFilter;
    const q = applied.process.trim().toLowerCase();
    return applications.filter((r) => {
      if (typeFilter !== '全部' && r.type !== typeFilter) return false;
      if (statusFilter !== '全部' && r.status !== statusFilter) return false;
      if (q && !r.processName.toLowerCase().includes(q) && !r.id.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [applications, applied.process, applied.status, applied.type]);

  const { page, pageSize, pageItems, total, setPage, setPageSize } = useWorkbenchListPagination(
    filtered,
    [applied.type, applied.status, applied.process]
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
        variant="applicant"
        onBack={() => setDetailId(null)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <WorkbenchListQueryBar>
        <WorkbenchListQueryField label="申请类型">
          <WorkbenchListQuerySelect
            value={draft.type}
            onChange={(v) => patchDraft({ type: v })}
            options={typeOptions}
          />
        </WorkbenchListQueryField>
        <WorkbenchListQueryField label="申请状态">
          <WorkbenchListQuerySelect
            value={draft.status}
            onChange={(v) => patchDraft({ status: v })}
            options={['全部', ...WORKBENCH_APPLICATION_STATUSES]}
          />
        </WorkbenchListQueryField>
        <WorkbenchListQueryField label="流程名称" className="min-w-[12rem] sm:min-w-[14rem]">
          <WorkbenchListQueryInput
            value={draft.process}
            onChange={(v) => patchDraft({ process: v })}
            placeholder="流程或单号关键词"
          />
        </WorkbenchListQueryField>
        <WorkbenchListQueryActions onSearch={handleSearch} onReset={handleReset} />
      </WorkbenchListQueryBar>

      <WorkbenchApplicationsTable
        rows={pageItems}
        onOpenRow={(row) => setDetailId(row.id)}
        actionLabel="查看详情"
        showReviewOpinion
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
