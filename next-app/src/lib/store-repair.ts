import { storeSchema, type Store } from "./schemas";

/**
 * Repair a store that fails `storeSchema` by removing only what is invalid
 * (BUG-44, 2026-10-01).
 *
 * Before this, one malformed field cost the user their whole store. Locally,
 * `loadStore` fell to `trySanitize`, which rebuilds from logs, training maxes
 * and stretch targets alone — dropping `user_profile`, so the active
 * programme vanished and the app said "Pick your focus" over intact logs.
 * From the server, `fetchLive` threw "Remote schema mismatch" and the copy
 * was refused outright. Found when the persona simulator wrote
 * `capability_profile[x] = { measured_value, measured_at }` (no
 * `estimated_level` / `confidence`) and 14 of 24 personas toured an empty
 * account.
 *
 * The repair walks zod's issues one at a time. It deletes the offending
 * field; if the same location is still invalid (a REQUIRED field was the
 * problem, so deleting it changes nothing), it deletes the entry that holds
 * it, one level further up each time. A bad `capability_profile` entry
 * therefore costs that one entry, a bad set value costs that value, and a
 * log day costs nothing it does not have to.
 *
 * Top-level keys are never deleted — a broken one is reset to the empty
 * store's value, so `logs` cannot disappear because one day was malformed.
 * Returns null when the input is not an object or the repair cannot
 * converge; the caller then falls back to what it did before.
 */
export type StoreRepair = { store: Store; dropped: string[] };

const MAX_STEPS = 200;

type Container = Record<string, unknown> | unknown[];

function containerAt(root: unknown, path: PropertyKey[]): Container | null {
  let cur: unknown = root;
  for (const key of path) {
    if (cur == null || typeof cur !== "object") return null;
    cur = (cur as Record<PropertyKey, unknown>)[key as string];
  }
  return cur != null && typeof cur === "object" ? (cur as Container) : null;
}

function removeAt(root: Record<string, unknown>, path: PropertyKey[], empty: Record<string, unknown>): boolean {
  if (path.length === 0) return false;
  if (path.length === 1) {
    const key = String(path[0]);
    root[key] = structuredClone(empty[key]);
    if (root[key] === undefined) delete root[key];
    return true;
  }
  const parent = containerAt(root, path.slice(0, -1));
  if (!parent) return false;
  const key = path[path.length - 1];
  if (Array.isArray(parent)) {
    const i = Number(key);
    if (!Number.isInteger(i) || i < 0 || i >= parent.length) return false;
    parent.splice(i, 1);
    return true;
  }
  if (!(String(key) in parent)) return false;
  delete parent[String(key)];
  return true;
}

export function repairStore(raw: unknown, empty: Store): StoreRepair | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const work = structuredClone(raw) as Record<string, unknown>;
  const emptyRec = empty as unknown as Record<string, unknown>;
  const dropped: string[] = [];
  // How far up from the reported path the next deletion at that location goes.
  const climb = new Map<string, number>();

  for (let step = 0; step < MAX_STEPS; step++) {
    const result = storeSchema.safeParse(work);
    if (result.success) return { store: result.data, dropped };
    const issue = result.error.issues[0];
    const path = issue.path as PropertyKey[];
    const key = path.map(String).join(".");
    let up = climb.get(key) ?? 0;
    let removed = false;
    while (!removed && up <= path.length) {
      const target = path.slice(0, path.length - up);
      if (target.length === 0) return null;
      removed = removeAt(work, target, emptyRec);
      if (removed) dropped.push(target.map(String).join("."));
      up++;
    }
    if (!removed) return null;
    climb.set(key, up);
  }
  return null;
}

/**
 * Tell us a repair happened. Paths only — never values: this is health data,
 * and the path ("user_profile.capability_profile.dead_hang_max_seconds") is
 * all that is needed to find the writer that produced it.
 */
export function reportStoreRepair(source: "local" | "remote", dropped: string[]): void {
  if (dropped.length === 0) return;
  console.warn(`Store repaired (${source}); dropped:`, dropped);
  if (typeof window === "undefined") return;
  void import("@sentry/nextjs")
    .then((Sentry) =>
      Sentry.captureMessage("store repaired on load", {
        level: "warning",
        extra: { source, dropped: dropped.slice(0, 50), count: dropped.length },
      }),
    )
    .catch(() => {});
}
