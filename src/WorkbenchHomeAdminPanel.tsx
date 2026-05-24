import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  X,
  ChevronLeft,
  Image,
  Eye,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { maskContactPhone } from './portalContactDisplay';
import { PRODUCTS as PORTAL_PRODUCTS } from './data';

/* ── 类型定义 ── */

export type HomeCompanyProfile = {
  industry: string;
  enterpriseScale: string;
  establishedDate: string;
  businessScope: string;
  /** 企业店铺主页顶部背景图 */
  shopBackgroundImage?: string;
};

function readShopBackgroundImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('请上传图片文件（JPG、PNG 等）'));
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      reject(new Error('图片不超过 4MB'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('读取失败'));
    reader.readAsDataURL(file);
  });
}

/** 明星产品（首页展示用，引用自产品管理库） */
export type HomeStarProduct = {
  id: string;
  /** 关联的产品管理产品 ID（portal 产品库） */
  sourceProductId?: number;
  name: string;
  image: string;
  applicableFields: string;
  contactPerson: string;
  contactInfo: string;
  description: string;
  sort: number;
};

/** 产品管理中的产品（用于选择器） */
type PortalProduct = {
  id: number;
  name: string;
  image: string;
  info: string;
  scenario: string;
  category: string;
  supplier: string;
};

const EMPTY_PROFILE: HomeCompanyProfile = {
  industry: '',
  enterpriseScale: '',
  establishedDate: '',
  businessScope: '',
  shopBackgroundImage: '',
};

/* ── 演示数据 ── */

function seedProfile(): HomeCompanyProfile {
  return {
    industry: '智慧农业',
    enterpriseScale: '中型',
    establishedDate: '2009-07-15',
    businessScope:
      '大禹节水为节水产业服务平台认证供方，长期深耕「智慧农业」领域，面向用水单位、园区与工程客户提供设备、方案与运维一体化服务。桁架卷盘与低压喷头组合，均匀度高、能耗低，配套墒情联动可显著降低灌溉定额。',
    shopBackgroundImage: '',
  };
}

/** 将 portal 产品转换为首页明星产品 */
function portalToStarProduct(p: PortalProduct, sort: number): HomeStarProduct {
  return {
    id: `sp-${p.id}`,
    sourceProductId: p.id,
    name: p.name,
    image: p.image,
    applicableFields: p.scenario,
    contactPerson: p.supplier,
    contactInfo: maskContactPhone('13812346688'),
    description: p.info,
    sort,
  };
}

function seedProducts(): HomeStarProduct[] {
  // 默认选一个产品作为明星产品
  const defaultProduct = PORTAL_PRODUCTS.find((p) => p.name.includes('雨水'));
  if (!defaultProduct) return [];
  return [portalToStarProduct(defaultProduct, 1)];
}

/* ── 主组件 ── */

type PanelMode = 'list' | 'form-profile' | 'view-product' | 'picker';

