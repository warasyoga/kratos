import { Camera } from 'lucide-react';
import { useId, useState } from 'react';
import { useServices } from '@/application/ServicesContext';
import { PHOTO_POSES, type PhotoPose } from '@/domain/progress/photo';
import { t } from '@/shared/i18n/id';
import { OptionGroup } from '@/shared/ui/OptionGroup';
import { Sheet } from '@/shared/ui/Sheet';
import { useProgressAction } from '../hooks/useProgress';

/** Pilih pose lalu ambil/pilih foto; foto dikompres dan disimpan di perangkat. */
export function AddPhotoSheet({ onClose }: { onClose: () => void }) {
  const { progress } = useServices();
  const { run, pending } = useProgressAction();
  const [pose, setPose] = useState<PhotoPose>('front');
  const inputId = useId();

  const add = async (file: File | undefined) => {
    if (!file) return;
    if (await run(() => progress.photos.add({ file, pose }), t.progress.photoSaved)) onClose();
  };

  return (
    <Sheet open title={t.progress.photoSheet} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <OptionGroup
          name="photo-pose"
          label={t.progress.poseLabel}
          layout="row"
          options={PHOTO_POSES.map((value) => ({ value, label: t.progress.pose[value] }))}
          value={pose}
          onChange={setPose}
        />
        <label
          htmlFor={inputId}
          aria-disabled={pending}
          className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-[14px] bg-accent font-bold text-accent-ink has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent aria-disabled:opacity-50"
        >
          <Camera className="size-5" aria-hidden />
          {t.progress.choosePhoto}
          <input
            id={inputId}
            type="file"
            accept="image/*"
            disabled={pending}
            className="sr-only"
            onChange={(e) => void add(e.target.files?.[0])}
          />
        </label>
        <p className="text-xs text-muted">{t.progress.photoPrivacy}</p>
      </div>
    </Sheet>
  );
}
