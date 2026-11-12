"use client";

import { useMemo } from "react";

import { useTranslation } from "react-i18next";

import { CARD_SIZE, PlayingCard } from "@/components";
import { cn } from "@/lib";

import { fanStyles } from "../fan-layout";
import { SeatPill } from "./seat-pill";

import type { OpponentView, SeatView } from "@apuntado/contracts";

const FAN_SPREAD_DEG = 5;
const FAN_ARC_PX = 0.5;

export const SEAT_POSITION = {
  TOP: "top",
  LEFT: "left",
  RIGHT: "right",
} as const;

export type SeatPosition = (typeof SEAT_POSITION)[keyof typeof SEAT_POSITION];

const POSITION_CLASSES: Readonly<Record<SeatPosition, string>> = {
  top: "lg:absolute lg:top-0 lg:left-1/2 lg:-translate-x-1/2",
  left: "lg:absolute lg:top-[38%] lg:left-[4%] lg:-translate-y-1/2",
  right: "lg:absolute lg:top-[38%] lg:right-[4%] lg:-translate-y-1/2",
};

const PILL_PLACE_CLASSES: Readonly<Record<SeatPosition, string>> = {
  top: "self-end translate-y-1/3 tiny:translate-y-0",
  left: "self-end translate-y-1/3 tiny:translate-y-0 lg:self-center lg:translate-y-0",
  right: "self-end translate-y-1/3 tiny:translate-y-0 lg:self-center lg:translate-y-0",
};

const FAN_TURN_CLASSES: Readonly<Record<SeatPosition, string>> = {
  top: "",
  left: "lg:rotate-90",
  right: "lg:-rotate-90",
};

interface SeatIdentity {
  readonly name: string;
  readonly isConnected: boolean;
  readonly isBot: boolean;
}

function identityOf(seat: SeatView | undefined): SeatIdentity {
  return { name: seat?.nickname ?? "", isConnected: seat?.connected ?? false, isBot: seat?.isBot ?? false };
}

function SeatDescription({ identity, count, isTurn }: { identity: SeatIdentity; count: number; isTurn: boolean }) {
  const { t } = useTranslation();
  return (
    <span className="sr-only">
      {t("table.opponentLabel", { name: identity.name, count })}
      {identity.isBot && ` ${t("table.opponentBot")}`}
      {isTurn && ` ${t("table.opponentTurn")}`}
      {!identity.isConnected && ` ${t("table.opponentDisconnected")}`}
    </span>
  );
}

function SeatFan({ playerId, count, position }: { playerId: string; count: number; position: SeatPosition }) {
  const styles = useMemo(() => fanStyles(count, FAN_SPREAD_DEG, FAN_ARC_PX), [count]);
  return (
    <span aria-hidden="true" data-seat-fan={playerId} className={cn("flex items-end", FAN_TURN_CLASSES[position])}>
      {styles.map((style, index) => (
        <span key={index} style={style} className="-ml-[1.15rem] origin-bottom first:ml-0 sm:-ml-[1.5rem] lg:-ml-[2.45rem]">
          <PlayingCard card={null} size={CARD_SIZE.SEAT} />
        </span>
      ))}
    </span>
  );
}

interface OpponentSeatProps {
  opponent: OpponentView;
  seat: SeatView | undefined;
  position: SeatPosition;
  isTurn: boolean;
}

export function OpponentSeat({ opponent, seat, position, isTurn }: OpponentSeatProps) {
  const identity = identityOf(seat);

  return (
    <li className={cn("grid min-w-0 flex-1 place-items-center lg:flex-none", POSITION_CLASSES[position])}>
      <SeatDescription identity={identity} count={opponent.cardCount} isTurn={isTurn} />
      <span className={cn("col-start-1 row-start-1 transition-opacity tiny:hidden", !identity.isConnected && "opacity-40")}>
        <SeatFan playerId={opponent.playerId} count={opponent.cardCount} position={position} />
      </span>
      <SeatPill
        name={identity.name}
        count={opponent.cardCount}
        isActive={isTurn}
        isConnected={identity.isConnected}
        className={cn("col-start-1 row-start-1 max-w-full sm:max-w-[11rem]", PILL_PLACE_CLASSES[position], "lg:max-w-[13rem]")}
      />
    </li>
  );
}
