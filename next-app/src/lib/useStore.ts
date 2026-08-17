"use client";

import { create } from "zustand";
import { loadStore, saveStore, ensureDay, ensureExercise, seedFromRepoLogIfEmpty } from "./storage";
import { pushRemoteDebounced } from "./sync";
import type { Store, DayLog, ExerciseLog, SetLog, Program, RunLog } from "./schemas";
import { today, iso } from "./utils";
import { snapshotCitation } from "./engine/citations";

/** Save to localStorage AND fire a debounced remote push. */
function commit(s: Store): Store {
  s.updated_at = Date.now();
  saveStore(s);
  pushRemoteDebounced(s);
  return s;
}

const DOW_TO_TEMPLATE_IDX = [6, 0, 1, 2, 3, 4, 5] as const;

type StoreState = {
  store: Store;
  hydrated: boolean;
  hydrate: () => void;
  setTM: (exId: string, kg: number | null) => void;
  updateSet: (
    blockId: string,
    exId: string,
    setIndex: number,
    patch: Partial<SetLog>,
    date?: string,
  ) => void;
  addSet: (blockId: string, exId: string, date?: string) => void;
  removeSet: (blockId: string, exId: string, setIndex: number, date?: string) => void;
  markDone: (blockId: string, exId: string, done: boolean, date?: string) => void;
  setNotes: (blockId: string, exId: string, notes: string, date?: string) => void;
  setDaySymptoms: (
    date: string,
    symptoms: DayLog["symptoms"],
    derived: DayLog["derived_state"],
  ) => void;
  setDayNotes: (date: string, notes: string) => void;
  replaceStore: (next: Store) => void;
  wipe: () => void;
  skipDay: (date: string, reason?: string) => void;
  skipAndShiftWeek: (date: string, program: Program, reason?: string) => WeekShift;
  skipWholeWeek: (anchorDate: string, program: Program, reason?: string) => WholeWeekShift;
  moveSession: (fromDate: string, toDate: string, blockIds: string[]) => void;
  clearSkip: (date: string) => void;
  clearShift: (fromDate: string, shift: WeekShift) => void;
  clearWholeWeek: (shift: WholeWeekShift) => void;
  /** Smart undo — clears skip + any overrides written on that date's cascade. Used by the Undo button on skipped days. */
  undoSkip: (date: string, program: Program) => void;
  /** User-confirmed load adjustment for a date (from the notes-signal banner or manual). */
  acceptDayAdjustment: (
    date: string,
    load_multiplier: number,
    reason: string,
    source?: "notes" | "manual",
    citationId?: string | null,
  ) => void;
  /** Remove an accepted adjustment, returning suggestions to their default multiplier. */
  clearDayAdjustment: (date: string) => void;
  /** Remember that the user dismissed a specific proposal on a given date. */
  dismissProposal: (date: string, proposalId: string) => void;
  /** Append a self-scored assessment entry to the given pack. */
  recordAssessment: (
    packId: string,
    date: string,
    scores: Record<string, number>,
    notes?: string,
  ) => void;
  /** Log an endurance session for a given day. */
  logRun: (date: string, run: RunLog) => void;
  /** Delete a logged run at a specific index. */
  removeRun: (date: string, index: number) => void;
  /** Append a personal contraindication (movement / position that hurts). */
  addContraindication: (label: string, reason?: string) => void;
  removeContraindication: (id: string) => void;
  /**
   * Add a race / competition / event date. The plan generator treats the event
   * date as a forced rest day, and if pre_deload_days / rest_days_after are
   * set, extends the rest window either side.
   */
  addEvent: (event: {
    date: string;
    name: string;
    kind?: "race" | "competition" | "travel" | "other";
    pre_deload_days?: number;
    rest_days_after?: number;
    note?: string;
  }) => void;
  removeEvent: (id: string) => void;
  /** Set the currently-active program slug (from catalog). */
  setActiveProgram: (slug: string | null) => void;
  /**
   * Set the user's picked tier for a specific program. Used by the tier picker
   * on the program preview page (multi-dimensional programs require a tier
   * choice before Start becomes valid). Stored on
   * `user_profile.program_states[slug].tier` and read by the multi-dim plan
   * generator to route the weekly template.
   */
  setProgramTier: (slug: string, tier: string) => void;
  /**
   * Skill-program retest capture. Updates `capability_profile[testId].measured_value`
   * and `last_measured_at`. Never touches `baseline_capabilities` so Δ math
   * against the original baseline remains honest.
   */
  recordCapabilityMeasurement: (testId: string, value: number, unit?: string) => void;
  /**
   * Multi-tier promotion. Sets `program_states[slug].tier` to the new tier,
   * appends a `tier_history` entry, clears any previous
   * `tier_proposal_dismissed_for` marker.
   */
  promoteTier: (slug: string, newTierId: string, trigger?: "retest" | "manual") => void;
  /**
   * Record that the user chose "Not yet" on a tier-advance proposal. Stores
   * `<tier_id>@<vars_hash>` so the same proposal on the same numbers won't
   * re-surface, but a new retest that changes the numbers resets it.
   */
  dismissTierProposal: (slug: string, key: string) => void;
  /**
   * Advance the user's plan by writing a `phase_shift_days` value. Positive
   * values shift subsequent phases FORWARD (delaying); negative values shift
   * BACKWARD (advancing). Caller computes days from the target phase's
   * authored `starts` minus today. Used by the reintro-readiness Advance
   * button on the hip program, and by any future explicit-advance flow.
   */
  advancePhase: (slug: string, daysToShift: number) => void;
  /**
   * Add a program to the list of concurrently-active programs. Preserves the
   * existing `active_program_id` as primary; the added slug becomes an
   * additional secondary. Idempotent — adding a slug that's already active
   * is a no-op. Used by the "Add alongside" flow on the program preview page.
   */
  addSecondaryProgram: (slug: string) => void;
  addSecondaryProgramForce: (slug: string) => void;
  /**
   * Remove a program from the concurrent active set. If the removed slug is
   * the primary, promotes the first remaining secondary (or clears entirely
   * if none). Used by the snooze/remove UI in Profile.
   */
  removeActiveProgram: (slug: string) => void;
  /**
   * Phase A: dismiss the "your plan is built" reveal card for a program. Sets
   * program_states[slug].reveal_seen = true. Card never re-appears for the
   * same program.
   */
  dismissPlanReveal: (slug: string) => void;
  /**
   * Phase A: write a generation_trace stub on program_states[slug] when the
   * user commits a program. Captures the intake_answers + tier + capability
   * snapshot that shaped the plan, plus a version stamp. Powers the reveal
   * card's "why this plan?" attribution and gives Phase B/C something to
   * re-derive from.
   */
  writeGenerationTrace: (
    slug: string,
    trace: {
      strategy?: string;
      tier_id?: string;
      seed: string;
      input_snapshot: Record<string, unknown>;
    },
  ) => void;
  /**
   * Clear local state without pushing to the remote KV. Used when auth state
   * changes on the same browser — the previous user's data should not touch
   * the new user's KV blob. Hydrate will fetch fresh from KV afterwards.
   */
  resetForNewSession: () => void;
  /**
   * Stamp the current Supabase session identity onto the store so we can detect
   * "wrong user in localStorage" on subsequent loads.
   */
  setSessionIdentity: (uid: string | null, email: string | null) => void;
};

