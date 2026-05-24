import type { OutcomeDemandType } from './supplyDemandOutcomes';

/** 首页节水需求卡片角标：与需求中心「需求类型」展示一致 */
export function homeDemandTypeTagLabel(type: OutcomeDemandType): string {
  if (type === '研发需求') return '技术需求';
  return type;
}

function outcomeDemandTypeToMarketType(type: OutcomeDemandType): DemandMarketType {
  if (type === '产品需求') return '采购需求';
  if (type === '金融需求') return '融资需求';
  if (type === '研发需求') return '技术需求';
  return '服务需求';
}

export const CATEGORIES_HIERARCHY = [
  {
    id: "device_material",
    name: "节水设备材料",
    subCategories: [
      {
        name: "灌溉设备",
        items: ["喷灌机", "微灌设备", "电磁阀", "智能控制器", "墒情传感器"]
      },
      {
        name: "清洗设备",
        items: ["农产品清洁机械", "水洗塔", "蒸馏锅", "高压热水清洗机", "自动清洗机", "洗涤机械", "洗衣龙"]
      },
      {
        name: "冷却设备",
        items: ["冷却塔", "冷却器", "冷凝器", "闭式冷却塔", "干冷器"]
      },
      {
        name: "控制设备",
        items: ["水泵", "阀门", "消防栓", "消防旋塞", "流量计", "压力变送器"]
      },
      {
        name: "节水管材",
        items: ["塑料管", "铸铁管", "钢管", "金属软管", "PPR管", "PE管"]
      },
      {
        name: "节水药剂",
        items: ["减水剂", "表面活性剂", "助剂", "洗涤剂", "缓蚀阻垢剂"]
      }
    ]
  },
  {
    id: "water_treatment",
    name: "水处理设备材料",
    subCategories: [
      {
        name: "曝气设备",
        items: ["微孔曝气器", "机械曝气机", "射流曝气器"]
      },
      {
        name: "过滤设备",
        items: ["多介质过滤器", "活性炭过滤器", "石英砂过滤器"]
      },
      {
        name: "膜平衡/药剂",
        items: ["反渗透膜", "超滤膜", "纳滤膜", "膜清洗剂"]
      },
      {
        name: "消毒设备",
        items: ["紫外线消毒器", "臭氧发生器", "次氯酸钠发生器"]
      }
    ]
  },
  {
    id: "monitoring",
    name: "计量监测设备仪器",
    subCategories: [
      {
        name: "流量仪表",
        items: ["超声波流量计", "电磁流量计", "涡街流量计", "智能水表"]
      },
      {
        name: "压力监测",
        items: ["压力传感器", "压力变送器", "压力记录仪"]
      },
      {
        name: "水质监测",
        items: ["浊度仪", "余氯监测仪", "COD分析仪", "PH计"]
      },
      {
        name: "漏损检测",
        items: ["听漏仪", "相关仪", "分区计量管控系统"]
      }
    ]
  },
  {
    id: "living_appliances",
    name: "节水生活器具",
    subCategories: [
      {
        name: "节水家电",
        items: ["洗碗机", "净水器", "洗衣机", "电热水器", "家用清洁器具"]
      },
      {
        name: "卫浴水暖",
        items: ["马桶", "淋浴器", "水龙头", "感应冲洗阀", "恒温混水阀"]
      },
      {
        name: "公共建筑",
        items: ["脚踏阀", "红外感应龙头", "延时自闭阀"]
      }
    ]
  },
  {
    id: "non_conventional",
    name: "非常规水源供应",
    subCategories: [
      {
        name: "再生水利用",
        items: ["中水处理站", "再生水管网", "回用水泵房"]
      },
      {
        name: "雨水收集",
        items: ["雨水模块", "弃流装置", "雨水调蓄池"]
      },
      {
        name: "海水利用",
        items: ["海水淡化工程", "海水直接利用系统"]
      }
    ]
  },
  {
    id: "digital_smart",
    name: "节水数字化产品",
    subCategories: [
      {
        name: "智慧水务",
        items: ["漏损管控平台", "节水监测大屏", "管网数字孪生"]
      },
      {
        name: "物联感知",
        items: ["智能网关", "在线计量终端", "水质传感器"]
      }
    ]
  },
  {
    id: "service",
    name: "节水服务类",
    subCategories: [
      {
        name: "咨询评价",
        items: ["水平衡测试", "节水载体创建", "节水规划编制"]
      },
      {
        name: "合同节水",
        items: ["托管型合同节水", "节费型合同节水", "改造升级服务"]
      },
      {
        name: "技术培训",
        items: ["节水技术交流", "标准宣贯", "人才培育"]
      }
    ]
  },
  {
    id: "other",
    name: "其他",
    subCategories: [
      {
        name: "未归入上列类目",
        items: [] as string[],
      },
    ],
  },
];

/** 样式4「节水产业分类」：扁平两级（左栏=截图一级即原二级类目；flyout=截图二级示例词条） */
export type IndustryStyle4FlatRow = {
  id: string;
  name: string;
  examples: string[];
};

export const CATEGORIES_INDUSTRY_STYLE4_FLAT: IndustryStyle4FlatRow[] = [
  { id: 's4-irrigation', name: '灌溉设备', examples: ['喷灌机', '微灌设备'] },
  {
    id: 's4-cleaning',
    name: '清洗设备',
    examples: [
      '农产品清洁机械',
      '水洗塔',
      '蒸馏锅',
      '蒸馏釜',
      '高压热水清洁机',
      '自动清洗机',
      '洗涤机械',
      '洗衣龙',
    ],
  },
  { id: 's4-cooling', name: '冷却设备', examples: ['冷却塔', '冷却器', '冷凝器'] },
  { id: 's4-control', name: '控制设备', examples: ['水泵', '阀门', '消防栓', '消防旋塞'] },
  { id: 's4-pipes', name: '节水管材', examples: ['塑料管', '铸铁管', '钢管', '金属软管'] },
  { id: 's4-save-agents', name: '节水药剂', examples: ['减水剂', '表面活性剂', '助剂', '洗涤剂'] },
  {
    id: 's4-treat-agents',
    name: '水处理药剂',
    examples: [
      '水处理剂',
      '污水处理化学药剂',
      '污水处理生物药剂',
      '离子交换树脂',
      '有机合成高分子絮凝剂',
    ],
  },
  {
    id: 's4-membrane',
    name: '水处理膜材料',
    examples: ['微滤膜', '超滤膜', '反渗透膜', '电渗析膜', '中空纤维膜', '纳滤膜', '陶瓷膜'],
  },
  {
    id: 's4-sewage-equip',
    name: '污水处理设备',
    examples: ['反渗透制水装置', '液体循环利用设备', '水纯化设备', '废水废气处理设备'],
  },
  {
    id: 's4-desal-equip',
    name: '海水淡化设备',
    examples: [
      '海水淡化设备组件',
      '海水淡化高压泵',
      '海水淡化能量回收设备部件',
      '海水淡化核心部件',
      '海水淡化装备',
    ],
  },
  {
    id: 's4-rain-equip',
    name: '雨水处理设备',
    examples: ['雨水收集利用与回渗技术与装置', '塑料储水容器', '高层建筑用搪瓷储水箱'],
  },
  { id: 's4-reclaim-equip', name: '再生水处理设备', examples: ['城镇再生水利用的技术设备', '尾水回灌设备制造'] },
  {
    id: 's4-other-water-equip',
    name: '其他水处理设备',
    examples: ['矿井水利用和净化装置', '苦咸水综合利用设施', '矿井水综合利用和技术装备'],
  },
  {
    id: 's4-water-metering',
    name: '水量计量设备',
    examples: ['水表', '智能水表', '流量仪表', '水文仪器', '气象仪器'],
  },
  {
    id: 's4-water-quality',
    name: '水质监测设备',
    examples: ['水污染监测仪器', '污染过程监控设备'],
  },
  { id: 's4-pipe-leak', name: '管网探漏设备', examples: [] },
  { id: 's4-monitor-tx', name: '监测传输设备', examples: [] },
  {
    id: 's4-home-appliance',
    name: '节水家电',
    examples: ['洗碗机', '净水器', '洗衣机', '电热水器', '家用清洁器具'],
  },
  { id: 's4-bath', name: '卫浴水暖', examples: ['马桶', '淋浴器'] },
  { id: 's4-reclaim-supply', name: '再生水的生产与供应', examples: [] },
  { id: 's4-seawater-supply', name: '淡化海水的生产与供应', examples: [] },
  { id: 's4-other-supply', name: '其他水源的生产与供应', examples: [] },
  { id: 's4-rd', name: '节水技术研发推广', examples: [] },
  { id: 's4-survey', name: '节水工程勘察设计', examples: [] },
  { id: 's4-consult', name: '节水管理咨询服务', examples: [] },
  { id: 's4-it', name: '节水信息技术服务', examples: [] },
  { id: 's4-trade', name: '水资源交易服务', examples: [] },
  { id: 's4-build', name: '节水工程施工', examples: [] },
  { id: 's4-other', name: '其他', examples: [] },
];

