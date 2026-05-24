import { useSyncExternalStore } from 'react';
import { inferApplicationFieldsFromProduct, PRODUCTS } from './data';
import { formatApplicationFieldsList } from './workbenchApplicationFields';
import type { HomeServiceRecommendation } from './homeServiceRecommendations';
import { HOME_SERVICE_RECOMMENDATIONS } from './homeServiceRecommendations';
import {
  createProductDemandFromContact,
  getPortalDemandById,
  markDemandContacted,
  normalizeContactProductTitle,
} from './portalDemandStore';
import type { ProductSupplyDetailPayload } from './ProductSupplyDetailPage';
import type { SupplyDemandOutcome } from './supplyDemandOutcomes';
import { SUPPLY_DEMAND_OUTCOMES } from './supplyDemandOutcomes';
import {
  migrateLegacyMessageKind,
  portalIdentityToMessageAudience,
  type PortalContactMessageKind,
  type PortalMessageAudience,
} from './portalWorkbenchMessages';
import type { PortalUserIdentity } from './portalUserIdentity';
import { readStoredPortalUserIdentity } from './portalUserIdentity';

const STORAGE_KEY = 'portal-contact-messages-v2';

export type { PortalContactMessageKind, PortalMessageAudience };

export type PortalContactMessage = {
  id: string;
  kind: PortalContactMessageKind;
  audience: PortalMessageAudience;
  title: string;
  peerName: string;
  createdAt: number;
  confirmedAt?: number;
  productId?: number;
  serviceId?: number;
  demandId?: number;
  caseId?: number;
  /** 典型案例类消息关联的「我的申请」单号 */
  applicationId?: string;
  /** 确认联系后同步至需求中心的产品需求 id */
  linkedDemandId?: number;
};

let messages: PortalContactMessage[] = loadMessages();
let messagesSnapshot: readonly PortalContactMessage[] = messages;
const listeners = new Set<() => void>();

function seedPortalContactMessages(): PortalContactMessage[] {
  const now = Date.now();
  const demand = SUPPLY_DEMAND_OUTCOMES.find((o) => o.demandType !== '交流讨论');
  const hour = 1000 * 60 * 60;

  return [
    // —— 企业信息员（系统管理员）：仅审批类 ——
    {
      id: 'msg-seed-approval-1',
      kind: 'approval',
      audience: 'enterprise_clerk',
      title: '企业入驻申请待审核',
      peerName: '苏州清源节水科技有限公司',
      createdAt: now - hour * 5,
    },
    {
      id: 'msg-seed-approval-2',
      kind: 'approval',
      audience: 'enterprise_clerk',
      title: '典型案例发布待审核',
      peerName: '南京河海节水装备有限公司',
      createdAt: now - hour * 18,
    },
    {
      id: 'msg-seed-approval-3',
      kind: 'approval',
      audience: 'enterprise_clerk',
      title: '产品上架申请待审核',
      peerName: '水麒麟科技有限公司',
      createdAt: now - hour * 30,
      confirmedAt: now - hour * 6,
    },
    {
      id: 'msg-seed-approval-4',
      kind: 'approval',
      audience: 'enterprise_clerk',
      title: '用水户主体认证资料变更',
      peerName: '连云港市某纺织印染企业',
      createdAt: now - hour * 52,
      confirmedAt: now - hour * 20,
    },

    // —— 用水户：典型案例、注册、需求 ——
    {
      id: 'msg-seed-wu-case-1',
      kind: 'case',
      audience: 'water_user',
      title: '典型案例「园区循环冷却水改造」已收录',
      peerName: '平台运营',
      caseId: 2,
      applicationId: 'APP-20250320-003',
      createdAt: now - hour * 12,
      confirmedAt: now - hour * 4,
    },
    {
      id: 'msg-seed-wu-case-2',
      kind: 'case',
      audience: 'water_user',
      title: '案例素材补充提醒',
      peerName: '江苏省水利厅案例库',
      caseId: 4,
      applicationId: 'APP-20250320-003',
      createdAt: now - hour * 40,
    },
    {
      id: 'msg-seed-wu-reg-1',
      kind: 'registration',
      audience: 'water_user',
      title: '用水户主体注册审核通过',
      peerName: '平台审核',
      createdAt: now - hour * 72,
      confirmedAt: now - hour * 68,
    },
    {
      id: 'msg-seed-wu-reg-2',
      kind: 'registration',
      audience: 'water_user',
      title: '账号信息变更待确认',
      peerName: '系统通知',
      createdAt: now - hour * 9,
    },
    {
      id: 'msg-seed-wu-demand-1',
      kind: 'demand',
      audience: 'water_user',
      title: demand?.title ?? '节水装备采购需求对接',
      peerName: demand?.publisherDisplay ?? demand?.demander ?? '产业供方',
      demandId: demand?.id ?? 1,
      createdAt: now - hour * 8,
    },
    {
      id: 'msg-seed-wu-demand-2',
      kind: 'demand',
      audience: 'water_user',
      title: '合同节水第三方评估服务询价回复',
      peerName: '江苏省水利工程科技咨询股份有限公司',
      demandId: 4,
      createdAt: now - hour * 26,
      confirmedAt: now - hour * 10,
    },

    // —— 产业主体：典型案例、企业信息、需求、供给 ——
    {
      id: 'msg-seed-in-case-1',
      kind: 'case',
      audience: 'industry',
      title: '典型案例投稿审核通过',
      peerName: '平台运营',
      caseId: 1,
      createdAt: now - hour * 16,
      confirmedAt: now - hour * 8,
    },
    {
      id: 'msg-seed-in-case-2',
      kind: 'case',
      audience: 'industry',
      title: '案例封面图需重新上传',
      peerName: '案例审核专员',
      caseId: 5,
      createdAt: now - hour * 36,
    },
    {
      id: 'msg-seed-in-ent-1',
      kind: 'enterprise_info',
      audience: 'industry',
      title: '企业荣誉资质信息已更新',
      peerName: '企业信息员',
      createdAt: now - hour * 14,
      confirmedAt: now - hour * 3,
    },
    {
      id: 'msg-seed-in-ent-2',
      kind: 'enterprise_info',
      audience: 'industry',
      title: '企业简介变更待确认',
      peerName: '平台通知',
      createdAt: now - hour * 22,
    },
    {
      id: 'msg-seed-in-demand-1',
      kind: 'demand',
      audience: 'industry',
      title: '印染园区循环冷却水站托管运营招标',
      peerName: '园区用水单位',
      demandId: 2,
      createdAt: now - hour * 7,
    },
    {
      id: 'msg-seed-in-supply-1',
      kind: 'supply',
      audience: 'industry',
      title: '高精度超声波水表',
      peerName: '某重点用水单位',
      productId: 1,
      createdAt: now - hour * 26,
    },
    {
      id: 'msg-seed-in-supply-2',
      kind: 'supply',
      audience: 'industry',
      title: '工业微波节水冷却塔',
      peerName: '连云港市某化工企业',
      productId: 2,
      createdAt: now - hour * 72,
      confirmedAt: now - hour * 20,
    },
  ];
}

