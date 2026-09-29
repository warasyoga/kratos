import { useState } from 'react';
import { useServices } from '@/application/ServicesContext';
import type { ProgressPhoto } from '@/domain/progress/photo';
import { t } from '@/shared/i18n/id';
import { tProgress } from '@/shared/i18n/progress';
import { formatDayDate } from '@/shared/lib/format';
import { Button } from '@/shared/ui/Button';
import { Sheet } from '@/shared/ui/Sheet';
import { useProgressAction } from '../hooks/useProgress';
import { PhotoImage } from './PhotoImage';

/** Foto ukuran penuh dengan opsi hapus (konfirmasi di dalam panel). */
export function PhotoViewerSheet({
  photo,
  onClose,
}: {
  photo: ProgressPhoto;
  onClose: () => void;
}) {
  const { progress } = useServices();
  const { run, pending } = useProgressAction();
  const [confirming, setConfirming] = useState(false);

  const remove = async () => {
    if (await run(() => progress.photos.remove(photo.id), tProgress.photoRemoved)) onClose();
  };

  return (
    <Sheet
      open
      title={tProgress.pose[photo.pose]}
      onClose={onClose}
      footer={
        confirming ? (
          <div className="flex flex-col gap-2">
            <p className="text-sm">{tProgress.removePhotoConfirm}</p>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="ghost" onClick={() => setConfirming(false)}>
                {t.common.cancel}
              </Button>
              <Button disabled={pending} onClick={() => void remove()}>
                {t.common.remove}
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="ghost" fullWidth onClick={() => setConfirming(true)}>
            {tProgress.removePhoto}
          </Button>
        )
      }
    >
      <div className="flex flex-col gap-2">
        <PhotoImage photo={photo} size="full" className="aspect-[3/4] w-full rounded-xl" />
        <p className="text-[13px] text-muted">{formatDayDate(photo.logDate)}</p>
      </div>
    </Sheet>
  );
}
