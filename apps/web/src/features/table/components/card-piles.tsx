"use client";

import { useMemo } from "react";

import { useTranslation } from "react-i18next";

import { CARD_SIZE, PlayingCard } from "@/components";
import { useCardLabel } from "@/hooks/use-card-label";
import { cn } from "@/lib";

import { focusHand } from "../focus-hand";
import { useFocusRecovery } from "../hooks";

import type { PileAction } from "../types";
import type { CardDto } from "@apuntado/contracts";
import type { ReactNode } from "react";

const SLOT_CLASSES = "relative block aspect-[5/7] w-[4.6rem] short:w-[3.6rem] tiny:w-[2.9rem] sm:w-[5.75rem] sm:short:w-[3.6rem] lg:w-[7rem] lg:short:w-[5.5rem]";
const GHOST_CLASSES = "absolute inset-0 rounded-[7%/5%] bg-card shadow-card";

interface PileProps {
  name: "stock" | "discard";
  label: string;
  caption: ReactNode;
  action: PileAction | null;
  children: ReactNode;
}

function Pile({ name, label, caption, action, children }: PileProps) {
  const body = (
    <>
      <span data-pile={name} className={SLOT_CLASSES}>
        {children}
      </span>
      <span aria-hidden="true" className="label-caps flex items-baseline gap-2 text-[0.6rem] text-paper/70">
        {caption}
      </span>
    </>
  );
  if (!action) {
    return (
      <figure role="img" aria-label={label} className="flex flex-col items-center gap-3 short:gap-1.5">
        {body}
      </figure>
    );
  }
  return (
    <button
      type="button"
      aria-label={`${action.label}. ${label}`}
      onClick={action.onPress}
      className="flex flex-col items-center gap-3 rounded-2xl p-1 short:gap-1.5 transition-[translate] duration-200 ease-spring hover:-translate-y-1 active:translate-y-0 [&_[data-pile]]:rounded-[7%/5%] [&_[data-pile]]:shadow-[0_0_0_3px_var(--color-coral),0_0_30px_-6px_rgb(224_122_95/0.9)]"
    >
      {body}
    </button>
  );
}

function EmptySlot() {
  return <span className="absolute inset-0 rounded-[7%/5%] border border-dashed border-paper/30" />;
}

interface CardPilesProps {
  stockSize: number;
  discardTop: CardDto | null;
  stockAction: PileAction | null;
  discardAction: PileAction | null;
}

export function CardPiles({ stockSize, discardTop, stockAction, discardAction }: CardPilesProps) {
  const { t } = useTranslation();
  const cardLabel = useCardLabel();
  const trigger = useMemo(() => [stockAction, discardAction], [stockAction, discardAction]);
  const { groupRef, handleFocus, handleBlur } = useFocusRecovery<HTMLDivElement>(trigger, focusHand);
  const discardLabel = discardTop ? t("table.discardLabel", { card: cardLabel(discardTop) }) : t("table.discardEmpty");

  return (
    <div
      ref={groupRef}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className="relative flex items-start justify-center gap-8 sm:gap-16 lg:gap-10 xl:gap-16"
    >
      <Pile
        name="stock"
        label={t("table.stockLabel", { count: stockSize })}
        action={stockAction}
        caption={
          <>
            {t("table.stock")}
            <span className="font-serif text-sm tracking-normal text-paper normal-case tabular-nums lining-nums">{stockSize}</span>
          </>
        }
      >
        {stockSize === 0 ? (
          <EmptySlot />
        ) : (
          <>
            <span className="absolute inset-0 translate-x-[3px] translate-y-[4px]">
              <PlayingCard card={null} size={CARD_SIZE.FILL} className="brightness-75" />
            </span>
            <span className="absolute inset-0 translate-x-[1.5px] translate-y-[2px]">
              <PlayingCard card={null} size={CARD_SIZE.FILL} className="brightness-90" />
            </span>
            <span data-pile-top="stock" className="absolute inset-0">
              <PlayingCard card={null} size={CARD_SIZE.FILL} />
            </span>
          </>
        )}
      </Pile>
      <Pile name="discard" label={discardLabel} action={discardAction} caption={t("table.discard")}>
        {discardTop ? (
          <>
            <span className={cn(GHOST_CLASSES, "rotate-[-7deg] brightness-90")} />
            <span className={cn(GHOST_CLASSES, "rotate-[4deg] brightness-95")} />
            <span data-pile-top="discard" className="absolute inset-0 rotate-[-1.5deg]">
              <PlayingCard card={discardTop} size={CARD_SIZE.FILL} />
            </span>
          </>
        ) : (
          <EmptySlot />
        )}
      </Pile>
    </div>
  );
}
