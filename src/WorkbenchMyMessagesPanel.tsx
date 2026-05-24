import React, { useCallback, useMemo } from 'react';
import { ClipboardCheck, MapPin, Package, PhoneCall, ScrollText, Store } from 'lucide-react';
import { cn } from './lib/utils';
import type { PortalUserIdentity } from './portalUserIdentity';
import {
  confirmContactMessage,
  filterMessagesForIdentity,
  formatContactMessageTime,
  usePortalContactMessages,
  type PortalContactMessage,
} from './portalContactMessagesStore';
import {
  resolveWorkbenchApplicationIdForMessage,
  type WorkbenchApplicationRow,
} from './workbenchApplications';
import {
  PORTAL_MESSAGE_KIND_LABELS,
  messageKindBadgeClass,
  messageKindFilterOptionsForIdentity,
  messageKindFromFilterLabel,
  type PortalContactMessageKind,
} from './portalWorkbenchMessages';
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

const QUERY_INIT = {
  kind: '全部',
  status: '全部',
  title: '',
  peer: '',
} as const;

function contactStatusLabel(item: PortalContactMessage, isSystemAdmin: boolean): string {
  if (isSystemAdmin) return item.confirmedAt ? '已处理' : '待处理';
  return item.confirmedAt ? '已确认联系' : '待确认联系';
}

function contactStatusClass(item: PortalContactMessage): string {
  return item.confirmedAt
    ? 'border-gray-200 bg-gray-50 text-gray-600'
    : 'border-amber-200 bg-amber-50 text-amber-900';
}

function contactStatusFilterOptions(isSystemAdmin: boolean): string[] {
  if (isSystemAdmin) return ['全部', '待处理', '已处理'];
  return ['全部', '待确认联系', '已确认联系'];
}

/** 仅需求类、供给类保留「确认联系」 */
function messageSupportsConfirmContact(kind: PortalContactMessageKind): boolean {
  return kind === 'demand' || kind === 'supply';
}

