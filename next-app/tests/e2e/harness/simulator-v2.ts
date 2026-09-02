import type { Page } from "@playwright/test";
import { Archetype } from "./archetype";

/**
 * Simulator v2 — fixes the fidelity gaps the engine audit flagged:
 *   1. Seeds real training_maxes for whitelist exercises (back_squat_highbar,
 *      block_pull_midshin, front_squat) so `suggest.ts` has a baseline to
 *      autoreg against.
 *   2. Logs to real `<block_id>:<exercise_id>` keys that match the program's
 *      phase-scheduled blocks — not a synthetic `sim:` block the whitelist
 *      ignores.
 *   3. Routes symptoms via a symptom_scores + derived_state pair per day so
 *      `derived_state` drives the amber/red load reduction path.
 *   4. Simulates Accept flow by directly writing `day_adjustments` when the
 *      archetype's `acceptProposal` probability fires and the day is a red
 *      state.
 *   5. Varies per-set RPE across the 3 sets so `detectRpeDrift` has data.
 */

const TM_EXERCISES = ["back_squat_highbar", "block_pull_midshin", "front_squat"] as const;

// Realistic starting TMs based on Margus's context (intermediate lifter, ~30% under peak).
// These are the anchor for all load prescriptions the engine derives.
const INITIAL_TMS: Record<string, number> = {
  back_squat_highbar: 110,
  block_pull_midshin: 140,
  front_squat: 85,
  deadlift_conventional: 150,
  trap_bar_dl_floor: 145,
};

type ProgramShape = {
  slug: string;
  /** Region ids this program asks about in the morning check. */
  symptom_regions?: string[];
  phases: Array<{ id: string; starts: string; ends?: string | null; blocks: string[] }>;
  blocks: Array<{
    id: string;
    category?: string;
    items?: Array<{ exercise_id?: string | null }>;
    capability_slot?: string;
    slot_drill_count?: number;
  }>;
  /** Flat list of exercise ids that slot-based blocks draw from. */
  drill_library?: string[];
  /** Note the field is `metric_id`, not `id`. */
  retest_metrics?: Array<{ metric_id?: string }>;
  weekly_template?: unknown;
};

async function loadProgramClientSide(page: Page, slug: string): Promise<ProgramShape> {
  return page.evaluate(async (slug) => {
    const res = await fetch(`/data/programs/${slug}.json`);
    return (await res.json()) as ProgramShape;
  }, slug);
}

/**
 * For a given date, resolve which block IDs the schedule wants. Simplified
 * dow-based logic that mirrors src/lib/engine/schedule.ts:
 * - Phase 1 rebuild: Mon/Wed/Thu/Sat reintro; Tue/Fri evaluate in week 2
 * - Phase 2/3/4 main: use weekly_template
 * - Phase 5: Mon Hatch A, Wed pull_heavy, Thu Hatch B
 * For simulator purposes, we approximate: pick the strength blocks from the
 * phase's block list and rotate Mon/Wed/Fri.
 */
/**
 * Shift a persona's calendar date back to the equivalent authored-JSON
 * date. Personas run July 1 → today; program JSONs are authored with
 * fixed 2026-01-XX phase windows. Without this shift, `program.phases.find`
 * returns undefined for every day of the sim → no blocks written →
 * empty artifacts. Mirrors the shifted-phases logic in schedule.ts.
 */
function toAuthoredDate(program: ProgramShape, personaDateISO: string): string {
  const authoredStart = program.phases[0]?.starts;
  if (!authoredStart) return personaDateISO;
  const personaSimStart = (program as unknown as { __simStartDate?: string }).__simStartDate;
  if (!personaSimStart) return personaDateISO;
  const shift = Math.round(
    (new Date(personaSimStart + "T00:00:00").getTime() -
      new Date(authoredStart + "T00:00:00").getTime()) /
      864e5,
  );
  const d = new Date(personaDateISO + "T00:00:00");
  d.setDate(d.getDate() - shift);
  return d.toISOString().slice(0, 10);
}

function pickBlocksForDate(
  program: ProgramShape,
  dateISO: string,
): string[] {
  const authored = toAuthoredDate(program, dateISO);
  const phase = program.phases.find((p) => authored >= p.starts && (!p.ends || authored <= p.ends));
  if (!phase) return [];
  const dow = new Date(dateISO + "T12:00:00Z").getUTCDay();
  // Only train Mon (1) / Wed (3) / Fri (5) — 3-day upper-body-esque split for sim.
  if (dow !== 1 && dow !== 3 && dow !== 5) return [];
  // Mirrors src/lib/engine/schedule.ts:457 — anterior-hip-rebuild is the
  // ONLY program that filters its non-strength blocks out of the day;
  // every other program's scheduled blocks count regardless of category.
  //
  // The simulator applied the strength filter universally, which is the
  // third and final reason persona-mobility and the handstand personas
  // logged nothing across 150 simulated days: all 7 overhead-mobility
  // blocks are `accessory`, so `strengthBlocks` was empty every single
  // day. (The other two: `itemsForBlock` returned [] for slot-based
  // blocks, and the TM gate dropped every non-loadable drill.)
  //
  // `run` blocks stay excluded here — `pickAerobicBlocksForDate` owns
  // those and writes them as `runs[]`, not exercise logs.
  const isHip = program.slug === "anterior-hip-rebuild";
  const candidates = program.blocks.filter((b) => {
    if (!phase.blocks.includes(b.id)) return false;
    const category = b.category ?? "strength";
    if (category === "run") return false;
    return isHip ? category === "strength" : true;
  });
  if (!candidates.length) return [];
  // Alternate by day-of-week: Mon → first, Wed → second, Fri → third.
  const idx = dow === 1 ? 0 : dow === 3 ? 1 : 2;
  const chosen = candidates[idx % candidates.length];
  return [chosen.id];
}