export type WholeWeekShift = {
  weekStart: string; // Monday
  skippedDates: string[];
  overrides: { date: string; blocks: string[] }[];
};

export type WeekShift = {
  skipDate: string;
  overrides: { date: string; blocks: string[]; original: string[] }[];
  dropped?: { blocks: string[]; description: string } | null;
};

/**
 * Given a date the user is skipping, compute the shifted schedule for
 * subsequent strength days in the SAME calendar week. Each subsequent
 * strength day takes on the previous strength day's session; the last
 * strength day's session falls off the week.
 */
export function computeWeekShift(skippedDate: string, program: Program): WeekShift {
  const wt = program.weekly_template as
    | { week?: Array<{ session: string; day: string }> }
    | undefined;
  if (!wt?.week) return { skipDate: skippedDate, overrides: [], dropped: null };

  const skipDateObj = new Date(skippedDate + "T00:00:00");
  const skipTemplateIdx = DOW_TO_TEMPLATE_IDX[skipDateObj.getDay()];
  const mondayOfWeek = new Date(skipDateObj);
  mondayOfWeek.setDate(mondayOfWeek.getDate() - skipTemplateIdx);

  const slots: { blocks: string[]; date: string }[] = [];
  for (let i = skipTemplateIdx; i < 7; i++) {
    const entry = wt.week[i];
    if (!entry) continue;
    const blockIds = (entry.session.match(/block_[a-z_]+/g) ?? []).filter((id) =>
      program.blocks.some((b) => b.id === id && (b.category ?? "strength") === "strength"),
    );
    if (blockIds.length === 0) continue;
    const slotDate = new Date(mondayOfWeek);
    slotDate.setDate(slotDate.getDate() + i);
    slots.push({ blocks: blockIds, date: iso(slotDate) });
  }

  const overrides: WeekShift["overrides"] = [];
  for (let i = 1; i < slots.length; i++) {
    overrides.push({
      date: slots[i].date,
      blocks: slots[i - 1].blocks,
      original: slots[i].blocks,
    });
  }
  const dropped = slots.length
    ? { blocks: slots[slots.length - 1].blocks, description: "Not made up this week" }
    : null;

  return { skipDate: skippedDate, overrides, dropped };
}

