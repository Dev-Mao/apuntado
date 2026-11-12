import type { ProfileView, SessionState, SessionView } from "@apuntado/contracts";

export const API_ORIGIN = process.env.NEXT_PUBLIC_API_ORIGIN ?? "";

export type ProfileResult =
  | { readonly status: "ready"; readonly profile: ProfileView }
  | { readonly status: "none" }
  | { readonly status: "unavailable" };

const NO_SESSION = 401;
const HISTORY_UNAVAILABLE = 503;

export type GuestSessionResult = { readonly ok: true; readonly session: SessionView } | { readonly ok: false; readonly reason: string };

const apiUrl = (path: string): string => `${API_ORIGIN}${path}`;

async function reasonOf(response: Response): Promise<string> {
  const body: unknown = await response.json().catch(() => null);
  const message = typeof body === "object" && body !== null ? (body as Record<string, unknown>)["message"] : undefined;
  if (typeof message !== "string") throw new Error(`Request failed with status ${response.status}`);
  return message;
}

export async function fetchSession(): Promise<SessionView | null> {
  const response = await fetch(apiUrl("/api/session"), { credentials: "include" });
  if (!response.ok) throw new Error(`Session lookup failed with status ${response.status}`);
  return ((await response.json()) as SessionState).session;
}

export async function startGuestSession(nickname: string): Promise<GuestSessionResult> {
  const response = await fetch(apiUrl("/api/session/guest"), {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ nickname }),
  });
  if (response.ok) return { ok: true, session: (await response.json()) as SessionView };
  return { ok: false, reason: await reasonOf(response) };
}

export async function fetchProfile(): Promise<ProfileResult> {
  const response = await fetch(apiUrl("/api/profile"), { credentials: "include" });
  if (response.status === NO_SESSION) return { status: "none" };
  if (response.status === HISTORY_UNAVAILABLE) return { status: "unavailable" };
  if (!response.ok) throw new Error(`Profile lookup failed with status ${response.status}`);
  return { status: "ready", profile: (await response.json()) as ProfileView };
}
