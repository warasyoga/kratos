import { computeWeightTrend } from '@/domain/body/weightTrend';
import { toLocalDate } from '@/domain/common/clock';
import { addDays, startOfWeek, weekdayOf } from '@/domain/common/weekday';
import { intakeByDay } from '@/domain/nutrition/intake';
import { calculateProteinTarget } from '@/domain/nutrition/macros';
import { decideCalorieAdjustment, recalibrationInput } from '@/domain/nutrition/recalibration';
import type { UserProfile } from '@/domain/profile/types';
import type { ProgramBundle } from '@/domain/program/types';
import { weighInsOf } from '@/domain/progress/body';
import { e1rmSeries } from '@/domain/progress/strength';
import { CALORIE_RECALIBRATION, MESOCYCLE_WEEKS, SUGGESTION } from '@/domain/standards';
import { blockWeek, earlyDeloadSignals, programWeek } from '@/domain/trainer/deload';
import type { SuggestionContext } from '@/domain/trainer/suggestions';
import type { AppDeps } from '../deps';

const DAY_MS = 86_400_000;
/** Riwayat latihan yang dibaca untuk deteksi stagnasi. */
const STAGNATION_LOOKBACK_DAYS = 120;
/** Check-in yang dipakai untuk rata-rata tidur (docs/mesin-trainer/04-saran-trainer.md). */
const SLEEP_WINDOW_DAYS = 14;

type HistoryInputs = Pick<
  SuggestionContext,
  | 'e1rmHistory'
  | 'attendance'
  | 'protein'
  | 'sleepHours'
  | 'calorieAdjustment'
  | 'earlyDeloadSuggested'
  | 'backupReferenceAt'
>;

/**
 * Data riwayat untuk aturan saran: 1RM per gerakan program, kehadiran 14 hari,
 * protein 7 hari, tidur 14 hari, kalibrasi kalori 14 hari, sinyal deload lebih awal,
 * dan waktu backup terakhir.
 * Data yang belum cukup dibiarkan kosong sehingga aturannya dilewati.
 */
export async function loadHistoryInputs(
  deps: AppDeps,
  bundle: ProgramBundle,
  profile: UserProfile,
): Promise<HistoryInputs> {
  const now = deps.clock.now();
  const today = toLocalDate(now);
  const programStart = bundle.program.startDate;
  const attendanceFrom = addDays(today, -SUGGESTION.lowAttendanceWindowDays);
  const proteinFrom = addDays(today, -SUGGESTION.lowProteinWindowDays);

  const [records, finished, checkIns, foods, metrics, lastBackupAt] = await Promise.all([
    deps.sessions.workingSetsSince(addDays(today, -STAGNATION_LOOKBACK_DAYS)),
    deps.sessions.listFinishedSince(attendanceFrom),
    deps.checkIns.listSince(addDays(today, -SLEEP_WINDOW_DAYS)),
    deps.nutrition.listFoodsSince(proteinFrom),
    deps.bodyMetrics.list(),
    deps.backup.lastBackupAt(),
  ]);
  const inputs: HistoryInputs = {};

  // Stagnasi: 1RM estimasi per sesi untuk setiap gerakan program.
  inputs.e1rmHistory = Object.fromEntries(
    bundle.exercises.map((pe) => [
      pe.id,
      e1rmSeries(records.filter((r) => r.exerciseId === pe.exerciseId)).map((p) => p.e1rmKg),
    ]),
  );

  // Kehadiran 14 hari penuh (hari ini belum dihitung), hanya jika program sudah berjalan selama itu.
  if (programStart <= attendanceFrom) {
    const days = new Set(bundle.days.map((d) => d.weekday));
    let scheduled = 0;
    for (let i = 0; i < SUGGESTION.lowAttendanceWindowDays; i++) {
      if (days.has(weekdayOf(addDays(attendanceFrom, i)))) scheduled += 1;
    }
    const completed = finished.filter((s) => s.logDate < today).length;
    inputs.attendance = { scheduled, completed };
  }

  const sleep = checkIns.map((c) => c.sleepHours);
  if (sleep.length > 0) inputs.sleepHours = sleep;

  // Protein 7 hari terakhir (hari ini belum selesai), hanya hari yang dicatat.
  const latestWeight = weighInsOf(metrics).at(-1)?.weightKg;
  if (latestWeight !== undefined) {
    const dates = Array.from({ length: SUGGESTION.lowProteinWindowDays }, (_, i) =>
      addDays(proteinFrom, i),
    );
    const dailyG = intakeByDay(foods, dates).map((d) => d.intake.proteinG);
    if (dailyG.length > 0)
      inputs.protein = {
        targetG: calculateProteinTarget(latestWeight, profile.proteinGPerKg),
        dailyG,
      };
  }

  // Kalibrasi kalori: paling cepat 14 hari setelah profil dibuat / koreksi terakhir.
  const since = profile.calorieAdjustedAt ?? profile.createdAt;
  if (now - since >= CALORIE_RECALIBRATION.everyDays * DAY_MS) {
    const weighIns = weighInsOf(metrics);
    const input = recalibrationInput(computeWeightTrend(weighIns), weighIns);
    if (input) inputs.calorieAdjustment = decideCalorieAdjustment(input);
  }
  // Deload lebih awal (docs/mesin-trainer/06-deload.md): sinyal dalam blok 6 minggu berjalan.
  const week = programWeek(programStart, today);
  const blockStart = addDays(
    programStart,
    7 * MESOCYCLE_WEEKS * Math.floor((week - 1) / MESOCYCLE_WEEKS),
  );
  const monday = startOfWeek(today);
  const blockRecords = records.filter((r) => r.logDate >= blockStart);
  const decreased = new Set(
    finished
      .filter((s) => s.logDate >= monday)
      .flatMap((s) => s.plan.filter((p) => p.decisionKind === 'decrease').map((p) => p.exerciseId)),
  );
  inputs.earlyDeloadSuggested =
    earlyDeloadSignals({
      blockWeek: blockWeek(week),
      e1rmHistory: bundle.exercises.map((pe) =>
        e1rmSeries(blockRecords.filter((r) => r.exerciseId === pe.exerciseId)).map((p) => p.e1rmKg),
      ),
      recentReadiness: checkIns
        .filter((c) => c.logDate > addDays(today, -7))
        .map((c) => c.readiness),
      decreaseDecisionsThisWeek: decreased.size,
    }).length > 0;

  // Pengingat backup: sejak backup terakhir, atau sejak profil dibuat jika belum pernah.
  inputs.backupReferenceAt = lastBackupAt ?? profile.createdAt;
  return inputs;
}
