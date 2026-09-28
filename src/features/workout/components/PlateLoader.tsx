import type { PlateInventory } from '@/domain/profile/types';
import { plateLoadout } from '@/domain/strength/plates';
import { t } from '@/shared/i18n/id';
import { formatKg, formatNumber } from '@/shared/lib/format';

/** Warna & tinggi pelat mengikuti standar IWF (25 merah, 20 biru, 15 kuning, 10 hijau). */
const PLATE_STYLE: Record<string, { color: string; height: number; width: number }> = {
  '25': { color: 'bg-plate-red', height: 64, width: 18 },
  '20': { color: 'bg-plate-blue', height: 64, width: 16 },
  '15': { color: 'bg-plate-yellow', height: 56, width: 14 },
  '10': { color: 'bg-plate-green', height: 48, width: 12 },
  '5': { color: 'bg-surface border border-line', height: 38, width: 10 },
  '2.5': { color: 'bg-plate-red', height: 30, width: 8 },
  '1.25': { color: 'bg-muted', height: 24, width: 7 },
  '0.5': { color: 'bg-muted', height: 20, width: 5 },
};

function Plate({ kg }: { kg: number }) {
  const style = PLATE_STYLE[String(kg)] ?? { color: 'bg-muted', height: 24, width: 8 };
  return (
    <span
      className={`${style.color} rounded-[3px]`}
      style={{ height: style.height, width: style.width }}
      aria-hidden
    />
  );
}

/** Kalkulator pelat: gambar bar dan pelat tiap sisi untuk beban target. */
export function PlateLoader({
  targetKg,
  inventory,
}: {
  targetKg: number;
  inventory: PlateInventory;
}) {
  const { perSideKg, totalKg, exact } = plateLoadout(targetKg, inventory);
  const perSideText = perSideKg.map((kg) => formatNumber(kg, 2)).join(' + ');
  const leftSide = [...perSideKg].reverse();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <span className="font-sans label-caps">{t.workout.plates}</span>
        <span className="font-bold tabular-nums">{formatKg(totalKg)}</span>
      </div>
      <div
        className="flex h-16 items-center justify-center"
        role="img"
        aria-label={
          perSideKg.length
            ? t.workout.platesFormula(formatKg(inventory.barKg), perSideText)
            : t.workout.emptyBar
        }
      >
        <span className="h-2 w-6 rounded-sm bg-muted/60" />
        {leftSide.map((kg, i) => (
          <Plate key={`l${i}`} kg={kg} />
        ))}
        <span className="h-4 w-1.5 rounded-sm bg-muted" />
        <span className="h-1.5 w-16 bg-muted/60" />
        <span className="h-4 w-1.5 rounded-sm bg-muted" />
        {perSideKg.map((kg, i) => (
          <Plate key={`r${i}`} kg={kg} />
        ))}
        <span className="h-2 w-6 rounded-sm bg-muted/60" />
      </div>
      <p className="text-[13px] text-muted tabular-nums">
        {perSideKg.length
          ? t.workout.platesFormula(formatKg(inventory.barKg), perSideText)
          : t.workout.emptyBar}
      </p>
      {!exact && (
        <p className="text-[13px] text-warn">{t.workout.plateNotExact(formatKg(totalKg))}</p>
      )}
    </div>
  );
}
