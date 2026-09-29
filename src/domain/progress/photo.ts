export const PHOTO_POSES = ['front', 'side', 'back'] as const;
export type PhotoPose = (typeof PHOTO_POSES)[number];

/**
 * Foto progres. Hanya tersimpan di perangkat; keluar hanya lewat ekspor backup.
 * `blob` JPEG sisi terpanjang 1080 px, `thumb` 360 px untuk grid.
 */
export interface ProgressPhoto {
  id: string;
  logDate: string;
  pose: PhotoPose;
  blob: Blob;
  thumb: Blob;
  createdAt: number;
}