export type WaterSavingCategoryHierarchyEntry = (typeof CATEGORIES_HIERARCHY)[number];

function findWaterSavingCategoryNode(topCategoryName: string): WaterSavingCategoryHierarchyEntry | undefined {
  return CATEGORIES_HIERARCHY.find((c) => c.name === topCategoryName);
}

export function getIndustryStyle4FlatRowById(id: string): IndustryStyle4FlatRow | undefined {
  return CATEGORIES_INDUSTRY_STYLE4_FLAT.find((r) => r.id === id);
}

/** 首页「节水产品分类」左栏一级名称（样式3=层级树顶层，样式4=扁平产业类目） */
export function getHomeWaterSavingTopCategories(portalUiStyle: number): readonly string[] {
  if (portalUiStyle === 4) {
    return CATEGORIES_INDUSTRY_STYLE4_FLAT.map((r) => r.name);
  }
  return CATEGORIES_HIERARCHY.map((c) => c.name);
}

/** 首页 flyout 二级：样式3=subCategories.name，样式4=examples 词条 */
export function getHomeWaterSavingSubCategories(topName: string, portalUiStyle: number): readonly string[] {
  if (portalUiStyle === 4) {
    return CATEGORIES_INDUSTRY_STYLE4_FLAT.find((r) => r.name === topName)?.examples ?? [];
  }
  const node = findWaterSavingCategoryNode(topName);
  return node?.subCategories.map((s) => s.name) ?? [];
}

/** 供给市场列表：按首页一级/二级筛选 */
export function productMatchesHomeWaterSavingFilter(
  product: ProductRecord,
  top: string,
  sub: string,
  portalUiStyle: number
): boolean {
  if (top === '全部') return true;
  if (portalUiStyle === 4) {
    const row = CATEGORIES_INDUSTRY_STYLE4_FLAT.find((r) => r.name === top);
    if (!row) return false;
    if (sub === '全部') return productMatchesStyle4IndustryRow(product, row);
    return haystackForProductMatch(product).includes(sub);
  }
  if (sub === '全部') return productMatchesWaterSavingTopCategory(product, top);
  return productMatchesWaterSavingSubCategory(product, top, sub);
}

export type HomeWaterSavingSubSelection = { top: string; sub: string };

/** 首页进入供给市场时预填的节水分类（与 DemandMarketPage 筛选项一致） */
export type HomeWaterSavingSupplyMarketFilter = {
  selectedTops: string[];
  selectedSubs: HomeWaterSavingSubSelection[];
  /** 样式3 细类词条：在已选二级下再按商品名称包含该词筛选 */
  leafKeyword?: string;
};

function findStyle4FlatRowByName(name: string): IndustryStyle4FlatRow | undefined {
  return CATEGORIES_INDUSTRY_STYLE4_FLAT.find((r) => r.name === name);
}

/**
 * 按首页展示的一级/二级/细类名称解析供给市场预选路径。
 * 样式4：左栏一级=扁平行名，flyout 二级=examples；样式3：顶层+subCategories+items。
 */
export function findHomeWaterSavingPathForKeyword(
  keyword: string,
  portalUiStyle: number
): { top: string; sub?: string; leafKeyword?: string } | null {
  const k = keyword.trim();
  if (!k) return null;

  if (portalUiStyle === 4) {
    const row = findStyle4FlatRowByName(k);
    if (row) return { top: row.name };
    for (const r of CATEGORIES_INDUSTRY_STYLE4_FLAT) {
      if (r.examples.includes(k)) return { top: r.name, sub: k };
    }
    return null;
  }

  for (const node of CATEGORIES_HIERARCHY) {
    if (node.name === k) return { top: node.name };
    for (const sub of node.subCategories) {
      if (sub.name === k) return { top: node.name, sub: sub.name };
      if (sub.items.includes(k)) {
        return { top: node.name, sub: sub.name, leafKeyword: k };
      }
    }
  }
  return null;
}

export function buildSupplyMarketFilterFromHomePath(
  portalUiStyle: number,
  path: { top: string; sub?: string; leafKeyword?: string }
): HomeWaterSavingSupplyMarketFilter {
  if (path.sub) {
    return {
      selectedTops: [],
      selectedSubs: [{ top: path.top, sub: path.sub }],
      leafKeyword: path.leafKeyword,
    };
  }
  return { selectedTops: [path.top], selectedSubs: [], leafKeyword: path.leafKeyword };
}

export function buildSupplyMarketFilterFromHomeKeyword(
  keyword: string,
  portalUiStyle: number
): HomeWaterSavingSupplyMarketFilter {
  const path = findHomeWaterSavingPathForKeyword(keyword, portalUiStyle);
  if (!path) return { selectedTops: [], selectedSubs: [] };
  return buildSupplyMarketFilterFromHomePath(portalUiStyle, path);
}

export function buildSupplyMarketFilterFromStyle4RowId(
  rowId: string
): HomeWaterSavingSupplyMarketFilter {
  const row = getIndustryStyle4FlatRowById(rowId);
  if (!row) return { selectedTops: [], selectedSubs: [] };
  return { selectedTops: [row.name], selectedSubs: [] };
}

export function buildSupplyMarketFilterFromHeroTile(
  tile: HomeHeroProductTile,
  portalUiStyle: number
): HomeWaterSavingSupplyMarketFilter {
  if (tile.style4IndustryCategoryId?.trim()) {
    const row = getIndustryStyle4FlatRowById(tile.style4IndustryCategoryId.trim());
    if (row) {
      const leaf = tile.categoryLeafKeyword?.trim();
      if (leaf) {
        return buildSupplyMarketFilterFromHomePath(portalUiStyle, { top: row.name, sub: leaf });
      }
      return { selectedTops: [row.name], selectedSubs: [] };
    }
  }
  if (tile.waterSavingTopCategory?.trim()) {
    return buildSupplyMarketFilterFromHomePath(portalUiStyle, {
      top: tile.waterSavingTopCategory.trim(),
      sub: tile.waterSavingSubCategory?.trim() || undefined,
    });
  }
  if (tile.categoryLeafKeyword?.trim()) {
    return buildSupplyMarketFilterFromHomeKeyword(tile.categoryLeafKeyword.trim(), portalUiStyle);
  }
  return buildSupplyMarketFilterFromHomeKeyword(tile.name, portalUiStyle);
}

/** 供给市场：一级/二级多选（未选任何项视为「全部」） */
export function productMatchesHomeWaterSavingMultiFilter(
  product: ProductRecord,
  selectedTops: readonly string[],
  selectedSubs: readonly HomeWaterSavingSubSelection[],
  portalUiStyle: number
): boolean {
  if (selectedTops.length === 0 && selectedSubs.length === 0) return true;
  if (selectedTops.some((top) => productMatchesHomeWaterSavingFilter(product, top, '全部', portalUiStyle))) {
    return true;
  }
  return selectedSubs.some(({ top, sub }) =>
    productMatchesHomeWaterSavingFilter(product, top, sub, portalUiStyle)
  );
}

/** 首页首屏中间宫格：8 个工业节水相关产品（4×2），配图与名称一一对应（Unsplash 实景） */
export type HomeHeroProductTile = {
  id: string;
  name: string;
  image: string;
  /** 「换一批」时关联 PRODUCTS 条目，列表页按同类目聚合 */
  linkedProductId?: number;
  /**
   * 左侧「节水产品分类」点入（旧：按关键词+别名筛，易混入其它商品）；保留供非 flyout 入口复用。
   * 与 linkedProductId 互斥优先：有 browseKeyword 时优先走分类浏览逻辑。
   */
  browseKeyword?: string;
  /** 左侧 flyout 叶子名称：仅在商品「名称」子串匹配，不用 category/info/别名，避免列表出现其它产品名 */
  categoryLeafKeyword?: string;
  /** 左侧「查看该类目全量列表」：按顶层大类聚合（与供给市场节水产品分类一致） */
  waterSavingTopCategory?: string;
  /**
   * 左侧 flyout 二级分组：须与 waterSavingTopCategory 同时存在；
   * 仅按该二级分组名及其下细类关键词聚合（不含同大类其它二级）。
   */
  waterSavingSubCategory?: string;
  /** 样式4 扁平「节水产业分类」左栏一级 id（与 CATEGORIES_INDUSTRY_STYLE4_FLAT 对应） */
  style4IndustryCategoryId?: string;
};

