import { Camera } from 'lucide-react';
import { useId, useState } from 'react';
import { useServices } from '@/application/ServicesContext';
import { PHOTO_POSES, type PhotoPose } from '@/domain/progress/photo';
import { tProgress } from '@/shared/i18n/progress';
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
    if (await run(() => progress.photos.add({ file, pose }), tProgress.photoSaved)) onClose();
  };

  return (
    <Sheet open title={tProgress.photoSheet} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <OptionGroup
          name="photo-pose"
          label={tProgress.poseLabel}
          layout="row"
          options={PHOTO_POSES.map((value) => ({ value, label: tProgress.pose[value] }))}
          value={pose}
          onChange={setPose}
        />
        <label
          htmlFor={inputId}
          aria-disabled={pending}
          className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-[14px] bg-accent font-bold text-accent-ink has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent aria-disabled:opacity-50"
        >
          <Camera className="size-5" aria-hidden />
          {tProgress.choosePhoto}
          <input
            id={inputId}
            type="file"
            accept="image/*"
            disabled={pending}
            className="sr-only"
            onChange={(e) => void add(e.target.files?.[0])}
          />
        </label>
        <p className="text-xs text-muted">{tProgress.photoPrivacy}</p>
      </div>
    </Sheet>
  );
}
