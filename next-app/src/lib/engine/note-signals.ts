/**
 * Keyword-based signal extractor for free-text training notes.
 *
 * Stopgap until the Coach (LLM) is wired up. The engine reads these signals to
 * PROPOSE (never auto-apply) a load reduction on the following session.
 *
 * The Estonian training vocabulary is included alongside English because the
 * user thinks in both. Additions are cheap — patterns are conservative on purpose.
 */

import type { DayLog } from "../schemas";

export type FatigueLevel = "high" | "elevated" | "normal";

export type NoteSignals = {
  fatigue: FatigueLevel;
  externalLoad: boolean; // padel, hiking, long day, etc.
  pain: boolean;
  easy: boolean;
  /**
   * Batch 36 Phase-A additions.
   * `radicular` — nerve-involvement signal (tingling, pins-and-needles, pain
   *   radiating down/into leg). Explicit exclusion of "numbing"/"numb" per
   *   founder clarification 2026-08-21: those words are often muscular-
   *   weakness descriptions in personal vocabulary, not neurological. False
   *   positive risk too high to include.
   * `weakness` — informational only, NOT a red-flag. Fires when a user notes
   *   feeling weaker than expected at a load. Complements STIFF (fatigue)
   *   by capturing capability-at-load descriptions.
   * `programFeedback` — user commenting on programming ("2 days in a row",
   *   "48h between", "next cycle"). Feeds a founder-facing review queue,
   *   not the training engine's Accept/Ignore proposal path.
   */
  radicular: boolean;
  /**
   * Where it was felt, with side when the note gives one — "groin (left)",
   * "buttock/SI (left)". Empty when the note names no site.
   */
  sites: string[];
  weakness: boolean;
  programFeedback: boolean;
  /** Within-session RPE drift (avg of last 2 sets − avg of first 2 sets). null when unmeasurable. */
  rpeDrift: number | null;
  /** Human-readable labels of what matched, for surfacing in the UI. */
  matches: string[];
};

