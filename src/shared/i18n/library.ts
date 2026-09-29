/**
 * Teks yang hanya dipakai layar yang dimuat terpisah (lazy), agar tidak masuk JavaScript awal
 * (anggaran kinerja, docs/06-design-system.md).
 */
import type { LoadType } from '@/domain/exercise/types';

export const tSuggestion = {
  label: 'Saran trainer',
  apply: 'Terapkan',
  dismiss: 'Abaikan',
  why: 'Kenapa?',
  applied: 'Saran diterapkan.',
  dismissed: 'Saran disembunyikan selama 14 hari.',
} as const;

export const tCustomExercise = {
  add: 'Gerakan baru',
  newTitle: 'Gerakan baru',
  editTitle: 'Ubah gerakan',
  name: 'Nama gerakan',
  pattern: 'Pola gerakan',
  primary: 'Otot utama',
  secondary: 'Otot pendukung (opsional)',
  equipment: 'Alat yang dibutuhkan',
  equipmentHint: 'Kosongkan jika tanpa alat.',
  loadType: 'Jenis beban',
  loadTypes: {
    barbell: 'Barbell',
    dumbbell: 'Dumbbell',
    machine: 'Mesin',
    cable: 'Kabel',
    bodyweight: 'Berat badan',
  } satisfies Record<LoadType, string>,
  measure: 'Dicatat sebagai',
  measures: { reps: 'Repetisi', seconds: 'Detik (tahan)' },
  note: 'Catatan cara melakukan (opsional)',
  save: 'Simpan gerakan',
  created: 'Gerakan ditambahkan ke perpustakaan.',
  saved: 'Gerakan disimpan.',
  remove: 'Hapus gerakan',
  removeConfirm: 'Hapus gerakan ini? Riwayat latihannya tetap tersimpan.',
  removed: 'Gerakan dihapus.',
  chip: 'Buatan saya',
  healthNote: 'Penyesuaian kondisi kesehatan memakai pola gerakan yang dipilih.',
} as const;

export const tLibrary = {
  title: 'Gerakan',
  search: 'Cari gerakan, otot, atau alat',
  onlyAvailable: 'Hanya yang bisa saya lakukan',
  count: (n: number) => `${n} gerakan`,
  pickToAdd: (day: string) => `Pilih gerakan untuk ${day}`,
  pickToSwap: 'Pilih gerakan pengganti',
  empty: 'Tidak ada gerakan yang cocok.',
  groups: {
    all: 'Semua',
    chest: 'Dada',
    back: 'Punggung',
    shoulders: 'Bahu',
    arms: 'Lengan',
    legs: 'Kaki',
    core: 'Perut',
  },
  unavailable: {
    equipment: 'Alat tidak ada',
    health: 'Hindari (kesehatan)',
    difficulty: 'Terlalu sulit untuk pemula',
  },
  locked: 'Boleh, beban tidak naik otomatis',
  primary: 'Otot utama',
  secondary: 'Otot pendukung',
  equipmentNeeded: 'Alat',
  noEquipment: 'Tanpa alat',
  steps: 'Cara melakukan',
  mistakes: 'Kesalahan umum',
  alternatives: 'Alternatif',
  notFound: 'Gerakan tidak ditemukan.',
} as const;
