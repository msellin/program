"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, ChevronRight, LogOut, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/useStore";
import { createClient } from "@/lib/supabase/client";
import { loadProgram, loadProgramManifest } from "@/lib/data-loader";
import { ConfirmSheet } from "@/components/ConfirmSheet";
import { StatusPill } from "@/components/ui/StatusPill";
import { BeliefsSection } from "@/components/profile/BeliefsSection";
import { TimeOffLine } from "@/components/profile/TimeOffLine";
import type { ProgramManifest } from "@/lib/schemas";
import { Button } from "@/components/ui/Button";
import { cardClass } from "@/components/ui/Card";
import { cn, today as todayKey } from "@/lib/utils";

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
  // P2-8 — Add to Home Screen from Profile when Chrome/Edge fires
  // beforeinstallprompt. iOS Safari never fires the event so the button
  // stays hidden there; direct-URL "Add to Home Screen" from Share is
  // documented in Guide.
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [memberSince, setMemberSince] = useState<string | null>(null);
  const [manifest, setManifest] = useState<ProgramManifest | null>(null);
  const [activeProgramJson, setActiveProgramJson] = useState<string | null | undefined>(undefined);
  const activeSlugForLifts = store.user_profile?.active_program_id ?? null;
  useEffect(() => {
    if (!activeSlugForLifts) return;
    void loadProgram(activeSlugForLifts)
      .then((p) => setActiveProgramJson(JSON.stringify(p)))
      .catch(() => setActiveProgramJson(undefined));
  }, [activeSlugForLifts]);
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
  const todayISO = todayKey();
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
    <div className="space-y-5 pt-4 pb-28">
      {/* Design-lead brief 2026-08-19 (gowod-visual-system) §1.1 + §4.2:
          promoted from sr-only to visible 32 px semibold. Highest-impact-
          per-minute edit in the brief — the Profile tab read "empty and
          weird" partly because there was no page-title anchor. */}
      <h1 className="text-h1 tracking-tight text-strong leading-none">
        Profile
      </h1>

      {/* F7 (Batch 23) — identity chip now deep-links to /account where
          Delete + Export + primary-picker + email-change live. The chip
          is a full-tap surface with a chevron; nothing about identity
          state mutates on Profile itself. */}
      <Link
        href="/account"
        className="rounded-lg border border-line-soft bg-surface px-4 py-3 flex items-center gap-3 active:bg-line-soft/50"
      >
        <div className="w-12 h-12 rounded-full bg-bronze/20 flex items-center justify-center flex-shrink-0">
          <span className="text-h3 text-bronze-hi">
            {(email ?? "?").charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-body font-semibold text-strong break-words">
            {email ?? (
              <span className="inline-block w-48 h-4 bg-line-soft rounded-md motion-safe:animate-pulse" aria-label="Loading email" />
            )}
          </p>
          <p className="text-eyebrow text-muted mt-0.5 flex items-center gap-2 flex-wrap">
            {memberSince ? (
              <span className="uppercase tracking-wider">
                joined {memberSince}
              </span>
            ) : null}
          </p>
        </div>
        <ChevronRight size={16} className="text-muted flex-shrink-0" aria-hidden />
      </Link>

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
          <p className="text-eyebrow uppercase tracking-widest text-muted mb-2">
            Your programs
          </p>
          <div
            aria-hidden
            className={cardClass({ flush: true })}
            style={{ minHeight: `${activeSlugs.length * 72}px` }}
          />
        </div>
      ) : null}
      {activePrograms.length ? (
        <div>
          <p className="text-eyebrow uppercase tracking-widest text-muted mb-2">
            Your programs
          </p>
        <ul className={cn(cardClass({ flush: true }), "divide-y divide-line-soft")}>
          {activePrograms.map((p, i) => {
            const isPrimary = i === 0 && p.slug === activeProgramId;
            const state = store.user_profile?.program_states?.[p.slug];
            const hasIntake =
              !!state?.tier || !!state?.intake_answers || !!state?.baseline_capabilities;
            const graduated = !!state?.graduated_at;
            // INTAKE PENDING only when nothing has been logged on this program.
            const hasLogged =
              Object.values(store.scheduled_blocks ?? {}).some(
                (b) => b.program_slug === p.slug && b.state === "done",
              ) ||
              (isPrimary &&
                Object.values(store.logs ?? {}).some(
                  (d) => Object.keys(d.exercises ?? {}).length > 0 || (d.runs?.length ?? 0) > 0,
                ));
            const weekNo = (() => {
              const started = state?.started_at?.slice(0, 10);
              if (!started) return null;
              const days = Math.floor(
                (new Date(todayISO + "T00:00:00Z").getTime() - new Date(started + "T00:00:00Z").getTime()) / 864e5,
              );
              if (!Number.isFinite(days) || days < 0) return 1;
              return Math.min(Math.floor(days / 7) + 1, p.duration_weeks);
            })();
            // F5 (Batch 23) — pause + extension surface as pills on the
            // program row. Paused arcs get an inline Resume link.
            const paused = !!state?.paused_at;
            const extendedWeeks = state?.extension_weeks ?? 0;
            // Every non-paused row gets a quiet text-link to leave the
            // program. This used to be `activePrograms.length > 1 &&
            // !isPrimary`, which is unreachable under the single-main cap
            // (MULTI_MAIN_ENABLED=false) — there is only ever one row, and
            // it is always primary. The result was that a user mid-arc had
            // no way to quit at all: "End this program" lives on the
            // GraduationCard, which only renders once the arc completes.
            // Their only exit was starting a different program.
            const canRemoveHere = !paused;
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
                    <p className="text-small font-semibold text-strong truncate flex items-center gap-1.5">
                      <span className="truncate">{p.name}</span>
                    </p>
                    <p className="text-eyebrow text-muted mt-0.5 flex items-center gap-1.5 flex-wrap">
                      <span>{weekNo ? `Week ${weekNo} of ${p.duration_weeks}` : `${p.duration_weeks} weeks`} · {p.difficulty}</span>
                      {isPrimary && activePrograms.length > 1 && !graduated && !paused ? (
                        <StatusPill label="main" tone="slate" />
                      ) : null}
                      {tierLabel && !graduated && !paused ? (
                        <StatusPill label={tierLabel} tone="slate" />
                      ) : null}
                      {!hasIntake && !hasLogged && !graduated && !paused ? (
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
                    className="ml-auto mr-3 mb-2 -mt-1 text-eyebrow text-bronze hover:text-bronze-hover underline decoration-bronze/40 hover:decoration-bronze block"
                  >
                    Resume
                  </button>
                ) : null}
                <div className="flex items-center justify-end gap-3 pr-3 pb-1 -mt-1">
                  <Link
                    href={`/programs/${p.slug}/intake/`}
                    className="min-h-11 inline-flex items-center px-1 text-eyebrow text-muted hover:text-ink underline decoration-line"
                  >
                    Update my answers
                  </Link>
                  {canRemoveHere ? (
                    <button
                      type="button"
                      onClick={() => setRemoveOpen(p)}
                      className="min-h-11 inline-flex items-center px-1 text-eyebrow text-muted hover:text-red underline decoration-line hover:decoration-red"
                    >
                      {isPrimary ? "End this program" : "Remove"}
                    </button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
        </div>
      ) : null}

      {/* BETA-1 (2026-09-01) — this link used to live in the `else` branch
          above, so it rendered ONLY for a user with no program. The moment
          you started one, the catalog became unreachable from anywhere in
          the app: the list above deep-links to `/programs/{slug}`, never to
          the index, and Programs is not in the bottom nav. In an installed
          PWA there is no address bar to fall back on, so "swap my focus" or
          "what else is there" had no answer.

          Chose the persistent row over a fifth bottom-nav tab: a tab bar is
          for destinations you visit daily (Day / Plan / Record), and picking
          a program is a monthly action at most. Revisit when paid
          multi-track makes adding a program a repeated action. */}
      <Link
        href="/programs"
        className="inline-flex items-center min-h-[44px] py-3 text-eyebrow uppercase tracking-wider text-bronze hover:text-bronze-hover"
      >
        {activePrograms.length ? "Browse all programs →" : "Pick your focus →"}
      </Link>

      <TimeOffLine />

      <BeliefsSection programLifts={activeProgramJson} />

      <div>
        <p className="text-eyebrow uppercase tracking-widest text-muted mb-2">
          More
        </p>
      <nav aria-label="More" className={cn(cardClass({ flush: true }), "divide-y divide-line-soft")}>
        {/* Feedback (2026-09-11). Beta users had no channel at all: the app
            asks for a symptom score every morning and an Accept or Ignore on
            every proposal, and offered nowhere to say a proposal made no
            sense. The only route was knowing the founder personally, which
            describes this beta and not the next one. */}
        <Link
          href="/feedback/"
          className="flex items-center justify-between gap-3 px-3 py-3 min-h-[48px] active:bg-line-soft/50"
        >
          <span className="flex items-center gap-3 text-small">
            <MessageSquare size={16} className="text-muted" />
            Send feedback
          </span>
          <ChevronRight size={16} className="text-muted flex-shrink-0" />
        </Link>
        <Link
          href="/guide"
          className="flex items-center justify-between gap-3 px-3 py-3 min-h-[48px] active:bg-line-soft/50"
        >
          <span className="flex items-center gap-3 text-small">
            <BookOpen size={16} className="text-muted" />
            Guide
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
          className="text-eyebrow text-muted flex items-center flex-wrap"
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
        <Button variant="secondary" block onClick={() => setSignOutOpen(true)}>
          <LogOut size={16} />
          Sign out
        </Button>
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
        title={
          removeOpen
            ? removeOpen.slug === activeProgramId
              ? `End ${removeOpen.name}?`
              : `Remove ${removeOpen.name}?`
            : ""
        }
        body="Your log history stays. You can pick it up again any time from Programs, and it resumes where it left off."
        confirmLabel={
          removeOpen && removeOpen.slug === activeProgramId ? "End program" : "Remove"
        }
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
