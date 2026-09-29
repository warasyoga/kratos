import type { ProgressPhoto } from '@/domain/progress/photo';
import { cn } from '@/shared/lib/cn';
import { useObjectUrl } from '@/shared/lib/useObjectUrl';
import { photoAlt } from '../photoText';

/** Foto progres dari IndexedDB (thumbnail untuk grid, ukuran penuh untuk tampilan besar). */
export function PhotoImage({
  photo,
  size,
  className,
}: {
  photo: ProgressPhoto;
  size: 'thumb' | 'full';
  className?: string;
}) {
  const url = useObjectUrl(size === 'thumb' ? photo.thumb : photo.blob);
  return (
    <span className={cn('block overflow-hidden bg-surface-2', className)}>
      {url && (
        <img
          src={url}
          alt={photoAlt(photo)}
          decoding="async"
          loading="lazy"
          className="size-full object-cover"
        />
      )}
    </span>
  );
}
