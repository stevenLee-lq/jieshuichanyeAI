import React, { useCallback, useMemo, useState } from 'react';
import {
  ChevronRight,
  Home,
  Phone,
  RefreshCw,
  Settings,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from './lib/utils';
import type { ProductRecord } from './data';
import { PRODUCTS } from './data';
import type { HomeServiceRecommendation } from './homeServiceRecommendations';
import { ProductFavoriteButton } from './ProductFavoriteButton';
import { orderedParamEntries } from './productWorkbenchCatalog';
import {
  getPortalProductSupplierName,
  getProductSupplyMetaForRecord,
  usePortalProductSupplyMetaVersion,
} from './portalProductSupplyMeta';
import {
  demoSupplierContactPhone,
  maskContactPhone,
} from './portalContactDisplay';
import { recordProductContact } from './portalContactMessagesStore';
import { getSupplierHonorTags } from './portalSupplierHonors';
import { SupplierHonorTags } from './SupplierHonorTags';
import {
  PORTAL_BACK_BUTTON,
  PORTAL_BACK_BUTTON_ICON,
  PORTAL_OUTLINE_BUTTON,
  PORTAL_PAGE_CONTENT,
  PORTAL_PAGE_GRADIENT_BG,
  PORTAL_PANEL,
  PORTAL_PANEL_LG,
  PORTAL_PRIMARY_BUTTON,
  PORTAL_TAB_ACTIVE,
  PORTAL_TAG_PRIMARY,
  PORTAL_TAG_SECONDARY,
} from './portalSurface';

export type ProductSupplyDetailPayload =
  | { kind: 'product'; product: ProductRecord }
  | { kind: 'service'; service: HomeServiceRecommendation };

export function supplyPayloadSupplierName(payload: ProductSupplyDetailPayload): string {
  return payload.kind === 'product'
    ? getPortalProductSupplierName(payload.product)
    : payload.service.entityName;
}

function pickGalleryImages(product: ProductRecord): string[] {
  const sameCat = PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id);
  const extra = sameCat[0]?.image ?? PRODUCTS.find((p) => p.id !== product.id)?.image ?? product.image;
  return [product.image, extra];
}

function serviceGallery(s: HomeServiceRecommendation): string[] {
  const idx = s.id % PRODUCTS.length;
  const a = PRODUCTS[idx]?.image ?? '';
  const b = PRODUCTS[(idx + 3) % PRODUCTS.length]?.image ?? a;
  return [a, b];
}

function guessYouLike(excludeId: number, seed: number): ProductRecord[] {
  const n = PRODUCTS.length;
  if (n === 0) return [];
  const start = (seed * 7 + 11) % n;
  const out: ProductRecord[] = [];
  for (let i = 0; i < n && out.length < 5; i++) {
    const p = PRODUCTS[(start + i) % n]!;
    if (p.id !== excludeId) out.push(p);
  }
  return out.slice(0, 5);
}

