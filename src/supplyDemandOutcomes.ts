/** 供需对接示范数据：与 Excel 导入一致（南京卫岗乳业等） */

import {
  WORKBENCH_APPLICATION_FIELD_OPTIONS,
  formatApplicationFieldsList,
  normalizeApplicationFields,
} from './workbenchApplicationFields';

export type OutcomeEntity = '用水户需求' | '产业主体需求' | '政府部门需求';
export type OutcomeDemandType = '产品需求' | '服务需求' | '金融需求' | '研发需求' | '交流讨论' | '其他';

export type OutcomeCategoryTone = 'green' | 'purple' | 'blue' | 'sky' | 'orange';

export interface SupplyDemandOutcome {
  id: number;
  title: string;
  province: string;
  categoryLabel: string;
  categoryTone: OutcomeCategoryTone;
  description: string;
  demander: string;
  supplier: string;
  amountDisplay: string;
  publishedAt: string;
  achievedAt: string;
  /** 需求状态（与 Excel「需求状态」列一致，如可对接） */
  demandStatus?: string;
  image: string;
  entity: OutcomeEntity;
  demandType: OutcomeDemandType;
  hot: number;
  views: number;
  publishedTs: number;
  /** 以下为详情页可选字段，缺省时由详情页根据基础字段拼接 */
  contactEmail?: string;
  /** 与我联系进入详情时展示的联系电话（演示数据） */
  contactPhone?: string;
  publisherDisplay?: string;
  locationLine?: string;
  deadline?: string;
  demandBriefLine?: string;
  budgetLine?: string;
  detailRichText?: string;
  /** 需求中心列表：需求类型一行文案（缺省由页面按 demandType 映射） */
  demandListTypeLabel?: string;
  /** 有效时间展示，缺省由 deadline 推导为「长期有效」或日期 */
  validUntilLabel?: string;
  /** 需求企业（缺省 demander） */
  demandEnterprise?: string;
  /** 列表卡片底栏：地区+最高预算 / 融资金额+周期 */
  demandCardFooter?: 'region_budget' | 'finance';
  /** 融资底栏：融资金额（万元） */
  financeAmountWan?: string;
  /** 融资底栏：贷款周期（月） */
  loanPeriodMonths?: string;
  /** 非融资底栏：所属地区短名（如南京市） */
  regionCity?: string;
  /** 非融资底栏：最高预算展示（如面议） */
  maxBudgetShort?: string;
  /** 需求中心·交流讨论专区：列表时间文案（如「12分钟前」） */
  discussionTimeLabel?: string;
  /** 需求中心·交流讨论专区：卡片右上角标签 */
  discussionTags?: readonly [string, string];
  /** 需求中心·交流讨论专区：点赞/评论数（演示） */
  discussionLikes?: number;
  discussionComments?: number;
  /** 需求中心·交流讨论专区：「待解决需求」Tab 优先展示 */
  discussionPending?: boolean;
  /** 需求中心·交流讨论专区：右下角脉冲图标按钮样式 */
  discussionPulseCta?: boolean;
  /** 产业主体后台「达成合作」标记；用水户端展示供应商变更提示 */
  supplierMarkedAchieved?: boolean;
  /** 应用领域（可多选，与供给市场、注册表单一致） */
  applicationFields?: string[];
}

export const ENTITY_FILTER_OPTIONS = ['全部', '用水户需求', '产业主体需求', '政府部门需求'] as const;
export const TYPE_FILTER_OPTIONS = ['全部', '产品需求', '服务需求', '金融需求', '研发需求', '交流讨论', '其他'] as const;

export const APPLICATION_FIELD_FILTER_OPTIONS = ['全部', ...WORKBENCH_APPLICATION_FIELD_OPTIONS] as const;

export type ApplicationFieldFilter = (typeof APPLICATION_FIELD_FILTER_OPTIONS)[number];

/** 读取需求应用领域（无显式字段时按描述关键词推断） */
export function getOutcomeApplicationFields(o: SupplyDemandOutcome): string[] {
  if (o.applicationFields?.length) {
    const normalized = normalizeApplicationFields(o.applicationFields);
    if (normalized.length > 0) return normalized;
  }
  const hay = `${o.title} ${o.description} ${o.categoryLabel}`;
  const hits = WORKBENCH_APPLICATION_FIELD_OPTIONS.filter((opt) => hay.includes(opt));
  if (hits.length > 0) return [...hits];
  if (o.demandType === '金融需求') return ['通用节水'];
  if (o.entity === '用水户需求') return ['工业节水'];
  return ['工业节水'];
}

