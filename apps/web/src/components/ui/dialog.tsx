"use client";

import { useEffect, useId, useRef } from "react";

import { cn } from "@/lib";

import type { DialogProps } from "./types";

export function Dialog({ open, title, closeLabel, onClose, className, children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

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
          aria-label={closeLabel}
          className="absolute top-4 right-4 grid size-10 place-items-center rounded-full border border-ink/30 text-xl leading-none hover:bg-ink hover:text-paper sm:top-6 sm:right-6"
        >
          <span aria-hidden="true">×</span>
        </button>
        <h2 id={titleId} className="pr-12 font-display text-3xl leading-tight sm:text-4xl">
          {title}
        </h2>
        {children}
      </div>
    </dialog>
  );
}
