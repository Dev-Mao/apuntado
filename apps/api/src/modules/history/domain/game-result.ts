export interface RoundScore {
  readonly playerId: string;
  readonly points: number;
}

export interface GameResult {
  readonly gameId: string;
  readonly winnerId: string;
  readonly rounds: readonly { readonly number: number; readonly scores: readonly RoundScore[] }[];
  readonly rulesConfig: Readonly<Record<string, unknown>>;
}

export const totalFor = (result: GameResult, playerId: string): number =>
  result.rounds
    .flatMap((r) => r.scores)
    .filter((s) => s.playerId === playerId)
    .reduce((total, s) => total + s.points, 0);
