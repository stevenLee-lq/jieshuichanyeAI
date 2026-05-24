import {
  HOME_ADVANCED_CASE_TILES,
  PORTAL_CASES_HOME_FEATURED,
  TECH_CASES,
  type TechCase,
} from './data';

/** 门户案例库可检索条目（与案例列表页、首页宫格 id 对齐） */
export type PortalCaseSummary = {
  id: number;
  name: string;
  cat1: string;
  content: string;
  image: string;
  region?: string;
  source?: string;
  date?: string;
};

function featuredToSummary(c: (typeof PORTAL_CASES_HOME_FEATURED)[number]): PortalCaseSummary {
  return {
    id: c.id,
    name: c.name,
    cat1: c.cat1,
    content: c.content,
    image: c.image,
    region: c.region,
    source: c.source,
    date: c.date,
  };
}

function techToSummary(c: TechCase): PortalCaseSummary {
  return {
    id: c.id,
    name: c.name,
    cat1: c.category,
    content: c.description,
    image: c.image,
  };
}

/** 案例列表页扩展演示数据（与 CasesModule 内联数据 id 一致） */
const PORTAL_CASE_LIST_DEMO: PortalCaseSummary[] = [
  {
    id: 1,
    cat1: '农业节水',
    name: '新疆沙雅县：农业深度节水试点实现四维共赢',
    content:
      '新疆沙雅县地处塔克拉玛干沙漠北缘，长期受水资源时空不均、农业用水效率低等难题制约。',
    image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=600',
    region: '新疆',
    source: '新疆维吾尔自治区水利厅',
    date: '2026-03-20',
  },
  {
    id: 2,
    cat1: '工业节水',
    name: '江苏两高校入选水利部合同节水典型案例',
    content: '8月27日，水利部办公厅印发《关于发布合同节水典型案例的通知》，江苏省内两高校入选。',
    image: 'https://images.unsplash.com/photo-1558449028-b53a39d100fc?auto=format&fit=crop&q=80&w=600',
    region: '江苏',
    source: '江苏省节约用水办公室',
    date: '2024-09-11',
  },
  {
    id: 3,
    cat1: '城镇生活节水',
    name: '感应式高效节水器',
    content: '采用高灵敏度红外感应技术，实现人走水断，有效减少写字楼及学校等公共场所的无效用水。',
    image: 'https://images.unsplash.com/photo-1504148455328-497c5ef215d0?auto=format&fit=crop&q=80&w=600',
    region: '广东',
    source: '大禹节水',
    date: '2024-05-10',
  },
  {
    id: 4,
    cat1: '非常规水开发利用',
    name: '雨水收集与回用系统工程',
    content: '通过对园区屋面及道路雨水的统一收集、处理，用于景观绿化及道路冲洗，提高非传统水源利用效率。',
    image: 'https://images.unsplash.com/photo-1516937941344-00b4e0337589?auto=format&fit=crop&q=80&w=600',
    region: '北京',
    source: '水利部办公厅',
    date: '2024-02-15',
  },
  {
    id: 5,
    cat1: '通用节水',
    name: '高精度数字化水平衡测试系统',
    content: '该设备能够实时捕捉各个用水支路的流量波动，精准锁定漏报点，为企业制定节水技改方案提供数据支撑。',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=600',
    region: '浙江',
    source: '水麒麟科技',
    date: '2024-06-22',
  },
  {
    id: 6,
    cat1: '农业节水',
    name: '高标准农田数字化运营管理',
    content: '结合遥感和物联网技术，提供从种植计划到精准灌溉的一体化服务，助力农业生产提效增产。',
    image: 'https://images.unsplash.com/photo-1495107336039-ab70bf3f972b?auto=format&fit=crop&q=80&w=600',
    region: '河北',
    source: '农业部',
    date: '2024-01-10',
  },
];

const catalogById = new Map<number, PortalCaseSummary>();

function registerCase(row: PortalCaseSummary) {
  catalogById.set(row.id, row);
}

for (const c of PORTAL_CASES_HOME_FEATURED) registerCase(featuredToSummary(c));
for (const c of HOME_ADVANCED_CASE_TILES) registerCase(techToSummary(c));
for (const c of TECH_CASES) registerCase(techToSummary(c));
for (const c of PORTAL_CASE_LIST_DEMO) registerCase(c);

export function getPortalCaseById(id: number): PortalCaseSummary | undefined {
  return catalogById.get(id);
}

export function getAllPortalCases(): PortalCaseSummary[] {
  return [...catalogById.values()];
}
