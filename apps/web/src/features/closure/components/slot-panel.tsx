"use client";

import { memo } from "react";

import { useTranslation } from "react-i18next";

import { useCardLabel } from "@/hooks/use-card-label";
import { cardId, cn } from "@/lib";

import { CLOSURE_SLOT } from "../types";
import { ClosureCardButton } from "./closure-card-button";

import type { SlotPanelProps } from "../types";

function SlotPanelBase({ slot, title, cards, canAssign, onAssign, onReturn }: SlotPanelProps) {
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
        className="flex min-h-11 items-center justify-between gap-2 label-caps rounded-t-2xl px-3 text-left text-[0.58rem] tracking-[0.12em] enabled:hover:bg-coral/15 disabled:cursor-default"
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
        <ul className="flex flex-wrap gap-y-2 px-3 pb-3 [&>li+li]:-ml-7">
          {cards.map((card) => (
            <li key={cardId(card)} className="animate-turn-in">
              <ClosureCardButton card={card} label={t("closure.returnCard", { card: cardLabel(card) })} onPress={onReturn} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export const SlotPanel = memo(SlotPanelBase);
