import type { ConditionInput } from '@/application/profile/schemas';
import type { MovementPattern } from '@/domain/exercise/types';
import type { BodyArea, Severity } from '@/domain/profile/types';

export interface ConditionDraft {
  area?: BodyArea;
  severity?: Severity;
  painfulMovements: MovementPattern[];
  note: string;
}

export const EMPTY_CONDITION: ConditionDraft = { painfulMovements: [], note: '' };

export function toConditionDraft(c: ConditionInput): ConditionDraft {
  return { area: c.area, severity: c.severity, painfulMovements: c.painfulMovements, note: c.note };
}
