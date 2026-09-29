import { useState } from 'react';
import { useServices } from '@/application/ServicesContext';
import type { HealthCondition } from '@/domain/profile/types';
import { t } from '@/shared/i18n/id';
import { tProfile } from '@/shared/i18n/onboarding';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Chip } from '@/shared/ui/Chip';
import { Sheet } from '@/shared/ui/Sheet';
import { describeChanges } from '../changeMessages';
import { useProfileAction } from '../hooks/useProfileAction';
import { ConditionForm } from './ConditionForm';
import { EMPTY_CONDITION, toConditionDraft, type ConditionDraft } from './conditionDraft';

type Editing = { id?: string; active?: boolean; draft: ConditionDraft };

export function HealthCard({ conditions }: { conditions: readonly HealthCondition[] }) {
  const { gym } = useServices();
  const { run, pending, errors, clearErrors } = useProfileAction();
  const [editing, setEditing] = useState<Editing | null>(null);

  const open = (value: Editing) => {
    clearErrors();
    setEditing(value);
  };

  const save = async (value: Editing) => {
    const options = {
      ...(value.id && { id: value.id }),
      ...(value.active !== undefined && { active: value.active }),
    };
    const saved = await run(
      () => gym.saveHealthCondition(value.draft, options),
      ({ changes }) => describeChanges(changes),
    );
    if (saved) setEditing(null);
  };

  const remove = async (id: string) => {
    const removed = await run(
      () => gym.removeHealthCondition(id),
      ({ changes }) => describeChanges(changes),
    );
    if (removed) setEditing(null);
  };

  return (
    <Card>
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-sans label-caps">{tProfile.health}</h2>
        <Button variant="ghost" size="sm" onClick={() => open({ draft: EMPTY_CONDITION })}>
          + {t.common.add}
        </Button>
      </div>
      {conditions.length === 0 ? (
        <p className="text-muted">{tProfile.healthEmpty}</p>
      ) : (
        <ul className="flex flex-col divide-y divide-line">
          {conditions.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => open({ id: c.id, active: c.active, draft: toConditionDraft(c) })}
                className="flex min-h-12 w-full items-center justify-between gap-3 py-2.5 text-left"
              >
                <span>
                  <span className="block font-semibold">{t.bodyArea[c.area]}</span>
                  <span className="text-[13px] text-muted">
                    {t.severity[c.severity].label}
                    {c.note && ` · ${c.note}`}
                  </span>
                </span>
                <Chip tone={c.active ? 'warn' : 'neutral'}>
                  {c.active ? tProfile.healthActive : tProfile.healthInactive}
                </Chip>
              </button>
            </li>
          ))}
        </ul>
      )}

      <Sheet
        open={editing !== null}
        title={editing?.id ? tProfile.healthEdit : tProfile.healthAdd}
        onClose={() => setEditing(null)}
        footer={
          editing && (
            <div className="flex flex-col gap-2">
              <Button fullWidth disabled={pending} onClick={() => void save(editing)}>
                {t.common.save}
              </Button>
              {editing.id && (
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="ghost"
                    disabled={pending}
                    onClick={() => void save({ ...editing, active: !editing.active })}
                  >
                    {editing.active ? tProfile.healthDeactivate : tProfile.healthActivate}
                  </Button>
                  <Button
                    variant="ghost"
                    disabled={pending}
                    onClick={() => void remove(editing.id ?? '')}
                  >
                    {t.common.remove}
                  </Button>
                </div>
              )}
            </div>
          )
        }
      >
        {editing && (
          <ConditionForm
            value={editing.draft}
            onChange={(draft) => setEditing({ ...editing, draft })}
            errors={errors}
          />
        )}
      </Sheet>
    </Card>
  );
}
