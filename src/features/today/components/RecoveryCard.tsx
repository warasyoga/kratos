import { Check } from 'lucide-react';
import { useServices } from '@/application/ServicesContext';
import { RECOVERY_PLAN, type ActivityLog } from '@/domain/today/activity';
import { WHO_AEROBIC_MIN_PER_WEEK } from '@/domain/standards';
import { t } from '@/shared/i18n/id';
import { cn } from '@/shared/lib/cn';
import { Card } from '@/shared/ui/Card';
import { Meter } from '@/shared/ui/Meter';
import { useTodayAction } from '../hooks/useToday';

/** Checklist hari pemulihan + menit aerobik minggu ini terhadap WHO 150 menit. */
export function RecoveryCard({
  activities,
  aerobicMinutes,
}: {
  activities: readonly ActivityLog[];
  aerobicMinutes: number;
}) {
  const { today } = useServices();
  const { run, pending } = useTodayAction();

  return (
    <Card>
      <h2 className="font-sans label-caps">{t.today.recoveryTitle}</h2>
      <p className="text-sm text-muted">{t.today.recoveryBody}</p>
      <ul className="flex flex-col gap-2">
        {RECOVERY_PLAN.map(({ kind, minutes }) => {
          const logged = activities.find((a) => a.kind === kind);
          const name = t.today.activity[kind] ?? kind;
          return (
            <li key={kind}>
              <button
                type="button"
                disabled={pending}
                aria-pressed={logged !== undefined}
                aria-label={logged ? t.today.undoActivity(name) : t.today.markDone(name)}
                onClick={() =>
                  void run(() =>
                    logged ? today.removeActivity(logged.id) : today.logActivity(kind),
                  )
                }
                className="flex min-h-12 w-full items-center gap-3 rounded-[14px] border border-line px-3.5 py-2 text-left"
              >
                <span
                  className={cn(
                    'grid size-7 shrink-0 place-items-center rounded-lg border-2',
                    logged ? 'border-good bg-good text-surface' : 'border-line text-transparent',
                  )}
                >
                  <Check className="size-4" strokeWidth={3} aria-hidden />
                </span>
                <span className="flex-1 font-semibold">{name}</span>
                <span className="text-[13px] text-muted">{t.today.minutes(minutes)}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <Meter
        label={t.today.aerobicWeek(aerobicMinutes)}
        valueText={`${aerobicMinutes} / ${WHO_AEROBIC_MIN_PER_WEEK.min}`}
        ratio={aerobicMinutes / WHO_AEROBIC_MIN_PER_WEEK.min}
      />
    </Card>
  );
}
