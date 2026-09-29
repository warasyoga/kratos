import { linearScale } from '@/shared/lib/chartScale';

const WIDTH = 64;
const HEIGHT = 24;
const PAD = 3;

/** Garis tren mini di daftar gerakan. Dekoratif: nilainya sudah tertulis di sebelahnya. */
export function Sparkline({ values }: { values: readonly number[] }) {
  if (values.length < 2) return <span className="inline-block w-16" aria-hidden />;
  const x = linearScale([0, values.length - 1], [PAD, WIDTH - PAD]);
  const y = linearScale([Math.min(...values), Math.max(...values)], [HEIGHT - PAD, PAD]);
  const d = values.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(v)}`).join('');
  const lastX = x(values.length - 1);
  const lastY = y(values.at(-1) ?? 0);
  return (
    <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} aria-hidden>
      <path d={d} fill="none" stroke="var(--accent)" strokeWidth={1.75} strokeLinejoin="round" />
      <circle cx={lastX} cy={lastY} r={2.5} fill="var(--accent)" />
    </svg>
  );
}
