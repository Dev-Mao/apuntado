import { cn } from "@/lib";

import { CARD_SIZE, PlayingCard } from "./playing-card";

import type { CardDto } from "@apuntado/contracts";
import type { CSSProperties } from "react";

const DEAL_STAGGER_MS = 110;
const OVERLAP_CLASSES = "-ml-[3.4rem] first:ml-0 sm:-ml-[4.5rem] lg:-ml-[5.1rem]";

interface CardFanProps {
  cards: readonly CardDto[];
  spreadDeg?: number;
  delayMs?: number;
  className?: string | undefined;
}

function fanStyle(index: number, count: number, spreadDeg: number, delayMs: number): CSSProperties {
  const offset = index - (count - 1) / 2;
  const style = {
    rotate: `${offset * spreadDeg}deg`,
    translate: `0 ${offset * offset * 6}px`,
    animationDelay: `${delayMs + index * DEAL_STAGGER_MS}ms`,
    "--from-x": `${-offset * 3}rem`,
  };
  return style as CSSProperties;
}

export function CardFan({ cards, spreadDeg = 9, delayMs = 200, className }: CardFanProps) {
  return (
    <span aria-hidden="true" className={cn("flex justify-center", className)}>
      {cards.map((card, index) => (
        <PlayingCard
          key={`${card.rank}${card.suit}`}
          card={card}
          size={CARD_SIZE.XL}
          className={cn("origin-bottom animate-hero-card", OVERLAP_CLASSES)}
          style={fanStyle(index, cards.length, spreadDeg, delayMs)}
        />
      ))}
    </span>
  );
}
