import type { LoginRequest, ProfileView, RegisterRequest, SessionState, SessionView, WalletView } from "@apuntado/contracts";

export const API_ORIGIN = process.env.NEXT_PUBLIC_API_ORIGIN ?? "";

export type ProfileResult =
  | { readonly status: "ready"; readonly profile: ProfileView }
  | { readonly status: "none" }
  | { readonly status: "unavailable" };

const NO_SESSION = 401;
const HISTORY_UNAVAILABLE = 503;

export type GuestSessionResult = { readonly ok: true; readonly session: SessionView } | { readonly ok: false; readonly reason: string };

export type AccountResult =
  | { readonly ok: true; readonly session: SessionView }
  | { readonly ok: false; readonly status: number; readonly reason: string | null };

export type WalletResult =
  | { readonly status: "ready"; readonly wallet: WalletView }
  | { readonly status: "none" }
  | { readonly status: "guest" };

const FORBIDDEN = 403;

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

async function postAccount(path: string, payload: RegisterRequest | LoginRequest): Promise<AccountResult> {
  const response = await fetch(apiUrl(path), {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (response.ok) return { ok: true, session: (await response.json()) as SessionView };
  return { ok: false, status: response.status, reason: await reasonOf(response).catch(() => null) };
}

export const registerAccount = (payload: RegisterRequest): Promise<AccountResult> => postAccount("/api/session/register", payload);

export const logInAccount = (payload: LoginRequest): Promise<AccountResult> => postAccount("/api/session/login", payload);

export async function logOutAccount(): Promise<void> {
  const response = await fetch(apiUrl("/api/session/logout"), { method: "POST", credentials: "include" });
  if (!response.ok) throw new Error(`Logout failed with status ${response.status}`);
}

export async function fetchWallet(): Promise<WalletResult> {
  const response = await fetch(apiUrl("/api/wallet"), { credentials: "include" });
  if (response.status === NO_SESSION) return { status: "none" };
  if (response.status === FORBIDDEN) return { status: "guest" };
  if (!response.ok) throw new Error(`Wallet lookup failed with status ${response.status}`);
  return { status: "ready", wallet: (await response.json()) as WalletView };
}
