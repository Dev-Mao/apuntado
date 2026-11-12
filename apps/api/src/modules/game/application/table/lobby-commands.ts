import type { RandomSource } from "../../../../shared/random.js";
import { Room } from "../../domain/room/room.js";
import { OK, type Outcome, rejected } from "../../domain/round/round.types.js";
import type { AuthenticatedPlayer, RoomRepository, TableNotifier } from "../ports/index.js";
import type { StartGame } from "../use-cases/start-game.js";
import { parseCode, parseSettings } from "./payload-parser.js";
import type { TableCoordinator } from "./table-coordinator.js";

export type RoomResult = { readonly ok: true; readonly code: string } | { readonly ok: false; readonly reason: string };

const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 4;
const CODE_ATTEMPTS = 50;
const ALREADY_SEATED = "Ya está sentado en otra mesa";
const NOT_SEATED = "No está sentado en ninguna mesa";

export interface LobbyDependencies {
  readonly rooms: RoomRepository;
  readonly startGame: StartGame;
  readonly coordinator: TableCoordinator;
  readonly notifier: TableNotifier;
  readonly random: RandomSource;
}

export class LobbyCommands {
  constructor(private readonly deps: LobbyDependencies) {}

  create(player: AuthenticatedPlayer, rawSettings: unknown): RoomResult {
    if (this.deps.rooms.findActiveByPlayer(player.id)) return { ok: false, reason: ALREADY_SEATED };
    const settings = parseSettings(rawSettings);
    if (!settings) return { ok: false, reason: "La configuración de la mesa no es válida" };
    const code = this.freeCode();
    const room = Room.open(code, player, settings);
    if (typeof room === "string") return { ok: false, reason: room };
    this.saveAndAnnounce(room);
    return { ok: true, code };
  }

  join(player: AuthenticatedPlayer, rawCode: unknown): RoomResult {
    const code = parseCode(rawCode);
    const room = code ? this.deps.rooms.find(code) : null;
    if (!room || room.status === "FINISHED") return { ok: false, reason: "No existe una mesa con ese código" };
    const current = this.deps.rooms.findActiveByPlayer(player.id);
    if (current && current.code !== room.code) return { ok: false, reason: ALREADY_SEATED };
    if (room.hasPlayer(player.id)) return { ok: true, code: room.code };
    const outcome = room.join(player);
    if (!outcome.ok) return outcome;
    this.saveAndAnnounce(room);
    return { ok: true, code: room.code };
  }

  leave(playerId: string): Outcome {
    const room = this.deps.rooms.findByPlayer(playerId);
    if (!room) return rejected(NOT_SEATED);
    const outcome = room.leave(playerId);
    if (!outcome.ok) return outcome;
    if (room.humanIds.length === 0) this.deps.coordinator.close(room.code);
    else this.saveAndAnnounce(room);
    return OK;
  }

  presenceChanged(code: string): void {
    this.deps.coordinator.presenceChanged(code);
  }

  addBot(playerId: string): Outcome {
    const room = this.deps.rooms.findActiveByPlayer(playerId);
    if (!room) return rejected(NOT_SEATED);
    const outcome = room.addBot(playerId);
    if (outcome.ok) this.saveAndAnnounce(room);
    return outcome;
  }

  start(playerId: string): Outcome {
    const room = this.deps.rooms.findActiveByPlayer(playerId);
    if (!room) return rejected(NOT_SEATED);
    const allowed = room.canStart(playerId);
    if (!allowed.ok) return allowed;
    const { mode, eliminationThreshold, turnSeconds, stake } = room.settings;
    const started = this.deps.startGame.execute({
      gameId: room.code,
      seats: room.seats,
      config: { mode, eliminationThreshold, turnSeconds },
      stake,
    });
    if (!started.ok) return started;
    room.markStarted();
    this.saveAndAnnounce(room);
    this.deps.coordinator.refresh(room.code);
    return OK;
  }

  private saveAndAnnounce(room: Room): void {
    this.deps.rooms.save(room);
    this.deps.notifier.lobbyChanged(room.code);
  }

  private freeCode(): string {
    for (let attempt = 0; attempt < CODE_ATTEMPTS; attempt++) {
      const code = Array.from({ length: CODE_LENGTH }, () => this.randomSymbol()).join("");
      if (!this.deps.rooms.find(code)) return code;
    }
    throw new Error("No free room code available");
  }

  private randomSymbol(): string {
    return CODE_ALPHABET[Math.floor(this.deps.random.next() * CODE_ALPHABET.length)]!;
  }
}
