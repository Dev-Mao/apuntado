"use client";

import { useCallback, useEffect, useId, useRef } from "react";

import { cn } from "@/lib";

import { CloseIcon } from "./icons";

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
        "m-auto max-h-[92dvh] w-[min(100%-2rem,42rem)] overflow-y-auto overscroll-contain rounded-[1.75rem] bg-paper-light p-0 text-ink shadow-sheet max-sm:mb-0 max-sm:w-full max-sm:max-w-none max-sm:rounded-b-none",
        className,
      )}
    >
      <div className="relative px-5 pt-6 pb-6 sm:px-9 sm:pt-8">
        <button
          type="button"
          onClick={onClose}
          disabled={!dismissible}
          aria-label={closeLabel}
          className="absolute top-4 right-4 grid size-11 place-items-center rounded-full border border-ink/25 transition-colors not-disabled:hover:bg-ink not-disabled:hover:text-paper disabled:opacity-40 sm:top-6 sm:right-6"
        >
          <CloseIcon className="size-4" />
        </button>
        <h2 id={titleId} className="pr-14 text-[2rem] leading-tight sm:text-[2.6rem]">
          {title}
        </h2>
        {children}
      </div>
    </dialog>
  );
}
