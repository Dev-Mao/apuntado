"use client";

import { useMemo } from "react";

import { useTranslation } from "react-i18next";

import { CARD_SIZE, Pill, PILL_TONE, PlayingCard } from "@/components";
import { cn } from "@/lib";

import { fanStyles } from "../fan-layout";

import type { OpponentView, SeatView } from "@apuntado/contracts";

const FAN_SPREAD_DEG = 5;
const FAN_ARC_PX = 0.6;

export const SEAT_POSITION = {
  TOP: "top",
  LEFT: "left",
  RIGHT: "right",
} as const;

export type SeatPosition = (typeof SEAT_POSITION)[keyof typeof SEAT_POSITION];

const POSITION_CLASSES: Readonly<Record<SeatPosition, string>> = {
  top: "lg:absolute lg:top-[7%] lg:left-1/2 lg:-translate-x-1/2",
  left: "lg:absolute lg:top-[40%] lg:left-[9%] lg:-translate-y-1/2",
  right: "lg:absolute lg:top-[40%] lg:right-[9%] lg:-translate-y-1/2",
};

interface OpponentSeatProps {
  opponent: OpponentView;
  seat: SeatView | undefined;
  position: SeatPosition;
  isTurn: boolean;
}

export function OpponentSeat({ opponent, seat, position, isTurn }: OpponentSeatProps) {
  const { t } = useTranslation();
  const styles = useMemo(() => fanStyles(opponent.cardCount, FAN_SPREAD_DEG, FAN_ARC_PX), [opponent.cardCount]);
  const name = seat?.nickname ?? "";
  const isConnected = seat?.connected ?? false;

  return (
    <li className={cn("flex min-w-0 flex-col items-center gap-3", POSITION_CLASSES[position])}>
      <span className="sr-only">
        {t("table.opponentLabel", { name, count: opponent.cardCount })}
        {isTurn && ` ${t("table.opponentTurn")}`}
        {!isConnected && ` ${t("table.opponentDisconnected")}`}
      </span>
      <span aria-hidden="true" className={cn("flex pt-1", !isConnected && "opacity-40")}>
        {styles.map((style, index) => (
          <span key={index} style={style} className="origin-bottom first:ml-0 -ml-[1.4rem] sm:-ml-[1.9rem]">
            <PlayingCard card={null} size={CARD_SIZE.XS} />
          </span>
        ))}
      </span>
      <Pill tone={isTurn ? PILL_TONE.ACTIVE : PILL_TONE.DARK} className="max-w-full">
        <span aria-hidden="true" className="truncate">
          {name}
        </span>
        <span aria-hidden="true" className="font-display text-sm tracking-normal">
          {opponent.cardCount}
        </span>
      </Pill>
    </li>
  );
}
