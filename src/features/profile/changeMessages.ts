import type { ProgramChange } from '@/application/program/programChanges';
import { tChanges } from '@/shared/i18n/profile';

/** Judul + baris ringkasan perubahan program untuk toast. */
export function describeChanges(changes: readonly ProgramChange[]): [string, string[]] {
  if (changes.length === 0) return [tChanges.none, []];
  const lines = changes.map((c) => {
    if (c.kind === 'unavailable') return tChanges.unavailable(c.fromName);
    if (c.kind === 'restored') return tChanges.restored(c.fromName, c.toName ?? '');
    return tChanges.substituted(c.fromName, c.toName ?? '');
  });
  return [tChanges.summary(changes.length), lines];
}
