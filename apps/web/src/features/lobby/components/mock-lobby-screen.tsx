"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { ROUTES } from "@/lib";

import { MOCK_LOBBY } from "../mock-data";
import { LobbyScreen } from "./lobby-screen";

export function MockLobbyScreen() {
  const router = useRouter();
  const handleStart = useCallback(() => router.push(ROUTES.TABLE), [router]);
  const handleLeave = useCallback(() => router.push(ROUTES.HOME), [router]);

  return <LobbyScreen lobby={MOCK_LOBBY} onStart={handleStart} onLeave={handleLeave} />;
}
