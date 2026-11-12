"use client";

import { useTranslation } from "react-i18next";

import { cn } from "@/lib";

import type { SeatView } from "@apuntado/contracts";

interface PlayerListProps {
  seats: readonly SeatView[];
  hostId: string;
  selfId: string;
  maxPlayers: number;
}

interface PlayerRowProps {
  seat: SeatView;
  isSelf: boolean;
  isHost: boolean;
}

const TAG_CLASSES = "label-caps rounded-full px-3 pt-[0.4rem] pb-[0.3rem] text-[0.6rem]";

function PlayerRow({ seat, isSelf, isHost }: PlayerRowProps) {
  const { t } = useTranslation();
  return (
    <li className="flex items-center gap-4 py-4">
      <span
        aria-hidden="true"
        className={cn("size-2.5 shrink-0 rounded-full", seat.connected ? "bg-coral" : "border border-ink/50")}
      />
      <span className="min-w-0 flex-1 truncate font-display text-xl sm:text-2xl">
        {seat.nickname}
        {isSelf && <span className="ml-2 text-base text-ink-soft italic">{t("lobby.selfTag")}</span>}
      </span>
      {seat.isBot && <span className={cn(TAG_CLASSES, "border border-ink/50")}>{t("lobby.bot")}</span>}
      {isHost && <span className={cn(TAG_CLASSES, "bg-ink text-paper")}>{t("lobby.host")}</span>}
      <span className={cn("label-caps text-right text-[0.65rem] max-sm:sr-only sm:w-28", seat.connected ? "text-ink" : "text-ink-soft")}>
        {seat.connected ? t("lobby.connected") : t("lobby.disconnected")}
      </span>
    </li>
  );
}

export function PlayerList({ seats, hostId, selfId, maxPlayers }: PlayerListProps) {
  const { t } = useTranslation();
  const emptySeats = Math.max(maxPlayers - seats.length, 0);

  return (
    <section aria-labelledby="players-title">
      <div className="flex items-baseline justify-between border-b border-ink pb-3">
        <h2 id="players-title" className="label-caps text-xs">
          {t("lobby.players")}
        </h2>
        <span className="font-display text-lg italic">
          {t("lobby.playersCount", { count: seats.length, max: maxPlayers })}
        </span>
      </div>
      <ul className="divide-y divide-line">
        {seats.map((seat) => (
          <PlayerRow key={seat.playerId} seat={seat} isSelf={seat.playerId === selfId} isHost={seat.playerId === hostId} />
        ))}
        {Array.from({ length: emptySeats }, (_, index) => (
          <li key={`empty-${index}`} className="flex items-center gap-4 py-4 text-ink-soft">
            <span aria-hidden="true" className="size-2.5 shrink-0 rounded-full border border-dashed border-ink/40" />
            <span className="font-display text-xl italic sm:text-2xl">{t("lobby.emptySeat")}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
