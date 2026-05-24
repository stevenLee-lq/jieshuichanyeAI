import React, { useState, useMemo, useCallback } from 'react';
import {
  Plus,
  RefreshCw,
  Search,
  Edit3,
  Ban,
  CheckCircle,
  Trash2,
  X,
  GripVertical,
  Link,
  Link2Off,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

/* ── 类型定义 ── */

export type ParamItem = {
  id: string;
  name: string;
  placeholder: string;
  required: boolean;
  sort: number;
};

export type ParamTemplate = {
  id: string;
  name: string;
  categoryId: string; // 绑定的二级分类 ID
  items: ParamItem[];
  enabled: boolean;
  createdAt: string;
};

type TemplateFormState = {
  id: string;
  name: string;
  categoryId: string;
};

type ParamItemFormState = {
  id: string;
  name: string;
  placeholder: string;
  required: boolean;
  sort: string;
};

const EMPTY_TEMPLATE_FORM: TemplateFormState = { id: '', name: '', categoryId: '' };
const EMPTY_PARAM_FORM: ParamItemFormState = { id: '', name: '', placeholder: '', required: false, sort: '0' };

/* ── 辅助：二级分类列表（与分类管理面板结构对齐） ── */

type CategoryNode = {
  id: string;
  name: string;
  sort: number;
  enabled: boolean;
  parentId: string;
};

function getSecondLevelCategories(): CategoryNode[] {
  try {
    const raw = localStorage.getItem('industry_categories');
    if (raw) {
      const parsed: CategoryNode[] = JSON.parse(raw);
      return parsed.filter((c) => c.parentId && c.enabled).sort((a, b) => a.sort - b.sort);
    }
  } catch {
    // ignore
  }
  // fallback demo data
  return [
    { id: 'sub-1', name: '高效冷却塔', sort: 1, enabled: true, parentId: 'cat-1' },
    { id: 'sub-2', name: '节水型阀门', sort: 2, enabled: true, parentId: 'cat-1' },
    { id: 'sub-3', name: '智能水表', sort: 3, enabled: true, parentId: 'cat-1' },
    { id: 'sub-4', name: '雨水收集系统', sort: 1, enabled: true, parentId: 'cat-2' },
    { id: 'sub-5', name: '再生水处理设备', sort: 2, enabled: true, parentId: 'cat-2' },
  ];
}

/* ── 初始演示数据 ── */

function seedTemplates(): ParamTemplate[] {
  return [
    {
      id: 'tpl-1',
      name: '冷却塔参数模板',
      categoryId: 'sub-1',
      enabled: true,
      createdAt: '2025-04-10 14:30:00',
      items: [
        { id: 'p1', name: '冷却塔类型', placeholder: '如：逆流式/横流式', required: true, sort: 1 },
        { id: 'p2', name: '处理水量(m³/h)', placeholder: '请输入设计处理水量', required: true, sort: 2 },
        { id: 'p3', name: '进水温度(℃)', placeholder: '请输入进水温度', required: false, sort: 3 },
        { id: 'p4', name: '出水温度(℃)', placeholder: '请输入出水温度', required: false, sort: 4 },
        { id: 'p5', name: '风机功率(kW)', placeholder: '请输入风机额定功率', required: true, sort: 5 },
        { id: 'p6', name: '填料材质', placeholder: '如：PVC/PP', required: false, sort: 6 },
        { id: 'p7', name: '噪声等级(dB)', placeholder: '请输入运行噪声值', required: false, sort: 7 },
      ],
    },
    {
      id: 'tpl-2',
      name: '节水阀门参数模板',
      categoryId: 'sub-2',
      enabled: true,
      createdAt: '2025-04-12 09:15:00',
      items: [
        { id: 'p8', name: '阀门类型', placeholder: '如：蝶阀/球阀/闸阀', required: true, sort: 1 },
        { id: 'p9', name: '公称通径(DN)', placeholder: '请输入公称通径', required: true, sort: 2 },
        { id: 'p10', name: '公称压力(PN)', placeholder: '如：PN10/PN16', required: true, sort: 3 },
        { id: 'p11', name: '阀体材质', placeholder: '如：铸铁/不锈钢', required: false, sort: 4 },
      ],
    },
  ];
}

/* ── 主组件 ── */

export function WorkbenchProductParamTemplatePanel() {
  const [templates, setTemplates] = useState<ParamTemplate[]>(seedTemplates);
  const [keyword, setKeyword] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // modals
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ParamTemplate | null>(null);
  const [templateForm, setTemplateForm] = useState<TemplateFormState>(EMPTY_TEMPLATE_FORM);
  const [templateFormError, setTemplateFormError] = useState<string | null>(null);

  const [paramModalOpen, setParamModalOpen] = useState(false);
  const [editingParam, setEditingParam] = useState<ParamItem | null>(null);
  const [paramForm, setParamForm] = useState<ParamItemFormState>(EMPTY_PARAM_FORM);
  const [paramFormError, setParamFormError] = useState<string | null>(null);
  const [currentTemplateItems, setCurrentTemplateItems] = useState<ParamItem[]>([]);
  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(null);

  const secondLevelCategories = useMemo(() => getSecondLevelCategories(), []);

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    secondLevelCategories.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [secondLevelCategories]);

  const filteredTemplates = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return templates;
    return templates.filter(
      (t) =>
        t.name.toLowerCase().includes(kw) ||
        (categoryMap.get(t.categoryId) ?? '').toLowerCase().includes(kw)
    );
  }, [templates, keyword, categoryMap]);

  /* ── 模板 CRUD ── */

  const openCreateTemplate = useCallback(() => {
    setEditingTemplate(null);
    setTemplateForm({ ...EMPTY_TEMPLATE_FORM });
    setTemplateFormError(null);
    setTemplateModalOpen(true);
  }, []);

  const openEditTemplate = useCallback((tpl: ParamTemplate) => {
    setEditingTemplate(tpl);
    setTemplateForm({ id: tpl.id, name: tpl.name, categoryId: tpl.categoryId });
    setTemplateFormError(null);
    setTemplateModalOpen(true);
  }, []);

  const closeTemplateModal = useCallback(() => {
    setTemplateModalOpen(false);
    setEditingTemplate(null);
    setTemplateFormError(null);
  }, []);

  const handleTemplateSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!templateForm.name.trim()) {
        setTemplateFormError('请填写模板名称');
        return;
      }
      if (editingTemplate) {
        setTemplates((prev) =>
          prev.map((t) =>
            t.id === editingTemplate.id
              ? { ...t, name: templateForm.name.trim(), categoryId: templateForm.categoryId }
              : t
          )
        );
      } else {
        const newTpl: ParamTemplate = {
          id: `tpl-${Date.now()}`,
          name: templateForm.name.trim(),
          categoryId: templateForm.categoryId,
          items: [],
          enabled: true,
          createdAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
        };
        setTemplates((prev) => [...prev, newTpl]);
      }
      closeTemplateModal();
    },
    [editingTemplate, templateForm, closeTemplateModal]
  );

  const handleDeleteTemplate = useCallback(
    (tpl: ParamTemplate) => {
      if (!window.confirm(`确定删除模板「${tpl.name}」？`)) return;
      setTemplates((prev) => prev.filter((t) => t.id !== tpl.id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(tpl.id);
        return next;
      });
    },
    []
  );

  const toggleTemplateEnabled = useCallback((tpl: ParamTemplate) => {
    setTemplates((prev) => prev.map((t) => (t.id === tpl.id ? { ...t, enabled: !t.enabled } : t)));
  }, []);

  /* ── 批量操作 ── */

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === filteredTemplates.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredTemplates.map((t) => t.id)));
    }
  }, [filteredTemplates, selectedIds.size]);

  const batchToggleEnabled = useCallback(
    (enable: boolean) => {
      setTemplates((prev) =>
        prev.map((t) => (selectedIds.has(t.id) ? { ...t, enabled: enable } : t))
      );
    },
    [selectedIds]
  );

  const batchDelete = useCallback(() => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`确定删除选中的 ${selectedIds.size} 个模板？`)) return;
    setTemplates((prev) => prev.filter((t) => !selectedIds.has(t.id)));
    setSelectedIds(new Set());
  }, [selectedIds]);

  /* ── 参数项管理 ── */

  const openParamEditor = useCallback((tpl: ParamTemplate) => {
    setCurrentTemplateId(tpl.id);
    setCurrentTemplateItems([...tpl.items].sort((a, b) => a.sort - b.sort));
    setParamModalOpen(true);
  }, []);

  const closeParamModal = useCallback(() => {
    setParamModalOpen(false);
    setCurrentTemplateId(null);
    setCurrentTemplateItems([]);
  }, []);

  const saveParamItems = useCallback(() => {
    if (!currentTemplateId) return;
    setTemplates((prev) =>
      prev.map((t) => (t.id === currentTemplateId ? { ...t, items: currentTemplateItems } : t))
    );
    closeParamModal();
  }, [currentTemplateId, currentTemplateItems, closeParamModal]);

  const openCreateParam = useCallback(() => {
    setEditingParam(null);
    setParamForm({ ...EMPTY_PARAM_FORM, sort: String(currentTemplateItems.length + 1) });
    setParamFormError(null);
  }, [currentTemplateItems.length]);

  const openEditParam = useCallback((item: ParamItem) => {
    setEditingParam(item);
    setParamForm({
      id: item.id,
      name: item.name,
      placeholder: item.placeholder,
      required: item.required,
      sort: String(item.sort),
    });
    setParamFormError(null);
  }, []);

  const handleParamSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!paramForm.name.trim()) {
        setParamFormError('请填写参数名称');
        return;
      }
      const sortNum = Number(paramForm.sort);
      if (!Number.isFinite(sortNum) || sortNum < 0) {
        setParamFormError('排序号必须为非负整数');
        return;
      }
      if (editingParam) {
        setCurrentTemplateItems((prev) =>
          prev.map((it) =>
            it.id === editingParam.id
              ? {
                  ...it,
                  name: paramForm.name.trim(),
                  placeholder: paramForm.placeholder.trim(),
                  required: paramForm.required,
                  sort: sortNum,
                }
              : it
          )
        );
      } else {
        const newItem: ParamItem = {
          id: `item-${Date.now()}`,
          name: paramForm.name.trim(),
          placeholder: paramForm.placeholder.trim(),
          required: paramForm.required,
          sort: sortNum,
        };
        setCurrentTemplateItems((prev) => [...prev, newItem]);
      }
      setEditingParam(null);
      setParamForm(EMPTY_PARAM_FORM);
      setParamFormError(null);
    },
    [editingParam, paramForm]
  );

  const deleteParamItem = useCallback((item: ParamItem) => {
    setCurrentTemplateItems((prev) => prev.filter((it) => it.id !== item.id));
  }, []);

  const moveParamItem = useCallback((itemId: string, direction: 'up' | 'down') => {
    setCurrentTemplateItems((prev) => {
      const sorted = [...prev].sort((a, b) => a.sort - b.sort);
      const idx = sorted.findIndex((it) => it.id === itemId);
      if (idx < 0) return prev;
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= sorted.length) return prev;
      [sorted[idx], sorted[targetIdx]] = [sorted[targetIdx], sorted[idx]];
      return sorted.map((it, i) => ({ ...it, sort: i + 1 }));
    });
  }, []);

  const getCategoryName = useCallback(
    (categoryId: string) => categoryMap.get(categoryId) ?? '未绑定',
    [categoryMap]
  );

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
              placeholder="搜索模板名称或分类"
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-3 text-sm font-medium text-gray-800 placeholder:text-gray-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
          <button
            type="button"
            onClick={() => setTemplates(seedTemplates())}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-black text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            刷新
          </button>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={openCreateTemplate}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-2 text-xs font-black text-white shadow-sm hover:bg-teal-700"
          >
            <Plus className="h-3.5 w-3.5" />
            新增参数模板
          </button>
          {selectedIds.size > 0 && (
            <>
              <button
                type="button"
                onClick={() => batchToggleEnabled(true)}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-green-200 bg-white px-3 py-2 text-xs font-black text-green-800 hover:bg-green-50"
              >
                <CheckCircle className="h-3.5 w-3.5" />
                批量启用
              </button>
              <button
                type="button"
                onClick={() => batchToggleEnabled(false)}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs font-black text-amber-800 hover:bg-amber-50"
              >
                <Ban className="h-3.5 w-3.5" />
                批量禁用
              </button>
              <button
                type="button"
                onClick={batchDelete}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-black text-red-800 hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                批量删除
              </button>
            </>
          )}
        </div>
      </div>

      {/* 表格列表 */}
      <div className="overflow-hidden rounded-xl border border-gray-200">
        <table className="w-full min-w-[720px] text-left text-xs">
          <thead className="border-b border-gray-100 bg-gray-50 text-[10px] font-black uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-3 py-2.5" style={{ width: 40 }}>
                <input
                  type="checkbox"
                  checked={filteredTemplates.length > 0 && selectedIds.size === filteredTemplates.length}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
              </th>
              <th className="px-3 py-2.5">序号</th>
              <th className="px-3 py-2.5">参数模板名称</th>
              <th className="px-3 py-2.5">绑定的二级分类</th>
              <th className="px-3 py-2.5">参数项数量</th>
              <th className="px-3 py-2.5">启用状态</th>
              <th className="px-3 py-2.5">创建时间</th>
              <th className="px-3 py-2.5 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="font-bold text-gray-800">
            {filteredTemplates.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-10 text-center text-gray-400">
                  暂无参数模板，点击「新增参数模板」开始配置
                </td>
              </tr>
            ) : (
              filteredTemplates.map((tpl, idx) => (
                <tr
                  key={tpl.id}
                  className="border-b border-gray-50 bg-white last:border-0 hover:bg-gray-50/80"
                >
                  <td className="px-3 py-2.5">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(tpl.id)}
                      onChange={() => toggleSelect(tpl.id)}
                      className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                  </td>
                  <td className="px-3 py-2.5 tabular-nums text-gray-500">{idx + 1}</td>
                  <td className="px-3 py-2.5">{tpl.name}</td>
                  <td className="px-3 py-2.5">
                    <span className="inline-flex items-center gap-1 rounded-full border border-teal-200 bg-teal-50 px-2 py-0.5 text-[10px] font-black text-teal-800">
                      {getCategoryName(tpl.categoryId)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 tabular-nums">{tpl.items.length}</td>
                  <td className="px-3 py-2.5">
                    <StatusBadge enabled={tpl.enabled} />
                  </td>
                  <td className="px-3 py-2.5 text-gray-500 tabular-nums">{tpl.createdAt}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right">
                    <span className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openParamEditor(tpl)}
                        className="rounded-lg border border-sky-200 bg-white px-2 py-1 text-[11px] font-black text-sky-700 hover:bg-sky-50"
                        title="编辑参数项"
                      >
                        编辑参数
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditTemplate(tpl)}
                        className="rounded-lg border border-teal-200 bg-white px-2 py-1 text-[11px] font-black text-teal-800 hover:bg-teal-50"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleTemplateEnabled(tpl)}
                        className={cn(
                          'rounded-lg border px-2 py-1 text-[11px] font-black hover:bg-gray-50',
                          tpl.enabled
                            ? 'border-amber-200 text-amber-700 hover:bg-amber-50'
                            : 'border-green-200 text-green-700 hover:bg-green-50'
                        )}
                        title={tpl.enabled ? '禁用' : '启用'}
                      >
                        {tpl.enabled ? <Ban className="h-3.5 w-3.5" /> : <CheckCircle className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTemplate(tpl)}
                        className="rounded-lg border border-red-200 bg-white px-2 py-1 text-[11px] font-black text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 新增 / 编辑模板弹窗 */}
      <AnimatePresence>
        {templateModalOpen ? (
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
              onClick={closeTemplateModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-xl sm:p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-black text-gray-900">
                  {editingTemplate ? '编辑参数模板' : '新增参数模板'}
                </h3>
                <button
                  type="button"
                  onClick={closeTemplateModal}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
                  aria-label="关闭"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleTemplateSubmit} className="mt-4 space-y-4">
                <label className="block text-xs font-black text-gray-700">
                  模板名称 <span className="text-red-500">*</span>
                  <input
                    type="text"
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm((f) => ({ ...f, name: e.target.value }))}
                    className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-bold text-gray-900 outline-none ring-teal-500/30 focus:border-teal-400 focus:ring-2"
                    placeholder="如：冷却塔参数模板"
                    maxLength={80}
                  />
                </label>

                <label className="block text-xs font-black text-gray-700">
                  绑定二级分类 <span className="text-red-500">*</span>
                  <select
                    value={templateForm.categoryId}
                    onChange={(e) => setTemplateForm((f) => ({ ...f, categoryId: e.target.value }))}
                    className="mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-900 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/30"
                  >
                    <option value="">— 请选择 —</option>
                    {secondLevelCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>

                {templateFormError ? (
                  <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-[11px] font-bold text-red-700">
                    {templateFormError}
                  </p>
                ) : null}

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={closeTemplateModal}
                    className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-black text-gray-600 hover:bg-gray-50"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-teal-600 py-2.5 text-sm font-black text-white hover:bg-teal-700"
                  >
                    {editingTemplate ? '保存' : '创建'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* 参数项编辑弹窗 */}
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
              className="relative flex w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl"
              style={{ maxHeight: '85vh' }}
            >
              {/* Header */}
              <div className="flex shrink-0 items-start justify-between gap-3 border-b border-gray-100 px-5 py-4 sm:px-6">
                <div>
                  <h3 className="text-base font-black text-gray-900">编辑参数项</h3>
                  <p className="mt-1 text-[11px] font-bold text-gray-400">
                    当前模板：
                    {templates.find((t) => t.id === currentTemplateId)?.name ?? ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeParamModal}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
                  aria-label="关闭"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* 参数项列表 */}
              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
                {currentTemplateItems.length === 0 ? (
                  <p className="py-10 text-center text-xs font-bold text-gray-400">
                    暂无参数项，点击「添加参数项」开始配置
                  </p>
                ) : (
                  <div className="space-y-2">
                    {[...currentTemplateItems]
                      .sort((a, b) => a.sort - b.sort)
                      .map((item, idx) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50/60 px-3 py-2.5"
                        >
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gray-200 text-[10px] font-black text-gray-500">
                            {idx + 1}
                          </span>
                          <GripVertical className="h-4 w-4 shrink-0 text-gray-300" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-bold text-gray-800">{item.name}</p>
                            <p className="truncate text-[10px] font-bold text-gray-400">
                              占位：{item.placeholder || '无'}
                            </p>
                          </div>
                          <span
                            className={cn(
                              'shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-black',
                              item.required
                                ? 'border-red-200 bg-red-50 text-red-700'
                                : 'border-gray-200 bg-gray-100 text-gray-500'
                            )}
                          >
                            {item.required ? '必填' : '选填'}
                          </span>
                          <span className="shrink-0 text-[10px] font-black text-gray-400 tabular-nums">
                            排序 {item.sort}
                          </span>
                          <span className="inline-flex shrink-0 items-center gap-1">
                            <button
                              type="button"
                              onClick={() => moveParamItem(item.id, 'up')}
                              className="rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-black text-gray-600 hover:bg-gray-50"
                              title="上移"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              onClick={() => moveParamItem(item.id, 'down')}
                              className="rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-black text-gray-600 hover:bg-gray-50"
                              title="下移"
                            >
                              ↓
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditParam(item)}
                              className="rounded border border-teal-200 bg-white px-1.5 py-0.5 text-[10px] font-black text-teal-700 hover:bg-teal-50"
                            >
                              编辑
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteParamItem(item)}
                              className="rounded border border-red-200 bg-white px-1.5 py-0.5 text-[10px] font-black text-red-700 hover:bg-red-50"
                            >
                              删除
                            </button>
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* 添加 / 编辑参数项表单 */}
              <div className="shrink-0 border-t border-gray-100 px-5 py-4 sm:px-6">
                <form onSubmit={handleParamSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="block text-xs font-black text-gray-700">
                      参数名称 <span className="text-red-500">*</span>
                      <input
                        type="text"
                        value={paramForm.name}
                        onChange={(e) => setParamForm((f) => ({ ...f, name: e.target.value }))}
                        className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-bold text-gray-900 outline-none ring-teal-500/30 focus:border-teal-400 focus:ring-2"
                        placeholder="如：冷却塔类型"
                        maxLength={60}
                      />
                    </label>
                    <label className="block text-xs font-black text-gray-700">
                      占位提示文字
                      <input
                        type="text"
                        value={paramForm.placeholder}
                        onChange={(e) => setParamForm((f) => ({ ...f, placeholder: e.target.value }))}
                        className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-bold text-gray-900 outline-none ring-teal-500/30 focus:border-teal-400 focus:ring-2"
                        placeholder="如：请输入xxx"
                        maxLength={100}
                      />
                    </label>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-xs font-black text-gray-700">
                      <input
                        type="checkbox"
                        checked={paramForm.required}
                        onChange={(e) => setParamForm((f) => ({ ...f, required: e.target.checked }))}
                        className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                      />
                      必填
                    </label>
                    <label className="block text-xs font-black text-gray-700">
                      排序号
                      <input
                        type="number"
                        value={paramForm.sort}
                        onChange={(e) => setParamForm((f) => ({ ...f, sort: e.target.value }))}
                        className="mt-1.5 w-24 rounded-lg border border-gray-200 px-3 py-2 text-sm font-bold text-gray-900 outline-none ring-teal-500/30 focus:border-teal-400 focus:ring-2"
                        min={0}
                        step={1}
                      />
                    </label>
                  </div>
                  {paramFormError ? (
                    <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-[11px] font-bold text-red-700">
                      {paramFormError}
                    </p>
                  ) : null}
                  <div className="flex gap-2 pt-1">
                    <button
                      type="submit"
                      className="rounded-xl bg-teal-600 px-6 py-2.5 text-sm font-black text-white hover:bg-teal-700"
                    >
                      {editingParam ? '保存修改' : '添加参数项'}
                    </button>
                    {editingParam && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingParam(null);
                          setParamForm(EMPTY_PARAM_FORM);
                          setParamFormError(null);
                        }}
                        className="rounded-xl border border-gray-200 px-6 py-2.5 text-sm font-black text-gray-600 hover:bg-gray-50"
                      >
                        取消编辑
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Footer */}
              <div className="flex shrink-0 items-center justify-end gap-2 border-t border-gray-100 px-5 py-3 sm:px-6">
                <button
                  type="button"
                  onClick={closeParamModal}
                  className="rounded-xl border border-gray-200 px-6 py-2.5 text-sm font-black text-gray-600 hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={saveParamItems}
                  className="rounded-xl bg-teal-600 px-6 py-2.5 text-sm font-black text-white hover:bg-teal-700"
                >
                  保存模板
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