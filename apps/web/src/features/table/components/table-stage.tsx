"use client";

import { useTranslation } from "react-i18next";

import { Pill, PILL_TONE } from "@/components";

import { CardPiles } from "./card-piles";
import { OpponentSeat, SEAT } from "./opponent-seat";

import type { Seat } from "./opponent-seat";
import type { TableView } from "../types";

const SEATS_BY_COUNT: Readonly<Record<number, readonly Seat[]>> = {
  1: [SEAT.TOP],
  2: [SEAT.LEFT, SEAT.RIGHT],
  3: [SEAT.LEFT, SEAT.TOP, SEAT.RIGHT],
};

export function TableStage({ view }: { view: TableView }) {
  const { t } = useTranslation();
  const seats = SEATS_BY_COUNT[view.opponents.length] ?? [];
  const isMyTurn = view.turn.playerId === view.selfId;

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
              key={opponent.id}
              opponent={opponent}
              seat={seats[index] ?? SEAT.TOP}
              isTurn={view.turn.playerId === opponent.id}
            />
          ))}
        </ul>
        <div className="flex flex-1 items-center justify-center lg:absolute lg:inset-0">
          <CardPiles stockCount={view.stockCount} discardTop={view.discardTop} />
        </div>
        <div className="flex justify-center lg:absolute lg:inset-x-0 lg:bottom-[7%]">
          <Pill tone={isMyTurn ? PILL_TONE.ACTIVE : PILL_TONE.DARK}>
            {t("common.you")} · {view.selfName}
            <span className="font-display text-sm tracking-normal">{view.hand.length}</span>
          </Pill>
        </div>
      </div>
    </section>
  );
}
