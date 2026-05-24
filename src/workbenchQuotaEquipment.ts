import { useSyncExternalStore } from 'react';
import {
  applyQuotaIndustryChain,
  firstQuotaIndustryChain,
  findQuotaIndustryNode,
  QUOTA_INDUSTRY_TREE,
  type QuotaIndustryLevelFields,
} from './quotaIndustryClassification';
import { formatWaterSavingCategoryLabel, WATER_SAVING_SUB_CATEGORIES } from './productWorkbenchCatalog';

/** 省标 / 国标 / 其他：领跑值、先进值、通用值 */
export type QuotaStandardTriple = {
  leading: string;
  advanced: string;
  general: string;
};

export const EMPTY_QUOTA_STANDARD_TRIPLE: QuotaStandardTriple = {
  leading: '',
  advanced: '',
  general: '',
};

/** 定额产品库条目 */
export type QuotaProductRecord = QuotaIndustryLevelFields & {
  id: string;
  productCode: string;
  productName: string;
  /** 产品计量单位 */
  measureUnit: string;
  provincial: QuotaStandardTriple;
  national: QuotaStandardTriple;
  other: QuotaStandardTriple;
};

/** 设备映射表条目 */
export type EquipmentMappingRecord = {
  id: string;
  equipmentName: string;
  equipmentCode: string;
  quotaProductId: string;
  waterSavingCategorySubId: string;
  enabled: boolean;
  remark: string;
};

function emptyTriple(v?: Partial<QuotaStandardTriple>): QuotaStandardTriple {
  return {
    leading: v?.leading ?? '',
    advanced: v?.advanced ?? '',
    general: v?.general ?? '',
  };
}

function resolveIndustryByCodes(codes: string[]): QuotaIndustryLevelFields {
  const nodes = codes
    .map((code) => findQuotaIndustryNode(QUOTA_INDUSTRY_TREE, code))
    .filter((n): n is NonNullable<typeof n> => Boolean(n));
  if (nodes.length) return applyQuotaIndustryChain(nodes);
  return applyQuotaIndustryChain(firstQuotaIndustryChain(QUOTA_INDUSTRY_TREE[1]!));
}

function buildSeedRow(
  id: string,
  productCode: string,
  productName: string,
  measureUnit: string,
  chainCodes: string[],
  standards: {
    provincial?: Partial<QuotaStandardTriple>;
    national?: Partial<QuotaStandardTriple>;
    other?: Partial<QuotaStandardTriple>;
  }
): QuotaProductRecord {
  const industry = resolveIndustryByCodes(chainCodes);
  return {
    id,
    productCode,
    productName,
    measureUnit,
    ...industry,
    provincial: emptyTriple(standards.provincial),
    national: emptyTriple(standards.national),
    other: emptyTriple(standards.other),
  };
}