export function WorkbenchHomeAdminPanel() {
  const [profile, setProfile] = useState<HomeCompanyProfile>(seedProfile);
  const [products, setProducts] = useState<HomeStarProduct[]>(seedProducts);
  const [mode, setMode] = useState<PanelMode>('list');
  const [viewingProductId, setViewingProductId] = useState<string | null>(null);

  // 表单状态
  const [profileForm, setProfileForm] = useState<HomeCompanyProfile>(seedProfile);
  const [formError, setFormError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // 产品选择器状态
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerSelectedId, setPickerSelectedId] = useState<number | null>(null);
  const shopBgInputRef = useRef<HTMLInputElement>(null);
  const [shopBgUploading, setShopBgUploading] = useState(false);

  /** 已选中的明星产品对应的 portal ID 集合（用于选择器中禁用已选项） */
  const selectedPortalIds = useMemo(() => {
    const ids = new Set<number>();
    for (const p of products) {
      if (p.sourceProductId != null) {
        ids.add(p.sourceProductId);
      }
    }
    return ids;
  }, [products]);

  /** 选择器中过滤后的产品列表 */
  const filteredPortalProducts = useMemo(() => {
    const kw = pickerSearch.trim().toLowerCase();
    if (!kw) return PORTAL_PRODUCTS;
    return PORTAL_PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(kw) ||
        p.category.toLowerCase().includes(kw) ||
        p.scenario.toLowerCase().includes(kw)
    );
  }, [pickerSearch]);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2500);
  };

  const applyShopBackground = useCallback(
    (dataUrl: string) => {
      setProfile((prev) => ({ ...prev, shopBackgroundImage: dataUrl }));
      setProfileForm((prev) => ({ ...prev, shopBackgroundImage: dataUrl }));
    },
    []
  );

  const handleShopBackgroundPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setShopBgUploading(true);
    try {
      const dataUrl = await readShopBackgroundImage(file);
      applyShopBackground(dataUrl);
      showToast('店铺背景图已更新');
    } catch (err) {
      showToast(err instanceof Error ? err.message : '上传失败');
    } finally {
      setShopBgUploading(false);
    }
  };

  const clearShopBackground = () => {
    applyShopBackground('');
    showToast('已移除店铺背景图');
  };

  const renderShopBackgroundField = (image: string, onPick: () => void) => (
    <div className="flex flex-wrap items-start gap-4">
      <div className="relative h-28 w-full max-w-xl overflow-hidden rounded-lg border border-dashed border-gray-200 bg-gray-50 sm:h-32">
        {image ? (
          <img src={image} alt="店铺背景图预览" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-gray-400">
            <Image className="h-7 w-7" aria-hidden />
            <span className="text-[11px] font-bold">暂未上传背景图</span>
          </div>
        )}
      </div>
      <div className="flex min-w-[10rem] flex-col gap-2">
        <input
          ref={shopBgInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleShopBackgroundPick}
        />
        <button
          type="button"
          disabled={shopBgUploading}
          onClick={onPick}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-black text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          {shopBgUploading ? '上传中…' : image ? '更换背景图' : '上传背景图'}
        </button>
        {image ? (
          <button
            type="button"
            onClick={clearShopBackground}
            className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-[11px] font-black text-red-700 hover:bg-red-50"
          >
            移除
          </button>
        ) : null}
        <p className="text-[10px] font-bold leading-relaxed text-gray-400">
          建议宽屏横图（如 1200×400），JPG/PNG，不超过 4MB；用于企业店铺主页顶部展示。
        </p>
      </div>
    </div>
  );

  /* ── 企业概况 ── */

  const openEditProfile = () => {
    setProfileForm({ ...profile });
    setFormError(null);
    setMode('form-profile');
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.industry.trim()) {
      setFormError('请填写所属行业');
      return;
    }
    if (!profileForm.businessScope.trim()) {
      setFormError('请填写生产经营范围');
      return;
    }
    setProfile({ ...profileForm });
    setMode('list');
    showToast('企业概况已更新');
  };

  /* ── 明星产品 ── */

  const openCreateProduct = () => {
    setPickerSearch('');
    setPickerSelectedId(null);
    setMode('picker');
  };

  const openViewProduct = (p: HomeStarProduct) => {
    setViewingProductId(p.id);
    setMode('view-product');
  };

  /** 在产品选择器中选中一个产品 */
  const handlePickerConfirm = () => {
    if (!pickerSelectedId) return;
    const portalProduct = PORTAL_PRODUCTS.find((p) => p.id === pickerSelectedId);
    if (!portalProduct) return;
    const newProduct = portalToStarProduct(portalProduct, products.length + 1);
    setProducts((prev) => [...prev, newProduct]);
    setMode('list');
    showToast('产品已添加');
  };

  const handleDeleteProduct = (p: HomeStarProduct) => {
    if (!window.confirm(`确定删除产品「${p.name}」？`)) return;
    setProducts((prev) => prev.filter((item) => item.id !== p.id));
    showToast('产品已删除');
  };

  const backToList = () => {
    setMode('list');
    setViewingProductId(null);
    setFormError(null);
  };

  const viewingProduct = products.find((p) => p.id === viewingProductId) ?? null;

  /* ── 渲染：产品选择器 ── */

  if (mode === 'picker') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={backToList}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-black text-gray-700 hover:bg-gray-50"
          >
            <ChevronLeft className="h-4 w-4" />
            返回列表
          </button>
          <h2 className="text-sm font-black text-gray-900">选择产品</h2>
        </div>

        {/* 搜索框 */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={pickerSearch}
            onChange={(e) => setPickerSearch(e.target.value)}
            placeholder="搜索产品名称、分类或应用领域…"
            className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-3 text-sm font-bold text-gray-900 placeholder:text-gray-400 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/30"
          />
        </div>

        {/* 产品列表 */}
        <div className="max-h-[min(60vh,32rem)] overflow-y-auto rounded-xl border border-gray-200 bg-white">
          {filteredPortalProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                <Search className="h-6 w-6" />
              </div>
              <p className="text-xs font-bold text-gray-400">未找到匹配的产品</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredPortalProducts.map((p) => {
                const isSelected = pickerSelectedId === p.id;
                const isAlreadySelected = selectedPortalIds.has(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    disabled={isAlreadySelected && !isSelected}
                    onClick={() => setPickerSelectedId(p.id)}
                    className={cn(
                      'flex w-full items-center gap-4 px-4 py-3 text-left transition-colors',
                      isSelected && 'bg-teal-50',
                      isAlreadySelected && !isSelected && 'cursor-not-allowed opacity-50',
                      !isAlreadySelected && 'hover:bg-gray-50'
                    )}
                  >
                    <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      {p.image ? (
                        <img src={p.image} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-300">
                          <Image className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-gray-900">{p.name}</p>
                      <p className="mt-0.5 truncate text-xs font-bold text-gray-500">{p.category}</p>
                      <p className="mt-0.5 truncate text-[11px] font-bold text-gray-400">{p.scenario}</p>
                    </div>
                    <div className="shrink-0">
                      {isSelected ? (
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-600 text-white">
                          <Check className="h-4 w-4" />
                        </span>
                      ) : isAlreadySelected ? (
                        <span className="rounded-full border border-gray-200 bg-gray-100 px-2 py-0.5 text-[10px] font-black text-gray-400">
                          已选
                        </span>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 底部操作 */}
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={backToList}
            className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-black text-gray-600 hover:bg-gray-50"
          >
            取消
          </button>
          <button
            type="button"
            disabled={!pickerSelectedId}
            onClick={handlePickerConfirm}
            className="flex-1 rounded-xl bg-teal-600 py-2.5 text-sm font-black text-white hover:bg-teal-700 disabled:opacity-50"
          >
            确认添加
          </button>
        </div>
      </div>
    );
  }

  /* ── 渲染：企业概况表单 ── */

  if (mode === 'form-profile') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={backToList}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-black text-gray-700 hover:bg-gray-50"
          >
            <ChevronLeft className="h-4 w-4" />
            返回列表
          </button>
          <h2 className="text-sm font-black text-gray-900">编辑企业概况</h2>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-5">
          <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
              <h3 className="text-sm font-black text-gray-900">店铺背景图</h3>
            </div>
            <div className="p-4 sm:p-5">
              {renderShopBackgroundField(
                profileForm.shopBackgroundImage ?? '',
                () => shopBgInputRef.current?.click()
              )}
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
              <h3 className="text-sm font-black text-gray-900">企业概况</h3>
            </div>
            <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
              <label className="block">
                <span className="text-xs font-black text-gray-700">
                  所属行业 <span className="text-red-500">*</span>
                </span>
                <input
                  type="text"
                  value={profileForm.industry}
                  onChange={(e) => setProfileForm((f) => ({ ...f, industry: e.target.value }))}
                  className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-bold text-gray-900 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/30"
                  placeholder="如：智慧农业"
                />
              </label>

              <label className="block">
                <span className="text-xs font-black text-gray-700">企业规模</span>
                <input
                  type="text"
                  value={profileForm.enterpriseScale}
                  onChange={(e) => setProfileForm((f) => ({ ...f, enterpriseScale: e.target.value }))}
                  className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-bold text-gray-900 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/30"
                  placeholder="如：微型、小型、中型、大型"
                />
              </label>

              <label className="block">
                <span className="text-xs font-black text-gray-700">成立时间</span>
                <input
                  type="date"
                  value={profileForm.establishedDate}
                  onChange={(e) => setProfileForm((f) => ({ ...f, establishedDate: e.target.value }))}
                  className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-bold text-gray-900 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/30"
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="text-xs font-black text-gray-700">
                  生产经营范围 <span className="text-red-500">*</span>
                </span>
                <textarea
                  rows={5}
                  value={profileForm.businessScope}
                  onChange={(e) => setProfileForm((f) => ({ ...f, businessScope: e.target.value }))}
                  className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-bold text-gray-900 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/30"
                  placeholder="请输入生产经营范围"
                />
              </label>
            </div>
          </section>

          {formError ? (
            <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-[11px] font-bold text-red-700">
              {formError}
            </p>
          ) : null}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={backToList}
              className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-black text-gray-600 hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-teal-600 py-2.5 text-sm font-black text-white hover:bg-teal-700"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    );
  }

  /* ── 渲染：产品详情 ── */

  if (mode === 'view-product' && viewingProduct) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={backToList}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-black text-gray-700 hover:bg-gray-50"
          >
            <ChevronLeft className="h-4 w-4" />
            返回列表
          </button>
          <h2 className="text-sm font-black text-gray-900">产品详情</h2>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          {viewingProduct.image && (
            <img
              src={viewingProduct.image}
              alt={viewingProduct.name}
              className="aspect-video w-full object-cover"
            />
          )}
          <div className="p-5">
            <h3 className="text-base font-black text-gray-900">{viewingProduct.name}</h3>
            <div className="mt-4 space-y-3">
              <div className="flex gap-2 text-xs">
                <span className="font-black text-gray-500">适用领域</span>
                <span className="font-bold text-gray-800">{viewingProduct.applicableFields || '—'}</span>
              </div>
              <div className="flex gap-2 text-xs">
                <span className="font-black text-gray-500">产品联系人</span>
                <span className="font-bold text-gray-800">{viewingProduct.contactPerson || '—'}</span>
              </div>
              <div className="flex gap-2 text-xs">
                <span className="font-black text-gray-500">联系方式</span>
                <span className="font-bold text-gray-800">{viewingProduct.contactInfo || '—'}</span>
              </div>
              {viewingProduct.description && (
                <div className="mt-4 text-sm font-medium leading-relaxed text-gray-700">
                  {viewingProduct.description}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    );
  }

  /* ── 渲染：列表 ── */

  return (
    <div className="space-y-4">
      {/* 店铺背景图 */}
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
          <h3 className="text-sm font-black text-gray-900">店铺背景图</h3>
        </div>
        <div className="p-4 sm:p-5">
          {renderShopBackgroundField(profile.shopBackgroundImage ?? '', () => shopBgInputRef.current?.click())}
        </div>
      </section>

      {/* 企业概况 */}
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-3">
          <h3 className="text-sm font-black text-gray-900">企业概况</h3>
          <button
            type="button"
            onClick={openEditProfile}
            className="inline-flex items-center gap-1.5 rounded-lg border border-teal-200 bg-white px-3 py-1.5 text-xs font-black text-teal-800 hover:bg-teal-50"
          >
            <Edit3 className="h-3.5 w-3.5" />
            编辑
          </button>
        </div>
        <div className="grid gap-4 p-4 sm:grid-cols-3 sm:p-5">
          <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-3">
            <p className="text-[10px] font-black uppercase tracking-wide text-gray-400">所属行业</p>
            <p className="mt-1 text-sm font-bold text-gray-900">{profile.industry || '—'}</p>
          </div>
          <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-3">
            <p className="text-[10px] font-black uppercase tracking-wide text-gray-400">企业规模</p>
            <p className="mt-1 text-sm font-bold text-gray-900">{profile.enterpriseScale || '—'}</p>
          </div>
          <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-3">
            <p className="text-[10px] font-black uppercase tracking-wide text-gray-400">成立时间</p>
            <p className="mt-1 text-sm font-bold text-gray-900">{profile.establishedDate || '—'}</p>
          </div>
        </div>
        {profile.businessScope ? (
          <div className="border-t border-gray-100 px-4 pb-4 sm:px-5 sm:pb-5">
            <p className="mb-2 text-[10px] font-black uppercase tracking-wide text-gray-400">生产经营范围</p>
            <p className="text-sm font-medium leading-relaxed text-gray-700">{profile.businessScope}</p>
          </div>
        ) : null}
      </section>

      {/* 明星产品 */}
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-3">
          <h3 className="text-sm font-black text-gray-900">明星产品</h3>
          <button
            type="button"
            onClick={openCreateProduct}
            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-black text-white hover:bg-teal-700"
          >
            <Plus className="h-3.5 w-3.5" />
            新增产品
          </button>
        </div>

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
              <Image className="h-6 w-6" />
            </div>
            <p className="text-xs font-bold text-gray-400">暂无明星产品</p>
            <p className="mt-1 text-[11px] font-bold text-gray-300">点击「新增产品」从产品管理库选择</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {products
              .sort((a, b) => a.sort - b.sort)
              .map((p) => (
                <div key={p.id} className="flex items-center gap-4 px-4 py-4 sm:px-5">
                  <div className="h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-gray-300">
                        <Image className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-gray-900">{p.name}</p>
                    <p className="mt-0.5 truncate text-xs font-bold text-gray-500">
                      {p.applicableFields || '—'}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[11px]">
                      <span className="font-bold text-gray-400">
                        联系人：<span className="text-gray-600">{p.contactPerson || '—'}</span>
                      </span>
                      <span className="font-bold text-gray-400">
                        联系方式：<span className="text-gray-600">{p.contactInfo || '—'}</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openViewProduct(p)}
                      className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-[11px] font-black text-gray-700 hover:bg-gray-50"
                      title="查看"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteProduct(p)}
                      className="rounded-lg border border-red-200 bg-white px-2 py-1 text-[11px] font-black text-red-700 hover:bg-red-50"
                      title="删除"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </section>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-6 left-1/2 z-[130] max-w-md -translate-x-1/2 rounded-xl border border-teal-200 bg-white px-4 py-3 text-xs font-bold text-teal-900 shadow-lg"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}