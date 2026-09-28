export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl bg-surface-2 px-1.5 py-2 text-center">
      <b className="block font-display text-[21px] leading-tight tabular-nums">{value}</b>
      <span className="text-[11px] font-semibold text-muted">{label}</span>
    </div>
  );
}
