/**
 * Archetype declarations — describes how a simulated user behaves on a given day.
 * Referenced by day-logger.ts to decide what to enter into each exercise card.
 *
 * These are deterministic (seeded) so re-running a simulation gives the same
 * outcome — critical for reproducing bugs that only appear on day 47 of a
 * 180-day arc.
 */

export type Symptoms = {
  low_back?: number;
  groin_left?: number;
  buttock_left?: number;
  shoulder_right?: number;
  life_load?: number;
};

export type Archetype = {
  id: string;
  displayName: string;
  description: string;

  /** Target RPE for prescribed top-set. Higher = closer to failure. */
  rpeTarget: number;
  /** Per-set RPE jitter (± this many points, uniform). */
  rpeJitter: number;

  /**
   * Compliance model. Per day, given the day-of-week, returns whether the
   * user logs the session (true), skips it (false), or moves it (a "move"
   * lands sets on a nearby free day). Deterministic per (archetypeId, day).
   */
  logDecision: (day: number, dow: number) => "log" | "skip" | "move";

  /** Life load 0-10 for the day. */
  lifeLoad: (day: number) => number;

  /** Optional per-day symptoms — used to feed the notes-signal engine. */
  symptoms: (day: number) => Symptoms;

  /** 0-1 chance of accepting an engine-proposed load adjustment. */
  acceptProposal: number;

  /**
   * Load-completion factor. 1.0 = hits prescribed reps at prescribed weight.
   * >1.0 = adds weight (over-performer). <1.0 = misses reps or drops weight.
   */
  loadFactor: (day: number) => number;

  /** Optional plain-text note to include per session. */
  sessionNote: (day: number, dow: number) => string | null;
};

// Simple deterministic hash → [0, 1) — mulberry32 seeded on (archetype, day).
function seededRand(archId: string, day: number, salt: number = 0): number {
  let h = 2166136261 ^ salt;
  const combined = archId + ":" + String(day);
  for (let i = 0; i < combined.length; i++) {
    h ^= combined.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h >>>= 0;
  // mulberry32 step
  h = (h + 0x6D2B79F5) >>> 0;
  let t = Math.imul(h ^ (h >>> 15), 1 | h);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export const OVERPERFORMER: Archetype = {
  id: "overperformer",
  displayName: "Overperformer",
  description: "Crushes every prescribed top-set. RPE 6 when target is 7. Never misses. Notes brag about how easy it felt.",
  rpeTarget: 6.5,
  rpeJitter: 0.5,
  logDecision: () => "log",
  lifeLoad: () => 2,
  symptoms: () => ({ low_back: 0, groin_left: 0, buttock_left: 0, shoulder_right: 0, life_load: 2 }),
  acceptProposal: 0.9,
  loadFactor: () => 1.05, // 5% over prescribed
  sessionNote: (day) => day % 7 === 0 ? "Felt strong — could have added weight." : null,
};

export const UNDERPERFORMER: Archetype = {
  id: "underperformer",
  displayName: "Underperformer",
  description: "Fails prescribed top-set most sessions. RPE 9-10. Drops the last set. Notes mention soreness, poor sleep.",
  rpeTarget: 9,
  rpeJitter: 0.5,
  logDecision: () => "log",
  lifeLoad: (d) => 5 + Math.floor(seededRand("underperformer", d) * 3), // 5-7
  symptoms: (d) => ({
    low_back: 3 + Math.floor(seededRand("underperformer", d, 1) * 3),
    groin_left: 2,
    buttock_left: 1,
    shoulder_right: 2,
    life_load: 6,
  }),
  acceptProposal: 0.7,
  loadFactor: () => 0.92, // 8% under prescribed
  sessionNote: (day, dow) => dow === 1 ? "Tired. Bar felt heavy." : (day % 10 === 0 ? "Soreness lingering into next day." : null),
};

export const CONSISTENT_AVERAGE: Archetype = {
  id: "consistent-average",
  displayName: "Consistent average",
  description: "4-5 sessions/week, RPE within target, normal progression, occasional life event.",
  rpeTarget: 7,
  rpeJitter: 1,
  logDecision: (d, dow) => {
    // Skip 1 out of every ~7 sessions (~14% skip rate).
    return seededRand("consistent-average", d) < 0.14 ? "skip" : "log";
  },
  lifeLoad: (d) => 3 + Math.floor(seededRand("consistent-average", d, 2) * 3),
  symptoms: (d) => ({ low_back: seededRand("consistent-average", d, 5) < 0.2 ? 2 : 0, life_load: 4 }),
  acceptProposal: 0.5,
  loadFactor: () => 1.0,
  sessionNote: () => null,
};

export const ERRATIC: Archetype = {
  id: "erratic",
  displayName: "Erratic",
  description: "40% skip rate. High life_load. Notes mention life stress, travel, poor sleep.",
  rpeTarget: 8,
  rpeJitter: 1.5,
  logDecision: (d) => seededRand("erratic", d) < 0.4 ? "skip" : "log",
  lifeLoad: (d) => 6 + Math.floor(seededRand("erratic", d, 3) * 4), // 6-9
  symptoms: (d) => ({
    low_back: Math.floor(seededRand("erratic", d, 4) * 4),
    life_load: 7,
  }),
  acceptProposal: 0.3,
  loadFactor: () => 0.95,
  sessionNote: (day) => {
    const options = [
      "Slept 5 hours.",
      "Big day at work — brain fried.",
      "Traveling this week.",
      "Kid was up all night.",
      null,
      null,
    ];
    return options[Math.floor(seededRand("erratic", day, 6) * options.length)];
  },
};

export const INJURED_RECOVERY: Archetype = {
  id: "injured-recovery",
  displayName: "Injured recovery",
  description: "First week: high symptom scores. Then gradual reduction over 4 weeks. Then normal.",
  rpeTarget: 7,
  rpeJitter: 1,
  logDecision: (d) => {
    if (d < 7) return "skip";
    if (d < 14) return seededRand("injured-recovery", d) < 0.5 ? "skip" : "log";
    return "log";
  },
  lifeLoad: (d) => d < 7 ? 7 : d < 21 ? 5 : 3,
  symptoms: (d) => {
    const decayed = Math.max(0, 6 - Math.floor(d / 5));
    return { groin_left: decayed, low_back: Math.floor(decayed / 2), life_load: d < 14 ? 6 : 3 };
  },
  acceptProposal: 0.9,
  loadFactor: (d) => d < 14 ? 0.7 : d < 30 ? 0.85 : 1.0,
  sessionNote: (day) => day < 7 ? "Symptoms high — going light." : day < 21 ? "Feeling it come back, but cautious." : null,
};

export const ARCHETYPES = {
  overperformer: OVERPERFORMER,
  underperformer: UNDERPERFORMER,
  "consistent-average": CONSISTENT_AVERAGE,
  erratic: ERRATIC,
  "injured-recovery": INJURED_RECOVERY,
} as const;

export type ArchetypeId = keyof typeof ARCHETYPES;
