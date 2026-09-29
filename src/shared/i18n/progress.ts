/**
 * Teks layar Progres. Dipisah dari id.ts agar hanya dimuat bersama layar Progres
 * (anggaran JavaScript awal, docs/06-design-system.md).
 */
import type { Circumference } from '@/domain/body/types';
import type { WeightRateStatus } from '@/domain/progress/body';
import type { PhotoPose } from '@/domain/progress/photo';
import type { ProgressRange } from '@/domain/progress/range';
import type { PrKind } from '@/domain/strength/personalRecord';

export const tProgress = {
  title: 'Progres',
  sectionsLabel: 'Bagian progres',
  sections: {
    strength: 'Kekuatan',
    body: 'Tubuh',
    volume: 'Volume',
    photos: 'Foto',
    badges: 'Lencana',
  },
  rangeLabel: 'Rentang waktu',
  ranges: { '4w': '4 mgg', '12w': '12 mgg', all: 'Semua' } satisfies Record<ProgressRange, string>,
  since: (date: string) => `Sejak ${date}`,

  // Kekuatan
  prsTitle: 'Rekor pribadi terbaru',
  prKind: { estimated_1rm: '1RM', reps_at_weight: 'Repetisi' } satisfies Record<PrKind, string>,
  setLine: (kg: string, reps: number) => `${kg} × ${reps}`,
  e1rmTitle: '1RM estimasi',
  e1rmNote: 'Dari set terbaik tiap sesi (rumus Epley, set ≤ 10 repetisi). Dumbbell per tangan.',
  e1rmChart: (name: string, from: string, to: string, value: string) =>
    `1RM estimasi ${name}, ${from} sampai ${to}. Terakhir ${value}.`,
  exercisesTitle: 'Semua gerakan',
  sessions: (n: number) => `${n} sesi`,
  strengthEmpty:
    'Belum ada latihan berbeban di rentang ini. Selesaikan sesi latihan untuk melihat grafik kekuatan.',
  detailBest: '1RM terbaik (kg)',
  detailCurrent: '1RM terakhir (kg)',
  detailSessions: 'sesi',
  historyTitle: 'Riwayat sesi',
  prChip: 'PR',
  guideLink: 'Lihat panduan gerakan',
  detailNote: 'Grafik muncul setelah 2 sesi dengan set ≤ 10 repetisi.',

  // Tubuh
  weightTitle: 'Berat badan',
  weightChart: (from: string, to: string, value: string) =>
    `Tren berat ${from} sampai ${to}. Terakhir ${value}.`,
  weightLegend:
    'Garis = tren (rata-rata bergerak), titik = timbangan harian, pita hijau = laju naik sehat 0,25–0,5%/minggu.',
  weightOne: 'Timbang tiap pagi (setelah ke toilet, sebelum makan) agar tren terbentuk.',
  rateValue: (kg: string, pct: string) => `${kg} kg/minggu (${pct}%)`,
  rateStatus: {
    below: 'Di bawah target',
    on_target: 'Sesuai target',
    above: 'Terlalu cepat',
  } satisfies Record<WeightRateStatus, string>,
  rateHint: {
    below: 'Naik < 0,25%/minggu. Jika bertahan 2 minggu, tambah ±150 kkal per hari.',
    on_target: 'Laju ideal untuk menambah otot dengan sedikit lemak.',
    above:
      'Naik > 0,5%/minggu: kelebihan cenderung jadi lemak. Jika bertahan 2 minggu, kurangi ±150 kkal.',
  } satisfies Record<WeightRateStatus, string>,
  rateNeedsData: 'Laju mingguan muncul setelah 8 hari data timbangan.',
  logWeight: 'Catat berat',
  measureTitle: 'Ukuran tubuh',
  measureDue: 'Waktunya mengukur',
  measureDueHint: 'Ukur lingkar tubuh setiap 14 hari.',
  lastMeasured: (date: string) => `Terakhir diukur ${date}`,
  measureEmpty: 'Belum ada ukuran. Ukur leher dan pinggang untuk estimasi persen lemak.',
  logMeasure: 'Catat ukuran',
  field: {
    neckCm: 'Leher',
    chestCm: 'Dada',
    armCm: 'Lengan atas',
    waistCm: 'Pinggang',
    hipCm: 'Pinggul',
    thighCm: 'Paha',
  } satisfies Record<Circumference, string>,
  fieldHint: {
    neckCm: 'Tepat di bawah jakun',
    chestCm: 'Sejajar puting, setelah buang napas',
    armCm: 'Bagian terbesar, lengan ditekuk dan dikencangkan',
    waistCm: 'Pria: setinggi pusar · wanita: bagian tersempit',
    hipCm: 'Bagian terlebar bokong',
    thighCm: 'Bagian terbesar, di bawah lipatan bokong',
  } satisfies Record<Circumference, string>,
  changeCm: (value: string) => `${value} cm`,
  bodyFatTitle: 'Estimasi lemak tubuh',
  bodyFatNote: 'Rumus US Navy (Hodgdon & Beckett 1984). Galat ±3–4%: pakai untuk melihat tren.',
  bodyFatNeeds: (female: boolean) =>
    female
      ? 'Isi leher, pinggang, dan pinggul untuk estimasi persen lemak.'
      : 'Isi leher dan pinggang untuk estimasi persen lemak.',
  entriesTitle: 'Catatan terakhir',
  removeEntry: (date: string) => `Hapus catatan ${date}`,
  entryRemoved: 'Catatan dihapus.',
  metricSheet: 'Catat berat & ukuran',
  metricSheetHint:
    'Isi yang diukur saja. Pagi hari sebelum makan; pita ukur menempel di kulit tanpa menekan.',
  weightField: 'Berat badan',

  // Volume
  weekVolumeTitle: 'Set per otot minggu ini',
  weekVolumeZone: 'Zona hijau 10–20 set',
  weekVolumeValue: (done: string, planned: string) => `${done} / ${planned}`,
  weekVolumeNote: 'Dikerjakan / rencana program. Otot pendukung dihitung ½ set.',
  tonnageTitle: 'Tonase per minggu',
  tonnageChart: (weeks: number, last: string) => `Tonase ${weeks} minggu, minggu ini ${last}.`,
  tonnageNote: 'Σ beban × repetisi set kerja; dumbbell dihitung per tangan.',
  attendanceTitle: 'Kehadiran',
  attendanceValue: (done: number, scheduled: number) => `${done} dari ${scheduled} sesi`,
  attendanceWeek: (week: string, done: number, scheduled: number) =>
    `Minggu ${week}: ${done} dari ${scheduled}`,
  volumeEmpty: 'Buat program dulu untuk melihat volume latihan.',

  // Foto
  photosEmpty:
    'Belum ada foto. Ambil foto depan, samping, dan belakang setiap 2–4 minggu di tempat, cahaya, dan jam yang sama.',
  addPhoto: 'Tambah foto',
  photoSheet: 'Tambah foto progres',
  poseLabel: 'Pose',
  pose: { front: 'Depan', side: 'Samping', back: 'Belakang' } satisfies Record<PhotoPose, string>,
  choosePhoto: 'Pilih atau ambil foto',
  photoPrivacy: 'Foto dikecilkan lalu disimpan hanya di HP ini, tidak diunggah ke mana pun.',
  photoSaved: 'Foto tersimpan.',
  photoAlt: (pose: string, date: string) => `Foto ${pose}, ${date}`,
  compare: 'Bandingkan',
  compareDone: 'Selesai',
  compareHint: 'Pilih 2 foto untuk dibandingkan.',
  compareTitle: 'Perbandingan',
  compareModes: { slider: 'Geser', side: 'Berdampingan' },
  compareSlider: 'Geser untuk membandingkan',
  selectPhoto: (alt: string) => `Pilih: ${alt}`,
  openPhoto: (alt: string) => `Buka: ${alt}`,
  removePhoto: 'Hapus foto',
  removePhotoConfirm: 'Hapus foto ini dari HP? Tindakan ini tidak bisa dibatalkan.',
  photoRemoved: 'Foto dihapus.',
} as const;
