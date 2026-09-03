"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/useStore";
import { createClient } from "@/lib/supabase/client";
import { loadProgram } from "@/lib/data-loader";
import { getAdapter } from "@/lib/persistence/adapter";
import { migrateLegacyToBlocks, needsBlockMigration } from "@/lib/migrations/legacy-to-blocks";
import {
  ensureMaterialized,
  slugsNeedingMaterialization,
  activeSlugsOf,
} from "@/lib/engine/ensure-materialized";
import {
  shouldGrandfatherOffPlan,
  hasOffPlanSetting,
  OFF_PLAN_GRANDFATHER_MARKER,
} from "@/lib/features";
import type { Program, Store } from "@/lib/schemas";

const KEY = "program.log.v2";

/**
 * Read the UID stamped on the persisted store WITHOUT touching React state.
 * The bug this exists to solve: on first mount, React's `store` is still the
 * empty `initial` template. Reading `store.user_profile?.uid` off it returns
 * null, so any active Supabase session appears to be a "different user" and
 * triggers a reset — which then wipes the localStorage row we haven't loaded
 * yet. Reading directly from the adapter closes that race.
 */
function storedUidFromLocal(): string | null {
  try {
    return getAdapter().loadLocal().user_profile?.uid ?? null;
  } catch {
    return null;
  }
}

/**
 * Binds local Zustand state to the current Supabase session.
 *
 * The bug this fixes: without this, localStorage survives sign-out/sign-in.
 * If user A signs out and user B signs in on the same browser, B would see
 * A's training data until the remote pull races. That's a real privacy leak on
 * shared devices (family iPad, gym computer).
 *
 * The rule: `store.user_profile.uid` must match the current session's uid.
 * When they diverge, we local-reset (no remote push — we don't want to clobber
 * either user's server data) and re-hydrate for the new session.
 */
