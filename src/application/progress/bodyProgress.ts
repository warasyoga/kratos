import { z } from 'zod/mini';
import { calculateBmi, classifyBmi, classifyBmiAsia, type BmiCategory } from '@/domain/body/bmi';
import type { BodyMetric } from '@/domain/body/types';
import { computeWeightTrend, type TrendPoint } from '@/domain/body/weightTrend';
import { toLocalDate } from '@/domain/common/clock';
import { err, ok, type Result } from '@/domain/common/result';
import {
  bodyFatSeries,
  gainTargetBand,
  lastMeasuredOn,
  measurementChanges,
  measurementDue,
  weighInsOf,
  weightRate,
  type BandPoint,
  type BodyFatPoint,
  type MeasurementChange,
  type WeightRate,
} from '@/domain/progress/body';
import { rangeStart, type ProgressRange } from '@/domain/progress/range';
import type { Sex } from '@/domain/profile/types';
import type { AppDeps } from '../deps';
import { numberInRange } from '../profile/schemas';
import { validate } from '../validation';

const RECENT_ENTRIES = 10;

const circumference = (min: number, max: number) =>
  z.optional(numberInRange(min, max, 'circumference_range'));

/** Batas wajar ukuran lingkar orang dewasa (cm). */
export const bodyMetricSchema = z
  .object({
    weightKg: z.optional(numberInRange(30, 250, 'weight_range')),
    neckCm: circumference(20, 70),
    chestCm: circumference(50, 200),
    armCm: circumference(15, 80),
    waistCm: circumference(40, 200),
    hipCm: circumference(50, 200),
    thighCm: circumference(30, 120),
  })
  .check(
    z.refine((v) => Object.values(v).some((x) => x !== undefined), {
      error: 'metric_required',
    }),
  );

export interface BodyProgress {
  fromDate: string;
  sex: Sex;
  latestWeightKg: number | null;
  bmi: { value: number; category: BmiCategory; asiaCategory: BmiCategory } | null;
  /** Tren berat harian di rentang (EMA, docs/sains-latihan/04-komposisi-tubuh.md §3). */
  trend: TrendPoint[];
  /** Pita laju naik sehat 0,25–0,5%/minggu dari awal rentang. */
  band: BandPoint[];
  rate: WeightRate | null;
  measurements: MeasurementChange[];
  bodyFat: { latest: BodyFatPoint; changePct: number | null } | null;
  measurementDue: boolean;
  lastMeasuredOn: string | null;
  /** Catatan terbaru lebih dulu (untuk mengoreksi salah ketik). */
  recentEntries: BodyMetric[];
}

/** Berat, ukuran tubuh, dan estimasi lemak. docs/fitur/07-progres.md "Tubuh" */
export function makeBodyProgress(deps: AppDeps) {
  return {
    async body(range: ProgressRange): Promise<BodyProgress | null> {
      const [profile, metrics] = await Promise.all([deps.profiles.get(), deps.bodyMetrics.list()]);
      if (!profile) return null;
      const today = toLocalDate(deps.clock.now());
      const fromDate = rangeStart(range, today, metrics[0]?.logDate);

      const fullTrend = computeWeightTrend(weighInsOf(metrics));
      const trend = fullTrend.filter((p) => p.logDate >= fromDate);
      const start = trend[0];
      const fat = bodyFatSeries(metrics, profile);
      const latestFat = fat.at(-1);
      const firstFatInRange = fat.find((p) => p.logDate >= fromDate);
      const latestWeightKg = weighInsOf(metrics).at(-1)?.weightKg ?? null;
      const bmi = latestWeightKg === null ? null : calculateBmi(latestWeightKg, profile.heightCm);

      return {
        fromDate,
        sex: profile.sex,
        latestWeightKg,
        bmi:
          bmi === null
            ? null
            : { value: bmi, category: classifyBmi(bmi), asiaCategory: classifyBmiAsia(bmi) },
        trend,
        band:
          start && trend.length >= 2
            ? gainTargetBand(
                start,
                trend.map((p) => p.logDate),
              )
            : [],
        rate: weightRate(fullTrend),
        measurements: measurementChanges(metrics, fromDate),
        bodyFat: latestFat
          ? {
              latest: latestFat,
              changePct:
                firstFatInRange && firstFatInRange !== latestFat
                  ? latestFat.pct - firstFatInRange.pct
                  : null,
            }
          : null,
        measurementDue: measurementDue(metrics, today),
        lastMeasuredOn: lastMeasuredOn(metrics),
        recentEntries: metrics.slice(-RECENT_ENTRIES).reverse(),
      };
    },

    /** Catat berat dan/atau ukuran lingkar hari ini. */
    async logMetric(raw: unknown): Promise<Result<void>> {
      const parsed = validate(bodyMetricSchema, raw);
      if (!parsed.ok) return parsed;
      const now = deps.clock.now();
      const values = Object.fromEntries(
        Object.entries(parsed.value).filter(([, v]) => v !== undefined),
      );
      await deps.bodyMetrics.add({
        id: deps.newId(),
        logDate: toLocalDate(now),
        createdAt: now,
        ...values,
      });
      return ok(undefined);
    },

    /** Hapus catatan (salah ketik). Catatan berat terakhir tidak boleh dihapus: profil butuh berat. */
    async removeMetric(id: string): Promise<Result<void>> {
      const metrics = await deps.bodyMetrics.list();
      const target = metrics.find((m) => m.id === id);
      if (!target) return err({ code: 'not_found', message: 'Catatan tidak ditemukan' });
      const otherWeights = metrics.filter((m) => m.id !== id && m.weightKg !== undefined);
      if (target.weightKg !== undefined && otherWeights.length === 0)
        return err({ code: 'last_weight', message: 'Berat terakhir tidak bisa dihapus' });
      await deps.bodyMetrics.remove(id);
      return ok(undefined);
    },
  };
}