export const SEED_QUOTA_PRODUCTS: QuotaProductRecord[] = [
  buildSeedRow('qp-001', 'B0610-0001', '煤炭开采', 't', ['B', 'B06', 'B061', 'B0610'], {
    provincial: { leading: '0.12', advanced: '0.18', general: '0.25' },
    national: { leading: '0.10', advanced: '0.16', general: '0.22' },
    other: { leading: '—', advanced: '—', general: '—' },
  }),
  buildSeedRow('qp-002', 'B0610-0002', '炼焦煤选煤厂', 't', ['B', 'B06', 'B061', 'B0610'], {
    provincial: { leading: '0.08', advanced: '0.14', general: '0.20' },
    national: { leading: '0.07', advanced: '0.12', general: '0.18' },
    other: { leading: '0.09', advanced: '0.15', general: '0.21' },
  }),
  buildSeedRow('qp-003', 'B0610-0003', '原煤开采', '-', ['B', 'B06', 'B061', 'B0610'], {
    provincial: { leading: '0.06', advanced: '0.1', general: '2' },
    national: { leading: '3', advanced: '—', general: '—' },
    other: { leading: '—', advanced: '—', general: '—' },
  }),
  buildSeedRow('qp-004', 'B0620-0001', '褐煤开采', 't', ['B', 'B06', 'B062', 'B0620'], {
    provincial: { leading: '0.15', advanced: '0.22', general: '0.30' },
    national: { leading: '0.13', advanced: '0.20', general: '0.28' },
    other: { leading: '—', advanced: '—', general: '—' },
  }),
  buildSeedRow('qp-005', 'B0710-0001', '石油开采', 't', ['B', 'B07', 'B071', 'B0710'], {
    provincial: { leading: '0.45', advanced: '0.62', general: '0.80' },
    national: { leading: '0.42', advanced: '0.58', general: '0.75' },
    other: { leading: '—', advanced: '—', general: '—' },
  }),
  buildSeedRow('qp-006', 'B0720-0001', '天然气开采', '万m³', ['B', 'B07', 'B072', 'B0720'], {
    provincial: { leading: '1.2', advanced: '1.8', general: '2.4' },
    national: { leading: '1.1', advanced: '1.6', general: '2.2' },
    other: { leading: '—', advanced: '—', general: '—' },
  }),
  buildSeedRow('qp-007', 'B0810-0001', '铁矿采选', 't', ['B', 'B08', 'B081', 'B0810'], {
    provincial: { leading: '0.20', advanced: '0.28', general: '0.36' },
    national: { leading: '0.18', advanced: '0.26', general: '0.34' },
    other: { leading: '—', advanced: '—', general: '—' },
  }),
  buildSeedRow('qp-008', 'B0610-0004', '无烟煤开采', 't', ['B', 'B06', 'B061', 'B0610'], {
    provincial: { leading: '0.10', advanced: '0.16', general: '0.23' },
    national: { leading: '0.09', advanced: '0.14', general: '0.20' },
    other: { leading: '—', advanced: '—', general: '—' },
  }),
  buildSeedRow('qp-009', 'B0610-0005', '洗精煤', 't', ['B', 'B06', 'B061', 'B0610'], {
    provincial: { leading: '0.06', advanced: '0.10', general: '0.15' },
    national: { leading: '0.05', advanced: '0.09', general: '0.14' },
    other: { leading: '—', advanced: '—', general: '—' },
  }),
  buildSeedRow('qp-010', 'B0690-0001', '其他煤炭采选', '-', ['B', 'B06', 'B069', 'B0690'], {
    provincial: { leading: '0.14', advanced: '0.20', general: '0.28' },
    national: { leading: '0.12', advanced: '0.18', general: '0.26' },
    other: { leading: '—', advanced: '—', general: '—' },
  }),
  buildSeedRow('qp-011', 'B0610-0006', '露天煤矿', 't', ['B', 'B06', 'B061', 'B0610'], {
    provincial: { leading: '0.09', advanced: '0.13', general: '0.19' },
    national: { leading: '0.08', advanced: '0.12', general: '0.17' },
    other: { leading: '—', advanced: '—', general: '—' },
  }),
  buildSeedRow('qp-012', 'B0820-0001', '锰矿采选', 't', ['B', 'B08', 'B082', 'B0820'], {
    provincial: { leading: '0.22', advanced: '0.30', general: '0.38' },
    national: { leading: '0.20', advanced: '0.28', general: '0.36' },
    other: { leading: '—', advanced: '—', general: '—' },
  }),
];

export const SEED_EQUIPMENT_MAPPINGS: EquipmentMappingRecord[] = [
  {
    id: 'map-001',
    equipmentName: '开式横流节能冷却塔 KH-450',
    equipmentCode: 'EQ-CT-KH450',
    quotaProductId: 'qp-001',
    waterSavingCategorySubId: 'device_material::冷却设备',
    enabled: true,
    remark: '门户供给市场冷却塔产品与定额条目映射',
  },
  {
    id: 'map-002',
    equipmentName: 'NB-IoT 智能超声波水表',
    equipmentCode: 'EQ-WM-NB01',
    quotaProductId: 'qp-002',
    waterSavingCategorySubId: 'monitoring::流量仪表',
    enabled: true,
    remark: '计量监测类设备映射示例',
  },
];

const QUOTA_STORAGE_KEY = 'workbench-quota-products-v2';
const MAPPING_STORAGE_KEY = 'workbench-equipment-mappings-v1';

type LegacyQuotaRow = {
  id: string;
  productCode?: string;
  productName?: string;
  industry?: string;
  processName?: string;
  quotaUnit?: string;
  quotaValue?: string;
  unit?: string;
  enabled?: boolean;
  remark?: string;
  measureUnit?: string;
  industryL1Code?: string;
  provincial?: Partial<QuotaStandardTriple>;
  national?: Partial<QuotaStandardTriple>;
  other?: Partial<QuotaStandardTriple>;
};

