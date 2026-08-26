import * as fs from "node:fs";
import * as path from "node:path";
import type { FlowResult } from "./flows";

/**
 * Coverage accounting for the persona sweep (2026-08-24).
 *
 * Written because the harness's coverage had been assumed rather than
 * measured — the 2026-08-24 audit found 63% of routes toured, 0% of
 * interactive surfaces exercised, and 7 of 20 store keys ever written,
 * none of which was visible from the artifacts. This emits the numbers
 * every run so drift is noticed the next time, not a quarter later.
 *
 * Deliberately dumb: it counts what the sweep touched against a declared
 * denominator. It does not know whether a screenshot was any good.
 */

/** Every user-facing route. Excludes /dev, /admin and the auth group. */
export const USER_FACING_ROUTES = [
  "/",
  "/account",
  "/check",
  "/check/hip",
  "/evidence",
  "/extras",
  "/guide",
  "/history",
  "/legal/disclaimer",
  "/legal/privacy",
  "/legal/terms",
  "/off-plan",
  "/plan",
  "/profile",
  "/programs",
  "/programs/[slug]",
  "/programs/[slug]/intake",
  "/progress",
  "/record",
  "/report",
  "/reset-password",
  "/session/[slug]",
  "/settings",
  "/week",
] as const;

/**
 * Interactive surfaces — components gated behind a tap. The tour cannot
 * reach any of these; only flows can. Keep in sync with
 * `grep -rl "BottomSheet\|role=\"dialog\"\|aria-modal" src/`.
 */
export const INTERACTIVE_SURFACES = [
  "ConfirmSheet",
  "InfoSheet",
  "VideoModal",
  "OnboardingRunner",
  "NoteSheet",
  "OffPlanSheet",
  "OverflowSheet",
  "RestTakeover",
  "ExerciseDetailsSheet",
  "MoveSheet",
  "PerProgramActions",
  "RetestLoggingSheet",
  "SessionActions",
  "ProgramPreviewClient",
  "SetView",
] as const;

/** Which surfaces each flow reaches when it completes. */
const FLOW_SURFACES: Record<string, string[]> = {
  "session-log-set": ["SetView", "RestTakeover"],
  "session-edit-past-set": ["SetView"],
  "session-rest-extend": ["RestTakeover"],
  "session-overflow-sheet": ["OverflowSheet"],
  "activity-log-sheet": ["OffPlanSheet"],
  "plan-expand-day": ["PerProgramActions", "SessionActions"],
  "session-note-sheet": ["NoteSheet"],
  "session-exercise-details": ["ExerciseDetailsSheet"],
  "program-preview": ["ProgramPreviewClient"],
  "onboarding-first-run": ["OnboardingRunner"],
  "session-video": ["VideoModal"],
  "programs-info-sheet": ["InfoSheet"],
  "plan-move-sheet": ["MoveSheet"],
  "plan-skip-confirm": ["ConfirmSheet"],
  "retest-logging": ["RetestLoggingSheet"],
  "activity-log-commit": ["OffPlanSheet"],
  "session-finish-here": ["OverflowSheet"],
  "session-stop": ["NoteSheet", "OverflowSheet"],
  "plan-skip-commit": ["ConfirmSheet"],
  "plan-move-commit": ["MoveSheet"],
};

/** Store keys the schema declares, for the fidelity denominator. */
/**
 * Store keys the coverage denominator counts.
 *
 * `daily_plans` and `stretch_targets` are deliberately absent (2026-08-25):
 * `lib/engine/daily-plan.ts` has zero callers, and `stretch_targets`
 * appears only in a parse path in `storage.ts` and in the export — nothing
 * in the app writes either. Counting keys no code path can reach makes the
 * denominator dishonest and the percentage permanently unreachable.
 */
export const STORE_KEYS = [
  "version",
  "logs",
  "training_maxes",
  "cycle",
  "updated_at",
  "user_profile",
  "assessments",
  "contraindications",
  "day_adjustments",
  "dismissed_proposals",
  "feature_flags",
  "migrations_applied",
  "program_materialization",
  "proposal_history",
  "retest_readings",
  "scheduled_blocks",
  "scheduled_overrides",
  "skipped",
] as const;

