import {
  buildWorkoutCalendar,
  calendarSignature,
  firstOccurrence,
  waterReminderDue,
  type CalendarWorkout,
} from './reminders';

const workouts: CalendarWorkout[] = [
  { id: 'day-ua', label: 'Upper A', weekday: 'mon', durationMinutes: 60 },
  { id: 'day-la', label: 'Lower A', weekday: 'tue', durationMinutes: 55 },
];

const build = (overrides: Partial<CalendarWorkout>[] = []) =>
  buildWorkoutCalendar({
    workouts: overrides.length ? workouts.map((w, i) => ({ ...w, ...overrides[i] })) : workouts,
    time: '17:30',
    today: '2026-09-29', // Selasa
    now: Date.UTC(2026, 8, 29, 1, 2, 3),
    uidDomain: 'kratos-aris.netlify.app',
    text: {
      calendarName: 'Kratos',
      summary: (label) => `Latihan ${label}`,
      alarm: 'Latihan 30 menit lagi',
    },
  });

describe('buildWorkoutCalendar (RFC 5545)', () => {
  const ics = build();
  const lines = ics.split('\r\n');

  it('struktur VCALENDAR dengan CRLF dan satu VEVENT per hari latihan', () => {
    expect(lines[0]).toBe('BEGIN:VCALENDAR');
    expect(lines).toContain('VERSION:2.0');
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true);
    expect(lines.filter((l) => l === 'BEGIN:VEVENT')).toHaveLength(2);
    expect(ics).not.toMatch(/[^\r]\n/);
  });

  it('berulang mingguan mulai kejadian pertama ≥ hari ini, alarm 30 menit', () => {
    expect(lines).toContain('DTSTART:20261005T173000'); // Senin berikutnya
    expect(lines).toContain('DTSTART:20260929T173000'); // Selasa hari ini
    expect(lines).toContain('RRULE:FREQ=WEEKLY;BYDAY=MO');
    expect(lines).toContain('DURATION:PT55M');
    expect(lines).toContain('TRIGGER:-PT30M');
    expect(lines).toContain('DTSTAMP:20260929T010203Z');
  });

  it('UID stabil per hari program agar impor ulang tidak menggandakan', () => {
    expect(lines).toContain('UID:kratos-day-ua@kratos-aris.netlify.app');
  });

  it('teks di-escape dan baris panjang dilipat ≤ 75 oktet', () => {
    const escaped = build([{ label: 'Push; dada, bahu' }]);
    expect(escaped).toContain('SUMMARY:Latihan Push\\; dada\\, bahu');
    const long = build([{ label: 'Á'.repeat(60) }]);
    for (const line of long.split('\r\n'))
      expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    expect(long).toContain('\r\n ');
  });
});

describe('firstOccurrence', () => {
  it('hari yang sama → hari ini; hari lewat → minggu depan', () => {
    expect(firstOccurrence('2026-09-29', 'tue')).toBe('2026-09-29');
    expect(firstOccurrence('2026-09-29', 'mon')).toBe('2026-10-05');
  });
});

describe('calendarSignature', () => {
  it('berubah jika hari atau jam berubah, tidak bergantung urutan', () => {
    const a = calendarSignature(workouts, '17:30');
    expect(calendarSignature([...workouts].reverse(), '17:30')).toBe(a);
    expect(calendarSignature(workouts, '18:00')).not.toBe(a);
  });
});

describe('waterReminderDue', () => {
  const H = 3_600_000;
  const base = { now: 10 * H, hour: 10, intakeMl: 500, targetMl: 2500 };
  it.each([
    ['2 jam sejak minum terakhir', { lastWaterAt: 8 * H, lastNotifiedAt: null }, true],
    ['baru minum 1 jam lalu', { lastWaterAt: 9 * H, lastNotifiedAt: null }, false],
    ['baru diingatkan', { lastWaterAt: 5 * H, lastNotifiedAt: 9.5 * H }, false],
    ['belum minum sama sekali', { lastWaterAt: null, lastNotifiedAt: null }, true],
  ])('%s', (_, times, expected) => {
    expect(waterReminderDue({ ...base, ...times })).toBe(expected);
  });

  it('di luar 08.00–20.00 atau target tercapai → tidak', () => {
    expect(waterReminderDue({ ...base, hour: 21, lastWaterAt: null, lastNotifiedAt: null })).toBe(
      false,
    );
    expect(
      waterReminderDue({ ...base, intakeMl: 2500, lastWaterAt: null, lastNotifiedAt: null }),
    ).toBe(false);
  });
});
