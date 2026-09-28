import { useServices } from '@/application/ServicesContext';
import { WEEKDAYS, type Weekday } from '@/domain/common/weekday';
import type { ProgramDay } from '@/domain/program/types';
import { t } from '@/shared/i18n/id';
import { Sheet } from '@/shared/ui/Sheet';
import { ToggleChip } from '@/shared/ui/ToggleChip';
import { useProgramAction } from '../hooks/useProgram';

export interface MoveDaySheetProps {
  day: ProgramDay;
  /** Label hari latihan lain per hari (untuk menandai hari yang terpakai). */
  labels: ReadonlyMap<Weekday, string>;
  onClose: () => void;
}

export function MoveDaySheet({ day, labels, onClose }: MoveDaySheetProps) {
  const { program } = useServices();
  const { run, pending } = useProgramAction();

  const move = async (weekday: Weekday) => {
    if (weekday === day.weekday) return onClose();
    if (await run(() => program.edit.moveDay(day.id, weekday))) onClose();
  };

  return (
    <Sheet open title={t.program.moveDay} onClose={onClose}>
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted">{t.program.moveDayHint}</p>
        <div className="grid grid-cols-1 gap-2">
          {WEEKDAYS.map((weekday) => {
            const used = labels.get(weekday);
            return (
              <ToggleChip
                key={weekday}
                label={`${t.weekdayLong[weekday]}${used ? ` · ${used}` : ''}`}
                pressed={weekday === day.weekday}
                disabled={pending}
                onToggle={() => void move(weekday)}
              />
            );
          })}
        </div>
      </div>
    </Sheet>
  );
}
