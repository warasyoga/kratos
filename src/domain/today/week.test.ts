import { missedDays, nextScheduledDay, streakWeeks, weekOverview, type ScheduledDay } from './week';

const schedule: ScheduledDay[] = [
  { programDayId: 'ua', label: 'Upper A', weekday: 'mon' },
  { programDayId: 'la', label: 'Lower A', weekday: 'tue' },
  { programDayId: 'ub', label: 'Upper B', weekday: 'thu' },
  { programDayId: 'lb', label: 'Lower B', weekday: 'fri' },
];

describe('weekOverview', () => {
  it('Rabu 30 Sep: Senin selesai, Selasa terlewat, Kamis/Jumat akan datang', () => {
    const week = weekOverview(
      schedule,
      [{ programDayId: 'ua', logDate: '2026-09-28' }],
      '2026-09-30',
    );
    expect(week.map((d) => [d.weekday, d.status])).toEqual([
      ['mon', 'done'],
      ['tue', 'missed'],
      ['wed', 'recovery'],
      ['thu', 'upcoming'],
      ['fri', 'upcoming'],
      ['sat', 'recovery'],
      ['sun', 'recovery'],
    ]);
    expect(week[0]).toMatchObject({ date: '2026-09-28', label: 'Upper A' });
  });

  it('latihan yang dipindah ke hari lain di minggu yang sama tetap dihitung selesai', () => {
    const week = weekOverview(
      schedule,
      [{ programDayId: 'la', logDate: '2026-09-30' }],
      '2026-09-30',
    );
    expect(week[1]?.status).toBe('done');
  });

  it('sesi minggu lalu tidak dihitung minggu ini', () => {
    const week = weekOverview(
      schedule,
      [{ programDayId: 'ua', logDate: '2026-09-21' }],
      '2026-09-28',
    );
    expect(week[0]?.status).toBe('today');
  });
});

describe('missedDays', () => {
  it('menawarkan latihan terlewat yang belum dikerjakan', () => {
    expect(
      missedDays(schedule, [{ programDayId: 'ua', logDate: '2026-09-28' }], '2026-09-30').map(
        (d) => d.label,
      ),
    ).toEqual(['Lower A']);
  });
});

describe('streakWeeks', () => {
  const fullWeek = (monday: string) =>
    [0, 1, 3, 4].map((offset) => ({
      programDayId: String(offset),
      logDate: new Date(Date.UTC(2026, 8, Number(monday.slice(8)) + offset))
        .toISOString()
        .slice(0, 10),
    }));

  it('tanpa sesi → 0', () => {
    expect(streakWeeks([], 4, '2026-09-30')).toBe(0);
  });

  it('dua minggu lengkap sebelumnya, minggu ini belum lengkap → 2', () => {
    const finished = [
      ...fullWeek('2026-09-14'),
      ...fullWeek('2026-09-21'),
      { programDayId: 'x', logDate: '2026-09-28' },
    ];
    expect(streakWeeks(finished, 4, '2026-09-30')).toBe(2);
  });

  it('minggu berjalan yang sudah lengkap ikut dihitung', () => {
    const finished = [...fullWeek('2026-09-21'), ...fullWeek('2026-09-28')];
    expect(streakWeeks(finished, 4, '2026-10-02')).toBe(2);
  });

  it('minggu yang bolong memutus streak', () => {
    const finished = [...fullWeek('2026-09-07'), ...fullWeek('2026-09-21')];
    expect(streakWeeks(finished, 4, '2026-09-30')).toBe(1);
  });
});

describe('nextScheduledDay', () => {
  it('Rabu → Kamis; Jumat → Senin depan', () => {
    expect(nextScheduledDay(schedule, '2026-09-30')?.label).toBe('Upper B');
    expect(nextScheduledDay(schedule, '2026-10-02')?.label).toBe('Upper A');
  });
});
