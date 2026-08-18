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
 * Profile — the user's home for identity, personal config, and account controls.
 *
 * Structure follows the IA audit (2026-08-11):
 *   - Identity card (email, tier)
 *   - My plan → deep link to current program + catalog
 *   - My constraints → contraindications editor
 *   - Data & privacy → inline JSON export + account delete
 *   - Coach (beta) — placeholder until AI wired
 *   - Help → guide
 *   - Sign out (destructive at bottom, 2 taps to reach)
 *
 * Mobile-first: single column, stacked sections, ≥44px tap targets.
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
    <div className="space-y-5 pt-4 pb-6">
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
              title="Super admin — multi-plan enrollment unlocked."
            >
              admin
            </span>
          ) : null}
        </div>
        {memberSince ? (
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted flex-shrink-0">
            since {memberSince}
          </p>
        ) : null}
      </div>

      {/* Compliance card removed 2026-08-18 (product-design-lead review):
          duplicated Today's signal, drove no Profile action. Rolling-7 dot
          strip belongs above Progress if it lives anywhere. Profile is
          switchboard, not dashboard. */}

      {/* Active plan(s). No inline × — removal happens on the program page
          itself (deep-linked below). Founder note 2026-08-18: the × in the
          list was too easy to hit; the ConfirmSheet caught it but the panic
          of "did I just lose my program" was the wrong feel. */}
      {activePrograms.length ? (
        <ul className="rounded border border-line-soft divide-y divide-line-soft">
          {activePrograms.map((p, i) => {
            const isPrimary = i === 0 && p.slug === activeProgramId;
            return (
              <li key={p.slug}>
                <Link
                  href={`/programs/${p.slug}`}
                  className="flex items-center gap-2 min-h-[48px] px-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-semibold text-strong truncate flex items-center gap-1.5">
                      {p.name}
                      {isPrimary && activePrograms.length > 1 ? (
                        <span className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-bronze/20 text-bronze">
                          primary
                        </span>
                      ) : null}
                    </p>
                    <p className="text-[11px] text-muted mt-0.5">
                      {p.duration_weeks} weeks · {p.difficulty}
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
          className="inline-block font-mono text-[11px] uppercase tracking-wider px-3 py-2 rounded bg-bronze text-ground min-h-[44px]"
        >
          Pick a program →
        </Link>
      )}

      <nav aria-label="More" className="rounded border border-line-soft divide-y divide-line-soft">
        {coachConfigured() ? (
          <Link
            href="/coach"
            className="flex items-center justify-between gap-3 px-3 py-3 hover:bg-line-soft/50 min-h-[48px]"
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
          className="flex items-center justify-between gap-3 px-3 py-3 hover:bg-line-soft/50 min-h-[48px]"
        >
          <span className="flex items-center gap-3 text-sm">
            <BookOpen size={16} className="text-muted" />
            How this app works
          </span>
          <ChevronRight size={16} className="text-muted flex-shrink-0" />
        </Link>
      </nav>

      {/* Sign out — small, at the bottom */}
      <section className="pt-4">
        <button
          type="button"
          onClick={() => setSignOutOpen(true)}
          className="w-full inline-flex items-center justify-center gap-2 font-mono text-[12px] uppercase tracking-wider px-4 py-3 rounded border border-line text-ink hover:bg-line-soft min-h-[48px]"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </section>

      {/* Footer: legal + GDPR utility links. Deliberately low-key —
          reachable (legally required) but not shouting. Export-data and
          delete-account both fire a ConfirmSheet before doing anything. */}
      <footer className="pt-6 space-y-3 border-t border-line-soft">
        <nav aria-label="Legal" className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-muted">
          <Link href="/legal/privacy" className="hover:text-ink">Privacy</Link>
          <Link href="/legal/terms" className="hover:text-ink">Terms</Link>
          <Link href="/legal/disclaimer" className="hover:text-ink">Medical disclaimer</Link>
        </nav>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px]">
          <button
            type="button"
            onClick={exportMyData}
            className="text-muted hover:text-ink underline underline-offset-2 decoration-line"
          >
            Export my data (JSON)
          </button>
          <button
            type="button"
            onClick={() => {
              setDeleteError(null);
              setConfirmDelete(true);
            }}
            disabled={deleting}
            className="text-muted hover:text-ink underline underline-offset-2 decoration-line disabled:opacity-50"
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
        body="Your data stays synced — you can sign back in any time."
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
        body="This deletes your account, all logs, training maxes, morning checks, and every synced entry on our server. You cannot recover any of it after this action."
        confirmLabel="Delete forever"
        danger
        onConfirm={() => void deleteAccount()}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}


