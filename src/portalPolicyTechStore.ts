import { useSyncExternalStore } from 'react';
import {
  createEmptyPolicyTechForm,
  normalizePolicyTechRecord,
  seedWorkbenchPolicies,
  seedWorkbenchStandards,
  type PolicyTechKind,
  type WorkbenchPolicyTechFormState,
  type WorkbenchPolicyTechRecord,
} from './workbenchPolicyTech';

const STORAGE_KEY = 'portal-policy-tech-records-v2';

function loadRecords(): WorkbenchPolicyTechRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...seedWorkbenchPolicies(), ...seedWorkbenchStandards()];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [...seedWorkbenchPolicies(), ...seedWorkbenchStandards()];
    }
    return parsed.map((row) =>
      normalizePolicyTechRecord(row as WorkbenchPolicyTechRecord)
    );
  } catch {
    return [...seedWorkbenchPolicies(), ...seedWorkbenchStandards()];
  }
}

let records: WorkbenchPolicyTechRecord[] = loadRecords();
let recordsSnapshot: readonly WorkbenchPolicyTechRecord[] = records;
let policySnapshot: readonly WorkbenchPolicyTechRecord[] = [];
let techSnapshot: readonly WorkbenchPolicyTechRecord[] = [];
const listeners = new Set<() => void>();

function rebuildKindSnapshots() {
  const policy: WorkbenchPolicyTechRecord[] = [];
  const tech: WorkbenchPolicyTechRecord[] = [];
  for (const r of records) {
    if (r.kind === 'policy') policy.push(r);
    else tech.push(r);
  }
  policySnapshot = policy;
  techSnapshot = tech;
}

function syncSnapshot() {
  recordsSnapshot = records;
  rebuildKindSnapshots();
}

rebuildKindSnapshots();

function emit() {
  syncSnapshot();
  listeners.forEach((l) => l());
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    /* ignore */
  }
}

export function subscribePortalPolicyTech(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getPortalPolicyTechRecords(): readonly WorkbenchPolicyTechRecord[] {
  return recordsSnapshot;
}

export function getPortalPolicyTechRecordsByKind(
  kind?: PolicyTechKind
): readonly WorkbenchPolicyTechRecord[] {
  if (kind === 'policy') return policySnapshot;
  if (kind === 'tech') return techSnapshot;
  return recordsSnapshot;
}

function readPolicyOnlySnapshot() {
  return policySnapshot;
}

function readTechOnlySnapshot() {
  return techSnapshot;
}

export function usePortalPolicyTechRecords(): readonly WorkbenchPolicyTechRecord[] {
  return useSyncExternalStore(
    subscribePortalPolicyTech,
    getPortalPolicyTechRecords,
    () => [] as readonly WorkbenchPolicyTechRecord[]
  );
}

export function usePortalPolicyOnlyRecords(): readonly WorkbenchPolicyTechRecord[] {
  return useSyncExternalStore(
    subscribePortalPolicyTech,
    readPolicyOnlySnapshot,
    () => [] as readonly WorkbenchPolicyTechRecord[]
  );
}

export function usePortalTechOnlyRecords(): readonly WorkbenchPolicyTechRecord[] {
  return useSyncExternalStore(
    subscribePortalPolicyTech,
    readTechOnlySnapshot,
    () => [] as readonly WorkbenchPolicyTechRecord[]
  );
}

export function getPortalPolicyTechById(id: string): WorkbenchPolicyTechRecord | undefined {
  return records.find((r) => r.id === id);
}

export function upsertPortalPolicyTech(kind: PolicyTechKind, form: WorkbenchPolicyTechFormState, id?: string) {
  const payload: WorkbenchPolicyTechRecord = {
    id: id ?? `${kind}-${Date.now()}`,
    kind,
    title: form.title.trim(),
    time: form.time.trim(),
    content: form.content.trim(),
    publisher: form.publisher.trim(),
    code: form.code.trim(),
    applicationFields: [...form.applicationFields],
    waterSavingCategorySubIds: [...form.waterSavingCategorySubIds],
    industries: [...form.industries],
    infoScope: form.infoScope,
    standardCategory: form.standardCategory,
  };
  const idx = records.findIndex((r) => r.id === payload.id);
  if (idx >= 0) {
    const next = [...records];
    next[idx] = payload;
    records = next;
  } else {
    records = [payload, ...records];
  }
  persist();
  emit();
  return payload;
}

export function deletePortalPolicyTech(id: string) {
  records = records.filter((r) => r.id !== id);
  persist();
  emit();
}

export function createEmptyPolicyTechFormForKind(kind: PolicyTechKind) {
  return createEmptyPolicyTechForm(kind);
}

/** 门户产业资讯：政策列表 */
export function getPortalPoliciesForDisplay() {
  return policySnapshot.map((r) => ({
      id: r.id,
      name: r.title,
      publisher: r.publisher,
      time: r.time,
      content: r.content,
    }));
}

/** 门户产业资讯：标准列表 */
export function getPortalStandardsForDisplay() {
  return techSnapshot.map((r) => ({
      id: r.id,
      name: r.title,
      code: r.code,
      time: r.time,
      content: r.content,
    }));
}