const initial: Store = {
  version: 2,
  logs: {},
  training_maxes: {},
  cycle: { phase_id: null, cycle_number: 1, week_in_cycle: 1 },
};

export const useStore = create<StoreState>((set, get) => ({
  store: initial,
  hydrated: false,

  hydrate: () => {
    const loaded = loadStore();
    set({ store: loaded, hydrated: true });
    // Seed-from-repo-log path DISABLED in multi-user mode. Historically it
    // bootstrapped Margus's own account from /data/log.json when the store
    // was empty; in the multi-user world it would inject Margus's data into
    // a fresh new-user account (or overwrite a real user after a session
    // reset if their local was momentarily empty). Kept as a dead symbol
    // reference below so tree-shaking doesn't complain and a future
    // single-user-migration path is trivial to re-enable if needed.
    void seedFromRepoLogIfEmpty;
    // Pull remote (if online). Runs after local paint so UI isn't blocked.
    //
    // Empty-local guard: if the loaded local store has no logs, no TMs, no
    // assessments AND no active_program_id, we IGNORE local's `updated_at`
    // when comparing against remote. Otherwise a bogus local timestamp (from
    // a wipe race or a stale session-binding reset) can trick pullRemote into
    // returning `keep_local` — leaving the user staring at "pick a program"
    // even though their real state is safe in KV.
    void import("./sync").then(({ pullRemote }) => {
      const s = get().store;
      const localIsEmpty =
        Object.keys(s.logs ?? {}).length === 0 &&
        Object.keys(s.training_maxes ?? {}).length === 0 &&
        Object.keys(s.assessments ?? {}).length === 0 &&
        !s.user_profile?.active_program_id;
      const cmpStore = localIsEmpty ? { ...s, updated_at: 0 } : s;
      return pullRemote(cmpStore).then((res) => {
        if (res.kind === "use_remote") {
          saveStore(res.store);
          set({ store: res.store });
        }
      });
    });
  },

  setTM: (exId, kg) => {
    const s = { ...get().store };
    s.training_maxes = { ...s.training_maxes };
    if (kg == null || !isFinite(kg) || kg <= 0 || kg > 500) delete s.training_maxes[exId];
    else s.training_maxes[exId] = kg;
    commit(s);
    set({ store: s });
  },

  updateSet: (blockId, exId, setIndex, patch, date) => {
    const s = { ...get().store };
    const day = ensureDay(s, date);
    const ex = ensureExercise(day, blockId, exId);
    const sets = ex.sets ? [...ex.sets] : synthSetsFromLegacy(ex);
    while (sets.length <= setIndex) sets.push({ weight_kg: null, reps: null, rpe: null });
    sets[setIndex] = { ...sets[setIndex], ...patch };
    day.exercises[`${blockId}:${exId}`] = { ...ex, sets, done: hasAnyLoggedSet(sets) || ex.done };
    commit(s);
    set({ store: s });
  },

  addSet: (blockId, exId, date) => {
    const s = { ...get().store };
    const day = ensureDay(s, date);
    const ex = ensureExercise(day, blockId, exId);
    const sets = ex.sets ? [...ex.sets] : synthSetsFromLegacy(ex);
    sets.push({ weight_kg: null, reps: null, rpe: null });
    day.exercises[`${blockId}:${exId}`] = { ...ex, sets };
    commit(s);
    set({ store: s });
  },

  removeSet: (blockId, exId, setIndex, date) => {
    const s = { ...get().store };
    const day = ensureDay(s, date);
    const ex = ensureExercise(day, blockId, exId);
    if (!ex.sets) return;
    const sets = ex.sets.filter((_, i) => i !== setIndex);
    day.exercises[`${blockId}:${exId}`] = { ...ex, sets };
    commit(s);
    set({ store: s });
  },

  markDone: (blockId, exId, done, date) => {
    const s = { ...get().store };
    const day = ensureDay(s, date);
    const ex = ensureExercise(day, blockId, exId);
    day.exercises[`${blockId}:${exId}`] = { ...ex, done };
    commit(s);
    set({ store: s });
  },

  setNotes: (blockId, exId, notes, date) => {
    const s = { ...get().store };
    const day = ensureDay(s, date);
    const ex = ensureExercise(day, blockId, exId);
    day.exercises[`${blockId}:${exId}`] = { ...ex, notes };
    commit(s);
    set({ store: s });
  },

  setDaySymptoms: (date, symptoms, derived) => {
    const s = { ...get().store };
    const day = ensureDay(s, date);
    day.symptoms = symptoms;
    day.derived_state = derived;
    commit(s);
    set({ store: s });
  },

  setDayNotes: (date, notes) => {
    const s = { ...get().store };
    const day = ensureDay(s, date);
    day.notes = notes;
    commit(s);
    set({ store: s });
  },

  replaceStore: (next) => {
    // Ensure the imported store carries an updated_at so it wins over the remote
    // (or matches it, if the import came from the remote itself).
    if (next.updated_at == null) next.updated_at = Date.now();
    commit(next);
    set({ store: next });
  },

  wipe: () => {
    const empty = { ...initial, updated_at: Date.now() };
    commit(empty);
    // Also clear per-device UI flags so a wipe truly resets the app.
    try {
      localStorage.removeItem("program.onboarding.done");
      localStorage.removeItem("program.firstrun.dismissed");
      localStorage.removeItem("program.log.v2.seeded");
      localStorage.removeItem("program.coach.history.v1");
    } catch { /* ignore */ }
    set({ store: initial });
  },

  skipDay: (date, reason) => {
    const s = { ...get().store };
    const prior = s.skipped?.[date];
    // If this date was previously marked as skipped-because-moved, clean up
    // the orphaned override on the destination date so it doesn't show a stale
    // "moved-in" badge for a session the user no longer intends to do.
    if (prior?.moved_to && s.scheduled_overrides?.[prior.moved_to]) {
      const dest = s.scheduled_overrides[prior.moved_to];
      if (dest.reason === `moved from ${date}`) {
        s.scheduled_overrides = { ...s.scheduled_overrides };
        delete s.scheduled_overrides[prior.moved_to];
      }
    }
    const skipped = { ...(s.skipped ?? {}) };
    skipped[date] = { reason };
    s.skipped = skipped;
    commit(s);
    set({ store: s });
  },

  skipAndShiftWeek: (date, program, reason) => {
    const shift = computeWeekShift(date, program);
    const s = { ...get().store };
    s.skipped = { ...(s.skipped ?? {}) };
    s.skipped[date] = { reason: reason ?? "week shifted forward" };
    s.scheduled_overrides = { ...(s.scheduled_overrides ?? {}) };
    for (const ov of shift.overrides) {
      s.scheduled_overrides[ov.date] = {
        blocks: ov.blocks,
        reason: `shifted from ${date}`,
      };
    }
    commit(s);
    set({ store: s });
    return shift;
  },

  skipWholeWeek: (anchorDate, program, reason) => {
    const wt = program.weekly_template as
      | { week?: Array<{ session: string; day: string }> }
      | undefined;
    const anchor = new Date(anchorDate + "T00:00:00");
    const anchorTemplateIdx = DOW_TO_TEMPLATE_IDX[anchor.getDay()];
    const mondayOfWeek = new Date(anchor);
    mondayOfWeek.setDate(mondayOfWeek.getDate() - anchorTemplateIdx);
    const strengthDays: { date: string; blocks: string[] }[] = [];
    if (wt?.week) {
      for (let i = 0; i < 7; i++) {
        const entry = wt.week[i];
        if (!entry) continue;
        const blockIds = (entry.session.match(/block_[a-z_]+/g) ?? []).filter((id) =>
          program.blocks.some((b) => b.id === id && (b.category ?? "strength") === "strength"),
        );
        if (blockIds.length === 0) continue;
        const d = new Date(mondayOfWeek);
        d.setDate(d.getDate() + i);
        strengthDays.push({ date: iso(d), blocks: blockIds });
      }
    }
    const s = { ...get().store };
    s.skipped = { ...(s.skipped ?? {}) };
    s.scheduled_overrides = { ...(s.scheduled_overrides ?? {}) };
    const skippedDates: string[] = [];
    const overrides: WholeWeekShift["overrides"] = [];
    for (const sd of strengthDays) {
      s.skipped[sd.date] = { reason: reason ?? "whole-week shift" };
      skippedDates.push(sd.date);
      // Move to +7 days
      const next = new Date(sd.date + "T00:00:00");
      next.setDate(next.getDate() + 7);
      const nextISO = iso(next);
      s.scheduled_overrides[nextISO] = {
        blocks: sd.blocks,
        reason: `shifted +7d from ${sd.date}`,
      };
      overrides.push({ date: nextISO, blocks: sd.blocks });
    }
    commit(s);
    set({ store: s });
    const weekStart = iso(mondayOfWeek);
    return { weekStart, skippedDates, overrides };
  },

  clearWholeWeek: (shift) => {
    const s = { ...get().store };
    s.skipped = { ...(s.skipped ?? {}) };
    for (const d of shift.skippedDates) delete s.skipped[d];
    s.scheduled_overrides = { ...(s.scheduled_overrides ?? {}) };
    for (const ov of shift.overrides) {
      const cur = s.scheduled_overrides[ov.date];
      if (cur && /^shifted \+7d from /.test(cur.reason ?? "")) delete s.scheduled_overrides[ov.date];
    }
    commit(s);
    set({ store: s });
  },

  clearShift: (fromDate, shift) => {
    const s = { ...get().store };
    if (s.skipped?.[fromDate]) {
      s.skipped = { ...s.skipped };
      delete s.skipped[fromDate];
    }
    if (s.scheduled_overrides) {
      s.scheduled_overrides = { ...s.scheduled_overrides };
      for (const ov of shift.overrides) {
        const current = s.scheduled_overrides[ov.date];
        if (current && current.reason === `shifted from ${fromDate}`) {
          delete s.scheduled_overrides[ov.date];
        }
      }
    }
    commit(s);
    set({ store: s });
  },

  undoSkip: (date, program) => {
    const s = { ...get().store };
    const skip = s.skipped?.[date];
    if (!skip) return;

    s.skipped = { ...(s.skipped ?? {}) };
    delete s.skipped[date];
    s.scheduled_overrides = { ...(s.scheduled_overrides ?? {}) };

    // Case A: skip was created by moveSession — clear the destination override too
    if (skip.moved_to) {
      const dest = s.scheduled_overrides[skip.moved_to];
      const expectedReason = `moved from ${date}`;
      if (dest && dest.reason === expectedReason) delete s.scheduled_overrides[skip.moved_to];
    }

    // Case B: skip created by skipAndShiftWeek — clear all overrides in this week that came from it
    if (skip.reason === "week shifted forward" || skip.reason === undefined) {
      // Recompute what the shift would have written and undo matching entries
      const shift = computeWeekShift(date, program);
      for (const ov of shift.overrides) {
        const current = s.scheduled_overrides[ov.date];
        if (current && current.reason === `shifted from ${date}`) delete s.scheduled_overrides[ov.date];
      }
    }

    // Case C: whole-week shift — clear next-week overrides tagged with this specific date
    // (identified by reason string `shifted +7d from <date>`)
    for (const [ovDate, ov] of Object.entries(s.scheduled_overrides)) {
      if (ov.reason === `shifted +7d from ${date}` || ov.reason === `shifted from ${date}`) {
        delete s.scheduled_overrides[ovDate];
      }
    }

    commit(s);
    set({ store: s });
  },

  moveSession: (fromDate, toDate, blockIds) => {
    const s = { ...get().store };
    const overrides = { ...(s.scheduled_overrides ?? {}) };
    overrides[toDate] = { blocks: blockIds, reason: `moved from ${fromDate}` };
    const skipped = { ...(s.skipped ?? {}) };
    skipped[fromDate] = { moved_to: toDate };
    s.scheduled_overrides = overrides;
    s.skipped = skipped;
    commit(s);
    set({ store: s });
  },

  clearSkip: (date) => {
    const s = { ...get().store };
    const skipped = { ...(s.skipped ?? {}) };
    delete skipped[date];
    s.skipped = skipped;
    commit(s);
    set({ store: s });
  },

  acceptDayAdjustment: (date, load_multiplier, reason, source = "notes", citationId = null) => {
    const s = { ...get().store };
    s.day_adjustments = { ...(s.day_adjustments ?? {}) };
    const snapshot = citationId ? snapshotCitation(citationId) : null;
    s.day_adjustments[date] = {
      load_multiplier,
      reason,
      source,
      accepted_at: Date.now(),
      ...(snapshot ? { citation_snapshot: snapshot } : {}),
    };
    commit(s);
    set({ store: s });
  },

  clearDayAdjustment: (date) => {
    const s = { ...get().store };
    if (!s.day_adjustments?.[date]) return;
    s.day_adjustments = { ...s.day_adjustments };
    delete s.day_adjustments[date];
    commit(s);
    set({ store: s });
  },

  dismissProposal: (date, proposalId) => {
    const s = { ...get().store };
    const dismissed = { ...(s.dismissed_proposals ?? {}) };
    const list = new Set(dismissed[date] ?? []);
    list.add(proposalId);
    dismissed[date] = Array.from(list);
    s.dismissed_proposals = dismissed;
    commit(s);
    set({ store: s });
  },

  recordAssessment: (packId, date, scores, notes) => {
    const s = { ...get().store };
    const packs = { ...(s.assessments ?? {}) };
    const entries = [...(packs[packId] ?? [])];
    entries.push({ pack_id: packId, date, scores, notes });
    // Sort ascending by date so charting components can rely on order.
    entries.sort((a, b) => a.date.localeCompare(b.date));
    packs[packId] = entries;
    s.assessments = packs;
    commit(s);
    set({ store: s });
  },

  logRun: (date, run) => {
    const s = { ...get().store };
    const day = ensureDay(s, date);
    day.runs = [...(day.runs ?? []), run];
    commit(s);
    set({ store: s });
  },

  removeRun: (date, index) => {
    const s = { ...get().store };
    const day = s.logs[date];
    if (!day?.runs) return;
    day.runs = day.runs.filter((_, i) => i !== index);
    commit(s);
    set({ store: s });
  },

  addContraindication: (label, reason) => {
    const trimmed = label.trim();
    if (!trimmed) return;
    const s = { ...get().store };
    const list = [...(s.contraindications ?? [])];
    // Prevent duplicate labels (case-insensitive).
    if (list.some((c) => c.label.toLowerCase() === trimmed.toLowerCase())) return;
    const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    list.push({
      id,
      label: trimmed,
      reason: reason?.trim() || undefined,
      added_at: Date.now(),
    });
    s.contraindications = list;
    commit(s);
    set({ store: s });
  },

  removeContraindication: (id) => {
    const s = { ...get().store };
    if (!s.contraindications) return;
    s.contraindications = s.contraindications.filter((c) => c.id !== id);
    commit(s);
    set({ store: s });
  },

  addEvent: (event) => {
    const s = { ...get().store };
    if (!event.date || !event.name?.trim()) return;
    const profile = { ...(s.user_profile ?? {}) };
    const list = [...(profile.events ?? [])];
    const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    list.push({
      id,
      date: event.date,
      name: event.name.trim(),
      kind: event.kind,
      pre_deload_days: event.pre_deload_days,
      rest_days_after: event.rest_days_after,
      note: event.note?.trim() || undefined,
      added_at: Date.now(),
    });
    // Keep sorted by date so plan generator lookups are predictable.
    list.sort((a, b) => a.date.localeCompare(b.date));
    profile.events = list;
    s.user_profile = profile;
    commit(s);
    set({ store: s });
  },

  removeEvent: (id) => {
    const s = { ...get().store };
    const existing = s.user_profile?.events;
    if (!existing) return;
    const profile = { ...s.user_profile };
    profile.events = existing.filter((e) => e.id !== id);
    s.user_profile = profile;
    commit(s);
    set({ store: s });
  },

  setActiveProgram: (slug) => {
    const s = { ...get().store };
    const profile = { ...(s.user_profile ?? {}) };
    if (slug == null) {
      delete profile.active_program_id;
      delete profile.active_program_started_at;
      // Legacy single-active semantic: clearing primary clears the whole set.
      // Callers that want to preserve secondaries use removeActiveProgram.
      delete profile.active_program_ids;
    } else {
      profile.active_program_id = slug;
      if (!profile.active_program_started_at) {
        profile.active_program_started_at = iso(new Date());
      }
      // Ensure the primary is in the multi-program list (idempotent).
      const ids = new Set(profile.active_program_ids ?? []);
      ids.add(slug);
      profile.active_program_ids = Array.from(ids);
    }
    s.user_profile = profile;
    commit(s);
    set({ store: s });
  },

  addSecondaryProgram: (slug) => {
    const s = { ...get().store };
    const profile = { ...(s.user_profile ?? {}) };

    // Launch cap: 1 main track per user. Multi-main is fully implemented in
    // the store + Today rendering but disabled for launch to (a) avoid the
    // interference-math UX burden, (b) keep beta users on a single, focused
    // arc. Behaves as REPLACE when a slug is added while another primary
    // exists — same UX as the "Replace instead" button on the preview page.
    // Toggle back to true when multi-track main is a shipping feature.
    const MULTI_MAIN_ENABLED = false;
    if (
      !MULTI_MAIN_ENABLED &&
      profile.active_program_id &&
      profile.active_program_id !== slug
    ) {
      profile.active_program_id = slug;
      profile.active_program_ids = [slug];
      profile.active_program_started_at = iso(new Date());
      s.user_profile = profile;
      commit(s);
      set({ store: s });
      return;
    }

    const ids = new Set(profile.active_program_ids ?? []);
    if (profile.active_program_id) ids.add(profile.active_program_id);
    ids.add(slug);
    profile.active_program_ids = Array.from(ids);
    if (!profile.active_program_id) {
      // No primary yet — the newly-added slug becomes primary too.
      profile.active_program_id = slug;
      profile.active_program_started_at = iso(new Date());
    }
    s.user_profile = profile;
    commit(s);
    set({ store: s });
  },

  addSecondaryProgramForce: (slug) => {
    const s = { ...get().store };
    const profile = { ...(s.user_profile ?? {}) };
    const ids = new Set(profile.active_program_ids ?? []);
    if (profile.active_program_id) ids.add(profile.active_program_id);
    ids.add(slug);
    profile.active_program_ids = Array.from(ids);
    if (!profile.active_program_id) {
      profile.active_program_id = slug;
      profile.active_program_started_at = iso(new Date());
    }
    s.user_profile = profile;
    commit(s);
    set({ store: s });
  },

  removeActiveProgram: (slug) => {
    const s = { ...get().store };
    const profile = { ...(s.user_profile ?? {}) };
    const remaining = (profile.active_program_ids ?? []).filter((x) => x !== slug);
    profile.active_program_ids = remaining.length ? remaining : undefined;
    if (profile.active_program_id === slug) {
      // Promote the next one to primary, or clear if none left.
      if (remaining.length) {
        profile.active_program_id = remaining[0];
      } else {
        delete profile.active_program_id;
        delete profile.active_program_started_at;
      }
    }
    s.user_profile = profile;
    commit(s);
    set({ store: s });
  },

  dismissPlanReveal: (slug) => {
    const s = { ...get().store };
    const profile = { ...(s.user_profile ?? {}) };
    const states = { ...(profile.program_states ?? {}) };
    states[slug] = { ...(states[slug] ?? {}), reveal_seen: true };
    profile.program_states = states;
    s.user_profile = profile;
    commit(s);
    set({ store: s });
  },

  writeGenerationTrace: (slug, trace) => {
    const s = { ...get().store };
    const profile = { ...(s.user_profile ?? {}) };
    const states = { ...(profile.program_states ?? {}) };
    states[slug] = {
      ...(states[slug] ?? {}),
      generation_trace: {
        strategy: trace.strategy,
        tier_id: trace.tier_id,
        seed: trace.seed,
        answered_at: new Date().toISOString(),
        input_snapshot: trace.input_snapshot,
        version: "phase_a_stub_v1",
      },
    };
    profile.program_states = states;
    s.user_profile = profile;
    commit(s);
    set({ store: s });
  },

  setProgramTier: (slug, tier) => {
    const s = { ...get().store };
    const profile = { ...(s.user_profile ?? {}) };
    const states = { ...(profile.program_states ?? {}) };
    states[slug] = { ...(states[slug] ?? {}), tier };
    profile.program_states = states;
    s.user_profile = profile;
    commit(s);
    set({ store: s });
  },

  recordCapabilityMeasurement: (testId, value, unit) => {
    const s = { ...get().store };
    const profile = { ...(s.user_profile ?? {}) };
    const caps = { ...(profile.capability_profile ?? {}) };
    const prior = caps[testId];
    caps[testId] = {
      estimated_level: prior?.estimated_level ?? 3,
      confidence: "physical_test",
      last_measured_at: new Date().toISOString(),
      measured_value: value,
      ...(unit ? { measured_unit: unit } : prior?.measured_unit ? { measured_unit: prior.measured_unit } : {}),
    };
    profile.capability_profile = caps;
    s.user_profile = profile;
    commit(s);
    set({ store: s });
  },

  promoteTier: (slug, newTierId, trigger = "retest") => {
    const s = { ...get().store };
    const profile = { ...(s.user_profile ?? {}) };
    const states = { ...(profile.program_states ?? {}) };
    const prior = states[slug] ?? {};
    const history = [...((prior as { tier_history?: unknown[] }).tier_history ?? [])] as Array<{
      from_tier: string;
      to_tier: string;
      at: string;
      trigger: "retest" | "manual";
    }>;
    history.push({
      from_tier: prior.tier ?? "",
      to_tier: newTierId,
      at: new Date().toISOString(),
      trigger,
    });
    states[slug] = {
      ...prior,
      tier: newTierId,
      tier_history: history,
      // Clear dismissal so future proposals aren't blocked by the old marker.
      tier_proposal_dismissed_for: undefined,
    };
    profile.program_states = states;
    s.user_profile = profile;
    commit(s);
    set({ store: s });
  },

  dismissTierProposal: (slug, key) => {
    const s = { ...get().store };
    const profile = { ...(s.user_profile ?? {}) };
    const states = { ...(profile.program_states ?? {}) };
    states[slug] = {
      ...(states[slug] ?? {}),
      tier_proposal_dismissed_for: key,
    };
    profile.program_states = states;
    s.user_profile = profile;
    commit(s);
    set({ store: s });
  },

  advancePhase: (slug, daysToShift) => {
    const s = { ...get().store };
    const profile = { ...(s.user_profile ?? {}) };
    const states = { ...(profile.program_states ?? {}) };
    states[slug] = {
      ...(states[slug] ?? {}),
      phase_shift_days: daysToShift,
    };
    profile.program_states = states;
    s.user_profile = profile;
    commit(s);
    set({ store: s });
  },

  resetForNewSession: () => {
    // Reset in-memory + localStorage only. NEVER push to KV — we don't want to
    // clobber either the previous user's or the new user's server data during
    // a session transition.
    const empty: Store = { ...initial, updated_at: Date.now() };
    saveStore(empty);
    try {
      // Per-device UI flags — clearing so the new user gets first-run treatment.
      localStorage.removeItem("program.onboarding.done");
      localStorage.removeItem("program.firstrun.dismissed");
      localStorage.removeItem("program.log.v2.seeded");
      localStorage.removeItem("program.coach.history.v1");
    } catch { /* ignore */ }
    set({ store: empty, hydrated: false });
  },

  setSessionIdentity: (uid, email) => {
    const s = { ...get().store };
    const profile = { ...(s.user_profile ?? {}) };
    if (uid) profile.uid = uid;
    else delete profile.uid;
    if (email) profile.email = email;
    else delete profile.email;
    s.user_profile = profile;
    commit(s);
    set({ store: s });
  },
}));