export const HOME_HERO_PRODUCT_TILES: HomeHeroProductTile[] = [
  {
    id: 'cooling_tower',
    name: '冷却塔',
    image:
      'https://images.unsplash.com/photo-1772376920794-326f1bc87be6?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'cooler',
    name: '冷却器',
    image:
      'https://images.unsplash.com/photo-1776860153678-b204dccd0f65?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'scrubber_tower',
    name: '水洗塔',
    image:
      'https://images.unsplash.com/photo-1584060330377-3fd93ef4e991?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'water_pump',
    name: '水泵',
    image:
      'https://images.unsplash.com/photo-1760776066784-dfe3e7b45b3b?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'pressure_sensor',
    name: '压力传感器',
    image:
      'https://images.unsplash.com/photo-1694532438941-06bb0d95dae5?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'smart_water_meter',
    name: '智能水表',
    image:
      'https://images.unsplash.com/photo-1618776382458-ec07a950ff59?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'flow_meter',
    name: '流量计',
    image:
      'https://images.unsplash.com/photo-1698031610511-c7a35d121b17?auto=format&fit=crop&q=80&w=600',
  },
  // 第 8 格：您列出 7 个名称，此处补「电磁阀」；可改 id/name/image 换成其它产品
  {
    id: 'solenoid_valve',
    name: '电磁阀',
    image:
      'https://images.unsplash.com/photo-1761758674188-2b8e4c89c5e2?auto=format&fit=crop&q=80&w=600',
  },
];

export const CATEGORIES = CATEGORIES_HIERARCHY.map(c => c.name);

export const PRODUCTS = [
  {
    id: 1,
    name: "高精度超声波水表",
    category: "智能节水仪表",
    scenario: "城镇供水现状监测",
    info: "具备高量程比，支持远传数据监控，漏损实时报警。",
    image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=400",
    supplier: "水麒麟科技有限公司"
  },
  {
    id: 2,
    name: "工业微波节水冷却塔",
    category: "工业节水设备",
    scenario: "火力发电、化工循环水",
    info: "通过微波技术提升冷却效率，减少漂水蒸发损失30%。",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=400",
    supplier: "蓝绿工业科技集团"
  },
  {
    id: 3,
    name: "AI多光谱智能节水灌溉机器人",
    category: "智慧农业",
    scenario: "大面积农田精准节水",
    info: "采用多光谱成像技术与边缘AI算力，精准识别作物渴度，实现厘米级按需滴灌，节水率突破60%。",
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=400",
    supplier: "丰登农业智能"
  },
  {
    id: 4,
    name: "智能节水淋浴控制器",
    category: "卫浴生活器具",
    scenario: "酒店、员工宿舍、健身房",
    info: "集成恒温芯片与流量监测，智能限制洗浴时长，防止超时浪费。",
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400",
    supplier: "广西卫浴智能先锋"
  },
  {
    id: 5,
    name: "开式横流节能冷却塔 KH-450",
    category: "工业节水设备",
    scenario: "石化与电力循环水场",
    info: "高效填料与低阻力收水器组合，适配大冷却水量工况，漂水率低、维护便捷。",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=400",
    supplier: "荏原冷热系统（中国）"
  },
  {
    id: 6,
    name: "NB-IoT 远传智能水表",
    category: "智能节水仪表",
    scenario: "分区计量与漏损管控",
    info: "低功耗广域组网，支持小时级用水曲线与异常用水告警。",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=400",
    supplier: "润霖水务技术"
  },
  {
    id: 7,
    name: "园区雨水收集调蓄系统",
    category: "非常规水源",
    scenario: "厂区绿化与道路冲洗",
    info: "屋面雨水汇集、过滤调蓄后回用，降低自来水取用量。",
    image: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&q=80&w=400",
    supplier: "大禹节水"
  },
  {
    id: 8,
    name: "变频恒压供水机组",
    category: "工业节水设备",
    scenario: "高层供水与循环补水",
    info: "按末端压力动态调频，减少节流损失与泵组空转能耗。",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=400",
    supplier: "南方泵业"
  },
  {
    id: 9,
    name: "节水型感应冲水阀",
    category: "卫浴生活器具",
    scenario: "公共卫生间改造",
    info: "红外感应与流量限制联动，降低长流水与误触发用水。",
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400",
    supplier: "广西卫浴智能先锋"
  },
  {
    id: 10,
    name: "反渗透浓水回收装置",
    category: "水处理设备",
    scenario: "纯水制备与回用",
    info: "对 RO 浓水再浓缩与回用，提高系统回收率，减少排污量。",
    image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=400",
    supplier: "博世科环保科技"
  },
  {
    id: 11,
    name: "闭式横流冷却塔 CT-200",
    category: "工业节水设备",
    scenario: "数据中心与空调冷站",
    info: "闭式循环、低漂水率，配套智能风机变频与水质在线监测。",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=400",
    supplier: "江苏金航冷却塔有限公司"
  },
  {
    id: 12,
    name: "钢板逆流式工业冷却塔",
    category: "工业节水设备",
    scenario: "化工循环水场",
    info: "模块化钢结构塔体，防腐涂层与高效收水器，适应高盐雾环境。",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=400",
    supplier: "上海良机冷却设备"
  },
  {
    id: 13,
    name: "玻璃钢圆形冷却塔 LBC-300",
    category: "工业节水设备",
    scenario: "中小循环水量场景",
    info: "轻质高强 FRP 塔体，低噪声风机，安装周期短。",
    image: "https://images.unsplash.com/photo-1772376920794-326f1bc87be6?auto=format&fit=crop&q=80&w=400",
    supplier: "广州马利新菱冷却塔"
  },
  {
    id: 14,
    name: "蒸发式冷凝冷却塔一体机",
    category: "工业节水设备",
    scenario: "冷链与食品加工冷冻站",
    info: "蒸发冷与冷却塔一体化设计，减少补水与风机能耗。",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=400",
    supplier: "大连斯频德环境科技"
  },
  {
    id: 15,
    name: "节水型喷雾冷却塔",
    category: "工业节水设备",
    scenario: "干熄焦与冶金循环水",
    info: "雾化布水降低风阻与飘水，适合高温差工况。",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=400",
    supplier: "山东格瑞德集团"
  },
  {
    id: 16,
    name: "智能联控冷却塔组（3 台套）",
    category: "工业节水设备",
    scenario: "多塔并联智慧冷站",
    info: "群控算法按湿球温度切换台数，年节电节水双达标。",
    image: "https://images.unsplash.com/photo-1772376920794-326f1bc87be6?auto=format&fit=crop&q=80&w=400",
    supplier: "水麒麟科技有限公司"
  },
  {
    id: 17,
    name: "卷盘式节水喷灌机 JP75-300",
    category: "智慧农业",
    scenario: "大田与制种基地喷灌",
    info: "桁架卷盘与低压喷头组合，均匀度高、能耗低，配套墒情联动可显著降低灌溉定额。",
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=400",
    supplier: "大禹节水"
  },
  {
    id: 18,
    name: "指针式中心支轴喷灌机（节水型）",
    category: "智慧农业",
    scenario: "规模化牧场与饲草地",
    info: "变频行走与变量施水，减少径流与深层渗漏，适配圆形地块一键规划。",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=400",
    supplier: "丰登农业智能"
  }
];

export type ProductRecord = (typeof PRODUCTS)[number];

/** 供给市场「节水产品分类」：与首页首屏左侧大类一致（CATEGORIES_HIERARCHY 顶层名称） */
export const SUPPLY_PRODUCT_TOP_CATEGORY_OPTIONS: readonly string[] = Object.freeze(['全部', ...CATEGORIES]);

/** 应用领域标准枚举（不含「全部」） */
export const APPLICATION_FIELD_OPTIONS = Object.freeze([
  '农业节水',
  '工业节水',
  '城镇生活节水',
  '非常规水开发利用',
  '通用节水',
] as const);

export type ApplicationFieldOption = (typeof APPLICATION_FIELD_OPTIONS)[number];

/** 供给市场「应用领域分类」筛选项（含「全部」） */
export const SUPPLY_INDUSTRY_TYPE_OPTIONS = Object.freeze(['全部', ...APPLICATION_FIELD_OPTIONS] as const);

/** 工作台/注册等多选应用领域：与供给市场筛选项一致 */
export const SUPPLY_APPLICATION_DOMAIN_OPTIONS: readonly string[] = SUPPLY_INDUSTRY_TYPE_OPTIONS;

