export interface MeterProps {
  label: string;
  /** Teks nilai, sudah diformat: "96 / 137 g". */
  valueText: string;
  /** Rasio 0–1; nilai di luar rentang dipotong. */
  ratio: number;
}

export function Meter({ label, valueText, ratio }: MeterProps) {
  const percent = Math.round(Math.min(Math.max(ratio, 0), 1) * 100);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2 text-[13px]">
        <span>{label}</span>
        <span className="font-semibold tabular-nums">{valueText}</span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-valuetext={valueText}
        className="h-2 overflow-hidden rounded-full bg-surface-2"
      >
        <div className="h-full rounded-full bg-accent" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
