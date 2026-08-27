"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  LogOut,
  ChevronRight,
  ListPlus,
  FileText,
  Library,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/useStore";
import { createClient } from "@/lib/supabase/client";
import { useIsSuperAdmin } from "@/lib/super-admin";
import { isOffPlanOn } from "@/lib/features";
import { loadProgramManifest } from "@/lib/data-loader";
import { ConfirmSheet } from "@/components/ConfirmSheet";
import { StatusPill } from "@/components/ui/StatusPill";
import { BeliefsSection } from "@/components/profile/BeliefsSection";
import { AwayDays } from "@/components/profile/AwayDays";
import type { ProgramManifest } from "@/lib/schemas";

/**
 * Profile — switchboard (not dashboard) for identity, active programs, and
 * account controls. Post product-design-lead + visual-craft + copy + mobile-UX
 * reconcile 2026-08-18.
 *
 * Structure:
 *   - Identity row (email, staff badge, joined date)
 *   - Active programs list (tap → deep link to program page; remove happens there)
 *   - "More" nav (Guide, Evidence)
 *   - Sign out (Fitts-separated)
 *   - Footer: legal + GDPR utilities (Export, Delete) — deliberately quiet
 */
export default function ProfilePage() {
  const store = useStore((s) => s.store);
  const offPlanOn = useStore((s) => isOffPlanOn(s.store));
  const isSuperAdmin = useIsSuperAdmin();
  // P2-8 — Add to Home Screen from Profile when Chrome/Edge fires
  // beforeinstallprompt. iOS Safari never fires the event so the button
  // stays hidden there; direct-URL "Add to Home Screen" from Share is
  // documented in Guide.
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [memberSince, setMemberSince] = useState<string | null>(null);
  const [manifest, setManifest] = useState<ProgramManifest | null>(null);
  // Delete + Export moved to /account in F7 (Batch 23). The identity chip
  // above deep-links there.

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
  const [removeOpen, setRemoveOpen] = useState<
    (typeof activePrograms)[number] | null
  >(null);
  const removeActiveProgram = useStore((s) => s.removeActiveProgram);
  const resumeProgram = useStore((s) => s.resumeProgram);

  const doSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    if (typeof window !== "undefined") window.location.href = "/sign-in";
  };

  return (
    <div className="space-y-5 pt-4 pb-10">
      {/* Design-lead brief 2026-08-19 (gowod-visual-system) §1.1 + §4.2:
          promoted from sr-only to visible 32 px semibold. Highest-impact-
          per-minute edit in the brief — the Profile tab read "empty and
          weird" partly because there was no page-title anchor. */}
      <h1 className="text-[32px] font-semibold tracking-tight text-strong leading-none">
        Profile
      </h1>

      {/* F7 (Batch 23) — identity chip now deep-links to /account where
          Delete + Export + primary-picker + email-change live. The chip
          is a full-tap surface with a chevron; nothing about identity
          state mutates on Profile itself. */}
      <Link
        href="/account"
        className="rounded border border-line-soft bg-surface px-4 py-3 flex items-center gap-3 active:bg-line-soft/50"
      >
        <div className="w-12 h-12 rounded-full bg-bronze/20 flex items-center justify-center flex-shrink-0">
          <span className="font-semibold text-lg text-bronze-hi">
            {(email ?? "?").charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[16px] font-semibold text-strong break-words">
            {email ?? (
              <span className="inline-block w-48 h-4 bg-line-soft rounded motion-safe:animate-pulse" aria-label="Loading email" />
            )}
          </p>
          <p className="text-[11px] text-muted mt-0.5 flex items-center gap-2 flex-wrap">
            {memberSince ? (
              <span className="font-mono uppercase tracking-wider">
                joined {memberSince}
              </span>
            ) : null}
            {isSuperAdmin ? (
              <StatusPill label="staff" tone="slate" />
            ) : null}
          </p>
        </div>
        <ChevronRight size={16} className="text-muted flex-shrink-0" aria-hidden />
      </Link>

      {/* Design package t2/2b ("what Terav believes about you"), scoped
          to two rows — see dev/active/profile-beliefs-plan.md. Renders
          null when there's nothing to show yet (no TM, no active tier). */}
      <BeliefsSection />

      {/* Active plan(s). No inline × — removal happens on the program page
          (see product-design-lead brief). Row is chevron → deep link. */}
      {/* P1-69 (Batch 27) — the programs section renders only when
          `manifest != null` (map produces empty). But `activeSlugs.length`
          is synchronous from Zustand. Reserve height while manifest is
          loading so the sign-out row + footer don't jump up. Each row
          is ~72 px (48 min-height + padding); reserve N*72 to match
          the eventual list. */}
      {activeSlugs.length && !manifest ? (
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-2">
            Your programs
          </p>
          <div
            aria-hidden
            className="rounded border border-line-soft bg-surface"
            style={{ minHeight: `${activeSlugs.length * 72}px` }}
          />
        </div>
      ) : null}
      {activePrograms.length ? (
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-2">
            Your programs
          </p>
        <ul className="rounded border border-line-soft bg-surface divide-y divide-line-soft">
          {activePrograms.map((p, i) => {
            const isPrimary = i === 0 && p.slug === activeProgramId;
            const state = store.user_profile?.program_states?.[p.slug];
            const hasIntake =
              !!state?.tier || !!state?.intake_answers || !!state?.baseline_capabilities;
            const graduated = !!state?.graduated_at;
            // F5 (Batch 23) — pause + extension surface as pills on the
            // program row. Paused arcs get an inline Resume link.
            const paused = !!state?.paused_at;
            const extendedWeeks = state?.extension_weeks ?? 0;
            // Non-primary rows in a multi-track setup get a "Remove"
            // text-link. Deliberately quiet — the row itself is a
            // deep-link to the program page (where the primary remove
            // action lives). This surface only exists so multi-track
            // users don't have to navigate two levels to drop an extra.
            const canRemoveHere = activePrograms.length > 1 && !isPrimary;
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
                        <StatusPill label="graduated" tone="green" className="flex-shrink-0" />
                      ) : null}
                    </p>
                    <p className="text-[11px] text-muted mt-0.5 flex items-center gap-1.5 flex-wrap">
                      <span>{p.duration_weeks} weeks · {p.difficulty}</span>
                      {isPrimary && activePrograms.length > 1 && !graduated && !paused ? (
                        // Batch 36 · migrated from inline bronze-dot pill to
                        // StatusPill tone="slate" — bronze is CTA-only per R2.
                        // "Today's" is a state indicator, not an invitation.
                        <StatusPill label="today's" tone="slate" />
                      ) : null}
                      {tierLabel && !graduated && !paused ? (
                        <StatusPill label={tierLabel} tone="slate" />
                      ) : null}
                      {!hasIntake && !graduated && !paused ? (
                        <StatusPill label="intake pending" tone="amber" />
                      ) : null}
                      {paused ? (
                        <StatusPill label="paused" tone="slate" />
                      ) : null}
                      {extendedWeeks > 0 && !graduated && !paused ? (
                        // Batch 36 · migrated from bronze-dot pill to slate
                        // per R2 (bronze is CTA-only). "Extended +Nw" is an
                        // informational state, not a CTA.
                        <StatusPill label={`extended +${extendedWeeks}w`} tone="slate" />
                      ) : null}
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-muted flex-shrink-0" />
                </Link>
                {paused ? (
                  <button
                    type="button"
                    onClick={() => resumeProgram(p.slug)}
                    className="ml-auto mr-3 mb-2 -mt-1 text-[11px] text-bronze hover:text-bronze-hover underline decoration-bronze/40 hover:decoration-bronze block"
                  >
                    Resume
                  </button>
                ) : null}
                {canRemoveHere && !paused ? (
                  <button
                    type="button"
                    onClick={() => setRemoveOpen(p)}
                    className="ml-auto mr-3 mb-2 -mt-1 text-[11px] text-muted hover:text-red underline decoration-line hover:decoration-red block"
                  >
                    Remove
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>
        </div>
      ) : (
        <Link
          href="/programs"
          className="inline-flex items-center min-h-[44px] py-3 font-mono text-[11px] uppercase tracking-wider text-bronze hover:text-bronze-hover"
        >
          Pick your focus →
        </Link>
      )}

      <AwayDays />

      <div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-2">
          More
        </p>
      <nav aria-label="More" className="rounded border border-line-soft bg-surface divide-y divide-line-soft">
        {/* S1 (Batch 25) — Coach shelved until N ≥ 50 users. AI-token
            costs don't pencil at beta scale. Row removed from Profile,
            /coach route + coach-client.ts deleted. R12 covers the
            explicit "don't reopen without paid user base" call.
            F8 Batch 29 (2026-08-19) — Extras / Report / Evidence relocated
            here from the deleted HeaderQuickLinks ⋮ menu. Header now only
            has TERAV + Settings. Install prompt relocated to Settings. */}
        {/* Off-plan ships dark for the public catalog (2026-08-24) — no
            program has off-plan-ONLY content, so the page was a second
            door into work the plan already schedules. Kept for accounts
            grandfathered from real usage; see lib/features.ts. */}
        {offPlanOn ? (
          <Link
            href="/off-plan/"
            className="flex items-center justify-between gap-3 px-3 py-3 min-h-[48px] active:bg-line-soft/50"
          >
            <span className="flex items-center gap-3 text-sm">
              <ListPlus size={16} className="text-muted" />
              Off-plan
            </span>
            <ChevronRight size={16} className="text-muted flex-shrink-0" />
          </Link>
        ) : null}
        <Link
          href="/report"
          className="flex items-center justify-between gap-3 px-3 py-3 min-h-[48px] active:bg-line-soft/50"
        >
          <span className="flex items-center gap-3 text-sm">
            <FileText size={16} className="text-muted" />
            Report
          </span>
          <ChevronRight size={16} className="text-muted flex-shrink-0" />
        </Link>
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
        <Link
          href="/evidence"
          className="flex items-center justify-between gap-3 px-3 py-3 min-h-[48px] active:bg-line-soft/50"
        >
          <span className="flex items-center gap-3 text-sm">
            <Library size={16} className="text-muted" />
            Evidence
          </span>
          <ChevronRight size={16} className="text-muted flex-shrink-0" />
        </Link>
      </nav>
      </div>

      {/* F7 (Batch 23) — Delete + Export moved to /account. Profile footer
          is now legal-only, one row. The identity chip above deep-links to
          /account where the destructive actions live. */}
      <footer className="pt-6 border-t border-line-soft">
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

      {/* Sign out — bottom-anchored (founder request 2026-08-19). Last
          thing on the screen so scrolling the whole Profile lands on
          the resting exit affordance. */}
      <section>
        <button
          type="button"
          onClick={() => setSignOutOpen(true)}
          className="w-full inline-flex items-center justify-center gap-2 font-mono text-[12px] uppercase tracking-wider px-4 py-3 rounded border border-line text-ink active:bg-line-soft min-h-[48px]"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </section>

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
        open={!!removeOpen}
        title={removeOpen ? `Remove ${removeOpen.name}?` : ""}
        body="Your log history stays. You can pick it up again any time from Programs."
        confirmLabel="Remove"
        danger
        onConfirm={() => {
          if (removeOpen) removeActiveProgram(removeOpen.slug);
          setRemoveOpen(null);
        }}
        onCancel={() => setRemoveOpen(null)}
      />
    </div>
  );
}