/** 补齐省标/国标/其他定额字段，避免旧 localStorage 数据导致表格渲染报错白屏 */
export function normalizeQuotaProductRecord(
  raw: Partial<QuotaProductRecord> & { id: string }
): QuotaProductRecord {
  const base = createEmptyQuotaProductForm();
  return {
    ...base,
    ...raw,
    id: raw.id,
    productCode: raw.productCode?.trim() || base.productCode,
    productName: raw.productName?.trim() || base.productName,
    measureUnit: raw.measureUnit?.trim() || base.measureUnit,
    industryL1Code: raw.industryL1Code ?? base.industryL1Code,
    industryL1Name: raw.industryL1Name ?? base.industryL1Name,
    industryL2Code: raw.industryL2Code ?? base.industryL2Code,
    industryL2Name: raw.industryL2Name ?? base.industryL2Name,
    industryL3Code: raw.industryL3Code ?? base.industryL3Code,
    industryL3Name: raw.industryL3Name ?? base.industryL3Name,
    industryL4Code: raw.industryL4Code ?? base.industryL4Code,
    industryL4Name: raw.industryL4Name ?? base.industryL4Name,
    provincial: emptyTriple(raw.provincial),
    national: emptyTriple(raw.national),
    other: emptyTriple(raw.other),
  };
}

function migrateLegacyQuotaRow(raw: LegacyQuotaRow): QuotaProductRecord {
  if (raw.industryL1Code && raw.measureUnit != null) {
    return normalizeQuotaProductRecord(raw as QuotaProductRecord);
  }
  const mining = firstQuotaIndustryChain(QUOTA_INDUSTRY_TREE[1]!);
  const industry = applyQuotaIndustryChain(mining);
  const val = raw.quotaValue?.trim() || '—';
  return normalizeQuotaProductRecord({
    id: raw.id,
    productCode: raw.productCode?.trim() || `LEGACY-${raw.id}`,
    productName: raw.productName?.trim() || '未命名产品',
    measureUnit: raw.unit?.trim() || raw.quotaUnit?.trim() || '—',
    ...industry,
    provincial: { general: val },
    national: { general: val },
    other: {},
  });
}

function loadQuotaProducts(): QuotaProductRecord[] {
  try {
    const raw = localStorage.getItem(QUOTA_STORAGE_KEY);
    if (!raw) return [...SEED_QUOTA_PRODUCTS];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || parsed.length === 0) return [...SEED_QUOTA_PRODUCTS];
    const rows: QuotaProductRecord[] = [];
    for (const row of parsed) {
      try {
        rows.push(migrateLegacyQuotaRow(row as LegacyQuotaRow));
      } catch {
        /* 跳过单条损坏数据，避免整页白屏 */
      }
    }
    return rows.length > 0 ? rows : [...SEED_QUOTA_PRODUCTS];
  } catch {
    return [...SEED_QUOTA_PRODUCTS];
  }
}

/** 清空本地缓存并恢复内置演示数据（无需打开控制台） */
export function resetQuotaProductsToSeed(): void {
  try {
    localStorage.removeItem(QUOTA_STORAGE_KEY);
  } catch {
    /* ignore */
  }
  quotaProducts = [...SEED_QUOTA_PRODUCTS];
  emitQuota();
}

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || parsed.length === 0) return fallback;
    return parsed as T;
  } catch {
    return fallback;
  }
}

