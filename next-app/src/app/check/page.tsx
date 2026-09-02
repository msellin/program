"use client";

/**
 * Cut D · Morning check redesign · 2026-08-21.
 *
 * See dev/active/cut-d-check/brief.md for the full design rationale.
 *
 * Compressed from 12-14 form controls (sliders + checkboxes) into a
 * tap-only pattern:
 *  - 4-option tap-scale per region (None / Mild / Notable / Severe)
 *  - Flag chip toggles for red-flag signals (night pain, gait change,
 *    painful click)
 *  - Segmented pickers for morning stiffness bucket + life load bucket
 *  - Free-text field kept for outside-training context
 *  - Live verdict card renders as user taps (green/amber/red)
 *  - Prefill-from-yesterday if within 7 days
 *  - Sticky Save CTA (keyboard-aware for iOS)
 *
 * derive() logic unchanged — backward compatible with existing store
 * schema. Every bucket value maps to a numeric 0-10 field on Symptoms.
 *
 * R-rules preserved:
 * - R2 bronze CTA-only (verdict rail is state color, region tap-scale
 *   uses strong-ink underline + amber/red escalation for Notable/Severe)
 * - R5 no gamification (no "N-day check streak", no XP)
 * - R7 rehab-safe (verdict body copy uses "hold" and "back off", not
 *   alarmist language — matches landing FLAG-2a "surface a banner"
 *   softening)
 * - R8 no autonomous score-hero (verdict is state + threshold-cited,
 *   not a composite score)
 */

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/useStore";
import { today as todayISO } from "@/lib/utils";
import type { Symptoms } from "@/lib/schemas";
import { EngineReadsNotesHint } from "@/components/workout/EngineReadsNotesHint";
import { StickyCta } from "@/components/ui/StickyCta";
import { CheckRegionRow, BUCKET_TO_VALUE } from "@/components/check/CheckRegionRow";
import { CheckFlagChip } from "@/components/check/CheckFlagChip";
import { CheckSelectorRow } from "@/components/check/CheckSelectorRow";
import { CheckLiveVerdict, type CheckState } from "@/components/check/CheckLiveVerdict";
import { regionsForProgram, type SymptomRegion } from "@/lib/symptom-regions";
import { deriveState, reasonForState } from "@/lib/symptom-state";
import { loadProgram } from "@/lib/data-loader";

/**
 * Regions come from the active program's `symptom_regions[]` (see
 * `lib/symptom-regions.ts`). What stood here were three hardcoded label maps —
 * HIP_REGIONS, SKILL_REGIONS, GENERIC_REGIONS — all writing to the SAME four
 * storage keys, chosen by a `SKILL_PROGRAMS` set.
 *
 * Two things were wrong with that. `SKILL_PROGRAMS` contained
 * "muscle-up-first-rep", a slug that does not exist (the real one is
 * "muscle-up"), so muscle-up never got the skill labels at all. And
 * SKILL_REGIONS relabelled `groin_left` as "Wrist" — a wrist score written into
 * the groin key. The label was remapped; the storage was not. That silently
 * poisons the multi-year symptom record the History view exists to build.
 */

const DEFAULT_VALUES: Symptoms = {
  groin_left: 0,
  low_back: 0,
  buttock_left: 0,
  shoulder_right: 0,
  morning_stiffness_min: 0,
  click_present: false,
  click_painful: false,
  night_pain: false,
  gait_change: false,
  outside_training: "",
  life_load: 0,
};

const STIFFNESS_OPTIONS = [
  { label: "None", value: 0 },
  { label: "<15 min", value: 10 },
  { label: "15-30", value: 20 },
  { label: ">30", value: 45 },
];

const LIFELOAD_OPTIONS = [
  { label: "Fresh", value: 0 },
  { label: "Normal", value: 4 },
  { label: "Cooked", value: 8 },
];

/**
 * Return the most-recent stored symptoms if within `withinDays` — used
 * for the prefill-from-yesterday flow. Days beyond the window are stale
 * (people's symptoms shift too much to auto-populate).
 */
