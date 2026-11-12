import { describe, expect, it } from "vitest";
import { ManualClock } from "../../../../shared/manual-clock.test-support.js";
import { SeededRandom } from "../../../../shared/random.js";
import type { GameMode } from "../../domain/match/match.js";
import { RuleResolver } from "../../domain/rules/rule-resolver.js";
import { InMemoryGameRepository } from "../../infrastructure/repositories/in-memory-game-repository.js";
import { DeclareClosure } from "../use-cases/declare-closure.js";
import { DiscardCard } from "../use-cases/discard-card.js";
import { DrawCard } from "../use-cases/draw-card.js";
import { StartGame } from "../use-cases/start-game.js";
import { StartNextRound } from "../use-cases/start-next-round.js";
import { EventSpy, JournalSpy, seatsOf } from "../use-cases/use-cases.test-support.js";
import { BotPlayer } from "./bot-player.js";
import { SimpleBotStrategy } from "./simple-bot-strategy.js";

const MAX_TURNS = 20_000;

const playBotMatch = (mode: GameMode, seed: number) => {
  const games = new InMemoryGameRepository();
  const clock = new ManualClock();
  const journal = new JournalSpy();
  const events = new EventSpy();
  const useCases = {
    draw: new DrawCard(games, journal, events, clock),
    discard: new DiscardCard(games, journal, events, clock),
    declare: new DeclareClosure(games, new RuleResolver(), journal, events, clock),
  };
  const bot = new BotPlayer(games, new SimpleBotStrategy(), useCases, clock);
  const nextRound = new StartNextRound(games, events);
  new StartGame({ games, random: new SeededRandom(seed), clock, ids: { next: () => "m1" }, events }).execute({
    gameId: "g1",
    seats: seatsOf(["bot-a", "bot-b"]),
    config: { mode, eliminationThreshold: 101, turnSeconds: 60 },
    stake: 0,
  });
  const session = games.find("g1")!;
  for (let turn = 0; turn < MAX_TURNS && session.currentStatus !== "FINISHED"; turn++) {
    if (session.currentStatus === "ROUND_OVER") nextRound.execute("g1");
    else bot.playTurn("g1", session.currentRound.currentPlayerId);
  }
  return { session, journal, events };
};

describe("Hito de la fase 2: partida 1v1 contra la máquina sin red ni interfaz", () => {
  it.each(["CLASICA", "APUNTADO", "AMBAS"] as const)("una partida %s entre dos bots termina con un ganador", (mode) => {
    for (const seed of [1, 2, 3, 4, 5]) {
      const { session, events, journal } = playBotMatch(mode, seed);
      expect(session.currentStatus).toBe("FINISHED");
      expect(["bot-a", "bot-b"]).toContain(session.winnerId);
      expect(events.names.filter((n) => n === "PartidaFinalizada")).toHaveLength(1);
      expect(events.names.filter((n) => n === "RondaCerrada")).toHaveLength(session.currentRoundNumber);
      expect(journal.entries.length).toBeGreaterThan(0);
    }
  });

  it("los bots ganan rondas cerrando, no solo por agotamiento del mazo", () => {
    const closures = [1, 2, 3, 4, 5].flatMap((seed) =>
      playBotMatch("AMBAS", seed).events.published
        .filter((e) => e.name === "RondaCerrada")
        .map((e) => (e.payload["summary"] as { closureType: string | null }).closureType),
    );
    expect(closures.some((type) => type === "CLASICO" || type === "APUNTADO")).toBe(true);
  });
});
