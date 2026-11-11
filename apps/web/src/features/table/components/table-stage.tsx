"use client";

import { useTranslation } from "react-i18next";

import { Pill, PILL_TONE } from "@/components";
import { nicknameOf, seatOf } from "@/lib";

import { CardPiles } from "./card-piles";
import { OpponentSeat, SEAT_POSITION } from "./opponent-seat";

import type { SeatPosition } from "./opponent-seat";
import type { TableSnapshot } from "@apuntado/contracts";

const POSITIONS_BY_COUNT: Readonly<Record<number, readonly SeatPosition[]>> = {
  1: [SEAT_POSITION.TOP],
  2: [SEAT_POSITION.LEFT, SEAT_POSITION.RIGHT],
  3: [SEAT_POSITION.LEFT, SEAT_POSITION.TOP, SEAT_POSITION.RIGHT],
};

export function TableStage({ snapshot }: { snapshot: TableSnapshot }) {
  const { t } = useTranslation();
  const { seats, view } = snapshot;
  const positions = POSITIONS_BY_COUNT[view.opponents.length] ?? [];
  const isMyTurn = view.currentPlayerId === view.playerId;

  return (
    <section aria-labelledby="stage-title" className="relative isolate mx-4 flex flex-col sm:mx-8 lg:mx-16 lg:min-h-0 lg:flex-1">
      <h2 id="stage-title" className="sr-only">
        {t("table.opponents")}
      </h2>
      <span aria-hidden="true" className="absolute top-[12%] -left-10 -z-10 size-40 rounded-full bg-coral sm:size-64 lg:-left-24 lg:size-[22rem]" />
      <span aria-hidden="true" className="absolute -right-10 bottom-[6%] -z-10 size-32 rounded-full bg-coral sm:size-52 lg:-right-20 lg:size-72" />
      <div className="relative flex flex-1 flex-col gap-8 rounded-[2.5rem] bg-felt px-3 pt-6 pb-5 text-paper shadow-[inset_0_0_0_1px_rgb(243_234_217/0.08)] lg:rounded-[50%/44%] lg:p-0">
        <span aria-hidden="true" className="pointer-events-none absolute inset-3 rounded-[2rem] border border-paper/10 lg:inset-5 lg:rounded-[50%/44%]" />
        <ul className="flex items-start justify-around gap-2 lg:contents">
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
        <div className="flex flex-1 items-center justify-center lg:absolute lg:inset-0">
          <CardPiles stockSize={view.stockSize} discardTop={view.discardTop} />
        </div>
        <div className="flex justify-center lg:absolute lg:inset-x-0 lg:bottom-[7%]">
          <Pill tone={isMyTurn ? PILL_TONE.ACTIVE : PILL_TONE.DARK}>
            {t("table.selfLabel", { name: nicknameOf(seats, view.playerId) })}
            <span className="font-display text-sm tracking-normal">{view.hand.length}</span>
          </Pill>
        </div>
      </div>
    </section>
  );
}
