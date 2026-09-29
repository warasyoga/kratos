import { linearScale, niceTicks } from '@/shared/lib/chartScale';
import { useElementWidth } from '@/shared/lib/useElementWidth';

export interface ChartPoint {
  x: number;
  y: number;
}

export interface LineSeries {
  points: readonly ChartPoint[];
  /** 'line' = garis + titik, 'dots' = titik redup saja (mis. timbangan harian). */
  variant: 'line' | 'dots';
}

export interface ChartBand {
  points: readonly { x: number; lo: number; hi: number }[];
}

export interface LineChartProps {
  /** Ringkasan untuk pembaca layar, mis. "1RM estimasi naik dari 66 ke 70 kg". */
  label: string;
  series: readonly LineSeries[];
  band?: ChartBand | undefined;
  formatX: (x: number) => string;
  formatY: (y: number) => string;
  height?: number;
}

const PAD = { top: 12, right: 14, bottom: 24, left: 40 } as const;
const Y_TICKS = 4;

/**
 * Grafik garis SVG ringan (tanpa pustaka): skala dari data nyata, label sumbu hanya di
 * ujung agar tidak tumpang tindih di layar 360 px, titik terakhir ditonjolkan.
 * Warna dari token tema (terang/gelap).
 */
export function LineChart({ label, series, band, formatX, formatY, height = 180 }: LineChartProps) {
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const all = series.flatMap((s) => s.points);
  const bandPoints = band?.points ?? [];
  if (all.length === 0) return null;

  const xs = [...all.map((p) => p.x), ...bandPoints.map((p) => p.x)];
  const ys = [...all.map((p) => p.y), ...bandPoints.flatMap((p) => [p.lo, p.hi])];
  let xMin = Math.min(...xs);
  let xMax = Math.max(...xs);
  if (xMin === xMax) {
    xMin -= 1;
    xMax += 1;
  }
  const ticks = niceTicks(Math.min(...ys), Math.max(...ys), Y_TICKS);
  const yDomain = [ticks[0] ?? 0, ticks.at(-1) ?? 1] as const;

  const x = linearScale([xMin, xMax], [PAD.left, width - PAD.right]);
  const y = linearScale(yDomain, [height - PAD.bottom, PAD.top]);
  const path = (points: readonly ChartPoint[]) =>
    points
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${x(p.x).toFixed(1)},${y(p.y).toFixed(1)}`)
      .join('');

  const bandPath =
    bandPoints.length >= 2
      ? `${bandPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(p.x)},${y(p.hi)}`).join('')}${[
          ...bandPoints,
        ]
          .reverse()
          .map((p) => `L${x(p.x)},${y(p.lo)}`)
          .join('')}Z`
      : undefined;

  const lines = series.filter((s) => s.variant === 'line');
  const last = lines.at(-1)?.points.at(-1);

  return (
    <div ref={ref} className="w-full">
      <svg
        role="img"
        aria-label={label}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="block overflow-visible"
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

        {bandPath && <path d={bandPath} fill="var(--good)" fillOpacity={0.14} />}

        {series.map((s, i) =>
          s.variant === 'dots' ? (
            <g key={i} fill="var(--muted)" fillOpacity={0.45}>
              {s.points.map((p) => (
                <circle key={p.x} cx={x(p.x)} cy={y(p.y)} r={2.5} />
              ))}
            </g>
          ) : (
            <g key={i}>
              <path
                d={path(s.points)}
                fill="none"
                stroke="var(--accent)"
                strokeWidth={2.5}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {s.points.length <= 24 &&
                s.points.map((p) => (
                  <circle key={p.x} cx={x(p.x)} cy={y(p.y)} r={3} fill="var(--accent)" />
                ))}
            </g>
          ),
        )}

        {last && (
          <circle
            cx={x(last.x)}
            cy={y(last.y)}
            r={5.5}
            fill="var(--accent)"
            stroke="var(--surface)"
            strokeWidth={2.5}
          />
        )}

        <text x={PAD.left} y={height - 6} fill="var(--muted)" fontSize={11}>
          {formatX(xMin)}
        </text>
        <text
          x={width - PAD.right}
          y={height - 6}
          textAnchor="end"
          fill="var(--muted)"
          fontSize={11}
        >
          {formatX(xMax)}
        </text>
      </svg>
    </div>
  );
}
