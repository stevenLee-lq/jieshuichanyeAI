import React, { useMemo, useState } from 'react';
import { ChevronRight, MapPin, MessageSquare, Package, PhoneCall } from 'lucide-react';
import { cn } from './lib/utils';
import {
  confirmContactMessage,
  filterMessagesForIdentity,
  formatContactMessageTime,
  usePortalContactMessages,
  type PortalContactMessage,
} from './portalContactMessagesStore';
import { readStoredPortalUserIdentity } from './portalUserIdentity';
import {
  PORTAL_MESSAGE_KIND_LABELS,
  messageKindBadgeClass,
} from './portalWorkbenchMessages';
import { PORTAL_PAGE_GRADIENT_BG, PORTAL_PAGE_CONTENT, PORTAL_PANEL } from './portalSurface';

type FilterTab = 'all' | 'pending' | 'confirmed';

function MessageCard({
  item,
  onConfirm,
  onLocateDemand,
  onOpenProduct,
}: {
  item: PortalContactMessage;
  onConfirm: (id: string) => void;
  onLocateDemand: (demandId: number) => void;
  onOpenProduct: (item: PortalContactMessage) => void;
}) {
  const confirmed = Boolean(item.confirmedAt);

  return (
    <article className={cn(PORTAL_PANEL, 'p-4 sm:p-5', !confirmed && 'border-teal-200/80 ring-1 ring-teal-100')}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn('rounded-md border px-2 py-0.5 text-[10px] font-black', messageKindBadgeClass(item.kind))}>
              {PORTAL_MESSAGE_KIND_LABELS[item.kind]}
            </span>
            <span
              className={cn(
                'rounded-md border px-2 py-0.5 text-[10px] font-black',
                confirmed
                  ? 'border-gray-200 bg-gray-50 text-gray-600'
                  : 'border-amber-200 bg-amber-50 text-amber-900'
              )}
            >
              {confirmed ? '已确认联系' : '待确认联系'}
            </span>
          </div>
          <h3 className="mt-2 text-base font-black leading-snug text-gray-900">{item.title}</h3>
          <p className="mt-1 text-sm font-bold text-gray-600">
            消息方：{item.peerName}
          </p>
          <p className="mt-2 text-xs font-medium text-gray-400">
            发起联系 {formatContactMessageTime(item.createdAt)}
            {confirmed && item.confirmedAt
              ? ` · 确认于 ${formatContactMessageTime(item.confirmedAt)}`
              : null}
          </p>
          {!confirmed ? (
            <p className="mt-2 text-xs font-bold leading-relaxed text-teal-800/90">
              请确认是否已完成与对方联系或处理。
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:items-end">
          {!confirmed ? (
            <button
              type="button"
              onClick={() => onConfirm(item.id)}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 px-4 py-2 text-xs font-black text-white shadow-md shadow-teal-600/20"
            >
              <PhoneCall className="h-3.5 w-3.5" aria-hidden />
              确认联系
            </button>
          ) : null}
          {item.kind === 'demand' && item.demandId != null ? (
            <button
              type="button"
              onClick={() => onLocateDemand(item.demandId!)}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-teal-200 bg-white px-4 py-2 text-xs font-black text-teal-800 transition hover:bg-teal-50"
            >
              <MapPin className="h-3.5 w-3.5" aria-hidden />
              定位发布需求
            </button>
          ) : null}
          {item.kind === 'supply' ? (
            <button
              type="button"
              onClick={() => onOpenProduct(item)}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-black text-gray-700 transition hover:border-teal-200 hover:text-teal-800"
            >
              <Package className="h-3.5 w-3.5" aria-hidden />
              查看供应详情
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function MyMessagesPage({
  onBack,
  onLocateDemand,
  onOpenProduct,
}: {
  onBack: () => void;
  onLocateDemand: (demandId: number) => void;
  onOpenProduct: (item: PortalContactMessage) => void;
}) {
  const identity = readStoredPortalUserIdentity();
  const all = usePortalContactMessages();
  const scoped = useMemo(() => filterMessagesForIdentity(all, identity), [all, identity]);
  const [tab, setTab] = useState<FilterTab>('all');

  const filtered = useMemo(() => {
    if (tab === 'pending') return scoped.filter((m) => !m.confirmedAt);
    if (tab === 'confirmed') return scoped.filter((m) => m.confirmedAt);
    return scoped;
  }, [scoped, tab]);

  const pendingCount = useMemo(() => scoped.filter((m) => !m.confirmedAt).length, [scoped]);

  const tabs: { key: FilterTab; label: string; count?: number }[] = [
    { key: 'all', label: '全部', count: scoped.length },
    { key: 'pending', label: '待确认', count: pendingCount },
    { key: 'confirmed', label: '已确认', count: scoped.length - pendingCount },
  ];

  return (
    <div className={cn(PORTAL_PAGE_GRADIENT_BG, 'pb-12')}>
      <div className={PORTAL_PAGE_CONTENT}>
        <div className="mb-8 flex items-center gap-4">
          <button type="button" onClick={onBack} className="group flex items-center gap-2 text-sm font-black text-gray-600 hover:text-teal-700">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm group-hover:border-teal-200 group-hover:bg-teal-50">
              <ChevronRight className="h-4 w-4 rotate-180" aria-hidden />
            </span>
            返回
          </button>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">我的消息</h1>
            <p className="mt-1 text-sm font-bold text-gray-500">
              按当前身份展示审批、案例、注册、需求与供给类消息及对接进度
            </p>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-black transition',
                tab === t.key
                  ? 'border-teal-600 bg-teal-50 text-teal-800'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-teal-200'
              )}
            >
              {t.label}
              {t.count != null ? <span className="ml-1 tabular-nums opacity-80">({t.count})</span> : null}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white/80 px-8 py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
              <MessageSquare className="h-7 w-7" strokeWidth={1.5} aria-hidden />
            </div>
            <h2 className="text-lg font-black text-gray-700">暂无相关消息</h2>
            <p className="mt-2 max-w-md text-sm font-medium leading-relaxed text-gray-500">
              在供应详情页点击「联系我们」，或在需求中心发起对接后，将在此生成待确认记录。
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {filtered.map((item) => (
              <li key={item.id}>
                <MessageCard
                  item={item}
                  onConfirm={confirmContactMessage}
                  onLocateDemand={onLocateDemand}
                  onOpenProduct={onOpenProduct}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
