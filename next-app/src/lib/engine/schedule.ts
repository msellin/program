import type { Program, Phase, Block, Store } from "../schemas";

/**
 * Central per-date session routing.
 *
 * Two paths:
 *  - anterior-hip-rebuild: the original hardcoded phase-name routing. Preserved
 *    verbatim to avoid disturbing the personal case that this project started
 *    from.
 *  - Every other program: read `weekly_template` from the program JSON. Two
 *    shapes are supported:
 *      A) `weekly_template.week: Array<{day, session}>` (CSM, Rowing 2K,
 *         anterior-hip when unified) — same layout every week.
 *      B) `weekly_template.week_N: {layout: Array<{day, session, ...}>}`
 *         (Engine Builder) — layout varies per program week.
 *
 * Both Today and Week must consult the same function or they'll disagree.
 */

const DOW_TO_TEMPLATE_IDX = [6, 0, 1, 2, 3, 4, 5] as const;
const HIP_MAIN_PHASE_IDS = new Set([
  "phase_2_cycle_1",
  "phase_3_cycle_2",
  "phase_4_cycles_3_4_test",
]);

const HIP_SLUG = "anterior-hip-rebuild";

/**
 * anterior-hip-specific dates. Kept off the generic path so non-hip programs
 * don't inherit them. Callers that need to render a race/holiday card should
 * gate on `program.slug === HIP_SLUG` first.
 */
const HIP_RACE_DATE = "2026-08-29";
const HIP_HOLIDAY_GAP = { start: "2026-12-21", end: "2027-01-04" };

const DAY_SHORT_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

