"use client";

import { memo } from "react";

import { useTranslation } from "react-i18next";

import { useCardLabel } from "@/hooks/use-card-label";
import { cardId, cn } from "@/lib";

import { CLOSURE_SLOT } from "../types";
import { ClosureCardButton } from "./closure-card-button";

import type { SlotPanelProps } from "../types";

function SlotPanelBase({ slot, title, cards, onReturn }: SlotPanelProps) {
  const { t } = useTranslation();
  const cardLabel = useCardLabel();
  const isDiscard = slot === CLOSURE_SLOT.DISCARD;

  return (
    <section
      aria-label={title}
      className={cn(
        "flex min-h-28 flex-col gap-3 rounded-2xl border-[1.5px] p-3",
        isDiscard ? "border-coral bg-coral/10" : "border-dashed border-ink/35",
      )}
    >
      <h3 className="label-caps text-[0.65rem]">{title}</h3>
      {cards.length === 0 ? (
        <p className="font-display text-sm text-ink-soft italic">{t("closure.slotEmpty")}</p>
      ) : (
        <ul className="flex flex-wrap gap-y-2 [&>li+li]:-ml-6">
          {cards.map((card) => (
            <li key={cardId(card)}>
              <ClosureCardButton
                card={card}
                label={t("closure.returnCard", { card: cardLabel(card) })}
                onPress={onReturn}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export const SlotPanel = memo(SlotPanelBase);
