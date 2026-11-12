import { cn } from "@/lib";

const DANGER_RATIO = 0.8;

interface ThresholdBarProps {
  value: number;
  max: number;
  className?: string | undefined;
}

export function ThresholdBar({ value, max, className }: ThresholdBarProps) {
  const ratio = max > 0 ? Math.min(value / max, 1) : 0;
  return (
    <span aria-hidden="true" className={cn("block h-[3px] w-full overflow-hidden rounded-full bg-current/12", className)}>
      <span
        className={cn(
          "block h-full origin-left animate-[bar-grow_900ms_var(--ease-glide)_both] rounded-full transition-transform duration-700 ease-glide",
          ratio >= DANGER_RATIO ? "bg-coral-ink" : "bg-coral",
        )}
        style={{ transform: `scaleX(${ratio})` }}
      />
    </span>
  );
}
