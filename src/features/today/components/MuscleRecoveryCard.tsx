import { Link } from 'react-router';
import type { TodayPlan } from '@/application/today/todayUseCases';
import { t } from '@/shared/i18n/id';
import { BodyMap, type BodyMapRegion } from '@/shared/ui/BodyMap';
import { Card } from '@/shared/ui/Card';

const FILL = { partial: 'var(--plate-yellow)', recent: 'var(--warn)' } as const;

/** Peta otot kecil di hari pemulihan: otot yang masih pulih diwarnai. docs/fitur/12-peta-otot.md */
export function MuscleRecoveryCard({ muscles }: { muscles: TodayPlan['recoveringMuscles'] }) {
  const regions: Record<string, BodyMapRegion> = Object.fromEntries(
    muscles.map(({ muscle, status }) => [
      muscle,
      {
        fill: FILL[status],
        opacity: 0.9,
        label: t.muscleMap.regionLabel(t.muscle[muscle], t.muscleMap.status[status]),
      },
    ]),
  );

  return (
    <Card>
      <h2 className="font-sans label-caps">{t.muscleMap.todayTitle}</h2>
      {muscles.length === 0 ? (
        <p className="text-sm text-muted">{t.muscleMap.todayAllFresh}</p>
      ) : (
        <div className="flex items-center gap-4">
          <BodyMap
            regions={regions}
            frontLabel={t.muscleMap.front}
            backLabel={t.muscleMap.back}
            height={130}
          />
          <ul className="flex flex-1 flex-col gap-1 text-[13px]">
            {muscles.map(({ muscle, status }) => (
              <li key={muscle} className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ background: FILL[status] }}
                />
                <span className="font-semibold">{t.muscle[muscle]}</span>
                <span className="text-muted">{t.muscleMap.status[status]}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <Link to="/progres/otot" className="text-sm font-semibold text-accent">
        {t.muscleMap.open}
      </Link>
    </Card>
  );
}