export function StoreHydrator() {
  const hydrated = useStore((s) => s.hydrated);
  // Re-run the materialization keeper when the active-program set
  // changes — adding a second track has to give that track blocks, or
  // Day can't see it. Joined into a string so the effect isn't retriggered
  // by a new array identity on every store write.
  const activeSlugsKey = useStore((s) => activeSlugsOf(s.store).join("|"));
  // Both effects below defer to the one-shot block-object migration, which
  // is itself async (it fetches program JSON, then `replaceStore`s a whole
  // new store object). Without a dependency on migration state they would
  // run once, bail on the guard, and never re-run — or worse, land a
  // `replaceStore` from a snapshot the migration then overwrites. Keying on
  // `migrations_applied` makes them re-run the moment it completes.
  const migrationsKey = useStore((s) => (s.store.migrations_applied ?? []).join("|"));
  const hydrate = useStore((s) => s.hydrate);
  const resetForNewSession = useStore((s) => s.resetForNewSession);
  const setSessionIdentity = useStore((s) => s.setSessionIdentity);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    const syncToSession = async () => {
      const { data } = await supabase.auth.getSession();
      const sessionUid = data.session?.user?.id ?? null;
      const sessionEmail = data.session?.user?.email ?? null;
      if (!mounted) return;
      // Read stored UID from localStorage, NOT from React state — memory is
      // still the empty `initial` store on first mount. See storedUidFromLocal
      // comment above.
      const storedUid = storedUidFromLocal();

      if (sessionUid && storedUid && sessionUid !== storedUid) {
        // Actually a different user on this device — wipe local so we don't
        // leak the previous user's training data.
        resetForNewSession();
        setSessionIdentity(sessionUid, sessionEmail);
        hydrate();
      } else if (sessionUid && !storedUid) {
        // First time this browser sees a signed-in session for the current
        // localStorage row (either fresh new user, or existing user whose
        // localStorage was cleared). Stamp the identity and hydrate; do NOT
        // wipe — the empty local either has nothing to lose or already got
        // wiped by whatever cleared it.
        setSessionIdentity(sessionUid, sessionEmail);
        hydrate();
      } else if (!useStore.getState().hydrated) {
        // Same user or guest — normal hydrate.
        hydrate();
      }
    };

    void syncToSession();

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        // Do NOT wipe local on SIGNED_OUT. Supabase fires transient SIGNED_OUT
        // events during token refresh (esp. right after a page reload). The
        // former wipe here was the root cause of "test user loses program on
        // refresh": memory-uninitialized StoreHydrator + transient SIGNED_OUT
        // combined to clear localStorage before pullRemote could restore it.
        // A real different-user sign-in is still caught by the
        // `sessionUid !== storedUid` branch below on the subsequent SIGNED_IN.
        return;
      }
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
        // Same as syncToSession — read from localStorage, not React state.
        const storedUid = storedUidFromLocal();
        const sessionUid = session?.user?.id ?? null;
        if (sessionUid && storedUid && sessionUid !== storedUid) {
          resetForNewSession();
          setSessionIdentity(sessionUid, session?.user?.email ?? null);
          hydrate();
        } else if (sessionUid && !storedUid) {
          setSessionIdentity(sessionUid, session?.user?.email ?? null);
          hydrate();
        }
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [hydrate, resetForNewSession, setSessionIdentity]);

  // Cross-tab sync — if another tab writes to program.log.v2, re-hydrate this tab.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) hydrate();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [hydrate]);

  // Reference `hydrated` so the effect re-runs on hydrate completion (no-op otherwise).
  void hydrated;

  // Phase F · block-object rebuild — default the flag ON for accounts that
  // never explicitly toggled it, then run the one-shot legacy → blocks
  // migration. This is what "Phase F ships public" means: the flag is
  // effectively on for everyone unless they opted out on Profile.
  // Explicit `false` (user turned it off) is respected — we never flip it
  // back on silently.
  useEffect(() => {
    if (!hydrated) return;
    const state = useStore.getState();
    const flags = state.store.feature_flags;
    if (!flags || flags.block_object === undefined) {
      state.setFeatureFlag("block_object", true);
    }
  }, [hydrated]);

  // Companion effect — once the flag is on, ensure the migration has run.
  // Loads active-program JSONs, invokes the idempotent migrator, replaces
  // the store. Short-circuits after the first successful run per user.
  useEffect(() => {
    if (!hydrated) return;
    const state = useStore.getState();
    if (state.store.feature_flags?.block_object !== true) return;
    if (!needsBlockMigration(state.store)) return;

    const profile = state.store.user_profile;
    const slugs = new Set<string>();
    if (profile?.active_program_id) slugs.add(profile.active_program_id);
    for (const s of profile?.active_program_ids ?? []) slugs.add(s);
    if (slugs.size === 0) return;

    void Promise.all(Array.from(slugs).map((slug) => loadProgram(slug)))
      .then((programs) => {
        const bySlug: Record<string, Program> = {};
        for (const p of programs) if (p.slug) bySlug[p.slug] = p;
        const current = useStore.getState().store;
        if (!needsBlockMigration(current)) return;
        const migrated = migrateLegacyToBlocks(current, bySlug, new Date().toISOString().slice(0, 10));
        useStore.getState().replaceStore(migrated);
      })
      .catch(() => {
        // Silent — migration is idempotent, next mount will retry.
      });
  }, [hydrated]);

  // Materialization keeper. Separate from the migration effect above:
  // the migration runs once per user forever, this has to keep running —
  // on every load (the window rolls forward) and on every program add
  // (a new track needs its own blocks). See lib/engine/ensure-materialized.ts.
  useEffect(() => {
    if (!hydrated) return;
    const state = useStore.getState();
    if (state.store.feature_flags?.block_object !== true) return;
    // Let the one-shot migration land first — it seeds the map and the
    // replayed move/skip/done states. This effect will re-run after it
    // replaces the store.
    if (needsBlockMigration(state.store)) return;

    const todayISO = new Date().toISOString().slice(0, 10);
    const slugs = slugsNeedingMaterialization(state.store, todayISO);
    if (!slugs.length) return;

    void Promise.all(slugs.map((slug) => loadProgram(slug)))
      .then((programs) => {
        const bySlug: Record<string, Program> = {};
        for (const p of programs) if (p.slug) bySlug[p.slug] = p;
        // Re-read: the store may have moved while the fetch was in flight.
        const next = ensureMaterialized(useStore.getState().store, bySlug, todayISO);
        if (next) useStore.getState().replaceStore(next);
      })
      .catch(() => {
        // Silent — idempotent, retries on next mount.
      });
  }, [hydrated, activeSlugsKey, migrationsKey]);

  // Off-plan grandfathering (2026-08-24). Off-plan drills ship dark for
  // the public catalog, but accounts that actually used the surface keep
  // it. One-shot: the marker in `migrations_applied` means an account
  // that later turns the toggle OFF in Settings doesn't get it silently
  // switched back on the next time they open the app.
  useEffect(() => {
    if (!hydrated) return;
    const state = useStore.getState();
    if (state.store.feature_flags?.block_object === true && needsBlockMigration(state.store)) {
      // The migration is about to replace the whole store from its own
      // snapshot. Let it land; `migrationsKey` re-runs this effect after.
      return;
    }
    if (state.store.migrations_applied?.includes(OFF_PLAN_GRANDFATHER_MARKER)) return;
    if (hasOffPlanSetting(state.store)) return;

    const slugs = activeSlugsOf(state.store);
    if (!slugs.length) return;

    void Promise.all(slugs.map((slug) => loadProgram(slug)))
      .then((programs) => {
        const current = useStore.getState().store;
        if (current.migrations_applied?.includes(OFF_PLAN_GRANDFATHER_MARKER)) return;
        const next: Store = {
          ...current,
          migrations_applied: [
            ...(current.migrations_applied ?? []),
            OFF_PLAN_GRANDFATHER_MARKER,
          ],
        };
        if (shouldGrandfatherOffPlan(current, programs)) {
          next.feature_flags = { ...(current.feature_flags ?? {}), off_plan: true };
        }
        useStore.getState().replaceStore(next);
      })
      .catch(() => {
        // Silent — no marker written, so it retries on the next mount.
      });
  }, [hydrated, activeSlugsKey, migrationsKey]);

  return null;
}
