import { ActiveWorkout } from './ActiveWorkout';
import { useActiveSession } from './hooks/useWorkout';
import { StartWorkout } from './StartWorkout';

/** Tab Latihan: sesi aktif jika ada, selain itu persiapan (check-in & mulai). */
export function WorkoutScreen() {
  const { data, isPending } = useActiveSession();
  if (isPending) return null;
  return data ? <ActiveWorkout view={data} /> : <StartWorkout />;
}
