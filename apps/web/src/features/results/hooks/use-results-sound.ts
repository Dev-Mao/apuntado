"use client";

import { useEffect } from "react";

import { playSound } from "@/lib";

export function useResultsSound(isFinished: boolean, isSelfWinner: boolean) {
  useEffect(() => {
    if (!isFinished) playSound("roundOver");
    else playSound(isSelfWinner ? "win" : "lose");
  }, [isFinished, isSelfWinner]);
}
