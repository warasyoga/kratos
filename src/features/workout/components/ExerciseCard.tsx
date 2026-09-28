import { Link } from 'react-router';
import type { ActiveExerciseView } from '@/application/workout/sessionLifecycle';
import type { PlateInventory } from '@/domain/profile/types';
import type { SessionExercisePlan, SetLog } from '@/domain/workout/types';
import { t } from '@/shared/i18n/id';
import { formatKg } from '@/shared/lib/format';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { useServices } from '@/application/ServicesContext';
import { useWorkoutAction } from '../hooks/useWorkout';
import { PlateLoader } from './PlateLoader';
import { RirPicker } from './RirPicker';
import { SetTable } from './SetTable';

/** Catatan trainer untuk keputusan beban sesi ini. */
function trainerNote(plan: SessionExercisePlan): string {
  const notes = t.workout.notes;
  const prev = plan.previousWeightKg === null ? '' : formatKg(plan.previousWeightKg);
  switch (plan.decision) {
    case 'all_sets_hit_top':
      return notes.all_sets_hit_top(prev);
    case 'missed_min_twice':
      return notes.missed_min_twice(prev);
    default:
      return notes[plan.decision];
  }
}

export interface ExerciseCardProps {
  view: ActiveExerciseView;
  inventory: PlateInventory;
  rirFor: SetLog | null;
  onWorkingSetDone: (set: SetLog) => void;
  onRirDone: () => void;
}

export function ExerciseCard({
  view,
  inventory,
  rirFor,
  onWorkingSetDone,
  onRirDone,
}: ExerciseCardProps) {
  const { workout } = useServices();
  const { run, pending } = useWorkoutAction();
  const { plan, exercise } = view;
  const seconds = exercise.measure === 'seconds';
  const nextWorking = view.sets.find((s) => s.kind === 'working' && s.completedAt === undefined);
  const pendingRir = rirFor && view.sets.find((s) => s.id === rirFor.id);

  return (
    <div className="flex flex-col gap-3.5">
      <div>
        <h1 className="text-[30px] leading-none uppercase">{exercise.name}</h1>
        <p className="text-[13px] text-muted">
          {exercise.primaryMuscles.map((m) => t.muscle[m]).join(', ')} ·{' '}
          <Link to={`/gerakan/${exercise.id}`} className="font-semibold text-accent">
            {t.workout.guide}
          </Link>
        </p>
      </div>
      {plan.painFlag && (
        <p className="rounded-[14px] bg-warn-bg px-3.5 py-2.5 text-[13px] text-warn">
          {t.workout.painFlag}
        </p>
      )}

      <Card>
        <p className="font-sans label-caps">
          {t.workout.target(plan.sets, plan.repMin, plan.repMax, plan.targetRir, seconds)}
        </p>
        <SetTable view={view} inventory={inventory} onWorkingSetDone={onWorkingSetDone} />
        {pendingRir && !seconds && <RirPicker set={pendingRir} onDone={onRirDone} />}
        <Button
          variant="ghost"
          size="sm"
          disabled={pending}
          onClick={() => void run(() => workout.sets.addSet(plan.programExerciseId))}
        >
          {t.workout.addSet}
        </Button>
      </Card>

      {exercise.loadType === 'barbell' && nextWorking && (
        <Card>
          <PlateLoader targetKg={nextWorking.weightKg} inventory={inventory} />
        </Card>
      )}

      <section
        aria-label={t.workout.note}
        className="flex flex-col gap-1 rounded-[18px] border border-gold-line bg-gold-bg p-3.5"
      >
        <h2 className="font-sans label-caps text-gold">{t.workout.note}</h2>
        <p className="text-sm">{trainerNote(plan)}</p>
      </section>
    </div>
  );
}
