import { useState } from 'react';
import { useServices } from '@/application/ServicesContext';
import type { Weekday } from '@/domain/common/weekday';
import { errorText, t } from '@/shared/i18n/id';
import { Button } from '@/shared/ui/Button';
import { Sheet } from '@/shared/ui/Sheet';
import { useProfileAction } from '../hooks/useProfileAction';
import { DayPicker } from './DayPicker';

export function ScheduleSheet({
  current,
  onClose,
}: {
  current: readonly Weekday[];
  onClose: () => void;
}) {
  const { profile } = useServices();
  const { run, pending, errors } = useProfileAction();
  const [days, setDays] = useState<Weekday[]>([...current]);
  const unchanged = days.join() === current.join();

  const save = async () => {
    const saved = await run(
      () => profile.changeTrainingDays(days),
      ({ programName }) => [t.changes.newProgram(programName)],
    );
    if (saved) onClose();
  };

  return (
    <Sheet
      open
      title={t.profile.editSchedule}
      onClose={onClose}
      footer={
        <Button fullWidth disabled={pending || unchanged} onClick={() => void save()}>
          {t.profile.scheduleConfirm}
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <DayPicker value={days} onChange={setDays} error={errorText(errors?._)} />
        <p className="rounded-[14px] bg-warn-bg px-3.5 py-3 text-[13px] text-warn">
          {t.profile.scheduleWarning}
        </p>
      </div>
    </Sheet>
  );
}
