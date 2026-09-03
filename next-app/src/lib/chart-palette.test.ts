import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Charts hardcode hex colours because Recharts takes them as props, not as
 * CSS. That is fine — but it means the chart palette can drift away from the
 * token palette with nothing to notice.
 *
 * It did. P2-13 replaced a rogue `#2A2E37` grid stroke with the
 * `--color-line-soft` value in `SymptomLoadChart` and left the same literal
 * in `_CutCRechartsInner` and `BarVisualizer`, so two charts drew their grid
 * a shade off the third and off every non-chart divider in the app. A
 * near-miss colour is the least visible defect there is.
 */
const SRC = path.resolve(__dirname, "..");
const CSS = fs.readFileSync(path.join(SRC, "app/globals.css"), "utf8");

const TOKEN_HEXES = new Set(
  (CSS.match(/#[0-9A-Fa-f]{6}\b/g) ?? []).map((h) => h.toLowerCase()),
);

/** Files that draw with literal colours. */
const CHART_DIRS = ["components/charts", "components/record", "components/progress"];
const EXTRA_FILES = ["components/workout/BarVisualizer.tsx"];

function collect(): Array<{ file: string; hex: string }> {
  const out: Array<{ file: string; hex: string }> = [];
  const scan = (abs: string, rel: string) => {
    const src = fs.readFileSync(abs, "utf8");
    for (const line of src.split("\n")) {
      // Only lines that actually PAINT — a hex inside a comment is history,
      // and several of these files document the colour they replaced.
      if (!/(stroke|fill|color|background)\s*[=:]/.test(line)) continue;
      if (/^\s*(\/\/|\*)/.test(line)) continue;
      for (const hex of line.match(/#[0-9A-Fa-f]{6}\b/g) ?? []) {
        out.push({ file: rel, hex: hex.toLowerCase() });
      }
    }
  };
  for (const dir of CHART_DIRS) {
    const abs = path.join(SRC, dir);
    if (!fs.existsSync(abs)) continue;
    for (const e of fs.readdirSync(abs)) {
      if (e.endsWith(".tsx") && !e.includes(".test.")) scan(path.join(abs, e), `${dir}/${e}`);
    }
  }
  for (const f of EXTRA_FILES) scan(path.join(SRC, f), f);
  return out;
}

describe("chart colours come from the token palette", () => {
  const used = collect();

  it("finds chart colours at all", () => {
    // Guards the guard — a path change returning [] would pass silently.
    expect(used.length).toBeGreaterThan(5);
  });

  it("every painted hex is a colour globals.css defines", () => {
    const offenders = used
      .filter((u) => !TOKEN_HEXES.has(u.hex))
      .map((u) => `${u.file}: ${u.hex}`);
    expect([...new Set(offenders)]).toEqual([]);
  });
});
