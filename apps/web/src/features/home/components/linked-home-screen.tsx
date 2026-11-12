"use client";

import { useRoomCode } from "@/features/realtime";

import { HomeScreen } from "./home-screen";

export function LinkedHomeScreen() {
  return <HomeScreen linkCode={useRoomCode()} />;
}
