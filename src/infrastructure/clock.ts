import type { Clock } from '@/domain/common/clock';

export const systemClock: Clock = {
  now: () => Date.now(),
};
