import { addDays, daysBetween } from '../common/weekday';
import { WEIGHT_TREND_ALPHA } from '../standards';

export interface WeighIn {
  logDate: string;
  weightKg: number;
}

export interface TrendPoint {
  logDate: string;
  /** Berat hasil timbang hari itu, jika ada. */
  weightKg?: number;
  trendKg: number;
}

/**
 * Tren berat harian dengan rata-rata bergerak eksponensial.
 * Hari tanpa timbangan: tren tetap. docs/sains-latihan/04-komposisi-tubuh.md §3
 */
export function computeWeightTrend(weighIns: readonly WeighIn[]): TrendPoint[] {
  if (weighIns.length === 0) return [];
  const byDate = new Map<string, number>();
  for (const w of weighIns) byDate.set(w.logDate, w.weightKg); // timbangan terakhir di hari yang sama menang

  const dates = [...byDate.keys()].sort();
  const first = dates[0] as string;
  const last = dates[dates.length - 1] as string;

  const points: TrendPoint[] = [];
  let trend = byDate.get(first) as number;
  for (let i = 0; i <= daysBetween(first, last); i++) {
    const logDate = addDays(first, i);
    const weightKg = byDate.get(logDate);
    if (weightKg !== undefined) {
      trend = i === 0 ? weightKg : trend + WEIGHT_TREND_ALPHA * (weightKg - trend);
      points.push({ logDate, weightKg, trendKg: trend });
    } else {
      points.push({ logDate, trendKg: trend });
    }
  }
  return points;
}

/** Perubahan tren dalam 7 hari terakhir (kg). null jika data < 8 hari. */
export function weeklyTrendChangeKg(trend: readonly TrendPoint[]): number | null {
  if (trend.length < 8) return null;
  const latest = trend[trend.length - 1] as TrendPoint;
  const weekAgo = trend[trend.length - 8] as TrendPoint;
  return latest.trendKg - weekAgo.trendKg;
}
