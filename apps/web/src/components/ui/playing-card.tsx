import Image from "next/image";
import { memo } from "react";

import { CARD_BACK_SRC, cardImageSrc, cn } from "@/lib";

import { CardBack, CardFace } from "./card-face";

import type { CardDto } from "@apuntado/contracts";
import type { CSSProperties } from "react";

export const CARD_ART = {
  CSS: "css",
  IMAGES: "images",
} as const;

type CardArt = (typeof CARD_ART)[keyof typeof CARD_ART];

const ART = CARD_ART.CSS as CardArt;

export const CARD_SIZE = {
  XS: "xs",
  SEAT: "seat",
  SM: "sm",
  MD: "md",
  LG: "lg",
  XL: "xl",
  FLUID: "fluid",
  FILL: "fill",
} as const;

export type CardSize = (typeof CARD_SIZE)[keyof typeof CARD_SIZE];

const SIZE_CLASSES: Readonly<Record<CardSize, string>> = {
  xs: "w-[1.4rem] sm:w-[1.75rem]",
  seat: "w-[1.6rem] sm:w-[2.1rem] lg:w-[3.4rem]",
  sm: "w-[3rem] sm:w-[3.5rem]",
  md: "w-[4.25rem] sm:w-[5rem]",
  lg: "w-[4.6rem] sm:w-[5.75rem] lg:w-[6.5rem]",
  xl: "w-[5.25rem] sm:w-[7rem] lg:w-[8rem]",
  fluid: "w-(--card-w)",
  fill: "w-full",
};

interface PlayingCardProps {
  card: CardDto | null;
  size?: CardSize;
  className?: string | undefined;
  style?: CSSProperties | undefined;
}

function CardArtwork({ card }: { card: CardDto | null }) {
  if (ART === CARD_ART.IMAGES) {
    return <Image src={card ? cardImageSrc(card) : CARD_BACK_SRC} alt="" fill sizes="8rem" className="object-cover" />;
  }
  return card ? <CardFace card={card} /> : <CardBack />;
}

function PlayingCardBase({ card, size = CARD_SIZE.MD, className, style }: PlayingCardProps) {
  return (
    <span
      aria-hidden="true"
      data-card-visual=""
      style={style}
      className={cn(
        "@container relative block aspect-[5/7] shrink-0 overflow-hidden rounded-[7%/5%] shadow-card",
        SIZE_CLASSES[size],
        className,
      )}
    >
      <CardArtwork card={card} />
      <span className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_rgb(27_31_30/0.08)]" />
    </span>
  );
}

export const PlayingCard = memo(PlayingCardBase);
