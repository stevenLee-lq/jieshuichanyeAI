/** 定额产品库 · 国民经济行业分类（演示树，行业名称前带门类/大类代码） */

export type QuotaIndustryTreeNode = {
  code: string;
  name: string;
  children?: QuotaIndustryTreeNode[];
};

/** 与 GB/T 4754 门类一致的演示数据（采矿业展开至小类，其余为门类/大类） */
export const QUOTA_INDUSTRY_TREE: QuotaIndustryTreeNode[] = [
  { code: 'A', name: '农、林、牧、渔业' },
  {
    code: 'B',
    name: '采矿业',
    children: [
      {
        code: 'B06',
        name: '煤炭开采和洗选业',
        children: [
          {
            code: 'B061',
            name: '烟煤和无烟煤开采洗选',
            children: [{ code: 'B0610', name: '烟煤和无烟煤开采洗选' }],
          },
          {
            code: 'B062',
            name: '褐煤开采洗选',
            children: [{ code: 'B0620', name: '褐煤开采洗选' }],
          },
          {
            code: 'B069',
            name: '其他煤炭采选',
            children: [{ code: 'B0690', name: '其他煤炭采选' }],
          },
        ],
      },
      {
        code: 'B07',
        name: '石油和天然气开采业',
        children: [
          { code: 'B071', name: '石油开采', children: [{ code: 'B0710', name: '石油开采' }] },
          { code: 'B072', name: '天然气开采', children: [{ code: 'B0720', name: '天然气开采' }] },
        ],
      },
      {
        code: 'B08',
        name: '黑色金属矿采选业',
        children: [
          { code: 'B081', name: '铁矿采选', children: [{ code: 'B0810', name: '铁矿采选' }] },
          { code: 'B082', name: '锰矿、铬矿采选', children: [{ code: 'B0820', name: '锰矿、铬矿采选' }] },
        ],
      },
    ],
  },
  { code: 'C', name: '制造业' },
  { code: 'D', name: '电力、热力、燃气及水生产和供应业' },
  { code: 'E', name: '建筑业' },
  { code: 'F', name: '批发和零售业' },
  { code: 'G', name: '交通运输、仓储和邮政业' },
  { code: 'H', name: '住宿和餐饮业' },
  { code: 'I', name: '信息传输、软件和信息技术服务业' },
  { code: 'J', name: '金融业' },
  { code: 'K', name: '房地产业' },
  { code: 'L', name: '租赁和商务服务业' },
  { code: 'M', name: '科学研究和技术服务业' },
  { code: 'N', name: '水利、环境和公共设施管理业' },
  { code: 'O', name: '居民服务、修理和其他服务业' },
  { code: 'P', name: '教育' },
  { code: 'Q', name: '卫生和社会工作' },
  { code: 'R', name: '文化、体育和娱乐业' },
];

export function formatQuotaIndustrySegment(code: string, name: string): string {
  if (!code) return name || '—';
  return name ? `${code}-${name}` : code;
}

export type QuotaIndustryLevelFields = {
  industryL1Code: string;
  industryL1Name: string;
  industryL2Code: string;
  industryL2Name: string;
  industryL3Code: string;
  industryL3Name: string;
  industryL4Code: string;
  industryL4Name: string;
};

export function formatQuotaIndustryCategoryPath(fields: QuotaIndustryLevelFields): string {
  const parts: string[] = [];
  if (fields.industryL1Code) {
    parts.push(formatQuotaIndustrySegment(fields.industryL1Code, fields.industryL1Name));
  }
  if (fields.industryL2Code) {
    parts.push(formatQuotaIndustrySegment(fields.industryL2Code, fields.industryL2Name));
  }
  if (fields.industryL3Code) {
    parts.push(formatQuotaIndustrySegment(fields.industryL3Code, fields.industryL3Name));
  }
  if (fields.industryL4Code) {
    parts.push(formatQuotaIndustrySegment(fields.industryL4Code, fields.industryL4Name));
  }
  return parts.length ? parts.join(' / ') : '—';
}

