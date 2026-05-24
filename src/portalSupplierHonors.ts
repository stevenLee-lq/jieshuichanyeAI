/** 门户供方荣誉标签：与入驻「店铺标签」口径一致，按供方名称展示 */

const SUPPLIER_HONOR_SEED: Record<string, string[]> = {
  大连斯频德环境科技: ['高新技术企业', '节水型社会建设先进单位', '省级企业技术中心'],
  江苏省水利工程科技咨询股份有限公司: ['高新技术企业', '节水载体创建示范单位'],
  水麒麟科技有限公司: ['国家高新技术企业', '智慧水务示范企业'],
  蓝绿工业科技集团: ['专精特新中小企业', '工业节水标杆单位'],
  丰登农业智能: ['智慧农业示范企业', '节水灌溉技术认证'],
  广西卫浴智能先锋: ['节水产品认证企业', '绿色制造示范单位'],
  '荏原冷热系统（中国）': ['冷却塔行业领军企业', '合同节水服务认证'],
  润霖水务技术: ['高新技术企业', '水平衡测试资质单位'],
  大禹节水: ['农业产业化国家重点龙头', '国家高新技术企业'],
  南方泵业: ['水泵行业名牌产品', '节能产品认证'],
  博世科环保科技: ['环保产业骨干企业', '水污染治理甲级资质'],
  江苏金航冷却塔有限公司: ['冷却塔专业制造商', '节水设备达标认证'],
  上海良机冷却设备: ['冷却塔节能认证', '上海市名牌产品'],
  广州马利新菱冷却塔: ['华南节水装备示范', '高新技术企业'],
  山东格瑞德集团: ['综合节水方案供方', 'ISO9001质量管理体系'],
  科远节水研发中心: ['研发型节水机构', '省级技术中心'],
};

const FALLBACK_HONOR_POOL = [
  '高新技术企业',
  '节水示范单位',
  '合同节水服务认证',
  '省级专精特新',
  'ISO9001认证',
  '节水产品认证',
] as const;

function hashSupplierName(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) >>> 0;
  }
  return h;
}

/** 获取供方荣誉标签（优先种子数据，否则按名称稳定生成 2～3 项） */
export function getSupplierHonorTags(supplierName: string, max = 4): string[] {
  const key = supplierName.trim();
  if (!key) return [];
  const seeded = SUPPLIER_HONOR_SEED[key];
  if (seeded?.length) return seeded.slice(0, max);

  const h = hashSupplierName(key);
  const count = 2 + (h % 2);
  const tags: string[] = [];
  for (let i = 0; i < count && tags.length < max; i++) {
    const tag = FALLBACK_HONOR_POOL[(h + i * 7) % FALLBACK_HONOR_POOL.length]!;
    if (!tags.includes(tag)) tags.push(tag);
  }
  return tags;
}
