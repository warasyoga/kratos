import type { MuscleMapEntry } from '@/application/progress/muscleMap';
import type { RecoveryStatus } from '@/domain/recovery/muscleRecovery';
import { WEEKLY_SETS_PER_MUSCLE } from '@/domain/standards';
import { t } from '@/shared/i18n/id';
import { formatNumber } from '@/shared/lib/format';
import type { BodyMapRegion } from '@/shared/ui/BodyMap';

export type MapMode = 'recovery' | 'volume';

export const STATUS_FILL: Record<RecoveryStatus, string> = {
  fresh: 'var(--good)',
  partial: 'var(--plate-yellow)',
  recent: 'var(--warn)',
};

/** Warna tiap otot: status pemulihan, atau intensitas set minggu ini (0 → 20+). */
export function muscleRegions(
  entries: readonly MuscleMapEntry[],
  mode: MapMode,
): Record<string, BodyMapRegion> {
  return Object.fromEntries(
    entries.map((m) => {
      const name = t.muscle[m.muscle];
      if (mode === 'recovery') {
        return [
          m.muscle,
          {
            fill: STATUS_FILL[m.status],
            opacity: 0.9,
            label: t.muscleMap.regionLabel(name, t.muscleMap.status[m.status]),
          },
        ];
      }
      const inZone =
        m.setsThisWeek >= WEEKLY_SETS_PER_MUSCLE.min &&
        m.setsThisWeek <= WEEKLY_SETS_PER_MUSCLE.max;
      return [
        m.muscle,
        {
          fill: 'var(--accent)',
          opacity: 0.12 + 0.88 * Math.min(m.setsThisWeek / WEEKLY_SETS_PER_MUSCLE.max, 1),
          ...(inZone && { outline: 'var(--good)' }),
          label: t.muscleMap.regionLabel(name, t.muscleMap.setsValue(formatNumber(m.setsThisWeek))),
        },
      ];
    }),
  );
}
