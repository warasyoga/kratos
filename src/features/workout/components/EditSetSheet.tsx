import { useState } from 'react';
import { useServices } from '@/application/ServicesContext';
import type { Exercise } from '@/domain/exercise/types';
import type { PlateInventory } from '@/domain/profile/types';
import { adjacentLoad } from '@/domain/strength/loads';
import type { SetLog } from '@/domain/workout/types';
import { errorText, t } from '@/shared/i18n/id';
import { formatNumber } from '@/shared/lib/format';
import { Button } from '@/shared/ui/Button';
import { Sheet } from '@/shared/ui/Sheet';
import { Stepper } from '@/shared/ui/Stepper';
import { useWorkoutAction } from '../hooks/useWorkout';

export interface EditSetSheetProps {
  set: SetLog;
  label: string;
  exercise: Exercise;
  inventory: PlateInventory;
  onClose: () => void;
}

/** Atur beban & repetisi satu set. Tombol ± melompat ke beban yang benar-benar bisa dipasang. */
export function EditSetSheet({ set, label, exercise, inventory, onClose }: EditSetSheetProps) {
  const { workout } = useServices();
  const { run, pending } = useWorkoutAction();
  const [weightKg, setWeight] = useState(set.weightKg);
  const [reps, setReps] = useState(set.reps);
  const [errors, setErrors] = useState<Record<string, string>>();
  const seconds = exercise.measure === 'seconds';

  const save = async () => {
    const result = await run(() => workout.sets.update(set.id, { weightKg, reps }));
    if (!result.ok) return setErrors(result.error.fields);
    onClose();
  };

  return (
    <Sheet
      open
      title={t.workout.editSetTitle(exercise.name, label)}
      onClose={onClose}
      footer={
        <Button fullWidth disabled={pending} onClick={() => void save()}>
          {t.common.save}
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        {exercise.loadType !== 'bodyweight' && (
          <Stepper
            label={`${t.workout.weight}${exercise.loadType === 'dumbbell' ? ` (${t.workout.perHand})` : ''}`}
            value={weightKg}
            min={0}
            max={500}
            suffix="kg"
            format={(v) => formatNumber(v, 2)}
            stepTo={(v, dir) => adjacentLoad(exercise.loadType, v, dir, inventory)}
            onChange={setWeight}
          />
        )}
        <Stepper
          label={seconds ? t.workout.seconds : t.workout.reps}
          value={reps}
          min={0}
          max={300}
          step={seconds ? 5 : 1}
          onChange={setReps}
        />
        {errors && (
          <p className="text-[13px] text-bad">
            {Object.values(errors)
              .map((c) => errorText(c))
              .join(' ')}
          </p>
        )}
      </div>
    </Sheet>
  );
}
