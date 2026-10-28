import type { IntakeQuestion, PlanTier, Program } from "@/lib/schemas";

/**
 * Pure helpers for the quick start. No React, so the wording and the safe-value
 * rules are testable on their own.
 */

/** "Tier A — No hang yet" -> "No hang yet". Labels without a prefix are kept. */
export function stripTierPrefix(label: string): string {
  return label.replace(/^Tier\s+[A-Z0-9]+\s*[—–-]\s*/i, "").trim();
}

/**
 * Card title + subline for a level. Labels shaped "Foundation — 2K > 9:00"
 * carry their own plain reading after the dash, so that becomes the subline and
 * the head becomes the title; otherwise the subline is read from `condition`.
 */
export function levelCopy(
  program: Program,
  tier: PlanTier,
): { title: string; reading: string | null } {
  const stripped = stripTierPrefix(tier.label);
  const m = stripped.match(/^(.+?)\s+[—–]\s+(.+)$/);
  if (m && stripped === tier.label) {
    return { title: m[1], reading: m[2] };
  }
  return { title: stripped, reading: tier.level_summary ?? readCondition(program, tier.condition) };
}

type Named = { label: string; unit?: string };

function nameFor(program: Program, id: string): Named | null {
  const t = program.intake?.physical_tests?.find((x) => x.id === id);
  if (t) return { label: t.label, unit: t.unit };
  // Questions are deliberately not read: their labels are whole sentences
  // ("How many hours of cardio have you done per week...") and make a bad subline.
  return null;
}

const OPS: Record<string, string> = {
  ">=": "at least",
  "<=": "at most",
  ">": "over",
  "<": "under",
};

