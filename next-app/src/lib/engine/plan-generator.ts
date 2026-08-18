import type { Block, Exercise, Phase, Program, Store } from "../schemas";
import { activePhaseFor, strengthBlocksForDate } from "./schedule";

type Levels = Partial<Record<string, 1 | 2 | 3 | 4 | 5>>;
type DrillsById = Record<string, Exercise>;

/**
 * v2 plan generator — the single entry point that decides which blocks Today
 * should render for a given date.
 *
 * Two branches for now:
 *   - `correlated_tier` (default, legacy): delegate to schedule.strengthBlocksForDate.
 *     Anterior Hip Rebuild + Engine Builder + everything pre-v2 go through this.
 *   - `multi_dimensional`: look up the user's tier in the program's `weekly_template`
 *     and resolve the primary + wrap blocks for the day-of-week. Handstand Walk uses
 *     this. Per-drill weakest-capability selection is a follow-up commit; for now the
 *     tier selection alone gives multi-dim programs a running Today view.
 */

const DAY_KEYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

type WeeklyTemplateLayoutEntry = {
  day: string;
  session_slot?: string;
  primary_block?: string;
  wrap?: string[];
};

type WeeklyTemplateReferenceWeek = {
  sessions?: number;
  layout?: WeeklyTemplateLayoutEntry[];
};

/**
 * The main routing function. Callers should replace the direct
 * `strengthBlocksForDate` import with this — behavior is identical for legacy
 * (correlated_tier) programs and differs only for `multi_dimensional`.
 *
 * `drillsById` is optional. When supplied AND the program is multi_dimensional,
 * each block's items get filtered by prerequisites (F-105 Milestone 1) —
 * drills whose declared prerequisites the user's derived capability levels
 * don't meet are dropped from the returned block. Without `drillsById`, the
 * block ships with its authored item list unchanged (backward compatible).
 */
export function blocksForDate(
  program: Program,
  profile: Store["user_profile"] | undefined,
  phase: Phase | undefined,
  dateISO: string,
  drillsById?: DrillsById,
): Block[] {
  if (program.generation_strategy === "multi_dimensional") {
    return multiDimensionalBlocksForDate(program, profile, dateISO, drillsById);
  }
  return strengthBlocksForDate(program, phase, dateISO, profile);
}

/**
 * Resolve which tier the user is on for a given program. Preference order:
 *   1. Explicit pick in user_profile.program_states[slug].tier
 *   2. First tier in program.plan_tiers (safe default — usually Foundation)
 *   3. undefined (caller falls back to a sensible default)
 */
export function resolveActiveTier(
  program: Program,
  profile: Store["user_profile"] | undefined,
): string | undefined {
  const slug = profile?.active_program_id;
  const picked = slug ? profile?.program_states?.[slug]?.tier : undefined;
  if (picked) return picked;
  return program.plan_tiers?.[0]?.id;
}

/**
 * Multi-dimensional routing: look up the tier's reference week in the program's
 * `weekly_template` and pull the primary + wrap blocks for the current day of week.
 *
 * Convention (established by handstand-walk.json): weekly_template contains keys
 * like `reference_week_tier_a`, `reference_week_tier_b`, one per plan_tier id.
 * A tier id `tier_a_foundation` maps to key `reference_week_tier_a` — we take the
 * portion after `tier_` and lowercase it.
 */
