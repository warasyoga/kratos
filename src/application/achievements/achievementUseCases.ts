import {
  ACHIEVEMENT_IDS,
  earnedAchievements,
  longestRun,
  type AchievementFacts,
  type AchievementId,
} from '@/domain/achievements/rules';
import { toLocalDate } from '@/domain/common/clock';
import { addDays, startOfWeek } from '@/domain/common/weekday';
import { isLoaded } from '@/domain/exercise/types';
import { intakeByDay } from '@/domain/nutrition/intake';
import { calculateProteinTarget } from '@/domain/nutrition/macros';
import { weighInsOf } from '@/domain/progress/body';
import { e1rmSeries, prTimeline } from '@/domain/progress/strength';
import { MESOCYCLE_WEEKS } from '@/domain/standards';
import type { WorkingSetRecord } from '@/domain/workout/types';
import type { AppDeps } from '../deps';
import { ALL_TIME } from '../progress/strengthProgress';

const BENCH_ID = 'barbell-bench-press';
const SQUAT_ID = 'barbell-back-squat';

export interface AchievementView {
  id: AchievementId;
  unlockedAt: number | null;
}

const bestE1rm = (records: readonly WorkingSetRecord[], exerciseId: string) => {
  const points = e1rmSeries(records.filter((r) => r.exerciseId === exerciseId));
  return points.length > 0 ? Math.max(...points.map((p) => p.e1rmKg)) : null;
};

/** Lencana: hitung syarat dari riwayat, simpan yang baru terbuka. docs/fitur/11-pencapaian.md */
export function makeAchievementUseCases(deps: AppDeps) {
  async function facts(): Promise<AchievementFacts | null> {
    const [profile, bundle, finished, records, library, metrics, foods, photos] = await Promise.all(
      [
        deps.profiles.get(),
        deps.programs.getActive(),
        deps.sessions.listFinishedSince(ALL_TIME),
        deps.sessions.workingSetsSince(ALL_TIME),
        deps.exercises.list(),
        deps.bodyMetrics.list(),
        deps.nutrition.listFoodsSince(ALL_TIME),
        deps.photos.list(),
      ],
    );
    if (!profile) return null;
    const today = toLocalDate(deps.clock.now());

    // Minggu lengkap: jumlah sesi selesai ≥ jumlah hari latihan (sama dengan streak di Hari Ini).
    const perWeek = bundle?.days.length ?? profile.trainingDays.length;
    const counts = new Map<string, number>();
    for (const s of finished) {
      const week = startOfWeek(s.logDate);
      counts.set(week, (counts.get(week) ?? 0) + 1);
    }
    const completeWeeks = [...counts].filter(([, n]) => n >= perWeek).map(([week]) => week);

    const loaded = new Set(library.filter(isLoaded).map((e) => e.id));
    const loadedRecords = records.filter((r) => loaded.has(r.exerciseId));
    const bodyWeightKg = weighInsOf(metrics).at(-1)?.weightKg ?? null;

    // Hari dengan protein ≥ target (target dari berat terakhir).
    const proteinTarget =
      bodyWeightKg === null ? null : calculateProteinTarget(bodyWeightKg, profile.proteinGPerKg);
    const dates = [...new Set(foods.map((f) => f.logDate))];
    const proteinDays =
      proteinTarget === null
        ? []
        : intakeByDay(foods, dates)
            .filter((d) => d.intake.proteinG >= proteinTarget)
            .map((d) => d.logDate);

    // Blok tuntas: minggu ke-6 (deload) sudah lewat dan ada sesi selesai di minggu itu.
    let completedBlocks = 0;
    if (bundle) {
      const start = bundle.program.startDate;
      for (let block = 0; ; block++) {
        const end = addDays(start, 7 * MESOCYCLE_WEEKS * (block + 1));
        if (end > today) break;
        const deloadStart = addDays(end, -7);
        if (finished.some((s) => s.logDate >= deloadStart && s.logDate < end)) completedBlocks += 1;
      }
    }

    return {
      finishedSessions: finished.length,
      completeWeeks: completeWeeks.length,
      longestStreakWeeks: longestRun(completeWeeks, (w) => addDays(w, 7)),
      prCount: prTimeline(loadedRecords).length,
      benchE1rmKg: bestE1rm(loadedRecords, BENCH_ID),
      squatE1rmKg: bestE1rm(loadedRecords, SQUAT_ID),
      bodyWeightKg,
      longestProteinStreakDays: longestRun(proteinDays, (d) => addDays(d, 1)),
      completedBlocks,
      photoDates: new Set(photos.map((p) => p.logDate)).size,
    };
  }

  return {
    /** Semua lencana, terbuka atau terkunci, urut daftar. */
    async list(): Promise<AchievementView[]> {
      const unlocked = new Map(
        (await deps.achievements.list()).map((a) => [a.achievementId, a.unlockedAt]),
      );
      return ACHIEVEMENT_IDS.map((id) => ({ id, unlockedAt: unlocked.get(id) ?? null }));
    },

    /**
     * Cek syarat dan simpan lencana yang baru terbuka. Dipanggil setelah latihan, nutrisi,
     * ukuran, dan foto. Lencana yang sudah terbuka tidak dibuka lagi.
     */
    async sync(): Promise<AchievementId[]> {
      const f = await facts();
      if (!f) return [];
      const already = new Set((await deps.achievements.list()).map((a) => a.achievementId));
      const fresh = earnedAchievements(f).filter((id) => !already.has(id));
      const now = deps.clock.now();
      for (const achievementId of fresh)
        await deps.achievements.add({ id: deps.newId(), achievementId, unlockedAt: now });
      return fresh;
    },
  };
}
