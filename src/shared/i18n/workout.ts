/**
 * Teks yang hanya dipakai layar yang dimuat terpisah (lazy), agar tidak masuk JavaScript awal
 * (anggaran kinerja, docs/06-design-system.md).
 */

export const tCheckIn = {
  title: 'Check-in sebelum latihan',
  open: 'Check-in',
  done: 'Check-in selesai',
  sleep: 'Tidur semalam',
  hoursSuffix: 'j',
  soreness: 'Pegal otot',
  sorenessScale: ['Tidak', 'Sedikit', 'Sedang', 'Pegal', 'Sangat'] as readonly string[],
  energy: 'Energi',
  energyScale: ['Sangat lelah', 'Lelah', 'Biasa', 'Segar', 'Sangat segar'] as readonly string[],
  pain: 'Ada nyeri tajam hari ini? (opsional)',
  weight: 'Berat badan pagi ini (opsional)',
  save: 'Simpan check-in',
  readiness: {
    green: 'Siap latihan penuh. Beban sesuai rencana.',
    yellow: 'Pemulihan belum maksimal. Setiap gerakan dikurangi 1 set dan target RIR +1.',
    red: 'Tubuh butuh pemulihan. Sesi ringan: set dan beban dikurangi.',
  },
  readinessChip: { green: 'Siap penuh', yellow: 'Dikurangi', red: 'Sesi ringan' },
  ignore: 'Tetap latihan penuh',
  skip: 'Lewati check-in',
} as const;

export const tSummary = {
  title: 'Latihan selesai',
  duration: 'menit',
  sets: 'set kerja',
  tonnage: 'kg total',
  prs: 'Rekor pribadi baru',
  prLine: (name: string, kg: string, reps: number) => `${name} · ${kg} × ${reps}`,
  next: 'Sesi berikutnya',
  nextLine: {
    increase: (from: string, to: string, reps: number) => `${from} → ${to} × ${reps}`,
    hold: (from: string, _to: string, reps: number) => `Tetap ${from}, target ${reps} repetisi`,
    decrease: (from: string, to: string, reps: number) => `${from} → ${to} × ${reps}`,
    deload: (from: string, to: string, reps: number) => `${from} → ${to} × ${reps}`,
  },
  nextKind: { increase: 'Naik', hold: 'Tetap', decrease: 'Turun', deload: 'Ringan' },
  done: 'Kembali ke Hari Ini',
  notFound: 'Ringkasan tidak ditemukan.',
} as const;
