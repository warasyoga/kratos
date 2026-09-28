import { t } from '@/shared/i18n/id';
import { Card } from '@/shared/ui/Card';
import { Chip } from '@/shared/ui/Chip';
import { ScreenHeader } from '@/shared/ui/ScreenHeader';

export function WorkoutScreen() {
  return (
    <div className="flex flex-col gap-3.5">
      <ScreenHeader
        title={t.workout.title}
        aside={<Chip tone="accent">{t.common.builtInStage(5)}</Chip>}
      />
      <Card>
        <p className="text-muted">{t.workout.emptyBody}</p>
      </Card>
    </div>
  );
}