export function formatOutcomeApplicationFields(o: SupplyDemandOutcome): string {
  return formatApplicationFieldsList(getOutcomeApplicationFields(o));
}

export function outcomeMatchesApplicationField(o: SupplyDemandOutcome, filter: ApplicationFieldFilter): boolean {
  if (filter === '全部') return true;
  return getOutcomeApplicationFields(o).includes(filter);
}

/** 需求排序：可升降序的维度（对接状态单独为固定下拉，见页面） */
export const SORT_FIELD_OPTIONS = [
  { key: 'hot', label: '热门度' },
  { key: 'views', label: '浏览量' },
  { key: 'time', label: '发布时间' },
] as const;

export type SortFieldKey = (typeof SORT_FIELD_OPTIONS)[number]['key'];

/** 需求对接状态（需求中心 / 后台需求中心表单与筛选） */
export const OUTCOME_MATCH_STATUS_OPTIONS = ['可对接', '已联系', '已达成', '需求取消'] as const;

export type OutcomeMatchStatus = (typeof OUTCOME_MATCH_STATUS_OPTIONS)[number];

/** 对接状态筛选（需求中心下拉；已达成的供需对接页固定为已达成） */
export const MATCH_STATUS_FILTER_OPTIONS = ['全部', ...OUTCOME_MATCH_STATUS_OPTIONS] as const;

export type MatchStatusFilter = (typeof MATCH_STATUS_FILTER_OPTIONS)[number];

/** 用于筛选与下拉展示 */
export function getOutcomeMatchStatus(o: SupplyDemandOutcome): OutcomeMatchStatus {
  const raw = o.demandStatus?.trim();
  if (raw === '需求取消') return '需求取消';
  if (raw === '已联系') return '已联系';
  if (o.achievedAt && o.achievedAt !== '--') return '已达成';
  if (raw === '已达成') return '已达成';
  return '可对接';
}

const D1_DETAIL = `1）使用场景（乳制品典型）：工艺冷却（UHT/巴氏杀菌后降温、发酵罐温控、均质机/灌装机冷却）；CIP/SIP系统（清洗液/消毒液换热、余热回收）；制冷机房（冰水主机、压缩机、冷库冷凝散热）；其他（锅炉余热、车间空调、空压机冷却）。

2）采购范围（交钥匙）：冷却塔本体（闭式优先）、风机/电机、喷淋/布水系统、换热盘管、收水器、集水盘、钢结构支架。
配套：循环水泵（一备一）、Y型过滤器、阀门、仪表、变频控制柜、PLC、远程监控、水质处理（软化/加药）、排污/溢流、防雷接地、降噪设施。
服务：设计、制造、运输、安装、调试、培训、质保、备品备件。`;

const D2_DETAIL = `聚焦乳制品企业高耗水环节多、水质要求严、合规门槛高的特点，通过系统化「体检」、数据化分析、工程化落地，帮助企业摸清用水家底、挖掘节水潜力、构建长效节水管理体系，同时满足节水型企业/水足迹认证、取水定额合规等政策要求。从服务目标、范围、核心内容、成果输出、实施周期与商务要求等方面，明确全流程需求。覆盖乳制品企业全厂区、全工序、全用水系统，不含外界水源（自来水/地下水）供应及废水外排末端处理（仅诊断回用潜力）。成果要求为编制《乳制品企业节水诊断总结报告》并通过主管部门审核。`;

const D4_DETAIL = `项目建设阶段资金缺口，拟通过银行流动资金贷款解决，期限与额度如下需求所示。`;

const D5_DETAIL = `拟对既有园区二次供水泵房进行节能改造，含高效泵组、变频控制与能耗在线监测；要求具备同类项目业绩，可联合本地安装单位实施。`;

const D6_DETAIL = `需第三方机构按《企业水平衡测试通则》开展全厂水平衡测试，形成报告并协助完成节水型企业申报材料整理。`;

const D7_DETAIL = `寻求浓盐水减量与分盐结晶中试装置合作方，可提供场地与中试水电条件，合作模式与知识产权归属可谈。`;

const D8_DETAIL = `对照国家节水行动方案与水效领跑者指标，开展为期约 3 个月的驻场辅导与差距整改清单编制。`;

