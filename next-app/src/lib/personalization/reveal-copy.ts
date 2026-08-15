import type { Program, Store } from "../schemas";

export type RevealCopy = {
  headline: string;
  schedule_line: string;
  tier_line: string;
  phase_lines: string[];
  attribution_line: string;
  cta_primary: string;
};

/**
 * Given the program + the user's intake data, produce the "your plan is built"
 * reveal copy. Pure function — no store reads, no random. Unit-testable.
 *
 * This is the core of Phase A: it makes intake answers visible on Today so
 * "personal" stops being a marketing word. It reads only data the user has
 * already given us; it doesn't collect anything new.
 */
type CapabilityProfile = NonNullable<NonNullable<Store["user_profile"]>["capability_profile"]>;

export function buildRevealCopy(
  program: Program,
  intakeAnswers: Record<string, string> | undefined,
  tierId: string | undefined,
  capabilityProfile: CapabilityProfile | undefined,
): RevealCopy {
  const programName = deriveProgramName(program);
  const tierLabel = tierLabelFromId(program, tierId);
  const modality = intakeAnswers?.goal_modality ?? intakeAnswers?.modality_preference ?? null;
  // Prefer the user's answered days_per_week — that's the number they'll
  // actually train. Fall back to what the program's weekly_template implies.
  const daysAnswered = intakeAnswers?.days_per_week;
  const sessionCount = daysAnswered ?? deriveSessionCount(program);
  const sessionLength = intakeAnswers?.session_length_min ?? null;

  const headline = `Your ${programName} plan is built.`;

  // Schedule line — modality (row / bike / ski / run) + session count + length
  const schedulePieces: string[] = [];
  if (modality) schedulePieces.push(humanModality(modality));
  if (sessionCount) schedulePieces.push(`${sessionCount} sessions/wk`);
  if (sessionLength) schedulePieces.push(`~${sessionLength} min each`);
  const schedule_line = schedulePieces.length
    ? schedulePieces.join(" · ")
    : "Weekly rhythm shown in Week view.";

  // If no tier was inferred (program has no plan_tiers, e.g. anterior-hip),
  // surface the first phase's intent so the user sees "you're starting here"
  // rather than a generic slogan.
  const firstPhase = program.phases?.[0];
  const tier_line = tierLabel
    ? `Starting at ${tierLabel} — your intake put you here.`
    : firstPhase?.goal
      ? `First up: ${firstPhase.goal.replace(/^./, (c) => c.toLowerCase())}`
      : firstPhase?.name
        ? `First phase: ${humanPhaseName(firstPhase.name)}`
        : "Adapts as you log.";

  // Phase lines — abridged, one sentence per phase
  const phase_lines = (program.phases ?? [])
    .filter((ph) => ph.goal || ph.name)
    .slice(0, 4)
    .map((ph) => {
      const label = humanPhaseName(ph.name);
      const goal = ph.goal ? ` — ${ph.goal}` : "";
      return `${label}${goal}`;
    });

  // Attribution — what specifically made this plan yours
  const attributionParts: string[] = [];
  const capEntries = capabilityProfile ? Object.entries(capabilityProfile) : [];
  const measuredCap = capEntries.find(
    ([, entry]) =>
      entry && typeof entry === "object" && "confidence" in entry && (entry as { confidence?: string }).confidence === "physical_test",
  );
  if (measuredCap) {
    const [domain, entry] = measuredCap as [string, { estimated_level?: number; measured_value?: number; measured_unit?: string }];
    const level = entry.estimated_level;
    const value = entry.measured_value;
    const unit = entry.measured_unit;
    if (value != null && unit) {
      attributionParts.push(`${humanDomain(domain)} = ${value}${unit}`);
    } else if (level != null) {
      attributionParts.push(`${humanDomain(domain)} at level ${level}`);
    }
  }
  if (modality) attributionParts.push(`${humanModality(modality)} over other modalities (your pick)`);
  // Fallback: name the first-week focus by inspecting the first block's items
  // count / category, so a program without intake still gets a concrete line.
  let attribution_line: string;
  if (attributionParts.length) {
    attribution_line = `Composed for: ${attributionParts.join(" · ")}`;
  } else if (firstPhase?.blocks?.length) {
    const first = firstPhase.blocks[0];
    attribution_line = `Week 1 opens with ${first.replace(/^block_/, "").replace(/_/g, " ")}.`;
  } else {
    attribution_line = "Adapts as you log every session.";
  }

  return {
    headline,
    schedule_line,
    tier_line,
    phase_lines,
    attribution_line,
    cta_primary: "Go to today's session",
  };
}

/**
 * Program display name from goal.display_name if present, else the slug.
 * Intentionally does NOT read from the manifest (that'd require an async
 * caller); accepts what the program JSON already ships.
 */
function deriveProgramName(program: Program): string {
  const goal = program.program_goal;
  if (goal?.display_name) return goal.display_name.replace(/\s+/g, " ").trim();
  const slug = (program as unknown as { slug?: string }).slug;
  if (slug) return slug.replace(/-/g, " ");
  return "Terav";
}

function tierLabelFromId(program: Program, tierId: string | undefined): string | null {
  if (!tierId || !program.plan_tiers) return null;
  const match = program.plan_tiers.find((t) => t.id === tierId);
  return match?.label ?? null;
}

/**
 * Rough session count from the weekly_template. Best-effort — different
 * programs shape their weekly_template differently. Returns null when we
 * can't confidently derive.
 */
function deriveSessionCount(program: Program): number | null {
  const wt = program.weekly_template as
    | Record<string, unknown>
    | undefined;
  if (!wt) return null;
  // Legacy shape: `week: [{ day, session }]`
  const week = (wt as { week?: unknown }).week;
  if (Array.isArray(week)) {
    return week.filter((w) => {
      if (!w || typeof w !== "object") return false;
      const session = (w as { session?: string }).session;
      return typeof session === "string" && session.trim().length > 0;
    }).length;
  }
  // Multi-dim shape: `reference_week_tier_*.sessions`
  for (const key of Object.keys(wt)) {
    if (key.startsWith("reference_week")) {
      const ref = wt[key] as { sessions?: number } | undefined;
      if (ref?.sessions) return ref.sessions;
    }
  }
  return null;
}

function humanPhaseName(name: string): string {
  return name.replace(/\s*\([^)]+\)\s*$/, "").replace(/\s*—.*$/, "").trim();
}

function humanModality(m: string): string {
  const map: Record<string, string> = {
    row: "Rowing",
    row_ski: "Rowing / ski-erg",
    bike: "Cycling",
    ski: "Ski-erg",
    run: "Running",
    running: "Running",
    hybrid: "Mixed modalities",
  };
  return map[m.toLowerCase()] ?? m.replace(/_/g, " ");
}

function humanDomain(d: string): string {
  return d
    .replace(/_/g, " ")
    .replace(/^./, (c) => c.toUpperCase());
}
