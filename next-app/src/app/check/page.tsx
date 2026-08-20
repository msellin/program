"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/lib/useStore";
import { today as todayISO } from "@/lib/utils";
import type { Symptoms } from "@/lib/schemas";
import { EngineReadsNotesHint } from "@/components/workout/EngineReadsNotesHint";
import { StickyCta } from "@/components/ui/StickyCta";
import { ChevronRight } from "lucide-react";

// Hip-program regions — laterality + specific joints.
const HIP_REGIONS: { key: keyof Symptoms; label: string; lat?: "L" | "R" }[] = [
  { key: "groin_left", label: "Groin", lat: "L" },
  { key: "low_back", label: "Low back" },
  { key: "buttock_left", label: "Buttock", lat: "L" },
  { key: "shoulder_right", label: "Shoulder", lat: "R" },
];
// Skill programs (handstand, muscle-up) authoritatively drive their adaptive
// engine off wrist + shoulder scores. Reuse existing store keys for
// forward-compat with hip data — the labels change but the persisted field
// names don't.
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

type State = "green" | "amber" | "red";

function derive(s: Symptoms): State {
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
  )
    return "red";
  if (peak >= 4 || (s.morning_stiffness_min ?? 0) > 30 || life >= 5) return "amber";
  return "green";
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

export default function CheckPage() {
  const hydrated = useStore((s) => s.hydrated);
  const saveDay = useStore((s) => s.setDaySymptoms);
  const today = todayISO();
  // Select primitives so re-renders only fire when the actual value changes
  const storedSymptoms = useStore((s) => s.store.logs[today]?.symptoms ?? null);
  const storedDerived = useStore((s) => s.store.logs[today]?.derived_state ?? null);
  const activeSlug = useStore((s) => s.store.user_profile?.active_program_id);
  const isHip = activeSlug === "anterior-hip-rebuild";
  const isSkill = activeSlug ? SKILL_PROGRAMS.has(activeSlug) : false;
  const REGIONS = isHip ? HIP_REGIONS : isSkill ? SKILL_REGIONS : GENERIC_REGIONS;

  const [values, setValues] = useState<Symptoms>({ ...DEFAULT_VALUES });
  const [state, setState] = useState<State | null>(null);
  const [initialised, setInitialised] = useState(false);

  useEffect(() => {
    if (initialised || !hydrated) return;
    if (storedSymptoms) setValues({ ...DEFAULT_VALUES, ...storedSymptoms });
    if (storedDerived) setState(storedDerived);
    setInitialised(true);
  }, [hydrated, storedSymptoms, storedDerived, initialised]);

  if (!hydrated) return <div className="mt-8 text-sm text-muted">Loading…</div>;

  const save = () => {
    const derived = derive(values);
    saveDay(today, values, derived);
    setState(derived);
  };

  return (
    <div className="space-y-6 pt-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-strong">Morning check</h1>
        <p className="mt-1 text-sm text-muted">Judged by how you feel the morning AFTER training, not during.</p>
      </header>

      <div className="rounded border border-line bg-surface divide-y divide-line-soft">
        {REGIONS.map((r) => (
          <SliderRow
            key={r.key}
            label={r.label}
            lat={r.lat}
            value={(values[r.key] as number) ?? 0}
            min={0}
            max={10}
            step={1}
            onChange={(v) => setValues({ ...values, [r.key]: v })}
          />
        ))}
        {isHip ? (
          <CheckBoxRow
            label="Clicking present"
            value={values.click_present ?? false}
            onChange={(v) => setValues({ ...values, click_present: v })}
          />
        ) : null}
        {isHip ? (
          <CheckBoxRow
            label="Clicking is painful"
            value={values.click_painful ?? false}
            onChange={(v) => setValues({ ...values, click_painful: v })}
          />
        ) : null}
        <CheckBoxRow
          label="Woke me at night"
          value={values.night_pain ?? false}
          onChange={(v) => setValues({ ...values, night_pain: v })}
        />
        {isHip ? (
          <CheckBoxRow
            label="Shortened my stride when running"
            value={values.gait_change ?? false}
            onChange={(v) => setValues({ ...values, gait_change: v })}
          />
        ) : null}
        <SliderRow
          label="Morning stiffness"
          suffix="min"
          value={values.morning_stiffness_min ?? 0}
          min={0}
          max={90}
          step={5}
          onChange={(v) => setValues({ ...values, morning_stiffness_min: v })}
        />
        <SliderRow
          label="Life load (0=fresh, 10=cooked)"
          value={values.life_load ?? 0}
          min={0}
          max={10}
          step={1}
          onChange={(v) => setValues({ ...values, life_load: v })}
        />
        <div className="px-3 py-3">
          <label
            htmlFor="outside-training"
            className="block text-[14px] mb-1"
          >
            Outside training yesterday
          </label>
          <input
            id="outside-training"
            type="text"
            value={values.outside_training ?? ""}
            onChange={(e) => setValues({ ...values, outside_training: e.target.value })}
            placeholder="e.g. 90 min padel, long hike, poor sleep"
            className="block w-full max-w-full text-sm px-2 py-2 min-h-[44px] border border-line rounded bg-surface focus:outline-none focus:ring-2 focus:ring-slate/40 focus:border-slate break-words [overflow-wrap:anywhere]"
          />
          <EngineReadsNotesHint variant="check" />
        </div>
      </div>

      {state ? <Verdict state={state} /> : null}

      {/* Batch 36 Step 14 — sticky Save now uses the StickyCta primitive
          per v1.1.1 §2.14, with keyboard-aware repositioning per mobile-
          UX P0-7. When the "Outside training" text input is focused on
          iOS Safari, StickyCta lifts the CTA above the on-screen
          keyboard via visualViewport fallback. CTA string updated to
          match §2.13 vocabulary (arrow suffix). */}
      <StickyCta keyboardAware>
        <button
          type="button"
          onClick={save}
          className="w-full inline-flex items-center justify-center gap-2 bg-bronze text-ground rounded-lg py-3 font-semibold text-[15px] hover:bg-bronze-hover active:bg-bronze-active transition-colors min-h-[44px] shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_1px_2px_rgba(0,0,0,0.4)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-strong focus-visible:outline-offset-2"
        >
          Save check
          <ChevronRight size={16} strokeWidth={2.25} aria-hidden />
        </button>
      </StickyCta>
    </div>
  );
}

