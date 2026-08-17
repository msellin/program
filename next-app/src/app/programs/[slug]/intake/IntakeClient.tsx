"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ShieldAlert, Info, Check } from "lucide-react";
import { loadProgram, loadProgramManifest } from "@/lib/data-loader";
import { useStore } from "@/lib/useStore";
import { cn } from "@/lib/utils";
import { inferTier } from "@/lib/engine/intake-tier";
import type {
  Program,
  IntakeQuestion,
  PhysicalTest,
  ProgramManifestEntry,
} from "@/lib/schemas";

type Props = { slug: string };

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

  const requiredQuestions = useMemo(
    () => questions.filter((q) => q.required),
    [questions],
  );
  const requiredAnsweredCount = useMemo(() => {
    return requiredQuestions.filter((q) => {
      const v = answers[q.id];
      return v != null && v !== "";
    }).length;
  }, [requiredQuestions, answers]);
  const requiredQuestionsAnswered = requiredAnsweredCount === requiredQuestions.length;

  const requiredConsentsGiven = useMemo(() => {
    return consentItems.every((c) => (c.required ? consents[c.id] === true : true));
  }, [consentItems, consents]);

  const canProceed = requiredQuestionsAnswered && requiredConsentsGiven && !blocker;

  const inferred = useMemo(() => {
    if (!program) return null;
    return inferTier(program, slug, answers, testResults);
  }, [program, slug, answers, testResults]);

  const chosenTierId = overrideTier ?? inferred?.tier_id ?? null;

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
      <div className="space-y-5 pt-4 pb-8">
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

  return (
    <div className="space-y-5 pt-4 pb-8">
      <Link href={backHref} className="inline-flex items-center gap-1 text-[13px] text-slate hover:text-ink">
        <ChevronLeft size={14} />
        Back to program
      </Link>

      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-strong">
          Intake — {manifestEntry?.name ?? slug.replace(/-/g, " ")}
        </h1>
        <p className="text-sm text-muted leading-relaxed">
          Short questions so the program starts at the right level. Everything is stored locally
          on your account — not shared with anyone.
        </p>
      </header>

      {blocker ? (
        <div className="rounded border border-red/40 bg-red/10 p-4 space-y-2">
          <p className="font-semibold text-red flex items-center gap-2">
            <ShieldAlert size={16} />
            {blocker.title}
          </p>
          <p className="text-[13px] text-strong">{blocker.body}</p>
        </div>
      ) : null}

      {screening.length ? (
        <QuestionGroup
          title="Screening"
          hint="Safety gates — a few no-questions before we start."
          questions={screening}
          answers={answers}
          setAnswer={(qid, v) => setAnswers((a) => ({ ...a, [qid]: v }))}
        />
      ) : null}

      {skill.length ? (
        <QuestionGroup
          title="Where you are now"
          hint="Skill-level self report. Best guess is fine — you'll re-test on Day 3."
          questions={skill}
          answers={answers}
          setAnswer={(qid, v) => setAnswers((a) => ({ ...a, [qid]: v }))}
        />
      ) : null}

      {about.length ? (
        <QuestionGroup
          title="About you"
          hint="Context for the adaptive engine."
          questions={about}
          answers={answers}
          setAnswer={(qid, v) => setAnswers((a) => ({ ...a, [qid]: v }))}
        />
      ) : null}

      {physicalTests.length ? (
        <PhysicalTestsGroup
          tests={physicalTests}
          results={testResults}
          setResult={(id, n) => setTestResults((r) => ({ ...r, [id]: n }))}
        />
      ) : null}

      {consentItems.length ? (
        <section className="rounded border border-line bg-surface p-4 space-y-3">
          <header className="flex items-baseline justify-between">
            <h2 className="text-[14px] font-semibold text-strong">Consent</h2>
            <span className="text-[11px] font-mono text-muted uppercase tracking-wider">required</span>
          </header>
          <ul className="space-y-3">
            {consentItems.map((c) => (
              <li key={c.id}>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consents[c.id] === true}
                    onChange={(e) => setConsents((cs) => ({ ...cs, [c.id]: e.target.checked }))}
                    className="mt-0.5 flex-shrink-0"
                  />
                  <span className="text-[13px] text-strong leading-relaxed">{c.label}</span>
                </label>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="sticky bottom-2 pt-2">
        {/* Progress indicator — reduces the "how much more?" anxiety persona A
            flagged. Shows required-only count so optional physical tests don't
            block the finish line perception. */}
        <div className="flex items-center gap-2">
          <div className="h-1.5 flex-1 rounded-full bg-line-soft overflow-hidden">
            <div
              className="h-full rounded-full bg-bronze transition-[width]"
              style={{
                width: `${requiredQuestions.length ? Math.round((requiredAnsweredCount / requiredQuestions.length) * 100) : 100}%`,
              }}
              aria-hidden
            />
          </div>
          <span className="font-mono text-[11px] text-muted flex-shrink-0 min-w-[42px] text-right">
            {requiredAnsweredCount} / {requiredQuestions.length}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setReviewing(true)}
          disabled={!canProceed}
          className="w-full inline-flex items-center justify-center gap-1.5 font-mono text-[12px] uppercase tracking-wider px-4 py-3 rounded bg-bronze text-ground hover:bg-bronze/90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {blocker
            ? "Can't continue — see message above"
            : !requiredQuestionsAnswered
              ? `Answer ${requiredQuestions.length - requiredAnsweredCount} more to continue`
              : !requiredConsentsGiven
                ? "Tick the consent items to continue"
                : "See recommended tier →"}
        </button>
      </div>
    </div>
  );
}

function QuestionGroup({
  title,
  hint,
  questions,
  answers,
  setAnswer,
}: {
  title: string;
  hint: string;
  questions: IntakeQuestion[];
  answers: Record<string, string>;
  setAnswer: (qid: string, v: string) => void;
}) {
  return (
    <section className="rounded border border-line bg-surface p-4 space-y-3">
      <header>
        <h2 className="text-[14px] font-semibold text-strong">{title}</h2>
        <p className="text-[12px] text-muted mt-0.5">{hint}</p>
      </header>
      <ul className="space-y-4">
        {questions.map((q) => (
          <li key={q.id} className="space-y-2">
            <p className="text-sm font-medium text-strong">
              {q.label}
              {q.required ? <span className="text-red ml-1">*</span> : null}
            </p>
            {q.help ? <p className="text-[12px] text-muted">{q.help}</p> : null}
            {q.type === "select" && q.options ? (
              <div className="flex flex-wrap gap-1.5">
                {q.options.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setAnswer(q.id, opt.value)}
                    className={cn(
                      "text-[13px] px-3 py-2 rounded border min-h-[40px]",
                      answers[q.id] === opt.value
                        ? "border-bronze bg-bronze/15 text-strong"
                        : "border-line bg-surface text-strong hover:border-slate/40",
                    )}
                  >
                    {opt.label ?? opt.value.replace(/_/g, " ")}
                  </button>
                ))}
              </div>
            ) : null}
            {q.type === "boolean" ? (
              <div className="flex gap-2">
                {["true", "false"].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setAnswer(q.id, v)}
                    className={cn(
                      "text-[13px] px-4 py-2 rounded border min-h-[40px]",
                      answers[q.id] === v
                        ? "border-bronze bg-bronze/15 text-strong"
                        : "border-line bg-surface text-strong hover:border-slate/40",
                    )}
                  >
                    {v === "true" ? "Yes" : "No"}
                  </button>
                ))}
              </div>
            ) : null}
            {q.type === "number" ? (
              <input
                type="number"
                inputMode="decimal"
                min={q.min}
                max={q.max}
                step={q.step}
                value={answers[q.id] ?? ""}
                onChange={(e) => setAnswer(q.id, e.target.value)}
                placeholder={q.unit}
                className="w-full text-sm px-2 py-2 min-h-[44px] border border-line rounded bg-surface focus:outline-none focus:ring-2 focus:ring-slate/40 focus:border-slate"
              />
            ) : null}
            {q.type === "text" ? (
              // Question ids ending in "_date" render as a proper date input so
              // downstream phase-shift math never has to parse free-form strings.
              q.id.endsWith("_date") ? (
                <input
                  type="date"
                  value={answers[q.id] ?? ""}
                  onChange={(e) => setAnswer(q.id, e.target.value)}
                  min={new Date().toISOString().slice(0, 10)}
                  className="w-full text-sm px-2 py-2 min-h-[44px] border border-line rounded bg-surface focus:outline-none focus:ring-2 focus:ring-slate/40 focus:border-slate"
                />
              ) : (
                <input
                  type="text"
                  value={answers[q.id] ?? ""}
                  onChange={(e) => setAnswer(q.id, e.target.value)}
                  className="w-full text-sm px-2 py-2 min-h-[44px] border border-line rounded bg-surface focus:outline-none focus:ring-2 focus:ring-slate/40 focus:border-slate"
                />
              )
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

function PhysicalTestsGroup({
  tests,
  results,
  setResult,
}: {
  tests: PhysicalTest[];
  results: Record<string, number>;
  setResult: (id: string, v: number) => void;
}) {
  return (
    <details className="rounded border border-line bg-surface p-4">
      <summary className="cursor-pointer flex items-center gap-2">
        <Info size={15} className="text-slate flex-shrink-0" />
        <span className="text-[14px] font-semibold text-strong flex-1">
          Physical tests (optional — more precise)
        </span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
          {tests.length} tests
        </span>
      </summary>
      <div className="mt-3 space-y-3">
        <p className="text-[13px] text-muted">
          Doing these is not required. If you do, they override the self-report answers when
          picking your tier. Skip and we use your self-report as a proxy.
        </p>
        <ul className="space-y-3">
          {tests.map((t) => (
            <li key={t.id} className="space-y-1">
              <p className="text-[13px] font-medium text-strong">{t.label}</p>
              {t.instructions ? (
                <p className="text-[11px] text-muted">{t.instructions}</p>
              ) : null}
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  inputMode="decimal"
                  min={t.min}
                  max={t.max}
                  value={results[t.id] ?? ""}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    if (isFinite(n)) setResult(t.id, n);
                  }}
                  className="flex-1 text-sm px-2 py-2 min-h-[44px] border border-line rounded bg-surface focus:outline-none focus:ring-2 focus:ring-slate/40 focus:border-slate"
                />
                <span className="text-[11px] text-muted font-mono w-14 text-right">{t.unit}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}

function formatVars(vars: Record<string, number>): string {
  const parts = Object.entries(vars)
    .filter(([, v]) => v > 0)
    .slice(0, 4)
    .map(([k, v]) => `${k.replace(/_/g, " ")} ≈ ${v}`);
  return parts.length ? parts.join(", ") : "your self-report";
}
