"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/useStore";
import { createClient } from "@/lib/supabase/client";
import { setSyncAuthed } from "@/lib/sync";
import { loadProgram } from "@/lib/data-loader";
import { migrateLegacyToBlocks, needsBlockMigration } from "@/lib/migrations/legacy-to-blocks";
import type { Program } from "@/lib/schemas";

const KEY = "program.log.v2";

/**
 * Binds local Zustand state to the current Supabase session.
 *
 * The bug this fixes: without this, localStorage survives sign-out/sign-in.
 * If user A signs out and user B signs in on the same browser, B would see
 * A's training data until the KV pull races. That's a real privacy leak on
 * shared devices (family iPad, gym computer).
 *
 * The rule: `store.user_profile.uid` must match the current session's uid.
 * When they diverge, we local-reset (no KV push — we don't want to clobber
 * either user's server data) and re-hydrate for the new session.
 */
export function StoreHydrator() {
  const hydrated = useStore((s) => s.hydrated);
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
      setSyncAuthed(!!sessionUid);

      const state = useStore.getState();
      const storedUid = state.store.user_profile?.uid ?? null;

      if (sessionUid && sessionUid !== storedUid) {
        // Different user (or a stored-null with an active session) — reset local,
        // stamp the new identity, then hydrate fresh from KV.
        resetForNewSession();
        setSessionIdentity(sessionUid, sessionEmail);
        hydrate();
      } else if (!state.hydrated) {
        // Same user, first mount — normal hydrate.
        hydrate();
      }
    };

    void syncToSession();

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        setSyncAuthed(false);
        resetForNewSession();
        // Don't hydrate — user is guest, AuthGate will bounce to /sign-in.
        return;
      }
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
        setSyncAuthed(!!session?.user?.id);
        const state = useStore.getState();
        const storedUid = state.store.user_profile?.uid ?? null;
        const sessionUid = session?.user?.id ?? null;
        if (sessionUid && sessionUid !== storedUid) {
          resetForNewSession();
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

  return null;
}
