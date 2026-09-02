import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Icon size and stroke discipline (P2-32).
 *
 * The task recorded "3 sizes and 2 stroke weights in circulation" and proposed
 * a codemod across ~40 call sites. Reading the actual usage first changed the
 * answer twice.
 *
 * Several of the stroke widths are not icons at all — Recharts series,
 * Sparkline paths, BarVisualizer geometry. Those are data-viz line weights and
 * have nothing to do with iconography. And what remains is a deliberate system
 * rather than drift: 2 as the lucide default, 1.75 for quiet secondary icons,
 * 3 for the 11px selection ticks that would otherwise not read, and
 * `active ? 2.25 : 1.75` in the bottom nav as a selected-state signal.
 *
 * So the codemod was the wrong fix. Flattening those would erase intent, and a
 * global icon restyle is precisely the visual change that belongs in an audit
 * sweep rather than a maintenance pass. Three genuine outliers were corrected —
 * a chevron at 2.25 among nineteen siblings at default, the codebase's only
 * size-15 icon, and two strokeWidth={2} that merely restate the default.
 *
 * This pins the result. New values fail; the deliberate ones are listed with
 * their reason. The set can shrink, not grow.
 */
const SRC = path.resolve(__dirname, "..");

// Data-viz, not iconography. Stroke here is a series weight.
const CHART_FILES = /(Sparkline|SymptomLoadChart|BarVisualizer|_CutCRecharts|Heatmap)/;

const ALLOWED_SIZES = new Set([11, 12, 14, 16, 18, 20]);
const ALLOWED_STROKES = new Map<string, string>([
  ["1.75", "quiet secondary icons, and the bottom nav's inactive state"],
  ["2", "lucide's default — the baseline for affordance icons"],
  ["2.25", "bottom nav active state only"],
  ["3", "11px selection ticks, which do not read at lighter weights"],
]);

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) return walk(full);
    return /\.tsx$/.test(e.name) && !/\.test\.tsx$/.test(e.name) ? [full] : [];
  });
}

const iconFiles = walk(SRC).filter(
  (f) => !CHART_FILES.test(path.basename(f)) && fs.readFileSync(f, "utf8").includes("lucide-react"),
);

describe("icon discipline", () => {
  it("there are icon files to check", () => {
    expect(iconFiles.length).toBeGreaterThan(5);
  });

  it("every icon size is on the scale", () => {
    const offenders: string[] = [];
    for (const f of iconFiles) {
      for (const m of fs.readFileSync(f, "utf8").matchAll(/size=\{(\d+)\}/g)) {
        const n = Number(m[1]);
        if (!ALLOWED_SIZES.has(n)) offenders.push(`${path.basename(f)}: size=${n}`);
      }
    }
    expect(offenders, `off-scale sizes (allowed: ${[...ALLOWED_SIZES].join(", ")})`).toEqual([]);
  });

  it("every icon stroke weight is one of the four with a stated purpose", () => {
    const offenders: string[] = [];
    for (const f of iconFiles) {
      const text = fs.readFileSync(f, "utf8");
      for (const m of text.matchAll(/strokeWidth=\{([^}]+)\}/g)) {
        // `active ? 2.25 : 1.75` — check each literal in the expression.
        for (const lit of m[1].match(/[0-9]+(?:\.[0-9]+)?/g) ?? []) {
          if (!ALLOWED_STROKES.has(lit)) {
            offenders.push(`${path.basename(f)}: strokeWidth ${lit}`);
          }
        }
      }
    }
    expect(
      offenders,
      `undocumented stroke weights. Allowed:\n${[...ALLOWED_STROKES]
        .map(([w, why]) => `  ${w} — ${why}`)
        .join("\n")}`,
    ).toEqual([]);
  });

  it("no icon restates lucide's default weight", () => {
    // strokeWidth={2} on an icon reads as a deliberate choice and is not one.
    // Two of these sat on chevrons in DashboardBlock.
    const offenders: string[] = [];
    for (const f of iconFiles) {
      const text = fs.readFileSync(f, "utf8");
      for (const m of text.matchAll(/<[A-Z]\w+[^>]*strokeWidth=\{2\}[^>]*>/g)) {
        offenders.push(`${path.basename(f)}: ${m[0].slice(0, 60)}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