// Word-boundary matchers. `\b` is fine for both English and Estonian roots here.
const HIGH_FATIGUE = /\b(exhaust\w*|wrecked|toast|hangover|hungover|sick|flu|fever|no ?sleep|didn['’]?t ?sleep|tough ?week|beat ?up|beaten|väsi\w*|magamata|haige)\b/i;
// Batch 36 Phase-A additions to STIFF: bounce/bouncing (form breakdown from
// fatigue), no-strength-at-parallel (depth capability loss). Both surfaced
// from Aug 19-20 founder notes as unmatched fatigue signals.
const STIFF = /\b(stiff|sore|tight|tired|fatigued|drained|dead|heavy|slow|sluggish|bounc\w+|no ?strength ?at ?parallel|below ?parallel|krambid|krampis|kanged?|väsinud|jäik|jäigad)\b/i;
const EXTERNAL_LOAD = /\b(padel|padle|tennis|hike|hiked|hiking|climbed|climbing|match|game|long ?day|late ?night|long ?weekend|festival|party|long ?run|ran \d+ ?km|drive|drove \d+|walked \d+|matk|matkasin|reisisin|reisil|pidu|peol)\b/i;
// Includes movement-quality words (click, catch, stuck) that skill/mobility
// users type without meaning clinical pain. Feeds the load-reduction signal
// (proposes 5-10% off next session), NOT any rehab-specific escalation —
// Terav is a training app, not a rehab tool.
const PAIN = /\b(pain|hurt\w*|sharp|twinge|flare|shooting|pinch|ache|aching|click\w*|clunk\w*|catch\w*|stuck|giving ?way|gave ?way|valu\w*|valus|torkab|kipitab)\b/i;
// Batch 36 Phase-A additions to EASY: controlled/in-control (positive
// stability signal, moving well at load). Surfaced from Aug 17+19 founder
// notes ("feels so much more controlled", "feels controlled") as unmatched
// positive-adaptation vocabulary.
const EASY = /\b(easy|light|grooved|snappy|smooth|effortless|controlled|in ?control|too ?easy|felt ?good|felt ?great|felt ?strong|kerge|hea tunne|lihtne|sujus|kontrolli all)\b/i;

// Batch 36 Phase-A NEW pattern — RADICULAR (nerve-involvement signal).
// Deliberately EXCLUDES "numb"/"numbing" per founder clarification 2026-08-21:
// those words are often muscular-weakness descriptions, not neurological.
// Only unambiguous radicular vocabulary lands here. Fires on the red state
// via progression_rules.or_radicular_flavor_present.
// Numbness and pulsation added 2026-08-27. The founder's 19 Aug note read
// "left buttocks stiff ... when deadlifting, gives numbing pulsation
// there", and his 17 Aug note "make lower back pulsate" — neither matched
// anything, so the strongest neural language in his whole log scored as
// ordinary stiffness. `clinical-context.json` treats this territory
// carefully for a reason; the extractor should at least see it.
const RADICULAR =
  /\b(tingling|tingl\w+|pins ?and ?needles|shooting ?(down|into|along)|radiating|radiat\w+ ?(down|into|along)|numb\w*|pulsat\w+|pulsate\w*|throb\w+|kihelus|kipituse|tuim\w*|surin\w*)\b/i;

/**
 * WHERE it was felt (2026-08-27).
 *
 * The extractor read intensity but never site, so "a little bit front
 * groin left" and "left buttocks stiff" collapsed into the same
 * undifferentiated "pain" as a sore shoulder. Site is the whole point in
 * this file's clinical context: anterior groin is the documented symptom,
 * and a left buttock / SI ache lasting past 48h is a named red flag with
 * a defined action (`persistent_si_ache` → back off two steps).
 */
const SITE_GROIN = /\b(groin|adductor|kubeme?|kube)\b/i;
const SITE_BUTTOCK_SI = /\b(buttock\w*|glute\w*|si ?joint|sacroiliac|tuhar\w*)\b/i;
const SITE_LOW_BACK = /\b(low(er)? ?back|lumbar|alaselg\w*|selja?)\b/i;
const SIDE_LEFT = /\b(left|vasak\w*)\b/i;
const SIDE_RIGHT = /\b(right|parem\w*)\b/i;

// Batch 36 Phase-A NEW pattern — WEAKNESS (informational, not red-flag).
// Complements STIFF (fatigue vocab) by capturing capability-at-load
// descriptions. Weight-relative interpretation happens downstream in the
// engine (weakness at 60% TM = strong signal; weakness at 100% TM = expected).
const WEAKNESS = /\b(weak\w+|weakness|felt ?weaker|couldn'?t ?push|no ?power|no ?legs|nõrku|nõrk)\b/i;

// Batch 36 Phase-A NEW pattern — PROGRAM_FEEDBACK. User commenting on
// programming (spacing, cycle structure, rest between). Feeds a founder-
// facing review queue, NOT the training engine's Accept/Ignore path. This
// is data about the PROGRAM, not the user's readiness.
const PROGRAM_FEEDBACK = /\b(days? ?in ?a ?row|back ?to ?back|rest ?between|48 ?hours?|48 ?h\b|next ?cycle|too ?many ?days)\b/i;

/**
 * Parse a single free-text string into a signal set.
 * Empty / whitespace input returns a normal-fatigue, no-flag baseline.
 */
export function extractSignals(text: string | undefined | null): NoteSignals {
  const t = (text ?? "").trim();
  const base: NoteSignals = {
    fatigue: "normal",
    externalLoad: false,
    pain: false,
    easy: false,
    radicular: false,
    sites: [],
    weakness: false,
    programFeedback: false,
    rpeDrift: null,
    matches: [],
  };
  if (!t) return base;

  const isHigh = HIGH_FATIGUE.test(t);
  const isStiff = STIFF.test(t);
  const isExtLoad = EXTERNAL_LOAD.test(t);
  const isPain = PAIN.test(t);
  const isEasy = EASY.test(t);
  const isRadicular = RADICULAR.test(t);
  const isWeakness = WEAKNESS.test(t);
  const isProgramFeedback = PROGRAM_FEEDBACK.test(t);

  const matches: string[] = [];
  if (isHigh) matches.push("high fatigue");
  if (isStiff) matches.push("stiff/sore");
  if (isExtLoad) matches.push("outside load");
  if (isPain) matches.push("pain");
  if (isEasy) matches.push("felt easy");
  if (isRadicular) matches.push("radicular flavor");

  // Site, with side when the note says one. Reported as a match so it
  // reaches the Coach line and the weekly narrative instead of being
  // flattened into "pain".
  const side = SIDE_LEFT.test(t) ? " (left)" : SIDE_RIGHT.test(t) ? " (right)" : "";
  const sites: string[] = [];
  if (SITE_GROIN.test(t)) sites.push(`groin${side}`);
  if (SITE_BUTTOCK_SI.test(t)) sites.push(`buttock/SI${side}`);
  if (SITE_LOW_BACK.test(t)) sites.push(`low back${side}`);
  for (const site of sites) matches.push(site);
  if (isWeakness) matches.push("weakness at load");
  if (isProgramFeedback) matches.push("program feedback");

  let fatigue: FatigueLevel = "normal";
  if (isHigh || (isStiff && isExtLoad)) fatigue = "high";
  else if (isStiff || isExtLoad) fatigue = "elevated";

  return {
    fatigue,
    externalLoad: isExtLoad,
    pain: isPain,
    easy: isEasy,
    radicular: isRadicular,
    sites,
    weakness: isWeakness,
    programFeedback: isProgramFeedback,
    rpeDrift: null,
    matches,
  };
}

/**
 * Compute the largest cross-set RPE drift across every exercise on the day.
 * Drift = (mean RPE of last two sets) − (mean RPE of first two sets).
 * Requires ≥ 3 sets with RPE recorded on at least one exercise. Otherwise null.
 *
 * A steep positive drift (6 → 9 across a 5-set squat) means the athlete cooked
 * himself. It's a stronger fatigue signal than any single-set RPE.
 */
export function detectRpeDrift(
  day: import("../schemas").DayLog | null | undefined,
): { drift: number; from: number; to: number; exerciseKey: string } | null {
  if (!day) return null;
  let best: { drift: number; from: number; to: number; exerciseKey: string } | null = null;
  for (const [key, ex] of Object.entries(day.exercises)) {
    const sets = ex.sets ?? [];
    const rpes = sets.map((s) => s.rpe).filter((r): r is number => typeof r === "number");
    if (rpes.length < 3) continue;
    const first = (rpes[0] + rpes[1]) / 2;
    const last = (rpes[rpes.length - 1] + rpes[rpes.length - 2]) / 2;
    const drift = last - first;
    if (!best || drift > best.drift) {
      best = {
        drift,
        from: Math.round(first * 10) / 10,
        to: Math.round(last * 10) / 10,
        exerciseKey: key,
      };
    }
  }
  return best;
}

/**
 * Merge two signal sets. Used to fold day-note + exercise-notes + set-notes into
 * one aggregate view for a given date.
 */
function merge(a: NoteSignals, b: NoteSignals): NoteSignals {
  const rank = { normal: 0, elevated: 1, high: 2 } as const;
  const fatigue = rank[a.fatigue] >= rank[b.fatigue] ? a.fatigue : b.fatigue;
  const seen = new Set(a.matches);
  const merged = [...a.matches];
  for (const m of b.matches) if (!seen.has(m)) { merged.push(m); seen.add(m); }
  // Keep the larger drift signal.
  const rpeDrift =
    a.rpeDrift == null ? b.rpeDrift : b.rpeDrift == null ? a.rpeDrift : Math.max(a.rpeDrift, b.rpeDrift);
  return {
    fatigue,
    externalLoad: a.externalLoad || b.externalLoad,
    pain: a.pain || b.pain,
    easy: a.easy || b.easy,
    radicular: a.radicular || b.radicular,
    // Union, deduped — two exercises can each name a different site.
    sites: Array.from(new Set([...a.sites, ...b.sites])),
    weakness: a.weakness || b.weakness,
    programFeedback: a.programFeedback || b.programFeedback,
    rpeDrift,
    matches: merged,
  };
}

/**
 * Aggregate signals from every text field on a day: day.notes + each exercise's
 * `notes` + each set's `notes`. Returns the normal baseline for undefined days.
 */
export function daySignals(day: DayLog | null | undefined): NoteSignals {
  const base: NoteSignals = {
    fatigue: "normal",
    externalLoad: false,
    pain: false,
    easy: false,
    radicular: false,
    sites: [],
    weakness: false,
    programFeedback: false,
    rpeDrift: null,
    matches: [],
  };
  if (!day) return base;
  let acc = merge(base, extractSignals(day.notes));
  // Structured outside-load field from the morning check — treat it as a note.
  if (day.symptoms?.outside_training) {
    acc = merge(acc, extractSignals(day.symptoms.outside_training));
    // Any content in the field itself flags external load, even if no keyword matched.
    if (day.symptoms.outside_training.trim() && !acc.externalLoad) {
      acc.externalLoad = true;
      if (!acc.matches.includes("outside load")) acc.matches = [...acc.matches, "outside load"];
    }
  }
  // Structured life_load 0-10 slider from the morning check.
  const life = day.symptoms?.life_load ?? 0;
  if (life >= 7) {
    if (!acc.matches.includes(`life load ${life}/10`)) acc.matches = [...acc.matches, `life load ${life}/10`];
    const rank = { normal: 0, elevated: 1, high: 2 } as const;
    if (rank["high"] > rank[acc.fatigue]) acc.fatigue = "high";
  } else if (life >= 4) {
    if (!acc.matches.includes(`life load ${life}/10`)) acc.matches = [...acc.matches, `life load ${life}/10`];
    const rank = { normal: 0, elevated: 1, high: 2 } as const;
    if (rank["elevated"] > rank[acc.fatigue]) acc.fatigue = "elevated";
  }
  for (const ex of Object.values(day.exercises)) {
    if (ex.notes) acc = merge(acc, extractSignals(ex.notes));
    if (ex.sets) {
      for (const st of ex.sets) if (st.notes) acc = merge(acc, extractSignals(st.notes));
    }
  }
  // Fold in cross-set RPE drift — a stronger signal than any single-set RPE.
  const drift = detectRpeDrift(day);
  if (drift && drift.drift >= 1.5) {
    const label = `RPE drift ${drift.from}→${drift.to}`;
    if (!acc.matches.includes(label)) acc.matches = [...acc.matches, label];
    acc.rpeDrift = drift.drift;
    const rank = { normal: 0, elevated: 1, high: 2 } as const;
    const next: FatigueLevel = drift.drift >= 2.5 ? "high" : "elevated";
    if (rank[next] > rank[acc.fatigue]) acc.fatigue = next;
  }
  // Cardio load from logged runs. Each run contributes to a load score based
  // on duration + intensity (or HR, when present). Rules:
  //   - >45 min OR max HR >170 OR intensity "hard" → elevated
  //   - >60 min at hard OR max HR >180 OR total >90 min combined → high
  //   - Any run at all → externalLoad flag (so next-day proposal sees it)
  let cardioMinutes = 0;
  let cardioHardBucket = 0;
  let cardioHrMax = 0;
  for (const r of day.runs ?? []) {
    const mins = r.minutes ?? (r.total_seconds ? r.total_seconds / 60 : 0);
    cardioMinutes += mins;
    if (r.intensity === "hard") cardioHardBucket += mins;
    if (r.max_hr && r.max_hr > cardioHrMax) cardioHrMax = r.max_hr;
    if (r.intensity === "hard") cardioHardBucket += 5; // small nudge even on short hard efforts
  }
  if (cardioMinutes > 0) {
    if (!acc.externalLoad) {
      acc.externalLoad = true;
      acc.matches = [...acc.matches, `cardio ${Math.round(cardioMinutes)} min`];
    } else {
      acc.matches = [...acc.matches, `cardio ${Math.round(cardioMinutes)} min`];
    }
    const rank = { normal: 0, elevated: 1, high: 2 } as const;
    const isHigh =
      cardioMinutes >= 90 ||
      cardioHardBucket >= 60 ||
      cardioHrMax >= 180;
    const isElevated =
      cardioMinutes >= 45 ||
      cardioHardBucket >= 15 ||
      cardioHrMax >= 170;
    const next: FatigueLevel = isHigh ? "high" : isElevated ? "elevated" : "normal";
    if (rank[next] > rank[acc.fatigue]) acc.fatigue = next;
    if (cardioHrMax >= 170) acc.matches = [...acc.matches, `max HR ${cardioHrMax}`];
  }
  return acc;
}

/**
 * Given detected signals, propose a load multiplier for the *next* strength suggestion.
 * The multiplier is a *proposal only* — the engine must not apply it without an explicit
 * user Accept. Returns `null` when signals don't warrant a proposal.
 */
export function proposedLoadMultiplier(sig: NoteSignals): {
  multiplier: number;
  reason: string;
} | null {
  if (sig.pain) {
    return {
      multiplier: 0.85,
      reason: "Pain mentioned — proposing a lighter session and prioritising rehab work.",
    };
  }
  if (sig.fatigue === "high") {
    const driftBit = sig.rpeDrift != null && sig.rpeDrift >= 2.5
      ? " RPE climbed steeply across last session — real fatigue signal."
      : "";
    return {
      multiplier: 0.9,
      reason: `High fatigue / outside load detected.${driftBit} Take 10% off the top set today?`,
    };
  }
  if (sig.fatigue === "elevated") {
    // Attribute to what actually drove the signal, not a hardcoded
    // "notes" string. Engine delta-2 caught: "Fatigue signals in recent
    // notes" fired on personas with 0 notes because life_load ≥4 also
    // triggers elevated. matches[] carries the real trigger names.
    let attribution: string;
    if (sig.rpeDrift != null && sig.rpeDrift >= 1.5) {
      attribution = "RPE drift across sets last session.";
    } else if (sig.matches.length > 0) {
      // Prefer the most-informative match. life_load slider first because
      // it's the most common non-note trigger for elevated.
      const lifeLoad = sig.matches.find((m) => m.startsWith("life load"));
      const cardio = sig.matches.find((m) => m.startsWith("cardio "));
      const noteMatch = sig.matches.find((m) =>
        ["high fatigue", "stiff/sore", "outside load", "pain"].includes(m),
      );
      const pick = lifeLoad ?? cardio ?? noteMatch ?? sig.matches[0];
      attribution = `Signal: ${pick}.`;
    } else {
      attribution = "Elevated fatigue signal.";
    }
    return {
      multiplier: 0.95,
      reason: `${attribution} Consider trimming 5% from the top set.`,
    };
  }
  return null;
}