/** 商品是否被任一非「其他」节水大类关键词命中（与 flyout / 全量列表规则一致；含样式4扁平产业树） */
function productMatchesAnyNonOtherWaterSavingCategory(product: ProductRecord): boolean {
  const hay = `${product.name} ${product.category} ${product.scenario ?? ''} ${product.info}`;
  for (const node of CATEGORIES_HIERARCHY) {
    if (node.name === '其他') continue;
    const keys = [node.name, ...node.subCategories.flatMap((s) => [s.name, ...s.items])];
    if (keys.some((k) => k.length > 0 && hay.includes(k))) return true;
  }
  for (const row of CATEGORIES_INDUSTRY_STYLE4_FLAT) {
    if (row.name === '其他') continue;
    const keys = [row.name, ...row.examples];
    if (keys.some((k) => k.trim().length > 0 && hay.includes(k))) return true;
  }
  return false;
}

export function productMatchesWaterSavingTopCategory(product: ProductRecord, top: string): boolean {
  if (top === '全部') return true;
  if (top === '其他') {
    return !productMatchesAnyNonOtherWaterSavingCategory(product);
  }
  const node = findWaterSavingCategoryNode(top);
  if (!node) return false;
  const keys = [node.name, ...node.subCategories.flatMap((s) => [s.name, ...s.items])];
  const hay = `${product.name} ${product.category} ${product.scenario ?? ''} ${product.info}`;
  return keys.some((k) => k.length > 0 && hay.includes(k));
}

export function productMatchesPrimaryIndustry(product: ProductRecord, ind: string): boolean {
  if (ind === '全部') return true;
  const hay = `${product.name} ${product.category} ${product.scenario ?? ''} ${product.info}`;
  const rules: Record<string, readonly string[]> = {
    农业节水: ['农业', '农田', '灌溉', '作物', '智慧农业'],
    工业节水: ['工业', '火电', '化工', '电力', '石化', '循环', '冷却', '泵', '机组', '反渗透', 'RO', '冶金', '数据中心', '空调'],
    城镇生活节水: ['城镇', '酒店', '宿舍', '健身房', '公共', '卫生', '淋浴', '卫浴', '生活'],
    非常规水开发利用: ['雨水', '非常规', '再生', '收集', '回用', '调蓄'],
    通用节水: ['水平衡', '仪表', '计量', '测试', '通用', '水表', '流量', '超声波', 'NB-IoT'],
  };
  const keys = rules[ind];
  if (!keys) return false;
  return keys.some((k) => hay.includes(k));
}

export function productMatchesApplicationDomain(product: ProductRecord, domain: string): boolean {
  if (domain === '全部') return true;
  return productMatchesPrimaryIndustry(product, domain);
}

/** 按产品文案推断应用领域（用于种子数据与旧数据迁移） */
export function inferApplicationFieldsFromProduct(product: ProductRecord): ApplicationFieldOption[] {
  const matched = APPLICATION_FIELD_OPTIONS.filter((opt) => productMatchesPrimaryIndustry(product, opt));
  return matched.length > 0 ? [...matched] : ['通用节水'];
}

export function productMockHot(id: number): number {
  return (id * 137 + 49) % 500 + 80;
}

export function productMockViews(id: number): number {
  return (id * 97 + 120) % 9999 + 100;
}

export function productMockPublishedTs(id: number): number {
  return id * 86400000;
}

const haystackForProductMatch = (p: ProductRecord) =>
  `${p.name} ${p.category} ${p.scenario ?? ''} ${p.info} ${p.supplier}`;

export function productMatchesStyle4IndustryRow(product: ProductRecord, row: IndustryStyle4FlatRow): boolean {
  const keys = [row.name, ...row.examples].filter((k) => k.trim().length > 0);
  const hay = haystackForProductMatch(product);
  return keys.some((k) => hay.includes(k));
}

export function getProductsForStyle4IndustryRow(row: IndustryStyle4FlatRow): ProductRecord[] {
  return PRODUCTS.filter((p) => productMatchesStyle4IndustryRow(p, row));
}

/**
 * 左侧分类/子类链接：按关键词（及可选别名）筛商品；无命中返回 []，不回落全量。
 */
export function getProductsForCategoryBrowseKeyword(keyword: string): ProductRecord[] {
  const raw = keyword.trim();
  if (!raw) return [];

  const aliasTokens: Record<string, readonly string[]> = {
    微灌设备: ['微灌', '滴灌', '灌溉', '灌区'],
    灌溉设备: ['灌溉', '滴灌', '喷灌', '灌区', '农田'],
    智能控制器: ['控制', '联控', '变频', '智能'],
    墒情传感器: ['墒情', '传感', '监测', '计量'],
    电磁阀: ['电磁阀', '阀门', '阀'],
    冷却塔: ['冷却塔'],
    冷却器: ['冷却器', '冷凝'],
    闭式冷却塔: ['闭式', '冷却塔'],
    干冷器: ['干冷', '冷却'],
    冷凝器: ['冷凝'],
    水洗塔: ['水洗', '洗涤', '清洗'],
    洗衣机: ['洗衣', '洗涤'],
    洗碗机: ['洗碗', '洗涤'],
    净水器: ['净水', '反渗透', '纯水', '过滤'],
  };
  const tokens = [raw, ...(aliasTokens[raw] ?? [])];
  const seen = new Set<number>();
  const out: ProductRecord[] = [];
  for (const t of tokens) {
    if (!t) continue;
    for (const p of PRODUCTS) {
      if (seen.has(p.id)) continue;
      if (haystackForProductMatch(p).includes(t)) {
        seen.add(p.id);
        out.push(p);
      }
    }
  }
  return out;
}

/** 左侧 flyout 点某一细类名称：仅商品名称包含关键词，与别名/类目全文无关 */
export function getProductsForCategoryLeafKeyword(keyword: string): ProductRecord[] {
  const k = keyword.trim();
  if (!k) return [];
  return PRODUCTS.filter((p) => p.name.includes(k));
}

/** 商品是否命中某一顶层大类下的「单个二级」分组（二级名 + 其下细类项关键词） */
export function productMatchesWaterSavingSubCategory(
  product: ProductRecord,
  topCategoryName: string,
  subCategoryName: string
): boolean {
  const node = findWaterSavingCategoryNode(topCategoryName);
  if (!node) return false;
  const sub = node.subCategories.find((s) => s.name === subCategoryName);
  if (!sub) return false;
  const keys = [sub.name, ...sub.items];
  const hay = `${product.name} ${product.category} ${product.scenario ?? ''} ${product.info}`;
  return keys.some((k) => k.length > 0 && hay.includes(k));
}

export function getProductsForWaterSavingSubCategory(topCategoryName: string, subCategoryName: string): ProductRecord[] {
  const top = topCategoryName.trim();
  const sub = subCategoryName.trim();
  if (!top || !sub) return [];
  return PRODUCTS.filter((p) => productMatchesWaterSavingSubCategory(p, top, sub));
}

/** 飞出面板的「查看该类目全量」：与供给市场一致，按顶层大类聚合命中商品 */
export function getProductsForWaterSavingTopCategory(topCategoryName: string): ProductRecord[] {
  if (!topCategoryName.trim()) return [];
  return PRODUCTS.filter((p) => productMatchesWaterSavingTopCategory(p, topCategoryName));
}

/** 首页热门宫格点击进入时：按 tile 精确语义筛选；冷却塔等避免「循环」等词误命中药剂 */
export function getProductsForHeroTile(tile: HomeHeroProductTile): ProductRecord[] {
  if (tile.categoryLeafKeyword?.trim()) {
    return getProductsForCategoryLeafKeyword(tile.categoryLeafKeyword.trim());
  }
  if (tile.style4IndustryCategoryId?.trim()) {
    const row = getIndustryStyle4FlatRowById(tile.style4IndustryCategoryId.trim());
    if (row) return getProductsForStyle4IndustryRow(row);
  }
  const top = tile.waterSavingTopCategory?.trim();
  const sub = tile.waterSavingSubCategory?.trim();
  if (top && sub) {
    return getProductsForWaterSavingSubCategory(top, sub);
  }
  if (top) {
    return getProductsForWaterSavingTopCategory(top);
  }
  if (tile.browseKeyword?.trim()) {
    return getProductsForCategoryBrowseKeyword(tile.browseKeyword.trim());
  }

  /** 宫格 id 与「换一批」衍生 id 区分：固定宫格用名称子串严格筛 */
  const strictNameSubstrByTileId: Record<string, string> = {
    cooling_tower: '冷却塔',
    cooler: '冷却器',
  };
  const strictSub = strictNameSubstrByTileId[tile.id];
  if (strictSub) {
    const strictHit = PRODUCTS.filter((p) => p.name.includes(strictSub));
    if (strictHit.length > 0) return strictHit;
  }

  if (tile.linkedProductId != null) {
    const anchor = PRODUCTS.find((p) => p.id === tile.linkedProductId);
    if (anchor) {
      if (anchor.name.includes('冷却塔')) {
        const towers = PRODUCTS.filter((p) => p.name.includes('冷却塔'));
        if (towers.length > 0) return towers;
      }
      if (anchor.name.includes('冷却器')) {
        const coolers = PRODUCTS.filter((p) => p.name.includes('冷却器'));
        if (coolers.length > 0) return coolers;
      }
      const same = PRODUCTS.filter((p) => p.category === anchor.category);
      if (same.length > 0) return same;
    }
  }
  const extraByTileId: Record<string, string[]> = {
    cooler: ['冷却器', '冷凝'],
    scrubber_tower: ['水洗', '洗涤', '清洗'],
    water_pump: ['水泵', '泵', '供水'],
    pressure_sensor: ['压力传感', '压力', '变送'],
    smart_water_meter: ['水表', '智能水表', '计量', '超声波'],
    flow_meter: ['流量计', '流量', '计量'],
    solenoid_valve: ['电磁阀', '阀门', '阀'],
  };
  const keys = [...(extraByTileId[tile.id] ?? []), tile.name].filter((k) => k.length > 0);
  const hit = PRODUCTS.filter((p) =>
    keys.some(
      (k) =>
        p.name.includes(k) ||
        p.category.includes(k) ||
        (p.scenario?.includes(k) ?? false) ||
        p.info.includes(k)
    )
  );
  return hit.length > 0 ? hit : [...PRODUCTS];
}

