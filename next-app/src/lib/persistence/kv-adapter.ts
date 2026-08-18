/**
 * KV adapter — current implementation of PersistenceAdapter.
 *
 * Wraps the pre-existing storage.ts (localStorage) and sync.ts
 * (/api/state → Cloudflare KV) modules. Zero behavior change from the
 * pre-adapter code — this file exists solely to route calls through the
 * adapter interface so a future Postgres adapter can be swapped in
 * without touching useStore.ts or anywhere else.
 *
 * See block-object-rebuild-2026-08-18.md §4 + §10.
 */

import { loadStore, saveStore } from "../storage";
import { pullRemote, pushRemoteDebounced, pushRemoteImmediate } from "../sync";
import type { Store } from "../schemas";
import type { PullResult } from "../sync";
import type { PersistenceAdapter } from "./adapter";

export class KVAdapter implements PersistenceAdapter {
  loadLocal(): Store {
    return loadStore();
  }

  saveLocal(store: Store): void {
    saveStore(store);
  }

  pullRemote(local: Store): Promise<PullResult> {
    return pullRemote(local);
  }

  pushRemoteDebounced(store: Store): void {
    pushRemoteDebounced(store);
  }

  pushRemoteImmediate(store: Store): Promise<boolean> {
    return pushRemoteImmediate(store);
  }
}
