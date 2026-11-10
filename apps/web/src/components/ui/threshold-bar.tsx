import { cn } from "@/lib";

interface ThresholdBarProps {
  value: number;
  max: number;
  className?: string | undefined;
}

export function ThresholdBar({ value, max, className }: ThresholdBarProps) {
  const ratio = max > 0 ? Math.min(value / max, 1) : 0;
  return (
    <span aria-hidden="true" className={cn("block h-[3px] w-full overflow-hidden rounded-full bg-current/15", className)}>
      <span
        className="block h-full origin-left rounded-full bg-coral transition-transform duration-500"
        style={{ transform: `scaleX(${ratio})` }}
      />
    </span>
  );
}
