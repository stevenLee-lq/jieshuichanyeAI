import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Image, Plus, X, ChevronRight, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { APPLICATION_FIELD_OPTIONS, CATEGORIES_HIERARCHY, PRODUCTS } from './data';
import { formatApplicationFieldsList, normalizeApplicationFields } from './workbenchApplicationFields';
import {
  resolveWorkbenchProductParamTemplate,
  WATER_SAVING_SUB_CATEGORIES,
  type ParamTemplateGroup,
  type WaterSavingSubCategory,
} from './productWorkbenchCatalog';
import { WaterSavingProductCategoryField } from './WaterSavingProductCategoryField';
import {
  parseWorkbenchPortalProductId,
  upsertProductSupplyMetaFromWorkbench,
} from './portalProductSupplyMeta';
import {
  useWorkbenchListQueryPair,
  WorkbenchListQueryActions,
  WorkbenchListQueryBar,
  WorkbenchListQueryField,
  WorkbenchListQueryInput,
  WorkbenchListQuerySelect,
} from './workbenchListQuery';
import {
  countWorkbenchStarProducts,
  deleteWorkbenchProduct,
  MAX_STAR_PRODUCTS,
  upsertWorkbenchProduct,
  useWorkbenchProducts,
  type WorkbenchManagedProduct,
} from './workbenchProductsStore';
import { useWorkbenchEnterprises } from './workbenchEnterpriseStore';

export type { WorkbenchManagedProduct } from './workbenchProductsStore';

function resolveSupplierEnterprise(row: WorkbenchManagedProduct): string {
  const direct = row.supplierEnterprise?.trim();
  if (direct) return direct;
  const portalId = parseWorkbenchPortalProductId(row.id);
  if (portalId != null) {
    return PRODUCTS.find((p) => p.id === portalId)?.supplier?.trim() ?? '';
  }
  return '';
}

const MAX_PRODUCT_IMAGES = 2;
const MAX_PRODUCT_INTRO_LENGTH = 500;

const ALL_SUB_CATEGORIES = WATER_SAVING_SUB_CATEGORIES;

/** 产品管理条件查询：应用领域（含「全部」） */
const PRODUCT_QUERY_APPLICATION_OPTIONS = ['全部', ...APPLICATION_FIELD_OPTIONS] as const;

function parseApplicationFields(raw: string): string[] {
  return normalizeApplicationFields(raw ? [raw] : []);
}

function subIdToTopId(subId: string): string {
  const sub = ALL_SUB_CATEGORIES.find((s) => s.subId === subId);
  return sub?.topId ?? subId.split('::')[0] ?? '';
}

function normalizeProductImages(row: Pick<WorkbenchManagedProduct, 'image' | 'images'>): string[] {
  if (row.images?.length) return row.images.filter(Boolean).slice(0, MAX_PRODUCT_IMAGES);
  return row.image ? [row.image] : [];
}

type WorkbenchProductFormState = {
  name: string;
  supplierEnterprise: string;
  productIntro: string;
  topCategoryId: string;
  industryCategory: string;
  applicationFields: string[];
  images: string[];
  paramValues: Record<string, string>;
  isStarProduct: boolean;
};

function buildFormEmpty(subCategoryId?: string): WorkbenchProductFormState {
  const sub = subCategoryId
    ? ALL_SUB_CATEGORIES.find((s) => s.subId === subCategoryId)
    : ALL_SUB_CATEGORIES[0];
  return {
    name: '',
    supplierEnterprise: '',
    productIntro: '',
    topCategoryId: sub?.topId ?? CATEGORIES_HIERARCHY[0]?.id ?? '',
    industryCategory: sub?.subId ?? '',
    applicationFields: [],
    images: [],
    paramValues: {},
    isStarProduct: false,
  };
}

function readImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('请上传图片文件（JPG、PNG 等）'));
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      reject(new Error('图片大小不超过 4MB'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('图片读取失败，请重试'));
    reader.readAsDataURL(file);
  });
}

/* ── 树节点类型 ── */
type TreeNode = {
  topId: string;
  topName: string;
  subs: WaterSavingSubCategory[];
};

