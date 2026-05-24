import { useSyncExternalStore } from 'react';
import {
  createEmptyNewsForm,
  normalizeWorkbenchNewsRecord,
  seedWorkbenchNews,
  type WorkbenchNewsFormState,
  type WorkbenchNewsRecord,
} from './workbenchNews';

const STORAGE_KEY = 'portal-news-records-v2';

function loadRecords(): WorkbenchNewsRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const legacy = localStorage.getItem('portal-news-records-v1');
      if (legacy) {
        const parsed = JSON.parse(legacy) as unknown;
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((row) => normalizeWorkbenchNewsRecord(row as WorkbenchNewsRecord));
        }
      }
      return seedWorkbenchNews();
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || parsed.length === 0) return seedWorkbenchNews();
    return parsed.map((row) => normalizeWorkbenchNewsRecord(row as WorkbenchNewsRecord));
  } catch {
    return seedWorkbenchNews();
  }
}

let records: WorkbenchNewsRecord[] = loadRecords();
let recordsSnapshot: readonly WorkbenchNewsRecord[] = records;
let enabledNewsSnapshot: readonly WorkbenchNewsRecord[] = [];
const listeners = new Set<() => void>();

function rebuildEnabledNewsSnapshot() {
  enabledNewsSnapshot = records.filter((r) => r.enabled);
}

function emit() {
  recordsSnapshot = records;
  rebuildEnabledNewsSnapshot();
  listeners.forEach((l) => l());
}

rebuildEnabledNewsSnapshot();

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    /* ignore */
  }
}

export function subscribePortalNews(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getPortalNewsSnapshot(): readonly WorkbenchNewsRecord[] {
  return recordsSnapshot;
}

function readEnabledNewsSnapshot() {
  return enabledNewsSnapshot;
}

export function usePortalNewsRecords(): readonly WorkbenchNewsRecord[] {
  return useSyncExternalStore(
    subscribePortalNews,
    getPortalNewsSnapshot,
    () => [] as readonly WorkbenchNewsRecord[]
  );
}

export function usePortalEnabledNewsRecords(): readonly WorkbenchNewsRecord[] {
  return useSyncExternalStore(
    subscribePortalNews,
    readEnabledNewsSnapshot,
    () => [] as readonly WorkbenchNewsRecord[]
  );
}

export function getPortalNewsById(id: string): WorkbenchNewsRecord | undefined {
  return records.find((r) => r.id === id);
}

export function upsertPortalNews(form: WorkbenchNewsFormState, id?: string): WorkbenchNewsRecord {
  const payload: WorkbenchNewsRecord = {
    id: id ?? `news-${Date.now()}`,
    title: form.title.trim(),
    content: form.content,
    image: form.image.trim(),
    publishedAt: form.publishedAt.trim(),
    publisher: form.publisher.trim(),
    tags: [],
    applicationFields: [...form.applicationFields],
    waterSavingCategorySubIds: [...form.waterSavingCategorySubIds],
    enabled: true,
    infoScope: form.infoScope,
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

export function deletePortalNews(id: string) {
  records = records.filter((r) => r.id !== id);
  persist();
  emit();
}

export function createEmptyNewsFormForPanel() {
  return createEmptyNewsForm();
}
