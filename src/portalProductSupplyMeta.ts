import { useSyncExternalStore } from 'react';
import type { ProductRecord } from './data';
import { inferApplicationFieldsFromProduct, PRODUCTS } from './data';
import { formatApplicationFieldsList } from './workbenchApplicationFields';
import {
  COOLING_EQUIPMENT_PARAM_TEMPLATE,
  PRODUCT_PARAM_TEMPLATES,
  WATER_SAVING_SUB_CATEGORIES,
  formatWaterSavingCategoryLabel,
  type WaterSavingSubCategory,
} from './productWorkbenchCatalog';
import { getWorkbenchProductByPortalId } from './workbenchProductsStore';

const STORAGE_KEY = 'portal-product-supply-meta-v1';

export type ProductSupplyMeta = {
  applicationField: string;
  waterSavingCategoryLabel: string;
  industryCategorySubId: string;
  paramValues: Record<string, string>;
  /** 后台产品管理维护的供方企业 */
  supplierEnterprise?: string;
};

function placeholderToDemo(placeholder: string): string {
  return placeholder.replace(/^示例：/, '').replace(/^如：/, '').trim();
}

function buildDemoParamValues(subId: string, product: ProductRecord): Record<string, string> {
  const tpl = PRODUCT_PARAM_TEMPLATES[subId] ?? COOLING_EQUIPMENT_PARAM_TEMPLATE;
  const values: Record<string, string> = {};
  for (const group of tpl) {
    for (const item of group.items) {
      values[item.name] = placeholderToDemo(item.placeholder) || '—';
    }
  }
  if (Object.keys(values).length === 0) {
    values['产品说明'] = product.info;
  }
  return values;
}

function seedMetaForProduct(product: ProductRecord, sub: WaterSavingSubCategory): ProductSupplyMeta {
  const applicationFields = inferApplicationFieldsFromProduct(product);
  return {
    applicationField: formatApplicationFieldsList(applicationFields),
    waterSavingCategoryLabel: `${sub.topName} / ${sub.subName}`,
    industryCategorySubId: sub.subId,
    paramValues: buildDemoParamValues(sub.subId, product),
  };
}

function buildSeedMetaMap(): Record<number, ProductSupplyMeta> {
  const out: Record<number, ProductSupplyMeta> = {};
  const subs = WATER_SAVING_SUB_CATEGORIES;
  PRODUCTS.forEach((p, i) => {
    const sub = subs[i % subs.length];
    if (!sub) return;
    out[p.id] = seedMetaForProduct(p, sub);
  });
  return out;
}

function loadMetaMap(): Record<number, ProductSupplyMeta> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildSeedMetaMap();
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return buildSeedMetaMap();
    const seed = buildSeedMetaMap();
    const merged = { ...seed };
    for (const [k, v] of Object.entries(parsed as Record<string, ProductSupplyMeta>)) {
      const id = Number(k);
      if (!Number.isFinite(id) || !v || typeof v !== 'object') continue;
      merged[id] = {
        applicationField: String(v.applicationField ?? merged[id]?.applicationField ?? ''),
        waterSavingCategoryLabel: String(
          v.waterSavingCategoryLabel ?? merged[id]?.waterSavingCategoryLabel ?? ''
        ),
        industryCategorySubId: String(v.industryCategorySubId ?? merged[id]?.industryCategorySubId ?? ''),
        paramValues:
          v.paramValues && typeof v.paramValues === 'object'
            ? { ...v.paramValues }
            : { ...(merged[id]?.paramValues ?? {}) },
        supplierEnterprise: String(v.supplierEnterprise ?? merged[id]?.supplierEnterprise ?? '').trim(),
      };
    }
    return merged;
  } catch {
    return buildSeedMetaMap();
  }
}

let metaByProductId: Record<number, ProductSupplyMeta> = loadMetaMap();
let metaSnapshot: readonly ProductSupplyMeta[] = Object.freeze(
  Object.values(metaByProductId)
) as readonly ProductSupplyMeta[];
const listeners = new Set<() => void>();

function syncSnapshot() {
  metaSnapshot = Object.freeze(Object.values(metaByProductId)) as readonly ProductSupplyMeta[];
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(metaByProductId));
  } catch {
    /* ignore */
  }
}

function emit() {
  syncSnapshot();
  listeners.forEach((l) => l());
}

export function subscribePortalProductSupplyMeta(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getPortalProductSupplyMetaSnapshot(): readonly ProductSupplyMeta[] {
  return metaSnapshot;
}

export function getProductSupplyMeta(productId: number): ProductSupplyMeta | undefined {
  return metaByProductId[productId];
}

/** 供应详情 / 供方市场：优先使用后台产品管理维护的供方企业 */
export function getPortalProductSupplierName(product: ProductRecord): string {
  const fromMeta = metaByProductId[product.id]?.supplierEnterprise?.trim();
  if (fromMeta) return fromMeta;
  const wb = getWorkbenchProductByPortalId(product.id);
  const fromWorkbench = wb?.supplierEnterprise?.trim();
  if (fromWorkbench) return fromWorkbench;
  return product.supplier;
}

export function getProductSupplyMetaForRecord(product: ProductRecord): ProductSupplyMeta {
  const hit = metaByProductId[product.id];
  if (hit) return hit;
  const subs = WATER_SAVING_SUB_CATEGORIES;
  const sub = subs[(product.id - 1) % subs.length];
  if (!sub) {
    const applicationFields = inferApplicationFieldsFromProduct(product);
    return {
      applicationField: formatApplicationFieldsList(applicationFields),
      waterSavingCategoryLabel: product.category,
      industryCategorySubId: '',
      paramValues: { 产品说明: product.info },
    };
  }
  return seedMetaForProduct(product, sub);
}

/** 后台产品管理保存时同步至门户供应详情展示 */
export function upsertProductSupplyMetaFromWorkbench(input: {
  portalProductId: number;
  industryCategorySubId: string;
  applicationField: string;
  paramValues: Record<string, string>;
  supplierEnterprise?: string;
}) {
  const prev = metaByProductId[input.portalProductId];
  metaByProductId[input.portalProductId] = {
    applicationField: input.applicationField.trim(),
    industryCategorySubId: input.industryCategorySubId,
    waterSavingCategoryLabel: formatWaterSavingCategoryLabel(input.industryCategorySubId),
    paramValues: { ...input.paramValues },
    supplierEnterprise: input.supplierEnterprise?.trim() || prev?.supplierEnterprise || '',
  };
  persist();
  emit();
}

export function parseWorkbenchPortalProductId(workbenchId: string): number | null {
  const m = /^wb-(\d+)$/.exec(workbenchId);
  if (!m) return null;
  const id = Number(m[1]);
  return Number.isFinite(id) ? id : null;
}

export function usePortalProductSupplyMetaVersion(): number {
  const list = useSyncExternalStore(
    subscribePortalProductSupplyMeta,
    getPortalProductSupplyMetaSnapshot,
    () => [] as readonly ProductSupplyMeta[]
  );
  return list.length;
}
