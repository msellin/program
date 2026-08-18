import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { Store } from "../schemas";
import type { PersistenceAdapter, PullResult } from "./adapter";
import { getAdapter, _setAdapterForTests, _resetAdapterForTests } from "./adapter";

/**
 * Phase A regression harness. Two guards:
 *   1. `getAdapter()` returns a stable singleton — if it re-instantiates on
 *      every call, per-adapter state (debounce timer on KVAdapter, connection
 *      pool on future Postgres) leaks.
 *   2. The test-swap helpers work — so future block-object tests can inject
 *      a fake adapter and assert on writes.
 */

class FakeAdapter implements PersistenceAdapter {
  savedStores: Store[] = [];
  pushedDebouncedStores: Store[] = [];
  pushedImmediateStores: Store[] = [];
  storedLocal: Store | null = null;
  pullRemoteReturns: PullResult = { kind: "empty" };

  loadLocal(): Store {
    return this.storedLocal ?? ({ updated_at: 0, logs: {} } as Store);
  }
  saveLocal(store: Store): void {
    this.storedLocal = store;
    this.savedStores.push(store);
  }
  pullRemote(_local: Store): Promise<PullResult> {
    return Promise.resolve(this.pullRemoteReturns);
  }
  pushRemoteDebounced(store: Store): void {
    this.pushedDebouncedStores.push(store);
  }
  pushRemoteImmediate(store: Store): Promise<boolean> {
    this.pushedImmediateStores.push(store);
    return Promise.resolve(true);
  }
}

describe("PersistenceAdapter", () => {
  afterEach(() => {
    _resetAdapterForTests();
    vi.clearAllMocks();
  });

  it("getAdapter returns a stable singleton across calls", () => {
    // Two consecutive calls must return the same instance so per-adapter
    // state (PostgresAdapter's in-flight debounce timer) doesn't leak.
    const first = getAdapter();
    const second = getAdapter();
    expect(first).toBe(second);
  });

  it("_setAdapterForTests swaps the cached adapter", () => {
    const fake = new FakeAdapter();
    _setAdapterForTests(fake);
    const adapter = getAdapter();
    expect(adapter).toBe(fake);
  });

  it("_resetAdapterForTests forces re-instantiation on the next getAdapter call", () => {
    const fake = new FakeAdapter();
    _setAdapterForTests(fake);
    expect(getAdapter()).toBe(fake);
    _resetAdapterForTests();
    const next = getAdapter();
    expect(next).not.toBe(fake);
    // And still returns something usable (the real Postgres adapter).
    expect(next).toBeDefined();
  });

  it("FakeAdapter surface records writes so future tests can assert on them", () => {
    const fake = new FakeAdapter();
    _setAdapterForTests(fake);
    const store = { updated_at: 1 } as Store;

    getAdapter().saveLocal(store);
    getAdapter().pushRemoteDebounced(store);

    expect(fake.savedStores).toHaveLength(1);
    expect(fake.savedStores[0]).toBe(store);
    expect(fake.pushedDebouncedStores).toHaveLength(1);
  });
});

describe("PostgresAdapter (default via getAdapter)", () => {
  beforeEach(() => {
    _resetAdapterForTests();
  });
  afterEach(() => {
    _resetAdapterForTests();
  });

  it("exposes the PersistenceAdapter surface", () => {
    const adapter = getAdapter();
    expect(typeof adapter.loadLocal).toBe("function");
    expect(typeof adapter.saveLocal).toBe("function");
    expect(typeof adapter.pullRemote).toBe("function");
    expect(typeof adapter.pushRemoteDebounced).toBe("function");
    expect(typeof adapter.pushRemoteImmediate).toBe("function");
  });
});
