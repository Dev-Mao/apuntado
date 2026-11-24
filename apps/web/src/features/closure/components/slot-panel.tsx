"use client";

import { memo } from "react";

import { useTranslation } from "react-i18next";

import { useCardLabel } from "@/hooks/use-card-label";
import { cardId, cn } from "@/lib";

import { CLOSURE_SLOT } from "../types";
import { ClosureCardButton } from "./closure-card-button";

import type { SlotPanelProps } from "../types";
import type { CSSProperties } from "react";

function SlotPanelBase({ slot, title, cards, canAssign, lockedId, onAssign, onReturn }: SlotPanelProps) {
  const { t } = useTranslation();
  const cardLabel = useCardLabel();
  const isDiscard = slot === CLOSURE_SLOT.DISCARD;

  return (
    <section
      aria-label={title}
      className={cn(
        "flex min-h-32 flex-col short:min-h-24 rounded-2xl border transition-[border-color,background-color] duration-200",
        isDiscard ? "border-coral/60 bg-coral/[0.08]" : "border-dashed border-ink/25 bg-paper/60",
        canAssign && "border-solid border-coral bg-coral/15",
      )}
    >
      <button
        type="button"
        disabled={!canAssign}
        onClick={() => onAssign(slot)}
        aria-label={t("closure.moveToSlot", { slot: title })}
        className="flex min-h-11 items-center justify-between gap-2 label-caps rounded-t-2xl px-3 text-left text-[0.65rem] tracking-[0.12em] enabled:hover:bg-coral/15 disabled:cursor-default"
      >
        <span>{title}</span>
        {canAssign && (
          <span aria-hidden="true" className="animate-spark text-2xl leading-none text-coral-ink">
            +
          </span>
        )}
      </button>
      {cards.length === 0 ? (
        <p className={cn("px-3 pb-3 italic", canAssign ? "text-coral-ink" : "text-ink-soft")}>
          {canAssign ? t("closure.placeHere") : t("closure.slotEmpty")}
        </p>
      ) : (
        <ul style={{ "--n": cards.length } as CSSProperties} className="@container flex px-3 pt-1 pb-3 [--cw:3rem] sm:[--cw:3.5rem]">
          {cards.map((card) => (
            <li key={cardId(card)} className="shrink-0 animate-turn-in not-last:w-[min(calc(var(--cw)*0.62),calc((100cqw-var(--cw))/max(var(--n)-1,1)))]">
              <ClosureCardButton card={card} label={t("closure.returnCard", { card: cardLabel(card) })} isLocked={cardId(card) === lockedId} onPress={onReturn} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export const SlotPanel = memo(SlotPanelBase);
