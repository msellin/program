/**
 * Postgres adapter — Phases 2B-2E of the KV → Postgres migration.
 * See dev/active/postgres-migration/plan.md.
 *
 * Reads/writes directly against Supabase Postgres via `@supabase/supabase-js`.
 * No Pages Function hop — the client sends its authenticated request straight
 * to Supabase and RLS (auth.uid() = user_id) enforces isolation.
 *
 * **Auto-migration:** if Postgres has no row for the current user yet AND
 * legacy KV has one, `pullRemote` transparently fetches from KV via
 * `/api/state`, returns it as `use_remote`, AND write-throughs to Postgres
 * so subsequent reads hit the fast path. This is the seamless migration
 * story: no user-facing toggle, no dedicated backfill run — every existing
 * user's data lands in Postgres the moment they open the app after this
 * refactor.
 *
 * localStorage caching stays identical. Same debounced-push semantics (2s
 * window), same pushRemoteImmediate for hot writes, same PullResult shape.
 *
 * 14-day snapshot retention mirrors KV: on every push we upsert today's
 * snapshot and prune anything older than 14 days for this user.
 */

import { createClient } from "@/lib/supabase/client";
import { loadStore, saveStore } from "../storage";
import { storeSchema, type Store } from "../schemas";
import { pullRemote as kvPullRemote, type PullResult } from "../sync";
import type { PersistenceAdapter } from "./adapter";

const DEBOUNCE_MS = 2000;
const SNAPSHOT_RETENTION_DAYS = 14;

/** Rolling last-observed sync state so the UI badge can render. */
type SyncStatus = {
  last_synced_at: number | null;
  last_attempt_at: number | null;
  consecutive_failures: number;
  pending: boolean;
  last_error: string | null;
};

const state: SyncStatus = {
  last_synced_at: null,
  last_attempt_at: null,
  consecutive_failures: 0,
  pending: false,
  last_error: null,
};

let pushTimer: ReturnType<typeof setTimeout> | null = null;
let inFlight = false;

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function isEffectivelyEmpty(store: Store): boolean {
  const logCount = Object.keys(store.logs ?? {}).length;
  const tmCount = Object.keys(store.training_maxes ?? {}).length;
  const assessmentCount = Object.keys(store.assessments ?? {}).length;
  return logCount === 0 && tmCount === 0 && assessmentCount === 0;
}

async function currentUserId(): Promise<string | null> {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id ?? null;
}

/**
 * Fetch this user's live state row.
 * `.maybeSingle()` returns null (not error) when the row doesn't exist —
 * that's how a fresh user's first read looks.
 */
async function fetchLive(userId: string): Promise<{
  store: Store;
  updated_at: number;
} | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("user_states")
    .select("store, updated_at")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const parsed = storeSchema.safeParse(data.store);
  if (!parsed.success) {
    throw new Error(
      `Remote schema mismatch: ${parsed.error.issues[0]?.message ?? "unknown"}`,
    );
  }
  return { store: parsed.data, updated_at: data.updated_at };
}

/**
 * Upsert the live state row + today's snapshot + prune old snapshots.
 * All three ops in one function so callers don't have to remember the
 * snapshot side-effect.
 */
async function writeLive(userId: string, store: Store): Promise<boolean> {
  const supabase = createClient();
  const updated_at = store.updated_at ?? Date.now();
  const payload = { user_id: userId, store, updated_at };
  const { error } = await supabase.from("user_states").upsert(payload, {
    onConflict: "user_id",
  });
  if (error) {
    state.last_error = error.message;
    return false;
  }
  // Snapshot side-effects — non-fatal on error. Fire-and-forget.
  void (async () => {
    const dateISO = todayISO();
    const { error: snapErr } = await supabase
      .from("user_state_snapshots")
      .upsert(
        { user_id: userId, snapshot_date: dateISO, store },
        { onConflict: "user_id,snapshot_date" },
      );
    if (snapErr) {
      // Non-fatal — live write succeeded; snapshot is best-effort.
      return;
    }
    // Prune anything older than N days.
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - SNAPSHOT_RETENTION_DAYS);
    const cutoffISO = cutoff.toISOString().slice(0, 10);
    await supabase
      .from("user_state_snapshots")
      .delete()
      .eq("user_id", userId)
      .lt("snapshot_date", cutoffISO);
  })();
  return true;
}

export class PostgresAdapter implements PersistenceAdapter {
  loadLocal(): Store {
    return loadStore();
  }

  saveLocal(store: Store): void {
    saveStore(store);
  }

  async pullRemote(local: Store): Promise<PullResult> {
    try {
      const userId = await currentUserId();
      if (!userId) return { kind: "error", message: "Not signed in" };
      const live = await fetchLive(userId);
      if (live) {
        const localUpdatedAt = local.updated_at ?? 0;
        if (localUpdatedAt >= live.updated_at) {
          return { kind: "keep_local", remoteUpdatedAt: live.updated_at };
        }
        return { kind: "use_remote", store: live.store };
      }
      // Postgres empty. Try legacy KV via the Pages Function. If KV has a
      // blob, we adopt it AND write it through to Postgres so subsequent
      // reads skip the KV hop. Belt-and-braces auto-migration for every
      // existing user without a dedicated backfill run.
      const kvResult = await kvPullRemote(local);
      if (kvResult.kind === "use_remote") {
        // Fire-and-forget — if the write-through fails, next read retries.
        void writeLive(userId, kvResult.store).catch(() => {});
      }
      return kvResult;
    } catch (e) {
      return {
        kind: "error",
        message: e instanceof Error ? e.message : String(e),
      };
    }
  }

  pushRemoteDebounced(store: Store): void {
    if (typeof window === "undefined") return;
    if (pushTimer) clearTimeout(pushTimer);
    state.pending = true;
    pushTimer = setTimeout(async () => {
      pushTimer = null;
      if (inFlight) {
        this.pushRemoteDebounced(store);
        return;
      }
      // Same empty-guard as sync.ts: pushing an empty local over a
      // non-empty remote is a data-loss footgun. Skip if remote has real
      // content.
      if (isEffectivelyEmpty(store)) {
        const pull = await this.pullRemote(store);
        if (pull.kind === "keep_local" || pull.kind === "use_remote") {
          state.pending = false;
          return;
        }
      }
      inFlight = true;
      state.last_attempt_at = Date.now();
      try {
        const userId = await currentUserId();
        if (!userId) {
          state.consecutive_failures += 1;
          state.last_error = "Not signed in";
          return;
        }
        const ok = await writeLive(userId, store);
        if (ok) {
          state.last_synced_at = Date.now();
          state.consecutive_failures = 0;
          state.last_error = null;
        } else {
          state.consecutive_failures += 1;
        }
      } catch (e) {
        state.consecutive_failures += 1;
        state.last_error = e instanceof Error ? e.message : String(e);
      } finally {
        inFlight = false;
        state.pending = false;
      }
    }, DEBOUNCE_MS);
  }

  async pushRemoteImmediate(store: Store): Promise<boolean> {
    try {
      const userId = await currentUserId();
      if (!userId) return false;
      return await writeLive(userId, store);
    } catch {
      return false;
    }
  }
}
