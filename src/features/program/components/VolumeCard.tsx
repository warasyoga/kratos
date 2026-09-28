import type { MuscleVolume } from '@/application/program/getActiveProgram';
import { WEEKLY_SETS_PER_MUSCLE } from '@/domain/standards';
import { t } from '@/shared/i18n/id';
import { cn } from '@/shared/lib/cn';
import { formatNumber } from '@/shared/lib/format';
import { Card } from '@/shared/ui/Card';

const SCALE_MAX = 24;

/** Set per otot besar per minggu dengan zona 10–20 (Schoenfeld dkk. 2017). */
export function VolumeCard({ volume }: { volume: readonly MuscleVolume[] }) {
  const zoneStart = (WEEKLY_SETS_PER_MUSCLE.min / SCALE_MAX) * 100;
  const zoneWidth = ((WEEKLY_SETS_PER_MUSCLE.max - WEEKLY_SETS_PER_MUSCLE.min) / SCALE_MAX) * 100;
  return (
    <Card>
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-sans label-caps">{t.program.volumeTitle}</h2>
        <span className="text-xs text-muted">{t.program.volumeZone}</span>
      </div>
      <ul className="flex flex-col gap-2.5">
        {volume.map((v) => (
          <li
            key={v.muscle}
            className="grid grid-cols-[96px_1fr_auto] items-center gap-2 text-[13px]"
          >
            <span>{t.muscle[v.muscle]}</span>
            <span className="relative h-2.5 rounded-full bg-surface-2" aria-hidden>
              <span
                className="absolute inset-y-0 rounded-full bg-good-bg"
                style={{ left: `${zoneStart}%`, width: `${zoneWidth}%` }}
              />
              <span
                className={cn(
                  'absolute inset-y-0.5 left-0 rounded-full',
                  v.status === 'optimal' ? 'bg-good' : 'bg-warn',
                )}
                style={{ width: `${Math.min(v.sets / SCALE_MAX, 1) * 100}%` }}
              />
            </span>
            <span
              className={cn('font-semibold tabular-nums', v.status !== 'optimal' && 'text-warn')}
            >
              {t.program.volumeValue(formatNumber(v.sets), v.frequency)}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