function multiDimensionalBlocksForDate(
  program: Program,
  profile: Store["user_profile"] | undefined,
  dateISO: string,
  drillsById?: DrillsById,
): Block[] {
  const wt = program.weekly_template as
    | Record<string, WeeklyTemplateReferenceWeek | unknown>
    | undefined;
  if (!wt) return [];

  const tierId = resolveActiveTier(program, profile);
  if (!tierId) return [];

  const tierKey = tierKeyFromTierId(tierId);
  const week = wt[tierKey] as WeeklyTemplateReferenceWeek | undefined;
  if (!week?.layout) return [];

  const dow = new Date(dateISO + "T12:00:00").getDay();
  const dayShort = DAY_KEYS[dow];
  const entry = week.layout.find((l) => l.day === dayShort);
  if (!entry) return []; // rest day for this tier's week

  const ids: string[] = [];
  if (entry.primary_block) ids.push(entry.primary_block);
  if (entry.wrap) ids.push(...entry.wrap);

  // 2026-08-18 fix (#70) — phase-aware substitution for multi-dimensional
  // programs. Previously the tier's reference_week_tier_X layout was used
  // verbatim regardless of active phase, so the Week view description read
  // "Phase 1 — Wrist prep + Kinoshita" while the days rendered wall_hold /
  // freestand blocks from the generic tier layout. Two data sources, one
  // truth. Now: if a phase covers this date AND declares its own blocks
  // list, we filter the layout's ids against phase.blocks. For the primary
  // block, if it's missing from the phase, we substitute the first
  // phase.block matching the same skill category (`block_skill_A_` /
  // `block_skill_B_`) so the day still fires with a phase-appropriate
  // session. Wraps just filter — a wrap that isn't in the phase drops.
  const phase = activePhaseFor(program, dateISO, profile);
  const phaseBlockSet = phase?.blocks?.length ? new Set(phase.blocks) : null;
  let effectiveIds = ids;
  if (phaseBlockSet) {
    const substituted: string[] = [];
    // Primary first (if any)
    if (entry.primary_block) {
      if (phaseBlockSet.has(entry.primary_block)) {
        substituted.push(entry.primary_block);
      } else {
        const category = skillCategoryOf(entry.primary_block);
        const swap = category
          ? phase!.blocks!.find((id) => skillCategoryOf(id) === category)
          : undefined;
        // If no same-category swap, pick the first non-wrap block in the
        // phase — the layout wants A skill session here; give the user the
        // phase's headline skill block rather than a wrist-prep-only day.
        const fallback = phase!.blocks!.find(
          (id) => id.startsWith("block_skill") || id.startsWith("block_bail"),
        );
        if (swap) substituted.push(swap);
        else if (fallback) substituted.push(fallback);
      }
    }
    // Wraps: keep only phase-listed ones
    if (entry.wrap) {
      for (const w of entry.wrap) if (phaseBlockSet.has(w)) substituted.push(w);
    }
    effectiveIds = substituted;
  }

  // Preserve the substituted order (primary first, then wrap) — the
  // authored layout order matters for Today's session flow.
  const blocks = effectiveIds
    .map((id) => program.blocks.find((b) => b.id === id))
    .filter((b): b is Block => !!b);
  if (!drillsById) return blocks;
  const levels = deriveLevelsFromProfile(profile, program, tierId);
  const weekNumber = weekNumberFromProgramStart(profile, dateISO);
  return blocks.map((b) => {
    // Milestone 2: if the block declares a capability_slot AND the program has
    // a drill_library, REPLACE authored items with drills composed from the
    // library targeting that slot at the user's estimated level. If no slot,
    // fall through to Milestone 1's prerequisite-filter behavior.
    if (b.capability_slot && program.drill_library?.length) {
      const composed = composeSlotDrills(program, b, drillsById, levels);
      if (composed) {
        const seedKey = ciSeedKey(profile, program, dateISO, b.id);
        return applyContextualInterference(composed, weekNumber, seedKey);
      }
    }
    return filterBlockItemsByPrerequisites(b, drillsById, levels);
  });
}

/**
 * Extract the skill category from a block id — e.g., `block_skill_A_kinoshita`
 * → `A`, `block_skill_B_walk_attempts` → `B`, `block_bail_mat_falls` → `bail`.
 * Returns null for wrap / non-skill blocks. Used by phase-aware substitution
 * so if a phase drops the tier layout's primary skill block, we substitute
 * with a block of the same A/B alternation slot from the phase's block list.
 */
function skillCategoryOf(blockId: string): string | null {
  const m = /^block_skill_([AB])_/.exec(blockId);
  if (m) return m[1];
  if (blockId.startsWith("block_bail_")) return "bail";
  return null;
}

/**
 * Build the CI shuffle seed key. Phase A change: include uid + program slug
 * + program start date alongside dateISO + block.id. Two users on the same
 * program on the same day now see genuinely different orderings.
 *
 * Guest users (no uid) still get a stable seed per day so the ordering is
 * consistent across reloads within the same session.
 */
function ciSeedKey(
  profile: Store["user_profile"] | undefined,
  program: Program,
  dateISO: string,
  blockId: string,
): string {
  const uid = profile?.uid ?? "guest";
  const slug = profile?.active_program_id ?? "unknown";
  const started = profile?.active_program_started_at ?? "0000-00-00";
  const version = (program as unknown as { schema_version?: string }).schema_version ?? "0";
  return `${uid}:${slug}:${started}:${version}:${dateISO}:${blockId}`;
}