export type CoverageReport = {
  personaId: string;
  capturedAt: string;
  routes: { toured: string[]; missing: string[]; pct: number };
  surfaces: { reached: string[]; missed: string[]; pct: number };
  /**
   * Within-surface control coverage. "Surface reached" is a binary that
   * flatters the harness — opening the overflow sheet scored the same as
   * testing its six rows. This counts controls actually driven against
   * controls found, and reports the mutating ones held back by name so the
   * shortfall is explained rather than mysterious.
   */
  controls: {
    seen: number;
    exercised: number;
    heldBack: number;
    pct: number;
    bySurface: Array<{ surface: string; seen: number; exercised: number; heldBack: number }>;
  };
  store: { populated: string[]; empty: string[]; pct: number };
  states: {
    fullyLoggedExercises: number;
    partiallyLoggedExercises: number;
    skippedDays: number;
    dismissedProposalDays: number;
    timelinePositions: number;
  };
  flows: { ok: number; skipped: number; error: number; total: number };
  /**
   * Behavioural assertions. Coverage says a control was driven; these say
   * driving it did the right thing. A failed check is a FINDING — the
   * sweep's whole point — so failures are named, not just counted.
   */
  checks: { passed: number; failed: number; failures: Array<{ name: string; detail?: string }> };
};

/** Normalise a toured path back to its route pattern. */
function toPattern(p: string, activeSlug: string): string {
  const clean = p.split("?")[0].replace(/\/$/, "") || "/";
  if (clean === `/programs/${activeSlug}`) return "/programs/[slug]";
  if (clean === `/programs/${activeSlug}/intake`) return "/programs/[slug]/intake";
  if (clean === `/session/${activeSlug}`) return "/session/[slug]";
  return clean;
}

