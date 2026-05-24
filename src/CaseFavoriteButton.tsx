import { Heart } from 'lucide-react';
import { cn } from './lib/utils';
import { usePortalCaseFavorite } from './portalCaseFavorites';

/** 案例卡片右上角收藏位（用于可点击整卡的父容器，需 `position: relative`） */
export function CaseCardFavoriteOverlay({
  caseId,
  className,
  size = 'sm',
}: {
  caseId: number;
  className?: string;
  size?: 'sm' | 'md';
}) {
  return (
    <span className={cn('absolute right-1 top-1 z-10 sm:right-1.5 sm:top-1.5', className)}>
      <CaseFavoriteButton caseId={caseId} size={size} />
    </span>
  );
}

/** 典型案例卡片收藏（点击不冒泡至父级卡片） */
export function CaseFavoriteButton({
  caseId,
  size = 'md',
  className,
}: {
  caseId: number;
  size?: 'sm' | 'md';
  className?: string;
}) {
  const { isFavorite, toggle } = usePortalCaseFavorite(caseId);
  const icon = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  const pad = size === 'sm' ? 'h-7 w-7' : 'h-8 w-8';

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        toggle();
      }}
      aria-label={isFavorite ? '取消收藏' : '收藏'}
      aria-pressed={isFavorite}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full border border-white/80 bg-white/90 shadow-sm backdrop-blur-sm transition hover:scale-105',
        pad,
        className
      )}
    >
      <Heart
        className={cn(icon, isFavorite ? 'fill-rose-500 text-rose-500' : 'text-gray-400')}
        aria-hidden
      />
    </button>
  );
}
