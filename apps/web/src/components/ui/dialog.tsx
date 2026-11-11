"use client";

import { useCallback, useEffect, useId, useRef } from "react";

import { cn } from "@/lib";

import type { DialogProps } from "./types";
import type { SyntheticEvent } from "react";

export function Dialog({ open, title, closeLabel, dismissible = true, onClose, className, children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  const handleCancel = useCallback(
    (event: SyntheticEvent<HTMLDialogElement>) => {
      if (!dismissible) event.preventDefault();
    },
    [dismissible],
  );

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={handleCancel}
      onClose={onClose}
      className={cn(
        "m-auto max-h-[92dvh] w-[min(100%-1.5rem,44rem)] overflow-y-auto rounded-3xl bg-paper p-0 text-ink shadow-2xl",
        className,
      )}
    >
      <div className="paper-grain relative p-5 sm:p-8">
        <button
          type="button"
          onClick={onClose}
          disabled={!dismissible}
          aria-label={closeLabel}
          className="absolute top-4 right-4 grid size-10 place-items-center rounded-full border border-ink/30 text-xl leading-none not-disabled:hover:bg-ink not-disabled:hover:text-paper disabled:opacity-40 sm:top-6 sm:right-6"
        >
          <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M3 3l10 10M13 3L3 13" />
          </svg>
        </button>
        <h2 id={titleId} className="pr-12 font-display text-3xl leading-tight sm:text-4xl">
          {title}
        </h2>
        {children}
      </div>
    </dialog>
  );
}
