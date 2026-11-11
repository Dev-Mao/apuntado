"use client";

import { memo } from "react";

import { useTranslation } from "react-i18next";

import { CARD_SIZE, PlayingCard } from "@/components";
import { useCardLabel } from "@/hooks/use-card-label";
import { cardId, cn } from "@/lib";

import type { HandCardProps } from "../types";

export const HAND_HELP_ID = "hand-help";

function HandCardBase({
  card,
  index,
  isSelected,
  isLocked,
  isDragging,
  fanStyle,
  onToggle,
  onKeyDown,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
}: HandCardProps) {
  const { t } = useTranslation();
  const cardLabel = useCardLabel();
  const id = cardId(card);
  const label = isLocked ? t("table.hand.lockedCard", { card: cardLabel(card) }) : cardLabel(card);

  return (
    <li style={fanStyle} className={cn("origin-bottom first:ml-0 -ml-[2.6rem] sm:-ml-11", isDragging && "z-10")}>
      <button
        type="button"
        data-hand-index={index}
        data-card-id={id}
        aria-label={label}
        aria-pressed={isSelected}
        aria-describedby={HAND_HELP_ID}
        onClick={() => onToggle(id)}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        className={cn(
          "relative block touch-none rounded-[9%/6.4%] transition-[translate,scale] duration-150 select-none hover:-translate-y-2 focus-visible:-translate-y-2 focus-visible:outline-offset-4",
          isSelected && "-translate-y-5 outline-[3px] outline-coral outline-solid hover:-translate-y-6",
          isDragging && "scale-105 cursor-grabbing",
        )}
      >
        <PlayingCard card={card} size={CARD_SIZE.MD} className={cn(isLocked && "brightness-90")} />
        {isLocked && (
          <span
            aria-hidden="true"
            className="label-caps absolute -top-5 left-0 rounded-full bg-ink px-1.5 pt-[0.2rem] pb-[0.1rem] text-[0.5rem] whitespace-nowrap text-paper"
          >
            {t("table.hand.lockedTag")}
          </span>
        )}
      </button>
    </li>
  );
}

export const HandCard = memo(HandCardBase);
