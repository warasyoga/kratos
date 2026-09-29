import { z } from 'zod/mini';
import { toLocalDate } from '@/domain/common/clock';
import { err, ok, type Result } from '@/domain/common/result';
import { PHOTO_POSES, type ProgressPhoto } from '@/domain/progress/photo';
import { PHOTO } from '@/domain/standards';
import type { AppDeps } from '../deps';
import { validate } from '../validation';

const photoSchema = z.object({
  pose: z.enum(PHOTO_POSES, { error: 'choose_one' }),
  file: z.custom<Blob>((v) => v instanceof Blob && v.type.startsWith('image/'), {
    error: 'photo_invalid',
  }),
});

/**
 * Foto progres: dikompres di perangkat (1080 px, JPEG 0,8) + thumbnail 360 px.
 * Foto tidak pernah dikirim ke luar perangkat. docs/fitur/07-progres.md "Foto"
 */
export function makePhotoUseCases(deps: AppDeps) {
  return {
    list: (): Promise<ProgressPhoto[]> => deps.photos.list(),

    async add(raw: unknown): Promise<Result<{ id: string }>> {
      const parsed = validate(photoSchema, raw);
      if (!parsed.ok) return parsed;
      const { file, pose } = parsed.value;

      let blob: Blob;
      let thumb: Blob;
      try {
        [blob, thumb] = await Promise.all([
          deps.platform.resizeImage(file, PHOTO.maxSidePx, PHOTO.jpegQuality),
          deps.platform.resizeImage(file, PHOTO.thumbSidePx, PHOTO.jpegQuality),
        ]);
      } catch {
        return err({ code: 'photo_invalid', message: 'Foto tidak bisa dibaca' });
      }

      const now = deps.clock.now();
      const id = deps.newId();
      await deps.photos.add({ id, logDate: toLocalDate(now), pose, blob, thumb, createdAt: now });
      return ok({ id });
    },

    async remove(id: string): Promise<Result<void>> {
      await deps.photos.remove(id);
      return ok(undefined);
    },
  };
}