function findRecentSymptoms(
  logs: Record<string, { symptoms?: Symptoms | null } | undefined>,
  todayStr: string,
  withinDays = 7,
): { date: string; symptoms: Symptoms } | null {
  if (!logs) return null;
  const t = new Date(todayStr + "T00:00:00");
  const dates = Object.keys(logs)
    .filter((d) => d < todayStr)
    .sort()
    .reverse();
  for (const d of dates) {
    const day = logs[d];
    if (!day?.symptoms) continue;
    const diff = Math.round(
      (t.getTime() - new Date(d + "T00:00:00").getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diff > 0 && diff <= withinDays) {
      return { date: d, symptoms: day.symptoms };
    }
  }
  return null;
}

function shortDate(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-GB", { weekday: "short" });
}

export default function CheckPage() {
  const router = useRouter();
  const hydrated = useStore((s) => s.hydrated);
  const saveDay = useStore((s) => s.setDaySymptoms);
  const today = todayISO();

  // Selectors: read scalar/null so Zustand equality doesn't allocate a new
  // reference each render (Batch 37 React #185 trap).
  const storedSymptomsRaw = useStore((s) => s.store.logs[today]?.symptoms);
  const storedDerivedRaw = useStore((s) => s.store.logs[today]?.derived_state);
  const logs = useStore((s) => s.store.logs);
  const activeSlug = useStore((s) => s.store.user_profile?.active_program_id);

  // The two hip-labral red flags (shortened stride, painful click) stay
  // program-scoped rather than universal: asking a pull-up user about gait
  // change is the same category error the region maps made. Flags are not yet
  // program-declared the way regions now are — tracked in the audit doc.
  const isHip = activeSlug === "anterior-hip-rebuild";
  const [REGIONS, setRegions] = useState<SymptomRegion[]>(() => regionsForProgram(null));
  useEffect(() => {
    if (!activeSlug) return;
    let live = true;
    void loadProgram(activeSlug)
      .then((p) => { if (live) setRegions(regionsForProgram(p)); })
      // A failed program load must not blank the check — fall back to the
      // historical four rather than rendering a form with no regions.
      .catch(() => { if (live) setRegions(regionsForProgram(null)); });
    return () => { live = false; };
  }, [activeSlug]);

  const [values, setValues] = useState<Symptoms>({ ...DEFAULT_VALUES });
  const [initialised, setInitialised] = useState(false);
  const [prefilledFrom, setPrefilledFrom] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (initialised || !hydrated) return;
    if (storedSymptomsRaw) {
      // Already saved today — populate from stored + show as saved state
      setValues({ ...DEFAULT_VALUES, ...storedSymptomsRaw });
      setSaved(true);
    } else {
      // Prefill from a recent check (<= 7 days). Users can hit "Start
      // fresh" if their state materially changed.
      const recent = findRecentSymptoms(logs ?? {}, today);
      if (recent) {
        setValues({ ...DEFAULT_VALUES, ...recent.symptoms });
        setPrefilledFrom(recent.date);
      }
    }
    setInitialised(true);
  }, [hydrated, storedSymptomsRaw, logs, today, initialised]);

  const state: CheckState = useMemo(() => deriveState(values), [values]);
  const reason = useMemo(() => reasonForState(values, state), [values, state]);

  if (!hydrated) return <div className="mt-8 text-sm text-muted">Loading…</div>;

  // Return to Day after saving (2026-08-24). The check is entered from
  // Day, has no back affordance of its own, and its whole payoff — "today's
  // prescription adjusts to this read" — is only visible on Day. Staying
  // put also hid the confirmation: the ✓ line renders at the top of the
  // form while the CTA is pinned to the bottom, so on a phone the only
  // feedback for a save was three words changing on the button under your
  // thumb. The `saved` state below still matters for re-entering /check
  // later the same day.
  const save = () => {
    const derived = deriveState(values);
    saveDay(today, values, derived);
    setSaved(true);
    setPrefilledFrom(null);
    router.push("/");
  };

  const startFresh = () => {
    setValues({ ...DEFAULT_VALUES });
    setPrefilledFrom(null);
  };

  const updateNumber = (key: keyof Symptoms, v: number) => {
    setValues({ ...values, [key]: v });
    setSaved(false);
  };
  const toggleBool = (key: keyof Symptoms) => {
    setValues({ ...values, [key]: !values[key] });
    setSaved(false);
  };

  return (
    <div className="space-y-5 pt-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-strong">Morning check</h1>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.06em] text-muted">
          {new Date(today + "T12:00:00").toLocaleDateString("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "short",
          })}
        </p>
      </header>

      {/* Live verdict — renders as user taps; matches R2 (state color, not bronze) */}
      <CheckLiveVerdict state={state} reason={reason} />

      {saved ? (
        <p className="text-[13px] text-green flex items-center gap-1.5">
          <span aria-hidden>✓</span>
          Saved. Today&apos;s prescription adjusts to this read.
        </p>
      ) : prefilledFrom ? (
        <div className="rounded border border-line-soft bg-surface px-3 py-2 flex items-baseline justify-between gap-3 text-[12px]">
          <span className="text-muted">
            Prefilled from {shortDate(prefilledFrom)}&apos;s check.
          </span>
          <button
            type="button"
            onClick={startFresh}
            className="min-h-[44px] py-2 font-mono text-[11px] uppercase tracking-[0.06em] text-slate hover:text-ink motion-reduce:transition-none transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-bronze focus-visible:outline-offset-2 rounded"
          >
            Start fresh
          </button>
        </div>
      ) : null}

      {/* REGIONS */}
      <section aria-labelledby="check-regions">
        <div className="flex items-center gap-2 mb-2">
          <span aria-hidden className="h-px flex-none w-5" style={{ background: "linear-gradient(to left, var(--color-line-soft), transparent)" }} />
          <span id="check-regions" className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted">Regions</span>
          <span aria-hidden className="h-px flex-1" style={{ background: "linear-gradient(to right, var(--color-line-soft), transparent)" }} />
        </div>
        <div className="rounded-md border border-line-soft bg-surface px-3">
          {REGIONS.map((r) => (
            <CheckRegionRow
              key={r.id}
              label={r.label}
              value={(values[r.id as keyof Symptoms] as number) ?? 0}
              onChange={(v) => updateNumber(r.id as keyof Symptoms, v)}
            />
          ))}
        </div>
      </section>

      {/* FLAGS */}
      <section aria-labelledby="check-flags">
        <div className="flex items-center gap-2 mb-2">
          <span aria-hidden className="h-px flex-none w-5" style={{ background: "linear-gradient(to left, var(--color-line-soft), transparent)" }} />
          <span id="check-flags" className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted">Flags · tap to toggle</span>
          <span aria-hidden className="h-px flex-1" style={{ background: "linear-gradient(to right, var(--color-line-soft), transparent)" }} />
        </div>
        <div className="flex flex-wrap gap-2">
          <CheckFlagChip
            label="Woke me at night"
            on={values.night_pain ?? false}
            onToggle={() => toggleBool("night_pain")}
          />
          {isHip ? (
            <CheckFlagChip
              label="Shortened stride"
              on={values.gait_change ?? false}
              onToggle={() => toggleBool("gait_change")}
            />
          ) : null}
          {isHip ? (
            <CheckFlagChip
              label="Painful click"
              on={(values.click_present && values.click_painful) ?? false}
              onToggle={() => {
                const on = !((values.click_present ?? false) && (values.click_painful ?? false));
                setValues({ ...values, click_present: on, click_painful: on });
                setSaved(false);
              }}
            />
          ) : null}
        </div>
      </section>

      {/* CONTEXT */}
      <section aria-labelledby="check-context">
        <div className="flex items-center gap-2 mb-2">
          <span aria-hidden className="h-px flex-none w-5" style={{ background: "linear-gradient(to left, var(--color-line-soft), transparent)" }} />
          <span id="check-context" className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted">Context</span>
          <span aria-hidden className="h-px flex-1" style={{ background: "linear-gradient(to right, var(--color-line-soft), transparent)" }} />
        </div>
        <div className="rounded-md border border-line-soft bg-surface px-3">
          <CheckSelectorRow
            label="Morning stiffness"
            options={STIFFNESS_OPTIONS}
            value={values.morning_stiffness_min ?? 0}
            onChange={(v) => updateNumber("morning_stiffness_min", v)}
          />
          <CheckSelectorRow
            label="Life load"
            options={LIFELOAD_OPTIONS}
            value={values.life_load ?? 0}
            onChange={(v) => updateNumber("life_load", v)}
          />
        </div>
      </section>

      {/* OUTSIDE TRAINING */}
      <div>
        <label
          htmlFor="outside-training"
          className="block text-[14px] font-medium text-strong mb-2"
        >
          Outside training yesterday
        </label>
        <input
          id="outside-training"
          type="text"
          value={values.outside_training ?? ""}
          onChange={(e) => {
            setValues({ ...values, outside_training: e.target.value });
            setSaved(false);
          }}
          placeholder="e.g. 90 min padel, poor sleep"
          className="block w-full text-[15px] px-3 py-3 min-h-[44px] border border-line-strong rounded-md bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-slate/40 focus:border-slate break-words [overflow-wrap:anywhere]"
        />
        <EngineReadsNotesHint variant="check" />
      </div>

      {/* Sticky Save — keyboard-aware primitive lifts above iOS keyboard */}
      <StickyCta keyboardAware>
        <button
          type="button"
          onClick={save}
          className="w-full inline-flex items-center justify-center gap-2 bg-bronze text-ground rounded-lg py-3 min-h-[52px] font-semibold text-[15px] hover:bg-bronze-hover active:bg-bronze-active motion-reduce:transition-none transition-colors shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_1px_2px_rgba(0,0,0,0.4)] focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-strong focus-visible:outline-offset-2"
        >
          {saved ? "Update check" : "Save check"} <span aria-hidden>→</span>
        </button>
      </StickyCta>
    </div>
  );
}