/** 样式4 收藏：将首页宫格 tile 解析为 PRODUCTS 主键 id */
export function resolveProductIdForHeroTile(tile: HomeHeroProductTile): number | null {
  if (tile.linkedProductId != null) return tile.linkedProductId;
  const exact = PRODUCTS.find((p) => p.name === tile.name);
  if (exact) return exact.id;
  const list = getProductsForHeroTile(tile);
  return list[0]?.id ?? null;
}

export type TechCase = {
  id: number;
  name: string;
  category: string;
  description: string;
  image: string;
};

export const TECH_CASES: TechCase[] = [
  {
    id: 1,
    name: "某大型火力发电厂中水回用项目",
    category: "工业",
    description: "采用超滤+反渗透工艺处理城市生活污水并回用于冷却循环系统，年节水量约为300万吨。",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: 2,
    name: "智慧农业精准滴灌试点工程",
    category: "农业",
    description: "通过集成土壤水分监测、自动控制阀门和微滴灌技术，实现水分利用效率提升40%以上。",
    image: "https://images.unsplash.com/photo-1492496913980-501348b61469?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: 3,
    name: "市政非常规水源综合调配中心",
    category: "非常规水",
    description: "集中收集雨水与中水，通过智能管网对城市绿化及景观用水进行统一调配，打造海绵城市典范。",
    image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: 4,
    name: "老旧小区节水型器具整体化改造",
    category: "城镇",
    description: "对老旧社区公共厕所及居民家庭进行节水龙头、智能座便器改造，综合节水率可达25%。",
    image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: 5,
    name: "企业水平衡测试与节水潜力识别平台",
    category: "通用",
    description: "利用数字化平台进行水平衡动态测试，实时识别漏损点位，适用于各类大中型工业、商贸、机关事业单位。",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: 6,
    name: "雨水收集与回用系统工程",
    category: "非常规水",
    description: "屋面与地面雨水收集、弃流过滤与调蓄回用一体化设计，用于厂区绿化与道路喷洒，替代优质自来水。",
    image: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: 7,
    name: "高耗水行业循环冷却水近零排放改造",
    category: "工业",
    description: "分级浓缩、分盐结晶与反渗透组合工艺，提高循环倍数，显著降低新鲜水补充与排污量。",
    image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: 9,
    name: "灌区渠道防渗与量测一体化节水改造",
    category: "农业",
    description: "渠道衬砌防渗、闸门量水与调度系统联动，降低输水损失并支撑农业水价综合改革计量到户。",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=400"
  }
];

/** 首页「案例推广」四宫格：四个典型案例，正文与节水中国行案例详情页一致（卡片 id 与案例库详情 id 一致） */
export const HOME_ADVANCED_CASE_TILES: TechCase[] = [
  {
    id: 965,
    name: '内蒙古锡林郭勒盟：烟气提水破局“富煤贫水”之困',
    category: '工业',
    description: '时间：2026-03-19 · 来源：内蒙古自治区水利厅',
    image:
      'https://images.unsplash.com/photo-1772376920794-326f1bc87be6?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 988,
    name: '江苏盛虹集团：打造纺织印染行业样板',
    category: '工业',
    description: '时间：2026-03-19 · 来源：江苏省水利厅',
    image:
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 1052,
    name: '贵州iCloud中国（贵安）数据中心：做水资源高效利用领跑者',
    category: '工业',
    description: '时间：2026-03-20 · 来源：贵州省水利厅',
    image:
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 986,
    name: '江苏宿迁市：“四化”协同推进再生水利用',
    category: '非常规水',
    description: '时间：2026-03-19 · 来源：江苏省水利厅',
    image:
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=400',
  },
];

/** 首页宫格 tileId 与案例库详情 id 一致（仅典型案例批）；兼容旧版 9651–9654 区间 */
const PORTAL_CASE_TILE_IDS = new Set<number>([965, 988, 1052, 986]);

export const PORTAL_HOME_ADVANCED_CASE_DETAIL_ID = 965 as const;

export function homeAdvancedCaseTileIdToPortalCaseId(tileId: number): number | null {
  if (tileId >= 9651 && tileId <= 9654) return PORTAL_HOME_ADVANCED_CASE_DETAIL_ID;
  if (PORTAL_CASE_TILE_IDS.has(tileId)) return tileId;
  return null;
}

/** 内蒙古锡林郭勒盟烟气提水案例 · https://www.waterconserving.cn/jszgx/Case/detail/965 */
export const PORTAL_CASE_INNER_MONGOLIA_XILINGOL = {
  id: 965,
  cat1: '工业节水',
  name: '内蒙古锡林郭勒盟：烟气提水破局“富煤贫水”之困',
  content: '时间：2026-03-19 · 来源：内蒙古自治区水利厅',
  image:
    'https://images.unsplash.com/photo-1772376920794-326f1bc87be6?auto=format&fit=crop&q=80&w=400',
  region: '内蒙古',
  source: '内蒙古自治区水利厅',
  date: '2026-03-19',
  views: '3,560',
  fullContent: [
    {
      type: 'text' as const,
      title: '一、背景',
      text:
        '锡林郭勒盟矿产资源丰富，褐煤储量居全国第一，是国家重点建设的煤电基地，但干旱少雨，水资源相对匮乏，是典型的“富煤贫水”地区。为破解水资源短缺与经济社会高质量发展的现实难题，锡林郭勒盟致力于挖掘工业企业节水潜力，重点加大褐煤高效清洁利用和能源企业节水技术、装备研发推广，以水资源高效利用赋能绿色发展。',
    },
    {
      type: 'image' as const,
      url: 'https://images.unsplash.com/photo-1768564206500-5cddb1fea679?auto=format&fit=crop&q=80&w=1200',
      caption: '锡林郭勒盟煤电基地节水实践场景（示意）',
    },
    {
      type: 'text' as const,
      title: '二、做法',
      text:
        '一是创新研发。京能（锡林郭勒）发电有限公司2019年国际首创660MW火电机组烟气提水系统，依托烟气中水蒸气分压相变冷凝结露换热原理，单台机组每小时产水90~120t，年产水100万t；单位发电耗水量达0.0918kg/（kW•h），较地区行业平均单位发电耗水量0.19kg/（kW·h）降低52%；水耗指标达到0.0255m³/（s•GW），较地区行业平均水耗指标0.053m³/（s•GW），降低52%，火电行业首次实现“零取水”的用水自平衡。二是全力推广。锡林郭勒盟系统开展了技术运行状况、节水能力及运行成本的调研与评估，积极探索降低建设成本和运行费用的有效途径，深入挖掘烟气提水技术的节水潜力，主导构建技术交流与推广平台，周密策划行业专题研讨、标杆企业现场观摩等系列推广活动，通过面对面交流、点对点示范和实际讲解，在全盟褐煤火电领域增强技术推广力度。全盟半数褐煤发电厂已采用烟气提水技术，此项创新技术已实现规模化应用。',
    },
    {
      type: 'text' as const,
      title: '三、成效',
      text:
        '该技术凭借其显著的资源效益与环境效益，已成为推动“富煤贫水”地区实现煤炭资源就地转化的关键解决方案。截至目前，全盟范围内已有11家褐煤火电企业应用此项技术，实现年节水量超1200万m³，约占全盟工业用水总量的五分之一。',
    },
    {
      type: 'image' as const,
      url: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&q=80&w=1200',
      caption: '非常规水源与节水工程（示意）',
    },
  ],
};

