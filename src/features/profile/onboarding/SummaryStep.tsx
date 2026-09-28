import { WEEKDAYS } from '@/domain/common/weekday';
import { t } from '@/shared/i18n/id';
import { formatNumber } from '@/shared/lib/format';
import { Card } from '@/shared/ui/Card';
import { Stat } from '@/shared/ui/Stat';
import { useActiveProgram, useProfileOverview } from '../hooks/useProfile';
import { StepLayout } from './StepLayout';

export function SummaryStep({ hasWarnings, onNext }: { hasWarnings: boolean; onNext: () => void }) {
  const overview = useProfileOverview().data;
  const program = useActiveProgram().data;
  const text = t.onboarding.summary;
  const byWeekday = new Map(program?.days.map((d) => [d.day.weekday, d.day.label]));

  return (
    <StepLayout
      title={text.title}
      body={program ? text.body(program.program.name) : t.common.loading}
      primaryLabel={t.common.next}
      onPrimary={onNext}
    >
      {overview && (
        <Card>
          <h2 className="font-sans label-caps">{text.targets}</h2>
          <div className="grid grid-cols-3 gap-2">
            <Stat value={formatNumber(overview.targets.kcal, 0)} label={t.profile.kcal} />
            <Stat value={`${overview.targets.proteinG} g`} label={t.profile.protein} />
            <Stat
              value={`${formatNumber(overview.targets.waterRestL)} L`}
              label={t.profile.water}
            />
          </div>
        </Card>
      )}
      {program && (
        <Card>
          <h2 className="font-sans label-caps">{text.schedule}</h2>
          <ul className="grid grid-cols-7 gap-1 text-center">
            {WEEKDAYS.map((day) => {
              const label = byWeekday.get(day);
              return (
                <li
                  key={day}
                  className={`flex flex-col gap-0.5 rounded-lg py-2 text-[11px] font-bold ${label ? 'bg-accent text-accent-ink' : 'bg-surface-2 text-muted'}`}
                >
                  {t.weekdayShort[day]}
                  <span className="font-display text-[13px] leading-tight">{label ?? '—'}</span>
                </li>
              );
            })}
          </ul>
          {hasWarnings && <p className="text-[13px] text-warn">{text.unfilled}</p>}
        </Card>
      )}
    </StepLayout>
  );
}
