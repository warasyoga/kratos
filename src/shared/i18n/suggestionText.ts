import type { Weekday } from '@/domain/common/weekday';
import type { Muscle } from '@/domain/exercise/types';
import type { SuggestionDraft } from '@/domain/trainer/suggestions';
import { t, type SuggestionArgs } from './id';

/** Angka locale id-ID (sama dengan formatNumber di shared/lib/format; i18n tidak boleh mengimpor shared). */
const formatNumber = (value: number) =>
  new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 }).format(value);

/**
 * Kalimat & dasar ilmiah tiap aturan saran (docs/mesin-trainer/04-saran-trainer.md).
 * Dipisah dari id.ts agar hanya dimuat oleh layar yang menampilkan saran.
 */
export const SUGGESTION_RULES: Record<
  string,
  { message: (a: SuggestionArgs) => string; why: string }
> = {
  low_weekly_volume: {
    message: (a: SuggestionArgs) =>
      `Volume ${a.muscle} ${a.sets} set/minggu, di bawah zona 10–20.` +
      (a.exercise
        ? ` Tambah ${a.addSets} set ${a.exercise} di ${a.dayLabel}?`
        : ` Tambah ${a.addSets} set?`),
    why: 'Meta-analisis Schoenfeld dkk. (2017): 10 set atau lebih per otot per minggu menghasilkan pertumbuhan otot lebih besar dibanding volume rendah.',
  },
  high_weekly_volume: {
    message: (a: SuggestionArgs) =>
      `Volume ${a.muscle} ${a.sets} set/minggu, di atas 20. Kurangi ${a.removeSets} set agar pemulihan cukup?`,
    why: 'Di atas ±20 set per otot per minggu, tambahan volume jarang menambah hasil bagi pemula dan memperberat pemulihan (Schoenfeld dkk. 2017).',
  },
  low_frequency: {
    message: (a: SuggestionArgs) =>
      `Otot ${a.muscle} hanya dilatih ${a.frequency}×/minggu.` +
      (a.exercise ? ` Tambah ${a.exercise} di ${a.dayLabel}?` : ''),
    why: 'Melatih setiap otot minimal 2× per minggu lebih efektif untuk hipertrofi dibanding 1× (Schoenfeld dkk. 2016).',
  },
  push_pull_imbalance: {
    message: (a: SuggestionArgs) =>
      `Set dorong (${a.push}) lebih banyak dari set tarik (${a.pull}). Tambah 2 set gerakan tarik?`,
    why: 'Menjaga set tarik minimal sama dengan set dorong membantu keseimbangan otot bahu dan postur (aturan Kratos).',
  },
  quad_ham_imbalance: {
    message: (a: SuggestionArgs) =>
      `Paha belakang ${a.hamstrings} set, kurang dari 75% paha depan (${a.quads} set). Tambah 2 set?`,
    why: 'Paha belakang yang jauh lebih lemah dari paha depan sering dikaitkan dengan risiko cedera; Kratos menjaga rasio ≥ 0,75.',
  },
  stagnation: {
    message: (a: SuggestionArgs) =>
      `${a.exercise} tidak naik dalam ${a.sessions} sesi.` +
      (a.substitute ? ` Coba ganti ke ${a.substitute}?` : ''),
    why: 'Variasi gerakan untuk otot yang sama bisa memecah kebuntuan progres tanpa mengurangi volume (aturan Kratos).',
  },
  deload_due: {
    message: () => 'Tanda kelelahan menumpuk. Jadikan minggu ini minggu ringan (deload)?',
    why: 'Konsensus pelatih internasional (Bell dkk. 2023): minggu ringan setiap 4–8 minggu membantu pemulihan dan progres jangka panjang.',
  },
  low_attendance: {
    message: (a: SuggestionArgs) =>
      `${a.completed} dari ${a.scheduled} sesi dalam 2 minggu terakhir. Ubah ke program 3 hari?`,
    why: 'Program yang bisa dijalani konsisten lebih efektif daripada program ideal yang sering terlewat.',
  },
  consecutive_same_split: {
    message: (a: SuggestionArgs) =>
      `${a.firstDay} dan ${a.secondDay} berurutan melatih otot yang sama.` +
      (a.weekday ? ` Pindahkan ${a.secondDay} ke ${a.weekday}?` : ''),
    why: 'ACSM menganjurkan jeda minimal 48 jam sebelum melatih otot yang sama secara berat.',
  },
  aerobic_below_who: {
    message: (a: SuggestionArgs) =>
      `Aktivitas aerobik minggu lalu ${a.minutes} menit, di bawah ${a.targetMinutes} menit. Tambah jalan kaki santai di hari pemulihan.`,
    why: 'WHO 2020 menganjurkan 150–300 menit aktivitas aerobik sedang per minggu untuk kesehatan jantung, selain latihan kekuatan.',
  },
  low_protein: {
    message: (a: SuggestionArgs) =>
      `Protein rata-rata ${a.averageG} g, target ${a.targetG} g. Tambah 1 porsi telur/ayam/tempe/susu per hari.`,
    why: 'ISSN (Jäger dkk. 2017): 1,6–2,2 g protein per kg berat badan per hari mendukung pertumbuhan otot saat latihan beban.',
  },
  low_sleep: {
    message: (a: SuggestionArgs) =>
      `Tidur rata-rata ${a.averageHours} jam. Otot tumbuh saat pemulihan; usahakan 7–9 jam.`,
    why: 'Kurang tidur menurunkan pemulihan dan performa latihan; rekomendasi dewasa 7–9 jam per malam.',
  },
  calorie_recalibration: {
    message: (a: SuggestionArgs) =>
      a.direction === 'down'
        ? `Berat naik lebih cepat dari 0,5%/minggu. Turunkan target kalori ${a.deltaKcal} kkal?`
        : `Berat naik kurang dari 0,25%/minggu. Naikkan target kalori ${a.deltaKcal} kkal?`,
    why: 'Laju naik 0,25–0,5% berat badan per minggu memaksimalkan otot dengan sedikit lemak (Iraki dkk. 2019). Target dikalibrasi dari tren berat 2 minggu.',
  },
  backup_reminder: {
    message: (a: SuggestionArgs) =>
      `Data belum di-backup selama ${a.days} hari. Buat backup sekarang?`,
    why: 'Semua data hanya ada di HP ini; backup mencegah kehilangan data jika HP rusak atau hilang.',
  },
  parq_expired: {
    message: () =>
      'Skrining PAR-Q+ belum diisi atau sudah lebih dari 12 bulan. Isi ulang di Profil.',
    why: 'PAR-Q+ adalah skrining kesehatan standar internasional sebelum dan selama program latihan.',
  },
};

