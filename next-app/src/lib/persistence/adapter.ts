/**
 * Persistence adapter — Phase A of the block-object rebuild.
 * See dev/active/block-object-rebuild-2026-08-18.md §4.
 *
 * Purpose: interpose a thin interface between the Zustand store and the
 * concrete storage layer, so a future migration from Cloudflare KV to
 * Postgres (or any other backing store) is a re-implementation of ONE file,
 * not a rewrite of the domain model.
 *
 * Today the only implementation is `KVAdapter`, which delegates to the
 * existing `lib/storage.ts` (local) and `lib/sync.ts` (remote) functions.
 * Behavior is byte-identical to pre-adapter code.
 *
 * When we eventually add Postgres (see block-object-rebuild §10), a
 * `PostgresAdapter` implements this same interface, gains a `writeBlock`
 * hot-path method, and the `getAdapter()` factory returns it based on a
 * future feature flag.
 *
 * DO NOT reach past the adapter into `storage.ts` or `sync.ts` directly
 * from new code. If you find yourself wanting to, add the operation to the
 * interface first.
 */

import type { Store } from "../schemas";
import type { PullResult } from "../sync";
import { KVAdapter } from "./kv-adapter";
import { PostgresAdapter } from "./postgres-adapter";

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
 * refactor: always PostgresAdapter. PostgresAdapter internally falls
 * back to KV via `/api/state` if Postgres has no row yet AND KV does,
 * write-throughs to Postgres on the fallback, and never surfaces the
 * migration to the user.
 *
 * KVAdapter stays in the tree as vestigial — importable for the fallback
 * path via `sync.ts` — but is no longer selectable. Retired entirely in
 * Phase 2F when we remove the `/api/state` Pages Function.
 *
 * Cached so repeated calls return the same instance — matters because the
 * adapter owns state (in-memory debounce timer).
 */
export function getAdapter(): PersistenceAdapter {
  if (cachedAdapter) return cachedAdapter;
  cachedAdapter = new PostgresAdapter();
  return cachedAdapter;
}

// KVAdapter kept in the tree for the Postgres-adapter's KV fallback code
// path (via sync.ts). Referenced here so tree-shaking doesn't strip it
// mid-migration. Remove in Phase 2F.
void KVAdapter;

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
