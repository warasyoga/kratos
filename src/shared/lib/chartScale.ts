/**
 * Skala grafik: pembagian sumbu "rapi" (1, 2, 2,5, 5 × 10^n) dan pemetaan linear.
 * Dipakai komponen grafik SVG di src/shared/ui/charts.
 */
const NICE_STEPS = [1, 2, 2.5, 5, 10] as const;

/** Langkah rapi terkecil yang membagi rentang menjadi ≤ `count` bagian. */
export function niceStep(span: number, count: number): number {
  if (span <= 0 || count <= 0) return 1;
  const raw = span / count;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const step = NICE_STEPS.find((s) => s * magnitude >= raw) ?? 10;
  return step * magnitude;
}

/**
 * Titik-titik sumbu rapi yang mencakup [min, max], mis. (66,7; 70) → [66, 67, 68, 69, 70].
 * Rentang nol diperlebar agar garis datar tetap di tengah.
 */
export function niceTicks(min: number, max: number, count = 4): number[] {
  let lo = min;
  let hi = max;
  if (hi - lo < 1e-9) {
    const pad = Math.max(Math.abs(lo) * 0.02, 1);
    lo -= pad;
    hi += pad;
  }
  const step = niceStep(hi - lo, count);
  const start = Math.floor(lo / step) * step;
  const end = Math.ceil(hi / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= end + step / 2; v += step) ticks.push(Number(v.toFixed(10)));
  return ticks;
}

/** Fungsi yang memetakan nilai dari `domain` ke `range` secara linear. */
export function linearScale(
  [d0, d1]: readonly [number, number],
  [r0, r1]: readonly [number, number],
): (value: number) => number {
  const span = d1 - d0;
  if (span === 0) return () => (r0 + r1) / 2;
  return (value) => r0 + ((value - d0) / span) * (r1 - r0);
}
