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
