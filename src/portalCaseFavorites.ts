import { useCallback, useSyncExternalStore } from 'react';
import { seedPortalCaseFavoriteIds } from './portalFavoritesSeed';

const STORAGE_KEY = 'portal-case-favorites-v1';

function loadFavoriteIds(): Set<number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set(seedPortalCaseFavoriteIds());
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set(seedPortalCaseFavoriteIds());
    const ids = parsed.filter((x): x is number => typeof x === 'number' && Number.isFinite(x));
    return new Set(ids.length > 0 ? ids : seedPortalCaseFavoriteIds());
  } catch {
    return new Set(seedPortalCaseFavoriteIds());
  }
}

let favoriteIds = loadFavoriteIds();
let favoritesSnapshot: readonly number[] = [...favoriteIds].sort((a, b) => a - b);
try {
  if (!localStorage.getItem(STORAGE_KEY)) persist();
} catch {
  /* ignore */
}
const listeners = new Set<() => void>();

function syncSnapshot() {
  favoritesSnapshot = [...favoriteIds].sort((a, b) => a - b);
}

function emit() {
  syncSnapshot();
  listeners.forEach((l) => l());
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favoritesSnapshot));
  } catch {
    /* ignore */
  }
}

export function getPortalCaseFavoriteIds(): readonly number[] {
  return favoritesSnapshot;
}

export function subscribePortalCaseFavorites(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function isPortalCaseFavorite(caseId: number): boolean {
  return favoriteIds.has(caseId);
}

export function togglePortalCaseFavorite(caseId: number): boolean {
  if (favoriteIds.has(caseId)) favoriteIds.delete(caseId);
  else favoriteIds.add(caseId);
  persist();
  emit();
  return favoriteIds.has(caseId);
}

export function removePortalCaseFavorite(caseId: number): void {
  if (!favoriteIds.has(caseId)) return;
  favoriteIds.delete(caseId);
  persist();
  emit();
}

export function usePortalCaseFavorites(): readonly number[] {
  return useSyncExternalStore(
    subscribePortalCaseFavorites,
    getPortalCaseFavoriteIds,
    () => [] as readonly number[]
  );
}

export function usePortalCaseFavorite(caseId: number | null | undefined) {
  const favorites = usePortalCaseFavorites();
  const isFavorite = caseId != null && favorites.includes(caseId);
  const toggle = useCallback(() => {
    if (caseId == null) return;
    togglePortalCaseFavorite(caseId);
  }, [caseId]);
  return { isFavorite, toggle };
}
