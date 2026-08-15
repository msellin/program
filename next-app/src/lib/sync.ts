import type { Store } from "./schemas";
import { storeSchema } from "./schemas";
import { getAccessToken } from "./supabase/session";

/**
 * Build the Authorization header for API calls. When no session is present
 * (guest / mid-signout), returns an empty object so the fetch proceeds unauth'd
 * and the server returns 401. Callers treat that as "just stay on local state."
 */
async function authHeaders(): Promise<Record<string, string>> {
  const token = await getAccessToken();
  return token ? { authorization: `Bearer ${token}` } : {};
}

/**
 * Same-origin sync client for the Pages Function at /api/state.
 *
 * Model: localStorage is the source of truth on the device (offline-first).
 * KV is a mirror. On startup, fetch remote and pick whichever side has the
 * higher `updated_at`. On every local save, fire a debounced PUT.
 *
 * No auth on the endpoint yet — Cloudflare Access when we want to gate it.
 */

const ENDPOINT = "/api/state";
const DEBOUNCE_MS = 2000;

let pushTimer: ReturnType<typeof setTimeout> | null = null;
let inFlight = false;

/**
 * Observable sync state so the UI can render a "Synced 3s ago" badge and a
 * loud "Not synced — X minutes" warning when writes are failing. Every push
 * mutates this and notifies subscribers.
 */
export type SyncStatus = {
  /** Wall-clock timestamp of the last successful PUT to /api/state. */
  last_synced_at: number | null;
  /** Wall-clock timestamp of the last write attempt (success or fail). */
  last_attempt_at: number | null;
  /** Increments on every failed PUT attempt; resets to 0 on success. */
  consecutive_failures: number;
  /** True while a PUT is in-flight OR a debounce is pending. */
  pending: boolean;
  /** Last error message from a failed PUT (for the UI to surface). */
  last_error: string | null;
  /** Is the user signed in / authed? Set by the client before the first push. */
  authed: boolean;
};

const listeners = new Set<(s: SyncStatus) => void>();
const state: SyncStatus = {
  last_synced_at: null,
  last_attempt_at: null,
  consecutive_failures: 0,
  pending: false,
  last_error: null,
  authed: false,
};

function notify(): void {
  for (const l of listeners) l(state);
}

export function subscribeSyncStatus(cb: (s: SyncStatus) => void): () => void {
  listeners.add(cb);
  cb(state);
  return () => {
    listeners.delete(cb);
  };
}

export function getSyncStatus(): SyncStatus {
  return state;
}

export function setSyncAuthed(authed: boolean): void {
  if (state.authed === authed) return;
  state.authed = authed;
  notify();
}

export type PullResult =
  | { kind: "empty" } // remote had nothing
  | { kind: "keep_local"; remoteUpdatedAt: number } // local is newer
  | { kind: "use_remote"; store: Store } // remote is newer, caller should replace
  | { kind: "error"; message: string };

/**
 * GET the remote store and compare `updated_at` with the local one.
 * Caller decides what to do with the result (replace-store or ignore).
 */
export async function pullRemote(local: Store): Promise<PullResult> {
  try {
    const headers = await authHeaders();
    const res = await fetch(ENDPOINT, { method: "GET", cache: "no-store", headers });
    if (!res.ok) {
      return { kind: "error", message: `HTTP ${res.status}` };
    }
    const body = (await res.json()) as { store: unknown; updated_at?: number };
    if (!body.store) return { kind: "empty" };
    const remoteUpdatedAt = body.updated_at ?? 0;
    const localUpdatedAt = local.updated_at ?? 0;
    if (localUpdatedAt >= remoteUpdatedAt) {
      return { kind: "keep_local", remoteUpdatedAt };
    }
    const parsed = storeSchema.safeParse(body.store);
    if (!parsed.success) {
      return { kind: "error", message: `Remote schema mismatch: ${parsed.error.issues[0]?.message ?? "unknown"}` };
    }
    return { kind: "use_remote", store: parsed.data };
  } catch (e) {
    return { kind: "error", message: e instanceof Error ? e.message : String(e) };
  }
}

/**
 * Is the store effectively empty? Used to gate PUTs — pushing an empty local
 * store over a non-empty remote is a data-loss footgun that has bitten us twice.
 * We treat "no logs AND no training maxes AND no assessments" as empty; the
 * user_profile row is user-facing but doesn't count as content.
 */
function isEffectivelyEmpty(store: Store): boolean {
  const logCount = Object.keys(store.logs ?? {}).length;
  const tmCount = Object.keys(store.training_maxes ?? {}).length;
  const assessmentCount = Object.keys(store.assessments ?? {}).length;
  return logCount === 0 && tmCount === 0 && assessmentCount === 0;
}

/**
 * Queue a debounced PUT of the current store to the remote endpoint.
 * Coalesces rapid writes so a typing-flurry produces one network call.
 *
 * Empty-store guard: if the local store is effectively empty (zero logs, zero
 * TMs, zero assessments), we pull the remote first and only push if the remote
 * is ALSO empty. This prevents a wipe-and-hydrate race from overwriting real
 * server data with an empty template.
 */
export function pushRemoteDebounced(store: Store): void {
  if (typeof window === "undefined") return;
  if (pushTimer) clearTimeout(pushTimer);
  state.pending = true;
  notify();
  pushTimer = setTimeout(async () => {
    pushTimer = null;
    if (inFlight) {
      // Another write is already going; re-queue.
      pushRemoteDebounced(store);
      return;
    }
    if (isEffectivelyEmpty(store)) {
      // Check remote — if it has content, DON'T overwrite it with our empty.
      const pull = await pullRemote(store);
      if (pull.kind === "keep_local" || pull.kind === "use_remote") {
        // Remote had content. Skip this push.
        state.pending = false;
        notify();
        return;
      }
    }
    inFlight = true;
    state.last_attempt_at = Date.now();
    try {
      const auth = await authHeaders();
      // Track authed state so the UI banner can tell "signed out"
      // from "sign-in works but sync is failing".
      state.authed = Object.keys(auth).length > 0;
      const res = await fetch(ENDPOINT, {
        method: "PUT",
        headers: { "content-type": "application/json", ...auth },
        body: JSON.stringify(store),
      });
      if (res.ok) {
        state.last_synced_at = Date.now();
        state.consecutive_failures = 0;
        state.last_error = null;
      } else {
        state.consecutive_failures += 1;
        state.last_error = `HTTP ${res.status}`;
      }
    } catch (e) {
      state.consecutive_failures += 1;
      state.last_error = e instanceof Error ? e.message : String(e);
    } finally {
      inFlight = false;
      state.pending = false;
      notify();
    }
  }, DEBOUNCE_MS);
}

/** Force an immediate PUT (used on manual "Sync now" or import). */
export async function pushRemoteImmediate(store: Store): Promise<boolean> {
  try {
    const auth = await authHeaders();
    const res = await fetch(ENDPOINT, {
      method: "PUT",
      headers: { "content-type": "application/json", ...auth },
      body: JSON.stringify(store),
    });
    return res.ok;
  } catch {
    return false;
  }
}
