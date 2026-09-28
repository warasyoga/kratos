import type { HealthCondition } from '../profile/types';

/** Kondisi kesehatan untuk test. */
export function condition(
  overrides: Partial<HealthCondition> & Pick<HealthCondition, 'area' | 'severity'>,
): HealthCondition {
  return {
    id: `hc-${overrides.area}`,
    painfulMovements: [],
    note: '',
    active: true,
    createdAt: 0,
    ...overrides,
  };
}

/** Pastikan nilai ada (pengganti tanda `!` di test). */
export function must<T>(value: T | null | undefined, what = 'nilai'): T {
  if (value === null || value === undefined) throw new Error(`${what} tidak ditemukan`);
  return value;
}
