import { Check } from 'lucide-react';
import { useState } from 'react';
import type { ActiveExerciseView } from '@/application/workout/sessionLifecycle';
import { useServices } from '@/application/ServicesContext';
import type { PlateInventory } from '@/domain/profile/types';
import type { SetLog } from '@/domain/workout/types';
import { t } from '@/shared/i18n/id';
import { cn } from '@/shared/lib/cn';
import { vibrate } from '@/shared/lib/device';
import { formatNumber } from '@/shared/lib/format';
import { useWorkoutAction } from '../hooks/useWorkout';
import { EditSetSheet } from './EditSetSheet';

export interface SetTableProps {
  view: ActiveExerciseView;
  inventory: PlateInventory;
  /** Dipanggil setelah set kerja dicentang (untuk menampilkan pertanyaan RIR). */
  onWorkingSetDone: (set: SetLog) => void;
}

const labelOf = (s: SetLog) =>
  s.kind === 'warmup' ? t.workout.warmupLabel(s.setNumber) : String(s.setNumber);

/** Tabel set: Set · Sebelumnya · kg · Reps · ✓. Mencentang = satu ketukan jika angka sesuai. */
export function SetTable({ view, inventory, onWorkingSetDone }: SetTableProps) {
  const { workout } = useServices();
  const { run, pending } = useWorkoutAction();
  const [editing, setEditing] = useState<SetLog | null>(null);
  const seconds = view.exercise.measure === 'seconds';
  const bodyweight = view.exercise.loadType === 'bodyweight';

  const toggle = async (set: SetLog) => {
    if (set.completedAt !== undefined) {
      await run(() => workout.sets.uncomplete(set.id));
      return;
    }
    const result = await run(() =>
      workout.sets.complete(set.id, { weightKg: set.weightKg, reps: set.reps }),
    );
    if (!result.ok) return;
    vibrate(40);
    if (set.kind === 'working') onWorkingSetDone(set);
  };

  return (
    <>
      <table className="w-full text-center text-sm tabular-nums">
        <thead>
          <tr className="text-[11px] tracking-[0.08em] text-muted uppercase">
            <th className="pb-1.5 font-bold">{t.workout.colSet}</th>
            <th className="pb-1.5 font-bold">{t.workout.colPrevious}</th>
            {!bodyweight && <th className="pb-1.5 font-bold">{t.workout.colWeight}</th>}
            <th className="pb-1.5 font-bold">
              {seconds ? t.workout.colSeconds : t.workout.colReps}
            </th>
            <th className="pb-1.5" />
          </tr>
        </thead>
        <tbody>
          {view.sets.map((set) => {
            const done = set.completedAt !== undefined;
            const label = labelOf(set);
            const previous = set.kind === 'working' ? view.previous[set.setNumber - 1] : undefined;
            const cell = cn(
              'min-h-10 min-w-12 rounded-[9px] px-2 py-2 font-bold',
              done ? 'bg-good-bg text-good' : 'bg-surface-2',
              set.kind === 'warmup' && !done && 'text-muted',
            );
            return (
              <tr key={set.id} className={cn(set.kind === 'warmup' && 'text-muted')}>
                <td className="py-1 font-semibold">{label}</td>
                <td className="py-1 text-[13px] text-muted">
                  {previous
                    ? `${bodyweight ? '' : `${formatNumber(previous.weightKg, 2)} × `}${previous.reps}`
                    : '—'}
                </td>
                {!bodyweight && (
                  <td className="py-1">
                    <button
                      type="button"
                      aria-label={t.workout.editSet(label)}
                      onClick={() => setEditing(set)}
                      className={cell}
                    >
                      {formatNumber(set.weightKg, 2)}
                    </button>
                  </td>
                )}
                <td className="py-1">
                  <button
                    type="button"
                    aria-label={t.workout.editSet(label)}
                    onClick={() => setEditing(set)}
                    className={cell}
                  >
                    {set.reps}
                  </button>
                </td>
                <td className="py-1">
                  <button
                    type="button"
                    aria-label={done ? t.workout.undoSet(label) : t.workout.completeSet(label)}
                    aria-pressed={done}
                    disabled={pending}
                    onClick={() => void toggle(set)}
                    className={cn(
                      'inline-grid size-11 place-items-center rounded-xl border-2 transition-colors',
                      done ? 'border-good bg-good text-surface' : 'border-line text-transparent',
                    )}
                  >
                    <Check className="size-5" strokeWidth={3} aria-hidden />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {editing && (
        <EditSetSheet
          set={editing}
          label={labelOf(editing)}
          exercise={view.exercise}
          inventory={inventory}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
