import Image from "next/image";
import { memo } from "react";

import { CARD_BACK_SRC, cardImageSrc, cn, FACE_RANKS, isRedSuit, SUIT_SYMBOL } from "@/lib";

import type { CardDto } from "@apuntado/contracts";

const USE_CARD_IMAGES = false;

export const CARD_SIZE = {
  XS: "xs",
  SM: "sm",
  MD: "md",
  LG: "lg",
} as const;

export type CardSize = (typeof CARD_SIZE)[keyof typeof CARD_SIZE];

const SIZE_CLASSES: Readonly<Record<CardSize, string>> = {
  xs: "w-7 sm:w-10",
  sm: "w-11 sm:w-14",
  md: "w-[4.4rem] sm:w-24",
  lg: "w-16 sm:w-24 lg:w-28",
};

const SIZE_PX: Readonly<Record<CardSize, number>> = { xs: 40, sm: 56, md: 96, lg: 112 };

interface PlayingCardProps {
  card: CardDto | null;
  size?: CardSize;
  className?: string | undefined;
}

const FRAME_CLASSES = "@container relative aspect-[5/7] shrink-0 overflow-hidden rounded-[9%/6.4%] shadow-card";

function CardIndex({ card, className }: { card: CardDto; className?: string }) {
  return (
    <span className={cn("absolute flex flex-col items-center leading-none", className)}>
      <span className="font-display text-[length:24cqw] font-bold tracking-tighter">{card.rank}</span>
      <span className="text-[length:18cqw]">{SUIT_SYMBOL[card.suit]}</span>
    </span>
  );
}

function CardFace({ card }: { card: CardDto }) {
  const isFace = FACE_RANKS.includes(card.rank);
  return (
    <span className={cn("absolute inset-0 bg-card", isRedSuit(card.suit) ? "text-suit-red" : "text-ink")}>
      <span className="absolute inset-[6%] rounded-[6%/4.3%] border border-current/20" />
      <CardIndex card={card} className="top-[6%] left-[7%]" />
      <CardIndex card={card} className="right-[7%] bottom-[6%] rotate-180" />
      <span className="absolute inset-0 grid place-items-center">
        {isFace ? (
          <span className="font-display text-[length:62cqw] leading-none italic">{card.rank}</span>
        ) : (
          <span className="text-[length:46cqw] leading-none">{SUIT_SYMBOL[card.suit]}</span>
        )}
      </span>
    </span>
  );
}

function CardBack() {
  return (
    <span className="absolute inset-0 bg-coral">
      <span className="absolute inset-[7%] rounded-[6%/4.3%] border border-paper/80 bg-[repeating-linear-gradient(45deg,transparent_0_5cqw,rgb(243_234_217/0.28)_5cqw_6cqw),repeating-linear-gradient(-45deg,transparent_0_5cqw,rgb(243_234_217/0.28)_5cqw_6cqw)]" />
      <span className="absolute inset-0 grid place-items-center">
        <span className="grid size-[38cqw] rotate-45 place-items-center border border-paper bg-coral">
          <span className="size-[14cqw] rounded-full bg-paper" />
        </span>
      </span>
    </span>
  );
}

function CardImage({ card, size }: { card: CardDto | null; size: CardSize }) {
  const width = SIZE_PX[size];
  return (
    <Image
      src={card ? cardImageSrc(card) : CARD_BACK_SRC}
      alt=""
      width={width}
      height={Math.round(width * 1.4)}
      className="absolute inset-0 size-full object-cover"
    />
  );
}

function PlayingCardBase({ card, size = CARD_SIZE.MD, className }: PlayingCardProps) {
  return (
    <span aria-hidden="true" className={cn(FRAME_CLASSES, SIZE_CLASSES[size], "block", className)}>
      {USE_CARD_IMAGES ? <CardImage card={card} size={size} /> : card ? <CardFace card={card} /> : <CardBack />}
    </span>
  );
}

export const PlayingCard = memo(PlayingCardBase);
