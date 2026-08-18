"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ShieldAlert, Check } from "lucide-react";
import { loadProgram, loadProgramManifest } from "@/lib/data-loader";
import { useStore } from "@/lib/useStore";
import { cn } from "@/lib/utils";
import { inferTier } from "@/lib/engine/intake-tier";
import { announce } from "@/lib/announce";
import type {
  Program,
  IntakeQuestion,
  PhysicalTest,
  ProgramManifestEntry,
} from "@/lib/schemas";

type Props = { slug: string };

// Calibration questions get a CSS-only pictogram tile in the left column of
// their row (see PictogramTile). Keyed by question id. Cheap to extend when
// Overhead Mobility / Rowing 2K land — one-line per program.
const PICTOGRAM_BY_QID: Record<string, "wall" | "freestand" | "walk"> = {
  wall_hold_seconds_selfreport: "wall",
  freestand_hold_seconds_selfreport: "freestand",
  walk_distance_selfreport: "walk",
};

type SectionTone = "gate" | "calibration" | "engine" | "optional" | "required";

const SECTION_TONE_META: Record<
  SectionTone,
  { badge: string; badgeClass: string; monogramClass: string }
> = {
  gate: {
    badge: "gate",
    badgeClass: "text-red",
    monogramClass: "bg-red/10 text-red border-red/30",
  },
  calibration: {
    badge: "calibration",
    badgeClass: "text-bronze",
    monogramClass: "bg-bronze/10 text-bronze border-bronze/30",
  },
  engine: {
    badge: "engine",
    badgeClass: "text-slate",
    monogramClass: "bg-slate/10 text-slate border-slate/30",
  },
  optional: {
    badge: "optional",
    badgeClass: "text-muted",
    monogramClass: "bg-line-soft/60 text-muted border-line",
  },
  required: {
    badge: "required",
    badgeClass: "text-amber",
    monogramClass: "bg-amber/10 text-amber border-amber/30",
  },
};

/**
 * Intake wizard for multi-dim programs.
 *
 * Structure:
 *   1. Screening — medical safety gates. If any hard-block answer is set,
 *      the wizard stops and points the user at a clinician before starting.
 *   2. Self-report skill assessment — the questions that feed tier inference.
 *   3. Consent — required checkboxes before Continue.
 *   4. Optional physical tests — numeric inputs. Skip and the self-report
 *      answers are used as proxies.
 *   5. Result — shows the inferred tier + a plain-English rationale, with an
 *      override option if the user disagrees.
 *
 * Storage: answers → user_profile.program_states[slug].intake_answers; the
 * inferred (or overridden) tier → program_states[slug].tier. Then the program
 * is either activated as primary or added alongside.
 */
