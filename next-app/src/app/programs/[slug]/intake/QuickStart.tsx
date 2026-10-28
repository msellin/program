"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cardClass } from "@/components/ui/Card";
import { LevelLadder } from "@/components/program/LevelLadder";
import { useStore } from "@/lib/useStore";
import { cn, iso as isoDate } from "@/lib/utils";
import {
  evaluateSafetyGates,
  warningsAcknowledged,
  acknowledgementsToPersist,
} from "@/lib/engine/safety-gates";
import type { Program, ProgramManifestEntry } from "@/lib/schemas";
import {
  applyNoneOfThese,
  levelCopy,
  outcomeLine,
  planStats,
  rowOptions,
  safetyQuestions,
  stripTierPrefix,
} from "./quick-start-model";

type Step = "level" | "safety" | "plan";
const STEPS: Step[] = ["level", "safety", "plan"];

/**
 * Quick start: Level -> Safety -> Your plan. The default for any program with
 * `plan_tiers`. It persists the same `program_states[slug]` shape the full
 * intake does (tier, consents, consents_at, intake_answers incl. safety
 * acknowledgements, started_at, baseline_training_maxes, phase_shift_days), so
 * Today / Plan / the engine cannot tell the two paths apart. What it leaves out
 * is physical tests and the "about you" questions; the full intake stays one
 * tap away for those.
 */