function shiftIsoDate(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Apply the user's per-program phase_shift_days (set at intake).
 *
 * Two paths:
 *   1. Explicit shift written at intake commit (IntakeClient.tsx computes
 *      it from target_test_date for race-prep programs, or from
 *      phase[0].starts vs today for calendar-anchored programs).
 *   2. Implicit fallback for users who set `active_program_id` without
 *      going through intake commit (setActiveProgram, addSecondaryProgram,
 *      persona harness). Compute shift = today - phase[0].starts using
 *      the profile's `active_program_started_at`. Comprehensive audit
 *      2026-08-18 P0-1 — handstand-walk.json's docstring claimed this
 *      already happened; it didn't, so every multi-dim user who started
 *      after 2026-03-08 landed on "YOU FINISHED" day 1.
 *
 * Hip program keeps its own started_at anchor logic and skips the
 * implicit fallback.
 */
function shiftedPhases(program: Program, profile?: Store["user_profile"]): Phase[] {
  const slug = program.slug;
  const explicit = slug ? profile?.program_states?.[slug]?.phase_shift_days : undefined;

  let shift = explicit;
  if (shift == null && slug && slug !== HIP_SLUG) {
    const startedAt =
      profile?.program_states?.[slug]?.started_at ??
      profile?.active_program_started_at;
    const authoredStart = program.phases[0]?.starts;
    if (startedAt && authoredStart && /^\d{4}-\d{2}-\d{2}$/.test(authoredStart)) {
      const startedISO = startedAt.slice(0, 10);
      const startedMs = new Date(startedISO + "T00:00:00").getTime();
      const authoredMs = new Date(authoredStart + "T00:00:00").getTime();
      if (Number.isFinite(startedMs) && Number.isFinite(authoredMs)) {
        const implicit = Math.round((startedMs - authoredMs) / 864e5);
        if (implicit !== 0) shift = implicit;
      }
    }
  }

  if (!shift) return program.phases;
  return program.phases.map((p) => ({
    ...p,
    starts: shiftIsoDate(p.starts, shift),
    ends: p.ends ? shiftIsoDate(p.ends, shift) : p.ends,
  }));
}

/**
 * Return true if `dateISO` is strictly after the last phase's `ends`. Used by
 * Today to render the "You finished" graduation card instead of endlessly
 * looping the last phase's session. Programs whose last phase has no `ends`
 * (open-ended maintenance blocks) never graduate.
 */
export function isPastProgramEnd(
  program: Program,
  dateISO: string,
  profile?: Store["user_profile"],
): boolean {
  const phases = shiftedPhases(program, profile);
  const last = phases[phases.length - 1];
  if (!last?.ends) return false;
  return dateISO > last.ends;
}

/**
 * Consult `program.phase_gates[]` to see whether a given phase should be
 * skipped based on the user's intake answers. Returns true when the
 * gate's `skip_if_value_in` matches the user's answer. Vector A audit
 * 2026-08-18 flagged this field as dead code — now consumed.
 */
function isPhaseGateSkipped(
  program: Program,
  phaseId: string,
  profile: Store["user_profile"] | undefined,
): boolean {
  const gates = (program as unknown as {
    phase_gates?: Array<{
      phase_id: string;
      gate_type: string;
      question_id: string;
      skip_if_value_in?: string[];
      run_if_value_in?: string[];
    }>;
  }).phase_gates;
  if (!gates?.length) return false;
  const gate = gates.find((g) => g.phase_id === phaseId);
  if (!gate) return false;
  const slug = program.slug;
  if (!slug) return false;
  const answer = profile?.program_states?.[slug]?.intake_answers?.[gate.question_id];
  if (!answer) return false;
  if (gate.skip_if_value_in?.includes(answer)) return true;
  return false;
}

export function activePhaseFor(
  program: Program,
  dateISO: string,
  profile?: Store["user_profile"],
): Phase | undefined {
  const phases = shiftedPhases(program, profile);
  const slug = program.slug;
  const tier = slug ? profile?.program_states?.[slug]?.tier : undefined;

  // Tier-aware phase selection. Multi-tier skill programs author one phase
  // per tier at the same start date; without this preference,
  // `phases.find()` returned the first (Tier A) for every user. When the
  // user has a tier set, prefer phases whose `for_tier_ids` matches or
  // that have no `for_tier_ids` (shared phases like phase_all_weeks_3_8).
  // Comprehensive audit 2026-08-18 P0-6.
  const matches = phases
    .filter((p) => dateISO >= p.starts && (p.ends == null || dateISO <= p.ends))
    .filter((p) => !isPhaseGateSkipped(program, p.id, profile));
  if (matches.length > 0) {
    if (tier) {
      const tierMatch = matches.find((p) => p.for_tier_ids?.includes(tier));
      if (tierMatch) return tierMatch;
      const untagged = matches.find((p) => !p.for_tier_ids);
      if (untagged) return untagged;
    }
    return matches[0];
  }

  const first = phases[0];
  if (first && dateISO < first.starts) return undefined;
  if (
    slug === HIP_SLUG &&
    dateISO >= HIP_HOLIDAY_GAP.start &&
    dateISO <= HIP_HOLIDAY_GAP.end
  ) {
    return undefined;
  }
  return phases[phases.length - 1];
}

type LayoutEntry = { day?: string; session?: string };
type WeekObject = { week?: LayoutEntry[] } & Record<string, unknown>;

/**
 * Generic path: extract block IDs referenced for a given DOW from a
 * program's weekly_template. Returns [] if the template doesn't cover
 * that day, which the caller renders as a rest day.
 */
function blockIdsFromWeeklyTemplate(
  program: Program,
  phase: Phase | undefined,
  dateISO: string,
  profile: Store["user_profile"] | undefined,
): string[] {
  const wt = program.weekly_template as WeekObject | undefined;
  if (!wt) return [];
  const dow = new Date(dateISO + "T12:00:00").getDay();
  const dayShort = DAY_SHORT_NAMES[dow];

  // User-added events (races, competitions, travel). Events supersede
  // everything below — a race day = no session, no matter what the program
  // scheduled. pre_deload_days extends the rest window BEFORE the event;
  // rest_days_after extends it AFTER. Applies to strength blocks only —
  // rehab / home blocks (`block_a_home`) survive the event window so daily
  // consistency doesn't break.
  if (profile?.events?.length) {
    const nowMs = new Date(dateISO + "T00:00:00").getTime();
    for (const ev of profile.events) {
      const evMs = new Date(ev.date + "T00:00:00").getTime();
      if (!Number.isFinite(evMs)) continue;
      const daysToEvent = Math.floor((evMs - nowMs) / 864e5);
      const preDeload = ev.pre_deload_days ?? 0;
      const restAfter = ev.rest_days_after ?? 0;
      const withinWindow =
        daysToEvent === 0 ||
        (daysToEvent > 0 && daysToEvent <= preDeload) ||
        (daysToEvent < 0 && -daysToEvent <= restAfter);
      if (withinWindow) {
        return []; // strength scheduled today is displaced by the event window
      }
    }
  }

  // Per-week overrides — a phase can declare `weekly_overrides` for specific
  // date ranges (e.g. eval week: Tue 5RM squat + Fri 5RM pull; taper week:
  // light Mon+Wed + rest Thu/Fri). Overrides supersede the default template
  // for days present in the override's `days` map; unnamed days fall through
  // to the default. Empty string = explicit rest (no session).
  if (phase) {
    const overrides = (phase as unknown as {
      weekly_overrides?: Array<{
        starts: string;
        ends: string;
        days: Partial<Record<(typeof DAY_SHORT_NAMES)[number], string>>;
      }>;
    }).weekly_overrides;
    if (overrides?.length) {
      const match = overrides.find(
        (o) => dateISO >= o.starts && dateISO <= o.ends,
      );
      if (match) {
        const session = match.days[dayShort];
        if (session !== undefined) {
          return extractBlockIds(session, program);
        }
      }
    }
  }

  // Shape A: weekly_template.week[] — one layout, every week. Push-tier users
  // get `push_tier_override` when present (Rowing 2K's Push adds a Sunday Z2).
  if (Array.isArray(wt.week)) {
    const slug = program.slug;
    const userTier = slug ? profile?.program_states?.[slug]?.tier : undefined;
    const overrideArr = wt.push_tier_override as LayoutEntry[] | undefined;
    const source =
      userTier === "push" && Array.isArray(overrideArr) ? overrideArr : wt.week;
    const entry = source.find((e) => e.day === dayShort);
    const ids = extractBlockIds(entry?.session, program);
    // Taper phase final-week replacements — programs can declare
    // `block_replacements_final_week` on the taper phase to swap high-CNS
    // blocks (race pace) for low-CNS blocks (recovery) in the last 7 days
    // before the test. Fresh legs on test day.
    let out = ids;
    if (phase && (phase as unknown as { is_taper?: boolean }).is_taper && phase.ends) {
      const endD = new Date(phase.ends + "T00:00:00").getTime();
      const nowD = new Date(dateISO + "T00:00:00").getTime();
      const daysToEnd = Math.floor((endD - nowD) / 864e5);
      if (daysToEnd <= 7) {
        const rep = (phase as unknown as { block_replacements_final_week?: Record<string, string> })
          .block_replacements_final_week;
        if (rep) out = ids.map((id) => rep[id] ?? id);
      }
    }
    // Phase-block-scope filter — the weekly_template can reference blocks
    // that aren't in the current phase's `blocks[]` list. Rowing's taper
    // (post-2026-08-19 delta-2) still rendered `block_threshold_row` on
    // Wednesdays because the template said so, even though phase_3_taper
    // declares only easy-recovery + race-pace blocks. Filter out.
    if (phase?.blocks?.length) {
      const allowed = new Set(phase.blocks);
      out = out.filter((id) => allowed.has(id));
    }
    return out;
  }

  // Shape B: weekly_template.week_N.layout[] — week varies per program week.
  const weekNumber = computeProgramWeek(program, phase, dateISO, profile);
  const weekKey = `week_${weekNumber}`;
  const weekObj = wt[weekKey] as
    | { layout?: LayoutEntry[]; push_tier_override?: LayoutEntry[] }
    | undefined;
  // Push-tier users get the upgraded layout when the program author supplied
  // one — engine-builder does this for weeks with an extra session or a
  // harder interval variant.
  const slug = program.slug;
  const userTier = slug ? profile?.program_states?.[slug]?.tier : undefined;
  const isPush = userTier === "push";
  if (!weekObj?.layout && !weekObj?.push_tier_override) {
    // Fall back to the last week that has a layout — allows a program to
    // define a template that ends before the phase and still show something.
    const highestNumberedKey = Object.keys(wt)
      .filter((k) => /^week_\d+$/.test(k))
      .sort((a, b) => Number(b.slice(5)) - Number(a.slice(5)))[0];
    if (!highestNumberedKey) return [];
    const fallback = wt[highestNumberedKey] as
      | { layout?: LayoutEntry[]; push_tier_override?: LayoutEntry[] }
      | undefined;
    const layout = (isPush && fallback?.push_tier_override) || fallback?.layout;
    if (!layout) return [];
    const entry = layout.find((e) => e.day === dayShort);
    return extractBlockIds(entry?.session, program);
  }
  const layout = (isPush && weekObj.push_tier_override) || weekObj.layout;
  if (!layout) return [];
  const entry = layout.find((e) => e.day === dayShort);
  const ids = extractBlockIds(entry?.session, program);
  // Same phase-block-scope filter as Shape A.
  if (phase?.blocks?.length) {
    const allowed = new Set(phase.blocks);
    return ids.filter((id) => allowed.has(id));
  }
  return ids;
}

function extractBlockIds(session: string | undefined, program: Program): string[] {
  if (!session) return [];
  const matches = session.match(/block_[a-z0-9_]+/g) ?? [];
  return matches.filter((id) => program.blocks.some((b) => b.id === id));
}

/**
 * Compute which week of the program (1-indexed) contains this date. Uses the
 * user's active_program_started_at when present; otherwise falls back to the
 * phase.starts anchor. Defaults to week 1 if neither is derivable.
 */
function computeProgramWeek(
  program: Program,
  phase: Phase | undefined,
  dateISO: string,
  profile: Store["user_profile"] | undefined,
): number {
  const started =
    profile?.active_program_started_at ??
    phase?.starts ??
    program.phases[0]?.starts;
  if (!started) return 1;
  const startD = new Date(started + (started.length === 10 ? "T00:00:00" : ""));
  const today = new Date(dateISO + "T00:00:00");
  const days = Math.floor((today.getTime() - startD.getTime()) / 864e5);
  if (days < 0) return 1;
  return Math.floor(days / 7) + 1;
}

/**
 * Which block IDs the plan wants on this specific date.
 *
 * For anterior-hip-rebuild: preserves the original phase-name-hardcoded
 * behavior verbatim (barbell days, evaluate week, Hatch, peak, phase-7
 * name-prefix fallback).
 *
 * For every other program: reads weekly_template.
 */
export function strengthBlockIdsForDate(
  program: Program,
  phase: Phase | undefined,
  dateISO: string,
  profile?: Store["user_profile"],
): string[] {
  const slug = (program as unknown as { slug?: string }).slug;

  // Non-hip programs: generic path only.
  if (slug !== HIP_SLUG) {
    if (!phase) return [];
    return blockIdsFromWeeklyTemplate(program, phase, dateISO, profile);
  }

  // Hip program: original behavior.
  if (!phase) return [];
  if (dateISO === HIP_RACE_DATE) return [];

  const dow = new Date(dateISO + "T12:00:00").getDay();
  const wt = program.weekly_template as
    | { week?: Array<{ session: string; day: string }> }
    | undefined;

  if (HIP_MAIN_PHASE_IDS.has(phase.id) && wt?.week) {
    const entry = wt.week[DOW_TO_TEMPLATE_IDX[dow]];
    return (entry?.session.match(/block_[a-z_]+/g) ?? []).filter((id) =>
      program.blocks.some((b) => b.id === id),
    );
  }

  if (phase.id === "phase_1_rebuild_evaluate") {
    const start = new Date(phase.starts + "T00:00:00");
    const today = new Date(dateISO + "T00:00:00");
    const days = Math.max(0, Math.floor((today.getTime() - start.getTime()) / 864e5));
    const week = Math.floor(days / 7);
    const barbellDays = new Set<number>([1, 3, 4, 6]);
    const evalDays = new Set<number>([2, 5]);
    if (week === 2) {
      return evalDays.has(dow) ? ["block_evaluate"] : barbellDays.has(dow) ? ["block_reintro"] : [];
    }
    return barbellDays.has(dow) ? ["block_reintro"] : [];
  }

  if (phase.id === "phase_5_hatch_specialise") {
    if (dow === 1) return ["block_hatch_a"];
    if (dow === 3) return ["block_pull_heavy"];
    if (dow === 4) return ["block_hatch_b"];
    return [];
  }

  if (phase.id === "phase_6_peak_test") {
    if (dow === 1 || dow === 4) return ["block_peak_singles"];
    if (dow === 3) return ["block_pull_heavy"];
    return [];
  }

  // Phase 7 (continue): day-name-prefix filter on block names.
  const todayName = DAY_SHORT_NAMES[dow];
  return phase.blocks.filter((id) => {
    const block = program.blocks.find((b) => b.id === id);
    if (!block) return false;
    const match = block.name.match(/^(Sun|Mon|Tue|Wed|Thu|Fri|Sat)\s*[—-]/);
    if (match) return match[1] === todayName;
    return dow === 1;
  });
}

/**
 * Resolve the block objects for a date.
 *
 * anterior-hip-rebuild keeps the strength-category filter (its non-strength
 * blocks live on the Extras tab by design). All other programs return every
 * block the weekly_template references regardless of category, so aerobic /
 * skill / concurrent sessions actually reach the user's Today screen.
 */
export function strengthBlocksForDate(
  program: Program,
  phase: Phase | undefined,
  dateISO: string,
  profile?: Store["user_profile"],
): Block[] {
  const ids = strengthBlockIdsForDate(program, phase, dateISO, profile);
  const slug = (program as unknown as { slug?: string }).slug;
  if (slug === HIP_SLUG) {
    return program.blocks.filter(
      (b) => ids.includes(b.id) && (b.category ?? "strength") === "strength",
    );
  }
  return program.blocks.filter((b) => ids.includes(b.id));
}

// Kept as named exports for existing consumers; both are hip-only signals.
// New code that needs "is this a race day" or "is this a holiday gap" should
// gate on program.slug first.
export { HIP_RACE_DATE as RACE_DATE, HIP_HOLIDAY_GAP as HOLIDAY_GAP };
