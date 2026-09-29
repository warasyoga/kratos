import { useQuery } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { queryKeys } from '@/application/queryKeys';
import { useServices } from '@/application/ServicesContext';
import { toLocalDate } from '@/domain/common/clock';
import type { Muscle } from '@/domain/exercise/types';
import { t } from '@/shared/i18n/id';
import { formatDayDate, formatNumber, formatWeekday } from '@/shared/lib/format';
import { BodyMap } from '@/shared/ui/BodyMap';
import { Card } from '@/shared/ui/Card';
import { ScreenHeader } from '@/shared/ui/ScreenHeader';
import { SegmentedControl } from '@/shared/ui/SegmentedControl';
import { Sheet } from '@/shared/ui/Sheet';
import { muscleRegions, STATUS_FILL, type MapMode } from './muscleRegions';

/** Peta otot: pemulihan atau volume minggu ini; ketuk otot untuk detail. docs/fitur/12-peta-otot.md */
export function MuscleMapScreen() {
  const { progress, clock } = useServices();
  const navigate = useNavigate();
  const { data = [] } = useQuery({ queryKey: queryKeys.muscles, queryFn: progress.muscles });
  const [mode, setMode] = useState<MapMode>('recovery');
  const [selected, setSelected] = useState<Muscle>();
  const entry = data.find((m) => m.muscle === selected);
  const now = clock.now();

  return (
    <div className="flex flex-col gap-3.5">
      <button
        type="button"
        onClick={() => void navigate(-1)}
        className="flex min-h-11 items-center gap-1 self-start text-sm font-semibold text-accent"
      >
        <ChevronLeft className="size-4" aria-hidden />
        {t.common.back}
      </button>
      <ScreenHeader title={t.muscleMap.title} />
      <SegmentedControl
        label={t.muscleMap.modeLabel}
        options={(['recovery', 'volume'] as const).map((value) => ({
          value,
          label: t.muscleMap.modes[value],
        }))}
        value={mode}
        onChange={setMode}
      />
      <Card>
        <BodyMap
          regions={muscleRegions(data, mode)}
          frontLabel={t.muscleMap.front}
          backLabel={t.muscleMap.back}
          onSelect={(id) => setSelected(id as Muscle)}
          height={240}
        />
        {mode === 'recovery' ? (
          <ul className="flex flex-wrap justify-center gap-3 text-xs font-semibold">
            {(['fresh', 'partial', 'recent'] as const).map((status) => (
              <li key={status} className="flex items-center gap-1.5">
                <span
                  aria-hidden
                  className="size-3 rounded-full"
                  style={{ background: STATUS_FILL[status] }}
                />
                {t.muscleMap.status[status]}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-xs text-muted">{t.muscleMap.legendVolume}</p>
        )}
      </Card>

      <Card>
        <ul className="flex flex-col divide-y divide-line">
          {data.map((m) => (
            <li key={m.muscle}>
              <button
                type="button"
                onClick={() => setSelected(m.muscle)}
                className="flex min-h-11 w-full items-center gap-3 py-1.5 text-left text-sm"
              >
                <span
                  aria-hidden
                  className="size-3 shrink-0 rounded-full"
                  style={{ background: STATUS_FILL[m.status] }}
                />
                <span className="flex-1 font-semibold">{t.muscle[m.muscle]}</span>
                <span className="text-xs text-muted">{t.muscleMap.status[m.status]}</span>
                <span className="w-12 text-right text-xs font-semibold tabular-nums">
                  {t.muscleMap.setsValue(formatNumber(m.setsThisWeek))}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted">{t.muscleMap.rule}</p>
      </Card>

      {entry && (
        <Sheet open title={t.muscle[entry.muscle]} onClose={() => setSelected(undefined)}>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="text-muted">{t.muscleMap.modes.recovery}</dt>
            <dd className="font-semibold">{t.muscleMap.status[entry.status]}</dd>
            <dt className="text-muted">{t.muscleMap.setsThisWeek}</dt>
            <dd className="font-semibold tabular-nums">{formatNumber(entry.setsThisWeek)}</dd>
            <dt className="text-muted">{t.muscleMap.lastTrained}</dt>
            <dd>
              {entry.lastTrainedAt === null
                ? t.muscleMap.never
                : formatDayDate(toLocalDate(entry.lastTrainedAt))}
            </dd>
            <dt className="text-muted">{t.muscleMap.readyAt}</dt>
            <dd className="font-semibold">
              {entry.recoveredAt === null || entry.recoveredAt <= now
                ? t.muscleMap.readyNow
                : t.muscleMap.dayPart(
                    formatWeekday(entry.recoveredAt),
                    new Date(entry.recoveredAt).getHours(),
                  )}
            </dd>
          </dl>
        </Sheet>
      )}
    </div>
  );
}
