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
import { useStore } from "@/lib/useStore";
import { today as todayISO } from "@/lib/utils";
import type { Symptoms } from "@/lib/schemas";
import { EngineReadsNotesHint } from "@/components/workout/EngineReadsNotesHint";
import { StickyCta } from "@/components/ui/StickyCta";
import { CheckRegionRow, BUCKET_TO_VALUE } from "@/components/check/CheckRegionRow";
import { CheckFlagChip } from "@/components/check/CheckFlagChip";
import { CheckSelectorRow } from "@/components/check/CheckSelectorRow";
import { CheckLiveVerdict, type CheckState } from "@/components/check/CheckLiveVerdict";

// Program-variant region label maps. Store keys remain the same
// (backward compatible with the /check/hip subroute and every
// downstream consumer of Symptoms).
const HIP_REGIONS: { key: keyof Symptoms; label: string; lat?: "L" | "R" }[] = [
  { key: "groin_left", label: "Groin", lat: "L" },
  { key: "low_back", label: "Low back" },
  { key: "buttock_left", label: "Buttock", lat: "L" },
  { key: "shoulder_right", label: "Shoulder", lat: "R" },
];
const SKILL_REGIONS: { key: keyof Symptoms; label: string; lat?: "L" | "R" }[] = [
  { key: "shoulder_right", label: "Shoulder" },
  { key: "groin_left", label: "Wrist" },
  { key: "buttock_left", label: "Muscle soreness" },
  { key: "low_back", label: "Low back" },
];
const GENERIC_REGIONS: { key: keyof Symptoms; label: string; lat?: "L" | "R" }[] = [
  { key: "low_back", label: "Low back" },
  { key: "groin_left", label: "Any joint pain" },
  { key: "buttock_left", label: "Muscle soreness" },
  { key: "shoulder_right", label: "Shoulder / upper body" },
];
const SKILL_PROGRAMS = new Set(["handstand-walk", "muscle-up-first-rep", "overhead-mobility"]);

/**
 * Derive green/amber/red state from a symptoms snapshot. Unchanged from
 * pre-Cut-D logic — every Cut D bucket resolves to the same numeric
 * field so downstream engine consumers see no schema difference.
 */
function derive(s: Symptoms): CheckState {
  const peak = Math.max(
    s.groin_left ?? 0,
    s.low_back ?? 0,
    s.buttock_left ?? 0,
    s.shoulder_right ?? 0,
  );
  const life = s.life_load ?? 0;
  if (
    s.night_pain ||
    s.gait_change ||
    (s.click_present && s.click_painful) ||
    peak > 5 ||
    life >= 8
  ) {
    return "red";
  }
  if (peak >= 4 || (s.morning_stiffness_min ?? 0) > 30 || life >= 5) {
    return "amber";
  }
  return "green";
}

/**
 * Human-readable "why" line for the verdict card. Names the specific
 * threshold that fired so the user understands the state — matches R7
 * (rehab-safe: no fragility tone, no diagnosis language).
 */
function reasonFor(s: Symptoms, state: CheckState): string {
  const peak = Math.max(
    s.groin_left ?? 0,
    s.low_back ?? 0,
    s.buttock_left ?? 0,
    s.shoulder_right ?? 0,
  );
  const life = s.life_load ?? 0;
  const stiff = s.morning_stiffness_min ?? 0;
  if (state === "red") {
    if (s.night_pain) return "Red flag: night pain woke you.";
    if (s.gait_change) return "Red flag: gait change (shortened stride).";
    if (s.click_present && s.click_painful) return "Red flag: painful clicking.";
    if (peak > 5) return `A symptom score is above 5/10.`;
    if (life >= 8) return `Life load is at the ceiling — cooked.`;
    return "A red-flag signal fired.";
  }
  if (state === "amber") {
    if (peak >= 4) return `A symptom score is between 4-5/10.`;
    if (stiff > 30) return `Morning stiffness over 30 minutes.`;
    if (life >= 5) return `Life load in the middle-high range.`;
    return "A threshold crossed to amber.";
  }
  return "Progress load — nothing above 3/10 and no flags.";
}

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
  const hydrated = useStore((s) => s.hydrated);
  const saveDay = useStore((s) => s.setDaySymptoms);
  const today = todayISO();

  // Selectors: read scalar/null so Zustand equality doesn't allocate a new
  // reference each render (Batch 37 React #185 trap).
  const storedSymptomsRaw = useStore((s) => s.store.logs[today]?.symptoms);
  const storedDerivedRaw = useStore((s) => s.store.logs[today]?.derived_state);
  const logs = useStore((s) => s.store.logs);
  const activeSlug = useStore((s) => s.store.user_profile?.active_program_id);

  const isHip = activeSlug === "anterior-hip-rebuild";
  const isSkill = activeSlug ? SKILL_PROGRAMS.has(activeSlug) : false;
  const REGIONS = isHip ? HIP_REGIONS : isSkill ? SKILL_REGIONS : GENERIC_REGIONS;

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

  const state: CheckState = useMemo(() => derive(values), [values]);
  const reason = useMemo(() => reasonFor(values, state), [values, state]);

  if (!hydrated) return <div className="mt-8 text-sm text-muted">Loading…</div>;

  const save = () => {
    const derived = derive(values);
    saveDay(today, values, derived);
    setSaved(true);
    setPrefilledFrom(null);
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
              key={r.key}
              label={r.label}
              lat={r.lat}
              value={(values[r.key] as number) ?? 0}
              onChange={(v) => updateNumber(r.key, v)}
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
