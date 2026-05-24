import { useSyncExternalStore } from 'react';
import { inferApplicationFieldsFromProduct, PRODUCTS } from './data';
import { formatApplicationFieldsList } from './workbenchApplicationFields';
import { WATER_SAVING_SUB_CATEGORIES } from './productWorkbenchCatalog';

const STORAGE_KEY = 'workbench-managed-products-v1';

/** 企业店铺首页「明星产品」数量上限 */
export const MAX_STAR_PRODUCTS = 5;

export type WorkbenchManagedProduct = {
  id: string;
  name: string;
  /** 供方企业（供应市场、详情展示） */
  supplierEnterprise: string;
  /** 产品简介（供应详情展示，最多 500 字） */
  productIntro?: string;
  industryCategory: string;
  applicationField: string;
  applicationFields?: string[];
  image: string;
  images?: string[];
  paramValues: Record<string, string>;
  /** 是：展示在企业店铺首页「明星产品」区 */
  isStarProduct: boolean;
};

function seedProducts(): WorkbenchManagedProduct[] {
  return PRODUCTS.slice(0, 8).map((p, i) => {
    const sub = WATER_SAVING_SUB_CATEGORIES[i % WATER_SAVING_SUB_CATEGORIES.length];
    const applicationFields = inferApplicationFieldsFromProduct(p);
    return {
      id: `wb-${p.id}`,
      name: p.name,
      supplierEnterprise: p.supplier,
      industryCategory: sub?.subId ?? '',
      applicationField: formatApplicationFieldsList(applicationFields),
      applicationFields,
      image: p.image,
      images: [p.image],
      productIntro: p.info,
      paramValues: { 产品简介: p.info },
      isStarProduct: i < 2,
    };
  });
}

function isWorkbenchManagedProduct(x: unknown): x is Omit<WorkbenchManagedProduct, 'isStarProduct'> & {
  isStarProduct?: boolean;
} {
  if (!x || typeof x !== 'object') return false;
  const o = x as WorkbenchManagedProduct;
  return typeof o.id === 'string' && typeof o.name === 'string';
}

function loadProducts(): WorkbenchManagedProduct[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedProducts();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return seedProducts();
    return parsed
      .filter(isWorkbenchManagedProduct)
      .map((row) => ({
        ...row,
        supplierEnterprise: String(row.supplierEnterprise ?? '').trim(),
        isStarProduct: Boolean(row.isStarProduct),
      }));
  } catch {
    return seedProducts();
  }
}

let products: WorkbenchManagedProduct[] = loadProducts();
let snapshot: readonly WorkbenchManagedProduct[] = products;
const listeners = new Set<() => void>();

function emit() {
  snapshot = products;
  listeners.forEach((l) => l());
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch {
    /* ignore */
  }
}

export function getWorkbenchProductsSnapshot(): readonly WorkbenchManagedProduct[] {
  return snapshot;
}

export function subscribeWorkbenchProducts(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useWorkbenchProducts(): readonly WorkbenchManagedProduct[] {
  return useSyncExternalStore(subscribeWorkbenchProducts, getWorkbenchProductsSnapshot, () =>
    seedProducts()
  );
}

export function setWorkbenchProducts(next: WorkbenchManagedProduct[]) {
  products = [...next];
  persist();
  emit();
}

export function upsertWorkbenchProduct(row: WorkbenchManagedProduct) {
  const idx = products.findIndex((p) => p.id === row.id);
  if (idx >= 0) {
    const copy = [...products];
    copy[idx] = row;
    setWorkbenchProducts(copy);
    return;
  }
  setWorkbenchProducts([row, ...products]);
}

export function deleteWorkbenchProduct(id: string) {
  setWorkbenchProducts(products.filter((p) => p.id !== id));
}

/** 当前已标记为明星产品的数量（编辑时可排除本条） */
export function countWorkbenchStarProducts(excludeProductId?: string): number {
  return products.filter((p) => p.isStarProduct && p.id !== excludeProductId).length;
}

/** 工作台标记为明星、且可映射到门户商品库 id 的集合 */
export function getWorkbenchStarPortalProductIds(): ReadonlySet<number> {
  const ids = new Set<number>();
  for (const row of products) {
    if (!row.isStarProduct) continue;
    const m = /^wb-(\d+)$/.exec(row.id);
    if (!m) continue;
    const id = Number(m[1]);
    if (Number.isFinite(id)) ids.add(id);
  }
  return ids;
}

export function getWorkbenchProductByPortalId(portalProductId: number): WorkbenchManagedProduct | undefined {
  return products.find((p) => p.id === `wb-${portalProductId}`);
}

export function getStarProductsForSupplier(supplierName: string): (typeof PRODUCTS)[number][] {
  const starIds = getWorkbenchStarPortalProductIds();
  const same = PRODUCTS.filter((p) => p.supplier === supplierName);
  const starred = same.filter((p) => starIds.has(p.id));
  if (starred.length > 0) return starred.slice(0, 6);
  return same.length >= 2 ? same.slice(0, 6) : same.slice(0, Math.min(4, same.length));
}
