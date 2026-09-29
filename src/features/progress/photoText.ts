import type { ProgressPhoto } from '@/domain/progress/photo';
import { t } from '@/shared/i18n/id';
import { formatShortDate } from '@/shared/lib/format';

/** Teks alternatif foto: "Foto Depan, 28 Sep". */
export const photoAlt = (photo: ProgressPhoto) =>
  t.progress.photoAlt(t.progress.pose[photo.pose], formatShortDate(photo.logDate));
