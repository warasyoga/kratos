/** Aktivitas hari pemulihan (docs/sains-latihan/05-keamanan-dan-pemulihan.md §5). */
export type ActivityKind = 'walk' | 'mobility';

export interface ActivityLog {
  id: string;
  logDate: string;
  kind: ActivityKind;
  minutes: number;
  createdAt: number;
}

/** Rencana hari pemulihan: jalan kaki santai + mobilitas (WHO 2020: 150–300 mnt aerobik/minggu). */
export const RECOVERY_PLAN: readonly { kind: ActivityKind; minutes: number }[] = [
  { kind: 'walk', minutes: 35 },
  { kind: 'mobility', minutes: 10 },
];

/** Menit aerobik (jalan kaki) dari catatan aktivitas. */
export function aerobicMinutes(logs: readonly ActivityLog[]): number {
  return logs.filter((l) => l.kind === 'walk').reduce((sum, l) => sum + l.minutes, 0);
}
