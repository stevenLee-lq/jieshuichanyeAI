import React, { useMemo } from 'react';
import {
  BarChart3,
  Building2,
  Calendar,
  ClipboardList,
  Droplets,
  Factory,
  FileText,
  Landmark,
  LayoutGrid,
  ListTodo,
  MessageSquare,
  Newspaper,
  ShieldCheck,
  Store,
  Users,
} from 'lucide-react';
import { cn } from './lib/utils';
import {
  filterMessagesForIdentity,
  usePortalContactMessages,
} from './portalContactMessagesStore';
import { getPortalDemandPublishedCount } from './portalDemandStore';
import { usePortalNewsRecords } from './portalNewsStore';
import { usePortalPolicyOnlyRecords, usePortalTechOnlyRecords } from './portalPolicyTechStore';
import type { WorkbenchApplicationRow } from './workbenchApplications';
import { buildAdminDashboardStats, identityPercent } from './workbenchAdminDashboardStats';
import type { PlatformUserIdentityKind } from './workbenchEnterprise';
import { useWorkbenchEnterprises } from './workbenchEnterpriseStore';
import { useWorkbenchProducts } from './workbenchProductsStore';

const IDENTITY_META: Record<
  PlatformUserIdentityKind,
  { icon: React.ComponentType<{ className?: string }>; tone: string; bar: string }
> = {
  政府主体: {
    icon: Landmark,
    tone: 'border-sky-200/80 from-sky-50/90 to-white text-sky-900',
    bar: 'bg-sky-500',
  },
  产业主体: {
    icon: Factory,
    tone: 'border-teal-200/80 from-teal-50/90 to-white text-teal-900',
    bar: 'bg-teal-500',
  },
  用水户主体: {
    icon: Droplets,
    tone: 'border-cyan-200/80 from-cyan-50/90 to-white text-cyan-900',
    bar: 'bg-cyan-500',
  },
};

function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'teal',
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: 'teal' | 'amber' | 'sky';
}) {
  const toneClass =
    tone === 'amber'
      ? 'border-amber-200/80 from-amber-50/90'
      : tone === 'sky'
        ? 'border-sky-200/80 from-sky-50/90'
        : 'border-teal-200/80 from-teal-50/90';
  return (
    <div
      className={cn(
        'rounded-2xl border bg-gradient-to-br to-white p-4 shadow-sm',
        toneClass
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-wide text-gray-500">{label}</p>
          <p className="mt-2 tabular-nums text-3xl font-black text-gray-900">{value}</p>
          {hint ? <p className="mt-1 text-[11px] font-bold text-gray-500">{hint}</p> : null}
        </div>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/80 bg-white/90 text-teal-700 shadow-sm">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
      </div>
    </div>
  );
}

function ModuleStatCard({
  label,
  value,
  icon: Icon,
  onClick,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
}) {
  const inner = (
    <>
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold text-gray-500">{label}</p>
        <p className="mt-0.5 tabular-nums text-xl font-black text-gray-900">{value}</p>
      </div>
    </>
  );
  const className =
    'flex w-full items-center gap-3 rounded-xl border border-gray-200/90 bg-white px-3 py-3 text-left shadow-sm transition hover:border-teal-200 hover:bg-teal-50/30';
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {inner}
      </button>
    );
  }
  return <div className={className}>{inner}</div>;
}

