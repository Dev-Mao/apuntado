"use client";

import { memo } from "react";

import { useTranslation } from "react-i18next";

import { CARD_SIZE, PlayingCard } from "@/components";
import { cardId, cn } from "@/lib";

import type { ClosureCardButtonProps } from "../types";

function ClosureCardButtonBase({ card, label, isSelected, isLocked, onPress }: ClosureCardButtonProps) {
  const { t } = useTranslation();
  const id = cardId(card);
  return (
    <button
      type="button"
      data-closure-card={id}
      aria-label={label}
      aria-pressed={isSelected}
      onClick={() => onPress(id)}
      className={cn(
        "relative block rounded-[7%/5%] transition-[translate] duration-300 ease-spring focus-visible:outline-offset-2",
        isSelected ? "-translate-y-2.5 outline-[3px] outline-coral outline-solid" : "hover:-translate-y-1",
      )}
    >
      <PlayingCard
        card={card}
        size={CARD_SIZE.SM}
        className={cn("transition-shadow duration-200", isSelected && "shadow-lift")}
      />
      {isLocked && (
        <span
          aria-hidden="true"
          className="absolute inset-x-0 -bottom-1.5 mx-auto w-fit rounded-full label-caps bg-ink px-1.5 pt-[0.15rem] text-[0.65rem] whitespace-nowrap text-paper"
        >
          {t("table.hand.lockedTag")}
        </span>
      )}
    </button>
  );
}

export const ClosureCardButton = memo(ClosureCardButtonBase);
