"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  LogOut,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/useStore";
import { createClient } from "@/lib/supabase/client";
import { useIsSuperAdmin } from "@/lib/super-admin";
import { loadProgramManifest } from "@/lib/data-loader";
import { ConfirmSheet } from "@/components/ConfirmSheet";
import { coachConfigured } from "@/lib/coach-client";
import { today } from "@/lib/utils";
import type { ProgramManifest } from "@/lib/schemas";

/**
 * Profile — switchboard (not dashboard) for identity, active programs, and
 * account controls. Post product-design-lead + visual-craft + copy + mobile-UX
 * reconcile 2026-08-18.
 *
 * Structure:
 *   - Identity row (email, staff badge, joined date)
 *   - Active programs list (tap → deep link to program page; remove happens there)
 *   - "More" nav (Guide, Coach when configured)
 *   - Sign out (Fitts-separated)
 *   - Footer: legal + GDPR utilities (Export, Delete) — deliberately quiet
 */
export default function ProfilePage() {
  const store = useStore((s) => s.store);
  const wipe = useStore((s) => s.wipe);
  const isSuperAdmin = useIsSuperAdmin();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [memberSince, setMemberSince] = useState<string | null>(null);
  const [manifest, setManifest] = useState<ProgramManifest | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const exportMyData = () => {
    const blob = new Blob([JSON.stringify(store, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `terav-data-${today()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const deleteAccount = async () => {
    setConfirmDelete(false);
    setDeleting(true);
    setDeleteError(null);
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setDeleteError("Not signed in. Sign in first, then try again.");
        setDeleting(false);
        return;
      }
      const res = await fetch("/api/delete-account", {
        method: "DELETE",
        headers: { authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        setDeleteError(
          `Delete failed (${res.status}). ${text || "Try again in a moment."}`,
        );
        setDeleting(false);
        return;
      }
      wipe();
      await supabase.auth.signOut();
      router.replace("/sign-in");
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : String(e));
      setDeleting(false);
    }
  };

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
      const created = data.user?.created_at;
      if (created) {
        try {
          const d = new Date(created);
          setMemberSince(
            d.toLocaleDateString(undefined, { month: "short", year: "numeric" }),
          );
        } catch {
          /* ignore */
        }
      }
    });
    void loadProgramManifest().then(setManifest).catch(() => setManifest(null));
  }, []);

  const activeProgramId = store.user_profile?.active_program_id ?? null;
  const activeProgramIds = store.user_profile?.active_program_ids;
  const activeSlugs = activeProgramIds && activeProgramIds.length
    ? activeProgramId
      ? [activeProgramId, ...activeProgramIds.filter((s) => s !== activeProgramId)]
      : activeProgramIds
    : activeProgramId
      ? [activeProgramId]
      : [];
  const activePrograms = activeSlugs
    .map((slug) => manifest?.programs.find((p) => p.slug === slug))
    .filter((p): p is NonNullable<typeof p> => !!p);
  const [signOutOpen, setSignOutOpen] = useState(false);

  const doSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    if (typeof window !== "undefined") window.location.href = "/sign-in";
  };

  return (
    <div className="space-y-5 pt-4 pb-10">
      <h1 className="sr-only">Profile</h1>
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-2 min-w-0">
          <p className="text-sm text-muted truncate">
            {email ?? (
              <span className="inline-block w-48 h-4 bg-line-soft rounded animate-pulse" aria-label="Loading email" />
            )}
          </p>
          {isSuperAdmin ? (
            <span
              className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate/20 text-slate flex-shrink-0"
              title="Staff account — you can enrol in multiple programs at once."
            >
              staff
            </span>
          ) : null}
        </div>
        {memberSince ? (
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted flex-shrink-0">
            joined {memberSince}
          </p>
        ) : null}
      </div>

      {/* Active plan(s). No inline × — removal happens on the program page
          (see product-design-lead brief). Row is chevron → deep link. */}
      {activePrograms.length ? (
        <ul className="rounded border border-line-soft bg-surface divide-y divide-line-soft">
          {activePrograms.map((p, i) => {
            const isPrimary = i === 0 && p.slug === activeProgramId;
            const state = store.user_profile?.program_states?.[p.slug];
            const hasIntake =
              !!state?.tier || !!state?.intake_answers || !!state?.baseline_capabilities;
            const graduated = !!state?.graduated_at;
            // Resolve tier label from plan_tiers using the stored tier id.
            const tierLabel = (() => {
              if (!state?.tier || !manifest) return null;
              // manifest doesn't carry plan_tiers detail; use the state's
              // tier id + strip any prefix so "tier_a_foundation" → "Foundation".
              const t = state.tier;
              if (t === "foundation" || t === "progression" || t === "push") {
                return t.charAt(0).toUpperCase() + t.slice(1);
              }
              const short = t.replace(/^tier_[a-z]_?/i, "");
              return short.length ? short.charAt(0).toUpperCase() + short.slice(1) : t;
            })();
            return (
              <li key={p.slug}>
                <Link
                  href={`/programs/${p.slug}`}
                  className="flex items-center justify-between gap-3 px-3 py-3 min-h-[48px] active:bg-line-soft/50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-strong truncate flex items-center gap-1.5">
                      <span className="truncate">{p.name}</span>
                      {graduated ? (
                        <span className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-green/20 text-green flex-shrink-0">
                          graduated
                        </span>
                      ) : null}
                    </p>
                    <p className="text-[11px] text-muted mt-0.5 flex items-center gap-1.5 flex-wrap">
                      <span>{p.duration_weeks} weeks · {p.difficulty}</span>
                      {isPrimary && activePrograms.length > 1 && !graduated ? (
                        <span className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-bronze/20 text-bronze">
                          today&rsquo;s
                        </span>
                      ) : null}
                      {tierLabel && !graduated ? (
                        <span className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate/15 text-slate">
                          {tierLabel}
                        </span>
                      ) : null}
                      {!hasIntake && !graduated ? (
                        <span className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber/15 text-amber">
                          intake pending
                        </span>
                      ) : null}
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-muted flex-shrink-0" />
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <Link
          href="/programs"
          className="inline-flex items-center min-h-[44px] py-3 font-mono text-[11px] uppercase tracking-wider text-bronze hover:text-bronze-hover"
        >
          Pick your focus →
        </Link>
      )}

      <nav aria-label="More" className="rounded border border-line-soft bg-surface divide-y divide-line-soft">
        {coachConfigured() ? (
          <Link
            href="/coach"
            className="flex items-center justify-between gap-3 px-3 py-3 min-h-[48px] active:bg-line-soft/50"
          >
            <span className="flex items-center gap-3 text-sm">
              <MessageSquare size={16} className="text-muted" />
              Ask coach
            </span>
            <ChevronRight size={16} className="text-muted flex-shrink-0" />
          </Link>
        ) : null}
        <Link
          href="/guide"
          className="flex items-center justify-between gap-3 px-3 py-3 min-h-[48px] active:bg-line-soft/50"
        >
          <span className="flex items-center gap-3 text-sm">
            <BookOpen size={16} className="text-muted" />
            Guide
          </span>
          <ChevronRight size={16} className="text-muted flex-shrink-0" />
        </Link>
      </nav>

      {/* Sign out — Fitts-separated from the "More" card. `pt-4` on top of
          the outer `space-y-5` gap yields ~36 px between blocks so the
          destructive-adjacent button isn't in the same rhythm-unit as
          the nav rows above. */}
      <section className="pt-4">
        <button
          type="button"
          onClick={() => setSignOutOpen(true)}
          className="w-full inline-flex items-center justify-center gap-2 font-mono text-[12px] uppercase tracking-wider px-4 py-3 rounded border border-line text-ink active:bg-line-soft min-h-[48px]"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </section>

      {/* Footer: legal + GDPR utility links. Deliberately quiet — reachable
          (legally required) but not shouting. Both Export and Delete fire a
          ConfirmSheet. All footer links padded to 44 px hit area even though
          the visual weight is small — mobile-UX audit P0 fix. */}
      <footer className="pt-6 space-y-3 border-t border-line-soft">
        <nav
          aria-label="Legal"
          className="flex flex-wrap gap-x-5 gap-y-1 text-[11px]"
        >
          <Link
            href="/legal/privacy"
            className="inline-flex items-center min-h-[44px] py-2 text-muted hover:text-ink"
          >
            Privacy
          </Link>
          <Link
            href="/legal/terms"
            className="inline-flex items-center min-h-[44px] py-2 text-muted hover:text-ink"
          >
            Terms
          </Link>
          <Link
            href="/legal/disclaimer"
            className="inline-flex items-center min-h-[44px] py-2 text-muted hover:text-ink"
          >
            Medical disclaimer
          </Link>
        </nav>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[11px]">
          <button
            type="button"
            onClick={exportMyData}
            className="inline-flex items-center min-h-[44px] py-2 text-muted hover:text-ink underline underline-offset-2 decoration-muted/50 hover:decoration-ink/60"
          >
            Export my data
          </button>
          <button
            type="button"
            onClick={() => {
              setDeleteError(null);
              setConfirmDelete(true);
            }}
            disabled={deleting}
            className="inline-flex items-center min-h-[44px] py-2 text-muted hover:text-ink underline underline-offset-2 decoration-muted/50 hover:decoration-ink/60 disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Delete my account"}
          </button>
        </div>
        {deleteError ? (
          <p className="text-[12px] text-red border-l-4 border-red pl-2">{deleteError}</p>
        ) : null}
      </footer>

      <ConfirmSheet
        open={signOutOpen}
        title="Sign out?"
        body="Your data is synced. Sign in from any device to pick back up."
        confirmLabel="Sign out"
        onConfirm={() => {
          setSignOutOpen(false);
          void doSignOut();
        }}
        onCancel={() => setSignOutOpen(false)}
      />
      <ConfirmSheet
        open={confirmDelete}
        title="Delete your account permanently?"
        body="Everything goes — logs, training maxes, morning checks, server copies. This cannot be undone."
        confirmLabel="Delete forever"
        danger
        onConfirm={() => void deleteAccount()}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