function SliderRow({
  label,
  lat,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string;
  lat?: "L" | "R";
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  onChange: (v: number) => void;
}) {
  const ariaLabel = `${lat ? `${lat === "L" ? "Left" : "Right"} ` : ""}${label}${suffix ? " in " + suffix : ""}`;
  const inputId = `sym-${label.replace(/\s+/g, "-").toLowerCase()}${lat ? `-${lat.toLowerCase()}` : ""}`;
  return (
    <div className="grid grid-cols-[1fr_50px] items-center gap-3 px-3 py-3">
      <div>
        <label htmlFor={inputId} className="flex items-center gap-2 text-sm">
          {lat ? (
            <span
              className={`font-mono text-[10px] font-bold px-1 rounded text-surface ${lat === "L" ? "bg-lat-left" : "bg-lat-right"}`}
              aria-hidden="true"
            >
              {lat}
            </span>
          ) : null}
          {label}
        </label>
        <input
          id={inputId}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label={ariaLabel}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={`${value}${suffix ? " " + suffix : " out of " + max}`}
          className="w-full mt-1 accent-bronze min-h-[44px]"
        />
      </div>
      <span className="font-mono text-[15px] font-semibold text-right" aria-hidden="true">
        {value}
        {suffix ? <span className="ml-0.5 text-[11px] text-muted">{suffix}</span> : null}
      </span>
    </div>
  );
}

function CheckBoxRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2.5 px-3 py-3 text-sm cursor-pointer">
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 accent-ink"
      />
      {label}
    </label>
  );
}

function Verdict({ state }: { state: State }) {
  const label =
    state === "green"
      ? "Green — good to push today"
      : state === "amber"
        ? "Amber — hold the load, repeat the week"
        : "Red — back off two steps; the engine will trim the top set";
  const bg =
    state === "green"
      ? "bg-green/10 border-l-green"
      : state === "amber"
        ? "bg-amber/10 border-l-amber"
        : "bg-red/10 border-l-red";
  return (
    <div className={`border-l-4 rounded-r px-3 py-3 text-sm ${bg}`}>
      <p className="font-semibold text-[14px]">
        {label}
      </p>
      <p className="mt-1 text-[14px] text-muted">
        Today&apos;s suggested loads on the Today tab are already adjusted for this reading.
      </p>
    </div>
  );
}
