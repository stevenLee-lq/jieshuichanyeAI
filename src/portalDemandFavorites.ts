import { useCallback, useSyncExternalStore } from 'react';
import { seedPortalDemandFavoriteIds } from './portalFavoritesSeed';

const STORAGE_KEY = 'portal-demand-favorites-v1';

function loadFavoriteIds(): Set<number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set(seedPortalDemandFavoriteIds());
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set(seedPortalDemandFavoriteIds());
    const ids = parsed.filter((x): x is number => typeof x === 'number' && Number.isFinite(x));
    return new Set(ids.length > 0 ? ids : seedPortalDemandFavoriteIds());
  } catch {
    return new Set(seedPortalDemandFavoriteIds());
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

export function getPortalDemandFavoriteIds(): readonly number[] {
  return favoritesSnapshot;
}

export function subscribePortalDemandFavorites(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function isPortalDemandFavorite(demandId: number): boolean {
  return favoriteIds.has(demandId);
}

export function togglePortalDemandFavorite(demandId: number): boolean {
  if (favoriteIds.has(demandId)) favoriteIds.delete(demandId);
  else favoriteIds.add(demandId);
  persist();
  emit();
  return favoriteIds.has(demandId);
}

export function removePortalDemandFavorite(demandId: number): void {
  if (!favoriteIds.has(demandId)) return;
  favoriteIds.delete(demandId);
  persist();
  emit();
}

export function usePortalDemandFavorites(): readonly number[] {
  return useSyncExternalStore(
    subscribePortalDemandFavorites,
    getPortalDemandFavoriteIds,
    () => [] as readonly number[]
  );
}

export function usePortalDemandFavorite(demandId: number | null | undefined) {
  const favorites = usePortalDemandFavorites();
  const isFavorite = demandId != null && favorites.includes(demandId);
  const toggle = useCallback(() => {
    if (demandId == null) return;
    togglePortalDemandFavorite(demandId);
  }, [demandId]);
  return { isFavorite, toggle };
}
