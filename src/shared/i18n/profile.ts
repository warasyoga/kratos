/**
 * Teks yang hanya dipakai layar yang dimuat terpisah (lazy), agar tidak masuk JavaScript awal
 * (anggaran kinerja, docs/06-design-system.md).
 */

export const tInventory = {
  title: 'Pelat & dumbbell',
  hint: 'Dipakai untuk membulatkan beban dan kalkulator pelat.',
  bar: 'Berat bar',
  plates: 'Pelat yang tersedia',
  dumbbellMin: 'Dumbbell teringan',
  dumbbellMax: 'Dumbbell terberat',
  dumbbellStep: 'Kelipatan dumbbell',
  machineStep: 'Kelipatan tumpukan mesin',
  summary: (bar: string, plates: string, dMin: string, dMax: string) =>
    `Bar ${bar} · pelat ${plates} · dumbbell ${dMin}–${dMax}`,
} as const;

export const tChanges = {
  none: 'Tersimpan. Program tidak berubah.',
  summary: (n: number) => `Tersimpan. ${n} gerakan disesuaikan.`,
  substituted: (from: string, to: string) => `${from} → ${to}`,
  restored: (from: string, to: string) => `${to} dikembalikan (menggantikan ${from})`,
  unavailable: (name: string) => `${name} tidak punya pengganti`,
  newProgram: (name: string) => `Program baru dibuat: ${name}`,
} as const;
