/** Módulo Historial: preserva el resultado de las partidas finalizadas. */
export interface RoundScore {
  readonly playerId: string;
  readonly points: number;
}

export interface GameResult {
  readonly gameId: string;
  readonly winnerId: string;
  readonly rounds: readonly { readonly number: number; readonly scores: readonly RoundScore[] }[];
  /** La configuración de reglas viaja con el resultado para que el historial sea interpretable (RN-04). */
  readonly rulesConfig: Readonly<Record<string, unknown>>;
}

export const totalFor = (result: GameResult, playerId: string): number =>
  result.rounds
    .flatMap((r) => r.scores)
    .filter((s) => s.playerId === playerId)
    .reduce((total, s) => total + s.points, 0);