/**
 * Weeks since the user started this program. Uses
 * `user_profile.active_program_started_at` (stamped by setActiveProgram) or
 * falls back to 0 if unavailable. Returns a 1-indexed week number.
 */
function weekNumberFromProgramStart(
  profile: Store["user_profile"] | undefined,
  dateISO: string,
): number {
  const started = profile?.active_program_started_at;
  if (!started) return 1;
  const startD = new Date(started + (started.length === 10 ? "T00:00:00" : ""));
  const today = new Date(dateISO + "T00:00:00");
  const days = Math.floor((today.getTime() - startD.getTime()) / 864e5);
  if (days < 0) return 1;
  return Math.floor(days / 7) + 1;
}

/**
 * Milestone 3 — contextual interference (Shea & Morgan 1979; Wulf & Shea 2002).
 * Weeks 1-2: blocked practice (drills stay in composed order — easier to learn).
 * Weeks 3+: random practice (drills shuffled — harder in acquisition, better
 * retention). Shuffle is DETERMINISTIC per (dateISO, block.id) so the same
 * date renders the same ordering across reloads.
 */
export function applyContextualInterference(
  block: Block,
  weekNumber: number,
  seedKey: string,
): Block {
  if (weekNumber <= 2 || !block.items || block.items.length < 2) return block;
  const seed = hashString(seedKey);
  const shuffled = deterministicShuffle(block.items, seed);
  return { ...block, items: shuffled };
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function deterministicShuffle<T>(items: T[], seed: number): T[] {
  const out = [...items];
  let s = seed;
  for (let i = out.length - 1; i > 0; i--) {
    // xorshift step so each iteration gets a fresh pseudo-random
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    const j = s % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Milestone 2 composer. Picks 2-3 drills from the program's `drill_library`
 * that:
 *   1. Target the block's `capability_slot`
 *   2. Have prerequisites the user's derived levels meet
 *   3. Sit at level [user_level - 1 .. user_level + 1] — biased to the lower
 *      end (safety-first) but allows one stretch drill so the block still
 *      pushes the user forward
 * Returns the block with `items` replaced by the composed drills. If the
 * library has too few eligible drills, we fall back to the block's authored
 * items (filtered by prereqs) so the session isn't empty.
 */
export function composeSlotDrills(
  program: Program,
  block: Block,
  drillsById: DrillsById,
  levels: Levels,
): Block | null {
  const slot = block.capability_slot;
  if (!slot || !program.drill_library?.length) return null;
  const targetCount = block.slot_drill_count ?? 2;
  const userLevel = levels[slot] ?? 1;

  // Pull every drill from the library that (a) exists in the drill store,
  // (b) targets this capability, (c) has met prerequisites, (d) is within
  // level window.
  const candidates: Array<{ drill: Exercise; level: 1 | 2 | 3 | 4 | 5 }> = [];
  for (const drillId of program.drill_library) {
    const drill = drillsById[drillId];
    if (!drill) continue;
    if (!drill.capability_domains?.includes(slot)) continue;
    if (drill.prerequisites && !arePrerequisitesMet(drill.prerequisites, levels)) continue;
    const level = (drill.level ?? 1) as 1 | 2 | 3 | 4 | 5;
    if (Math.abs(level - userLevel) > 1) continue;
    candidates.push({ drill, level });
  }

  if (candidates.length === 0) {
    // Fall back to authored items with prereq filtering.
    return filterBlockItemsByPrerequisites(block, drillsById, levels);
  }

  // Sort: exact level match first, then one below (safer), then one above.
  // Tie-break by drill id for determinism.
  candidates.sort((a, b) => {
    const aScore = a.level === userLevel ? 0 : a.level < userLevel ? 1 : 2;
    const bScore = b.level === userLevel ? 0 : b.level < userLevel ? 1 : 2;
    if (aScore !== bScore) return aScore - bScore;
    return a.drill.id.localeCompare(b.drill.id);
  });

  const chosen = candidates.slice(0, targetCount);
  const composedItems = chosen.map((c) => ({
    exercise_id: c.drill.id,
    scheme: c.drill.default_dose
      ? formatDose(c.drill.default_dose)
      : undefined,
    note: c.drill.cues_external_focus?.[0],
  }));
  return { ...block, items: composedItems };
}

function formatDose(dose: NonNullable<Exercise["default_dose"]>): string | undefined {
  const parts: string[] = [];
  if (dose.sets && dose.reps) parts.push(`${dose.sets}×${dose.reps}`);
  else if (dose.duration_s) parts.push(`${dose.duration_s}s`);
  return parts.join(" ") || undefined;
}

/**
 * Prune a block's `items` list, dropping any item whose exercise's declared
 * prerequisites the user's derived capability levels don't meet. Blocks
 * whose items resolve to non-multi-dim exercises (no `prerequisites` field
 * or missing from drillsById) are left alone.
 */
export function filterBlockItemsByPrerequisites(
  block: Block,
  drillsById: DrillsById,
  levels: Levels,
): Block {
  if (!block.items?.length) return block;
  const kept = block.items.filter((it) => {
    if (!it.exercise_id) return true; // rest / separator rows
    const drill = drillsById[it.exercise_id];
    if (!drill?.prerequisites?.length) return true;
    return arePrerequisitesMet(drill.prerequisites, levels);
  });
  if (kept.length === block.items.length) return block;
  return { ...block, items: kept };
}

/**
 * Are all of a drill's prerequisites satisfied by the user's derived levels?
 * Missing / unknown capability entries default to level 1 (weakest), which
 * biases toward safety — an unknown prerequisite falls back to blocking the
 * drill until the user gains data in that domain.
 */
export function arePrerequisitesMet(
  prereqs: NonNullable<Exercise["prerequisites"]>,
  levels: Levels,
): boolean {
  for (const p of prereqs) {
    const level = levels[p.capability_domain] ?? 1;
    if (level < p.minimum_level) return false;
  }
  return true;
}

/**
 * Derive a user's estimated capability levels from their profile. Priority:
 *   1. Explicit `capability_profile` entries (populated by intake or adaptive
 *      engine — highest fidelity).
 *   2. Tier-mapped defaults (Foundation → 1, Wall → 2, Freestand → 3, Advanced → 4/5).
 *
 * The tier map is intentionally coarse; the intake wizard's job is to refine
 * per-capability once the user answers it. Milestone 1 uses tier as a proxy
 * so filtering fires even when capability_profile is empty (which it is for
 * all current users — see intake wizard follow-up).
 */
export function deriveLevelsFromProfile(
  profile: Store["user_profile"] | undefined,
  program: Program,
  tierId: string,
): Levels {
  const declared: Levels = {};
  const capProfile = profile?.capability_profile;
  if (capProfile) {
    for (const [domain, entry] of Object.entries(capProfile)) {
      declared[domain] = entry.estimated_level;
    }
  }

  const tierLevel = tierIdToBaseLevel(tierId);
  // Capability domains this program touches. Union of every drill in the
  // library's `capability_domains`. We fall back to the domain names declared
  // on plan_tiers[].program_adjustments if drill_library is unavailable.
  const domains = new Set<string>();
  if (program.drill_library) {
    // We don't have drillsById here so we can't enumerate; the plan-generator
    // caller passes drillsById into blocksForDate, but for tier default we
    // just apply the tier level to whatever's in capability_profile plus the
    // block-level items we see below. This function returns a base-level map
    // that filterBlockItemsByPrerequisites walks per-drill.
  }
  // Any domain the caller looks up gets tier-level as default:
  return new Proxy(declared, {
    get(target, key: string) {
      if (typeof key !== "string") return undefined;
      if (key in target) return target[key];
      // Unknown domain → tier baseline (still floors at 1).
      return tierLevel;
    },
  }) as Levels;
}

/**
 * Coarse map from a program's tier id (e.g. `tier_a_foundation`) to a base
 * capability level 1-5. Programs that use different tier naming get their
 * base level from the position in `plan_tiers`.
 */
function tierIdToBaseLevel(tierId: string): 1 | 2 | 3 | 4 | 5 {
  const m = tierId.match(/^tier_([a-z0-9]+)/i);
  if (!m) return 1;
  const letter = m[1].toLowerCase();
  if (letter === "a") return 1;
  if (letter === "b") return 2;
  if (letter === "c") return 3;
  if (letter === "d") return 4;
  if (letter === "e") return 5;
  return 1;
}

/**
 * `tier_a_foundation` → `reference_week_tier_a`.
 * `tier_d_advanced`   → `reference_week_tier_d`.
 * Robust against future naming (tier_alpha, tier_1, etc.) by grabbing everything
 * up to the first underscore after `tier_`.
 */
function tierKeyFromTierId(tierId: string): string {
  const m = tierId.match(/^tier_([a-z0-9]+)/i);
  if (!m) return `reference_week_${tierId}`;
  return `reference_week_tier_${m[1].toLowerCase()}`;
}