/** 江苏盛虹集团 · https://www.waterconserving.cn/jszgx/Case/detail/988 */
export const PORTAL_CASE_JIANGSU_SHENGHONG_988 = {
  id: 988,
  cat1: '工业节水',
  name: '江苏盛虹集团：打造纺织印染行业样板',
  content: '时间：2026-03-19 · 来源：江苏省水利厅',
  image:
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=400',
  region: '江苏',
  source: '江苏省水利厅',
  date: '2026-03-19',
  views: '4,120',
  fullContent: [
    {
      type: 'text' as const,
      title: '一、背景',
      text:
        '盛虹集团位于江苏省最南端的吴江区盛泽镇，是全国最大的纺织印染基地之一，连续9年蝉联中国印染行业“十强”榜首。集团积极研发、推广节水新工艺、新技术、新设备，单位产品取水量优于领跑值，水资源重复利用率高达72.69%，间接冷却水循环率保持在95%以上，主要指标均处于同行业领先水平，成为全国印染行业节水标杆企业。',
    },
    {
      type: 'image' as const,
      url: 'https://images.unsplash.com/photo-1610557892470-55d9fe80c0b7?auto=format&fit=crop&q=80&w=1200',
      caption: '盛虹集团全貌鸟瞰图（示意）',
    },
    {
      type: 'text' as const,
      title: '二、做法',
      text:
        '深化数字转型，提升水效水平。盛虹集团通过建设智慧印染工业互联网平台，实现生产全流程的数字化管理和智能化调度，推动水、电综合能耗下降15.4%。在关键环节应用冷堆平幅高效水洗、免复炼染色一浴法、RO膜深度处理回用等先进节水工艺，并升级改造气流染色机、印染废水在线集控系统及定型机中控系统，全年减少新水取用量385万立方米。\n\n强化技术创新，推动成果转化。企业自主研发并应用“高密化纤织物冷轧堆前处理关键技术”，实现常温条件下高效处理织物，节水率达50%以上，2023年、2025年两度入选《国家鼓励的工业节水工艺、技术和装备目录》；“印染废水低成本处理与高效再生利用关键技术”通过反渗透膜工艺将废水回用率提升至70%以上，获评中国纺织科学技术进步奖一等奖。\n\n完善管理体系，健全长效机制。集团建立“总部领导小组—分厂管理小组—基层执行单元”三级节水管理架构，设置专职节水管理岗位，明确责任分工。全面推行PDCA循环管理模式，每年制定分厂级节水目标，通过技改与管理优化双轮驱动落实节水措施，定期开展水平衡测试与用水审计评估成效，年末系统总结并推广经验。配套制定涵盖水资源管理、蒸汽使用、能源统计、节能奖惩等方面的制度体系，实现节水工作的规范化、制度化、长效化。',
    },
    {
      type: 'image' as const,
      url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=1200',
      caption: '盛虹集团RO膜处理车间（示意）',
    },
    {
      type: 'text' as const,
      title: '三、成效',
      text:
        '通过对印染生产全过程采用高效节水生产工艺，盛虹集团实现印染废水日回用总量规模超过4万吨，回用率达70%以上，减少成本约600万元/年，获评国家级“重点用水企业水效领跑者”。2025年，企业单位产品取水量为0.29m³/100m，用水重复利用率72.69%，间接冷却水循环率为97.3%、蒸汽冷凝水回用率为99.4%，均位于行业先进水平。',
    },
  ],
};

/** 贵州iCloud中国（贵安）数据中心 · https://www.waterconserving.cn/jszgx/Case/detail/1052 */
export const PORTAL_CASE_GUIZHOU_ICLOUD_GUIAN_1052 = {
  id: 1052,
  cat1: '工业节水',
  name: '贵州iCloud中国（贵安）数据中心：做水资源高效利用领跑者',
  content: '时间：2026-03-20 · 来源：贵州省水利厅',
  image:
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=400',
  region: '贵州',
  source: '贵州省水利厅',
  date: '2026-03-20',
  views: '2,890',
  fullContent: [
    {
      type: 'text' as const,
      title: '一、背景',
      text:
        'iCloud中国（贵安）数据中心占地约10万平方米，建设初期即遵循节水“三同时”原则。2020年获LEED金奖认证，2024年12月通过国际可持续水管理认证，成为国内数据中心水资源高效利用先行者。',
    },
    {
      type: 'text' as const,
      title: '二、做法',
      text:
        '（1）硬件设施源头节水\n采用闭式冷却系统，实现冷却几乎零补水，月节水数万吨；雨水回收系统满足绿化用水，生物滞留池与植草沟实现屋面径流自然净化与灌溉；全一级水效节水器具；三级计量网络实现各用水节点独立计量与精准管控。\n\n（2）软件系统智慧管水\n楼宇动环监控平台7×24小时实时监测瞬时流量、累计流量、压力等参数，每日自动生成用水报告，结合人工校验，建立“日统计、周分析、月总结”机制，为节水决策提供数据支撑。\n\n（3）管理机制持续优化\n发布《水资源管理指南》及《节水管理程序》，构建决策、管理、执行三级组织架构。每年开展水平衡测试，2024—2025年累计实施14项节水措施，形成“测试—诊断—创新—优化”闭环。设备定期预防性维护确保最优工况，全员节水培训提升水素养。\n\n（4）社会宣传辐射带动\n以“世界水日”“中国水周”为契机，组织员工赴红枫湖开展巡河护河行动；通过官网及社交媒体发布节水妙招与实践案例，积极履行节水社会责任。',
    },
    {
      type: 'image' as const,
      url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200',
      caption: '贵安数据中心（示意）',
    },
    {
      type: 'text' as const,
      title: '三、成效',
      text:
        '（1）年度用水总量由2023年6000吨降至2025年3100余吨，机柜规模增长下实现用水负增长。\n\n（2）雨水利用1800吨/年，闭式冷却系统年节水约50万吨，远低于区域内其他数据中心月用水量的十分之一。\n\n（3）2024—2025年累计实施14项节水措施，高分通过水平衡测试，获“贵州省节水单位”称号。\n\n（4）节水案例多次在行业及区域会议分享，受邀参与全国数据中心节水管理标准编制。\n\n（5）红枫湖护河常态化，新媒体宣传获广泛点赞，绿色品牌形象持续提升。',
    },
  ],
};

/** 江苏宿迁市再生水利用 · https://www.waterconserving.cn/jszgx/Case/detail/986 */
export const PORTAL_CASE_JIANGSU_SUQIAN_986 = {
  id: 986,
  cat1: '非常规水开发利用',
  name: '江苏宿迁市：“四化”协同推进再生水利用',
  content: '时间：2026-03-19 · 来源：江苏省水利厅',
  image:
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=400',
  region: '江苏',
  source: '江苏省水利厅',
  date: '2026-03-19',
  views: '3,240',
  fullContent: [
    {
      type: 'text' as const,
      title: '一、背景',
      text:
        '宿迁市人均水资源量仅为全国平均水平的1/4，是典型的资源性缺水城市。同时，作为南水北调东线核心节点，肩负着保障“一泓清水北上”的政治责任，每一滴水都弥足珍贵。面对减排保水质、增源促发展的双重挑战，宿迁以开辟城市“第二水源”给出破局答案。',
    },
    {
      type: 'text' as const,
      title: '二、做法',
      text:
        '全域化配置。建成跨5个行政区、串联9座污水处理厂、总长115公里的再生水配置主管网，创新形成“再生水厂就近一级配置利用+主管网更大范围二级配置利用”的“两级配置”布局。累计建成再生水取水站点46处，实现工业、市政、农林、生态全领域覆盖，解决了再生水“产-用”时空错配的难题。\n\n体系化管理。制定实施方案、实施细则、考核办法、价格指导意见、水质要求和激励办法等6项管理政策，发布计量统计、分类处理、分类利用、水权交易、效益评价和供水安全等6项技术导则，建立“市级统筹、区级主责、企业主体”的三级管理架构，形成“上层牵引+技术支撑”的全流程管理制度体系。\n\n数智化赋能。建成宿迁市数字孪生再生水利用配置系统，完善再生水水量、水质、水压计量感知设施，应用无人机自动巡检、人工智能等先进技术，建设智慧驾驶舱、GIS一张图、报表分析、报警管理、利用分析评估等模块，实现再生水生产、输配、利用环节的动态监测、实时分析与智能调控，为再生水安全可靠利用提供保障。\n\n市场化实践。率先构建以“减排为主、节水为基、生态叠加”为导向的再生水生态产品价值核算体系，建立基于再生水输配主管网的水权市场化交易机制，颁发全国首张再生水使用权凭证，使再生水成为可交易可融资的资产。探索再生水生态产品价值直接变现、置换变现、溢价变现、资本变现四大转化路径，形成利益共享格局。',
    },
    {
      type: 'image' as const,
      url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=1200',
      caption: '再生水利用配置调度中心（示意）',
    },
    {
      type: 'image' as const,
      url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=1200',
      caption: '中心城区再生水配置利用示意图（示意）',
    },
    {
      type: 'text' as const,
      title: '三、成效',
      text:
        '将再生水作为城市第二水源，中心城市再生水利用率从2021年的20.7%提升至2025年的28.8%，有效支撑地区生产总值年增量17.4亿元。通过“以用代排”，大幅削减入河污染物量，年节约治污经费6000万元，助力全市国考断面全部达标，有力保障了南水北调水质安全。',
    },
  ],
};