function synthSetsFromLegacy(ex: ExerciseLog): SetLog[] {
  if (ex.weight_kg != null || ex.reps != null || ex.rpe != null) {
    return [
      {
        weight_kg: ex.weight_kg ?? null,
        reps: ex.reps ?? null,
        rpe: ex.rpe ?? null,
      },
    ];
  }
  return [];
}

function hasAnyLoggedSet(sets: SetLog[]): boolean {
  return sets.some(
    (s) => (s.weight_kg != null && s.weight_kg > 0) || (s.reps != null && s.reps > 0),
  );
}

/**
 * Helper for components: returns the raw entry from the store for a given date.
 * Defaults to today. Components synthesise `sets` from legacy fields via
 * `entrySets()` — doing it in the selector creates new objects and loops.
 */
export function useDayExercise(
  blockId: string,
  exId: string,
  date?: string,
): ExerciseLog | null {
  const d = date ?? today();
  return useStore((state) => {
    const key = `${blockId}:${exId}`;
    const day = state.store.logs[d];
    return day?.exercises[key] ?? null;
  });
}

/** Alias kept for backward compatibility; prefer useDayExercise. */
export const useTodayExercise = useDayExercise;

/** Get the sets array for an exercise log, synthesising from legacy fields if needed. */
export function entrySets(entry: ExerciseLog | null | undefined): SetLog[] {
  if (!entry) return [];
  if (entry.sets && entry.sets.length) return entry.sets;
  return synthSetsFromLegacy(entry);
}
