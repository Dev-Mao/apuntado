import type { Player } from "../domain/player.js";

export type AccountProblem = "INVALID" | "CONFLICT" | "UNAUTHORIZED" | "UNAVAILABLE";

export type AccountResult =
  | { readonly ok: true; readonly player: Player; readonly token: string }
  | { readonly ok: false; readonly problem: AccountProblem; readonly reason: string };

export const failure = (problem: AccountProblem, reason: string): AccountResult => ({ ok: false, problem, reason });

export const UNAVAILABLE = failure("UNAVAILABLE", "Las cuentas no están disponibles en este momento");

export const fieldOf = (body: unknown, name: string): unknown =>
  typeof body === "object" && body !== null ? (body as Record<string, unknown>)[name] : undefined;
