import type { WorkbenchApplicationRow } from './workbenchApplications';
import { isWorkbenchApplicationPending } from './workbenchApplications';
import { seedWorkbenchCases } from './workbenchCase';
import {
  countUsersByPlatformIdentity,
  type PlatformUserIdentityKind,
  type WorkbenchEnterpriseRecord,
} from './workbenchEnterprise';
import { WORKBENCH_SELF_ENTERPRISE_ID } from './workbenchEnterpriseStore';

export type AdminDashboardStats = {
  userTotal: number;
  usersByIdentity: Record<PlatformUserIdentityKind, number>;
  enterpriseTotal: number;
  enterprisePendingAudit: number;
  pendingApplications: number;
  productTotal: number;
  caseTotal: number;
  demandTotal: number;
  policyTotal: number;
  standardTotal: number;
  newsTotal: number;
  pendingMessages: number;
};

export function buildAdminDashboardStats(input: {
  enterprises: readonly WorkbenchEnterpriseRecord[];
  applications: readonly WorkbenchApplicationRow[];
  productTotal: number;
  demandTotal: number;
  policyTotal: number;
  standardTotal: number;
  newsTotal: number;
  pendingMessages: number;
}): AdminDashboardStats {
  const managed = input.enterprises.filter((e) => e.id !== WORKBENCH_SELF_ENTERPRISE_ID);
  const usersByIdentity = countUsersByPlatformIdentity(managed);
  const userTotal = usersByIdentity['政府主体'] + usersByIdentity['产业主体'] + usersByIdentity['用水户主体'];

  return {
    userTotal,
    usersByIdentity,
    enterpriseTotal: managed.length,
    enterprisePendingAudit: managed.filter((e) => e.auditStatus === '待审核' || e.auditStatus === '审核中')
      .length,
    pendingApplications: input.applications.filter((r) => isWorkbenchApplicationPending(r.status)).length,
    productTotal: input.productTotal,
    caseTotal: seedWorkbenchCases().length,
    demandTotal: input.demandTotal,
    policyTotal: input.policyTotal,
    standardTotal: input.standardTotal,
    newsTotal: input.newsTotal,
    pendingMessages: input.pendingMessages,
  };
}

export function identityPercent(count: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((count / total) * 100);
}
