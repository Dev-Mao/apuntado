import { existsSync } from "node:fs";
import { resolve } from "node:path";
import type { TableTiming } from "./modules/game/index.js";

export interface AppConfig {
  readonly port: number;
  readonly sessionSecret: string;
  readonly secureCookies: boolean;
  readonly webDir: string | null;
  readonly timing: TableTiming;
}

const DEFAULT_PORT = 3000;
const DEVELOPMENT_SECRET = "apuntado-development-secret";
const DEFAULT_TIMING: TableTiming = { botDelayMs: 1200, roundPauseMs: 8000 };

export const loadConfig = (env: Record<string, string | undefined>, cwd: string): AppConfig => {
  const production = env["NODE_ENV"] === "production";
  const secret = env["SESSION_SECRET"];
  if (production && !secret) throw new Error("SESSION_SECRET is required in production");
  const webDir = resolve(cwd, env["WEB_DIR"] ?? "apps/web/out");
  return {
    port: Number(env["PORT"] ?? DEFAULT_PORT),
    sessionSecret: secret ?? DEVELOPMENT_SECRET,
    secureCookies: production,
    webDir: existsSync(webDir) ? webDir : null,
    timing: DEFAULT_TIMING,
  };
};
