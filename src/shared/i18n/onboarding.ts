/**
 * Teks yang hanya dipakai layar yang dimuat terpisah (lazy), agar tidak masuk JavaScript awal
 * (anggaran kinerja, docs/06-design-system.md).
 */
import type { ParqQuestion, ParqStatus } from '@/domain/profile/parq';

export const tOnboarding = {
  welcome: {
    title: 'Selamat datang di Kratos',
    body: 'Jawab beberapa pertanyaan singkat (±3 menit). Kratos akan menyusun program latihan, target makan, dan memantau progres Anda seperti trainer pribadi.',
    start: 'Mulai',
  },
  body: {
    title: 'Data diri',
    body: 'Dipakai untuk menghitung kebutuhan kalori dan protein.',
    name: 'Nama panggilan',
    sex: 'Jenis kelamin',
    birthDate: 'Tanggal lahir',
    height: 'Tinggi badan',
    weight: 'Berat badan',
    weightHint: 'Paling akurat ditimbang pagi hari sebelum makan.',
    minorNotice: 'Di bawah 18 tahun, sebaiknya latihan beban didampingi pelatih atau orang dewasa.',
  },
  experience: { title: 'Pengalaman latihan', body: 'Menentukan tingkat kesulitan gerakan.' },
  activity: {
    title: 'Aktivitas di luar gym',
    body: 'Seberapa aktif Anda sehari-hari, termasuk olahraga lain.',
  },
  schedule: {
    title: 'Jadwal latihan',
    body: 'Pilih 3–6 hari ke gym. Hari lainnya menjadi hari pemulihan.',
    count: (n: number) => `${n} hari dipilih`,
  },
  equipment: {
    title: 'Alat di gym Anda',
    body: 'Matikan alat yang tidak ada. Gerakan akan disesuaikan.',
    selectAll: 'Pilih semua',
  },
  health: {
    title: 'Kondisi kesehatan',
    body: 'Ada bagian tubuh yang sakit atau cedera? Program akan menghindari gerakan yang berisiko.',
    none: 'Tidak ada keluhan',
    add: 'Tambah keluhan',
  },
  submit: 'Buat program saya',
  creating: 'Menyusun program…',
  summary: {
    title: 'Program Anda siap',
    body: (program: string) => `Kratos menyusun program ${program} berdasarkan jawaban Anda.`,
    targets: 'Target harian',
    schedule: 'Jadwal minggu ini',
    recovery: 'Pemulihan',
    unfilled:
      'Beberapa gerakan tidak bisa dipilih karena alat atau kondisi kesehatan. Anda bisa menambahkannya nanti di Program.',
  },
  install: {
    title: 'Pasang ke layar utama',
    body: 'Agar data aman dan aplikasi bisa dibuka tanpa internet, pasang Kratos seperti aplikasi biasa.',
    android:
      'Android (Chrome): ketuk menu ⋮ lalu "Instal aplikasi" atau "Tambahkan ke layar utama".',
    ios: 'iPhone (Safari): ketuk tombol Bagikan lalu "Tambah ke Layar Utama".',
    done: 'Selesai, lihat program',
    later: 'Nanti saja',
  },
} as const;

export const tParq = {
  title: 'Skrining PAR-Q+',
  intro:
    'Tujuh pertanyaan standar internasional sebelum mulai latihan. Jawab jujur; jawaban "ya" tidak menghalangi Anda memakai aplikasi.',
  source: 'Sumber: PAR-Q+ Collaboration. Terjemahan bebas Kratos.',
  yes: 'Ya',
  no: 'Tidak',
  questions: {
    heart_condition:
      'Apakah dokter pernah mengatakan Anda memiliki penyakit jantung atau tekanan darah tinggi?',
    chest_pain:
      'Apakah Anda merasakan nyeri dada saat istirahat, beraktivitas sehari-hari, atau berolahraga?',
    dizziness:
      'Apakah Anda kehilangan keseimbangan karena pusing, atau pernah pingsan, dalam 12 bulan terakhir?',
    chronic_condition:
      'Apakah Anda pernah didiagnosis penyakit kronis lain (selain penyakit jantung atau tekanan darah tinggi)?',
    medication: 'Apakah Anda sedang minum obat resep untuk penyakit kronis?',
    bone_joint:
      'Apakah Anda sedang (atau dalam 12 bulan terakhir) mengalami masalah tulang, sendi, atau jaringan lunak yang bisa memburuk jika lebih aktif?',
    supervised_only:
      'Apakah dokter pernah mengatakan Anda hanya boleh berolahraga dengan pengawasan medis?',
  } satisfies Record<ParqQuestion, string>,
  status: {
    missing: 'Belum diisi',
    clear: 'Aman untuk mulai',
    consult_doctor: 'Disarankan konsultasi dokter',
    expired: 'Perlu diisi ulang (lebih dari 12 bulan)',
  } satisfies Record<ParqStatus, string>,
  consultAdvice:
    'Ada jawaban "ya". Anda tetap bisa memakai Kratos, tetapi sebaiknya konsultasikan dengan dokter sebelum latihan berat.',
  redo: 'Isi ulang',
} as const;

export const tProfile = {
  title: 'Profil',
  summary: (sex: string, age: number, height: number, weight: string) =>
    `${sex} · ${age} th · ${height} cm · ${weight}`,
  bmi: 'BMI',
  bmiAsiaNote: (category: string) =>
    `Batas Asia (WHO): ${category}. BMI tidak membedakan otot dan lemak.`,
  kcal: 'kkal / hari',
  protein: 'protein / hari',
  targets: 'Target harian',
  fat: 'Lemak',
  carbs: 'Karbohidrat',
  water: 'Air minum',
  waterValue: (rest: string, gym: string) => `${rest} L (hari gym ${gym} L)`,
  goalSchedule: 'Tujuan & jadwal',
  goal: 'Tujuan',
  goalValue: 'Menambah otot',
  experience: 'Pengalaman',
  trainingDays: 'Hari gym',
  activity: 'Aktivitas harian',
  proteinFactor: 'Protein',
  proteinFactorValue: (g: string) => `${g} g/kg`,
  units: 'Satuan',
  unitsValue: 'kg',
  editBody: 'Ubah data diri',
  editSchedule: 'Ubah jadwal',
  scheduleWarning:
    'Mengubah jumlah atau hari latihan membuat program baru dari template. Riwayat latihan tetap tersimpan, tetapi editan manual pada program lama tidak dibawa.',
  scheduleConfirm: 'Buat program baru',
  equipment: 'Alat di gym saya',
  equipmentHint: 'Ketuk untuk menyalakan atau mematikan. Program menyesuaikan otomatis.',
  health: 'Kondisi kesehatan',
  healthEmpty: 'Tidak ada keluhan.',
  healthAdd: 'Tambah keluhan',
  healthEdit: 'Ubah keluhan',
  healthActive: 'Aktif',
  healthInactive: 'Nonaktif (sudah sembuh)',
  healthArea: 'Bagian tubuh',
  healthSeverity: 'Tingkat keluhan',
  healthMovements: 'Gerakan yang terasa sakit (opsional)',
  healthNote: 'Catatan (opsional)',
  healthDeactivate: 'Tandai sudah sembuh',
  healthActivate: 'Aktifkan lagi',
  healthDoctor: 'Untuk keluhan berat, konsultasikan dengan dokter atau fisioterapis.',
  appearance: 'Tampilan',
  about: 'Tentang',
  version: 'Versi',
  disclaimer: 'Kratos bukan pengganti dokter atau pelatih bersertifikat.',
} as const;
