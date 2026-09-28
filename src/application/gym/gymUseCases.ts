import { err, ok, type Result } from '@/domain/common/result';
import type { HealthCondition } from '@/domain/profile/types';
import type { AppDeps } from '../deps';
import { conditionSchema, equipmentSchema } from '../profile/schemas';
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
