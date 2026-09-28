import { z } from 'zod';
import { err, ok, type Result } from '@/domain/common/result';
import { isLoaded } from '@/domain/exercise/types';
import { nextCalibrationLoad } from '@/domain/strength/calibration';
import { estimateOneRepMax } from '@/domain/strength/oneRepMax';
import { RIR_CAP } from '@/domain/standards';
import { WARMUP_REST_SEC } from '@/domain/workout/buildSession';
import type { SessionExercisePlan, SetLog, WorkoutSession } from '@/domain/workout/types';
import type { AppDeps } from '../deps';
import { validate } from '../validation';
import { sortSets } from './sessionLifecycle';

const setValuesSchema = z.object({
  weightKg: z
    .number({ error: 'number_required' })
    .min(0, { error: 'set_weight_range' })
    .max(500, { error: 'set_weight_range' }),
  reps: z
    .number({ error: 'number_required' })
    .int()
    .min(0, { error: 'set_reps_range' })
    .max(300, { error: 'set_reps_range' }),
});

const rirSchema = z
  .number({ error: 'number_required' })
  .int()
  .min(0, { error: 'rir_value_range' })
  .max(RIR_CAP, { error: 'rir_value_range' });

interface Loaded {
  session: WorkoutSession;
  sets: SetLog[];
  set: SetLog;
  plan: SessionExercisePlan;
}

