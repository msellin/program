import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Visual-system guard (D-03/D-04, 2026-10-28). Every text size in the app is
 * one step of the scale in brand/tokens.css (text-eyebrow … text-metric), and
 * every radius is one of the named ones. Before this pass the app carried
 * ~1,000 one-off `text-[Npx]` values across 16 sizes and 371 bare `rounded`;
 * nothing stopped the next screen from adding a seventeenth.
 *
 * Plan and mapping rules: dev/active/visual-system/visual-system-plan.md.
 */

const SRC = path.resolve(__dirname, "..");

// Session timer and rep digits (SetView, RestTakeover, FollowAlong) are the
// only sizes allowed off the scale.
const ALLOWED_SIZES = new Set(["52px", "64px", "92px", "104px"]);

function sourceFiles(dir: string, out: string[] = []): string[] {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) sourceFiles(p, out);
    else if (/\.tsx?$/.test(e.name) && !/\.test\.tsx?$/.test(e.name)) out.push(p);
  }
  return out;
}

const files = sourceFiles(SRC);

describe("one type scale", () => {
  it("no arbitrary text-[Npx] sizes outside the timer allowlist", () => {
    const hits: string[] = [];
    for (const f of files) {
      for (const m of fs.readFileSync(f, "utf8").matchAll(/\btext-\[([0-9.]+(?:px|rem))\]/g)) {
        if (!ALLOWED_SIZES.has(m[1])) hits.push(`${path.relative(SRC, f)}: ${m[0]}`);
      }
    }
    expect(hits, "use text-eyebrow/caption/small/body/h3/h2/h1/metric").toEqual([]);
  });

  it("no arbitrary rounded-[Npx] radii", () => {
    const hits: string[] = [];
    for (const f of files) {
      for (const m of fs.readFileSync(f, "utf8").matchAll(/\brounded(?:-[a-z]{1,2})?-\[[0-9.]+px\]/g)) {
        hits.push(`${path.relative(SRC, f)}: ${m[0]}`);
      }
    }
    expect(hits, "use rounded-md / rounded-lg / rounded-xl / rounded-full").toEqual([]);
  });

  it("left accent bars carry status only", () => {
    const hits: string[] = [];
    for (const f of files) {
      for (const m of fs.readFileSync(f, "utf8").matchAll(/\bborder-l-(slate|teal|bronze|line|line-soft|muted)\b/g)) {
        hits.push(`${path.relative(SRC, f)}: ${m[0]}`);
      }
    }
    expect(hits, "a left bar is green, amber or red — use <Card status>").toEqual([]);
  });

  it("no class glued to a ${…} in a className template", () => {
    // Tailwind extracts classes as whitespace-separated tokens; `pb-[…]${x}` is one token and never generated.
    // AppShell's bottom-nav padding vanished this way (2026-10-28 → 10-29).
    const hits: string[] = [];
    for (const f of files) {
      for (const m of fs.readFileSync(f, "utf8").matchAll(/className=\{`[^`]*[^\s`]\$\{/g)) {
        hits.push(`${path.relative(SRC, f)}: ${m[0].slice(-40)}`);
      }
    }
    expect(hits, "put a space before ${…} or use cn()").toEqual([]);
  });
});
