import React, { useState, useMemo, useCallback } from 'react';
import {
  Plus,
  RefreshCw,
  Search,
  ChevronRight,
  ChevronDown,
  Edit3,
  ArrowUpDown,
  Ban,
  CheckCircle,
  Trash2,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

/* ── 类型定义 ── */

export type IndustryCategoryNode = {
  id: string;
  name: string;
  sort: number;
  enabled: boolean;
  /** 父节点 ID，空串表示一级分类 */
  parentId: string;
};

type FormState = {
  id: string;
  name: string;
  sort: string;
  parentId: string;
};

const EMPTY_FORM: FormState = { id: '', name: '', sort: '0', parentId: '' };

/* ── 初始演示数据 ── */

function seedCategories(): IndustryCategoryNode[] {
  const tops: IndustryCategoryNode[] = [
    { id: 'cat-1', name: '节水设备材料', sort: 1, enabled: true, parentId: '' },
    { id: 'cat-2', name: '非常规水源利用', sort: 2, enabled: true, parentId: '' },
    { id: 'cat-3', name: '智慧水务与监测', sort: 3, enabled: true, parentId: '' },
    { id: 'cat-4', name: '合同节水管理', sort: 4, enabled: true, parentId: '' },
    { id: 'cat-5', name: '节水咨询与服务', sort: 5, enabled: false, parentId: '' },
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
    { id: 'sub-9', name: '用水费用托管型', sort: 2, enabled: true, parentId: 'cat-4' },
  ];
  return [...tops, ...subs];
}

/* ── 主组件 ── */

export function WorkbenchCategoryAdminPanel() {
  const [categories, setCategories] = useState<IndustryCategoryNode[]>(seedCategories);
  const [keyword, setKeyword] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNode, setEditingNode] = useState<IndustryCategoryNode | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [movingNode, setMovingNode] = useState<IndustryCategoryNode | null>(null);
  const [moveTargetParent, setMoveTargetParent] = useState('');

  /* 树形结构：一级 + 各自子节点 */
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

  /* 搜索过滤 */
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

  /* 全部一级分类（供「调整层级」弹窗使用） */
  const topLevelOptions = useMemo(
    () => categories.filter((c) => !c.parentId && c.enabled).sort((a, b) => a.sort - b.sort),
    [categories]
  );

  /* ── 操作函数 ── */

  const openCreate = useCallback((parentId?: string) => {
    setEditingNode(null);
    setForm({ ...EMPTY_FORM, parentId: parentId ?? '' });
    setFormError(null);
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((node: IndustryCategoryNode) => {
    setEditingNode(node);
    setForm({
      id: node.id,
      name: node.name,
      sort: String(node.sort),
      parentId: node.parentId,
    });
    setFormError(null);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingNode(null);
    setFormError(null);
  }, []);

  const validateForm = useCallback((): string | null => {
    if (!form.name.trim()) return '请填写分类名称';
    const sortNum = Number(form.sort);
    if (!Number.isFinite(sortNum) || sortNum < 0) return '排序号必须为非负整数';
    return null;
  }, [form]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const err = validateForm();
      if (err) {
        setFormError(err);
        return;
      }
      const sortNum = Number(form.sort);
      if (editingNode) {
        setCategories((prev) =>
          prev.map((c) =>
            c.id === editingNode.id
              ? { ...c, name: form.name.trim(), sort: sortNum, parentId: form.parentId }
              : c
          )
        );
      } else {
        const newNode: IndustryCategoryNode = {
          id: editingNode?.id ?? `cat-${Date.now()}`,
          name: form.name.trim(),
          sort: sortNum,
          enabled: true,
          parentId: form.parentId,
        };
        setCategories((prev) => [...prev, newNode]);
      }
      closeModal();
    },
    [editingNode, form, validateForm, closeModal]
  );

  const handleDelete = useCallback(
    (node: IndustryCategoryNode) => {
      const hasChildren = categories.some((c) => c.parentId === node.id);
      const msg = hasChildren
        ? `分类「${node.name}」下存在子分类，删除将一并移除子分类。确定继续？`
        : `确定删除分类「${node.name}」？`;
      if (!window.confirm(msg)) return;
      const idsToRemove = new Set<string>([node.id]);
      if (hasChildren) {
        for (const c of categories) {
          if (c.parentId === node.id) idsToRemove.add(c.id);
        }
      }
      setCategories((prev) => prev.filter((c) => !idsToRemove.has(c.id)));
    },
    [categories]
  );

  const toggleEnabled = useCallback((node: IndustryCategoryNode) => {
    setCategories((prev) => prev.map((c) => (c.id === node.id ? { ...c, enabled: !c.enabled } : c)));
  }, []);

  const openMoveModal = useCallback((node: IndustryCategoryNode) => {
    setMovingNode(node);
    setMoveTargetParent(node.parentId);
    setMoveModalOpen(true);
  }, []);

  const handleMoveConfirm = useCallback(() => {
    if (!movingNode) return;
    setCategories((prev) =>
      prev.map((c) => (c.id === movingNode.id ? { ...c, parentId: moveTargetParent } : c))
    );
    setMoveModalOpen(false);
    setMovingNode(null);
  }, [movingNode, moveTargetParent]);

  /* ── 渲染 ── */

  return (
    <div className="space-y-4">
      {/* 顶部操作栏 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="relative min-w-[14rem] flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索分类名称"
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-3 text-sm font-medium text-gray-800 placeholder:text-gray-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
          <button
            type="button"
            onClick={() => setCategories(seedCategories())}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-black text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            刷新
          </button>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => openCreate()}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-2 text-xs font-black text-white shadow-sm hover:bg-teal-700"
          >
            <Plus className="h-3.5 w-3.5" />
            新增一级分类
          </button>
          <button
            type="button"
            onClick={() => {
              /* 默认选中第一个启用的父级 */
              const first = topLevelOptions[0]?.id ?? '';
              openCreate(first);
            }}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-teal-200 bg-white px-3 py-2 text-xs font-black text-teal-800 hover:bg-teal-50"
          >
            <Plus className="h-3.5 w-3.5" />
            新增二级分类
          </button>
        </div>
      </div>

      {/* 树形列表 */}
      <div className="overflow-hidden rounded-xl border border-gray-200">
        <table className="w-full min-w-[640px] text-left text-xs">
          <thead className="border-b border-gray-100 bg-gray-50 text-[10px] font-black uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-3 py-2.5" style={{ width: '45%' }}>分类名称</th>
              <th className="px-3 py-2.5">层级</th>
              <th className="px-3 py-2.5">排序</th>
              <th className="px-3 py-2.5">状态</th>
              <th className="px-3 py-2.5 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="font-bold text-gray-800">
            {filteredTree.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-10 text-center text-gray-400">
                  暂无分类，点击「新增一级分类」开始添加
                </td>
              </tr>
            ) : (
              filteredTree.map(({ top, children }) => (
                <React.Fragment key={top.id}>
                  <tr className="border-b border-gray-50 bg-white last:border-0 hover:bg-gray-50/80">
                    <td className="px-3 py-2.5">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-teal-500" />
                        {top.name}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-gray-500">一级分类</td>
                    <td className="px-3 py-2.5 tabular-nums">{top.sort}</td>
                    <td className="px-3 py-2.5">
                      <StatusBadge enabled={top.enabled} />
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-right">
                      <ActionGroup
                        node={top}
                        onEdit={openEdit}
                        onDelete={handleDelete}
                        onToggle={toggleEnabled}
                        onMove={openMoveModal}
                        onAddChild={(parentId) => openCreate(parentId)}
                      />
                    </td>
                  </tr>
                  {children.map((child) => (
                    <tr
                      key={child.id}
                      className="border-b border-gray-50 bg-teal-50/30 last:border-0 hover:bg-teal-50/60"
                    >
                      <td className="px-3 py-2.5 pl-10">
                        <span className="inline-flex items-center gap-1.5 text-gray-700">
                          <span className="h-2 w-2 shrink-0 rounded-full bg-gray-400" />
                          {child.name}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-gray-500">二级分类</td>
                      <td className="px-3 py-2.5 tabular-nums">{child.sort}</td>
                      <td className="px-3 py-2.5">
                        <StatusBadge enabled={child.enabled} />
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-right">
                        <ActionGroup
                          node={child}
                          onEdit={openEdit}
                          onDelete={handleDelete}
                          onToggle={toggleEnabled}
                          onMove={openMoveModal}
                        />
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 新增 / 编辑弹窗 */}
      <AnimatePresence>
        {modalOpen ? (
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
              onClick={closeModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-xl sm:p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-black text-gray-900">
                  {editingNode ? '编辑分类' : '新增分类'}
                </h3>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
                  aria-label="关闭"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <label className="block text-xs font-black text-gray-700">
                  分类名称 <span className="text-red-500">*</span>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-bold text-gray-900 outline-none ring-teal-500/30 focus:border-teal-400 focus:ring-2"
                    placeholder="如节水设备材料"
                    maxLength={80}
                  />
                </label>

                <label className="block text-xs font-black text-gray-700">
                  所属分类（留空为一级分类）
                  <select
                    value={form.parentId}
                    onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value }))}
                    className="mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-900 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/30"
                  >
                    <option value="">— 一级分类 —</option>
                    {topLevelOptions
                      .filter((t) => !editingNode || t.id !== editingNode.id)
                      .map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                  </select>
                </label>

                <label className="block text-xs font-black text-gray-700">
                  排序号 <span className="text-red-500">*</span>
                  <input
                    type="number"
                    value={form.sort}
                    onChange={(e) => setForm((f) => ({ ...f, sort: e.target.value }))}
                    className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-bold text-gray-900 outline-none ring-teal-500/30 focus:border-teal-400 focus:ring-2"
                    min={0}
                    step={1}
                  />
                </label>

                {formError ? (
                  <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-[11px] font-bold text-red-700">
                    {formError}
                  </p>
                ) : null}

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-black text-gray-600 hover:bg-gray-50"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-teal-600 py-2.5 text-sm font-black text-white hover:bg-teal-700"
                  >
                    {editingNode ? '保存' : '创建'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* 调整层级弹窗 */}
      <AnimatePresence>
        {moveModalOpen && movingNode ? (
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
              onClick={() => setMoveModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-xl sm:p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-black text-gray-900">调整层级</h3>
                <button
                  type="button"
                  onClick={() => setMoveModalOpen(false)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
                  aria-label="关闭"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-3 text-xs font-bold text-gray-500">
                将「<span className="text-gray-800">{movingNode.name}</span>」移动到：
              </p>
              <select
                value={moveTargetParent}
                onChange={(e) => setMoveTargetParent(e.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-900 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/30"
              >
                <option value="">— 保持为一级分类 —</option>
                {topLevelOptions
                  .filter((t) => t.id !== movingNode.id)
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
              </select>
              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => setMoveModalOpen(false)}
                  className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-black text-gray-600 hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleMoveConfirm}
                  className="flex-1 rounded-xl bg-teal-600 py-2.5 text-sm font-black text-white hover:bg-teal-700"
                >
                  确认移动
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/* ── 子组件 ── */

function StatusBadge({ enabled }: { enabled: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-black',
        enabled
          ? 'border-teal-200 bg-teal-50 text-teal-800'
          : 'border-gray-200 bg-gray-50 text-gray-400'
      )}
    >
      {enabled ? <CheckCircle className="h-3 w-3" /> : <Ban className="h-3 w-3" />}
      {enabled ? '启用' : '禁用'}
    </span>
  );
}

function ActionGroup({
  node,
  onEdit,
  onDelete,
  onToggle,
  onMove,
  onAddChild,
}: {
  node: IndustryCategoryNode;
  onEdit: (n: IndustryCategoryNode) => void;
  onDelete: (n: IndustryCategoryNode) => void;
  onToggle: (n: IndustryCategoryNode) => void;
  onMove: (n: IndustryCategoryNode) => void;
  onAddChild?: (parentId: string) => void;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {onAddChild && (
        <button
          type="button"
          onClick={() => onAddChild(node.id)}
          className="rounded-lg border border-sky-200 bg-white px-2 py-1 text-[11px] font-black text-sky-700 hover:bg-sky-50"
          title="添加子分类"
        >
          添加子项
        </button>
      )}
      <button
        type="button"
        onClick={() => onEdit(node)}
        className="rounded-lg border border-teal-200 bg-white px-2 py-1 text-[11px] font-black text-teal-800 hover:bg-teal-50"
      >
        <Edit3 className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={() => onMove(node)}
        className="rounded-lg border border-violet-200 bg-white px-2 py-1 text-[11px] font-black text-violet-700 hover:bg-violet-50"
        title="调整层级"
      >
        <ArrowUpDown className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={() => onToggle(node)}
        className={cn(
          'rounded-lg border px-2 py-1 text-[11px] font-black hover:bg-gray-50',
          node.enabled
            ? 'border-amber-200 text-amber-700 hover:bg-amber-50'
            : 'border-green-200 text-green-700 hover:bg-green-50'
        )}
        title={node.enabled ? '禁用' : '启用'}
      >
        {node.enabled ? <Ban className="h-3.5 w-3.5" /> : <CheckCircle className="h-3.5 w-3.5" />}
      </button>
      <button
        type="button"
        onClick={() => onDelete(node)}
        className="rounded-lg border border-red-200 bg-white px-2 py-1 text-[11px] font-black text-red-700 hover:bg-red-50"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </span>
  );
}