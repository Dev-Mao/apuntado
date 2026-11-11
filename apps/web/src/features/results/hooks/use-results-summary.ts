"use client";

import { useMemo } from "react";

import { nicknameOf } from "@/lib";

import { RESULT_STATUS } from "../types";

import type { ResultsSummary, ResultStatus } from "../types";
import type { PlayerView, ScoreLineView, TableSnapshot } from "@apuntado/contracts";

function statusOf(line: ScoreLineView, view: PlayerView): ResultStatus {
  if (line.playerId === view.winnerId) return RESULT_STATUS.WINNER;
  if (line.eliminated) return RESULT_STATUS.ELIMINATED;
  if (line.playerId === view.lastRound?.roundWinnerId) return RESULT_STATUS.CLOSED;
  return RESULT_STATUS.PLAYING;
}

function summarize({ seats, view }: TableSnapshot): ResultsSummary {
  const { lastRound } = view;
  const roundPoints = new Map(lastRound?.scores.map((score) => [score.playerId, score.points]));
  const roundWinnerId = lastRound?.roundWinnerId ?? null;
  return {
    mode: view.mode,
    threshold: view.eliminationThreshold,
    roundNumber: lastRound?.roundNumber ?? view.roundNumber,
    isFinished: view.status === "FINISHED",
    winnerName: view.winnerId ? nicknameOf(seats, view.winnerId) : null,
    roundWinnerName: roundWinnerId ? nicknameOf(seats, roundWinnerId) : null,
    closureType: lastRound?.closureType ?? null,
    rows: view.scoreboard.map((line) => ({
      playerId: line.playerId,
      name: nicknameOf(seats, line.playerId),
      roundPoints: roundPoints.get(line.playerId) ?? 0,
      total: line.total,
      eliminated: line.eliminated,
      status: statusOf(line, view),
    })),
  };
}

export function useResultsSummary(snapshot: TableSnapshot): ResultsSummary {
  return useMemo(() => summarize(snapshot), [snapshot]);
}
