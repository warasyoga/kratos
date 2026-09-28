import { useState } from 'react';
import { useServices } from '@/application/ServicesContext';
import type { ParqStatus } from '@/domain/profile/parq';
import { t } from '@/shared/i18n/id';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Chip, type ChipTone } from '@/shared/ui/Chip';
import { Sheet } from '@/shared/ui/Sheet';
import { useProfileAction } from '../hooks/useProfileAction';
import { ParqForm, type ParqDraft } from './ParqForm';

const TONE: Record<ParqStatus, ChipTone> = {
  missing: 'warn',
  clear: 'good',
  consult_doctor: 'warn',
  expired: 'warn',
};

export function ParqCard({ status }: { status: ParqStatus }) {
  const { profile } = useServices();
  const { run, pending, errors } = useProfileAction();
  const [draft, setDraft] = useState<ParqDraft | null>(null);

  const save = async (answers: ParqDraft) => {
    if (await run(() => profile.submitParq(answers))) setDraft(null);
  };

  return (
    <Card>
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-sans label-caps">{t.parq.title}</h2>
        <Chip tone={TONE[status]}>{t.parq.status[status]}</Chip>
      </div>
      {status === 'consult_doctor' && (
        <p className="text-[13px] text-muted">{t.parq.consultAdvice}</p>
      )}
      <Button variant="ghost" size="sm" onClick={() => setDraft({})}>
        {t.parq.redo}
      </Button>

      <Sheet
        open={draft !== null}
        title={t.parq.title}
        onClose={() => setDraft(null)}
        footer={
          draft && (
            <Button fullWidth disabled={pending} onClick={() => void save(draft)}>
              {t.common.save}
            </Button>
          )
        }
      >
        {draft && <ParqForm value={draft} onChange={setDraft} errors={errors} />}
      </Sheet>
    </Card>
  );
}
