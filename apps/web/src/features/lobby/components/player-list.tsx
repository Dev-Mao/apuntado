"use client";

import { useTranslation } from "react-i18next";

import { cn } from "@/lib";

import type { LobbyPlayer } from "../types";

interface PlayerListProps {
  players: readonly LobbyPlayer[];
  selfId: string;
  maxPlayers: number;
}

function PlayerRow({ player, isSelf }: { player: LobbyPlayer; isSelf: boolean }) {
  const { t } = useTranslation();
  return (
    <li className="flex items-center gap-4 py-4">
      <span
        aria-hidden="true"
        className={cn("size-2.5 shrink-0 rounded-full", player.isConnected ? "bg-coral" : "border border-ink/50")}
      />
      <span className="min-w-0 flex-1 truncate font-display text-xl sm:text-2xl">
        {player.name}
        {isSelf && <span className="ml-2 text-base text-ink-soft italic">({t("common.you")})</span>}
      </span>
      {player.isHost && (
        <span className="label-caps rounded-full bg-ink px-3 pt-[0.4rem] pb-[0.3rem] text-[0.6rem] text-paper">
          {t("lobby.host")}
        </span>
      )}
      <span className={cn("label-caps text-right text-[0.65rem] max-sm:sr-only sm:w-28", player.isConnected ? "text-ink" : "text-ink-soft")}>
        {player.isConnected ? t("lobby.connected") : t("lobby.disconnected")}
      </span>
    </li>
  );
}

export function PlayerList({ players, selfId, maxPlayers }: PlayerListProps) {
  const { t } = useTranslation();
  const emptySeats = Math.max(maxPlayers - players.length, 0);

  return (
    <section aria-labelledby="players-title">
      <div className="flex items-baseline justify-between border-b border-ink pb-3">
        <h2 id="players-title" className="label-caps text-xs">
          {t("lobby.players")}
        </h2>
        <span className="font-display text-lg italic">
          {t("lobby.playersCount", { count: players.length, max: maxPlayers })}
        </span>
      </div>
      <ul className="divide-y divide-line">
        {players.map((player) => (
          <PlayerRow key={player.id} player={player} isSelf={player.id === selfId} />
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
