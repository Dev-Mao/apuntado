"use client";

import { memo } from "react";

import { CARD_SIZE, PlayingCard } from "@/components";
import { cardId, cn } from "@/lib";

import type { ClosureCardButtonProps } from "../types";

function ClosureCardButtonBase({ card, label, isSelected, onPress }: ClosureCardButtonProps) {
  const id = cardId(card);
  return (
    <button
      type="button"
      data-closure-card={id}
      aria-label={label}
      aria-pressed={isSelected}
      onClick={() => onPress(id)}
      className={cn(
        "rounded-[10%/7%] transition-transform focus-visible:outline-offset-2",
        isSelected && "-translate-y-2 outline-[3px] outline-coral outline-solid",
      )}
    >
      <PlayingCard card={card} size={CARD_SIZE.SM} />
    </button>
  );
}

export const ClosureCardButton = memo(ClosureCardButtonBase);
