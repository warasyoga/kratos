import { useServices } from '@/application/ServicesContext';
import { RIR_CAP } from '@/domain/standards';
import type { SetLog } from '@/domain/workout/types';
import { t } from '@/shared/i18n/id';
import { formatKg } from '@/shared/lib/format';
import { SegmentedControl } from '@/shared/ui/SegmentedControl';
import { useToast } from '@/shared/ui/toastContext';
import { useWorkoutAction } from '../hooks/useWorkout';

const OPTIONS = Array.from({ length: RIR_CAP + 1 }, (_, i) => ({
  value: String(i),
  label: i === RIR_CAP ? `${i}+` : String(i),
}));

/** Pertanyaan RIR setelah set kerja (docs/sains-latihan/02 §3). */
export function RirPicker({ set, onDone }: { set: SetLog; onDone: () => void }) {
  const { workout } = useServices();
  const toast = useToast();
  const { run } = useWorkoutAction();

  const rate = async (value: string) => {
    const result = await run(() => workout.sets.rate(set.id, Number(value)));
    if (result.ok && result.value.nextWeightKg !== null) {
      toast(t.workout.rirNext(formatKg(result.value.nextWeightKg)));
    }
    onDone();
  };

  return (
    <div className="flex flex-col gap-2 rounded-[14px] bg-accent-soft p-3">
      <p className="text-sm font-semibold">{t.workout.rirQuestion}</p>
      <SegmentedControl
        label={t.workout.rirQuestion}
        options={OPTIONS}
        value={set.rir === undefined ? undefined : String(set.rir)}
        onChange={(v) => void rate(v)}
      />
      <p className="text-xs text-muted">{t.workout.rirHint}</p>
    </div>
  );
}