export function buildCoverage(opts: {
  personaId: string;
  activeSlug: string;
  touredPaths: string[];
  flows: FlowResult[];
  store: unknown;
}): CoverageReport {
  const toured = new Set(opts.touredPaths.map((p) => toPattern(p, opts.activeSlug)));
  const routesToured = USER_FACING_ROUTES.filter((r) => toured.has(r));
  const routesMissing = USER_FACING_ROUTES.filter((r) => !toured.has(r));

  const reached = new Set<string>();
  for (const f of opts.flows) {
    if (f.status !== "ok") continue;
    for (const s of FLOW_SURFACES[f.id] ?? []) reached.add(s);
  }
  const surfacesMissed = INTERACTIVE_SURFACES.filter((s) => !reached.has(s));

  const s = (opts.store ?? {}) as Record<string, unknown>;
  const populated = STORE_KEYS.filter((k) => {
    const v = s[k];
    if (v == null) return false;
    if (typeof v === "object") return Object.keys(v as object).length > 0;
    return true;
  });

  const logs = (s.logs ?? {}) as Record<string, { exercises?: Record<string, { sets?: Array<{ reps?: number | null }> }> }>;
  let full = 0;
  let partial = 0;
  for (const day of Object.values(logs)) {
    for (const ex of Object.values(day.exercises ?? {})) {
      const sets = ex.sets ?? [];
      const logged = sets.filter((x) => x.reps != null).length;
      if (logged === 0) continue;
      if (logged < sets.length) partial++;
      else full++;
    }
  }

  const pct = (a: number, b: number) => (b === 0 ? 0 : Math.round((a / b) * 1000) / 10);

  // Fold every flow's probes into one per-surface picture.
  const bySurface = new Map<string, { seen: Set<string>; exercised: Set<string>; held: Set<string> }>();
  for (const f of opts.flows) {
    for (const pr of f.probes ?? []) {
      let e = bySurface.get(pr.surface);
      if (!e) {
        e = { seen: new Set(), exercised: new Set(), held: new Set() };
        bySurface.set(pr.surface, e);
      }
      for (const n of pr.seen) e.seen.add(n);
      for (const n of pr.exercised) e.exercised.add(n);
      for (const k of pr.skipped) e.held.add(k.name);
    }
  }
  const controlRows = Array.from(bySurface.entries()).map(([surface, e]) => ({
    surface,
    seen: e.seen.size,
    exercised: e.exercised.size,
    heldBack: e.held.size,
  }));
  const controlsSeen = controlRows.reduce((n, r) => n + r.seen, 0);
  const controlsExercised = controlRows.reduce((n, r) => n + r.exercised, 0);
  const controlsHeld = controlRows.reduce((n, r) => n + r.heldBack, 0);

  return {
    personaId: opts.personaId,
    capturedAt: new Date().toISOString(),
    routes: {
      toured: routesToured as unknown as string[],
      missing: routesMissing as unknown as string[],
      pct: pct(routesToured.length, USER_FACING_ROUTES.length),
    },
    controls: {
      seen: controlsSeen,
      exercised: controlsExercised,
      heldBack: controlsHeld,
      // Mutating controls are excluded from the denominator: they are
      // deliberately not driven, so counting them as misses would make
      // 100% permanently unreachable and the number meaningless.
      pct: pct(controlsExercised, Math.max(0, controlsSeen - controlsHeld)),
      bySurface: controlRows.sort((a, b) => a.surface.localeCompare(b.surface)),
    },
    surfaces: {
      reached: Array.from(reached),
      missed: surfacesMissed as unknown as string[],
      pct: pct(reached.size, INTERACTIVE_SURFACES.length),
    },
    store: {
      populated: populated as unknown as string[],
      empty: STORE_KEYS.filter((k) => !populated.includes(k)) as unknown as string[],
      pct: pct(populated.length, STORE_KEYS.length),
    },
    states: {
      fullyLoggedExercises: full,
      partiallyLoggedExercises: partial,
      skippedDays: Object.keys((s.skipped ?? {}) as object).length,
      dismissedProposalDays: Object.keys((s.dismissed_proposals ?? {}) as object).length,
      // past / today / future session captures from the tour
      timelinePositions: opts.touredPaths.filter((p) => p.includes("date=")).length,
    },
    checks: (() => {
      const all = opts.flows.flatMap((f) => f.checks ?? []);
      return {
        passed: all.filter((c) => c.ok).length,
        failed: all.filter((c) => !c.ok).length,
        failures: all.filter((c) => !c.ok).map((c) => ({ name: c.name, detail: c.detail })),
      };
    })(),
    flows: {
      ok: opts.flows.filter((f) => f.status === "ok").length,
      skipped: opts.flows.filter((f) => f.status === "skipped").length,
      error: opts.flows.filter((f) => f.status === "error").length,
      total: opts.flows.length,
    },
  };
}

export function writeCoverage(outDir: string, report: CoverageReport): void {
  fs.writeFileSync(path.join(outDir, "coverage.json"), JSON.stringify(report, null, 2), "utf8");
}

/**
 * Read every per-persona coverage.json under `rootDir`. Used instead of an
 * in-memory array because the sweep runs with parallel workers, and each
 * worker holds its own module instance — an in-memory accumulator would
 * only ever see that worker's share of the personas.
 */
export function collectReports(rootDir: string): CoverageReport[] {
  const out: CoverageReport[] = [];
  let entries: string[] = [];
  try {
    entries = fs.readdirSync(rootDir);
  } catch {
    return out;
  }
  for (const entry of entries) {
    const file = path.join(rootDir, entry, "coverage.json");
    if (!fs.existsSync(file)) continue;
    try {
      const parsed = JSON.parse(fs.readFileSync(file, "utf8")) as CoverageReport;
      // Skip reports written by an older harness. A file from before
      // within-surface control coverage existed has no `controls` block,
      // and folding it in would either crash the summary or drag the
      // average down with data that was never collected. Stale bundles
      // belong to a different question.
      if (parsed && typeof parsed.personaId === "string" && parsed.controls) out.push(parsed);
    } catch {
      // A half-written file from a worker still in flight — skip it.
    }
  }
  return out.sort((a, b) => a.personaId.localeCompare(b.personaId));
}

