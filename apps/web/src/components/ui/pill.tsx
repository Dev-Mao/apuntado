import { cn } from "@/lib";

import type { ReactNode } from "react";

export const PILL_TONE = {
  ACTIVE: "active",
  LIGHT: "light",
  DARK: "dark",
} as const;

export type PillTone = (typeof PILL_TONE)[keyof typeof PILL_TONE];

const TONE_CLASSES: Readonly<Record<PillTone, string>> = {
  active: "border-coral bg-coral text-ink",
  light: "border-ink/70 text-ink",
  dark: "border-paper/50 text-paper",
};

const DOT_CLASSES: Readonly<Record<PillTone, string>> = {
  active: "bg-ink",
  light: "bg-coral",
  dark: "bg-paper/70",
};

interface PillProps {
  tone?: PillTone;
  className?: string | undefined;
  children: ReactNode;
}

export function Pill({ tone = PILL_TONE.LIGHT, className, children }: PillProps) {
  return (
    <span
      className={cn(
        "label-caps inline-flex items-center gap-1.5 rounded-full border px-2.5 pt-[0.45rem] pb-[0.35rem] text-[0.6rem] whitespace-nowrap max-sm:tracking-[0.06em] sm:gap-2 sm:px-3 sm:text-[0.7rem]",
        TONE_CLASSES[tone],
        className,
      )}
    >
      <span aria-hidden="true" className={cn("size-1.5 shrink-0 rounded-full", DOT_CLASSES[tone])} />
      {children}
    </span>
  );
}
