/**
 * Persistence adapter — thin interface between Zustand and the concrete
 * storage layer. Post 2026-08-18 KV → Postgres migration, only
 * PostgresAdapter implements this. Kept as an interface so a future
 * backing-store swap (e.g. self-hosted Postgres, Neon) doesn't touch
 * useStore.ts or anywhere else.
 */

import type { Store } from "../schemas";
import { PostgresAdapter } from "./postgres-adapter";

export type PullResult =
  | { kind: "empty" }
  | { kind: "keep_local"; remoteUpdatedAt: number }
  | { kind: "use_remote"; store: Store }
  | { kind: "error"; message: string };

export interface PersistenceAdapter {
  /**
   * Read the local snapshot. Synchronous — reads localStorage on the KV
   * adapter, in-memory cache on future adapters. Never blocks the render.
   */
  loadLocal(): Store;

  /**
   * Write the local snapshot. Synchronous. Must not throw — silently
   * degrades if storage is full / disabled.
   */
  saveLocal(store: Store): void;

  /**
   * Fetch the remote snapshot and merge with local. Returns a directive
   * for the caller: `use_remote` (swap to server state), `keep_local`
   * (nothing to do), `no_change` (they matched).
   */
  pullRemote(local: Store): Promise<PullResult>;

  /**
   * Fire a debounced push to remote. Multiple calls within the debounce
   * window collapse to one HTTP request. Silent on network error.
   */
  pushRemoteDebounced(store: Store): void;

  /**
   * Fire an immediate push to remote. Awaits the HTTP response. Used by
   * commit-critical paths (auth changes, wipe, session cleanup) where the
   * caller needs to know the write landed.
   */
  pushRemoteImmediate(store: Store): Promise<boolean>;
}

let cachedAdapter: PersistenceAdapter | null = null;

/**
 * Returns the currently-configured persistence adapter. Post 2026-08-18
 * Phase 2F: always PostgresAdapter. Cached so repeated calls return the
 * same instance — matters because the adapter owns state (in-memory
 * debounce timer).
 */
export function getAdapter(): PersistenceAdapter {
  if (cachedAdapter) return cachedAdapter;
  cachedAdapter = new PostgresAdapter();
  return cachedAdapter;
}

/**
 * Test helper — swap the cached adapter for a fake in unit tests. Reset
 * with `resetAdapter()`.
 */
export function _setAdapterForTests(adapter: PersistenceAdapter | null): void {
  cachedAdapter = adapter;
}

export function _resetAdapterForTests(): void {
  cachedAdapter = null;
}
