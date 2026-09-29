import { addDays, WEEKDAYS, type Weekday } from '../common/weekday';
import type { Exercise, Muscle } from '../exercise/types';
import { weeklySetsPerMuscle, type VolumeEntry } from '../program/volume';
import { tonnageOf } from '../workout/sessionMath';
import type { WorkingSetRecord } from '../workout/types';

export interface WeekTonnage {
  weekStart: string;
  tonnageKg: number;
}

export interface WeekAttendance {
  weekStart: string;
  done: number;
  scheduled: number;
}

/**
 * Set kerja per otot dari set yang benar-benar dikerjakan
 * (otot pendukung ½ set, sama dengan hitungan program).
 */
export function completedSetsPerMuscle(
  records: readonly WorkingSetRecord[],
  exerciseById: (id: string) => Exercise | undefined,
): Map<Muscle, number> {
  const entries = new Map<string, VolumeEntry>();
  for (const r of records) {
    const exercise = exerciseById(r.exerciseId);
    if (!exercise) continue;
    const key = `${r.exerciseId}|${r.logDate}`;
    const entry = entries.get(key);
    if (entry) entry.sets += 1;
    else entries.set(key, { exercise, sets: 1, dayKey: r.logDate });
  }
  return weeklySetsPerMuscle([...entries.values()]);
}

/** Total tonase (Σ beban × repetisi) per minggu. `weeks` = tanggal Senin. */
export function weeklyTonnage(
  records: readonly WorkingSetRecord[],
  weeks: readonly string[],
): WeekTonnage[] {
  return weeks.map((weekStart) => {
    const end = addDays(weekStart, 7);
    return {
      weekStart,
      tonnageKg: tonnageOf(records.filter((r) => r.logDate >= weekStart && r.logDate < end)),
    };
  });
}

/**
 * Sesi selesai vs terjadwal per minggu. Hari terjadwal dihitung jika sudah tiba (≤ hari ini)
 * dan tidak sebelum program dimulai.
 */
export function weeklyAttendance(
  finishedDates: readonly string[],
  schedule: readonly Weekday[],
  weeks: readonly string[],
  today: string,
  programStart: string,
): WeekAttendance[] {
  return weeks.map((weekStart) => {
    const end = addDays(weekStart, 7);
    const scheduled = schedule.filter((day) => {
      const date = addDays(weekStart, WEEKDAYS.indexOf(day));
      return date <= today && date >= programStart;
    }).length;
    const done = finishedDates.filter((d) => d >= weekStart && d < end).length;
    return { weekStart, done, scheduled };
  });
}