export function SystemAdminDashboard({
  applications,
  onNavigateTab,
}: {
  applications: WorkbenchApplicationRow[];
  onNavigateTab?: (tab: string) => void;
}) {
  const enterprises = useWorkbenchEnterprises();
  const products = useWorkbenchProducts();
  const policies = usePortalPolicyOnlyRecords();
  const standards = usePortalTechOnlyRecords();
  const news = usePortalNewsRecords();
  const messages = usePortalContactMessages();
  const adminMessages = useMemo(
    () => filterMessagesForIdentity(messages, '系统管理员'),
    [messages]
  );
  const pendingMessages = useMemo(
    () => adminMessages.filter((m) => !m.confirmedAt).length,
    [adminMessages]
  );

  const stats = useMemo(
    () =>
      buildAdminDashboardStats({
        enterprises,
        applications,
        productTotal: products.length,
        demandTotal: getPortalDemandPublishedCount(),
        policyTotal: policies.length,
        standardTotal: standards.length,
        newsTotal: news.length,
        pendingMessages,
      }),
    [enterprises, applications, products.length, policies.length, standards.length, news.length, pendingMessages]
  );

  const go = (tab: string) => onNavigateTab?.(tab);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-teal-100/80 bg-gradient-to-r from-teal-50/80 via-white to-cyan-50/50 px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-teal-200/70 bg-white text-teal-700 shadow-sm">
            <LayoutGrid className="h-6 w-6" aria-hidden />
          </span>
          <div>
            <h2 className="text-lg font-black text-gray-900 sm:text-xl">平台运营仪表盘</h2>
            <p className="mt-0.5 text-xs font-bold text-gray-500">
              汇总当前系统管理功能下的用户规模与业务数据（演示统计，随企业管理与业务模块变动）
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="用户总数" value={stats.userTotal} hint="已入驻主体账号" icon={Users} />
        <KpiCard
          label="待审申请"
          value={stats.pendingApplications}
          hint="我的审核待处理"
          icon={ShieldCheck}
          tone="amber"
        />
        <KpiCard
          label="入驻主体"
          value={stats.enterpriseTotal}
          hint={`${stats.enterprisePendingAudit} 家审核中`}
          icon={Building2}
        />
        <KpiCard
          label="待确认消息"
          value={stats.pendingMessages}
          hint="门户「与我联系」"
          icon={MessageSquare}
          tone="sky"
        />
      </div>

      <section className="rounded-2xl border border-gray-200/90 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-center gap-2 border-l-4 border-teal-600 pl-3">
          <Users className="h-4 w-4 text-teal-700" aria-hidden />
          <h3 className="text-sm font-black text-gray-900 sm:text-base">用户身份分布</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {(['政府主体', '产业主体', '用水户主体'] as const).map((kind) => {
            const count = stats.usersByIdentity[kind];
            const pct = identityPercent(count, stats.userTotal);
            const meta = IDENTITY_META[kind];
            const Icon = meta.icon;
            return (
              <div
                key={kind}
                className={cn('rounded-xl border bg-gradient-to-br p-4 shadow-sm', meta.tone)}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 shadow-sm">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="text-2xl font-black tabular-nums text-gray-900">{count}</span>
                </div>
                <p className="mt-3 text-sm font-black">{kind}</p>
                <p className="mt-1 text-[11px] font-bold opacity-70">占用户总数 {pct}%</p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/70">
                  <div
                    className={cn('h-full rounded-full transition-all', meta.bar)}
                    style={{ width: `${Math.max(pct, count > 0 ? 8 : 0)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200/90 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-center gap-2 border-l-4 border-cyan-600 pl-3">
          <BarChart3 className="h-4 w-4 text-cyan-700" aria-hidden />
          <h3 className="text-sm font-black text-gray-900 sm:text-base">管理功能概览</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <ModuleStatCard label="企业管理" value={stats.enterpriseTotal} icon={Store} onClick={() => go('企业管理')} />
          <ModuleStatCard label="产品管理" value={stats.productTotal} icon={ClipboardList} onClick={() => go('产品管理')} />
          <ModuleStatCard label="典型案例" value={stats.caseTotal} icon={Calendar} onClick={() => go('典型案例')} />
          <ModuleStatCard label="需求中心" value={stats.demandTotal} icon={ListTodo} onClick={() => go('需求中心')} />
          <ModuleStatCard label="政策公开" value={stats.policyTotal} icon={FileText} onClick={() => go('政策公开')} />
          <ModuleStatCard label="技术标准" value={stats.standardTotal} icon={FileText} onClick={() => go('技术标准')} />
          <ModuleStatCard label="新闻资讯" value={stats.newsTotal} icon={Newspaper} onClick={() => go('新闻资讯')} />
          <ModuleStatCard
            label="待审申请"
            value={stats.pendingApplications}
            icon={ShieldCheck}
            onClick={() => go('我的审核')}
          />
          <ModuleStatCard
            label="待确认消息"
            value={stats.pendingMessages}
            icon={MessageSquare}
            onClick={() => go('我的消息')}
          />
        </div>
      </section>
    </div>
  );
}
