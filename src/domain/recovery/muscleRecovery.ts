import { MUSCLES, type Exercise, type Muscle } from '../exercise/types';
import { MUSCLE_RECOVERY, SECONDARY_MUSCLE_SET_WEIGHT } from '../standards';
import type { WorkingSetRecord } from '../workout/types';

/** Semua otot, urutan tampilan peta otot. */
export const ALL_MUSCLES: readonly Muscle[] = MUSCLES;

export type RecoveryStatus = 'fresh' | 'partial' | 'recent';

export interface MuscleRecovery {
  muscle: Muscle;
  status: RecoveryStatus;
  /** Set terakhir yang melatih otot ini, atau null jika belum pernah (dalam riwayat yang dibaca). */
  lastTrainedAt: number | null;
  /** Kelelahan sesi terakhir: Σ set (utama 1, pendukung 0,5). */
  fatigueSets: number;
  recoveryHours: number;
  /** Perkiraan pulih penuh. */
  recoveredAt: number | null;
}

const HOUR_MS = 3_600_000;

/**
 * Waktu pulih: 48 jam, +24 jam jika kelelahan ≥ 6 set atau RIR rata-rata ≤ 1 (maks. 72 jam).
 * docs/sains-latihan/05-keamanan-dan-pemulihan.md §3
 */
export function recoveryHours(fatigueSets: number, averageRir: number | null): number {
  const heavy =
    fatigueSets >= MUSCLE_RECOVERY.heavySets ||
    (averageRir !== null && averageRir <= MUSCLE_RECOVERY.hardRir);
  return Math.min(
    MUSCLE_RECOVERY.baseHours + (heavy ? MUSCLE_RECOVERY.extraHours : 0),
    MUSCLE_RECOVERY.maxHours,
  );
}

/** Segar (lewat waktu pulih) · pulih sebagian (50–100%) · baru dilatih (< 50%). */
export function recoveryStatus(elapsedHours: number, neededHours: number): RecoveryStatus {
  const ratio = elapsedHours / neededHours;
  if (ratio >= 1) return 'fresh';
  if (ratio >= MUSCLE_RECOVERY.partialRatio) return 'partial';
  return 'recent';
}

/** Status pemulihan tiap otot dari set kerja yang sudah dikerjakan. */
export function muscleRecovery(
  records: readonly WorkingSetRecord[],
  exerciseById: (id: string) => Exercise | undefined,
  now: number,
): MuscleRecovery[] {
  return ALL_MUSCLES.map((muscle) => {
    const hits = records.flatMap((r) => {
      const exercise = exerciseById(r.exerciseId);
      if (!exercise || r.completedAt === undefined) return [];
      const weight = exercise.primaryMuscles.includes(muscle)
        ? 1
        : exercise.secondaryMuscles.includes(muscle)
          ? SECONDARY_MUSCLE_SET_WEIGHT
          : 0;
      return weight > 0 ? [{ record: r, completedAt: r.completedAt, weight }] : [];
    });
    const last = hits.reduce<(typeof hits)[number] | undefined>(
      (best, h) => (!best || h.completedAt > best.completedAt ? h : best),
      undefined,
    );
    if (!last) {
      return {
        muscle,
        status: 'fresh',
        lastTrainedAt: null,
        fatigueSets: 0,
        recoveryHours: MUSCLE_RECOVERY.baseHours,
        recoveredAt: null,
      };
    }

    const session = hits.filter((h) => h.record.sessionId === last.record.sessionId);
    const fatigueSets = session.reduce((n, h) => n + h.weight, 0);
    const rirs = session.flatMap((h) => (h.record.rir === undefined ? [] : [h.record.rir]));
    const averageRir = rirs.length > 0 ? rirs.reduce((a, b) => a + b, 0) / rirs.length : null;
    const hours = recoveryHours(fatigueSets, averageRir);
    const lastTrainedAt = Math.max(...session.map((h) => h.completedAt));
    return {
      muscle,
      status: recoveryStatus((now - lastTrainedAt) / HOUR_MS, hours),
      lastTrainedAt,
      fatigueSets,
      recoveryHours: hours,
      recoveredAt: lastTrainedAt + hours * HOUR_MS,
    };
  });
}
