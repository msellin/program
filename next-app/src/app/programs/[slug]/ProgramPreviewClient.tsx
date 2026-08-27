"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Play, Check } from "lucide-react";
import { loadProgram, loadProgramManifest } from "@/lib/data-loader";
import { useStore } from "@/lib/useStore";
import { useIsSuperAdmin } from "@/lib/super-admin";
import { cn } from "@/lib/utils";
import { ConfirmSheet } from "@/components/ConfirmSheet";
import { DashboardBlock } from "@/components/DashboardBlock";
import { StatusPill } from "@/components/ui/StatusPill";
import type { Program, ProgramManifest, ProgramManifestEntry } from "@/lib/schemas";

type Props = {
  slug: string;
};

/**
 * Program preview + start.
 *
 * Shows the full pitch — who this is for, what you'll achieve, retest protocol,
 * duration, prerequisites, provisional/stable status. "Start this program"
 * button writes to `store.user_profile.active_program_id` and redirects to
 * Today. In the SaaS build (with auth), this same page also gates by paid tier
 * and offers upgrade flow; for the free beta, everyone starts everything.
 *
 * Once we ship the intake flow, the Start button routes to the intake wizard
 * first. Today it writes directly since Margus's program has an intake baked
 * into Phase 1.
 */
export function ProgramPreviewClient({ slug }: Props) {
  const router = useRouter();
  const [entry, setEntry] = useState<ProgramManifestEntry | null>(null);
  const [program, setProgram] = useState<Program | null>(null);
  const [manifest, setManifest] = useState<ProgramManifest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const activeProgramId = useStore((s) => s.store.user_profile?.active_program_id);
  const activeProgramIds = useStore((s) => s.store.user_profile?.active_program_ids);
  const savedTier = useStore((s) => s.store.user_profile?.program_states?.[slug]?.tier);
  const setActiveProgram = useStore((s) => s.setActiveProgram);
  const setProgramTier = useStore((s) => s.setProgramTier);
  const addSecondaryProgram = useStore((s) => s.addSecondaryProgram);
  const addSecondaryProgramForce = useStore((s) => s.addSecondaryProgramForce);
  const isSuperAdmin = useIsSuperAdmin();
  const writeGenerationTrace = useStore((s) => s.writeGenerationTrace);
  const uidForTrace = useStore((s) => s.store.user_profile?.uid);
  const [starting, setStarting] = useState(false);
  const [pickedTier, setPickedTier] = useState<string | null>(null);
  const [personalGate, setPersonalGate] = useState<{
    open: boolean;
    acknowledged: boolean;
  }>({ open: false, acknowledged: false });
  // F3 — switch-primary confirmation. Fires when the user starts a
  // program while a *different* primary is already active. Silent
  // primary-swaps were the multi-program surface's biggest UX gap.
  const [switchWarning, setSwitchWarning] = useState(false);

  useEffect(() => {
    void Promise.all([loadProgramManifest(), loadProgram(slug)])
      .then(([m, p]) => {
        const found = m.programs.find((x) => x.slug === slug);
        if (!found) throw new Error(`No program with slug "${slug}" in catalog`);
        setEntry(found);
        setProgram(p);
        setManifest(m);
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, [slug]);

  if (error) {
    return (
      <div className="mt-8 rounded border border-red bg-surface p-4">
        <h2 className="mb-2 text-lg font-semibold">Couldn&apos;t load program</h2>
        <p className="text-sm text-muted">{error}</p>
        <Link
          href="/programs"
          className="mt-2 inline-block text-[14px] text-slate border-b border-slate"
        >
          Back to catalog
        </Link>
      </div>
    );
  }
  if (!entry || !program) return <div className="mt-8 text-sm text-muted">Loading…</div>;

  const activeSlugs = activeProgramIds ?? (activeProgramId ? [activeProgramId] : []);
  const isActive = activeSlugs.includes(slug);
  const hasOtherActive = activeSlugs.some((s) => s !== slug);
  const isMultiDim = program.generation_strategy === "multi_dimensional";
  const hasTiers = (program.plan_tiers?.length ?? 0) > 0;
  const hasIntake = (program.intake?.questions?.length ?? 0) > 0;
  // Any program that authored an intake with safety_gates + consent-relevant
  // questions should route through the wizard, not just multi-dim ones. Engine
  // Builder + Rowing + CSM all declare intakes with medical screening — silently
  // skipping them bypassed the GDPR-relevant consent + cardiac / musculoskeletal
  // safety questions. The hip program has no intake and continues to start
  // directly via the tier picker.
  const routeThroughIntake = hasIntake;
  const requiresTierPick = isMultiDim && hasTiers && !routeThroughIntake;
  const effectiveTier = pickedTier ?? savedTier ?? null;
  const canStart = !requiresTierPick || !!effectiveTier;

  const saveTierIfNeeded = () => {
    if (requiresTierPick && effectiveTier) setProgramTier(slug, effectiveTier);
  };

  const writeTraceOnStart = () => {
    if (!program) return;
    const uid = uidForTrace ?? "guest";
    const startDate = new Date().toISOString().slice(0, 10);
    writeGenerationTrace(slug, {
      strategy: program.generation_strategy ?? "correlated_tier",
      tier_id: effectiveTier ?? undefined,
      seed: `${uid}:${slug}:${startDate}`,
      input_snapshot: {
        tier_id: effectiveTier,
        route: "direct_start_no_intake",
      },
    });
  };

  const goToIntake = () => {
    setStarting(true);
    router.push(`/programs/${slug}/intake`);
  };

  const currentPrimarySlug = activeProgramId ?? null;
  const currentPrimaryName = (() => {
    if (!currentPrimarySlug || !manifest) return null;
    return manifest.programs.find((p) => p.slug === currentPrimarySlug)?.name ?? currentPrimarySlug;
  })();
  const isSwitchingPrimary =
    !!currentPrimarySlug && currentPrimarySlug !== slug && !isActive;

  const commitStart = () => {
    saveTierIfNeeded();
    setStarting(true);
    setActiveProgram(slug);
    writeTraceOnStart();
    router.push("/");
  };

  const startAlone = () => {
    // Personal programs are authored against a specific clinical context. A
    // stranger with different findings would receive the wrong programme.
    // Require explicit ticked acknowledgement before starting.
    if (entry.personal && !personalGate.acknowledged) {
      setPersonalGate({ open: true, acknowledged: false });
      return;
    }
    // The switch confirmation runs BEFORE the intake hand-off, not after it.
    // Every catalog program declares an intake, so the old ordering (intake
    // first) meant the warning never fired for anything a beta user can
    // reach: they answered the wizard and their current focus vanished from
    // Day and Plan unasked. Under the single-main cap
    // (MULTI_MAIN_ENABLED=false in useStore) the swap REPLACES rather than
    // demotes, so this is the only chance to ask.
    if (isSwitchingPrimary) {
      setSwitchWarning(true);
      return;
    }
    if (routeThroughIntake) return goToIntake();
    commitStart();
  };

  // startAlongside intentionally removed for launch: 1 main track at a time.
  // Multi-main-track support in the store is dormant behind MULTI_MAIN_ENABLED
  // in useStore.ts. Re-add here when we flip that flag.
  void addSecondaryProgram; // silence unused-var lint

  return (
    <div className="space-y-6 pt-4">
      <div>
        <Link
          href="/programs"
          className="inline-flex items-center gap-1 text-[14px] text-slate hover:text-ink"
        >
          <ChevronLeft size={14} />
          All programs
        </Link>
      </div>

      {/* Batch 36 Step 14f · Program preview header modernized per v1.1.1
          §2.2 (h2-hero 26px on Preview) + StatusPill migration for the
          "active", ladder status, and personal chips. Prior inline
          "active" chip used `bg-bronze text-ground` — a CTA styling
          for a state pill (R2 violation). Now uses StatusPill green
          tone. Personal chip stays slate. Ladder chip collapses to
          CITED/VERIFIED per v1.1.1 §7.5 (REFERENCED shows as CITED
          slate; REVIEWED+VERIFIED show as VERIFIED green). */}
      <header className="space-y-2">
        <div className="flex items-baseline gap-2 flex-wrap">
          <h1 className="text-[26px] font-semibold tracking-tight text-strong leading-tight">
            {entry.name}
          </h1>
          {isActive ? (
            <StatusPill label="active" tone="green" className="flex-shrink-0" />
          ) : null}
          {(() => {
            if (entry.personal) return null;
            const s = entry.status;
            if (!s || s === "draft" || s === "DRAFT" || s === "PROVISIONAL") return null;
            // §7.5 collapse: REFERENCED → CITED slate; REVIEWED + VERIFIED
            // + stable → VERIFIED green. Prior 3-tier chip collapses to 2
            // per the copy jury caveat.
            const isVerified = s === "REVIEWED" || s === "VERIFIED" || s === "stable";
            return (
              <StatusPill
                label={isVerified ? "verified" : "cited"}
                tone={isVerified ? "green" : "slate"}
                className="flex-shrink-0"
              />
            );
          })()}
          {entry.personal ? (
            <StatusPill label="personal" tone="slate" className="flex-shrink-0" />
          ) : null}
        </div>
        <p className="text-sm text-muted">{entry.short_description}</p>
        {/* F10 Batch 31 · attribution row for REVIEWED programs. Names the
            reviewer + date + scope so the trust tier isn't a bare chip —
            it's an audit trail. review_evidence[] entries are audit files
            in the repo; we don't link them (privacy) but we name them.
            S6 (2026-08-19) · suppress for personal programs — they sit
            outside the ladder, so no attribution row either. */}
        {!entry.personal &&
        (program.status === "REVIEWED" || program.status === "VERIFIED") &&
        program.reviewed_by ? (
          <div className="rounded border border-slate/40 border-l-4 border-l-slate bg-surface p-3 text-[14px] mt-2 space-y-1">
            <p className="text-strong">
              <span className="font-semibold">Reviewed by</span>{" "}
              {program.reviewed_by.name}
              {program.reviewed_by.role ? (
                <span className="text-muted"> · {program.reviewed_by.role}</span>
              ) : null}
            </p>
            <p className="text-[12px] text-muted">
              {program.reviewed_by.date}
              {program.reviewed_by.scope ? (
                <> · scope: {program.reviewed_by.scope}</>
              ) : null}
              {program.review_evidence?.length ? (
                <> · {program.review_evidence.length} anchor files on record</>
              ) : null}
            </p>
          </div>
        ) : null}
        {entry.personal ? (
          <p className="text-[14px] text-muted italic border-l-2 border-slate/40 pl-3 mt-2">
            Authored for one specific clinical context. Not marketed as an evidence-backed
            catalog program — the &ldquo;why&rdquo; lives in the author&apos;s clinical notes,
            not in a public references list. Use only if your situation resembles the author&apos;s.
          </p>
        ) : null}
        {/* Levels chain — only for multi-tier programs. Replaces the bare
            "beginner" tag so a Tier-C user doesn't think this program is
            below their level. */}
        {entry.levels?.length ? (
          <div className="flex flex-wrap items-center gap-1 pt-1 text-[12px] font-mono">
            <span className="text-muted">Levels:</span>
            {entry.levels.map((lvl, i) => (
              <span key={lvl} className="flex items-center gap-1">
                <span className="text-slate">{lvl}</span>
                {i < (entry.levels?.length ?? 0) - 1 ? (
                  <span className="text-muted/60">→</span>
                ) : null}
              </span>
            ))}
          </div>
        ) : null}
      </header>

      {/* P1-74 remaining (2026-08-19) — full section reorder per
          design-lead brief §Decision 2. Reading flow is
          "is it for me? → what do I get? → what does it cost? → why
          should I trust it? → how do we prove it?"
          Adapts-to-you was in the header (top-loaded before Who/What);
          moved down between Commitment and Proves-it-works so it lands
          after the user has decided "yes, this is for me". */}
      <DashboardBlock
        eyebrow="Section 1 of 4"
        title="Who this is for"
      >
        <p className="text-sm leading-relaxed text-ink">{entry.who_this_is_for}</p>
      </DashboardBlock>

      <DashboardBlock
        eyebrow="Section 2 of 4"
        title="What you'll achieve"
      >
        <p className="text-sm leading-relaxed text-ink">{entry.what_youll_achieve}</p>
      </DashboardBlock>

      <DashboardBlock
        eyebrow="Section 3 of 4"
        title="What it takes"
      >
        <ul className="text-sm leading-relaxed text-ink space-y-1">
          <li>
            <span className="font-mono text-slate">{entry.duration_weeks} weeks</span>
            {entry.load_hint ? (
              <span className="text-muted"> · {entry.load_hint}</span>
            ) : null}
          </li>
          {entry.difficulty !== "multi-tier" ? (
            <li className="text-muted">
              Difficulty · <span className="text-ink">{entry.difficulty}</span>
            </li>
          ) : null}
          {entry.levels?.length ? (
            <li className="text-muted">
              Levels ·{" "}
              {entry.levels.map((lvl, i) => (
                <span key={lvl}>
                  <span className="text-slate">{lvl}</span>
                  {i < (entry.levels?.length ?? 0) - 1 ? (
                    <span className="text-muted/60"> → </span>
                  ) : null}
                </span>
              ))}
            </li>
          ) : null}
          {entry.positioning === "side_track" ? (
            <li className="text-slate text-[13px]">
              Layers on any main track — safe to run alongside your existing week.
            </li>
          ) : null}
          {entry.prerequisites?.length ? (
            <li className="text-amber text-[13px]">
              Recommended background — see the amber card below.
            </li>
          ) : null}
        </ul>
      </DashboardBlock>

      {/* Adapts-to-you dropped down here per design-lead reorder — was
          in the header. Lands AFTER the user has decided "yes, this is
          for me" (Who + What + What it takes) — so the differentiator
          reads as "and here's what's special about it" not "before we
          even tell you what it is." Bronze accent economy locked. */}
      {entry.adapts ? (
        <div className="rounded border border-bronze/30 border-l-4 border-l-bronze bg-bronze/[0.06] px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-bronze mb-1">
            Adapts to you
          </p>
          <p className="text-[14px] text-strong leading-snug">
            {entry.adapts} Every session sharpens further from your logs.
          </p>
        </div>
      ) : null}

      {entry.retest ? (
        <DashboardBlock
          eyebrow="Section 4 of 4"
          title="How we prove it works"
        >
          <p className="text-sm leading-relaxed text-ink">{entry.retest}</p>
        </DashboardBlock>
      ) : null}

      {entry.prerequisites?.length ? (
        <section className="rounded border border-amber/40 bg-amber/10 p-3 text-[14px] space-y-1">
          <p className="font-semibold text-strong mb-1">Recommended background</p>
          <ul className="list-disc pl-5 space-y-1">
            {entry.prerequisites.map((prereq, i) => (
              <li key={i}>{prereq}</li>
            ))}
          </ul>
          <p className="text-[11px] text-muted italic mt-1">
            Not enforced — you can still start if you assess honestly that you&apos;re close enough. The plan will hold you to the paces / loads it prescribes.
          </p>
        </section>
      ) : null}

      {/* P1-53 — surface a compact "Cites" strip so the landing promise
          ("every change cites a study") is honored inside the app. Data
          lives in program.goals.references; we render up to 4 authors +
          years so the strip stays scannable, and the Guide has the full
          bibliography. */}
      {(() => {
        const goals = program.goals as unknown as {
          references?: Array<{ id: string; authors: string; year: number; title: string }>;
        };
        const refs = goals?.references ?? [];
        if (!refs.length || entry.personal) return null;
        const compact = refs.slice(0, 4);
        return (
          <section className="rounded border border-line-soft bg-surface p-3 text-[13px] space-y-1">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
              Cites
            </p>
            <p className="text-ink leading-snug">
              {compact.map((r, i) => {
                const firstAuthor = r.authors.split(",")[0].split(" ")[0];
                return (
                  <span key={r.id}>
                    <span title={r.title}>{firstAuthor} {r.year}</span>
                    {i < compact.length - 1 ? <span className="text-muted"> · </span> : null}
                  </span>
                );
              })}
              {refs.length > compact.length ? (
                <span className="text-muted"> · +{refs.length - compact.length} more</span>
              ) : null}
            </p>
            <p className="text-[11px] text-muted">
              Full bibliography lives in{" "}
              <Link href="/evidence" className="underline underline-offset-2 hover:text-ink">
                Evidence
              </Link>
              .
            </p>
          </section>
        );
      })()}

      {program.intake ? (
        (() => {
          const nQ = program.intake.questions.length;
          const nT = program.intake.physical_tests?.length ?? 0;
          // Duration matters when there are benchmark tests to perform over a
          // few days (e.g. a submax HR baseline window). Wizard-only intakes
          // take a couple of minutes, not days.
          const hasWindow = nT > 0 && (program.intake.duration_days ?? 0) > 0;
          return (
            <section className="rounded border border-slate/30 bg-slate/10 p-3 text-[14px] space-y-1">
              <p className="font-semibold text-strong">
                {hasWindow
                  ? `Baseline setup — a few minutes on the wizard + a ${program.intake.duration_days}-day measurement window`
                  : "Baseline setup — a few minutes"}
              </p>
              <p className="text-muted">
                {nQ} short question{nQ === 1 ? "" : "s"}
                {nT ? ` and ${nT} benchmark test${nT === 1 ? "" : "s"}` : ""} to
                set your baseline. The rest of the program is generated from that.
              </p>
            </section>
          );
        })()
      ) : null}

      <div className="pt-2">
        {isActive ? (
          <div className="rounded border border-green/30 bg-green/10 p-3 space-y-2">
            <p className="text-sm text-strong font-semibold flex items-center gap-1.5">
              <Check size={14} />
              This is your current program
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider px-3 py-2 rounded bg-bronze text-ground"
              >
                Go to Today
              </Link>
              <button
                type="button"
                onClick={() => setConfirmEnd(true)}
                className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider px-3 py-2 rounded border border-red/40 text-red hover:bg-red/10"
              >
                End program
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {hasOtherActive ? (
              <p className="text-[14px] text-amber italic">
                You already have an active program. Starting this one will replace it —
                your logged history stays, but only one main program at a time during beta.
              </p>
            ) : null}

            {requiresTierPick ? (
              <div className="space-y-2 rounded border border-line-soft bg-line-soft/30 p-3">
                <p className="text-[12px] font-semibold text-strong uppercase tracking-wider">
                  Pick your starting tier
                </p>
                <p className="text-[12px] text-muted">
                  Each tier corresponds to a level of the skill. Pick the one that matches where
                  you are now — you can move up when the retest gate passes.
                </p>
                <ul className="space-y-1.5 pt-1">
                  {program.plan_tiers!.map((t) => {
                    const selected = effectiveTier === t.id;
                    return (
                      <li key={t.id}>
                        <button
                          type="button"
                          onClick={() => setPickedTier(t.id)}
                          className={cn(
                            "w-full text-left rounded border px-3 py-2 flex items-start gap-2 min-h-[52px]",
                            selected
                              ? "border-bronze bg-bronze/10"
                              : "border-line hover:border-slate/40 bg-surface",
                          )}
                        >
                          <div className={cn(
                            "mt-0.5 w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center",
                            selected ? "border-bronze bg-bronze" : "border-line",
                          )}>
                            {selected ? <Check size={11} className="text-ground" strokeWidth={3} /> : null}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-strong">{t.label}</p>
                            {t.typical_outcome ? (
                              <p className="text-[12px] text-muted mt-0.5">{t.typical_outcome}</p>
                            ) : null}
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2">
              {hasOtherActive ? (
                <>
                  <button
                    type="button"
                    onClick={startAlone}
                    disabled={starting || !canStart}
                    className="inline-flex items-center gap-1.5 font-mono text-[12px] uppercase tracking-wider px-4 py-3 rounded bg-bronze text-ground hover:bg-bronze/90 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Play size={14} />
                    {starting ? "Starting…" : requiresTierPick && !effectiveTier ? "Pick a tier" : "Make this my focus (replace current)"}
                  </button>
                  {isSuperAdmin ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (entry.personal && !personalGate.acknowledged) {
                          setPersonalGate({ open: true, acknowledged: false });
                          return;
                        }
                        saveTierIfNeeded();
                        setStarting(true);
                        addSecondaryProgramForce(slug);
                        writeTraceOnStart();
                        router.push("/");
                      }}
                      disabled={starting || !canStart}
                      className="inline-flex items-center gap-1.5 font-mono text-[12px] uppercase tracking-wider px-4 py-3 rounded border border-slate/60 text-slate hover:bg-slate/10 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      + Add alongside (admin)
                    </button>
                  ) : null}
                </>
              ) : (
                <button
                  type="button"
                  onClick={startAlone}
                  disabled={starting || !canStart}
                  className="inline-flex items-center gap-1.5 font-mono text-[12px] uppercase tracking-wider px-4 py-3 rounded bg-bronze text-ground hover:bg-bronze/90 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Play size={14} />
                  {starting ? "Starting…" : requiresTierPick && !effectiveTier ? "Pick a tier to start" : "Make this my focus"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {personalGate.open ? (
        <PersonalAcknowledgementModal
          programName={entry.name}
          onCancel={() => setPersonalGate({ open: false, acknowledged: false })}
          onConfirm={() => {
            setPersonalGate({ open: false, acknowledged: true });
            saveTierIfNeeded();
            setStarting(true);
            setActiveProgram(slug);
            writeTraceOnStart();
            router.push("/");
          }}
        />
      ) : null}

      {/* Switch-primary confirmation. Copy describes what the code actually
          does under the single-main cap: the current focus is REPLACED, not
          demoted to a secondary track. It leaves active_program_ids and
          stops appearing on Day and Plan. Its logs, tier and phase survive
          in program_states, and re-picking it resumes the same arc
          (ensureProgramStateEntry never overwrites an existing started_at)
          — so this is reversible, and the copy says so rather than
          implying both tracks keep running. */}
      <ConfirmSheet
        open={switchWarning}
        title={`Switch your focus to ${entry.name}?`}
        body={
          currentPrimaryName ? (
            <>
              <p>
                <strong className="text-strong">{currentPrimaryName}</strong>{" "}
                stops appearing on Day and Plan. Your logs, tier and phase are
                kept — pick it up again from Programs and it resumes where it
                left off.
              </p>
              <p className="mt-2 text-[13px] text-muted">
                Terav runs one focus at a time.
              </p>
            </>
          ) : (
            "This will make it your focus."
          )
        }
        confirmLabel="Switch focus"
        cancelLabel="Not yet"
        onCancel={() => setSwitchWarning(false)}
        onConfirm={() => {
          setSwitchWarning(false);
          // Mirrors startAlone's tail: intake programs still get their
          // wizard, they just get it after the user has agreed to the swap.
          if (routeThroughIntake) return goToIntake();
          commitStart();
        }}
      />

      <details className="pt-4 border-t border-line-soft">
        <summary className={cn(
          "cursor-pointer text-[14px] text-slate font-semibold",
        )}>
          Program shape (peek inside)
        </summary>
        <div className="mt-3 space-y-3 text-[14px]">
          {isMultiDim ? (
            <p className="text-[14px] text-muted italic">
              This program is multi-tier — the list below shows every phase and block
              across all levels. You&apos;ll only see the ones your tier uses, and drills
              are picked per session from your capability profile.
            </p>
          ) : null}
          <div>
            <p className="text-[11px] text-muted uppercase tracking-wider mb-1">Phases</p>
            <ul className="space-y-1">
              {program.phases.map((ph) => {
                const tierTag = extractTierTag(ph.name);
                return (
                  <li key={ph.id} className="text-ink">
                    <div className="flex items-center gap-2 flex-wrap">
                      {tierTag ? (
                        <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-line-soft text-muted inline-flex items-center gap-1.5">
                          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-slate" />
                          {tierTag}
                        </span>
                      ) : null}
                      <span className="font-mono text-[11px] text-muted">
                        {ph.starts}
                        {ph.ends ? ` → ${ph.ends}` : ""}
                      </span>
                    </div>
                    <div className="mt-0.5">
                      {stripTierPrefix(ph.name)}
                      {ph.goal ? <span className="text-muted"> — {ph.goal}</span> : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          <div>
            <p className="text-[11px] text-muted uppercase tracking-wider mb-1">Blocks</p>
            <ul className="text-muted list-disc pl-5">
              {program.blocks.map((b) => (
                <li key={b.id}>{b.name}</li>
              ))}
            </ul>
          </div>
        </div>
      </details>
      <ConfirmSheet
        open={confirmEnd}
        title="End this program?"
        body="Your log history stays. You'll return to the catalog to pick another."
        confirmLabel="End program"
        danger
        onConfirm={() => {
          setConfirmEnd(false);
          const s = useStore.getState();
          s.removeActiveProgram(slug);
        }}
        onCancel={() => setConfirmEnd(false)}
      />
    </div>
  );
}

/** "Tier A — Foundation (…)" → "A". Any leading "Tier X" fragment becomes a chip. */
function extractTierTag(name: string): string | null {
  const m = /^Tier\s+([A-Za-z0-9]+)\b/i.exec(name);
  return m ? `Tier ${m[1].toUpperCase()}` : null;
}
/** Strip the leading "Tier X — " so the phase name reads clean once the chip carries the tier. */
function stripTierPrefix(name: string): string {
  return name.replace(/^Tier\s+[A-Za-z0-9]+\s*(?:—|-|·)?\s*/i, "");
}

/**
 * Load-bearing safety modal for `personal: true` programs. A stranger with a
 * different clinical context shouldn't be able to tap "Start" without an
 * affirmative acknowledgement — the program was authored against a specific
 * individual's imaging, provocative-position findings, and history, and would
 * be actively wrong for someone else.
 */
function PersonalAcknowledgementModal({
  programName,
  onCancel,
  onConfirm,
}: {
  programName: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const [ack, setAck] = useState(false);
  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 sm:items-center"
      role="dialog"
      aria-labelledby="personal-gate-title"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-t-2xl border border-line bg-surface p-5 shadow-xl sm:rounded-2xl sm:mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="personal-gate-title" className="text-[16px] font-semibold text-strong">
          {programName} — proceed with care
        </h2>
        <p className="mt-3 text-sm text-ink leading-relaxed">
          This program was authored against one specific individual&apos;s clinical
          context: imaging findings, provocative-position screening, and history.
          It respects those constraints and would apply them to your training too.
        </p>
        <p className="mt-2 text-sm text-ink leading-relaxed">
          If your situation is <em>different</em> — different injury, different
          history, no clinical review — this plan will apply the wrong
          restrictions and progression. That&apos;s not safe.
        </p>
        <label className="mt-4 flex items-start gap-2 text-[14px] cursor-pointer">
          <input
            type="checkbox"
            checked={ack}
            onChange={(e) => setAck(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-bronze flex-shrink-0"
          />
          <span className="text-ink">
            My situation genuinely resembles the author&apos;s. I&apos;ve read the
            case study and understand this isn&apos;t a general-purpose program.
          </span>
        </label>
        <div className="mt-5 flex gap-2 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="font-mono text-[11px] uppercase tracking-wider px-3 py-2 rounded border border-line text-muted hover:bg-line-soft min-h-[40px]"
          >
            Not for me
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!ack}
            className="font-mono text-[11px] uppercase tracking-wider px-3 py-2 rounded bg-bronze text-ground disabled:opacity-40 disabled:cursor-not-allowed min-h-[40px]"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
