import { Check, Plus } from 'lucide-react';
import { useState } from 'react';
import type { ProgressPhoto } from '@/domain/progress/photo';
import { tProgress } from '@/shared/i18n/progress';
import { cn } from '@/shared/lib/cn';
import { formatDayDate } from '@/shared/lib/format';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { AddPhotoSheet } from '../components/AddPhotoSheet';
import { EmptyCard } from '../components/EmptyCard';
import { PhotoCompareSheet } from '../components/PhotoCompareSheet';
import { PhotoImage } from '../components/PhotoImage';
import { PhotoViewerSheet } from '../components/PhotoViewerSheet';
import { usePhotos } from '../hooks/useProgress';
import { photoAlt } from '../photoText';

const COMPARE_COUNT = 2;

function byDate(photos: readonly ProgressPhoto[]) {
  const groups = new Map<string, ProgressPhoto[]>();
  for (const p of photos) groups.set(p.logDate, [...(groups.get(p.logDate) ?? []), p]);
  return [...groups];
}

/** Grid foto per tanggal, tambah foto, dan mode banding 2 foto. */
export function PhotosSection() {
  const { data: photos = [], isPending } = usePhotos();
  const [adding, setAdding] = useState(false);
  const [viewing, setViewing] = useState<ProgressPhoto>();
  const [comparing, setComparing] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  const toggleCompare = () => {
    setComparing((c) => !c);
    setSelected([]);
  };
  const select = (id: string) =>
    setSelected((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id].slice(-COMPARE_COUNT),
    );
  const pair = photos
    .filter((p) => selected.includes(p.id))
    .sort((a, b) => a.logDate.localeCompare(b.logDate) || a.createdAt - b.createdAt);
  const [before, after] = pair;

  const actions = (
    <div className="grid grid-cols-2 gap-2">
      <Button onClick={() => setAdding(true)}>
        <Plus className="size-5" aria-hidden />
        {tProgress.addPhoto}
      </Button>
      <Button
        variant="ghost"
        disabled={photos.length < COMPARE_COUNT}
        aria-pressed={comparing}
        onClick={toggleCompare}
      >
        {comparing ? tProgress.compareDone : tProgress.compare}
      </Button>
    </div>
  );

  return (
    <>
      {actions}
      {comparing && <p className="text-[13px] text-muted">{tProgress.compareHint}</p>}
      {!isPending && photos.length === 0 && <EmptyCard>{tProgress.photosEmpty}</EmptyCard>}

      {byDate(photos).map(([date, group]) => (
        <Card key={date}>
          <h2 className="font-sans label-caps">{formatDayDate(date)}</h2>
          <ul className="grid grid-cols-3 gap-2">
            {group.map((photo) => {
              const alt = photoAlt(photo);
              const isSelected = selected.includes(photo.id);
              return (
                <li key={photo.id}>
                  <button
                    type="button"
                    aria-label={comparing ? tProgress.selectPhoto(alt) : tProgress.openPhoto(alt)}
                    aria-pressed={comparing ? isSelected : undefined}
                    onClick={() => (comparing ? select(photo.id) : setViewing(photo))}
                    className={cn(
                      'relative block w-full overflow-hidden rounded-xl',
                      isSelected && 'ring-3 ring-accent',
                    )}
                  >
                    <PhotoImage photo={photo} size="thumb" className="aspect-[3/4]" />
                    <span className="absolute inset-x-0 bottom-0 bg-black/45 py-0.5 text-[11px] font-semibold text-white">
                      {tProgress.pose[photo.pose]}
                    </span>
                    {isSelected && (
                      <span className="absolute top-1.5 right-1.5 grid size-6 place-items-center rounded-full bg-accent text-accent-ink">
                        <Check className="size-4" strokeWidth={3} aria-hidden />
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>
      ))}

      {adding && <AddPhotoSheet onClose={() => setAdding(false)} />}
      {viewing && <PhotoViewerSheet photo={viewing} onClose={() => setViewing(undefined)} />}
      {before && after && (
        <PhotoCompareSheet before={before} after={after} onClose={() => setSelected([])} />
      )}
    </>
  );
}
