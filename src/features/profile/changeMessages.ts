import type { ProgramChange } from '@/application/program/programChanges';
import { t } from '@/shared/i18n/id';

/** Judul + baris ringkasan perubahan program untuk toast. */
export function describeChanges(changes: readonly ProgramChange[]): [string, string[]] {
  if (changes.length === 0) return [t.changes.none, []];
  const lines = changes.map((c) => {
    if (c.kind === 'unavailable') return t.changes.unavailable(c.fromName);
    if (c.kind === 'restored') return t.changes.restored(c.fromName, c.toName ?? '');
    return t.changes.substituted(c.fromName, c.toName ?? '');
  });
  return [t.changes.summary(changes.length), lines];
}
