import { ChevronDown, ChevronLeft, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router';
import type { ProgramDayView } from '@/application/program/getActiveProgram';
import { useServices } from '@/application/ServicesContext';
import { t } from '@/shared/i18n/id';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { ScreenHeader } from '@/shared/ui/ScreenHeader';
import { EditExerciseSheet } from './components/EditExerciseSheet';
import { MoveDaySheet } from './components/MoveDaySheet';
import { useActiveProgram, useProgramAction } from './hooks/useProgram';

type Item = ProgramDayView['exercises'][number];

/** Edit satu hari latihan: urutan, resep, ganti/hapus/tambah gerakan, pindah hari. */
export function DayEditScreen() {
  const { dayId = '' } = useParams();
  const { program } = useServices();
  const { data } = useActiveProgram();
  const { run, pending } = useProgramAction();
  const [editing, setEditing] = useState<Item | null>(null);
  const [moving, setMoving] = useState(false);

  const view = data?.days.find((d) => d.day.id === dayId);
  if (!data || !view) return <ScreenHeader title={t.program.title} />;

  const ids = view.exercises.map((e) => e.programExercise.id);
  const move = (index: number, delta: number) => {
    const next = [...ids];
    const [moved] = next.splice(index, 1);
    if (moved === undefined) return;
    next.splice(index + delta, 0, moved);
    void run(() => program.edit.reorderDay(view.day.id, next));
  };
  const otherLabels = new Map(
    data.days.filter((d) => d.day.id !== view.day.id).map((d) => [d.day.weekday, d.day.label]),
  );

  return (
    <div className="flex flex-col gap-3.5">
      <Link
        to="/program"
        className="flex min-h-11 items-center gap-1 text-sm font-semibold text-accent"
      >
        <ChevronLeft className="size-4" aria-hidden />
        {t.program.back}
      </Link>
      <ScreenHeader
        eyebrow={`${t.weekdayLong[view.day.weekday]} · ${t.program.daySets(view.totalSets, view.estimatedMinutes)}`}
        title={view.day.label}
        aside={
          <Button size="sm" variant="ghost" onClick={() => setMoving(true)}>
            {t.program.moveDay}
          </Button>
        }
      />

      <Card>
        <ol className="flex flex-col divide-y divide-line">
          {view.exercises.map((item, index) => {
            const { programExercise: pe, exercise } = item;
            return (
              <li key={pe.id} className="flex items-center gap-2 py-2">
                <div className="flex flex-col">
                  <button
                    type="button"
                    aria-label={t.program.moveUp(exercise.name)}
                    disabled={index === 0 || pending}
                    onClick={() => move(index, -1)}
                    className="grid size-8 place-items-center rounded-lg text-muted disabled:opacity-30"
                  >
                    <ChevronUp className="size-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    aria-label={t.program.moveDown(exercise.name)}
                    disabled={index === ids.length - 1 || pending}
                    onClick={() => move(index, 1)}
                    className="grid size-8 place-items-center rounded-lg text-muted disabled:opacity-30"
                  >
                    <ChevronDown className="size-4" aria-hidden />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setEditing(item)}
                  className="flex min-h-12 flex-1 flex-col items-start text-left"
                >
                  <span className="font-semibold">{exercise.name}</span>
                  <span className="text-[13px] text-muted tabular-nums">
                    {t.program.prescription(
                      pe.sets,
                      pe.repMin,
                      pe.repMax,
                      exercise.measure === 'seconds',
                    )}{' '}
                    · {t.program.rest(pe.restSec)}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
        <Link
          to={`/gerakan?tambah=${view.day.id}`}
          className="grid min-h-12 place-items-center rounded-[14px] bg-surface-2 font-bold"
        >
          + {t.program.addExercise}
        </Link>
      </Card>

      {editing && <EditExerciseSheet item={editing} onClose={() => setEditing(null)} />}
      {moving && (
        <MoveDaySheet day={view.day} labels={otherLabels} onClose={() => setMoving(false)} />
      )}
    </div>
  );
}