function inferAudienceFromLegacy(
  kind: PortalContactMessageKind,
  raw: { audience?: unknown }
): PortalMessageAudience {
  if (
    raw.audience === 'enterprise_clerk' ||
    raw.audience === 'water_user' ||
    raw.audience === 'industry'
  ) {
    return raw.audience;
  }
  if (kind === 'supply' || kind === 'enterprise_info') return 'industry';
  if (kind === 'approval') return 'enterprise_clerk';
  if (kind === 'case' || kind === 'registration') return 'water_user';
  return 'industry';
}

function normalizeMessage(raw: unknown): PortalContactMessage | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as PortalContactMessage & { kind?: unknown };
  const kind = migrateLegacyMessageKind(o.kind);
  if (!kind) return null;
  if (typeof o.id !== 'string' || typeof o.title !== 'string' || typeof o.peerName !== 'string') {
    return null;
  }
  if (typeof o.createdAt !== 'number') return null;
  const audience = inferAudienceFromLegacy(kind, o);
  return {
    id: o.id,
    kind,
    audience,
    title: o.title,
    peerName: o.peerName,
    createdAt: o.createdAt,
    ...(typeof o.confirmedAt === 'number' ? { confirmedAt: o.confirmedAt } : {}),
    ...(typeof o.productId === 'number' ? { productId: o.productId } : {}),
    ...(typeof o.serviceId === 'number' ? { serviceId: o.serviceId } : {}),
    ...(typeof o.demandId === 'number' ? { demandId: o.demandId } : {}),
    ...(typeof o.caseId === 'number' ? { caseId: o.caseId } : {}),
    ...(typeof o.applicationId === 'string' ? { applicationId: o.applicationId } : {}),
    ...(typeof o.linkedDemandId === 'number' ? { linkedDemandId: o.linkedDemandId } : {}),
  };
}

function loadMessages(): PortalContactMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedPortalContactMessages();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return seedPortalContactMessages();
    const list = parsed.map(normalizeMessage).filter((m): m is PortalContactMessage => m != null);
    return list.length > 0 ? list : seedPortalContactMessages();
  } catch {
    return seedPortalContactMessages();
  }
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {
    /* ignore */
  }
}

function emit() {
  messagesSnapshot = messages;
  listeners.forEach((l) => l());
}

function defaultMessageAudience(): PortalMessageAudience {
  return portalIdentityToMessageAudience(readStoredPortalUserIdentity());
}

