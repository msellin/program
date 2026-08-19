"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/useStore";
import { createClient } from "@/lib/supabase/client";
import { useIsSuperAdmin } from "@/lib/super-admin";
import { loadProgramManifest } from "@/lib/data-loader";
import { useAccountActions } from "@/lib/account/actions";
import { ConfirmSheet } from "@/components/ConfirmSheet";
import { RotateCcw } from "lucide-react";
import type { ProgramManifest } from "@/lib/schemas";

/**
 * F7 (Batch 23) — the account route.
 *
 * Thin surface owning identity + destructive/rare actions. Profile stays
 * the frequent-use switchboard (programs + Guide + Sign out). Users get
 * here by tapping the identity chip on Profile.
 *
 * What lives here vs. Profile (design brief §F7):
 *   /account — identity, email placeholder, primary-program picker
 *              (only if ≥ 2 active), Export, Delete
 *   Profile  — H1 · identity chip (tap → /account) · programs · More · Sign out
 *
 * NOT on this page: notification/theme/units toggles, coach toggle. Those
 * ship in a separate settings brief if the founder decides they belong.
 */
export default function AccountPage() {
  const store = useStore((s) => s.store);
  const setActiveProgram = useStore((s) => s.setActiveProgram);
  const revertExtension = useStore((s) => s.revertExtension);
  const isSuperAdmin = useIsSuperAdmin();
  const [pendingRevert, setPendingRevert] = useState<string | null>(null);
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [memberSince, setMemberSince] = useState<string | null>(null);
  const [manifest, setManifest] = useState<ProgramManifest | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [emailNotice, setEmailNotice] = useState(false);
  const [showPrimaryPicker, setShowPrimaryPicker] = useState(false);
  const [pendingPrimary, setPendingPrimary] = useState<string | null>(null);
  const { exportMyData, deleteAccount, deleting, deleteError, setDeleteError } =
    useAccountActions();

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
  const activeProgramIds = store.user_profile?.active_program_ids ?? [];
  const multiProgram = activeProgramIds.length >= 2;
  const primaryProgramName = (() => {
    if (!activeProgramId || !manifest) return null;
    return manifest.programs.find((p) => p.slug === activeProgramId)?.name ?? activeProgramId;
  })();

  // F1 (Batch 25) — surface any program with an active +Nw extension so
  // the user can undo it. Extensions are single-decision toggles: revert
  // clears the field entirely (mirror of resumeProgram's shape).
  const extendedPrograms = activeProgramIds
    .map((slug) => {
      const state = store.user_profile?.program_states?.[slug];
      const weeks = state?.extension_weeks ?? 0;
      if (weeks <= 0) return null;
      const name = manifest?.programs.find((p) => p.slug === slug)?.name ?? slug;
      return { slug, weeks, name };
    })
    .filter((e): e is { slug: string; weeks: number; name: string } => e != null);
  const pendingRevertName = pendingRevert
    ? extendedPrograms.find((e) => e.slug === pendingRevert)?.name ?? pendingRevert
    : null;

  return (
    <div className="space-y-5 pt-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1 text-[13px] text-slate hover:text-ink"
        >
          <ChevronLeft size={14} />
          Profile
        </button>
      </div>

      <h1 className="text-[32px] font-semibold tracking-tight text-strong leading-none">
        Account
      </h1>

      {/* Identity chip (read-only). Matches the Batch 16 Profile chip
          without the deep-link chevron — this IS the destination. */}
      <div className="rounded border border-line-soft bg-surface px-4 py-3 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-bronze/20 flex items-center justify-center flex-shrink-0">
          <span className="font-semibold text-lg text-bronze-hi">
            {(email ?? "?").charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[16px] font-semibold text-strong break-words">{email}</p>
          <p className="text-[11px] text-muted mt-0.5 flex items-center gap-2 flex-wrap">
            {memberSince ? <span>joined {memberSince}</span> : null}
            {isSuperAdmin ? <span>staff</span> : null}
          </p>
        </div>
      </div>

      {/* Sign-in section — currently just email, change deferred. */}
      <div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-2">
          Sign-in
        </p>
        <button
          type="button"
          onClick={() => setEmailNotice(true)}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 min-h-[48px] active:bg-line-soft/50 rounded border border-line-soft bg-surface text-left"
        >
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-muted">Email</p>
            <p className="text-sm text-strong truncate">{email ?? "—"}</p>
          </div>
          <ChevronRight size={16} className="text-muted flex-shrink-0" />
        </button>
      </div>

      {/* Primary-program picker — only surfaces for multi-program users.
          Single-program users have nothing to pick from. */}
      {multiProgram && manifest ? (
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-2">
            Programs
          </p>
          <button
            type="button"
            onClick={() => setShowPrimaryPicker(true)}
            className="w-full flex items-center justify-between gap-3 px-4 py-3 min-h-[48px] active:bg-line-soft/50 rounded border border-line-soft bg-surface text-left"
          >
            <div className="min-w-0 flex-1">
              <p className="text-[11px] text-muted">Primary program</p>
              <p className="text-sm text-strong truncate">{primaryProgramName ?? "—"}</p>
            </div>
            <ChevronRight size={16} className="text-muted flex-shrink-0" />
          </button>
        </div>
      ) : null}

      {/* F1 (Batch 25) — extensions surface. Only renders when at least
          one active program has an accepted extension. Each row lists
          the program + weeks + a revert button that clears the field
          via the store's revertExtension action. The design brief
          §Cross-feature coherence chose /account (not Today) as the
          undo home so the graduation card stays celebratory. */}
      {extendedPrograms.length > 0 ? (
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-2">
            Extensions
          </p>
          <ul className="rounded border border-line-soft bg-surface divide-y divide-line-soft">
            {extendedPrograms.map((e) => (
              <li
                key={e.slug}
                className="flex items-center justify-between gap-3 px-4 py-3 min-h-[48px]"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-strong truncate">{e.name}</p>
                  <p className="text-[11px] text-muted mt-0.5">
                    Extended +{e.weeks}w · retest window pushed
                  </p>
                </div>
                {/* P1-61 (Batch 26) — was `text-muted underline
                    decoration-line` — the underline was 1.82:1 (fails
                    1.4.1 + 1.4.11) and the "Undo" was visually
                    identical to adjacent body text. Now `text-slate`
                    (8.01:1) so the link affordance carries. Kept the
                    RotateCcw icon so tap target reads as a control,
                    not prose. Hit rect min-h stays at natural button
                    height; P2-20 addresses 44 px min-height. */}
                <button
                  type="button"
                  onClick={() => setPendingRevert(e.slug)}
                  className="inline-flex items-center gap-1.5 text-[11px] text-slate hover:text-ink underline underline-offset-2 decoration-slate/60 hover:decoration-ink min-h-[44px] py-2"
                >
                  <RotateCcw size={12} aria-hidden />
                  Undo
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Data & privacy — Export + Delete. Delete lives here exclusively;
          the prior Profile-footer Danger-zone disclosure is gone. */}
      <div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-2">
          Data & privacy
        </p>
        <div className="rounded border border-line-soft bg-surface divide-y divide-line-soft">
          <button
            type="button"
            onClick={exportMyData}
            className="w-full flex items-center justify-between gap-3 px-4 py-3 min-h-[48px] active:bg-line-soft/50 text-left"
          >
            <span className="text-sm text-strong">Export my data</span>
            <ChevronRight size={16} className="text-muted flex-shrink-0" />
          </button>
          <button
            type="button"
            onClick={() => {
              setDeleteError(null);
              setConfirmDelete(true);
            }}
            disabled={deleting}
            className="w-full flex items-center justify-between gap-3 px-4 py-3 min-h-[48px] active:bg-red/5 text-left disabled:opacity-50"
          >
            <span className="text-sm text-red">
              {deleting ? "Deleting…" : "Delete my account"}
            </span>
            <ChevronRight size={16} className="text-red/60 flex-shrink-0" />
          </button>
        </div>
        {deleteError ? (
          <p className="text-[12px] text-red border-l-4 border-red pl-2 mt-2">
            {deleteError}
          </p>
        ) : null}
      </div>

      <footer className="pt-4 border-t border-line-soft">
        <nav
          aria-label="Legal"
          className="text-[11px] text-muted flex items-center flex-wrap"
        >
          <Link
            href="/legal/privacy"
            className="inline-flex items-center min-h-[44px] py-2 hover:text-ink"
          >
            Privacy
          </Link>
          <span className="mx-1.5" aria-hidden>·</span>
          <Link
            href="/legal/terms"
            className="inline-flex items-center min-h-[44px] py-2 hover:text-ink"
          >
            Terms
          </Link>
          <span className="mx-1.5" aria-hidden>·</span>
          <Link
            href="/legal/disclaimer"
            className="inline-flex items-center min-h-[44px] py-2 hover:text-ink"
          >
            Medical disclaimer
          </Link>
        </nav>
      </footer>

      <ConfirmSheet
        open={pendingRevert != null}
        title={pendingRevertName ? `Undo the extension on ${pendingRevertName}?` : "Undo extension?"}
        body="The retest window snaps back to the original end date. Your logs and phase progress stay intact."
        confirmLabel="Undo"
        cancelLabel="Keep it"
        onCancel={() => setPendingRevert(null)}
        onConfirm={() => {
          if (pendingRevert) revertExtension(pendingRevert);
          setPendingRevert(null);
        }}
      />

      <ConfirmSheet
        open={emailNotice}
        title="Email change ships soon"
        body={
          <p>
            To change your sign-in email, contact{" "}
            <a
              href="mailto:sellinmargus@gmail.com"
              className="text-slate underline underline-offset-2"
            >
              sellinmargus@gmail.com
            </a>{" "}
            for now. The in-app flow lands in a future release.
          </p>
        }
        confirmLabel="Got it"
        cancelLabel="Close"
        onConfirm={() => setEmailNotice(false)}
        onCancel={() => setEmailNotice(false)}
      />

      <ConfirmSheet
        open={showPrimaryPicker && pendingPrimary != null}
        title="Make this your primary?"
        body={
          <p>
            Your logs, phase and history stay intact — only the &ldquo;today&rsquo;s
            focus&rdquo; moves. You can switch back any time.
          </p>
        }
        confirmLabel="Make it primary"
        cancelLabel="Not yet"
        onCancel={() => setPendingPrimary(null)}
        onConfirm={() => {
          if (pendingPrimary) setActiveProgram(pendingPrimary);
          setPendingPrimary(null);
          setShowPrimaryPicker(false);
        }}
      />

      {/* Inline primary picker sheet. Rendered as a plain expanding list
          when open — cheap to build, avoids yet-another custom sheet
          component for a rare-frequency multi-program user. */}
      {showPrimaryPicker && manifest && pendingPrimary == null ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="primary-picker-title"
          className="fixed inset-0 z-50 bg-ground/80 flex items-end justify-center p-3"
          onClick={() => setShowPrimaryPicker(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-md bg-surface-2 border border-line rounded-lg p-4 space-y-3"
          >
            <p id="primary-picker-title" className="font-semibold text-strong">
              Pick your primary program
            </p>
            <ul className="rounded border border-line-soft bg-surface divide-y divide-line-soft">
              {activeProgramIds.map((slug) => {
                const p = manifest.programs.find((m) => m.slug === slug);
                if (!p) return null;
                const isCurrent = slug === activeProgramId;
                return (
                  <li key={slug}>
                    <button
                      type="button"
                      onClick={() => {
                        if (isCurrent) {
                          setShowPrimaryPicker(false);
                          return;
                        }
                        setPendingPrimary(slug);
                      }}
                      className="w-full flex items-center justify-between gap-3 px-4 py-3 min-h-[48px] active:bg-line-soft/50 text-left"
                    >
                      <span className="text-sm text-strong">{p.name}</span>
                      {isCurrent ? (
                        <span className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-bronze/20 text-bronze">
                          current
                        </span>
                      ) : (
                        <ChevronRight size={16} className="text-muted flex-shrink-0" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
            <button
              type="button"
              onClick={() => setShowPrimaryPicker(false)}
              className="w-full inline-flex items-center justify-center min-h-[44px] py-2 text-sm text-muted"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      <ConfirmSheet
        open={confirmDelete}
        title="Delete your account permanently?"
        body="Everything goes — logs, training maxes, morning checks, server copies. This cannot be undone."
        confirmLabel="Delete forever"
        cancelLabel="Keep it"
        danger
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          setConfirmDelete(false);
          void deleteAccount();
        }}
      />
    </div>
  );
}
