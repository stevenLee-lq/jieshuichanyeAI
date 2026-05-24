/** 企业入驻 / 企业管理共用：用户类型级联、国民经济行业四级分类（含行业代码） */

export type EntityTypeGroup = {
  label: string;
  children: string[];
};

export const ENTERPRISE_ENTITY_TYPE_OPTIONS: Record<'企业法人' | '非企业法人', EntityTypeGroup[]> = {
  企业法人: [
    { label: '内资企业', children: ['国有企业', '私营企业', '集体企业', '联营企业', '其他内资企业'] },
    { label: '港澳台商投资企业', children: [] },
    { label: '外商投资企业', children: [] },
    { label: '其他类型企业', children: [] },
  ],
  非企业法人: [
    { label: '机关法人', children: [] },
    { label: '事业单位', children: [] },
    { label: '社会团体', children: [] },
    { label: '其他类型法人', children: [] },
  ],
};

export type IndustryTreeNode = {
  code: string;
  name: string;
  children?: IndustryTreeNode[];
};

/** 演示用国民经济行业分类（门类—小类，选项展示「代码 + 名称」） */
export const ENTERPRISE_INDUSTRY_TREE: IndustryTreeNode[] = [
  {
    code: 'N',
    name: '水利、环境和公共设施管理业',
    children: [
      {
        code: 'N76',
        name: '水利管理业',
        children: [
          {
            code: 'N762',
            name: '水资源管理',
            children: [
              { code: 'N7620', name: '水资源管理' },
              { code: 'N7621', name: '水文服务' },
            ],
          },
          {
            code: 'N763',
            name: '天然水收集与分配',
            children: [{ code: 'N7630', name: '天然水收集与分配' }],
          },
        ],
      },
      {
        code: 'N77',
        name: '生态保护和环境治理业',
        children: [
          {
            code: 'N772',
            name: '环境治理业',
            children: [{ code: 'N7721', name: '水污染治理' }],
          },
        ],
      },
    ],
  },
  {
    code: 'C',
    name: '制造业',
    children: [
      {
        code: 'C38',
        name: '电气机械和器材制造业',
        children: [
          {
            code: 'C382',
            name: '输配电及控制设备制造',
            children: [
              { code: 'C3821', name: '变压器、整流器和电感器制造' },
              { code: 'C3824', name: '电力电子元器件制造' },
            ],
          },
        ],
      },
    ],
  },
  {
    code: 'D',
    name: '电力、热力、燃气及水生产和供应业',
    children: [
      {
        code: 'D46',
        name: '水的生产和供应业',
        children: [
          {
            code: 'D461',
            name: '自来水生产和供应',
            children: [{ code: 'D4610', name: '自来水生产和供应' }],
          },
        ],
      },
    ],
  },
];

export function formatIndustryOption(node: IndustryTreeNode): string {
  return `${node.code} ${node.name}`;
}

export function findIndustryNode(
  nodes: IndustryTreeNode[],
  code: string
): IndustryTreeNode | undefined {
  for (const n of nodes) {
    if (n.code === code) return n;
    if (n.children?.length) {
      const found = findIndustryNode(n.children, code);
      if (found) return found;
    }
  }
  return undefined;
}

export function entityTypeLevel3Options(
  userType: string,
  subType: string
): string[] {
  const groups = ENTERPRISE_ENTITY_TYPE_OPTIONS[userType as keyof typeof ENTERPRISE_ENTITY_TYPE_OPTIONS];
  if (!groups) return [];
  const group = groups.find((g) => g.label === subType);
  return group?.children ?? [];
}

/** 国民经济行业四级（代码 + 名称），入驻与企业管理共用 */
export type IndustryLevelFields = {
  industryL1Code: string;
  industryL1Name: string;
  industryL2Code: string;
  industryL2Name: string;
  industryL3Code: string;
  industryL3Name: string;
  industryL4Code: string;
  industryL4Name: string;
};

export const EMPTY_INDUSTRY_LEVELS: IndustryLevelFields = {
  industryL1Code: '',
  industryL1Name: '',
  industryL2Code: '',
  industryL2Name: '',
  industryL3Code: '',
  industryL3Name: '',
  industryL4Code: '',
  industryL4Name: '',
};

export function firstIndustryChildChain(node: IndustryTreeNode): IndustryTreeNode[] {
  const chain: IndustryTreeNode[] = [node];
  let cur: IndustryTreeNode | undefined = node;
  while (cur?.children?.length) {
    cur = cur.children[0];
    chain.push(cur);
  }
  return chain;
}

export function applyIndustryChain<T extends IndustryLevelFields>(
  form: T,
  chain: IndustryTreeNode[]
): T {
  const [l1, l2, l3, l4] = chain;
  return {
    ...form,
    industryL1Code: l1?.code ?? '',
    industryL1Name: l1?.name ?? '',
    industryL2Code: l2?.code ?? '',
    industryL2Name: l2?.name ?? '',
    industryL3Code: l3?.code ?? '',
    industryL3Name: l3?.name ?? '',
    industryL4Code: l4?.code ?? '',
    industryL4Name: l4?.name ?? '',
  };
}

/** 兼容旧字段：门类名称或四级小类「代码 名称」 */
export function industryLegacyLabel(fields: IndustryLevelFields): string {
  if (fields.industryL4Code && fields.industryL4Name) {
    return formatIndustryOption({
      code: fields.industryL4Code,
      name: fields.industryL4Name,
    });
  }
  return fields.industryL1Name || '';
}
