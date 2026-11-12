import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { TableTiming } from "./modules/game/index.js";

export interface AppConfig {
  readonly port: number;
  readonly sessionSecret: string;
  readonly secureCookies: boolean;
  readonly webDir: string | null;
  readonly timing: TableTiming;
  readonly allowedOrigins: readonly string[];
}

const DEFAULT_PORT = 3000;
const DEVELOPMENT_SECRET = "apuntado-development-secret";
const DEFAULT_TIMING: TableTiming = { botDelayMs: 1200, roundPauseMs: 8000, cleanupMs: 10 * 60 * 1000 };
const DEVELOPMENT_ORIGINS = ["http://localhost:3001"];
const BUNDLED_WEB_DIR = fileURLToPath(new URL("../../web/out", import.meta.url));

const allowedOrigins = (raw: string | undefined, production: boolean): string[] => {
  if (raw === undefined) return production ? [] : DEVELOPMENT_ORIGINS;
  return raw.split(",").map((o) => o.trim()).filter(Boolean);
};

export const loadConfig = (env: Record<string, string | undefined>): AppConfig => {
  const production = env["NODE_ENV"] === "production";
  const secret = env["SESSION_SECRET"];
  if (production && !secret) throw new Error("SESSION_SECRET is required in production");
  const webDir = env["WEB_DIR"] ? resolve(env["WEB_DIR"]) : BUNDLED_WEB_DIR;
  return {
    port: Number(env["PORT"] ?? DEFAULT_PORT),
    sessionSecret: secret ?? DEVELOPMENT_SECRET,
    secureCookies: production,
    webDir: existsSync(webDir) ? webDir : null,
    timing: DEFAULT_TIMING,
    allowedOrigins: allowedOrigins(env["ALLOWED_ORIGINS"], production),
  };
};
