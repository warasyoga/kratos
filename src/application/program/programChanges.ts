import type { Exercise } from '@/domain/exercise/types';
import { reconcileProgram } from '@/domain/program/reconcileProgram';
import type { SubstitutionReason } from '@/domain/program/types';
import type { AppDeps } from '../deps';

export interface ProgramChange {
  kind: 'substituted' | 'restored' | 'unavailable';
  fromName: string;
  toName?: string;
  reason?: SubstitutionReason;
}

/**
 * Sesuaikan program aktif dengan alat, kondisi kesehatan, dan pengalaman terbaru.
 * Dipanggil setelah profil/alat/kondisi berubah. Mengembalikan ringkasan untuk ditampilkan.
 */
export async function reconcileActiveProgram(deps: AppDeps): Promise<ProgramChange[]> {
  const [bundle, profile, library, equipment, conditions] = await Promise.all([
    deps.programs.getActive(),
    deps.profiles.get(),
    deps.exercises.list(),
    deps.gym.getEquipment(),
    deps.conditions.list(),
  ]);
  if (!bundle || !profile) return [];

  const { exercises, changes } = reconcileProgram(bundle.exercises, {
    library,
    availableEquipment: equipment,
    conditions,
    experience: profile.experience,
  });
  await deps.programs.saveExercises(exercises);

  const nameOf = new Map(library.map((e: Exercise) => [e.id, e.name]));
  const name = (id: string) => nameOf.get(id) ?? id;
  return changes.map((c) =>
    c.kind === 'unavailable'
      ? { kind: c.kind, fromName: name(c.exerciseId) }
      : {
          kind: c.kind,
          fromName: name(c.fromId),
          toName: name(c.toId),
          ...(c.kind === 'substituted' && { reason: c.reason }),
        },
  );
}