export function ProductSupplyDetailPage({
  payload,
  onBack,
  onEnterSupplyMarket,
  onEnterCompanyHome,
  onSelectRelatedProduct,
  showProductFavorite = false,
  revealContactPhone = false,
}: {
  payload: ProductSupplyDetailPayload;
  onBack: () => void;
  onEnterSupplyMarket: () => void;
  onEnterCompanyHome: () => void;
  onSelectRelatedProduct: (p: ProductRecord) => void;
  showProductFavorite?: boolean;
  /** 我的消息已确认联系后，展示完整供方电话 */
  revealContactPhone?: boolean;
}) {
  const [imgIdx, setImgIdx] = useState(0);
  const [guessSeed, setGuessSeed] = useState(0);
  const [contactTipOpen, setContactTipOpen] = useState(false);
  usePortalProductSupplyMetaVersion();

  const isProduct = payload.kind === 'product';
  const product = isProduct ? payload.product : null;
  const service = !isProduct ? payload.service : null;

  const title = isProduct ? product!.name : `「${service!.serviceName}」`;
  const supplierName = isProduct ? getPortalProductSupplierName(product!) : service!.entityName;
  const applicationFieldLabel = isProduct
    ? getProductSupplyMetaForRecord(product!).applicationField
    : service!.applicationField;
  const supplyMeta = isProduct ? getProductSupplyMetaForRecord(product!) : null;
  const industryCategoryLabel = isProduct
    ? supplyMeta?.waterSavingCategoryLabel || product!.category
    : service!.serviceType;
  const productIntroText = isProduct ? product!.info : service!.content;
  const paramRows = isProduct && supplyMeta
    ? orderedParamEntries(supplyMeta.industryCategorySubId, supplyMeta.paramValues)
    : [];
  const excludeId = isProduct ? product!.id : 10000 + (service?.id ?? 0);

  const gallery = useMemo(
    () => (isProduct ? pickGalleryImages(product!) : serviceGallery(service!)),
    [isProduct, product, service]
  );

  const related = useMemo(
    () => guessYouLike(excludeId, guessSeed + (isProduct ? product!.id : service!.id)),
    [excludeId, guessSeed, isProduct, product, service]
  );

  const shuffleGuess = useCallback(() => {
    setGuessSeed((s) => s + 1);
  }, []);

  const mainImg = gallery[imgIdx] ?? gallery[0] ?? '';
  const contactPhoneRaw = demoSupplierContactPhone(supplierName);
  const contactPhoneDisplay = revealContactPhone ? contactPhoneRaw : maskContactPhone(contactPhoneRaw);
  const honorTags = useMemo(() => getSupplierHonorTags(supplierName, 4), [supplierName]);

  React.useEffect(() => {
    setImgIdx(0);
  }, [isProduct, isProduct ? product?.id : service?.id]);

  return (
    <div className={cn(PORTAL_PAGE_GRADIENT_BG, 'pb-12')}>
      <header className="sticky top-0 z-30 border-b border-gray-200/90 bg-white/95 shadow-sm backdrop-blur-md">
        <div className={cn(PORTAL_PAGE_CONTENT, 'flex items-center gap-3 py-3')}>
          <button type="button" onClick={onBack} className={PORTAL_BACK_BUTTON}>
            <span className={PORTAL_BACK_BUTTON_ICON}>
              <ChevronRight className="h-4 w-4 rotate-180" aria-hidden />
            </span>
            <span className="hidden sm:inline">返回</span>
          </button>
          <span className="truncate text-sm font-black text-gray-800 sm:text-base">供应详情</span>
        </div>
      </header>

      <div className={PORTAL_PAGE_CONTENT}>
        <nav
          className="mb-4 flex flex-wrap items-center gap-1 text-xs font-bold text-gray-500 sm:text-sm"
          aria-label="面包屑"
        >
          <Home className="h-3.5 w-3.5 shrink-0 text-teal-500/80" aria-hidden />
          <button type="button" onClick={onBack} className="text-gray-600 transition hover:text-teal-600">
            首页
          </button>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gray-300" aria-hidden />
          <button
            type="button"
            onClick={onEnterSupplyMarket}
            className="text-gray-600 transition hover:text-teal-600"
          >
            供方市场
          </button>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gray-300" aria-hidden />
          <span className="font-black text-gray-800">供应详情</span>
        </nav>

        <div className={PORTAL_PANEL_LG}>
          <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[minmax(0,280px)_1fr_minmax(0,260px)] lg:gap-8">
            <div className="flex flex-col gap-3">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-gray-100 bg-gradient-to-br from-gray-50 to-teal-50/30">
                {showProductFavorite && isProduct ? (
                  <ProductFavoriteButton productId={product!.id} className="right-3 top-3" />
                ) : null}
                <img
                  src={mainImg}
                  alt=""
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex gap-2">
                {gallery.map((src, i) => (
                  <button
                    key={`${src}-${i}`}
                    type="button"
                    onClick={() => setImgIdx(i)}
                    className={cn(
                      'h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 bg-gray-50 transition',
                      imgIdx === i
                        ? 'border-teal-500 ring-2 ring-teal-500/20'
                        : 'border-transparent hover:border-teal-200'
                    )}
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            </div>

            <div className="min-w-0 border-gray-100 lg:border-l lg:pl-8">
              <h1 className="text-xl font-black leading-snug text-gray-900 sm:text-2xl">{title}</h1>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className={PORTAL_TAG_PRIMARY}>认证供方</span>
                <span className={PORTAL_TAG_SECONDARY}>
                  {isProduct ? '节水产业优选' : '节水服务'}
                </span>
              </div>
              <dl className="mt-5 space-y-2.5 text-sm">
                <div className="flex flex-wrap gap-2">
                  <dt className="font-bold text-gray-500">应用领域</dt>
                  <dd className="font-black text-gray-900">{applicationFieldLabel}</dd>
                </div>
                <div className="flex flex-wrap gap-2">
                  <dt className="font-bold text-gray-500">节水产业分类</dt>
                  <dd className="font-black text-gray-900">{industryCategoryLabel}</dd>
                </div>
                <div className="flex flex-wrap gap-2">
                  <dt className="font-bold text-gray-500">联系人</dt>
                  <dd className="font-black text-gray-900">业务对接专员</dd>
                </div>
                <div className="flex flex-wrap gap-2">
                  <dt className="font-bold text-gray-500">联系电话</dt>
                  <dd
                    className="font-black tabular-nums tracking-wide text-gray-900"
                    aria-label={revealContactPhone ? '联系电话' : '联系电话已脱敏'}
                  >
                    {contactPhoneDisplay}
                  </dd>
                </div>
              </dl>
              <button
                type="button"
                className={cn(PORTAL_PRIMARY_BUTTON, 'mt-6')}
                onClick={() => {
                  recordProductContact(payload);
                  setContactTipOpen(true);
                }}
              >
                <Phone className="h-4 w-4" aria-hidden />
                联系我们
              </button>
            </div>

            <div className="flex min-h-[12rem] min-w-0 flex-col rounded-xl border border-teal-100/80 bg-gradient-to-br from-teal-50/50 to-white p-4 lg:min-h-0 lg:border-l-0 lg:bg-teal-50/30 lg:pl-6">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-teal-100 bg-gradient-to-br from-teal-50 to-cyan-50 text-lg font-black text-teal-700 shadow-sm">
                  {supplierName.slice(0, 1)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-teal-700/80">供方企业</p>
                  <p className="mt-0.5 text-sm font-black leading-snug text-gray-900">{supplierName}</p>
                </div>
              </div>
              <div className="mt-4 flex min-h-[4.5rem] flex-1 flex-col rounded-xl border border-teal-100/60 bg-teal-50/35 p-3">
                <p className="mb-2 text-[10px] font-black uppercase tracking-wide text-teal-800/75">企业荣誉</p>
                <SupplierHonorTags tags={honorTags} className="flex-1 content-start" />
              </div>
              <button type="button" onClick={onEnterCompanyHome} className={cn(PORTAL_OUTLINE_BUTTON, 'mt-4 shrink-0')}>
                进入主页
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
          <div className={cn(PORTAL_PANEL, 'min-w-0')}>
            <div className="border-b border-gray-100 px-4 sm:px-6">
              <span className={PORTAL_TAB_ACTIVE}>详情介绍</span>
            </div>
            <div className="space-y-8 p-4 sm:p-6">
              <section>
                <div className="mb-4 flex items-center gap-2">
                  <Settings className="h-4 w-4 text-teal-600" aria-hidden />
                  <span className="h-px flex-1 bg-gradient-to-r from-teal-200 to-transparent" aria-hidden />
                  <h2 className="text-sm font-black text-gray-900">产品简介</h2>
                  <span className="h-px flex-1 bg-gradient-to-l from-teal-200 to-transparent" aria-hidden />
                </div>
                <div className="space-y-5">
                  <div className="rounded-xl border border-teal-100/80 bg-teal-50/40 p-4">
                    <p className="whitespace-pre-line text-sm font-medium leading-relaxed text-gray-700">
                      {productIntroText}
                    </p>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4">
                    <h3 className="text-xs font-black uppercase tracking-wide text-teal-800">产品参数</h3>
                    {isProduct ? (
                      paramRows.length > 0 ? (
                        <dl className="mt-3 divide-y divide-gray-100">
                          {paramRows.map((row) => (
                            <div
                              key={`${row.group}-${row.name}`}
                              className="flex flex-col gap-0.5 py-2.5 first:pt-0 last:pb-0 sm:flex-row sm:gap-4"
                            >
                              <dt className="shrink-0 text-xs font-bold text-gray-500 sm:w-36">{row.name}</dt>
                              <dd className="text-sm font-medium leading-relaxed text-gray-800">{row.value}</dd>
                            </div>
                          ))}
                        </dl>
                      ) : (
                        <p className="mt-2 text-sm font-medium text-gray-500">暂无结构化参数，请联系供方补充。</p>
                      )
                    ) : (
                      <p className="mt-2 line-clamp-6 text-sm font-medium leading-relaxed text-gray-700">
                        {service!.content}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              <section>
                <div className="mb-4 flex items-center gap-2">
                  <Settings className="h-4 w-4 text-teal-600" aria-hidden />
                  <span className="h-px flex-1 bg-gradient-to-r from-teal-200 to-transparent" aria-hidden />
                  <h2 className="text-sm font-black text-gray-900">产品图片</h2>
                  <span className="h-px flex-1 bg-gradient-to-l from-teal-200 to-transparent" aria-hidden />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {gallery.map((src, i) => (
                    <div
                      key={`full-${i}`}
                      className="overflow-hidden rounded-xl border border-gray-100 bg-gray-50"
                    >
                      <img src={src} alt="" className="aspect-video w-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>

          <aside className={cn(PORTAL_PANEL, 'min-w-0')}>
            <div className="border-b border-gray-100 px-4">
              <span className={PORTAL_TAB_ACTIVE}>猜你喜欢</span>
            </div>
            <ul className="divide-y divide-gray-100">
              {related.map((p) => (
                <li key={p.id} className="relative">
                  {showProductFavorite ? (
                    <ProductFavoriteButton productId={p.id} size="sm" className="right-3 top-3 scale-90" />
                  ) : null}
                  <button
                    type="button"
                    className="flex w-full gap-3 p-3 text-left transition hover:bg-teal-50/50"
                    onClick={() => onSelectRelatedProduct(p)}
                  >
                    <div className="relative h-14 w-14 shrink-0">
                      <img
                        src={p.image}
                        alt=""
                        className="h-14 w-14 rounded-lg border border-gray-100 object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="min-w-0 flex-1 text-xs font-black leading-snug text-gray-900 line-clamp-3">
                      {p.name}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="border-t border-gray-50 p-3 text-center">
              <button
                type="button"
                onClick={shuffleGuess}
                className="inline-flex items-center gap-1.5 text-xs font-black text-teal-600 transition hover:text-teal-800"
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden />
                换一批
              </button>
            </div>
          </aside>
        </div>

        <div className="mt-8 flex justify-center sm:hidden">
          <button
            type="button"
            onClick={onBack}
            className="rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-sm font-black text-gray-700 shadow-sm shadow-teal-900/5"
          >
            返回首页
          </button>
        </div>
      </div>

      <AnimatePresence>
        {contactTipOpen ? (
          <motion.div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              aria-label="关闭"
              onClick={() => setContactTipOpen(false)}
              className="absolute inset-0 bg-gray-900/45 backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="supply-contact-tip-title"
              className="relative w-full max-w-[420px] overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-xl shadow-teal-900/10"
            >
              <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-teal-50/80 via-white to-cyan-50/50 px-5 py-4">
                <h2 id="supply-contact-tip-title" className="text-base font-black text-gray-900 sm:text-lg">
                  提示
                </h2>
                <button
                  type="button"
                  onClick={() => setContactTipOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-50 hover:text-gray-700"
                  aria-label="关闭"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-5 p-6">
                <p className="text-sm font-bold leading-relaxed text-gray-600 sm:text-[15px]">
                  已发送请求至供应商，最新反馈请至「我的消息」中查看。
                </p>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setContactTipOpen(false)}
                    className="h-11 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 px-6 text-sm font-black text-white shadow-md shadow-teal-600/25"
                  >
                    我知道了
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