/** 工作台「产品管理」：左树右产品，选择二级分类后带出参数模板表单 */
export function WorkbenchProductAdminPanel() {
  const products = useWorkbenchProducts();
  const enterprises = useWorkbenchEnterprises();
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
  const [expandedTops, setExpandedTops] = useState<Set<string>>(new Set([CATEGORIES_HIERARCHY[0]?.id ?? '']));
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<WorkbenchProductFormState>(buildFormEmpty());
  const [formError, setFormError] = useState<string | null>(null);
  const [imageUploadingSlot, setImageUploadingSlot] = useState<number | null>(null);
  const { draft, patchDraft, applied, applySearch, resetSearch } = useWorkbenchListQueryPair({
    name: '',
    supplier: '全部',
    application: '全部',
    star: '全部',
  });

  const supplierEnterpriseOptions = useMemo(() => {
    const fromEnterprises = enterprises
      .filter((e) => e.auditStatus === '已通过')
      .map((e) => e.name.trim())
      .filter(Boolean);
    const fromProducts = products.map((p) => resolveSupplierEnterprise(p)).filter(Boolean);
    return [...new Set([...fromEnterprises, ...fromProducts])].sort((a, b) =>
      a.localeCompare(b, 'zh-CN')
    );
  }, [enterprises, products]);

  const supplierQueryOptions = useMemo(
    () => ['全部', ...supplierEnterpriseOptions] as const,
    [supplierEnterpriseOptions]
  );
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pendingImageSlotRef = useRef(0);

  /* ── 树构建 ── */
  const tree = useMemo<TreeNode[]>(() => {
    const map = new Map<string, WaterSavingSubCategory[]>();
    for (const sub of ALL_SUB_CATEGORIES) {
      const list = map.get(sub.topId) ?? [];
      list.push(sub);
      map.set(sub.topId, list);
    }
    return CATEGORIES_HIERARCHY.map((top) => ({
      topId: top.id,
      topName: top.name,
      subs: map.get(top.id) ?? [],
    }));
  }, []);

  const selectedSub = useMemo(() => ALL_SUB_CATEGORIES.find((s) => s.subId === selectedSubId) ?? null, [selectedSubId]);

  /* ── 当前分类下的产品 ── */
  const filteredProducts = useMemo(() => {
    const starFilter = applied.star as '全部' | '是' | '否';
    const nameQ = applied.name.trim().toLowerCase();
    const appFilter = applied.application;
    const supplierFilter = applied.supplier;
    return products.filter((p) => {
      if (selectedSubId && p.industryCategory !== selectedSubId) return false;
      if (starFilter === '是' && !p.isStarProduct) return false;
      if (starFilter === '否' && p.isStarProduct) return false;
      if (nameQ && !p.name.toLowerCase().includes(nameQ)) return false;
      if (supplierFilter && supplierFilter !== '全部') {
        if (resolveSupplierEnterprise(p) !== supplierFilter) return false;
      }
      if (appFilter && appFilter !== '全部') {
        const fields = p.applicationFields?.length
          ? p.applicationFields
          : parseApplicationFields(p.applicationField);
        if (!fields.includes(appFilter)) return false;
      }
      return true;
    });
  }, [applied, products, selectedSubId]);

  const handleSearch = useCallback(() => {
    applySearch();
  }, [applySearch]);

  const handleReset = useCallback(() => {
    resetSearch();
  }, [resetSearch]);

  /* ── 弹窗内：按所选二级分类带出参数模板 ── */
  const formParamTemplate = useMemo<ParamTemplateGroup[]>(
    () => resolveWorkbenchProductParamTemplate(form.industryCategory),
    [form.industryCategory]
  );

  const starProductOthersCount = useMemo(
    () => countWorkbenchStarProducts(editingId ?? undefined),
    [products, editingId]
  );
  const starProductAtLimit = starProductOthersCount >= MAX_STAR_PRODUCTS;
  const starProductDisplayCount = starProductOthersCount + (form.isStarProduct ? 1 : 0);

  const trySetStarProduct = useCallback(
    (wantStar: boolean) => {
      if (!wantStar) {
        setForm((f) => ({ ...f, isStarProduct: false }));
        setFormError(null);
        return;
      }
      const count = countWorkbenchStarProducts(editingId ?? undefined);
      const alreadyStar = form.isStarProduct;
      if (!alreadyStar && count >= MAX_STAR_PRODUCTS) {
        setFormError(`明星产品最多 ${MAX_STAR_PRODUCTS} 个，请先取消其他产品的明星标记`);
        return;
      }
      setForm((f) => ({ ...f, isStarProduct: true }));
      setFormError(null);
    },
    [editingId, form.isStarProduct]
  );

  /* ── 弹窗操作 ── */
  const openCreate = useCallback(() => {
    const subId = selectedSubId ?? ALL_SUB_CATEGORIES[0]?.subId ?? '';
    setEditingId(null);
    setForm(buildFormEmpty(subId));
    setFormError(null);
    setModalOpen(true);
  }, [selectedSubId]);

  const openEdit = useCallback((row: WorkbenchManagedProduct) => {
    setEditingId(row.id);
    setForm({
      name: row.name,
      supplierEnterprise: resolveSupplierEnterprise(row),
      productIntro:
        row.productIntro?.trim() ||
        row.paramValues['产品简介']?.trim() ||
        row.paramValues['产品说明']?.trim() ||
        '',
      topCategoryId: subIdToTopId(row.industryCategory),
      industryCategory: row.industryCategory,
      applicationFields: row.applicationFields?.length
        ? [...row.applicationFields]
        : parseApplicationFields(row.applicationField),
      images: normalizeProductImages(row),
      paramValues: { ...row.paramValues },
      isStarProduct: row.isStarProduct,
    });
    setFormError(null);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingId(null);
    setFormError(null);
  }, []);

  const handleDelete = useCallback((row: WorkbenchManagedProduct) => {
    if (!window.confirm(`确定删除产品「${row.name}」？`)) return;
    deleteWorkbenchProduct(row.id);
  }, []);

  const handleFormTopCategoryChange = useCallback((topId: string) => {
    setForm((f) => ({
      ...f,
      topCategoryId: topId,
      industryCategory: '',
      paramValues: {},
    }));
  }, []);

  const handleFormSubCategoryChange = useCallback((subId: string) => {
    const sub = ALL_SUB_CATEGORIES.find((s) => s.subId === subId);
    setForm((f) => ({
      ...f,
      topCategoryId: sub?.topId ?? f.topCategoryId,
      industryCategory: subId,
      paramValues: {},
    }));
  }, []);

  const toggleApplicationField = useCallback((field: string) => {
    setForm((f) => ({
      ...f,
      applicationFields: f.applicationFields.includes(field)
        ? f.applicationFields.filter((x) => x !== field)
        : [...f.applicationFields, field],
    }));
  }, []);

  const triggerImagePick = useCallback((slot: number) => {
    pendingImageSlotRef.current = slot;
    imageInputRef.current?.click();
  }, []);

  const handleImagePick = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const slot = pendingImageSlotRef.current;
    setImageUploadingSlot(slot);
    setFormError(null);
    try {
      const dataUrl = await readImageFile(file);
      setForm((f) => {
        const next = [...f.images];
        while (next.length <= slot) next.push('');
        next[slot] = dataUrl;
        return { ...f, images: next.slice(0, MAX_PRODUCT_IMAGES) };
      });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : '图片上传失败');
    } finally {
      setImageUploadingSlot(null);
    }
  }, []);

  const removeImageAt = useCallback((slot: number) => {
    setForm((f) => ({
      ...f,
      images: f.images.filter((_, i) => i !== slot),
    }));
  }, []);

  /* ── 表单校验 ── */
  const validateForm = useCallback((): string | null => {
    if (!form.name.trim()) return '请填写产品名称';
    if (!form.supplierEnterprise.trim()) return '请选择供方企业';
    if (!form.productIntro.trim()) return '请填写产品简介';
    if (form.productIntro.trim().length > MAX_PRODUCT_INTRO_LENGTH) {
      return `产品简介不超过 ${MAX_PRODUCT_INTRO_LENGTH} 字`;
    }
    if (!form.industryCategory) return '请选择节水产品分类';
    if (form.isStarProduct && !editingId && starProductAtLimit) {
      return `明星产品最多 ${MAX_STAR_PRODUCTS} 个`;
    }
    if (form.isStarProduct && editingId) {
      const count = countWorkbenchStarProducts(editingId);
      if (count >= MAX_STAR_PRODUCTS) return `明星产品最多 ${MAX_STAR_PRODUCTS} 个`;
    }
    if (form.applicationFields.length === 0) return '请至少选择一个应用领域';
    const uploadedImages = form.images.filter(Boolean);
    if (uploadedImages.length === 0) return '请至少上传 1 张产品图片';
    const tpl = resolveWorkbenchProductParamTemplate(form.industryCategory);
    for (const group of tpl) {
      for (const item of group.items) {
        if (item.required && !form.paramValues[item.name]?.trim()) {
          return `请填写必填参数「${item.name}」`;
        }
      }
    }
    return null;
  }, [form, editingId, starProductAtLimit]);

  /* ── 提交 ── */
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const err = validateForm();
      if (err) {
        setFormError(err);
        return;
      }
      const uploadedImages = form.images.filter(Boolean);
      const applicationField = formatApplicationFieldsList(form.applicationFields);
      const intro = form.productIntro.trim();
      const paramValues = { ...form.paramValues };
      if (intro) paramValues['产品简介'] = intro;
      const payload: WorkbenchManagedProduct = {
        id: editingId ?? `wb-${Date.now()}`,
        name: form.name.trim(),
        supplierEnterprise: form.supplierEnterprise.trim(),
        productIntro: intro,
        industryCategory: form.industryCategory,
        applicationField,
        applicationFields: [...form.applicationFields],
        image: uploadedImages[0] ?? '',
        images: uploadedImages,
        paramValues,
        isStarProduct: form.isStarProduct,
      };
      upsertWorkbenchProduct(payload);
      const portalId = parseWorkbenchPortalProductId(payload.id);
      if (portalId != null) {
        upsertProductSupplyMetaFromWorkbench({
          portalProductId: portalId,
          industryCategorySubId: payload.industryCategory,
          applicationField: payload.applicationField,
          paramValues: payload.paramValues,
          supplierEnterprise: payload.supplierEnterprise,
        });
      }
      closeModal();
    },
    [form, editingId, validateForm, closeModal]
  );

  /* ── 展开/折叠 ── */
  const toggleExpand = useCallback((topId: string) => {
    setExpandedTops((prev) => {
      const next = new Set(prev);
      if (next.has(topId)) next.delete(topId);
      else next.add(topId);
      return next;
    });
  }, []);

  /* ── 渲染参数展示文本 ── */
  function renderParamValues(row: WorkbenchManagedProduct): string {
    const tpl = resolveWorkbenchProductParamTemplate(row.industryCategory);
    const parts: string[] = [];
    for (const group of tpl) {
      for (const item of group.items) {
        const val = row.paramValues[item.name];
        if (val) parts.push(val);
      }
    }
    // 兼容旧格式
    if (parts.length === 0 && (row as any).parameters) return (row as any).parameters;
    return parts.join(' | ') || '—';
  }

  return (
    <div className="flex h-full min-h-[560px] gap-4">
      {/* 左侧：树形分类 */}
      <div className="flex w-72 shrink-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="shrink-0 border-b border-gray-100 bg-gray-50 px-3 py-3">
          <p className="text-[11px] font-black text-gray-600">节水产品分类</p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
          {tree.map(({ topId, topName, subs }) => {
            const isExpanded = expandedTops.has(topId);
            return (
              <div key={topId}>
                <div
                  className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 cursor-pointer hover:bg-gray-50"
                  onClick={() => subs.length > 0 && toggleExpand(topId)}
                >
                  {subs.length > 0 ? (
                    <span className="shrink-0 text-gray-400">
                      {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                    </span>
                  ) : (
                    <span className="h-3.5 w-3.5 shrink-0" />
                  )}
                  <span className="h-2 w-2 shrink-0 rounded-full bg-teal-500" />
                  <span className="truncate text-xs font-bold text-gray-800">{topName}</span>
                </div>
                <AnimatePresence>
                  {isExpanded && subs.length > 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden"
                    >
                      {subs.map((sub) => (
                        <div
                          key={sub.subId}
                          className={cn(
                            'flex items-center gap-1.5 rounded-lg pl-6 pr-2 py-1.5 cursor-pointer hover:bg-teal-50/50',
                            selectedSubId === sub.subId && 'bg-teal-100'
                          )}
                          onClick={() => setSelectedSubId(sub.subId)}
                        >
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400" />
                          <span className="truncate text-xs font-bold text-gray-700">{sub.subName}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* 右侧：产品列表 */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="shrink-0 flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <h3 className="text-sm font-black text-gray-900">
            {selectedSub ? `${selectedSub.topName} / ${selectedSub.subName}` : '产品管理'}
          </h3>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-black text-white hover:bg-teal-700"
          >
            <Plus className="h-3.5 w-3.5" />
            新增产品
          </button>
        </div>

        <WorkbenchListQueryBar className="mx-4 mt-3 shrink-0">
          <WorkbenchListQueryField label="产品名称">
            <WorkbenchListQueryInput
              value={draft.name}
              onChange={(v) => patchDraft({ name: v })}
              placeholder="名称关键词"
            />
          </WorkbenchListQueryField>
          <WorkbenchListQueryField label="供方企业">
            <WorkbenchListQuerySelect
              value={draft.supplier}
              onChange={(v) => patchDraft({ supplier: v })}
              options={supplierQueryOptions}
              ariaLabel="供方企业"
              className="min-w-[10rem]"
            />
          </WorkbenchListQueryField>
          <WorkbenchListQueryField label="应用领域">
            <WorkbenchListQuerySelect
              value={draft.application}
              onChange={(v) => patchDraft({ application: v })}
              options={PRODUCT_QUERY_APPLICATION_OPTIONS}
              ariaLabel="应用领域"
            />
          </WorkbenchListQueryField>
          <WorkbenchListQueryField label="明星产品">
            <WorkbenchListQuerySelect
              value={draft.star}
              onChange={(v) => patchDraft({ star: v })}
              options={['全部', '是', '否']}
            />
          </WorkbenchListQueryField>
          <WorkbenchListQueryActions onSearch={handleSearch} onReset={handleReset} />
        </WorkbenchListQueryBar>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                <Image className="h-6 w-6" />
              </div>
              <p className="text-xs font-bold text-gray-400">暂无产品</p>
              <p className="mt-1 text-[11px] font-bold text-gray-300">点击「新增产品」开始添加</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full min-w-[640px] text-left text-xs">
                <thead className="border-b border-gray-100 bg-gray-50 text-[10px] font-black uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-3 py-2.5">图片</th>
                    <th className="px-3 py-2.5">产品名称</th>
                    <th className="px-3 py-2.5">供方企业</th>
                    <th className="px-3 py-2.5">应用领域</th>
                    <th className="px-3 py-2.5">产品参数</th>
                    <th className="px-3 py-2.5">是否明星产品</th>
                    <th className="px-3 py-2.5 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="font-bold text-gray-800">
                  {filteredProducts.map((row) => (
                    <tr key={row.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/80">
                      <td className="px-3 py-2.5">
                        <div className="flex gap-1">
                          {normalizeProductImages(row).slice(0, 2).map((img, idx) => (
                            <div
                              key={`${row.id}-img-${idx}`}
                              className="h-10 w-10 overflow-hidden rounded-lg border border-gray-100 bg-gray-50"
                            >
                              <img src={img} alt="" className="h-full w-full object-cover" />
                            </div>
                          ))}
                          {normalizeProductImages(row).length === 0 ? (
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-100 bg-gray-50 text-gray-300">
                              <Image className="h-4 w-4" />
                            </div>
                          ) : null}
                        </div>
                      </td>
                      <td className="max-w-[10rem] truncate px-3 py-2.5">{row.name}</td>
                      <td className="max-w-[10rem] truncate px-3 py-2.5 text-gray-600">
                        {resolveSupplierEnterprise(row) || '—'}
                      </td>
                      <td className="max-w-[10rem] truncate px-3 py-2.5 text-gray-600">
                        {row.applicationFields?.length
                          ? formatApplicationFieldsList(row.applicationFields)
                          : row.applicationField}
                      </td>
                      <td className="max-w-[14rem] truncate px-3 py-2.5 text-gray-500">{renderParamValues(row)}</td>
                      <td className="whitespace-nowrap px-3 py-2.5">
                        <span
                          className={cn(
                            'inline-block rounded-md border px-2 py-0.5 text-[10px] font-black',
                            row.isStarProduct
                              ? 'border-amber-200 bg-amber-50 text-amber-900'
                              : 'border-gray-200 bg-gray-50 text-gray-500'
                          )}
                        >
                          {row.isStarProduct ? '是' : '否'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => openEdit(row)}
                          className="mr-1.5 rounded-lg border border-teal-200 bg-white px-2.5 py-1 text-[11px] font-black text-teal-800 hover:bg-teal-50"
                        >
                          编辑
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(row)}
                          className="rounded-lg border border-red-200 bg-white px-2.5 py-1 text-[11px] font-black text-red-700 hover:bg-red-50"
                        >
                          删除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── 新增/编辑弹窗 ── */}
      <AnimatePresence>
        {modalOpen ? (
          <motion.div
            className="fixed inset-0 z-[120] overflow-y-auto p-4 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="workbench-product-form-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <button
              type="button"
              className="fixed inset-0 bg-gray-900/45 backdrop-blur-[2px]"
              aria-label="关闭"
              onClick={closeModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative z-10 mx-auto my-4 w-full max-w-3xl rounded-2xl border border-gray-200 bg-white p-5 shadow-xl sm:my-8 sm:p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 id="workbench-product-form-title" className="text-base font-black text-gray-900">
                  {editingId ? '编辑产品' : '新增产品'}
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
                {/* 产品名称 */}
                <label className="block text-xs font-black text-gray-700">
                  产品名称 <span className="text-red-500">*</span>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-bold text-gray-900 outline-none ring-teal-500/30 focus:border-teal-400 focus:ring-2"
                    placeholder="请输入产品名称"
                    maxLength={120}
                  />
                </label>

                <label className="block text-xs font-black text-gray-700">
                  供方企业 <span className="text-red-500">*</span>
                  <select
                    value={form.supplierEnterprise}
                    onChange={(e) => setForm((f) => ({ ...f, supplierEnterprise: e.target.value }))}
                    className="mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-900 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/30"
                  >
                    <option value="">请选择供方企业</option>
                    {supplierEnterpriseOptions.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                  {supplierEnterpriseOptions.length === 0 ? (
                    <p className="mt-1 text-[10px] font-bold text-amber-700">
                      暂无已通过审核的企业，请先在「企业管理」中审核通过供方企业。
                    </p>
                  ) : null}
                </label>

                <label className="block text-xs font-black text-gray-700">
                  产品简介 <span className="text-red-500">*</span>
                  <textarea
                    value={form.productIntro}
                    onChange={(e) => setForm((f) => ({ ...f, productIntro: e.target.value }))}
                    rows={4}
                    maxLength={MAX_PRODUCT_INTRO_LENGTH}
                    placeholder="请填写产品简介，用于供应详情展示"
                    className="mt-1.5 w-full resize-y rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium leading-relaxed text-gray-900 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/30"
                  />
                  <p className="mt-1 text-right text-[10px] font-bold text-gray-400">
                    {form.productIntro.length}/{MAX_PRODUCT_INTRO_LENGTH} 字
                  </p>
                </label>

                <fieldset className="block rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-3">
                  <legend className="px-1 text-xs font-black text-gray-700">是否明星产品</legend>
                  <div className="mt-1 flex flex-wrap gap-4">
                    <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-gray-800">
                      <input
                        type="radio"
                        name="isStarProduct"
                        checked={form.isStarProduct === true}
                        onChange={() => trySetStarProduct(true)}
                        disabled={!form.isStarProduct && starProductAtLimit}
                        className="h-4 w-4 shrink-0 cursor-pointer appearance-none rounded-full border-2 border-gray-300 bg-white transition checked:border-teal-600 checked:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40"
                      />
                      是
                    </label>
                    <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-gray-800">
                      <input
                        type="radio"
                        name="isStarProduct"
                        checked={form.isStarProduct === false}
                        onChange={() => trySetStarProduct(false)}
                        className="h-4 w-4 shrink-0 cursor-pointer appearance-none rounded-full border-2 border-gray-300 bg-white transition checked:border-teal-600 checked:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:ring-offset-1"
                      />
                      否
                    </label>
                  </div>
                  <p className="mt-2 text-[10px] font-bold leading-relaxed text-gray-500">
                    选择「是」将展示在企业店铺首页；全平台明星产品最多 {MAX_STAR_PRODUCTS} 个
                    {starProductAtLimit && !form.isStarProduct ? (
                      <span className="text-amber-700">（已达上限）</span>
                    ) : null}
                    <span className="text-teal-700">
                      {' '}
                      · 当前 {starProductDisplayCount}/{MAX_STAR_PRODUCTS} 个
                    </span>
                  </p>
                </fieldset>

                <WaterSavingProductCategoryField
                  required
                  topCategoryId={form.topCategoryId}
                  subCategoryId={form.industryCategory}
                  onTopChange={handleFormTopCategoryChange}
                  onSubChange={handleFormSubCategoryChange}
                />

                {/* 应用领域（多选） */}
                <div className="block text-xs font-black text-gray-700">
                  应用领域 <span className="text-red-500">*</span>
                  <span className="ml-1 text-[10px] font-bold text-gray-400">（可多选）</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {APPLICATION_FIELD_OPTIONS.map((opt) => {
                      const active = form.applicationFields.includes(opt);
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => toggleApplicationField(opt)}
                          className={cn(
                            'rounded-full border px-2.5 py-1 text-[11px] font-black transition',
                            active
                              ? 'border-teal-600 bg-teal-50 text-teal-800'
                              : 'border-gray-200 bg-white text-gray-600 hover:border-teal-200'
                          )}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 产品图片（最多 2 张） */}
                <div className="block text-xs font-black text-gray-700">
                  产品图片 <span className="text-red-500">*</span>
                  <span className="ml-1 text-[10px] font-bold text-gray-400">（最多 2 张）</span>
                  <div className="mt-1.5 flex flex-wrap items-start gap-3">
                    {Array.from({ length: MAX_PRODUCT_IMAGES }, (_, slot) => {
                      const img = form.images[slot];
                      const uploading = imageUploadingSlot === slot;
                      return (
                        <div key={slot} className="space-y-1.5">
                          <div className="relative h-20 w-20 overflow-hidden rounded-xl border border-dashed border-gray-200 bg-gray-50">
                            {img ? (
                              <>
                                <span className="absolute left-0.5 top-0.5 z-10 rounded bg-teal-700/90 px-1 py-0.5 text-[8px] font-black text-white">
                                  {slot === 0 ? '封面' : `图${slot + 1}`}
                                </span>
                                <img src={img} alt="" className="h-full w-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => removeImageAt(slot)}
                                  className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-white"
                                  aria-label={`删除图片 ${slot + 1}`}
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </>
                            ) : (
                              <div className="flex h-full w-full flex-col items-center justify-center gap-0.5 text-gray-400">
                                <Image className="h-5 w-5" />
                                <span className="text-[9px] font-bold">
                                  {slot === 0 ? '封面图片' : `图 ${slot + 1}`}
                                </span>
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            disabled={uploading}
                            onClick={() => triggerImagePick(slot)}
                            className="block w-full rounded-lg border border-gray-200 bg-white px-2 py-1 text-[10px] font-black text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                          >
                            {uploading ? '上传中…' : img ? '更换' : '上传'}
                          </button>
                        </div>
                      );
                    })}
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImagePick}
                    />
                  </div>
                  <p className="mt-1 text-[10px] font-bold text-gray-400">支持 JPG/PNG，单张不超过 4MB</p>
                </div>

                {/* 参数模板表单：选定二级分类后统一带出冷却设备参数表 */}
                {form.industryCategory && formParamTemplate.length > 0 ? (
                  <div className="space-y-4">
                    <p className="text-xs font-black text-gray-700">
                      产品参数 <span className="text-red-500">*</span>
                      <span className="ml-1 text-[10px] font-bold text-gray-400">（选择分类后自动带出）</span>
                    </p>
                    {formParamTemplate.map((group) => (
                      <section
                        key={group.name}
                        className="overflow-hidden rounded-xl border border-gray-200/90 bg-white shadow-sm"
                      >
                        <div className="border-b border-teal-100 bg-teal-50/60 px-3 py-2">
                          <h4 className="text-[11px] font-black text-teal-900">{group.name}</h4>
                        </div>
                        <div className="divide-y divide-gray-100 p-3">
                          {group.items
                            .slice()
                            .sort((a, b) => a.sort - b.sort)
                            .map((item) => (
                            <label
                              key={item.name}
                              className="block py-2 text-[11px] font-bold text-gray-700 first:pt-0 last:pb-0"
                            >
                              {item.name}
                              {item.required ? <span className="text-red-500"> *</span> : null}
                              <input
                                type="text"
                                value={form.paramValues[item.name] ?? ''}
                                onChange={(e) =>
                                  setForm((f) => ({
                                    ...f,
                                    paramValues: { ...f.paramValues, [item.name]: e.target.value },
                                  }))
                                }
                                className="mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-900 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/30"
                                placeholder={item.placeholder}
                                maxLength={200}
                              />
                            </label>
                          ))}
                        </div>
                      </section>
                    ))}
                  </div>
                ) : null}

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
                    {editingId ? '保存' : '创建'}
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

/* ── 工具函数 ── */
function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}