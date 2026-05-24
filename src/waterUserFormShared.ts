import {
  EMPTY_INDUSTRY_LEVELS,
  ENTERPRISE_ENTITY_TYPE_OPTIONS,
  ENTERPRISE_INDUSTRY_TREE,
  applyIndustryChain,
  findIndustryNode,
  formatIndustryOption,
  type IndustryLevelFields,
  type IndustryTreeNode,
} from './enterpriseFormShared';
import type { CascaderOption } from './HorizontalCascaderPanel';
import { WORKBENCH_REGION_TREE } from './workbenchRegionTree';

export { normalizeCreditCode, isValidCreditCode } from './enterpriseCreditCode';

export function buildRegionCascaderOptions(): CascaderOption[] {
  return Object.entries(WORKBENCH_REGION_TREE).map(([province, cities]) => ({
    value: province,
    label: province,
    children: Object.entries(cities).map(([city, districts]) => ({
      value: city,
      label: city,
      children: districts.map((d) => ({ value: d, label: d })),
    })),
  }));
}

export function buildWaterUserTypeCascaderOptions(): CascaderOption[] {
  return (['企业法人', '非企业法人'] as const).map((legal) => ({
    value: legal,
    label: legal,
    children: ENTERPRISE_ENTITY_TYPE_OPTIONS[legal].map((group) => ({
      value: group.label,
      label: group.label,
      children:
        group.children.length > 0
          ? group.children.map((child) => ({ value: child, label: child }))
          : undefined,
    })),
  }));
}

function industryNodeToCascader(node: IndustryTreeNode): CascaderOption {
  return {
    value: node.code,
    label: formatIndustryOption(node),
    children: node.children?.map(industryNodeToCascader),
  };
}

export function buildIndustryCascaderOptions(): CascaderOption[] {
  return ENTERPRISE_INDUSTRY_TREE.map(industryNodeToCascader);
}

export function industryPathFromFields(fields: IndustryLevelFields): string[] {
  return [fields.industryL1Code, fields.industryL2Code, fields.industryL3Code, fields.industryL4Code].filter(
    Boolean
  );
}

export function industryFieldsFromPath(path: string[]): IndustryLevelFields {
  if (path.length === 0 || !path[0]) return { ...EMPTY_INDUSTRY_LEVELS };
  const l1 = findIndustryNode(ENTERPRISE_INDUSTRY_TREE, path[0]);
  if (!l1) return { ...EMPTY_INDUSTRY_LEVELS };
  let chain = [l1];
  for (let i = 1; i < path.length; i++) {
    const code = path[i];
    const node = chain[chain.length - 1]?.children?.find((n) => n.code === code);
    if (!node) break;
    chain = [...chain, node];
  }
  return applyIndustryChain(EMPTY_INDUSTRY_LEVELS, chain);
}

export function regionPathFromParts(province: string, city: string, district: string): string[] {
  return [province, city, district].filter(Boolean);
}

export function regionPartsFromPath(path: string[]): {
  regionProvince: string;
  regionCity: string;
  regionDistrict: string;
} {
  return {
    regionProvince: path[0] ?? '',
    regionCity: path[1] ?? '',
    regionDistrict: path[2] ?? '',
  };
}

export function waterUserTypeFromPath(path: string[]): {
  userLegalType: '企业法人' | '非企业法人';
  subType: string;
  subLevel3: string;
} {
  const userLegalType = (path[0] === '非企业法人' ? '非企业法人' : '企业法人') as '企业法人' | '非企业法人';
  const subType = path[1] ?? ENTERPRISE_ENTITY_TYPE_OPTIONS[userLegalType][0]?.label ?? '';
  const group = ENTERPRISE_ENTITY_TYPE_OPTIONS[userLegalType].find((g) => g.label === subType);
  const subLevel3 = path[2] ?? (group && group.children.length > 0 ? group.children[0]! : '');
  return { userLegalType, subType, subLevel3 };
}

export function waterUserTypePathFromParts(
  userLegalType: string,
  subType: string,
  subLevel3: string
): string[] {
  const path: string[] = [];
  if (userLegalType.trim()) path.push(userLegalType.trim());
  if (subType.trim()) path.push(subType.trim());
  if (subLevel3.trim()) path.push(subLevel3.trim());
  return path;
}

/** 省市区拼接为所属区域展示/存储文本 */
export function formatRegionFromParts(province: string, city: string, district: string): string {
  return [province, city, district].filter(Boolean).join('');
}

export function parseRegionText(region: string): {
  regionProvince: string;
  regionCity: string;
  regionDistrict: string;
} {
  const provinces = Object.keys(WORKBENCH_REGION_TREE);
  const hit = provinces.find((p) => region.includes(p));
  if (!hit) return { regionProvince: '', regionCity: '', regionDistrict: '' };
  const cities = WORKBENCH_REGION_TREE[hit];
  if (!cities) return { regionProvince: hit, regionCity: '', regionDistrict: '' };
  const cityHit = Object.keys(cities).find((c) => region.includes(c));
  const districts = cityHit ? cities[cityHit] : undefined;
  return {
    regionProvince: hit,
    regionCity: cityHit ?? '',
    regionDistrict: districts?.[0] ?? '',
  };
}

/** @deprecated 使用 parseRegionText */
export const parseDemoRegionText = parseRegionText;

export function entityTypePathFromParts(userType: string, subType: string, subLevel3: string): string[] {
  if (!userType.trim() && !subType.trim() && !subLevel3.trim()) return [];
  return waterUserTypePathFromParts(userType, subType, subLevel3);
}

export function entityTypeFromPath(path: string[]): {
  userType: string;
  subType: string;
  subLevel3: string;
} {
  const parts = waterUserTypeFromPath(path);
  return {
    userType: parts.userLegalType,
    subType: parts.subType,
    subLevel3: parts.subLevel3,
  };
}

export const REGION_CASCADER_OPTIONS = buildRegionCascaderOptions();
export const WATER_USER_TYPE_CASCADER_OPTIONS = buildWaterUserTypeCascaderOptions();

export type WaterUserQccResult = {
  userName: string;
};

/** 演示：企查查仅带出企业名称（用户名称） */
export function fetchWaterUserByCreditCode(
  _creditCode: string,
  onResult: (data: WaterUserQccResult) => void
): () => void {
  const timer = window.setTimeout(() => {
    onResult({
      userName: '江苏省水利工程科技咨询股份有限公司',
    });
  }, 1200);
  return () => window.clearTimeout(timer);
}
