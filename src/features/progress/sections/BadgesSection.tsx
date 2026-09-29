import { useQuery } from '@tanstack/react-query';
import { Award, ChevronRight, Lock } from 'lucide-react';
import { Link } from 'react-router';
import { queryKeys } from '@/application/queryKeys';
import { useServices } from '@/application/ServicesContext';
import { toLocalDate } from '@/domain/common/clock';
import { t } from '@/shared/i18n/id';
import { cn } from '@/shared/lib/cn';
import { formatShortDate } from '@/shared/lib/format';
import { Card } from '@/shared/ui/Card';

/** Lencana terbuka memakai warna pelat IWF bergiliran (design system). */
const PLATE = ['text-plate-red', 'text-plate-blue', 'text-plate-yellow', 'text-plate-green'];

/** Lencana (terkunci abu, terbuka berwarna) dan daftar evaluasi. docs/fitur/11-pencapaian.md */
export function BadgesSection() {
  const { achievements, evaluation } = useServices();
  const { data: badges = [] } = useQuery({
    queryKey: queryKeys.achievementList,
    queryFn: achievements.list,
  });
  const { data: periods = [] } = useQuery({
    queryKey: queryKeys.evaluations,
    queryFn: evaluation.periods,
  });
  const unlocked = badges.filter((b) => b.unlockedAt !== null).length;

  return (
    <>
      <Card>
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-sans label-caps">{t.achievements.title}</h2>
          <span className="text-xs font-semibold text-muted">
            {t.achievements.unlockedCount(unlocked, badges.length)}
          </span>
        </div>
        <ul className="grid grid-cols-2 gap-2">
          {badges.map((badge, i) => {
            const text = t.achievements.badge[badge.id];
            const open = badge.unlockedAt !== null;
            return (
              <li
                key={badge.id}
                className={cn(
                  'flex flex-col gap-1 rounded-xl bg-surface-2 p-3',
                  !open && 'opacity-60',
                )}
              >
                <span className="flex items-center gap-1.5">
                  {open ? (
                    <Award className={cn('size-5', PLATE[i % PLATE.length])} aria-hidden />
                  ) : (
                    <Lock className="size-4 text-muted" aria-hidden />
                  )}
                  <span className="text-sm font-bold">{text.name}</span>
                </span>
                <span className="text-xs text-muted">{text.rule}</span>
                <span className="text-[11px] font-semibold text-muted">
                  {badge.unlockedAt === null
                    ? t.achievements.locked
                    : t.achievements.unlockedOn(formatShortDate(toLocalDate(badge.unlockedAt)))}
                </span>
              </li>
            );
          })}
        </ul>
      </Card>

      <Card>
        <h2 className="font-sans label-caps">{t.achievements.evaluationsTitle}</h2>
        {periods.length === 0 ? (
          <p className="text-sm text-muted">{t.achievements.evaluationsEmpty}</p>
        ) : (
          <ul className="flex flex-col divide-y divide-line">
            {periods.map((p) => (
              <li key={p.key}>
                <Link
                  to={`/progres/evaluasi/${p.key}`}
                  className="flex min-h-12 items-center justify-between gap-2 py-2 font-semibold"
                >
                  {t.achievements.periodTitle(p.kind, p.label)}
                  <ChevronRight className="size-4 text-muted" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