function upsertPending(
  record: Omit<PortalContactMessage, 'id' | 'createdAt' | 'confirmedAt' | 'audience'> & {
    audience?: PortalMessageAudience;
  }
) {
  const audience = record.audience ?? defaultMessageAudience();
  const key =
    record.kind === 'supply'
      ? `supply:${record.productId ?? ''}:${record.serviceId ?? ''}`
      : record.kind === 'demand'
        ? `demand:${record.demandId ?? ''}`
        : `${record.kind}:${record.title}:${record.peerName}`;
  const existingIdx = messages.findIndex((m) => {
    if (m.confirmedAt || m.audience !== audience) return false;
    const mKey =
      m.kind === 'supply'
        ? `supply:${m.productId ?? ''}:${m.serviceId ?? ''}`
        : m.kind === 'demand'
          ? `demand:${m.demandId ?? ''}`
          : `${m.kind}:${m.title}:${m.peerName}`;
    return mKey === key;
  });
  const next: PortalContactMessage = {
    ...record,
    audience,
    id: existingIdx >= 0 ? messages[existingIdx]!.id : `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: Date.now(),
    confirmedAt: undefined,
  };
  if (existingIdx >= 0) {
    const copy = [...messages];
    copy[existingIdx] = next;
    messages = copy;
  } else {
    messages = [next, ...messages];
  }
  persist();
  emit();
}

export function subscribePortalContactMessages(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getPortalContactMessagesSnapshot(): readonly PortalContactMessage[] {
  return messagesSnapshot;
}

export function filterMessagesForAudience(
  list: readonly PortalContactMessage[],
  audience: PortalMessageAudience
): PortalContactMessage[] {
  return list.filter((m) => m.audience === audience);
}

export function filterMessagesForIdentity(
  list: readonly PortalContactMessage[],
  identity: PortalUserIdentity
): PortalContactMessage[] {
  return filterMessagesForAudience(list, portalIdentityToMessageAudience(identity));
}

export function usePortalContactMessages(): readonly PortalContactMessage[] {
  return useSyncExternalStore(
    subscribePortalContactMessages,
    getPortalContactMessagesSnapshot,
    () => [] as readonly PortalContactMessage[]
  );
}

export function getPendingContactMessageCount(identity?: PortalUserIdentity): number {
  const list = identity ? filterMessagesForIdentity(messages, identity) : messages;
  return list.filter((m) => !m.confirmedAt).length;
}

export function recordProductContact(payload: ProductSupplyDetailPayload) {
  if (payload.kind === 'product') {
    upsertPending({
      kind: 'supply',
      title: payload.product.name,
      peerName: payload.product.supplier,
      productId: payload.product.id,
      audience: 'industry',
    });
    return;
  }
  upsertPending({
    kind: 'supply',
    title: `「${payload.service.serviceName}」`,
    peerName: payload.service.entityName,
    serviceId: payload.service.id,
    audience: 'industry',
  });
}

export function recordDemandContact(outcome: SupplyDemandOutcome) {
  if (outcome.demandType === '交流讨论') return;
  markDemandContacted(outcome.id);
  upsertPending({
    kind: 'demand',
    title: outcome.title,
    peerName: outcome.publisherDisplay ?? outcome.demander,
    demandId: outcome.id,
    audience: defaultMessageAudience(),
  });
}

function buildProductContactDemandInput(msg: PortalContactMessage): Parameters<typeof createProductDemandFromContact>[0] {
  const title = normalizeContactProductTitle(msg.title);
  let description: string | undefined;
  let image: string | undefined;
  if (msg.productId != null) {
    const product = PRODUCTS.find((p) => p.id === msg.productId);
    if (product) {
      image = product.image;
      description = `${product.info}（应用领域：${formatApplicationFieldsList(inferApplicationFieldsFromProduct(product))}；供方：${msg.peerName}）`;
    }
  }
  return { title, supplierName: msg.peerName, description, image };
}

function ensureProductDemandFromContact(msg: PortalContactMessage): number | undefined {
  if (msg.kind !== 'supply') return undefined;
  if (msg.linkedDemandId != null) {
    const existing = getPortalDemandById(msg.linkedDemandId);
    if (existing) return existing.id;
  }
  const row = createProductDemandFromContact(buildProductContactDemandInput(msg));
  return row.id;
}

export function confirmContactMessage(id: string) {
  const idx = messages.findIndex((m) => m.id === id);
  if (idx < 0) return;
  const prev = messages[idx]!;
  if (prev.confirmedAt) return;

  const linkedDemandId =
    prev.kind === 'supply' ? ensureProductDemandFromContact(prev) : prev.linkedDemandId;

  if (prev.kind === 'demand' && linkedDemandId != null) {
    markDemandContacted(linkedDemandId);
  }

  const copy = [...messages];
  copy[idx] = {
    ...prev,
    confirmedAt: Date.now(),
    ...(linkedDemandId != null ? { linkedDemandId } : {}),
  };
  messages = copy;
  persist();
  emit();
}

/** 已确认联系后，查看供方详情时可展示完整联系电话 */
export function canRevealSupplierContactForMessage(msg: PortalContactMessage): boolean {
  return Boolean(msg.confirmedAt);
}

export function resolveProductPayloadFromMessage(
  msg: PortalContactMessage
): ProductSupplyDetailPayload | null {
  if (msg.kind !== 'supply') return null;
  if (msg.productId != null) {
    const product = PRODUCTS.find((p) => p.id === msg.productId);
    if (product) return { kind: 'product', product };
  }
  if (msg.serviceId != null) {
    const service = HOME_SERVICE_RECOMMENDATIONS.find((s) => s.id === msg.serviceId);
    if (service) return { kind: 'service', service };
  }
  return null;
}

export function formatContactMessageTime(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
