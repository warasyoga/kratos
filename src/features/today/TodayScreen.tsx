import { useServices } from '@/application/ServicesContext';
import { toLocalDate } from '@/domain/common/clock';
import { t } from '@/shared/i18n/id';
import { formatDayDate } from '@/shared/lib/format';
import { Card } from '@/shared/ui/Card';
import { Chip } from '@/shared/ui/Chip';
import { ScreenHeader } from '@/shared/ui/ScreenHeader';

export function TodayScreen() {
  const { clock } = useServices();
  const today = toLocalDate(clock.now());

  return (
    <div className="flex flex-col gap-3.5">
      <ScreenHeader eyebrow={formatDayDate(today)} title={t.today.title} />
      <Card>
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-sans label-caps">{t.today.emptyTitle}</h2>
          <Chip tone="accent">{t.common.builtInStage(3)}</Chip>
        </div>
        <p className="text-muted">{t.today.emptyBody}</p>
      </Card>
    </div>
  );
}
