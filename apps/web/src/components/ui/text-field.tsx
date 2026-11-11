import { useId } from "react";

import { cn } from "@/lib";

import type { TextFieldProps } from "./types";

export function TextField({ label, hint, error, className, id, ...props }: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const describedBy = cn(hint && hintId, error && errorId) || undefined;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={inputId} className="label-caps text-[0.7rem] text-ink-soft">
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          "h-12 w-full rounded-full border-[1.5px] bg-card/70 px-5 font-display text-lg text-ink placeholder:text-ink-soft/60 placeholder:italic",
          error ? "border-coral-deep" : "border-ink/40 focus-visible:border-ink",
        )}
        {...props}
      />
      {hint && (
        <p id={hintId} className="font-display text-sm text-ink-soft italic">
          {hint}
        </p>
      )}
      <p id={errorId} aria-live="polite" className="min-h-0 text-sm font-semibold text-coral-ink empty:hidden">
        {error}
      </p>
    </div>
  );
}
