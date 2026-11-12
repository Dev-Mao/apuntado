import { MAX_PLAYERS, MIN_PLAYERS } from "../round/round.js";
import { OK, type Outcome, rejected } from "../round/round.types.js";
import type { RoomMember, RoomSettings, RoomStatus, Seat } from "./room.types.js";

const MODES: readonly string[] = ["CLASICA", "APUNTADO", "AMBAS"];
const MIN_TURN_SECONDS = 10;
const MAX_TURN_SECONDS = 600;
const MAX_THRESHOLD = 500;
const MAX_STAKE = 100_000;
const BOT_PREFIX = "bot:";

const isWhole = (value: number, min: number): boolean => Number.isInteger(value) && value >= min;

export const invalidSettings = (s: RoomSettings): string | null => {
  if (!MODES.includes(s.mode)) return "La modalidad no existe";
  if (!isWhole(s.eliminationThreshold, 1) || s.eliminationThreshold > MAX_THRESHOLD) {
    return `El umbral debe estar entre 1 y ${MAX_THRESHOLD} puntos`;
  }
  if (!isWhole(s.turnSeconds, MIN_TURN_SECONDS) || s.turnSeconds > MAX_TURN_SECONDS) {
    return `La duración del turno debe estar entre ${MIN_TURN_SECONDS} y ${MAX_TURN_SECONDS} segundos`;
  }
  return isWhole(s.stake, 0) && s.stake <= MAX_STAKE ? null : `La apuesta debe estar entre 0 y ${MAX_STAKE} fichas`;
};

export class Room {
  private state: RoomStatus = "LOBBY";
  private botCount = 0;

  private constructor(
    readonly code: string,
    private host: string,
    readonly settings: RoomSettings,
    private readonly seated: Seat[],
  ) {}

  static open(code: string, host: RoomMember, settings: RoomSettings): Room | string {
    const invalid = invalidSettings(settings);
    if (invalid) return invalid;
    if (settings.stake > 0 && host.guest) return "Un invitado no puede crear mesas con apuesta";
    return new Room(code, host.id, settings, [{ playerId: host.id, nickname: host.nickname, isBot: false }]);
  }

  get hostId(): string {
    return this.host;
  }

  get status(): RoomStatus {
    return this.state;
  }

  get seats(): readonly Seat[] {
    return this.seated;
  }

  get playerIds(): string[] {
    return this.seated.map((s) => s.playerId);
  }

  get humanIds(): string[] {
    return this.seated.filter((s) => !s.isBot).map((s) => s.playerId);
  }

  hasPlayer(playerId: string): boolean {
    return this.seated.some((s) => s.playerId === playerId);
  }

  isBot(playerId: string): boolean {
    return this.seated.some((s) => s.playerId === playerId && s.isBot);
  }

  join(member: RoomMember): Outcome {
    if (this.hasPlayer(member.id)) return OK;
    if (this.state !== "LOBBY") return rejected("La partida de esta mesa ya empezó");
    if (this.seated.length >= MAX_PLAYERS) return rejected("La mesa está llena");
    if (this.settings.stake > 0 && member.guest) return rejected("Un invitado no puede unirse a una mesa con apuesta");
    this.seated.push({ playerId: member.id, nickname: member.nickname, isBot: false });
    return OK;
  }

  leave(playerId: string): Outcome {
    if (!this.hasPlayer(playerId)) return rejected("No está sentado en esta mesa");
    if (this.state === "PLAYING") return rejected("No puede salir de una partida en curso");
    this.seated.splice(this.seated.findIndex((s) => s.playerId === playerId), 1);
    if (this.host === playerId && this.humanIds.length > 0) this.host = this.humanIds[0]!;
    return OK;
  }

  addBot(requesterId: string): Outcome {
    const denied = this.hostOnlyInLobby(requesterId);
    if (denied) return denied;
    if (this.seated.length >= MAX_PLAYERS) return rejected("La mesa está llena");
    if (this.settings.stake > 0) return rejected("La máquina no juega en mesas con apuesta");
    this.botCount += 1;
    this.seated.push({ playerId: `${BOT_PREFIX}${this.botCount}`, nickname: `Máquina ${this.botCount}`, isBot: true });
    return OK;
  }

  canStart(requesterId: string): Outcome {
    const denied = this.hostOnlyInLobby(requesterId);
    if (denied) return denied;
    return this.seated.length >= MIN_PLAYERS ? OK : rejected("Se necesitan al menos 2 jugadores para empezar");
  }

  markStarted(): void {
    this.state = "PLAYING";
  }

  markFinished(): void {
    this.state = "FINISHED";
  }

  private hostOnlyInLobby(requesterId: string): Outcome | null {
    if (this.state !== "LOBBY") return rejected("La partida de esta mesa ya empezó");
    return requesterId === this.host ? null : rejected("Solo el anfitrión puede hacerlo");
  }
}