/**
 * Pick aerobic (category "run") blocks scheduled for this date. Distinct
 * from `pickBlocksForDate` which only returns strength blocks. Aerobic
 * programs (engine-builder, rowing-2k-test-prep) log via `runs[]` rather
 * than `exercises`, so the schema layer + retest evaluators need the
 * simulator to write both. Comprehensive audit 2026-08-18 P0-M.
 */
function pickAerobicBlocksForDate(
  program: ProgramShape,
  dateISO: string,
): string[] {
  const authored = toAuthoredDate(program, dateISO);
  const phase = program.phases.find((p) => authored >= p.starts && (!p.ends || authored <= p.ends));
  if (!phase) return [];
  const dow = new Date(dateISO + "T12:00:00Z").getUTCDay();
  // Aerobic cadence: Tue (2) / Thu (4) / Sat (6) — three sessions/week
  // avoiding strength days (Mon/Wed/Fri). Sunday off.
  if (dow !== 2 && dow !== 4 && dow !== 6) return [];
  const aerobicBlocks = program.blocks.filter(
    (b) => phase.blocks.includes(b.id) && b.category === "run",
  );
  if (!aerobicBlocks.length) return [];
  return [aerobicBlocks[dow % aerobicBlocks.length].id];
}

function itemsForBlock(program: ProgramShape, blockId: string): string[] {
  const block = program.blocks.find((b) => b.id === blockId);
  // Slot-based blocks (overhead-mobility: all 7; handstand-walk: 9 of 13)
  // author NO items — their drills are composed per user from
  // `drill_library` at read time. `block.items` is therefore empty and the
  // early return below fired for every one of them, which is why
  // persona-mobility, persona-handstand and persona-handstand-fast logged
  // literally nothing across 150 simulated days. The F9/Batch-25 fix that
  // slug-gated these programs to "log every drill" returned an empty list,
  // so it never did anything.
  //
  // This is an APPROXIMATION, not a port of `composeSlotDrills`: it takes
  // `slot_drill_count` ids off `drill_library`, rotated by a stable hash of
  // the block id so different slots draw different drills. The goal is
  // non-empty, plausibly-shaped artifacts — heatmaps, adherence, history —
  // not fidelity to the engine's real selection.
  if ((!block?.items || block.items.length === 0) && block?.capability_slot) {
    const library = program.drill_library ?? [];
    if (library.length === 0) return [];
    const count = Math.max(1, block.slot_drill_count ?? 2);
    let h = 0;
    for (let i = 0; i < blockId.length; i++) h = (h * 31 + blockId.charCodeAt(i)) >>> 0;
    const offset = h % library.length;
    return Array.from({ length: Math.min(count, library.length) }, (_, i) =>
      library[(offset + i) % library.length],
    );
  }
  if (!block?.items) return [];
  const ids = block.items.map((it) => it.exercise_id).filter((x): x is string => !!x);
  // F9 (Batch 25) — for strength programs we log only TM lifts (the
  // simulator's per-set / RPE / weight logic is TM-anchored). For
  // skill/mobility programs we log EVERY drill in the block so the
  // exercise-log heatmap + adherence math actually reflect the arc.
  // Prior behavior returned [] for HSW / overhead-mobility blocks,
  // which meant persona-handstand's persona-erratic peer had an
  // empty history heatmap. Slug-gate the two catalog programs; falls
  // back to TM_EXERCISES for everything else.
  const skillMobilitySlugs = new Set([
    "handstand-walk",
    "overhead-mobility",
    "first-strict-pullup",
    "muscle-up",
  ]);
  if (skillMobilitySlugs.has(program.slug ?? "")) {
    return ids;
  }
  return ids.filter((x) => TM_EXERCISES.some((t) => t === x));
}

/**
 * Archetypes are program-agnostic: they emit severities against the four hip
 * region keys, because those were the only keys that existed. Programs now
 * declare their own regions, so a gymnastics persona writing `groin_left` would
 * exercise nothing — the check would ask about shoulder and elbow and the
 * simulated history would answer about a groin.
 *
 * Project the archetype's scores positionally onto whatever the program
 * declares, preserving severity (that is what the archetype actually encodes)
 * and dropping keys the program does not ask about. Non-region keys —
 * life_load, morning_stiffness_min, the flags — pass through untouched.
 */