function clause(program: Program, raw: string): string | null {
  const c = raw.replace(/[()]/g, "").trim();
  const m = c.match(/^(!)?\s*([a-z0-9_]+)\s*(>=|<=|==|!=|>|<)?\s*(.*)$/i);
  if (!m) return null;
  const [, neg, id, op, rhsRaw] = m;
  const n = nameFor(program, id);
  if (!n) return null;
  const subject = n.label.replace(/\s*\(.*?\)\s*/g, " ").replace(/,.*$/, "").replace(/\s+[—–]\s+.*$/, "").trim();
  const lower = subject.charAt(0).toLowerCase() + subject.slice(1);
  if (!op) return neg ? `no ${lower}` : lower;
  const rhs = rhsRaw.trim().replace(/^['"]|['"]$/g, "");
  if (op === "==" || op === "!=") {
    const q = program.intake?.questions.find((x) => x.id === id);
    const opt = q?.options?.find((o) => o.value === rhs);
    const shown = opt?.label ?? (rhs === "true" ? "yes" : rhs === "false" ? "no" : rhs);
    return `${lower}${op === "==" ? ": " : " not: "}${shown}`;
  }
  const unit = !n.unit
    ? ""
    : n.unit === "reps"
      ? rhs === "1" ? " rep" : " reps"
      : ` ${n.unit === "seconds" ? "s" : n.unit}`;
  return `${lower} ${OPS[op]} ${rhs}${unit}`;
}

/** One-line plain reading of a tier condition, or null when it can't be read. */
export function readCondition(program: Program, condition: string): string | null {
  const ors = condition.split("||").map((s) => s.trim());
  const parts: string[] = [];
  for (const orPart of ors) {
    const ands = orPart.split("&&").map((c) => clause(program, c));
    if (ands.some((a) => a == null)) return null;
    parts.push((ands as string[]).join(", "));
  }
  const out = parts.join(" or ");
  if (out.length > 90) return null;
  return out.charAt(0).toUpperCase() + out.slice(1);
}

/** "By week 8-10: first rep" -> "Typically by week 8-10: first rep". Never a promise. */
export function outcomeLine(tier: PlanTier, fallbackWeeks: number | undefined): string {
  const text = tier.typical_outcome.trim();
  const m = text.match(/^by\s+(weeks?\s+[\d\s\-–]+?)\s*:\s*(.+)$/i);
  if (m) {
    return `Typically by ${m[1].trim().toLowerCase()}: ${m[2].charAt(0).toLowerCase()}${m[2].slice(1)}`;
  }
  const body = text.charAt(0).toLowerCase() + text.slice(1);
  return fallbackWeeks ? `Typically by week ${fallbackWeeks}: ${body}` : `Typically: ${body}`;
}

function adj(tier: PlanTier, key: string): number | undefined {
  const v = tier.program_adjustments?.[key];
  return typeof v === "number" ? v : undefined;
}

export type PlanStats = {
  weeks: number | null;
  defaultDays: number;
  dayOptions: string[];
  minutes: string | null;
};

/** The three stat tiles. Everything is read from the program, with sane fallbacks. */
export function planStats(
  program: Program,
  tier: PlanTier,
  durationWeeks: number | undefined,
): PlanStats {
  const sc = program.schedule_constraints;
  const q = program.intake?.questions.find((x) => x.id === "days_per_week");
  let options = (q?.options ?? []).map((o) => o.value).filter((v) => /^\d+$/.test(v));
  const range = sc?.session_count_per_week_range;
  if (range) {
    // Never offer a count below the floor: the full intake blocks it.
    const inRange = options.filter((v) => Number(v) >= range[0] && Number(v) <= range[1]);
    if (inRange.length) options = inRange;
  }
  if (!options.length) options = ["2", "3", "4", "5"];
  const wanted = adj(tier, "sessions_per_week") ?? range?.[0] ?? 3;
  const defaultDays = Number(
    options.reduce((best, v) =>
      Math.abs(Number(v) - wanted) < Math.abs(Number(best) - wanted) ? v : best,
    ),
  );
  const len = adj(tier, "session_length_min");
  const lr = sc?.session_length_min_range;
  const minutes = len ? `${len}` : lr ? `${lr[0]}–${lr[1]}` : null;
  return {
    weeks: durationWeeks ?? tier.full_goal_weeks_estimate ?? null,
    defaultDays,
    dayOptions: options,
    minutes,
  };
}

/**
 * The questions the Safety screen asks: every gate question, every question an
 * `intake_exclusions` rule reads, and the known symptom-history ids. Text
 * questions and the optional resting-HR flag are not safety questions.
 */
const SYMPTOM_HISTORY_IDS = ["shoulder_pain_overhead", "wrist_pain_12mo", "joint_issues"];

export function safetyQuestions(program: Program): IntakeQuestion[] {
  const intake = program.intake;
  if (!intake) return [];
  const ids = new Set<string>([
    ...(intake.safety_gates ?? []).map((g) => g.question_id),
    ...(program.intake_exclusions ?? []).map((e) => e.question_id),
    ...SYMPTOM_HISTORY_IDS,
  ]);
  ids.delete("consent_symptom_data");
  return intake.questions.filter(
    (q) => ids.has(q.id) && q.type !== "text" && (q.type === "boolean" || (q.options?.length ?? 0) > 0),
  );
}

/** Options for a row. Booleans get Yes / No. */
export function rowOptions(q: IntakeQuestion): Array<{ value: string; label: string }> {
  if (q.type === "boolean") {
    return [
      { value: "false", label: "No" },
      { value: "true", label: "Yes" },
    ];
  }
  return (q.options ?? []).map((o) => ({
    value: o.value,
    label: o.label ?? o.value.replace(/_/g, " "),
  }));
}

/**
 * The "nothing here" answer for a question, or null when there isn't an
 * unambiguous one (a prerequisite like "strict pull-ups: under 3" is not a
 * symptom; it has no "none" and must be answered).
 */
export function safeValue(q: IntakeQuestion): string | null {
  if (q.type === "boolean") return "false";
  const values = (q.options ?? []).map((o) => o.value);
  for (const v of ["no", "none"]) if (values.includes(v)) return v;
  return null;
}

/** Sets every question that has a safe value to it; leaves the rest untouched. */
export function applyNoneOfThese(
  questions: IntakeQuestion[],
  answers: Record<string, string>,
): Record<string, string> {
  const next = { ...answers };
  for (const q of questions) {
    const v = safeValue(q);
    if (v != null) next[q.id] = v;
  }
  return next;
}
