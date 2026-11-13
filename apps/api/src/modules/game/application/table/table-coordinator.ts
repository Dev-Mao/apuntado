import type { Clock } from "../../../../shared/clock.js";
import type { Outcome } from "../../domain/round/round.types.js";
import type { Room } from "../../domain/room/room.js";
import type { GameSession } from "../../domain/session/game-session.js";
import type { BotPlayer } from "../bot/bot-player.js";
import type { GameRepository, Presence, RoomRepository, TableNotifier, TaskScheduler } from "../ports/index.js";
import type { StartNextRound } from "../use-cases/start-next-round.js";
import type { TimeOutTurn } from "../use-cases/time-out-turn.js";

export interface TableTiming {
  readonly botDelayMs: number;
  readonly roundPauseMs: number;
  readonly cleanupMs: number;
}

export interface CoordinatorDependencies {
  readonly games: GameRepository;
  readonly rooms: RoomRepository;
  readonly notifier: TableNotifier;
  readonly scheduler: TaskScheduler;
  readonly presence: Presence;
  readonly clock: Clock;
  readonly timeOut: TimeOutTurn;
  readonly nextRound: StartNextRound;
  readonly bot: BotPlayer;
  readonly timing: TableTiming;
}

const TURN_RETRY_MS = 100;
const TASKS = ["turn", "bot", "round", "cleanup"] as const;
type Task = (typeof TASKS)[number];

const taskKey = (code: string, task: Task): string => `${code}:${task}`;

export class TableCoordinator {
  constructor(private readonly deps: CoordinatorDependencies) {}

  refresh(code: string): void {
    this.deps.notifier.tableChanged(code);
    const session = this.deps.games.find(code);
    const room = this.deps.rooms.find(code);
    if (!session || !room) return;
    if (session.currentStatus === "FINISHED") return this.finish(room);
    if (session.currentStatus === "ROUND_OVER") return this.scheduleNextRound(code);
    this.scheduleTurn(code, session, room);
  }

  presenceChanged(code: string): void {
    const room = this.deps.rooms.find(code);
    if (!room || room.status !== "LOBBY") return;
    const someoneHere = room.humanIds.some((id) => this.deps.presence.isConnected(id));
    if (someoneHere) this.deps.scheduler.cancel(taskKey(code, "cleanup"));
    else this.scheduleCleanup(code);
  }

  close(code: string): void {
    for (const task of TASKS) this.deps.scheduler.cancel(taskKey(code, task));
    this.deps.rooms.delete(code);
    this.deps.games.delete(code);
  }

  private scheduleTurn(code: string, session: GameSession, room: Room): void {
    const { scheduler, bot } = this.deps;
    scheduler.cancel(taskKey(code, "round"));
    scheduler.schedule(taskKey(code, "turn"), session.turnDeadline, () => this.onTurnDue(code));
    const current = session.currentRound.currentPlayerId;
    if (!room.isBot(current)) return scheduler.cancel(taskKey(code, "bot"));
    scheduler.schedule(taskKey(code, "bot"), this.inMs(this.deps.timing.botDelayMs), () => {
      if (bot.playStep(code, current)) this.refresh(code);
    });
  }

  private onTurnDue(code: string): void {
    const { ok: timedOut } = this.deps.timeOut.execute(code);
    if (timedOut) return this.refresh(code);
    const session = this.deps.games.find(code);
    if (session?.currentStatus !== "PLAYING") return;
    const retryAt = Math.max(session.turnDeadline.getTime(), this.deps.clock.now().getTime()) + TURN_RETRY_MS;
    this.deps.scheduler.schedule(taskKey(code, "turn"), new Date(retryAt), () => this.onTurnDue(code));
  }

  private scheduleNextRound(code: string): void {
    const { scheduler, nextRound } = this.deps;
    scheduler.cancel(taskKey(code, "turn"));
    scheduler.cancel(taskKey(code, "bot"));
    scheduler.schedule(taskKey(code, "round"), this.inMs(this.deps.timing.roundPauseMs), () =>
      this.after(code, nextRound.execute(code)),
    );
  }

  private finish(room: Room): void {
    room.markFinished();
    this.deps.rooms.save(room);
    for (const task of ["turn", "bot", "round"] as const) this.deps.scheduler.cancel(taskKey(room.code, task));
    this.deps.notifier.lobbyChanged(room.code);
    this.scheduleCleanup(room.code);
  }

  private scheduleCleanup(code: string): void {
    this.deps.scheduler.schedule(taskKey(code, "cleanup"), this.inMs(this.deps.timing.cleanupMs), () => this.close(code));
  }

  private after(code: string, outcome: Outcome): void {
    if (outcome.ok) this.refresh(code);
  }

  private inMs(ms: number): Date {
    return new Date(this.deps.clock.now().getTime() + ms);
  }
}
