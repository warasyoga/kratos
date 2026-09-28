/**
 * Semua teks yang tampil ke pengguna. Komponen tidak menulis teks langsung.
 * Label untuk nilai domain memakai `satisfies Record<...>` agar tidak ada nilai yang terlewat.
 */
import type { BmiCategory } from '@/domain/body/bmi';
import type { Weekday } from '@/domain/common/weekday';
import type { MovementPattern, Muscle } from '@/domain/exercise/types';
import type { ParqQuestion, ParqStatus } from '@/domain/profile/parq';
import type {
  ActivityLevel,
  BodyArea,
  Equipment,
  Experience,
  Severity,
  Sex,
} from '@/domain/profile/types';
import type { SubstitutionReason } from '@/domain/program/types';

export const t = {
  app: {
    name: 'Kratos',
    tagline: 'Trainer & pemantau latihan pribadi',
  },
  nav: {
    label: 'Menu utama',
    today: 'Hari Ini',
    program: 'Program',
    workout: 'Latihan',
    progress: 'Progres',
    profile: 'Profil',
  },
  common: {
    builtInStage: (stage: number) => `Dibangun di Tahap ${stage}`,
    next: 'Lanjut',
    back: 'Kembali',
    save: 'Simpan',
    cancel: 'Batal',
    close: 'Tutup',
    edit: 'Ubah',
    add: 'Tambah',
    remove: 'Hapus',
    loading: 'Memuat…',
    saved: 'Tersimpan',
    stepOf: (step: number, total: number) => `Langkah ${step} dari ${total}`,
  },
  errors: {
    name_required: 'Isi nama panggilan.',
    name_too_long: 'Nama maksimal 30 karakter.',
    choose_one: 'Pilih salah satu.',
    birth_date_invalid: 'Isi tanggal lahir yang valid.',
    age_range: 'Umur harus 16–80 tahun.',
    number_required: 'Isi dengan angka.',
    height_range: 'Tinggi harus 120–230 cm.',
    weight_range: 'Berat harus 30–250 kg.',
    training_days_range: 'Pilih 3–6 hari latihan.',
    note_too_long: 'Catatan maksimal 200 karakter.',
    answer_required: 'Jawab pertanyaan ini.',
    protein_range: 'Protein harus 1,6–2,2 g/kg.',
    generic: 'Terjadi kesalahan. Coba lagi.',
  } as Record<string, string>,

  // ── Nilai domain ──────────────────────────────────────────────────────────
  sex: { male: 'Pria', female: 'Wanita' } satisfies Record<Sex, string>,
  weekdayShort: {
    mon: 'Sen',
    tue: 'Sel',
    wed: 'Rab',
    thu: 'Kam',
    fri: 'Jum',
    sat: 'Sab',
    sun: 'Min',
  } satisfies Record<Weekday, string>,
  weekdayLong: {
    mon: 'Senin',
    tue: 'Selasa',
    wed: 'Rabu',
    thu: 'Kamis',
    fri: 'Jumat',
    sat: 'Sabtu',
    sun: 'Minggu',
  } satisfies Record<Weekday, string>,
  experience: {
    beginner: {
      label: 'Pemula',
      description: 'Belum pernah atau kurang dari 6 bulan rutin latihan beban.',
    },
    intermediate: {
      label: 'Menengah',
      description: 'Lebih dari 6 bulan rutin dan sudah paham teknik dasar.',
    },
  } satisfies Record<Experience, { label: string; description: string }>,
  activity: {
    sedentary: { label: 'Banyak duduk', description: 'Kerja kantor, jarang berjalan.' },
    light: { label: 'Ringan', description: 'Sesekali jalan kaki atau naik tangga.' },
    moderate: { label: 'Sedang', description: 'Latihan 3–5×/minggu atau cukup banyak bergerak.' },
    very: { label: 'Tinggi', description: 'Latihan berat hampir setiap hari.' },
    extra: { label: 'Sangat tinggi', description: 'Kerja fisik berat ditambah latihan harian.' },
  } satisfies Record<ActivityLevel, { label: string; description: string }>,
  equipment: {
    barbell: 'Barbell',
    dumbbell: 'Dumbbell',
    squat_rack: 'Rak squat',
    bench: 'Bangku',
    cable: 'Mesin kabel',
    leg_press: 'Leg press',
    smith: 'Smith machine',
    pullup_bar: 'Pull-up bar',
    kettlebell: 'Kettlebell',
    hack_squat: 'Hack squat',
    leg_curl: 'Mesin leg curl',
    leg_extension: 'Mesin leg extension',
    chest_press_machine: 'Mesin chest press',
    lat_pulldown: 'Mesin lat pulldown',
    ez_bar: 'EZ bar',
    landmine: 'Landmine',
    trap_bar: 'Trap bar',
  } satisfies Record<Equipment, string>,
  bodyArea: {
    shoulder_left: 'Bahu kiri',
    shoulder_right: 'Bahu kanan',
    elbow: 'Siku',
    wrist: 'Pergelangan tangan',
    lower_back: 'Punggung bawah',
    upper_back: 'Punggung atas',
    neck: 'Leher',
    hip: 'Pinggul',
    knee_left: 'Lutut kiri',
    knee_right: 'Lutut kanan',
    ankle: 'Pergelangan kaki',
    other: 'Lainnya',
  } satisfies Record<BodyArea, string>,
  severity: {
    mild: { label: 'Ringan', description: 'Terasa pada gerakan tertentu saja.' },
    moderate: {
      label: 'Sedang',
      description: 'Sering terasa; beban di area ini tidak dinaikkan otomatis.',
    },
    severe: { label: 'Berat', description: 'Semua gerakan yang membebani area ini dihindari.' },
  } satisfies Record<Severity, { label: string; description: string }>,
  movement: {
    horizontal_push: 'Mendorong ke depan (bench press)',
    vertical_push: 'Mendorong ke atas kepala',
    horizontal_pull: 'Menarik ke badan (row)',
    vertical_pull: 'Menarik dari atas (pull-up)',
    squat: 'Jongkok (squat)',
    hinge: 'Membungkuk mengangkat (deadlift)',
    lunge: 'Melangkah (lunge)',
    knee_flexion: 'Menekuk lutut (leg curl)',
    knee_extension: 'Meluruskan lutut (leg extension)',
    elbow_flexion: 'Menekuk siku (curl)',
    elbow_extension: 'Meluruskan siku (triceps)',
    shoulder_abduction: 'Mengangkat lengan ke samping',
    calf: 'Jinjit (calf raise)',
    core: 'Latihan perut',
  } satisfies Record<MovementPattern, string>,
  muscle: {
    chest: 'Dada',
    back_lats: 'Punggung (lats)',
    back_upper: 'Punggung atas',
    shoulder_front: 'Bahu depan',
    shoulder_side: 'Bahu samping',
    shoulder_rear: 'Bahu belakang',
    biceps: 'Biseps',
    triceps: 'Triseps',
    forearm: 'Lengan bawah',
    quads: 'Paha depan',
    hamstrings: 'Paha belakang',
    glutes: 'Bokong',
    calves: 'Betis',
    abs: 'Perut',
  } satisfies Record<Muscle, string>,
  bmi: {
    underweight: 'Kurus',
    normal: 'Normal',
    overweight: 'Berat lebih',
    obese: 'Obesitas',
  } satisfies Record<BmiCategory, string>,
  substitutionReason: {
    health: 'kondisi kesehatan',
    equipment: 'alat tidak ada',
    user: 'pilihan Anda',
    stagnation: 'variasi',
  } satisfies Record<SubstitutionReason, string>,
  parq: {
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
  },

  // ── Layar ─────────────────────────────────────────────────────────────────
  onboarding: {
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
      minorNotice:
        'Di bawah 18 tahun, sebaiknya latihan beban didampingi pelatih atau orang dewasa.',
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
  },
  today: {
    title: 'Hari Ini',
    gymDay: 'Hari gym',
    recoveryDay: 'Hari pemulihan',
    recoveryBody: 'Jalan kaki santai 30–40 menit dan mobilitas 10 menit membantu pemulihan otot.',
    nextWorkout: (label: string, day: string) => `Latihan berikutnya: ${label} (${day})`,
    workoutMeta: (count: number, minutes: number) => `${count} gerakan · ±${minutes} menit`,
    moreExercises: (n: number) => `+ ${n} gerakan lagi`,
    workoutComingSoon: 'Mode latihan hadir di Tahap 5.',
  },
  program: {
    title: 'Program',
    week: (label: string) => label,
    prescription: (sets: number, min: number, max: number, seconds: boolean) =>
      `${sets} × ${min}–${max}${seconds ? ' dtk' : ''}`,
    rest: (sec: number) =>
      sec >= 60 && sec % 60 === 0 ? `istirahat ${sec / 60} mnt` : `istirahat ${sec} dtk`,
    substituted: (name: string, reason: string) => `pengganti ${name} (${reason})`,
    locked: 'beban tidak naik otomatis',
    recoveryDays: 'Hari pemulihan',
    editComingSoon: 'Edit program dan saran trainer hadir di Tahap 4.',
    daySets: (sets: number, minutes: number) => `${sets} set · ±${minutes} mnt`,
  },
  workout: {
    title: 'Latihan',
    emptyBody:
      'Mode latihan untuk dipakai di gym: catat set, timer istirahat otomatis, dan beban yang disarankan trainer.',
  },
  progress: {
    title: 'Progres',
    emptyBody: 'Grafik kekuatan, berat dan ukuran tubuh, volume per otot, dan foto progres.',
  },
  profile: {
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
  },
  changes: {
    none: 'Tersimpan. Program tidak berubah.',
    summary: (n: number) => `Tersimpan. ${n} gerakan disesuaikan.`,
    substituted: (from: string, to: string) => `${from} → ${to}`,
    restored: (from: string, to: string) => `${to} dikembalikan (menggantikan ${from})`,
    unavailable: (name: string) => `${name} tidak punya pengganti`,
    newProgram: (name: string) => `Program baru dibuat: ${name}`,
  },
  theme: {
    label: 'Tema',
    system: 'Ikuti HP',
    light: 'Terang',
    dark: 'Gelap',
  },
} as const;

/** Pesan error i18n dari kode; kode tak dikenal → pesan umum. */
export function errorText(code: string | undefined): string | undefined {
  if (!code) return undefined;
  return t.errors[code] ?? t.errors.generic;
}