export interface SuggestionText {
  message: string;
  /** Dasar ilmiah untuk tombol "Kenapa?". */
  why: string;
}

/** Siapkan nilai saran (nama otot, gerakan, hari, angka) lalu susun kalimat dari i18n. */
export function describeSuggestion(
  draft: SuggestionDraft,
  nameOf: (id: string) => string,
): SuggestionText {
  const p = draft.params;
  const text = (key: string) => (p[key] === undefined ? undefined : String(p[key]));
  const number = (key: string) => (typeof p[key] === 'number' ? formatNumber(p[key]) : undefined);
  const id = (key: string) => (typeof p[key] === 'string' ? nameOf(p[key]) : undefined);

  const args: SuggestionArgs = {
    muscle: p.muscle ? t.muscle[p.muscle as Muscle].toLowerCase() : undefined,
    sets: number('sets'),
    addSets: number('addSets'),
    removeSets: number('removeSets'),
    frequency: number('frequency'),
    push: number('push'),
    pull: number('pull'),
    hamstrings: number('hamstrings'),
    quads: number('quads'),
    sessions: number('sessions'),
    completed: number('completed'),
    scheduled: number('scheduled'),
    dayLabel: text('dayLabel'),
    firstDay: text('firstDay'),
    secondDay: text('secondDay'),
    weekday: p.weekday ? t.weekdayLong[p.weekday as Weekday] : undefined,
    exercise: id('exerciseId'),
    substitute: id('substituteId'),
    minutes: number('minutes'),
    targetMinutes: number('targetMinutes'),
    averageG: number('averageG'),
    targetG: number('targetG'),
    averageHours: number('averageHours'),
    deltaKcal: typeof p.deltaKcal === 'number' ? formatNumber(Math.abs(p.deltaKcal)) : undefined,
    direction: typeof p.deltaKcal === 'number' && p.deltaKcal < 0 ? 'down' : 'up',
    days: number('days'),
  };

  const rule = SUGGESTION_RULES[draft.ruleId];
  return rule ? { message: rule.message(args), why: rule.why } : { message: draft.ruleId, why: '' };
}
