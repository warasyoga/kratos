import { useState } from 'react';
import type { ConditionInput } from '@/application/profile/schemas';
import { t } from '@/shared/i18n/id';
import { tOnboarding, tProfile } from '@/shared/i18n/onboarding';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Sheet } from '@/shared/ui/Sheet';
import { ConditionForm } from '../components/ConditionForm';
import { EMPTY_CONDITION, type ConditionDraft } from '../components/conditionDraft';
import { validateCondition } from './draft';

export interface HealthStepFieldsProps {
  conditions: ConditionInput[];
  onChange: (conditions: ConditionInput[]) => void;
}

export function HealthStepFields({ conditions, onChange }: HealthStepFieldsProps) {
  const [editing, setEditing] = useState<ConditionDraft | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>();

  const save = () => {
    const result = validateCondition(editing);
    if (!result.ok) return setErrors(result.error.fields);
    onChange([...conditions, result.value]);
    setEditing(null);
  };

  return (
    <div className="flex flex-col gap-3">
      {conditions.length === 0 ? (
        <p className="rounded-[14px] border border-dashed border-line px-4 py-3 text-muted">
          {tOnboarding.health.none}
        </p>
      ) : (
        conditions.map((c, index) => (
          <Card key={`${c.area}-${index}`} className="flex-row items-center justify-between">
            <div>
              <p className="font-semibold">{t.bodyArea[c.area]}</p>
              <p className="text-[13px] text-muted">
                {t.severity[c.severity].label}
                {c.painfulMovements.length > 0 &&
                  ` · ${c.painfulMovements.map((m) => t.movement[m]).join(', ')}`}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onChange(conditions.filter((_, i) => i !== index))}
            >
              {t.common.remove}
            </Button>
          </Card>
        ))
      )}
      <Button
        variant="ghost"
        onClick={() => {
          setErrors(undefined);
          setEditing(EMPTY_CONDITION);
        }}
      >
        + {tOnboarding.health.add}
      </Button>

      <Sheet
        open={editing !== null}
        title={tProfile.healthAdd}
        onClose={() => setEditing(null)}
        footer={
          <Button fullWidth onClick={save}>
            {t.common.save}
          </Button>
        }
      >
        {editing && <ConditionForm value={editing} onChange={setEditing} errors={errors} />}
      </Sheet>
    </div>
  );
}
