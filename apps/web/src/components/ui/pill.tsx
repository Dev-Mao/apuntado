import { cn } from "@/lib";

import type { ReactNode } from "react";

export const PILL_TONE = {
  LIGHT: "light",
  ACTIVE: "active",
  DARK: "dark",
} as const;

export type PillTone = (typeof PILL_TONE)[keyof typeof PILL_TONE];

const TONE_CLASSES: Readonly<Record<PillTone, string>> = {
  light: "bg-paper-light text-ink",
  active: "bg-coral text-ink",
  dark: "bg-ink text-paper",
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
        "label-caps inline-flex items-center gap-1.5 rounded-full px-2.5 pt-[0.4rem] pb-[0.3rem] text-[0.6rem] whitespace-nowrap",
        TONE_CLASSES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
