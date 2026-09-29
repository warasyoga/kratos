import { z } from 'zod/mini';
import { err, ok, type Result } from '@/domain/common/result';
import type { HealthCondition, PlateInventory } from '@/domain/profile/types';
import type { AppDeps } from '../deps';
import { conditionSchema, equipmentSchema, numberInRange } from '../profile/schemas';
import { reconcileActiveProgram, type ProgramChange } from '../program/programChanges';
import { validate } from '../validation';

export interface ProgramChangesResult {
  changes: ProgramChange[];
}

/** Ubah daftar alat gym; gerakan yang alatnya hilang diganti. docs/fitur/09-profil.md */
export function makeSetEquipment(deps: AppDeps) {
  return async function setEquipment(raw: unknown): Promise<Result<ProgramChangesResult>> {
    const parsed = validate(equipmentSchema, raw);
    if (!parsed.ok) return parsed;
    return deps.tx.run(async () => {
      await deps.gym.setEquipment(parsed.value);
      return ok({ changes: await reconcileActiveProgram(deps) });
    });
  };
}

/** Tambah atau ubah kondisi kesehatan (tanpa `id` = baru); program disesuaikan. */
export function makeSaveHealthCondition(deps: AppDeps) {
  return async function saveHealthCondition(
    raw: unknown,
    options: { id?: string; active?: boolean } = {},
  ): Promise<Result<ProgramChangesResult>> {
    const parsed = validate(conditionSchema, raw);
    if (!parsed.ok) return parsed;

    const existing = options.id
      ? (await deps.conditions.list()).find((c) => c.id === options.id)
      : undefined;
    if (options.id && !existing)
      return err({ code: 'condition_not_found', message: 'Kondisi tidak ditemukan' });

    const condition: HealthCondition = {
      id: existing?.id ?? deps.newId(),
      createdAt: existing?.createdAt ?? deps.clock.now(),
      active: options.active ?? existing?.active ?? true,
      ...parsed.value,
    };
    return deps.tx.run(async () => {
      await deps.conditions.save(condition);
      return ok({ changes: await reconcileActiveProgram(deps) });
    });
  };
}

export function makeRemoveHealthCondition(deps: AppDeps) {
  return async function removeHealthCondition(id: string): Promise<Result<ProgramChangesResult>> {
    return deps.tx.run(async () => {
      await deps.conditions.remove(id);
      return ok({ changes: await reconcileActiveProgram(deps) });
    });
  };
}

/** Pelat yang bisa dipilih pengguna (kg). */
export const PLATE_OPTIONS_KG = [25, 20, 15, 10, 5, 2.5, 1.25, 0.5] as const;
export const MACHINE_STEP_OPTIONS_KG = [2.5, 5, 10] as const;

const inventorySchema = z
  .object({
    barKg: numberInRange(5, 30, 'bar_range'),
    platesKg: z
      .array(
        z.union(
          PLATE_OPTIONS_KG.map((p) => z.literal(p)) as [
            z.ZodMiniLiteral<number>,
            ...z.ZodMiniLiteral<number>[],
          ],
        ),
      )
      .check(z.minLength(1, { error: 'plates_required' })),
    dumbbellMinKg: numberInRange(1, 60, 'dumbbell_range'),
    dumbbellMaxKg: numberInRange(1, 80, 'dumbbell_range'),
    dumbbellStepKg: z.union([z.literal(1), z.literal(2), z.literal(2.5)], { error: 'choose_one' }),
    machineStepKg: z.union(
      MACHINE_STEP_OPTIONS_KG.map((p) => z.literal(p)) as [
        z.ZodMiniLiteral<number>,
        ...z.ZodMiniLiteral<number>[],
      ],
      { error: 'choose_one' },
    ),
  })
  .check(
    z.refine((v) => v.dumbbellMaxKg >= v.dumbbellMinKg, {
      path: ['dumbbellMaxKg'],
      error: 'dumbbell_order',
    }),
  );

export type InventoryForm = z.infer<typeof inventorySchema>;

/** Deret ukuran dumbbell dari min sampai max dengan kelipatan tertentu. */
export function dumbbellRange(minKg: number, maxKg: number, stepKg: number): number[] {
  const sizes: number[] = [];
  for (let kg = minKg; kg <= maxKg + 1e-9; kg += stepKg) sizes.push(Math.round(kg * 100) / 100);
  return sizes;
}

/** Ringkasan inventaris untuk form. */
export function toInventoryForm(inv: PlateInventory): InventoryForm {
  const sizes = [...inv.dumbbellsKg].sort((a, b) => a - b);
  const min = sizes[0] ?? 2;
  const max = sizes[sizes.length - 1] ?? 40;
  const step = sizes.length > 1 ? Math.round(((sizes[1] ?? min) - min) * 100) / 100 : 2;
  return {
    barKg: inv.barKg,
    platesKg: [...inv.platesKg],
    dumbbellMinKg: min,
    dumbbellMaxKg: max,
    dumbbellStepKg: step === 1 || step === 2.5 ? step : 2,
    machineStepKg: inv.machineStepKg,
  };
}

/** Bar, pelat, dan dumbbell yang ada di gym (dipakai pembulatan beban & kalkulator pelat). */
export function makeInventoryUseCases(deps: AppDeps) {
  return {
    get: () => deps.gym.getInventory(),
    async save(raw: unknown): Promise<Result<void>> {
      const parsed = validate(inventorySchema, raw);
      if (!parsed.ok) return parsed;
      const v = parsed.value;
      await deps.gym.setInventory({
        barKg: v.barKg,
        platesKg: [...v.platesKg].sort((a, b) => b - a),
        dumbbellsKg: dumbbellRange(v.dumbbellMinKg, v.dumbbellMaxKg, v.dumbbellStepKg),
        machineStepKg: v.machineStepKg,
      });
      return ok(undefined);
    },
  };
}
