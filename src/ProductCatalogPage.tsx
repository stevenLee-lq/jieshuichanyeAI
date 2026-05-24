import React, { useMemo, useState } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import type { HomeHeroProductTile, ProductRecord } from './data';
import { ProductFavoriteButton } from './ProductFavoriteButton';

function mockPriceYuan(id: number): number {
  return (id * 137 + 499) % 28000 + 1999;
}

function formatYuan(n: number): string {
  return n.toLocaleString('zh-CN');
}

export function ProductCatalogPage({
  tile,
  products,
  onBack,
  showProductFavorite = false,
}: {
  tile: HomeHeroProductTile;
  products: ProductRecord[];
  onBack: () => void;
  /** 样式4：商品卡片收藏 */
  showProductFavorite?: boolean;
}) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.supplier.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.scenario?.toLowerCase().includes(q) ?? false) ||
        p.info.toLowerCase().includes(q)
    );
  }, [products, query]);

  const catalogEmpty = products.length === 0;

  return (
    <div className="min-h-0 flex-1 bg-gradient-to-b from-gray-50 via-white to-gray-50/80">
      {/* 顶栏：仅返回 + 搜索（与门户青绿体系一致） */}
      <header className="sticky top-0 z-30 border-b border-teal-100/60 bg-white/90 shadow-sm shadow-teal-900/5 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1440px] items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-3.5">
          <button
            type="button"
            onClick={onBack}
            className="group flex shrink-0 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-2.5 py-2 text-xs font-black text-gray-600 shadow-sm transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700 sm:px-3 sm:text-sm"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-100 bg-gray-50 group-hover:border-teal-200 group-hover:bg-white">
              <ChevronRight className="h-4 w-4 rotate-180" aria-hidden />
            </span>
            <span className="hidden sm:inline">返回</span>
          </button>
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-teal-500/80 sm:left-4 sm:h-[1.125rem] sm:w-[1.125rem]"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={catalogEmpty}
              placeholder={
                catalogEmpty
                  ? `「${tile.name}」下暂无在售商品`
                  : `在「${tile.name}」相关商品中搜索`
              }
              className="h-11 w-full rounded-xl border-2 border-teal-100 bg-white pl-10 pr-3 text-sm font-medium text-gray-900 shadow-inner shadow-teal-900/5 placeholder:text-gray-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-70 sm:h-12 sm:pl-12 sm:text-[15px]"
              autoComplete="off"
            />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 sm:py-6">
        {/* 商品栅格：参考京东信息密度，配色用平台青绿 */}
        {catalogEmpty ? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-2xl border border-dashed border-teal-100 bg-teal-50/30 px-6 py-16 text-center">
            <p className="text-sm font-black text-gray-700">该类目下暂无在售商品</p>
            <p className="mt-2 max-w-sm text-xs font-bold leading-relaxed text-gray-500">
              平台商品库持续扩充中，请返回首页尝试其它分类关键词，或通过「热门产品」宫格浏览已有上架。
            </p>
            <button
              type="button"
              onClick={onBack}
              className="mt-5 rounded-xl bg-teal-600 px-5 py-2.5 text-xs font-black text-white shadow-md shadow-teal-600/20 transition hover:bg-teal-700"
            >
              返回首页
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-2xl border border-dashed border-teal-100 bg-teal-50/30 px-6 py-16 text-center">
            <p className="text-sm font-black text-gray-700">未找到匹配商品</p>
            <p className="mt-2 text-xs font-bold text-gray-500">请尝试其它关键词，或清空搜索框查看本类全部在售</p>
            <button
              type="button"
              onClick={() => setQuery('')}
              className="mt-5 rounded-xl bg-teal-600 px-5 py-2.5 text-xs font-black text-white shadow-md shadow-teal-600/20 transition hover:bg-teal-700"
            >
              清空搜索
            </button>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {filtered.map((p) => {
              const price = mockPriceYuan(p.id);
              const origin = price + 800 + p.id * 50;
              const sold = 500 + (p.id * 173) % 12000;
              return (
                <li
                  key={p.id}
                  className="group flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm shadow-teal-900/5 transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
                >
                  <div className="relative aspect-square overflow-hidden bg-gray-50">
                    {showProductFavorite ? <ProductFavoriteButton productId={p.id} /> : null}
                    <span className="absolute left-2 top-2 z-10 rounded-md bg-teal-600 px-1.5 py-0.5 text-[10px] font-black text-white shadow-sm ring-1 ring-white/30">
                      认证供方
                    </span>
                    <img
                      src={p.image}
                      alt=""
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-2.5 sm:p-3">
                    <p className="line-clamp-2 min-h-[2.5rem] text-[11px] font-black leading-snug text-gray-900 sm:min-h-[2.75rem] sm:text-[13px]">
                      {p.name}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                      <span className="text-base font-black leading-none text-teal-600 sm:text-lg">
                        ¥{formatYuan(price)}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400 line-through">¥{formatYuan(origin)}</span>
                    </div>
                    <p className="mt-1 text-[10px] font-bold text-gray-500 sm:text-[11px]">
                      已售 {sold.toLocaleString('zh-CN')}+ 件
                    </p>
                    <p className="mt-auto truncate pt-2 text-[10px] font-bold text-gray-400 sm:text-[11px]">
                      {p.supplier}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
