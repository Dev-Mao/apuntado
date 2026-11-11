import { describe, expect, it } from "vitest";
import { SeededRandom } from "../../../../shared/random.js";
import { type Card, points } from "../entities/card.js";
import { createDeck, shuffle } from "../entities/deck.js";
import { Round } from "../round/round.js";
import { bestArrangement } from "../services/hand-arranger.js";
import { settleRound } from "../services/round-settler.js";
import { type GameMode, Match } from "./match.js";

const MAX_ROUNDS = 200;

const worstLooseCard = (hand: readonly Card[]): Card => {
  const { loose } = bestArrangement(hand);
  const pool = loose.length > 0 ? loose : hand;
  return pool.reduce((worst, c) => (points(c) > points(worst) ? c : worst));
};

const playRound = (round: Round): void => {
  while (round.currentStatus === "PLAYING") {
    const player = round.currentPlayerId;
    round.drawFromStock(player);
    if (round.currentStatus === "PLAYING") round.discard(player, worstLooseCard(round.handOf(player)));
  }
};

const playMatch = (mode: GameMode, players: number, seed: number): Match => {
  const random = new SeededRandom(seed);
  const match = Match.create(Array.from({ length: players }, (_, i) => `j${i}`), { mode, eliminationThreshold: 101 });
  while (match.currentStatus === "PLAYING" && match.roundsPlayed < MAX_ROUNDS) {
    const round = Round.start(match.activePlayerIds, shuffle(createDeck(), random), match.firstTurnIndex, random);
    playRound(round);
    match.recordRound(settleRound(round), round.result?.winnerId ?? null);
  }
  return match;
};

describe("Partidas completas simuladas, sin red ni interfaz", () => {
  it.each([2, 3, 4])("una partida Clásica de %i jugadores termina en una ronda con ganador", (players) => {
    const match = playMatch("CLASICA", players, players);
    expect(match.currentStatus).toBe("FINISHED");
    expect(match.roundsPlayed).toBe(1);
    expect(match.winnerId).not.toBeNull();
  });

  it.each([
    ["APUNTADO", 2], ["APUNTADO", 3], ["APUNTADO", 4], ["AMBAS", 3],
  ] as const)("una partida %s de %i jugadores avanza hasta el umbral y deja un solo ganador", (mode, players) => {
    for (const seed of [1, 2, 3]) {
      const match = playMatch(mode, players, seed);
      expect(match.currentStatus).toBe("FINISHED");
      expect(match.roundsPlayed).toBeGreaterThan(1);
      expect(match.activePlayerIds).toEqual([match.winnerId]);
      expect(match.isEliminated(match.winnerId!)).toBe(false);
    }
  });
});
