import { Heart } from 'lucide-react';
import { cn } from './lib/utils';
import { usePortalProductFavorite } from './portalProductFavorites';

/** 样式4 产品卡片右上角收藏（点击不冒泡至父级卡片） */
export function ProductFavoriteButton({
  productId,
  className,
  size = 'md',
}: {
  productId: number | null | undefined;
  className?: string;
  size?: 'sm' | 'md';
}) {
  const { isFavorite, toggle } = usePortalProductFavorite(productId);
  if (productId == null) return null;

  const dim = size === 'sm' ? 'h-7 w-7' : 'h-8 w-8';
  const icon = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';

  return (
    <button
      type="button"
      aria-label={isFavorite ? '取消收藏' : '收藏'}
      aria-pressed={isFavorite}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle();
      }}
      className={cn(
        'absolute right-1.5 top-1.5 z-20 flex items-center justify-center rounded-full border border-white/80 bg-white/95 shadow-sm backdrop-blur-sm transition',
        'hover:border-rose-200 hover:bg-rose-50',
        dim,
        className
      )}
    >
      <Heart
        className={cn(
          icon,
          isFavorite ? 'fill-rose-500 text-rose-500' : 'text-gray-400'
        )}
        aria-hidden
      />
    </button>
  );
}