/** Roll the per-persona reports into one fleet summary. */
export function writeFleetSummary(rootDir: string, reports: CoverageReport[]): void {
  if (reports.length === 0) return;
  const avg = (f: (r: CoverageReport) => number) =>
    Math.round((reports.reduce((n, r) => n + f(r), 0) / reports.length) * 10) / 10;

  const lines: string[] = [
    `# Persona sweep — coverage (${new Date().toISOString().slice(0, 10)})`,
    "",
    `Personas: ${reports.length}`,
    "",
    "| Dimension | Mean coverage |",
    "|---|---|",
    `| Routes toured | ${avg((r) => r.routes.pct)}% |`,
    `| Interactive surfaces reached | ${avg((r) => r.surfaces.pct)}% |`,
    `| Store keys populated | ${avg((r) => r.store.pct)}% |`,
    `| Controls exercised within surfaces | ${avg((r) => r.controls.pct)}% |`,
    `| Behavioural checks passed | ${reports.reduce((n, r) => n + (r.checks?.passed ?? 0), 0)} |`,
    `| Behavioural checks FAILED | ${reports.reduce((n, r) => n + (r.checks?.failed ?? 0), 0)} |`,
    "",
    "| Persona | Routes | Surfaces | Controls | Store | Flows ok/skip/err | Full ex | Partial ex |",
    "|---|---|---|---|---|---|---|---|",
  ];
  for (const r of reports) {
    lines.push(
      `| ${r.personaId} | ${r.routes.pct}% | ${r.surfaces.pct}% | ` +
        `${r.controls.pct}% (${r.controls.exercised}/${r.controls.seen - r.controls.heldBack}) | ${r.store.pct}% | ` +
        `${r.flows.ok}/${r.flows.skipped}/${r.flows.error} | ${r.states.fullyLoggedExercises} | ${r.states.partiallyLoggedExercises} |`,
    );
  }
  // Per-surface control detail, unioned across the fleet.
  const merged = new Map<string, { seen: number; exercised: number; held: number }>();
  for (const r of reports) {
    for (const row of r.controls.bySurface) {
      const cur = merged.get(row.surface) ?? { seen: 0, exercised: 0, held: 0 };
      merged.set(row.surface, {
        seen: Math.max(cur.seen, row.seen),
        exercised: Math.max(cur.exercised, row.exercised),
        held: Math.max(cur.held, row.heldBack),
      });
    }
  }
  // Failed checks are the sweep's output, not a footnote.
  const failures = reports.flatMap((r) =>
    (r.checks?.failures ?? []).map((f) => ({ persona: r.personaId, ...f })),
  );
  if (failures.length) {
    lines.push("", "## Behavioural check FAILURES", "", "| Persona | Check | Detail |", "|---|---|---|");
    for (const f of failures) {
      lines.push(`| ${f.persona} | ${f.name} | ${f.detail ?? ""} |`);
    }
  } else {
    lines.push("", "## Behavioural check failures", "", "None.");
  }

  if (merged.size) {
    lines.push("", "## Controls per surface (best across the fleet)", "",
      "| Surface | Exercised | Found | Held back (mutating) |", "|---|---|---|---|");
    for (const [surface, v] of Array.from(merged.entries()).sort()) {
      lines.push(`| ${surface} | ${v.exercised} | ${v.seen} | ${v.held} |`);
    }
  }
  const everMissedRoute = reports[0].routes.missing.filter((route) =>
    reports.every((r) => r.routes.missing.includes(route)),
  );
  const everMissedSurface = reports[0].surfaces.missed.filter((sfc) =>
    reports.every((r) => r.surfaces.missed.includes(sfc)),
  );
  lines.push(
    "",
    "## Never reached by any persona",
    "",
    `**Routes:** ${everMissedRoute.length ? everMissedRoute.join(", ") : "none"}`,
    "",
    `**Surfaces:** ${everMissedSurface.length ? everMissedSurface.join(", ") : "none"}`,
    "",
  );
  fs.writeFileSync(path.join(rootDir, "coverage.md"), lines.join("\n"), "utf8");
  fs.writeFileSync(
    path.join(rootDir, "coverage.json"),
    JSON.stringify(reports, null, 2),
    "utf8",
  );
}