/** 从根到目标节点的路径（用于判断所选行业层级） */
export function findQuotaIndustryPath(
  nodes: QuotaIndustryTreeNode[],
  code: string,
  path: QuotaIndustryTreeNode[] = []
): QuotaIndustryTreeNode[] | null {
  for (const n of nodes) {
    const next = [...path, n];
    if (n.code === code) return next;
    if (n.children?.length) {
      const found = findQuotaIndustryPath(n.children, code, next);
      if (found) return found;
    }
  }
  return null;
}

/** 是否为国民经济行业分类第四级（小类）节点 */
export function isQuotaIndustryLevel4(code: string): boolean {
  const path = findQuotaIndustryPath(QUOTA_INDUSTRY_TREE, code);
  return path?.length === 4;
}

export function findQuotaIndustryNode(
  nodes: QuotaIndustryTreeNode[],
  code: string
): QuotaIndustryTreeNode | undefined {
  for (const n of nodes) {
    if (n.code === code) return n;
    if (n.children?.length) {
      const found = findQuotaIndustryNode(n.children, code);
      if (found) return found;
    }
  }
  return undefined;
}

/** 从选中节点向下取第一条链至叶，用于新增时预填四级行业 */
export function firstQuotaIndustryChain(node: QuotaIndustryTreeNode): QuotaIndustryTreeNode[] {
  const chain: QuotaIndustryTreeNode[] = [node];
  let cur: QuotaIndustryTreeNode | undefined = node;
  while (cur?.children?.length) {
    cur = cur.children[0];
    chain.push(cur);
  }
  return chain;
}

export function applyQuotaIndustryChain(chain: QuotaIndustryTreeNode[]): QuotaIndustryLevelFields {
  const [l1, l2, l3, l4] = chain;
  return {
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

export function deepestIndustryCode(fields: QuotaIndustryLevelFields): string {
  return (
    fields.industryL4Code ||
    fields.industryL3Code ||
    fields.industryL2Code ||
    fields.industryL1Code ||
    ''
  );
}

/** 列表按左侧树筛选：选中节点 code 为前缀匹配 */
export function quotaProductMatchesIndustryFilter(
  fields: QuotaIndustryLevelFields,
  filterCode: string | null
): boolean {
  if (!filterCode) return true;
  const key = deepestIndustryCode(fields);
  if (!key) return false;
  return key === filterCode || key.startsWith(filterCode);
}

function nodeMatchesTreeKeyword(node: QuotaIndustryTreeNode, keyword: string): boolean {
  const q = keyword.trim().toLowerCase();
  if (!q) return true;
  return (
    node.code.toLowerCase().includes(q) ||
    node.name.toLowerCase().includes(q)
  );
}

/** 左侧树关键字筛选：命中节点及其祖先保留 */
export function filterQuotaIndustryTree(
  nodes: QuotaIndustryTreeNode[],
  keyword: string
): QuotaIndustryTreeNode[] {
  const q = keyword.trim();
  if (!q) return nodes;
  const walk = (list: QuotaIndustryTreeNode[]): QuotaIndustryTreeNode[] => {
    const out: QuotaIndustryTreeNode[] = [];
    for (const node of list) {
      const children = node.children?.length ? walk(node.children) : [];
      const selfHit = nodeMatchesTreeKeyword(node, q);
      if (selfHit || children.length) {
        out.push({
          ...node,
          children: children.length ? children : node.children,
        });
      }
    }
    return out;
  };
  return walk(nodes);
}

/** 收集树中所有节点 code（用于搜索时自动展开） */
export function collectQuotaIndustryCodes(nodes: QuotaIndustryTreeNode[]): string[] {
  const codes: string[] = [];
  const walk = (list: QuotaIndustryTreeNode[]) => {
    for (const n of list) {
      codes.push(n.code);
      if (n.children?.length) walk(n.children);
    }
  };
  walk(nodes);
  return codes;
}
