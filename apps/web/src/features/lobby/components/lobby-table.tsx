"use client";

import { useTranslation } from "react-i18next";

import { SparkleIcon } from "@/components";

import { placeSeats } from "../seating";
import { LobbySeat } from "./lobby-seat";
import { ShareCode } from "./share-code";

import type { SeatSpot } from "../seating";
import type { LobbyView } from "@apuntado/contracts";

const SPOT_CLASSES: Readonly<Record<SeatSpot, string>> = {
  bottom: "bottom-0 left-1/2 -translate-x-1/2",
  top: "top-0 left-1/2 -translate-x-1/2",
  left: "top-1/2 left-0 -translate-y-1/2",
  right: "top-1/2 right-0 -translate-y-1/2",
};

export function LobbyTable({ lobby, selfId }: { lobby: LobbyView; selfId: string }) {
  const { t } = useTranslation();
  const placed = placeSeats(lobby.seats, selfId, lobby.maxSeats);

  return (
    <section aria-labelledby="players-title" className="relative mx-auto aspect-[5/6] w-full max-w-[46rem] sm:aspect-[16/10]">
      <h2 id="players-title" className="sr-only">
        {t("lobby.players")}
      </h2>
      <span aria-hidden="true" className="absolute inset-x-[21%] inset-y-[13%] rounded-[50%] bg-ink shadow-sheet sm:inset-x-[13%] sm:inset-y-[14%]">
        <span className="absolute inset-[7%] rounded-[50%] border border-paper/15" />
        <SparkleIcon className="absolute top-[22%] right-[20%] size-4 text-paper/70" />
      </span>
      <div className="absolute inset-0 grid place-items-center">
        <ShareCode code={lobby.code} />
      </div>
      <ul className="contents">
        {placed.map(({ spot, seat }) => (
          <LobbySeat
            key={`${spot}-${seat?.playerId ?? "empty"}`}
            seat={seat}
            isSelf={seat?.playerId === selfId}
            isHost={seat?.playerId === lobby.hostId}
            className={`absolute ${SPOT_CLASSES[spot]}`}
          />
        ))}
      </ul>
    </section>
  );
}
