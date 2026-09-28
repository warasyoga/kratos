import { EQUIPMENT, type Equipment } from '@/domain/profile/types';
import { t } from '@/shared/i18n/id';
import { ToggleChip } from '@/shared/ui/ToggleChip';

export interface EquipmentPickerProps {
  value: readonly Equipment[];
  onChange: (equipment: Equipment[]) => void;
  disabled?: boolean;
}

export function EquipmentPicker({ value, onChange, disabled }: EquipmentPickerProps) {
  const toggle = (item: Equipment) =>
    onChange(
      value.includes(item)
        ? value.filter((e) => e !== item)
        : EQUIPMENT.filter((e) => e === item || value.includes(e)),
    );

  return (
    <div role="group" aria-label={t.profile.equipment} className="flex flex-wrap gap-2">
      {EQUIPMENT.map((item) => (
        <ToggleChip
          key={item}
          label={t.equipment[item]}
          pressed={value.includes(item)}
          onToggle={() => toggle(item)}
          {...(disabled !== undefined && { disabled })}
        />
      ))}
    </div>
  );
}
