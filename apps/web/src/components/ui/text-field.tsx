import { useId } from "react";

import { cn } from "@/lib";

import type { FieldTone, TextFieldProps } from "./types";

const LABEL_CLASSES: Readonly<Record<FieldTone, string>> = {
  paper: "text-ink-soft",
  ink: "text-paper/70",
};

const INPUT_CLASSES: Readonly<Record<FieldTone, string>> = {
  paper: "bg-paper-light/80 text-ink placeholder:text-ink-soft/60 border-ink/25 hover:border-ink/50 focus-visible:border-ink",
  ink: "bg-paper/[0.06] text-paper placeholder:text-paper/45 border-paper/30 hover:border-paper/55 focus-visible:border-paper",
};

const HINT_CLASSES: Readonly<Record<FieldTone, string>> = {
  paper: "text-ink-soft",
  ink: "text-paper/60",
};

export function TextField({ label, hint, error, tone = "paper", className, id, ...props }: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const describedBy = cn(hint && hintId, error && errorId) || undefined;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={inputId} className={cn("label-caps text-[0.65rem]", LABEL_CLASSES[tone])}>
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          "h-12 w-full rounded-full border-[1.5px] px-5 text-lg transition-colors duration-200 placeholder:italic focus-visible:outline-offset-2",
          INPUT_CLASSES[tone],
          error && "border-coral-ink",
        )}
        {...props}
      />
      {hint && (
        <p id={hintId} className={cn("text-sm italic", HINT_CLASSES[tone])}>
          {hint}
        </p>
      )}
      <p
        id={errorId}
        aria-live="polite"
        className={cn("text-sm font-semibold empty:hidden", tone === "ink" ? "text-salmon" : "text-coral-ink")}
      >
        {error}
      </p>
    </div>
  );
}
