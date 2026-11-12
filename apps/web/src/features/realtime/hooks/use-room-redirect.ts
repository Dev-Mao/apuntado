"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { roomHref } from "@/lib";

import { useRealtime } from "../context";
import { roomDestination } from "../room-state";

import type { RoomDestination } from "../room-state";
import type { RoomPage } from "@/lib";

interface CurrentPage {
  readonly page: RoomPage | null;
  readonly code: string | null;
}

function mustMove(current: CurrentPage, destination: RoomDestination): boolean {
  if (current.page === null) return !destination.finished;
  return current.page !== destination.page || current.code !== destination.code;
}

export function useRoomRedirect(page: RoomPage | null, code: string | null = null) {
  const router = useRouter();
  const { room } = useRealtime();
  const destination = roomDestination(room);
  const href = destination && mustMove({ page, code }, destination) ? roomHref(destination.page, destination.code) : null;

  useEffect(() => {
    if (href) router.replace(href);
  }, [href, router]);
}
