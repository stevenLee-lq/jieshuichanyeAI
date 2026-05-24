import { useSyncExternalStore } from 'react';
import {
  createEmptyEnterpriseForm,
  seedWorkbenchEnterprises,
  type WorkbenchEnterpriseRecord,
} from './workbenchEnterprise';

let enterprises: WorkbenchEnterpriseRecord[] = seedWorkbenchEnterprises();
let enterprisesSnapshot: readonly WorkbenchEnterpriseRecord[] = enterprises;
const listeners = new Set<() => void>();

function emit() {
  enterprisesSnapshot = enterprises;
  listeners.forEach((l) => l());
}

export function getWorkbenchEnterprises(): readonly WorkbenchEnterpriseRecord[] {
  return enterprisesSnapshot;
}

export function subscribeWorkbenchEnterprises(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useWorkbenchEnterprises(): readonly WorkbenchEnterpriseRecord[] {
  return useSyncExternalStore(
    subscribeWorkbenchEnterprises,
    getWorkbenchEnterprises,
    () => seedWorkbenchEnterprises()
  );
}

export function getWorkbenchEnterpriseById(id: string): WorkbenchEnterpriseRecord | undefined {
  return enterprises.find((e) => e.id === id);
}

/** 供方主页：按企业名称匹配入驻档案（演示数据） */
export function findWorkbenchEnterpriseByName(companyName: string): WorkbenchEnterpriseRecord | undefined {
  const key = companyName.trim();
  if (!key) return undefined;
  const list = getWorkbenchEnterprises();
  const exact = list.find((e) => e.name === key);
  if (exact) return exact;
  return list.find((e) => key.includes(e.name) || e.name.includes(key));
}

export function upsertWorkbenchEnterprise(record: WorkbenchEnterpriseRecord) {
  const idx = enterprises.findIndex((e) => e.id === record.id);
  if (idx >= 0) {
    const next = [...enterprises];
    next[idx] = record;
    enterprises = next;
  } else {
    enterprises = [record, ...enterprises];
  }
  emit();
}

export function deleteWorkbenchEnterprise(id: string) {
  enterprises = enterprises.filter((e) => e.id !== id);
  emit();
}

export function nextWorkbenchEnterpriseId(): string {
  const nums = enterprises
    .map((e) => /^ent-(\d+)$/.exec(e.id)?.[1])
    .filter(Boolean)
    .map((n) => Number(n));
  const max = nums.length ? Math.max(...nums) : 0;
  return `ent-${max + 1}`;
}

/** 产业主体登录侧维护的本企业记录 ID */
export const WORKBENCH_SELF_ENTERPRISE_ID = 'ent-self';

export function getOrCreateSelfEnterprise(): WorkbenchEnterpriseRecord {
  const existing = getWorkbenchEnterpriseById(WORKBENCH_SELF_ENTERPRISE_ID);
  if (existing) return existing;
  const seeded = seedWorkbenchEnterprises()[0];
  const record: WorkbenchEnterpriseRecord = seeded
    ? { ...seeded, id: WORKBENCH_SELF_ENTERPRISE_ID }
    : {
        id: WORKBENCH_SELF_ENTERPRISE_ID,
        auditStatus: '草稿',
        ...createEmptyEnterpriseForm(),
      };
  upsertWorkbenchEnterprise(record);
  return record;
}
