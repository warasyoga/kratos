import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import type { ActiveSessionView } from '@/application/workout/sessionLifecycle';
import { useServices } from '@/application/ServicesContext';
import { WARMUP_REST_SEC } from '@/domain/workout/buildSession';
import type { SetLog } from '@/domain/workout/types';
import { t } from '@/shared/i18n/id';
import { formatClock, useNow, useWakeLock } from '@/shared/lib/device';
import { Button } from '@/shared/ui/Button';
import { Chip } from '@/shared/ui/Chip';
import { ExerciseCard } from './components/ExerciseCard';
import { RestTimer } from './components/RestTimer';
import { useWorkoutAction } from './hooks/useWorkout';

/** Layar yang dipakai di gym selama sesi berjalan. docs/fitur/05-mode-latihan.md */
export function ActiveWorkout({ view }: { view: ActiveSessionView }) {
  const { workout, clock } = useServices();
  const navigate = useNavigate();
  const { run, pending } = useWorkoutAction();
  const now = useNow(clock.now, 1000);
  useWakeLock(true);

  const firstUnfinished = view.exercises.findIndex((e) =>
    e.sets.some((s) => s.completedAt === undefined),
  );
  const [index, setIndex] = useState(Math.max(0, firstUnfinished));
  const [rirFor, setRirFor] = useState<SetLog | null>(null);
  const [confirm, setConfirm] = useState<'finish' | 'discard' | null>(null);

  const current = view.exercises[Math.min(index, view.exercises.length - 1)];
  const allSets = view.exercises.flatMap((e) => e.sets);
  const lastDone = allSets
    .filter((s) => s.completedAt !== undefined && s.restEndsAt !== undefined)
    .sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0))[0];
  const lastDonePlan =
    lastDone && view.session.plan.find((p) => p.programExerciseId === lastDone.programExerciseId);
  const doneCount = allSets.filter((s) => s.completedAt !== undefined).length;

  const go = (delta: number) => {
    setRirFor(null);
    setIndex((i) => Math.min(view.exercises.length - 1, Math.max(0, i + delta)));
  };

  const finish = async () => {
    const result = await run(() => workout.finish());
    if (result.ok) navigate(`/latihan/ringkasan/${result.value.sessionId}`, { replace: true });
  };
  const discard = async () => {
    const result = await run(() => workout.discard());
    if (result.ok) setConfirm(null);
  };

  if (!current) return null;
  return (
    <div className="flex flex-col gap-3.5 pb-24">
      <div className="flex items-center justify-between gap-2">
        <Chip tone="accent">
          {view.session.dayLabel} · {t.workout.exerciseOf(index + 1, view.exercises.length)}
        </Chip>
        <span className="font-bold text-muted tabular-nums">
          ⏱ {formatClock((now - view.session.startedAt) / 1000)}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={t.workout.title}
        aria-valuemin={0}
        aria-valuemax={allSets.length}
        aria-valuenow={doneCount}
        className="h-1.5 overflow-hidden rounded-full bg-surface-2"
      >
        <div
          className="h-full rounded-full bg-accent"
          style={{ width: `${(doneCount / Math.max(1, allSets.length)) * 100}%` }}
        />
      </div>
      {view.session.adjustment !== 'none' && (
        <p className="rounded-[14px] bg-warn-bg px-3.5 py-2.5 text-[13px] text-warn">
          {view.session.isDeloadWeek
            ? t.workout.deloadWeek
            : t.workout.adjustment[view.session.adjustment]}
        </p>
      )}

      <ExerciseCard
        key={current.plan.programExerciseId}
        view={current}
        inventory={view.inventory}
        rirFor={rirFor}
        onWorkingSetDone={setRirFor}
        onRirDone={() => setRirFor(null)}
      />

      <div className="grid grid-cols-2 gap-2">
        <Button variant="ghost" disabled={index === 0} onClick={() => go(-1)}>
          <ChevronLeft className="size-4" aria-hidden />
          {t.workout.prevExercise}
        </Button>
        <Button variant="ghost" disabled={index >= view.exercises.length - 1} onClick={() => go(1)}>
          {t.workout.nextExercise}
          <ChevronRight className="size-4" aria-hidden />
        </Button>
      </div>

      {confirm ? (
        <div
          role="alertdialog"
          aria-label={t.workout.finish}
          className="flex flex-col gap-2 rounded-[18px] border border-line bg-surface p-4"
        >
          <p className="text-sm">
            {confirm === 'finish' ? t.workout.finishConfirm : t.workout.discardConfirm}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="ghost" onClick={() => setConfirm(null)}>
              {t.common.cancel}
            </Button>
            <Button
              disabled={pending}
              onClick={() => void (confirm === 'finish' ? finish() : discard())}
            >
              {confirm === 'finish' ? t.workout.finishYes : t.workout.discardYes}
            </Button>
          </div>
        </div>
      ) : (
        <>
          <Button fullWidth onClick={() => setConfirm('finish')}>
            {t.workout.finish}
          </Button>
          <button
            type="button"
            onClick={() => setConfirm('discard')}
            className="min-h-11 text-sm font-semibold text-muted"
          >
            {t.workout.discard}
          </button>
        </>
      )}

      {lastDone && lastDonePlan && (
        <RestTimer
          key={lastDone.id}
          set={lastDone}
          totalSec={lastDone.kind === 'warmup' ? WARMUP_REST_SEC : lastDonePlan.restSec}
        />
      )}
    </div>
  );
}
