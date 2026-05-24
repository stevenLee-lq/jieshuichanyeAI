import React, { useState, useMemo, useCallback } from 'react';
import {
  Plus,
  RefreshCw,
  Search,
  ChevronRight,
  ChevronDown,
  Edit3,
  Trash2,
  X,
  CheckCircle,
  Ban,
  GripVertical,
  Settings,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

/* ── 类型定义 ── */

export type IndustryCategoryNode = {
  id: string;
  name: string;
  sort: number;
  enabled: boolean;
  parentId: string;
};

export type ParamItem = {
  id: string;
  name: string;
  placeholder: string;
  required: boolean;
  sort: number;
  categoryId: string; // 参数项归属的二级分类 ID
};

type ParamGroup = {
  id: string;
  name: string;
  categoryId: string;
  items: ParamItem[];
  sort: number;
  /** 分组标题行（如「工况热力类」），对应 ParamItem 中无占位提示的项 */
  headerItem: ParamItem | null;
};

function isParamGroupHeader(item: ParamItem): boolean {
  return !item.placeholder.trim() && !item.required;
}

/* ── 初始演示数据 ── */

function seedCategories(): IndustryCategoryNode[] {
  const tops: IndustryCategoryNode[] = [
    { id: 'cat-1', name: '节水设备材料', sort: 1, enabled: true, parentId: '' },
    { id: 'cat-2', name: '非常规水源利用', sort: 2, enabled: true, parentId: '' },
    { id: 'cat-3', name: '智慧水务与监测', sort: 3, enabled: true, parentId: '' },
    { id: 'cat-4', name: '合同节水管理', sort: 4, enabled: true, parentId: '' },
  ];
  const subs: IndustryCategoryNode[] = [
    { id: 'sub-1', name: '高效冷却塔', sort: 1, enabled: true, parentId: 'cat-1' },
    { id: 'sub-2', name: '节水型阀门', sort: 2, enabled: true, parentId: 'cat-1' },
    { id: 'sub-3', name: '智能水表', sort: 3, enabled: true, parentId: 'cat-1' },
    { id: 'sub-4', name: '雨水收集系统', sort: 1, enabled: true, parentId: 'cat-2' },
    { id: 'sub-5', name: '再生水处理设备', sort: 2, enabled: true, parentId: 'cat-2' },
    { id: 'sub-6', name: 'DMA 分区计量', sort: 1, enabled: true, parentId: 'cat-3' },
    { id: 'sub-7', name: '管网漏损监测', sort: 2, enabled: true, parentId: 'cat-3' },
    { id: 'sub-8', name: '节水效益分享型', sort: 1, enabled: true, parentId: 'cat-4' },
  ];
  return [...tops, ...subs];
}

function seedParamItems(): ParamItem[] {
  return [
    // 高效冷却塔 sub-1
    { id: 'p1', name: '工况热力类', placeholder: '', required: false, sort: 1, categoryId: 'sub-1' },
    { id: 'p2', name: '设计进水温度', placeholder: '示例：6℃', required: true, sort: 1, categoryId: 'sub-1' },
    { id: 'p3', name: '设计出水温度', placeholder: '示例：6℃', required: true, sort: 2, categoryId: 'sub-1' },
    { id: 'p4', name: '单塔散热量', placeholder: '示例：8 kW/kcal/h', required: false, sort: 3, categoryId: 'sub-1' },
    { id: 'p5', name: '结构形式类', placeholder: '', required: false, sort: 2, categoryId: 'sub-1' },
    { id: 'p6', name: '气流方式', placeholder: '示例：逆流/横流', required: false, sort: 1, categoryId: 'sub-1' },
    { id: 'p7', name: '结构外形', placeholder: '示例：圆形/方形/矩形', required: false, sort: 2, categoryId: 'sub-1' },
    // 节水型阀门 sub-2
    { id: 'p8', name: '阀门类型', placeholder: '如：蝶阀/球阀/闸阀', required: true, sort: 1, categoryId: 'sub-2' },
    { id: 'p9', name: '公称通径(DN)', placeholder: '请输入公称通径', required: true, sort: 2, categoryId: 'sub-2' },
    { id: 'p10', name: '公称压力(PN)', placeholder: '如：PN10/PN16', required: true, sort: 3, categoryId: 'sub-2' },
    { id: 'p11', name: '阀体材质', placeholder: '如：铸铁/不锈钢', required: false, sort: 4, categoryId: 'sub-2' },
  ];
}

/* ── 主组件 ─ */

export function WorkbenchIndustryCategoryParamPanel() {
  const [categories, setCategories] = useState<IndustryCategoryNode[]>(seedCategories());
  const [paramItems, setParamItems] = useState<ParamItem[]>(seedParamItems());
  const [keyword, setKeyword] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [expandedTops, setExpandedTops] = useState<Set<string>>(new Set(['cat-1']));

  // modals
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<IndustryCategoryNode | null>(null);
  const [categoryForm, setCategoryForm] = useState({ id: '', name: '', sort: '0', parentId: '' });
  const [categoryFormError, setCategoryFormError] = useState<string | null>(null);

  const [paramModalOpen, setParamModalOpen] = useState(false);
  const [editingParam, setEditingParam] = useState<ParamItem | null>(null);
  const [paramForm, setParamForm] = useState({ id: '', name: '', placeholder: '', required: false, sort: '0', categoryId: '' });
  const [paramFormIsGroupHeader, setParamFormIsGroupHeader] = useState(false);
  const [paramFormError, setParamFormError] = useState<string | null>(null);

  // 树形结构
  const tree = useMemo(() => {
    const tops = categories.filter((c) => !c.parentId).sort((a, b) => a.sort - b.sort);
    const childrenMap = new Map<string, IndustryCategoryNode[]>();
    for (const c of categories) {
      if (c.parentId) {
        const list = childrenMap.get(c.parentId) ?? [];
        list.push(c);
        childrenMap.set(c.parentId, list);
      }
    }
    for (const [, list] of childrenMap) {
      list.sort((a, b) => a.sort - b.sort);
    }
    return tops.map((t) => ({ top: t, children: childrenMap.get(t.id) ?? [] }));
  }, [categories]);

  // 搜索过滤
  const filteredTree = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return tree;
    return tree
      .map((group) => {
        const topMatch = group.top.name.toLowerCase().includes(kw);
        const matchedChildren = group.children.filter((c) => c.name.toLowerCase().includes(kw));
        if (topMatch || matchedChildren.length > 0) {
          return { top: group.top, children: topMatch ? group.children : matchedChildren };
        }
        return null;
      })
      .filter(Boolean) as typeof tree;
  }, [tree, keyword]);

  // 二级分类列表（用于参数分组）
  const secondLevelCategories = useMemo(
    () => categories.filter((c) => c.parentId && c.enabled).sort((a, b) => a.sort - b.sort),
    [categories]
  );

  const topLevelOptions = useMemo(
    () => categories.filter((c) => !c.parentId && c.enabled).sort((a, b) => a.sort - b.sort),
    [categories]
  );

  // 根据选中的二级分类获取参数分组（按列表顺序：无占位提示项为分组标题）
  const paramGroups: ParamGroup[] = useMemo(() => {
    const targetCategoryId = selectedCategoryId || (secondLevelCategories[0]?.id ?? '');
    const itemsForCategory = paramItems.filter((p) => p.categoryId === targetCategoryId);
    const groups: ParamGroup[] = [];
    let current: ParamGroup | null = null;

    for (const item of itemsForCategory) {
      if (isParamGroupHeader(item)) {
        current = {
          id: item.id,
          name: item.name,
          categoryId: targetCategoryId,
          items: [],
          sort: item.sort,
          headerItem: item,
        };
        groups.push(current);
        continue;
      }
      if (current) {
        current.items.push(item);
      } else {
        current = {
          id: `orphan-${item.id}`,
          name: '未分组参数',
          categoryId: targetCategoryId,
          items: [item],
          sort: item.sort,
          headerItem: null,
        };
        groups.push(current);
      }
    }

    return groups;
  }, [paramItems, selectedCategoryId, secondLevelCategories]);

  const currentCategoryName = useMemo(() => {
    const targetCategoryId = selectedCategoryId || (secondLevelCategories[0]?.id ?? '');
    return categories.find((c) => c.id === targetCategoryId)?.name ?? '';
  }, [categories, selectedCategoryId, secondLevelCategories]);

  /* ── 分类操作 ── */

  const toggleExpand = useCallback((topId: string) => {
    setExpandedTops((prev) => {
      const next = new Set(prev);
      if (next.has(topId)) next.delete(topId);
      else next.add(topId);
      return next;
    });
  }, []);

  const openCreateCategory = useCallback((parentId?: string) => {
    setEditingCategory(null);
    setCategoryForm({ id: '', name: '', sort: '0', parentId: parentId ?? '' });
    setCategoryFormError(null);
    setCategoryModalOpen(true);
  }, []);

  const openEditCategory = useCallback((node: IndustryCategoryNode) => {
    setEditingCategory(node);
    setCategoryForm({ id: node.id, name: node.name, sort: String(node.sort), parentId: node.parentId });
    setCategoryFormError(null);
    setCategoryModalOpen(true);
  }, []);

  const closeCategoryModal = useCallback(() => {
    setCategoryModalOpen(false);
    setEditingCategory(null);
    setCategoryFormError(null);
  }, []);

  const handleCategorySubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!categoryForm.name.trim()) {
        setCategoryFormError('请填写分类名称');
        return;
      }
      const sortNum = Number(categoryForm.sort);
      if (!Number.isFinite(sortNum) || sortNum < 0) {
        setCategoryFormError('排序号必须为非负整数');
        return;
      }
      if (editingCategory) {
        setCategories((prev) =>
          prev.map((c) =>
            c.id === editingCategory.id
              ? { ...c, name: categoryForm.name.trim(), sort: sortNum, parentId: categoryForm.parentId }
              : c
          )
        );
      } else {
        const newNode: IndustryCategoryNode = {
          id: `cat-${Date.now()}`,
          name: categoryForm.name.trim(),
          sort: sortNum,
          enabled: true,
          parentId: categoryForm.parentId,
        };
        setCategories((prev) => [...prev, newNode]);
      }
      closeCategoryModal();
    },
    [editingCategory, categoryForm, closeCategoryModal]
  );

  const handleDeleteCategory = useCallback(
    (node: IndustryCategoryNode) => {
      const hasChildren = categories.some((c) => c.parentId === node.id);
      const msg = hasChildren
        ? `分类「${node.name}」下存在子分类，删除将一并移除子分类及其参数配置。确定继续？`
        : `确定删除分类「${node.name}」？`;
      if (!window.confirm(msg)) return;
      const idsToRemove = new Set<string>([node.id]);
      if (hasChildren) {
        for (const c of categories) {
          if (c.parentId === node.id) idsToRemove.add(c.id);
        }
      }
      setCategories((prev) => prev.filter((c) => !idsToRemove.has(c.id)));
      setParamItems((prev) => prev.filter((p) => !idsToRemove.has(p.categoryId)));
      if (idsToRemove.has(selectedCategoryId ?? '')) {
        setSelectedCategoryId(secondLevelCategories[0]?.id ?? null);
      }
    },
    [categories, selectedCategoryId, secondLevelCategories]
  );

  const toggleCategoryEnabled = useCallback((node: IndustryCategoryNode) => {
    setCategories((prev) => prev.map((c) => (c.id === node.id ? { ...c, enabled: !c.enabled } : c)));
  }, []);

  /* ── 参数操作 ── */

  const openCreateParamGroup = useCallback(() => {
    const targetCategoryId = selectedCategoryId || (secondLevelCategories[0]?.id ?? '');
    const headerSorts = paramItems
      .filter((p) => p.categoryId === targetCategoryId && isParamGroupHeader(p))
      .map((p) => p.sort);
    const nextSort = headerSorts.length > 0 ? Math.max(...headerSorts) + 1 : 1;
    setEditingParam(null);
    setParamFormIsGroupHeader(true);
    setParamForm({
      id: '',
      name: '',
      placeholder: '',
      required: false,
      sort: String(nextSort),
      categoryId: targetCategoryId,
    });
    setParamFormError(null);
    setParamModalOpen(true);
  }, [selectedCategoryId, secondLevelCategories, paramItems]);

  const openCreateParam = useCallback(() => {
    const targetCategoryId = selectedCategoryId || (secondLevelCategories[0]?.id ?? '');
    setEditingParam(null);
    setParamFormIsGroupHeader(false);
    const itemsForCat = paramItems.filter(
      (p) => p.categoryId === targetCategoryId && !isParamGroupHeader(p)
    );
    setParamForm({
      id: '',
      name: '',
      placeholder: '',
      required: false,
      sort: String(itemsForCat.length + 1),
      categoryId: targetCategoryId,
    });
    setParamFormError(null);
    setParamModalOpen(true);
  }, [selectedCategoryId, secondLevelCategories, paramItems]);

  const openEditParam = useCallback((item: ParamItem) => {
    setEditingParam(item);
    setParamFormIsGroupHeader(isParamGroupHeader(item));
    setParamForm({
      id: item.id,
      name: item.name,
      placeholder: item.placeholder,
      required: item.required,
      sort: String(item.sort),
      categoryId: item.categoryId,
    });
    setParamFormError(null);
    setParamModalOpen(true);
  }, []);

  const closeParamModal = useCallback(() => {
    setParamModalOpen(false);
    setEditingParam(null);
    setParamFormIsGroupHeader(false);
    setParamFormError(null);
  }, []);

  const handleParamSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!paramForm.categoryId) {
        setParamFormError('请选择所属分类');
        return;
      }
      if (!paramForm.name.trim()) {
        setParamFormError('请填写参数名称');
        return;
      }
      const sortNum = Number(paramForm.sort);
      if (!Number.isFinite(sortNum) || sortNum < 0) {
        setParamFormError('排序号必须为非负整数');
        return;
      }
      const isHeader = paramFormIsGroupHeader;
      if (editingParam) {
        setParamItems((prev) =>
          prev.map((p) =>
            p.id === editingParam.id
              ? {
                  ...p,
                  name: paramForm.name.trim(),
                  placeholder: isHeader ? '' : paramForm.placeholder.trim(),
                  required: isHeader ? false : paramForm.required,
                  sort: sortNum,
                }
              : p
          )
        );
      } else {
        const newItem: ParamItem = {
          id: `p-${Date.now()}`,
          name: paramForm.name.trim(),
          placeholder: isHeader ? '' : paramForm.placeholder.trim(),
          required: isHeader ? false : paramForm.required,
          sort: sortNum,
          categoryId: paramForm.categoryId,
        };
        setParamItems((prev) => [...prev, newItem]);
      }
      closeParamModal();
    },
    [editingParam, paramForm, paramFormIsGroupHeader, closeParamModal]
  );

  const handleDeleteParam = useCallback((item: ParamItem) => {
    if (!window.confirm(`确定删除「${item.name}」？`)) return;
    setParamItems((prev) => prev.filter((p) => p.id !== item.id));
  }, []);

  const handleDeleteParamGroup = useCallback((group: ParamGroup) => {
    if (!group.headerItem) return;
    const msg = group.items.length
      ? `确定删除分类「${group.name}」及其下 ${group.items.length} 个参数？`
      : `确定删除分类「${group.name}」？`;
    if (!window.confirm(msg)) return;
    const ids = new Set([group.headerItem.id, ...group.items.map((p) => p.id)]);
    setParamItems((prev) => prev.filter((p) => !ids.has(p.id)));
  }, []);

  const handleSaveParams = useCallback(() => {
    // 参数已实时保存到 paramItems state
  }, []);

  /* ── 渲染 ── */

  return (
    <div className="flex h-full min-h-[560px] gap-4">
      {/* 左侧：分类树 */}
      <div className="flex w-72 shrink-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white">
        {/* 树顶部操作 */}
        <div className="shrink-0 border-b border-gray-100 bg-gray-50 px-3 py-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openCreateCategory()}
              className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-teal-600 px-2 py-1.5 text-[11px] font-black text-white hover:bg-teal-700"
            >
              <Plus className="h-3 w-3" />
              新建同级
            </button>
            <button
              type="button"
              onClick={() => openCreateCategory(topLevelOptions[0]?.id)}
              className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg border border-teal-200 bg-white px-2 py-1.5 text-[11px] font-black text-teal-800 hover:bg-teal-50"
            >
              <Plus className="h-3 w-3" />
              新建下级
            </button>
          </div>
          <div className="mt-2 relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索"
              className="w-full rounded-lg border border-gray-200 bg-white py-1.5 pl-8 pr-2 text-xs font-medium text-gray-800 placeholder:text-gray-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500/20"
            />
          </div>
        </div>

        {/* 树列表 */}
        <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
          {filteredTree.length === 0 ? (
            <p className="py-8 text-center text-xs font-bold text-gray-400">暂无分类</p>
          ) : (
            filteredTree.map(({ top, children }) => {
              const isExpanded = expandedTops.has(top.id);
              return (
                <div key={top.id}>
                  {/* 一级分类 */}
                  <div
                    className={cn(
                      'group flex items-center justify-between rounded-lg px-2 py-1.5 cursor-pointer hover:bg-gray-50',
                      selectedCategoryId === top.id && 'bg-teal-50'
                    )}
                    onClick={() => {
                      if (children.length > 0) toggleExpand(top.id);
                    }}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      {children.length > 0 ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(top.id);
                          }}
                          className="shrink-0 text-gray-400 hover:text-gray-600"
                        >
                          {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                        </button>
                      ) : (
                        <span className="h-3.5 w-3.5 shrink-0" />
                      )}
                      <span className="h-2 w-2 shrink-0 rounded-full bg-teal-500" />
                      <span className="truncate text-xs font-bold text-gray-800">{top.name}</span>
                    </div>
                    <span className="invisible group-hover:visible inline-flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditCategory(top);
                        }}
                        className="rounded border border-teal-200 bg-white p-0.5 text-teal-700 hover:bg-teal-50"
                      >
                        <Edit3 className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCategory(top);
                        }}
                        className="rounded border border-red-200 bg-white p-0.5 text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </span>
                  </div>

                  {/* 二级分类 */}
                  <AnimatePresence>
                    {isExpanded && children.length > 0 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="overflow-hidden"
                      >
                        {children.map((child) => (
                          <div
                            key={child.id}
                            className={cn(
                              'group flex items-center justify-between rounded-lg pl-6 pr-2 py-1.5 cursor-pointer hover:bg-teal-50/50',
                              selectedCategoryId === child.id && 'bg-teal-100'
                            )}
                            onClick={() => setSelectedCategoryId(child.id)}
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400" />
                              <span className="truncate text-xs font-bold text-gray-700">{child.name}</span>
                            </div>
                            <span className="invisible group-hover:visible inline-flex shrink-0 items-center gap-1">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditCategory(child);
                                }}
                                className="rounded border border-teal-200 bg-white p-0.5 text-teal-700 hover:bg-teal-50"
                              >
                                <Edit3 className="h-3 w-3" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCategory(child);
                                }}
                                className="rounded border border-red-200 bg-white p-0.5 text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 右侧：参数配置 */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white">
        {/* 参数配置头部 */}
        <div className="shrink-0 flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <h3 className="text-sm font-black text-gray-900">参数配置</h3>
          <button
            type="button"
            onClick={handleSaveParams}
            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-1.5 text-xs font-black text-white hover:bg-teal-700"
          >
            保存
          </button>
        </div>

        {/* 参数操作按钮 */}
        <div className="shrink-0 flex items-center gap-2 border-b border-gray-100 px-4 py-2.5">
          <button
            type="button"
            onClick={openCreateParamGroup}
            className="inline-flex items-center gap-1 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-black text-white hover:bg-teal-700"
          >
            <Plus className="h-3.5 w-3.5" />
            新增分类
          </button>
          <button
            type="button"
            onClick={openCreateParam}
            className="inline-flex items-center gap-1 rounded-lg border border-teal-200 bg-white px-3 py-1.5 text-xs font-black text-teal-800 hover:bg-teal-50"
          >
            <Plus className="h-3.5 w-3.5" />
            新增参数
          </button>
        </div>

        {/* 参数表格 */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
          {paramGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                <Settings className="h-6 w-6" />
              </div>
              <p className="text-xs font-bold text-gray-400">暂无参数配置</p>
              <p className="mt-1 text-[11px] font-bold text-gray-300">点击「新增参数」开始配置</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-gray-100 bg-gray-50 text-[10px] font-black uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-3 py-2" style={{ width: '35%' }}>参数</th>
                    <th className="px-3 py-2" style={{ width: '30%' }}>提示词</th>
                    <th className="px-3 py-2" style={{ width: '10%' }}>排序</th>
                    <th className="px-3 py-2 text-right" style={{ width: '25%' }}>操作</th>
                  </tr>
                </thead>
                <tbody className="font-bold text-gray-800">
                  {paramGroups.map((group) => (
                    <React.Fragment key={group.id}>
                      {/* 参数分类行（如工况热力类） */}
                      {group.headerItem ? (
                        <tr className="bg-teal-50/40">
                          <td className="px-3 py-2">
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-teal-800">
                              <span className="h-2 w-2 rounded-full bg-teal-500" />
                              {group.name}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-gray-400">—</td>
                          <td className="px-3 py-2 tabular-nums text-gray-600">{group.headerItem.sort}</td>
                          <td className="whitespace-nowrap px-3 py-2 text-right">
                            <span className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => openEditParam(group.headerItem!)}
                                className="rounded border border-teal-200 bg-white px-2 py-0.5 text-[11px] font-black text-teal-700 hover:bg-teal-50"
                              >
                                编辑
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteParamGroup(group)}
                                className="rounded border border-red-200 bg-white px-2 py-0.5 text-[11px] font-black text-red-700 hover:bg-red-50"
                              >
                                删除
                              </button>
                            </span>
                          </td>
                        </tr>
                      ) : null}
                      {/* 参数项行 */}
                      {group.items.map((item, idx) => (
                        <tr key={item.id} className={cn('border-t border-gray-50', idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30')}>
                          <td className="px-3 py-2">{item.name}</td>
                          <td className="px-3 py-2 text-gray-500">{item.placeholder || '—'}</td>
                          <td className="px-3 py-2 tabular-nums text-gray-500">{item.sort}</td>
                          <td className="whitespace-nowrap px-3 py-2 text-right">
                            <span className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => openEditParam(item)}
                                className="rounded border border-teal-200 bg-white px-2 py-0.5 text-[11px] font-black text-teal-700 hover:bg-teal-50"
                              >
                                编辑
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteParam(item)}
                                className="rounded border border-red-200 bg-white px-2 py-0.5 text-[11px] font-black text-red-700 hover:bg-red-50"
                              >
                                删除
                              </button>
                            </span>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 分类编辑弹窗 */}
      <AnimatePresence>
        {categoryModalOpen ? (
          <motion.div
            className="fixed inset-0 z-[120] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-gray-900/45 backdrop-blur-[2px]"
              aria-label="关闭"
              onClick={closeCategoryModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-xl sm:p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-black text-gray-900">
                  {editingCategory ? '编辑分类' : '新增分类'}
                </h3>
                <button
                  type="button"
                  onClick={closeCategoryModal}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
                  aria-label="关闭"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCategorySubmit} className="mt-4 space-y-4">
                <label className="block text-xs font-black text-gray-700">
                  分类名称 <span className="text-red-500">*</span>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm((f) => ({ ...f, name: e.target.value }))}
                    className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-bold text-gray-900 outline-none ring-teal-500/30 focus:border-teal-400 focus:ring-2"
                    placeholder="如：节水设备材料"
                    maxLength={80}
                  />
                </label>

                <label className="block text-xs font-black text-gray-700">
                  排序号 <span className="text-red-500">*</span>
                  <input
                    type="number"
                    value={categoryForm.sort}
                    onChange={(e) => setCategoryForm((f) => ({ ...f, sort: e.target.value }))}
                    className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-bold text-gray-900 outline-none ring-teal-500/30 focus:border-teal-400 focus:ring-2"
                    min={0}
                    step={1}
                  />
                </label>

                {categoryFormError ? (
                  <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-[11px] font-bold text-red-700">
                    {categoryFormError}
                  </p>
                ) : null}

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={closeCategoryModal}
                    className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-black text-gray-600 hover:bg-gray-50"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-teal-600 py-2.5 text-sm font-black text-white hover:bg-teal-700"
                  >
                    {editingCategory ? '保存' : '创建'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* 参数编辑弹窗 */}
      <AnimatePresence>
        {paramModalOpen ? (
          <motion.div
            className="fixed inset-0 z-[130] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-gray-900/45 backdrop-blur-[2px]"
              aria-label="关闭"
              onClick={closeParamModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-xl sm:p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-black text-gray-900">
                  {paramFormIsGroupHeader
                    ? editingParam
                      ? '编辑分类'
                      : '新增分类'
                    : editingParam
                      ? '编辑参数'
                      : '新增参数'}
                </h3>
                <button
                  type="button"
                  onClick={closeParamModal}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
                  aria-label="关闭"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleParamSubmit} className="mt-4 space-y-4">
                <label className="block text-xs font-black text-gray-700">
                  所属分类 <span className="text-red-500">*</span>
                  <select
                    value={paramForm.categoryId}
                    onChange={(e) => setParamForm((f) => ({ ...f, categoryId: e.target.value }))}
                    className="mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-900 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/30"
                  >
                    <option value="">— 请选择分类 —</option>
                    {secondLevelCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block text-xs font-black text-gray-700">
                  {paramFormIsGroupHeader ? '分类名称' : '参数名称'} <span className="text-red-500">*</span>
                  <input
                    type="text"
                    value={paramForm.name}
                    onChange={(e) => setParamForm((f) => ({ ...f, name: e.target.value }))}
                    className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-bold text-gray-900 outline-none ring-teal-500/30 focus:border-teal-400 focus:ring-2"
                    placeholder={paramFormIsGroupHeader ? '如：工况热力类' : '如：设计进水温度'}
                    maxLength={60}
                  />
                </label>

                {!paramFormIsGroupHeader ? (
                  <>
                    <label className="block text-xs font-black text-gray-700">
                      占位提示文字
                      <input
                        type="text"
                        value={paramForm.placeholder}
                        onChange={(e) => setParamForm((f) => ({ ...f, placeholder: e.target.value }))}
                        className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-bold text-gray-900 outline-none ring-teal-500/30 focus:border-teal-400 focus:ring-2"
                        placeholder="如：示例：6℃"
                        maxLength={100}
                      />
                    </label>

                    <label className="flex items-center gap-2 text-xs font-black text-gray-700">
                      <input
                        type="checkbox"
                        checked={paramForm.required}
                        onChange={(e) => setParamForm((f) => ({ ...f, required: e.target.checked }))}
                        className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                      />
                      必填
                    </label>
                  </>
                ) : null}

                <label className="block text-xs font-black text-gray-700">
                  排序号 <span className="text-red-500">*</span>
                  <input
                    type="number"
                    value={paramForm.sort}
                    onChange={(e) => setParamForm((f) => ({ ...f, sort: e.target.value }))}
                    className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-bold text-gray-900 outline-none ring-teal-500/30 focus:border-teal-400 focus:ring-2"
                    min={0}
                    step={1}
                  />
                </label>

                {paramFormError ? (
                  <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-[11px] font-bold text-red-700">
                    {paramFormError}
                  </p>
                ) : null}

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={closeParamModal}
                    className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-black text-gray-600 hover:bg-gray-50"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-teal-600 py-2.5 text-sm font-black text-white hover:bg-teal-700"
                  >
                    {editingParam ? '保存' : '添加'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}