const REGION_KEYS_EMITTED_BY_ARCHETYPES = [
  "low_back",
  "groin_left",
  "buttock_left",
  "shoulder_right",
];

function projectSymptomsOntoProgram(
  symptoms: Record<string, unknown>,
  regions: string[] | undefined,
): Record<string, unknown> {
  if (!regions?.length) return symptoms;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(symptoms)) {
    if (!REGION_KEYS_EMITTED_BY_ARCHETYPES.includes(k)) out[k] = v;
  }
  const severities = REGION_KEYS_EMITTED_BY_ARCHETYPES.map((k) => symptoms[k]).filter(
    (v) => typeof v === "number",
  ) as number[];
  regions.forEach((id, i) => {
    if (severities[i] != null) out[id] = severities[i];
  });
  return out;
}

/**
 * Compute derived_state from symptoms. Mirrors the app's rules:
 * - Any symptom ≥ 6 or life_load ≥ 8 → "red"
 * - Any symptom ≥ 4 or life_load ≥ 5 → "amber"
 * - Otherwise → "green"
 */
function computeDerivedState(sym: Record<string, number | undefined>): "red" | "amber" | "green" {
  // Every numeric key that is not one of the non-region metrics. Was four
  // hardcoded hip keys, which stopped mirroring the app the moment programs
  // could declare their own regions.
  const NON_REGION = new Set(["life_load", "morning_stiffness_min"]);
  const scores = Object.entries(sym)
    .filter(([k, v]) => !NON_REGION.has(k) && typeof v === "number" && (v as number) > 0)
    .map(([, v]) => v as number);
  const lifeLoad = sym.life_load ?? 0;
  if (scores.some((s) => s >= 6) || lifeLoad >= 8) return "red";
  if (scores.some((s) => s >= 4) || lifeLoad >= 5) return "amber";
  return "green";
}