const D9_DETAIL = `园区半导体配套废水厂拟建设零排放回用示范线，征集膜浓缩、分盐结晶与蒸汽再压缩等组合工艺方案，欢迎具备同类业绩的单位在线交流。`;

const D10_DETAIL = `面向用水大户与集成商开放 NB-IoT 智能超声波水表内测名额，免费提供样表与云平台接入，收集现场计量与漏损监测反馈。`;

const D11_DETAIL = `片区老旧管网漏损率偏高，拟开展分区计量与压力管理试点，征集可落地的检漏与调度一体化方案。`;

const D12_DETAIL = `高耗水车间水平衡测试后，对冷却塔排污与浓盐水回用存在争议，寻求第三方复核思路与案例对标。`;

const D3_DETAIL = `我司为乳制品生产企业，涵盖灭菌乳、巴氏乳、发酵乳、乳粉等多品类产品。目前在全企业取水定额自测、水平衡核算、对标国标GB/T 18916.57-2021 乳制品取水定额过程中，对定额测算口径、分摊规则、边界界定存在较多实际疑问，想向大家请教：
(1) 测算边界如何界定：我司乳制品生产包含原乳接收、预处理、杀菌灌装、发酵、乳粉干燥、CIP在线清洗、循环冷却、锅炉辅产、车间冲洗等全工序。想请教：取水定额测算是否只统计生产主工艺取水量？CIP清洗水、冷却塔补充水、锅炉软化水、车间地面及设备冲洗水、生活办公用水，是否全部纳入单位产品定额核算基数？
(2) 多产品品类用水如何合理分摊：我司同时生产液态奶、酸奶、乳粉、调制乳等不同产品，各产品耗水差异极大。公用工段（原乳预处理、公共CIP站、制冷冷却水系统）用水无法单独计量，行业通用的分摊测算方法是按产量分摊、产值分摊，还是按工艺耗水系数折算？有没有成熟的实操分摊模型可以参考？`;

