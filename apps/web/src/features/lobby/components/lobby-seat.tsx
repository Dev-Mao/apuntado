"use client";

import { useTranslation } from "react-i18next";

import { cn } from "@/lib";

import type { SeatView } from "@apuntado/contracts";

interface LobbySeatProps {
  seat: SeatView | null;
  isSelf: boolean;
  isHost: boolean;
  className: string;
}

function SeatTags({ seat, isSelf, isHost }: { seat: SeatView; isSelf: boolean; isHost: boolean }) {
  const { t } = useTranslation();
  const tags = [isSelf && t("lobby.selfTag"), isHost && t("lobby.host"), seat.isBot && t("lobby.bot")].filter(Boolean);
  return (
    <span className="label-caps flex flex-wrap justify-center gap-x-2 text-[0.52rem] text-ink-soft">
      {tags.map((tag) => (
        <span key={String(tag)}>{tag}</span>
      ))}
      {!seat.connected && <span className="text-coral-ink">{t("lobby.disconnected")}</span>}
    </span>
  );
}

export function LobbySeat({ seat, isSelf, isHost, className }: LobbySeatProps) {
  const { t } = useTranslation();

  if (!seat) {
    return (
      <li className={cn("flex w-24 flex-col items-center gap-1.5 text-center sm:w-32", className)}>
        <span aria-hidden="true" className="size-12 rounded-full border-[1.5px] border-dashed border-ink/30 bg-paper/60 sm:size-14" />
        <span className="rounded-full bg-paper/90 px-2 text-ink-soft italic">{t("lobby.emptySeat")}</span>
      </li>
    );
  }

  return (
    <li className={cn("flex w-24 animate-seat-in flex-col items-center gap-1 text-center sm:w-32", className)}>
      <span
        aria-hidden="true"
        className={cn(
          "grid size-12 place-items-center rounded-full border-[1.5px] border-ink text-2xl italic shadow-card sm:size-14",
          isSelf ? "bg-coral" : "bg-paper-light",
          !seat.connected && "opacity-45",
        )}
      >
        {seat.nickname.slice(0, 1).toUpperCase()}
      </span>
      <span className="w-full truncate rounded-full bg-paper-light/90 px-2 sm:text-lg">{seat.nickname}</span>
      <SeatTags seat={seat} isSelf={isSelf} isHost={isHost} />
    </li>
  );
}
