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

export const tBackup = {
  title: 'Data & backup',
  hint: 'Semua data hanya ada di HP ini. Simpan backup di Google Drive/iCloud agar aman saat ganti HP.',
  lastBackup: (date: string) => `Backup terakhir: ${date}`,
  never: 'Belum pernah backup.',
  export: 'Ekspor backup (.zip)',
  exported: 'Backup diunduh. Simpan file ini di tempat aman.',
  import: 'Impor backup',
  restoreHint: 'Sudah pernah memakai Kratos di HP lain? Pulihkan dari file backup.',
  csv: 'Ekspor riwayat set (CSV)',
  csvExported: 'CSV diunduh. Buka di Excel atau Google Sheets.',
  csvHeader: ['Tanggal', 'Hari', 'Gerakan', 'Jenis', 'Set', 'Beban (kg)', 'Repetisi', 'RIR'],
  previewTitle: 'Pulihkan backup?',
  previewExported: (date: string) => `Dibuat ${date}`,
  previewProfile: (name: string) => `Profil: ${name}`,
  previewSessions: (n: number) => `${n} sesi latihan`,
  previewRange: (from: string, to: string) => `Data ${from} – ${to}`,
  previewPhotos: (n: number) => `${n} foto progres`,
  previewWarning:
    'Semua data di HP ini akan diganti dengan isi backup. Tindakan ini tidak bisa dibatalkan.',
  replaceAll: 'Ganti semua',
  restored: 'Backup dipulihkan.',
  working: 'Memproses…',
} as const;
