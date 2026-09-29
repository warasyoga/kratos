import { linearScale, niceTicks } from '@/shared/lib/chartScale';
import { useElementWidth } from '@/shared/lib/useElementWidth';

export interface Bar {
  key: string;
  /** Label sumbu x, mis. "28 Sep". */
  label: string;
  value: number;
}

export interface BarChartProps {
  label: string;
  bars: readonly Bar[];
  formatY: (y: number) => string;
  height?: number;
}

const PAD = { top: 12, right: 8, bottom: 24, left: 44 } as const;
/** Lebar minimum per label sumbu x agar tidak tumpang tindih. */
const MIN_LABEL_PX = 48;

/** Grafik batang SVG (mis. tonase per minggu); batang terakhir = minggu ini, ditonjolkan. */
export function BarChart({ label, bars, formatY, height = 160 }: BarChartProps) {
  const [ref, width] = useElementWidth<HTMLDivElement>();
  if (bars.length === 0) return null;

  const ticks = niceTicks(0, Math.max(...bars.map((b) => b.value), 1), 3);
  const y = linearScale([0, ticks.at(-1) ?? 1], [height - PAD.bottom, PAD.top]);
  const slot = (width - PAD.left - PAD.right) / bars.length;
  const barWidth = Math.max(Math.min(slot * 0.62, 28), 3);
  const labelEvery = Math.max(1, Math.ceil(MIN_LABEL_PX / slot));

  return (
    <div ref={ref} className="w-full">
      <svg
        role="img"
        aria-label={label}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="block"
      >
        {ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={PAD.left}
              x2={width - PAD.right}
              y1={y(tick)}
              y2={y(tick)}
              stroke="var(--line)"
              strokeWidth={1}
            />
            <text
              x={PAD.left - 6}
              y={y(tick)}
              textAnchor="end"
              dominantBaseline="middle"
              fill="var(--muted)"
              fontSize={11}
            >
              {formatY(tick)}
            </text>
          </g>
        ))}
        {bars.map((bar, i) => {
          const center = PAD.left + slot * (i + 0.5);
          const top = y(bar.value);
          const isLast = i === bars.length - 1;
          // Label dihitung dari kanan agar minggu ini selalu berlabel.
          const labelled = (bars.length - 1 - i) % labelEvery === 0;
          return (
            <g key={bar.key}>
              <rect
                x={center - barWidth / 2}
                y={top}
                width={barWidth}
                height={Math.max(height - PAD.bottom - top, 0)}
                rx={3}
                fill={isLast ? 'var(--accent)' : 'var(--accent-soft)'}
              />
              {labelled && (
                <text
                  x={center}
                  y={height - 6}
                  textAnchor="middle"
                  fill="var(--muted)"
                  fontSize={11}
                >
                  {bar.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
