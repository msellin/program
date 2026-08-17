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
import type { Program, ProgramManifestEntry } from "@/lib/schemas";

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

  useEffect(() => {
    void Promise.all([loadProgramManifest(), loadProgram(slug)])
      .then(([m, p]) => {
        const found = m.programs.find((x) => x.slug === slug);
        if (!found) throw new Error(`No program with slug "${slug}" in catalog`);
        setEntry(found);
        setProgram(p);
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
          className="mt-2 inline-block text-[13px] text-slate border-b border-slate"
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

  const startAlone = () => {
    if (routeThroughIntake) return goToIntake();
    // Personal programs are authored against a specific clinical context. A
    // stranger with different findings would receive the wrong programme.
    // Require explicit ticked acknowledgement before starting.
    if (entry.personal && !personalGate.acknowledged) {
      setPersonalGate({ open: true, acknowledged: false });
      return;
    }
    saveTierIfNeeded();
    setStarting(true);
    setActiveProgram(slug);
    writeTraceOnStart();
    router.push("/");
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
          className="inline-flex items-center gap-1 text-[13px] text-slate hover:text-ink"
        >
          <ChevronLeft size={14} />
          All programs
        </Link>
      </div>

      <header className="space-y-2">
        <div className="flex items-baseline gap-2 flex-wrap">
          <h1 className="text-2xl font-semibold tracking-tight text-strong">{entry.name}</h1>
          {isActive ? (
            <span className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-bronze text-ground">
              active
            </span>
          ) : null}
          {entry.status === "PROVISIONAL" ? (
            <span
              className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber/20 text-amber"
              title="Beta — evidence and prescription are drafted but not yet clinically reviewed. Use with judgement."
            >
              provisional
            </span>
          ) : null}
          {entry.personal ? (
            <span className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate/20 text-slate">
              personal
            </span>
          ) : null}
        </div>
        <p className="text-sm text-muted">{entry.short_description}</p>
        {entry.personal ? (
          <p className="text-[13px] text-muted italic border-l-2 border-slate/40 pl-3 mt-2">
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
        {entry.adapts ? (
          <div className="rounded border border-bronze/30 border-l-4 border-l-bronze bg-bronze/[0.06] px-3 py-2 mt-2">
            <p className="text-[13px] text-strong leading-snug">
              <span className="font-semibold text-bronze">Adapts to you.</span>{" "}
              {entry.adapts} Every session sharpens further from your logs.
            </p>
          </div>
        ) : null}
        <div className="flex flex-wrap gap-3 pt-1 text-[12px] font-mono text-muted">
          <span>{entry.duration_weeks} weeks</span>
          {entry.difficulty !== "multi-tier" ? (
            <>
              <span>·</span>
              <span>{entry.difficulty}</span>
            </>
          ) : null}
          {entry.prerequisites?.length ? (
            <>
              <span>·</span>
              <span className="text-amber" title="Recommended background — not enforced by the app; self-assess honestly.">
                Recommended background
              </span>
            </>
          ) : null}
        </div>
      </header>

      <section className="space-y-2">
        <h2 className="text-[14px] font-semibold text-strong">Who this is for</h2>
        <p className="text-sm leading-relaxed text-ink">{entry.who_this_is_for}</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-[14px] font-semibold text-strong">What you&apos;ll achieve</h2>
        <p className="text-sm leading-relaxed text-ink">{entry.what_youll_achieve}</p>
      </section>

      {entry.retest ? (
        <section className="space-y-2">
          <h2 className="text-[14px] font-semibold text-strong">Retest</h2>
          <p className="text-sm leading-relaxed text-ink">{entry.retest}</p>
        </section>
      ) : null}

      {entry.prerequisites?.length ? (
        <section className="rounded border border-amber/40 bg-amber/10 p-3 text-[13px] space-y-1">
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

      {program.intake ? (
        (() => {
          const nQ = program.intake.questions.length;
          const nT = program.intake.physical_tests?.length ?? 0;
          // Duration matters when there are benchmark tests to perform over a
          // few days (e.g. a submax HR baseline window). Wizard-only intakes
          // take a couple of minutes, not days.
          const hasWindow = nT > 0 && (program.intake.duration_days ?? 0) > 0;
          return (
            <section className="rounded border border-slate/30 bg-slate/10 p-3 text-[13px] space-y-1">
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
              <p className="text-[13px] text-amber italic">
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

      <details className="pt-4 border-t border-line-soft">
        <summary className={cn(
          "cursor-pointer text-[13px] text-slate font-semibold",
        )}>
          Program shape (peek inside)
        </summary>
        <div className="mt-3 space-y-3 text-[13px]">
          {isMultiDim ? (
            <p className="text-[13px] text-muted italic">
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
                        <span className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate/20 text-slate">
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
        <label className="mt-4 flex items-start gap-2 text-[13px] cursor-pointer">
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
