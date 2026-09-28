import { cn } from '@/shared/lib/cn';

export interface ToggleChipProps {
  label: string;
  pressed: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

/** Chip on/off (mis. hari latihan, alat gym). */
export function ToggleChip({ label, pressed, onToggle, disabled }: ToggleChipProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        'min-h-11 rounded-full border px-3.5 text-[13px] font-semibold transition-colors disabled:opacity-50',
        pressed ? 'border-accent bg-accent-soft text-accent' : 'border-line text-muted',
      )}
    >
      {label}
    </button>
  );
}