export const SUPPLY_DEMAND_OUTCOMES: SupplyDemandOutcome[] = [
  {
    id: 1,
    title: '冷却塔设备采购',
    province: '江苏省',
    categoryLabel: '产品需求',
    categoryTone: 'blue',
    description:
      '乳制品典型工艺冷却、CIP/SIP、制冷机房等场景；交钥匙采购闭式冷却塔本体、配套泵阀仪表与远程监控等。',
    demander: '南京卫岗乳业有限公司',
    supplier: '江苏节水冷却塔工程有限公司',
    amountDisplay: '需求金额: 100万元',
    publishedAt: '2025-05-01',
    achievedAt: '2025-08-20',
    demandStatus: '已达成',
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=400&h=300',
    entity: '用水户需求',
    demandType: '产品需求',
    hot: 120,
    views: 860,
    publishedTs: Date.UTC(2025, 4, 1),
    contactEmail: 'weigangny@demo.org',
    publisherDisplay: '南京卫岗乳业有限公司',
    locationLine: '江苏省南京市',
    deadline: '--',
    budgetLine: '预算（万元）: 100',
    regionCity: '南京市',
    maxBudgetShort: '面议',
    detailRichText: D1_DETAIL,
    applicationFields: ['工业节水'],
  },
  {
    id: 2,
    title: '节水诊断技术咨询服务',
    province: '江苏省',
    categoryLabel: '服务需求',
    categoryTone: 'sky',
    description:
      '面向乳制品企业全厂区、全工序、全用水系统的节水诊断与管理体系建设，成果为《乳制品企业节水诊断总结报告》并通过主管部门审核。',
    demander: '南京卫岗乳业有限公司',
    supplier: '常州清源节水技术服务中心',
    amountDisplay: '需求金额: 10万元',
    publishedAt: '2025-05-02',
    achievedAt: '2025-06-18',
    demandStatus: '已达成',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=400&h=300',
    entity: '用水户需求',
    demandType: '服务需求',
    hot: 98,
    views: 720,
    publishedTs: Date.UTC(2025, 4, 2),
    contactEmail: 'weigangny@demo.org',
    publisherDisplay: '南京卫岗乳业有限公司',
    locationLine: '江苏省苏州市',
    deadline: '2026-11-30',
    budgetLine: '预算（万元）: 10',
    regionCity: '苏州市',
    maxBudgetShort: '面议',
    detailRichText: D2_DETAIL,
    applicationFields: ['工业节水'],
  },
  {
    id: 3,
    title: '求教乳制品行业单位产品取水定额测算方法若干疑问',
    province: '江苏省',
    categoryLabel: '交流讨论',
    categoryTone: 'purple',
    description:
      '对标 GB/T 18916.57-2021 乳制品取水定额，就测算边界是否含 CIP/冷却塔/锅炉软化水等，以及多品类公用工段用水分摊方法公开请教。',
    demander: '南京卫岗乳业有限公司',
    supplier: '—',
    amountDisplay: '需求金额: ——',
    publishedAt: '2025-05-03',
    achievedAt: '--',
    demandStatus: '需求取消',
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=400&h=300',
    entity: '用水户需求',
    demandType: '交流讨论',
    hot: 76,
    views: 540,
    publishedTs: Date.UTC(2025, 4, 3),
    contactEmail: 'weigangny@demo.org',
    publisherDisplay: '南京卫岗乳业有限公司',
    locationLine: '江苏省无锡市',
    deadline: '无',
    budgetLine: '预算（万元）: ——',
    regionCity: '无锡市',
    maxBudgetShort: '面议',
    demandListTypeLabel: '技术需求',
    detailRichText: D3_DETAIL,
    discussionTimeLabel: '2025-05-03',
    discussionTags: ['技术交流', '取水定额'],
    discussionLikes: 12,
    discussionComments: 15,
    applicationFields: ['工业节水'],
  },
  {
    id: 4,
    title: '项目建设需要资金',
    province: '江苏省',
    categoryLabel: '金融需求',
    categoryTone: 'orange',
    description: '路桥施工项目阶段性资金周转，拟申请银行流动资金贷款，额度与周期见下栏。',
    demander: '苏北某路桥建设集团',
    supplier: '中国建设银行江苏省分行普惠金融部',
    amountDisplay: '需求金额: ——',
    publishedAt: '2025-05-04',
    achievedAt: '2025-10-08',
    demandStatus: '已达成',
    image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=400&h=300',
    entity: '产业主体需求',
    demandType: '金融需求',
    hot: 88,
    views: 610,
    publishedTs: Date.UTC(2025, 4, 4),
    contactEmail: 'demo-road@example.org',
    publisherDisplay: '苏北某路桥建设集团',
    locationLine: '江苏省常州市',
    deadline: '2027-03-31',
    budgetLine: '预算（万元）: ——',
    demandListTypeLabel: '融资需求-银行贷款',
    demandCardFooter: 'finance',
    financeAmountWan: '10000',
    loanPeriodMonths: '12',
    detailRichText: D4_DETAIL,
    applicationFields: ['通用节水'],
  },
  /** 以下为「可对接」演示数据（achievedAt 为 -- 且非需求取消），供需求中心默认筛选展示 */
  {
    id: 5,
    title: '园区二次供水泵房节能改造项目采购',
    province: '江苏省',
    categoryLabel: '产品需求',
    categoryTone: 'blue',
    description: '高效泵组、变频控制与能耗在线监测一体化改造，含安装调试与首年质保。',
    demander: '苏州高新区某科技园运营公司',
    supplier: '—',
    amountDisplay: '需求金额: 面议',
    publishedAt: '2025-11-02',
    achievedAt: '--',
    demandStatus: '已联系',
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=400&h=300',
    entity: '用水户需求',
    demandType: '产品需求',
    hot: 72,
    views: 410,
    publishedTs: Date.UTC(2025, 10, 2),
    contactEmail: 'pump-bid@demo-park.org',
    contactPhone: '13805181205',
    publisherDisplay: '苏州高新区某科技园运营公司',
    locationLine: '江苏省苏州市',
    deadline: '2026-06-30',
    budgetLine: '预算（万元）: 面议',
    regionCity: '苏州市',
    maxBudgetShort: '面议',
    detailRichText: D5_DETAIL,
  },
  {
    id: 6,
    title: '水平衡测试与节水型企业申报辅导服务',
    province: '江苏省',
    categoryLabel: '服务需求',
    categoryTone: 'sky',
    description: '全厂水平衡测试报告编制及节水型企业申报全流程辅导。',
    demander: '南通某化工有限公司',
    supplier: '—',
    amountDisplay: '需求金额: 8万元',
    publishedAt: '2025-11-05',
    achievedAt: '--',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=400&h=300',
    entity: '产业主体需求',
    demandType: '服务需求',
    hot: 65,
    views: 380,
    publishedTs: Date.UTC(2025, 10, 5),
    contactEmail: 'ntchem-water@demo.org',
    contactPhone: '13905181206',
    publisherDisplay: '南通某化工有限公司',
    locationLine: '江苏省南通市',
    deadline: '长期有效',
    budgetLine: '预算（万元）: 8',
    regionCity: '南通市',
    maxBudgetShort: '8',
    detailRichText: D6_DETAIL,
  },
  {
    id: 7,
    title: '浓盐水减量与中试装置技术合作',
    province: '江苏省',
    categoryLabel: '研发需求',
    categoryTone: 'purple',
    description: '寻求浓盐水减量与分盐结晶中试合作，可提供场地与中试条件。',
    demander: '连云港某海水淡化运营单位',
    supplier: '—',
    amountDisplay: '需求金额: ——',
    publishedAt: '2025-11-08',
    achievedAt: '--',
    image: 'https://images.unsplash.com/photo-1516937941344-00b4e0337589?auto=format&fit=crop&q=80&w=400&h=300',
    entity: '产业主体需求',
    demandType: '研发需求',
    hot: 58,
    views: 295,
    publishedTs: Date.UTC(2025, 10, 8),
    contactEmail: 'lyg-swd@demo.org',
    contactPhone: '13705181207',
    publisherDisplay: '连云港某海水淡化运营单位',
    locationLine: '江苏省连云港市',
    deadline: '2026-12-31',
    budgetLine: '预算（万元）: 面议',
    regionCity: '连云港市',
    maxBudgetShort: '面议',
    demandListTypeLabel: '技术需求',
    detailRichText: D7_DETAIL,
  },
  {
    id: 8,
    title: '水效对标与节水行动方案驻场辅导',
    province: '江苏省',
    categoryLabel: '服务需求',
    categoryTone: 'green',
    description: '对照国家节水行动方案与水效领跑者指标，开展驻场辅导与差距整改清单编制。',
    demander: '扬州市某开发区管委会',
    supplier: '—',
    amountDisplay: '需求金额: 15万元',
    publishedAt: '2025-11-12',
    achievedAt: '--',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=400&h=300',
    entity: '政府部门需求',
    demandType: '服务需求',
    hot: 55,
    views: 260,
    publishedTs: Date.UTC(2025, 10, 12),
    contactEmail: 'yz-dev-water@demo.gov.cn',
    contactPhone: '15905181208',
    publisherDisplay: '扬州市某开发区管委会',
    locationLine: '江苏省扬州市',
    deadline: '2026-03-31',
    budgetLine: '预算（万元）: 15',
    regionCity: '扬州市',
    maxBudgetShort: '15',
    detailRichText: D8_DETAIL,
  },
  {
    id: 9,
    title: '关于区域水重复利用率提升的技术寻求',
    province: '江苏省',
    categoryLabel: '交流讨论',
    categoryTone: 'blue',
    description:
      '园区半导体配套废水厂拟建设零排放回用示范线，征集膜浓缩、分盐结晶与蒸汽再压缩等组合工艺方案，欢迎具备同类业绩的单位在线交流。',
    demander: '某工业园区管理处',
    supplier: '—',
    amountDisplay: '需求金额: ——',
    publishedAt: '2026-05-13',
    achievedAt: '--',
    image: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=200&h=200',
    entity: '用水户需求',
    demandType: '交流讨论',
    hot: 112,
    views: 890,
    publishedTs: Date.UTC(2026, 4, 13, 2, 20),
    contactEmail: 'park-water@demo.org',
    contactPhone: '13805181211',
    publisherDisplay: '某工业园区管理处',
    locationLine: '江苏省苏州市',
    deadline: '长期',
    budgetLine: '预算（万元）: ——',
    regionCity: '苏州市',
    maxBudgetShort: '面议',
    detailRichText: D9_DETAIL,
    discussionTimeLabel: '12分钟前',
    discussionTags: ['求助', '废水处理'],
    discussionLikes: 24,
    discussionComments: 8,
    discussionPending: true,
  },
  {
    id: 10,
    title: '新款智能超声波水表内测邀请',
    province: '江苏省',
    categoryLabel: '交流讨论',
    categoryTone: 'purple',
    description:
      '面向用水大户与集成商开放 NB-IoT 智能超声波水表内测名额，免费提供样表与云平台接入，收集现场计量与漏损监测反馈。',
    demander: '科远节水研发中心',
    supplier: '—',
    amountDisplay: '需求金额: ——',
    publishedAt: '2026-05-13',
    achievedAt: '--',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=200&h=200',
    entity: '产业主体需求',
    demandType: '交流讨论',
    hot: 198,
    views: 1520,
    publishedTs: Date.UTC(2026, 4, 13, 1, 5),
    contactEmail: 'rnd-meter@demo-tech.org',
    contactPhone: '13805181212',
    publisherDisplay: '科远节水研发中心',
    locationLine: '江苏省南京市',
    deadline: '2026-08-31',
    budgetLine: '预算（万元）: ——',
    regionCity: '南京市',
    maxBudgetShort: '面议',
    detailRichText: D10_DETAIL,
    discussionTimeLabel: '1小时前',
    discussionTags: ['首发', '智能硬件'],
    discussionLikes: 56,
    discussionComments: 21,
    discussionPulseCta: true,
  },
  {
    id: 11,
    title: '老城区供水管网漏损管控试点征集',
    province: '江苏省',
    categoryLabel: '交流讨论',
    categoryTone: 'sky',
    description:
      '片区老旧管网漏损率偏高，拟开展分区计量与压力管理试点，征集可落地的检漏与调度一体化方案。',
    demander: '某市水务集团生产技术部',
    supplier: '—',
    amountDisplay: '需求金额: ——',
    publishedAt: '2026-05-12',
    achievedAt: '--',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=200&h=200',
    entity: '政府部门需求',
    demandType: '交流讨论',
    hot: 64,
    views: 420,
    publishedTs: Date.UTC(2026, 4, 12, 8, 0),
    contactEmail: 'water-ops@demo-city.gov.cn',
    contactPhone: '13805181213',
    publisherDisplay: '某市水务集团生产技术部',
    locationLine: '江苏省无锡市',
    deadline: '2026-12-15',
    budgetLine: '预算（万元）: ——',
    regionCity: '无锡市',
    maxBudgetShort: '面议',
    detailRichText: D11_DETAIL,
    discussionTimeLabel: '昨天',
    discussionTags: ['政企', '漏损控制'],
    discussionLikes: 18,
    discussionComments: 6,
    discussionPending: true,
  },
  {
    id: 12,
    title: '乳制品车间浓盐水回用方案请教',
    province: '江苏省',
    categoryLabel: '交流讨论',
    categoryTone: 'green',
    description:
      '高耗水车间水平衡测试后，对冷却塔排污与浓盐水回用存在争议，寻求第三方复核思路与案例对标。',
    demander: '苏北某乳业有限公司',
    supplier: '—',
    amountDisplay: '需求金额: ——',
    publishedAt: '2026-05-11',
    achievedAt: '--',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=200&h=200',
    entity: '用水户需求',
    demandType: '交流讨论',
    hot: 48,
    views: 310,
    publishedTs: Date.UTC(2026, 4, 11, 14, 30),
    contactEmail: 'dairy-tech@demo-milk.cn',
    contactPhone: '13805181214',
    publisherDisplay: '苏北某乳业有限公司',
    locationLine: '江苏省徐州市',
    deadline: '无',
    budgetLine: '预算（万元）: ——',
    regionCity: '徐州市',
    maxBudgetShort: '面议',
    detailRichText: D12_DETAIL,
    discussionTimeLabel: '3天前',
    discussionTags: ['技术交流', '回用水'],
    discussionLikes: 9,
    discussionComments: 14,
  },
];

/** 详情页展示用手机号：优先数据字段，缺省为演示号（非真实） */
export function resolveOutcomeContactPhone(o: SupplyDemandOutcome): string {
  const p = o.contactPhone?.trim();
  if (p) return p;
  const tail = String(5000 + o.id).padStart(4, '0');
  return `138 5180 ${tail}`;
}

export function getSupplyDemandOutcomeById(id: number): SupplyDemandOutcome | undefined {
  return SUPPLY_DEMAND_OUTCOMES.find((x) => x.id === id);
}

/** 在 YYYY-MM-DD 上增加天数，用于演示时间轴「对接」节点 */
export function addDaysYmd(ymd: string, days: number): string {
  const m = ymd.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return ymd;
  const t = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]) + days);
  return new Date(t).toISOString().slice(0, 10);
}