export function WorkbenchMyMessagesPanel({
  portalUserIdentity,
  applications,
  onLocateDemand,
  onOpenProduct,
  onGoApproval,
  onViewCase,
  onGoEnterprise,
  onViewApplicationProgress,
}: {
  portalUserIdentity: PortalUserIdentity;
  /** 用水户「查看进度」需解析关联申请单 */
  applications?: readonly WorkbenchApplicationRow[];
  onLocateDemand: (demandId: number) => void;
  onOpenProduct: (item: PortalContactMessage) => void;
  onGoApproval?: () => void;
  onViewCase?: (caseId: number) => void;
  onGoEnterprise?: () => void;
  /** 用水户典型案例类：跳转「我的申请」详情 */
  onViewApplicationProgress?: (applicationId: string) => void;
}) {
  const all = usePortalContactMessages();
  const kindFilterOptions = useMemo(
    () => messageKindFilterOptionsForIdentity(portalUserIdentity),
    [portalUserIdentity]
  );
  const isSystemAdmin = portalUserIdentity === '系统管理员';
  const scoped = useMemo(
    () => filterMessagesForIdentity(all, portalUserIdentity),
    [all, portalUserIdentity]
  );
  const { draft, patchDraft, applied, applySearch, resetSearch } = useWorkbenchListQueryPair({
    ...QUERY_INIT,
    kind: '全部',
  });

  const filtered = useMemo(() => {
    const kind = messageKindFromFilterLabel(applied.kind, portalUserIdentity);
    const status = applied.status as string;
    const titleQ = applied.title.trim().toLowerCase();
    const peerQ = applied.peer.trim().toLowerCase();
    return scoped.filter((m) => {
      if (kind !== '全部' && m.kind !== kind) return false;
      const st = contactStatusLabel(m, isSystemAdmin);
      if (status !== '全部' && st !== status) return false;
      if (titleQ && !m.title.toLowerCase().includes(titleQ)) return false;
      if (peerQ && !m.peerName.toLowerCase().includes(peerQ)) return false;
      return true;
    });
  }, [applied, isSystemAdmin, portalUserIdentity, scoped]);

  const { page, pageSize, pageItems, total, setPage, setPageSize } = useWorkbenchListPagination(
    filtered,
    [applied.kind, applied.status, applied.title, applied.peer, scoped.length, portalUserIdentity]
  );

  const handleSearch = useCallback(() => {
    applySearch();
    setPage(1);
  }, [applySearch, setPage]);

  const handleReset = useCallback(() => {
    resetSearch();
    setPage(1);
  }, [resetSearch, setPage]);

  const emptyHint = useMemo(() => {
    const kinds = kindFilterOptions.filter((k) => k !== '全部').join('、');
    return `暂无相关消息。当前身份可见类型：${kinds}。在供应/需求详情发起联系，或处理平台审批、案例与企业信息通知后将在此展示。`;
  }, [kindFilterOptions]);

  return (
    <div className="space-y-4">
      <WorkbenchListQueryBar>
        <WorkbenchListQueryField label="消息类型">
          <WorkbenchListQuerySelect
            value={draft.kind}
            onChange={(v) => patchDraft({ kind: v })}
            options={kindFilterOptions}
            ariaLabel="消息类型"
          />
        </WorkbenchListQueryField>
        <WorkbenchListQueryField label={isSystemAdmin ? '处理状态' : '联系状态'}>
          <WorkbenchListQuerySelect
            value={draft.status}
            onChange={(v) => patchDraft({ status: v })}
            options={contactStatusFilterOptions(isSystemAdmin)}
          />
        </WorkbenchListQueryField>
        <WorkbenchListQueryField label="标题关键词">
          <WorkbenchListQueryInput
            value={draft.title}
            onChange={(v) => patchDraft({ title: v })}
            placeholder="消息标题"
          />
        </WorkbenchListQueryField>
        <WorkbenchListQueryField label="消息方名称">
          <WorkbenchListQueryInput
            value={draft.peer}
            onChange={(v) => patchDraft({ peer: v })}
            placeholder="消息方名称关键词"
          />
        </WorkbenchListQueryField>
        <WorkbenchListQueryActions onSearch={handleSearch} onReset={handleReset} />
      </WorkbenchListQueryBar>

      <div className="overflow-hidden rounded-xl border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/90 text-[11px] font-black uppercase tracking-wide text-gray-500">
                <th className="px-3 py-3">类型</th>
                <th className="px-3 py-3">标题</th>
                <th className="px-3 py-3">消息方</th>
                <th className="px-3 py-3">{isSystemAdmin ? '处理状态' : '联系状态'}</th>
                <th className="px-3 py-3">发起时间</th>
                <th className="px-3 py-3">{isSystemAdmin ? '处理时间' : '确认时间'}</th>
                <th className="px-3 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {total === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-14 text-center text-xs font-bold text-gray-400">
                    {emptyHint}
                  </td>
                </tr>
              ) : (
                pageItems.map((item) => {
                  const confirmed = Boolean(item.confirmedAt);
                  return (
                    <tr
                      key={item.id}
                      className={cn(
                        'border-b border-gray-100 last:border-0',
                        !confirmed && 'bg-amber-50/20 hover:bg-amber-50/40',
                        confirmed && 'hover:bg-teal-50/30'
                      )}
                    >
                      <td className="whitespace-nowrap px-3 py-3">
                        <span
                          className={cn(
                            'inline-block rounded-md border px-2 py-0.5 text-[10px] font-black',
                            messageKindBadgeClass(item.kind)
                          )}
                        >
                          {PORTAL_MESSAGE_KIND_LABELS[item.kind]}
                        </span>
                      </td>
                      <td className="max-w-[220px] px-3 py-3 font-bold text-gray-900">
                        <span className="line-clamp-2">{item.title}</span>
                        {!confirmed && messageSupportsConfirmContact(item.kind) ? (
                          <p className="mt-1 text-[10px] font-bold leading-snug text-teal-800/90">
                            请确认是否已完成与对方联系或处理
                          </p>
                        ) : null}
                      </td>
                      <td className="max-w-[160px] px-3 py-3 font-medium text-gray-700">
                        <span className="line-clamp-2">
                          消息方：{item.peerName}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
                        <span
                          className={cn(
                            'inline-block rounded-md border px-2 py-0.5 text-[10px] font-black',
                            contactStatusClass(item)
                          )}
                        >
                          {contactStatusLabel(item, isSystemAdmin)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-xs font-bold text-gray-500">
                        {formatContactMessageTime(item.createdAt)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-xs font-bold text-gray-500">
                        {item.confirmedAt ? formatContactMessageTime(item.confirmedAt) : '—'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-right">
                        <div className="inline-flex flex-wrap items-center justify-end gap-1">
                          {!confirmed && messageSupportsConfirmContact(item.kind) ? (
                            <button
                              type="button"
                              onClick={() => confirmContactMessage(item.id)}
                              className="inline-flex items-center gap-1 rounded-lg bg-teal-600 px-2.5 py-1.5 text-[11px] font-black text-white hover:bg-teal-700"
                            >
                              <PhoneCall className="h-3 w-3" aria-hidden />
                              确认联系
                            </button>
                          ) : null}
                          <MessageRowActions
                            item={item}
                            portalUserIdentity={portalUserIdentity}
                            applications={applications}
                            onLocateDemand={onLocateDemand}
                            onOpenProduct={onOpenProduct}
                            onGoApproval={onGoApproval}
                            onViewCase={onViewCase}
                            onGoEnterprise={onGoEnterprise}
                            onViewApplicationProgress={onViewApplicationProgress}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

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

function MessageRowActions({
  item,
  portalUserIdentity,
  applications,
  onLocateDemand,
  onOpenProduct,
  onGoApproval,
  onViewCase,
  onGoEnterprise,
  onViewApplicationProgress,
}: {
  item: PortalContactMessage;
  portalUserIdentity: PortalUserIdentity;
  applications?: readonly WorkbenchApplicationRow[];
  onLocateDemand: (demandId: number) => void;
  onOpenProduct: (item: PortalContactMessage) => void;
  onGoApproval?: () => void;
  onViewCase?: (caseId: number) => void;
  onGoEnterprise?: () => void;
  onViewApplicationProgress?: (applicationId: string) => void;
}) {
  if (item.kind === 'approval' && onGoApproval) {
    return (
      <button
        type="button"
        onClick={onGoApproval}
        className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-[11px] font-black text-rose-800 hover:bg-rose-50"
      >
        <ClipboardCheck className="h-3 w-3" aria-hidden />
        去审核
      </button>
    );
  }
  if (item.kind === 'case') {
    if (portalUserIdentity === '用水户主体' && onViewApplicationProgress && applications) {
      const applicationId = resolveWorkbenchApplicationIdForMessage(item, applications);
      if (applicationId) {
        return (
          <button
            type="button"
            onClick={() => onViewApplicationProgress(applicationId)}
            className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-white px-2.5 py-1.5 text-[11px] font-black text-amber-900 hover:bg-amber-50"
          >
            <ScrollText className="h-3 w-3" aria-hidden />
            查看进度
          </button>
        );
      }
    }
    if (item.caseId != null && onViewCase) {
      return (
        <button
          type="button"
          onClick={() => onViewCase(item.caseId!)}
          className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-white px-2.5 py-1.5 text-[11px] font-black text-amber-900 hover:bg-amber-50"
        >
          <ScrollText className="h-3 w-3" aria-hidden />
          查看案例
        </button>
      );
    }
  }
  if (item.kind === 'enterprise_info' && onGoEnterprise) {
    return (
      <button
        type="button"
        onClick={onGoEnterprise}
        className="inline-flex items-center gap-1 rounded-lg border border-teal-200 bg-white px-2.5 py-1.5 text-[11px] font-black text-teal-800 hover:bg-teal-50"
      >
        <Store className="h-3 w-3" aria-hidden />
        查看企业
      </button>
    );
  }
  if (item.kind === 'demand' && item.demandId != null) {
    return (
      <button
        type="button"
        onClick={() => onLocateDemand(item.demandId!)}
        className="inline-flex items-center gap-1 rounded-lg border border-teal-200 bg-white px-2.5 py-1.5 text-[11px] font-black text-teal-800 hover:bg-teal-50"
      >
        <MapPin className="h-3 w-3" aria-hidden />
        定位需求
      </button>
    );
  }
  if (item.kind === 'supply') {
    return (
      <button
        type="button"
        onClick={() => onOpenProduct(item)}
        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[11px] font-black text-gray-700 hover:border-teal-200 hover:text-teal-800"
      >
        <Package className="h-3 w-3" aria-hidden />
        查看供应
      </button>
    );
  }
  return null;
}
