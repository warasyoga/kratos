import { sortWeekdays, type Weekday } from '@/domain/common/weekday';
import { t } from '@/shared/i18n/id';
import { ToggleChip } from '@/shared/ui/ToggleChip';
import { weekdays } from '../options';

export interface DayPickerProps {
  value: readonly Weekday[];
  onChange: (days: Weekday[]) => void;
  error?: string | undefined;
}

export function DayPicker({ value, onChange, error }: DayPickerProps) {
  const toggle = (day: Weekday) =>
    onChange(sortWeekdays(value.includes(day) ? value.filter((d) => d !== day) : [...value, day]));

  return (
    <div className="flex flex-col gap-2">
      <div
        role="group"
        aria-label={t.profile.trainingDays}
        className="grid grid-cols-4 gap-2 sm:grid-cols-7"
      >
        {weekdays.map((day) => (
          <ToggleChip
            key={day}
            label={t.weekdayShort[day]}
            pressed={value.includes(day)}
            onToggle={() => toggle(day)}
          />
        ))}
      </div>
      <p className="text-[13px] text-muted">{t.onboarding.schedule.count(value.length)}</p>
      {error && <p className="text-[13px] text-bad">{error}</p>}
    </div>
  );
}