function persist(key: string, data: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

/* ── 定额产品库 store ── */

let quotaProducts: QuotaProductRecord[] = loadQuotaProducts();
let quotaSnapshot: readonly QuotaProductRecord[] = quotaProducts;
const quotaListeners = new Set<() => void>();

function emitQuota() {
  quotaSnapshot = quotaProducts;
  quotaListeners.forEach((l) => l());
}

export function subscribeQuotaProducts(listener: () => void): () => void {
  quotaListeners.add(listener);
  return () => quotaListeners.delete(listener);
}

export function getQuotaProductsSnapshot(): readonly QuotaProductRecord[] {
  return quotaSnapshot;
}

/** useSyncExternalStore 要求 getSnapshot 在数据未变时返回稳定引用，不可每次 spread 新数组 */
export function useQuotaProducts(): readonly QuotaProductRecord[] {
  return useSyncExternalStore(
    subscribeQuotaProducts,
    getQuotaProductsSnapshot,
    getQuotaProductsSnapshot
  );
}

export function getQuotaProductById(id: string): QuotaProductRecord | undefined {
  return quotaProducts.find((r) => r.id === id);
}

export function upsertQuotaProduct(
  form: Omit<QuotaProductRecord, 'id'>,
  editingId?: string
): QuotaProductRecord {
  if (editingId) {
    const row = normalizeQuotaProductRecord({ ...form, id: editingId });
    quotaProducts = quotaProducts.map((r) => (r.id === editingId ? row : r));
    persist(QUOTA_STORAGE_KEY, quotaProducts);
    emitQuota();
    return row;
  }
  const row = normalizeQuotaProductRecord({ ...form, id: `qp-${Date.now()}` });
  quotaProducts = [row, ...quotaProducts];
  persist(QUOTA_STORAGE_KEY, quotaProducts);
  emitQuota();
  return row;
}

export function deleteQuotaProduct(id: string) {
  quotaProducts = quotaProducts.filter((r) => r.id !== id);
  persist(QUOTA_STORAGE_KEY, quotaProducts);
  emitQuota();
}

export function createEmptyQuotaProductForm(
  industryPrefill?: QuotaIndustryLevelFields
): Omit<QuotaProductRecord, 'id'> {
  const base =
    industryPrefill ??
    applyQuotaIndustryChain(firstQuotaIndustryChain(QUOTA_INDUSTRY_TREE[1] ?? QUOTA_INDUSTRY_TREE[0]!));
  return {
    productCode: '',
    productName: '',
    measureUnit: '',
    ...base,
    provincial: emptyTriple(),
    national: emptyTriple(),
    other: emptyTriple(),
  };
}

export function validateQuotaProductForm(form: Omit<QuotaProductRecord, 'id'>): string | null {
  if (!form.productCode.trim()) return '请填写产品代码';
  if (!form.productName.trim()) return '请填写产品名称';
  if (!form.industryL1Code.trim()) return '请选择行业类别';
  return null;
}

export function displayQuotaStandardCell(value: string): string {
  const v = value.trim();
  return v || '—';
}

/* ── 设备映射 store ── */

let equipmentMappings: EquipmentMappingRecord[] = loadJson(MAPPING_STORAGE_KEY, [...SEED_EQUIPMENT_MAPPINGS]);
let mappingSnapshot: readonly EquipmentMappingRecord[] = equipmentMappings;
const mappingListeners = new Set<() => void>();

function emitMapping() {
  mappingSnapshot = equipmentMappings;
  mappingListeners.forEach((l) => l());
}

export function subscribeEquipmentMappings(listener: () => void): () => void {
  mappingListeners.add(listener);
  return () => mappingListeners.delete(listener);
}

export function getEquipmentMappingsSnapshot(): readonly EquipmentMappingRecord[] {
  return mappingSnapshot;
}

export function useEquipmentMappings(): readonly EquipmentMappingRecord[] {
  return useSyncExternalStore(
    subscribeEquipmentMappings,
    getEquipmentMappingsSnapshot,
    getEquipmentMappingsSnapshot
  );
}

export function upsertEquipmentMapping(
  form: Omit<EquipmentMappingRecord, 'id'>,
  editingId?: string
): EquipmentMappingRecord {
  if (editingId) {
    equipmentMappings = equipmentMappings.map((r) =>
      r.id === editingId ? { ...form, id: editingId } : r
    );
    const row = equipmentMappings.find((r) => r.id === editingId)!;
    persist(MAPPING_STORAGE_KEY, equipmentMappings);
    emitMapping();
    return row;
  }
  const row: EquipmentMappingRecord = { ...form, id: `map-${Date.now()}` };
  equipmentMappings = [row, ...equipmentMappings];
  persist(MAPPING_STORAGE_KEY, equipmentMappings);
  emitMapping();
  return row;
}

export function deleteEquipmentMapping(id: string) {
  equipmentMappings = equipmentMappings.filter((r) => r.id !== id);
  persist(MAPPING_STORAGE_KEY, equipmentMappings);
  emitMapping();
}

export function createEmptyEquipmentMappingForm(): Omit<EquipmentMappingRecord, 'id'> {
  return {
    equipmentName: '',
    equipmentCode: '',
    quotaProductId: quotaProducts[0]?.id ?? '',
    waterSavingCategorySubId: WATER_SAVING_SUB_CATEGORIES[0]?.subId ?? '',
    enabled: true,
    remark: '',
  };
}

export function validateEquipmentMappingForm(form: Omit<EquipmentMappingRecord, 'id'>): string | null {
  if (!form.equipmentName.trim()) return '请填写设备/产品名称';
  if (!form.equipmentCode.trim()) return '请填写设备编码';
  if (!form.quotaProductId) return '请选择关联定额产品';
  if (!form.waterSavingCategorySubId) return '请选择节水产业分类';
  return null;
}

export function formatEquipmentMappingQuotaLabel(quotaProductId: string): string {
  const q = getQuotaProductById(quotaProductId);
  if (!q) return '—';
  return `${q.productCode} · ${q.productName}`;
}

export function formatEquipmentMappingCategoryLabel(subId: string): string {
  return formatWaterSavingCategoryLabel(subId) || subId;
}
