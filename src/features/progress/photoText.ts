import type { ProgressPhoto } from '@/domain/progress/photo';
import { tProgress } from '@/shared/i18n/progress';
import { formatShortDate } from '@/shared/lib/format';

/** Teks alternatif foto: "Foto Depan, 28 Sep". */
export const photoAlt = (photo: ProgressPhoto) =>
  tProgress.photoAlt(tProgress.pose[photo.pose], formatShortDate(photo.logDate));
