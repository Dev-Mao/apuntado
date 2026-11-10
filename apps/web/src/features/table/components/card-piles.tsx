"use client";

import { useTranslation } from "react-i18next";

import { CARD_SIZE, PlayingCard } from "@/components";
import { useCardLabel } from "@/hooks/use-card-label";

import type { CardDto } from "@apuntado/contracts";

interface CardPilesProps {
  stockCount: number;
  discardTop: CardDto | null;
}

const PILE_LABEL_CLASSES = "label-caps text-[0.62rem] text-paper/70";

export function CardPiles({ stockCount, discardTop }: CardPilesProps) {
  const { t } = useTranslation();
  const cardLabel = useCardLabel();
  const discardLabel = discardTop ? t("table.discardLabel", { card: cardLabel(discardTop) }) : t("table.discardEmpty");

  return (
    <div className="flex items-end justify-center gap-10 sm:gap-16">
      <figure role="img" aria-label={t("table.stockLabel", { count: stockCount })} className="flex flex-col items-center gap-3">
        <span aria-hidden="true" className="grid">
          <PlayingCard card={null} size={CARD_SIZE.LG} className="col-start-1 row-start-1 translate-1.5 brightness-75" />
          <PlayingCard card={null} size={CARD_SIZE.LG} className="col-start-1 row-start-1 translate-0.5 brightness-90" />
          <PlayingCard card={null} size={CARD_SIZE.LG} className="col-start-1 row-start-1" />
        </span>
        <figcaption aria-hidden="true" className="flex items-baseline gap-2">
          <span className={PILE_LABEL_CLASSES}>{t("table.stock")}</span>
          <span className="font-display text-paper">{stockCount}</span>
        </figcaption>
      </figure>
      <figure role="img" aria-label={discardLabel} className="flex flex-col items-center gap-3">
        <span aria-hidden="true" className="relative block">
          <span className="absolute inset-0 rotate-[-9deg] rounded-[9%/6.4%] bg-card/80 shadow-card" />
          <span className="absolute inset-0 rotate-[6deg] rounded-[9%/6.4%] bg-card/90 shadow-card" />
          {discardTop ? (
            <PlayingCard card={discardTop} size={CARD_SIZE.LG} className="rotate-[-2deg]" />
          ) : (
            <span className="relative block aspect-[5/7] w-16 rounded-[9%/6.4%] border border-dashed border-paper/40 sm:w-24 lg:w-28" />
          )}
        </span>
        <figcaption aria-hidden="true" className={PILE_LABEL_CLASSES}>
          {t("table.discard")}
        </figcaption>
      </figure>
    </div>
  );
}
