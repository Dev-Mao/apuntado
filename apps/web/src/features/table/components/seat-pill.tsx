import { cn } from "@/lib";

import type { ReactNode } from "react";

interface SeatPillProps {
  name: ReactNode;
  count: number;
  isSelf?: boolean | undefined;
  isActive?: boolean | undefined;
  isConnected?: boolean | undefined;
  className?: string | undefined;
}

function pillTone(isSelf: boolean, isActive: boolean): string {
  if (isSelf) return "bg-coral text-ink";
  if (isActive) return "bg-paper-light text-ink shadow-[0_0_0_2px_var(--color-coral),0_10px_26px_-8px_rgb(224_122_95/0.8)]";
  return "bg-paper-light text-ink";
}

export function SeatPill({ name, count, isSelf = false, isActive = false, isConnected = true, className }: SeatPillProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative z-10 inline-flex max-w-full items-stretch overflow-hidden rounded-full shadow-card transition-[box-shadow,background-color] duration-300",
        pillTone(isSelf, isActive),
        !isConnected && "opacity-60",
        className,
      )}
    >
      <span className="flex min-w-0 items-center py-1 pr-2.5 pl-3 sm:pr-3.5 sm:pl-4">
        <span className="truncate text-[0.85rem] leading-tight font-semibold sm:text-base">{name}</span>
      </span>
      <span className="grid min-w-7 place-items-center bg-ink px-1.5 text-sm leading-none text-paper tabular-nums lining-nums sm:min-w-9 sm:px-2 sm:text-[0.95rem]">{count}</span>
    </span>
  );
}
