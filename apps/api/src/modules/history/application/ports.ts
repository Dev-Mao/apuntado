import type { ProfileStats } from "@apuntado/contracts";

export type MatchKind = "VS_MAQUINA" | "SALA_PRIVADA";

export interface IdGenerator {
  next(): string;
}

export interface Participant {
  readonly playerId: string;
  readonly nickname: string;
  readonly isBot: boolean;
  readonly seat: number;
}

export interface MatchOpening {
  readonly matchId: string;
  readonly startedAt: Date;
  readonly kind: MatchKind;
  readonly threshold: number;
  readonly stake: number;
  readonly rules: Readonly<Record<string, string | number>>;
  readonly participants: readonly Participant[];
}

export interface RoundOpening {
  readonly matchId: string;
  readonly roundNumber: number;
  readonly startedAt: Date;
  readonly hands: readonly { readonly playerId: string; readonly cards: readonly string[] }[];
}

export interface SettledScore {
  readonly playerId: string;
  readonly points: number;
  readonly total: number;
  readonly eliminated: boolean;
}

export interface RoundSettlement {
  readonly matchId: string;
  readonly roundNumber: number;
  readonly closedAt: Date;
  readonly winnerId: string | null;
  readonly closureType: "CLASICO" | "APUNTADO" | null;
  readonly scores: readonly SettledScore[];
}

export interface MatchClosing {
  readonly matchId: string;
  readonly finishedAt: Date;
  readonly winnerId: string;
}

export interface MatchRecords {
  openMatch(opening: MatchOpening): void;
  openRound(opening: RoundOpening): void;
  settleRound(settlement: RoundSettlement): void;
  closeMatch(closing: MatchClosing): void;
}

export interface ProfileReader {
  statsOf(playerId: string): Promise<ProfileStats | null>;
}

export interface EventSubscriber {
  subscribe(eventName: string, handler: (payload: Record<string, unknown>) => void): void;
}

export interface ProfileOwner {
  readonly id: string;
  readonly nickname: string;
  readonly guest: boolean;
}

export interface PlayerIdentity {
  resolve(cookieHeader: string | undefined): ProfileOwner | null;
}
