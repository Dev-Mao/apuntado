import type { Round } from "../round/round.js";
import { bestArrangement } from "./hand-arranger.js";
import { pointsOf } from "./score-calculator.js";

export interface RoundScore {
  readonly playerId: string;
  readonly points: number;
}

export const settleRound = (round: Round): RoundScore[] => {
  if (round.currentStatus === "PLAYING") throw new Error("A round in progress cannot be settled");
  const winnerId = round.result?.winnerId ?? null;
  return round.playerIds.map((playerId) => ({
    playerId,
    points: playerId === winnerId ? 0 : pointsOf(bestArrangement(round.handOf(playerId)).loose),
  }));
};