/** 案例库置顶：与首页四宫格一一对应的四个典型案例（顺序与 HOME_ADVANCED_CASE_TILES 一致） */
export const PORTAL_CASES_HOME_FEATURED = [
  PORTAL_CASE_INNER_MONGOLIA_XILINGOL,
  PORTAL_CASE_JIANGSU_SHENGHONG_988,
  PORTAL_CASE_GUIZHOU_ICLOUD_GUIAN_1052,
  PORTAL_CASE_JIANGSU_SUQIAN_986,
] as const;

export const DEMANDS = [
  {
    id: 1,
    title: "XX造纸厂急需中水回用成套设备",
    scene: "工业",
    demandType: "产品需求",
    time: "2小时前",
    likes: 124,
    user: "造纸厂采购办",
    supplier: "科远节水研发中心",
  },
  {
    id: 2,
    title: "某县农业灌溉区求购低功耗电磁阀",
    scene: "农业",
    demandType: "产品需求",
    time: "5小时前",
    likes: 89,
    user: "兴农合作社",
    supplier: "润霖水务技术",
  },
  {
    id: 3,
    title: "五星级酒店节水器具整体化升级方案",
    scene: "城镇",
    demandType: "产品需求",
    time: "昨天",
    likes: 56,
    user: "锦江酒店技术部",
    supplier: "广西卫浴智能先锋",
  },
  {
    id: 4,
    title: "矿区疏干水提质净化系统整体解决方案",
    scene: "非常规水",
    demandType: "研发需求",
    time: "30分钟前",
    likes: 42,
    user: "润华矿业总务",
    supplier: "博世科环保科技",
  },
  {
    id: 5,
    title: "全产业链节水数字化监测审计服务需求",
    scene: "通用",
    demandType: "服务需求",
    time: "1小时前",
    likes: 31,
    user: "某大数据产业园",
    supplier: "水麒麟科技有限公司",
  },
  {
    id: 6,
    title: "印染园区循环冷却水站托管运营服务招标",
    scene: "工业",
    demandType: "服务需求",
    time: "3小时前",
    likes: 67,
    user: "江南纺织产业园",
    supplier: "蓝绿工业科技集团",
  },
  {
    id: 7,
    title: "高校合同节水改造第三方评估与验收服务",
    scene: "城镇",
    demandType: "服务需求",
    time: "2天前",
    likes: 38,
    user: "某理工大学后勤处",
    supplier: "大禹节水",
  },
  {
    id: 8,
    title: "海水淡化浓盐水综合利用工艺包技术咨询",
    scene: "非常规水",
    demandType: "研发需求",
    time: "6小时前",
    likes: 51,
    user: "滨海新城建投",
    supplier: "南方泵业",
  },
  {
    id: 9,
    title: "万亩制种基地墒情监测与精准灌溉设备采购",
    scene: "农业",
    demandType: "产品需求",
    time: "45分钟前",
    likes: 73,
    user: "现代种业示范基地",
    supplier: "丰登农业智能",
  },
];

/** 需求中心·需方市场列表（筛选/分页演示数据，与首页 DEMANDS 主题一致并扩展字段） */
export type DemandMarketType = '采购需求' | '融资需求' | '服务需求' | '技术需求';

export type DemandMarketItem = {
  id: number;
  title: string;
  demandType: DemandMarketType;
  /** 展示为「需求类型」行，可与 demandType 不同（如含子类） */
  demandTypeLine?: string;
  validText: string;
  company: string;
  footerLeftValue: string;
  footerLeftCaption: string;
  footerRightValue: string;
  footerRightCaption: string;
  views: number;
  publishedAt: string;
};

/** 需求中心·需方市场列表「所属地区」轮换（江苏省地级市） */
const JS_CITIES = [
  '南京市',
  '苏州市',
  '无锡市',
  '常州市',
  '镇江市',
  '南通市',
  '扬州市',
  '泰州市',
  '盐城市',
  '淮安市',
  '连云港市',
  '宿迁市',
  '徐州市',
] as const;

const DEMAND_MARKET_FROM_HOME: DemandMarketItem[] = DEMANDS.map((d, i) => {
  const t = outcomeDemandTypeToMarketType(d.demandType);
  const typeLine = homeDemandTypeTagLabel(d.demandType);
  return {
    id: 200 + d.id,
    title: d.title,
    demandType: t,
    demandTypeLine: typeLine,
    validText: i % 3 === 0 ? '长期有效' : `2026-${String((i % 9) + 1).padStart(2, '0')}-${String(12 + (i % 17)).padStart(2, '0')}`,
    company: d.user,
    footerLeftValue: JS_CITIES[i % JS_CITIES.length],
    footerLeftCaption: '所属地区',
    footerRightValue: ['面议', '面议', '120', '86', '10', '210', '38', '62'][i % 8],
    footerRightCaption: '最高预算',
    views: d.likes * 14 + 120,
    publishedAt: `2025-${String((i % 9) + 2).padStart(2, '0')}-${String(1 + (i % 26)).padStart(2, '0')}`,
  };
});

export const DEMAND_MARKET_STATS = {
  /** 平台累计发布需求（演示总数，与横幅展示一致） */
  totalPublished: 1177,
} as const;

export const DEMAND_MARKET_ENTRIES: DemandMarketItem[] = [
  {
    id: 1,
    title: '自动切水器',
    demandType: '采购需求',
    demandTypeLine: '采购需求',
    validText: '长期有效',
    company: '江苏美得石化有限公司',
    footerLeftValue: '南京市',
    footerLeftCaption: '所属地区',
    footerRightValue: '面议',
    footerRightCaption: '最高预算',
    views: 1860,
    publishedAt: '2025-04-12',
  },
  {
    id: 2,
    title: '项目建设需要资金',
    demandType: '融资需求',
    demandTypeLine: '融资需求-银行贷款',
    validText: '2027-03-31',
    company: '苏北某路桥建设集团',
    footerLeftValue: '10000',
    footerLeftCaption: '融资金额(万元)',
    footerRightValue: '12',
    footerRightCaption: '贷款周期(月)',
    views: 4200,
    publishedAt: '2025-03-05',
  },
  {
    id: 3,
    title: '园区智慧节水监测平台部署',
    demandType: '服务需求',
    validText: '2026-11-30',
    company: '苏州高新区投控集团',
    footerLeftValue: '苏州市',
    footerLeftCaption: '所属地区',
    footerRightValue: '面议',
    footerRightCaption: '最高预算',
    views: 980,
    publishedAt: '2025-04-01',
  },
  {
    id: 4,
    title: '反渗透浓水近零排放工艺包联合研发',
    demandType: '技术需求',
    validText: '长期有效',
    company: '江苏某膜材料研究院',
    footerLeftValue: '无锡市',
    footerLeftCaption: '所属地区',
    footerRightValue: '面议',
    footerRightCaption: '最高预算',
    views: 2340,
    publishedAt: '2025-02-28',
  },
  ...DEMAND_MARKET_FROM_HOME,
];

const HOME_DEMAND_ROTATION_BATCH_SIZE = 4;

/** 首页节水需求轮换：按 id 降序环形切块，每批 4 条（须在 DEMANDS 定义之后初始化） */
export function buildHomeDemandRotationBatches(): ((typeof DEMANDS)[number])[][] {
  const sorted = [...DEMANDS].sort((a, b) => b.id - a.id);
  const n = sorted.length;
  const batchCount = Math.max(1, Math.ceil(n / HOME_DEMAND_ROTATION_BATCH_SIZE));
  return Array.from({ length: batchCount }, (_, b) =>
    Array.from({ length: HOME_DEMAND_ROTATION_BATCH_SIZE }, (_, i) => sorted[(b * HOME_DEMAND_ROTATION_BATCH_SIZE + i) % n])
  );
}

