import { z } from 'zod/mini';
import { toLocalDate } from '@/domain/common/clock';
import { ok, type Result } from '@/domain/common/result';
import { BODY_AREAS } from '@/domain/profile/types';
import { assessReadiness } from '@/domain/trainer/readiness';
import type { CheckIn, Readiness } from '@/domain/workout/types';
import type { AppDeps } from '../deps';
import { numberInRange } from '../profile/schemas';
import { validate } from '../validation';

const scale = z
  .int()
  .check(z.minimum(1, { error: 'scale_range' }), z.maximum(5, { error: 'scale_range' }));

export const checkInSchema = z.object({
  sleepHours: numberInRange(0, 14, 'sleep_range'),
  soreness: scale,
  energy: scale,
  painAreas: z.array(z.enum(BODY_AREAS)),
  bodyWeightKg: z.optional(numberInRange(30, 250, 'weight_range')),
});

/** Check-in hari gym: menilai kesiapan dan mencatat berat (opsional). docs/fitur/03-check-in.md */
export function makeCheckInUseCases(deps: AppDeps) {
  return {
    today(): Promise<CheckIn | null> {
      return deps.checkIns.getByDate(toLocalDate(deps.clock.now()));
    },

    async submit(raw: unknown): Promise<Result<{ readiness: Readiness }>> {
      const parsed = validate(checkInSchema, raw);
      if (!parsed.ok) return parsed;
      const input = parsed.value;
      const now = deps.clock.now();
      const logDate = toLocalDate(now);
      const readiness = assessReadiness(input);

      await deps.tx.run(async () => {
        await deps.checkIns.save({
          id: deps.newId(),
          logDate,
          sleepHours: input.sleepHours,
          soreness: input.soreness,
          energy: input.energy,
          painAreas: input.painAreas,
          ...(input.bodyWeightKg !== undefined && { bodyWeightKg: input.bodyWeightKg }),
          readiness,
          createdAt: now,
        });
        if (input.bodyWeightKg !== undefined) {
          await deps.bodyMetrics.add({
            id: deps.newId(),
            logDate,
            weightKg: input.bodyWeightKg,
            createdAt: now,
          });
        }
      });
      return ok({ readiness });
    },
  };
}
