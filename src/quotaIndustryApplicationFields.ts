import { useSyncExternalStore } from 'react';
import type { ApplicationFieldOption } from './data';
import { normalizeApplicationFields } from './workbenchApplicationFields';

const STORAGE_KEY = 'workbench-quota-l4-application-fields-v1';

export type QuotaL4ApplicationFieldsMap = Record<string, ApplicationFieldOption[]>;

let cache: QuotaL4ApplicationFieldsMap | null = null;
const listeners = new Set<() => void>();

function readMap(): QuotaL4ApplicationFieldsMap {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      cache = {};
      return cache;
    }
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const out: QuotaL4ApplicationFieldsMap = {};
    for (const [code, value] of Object.entries(parsed)) {
      const fields = normalizeApplicationFields(
        Array.isArray(value) ? value.map(String) : []
      );
      if (fields.length) out[code] = fields;
    }
    cache = out;
    return cache;
  } catch {
    cache = {};
    return cache;
  }
}

function writeMap(map: QuotaL4ApplicationFieldsMap) {
  cache = map;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* ignore quota */
  }
  listeners.forEach((fn) => fn());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): QuotaL4ApplicationFieldsMap {
  return readMap();
}

export function useQuotaL4ApplicationFieldsMap(): QuotaL4ApplicationFieldsMap {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function getQuotaL4ApplicationFields(l4Code: string): ApplicationFieldOption[] {
  if (!l4Code) return [];
  return readMap()[l4Code] ?? [];
}

export function setQuotaL4ApplicationFields(
  l4Code: string,
  fields: readonly ApplicationFieldOption[]
): void {
  const normalized = normalizeApplicationFields(fields);
  const next = { ...readMap() };
  if (normalized.length === 0) delete next[l4Code];
  else next[l4Code] = normalized;
  writeMap(next);
}
