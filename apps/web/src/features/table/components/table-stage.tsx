"use client";

import { useTranslation } from "react-i18next";

import { SparkleIcon } from "@/components";
import { seatOf } from "@/lib";

import { CardPiles } from "./card-piles";
import { OpponentSeat, SEAT_POSITION } from "./opponent-seat";
import { SeatPill } from "./seat-pill";

import type { SeatPosition } from "./opponent-seat";
import type { PileAction } from "../types";
import type { TableSnapshot } from "@apuntado/contracts";

const POSITIONS_BY_COUNT: Readonly<Record<number, readonly SeatPosition[]>> = {
  1: [SEAT_POSITION.TOP],
  2: [SEAT_POSITION.LEFT, SEAT_POSITION.RIGHT],
  3: [SEAT_POSITION.LEFT, SEAT_POSITION.TOP, SEAT_POSITION.RIGHT],
};

interface TableStageProps {
  snapshot: TableSnapshot;
  selfName: string;
  stockAction: PileAction | null;
  discardAction: PileAction | null;
}

export function TableStage({ snapshot, selfName, stockAction, discardAction }: TableStageProps) {
  const { t } = useTranslation();
  const { seats, view } = snapshot;
  const positions = POSITIONS_BY_COUNT[view.opponents.length] ?? [];

  return (
    <section aria-labelledby="stage-title" className="relative flex min-h-0 flex-col gap-2 px-3 pt-4 pb-4 text-paper sm:px-8 lg:pt-6 lg:pb-0">
      <h2 id="stage-title" className="sr-only">
        {t("table.opponents")}
      </h2>
      <ul className="flex items-start justify-around gap-1 lg:contents">
        {view.opponents.map((opponent, index) => (
          <OpponentSeat
            key={opponent.playerId}
            opponent={opponent}
            seat={seatOf(seats, opponent.playerId)}
            position={positions[index] ?? SEAT_POSITION.TOP}
            isTurn={view.currentPlayerId === opponent.playerId}
          />
        ))}
      </ul>
      <div className="relative flex flex-1 items-center justify-center py-4 lg:absolute lg:inset-x-0 lg:top-[14%] lg:bottom-[6%]">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-1/2 aspect-square h-[115%] max-h-[34rem] -translate-1/2 rounded-full border border-paper/15"
        />
        <SparkleIcon className="pointer-events-none absolute top-[18%] left-[18%] hidden size-5 text-paper/70 sm:block" />
        <CardPiles stockSize={view.stockSize} discardTop={view.discardTop} stockAction={stockAction} discardAction={discardAction} />
      </div>
      <div className="flex justify-center lg:absolute lg:inset-x-0 lg:bottom-3 [@media(max-height:44rem)]:max-lg:hidden">
        <SeatPill name={t("table.selfLabel", { name: selfName })} count={view.hand.length} isSelf isActive={view.currentPlayerId === view.playerId} />
      </div>
    </section>
  );
}