export const HOME_DEMAND_ROTATION_BATCHES = buildHomeDemandRotationBatches();

/** 首页节水需求自动换批的批次数（取模用；与案例推广动效无关） */
export const HOME_CASES_DEMANDS_ROTATION_SYNC_LENGTH = Math.max(1, HOME_DEMAND_ROTATION_BATCHES.length);

/** 首页案例推广自动「换一批」动效间隔（毫秒），数据仍为四条典型案例 */
export const HOME_ADVANCED_CASE_AUTO_ANIM_MS = 15_000;

/** 首页节水需求自动换批间隔（毫秒） */
export const HOME_DEMAND_ROTATION_MS = 10_000;

/** 首页水麒麟下方 / 搜索旁：平台累计数据（静态展示） */
export const HOME_KIRIN_STATS = {
  /** 累计智能诊断（水麒麟 AI）次数 */
  smartDiagnosisCount: 3002,
  /** 累计供需对接单数 */
  supplyDemandMatches: 908,
  /** 累计促成交易单数 */
  dealsClosed: 80,
} as const;

/**
 * 首页水麒麟卡片「引导词」：固定展示 4 条。
 */
export const HOME_KIRIN_STYLE3_FALLBACK_GUIDES: readonly string[] = [
  '如何测算用水定额？',
  '如何智能节水诊断？',
  '如何选择节水产品？',
  '如何获取节水资讯？',
];

/** 首页「产业政策」纵向滚动文字条（与样式 3 区块、默认首屏列表共用） */
export type HomeIndustryPolicyScrollItem = {
  id: string;
  title: string;
};

export const HOME_INDUSTRY_POLICY_SCROLL_ITEMS: HomeIndustryPolicyScrollItem[] = [
  {
    id: 'ndrc-water-saving-industry',
    title: '国家发展改革委等部门关于加快发展节水产业的指导意见',
  },
  {
    id: 'miit-water-efficiency-action',
    title: '工业和信息化部等六部门关于印发工业水效提升行动计划的通知',
  },
  {
    id: 'mwr-contract-water-saving',
    title: '水利部关于大力推进合同节水管理的指导意见',
  },
  {
    id: 'sewage-resource-reuse',
    title: '关于推进污水资源化利用的指导意见',
  },
];

export const STANDARDS = [
  {
    id: 1,
    name: "《节水型产品通用技术要求》",
    code: "GB/T 31436-2015",
    time: "2015-10-01",
    content:
      "标准规定了节水型产品的术语定义、技术要求和试验方法，覆盖卫生洁具、冷却塔、洗衣机等品类，为企业研发与政府采购提供统一技术依据。实施后可有效甄别高水效产品，推动市场优胜劣汰，支撑最严格水资源管理制度落地。"
  },
  {
    id: 2,
    name: "《工业用水压力传感器技术标准》",
    code: "JB/T 1234-2022",
    time: "2022-05-15",
    content:
      "对工业场景下压力传感器的量程、精度、长期稳定性及防护等级提出分级要求，适用于供水管网分区计量、工艺管道监测等系统。统一接口与校准流程后，便于与智慧水务平台对接，提升漏损识别与水平衡测试数据可信度。"
  },
  {
    id: 3,
    name: "《农业节水灌溉工程验收标准》",
    code: "SL 236-1999",
    time: "2000-01-01",
    content:
      "明确渠道防渗、管道输水、喷微灌等工程竣工后的质量检查、水量测定与资料归档要求，保障工程发挥设计节水效益。验收强调实地量测与档案完整性，为灌区续建配套与农业水价改革提供可追溯的工程底账。"
  }
];

export const NEWS = [
  {
    id: 1,
    title: "水效产品专项补贴",
    content:
      "专栏汇总水效标识产品更新消费与地方财政、绿色金融等扶持措施，提供申报条件、材料清单与办理渠道指引，引导优先采购高水效等级产品，推动节水改造与设备更新形成政策与市场合力。",
    image: "/hot-news-water-efficiency-subsidy.png",
  },
  {
    id: 2,
    title: "水麒麟平台AI诊断模块正式上线",
    content:
      "新模块基于大语言模型与行业知识库，支持用户以自然语言描述用水场景与设备情况，一键生成节水潜力清单与改造优先级建议。系统可对接企业水平衡测试数据与分项计量结果，输出可视化报表，辅助申报节水载体与绿色工厂评价。平台运营方承诺持续扩充地方水价与补贴政策语料，缩短企业从诊断到落地的时间。",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: 3,
    title: "三部门联合发布国家水效标识管理办法",
    content:
      "新规细化水效标识的备案、检测、市场监管与违法处罚条款，明确坐便器、水嘴、净水机等首批目录产品的标注样式与实验室资质要求。消费者扫码即可比对同类产品的用水效率等级，倒逼制造企业加快技术迭代。行业协会将组织标准宣贯与抽检互认，帮助中小企业平稳完成产线改造与标识切换。",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=400"
  }
];

/** 首页「水效扶持✖️千万补贴」区：纵向滚动文字条（与样式 3 / 默认首屏共用） */
export type HomeWaterEfficiencyPolicyListingItem = {
  id: string;
  title: string;
  /** 高热首条：左侧用点赞图标替代圆点，表示点击量最高、热度上升快 */
  hotTop?: boolean;
};

export const HOME_WATER_EFFICIENCY_POLICY_ITEMS: HomeWaterEfficiencyPolicyListingItem[] = [
  {
    id: 'js-water-efficiency-notice-final',
    title: '关于印发《江苏省水效提升扶持方案》通知(定稿)',
    hotTop: true,
  },
  {
    id: 'water-saving-industry-guide-2025',
    title: '《节水产业优惠政策指引（2025年版）》发布',
  },
  {
    id: 'js-water-efficiency-plan-release',
    title: '《江苏省水效提升扶持方案》发布',
  },
];

/** 首页水效扶持条目中，可进入「公文式政策详情」的条目（其余点击仍进产业资讯列表） */
export type HomePolicyNoticeDetail = {
  id: string;
  title: string;
  /**
   * 若填写：详情页仅展示该图（一般为红头文件扫描件，文件放 `public/` 下，如 `/policy-xxx.png`）。
   * 与 metaRows / paragraphs 二选一优先用图。
   */
  detailImageSrc?: string;
  /** 无扫描图时的文首元信息 */
  metaRows?: { label: string; value: string }[];
  /** 无扫描图时的正文段落 */
  paragraphs?: string[];
};

const HOME_POLICY_NOTICE_DETAIL_BY_ID: Record<string, HomePolicyNoticeDetail> = {
  'js-water-efficiency-notice-final': {
    id: 'js-water-efficiency-notice-final',
    title: '关于印发《江苏省水效提升扶持方案》的通知',
    detailImageSrc: '/policy-jiangsu-water-efficiency-notice.png',
  },
};

export function getHomePolicyNoticeDetail(id: string): HomePolicyNoticeDetail | null {
  return HOME_POLICY_NOTICE_DETAIL_BY_ID[id] ?? null;
}

export const POLICIES = [
  {
    id: 1,
    name: "《节水型社会建设“十四五”规划》",
    publisher: "国家发展改革委",
    time: "2023-11-20",
    content:
      "规划提出到2025年万元国内生产总值用水量、万元工业增加值用水量较2020年分别下降16%和16%，并部署农业节水增效、工业节水减排、城镇节水降损等重点工程。文件要求健全用水强度与总量双控、计划用水与定额管理、水权交易等制度，强化考核问责与公众参与。地方需编制实施方案，明确资金渠道与部门分工，确保重大项目可监测、可评估。"
  },
  {
    id: 2,
    name: "关于进一步加强非常规水源利用的指导意见",
    publisher: "水利部",
    time: "2024-02-15",
    content:
      "意见鼓励将再生水、集蓄雨水、海水淡化等纳入水资源统一配置，在生态补水、工业冷却、城市环卫等领域逐步提高利用比例。对新建园区和大型项目，要求同步论证非常规水源利用方案，并探索差别化水价与取水许可约束。文件还强调水质监测、管网互联互通与应急调度能力建设，防范水质波动与公共卫生风险。"
  },
  {
    id: 3,
    name: "广西壮族自治区节约用水条例（2024修订）",
    publisher: "广西人大",
    time: "2024-03-01",
    content:
      "修订稿结合自治区制糖、有色、造纸等高耗水产业特点，细化计划用水户名录管理、水平衡测试周期与节水改造激励措施。明确公共供水管网漏损控制目标与老旧小区改造衔接机制，并授权主管部门对严重浪费用水行为开展约谈与曝光。条例同时要求加强节水宣传教育与基层管水员培训，推动节水型居民小区与灌区创建。"
  }
];
