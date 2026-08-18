/**
 * Postgres adapter — Supabase Postgres via `@supabase/supabase-js`.
 * See dev/active/postgres-migration/plan.md.
 *
 * Direct client → Supabase (no Pages Function hop). RLS binds
 * `auth.uid() = user_id` so a user can only read/write their own row.
 *
 * localStorage caches everything so pending writes survive tab close.
 * Debounced-push (2s window) coalesces write-storms; pushRemoteImmediate
 * is the hot path for commit-critical writes (program pick, phase
 * advance, intake commit).
 *
 * 14-day snapshot retention: on every push we upsert today's snapshot
 * and prune anything older than 14 days.
 */

import { createClient } from "@/lib/supabase/client";
import { loadStore, saveStore } from "../storage";
import { storeSchema, type Store } from "../schemas";
import type { PersistenceAdapter, PullResult } from "./adapter";

const DEBOUNCE_MS = 2000;
const SNAPSHOT_RETENTION_DAYS = 14;

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
  return { store: parsed.data, updated_at: Number(data.updated_at) };
}

async function writeLive(userId: string, store: Store): Promise<boolean> {
  const supabase = createClient();
  const updated_at = store.updated_at ?? Date.now();
  const { error } = await supabase.from("user_states").upsert(
    { user_id: userId, store, updated_at },
    { onConflict: "user_id" },
  );
  if (error) return false;
  // Snapshot side-effects — non-fatal on error. Fire-and-forget.
  void (async () => {
    const dateISO = todayISO();
    const { error: snapErr } = await supabase
      .from("user_state_snapshots")
      .upsert(
        { user_id: userId, snapshot_date: dateISO, store },
        { onConflict: "user_id,snapshot_date" },
      );
    if (snapErr) return;
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
      if (!live) return { kind: "empty" };
      const localUpdatedAt = local.updated_at ?? 0;
      if (localUpdatedAt >= live.updated_at) {
        return { kind: "keep_local", remoteUpdatedAt: live.updated_at };
      }
      return { kind: "use_remote", store: live.store };
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
    pushTimer = setTimeout(async () => {
      pushTimer = null;
      if (inFlight) {
        this.pushRemoteDebounced(store);
        return;
      }
      // Same empty-guard as the legacy KV sync: pushing an empty local
      // over a non-empty remote is a data-loss footgun. Skip if remote
      // has real content.
      if (isEffectivelyEmpty(store)) {
        const pull = await this.pullRemote(store);
        if (pull.kind === "keep_local" || pull.kind === "use_remote") return;
      }
      inFlight = true;
      try {
        const userId = await currentUserId();
        if (!userId) return;
        await writeLive(userId, store);
      } finally {
        inFlight = false;
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
