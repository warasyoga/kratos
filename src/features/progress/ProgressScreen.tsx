import { t } from '@/shared/i18n/id';
import { Card } from '@/shared/ui/Card';
import { Chip } from '@/shared/ui/Chip';
import { ScreenHeader } from '@/shared/ui/ScreenHeader';

export function ProgressScreen() {
  return (
    <div className="flex flex-col gap-3.5">
      <ScreenHeader
        title={t.progress.title}
        aside={<Chip tone="accent">{t.common.builtInStage(7)}</Chip>}
      />
      <Card>
        <p className="text-muted">{t.progress.emptyBody}</p>
      </Card>
    </div>
  );
}