/** Aksi per set di sesi aktif: centang, ubah, RIR, tambah set, atur istirahat. */
export function makeSetActions(deps: AppDeps) {
  async function load(setId: string): Promise<Result<Loaded>> {
    const session = await deps.sessions.getActive();
    if (!session) return err({ code: 'no_active_session', message: 'Tidak ada sesi aktif' });
    const sets = await deps.sessions.listSets(session.id);
    const set = sets.find((s) => s.id === setId);
    const plan = set && session.plan.find((p) => p.programExerciseId === set.programExerciseId);
    if (!set || !plan) return err({ code: 'not_found', message: 'Set tidak ditemukan' });
    return ok({ session, sets, set, plan });
  }

  /** Set kerja berikutnya yang belum dikerjakan untuk gerakan yang sama. */
  const laterWorkingSets = ({ sets, set }: Loaded) =>
    sortSets(sets.filter((s) => s.programExerciseId === set.programExerciseId)).filter(
      (s) => s.kind === 'working' && s.completedAt === undefined && s.setNumber > set.setNumber,
    );

  return {
    /**
     * Ubah beban/repetisi satu set. Beban baru pada set kerja ikut dibawa ke set kerja
     * berikutnya yang belum dikerjakan (biasanya pengguna mengatur beban sebelum mencentang).
     */
    async update(setId: string, raw: unknown): Promise<Result<void>> {
      const values = validate(setValuesSchema, raw);
      if (!values.ok) return values;
      const loaded = await load(setId);
      if (!loaded.ok) return loaded;
      const { set } = loaded.value;
      const carried =
        set.kind === 'working' && values.value.weightKg !== set.weightKg
          ? laterWorkingSets(loaded.value).map((s) => ({ ...s, weightKg: values.value.weightKg }))
          : [];
      await deps.sessions.saveSets([{ ...set, ...values.value }, ...carried]);
      return ok(undefined);
    },

    /**
     * Centang set: catat hasil, mulai timer istirahat, dan bawa beban baru ke set berikutnya
     * (docs/fitur/05-mode-latihan.md "Kasus tepi"). Mengembalikan 1RM estimasi set ini.
     */
    async complete(
      setId: string,
      raw: unknown,
    ): Promise<Result<{ restEndsAt: number; e1rm: number | null }>> {
      const values = validate(setValuesSchema, raw);
      if (!values.ok) return values;
      const loaded = await load(setId);
      if (!loaded.ok) return loaded;
      const { set, plan } = loaded.value;
      const now = deps.clock.now();
      const restSec = set.kind === 'warmup' ? WARMUP_REST_SEC : plan.restSec;
      const done: SetLog = {
        ...set,
        ...values.value,
        completedAt: now,
        restEndsAt: now + restSec * 1000,
      };

      const carried =
        set.kind === 'working' && values.value.weightKg !== set.weightKg
          ? laterWorkingSets(loaded.value).map((s) => ({ ...s, weightKg: values.value.weightKg }))
          : [];
      await deps.sessions.saveSets([done, ...carried]);

      const e1rm =
        set.kind === 'working' && done.weightKg > 0 && done.reps > 0
          ? estimateOneRepMax(done.weightKg, Math.max(1, Math.round(done.reps)))
          : null;
      return ok({ restEndsAt: done.restEndsAt ?? now, e1rm });
    },

    async uncomplete(setId: string): Promise<Result<void>> {
      const loaded = await load(setId);
      if (!loaded.ok) return loaded;
      const { completedAt: _c, restEndsAt: _r, ...rest } = loaded.value.set;
      await deps.sessions.saveSets([rest]);
      return ok(undefined);
    },

    /**
     * Catat RIR set yang sudah dikerjakan. Saat kalibrasi (gerakan baru),
     * beban set berikutnya disesuaikan dari RIR (docs/sains-latihan/02 §7).
     */
    async rate(setId: string, rawRir: unknown): Promise<Result<{ nextWeightKg: number | null }>> {
      const rir = validate(rirSchema, rawRir);
      if (!rir.ok) return rir;
      const loaded = await load(setId);
      if (!loaded.ok) return loaded;
      const { set, plan } = loaded.value;
      const updates: SetLog[] = [{ ...set, rir: rir.value }];

      let nextWeightKg: number | null = null;
      if (plan.decision === 'calibration' && set.kind === 'working') {
        const [exercise, inventory] = await Promise.all([
          deps.exercises.get(set.exerciseId),
          deps.gym.getInventory(),
        ]);
        if (exercise && isLoaded(exercise)) {
          nextWeightKg = nextCalibrationLoad(exercise, set.weightKg, rir.value, inventory);
          updates.push(
            ...laterWorkingSets(loaded.value).map((s) => ({
              ...s,
              weightKg: nextWeightKg as number,
            })),
          );
        }
      }
      await deps.sessions.saveSets(updates);
      return ok({ nextWeightKg });
    },

    /** Tambah satu set kerja (salinan set terakhir). */
    async addSet(programExerciseId: string): Promise<Result<void>> {
      const session = await deps.sessions.getActive();
      if (!session) return err({ code: 'no_active_session', message: 'Tidak ada sesi aktif' });
      const working = (await deps.sessions.listSets(session.id)).filter(
        (s) => s.programExerciseId === programExerciseId && s.kind === 'working',
      );
      const last = working.sort((a, b) => b.setNumber - a.setNumber)[0];
      if (!last) return err({ code: 'not_found', message: 'Gerakan tidak ditemukan' });
      const { completedAt: _c, restEndsAt: _r, rir: _rir, ...template } = last;
      await deps.sessions.saveSets([
        { ...template, id: deps.newId(), setNumber: last.setNumber + 1 },
      ]);
      return ok(undefined);
    },

    /** Geser akhir istirahat (±detik) atau lewati (skip = true). */
    async adjustRest(
      setId: string,
      change: { deltaSec: number } | { skip: true },
    ): Promise<Result<{ restEndsAt: number }>> {
      const loaded = await load(setId);
      if (!loaded.ok) return loaded;
      const now = deps.clock.now();
      const current = loaded.value.set.restEndsAt ?? now;
      const restEndsAt = 'skip' in change ? now : Math.max(now, current + change.deltaSec * 1000);
      await deps.sessions.saveSets([{ ...loaded.value.set, restEndsAt }]);
      return ok({ restEndsAt });
    },
  };
}
