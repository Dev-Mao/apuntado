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
        "relative rounded-[10%/7%] transition-transform focus-visible:outline-offset-2",
        isSelected && "-translate-y-2 outline-[3px] outline-coral outline-solid",
      )}
    >
      <PlayingCard card={card} size={CARD_SIZE.SM} />
      {isLocked && (
        <span
          aria-hidden="true"
          className="label-caps absolute inset-x-0 bottom-1 mx-auto w-fit rounded-full bg-ink px-1.5 pt-[0.2rem] pb-[0.1rem] text-[0.5rem] whitespace-nowrap text-paper"
        >
          {t("table.hand.lockedTag")}
        </span>
      )}
    </button>
  );
}

export const ClosureCardButton = memo(ClosureCardButtonBase);
