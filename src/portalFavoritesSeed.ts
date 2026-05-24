/** 后台「我的收藏」演示种子：与门户产品库、案例库、需求中心 id 对齐 */

export const DEMO_PORTAL_PRODUCT_FAVORITE_IDS = [1, 2, 5, 8] as const;

export const DEMO_PORTAL_CASE_FAVORITE_IDS = [1, 2, 4, 5] as const;

export const DEMO_PORTAL_DEMAND_FAVORITE_IDS = [1, 2, 4] as const;

export function seedPortalProductFavoriteIds(): number[] {
  return [...DEMO_PORTAL_PRODUCT_FAVORITE_IDS];
}

export function seedPortalCaseFavoriteIds(): number[] {
  return [...DEMO_PORTAL_CASE_FAVORITE_IDS];
}

export function seedPortalDemandFavoriteIds(): number[] {
  return [...DEMO_PORTAL_DEMAND_FAVORITE_IDS];
}
