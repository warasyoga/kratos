/** Satu catatan penimbangan dan/atau ukuran lingkar tubuh (cm). docs/05-model-data.md */
export interface BodyMetric {
  id: string;
  logDate: string;
  weightKg?: number;
  neckCm?: number;
  chestCm?: number;
  waistCm?: number;
  hipCm?: number;
  armCm?: number;
  thighCm?: number;
  createdAt: number;
}

/** Ukuran lingkar yang dicatat, urutan tampilan dari atas ke bawah. */
export const CIRCUMFERENCES = [
  'neckCm',
  'chestCm',
  'armCm',
  'waistCm',
  'hipCm',
  'thighCm',
] as const;
export type Circumference = (typeof CIRCUMFERENCES)[number];

/** Catatan memuat minimal satu ukuran lingkar. */
export function hasCircumference(metric: BodyMetric): boolean {
  return CIRCUMFERENCES.some((field) => metric[field] !== undefined);
}
