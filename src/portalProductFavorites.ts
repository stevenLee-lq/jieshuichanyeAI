import { useCallback, useSyncExternalStore } from 'react';
import { seedPortalProductFavoriteIds } from './portalFavoritesSeed';

const STORAGE_KEY = 'portal-product-favorites-v1';

function loadFavoriteIds(): Set<number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set(seedPortalProductFavoriteIds());
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set(seedPortalProductFavoriteIds());
    const ids = parsed.filter((x): x is number => typeof x === 'number' && Number.isFinite(x));
    return new Set(ids.length > 0 ? ids : seedPortalProductFavoriteIds());
  } catch {
    return new Set(seedPortalProductFavoriteIds());
  }
}

let favoriteIds = loadFavoriteIds();
/** useSyncExternalStore 要求 getSnapshot 在数据未变时返回稳定引用 */
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
    /* 演示环境存储满等情况忽略 */
  }
}

export function getPortalProductFavoriteIds(): readonly number[] {
  return favoritesSnapshot;
}

export function subscribePortalProductFavorites(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function isPortalProductFavorite(productId: number): boolean {
  return favoriteIds.has(productId);
}

export function togglePortalProductFavorite(productId: number): boolean {
  if (favoriteIds.has(productId)) favoriteIds.delete(productId);
  else favoriteIds.add(productId);
  persist();
  emit();
  return favoriteIds.has(productId);
}

export function removePortalProductFavorite(productId: number): void {
  if (!favoriteIds.has(productId)) return;
  favoriteIds.delete(productId);
  persist();
  emit();
}

export function usePortalProductFavorites(): readonly number[] {
  return useSyncExternalStore(
    subscribePortalProductFavorites,
    getPortalProductFavoriteIds,
    () => [] as readonly number[]
  );
}

export function usePortalProductFavorite(productId: number | null | undefined) {
  const favorites = usePortalProductFavorites();
  const isFavorite = productId != null && favorites.includes(productId);
  const toggle = useCallback(() => {
    if (productId == null) return;
    togglePortalProductFavorite(productId);
  }, [productId]);
  return { isFavorite, toggle };
}