export async function runSimulationV2(
  page: Page,
  opts: {
    archetype: Archetype;
    programSlug: string;
    additionalProgramSlugs?: string[];
    tier?: string;
    /** Seeded into program_states[slug].intake_answers — see Persona.intakeAnswers. */
    intakeAnswers?: Record<string, string>;
    startDate: string;
    days: number;
    snapshotDays: number[];
    screenshotDir: string;
  },
): Promise<{
  archetypeId: string;
  programSlug: string;
  daysSimulated: number;
  finalStore: unknown;
  program: ProgramShape;
}> {
  const {
    archetype,
    programSlug,
    additionalProgramSlugs = [],
    tier,
    intakeAnswers,
    startDate,
    days,
    snapshotDays,
    screenshotDir,
  } = opts;

  await page.clock.install({ time: new Date(startDate + "T08:00:00Z") });
  const program = await loadProgramClientSide(page, programSlug);
  // Stamp the sim's start date on the program object so pickBlocksForDate /
  // pickAerobicBlocksForDate can compute the authored-date shift. Without
  // this the sim's July 1 dates never match programs' authored 2026-01-XX
  // phase windows, so blocks are never picked → empty artifacts.
  (program as unknown as { __simStartDate: string }).__simStartDate = startDate;

  // Seed store with tier + initial TMs + uid so StoreHydrator.syncToSession
  // sees storedUid === sessionUid and doesn't fire resetForNewSession — which
  // is what clears the onboarding-done flag and re-shows the modal.
  const sessionUid = await page.evaluate(() => {
    // Supabase stores its auth session in localStorage under a well-known key.
    // Sniff it once so we can stamp storedUid to match.
    const keys = Object.keys(localStorage).filter((k) => k.startsWith("sb-") && k.endsWith("-auth-token"));
    for (const k of keys) {
      try {
        const raw = localStorage.getItem(k);
        if (!raw) continue;
        const parsed = JSON.parse(raw);
        const uid = parsed?.user?.id ?? parsed?.currentSession?.user?.id;
        if (uid) return uid as string;
      } catch { /* ignore */ }
    }
    return null;
  });
  // Per-program capability baseline seeds. Mirrors what
  // IntakeClient.commit() would have written for the physical_test values
  // of skill / mobility programs. Enables retest cards to render real
  // baseline/current/Δ instead of "— · — · —". Comprehensive audit
  // 2026-08-18 P0-M residual (deferred from Batch 3b).
  const CAPABILITY_SEEDS: Record<string, Record<string, number>> = {
    "handstand-walk": {
      wall_hold_max_seconds: 12,
      freestand_hold_max_seconds: 2,
      walk_distance_max_metres: 0,
    },
    "overhead-mobility": {
      shoulder_flexion_supine_deg: 155,
      ohs_hip_below_knee_cm: -3,
      tgu_hold_max_seconds: 12,
    },
  };
  const capabilitySeed = CAPABILITY_SEEDS[programSlug] ?? {};

  await page.evaluate(
    ({ slug, extras, tier, tms, uid, capabilitySeed, intakeAnswers }) => {
      const raw = localStorage.getItem("program.log.v2");
      const store = raw ? JSON.parse(raw) : {
        version: 2,
        logs: {},
        training_maxes: {},
        cycle: { phase_id: null, cycle_number: 1, week_in_cycle: 1 },
        updated_at: Date.now(),
        scheduled_overrides: {},
        skipped: {},
        dismissed_proposals: {},
      };
      if (store.cycle == null) {
        store.cycle = { phase_id: null, cycle_number: 1, week_in_cycle: 1 };
      }
      const allSlugs = [slug, ...extras];
      const startedAtISO = new Date().toISOString();
      store.user_profile = {
        ...(store.user_profile ?? {}),
        uid: uid ?? store.user_profile?.uid,
        active_program_id: slug,
        active_program_ids: allSlugs,
        active_program_started_at: startedAtISO,
        tier: "beta_forever",
      };
      // Seed program_states for each secondary program too so the
      // implicit phase-shift fallback + tier gating work. Multi-track
      // personas use the primary's started_at for all — approximates a
      // super-admin who added extra tracks the same day.
      for (const extraSlug of extras) {
        store.user_profile.program_states = {
          ...(store.user_profile.program_states ?? {}),
          [extraSlug]: {
            ...(store.user_profile.program_states?.[extraSlug] ?? {}),
            started_at: startedAtISO,
          },
        };
      }
      // Always seed the primary's program_states with started_at so the
      // implicit phase-shift fallback + retest cadence work. Engine
      // delta-2 caught: primary slug's entry had `{tier}` only, no
      // started_at, so week-number math and retest windows started at
      // whatever active_program_started_at fell back to.
      {
        const priorState = store.user_profile.program_states?.[slug] ?? {};
        store.user_profile.program_states = {
          ...(store.user_profile.program_states ?? {}),
          [slug]: {
            ...priorState,
            started_at: priorState.started_at ?? startedAtISO,
            ...(tier ? { tier } : {}),
            ...(Object.keys(capabilitySeed).length
              ? { baseline_capabilities: { ...capabilitySeed } }
              : {}),
            ...(Object.keys(intakeAnswers).length
              ? { intake_answers: { ...intakeAnswers } }
              : {}),
          },
        };
      }
      if (Object.keys(capabilitySeed).length > 0) {
        // capability_profile mirrors baseline at t=0; the daily loop below
        // bumps `measured_value` slowly to simulate real adaptation.
        const nowIso = new Date().toISOString();
        const caps = { ...(store.user_profile.capability_profile ?? {}) };
        for (const [testId, value] of Object.entries(capabilitySeed)) {
          caps[testId] = {
            estimated_level: 1,
            confidence: "physical_test",
            measured_value: value,
            unit: "",
            last_measured_at: nowIso,
          };
        }
        store.user_profile.capability_profile = caps;
      }
      store.training_maxes = { ...store.training_maxes, ...tms };
      store.updated_at = Date.now();
      localStorage.setItem("program.log.v2", JSON.stringify(store));
      // B3: per-program onboarding key. Simulator bypasses the modal for
      // the active program so runSimulationV2 can walk the UI without a
      // blocking overlay.
      localStorage.setItem(`program.onboarding.done.${slug}`, "1");
      // Legacy key — harmless to keep during transition; can drop after
      // one green matrix run confirms every persona seed uses the new key.
      localStorage.setItem("program.onboarding.done", "1");
    },
    { slug: programSlug, extras: additionalProgramSlugs, tier: tier ?? null, tms: INITIAL_TMS, uid: sessionUid, capabilitySeed, intakeAnswers: intakeAnswers ?? {} },
  );

  await page.goto("/");
  await page.waitForLoadState("networkidle");

  if (snapshotDays.includes(0)) {
    await page.screenshot({ path: `${screenshotDir}/day-0.png`, fullPage: true });
  }

  for (let day = 1; day <= days; day++) {
    const target = new Date(new Date(startDate + "T08:00:00Z").getTime() + day * 864e5);
    const dateISO = target.toISOString().slice(0, 10);
    const dow = target.getUTCDay();
    const decision = archetype.logDecision(day, dow);
    const symptoms = projectSymptomsOntoProgram(
      archetype.symptoms(day) as Record<string, unknown>,
      program.symptom_regions,
    );
    const derivedState = computeDerivedState(symptoms as Record<string, number | undefined>);

    const blockIds = pickBlocksForDate(program, dateISO);
    const aerobicBlockIds = pickAerobicBlocksForDate(program, dateISO);
    const factor = archetype.loadFactor(day);
    const baseRpe = archetype.rpeTarget;
    const jitter = archetype.rpeJitter;

    // Synthesize a realistic aerobic run entry per scheduled aerobic block.
    // avg_hr drifts down (day / 30) bpm to simulate real adaptation.
    // Randomised ±3 bpm per session so retest trend lines have realistic
    // noise. Comprehensive audit 2026-08-18 P0-M.
    type SimRun = {
      activity_type: string;
      intensity: string;
      session_type: string;
      minutes: number;
      avg_hr: number;
      max_hr?: number;
      avg_pace_500m_seconds?: number;
      source: string;
    };
    const aerobicRunsForDay: SimRun[] = aerobicBlockIds.flatMap((bid): SimRun[] => {
      const block = program.blocks.find((b) => b.id === bid);
      if (!block) return [];
      const name = (block as unknown as { name?: string }).name?.toLowerCase() ?? "";
      const isRow = /row|erg/.test(name);
      const isBike = /bike|cycle/.test(name);
      const isThreshold = /4×4|4x4|threshold|interval|race/.test(name);
      // Detect 2K-test / test / retest blocks by name so rowing (and
      // engine-builder's retest week) emit a session_type=2k_test run
      // that the primary retest_metrics can trend against. Delta-2 P1
      // 2026-08-19 — rowing 2K time retest never populated because sim
      // only produced z2 + threshold runs.
      const is2kTest = /2k[\s_-]?test|retest\b/.test(name) && programSlug === "rowing-2k-test-prep";
      const activity = isRow ? "row" : isBike ? "cycle" : "run";
      if (is2kTest) {
        // Baseline 500m pace ~130s (7:00 2K = 105s/500m; slower baselines
        // land at 130-140s). Adaptation over sim days: pace drops
        // ~0.15s / day for a consistent user. Total time = pace × 4.
        const pace = Math.max(95, 130 - Math.floor(day * 0.15));
        const total = pace * 4;
        return [{
          activity_type: "row",
          intensity: "hard",
          session_type: "2k_test",
          minutes: Math.round(total / 60),
          avg_hr: 175 + Math.round((Math.random() - 0.5) * 4),
          max_hr: 190,
          avg_pace_500m_seconds: pace,
          source: "manual",
        }];
      }
      if (isThreshold) {
        return [{
          activity_type: activity,
          intensity: "hard",
          session_type: "threshold",
          minutes: 32,
          avg_hr: 165 + Math.round((Math.random() - 0.5) * 6),
          max_hr: 178,
          source: "manual",
        }];
      }
      const avgHr = 140 - Math.floor(day / 30) + Math.round((Math.random() - 0.5) * 6);
      return [{
        activity_type: activity,
        intensity: "easy",
        session_type: "z2",
        minutes: 45,
        avg_hr: avgHr,
        avg_pace_500m_seconds: isRow ? 125 + Math.round((Math.random() - 0.5) * 8) : undefined,
        source: "manual",
      }];
    });

    await page.evaluate(
      ({ dateISO, decision, blockIds, aerobicRuns, symptoms, derivedState, note, tms, factor, baseRpe, jitter, itemsByBlock, slug, extras, uid, tier, intakeAnswers, partialSession, dismissToday, acceptRate, retestToday, retestMetricIds, moveToday }) => {
        // Read local, or start from a valid baseline if StoreHydrator wiped
        // us during the initial page.goto (see: reset-on-fresh-mount bug).
        const raw = localStorage.getItem("program.log.v2");
        const store = raw
          ? JSON.parse(raw)
          : {
              version: 2,
              logs: {},
              training_maxes: {},
              cycle: { phase_id: null, cycle_number: 1, week_in_cycle: 1 },
              updated_at: Date.now(),
              scheduled_overrides: {},
              skipped: {},
              dismissed_proposals: {},
            };
        // Re-stamp user_profile/tms/program every day — the reset can wipe
        // user_profile.active_program_id even when logs survive.
        // Preserve multi-track state: primary + extras, deduped.
        const allSlugs = Array.from(new Set([slug, ...(extras ?? [])]));
        store.user_profile = {
          ...(store.user_profile ?? {}),
          uid: uid ?? store.user_profile?.uid,
          active_program_id: slug,
          active_program_ids: allSlugs,
          active_program_started_at:
            store.user_profile?.active_program_started_at ?? new Date().toISOString(),
          tier: "beta_forever",
        };
        // Re-stamp the per-program state too. This restored `tier` ONLY, so
        // whenever the reset above wiped localStorage, `started_at` and
        // `intake_answers` were gone for good — the daily loop rebuilt
        // user_profile from defaults and never put them back. Every persona's
        // final store holds exactly `tier` and `graduated_at` under
        // program_states[slug] and nothing else, which is the fingerprint of
        // this line.
        //
        // `started_at` is what `shiftedPhases` uses to remap authored phase
        // anchors onto the user's real start date. Five programs carry anchors
        // that are already in the past, so losing it graduated personas early:
        // persona-pullup-elbow reached "YOU FINISHED" on day 21 of an
        // eight-week arc. The audits have been reading graduation screens where
        // they should have been reading mid-program sessions.
        {
          const priorState = store.user_profile.program_states?.[slug] ?? {};
          store.user_profile.program_states = {
            ...(store.user_profile.program_states ?? {}),
            [slug]: {
              ...priorState,
              started_at:
                priorState.started_at ?? store.user_profile.active_program_started_at,
              ...(tier ? { tier } : {}),
              ...(Object.keys(intakeAnswers ?? {}).length && !priorState.intake_answers
                ? { intake_answers: { ...intakeAnswers } }
                : {}),
            },
          };
        }
        store.training_maxes = { ...tms, ...store.training_maxes };
        if (store.cycle == null) {
          store.cycle = { phase_id: null, cycle_number: 1, week_in_cycle: 1 };
        }

        // Always write morning check + symptoms.
        store.logs = store.logs ?? {};
        if (!store.logs[dateISO]) {
          store.logs[dateISO] = { date: dateISO, exercises: {}, symptoms, notes: note ?? undefined };
        } else {
          store.logs[dateISO].symptoms = symptoms;
          if (note) store.logs[dateISO].notes = note;
        }
        store.logs[dateISO].derived_state = derivedState;

        // Write aerobic runs when the archetype logs today. Skipped days
        // don't produce runs (matches the "skip" behavior for strength).
        if (decision === "log" && aerobicRuns.length > 0) {
          store.logs[dateISO].runs = [
            ...(store.logs[dateISO].runs ?? []),
            ...aerobicRuns,
          ];
        }

        // Skip → mark skipped, done.
        if (decision === "skip") {
          store.skipped = store.skipped ?? {};
          store.skipped[dateISO] = { blocks: [], reason: "sim: archetype skipped" };
        } else if (decision === "log") {
          // Some sessions stop partway. Before 2026-08-24 the simulator
          // only ever wrote `{done: true, 3 full sets}` or nothing at all —
          // across 15 personas and 1,064 days it produced 117 fully-logged
          // exercises and ZERO partial ones. So no artifact had ever shown a
          // session in progress: not the "Continue — <lift>, set 4" CTA, not
          // an exercise in the Held state, not the rail's logged/total
          // counter at anything but 0 or full, not the set pips. Roughly one
          // logging day in five now stops after 1-2 sets.
          const partialToday = partialSession;
          for (const blockId of blockIds) {
            const items = itemsByBlock[blockId] ?? [];
            for (const exId of items) {
              const key = `${blockId}:${exId}`;
              const tm = tms[exId];
              // Second gate that silenced the skill/mobility personas: an
              // exercise with no training max was skipped outright. Mobility
              // drills and skill holds have no TM by nature — the app logs
              // them reps-only (SetView's `isLoadable === false` path), so
              // the simulator does too. Fixing `itemsForBlock` alone left
              // persona-mobility at zero because every composed drill fell
              // through here.
              const loadable = !!tm;
              const stopAfter = partialToday ? 1 + (Math.random() < 0.5 ? 0 : 1) : 3;
              // 3 sets with varied RPE — simulate drift where relevant.
              const sets = [0, 1, 2].map((i) => {
                if (i >= stopAfter) {
                  // An unlogged row of a session that was left mid-way.
                  return { weight_kg: null, reps: null, rpe: null };
                }
                const rpe = Math.max(4, Math.min(10, baseRpe + i * 0.5 + (Math.random() - 0.5) * jitter));
                return {
                  weight_kg: loadable ? Math.round(tm * 0.85 * factor * 2) / 2 : null,
                  reps: loadable ? 5 : 8 + Math.round((factor - 1) * 10),
                  rpe: Math.round(rpe * 2) / 2,
                };
              });
              store.logs[dateISO].exercises[key] = { done: !partialToday, sets };
            }
          }

          // Ignored proposals. `dismissed_proposals` was initialised to
          // `{}` and never written — including for persona-erratic, whose
          // declared focus is literally "Skipped sessions, dismissed
          // proposals, re-plan behavior". An archetype with a low accept
          // rate should leave a trail of ignores, and Record's proposal
          // history should have something to render.
          // Accept proposal on red/amber days per archetype probability.
          if (derivedState !== "green" && Math.random() < 0.7) {
            store.day_adjustments = store.day_adjustments ?? {};
            store.day_adjustments[dateISO] = {
              load_multiplier: derivedState === "red" ? 0.9 : 0.95,
              reason: `sim: ${derivedState} state`,
              source: "notes",
              accepted_at: Date.now(),
            };
          }
        }

        // Ignored proposals + their audit trail. `dismissed_proposals` and
        // `proposal_history` were both initialised to empty and never
        // written — including for persona-erratic, whose declared focus is
        // "Skipped sessions, dismissed proposals, re-plan behavior". Kept
        // OUTSIDE the `decision === "log"` branch on purpose: ignoring a
        // proposal is something you do on a day you skipped, too, and
        // gating it on training made the write vanishingly rare.
        // Contraindications — movements the user has told the app to keep
        // out of their sessions. Real state: `addContraindication` writes
        // it, `/report` and the record export read it, and it was empty in
        // 17 of 17 personas, so neither reader had ever been captured with
        // anything in it.
        //
        // Written here, in the daily loop, rather than in `seedStore`.
        // Seeded before sign-in it did not survive: the account's remote
        // copy carries no contraindications and wins the `updated_at`
        // comparison on hydration, so the key was silently dropped every
        // run — the H1 pattern, presenting as "my seeding does nothing".
        if (!Array.isArray(store.contraindications) || store.contraindications.length === 0) {
          store.contraindications = [
            {
              id: "sim-contra-1",
              label: "Overhead pressing",
              reason: "sim: shoulder flagged during intake",
              added_at: Date.now(),
            },
          ];
        }

        // The `derivedState !== "green"` gate left `dismissed_proposals`
        // and `proposal_history` empty in 12 of 17 personas: an athlete
        // who trains steadily never goes amber, so the engine never
        // proposed anything for them to ignore, and Record's proposal
        // history had nothing to render for most of the fleet. Green days
        // still surface tm_bump and tier_advance proposals, and ignoring
        // one is a normal thing to do — the state gate was modelling
        // symptom severity, not whether a proposal existed.
        if (dismissToday && acceptRate < 1) {
          store.dismissed_proposals = store.dismissed_proposals ?? {};
          store.dismissed_proposals[dateISO] = Array.from(
            new Set([...(store.dismissed_proposals[dateISO] ?? []), "day-adjustment"]),
          );
          store.proposal_history = [
            ...(store.proposal_history ?? []),
            {
              id: "day-adjustment",
              kind: "day_adjustment_soften",
              outcome: "ignored",
              at: new Date(dateISO + "T18:00:00Z").getTime(),
              date: dateISO,
            },
          ];
        }

        // Retest readings every ~2 weeks, drifting toward the metric's
        // direction of improvement. `retest_readings` is read by ten source
        // files — the retest cards, the non-responder classifier, the
        // HERITAGE cluster chips — and was empty in every persona bundle,
        // so none of that surface had ever been captured with data.
        if (retestToday && retestMetricIds.length > 0) {
          const priorCount = (store.retest_readings ?? []).length;
          store.retest_readings = [
            ...(store.retest_readings ?? []),
            ...retestMetricIds.map((metricId, i) => ({
              metric_id: metricId,
              // Monotonic drift so trend lines have a slope. Absolute values
              // are not meant to be physiologically right — the point is
              // that two readings exist and differ.
              value: Math.round((100 + priorCount * 3 + i * 7) * 10) / 10,
              observed_at: dateISO,
              program_slug: slug,
            })),
          ];
        }

        // One moved session per arc. `scheduled_overrides` was initialised
        // to `{}` and never populated, so Plan's "Moved-in session" row and
        // the move-reason line had never been rendered by any persona.
        if (moveToday && Object.keys(store.scheduled_overrides ?? {}).length === 0) {
          store.scheduled_overrides = store.scheduled_overrides ?? {};
          store.scheduled_overrides[dateISO] = {
            blocks: blockIds,
            reason: `moved from ${new Date(new Date(dateISO + "T00:00:00").getTime() - 864e5)
              .toISOString()
              .slice(0, 10)}`,
          };
        }

        store.updated_at = Date.now();
        localStorage.setItem("program.log.v2", JSON.stringify(store));
      },
      {
        dateISO,
        decision,
        blockIds,
        aerobicRuns: aerobicRunsForDay,
        symptoms: symptoms as Record<string, number>,
        derivedState,
        note: archetype.sessionNote(day, dow),
        tms: INITIAL_TMS,
        factor,
        baseRpe,
        jitter,
        itemsByBlock: Object.fromEntries(
          blockIds.map((bid) => [bid, itemsForBlock(program, bid)]),
        ),
        slug: programSlug,
        extras: additionalProgramSlugs,
        uid: sessionUid,
        tier: tier ?? null,
        intakeAnswers: intakeAnswers ?? {},
        // ~1 logging day in 5 stops mid-session. Seeded off the day index
        // rather than Math.random so a persona's partial days are stable
        // across re-runs and an auditor comparing two sweeps isn't reading
        // noise.
        // Every Wednesday session stops partway. Tied to day-of-week
        // rather than the day index because training only happens
        // Mon/Wed/Fri — `day % 5` rarely landed on a training day at all,
        // so partial sessions stayed nearly as rare as before.
        partialSession: dow === 3,
        // Deterministic ignore trail on ~1 in 5 non-green days. Seeded off
        // the day index, not the archetype's accept rate: gating on
        // `random() > acceptProposal` meant the 0.9-accept archetypes
        // produced almost no ignores, and `dismissed_proposals` stayed the
        // empty object it had always been. Personas with no non-green days
        // (the overperformer) still correctly produce none.
        dismissToday: day % 5 === 0,
        acceptRate: archetype.acceptProposal,
        retestToday: day > 0 && day % 14 === 0,
        retestMetricIds: (program.retest_metrics ?? [])
          .map((m) => m.metric_id)
          .filter((x): x is string => !!x)
          .slice(0, 2),
        // A single moved session, roughly a third of the way in. Expressed
        // as a WINDOW rather than an exact day because training only lands
        // on Mon/Wed/Fri — pinning it to `day === days/3` silently produced
        // nothing whenever that day was a rest day. The write itself
        // no-ops once one override exists.
        moveToday: day >= Math.floor(days / 3) && day < Math.floor(days / 3) + 7 && blockIds.length > 0,
      },
    );

    // Capability-profile drift for skill/mobility programs. Every ~7 days
    // bump measured_value in the direction of the retest_metric's target.
    // Comprehensive audit 2026-08-18 P0-M residual.
    if (day % 7 === 0 && Object.keys(capabilitySeed).length > 0) {
      const cycleAvgFactor = archetype.loadFactor(day);
      await page.evaluate(
        ({ dateISO, slug, cycleAvgFactor }) => {
          const raw = localStorage.getItem("program.log.v2");
          if (!raw) return;
          const store = JSON.parse(raw);
          const caps = store.user_profile?.capability_profile ?? {};
          // Positive-improvement direction per known test. All skill/mobility
          // metrics currently seeded improve as they get bigger except
          // (a) OHS depth (bigger positive = deeper hip below knee), (b)
          // wall_hold_max_seconds gets larger too. All monotonically up.
          const bumpBy: Record<string, number> = {
            wall_hold_max_seconds: 1.2,
            freestand_hold_max_seconds: 0.4,
            walk_distance_max_metres: 0.5,
            shoulder_flexion_supine_deg: 1.0,
            ohs_hip_below_knee_cm: 0.3,
            tgu_hold_max_seconds: 1.5,
          };
          const nowIso = new Date().toISOString();
          for (const testId of Object.keys(caps)) {
            const delta = bumpBy[testId];
            if (delta == null) continue;
            const cap = caps[testId];
            const scaled = delta * cycleAvgFactor;
            cap.measured_value = Math.round((cap.measured_value + scaled) * 10) / 10;
            cap.last_measured_at = nowIso;
          }
          store.user_profile.capability_profile = caps;
          store.updated_at = Date.now();
          localStorage.setItem("program.log.v2", JSON.stringify(store));
          void slug;
          void dateISO;
        },
        { dateISO, slug: programSlug, cycleAvgFactor },
      );
    }

    // Cycle-end acceptance simulation (v3): at every 28-day boundary from
    // program start, roll archetype.acceptProposal. If accepted, apply a TM
    // decision informed by the archetype's loadFactor:
    //   >1.02 → overperformer: bump squat +5, pull +7.5, deadlift +7.5
    //   ~1.00 → consistent green cycle: same +5/+7.5/+7.5
    //   0.95-1.00 → amber cycle: hold TM
    //   <0.95 → red cycle: TM -10%
    if (decision === "log" && day % 28 === 0 && day > 0) {
      const cycleAvgFactor = archetype.loadFactor(day);
      const accept = Math.random() < archetype.acceptProposal;
      if (accept) {
        await page.evaluate(
          ({ cycleAvgFactor, dateISO }) => {
            const raw = localStorage.getItem("program.log.v2");
            if (!raw) return;
            const store = JSON.parse(raw);
            const tms = store.training_maxes ?? {};
            const round = (v: number, step = 0.5) => Math.round(v / step) * step;
            const isSquat = (id: string) => id.includes("squat");
            let anyChanged = false;
            for (const [lift, currentTM] of Object.entries(tms) as [string, number][]) {
              let newTM = currentTM;
              if (cycleAvgFactor > 1.02) {
                newTM = round(currentTM + (isSquat(lift) ? 5 : 7.5));
              } else if (cycleAvgFactor >= 0.98) {
                newTM = round(currentTM + (isSquat(lift) ? 5 : 7.5));
              } else if (cycleAvgFactor >= 0.95) {
                // hold
              } else {
                newTM = round(currentTM * 0.9);
              }
              if (newTM !== currentTM) {
                tms[lift] = newTM;
                anyChanged = true;
              }
            }
            if (anyChanged) {
              store.training_maxes = tms;
              store.tm_history = store.tm_history ?? [];
              store.tm_history.push({ date: dateISO, snapshot: { ...tms }, source: "sim:cycle_end_accept" });
              store.updated_at = Date.now();
              localStorage.setItem("program.log.v2", JSON.stringify(store));
            }
          },
          { cycleAvgFactor, dateISO },
        );
      }
    }

    await page.clock.setFixedTime(target);

    if (snapshotDays.includes(day)) {
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      await page.screenshot({ path: `${screenshotDir}/day-${day}.png`, fullPage: true });
    }
  }

  const finalStoreRaw = await page.evaluate(() => localStorage.getItem("program.log.v2"));
  return {
    archetypeId: archetype.id,
    programSlug,
    daysSimulated: days,
    finalStore: finalStoreRaw ? JSON.parse(finalStoreRaw) : null,
    program,
  };
}