export function QuickStart({
  slug,
  program,
  manifestEntry,
}: {
  slug: string;
  program: Program;
  manifestEntry: ProgramManifestEntry | null;
}) {
  const router = useRouter();
  const tiers = useMemo(() => program.plan_tiers ?? [], [program]);
  const intake = program.intake;
  const [step, setStep] = useState<Step>("level");
  const [tierId, setTierId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [acks, setAcks] = useState<Record<string, boolean>>({});
  const [days, setDays] = useState<string | null>(null);
  const [consents, setConsents] = useState<Record<string, boolean>>({});
  const [committing, setCommitting] = useState(false);

  const activeProgramId = useStore((s) => s.store.user_profile?.active_program_id);
  const activeProgramIds = useStore((s) => s.store.user_profile?.active_program_ids);
  const setActiveProgram = useStore((s) => s.setActiveProgram);
  const addSecondaryProgram = useStore((s) => s.addSecondaryProgram);
  const setProgramTier = useStore((s) => s.setProgramTier);
  const writeGenerationTrace = useStore((s) => s.writeGenerationTrace);
  const clearIntakeDraft = useStore((s) => s.clearIntakeDraft);

  const safetyQs = useMemo(() => safetyQuestions(program), [program]);
  const gateEval = useMemo(
    () => evaluateSafetyGates(intake?.safety_gates ?? [], answers),
    [intake?.safety_gates, answers],
  );
  const tier = tiers.find((t) => t.id === tierId) ?? null;
  const stats = tier ? planStats(program, tier, manifestEntry?.duration_weeks) : null;
  const chosenDays = days ?? (stats ? String(stats.defaultDays) : null);

  const safetyAnswered = safetyQs.every(
    (q) => !q.required || (answers[q.id] != null && answers[q.id] !== ""),
  );
  const safetyOk =
    safetyAnswered && !gateEval.blocker && warningsAcknowledged(gateEval.warnings, acks);
  const consentItems = intake?.consent ?? [];
  const consentsOk = consentItems.every((c) => (c.required ? consents[c.id] === true : true));

  const setAnswer = (id: string, v: string) => setAnswers((a) => ({ ...a, [id]: v }));

  const commit = () => {
    if (!tier || !safetyOk || !consentsOk) return;
    setCommitting(true);
    const finalAnswers: Record<string, string> = { ...answers };
    if (chosenDays) finalAnswers.days_per_week = chosenDays;

    setProgramTier(slug, tier.id);
    const s = { ...useStore.getState().store };
    const profile = { ...(s.user_profile ?? {}) };
    const states = { ...(profile.program_states ?? {}) };

    // Phase shift: same two rules as the full intake (see IntakeClient.commit):
    // an authored target-test date wins, otherwise align phase 0 to today.
    let phaseShiftDays: number | undefined;
    const authoredStart = program.phases[0]?.starts;
    if (program.slug !== "anterior-hip-rebuild" && authoredStart && /^\d{4}-\d{2}-\d{2}$/.test(authoredStart)) {
      const authored = new Date(authoredStart + "T00:00:00").getTime();
      const today = new Date(isoDate(new Date()) + "T00:00:00").getTime();
      const shift = Math.round((today - authored) / 864e5);
      if (Number.isFinite(shift) && shift !== 0) phaseShiftDays = shift;
    }

    states[slug] = {
      ...(states[slug] ?? {}),
      tier: tier.id,
      consents: { ...consents },
      consents_at: new Date().getTime(),
      intake_answers: {
        ...finalAnswers,
        ...acknowledgementsToPersist(gateEval.warnings, acks),
      },
      started_at: new Date().toISOString(),
      baseline_training_maxes: { ...(s.training_maxes ?? {}) },
      ...(phaseShiftDays != null ? { phase_shift_days: phaseShiftDays } : {}),
    };
    if (consents.consent_symptom_data && profile.consent_symptom_data_at == null) {
      profile.consent_symptom_data_at = new Date().getTime();
    }
    profile.program_states = states;
    s.user_profile = profile;
    useStore.setState({ store: s });

    const hasOtherActive = (activeProgramIds ?? (activeProgramId ? [activeProgramId] : [])).some(
      (x) => x !== slug,
    );
    if (hasOtherActive) addSecondaryProgram(slug);
    else setActiveProgram(slug);

    const uid = profile.uid ?? "guest";
    writeGenerationTrace(slug, {
      strategy: program.generation_strategy ?? "correlated_tier",
      tier_id: tier.id,
      seed: `${uid}:${slug}:${isoDate(new Date())}`,
      input_snapshot: {
        intake_answers: finalAnswers,
        physical_test_results: {},
        tier_id: tier.id,
        capability_profile: profile.capability_profile ?? null,
      },
    });

    clearIntakeDraft(slug);
    try {
      window.localStorage.removeItem(`terav.intake.draft.${slug}`);
      window.localStorage.setItem(`program.onboarding.done.${slug}`, "1");
    } catch {
      // ignore
    }
    router.push("/");
  };

  const idx = STEPS.indexOf(step);
  const fullHref = `/programs/${slug}/intake/?mode=full`;

  return (
    <div className="mx-auto max-w-2xl space-y-5 pt-4 pb-8">
      {/* The app header already has Back (leaves the page); this one steps
          within the quick start, so it says so (V-07: never two "Back"s). */}
      {idx > 0 ? (
        <button
          type="button"
          onClick={() => setStep(STEPS[idx - 1])}
          className="inline-flex items-center gap-1 text-small text-slate hover:text-ink"
        >
          <ChevronLeft size={14} />
          Previous step
        </button>
      ) : null}

      <p className="text-eyebrow uppercase tracking-wider text-muted">
        Step {idx + 1} of {STEPS.length}
      </p>

      {step === "level" ? (
        <section className="space-y-3" aria-labelledby="qs-level">
          <h1 id="qs-level" className="text-h1 tracking-tight text-strong">
            Where are you today?
          </h1>
          <ul role="radiogroup" aria-labelledby="qs-level" className="space-y-1.5">
            {tiers.map((t) => {
              const { title, reading } = levelCopy(program, t);
              const picked = tierId === t.id;
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={picked}
                    onClick={() => {
                      setTierId(t.id);
                      setDays(null);
                    }}
                    className={cn(
                      "w-full text-left rounded-lg border px-3 py-2 flex items-start gap-2 min-h-[52px]",
                      picked ? "border-bronze bg-bronze/10" : "border-line bg-surface hover:border-slate/40",
                    )}
                  >
                    <Dot on={picked} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-small font-semibold text-strong">{title}</span>
                      {reading ? (
                        <span className="block text-caption text-muted mt-0.5">{reading}</span>
                      ) : null}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <Button block disabled={!tier} onClick={() => setStep("safety")}>
            Continue
          </Button>
        </section>
      ) : null}

      {step === "safety" ? (
        <section className="space-y-3" aria-labelledby="qs-safety">
          <h1 id="qs-safety" className="text-h1 tracking-tight text-strong">
            Anything we should know?
          </h1>
          <p className="text-small text-muted">
            Answer for the last few months. This is screening, not a diagnosis.
          </p>
          <Button variant="secondary" block onClick={() => setAnswers((a) => applyNoneOfThese(safetyQs, a))}>
            None of these
          </Button>
          <ul className="space-y-2">
            {safetyQs.map((q) => {
              const value = answers[q.id];
              const unsafe =
                value != null &&
                (intake?.safety_gates ?? []).some(
                  (g) => g.question_id === q.id && g.unsafe_values.includes(value),
                );
              return (
                <li key={q.id} className={cn(cardClass(), "space-y-2 !p-3")}>
                  <p id={`qs-q-${q.id}`} className="text-small text-strong">
                    {q.label}
                  </p>
                  <div role="radiogroup" aria-labelledby={`qs-q-${q.id}`} className="flex flex-wrap gap-2">
                    {rowOptions(q).map((o) => {
                      const picked = value === o.value;
                      return (
                        <button
                          key={o.value}
                          type="button"
                          role="radio"
                          aria-checked={picked}
                          onClick={() => setAnswer(q.id, o.value)}
                          className={cn(
                            "text-small px-4 py-2 rounded-lg border min-h-[44px]",
                            picked && unsafe
                              ? "border-red/50 bg-red/10 text-red"
                              : picked
                                ? "border-bronze bg-bronze/15 text-strong"
                                : "border-line bg-surface text-strong hover:border-slate/40",
                          )}
                        >
                          {o.label}
                        </button>
                      );
                    })}
                  </div>
                </li>
              );
            })}
          </ul>

          {gateEval.blocker ? (
            <div role="alert" className={cn(cardClass({ status: "red" }), "space-y-1")}>
              <p className="flex items-center gap-2 text-small font-semibold text-red">
                <ShieldAlert size={16} aria-hidden />
                {gateEval.blocker.title}
              </p>
              <p className="text-small text-ink leading-relaxed">{gateEval.blocker.body}</p>
            </div>
          ) : null}
          {gateEval.warnings.map((w) => (
            <div key={w.question_id} className={cn(cardClass({ status: "amber" }), "space-y-2")}>
              <p className="text-small font-semibold text-strong">{w.title}</p>
              <p className="text-small text-ink leading-relaxed">{w.body}</p>
              <label className="flex items-start gap-3 cursor-pointer min-h-[44px]">
                <input
                  type="checkbox"
                  checked={acks[w.question_id] === true}
                  onChange={(e) => setAcks((a) => ({ ...a, [w.question_id]: e.target.checked }))}
                  className="mt-1 w-5 h-5 flex-shrink-0"
                />
                <span className="text-small text-strong">{w.acknowledge_label}</span>
              </label>
            </div>
          ))}

          <Button block disabled={!safetyOk} onClick={() => setStep("plan")}>
            Continue
          </Button>
        </section>
      ) : null}

      {step === "plan" && tier && stats ? (
        <section className="space-y-4" aria-labelledby="qs-plan">
          <header className="space-y-1">
            <h1 id="qs-plan" className="text-h1 tracking-tight text-strong">
              Your plan
            </h1>
            <p className="text-small text-muted">
              {manifestEntry?.name ?? slug.replace(/-/g, " ")}
            </p>
          </header>

          <LevelLadder
            levels={tiers.map((t) => ({ id: t.id, label: levelCopy(program, t).title }))}
            activeId={tier.id}
          />

          <div className="grid grid-cols-3 gap-2">
            <Stat label="Weeks" value={stats.weeks != null ? String(stats.weeks) : "—"} />
            <Stat label="Minutes" value={stats.minutes ?? "—"} />
            <div className={cn(cardClass(), "!p-3")}>
              <p id="qs-days" className="text-eyebrow uppercase tracking-wider text-muted">
                Days / week
              </p>
              <div role="radiogroup" aria-labelledby="qs-days" className="mt-1 flex flex-wrap gap-1">
                {stats.dayOptions.map((d) => (
                  <button
                    key={d}
                    type="button"
                    role="radio"
                    aria-checked={chosenDays === d}
                    onClick={() => setDays(d)}
                    className={cn(
                      "min-w-[32px] min-h-[32px] rounded-md border text-small",
                      chosenDays === d
                        ? "border-bronze bg-bronze/15 text-strong"
                        : "border-line bg-surface text-muted",
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <p className="text-small text-ink leading-relaxed">{outcomeLine(tier, manifestEntry?.duration_weeks)}</p>

          {consentItems.length ? (
            <ul className="space-y-1">
              {consentItems.map((c) => (
                <li key={c.id}>
                  <label className="flex items-start gap-3 cursor-pointer min-h-[44px] py-1">
                    <input
                      type="checkbox"
                      checked={consents[c.id] === true}
                      onChange={(e) => setConsents((cs) => ({ ...cs, [c.id]: e.target.checked }))}
                      className="mt-1 w-5 h-5 flex-shrink-0"
                    />
                    <span className="text-small text-strong leading-relaxed">{c.label}</span>
                  </label>
                </li>
              ))}
            </ul>
          ) : null}

          <Button block onClick={commit} disabled={committing || !consentsOk}>
            {committing ? "Starting…" : "Start"}
          </Button>
        </section>
      ) : null}

      <p className="pt-2 text-center">
        <Link href={fullHref} className="text-caption text-muted underline underline-offset-2 hover:text-ink">
          Detailed setup (about 5 min)
        </Link>
      </p>
    </div>
  );
}

function Dot({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "mt-0.5 w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center",
        on ? "border-bronze bg-bronze" : "border-line",
      )}
    >
      {on ? <Check size={11} className="text-ground" strokeWidth={3} /> : null}
    </span>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className={cn(cardClass(), "!p-3")}>
      <p className="text-eyebrow uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1 text-h3 text-strong">{value}</p>
    </div>
  );
}

// Re-exported so the tier label rule has a single import site for tests.
export { stripTierPrefix };
