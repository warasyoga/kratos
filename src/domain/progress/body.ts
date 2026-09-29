import { estimateBodyFatNavy } from '../body/bodyFat';
import {
  CIRCUMFERENCES,
  hasCircumference,
  type BodyMetric,
  type Circumference,
} from '../body/types';
import { weeklyTrendChangeKg, type TrendPoint, type WeighIn } from '../body/weightTrend';
import { daysBetween } from '../common/weekday';
import type { Sex } from '../profile/types';
import { MEASUREMENT_INTERVAL_DAYS, WEIGHT_GAIN_PCT_PER_WEEK } from '../standards';

export type WeightRateStatus = 'below' | 'on_target' | 'above';

export interface WeightRate {
  weeklyChangeKg: number;
  /** Perubahan per minggu sebagai pecahan berat (0,004 = 0,4%). */
  weeklyPct: number;
  status: WeightRateStatus;
}

export interface BandPoint {
  logDate: string;
  loKg: number;
  hiKg: number;
}

export interface MeasurementChange {
  field: Circumference;
  latestCm: number;
  logDate: string;
  /** Terbaru − pertama di rentang; null jika catatan di rentang < 2. */
  changeCm: number | null;
}

export interface BodyFatPoint {
  logDate: string;
  pct: number;
}

const chronological = (metrics: readonly BodyMetric[]) =>
  [...metrics].sort((a, b) => a.logDate.localeCompare(b.logDate) || a.createdAt - b.createdAt);

/** Penimbangan dari catatan tubuh, urut waktu. */
export function weighInsOf(metrics: readonly BodyMetric[]): WeighIn[] {
  return chronological(metrics).flatMap((m) =>
    m.weightKg === undefined ? [] : [{ logDate: m.logDate, weightKg: m.weightKg }],
  );
}

/**
 * Laju naik berat mingguan dari tren, dibanding target 0,25–0,5% berat/minggu.
 * docs/sains-latihan/01-nutrisi.md (Iraki et al. 2019). null jika data < 8 hari.
 */
export function weightRate(trend: readonly TrendPoint[]): WeightRate | null {
  const weeklyChangeKg = weeklyTrendChangeKg(trend);
  const weekAgo = trend[trend.length - 8];
  if (weeklyChangeKg === null || !weekAgo) return null;
  const weeklyPct = weeklyChangeKg / weekAgo.trendKg;
  const status: WeightRateStatus =
    weeklyPct < WEIGHT_GAIN_PCT_PER_WEEK.min
      ? 'below'
      : weeklyPct > WEIGHT_GAIN_PCT_PER_WEEK.max
        ? 'above'
        : 'on_target';
  return { weeklyChangeKg, weeklyPct, status };
}

/** Pita target: berat tren di awal rentang dinaikkan 0,25–0,5% per minggu. */
export function gainTargetBand(
  start: { logDate: string; trendKg: number },
  dates: readonly string[],
): BandPoint[] {
  return dates.map((logDate) => {
    const weeks = daysBetween(start.logDate, logDate) / 7;
    return {
      logDate,
      loKg: start.trendKg * (1 + WEIGHT_GAIN_PCT_PER_WEEK.min * weeks),
      hiKg: start.trendKg * (1 + WEIGHT_GAIN_PCT_PER_WEEK.max * weeks),
    };
  });
}

/** Nilai terakhir tiap ukuran lingkar dan perubahannya sejak catatan pertama di rentang. */
export function measurementChanges(
  metrics: readonly BodyMetric[],
  fromDate: string,
): MeasurementChange[] {
  const sorted = chronological(metrics);
  return CIRCUMFERENCES.flatMap((field) => {
    const values = sorted.flatMap((m) => {
      const cm = m[field];
      return cm === undefined ? [] : [{ logDate: m.logDate, cm }];
    });
    const latest = values.at(-1);
    if (!latest) return [];
    const inRange = values.filter((v) => v.logDate >= fromDate);
    const baseline = inRange[0];
    return [
      {
        field,
        latestCm: latest.cm,
        logDate: latest.logDate,
        changeCm: baseline && inRange.length >= 2 ? latest.cm - baseline.cm : null,
      },
    ];
  });
}

/**
 * Estimasi % lemak (US Navy) untuk setiap catatan yang punya leher + pinggang
 * (+ pinggul untuk wanita). docs/sains-latihan/04-komposisi-tubuh.md §2
 */
export function bodyFatSeries(
  metrics: readonly BodyMetric[],
  person: { sex: Sex; heightCm: number },
): BodyFatPoint[] {
  return chronological(metrics).flatMap((m) => {
    if (m.neckCm === undefined || m.waistCm === undefined) return [];
    if (person.sex === 'female' && m.hipCm === undefined) return [];
    try {
      const pct = estimateBodyFatNavy({
        sex: person.sex,
        heightCm: person.heightCm,
        neckCm: m.neckCm,
        waistCm: m.waistCm,
        ...(m.hipCm !== undefined && { hipCm: m.hipCm }),
      });
      return [{ logDate: m.logDate, pct }];
    } catch {
      return []; // ukuran tidak masuk akal (pinggang ≤ leher) tidak dihitung
    }
  });
}

/** Tanggal ukuran lingkar terakhir, atau null jika belum pernah. */
export function lastMeasuredOn(metrics: readonly BodyMetric[]): string | null {
  return chronological(metrics).filter(hasCircumference).at(-1)?.logDate ?? null;
}

/** Waktunya mengukur lagi: belum pernah, atau sudah ≥ 14 hari. */
export function measurementDue(metrics: readonly BodyMetric[], today: string): boolean {
  const last = lastMeasuredOn(metrics);
  return last === null || daysBetween(last, today) >= MEASUREMENT_INTERVAL_DAYS;
}
