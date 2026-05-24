import { CATEGORIES_HIERARCHY } from './data';
import type { CascaderOption } from './HorizontalCascaderPanel';

/** 节水产品分类二级（与后台产品管理、产业分类参数模板同源） */
export type WaterSavingSubCategory = {
  topName: string;
  topId: string;
  subName: string;
  subId: string;
};

export function buildWaterSavingSubCategories(): WaterSavingSubCategory[] {
  const list: WaterSavingSubCategory[] = [];
  for (const top of CATEGORIES_HIERARCHY) {
    for (const sub of top.subCategories) {
      list.push({
        topName: top.name,
        topId: top.id,
        subName: sub.name,
        subId: `${top.id}::${sub.name}`,
      });
    }
  }
  return list;
}

export const WATER_SAVING_SUB_CATEGORIES = buildWaterSavingSubCategories();

/** 节水产业分类级联（一级门类 → 二级类目） */
export function buildWaterSavingCascaderOptions(): CascaderOption[] {
  return CATEGORIES_HIERARCHY.map((top) => ({
    value: top.id,
    label: top.name,
    children: top.subCategories.map((sub) => ({
      value: `${top.id}::${sub.name}`,
      label: sub.name,
    })),
  }));
}

export function waterSavingPathFromSubId(subId: string): string[] {
  if (!subId) return [];
  const topId = subId.split('::')[0] ?? '';
  return topId ? [topId, subId] : [subId];
}

export type ParamTemplateItem = {
  name: string;
  placeholder: string;
  required: boolean;
  sort: number;
};

export type ParamTemplateGroup = {
  name: string;
  items: ParamTemplateItem[];
};

/** 冷却设备 · 产品参数模板（工况热力类 + 结构形式类） */
export const COOLING_EQUIPMENT_PARAM_TEMPLATE: ParamTemplateGroup[] = [
  {
    name: '工况热力类',
    items: [
      { name: '设计进水温度', placeholder: '4(℃)', required: true, sort: 1 },
      { name: '设计出水温度', placeholder: '5(℃)', required: true, sort: 2 },
      { name: '设计温降 (℃)', placeholder: '6(℃)', required: false, sort: 3 },
      { name: '适用设计湿球温度 (℃)', placeholder: '7(℃)', required: false, sort: 4 },
      { name: '单塔散热量 (kW/kcal/h)', placeholder: '5 (kW/kcal/h)', required: false, sort: 5 },
    ],
  },
  {
    name: '结构形式类',
    items: [
      { name: '气流方式', placeholder: '逆流 / 横流', required: false, sort: 1 },
      { name: '结构外形', placeholder: '圆形 / 方形 / 矩形', required: false, sort: 2 },
      { name: '换热形式', placeholder: '开式 / 闭式 / 混流', required: false, sort: 3 },
      { name: '壳体材质', placeholder: '玻璃钢 / 镀锌板 / 不锈钢 / 混凝土', required: false, sort: 4 },
      { name: '填料材质', placeholder: 'PVC/PP/ 耐高温改性 / 金属', required: false, sort: 5 },
    ],
  },
];

/** 二级分类专属产品参数模板（与 WorkbenchIndustryCategoryParamPanel 种子一致） */
export const PRODUCT_PARAM_TEMPLATES: Record<string, ParamTemplateGroup[]> = {
  'device_material::冷却设备': COOLING_EQUIPMENT_PARAM_TEMPLATE,
  'device_material::节水型阀门': [
    {
      name: '阀门参数',
      items: [
        { name: '阀门类型', placeholder: '如：蝶阀/球阀/闸阀', required: true, sort: 1 },
        { name: '公称通径(DN)', placeholder: '请输入公称通径', required: true, sort: 2 },
        { name: '公称压力(PN)', placeholder: '如：PN10/PN16', required: true, sort: 3 },
        { name: '阀体材质', placeholder: '如：铸铁/不锈钢', required: false, sort: 4 },
      ],
    },
  ],
  'device_material::智能水表': [
    {
      name: '计量参数',
      items: [
        { name: '口径', placeholder: '如：DN15/DN20', required: true, sort: 1 },
        { name: '量程比', placeholder: '如：100:1', required: true, sort: 2 },
        { name: '精度等级', placeholder: '如：2级', required: true, sort: 3 },
        { name: '通讯协议', placeholder: '如：NB-IoT/LoRa', required: false, sort: 4 },
      ],
    },
  ],
};

/** 工作台产品管理：选定任意二级分类后统一带出冷却设备参数表（工况热力类 + 结构形式类） */
export function resolveWorkbenchProductParamTemplate(subId: string | undefined): ParamTemplateGroup[] {
  if (!subId?.trim()) return [];
  return COOLING_EQUIPMENT_PARAM_TEMPLATE;
}

export function formatWaterSavingCategoryLabel(subId: string): string {
  const sub = WATER_SAVING_SUB_CATEGORIES.find((s) => s.subId === subId);
  if (!sub) return subId;
  return `${sub.topName} / ${sub.subName}`;
}

export function orderedParamEntries(
  subId: string,
  paramValues: Record<string, string>
): { group: string; name: string; value: string }[] {
  const tpl = PRODUCT_PARAM_TEMPLATES[subId] ?? COOLING_EQUIPMENT_PARAM_TEMPLATE;
  const out: { group: string; name: string; value: string }[] = [];
  const seen = new Set<string>();
  for (const group of tpl) {
    for (const item of group.items) {
      const val = paramValues[item.name]?.trim();
      if (!val) continue;
      out.push({ group: group.name, name: item.name, value: val });
      seen.add(item.name);
    }
  }
  for (const [name, value] of Object.entries(paramValues)) {
    if (seen.has(name) || !value.trim()) continue;
    out.push({ group: '其他', name, value: value.trim() });
  }
  return out;
}