export function IntakeClient({ slug }: Props) {
  const router = useRouter();
  const [program, setProgram] = useState<Program | null>(null);
  const [manifestEntry, setManifestEntry] = useState<ProgramManifestEntry | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [testResults, setTestResults] = useState<Record<string, number>>({});
  const [consents, setConsents] = useState<Record<string, boolean>>({});
  const [reviewing, setReviewing] = useState(false);
  const [overrideTier, setOverrideTier] = useState<string | null>(null);
  const [committing, setCommitting] = useState(false);
  const [attemptedContinue, setAttemptedContinue] = useState(false);

  const activeProgramId = useStore((s) => s.store.user_profile?.active_program_id);
  const activeProgramIds = useStore((s) => s.store.user_profile?.active_program_ids);
  const setActiveProgram = useStore((s) => s.setActiveProgram);
  const addSecondaryProgram = useStore((s) => s.addSecondaryProgram);
  const setProgramTier = useStore((s) => s.setProgramTier);
  const writeGenerationTrace = useStore((s) => s.writeGenerationTrace);
  const userProfileForTrace = useStore((s) => s.store.user_profile);

  useEffect(() => {
    void Promise.all([loadProgram(slug), loadProgramManifest()])
      .then(([p, m]) => {
        setProgram(p);
        setManifestEntry(m.programs.find((x) => x.slug === slug) ?? null);
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, [slug]);

  // Draft persistence: intake state was pure useState, so refresh, redeploy,
  // or navigating away wiped everything. v2 (2026-08-18) moves the draft
  // into the Zustand store → KV sync so it survives origin mismatches
  // (preview URL vs. app.terav.fit), cache clears, device switches, and
  // incognito close-and-reopen. Cleared in `commit()` after the tier is
  // committed. Also keeps a localStorage fallback for anonymous / cache-only
  // paths.
  //
  // Hydration order (first non-empty wins):
  //   1. user_profile.intake_drafts[slug]  ← store-backed, KV-synced
  //   2. localStorage draft                ← legacy fallback
  //   3. user_profile.program_states[slug].intake_answers  ← returning-user edit
  const draftKey = `terav.intake.draft.${slug}`;
  const storedDraft = useStore(
    (s) => s.store.user_profile?.intake_drafts?.[slug],
  );
  const committedAnswers = useStore(
    (s) => s.store.user_profile?.program_states?.[slug]?.intake_answers,
  );
  const setIntakeDraft = useStore((s) => s.setIntakeDraft);
  const clearIntakeDraft = useStore((s) => s.clearIntakeDraft);
  const [stepIndex, setStepIndex] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  // Audit 2026-08-18 (a11y) — focus + announce on wizard step change.
  // Ref anchors the step body; the useEffect below moves focus to the
  // step's h2 and fires an aria-live announcement so SR users know a
  // new question is loaded.
  const stepBodyRef = useRef<HTMLDivElement>(null);
  // Populated during render from `currentStep`; read at effect time. Kept
  // as a ref (not state) so re-populating on every render doesn't cause
  // extra effect fires.
  const stepAnnounceRef = useRef<{ label: string; step: number; total: number } | null>(null);
  useEffect(() => {
    try {
      if (storedDraft) {
        if (storedDraft.answers) setAnswers({ ...storedDraft.answers });
        if (storedDraft.test_results) setTestResults({ ...storedDraft.test_results });
        if (storedDraft.consents) setConsents({ ...storedDraft.consents });
        if (typeof storedDraft.step_index === "number") setStepIndex(storedDraft.step_index);
      } else {
        const raw = typeof window !== "undefined" ? window.localStorage.getItem(draftKey) : null;
        if (raw) {
          const parsed = JSON.parse(raw) as {
            answers?: Record<string, string>;
            testResults?: Record<string, number>;
            consents?: Record<string, boolean>;
            stepIndex?: number;
          };
          if (parsed.answers) setAnswers(parsed.answers);
          if (parsed.testResults) setTestResults(parsed.testResults);
          if (parsed.consents) setConsents(parsed.consents);
          if (typeof parsed.stepIndex === "number") setStepIndex(parsed.stepIndex);
        } else if (committedAnswers && Object.keys(committedAnswers).length > 0) {
          setAnswers({ ...committedAnswers });
        }
      }
    } catch {
      // Corrupt draft — ignore; user will re-enter.
    }
    setHydrated(true);
    // Hydrate once per slug; state on remount is snapshot at mount. If the
    // KV push races, that's fine — we re-hydrate on next mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftKey, slug]);
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(
        draftKey,
        JSON.stringify({ answers, testResults, consents, stepIndex }),
      );
    } catch {
      // Storage full / disabled — store-based path still writes.
    }
    setIntakeDraft(slug, {
      answers,
      test_results: testResults,
      consents,
      step_index: stepIndex,
    });
  }, [hydrated, draftKey, slug, answers, testResults, consents, stepIndex, setIntakeDraft]);

  const intake = program?.intake;
  const questions = intake?.questions ?? [];
  const physicalTests = intake?.physical_tests ?? [];
  const consentItems = intake?.consent ?? [];

  // Hard-block screening — driven by program.intake.safety_gates. Fixes F-103:
  // each program declares its own gate questions + unsafe values, rather than
  // relying on a hardcoded list that only knew Handstand Walk's fields.
  const blocker = useMemo(() => {
    const gates = intake?.safety_gates ?? [];
    for (const g of gates) {
      const answer = answers[g.question_id];
      if (answer && g.unsafe_values.includes(answer)) {
        return { title: g.block_title, body: g.block_body };
      }
    }
    // Capacity gate: if the user answered days_per_week AND the program declares
    // a schedule_constraints range AND their answer is below the program's min,
    // block with the honest "this dose won't hit the promise" refusal.
    const daysStr = answers.days_per_week;
    const range = program?.schedule_constraints?.session_count_per_week_range;
    if (daysStr && range) {
      const days = Number(daysStr);
      const minDays = range[0];
      if (Number.isFinite(days) && days < minDays) {
        return {
          title: `This program needs at least ${minDays} sessions per week`,
          body: `You said ${days}. Below that, the evidence base doesn't back the outcome we promise — the dose is too small to deliver on the ${program?.goals && typeof program.goals === "object" && "primary" in program.goals ? (program.goals as { primary: string }).primary : "programmed adaptation"}. Honest options: (1) increase your available days, (2) pick a program with a lower floor, or (3) run this as a maintenance block only (results will be muted).`,
        };
      }
    }
    return null;
  }, [answers, intake?.safety_gates, program?.schedule_constraints, program?.goals]);

  // consent_symptom_data is authored as a required question but rendered as
  // a consent checkbox (see CONSENT_IDS below). Its "answer" lives in
  // `consents`, not `answers` — so excluding it from the required-question
  // count is what stops the "stuck at 10/11" bug.
  const RENDERED_CONSENT_QUESTION_IDS = new Set(["consent_symptom_data"]);
  const requiredQuestions = useMemo(
    () => questions.filter((q) => q.required && !RENDERED_CONSENT_QUESTION_IDS.has(q.id)),
    [questions],
  );
  const unansweredRequiredIds = useMemo(() => {
    const ids = new Set<string>();
    for (const q of requiredQuestions) {
      const v = answers[q.id];
      if (v == null || v === "") ids.add(q.id);
    }
    return ids;
  }, [requiredQuestions, answers]);
  const requiredAnsweredCount = requiredQuestions.length - unansweredRequiredIds.size;
  const requiredQuestionsAnswered = unansweredRequiredIds.size === 0;

  const requiredConsentsGiven = useMemo(() => {
    return consentItems.every((c) => (c.required ? consents[c.id] === true : true));
  }, [consentItems, consents]);

  const canProceed = requiredQuestionsAnswered && requiredConsentsGiven && !blocker;

  const inferred = useMemo(() => {
    if (!program) return null;
    return inferTier(program, slug, answers, testResults);
  }, [program, slug, answers, testResults]);

  const chosenTierId = overrideTier ?? inferred?.tier_id ?? null;

  // Audit 2026-08-18 (a11y P0-1) — focus + announce on step change.
  // Mounted here BEFORE the error/loading early returns so React's hooks
  // count stays stable across renders. Uses stepAnnounceRef (populated
  // during render) to get the step label; falls back gracefully when
  // stepIndex is stable or the ref hasn't been populated yet.
  useEffect(() => {
    if (!hydrated) return;
    const el = stepBodyRef.current;
    if (el) {
      const heading = el.querySelector<HTMLElement>("h2");
      if (heading) {
        heading.setAttribute("tabindex", "-1");
        heading.focus({ preventScroll: false });
      }
    }
    const info = stepAnnounceRef.current;
    if (info) announce(`Step ${info.step} of ${info.total}. ${info.label}`);
  }, [stepIndex, hydrated]);

  const commit = () => {
    if (!chosenTierId) return;
    setCommitting(true);
    // Save answers + tier onto the program state.
    setProgramTier(slug, chosenTierId);
    // Persist intake_answers too — future adaptive-engine work reads them.
    const store = useStore.getState();
    const s = { ...store.store };
    const profile = { ...(s.user_profile ?? {}) };
    const states = { ...(profile.program_states ?? {}) };
    // Test-prep programs: shift phases to land on the user's target test date.
    // Reads intake_answers.target_test_date and computes days-of-shift against
    // the last phase's authored ends. Silent no-op when either is missing.
    let phaseShiftDays: number | undefined;
    if (program && answers.target_test_date) {
      const authoredEnd = program.phases[program.phases.length - 1]?.ends;
      const target = answers.target_test_date.trim();
      if (authoredEnd && /^\d{4}-\d{2}-\d{2}$/.test(target)) {
        const authored = new Date(authoredEnd + "T00:00:00").getTime();
        const desired = new Date(target + "T00:00:00").getTime();
        if (Number.isFinite(authored) && Number.isFinite(desired)) {
          phaseShiftDays = Math.round((desired - authored) / 864e5);
        }
      }
    }
    // Non-test-prep programs (CSM, Engine Builder, skill programs) have
    // author-time phase.starts baked into the JSON. If the user signs up after
    // that authored window, they land in the wrong phase — CSM users signing
    // up after 2026-10-06 hit Phase 3 (retest) as their first Today. Fix:
    // shift phases so phase[0].starts aligns with today. Skip the hip program
    // (uses its own started_at anchor logic) and skip when we already computed
    // a shift from target_test_date.
    if (
      phaseShiftDays == null &&
      program &&
      program.slug !== "anterior-hip-rebuild" &&
      program.phases[0]?.starts
    ) {
      const authoredStart = program.phases[0].starts;
      if (/^\d{4}-\d{2}-\d{2}$/.test(authoredStart)) {
        const authored = new Date(authoredStart + "T00:00:00").getTime();
        const todayIso = new Date().toISOString().slice(0, 10);
        const today = new Date(todayIso + "T00:00:00").getTime();
        if (Number.isFinite(authored) && Number.isFinite(today)) {
          const shift = Math.round((today - authored) / 864e5);
          if (shift !== 0) phaseShiftDays = shift;
        }
      }
    }

    // Snapshot physical-test results as the retest baseline for skill programs.
    // capability_profile[testId].measured_value gets updated when a future
    // retest-capture flow lands; baseline_capabilities stays frozen at intake
    // so Δ math has something honest to compare against.
    const baselineCaps: Record<string, number> = {};
    for (const [testId, value] of Object.entries(testResults)) {
      if (typeof value === "number") baselineCaps[testId] = value;
    }
    states[slug] = {
      ...(states[slug] ?? {}),
      tier: chosenTierId,
      intake_answers: answers,
      started_at: new Date().toISOString(),
      baseline_training_maxes: { ...(s.training_maxes ?? {}) },
      ...(Object.keys(baselineCaps).length ? { baseline_capabilities: baselineCaps } : {}),
      ...(phaseShiftDays != null ? { phase_shift_days: phaseShiftDays } : {}),
    };
    profile.program_states = states;

    // Populate capability_profile from physical test results so downstream
    // consumers (YourPlanCard reveal, multi-dim generator) can attribute the
    // plan to the user's answers. Uses the tier baseline for each test's
    // level — coarse but concrete. Reveal-copy.ts checks confidence:
    // "physical_test" to render the "your test result was X" line.
    const existingCaps = profile.capability_profile ?? {};
    const tierBaseline: 1 | 2 | 3 | 4 | 5 =
      chosenTierId?.startsWith("tier_e") || chosenTierId === "push"
        ? 5
        : chosenTierId?.startsWith("tier_d")
          ? 4
          : chosenTierId?.startsWith("tier_c") || chosenTierId === "progression"
            ? 3
            : chosenTierId?.startsWith("tier_b")
              ? 2
              : 1;
    const nowIso = new Date().toISOString();
    const newCaps = { ...existingCaps };
    for (const [testId, value] of Object.entries(testResults)) {
      if (typeof value !== "number") continue;
      newCaps[testId] = {
        estimated_level: tierBaseline,
        confidence: "physical_test" as const,
        last_measured_at: nowIso,
        measured_value: value,
      };
    }
    if (Object.keys(newCaps).length > Object.keys(existingCaps).length) {
      profile.capability_profile = newCaps;
    }
    s.user_profile = profile;
    // Use the store's internal setter path (setProgramTier already committed;
    // we're just topping up intake_answers). The next debounced push will send
    // both together.
    useStore.setState({ store: s });

    const hasOtherActive = (activeProgramIds ?? (activeProgramId ? [activeProgramId] : []))
      .some((s) => s !== slug);
    if (hasOtherActive) {
      addSecondaryProgram(slug);
    } else {
      setActiveProgram(slug);
    }

    // Phase A: write the generation_trace stub so YourPlanCard + future Phase
    // B adapters can attribute the plan to the user's answers. The seed
    // includes uid + slug + start date; two users with the same intake but
    // different uids get different seeds → different downstream shuffles.
    const uid = userProfileForTrace?.uid ?? "guest";
    const startDate = new Date().toISOString().slice(0, 10);
    writeGenerationTrace(slug, {
      strategy: program?.generation_strategy ?? "correlated_tier",
      tier_id: chosenTierId,
      seed: `${uid}:${slug}:${startDate}`,
      input_snapshot: {
        intake_answers: answers,
        physical_test_results: testResults,
        tier_id: chosenTierId,
        capability_profile: userProfileForTrace?.capability_profile ?? null,
      },
    });

    // Draft committed — clear both the store-backed draft AND the
    // localStorage fallback so a future intake session starts fresh.
    clearIntakeDraft(slug);
    try {
      window.localStorage.removeItem(draftKey);
    } catch {
      // ignore
    }

    // Bug fix 2026-08-18 (#69) — auto-dismiss the OnboardingRunner for this
    // program. Without this, the user lands on Today after intake and
    // immediately sees a "How Terav reads you" modal that includes a
    // "Run the intake" CTA — a step they just finished. Two onboarding
    // flows, one product. The intake is the primary flow; OnboardingRunner
    // is legacy for programs without an intake. Dismiss it here so the
    // post-intake landing is Today, not Today + stale modal.
    try {
      window.localStorage.setItem(`program.onboarding.done.${slug}`, "1");
    } catch {
      // ignore
    }

    router.push("/");
  };

  if (error) {
    return (
      <div className="mt-8 rounded border border-red bg-surface p-4">
        <h2 className="mb-2 text-lg font-semibold">Couldn&apos;t load program</h2>
        <p className="text-sm text-muted">{error}</p>
        <Link href="/programs" className="mt-2 inline-block text-[13px] text-slate border-b border-slate">
          Back to catalog
        </Link>
      </div>
    );
  }
  if (!program) {
    return <div className="mt-8 text-sm text-muted">Loading…</div>;
  }
  if (!intake) {
    return (
      <div className="pt-8 space-y-3">
        <p className="text-[14px] text-strong">This program doesn&apos;t have an intake wizard.</p>
        <p className="text-[13px] text-muted">
          Head back to the program page to start it directly.
        </p>
        <Link
          href={`/programs/${slug}`}
          className="inline-block font-mono text-[11px] uppercase tracking-wider px-3 py-2 rounded bg-bronze text-ground"
        >
          Back to {manifestEntry?.name ?? slug}
        </Link>
      </div>
    );
  }

  // Split questions into screening (medical) + about + skill assessment for
  // grouping. Screening = any question referenced by a program.safety_gate,
  // plus a few well-known symptom-history questions that aren't gate-drivers
  // but belong visually next to the gates.
  const gateQuestionIds = new Set(
    (intake?.safety_gates ?? []).map((g) => g.question_id),
  );
  const KNOWN_SYMPTOM_HISTORY_IDS = new Set([
    "shoulder_pain_overhead",
    "wrist_pain_12mo",
    "joint_issues",
    "resting_hr_known",
  ]);
  const SCREENING_IDS = new Set([...gateQuestionIds, ...KNOWN_SYMPTOM_HISTORY_IDS]);
  const SKILL_IDS = new Set([
    "wall_hold_seconds_selfreport",
    "freestand_hold_seconds_selfreport",
    "walk_distance_selfreport",
  ]);
  // Consent-topic questions (`consent_symptom_data` etc.) are already covered
  // by the program's declared `intake.consent[]` list rendered on the review
  // screen. Rendering them AGAIN as regular questions was double-consent.
  const CONSENT_IDS = new Set(["consent_symptom_data"]);
  const screening = questions.filter((q) => SCREENING_IDS.has(q.id) && !CONSENT_IDS.has(q.id));
  const skill = questions.filter((q) => SKILL_IDS.has(q.id));
  const about = questions.filter(
    (q) => !SCREENING_IDS.has(q.id) && !SKILL_IDS.has(q.id) && !CONSENT_IDS.has(q.id),
  );

  const backHref = `/programs/${slug}`;

  if (reviewing) {
    return (
      <div className="mx-auto max-w-2xl space-y-5 pt-4 pb-8">
        {/* components.md#layout (wizard body constraint) */}
        <button
          type="button"
          onClick={() => setReviewing(false)}
          className="inline-flex items-center gap-1 text-[13px] text-slate hover:text-ink"
        >
          <ChevronLeft size={14} />
          Back to answers
        </button>

        <header className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-strong">
            Your starting tier
          </h1>
          <p className="text-sm text-muted">
            {manifestEntry?.name ?? slug.replace(/-/g, " ")}
          </p>
        </header>

        {inferred ? (
          (() => {
            // The tier's authored `typical_outcome` describes what a user at
            // this tier realistically achieves. Show it as the plain-English
            // "why" — the raw variable dump reads corporate.
            const inferredTier = program.plan_tiers?.find((t) => t.id === inferred.tier_id);
            const typicalOutcome = (inferredTier as { typical_outcome?: string } | undefined)
              ?.typical_outcome;
            return (
              <section className="rounded border border-bronze/40 bg-bronze/10 p-4 space-y-2">
                <p className="text-[11px] font-mono uppercase tracking-wider text-bronze">
                  Recommended
                </p>
                <p className="text-[16px] font-semibold text-strong">
                  {inferred.tier_label}
                </p>
                {typicalOutcome ? (
                  <p className="text-[13px] text-ink leading-relaxed">
                    {typicalOutcome}
                  </p>
                ) : null}
                <details className="text-[12px] text-muted">
                  <summary className="cursor-pointer hover:text-ink">
                    How this was picked
                  </summary>
                  <p className="mt-1">Based on: {formatVars(inferred.vars)}</p>
                </details>
              </section>
            );
          })()
        ) : null}

        <section className="space-y-2">
          <p className="text-[11px] font-mono uppercase tracking-wider text-muted">
            Don&apos;t agree? Pick a different tier
          </p>
          <ul className="space-y-1.5">
            {program.plan_tiers?.map((t) => {
              const selected = chosenTierId === t.id;
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => setOverrideTier(selected ? null : t.id)}
                    className={cn(
                      "w-full text-left rounded border px-3 py-2 flex items-start gap-2 min-h-[52px]",
                      selected
                        ? "border-bronze bg-bronze/10"
                        : "border-line hover:border-slate/40 bg-surface",
                    )}
                  >
                    <div
                      className={cn(
                        "mt-0.5 w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center",
                        selected ? "border-bronze bg-bronze" : "border-line",
                      )}
                    >
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
        </section>

        <div className="sticky bottom-2 pt-2">
          <button
            type="button"
            onClick={commit}
            disabled={committing || !chosenTierId}
            className="w-full inline-flex items-center justify-center gap-1.5 font-mono text-[12px] uppercase tracking-wider px-4 py-3 rounded bg-bronze text-ground hover:bg-bronze/90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {committing ? "Starting…" : "Start program with this tier"}
          </button>
        </div>
      </div>
    );
  }

  // Build the wizard's flat step list. Each step renders as one screen with
  // Back / Next / Finish at the bottom. Sections stay named so the user knows
  // which arc they're in ("Screening", "Where you are now", "About you",
  // "Physical tests", "Consent"). See dev/design-briefs/2026-08-17-intake-visual-craft.md
  // — this supersedes the quiet-form structure in that brief per founder
  // redirect 2026-08-18.
  type WizardStep =
    | {
        kind: "question";
        section: "screening" | "skill" | "about";
        tone: SectionTone;
        sectionLabel: string;
        q: IntakeQuestion;
      }
    // Audit 2026-08-18 (#39) — split the "all 5 physical tests on one
    // screen" cram-fest into per-test steps. Each test is its own
    // wizard step; the first one carries a "Skip all physical tests"
    // quick action so users who don't want to do them can jump to
    // consent in one tap. Sub-index/count carried on the step so the
    // section label reads "Physical tests · 2 of 5 · optional."
    | {
        kind: "physical_test";
        sectionLabel: string;
        test: PhysicalTest;
        indexInSection: number; // 0-based
        totalInSection: number;
      }
    | { kind: "consent"; sectionLabel: string };

  const steps: WizardStep[] = [
    ...screening.map<WizardStep>((q) => ({
      kind: "question",
      section: "screening",
      tone: "gate",
      sectionLabel: "Screening",
      q,
    })),
    ...skill.map<WizardStep>((q) => ({
      kind: "question",
      section: "skill",
      tone: "calibration",
      sectionLabel: "Where you are now",
      q,
    })),
    ...about.map<WizardStep>((q) => ({
      kind: "question",
      section: "about",
      tone: "engine",
      sectionLabel: "About you",
      q,
    })),
    ...physicalTests.map<WizardStep>((test, idx) => ({
      kind: "physical_test",
      sectionLabel: `Physical tests · ${idx + 1} of ${physicalTests.length} · optional`,
      test,
      indexInSection: idx,
      totalInSection: physicalTests.length,
    })),
    ...(consentItems.length
      ? [{ kind: "consent" as const, sectionLabel: "Consent" }]
      : []),
  ];

  // Audit 2026-08-18 (P1) — if the stored stepIndex now points past the
  // last step (schema grew or shrunk between sessions), reset to 0
  // rather than dropping the user on whatever the new last step happens
  // to be. Prevents "returning user lands on Consent" gotcha.
  const clampedStepIndex =
    stepIndex >= steps.length ? 0 : Math.max(0, stepIndex);
  const currentStep = steps[clampedStepIndex];
  const isLastStep = clampedStepIndex >= steps.length - 1;

  // Populate the announce ref (declared at the top of the component) with
  // this render's step info so the effect above can read it.
  stepAnnounceRef.current = currentStep
    ? {
        label:
          currentStep.kind === "question"
            ? `${currentStep.sectionLabel} — ${currentStep.q.label}`
            : currentStep.kind === "physical_test"
              ? `${currentStep.sectionLabel} — ${currentStep.test.label}`
              : `${currentStep.sectionLabel} — required`,
        step: clampedStepIndex + 1,
        total: steps.length,
      }
    : null;

  // Is this specific step ready to advance? Question steps require the
  // question be answered if required. Consent step requires all required
  // checkboxes ticked. Physical tests step is always advanceable (optional).
  const stepReady = (() => {
    if (!currentStep) return false;
    if (blocker) return false;
    if (currentStep.kind === "question") {
      const q = currentStep.q;
      if (!q.required) return true;
      const v = answers[q.id];
      return v != null && v !== "";
    }
    if (currentStep.kind === "consent") return requiredConsentsGiven;
    return true;
  })();

  // If the answer they just gave trips a safety gate, show the block copy
  // in-context. The blocker useMemo already computes this.
  const showGateBlockInline = blocker != null;

  return (
    <div className="mx-auto max-w-2xl flex flex-col min-h-[100dvh] pt-4">
      {/* Audit 2026-08-18 (mobile-UX P0-2 + a11y P0-1) — sticky footer inside
          a flex column riding min-h-[100dvh]. Previously `fixed bottom-0`
          got covered by the iOS keyboard on text-input steps AND floated
          over empty space on desktop with a short body. Sticky rides the
          visualViewport correctly and closes the flow visually. */}
      <div className="flex-1 space-y-5 pb-4">
      {/* Audit 2026-08-18 (a11y P1) — this Cancel link exits the wizard
          entirely and is distinct from the footer's per-step Back button.
          Founder screenshot 2026-08-18: the large "Intake — {name}" H1 +
          "Short questions so the program starts at the right level..."
          paragraph repeated on every one of 17 steps (~80px vertical
          boilerplate per screen). Killed both — the program name moves
          into the progress rail as an additional segment (rail carries
          {program} · {section} · Step N of M), so users still see the
          context on every step without the wall of restated purpose. */}
      <div className="flex items-center justify-between gap-2">
        <Link href={backHref} className="inline-flex items-center gap-1 text-[13px] text-muted hover:text-ink">
          <ChevronLeft size={14} />
          Cancel intake
        </Link>
      </div>

      <h1 className="sr-only">Intake — {manifestEntry?.name ?? slug.replace(/-/g, " ")}</h1>

      <WizardProgress
        currentIndex={clampedStepIndex}
        total={steps.length}
        sectionLabel={currentStep?.sectionLabel}
        programName={manifestEntry?.name ?? slug.replace(/-/g, " ")}
      />
      {/* Section label used to live on a separate row below the rail — merged
          into the rail per 2026-08-18 P1 polish. */}

      <div ref={stepBodyRef} className="min-h-[280px]" aria-live="polite">
        {currentStep?.kind === "question" ? (
          <WizardQuestionScreen
            step={currentStep}
            answers={answers}
            setAnswer={(qid, v) => setAnswers((a) => ({ ...a, [qid]: v }))}
            safetyGates={intake?.safety_gates ?? []}
            showGateBlock={showGateBlockInline}
            blocker={blocker}
          />
        ) : null}

        {currentStep?.kind === "physical_test" ? (
          <WizardPhysicalTestScreen
            step={currentStep}
            results={testResults}
            setResult={(id, n) => setTestResults((r) => ({ ...r, [id]: n }))}
            onSkipAll={() => {
              // Jump past every remaining physical_test step. Consent (or
              // the end) is right after the last one.
              const lastPhysIdx = steps
                .map((s, i) => (s.kind === "physical_test" ? i : -1))
                .filter((i) => i >= 0)
                .pop();
              if (lastPhysIdx != null) setStepIndex(lastPhysIdx + 1);
            }}
          />
        ) : null}

        {currentStep?.kind === "consent" ? (
          <WizardConsentScreen
            items={consentItems}
            consents={consents}
            setConsent={(id, v) => setConsents((cs) => ({ ...cs, [id]: v }))}
            answers={answers}
            questions={questions}
          />
        ) : null}
      </div>
      </div>

      <WizardFooter
        stepIndex={clampedStepIndex}
        total={steps.length}
        canGoBack={clampedStepIndex > 0}
        onBack={() => setStepIndex((n) => Math.max(0, n - 1))}
        onNext={() => setStepIndex((n) => Math.min(steps.length - 1, n + 1))}
        onFinish={() => setReviewing(true)}
        nextReady={stepReady}
        isLast={isLastStep}
        blocker={blocker}
      />
    </div>
  );
}

/**
 * Wizard sub-components — see dev/design-briefs/2026-08-17-intake-visual-craft.md
 * and the 2026-08-18 founder redirect for the wizard structure that
 * supersedes the quiet-form.
 */

function WizardProgress({
  currentIndex,
  total,
  sectionLabel,
  programName,
}: {
  currentIndex: number;
  total: number;
  sectionLabel?: string;
  programName?: string;
}) {
  if (total === 0) return null;
  const pct = Math.round(((currentIndex + 1) / total) * 100);
  return (
    <div
      className="sticky top-0 z-30 -mx-4 px-4 py-2 bg-ground/95 backdrop-blur-sm border-b border-line-soft"
      role="progressbar"
      aria-valuenow={currentIndex + 1}
      aria-valuemin={1}
      aria-valuemax={total}
    >
      {/* Founder screenshot 2026-08-18 — program name lives in the rail
          instead of a repeating H1/description block above each step. */}
      {programName ? (
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-1 truncate">
          Intake · <span className="text-strong">{programName}</span>
        </p>
      ) : null}
      <div className="flex items-center gap-3">
        <div className="h-[3px] flex-1 rounded-full bg-line-soft overflow-hidden">
          <div
            className="h-full rounded-full bg-bronze transition-[width] motion-reduce:transition-none"
            style={{ width: `${pct}%` }}
            aria-hidden
          />
        </div>
        {/* Audit 2026-08-18 (P1) — section label merged into the rail so
            the section identity + step counter share one row. */}
        <span className="font-mono text-[10px] text-muted uppercase tracking-widest whitespace-nowrap">
          {sectionLabel ? <span className="mr-1 text-strong">{sectionLabel}</span> : null}
          <span>
            {sectionLabel ? "· " : ""}Step {currentIndex + 1} of {total}
          </span>
        </span>
      </div>
    </div>
  );
}

function WizardQuestionScreen({
  step,
  answers,
  setAnswer,
  safetyGates,
  showGateBlock,
  blocker,
}: {
  step: {
    kind: "question";
    section: "screening" | "skill" | "about";
    tone: SectionTone;
    sectionLabel: string;
    q: IntakeQuestion;
  };
  answers: Record<string, string>;
  setAnswer: (qid: string, v: string) => void;
  safetyGates: NonNullable<Program["intake"]>["safety_gates"];
  showGateBlock: boolean;
  blocker: { title: string; body: string } | null;
}) {
  const q = step.q;
  const pictogram = PICTOGRAM_BY_QID[q.id];
  const currentValue = answers[q.id];
  return (
    <section className="space-y-5 py-2">
      {/* components.md#pictograms — inline-left 40×40. Hero 96×96 rejected
          by 2026-08-18 audit (reads as image placeholder). */}
      <div className="flex items-start gap-3">
        {pictogram ? <PictogramTile kind={pictogram} /> : null}
        <h2
          id={`q-heading-${q.id}`}
          className="text-[18px] sm:text-[20px] font-semibold text-strong leading-snug flex-1"
        >
          {q.label}
          {q.required ? <span className="text-red ml-1">*</span> : null}
        </h2>
      </div>

      {q.help ? (
        <p className="text-[13px] text-muted leading-relaxed">{q.help}</p>
      ) : null}

      {q.type === "select" && q.options ? (
        (() => {
          // components.md#buttons#chip-vs-option-row (decision tree, 2026-08-18):
          //   longest label ≤ 8 chars → chip strip (numeric, Yes/No/Unsure, age band)
          //   longest label >  8 chars → option row (word-labelled choices)
          const longest = q.options.reduce(
            (m, o) => Math.max(m, (o.label ?? o.value).length),
            0,
          );
          const useOptionRows = longest > 8;
          // Audit 2026-08-18 (a11y P0-2) — radiogroup semantics + arrow-key
          // nav + roving tabindex. Currently-selected (or first, if none) is
          // the only tab stop.
          const focusedIdx = Math.max(
            0,
            q.options.findIndex((o) => o.value === currentValue),
          );
          const onOptionKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
            const opts = q.options!;
            const navKeys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"];
            if (!navKeys.includes(e.key)) return;
            e.preventDefault();
            const cur = Math.max(0, opts.findIndex((o) => o.value === currentValue));
            let nextIdx: number;
            if (e.key === "Home") nextIdx = 0;
            else if (e.key === "End") nextIdx = opts.length - 1;
            else if (e.key === "ArrowRight" || e.key === "ArrowDown")
              nextIdx = (cur + 1) % opts.length;
            else nextIdx = (cur - 1 + opts.length) % opts.length;
            setAnswer(q.id, opts[nextIdx].value);
          };
          if (useOptionRows) {
            // components.md#buttons#7 (option row) — canonical implementation.
            // Calibration tone: opt.hint renders as the row's secondary line,
            // so users see the tier mapping inline instead of buried in a
            // disclosure.
            return (
              <ul
                role="radiogroup"
                aria-labelledby={`q-heading-${q.id}`}
                className="space-y-1.5 pt-1"
              >
                {q.options.map((opt, idx) => {
                  const picked = currentValue === opt.value;
                  const unsafePicked = picked && isGateUnsafe(safetyGates, q.id, opt.value);
                  const showHint = step.tone === "calibration" && opt.hint;
                  return (
                    <li key={opt.value}>
                      <button
                        type="button"
                        role="radio"
                        aria-checked={picked}
                        tabIndex={idx === focusedIdx ? 0 : -1}
                        onKeyDown={onOptionKeyDown}
                        onClick={() => setAnswer(q.id, opt.value)}
                        className={cn(
                          "w-full text-left rounded border px-3 py-2 flex items-start gap-2 min-h-[52px]",
                          unsafePicked
                            ? "border-red/50 bg-red/10"
                            : picked
                              ? "border-bronze bg-bronze/10"
                              : "border-line hover:border-slate/40 bg-surface",
                        )}
                      >
                        <div
                          className={cn(
                            "mt-0.5 w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center",
                            unsafePicked
                              ? "border-red bg-red"
                              : picked
                                ? "border-bronze bg-bronze"
                                : "border-line",
                          )}
                          aria-hidden
                        >
                          {picked ? (
                            <Check size={11} className="text-ground" strokeWidth={3} />
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className={cn(
                              "text-sm font-semibold",
                              unsafePicked ? "text-red" : "text-strong",
                            )}
                          >
                            {opt.label ?? opt.value.replace(/_/g, " ")}
                          </p>
                          {showHint ? (
                            <p className="text-[11px] font-mono text-muted uppercase tracking-widest mt-0.5">
                              {opt.hint}
                            </p>
                          ) : null}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            );
          }
          // Short-label case → chip strip (components.md#buttons#6).
          return (
            <div
              role="radiogroup"
              aria-labelledby={`q-heading-${q.id}`}
              className="flex flex-wrap gap-2 pt-1"
            >
              {q.options.map((opt, idx) => {
                const picked = currentValue === opt.value;
                const unsafePicked = picked && isGateUnsafe(safetyGates, q.id, opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={picked}
                    tabIndex={idx === focusedIdx ? 0 : -1}
                    onKeyDown={onOptionKeyDown}
                    onClick={() => setAnswer(q.id, opt.value)}
                    className={cn(
                      "text-[14px] px-4 py-3 rounded border min-h-[48px]",
                      unsafePicked
                        ? "border-red/50 bg-red/10 text-red"
                        : picked
                          ? "border-bronze bg-bronze/15 text-strong"
                          : "border-line bg-surface text-strong hover:border-slate/40",
                    )}
                  >
                    {opt.label ?? opt.value.replace(/_/g, " ")}
                  </button>
                );
              })}
            </div>
          );
        })()
      ) : null}

      {q.type === "boolean" ? (
        (() => {
          const bools = ["true", "false"];
          const boolFocusedIdx = Math.max(0, bools.indexOf(currentValue ?? ""));
          const onBoolKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
            const nav = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"];
            if (!nav.includes(e.key)) return;
            e.preventDefault();
            const cur = Math.max(0, bools.indexOf(currentValue ?? ""));
            let nextIdx: number;
            if (e.key === "Home") nextIdx = 0;
            else if (e.key === "End") nextIdx = bools.length - 1;
            else if (e.key === "ArrowRight" || e.key === "ArrowDown")
              nextIdx = (cur + 1) % bools.length;
            else nextIdx = (cur - 1 + bools.length) % bools.length;
            setAnswer(q.id, bools[nextIdx]);
          };
          return (
            <div
              role="radiogroup"
              aria-labelledby={`q-heading-${q.id}`}
              className="flex gap-2 pt-1"
            >
              {bools.map((v, idx) => {
                const picked = currentValue === v;
                const unsafePicked = picked && isGateUnsafe(safetyGates, q.id, v);
                return (
                  <button
                    key={v}
                    type="button"
                    role="radio"
                    aria-checked={picked}
                    tabIndex={idx === boolFocusedIdx ? 0 : -1}
                    onKeyDown={onBoolKeyDown}
                    onClick={() => setAnswer(q.id, v)}
                    className={cn(
                      "text-[14px] px-5 py-3 rounded border min-h-[48px]",
                      unsafePicked
                        ? "border-red/50 bg-red/10 text-red"
                        : picked
                          ? "border-bronze bg-bronze/15 text-strong"
                          : "border-line bg-surface text-strong hover:border-slate/40",
                    )}
                  >
                    {v === "true" ? "Yes" : "No"}
                  </button>
                );
              })}
            </div>
          );
        })()
      ) : null}

      {q.type === "number" ? (
        <input
          type="number"
          inputMode="decimal"
          min={q.min}
          max={q.max}
          step={q.step}
          value={currentValue ?? ""}
          onChange={(e) => setAnswer(q.id, e.target.value)}
          placeholder={q.unit}
          aria-labelledby={`q-heading-${q.id}`}
          className="w-full text-[15px] px-3 py-3 min-h-[48px] border border-line rounded bg-surface focus:outline-none focus:ring-2 focus:ring-slate/40 focus:border-slate"
        />
      ) : null}

      {q.type === "text" ? (
        q.id.endsWith("_date") ? (
          <input
            type="date"
            value={currentValue ?? ""}
            onChange={(e) => setAnswer(q.id, e.target.value)}
            min={new Date().toISOString().slice(0, 10)}
            aria-labelledby={`q-heading-${q.id}`}
            className="w-full text-[15px] px-3 py-3 min-h-[48px] border border-line rounded bg-surface focus:outline-none focus:ring-2 focus:ring-slate/40 focus:border-slate"
          />
        ) : (
          <input
            type="text"
            value={currentValue ?? ""}
            onChange={(e) => setAnswer(q.id, e.target.value)}
            aria-labelledby={`q-heading-${q.id}`}
            className="w-full text-[15px] px-3 py-3 min-h-[48px] border border-line rounded bg-surface focus:outline-none focus:ring-2 focus:ring-slate/40 focus:border-slate"
          />
        )
      ) : null}

      {showGateBlock && blocker ? (
        <div className="mt-3 rounded border border-red/40 bg-red/10 p-4 space-y-2" role="alert">
          <p className="font-semibold text-red flex items-center gap-2">
            <ShieldAlert size={16} />
            {blocker.title}
          </p>
          <p className="text-[13px] text-strong">{blocker.body}</p>
          <p className="text-[12px] text-muted italic">
            If your answer is right, this program isn&apos;t the right fit today
            — talk to a clinician first.
          </p>
        </div>
      ) : null}
    </section>
  );
}

function WizardPhysicalTestScreen({
  step,
  results,
  setResult,
  onSkipAll,
}: {
  step: {
    kind: "physical_test";
    sectionLabel: string;
    test: PhysicalTest;
    indexInSection: number;
    totalInSection: number;
  };
  results: Record<string, number>;
  setResult: (id: string, n: number) => void;
  onSkipAll: () => void;
}) {
  const t = step.test;
  const inputId = `phys-test-${t.id}`;
  const currentValue = results[t.id];
  // Audit 2026-08-18 (#68) — the intake used to force every user to
  // estimate degrees / seconds by hand ("Overhead shoulder flexion,
  // 90-190 deg"). Non-clinicians bailed. When a program author supplies
  // `ranges`, we render discrete choices instead; the raw numeric input
  // stays as a fallback for tests without ranges (e.g. wall-hold seconds).
  const useRanges = Array.isArray(t.ranges) && t.ranges.length > 0;
  return (
    <section className="space-y-5 py-2">
      <h2
        id={`q-heading-${t.id}`}
        className="text-[18px] sm:text-[20px] font-semibold text-strong leading-snug"
      >
        {t.label}
      </h2>
      {t.instructions ? (
        <p className="text-[13px] text-muted leading-relaxed">{t.instructions}</p>
      ) : null}
      {t.video_url ? (
        <a
          href={t.video_url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-[12px] font-mono uppercase tracking-wider text-slate hover:text-ink underline underline-offset-4"
        >
          Watch demo ↗
        </a>
      ) : t.video_search ? (
        <a
          href={`https://www.google.com/search?q=${encodeURIComponent(t.video_search)}&tbm=vid`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-[12px] font-mono uppercase tracking-wider text-slate hover:text-ink underline underline-offset-4"
        >
          Look up a demo ↗
        </a>
      ) : null}

      {useRanges ? (
        <div
          role="radiogroup"
          aria-labelledby={`q-heading-${t.id}`}
          className="space-y-1.5"
        >
          {t.ranges!.map((r) => {
            const checked = currentValue === r.value;
            return (
              <label
                key={`${r.label}-${r.value}`}
                className={cn(
                  "flex items-start gap-3 rounded border p-3 cursor-pointer min-h-[56px] transition-colors",
                  checked
                    ? "border-bronze bg-bronze/5"
                    : "border-line hover:border-slate/40 hover:bg-line-soft/40",
                )}
              >
                <input
                  type="radio"
                  name={`phys-test-${t.id}`}
                  value={r.value}
                  checked={checked}
                  onChange={() => setResult(t.id, r.value)}
                  className="mt-1 flex-shrink-0 w-4 h-4"
                />
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block text-[14px] leading-snug",
                      checked ? "text-strong font-medium" : "text-ink",
                    )}
                  >
                    {r.label}
                  </span>
                  {r.description ? (
                    <span className="block mt-0.5 text-[12px] text-muted leading-snug">
                      {r.description}
                    </span>
                  ) : null}
                </span>
              </label>
            );
          })}
          <p className="text-[11px] text-muted italic pt-1">
            Pick the option that best matches what you can do today. Rough is fine — the
            engine adjusts as you log real sessions.
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor={inputId}>
            {t.label} ({t.unit})
          </label>
          <input
            id={inputId}
            type="number"
            inputMode="decimal"
            min={t.min}
            max={t.max}
            value={currentValue ?? ""}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (isFinite(n)) setResult(t.id, n);
            }}
            className="flex-1 text-[15px] px-3 py-3 min-h-[48px] border border-line rounded bg-surface focus:outline-none focus:ring-2 focus:ring-slate/40 focus:border-slate"
          />
          <span className="text-[12px] text-muted font-mono w-16 text-right">{t.unit}</span>
        </div>
      )}
      {step.indexInSection === 0 ? (
        <>
          <p className="text-[12px] text-muted italic">
            Physical tests are optional. Skip and we use your self-report as a proxy —
            you can retake these later on Retest.
          </p>
          <button
            type="button"
            onClick={onSkipAll}
            className="text-[11px] mono-caps text-muted hover:text-ink underline underline-offset-4"
          >
            Skip all physical tests →
          </button>
        </>
      ) : null}
    </section>
  );
}

function WizardConsentScreen({
  items,
  consents,
  setConsent,
  answers,
  questions,
}: {
  items: NonNullable<Program["intake"]>["consent"];
  consents: Record<string, boolean>;
  setConsent: (id: string, v: boolean) => void;
  answers: Record<string, string>;
  questions: IntakeQuestion[];
}) {
  return (
    <section className="space-y-5 py-2">
      <h2 className="text-[18px] sm:text-[20px] font-semibold text-strong">
        Consent
        <span className={cn("ml-2 text-[11px] font-mono uppercase tracking-widest align-middle", SECTION_TONE_META.required.badgeClass)}>
          required
        </span>
      </h2>
      <ul className="space-y-3">
        {(items ?? []).map((c) => (
          <li key={c.id}>
            {/* Visual-craft audit 2026-08-18 — consent rows were the smallest
                tap targets in the wizard (~32-40px depending on label wrap).
                Everything else in the wizard is 52-56px. Add min-h-[52px] +
                p-2 to bring parity. */}
            <label className="flex items-start gap-3 cursor-pointer min-h-[52px] p-2 -mx-2 rounded hover:bg-line-soft/40">
              <input
                type="checkbox"
                checked={consents[c.id] === true}
                onChange={(e) => setConsent(c.id, e.target.checked)}
                className="mt-1 flex-shrink-0 w-5 h-5"
              />
              <span className="text-[14px] text-strong leading-relaxed">{c.label}</span>
            </label>
          </li>
        ))}
      </ul>

      {/* Audit 2026-08-18 (P1) — review-my-answers collapsible so a user
          on the consent step can verify what they answered without
          walking Back through the whole flow. */}
      <details className="rounded border border-line-soft bg-surface p-3">
        <summary className="cursor-pointer text-[13px] text-muted hover:text-ink">
          Review my answers
        </summary>
        <ul className="mt-3 space-y-2 text-[12px]">
          {questions
            .filter((q) => answers[q.id] != null && answers[q.id] !== "")
            .map((q) => {
              const raw = answers[q.id];
              const opt = q.options?.find((o) => o.value === raw);
              const displayValue =
                opt?.label ??
                (q.type === "boolean" ? (raw === "true" ? "Yes" : "No") : raw);
              return (
                <li key={q.id} className="flex items-start gap-2">
                  <span className="text-muted flex-1 leading-snug">{q.label}</span>
                  <span className="text-strong font-medium min-w-[40%] text-right">
                    {displayValue}
                  </span>
                </li>
              );
            })}
        </ul>
      </details>
    </section>
  );
}

function WizardFooter({
  stepIndex,
  total,
  canGoBack,
  onBack,
  onNext,
  onFinish,
  nextReady,
  isLast,
  blocker,
}: {
  stepIndex: number;
  total: number;
  canGoBack: boolean;
  onBack: () => void;
  onNext: () => void;
  onFinish: () => void;
  nextReady: boolean;
  isLast: boolean;
  blocker: { title: string; body: string } | null;
}) {
  // Audit 2026-08-18 (copy) — "Finish" commits nothing (lands on review
  // screen). Rewrite to "Review." Dropped ← / → arrow characters from
  // Back/Next — screen-reader noise, no clarity add.
  const primaryLabel = isLast ? "Review" : "Next";
  const secondaryTitle = blocker
    ? "Answer above tripped a safety gate — change it to continue."
    : !nextReady
      ? "Answer this to continue."
      : "";
  // Audit 2026-08-18 (mobile-UX P0-2) — sticky, not fixed. Rides
  // visualViewport correctly under iOS keyboard.
  return (
    <div
      className="sticky bottom-0 -mx-4 px-4 border-t border-line-soft bg-ground/95 backdrop-blur-sm"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto max-w-2xl py-3 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={!canGoBack}
          className={cn(
            "font-mono text-[12px] uppercase tracking-wider px-4 py-3 rounded border border-line text-strong min-w-[88px] min-h-[44px]",
            !canGoBack && "opacity-30 cursor-not-allowed",
          )}
        >
          Back
        </button>
        <span
          className="flex-1 text-center font-mono text-[10px] text-muted uppercase tracking-widest"
          aria-hidden
        >
          {stepIndex + 1} / {total}
        </span>
        <button
          type="button"
          onClick={isLast ? onFinish : onNext}
          disabled={!nextReady}
          title={secondaryTitle}
          className={cn(
            "font-mono text-[12px] uppercase tracking-wider px-5 py-3 rounded bg-bronze text-ground min-w-[100px] min-h-[44px]",
            !nextReady && "opacity-40 cursor-not-allowed",
          )}
        >
          {primaryLabel}
        </button>
      </div>
      {/* Founder screenshot 2026-08-18 — caption used to render only when
          !nextReady, so answering a question shrank the footer by ~24px
          and the Back/Next buttons jumped up. Always reserve the slot;
          swap text vs. an invisible spacer so height is constant. */}
      <p
        className="mx-auto max-w-2xl pb-3 -mt-1 text-center text-[11px] italic"
        aria-hidden={nextReady}
      >
        <span className={nextReady ? "invisible text-muted" : "text-muted"}>
          {nextReady ? " " : secondaryTitle || " "}
        </span>
      </p>
    </div>
  );
}

/**
 * Wizard primitives — see dev/design-briefs/2026-08-17-intake-visual-craft.md
 * for the earlier quiet-form iteration; the founder redirect 2026-08-18
 * moved intake to wizard mode. PictogramTile + CalibrationHintDisclosure
 * + isGateUnsafe survived the redirect. SectionMonogram and StickyTopProgress
 * were the quiet-form section header + progress-under-header; the wizard
 * uses WizardProgress / WizardFooter instead. `large: true` renders the
 * pictogram at the wizard's screen-center size.
 */
function PictogramTile({ kind, large }: { kind: "wall" | "freestand" | "walk"; large?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-md border border-line bg-line-soft/30 flex-shrink-0 flex items-center justify-center",
        large ? "w-24 h-24" : "w-14 h-14",
      )}
      aria-hidden
    >
      <div style={{ transform: large ? "scale(2)" : "scale(1)", transformOrigin: "center" }}>
        {kind === "wall" ? (
          <div className="relative w-8 h-10">
            <span className="absolute right-0 top-0 bottom-0 w-[2px] bg-bronze/60 rounded-full" />
            <span className="absolute right-[6px] top-[3px] w-[6px] h-[6px] rounded-full bg-bronze/80" />
            <span className="absolute right-[3px] top-[9px] w-[10px] h-[2px] bg-bronze/60 rounded-full" />
            <span className="absolute right-[7px] top-[10px] w-[2px] h-[24px] bg-bronze/80 rounded-full" />
          </div>
        ) : kind === "freestand" ? (
          <div className="relative w-8 h-10">
            <span className="absolute left-1/2 -translate-x-1/2 top-[3px] w-[6px] h-[6px] rounded-full bg-bronze/80" />
            <span className="absolute left-1/2 -translate-x-1/2 top-[9px] w-[2px] h-[24px] bg-bronze/80 rounded-full" />
            <span className="absolute left-1/2 -translate-x-1/2 top-[33px] w-[16px] h-[2px] bg-bronze/60 rounded-full" />
          </div>
        ) : (
          <div className="relative w-10 h-10">
            <span className="absolute left-[6px] top-[3px] w-[6px] h-[6px] rounded-full bg-bronze/80" />
            <span className="absolute left-[8px] top-[9px] w-[2px] h-[24px] bg-bronze/80 rounded-full" />
            <span className="absolute left-[2px] top-[33px] w-[16px] h-[2px] bg-bronze/60 rounded-full" />
            <span
              className="absolute right-[6px] top-[16px] w-0 h-0"
              style={{
                borderTop: "5px solid transparent",
                borderBottom: "5px solid transparent",
                borderLeft: "6px solid rgba(200, 150, 102, 0.6)",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}


function isGateUnsafe(
  gates: NonNullable<Program["intake"]>["safety_gates"],
  qid: string,
  value: string,
): boolean {
  return (gates ?? []).some((g) => g.question_id === qid && g.unsafe_values.includes(value));
}

// SectionCard + PhysicalTestsGroup were the quiet-form primitives; the
// wizard replaces them with WizardQuestionScreen / WizardPhysicalTestsScreen
// / WizardConsentScreen. Keeping only PictogramTile, CalibrationHintDisclosure,
// and isGateUnsafe as reused primitives.


function formatVars(vars: Record<string, number>): string {
  const parts = Object.entries(vars)
    .filter(([, v]) => v > 0)
    .slice(0, 4)
    .map(([k, v]) => `${k.replace(/_/g, " ")} ≈ ${v}`);
  return parts.length ? parts.join(", ") : "your self-report";
}
