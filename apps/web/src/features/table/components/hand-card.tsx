"use client";

import { memo } from "react";

import { useTranslation } from "react-i18next";

import { CARD_SIZE, PlayingCard, SparkStrokes } from "@/components";
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
    <li style={fanStyle} className={cn("origin-[50%_120%] transition-[rotate,translate] duration-300 ease-glide", isDragging && "z-10")}>
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
          "relative block w-(--card-w) touch-none rounded-[7%/5%] transition-[translate,scale] duration-300 ease-spring select-none focus-visible:outline-offset-4",
          isSelected ? "-translate-y-5 outline-[3px] outline-coral outline-solid sm:-translate-y-7" : "hover:-translate-y-2 focus-visible:-translate-y-2",
          isDragging && "scale-105 cursor-grabbing",
        )}
      >
        <PlayingCard
          card={card}
          size={CARD_SIZE.FLUID}
          className={cn(
            "transition-shadow duration-200",
            (isSelected || isDragging) && "shadow-lift",
          )}
        />
        {isSelected && <SparkStrokes className="absolute -top-6 -left-4 size-6 animate-spark text-coral sm:-top-7 sm:-left-5 sm:size-7" />}
        {isLocked && (
          <span
            aria-hidden="true"
            className="label-caps absolute -top-2.5 -left-1 rounded-full bg-ink px-1.5 pt-[0.2rem] pb-[0.1rem] text-[0.65rem] whitespace-nowrap text-paper"
          >
            {t("table.hand.lockedTag")}
          </span>
        )}
      </button>
    </li>
  );
}

export const HandCard = memo(HandCardBase);
