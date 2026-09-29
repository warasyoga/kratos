import type { KeyboardEvent } from 'react';

/** Bentuk sederhana satu kelompok otot (satu atau dua sisi). Koordinat di viewBox 100 × 220. */
type Shape =
  { kind: 'ellipse'; cx: number; cy: number; rx: number; ry: number } | { kind: 'path'; d: string };

const pair = (cx: number, cy: number, rx: number, ry: number): Shape[] => [
  { kind: 'ellipse', cx, cy, rx, ry },
  { kind: 'ellipse', cx: 100 - cx, cy, rx, ry },
];
const mirror = (d: string) =>
  d.replace(
    /(-?\d+(\.\d+)?) (-?\d+(\.\d+)?)/g,
    (_, x: string, _a, y: string) => `${100 - Number(x)} ${y}`,
  );
const paths = (d: string): Shape[] => [
  { kind: 'path', d },
  { kind: 'path', d: mirror(d) },
];

/** Kunci = nilai tipe Muscle di domain. */
const FRONT: Record<string, Shape[]> = {
  shoulder_front: pair(31, 40, 7, 6),
  shoulder_side: pair(22, 43, 5, 7),
  chest: pair(41, 51, 10, 8),
  biceps: pair(20, 60, 5, 11),
  forearm: pair(17.5, 92, 4.5, 13),
  abs: [{ kind: 'path', d: 'M40 62 L60 62 L59 102 Q50 106 41 102 Z' }],
  quads: pair(40, 138, 8, 23),
  calves: pair(39.5, 186, 4.5, 14),
};

const BACK: Record<string, Shape[]> = {
  back_upper: [{ kind: 'path', d: 'M50 28 L66 39 L61 60 L39 60 L34 39 Z' }],
  shoulder_rear: pair(27, 42, 6, 6),
  back_lats: paths('M35 60 L47 62 L47 94 L37 84 Z'),
  triceps: pair(20, 60, 5, 11),
  forearm: pair(17.5, 92, 4.5, 13),
  glutes: pair(41, 113, 9, 9),
  hamstrings: pair(40, 144, 8, 20),
  calves: pair(39.5, 184, 6, 15),
};

/** Siluet dasar: badan, lengan, kaki (kepala digambar sebagai lingkaran). */
const SILHOUETTE = [
  'M44 26 L56 26 L56 33 L44 33 Z',
  'M29 33 Q50 28 71 33 L75 60 L70 108 Q50 114 30 108 L25 60 Z',
  'M15 38 Q21 33 27 37 L26 76 L14 76 Z',
  'M85 38 Q79 33 73 37 L74 76 L86 76 Z',
  'M13 77 L25 77 L23 110 L13 110 Z',
  'M87 77 L75 77 L77 110 L87 110 Z',
  'M31 110 L49 110 L48 166 L33 166 Z',
  'M69 110 L51 110 L52 166 L67 166 Z',
  'M33 167 L47 167 L45 210 L35 210 Z',
  'M67 167 L53 167 L55 210 L65 210 Z',
];

export interface BodyMapRegion {
  /** Warna isi dari token, mis. 'var(--good)'. */
  fill: string;
  opacity?: number;
  /** Garis tepi (mis. volume di zona 10–20). */
  outline?: string;
  /** Nama + status untuk pembaca layar: "Dada, baru dilatih". */
  label: string;
}

export interface BodyMapProps {
  regions: Readonly<Record<string, BodyMapRegion>>;
  frontLabel: string;
  backLabel: string;
  onSelect?: (id: string) => void;
  /** Tinggi tiap siluet (px). */
  height?: number;
}

function Figure({
  shapes,
  title,
  regions,
  onSelect,
  height,
}: {
  shapes: Record<string, Shape[]>;
  title: string;
  regions: BodyMapProps['regions'];
  onSelect: BodyMapProps['onSelect'];
  height: number;
}) {
  return (
    <figure className="flex flex-col items-center gap-1">
      <svg
        viewBox="0 0 100 220"
        height={height}
        width={(height * 100) / 220}
        aria-label={title}
        role="group"
      >
        <g fill="var(--surface-2)" stroke="var(--line)" strokeWidth={1}>
          <circle cx={50} cy={14} r={10} />
          {SILHOUETTE.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
        {Object.entries(shapes).map(([id, parts]) => {
          const region = regions[id];
          if (!region) return null;
          const select = () => onSelect?.(id);
          const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              select();
            }
          };
          return (
            <g
              key={id}
              {...(onSelect && {
                role: 'button',
                tabIndex: 0,
                onClick: select,
                onKeyDown,
                className: 'cursor-pointer outline-none focus-visible:[&>*]:stroke-ink',
              })}
              aria-label={region.label}
              fill={region.fill}
              fillOpacity={region.opacity ?? 1}
              stroke={region.outline ?? 'var(--surface)'}
              strokeWidth={region.outline ? 1.6 : 0.8}
            >
              {parts.map((p, i) =>
                p.kind === 'ellipse' ? (
                  <ellipse key={i} cx={p.cx} cy={p.cy} rx={p.rx} ry={p.ry} />
                ) : (
                  <path key={i} d={p.d} />
                ),
              )}
            </g>
          );
        })}
      </svg>
      <figcaption className="text-xs font-semibold text-muted">{title}</figcaption>
    </figure>
  );
}

/** Siluet depan & belakang dengan warna per kelompok otot (docs/fitur/12-peta-otot.md). */
export function BodyMap({ regions, frontLabel, backLabel, onSelect, height = 220 }: BodyMapProps) {
  return (
    <div className="flex justify-center gap-6">
      <Figure
        shapes={FRONT}
        title={frontLabel}
        regions={regions}
        onSelect={onSelect}
        height={height}
      />
      <Figure
        shapes={BACK}
        title={backLabel}
        regions={regions}
        onSelect={onSelect}
        height={height}
      />
    </div>
  );
}
