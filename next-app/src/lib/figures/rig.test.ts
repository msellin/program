import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { FIGS, ACCENT, drawFigure, FIGURE_SLOTS, type FigureFrame } from "./rig";
import { EXERCISE_FIGURES } from "./exercise-figures";

// The review panel's rules (2026-10-19), as tests. Each one is a defect an
// earlier draft actually had.

const TEAL = "#5fa3b0";
const PURPLE = "#b58dbb";
const BOTH = ACCENT;
const FAR = "#6b717d";
const TIMES = Array.from({ length: 60 }, (_, i) => i * 250); // 0..15 s

const pts = (s: string) => s.split(" ").map((p) => p.split(",").map(Number));
const len = (a: number[], b: number[]) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const used = (f: FigureFrame) => f.slots.filter((s) => s.w > 0);

function luminance(hex: string): number {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = c.map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const contrast = (a: string, b: string) => {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};

describe("figure rig", () => {
  it("builds every figure on every side, without NaN, with slot headroom to spare", () => {
    for (const id of Object.keys(FIGS)) {
      for (const side of ["L", "R", "B"] as const) {
        for (const reduced of [false, true]) {
          for (const t of TIMES) {
            const f = drawFigure(id, side, t, reduced);
            expect(JSON.stringify(f)).not.toContain("NaN");
            // A full slot list means items were silently dropped.
            expect(used(f).length).toBeLessThan(FIGURE_SLOTS);
          }
        }
      }
    }
  });

  it("keeps every meaningful stroke at 3:1 or better on the card background (WCAG 1.4.11)", () => {
    const colors = new Set<string>();
    for (const id of Object.keys(FIGS))
      for (const reduced of [false, true])
        for (const s of used(drawFigure(id, "L", 3000, reduced))) colors.add(s.color);
    for (const c of colors) expect(contrast(c, "#16181c"), c).toBeGreaterThanOrEqual(3);
  });

  it("every pose draws an accent limb (bronze, or side teal/purple for sided figures)", () => {
    for (const id of Object.keys(FIGS))
      for (const side of ["L", "R", "B"] as const) {
        const hit = used(drawFigure(id, side, 3000, false)).filter((s) => s.w >= 3 && [ACCENT, TEAL, PURPLE].includes(s.color));
        expect(hit.length, id + side).toBeGreaterThan(0);
      }
  });

  it("dead bug moves the OPPOSITE arm and leg, and switches pairs on the second rep", () => {
    const rep1 = drawFigure("deadbug", "B", 3500, false);
    const rep2 = drawFigure("deadbug", "B", 10500, false);
    expect(rep1.badges.map((b) => b.letter)).toEqual(["R", "L"]);
    expect(rep2.badges.map((b) => b.letter)).toEqual(["L", "R"]);
    expect(rep1.badges.map((b) => b.color)).toEqual([PURPLE, TEAL]);
  });

  it("dead bug limbs keep their length through the whole movement", () => {
    // Every arm and leg segment, sorted: which pair is coloured changes per
    // rep, but the set of lengths must not change at any moment.
    const lengthsAt = (t: number) =>
      used(drawFigure("deadbug", "B", t, false))
        .filter((s) => s.w === 8 && pts(s.pts).length > 1 && s.pts.split(" ").length >= 2)
        .map((s) => {
          const p = pts(s.pts);
          return p.slice(1).map((q, i) => len(p[i], q));
        })
        .flat()
        .filter((l) => l > 40) // limbs only, not the neck
        .sort((a, b) => a - b);
    const first = lengthsAt(0);
    for (const t of TIMES) lengthsAt(t).forEach((l, i) => expect(l).toBeCloseTo(first[i], 0));
  });

  it("glute bridge: planted shin and thigh keep their length; the working leg is in the right layer", () => {
    for (const side of ["L", "R"] as const) {
      const color = side === "L" ? TEAL : PURPLE;
      for (const t of TIMES) {
        const f = drawFigure("bridge", side, t, false);
        const work = used(f).find((s) => s.color === color)!;
        const [h, k, foot] = pts(work.pts);
        expect(len(h, k)).toBeCloseTo(66, 0);
        expect(len(k, foot)).toBeCloseTo(62, 0);
      }
      // Head left = we see her RIGHT side. A left set's planted leg is the
      // far leg, but it is still the working limb, so it is drawn last; a
      // right set's free (left) leg is far and drawn first, dimmed.
      const f = drawFigure("bridge", side, 2400, false);
      const limbs = used(f).filter((s) => s.w === 8);
      expect(limbs[limbs.length - 1].color).toBe(color);
      if (side === "R") expect(limbs[0].color).toBe(FAR);
    }
  });

  it("half-kneeling stretch never leans the trunk back", () => {
    for (const t of TIMES) {
      const torso = used(drawFigure("kneel", "L", t, false)).find((s) => s.w === 12)!;
      const [hip, shoulder] = pts(torso.pts);
      // Facing right: leaning back would put the shoulder behind (left of) the hip.
      expect(shoulder[0]).toBeGreaterThanOrEqual(hip[0] - 0.01);
    }
  });

  it("90/90: the inward knee never crosses its own hip line", () => {
    for (const t of TIMES) {
      const legs = used(drawFigure("ninety", "B", t, false)).filter((s) => s.color === BOTH);
      const [left, right] = legs.map((s) => pts(s.pts));
      expect(left[1][0]).toBeLessThanOrEqual(left[0][0]); // left knee stays left of the left hip
      expect(right[1][0]).toBeGreaterThanOrEqual(right[0][0]);
    }
  });

  it("holds ease into effort once and then stay still (no rep-like pulsing)", () => {
    for (const id of ["hipflex", "adductor", "hang"]) {
      const a = JSON.stringify(drawFigure(id, "L", 1000, false));
      for (const t of [2000, 5000, 9000]) expect(JSON.stringify(drawFigure(id, "L", t, false))).toBe(a);
    }
  });

  it("reduced motion freezes on the start pose and draws the end pose as a thin outline", () => {
    for (const id of Object.keys(FIGS)) {
      const a = JSON.stringify(drawFigure(id, "L", 0, true));
      expect(JSON.stringify(drawFigure(id, "L", 4000, true))).toBe(a);
      if (FIGS[id].kind !== "hold") {
        const ghosts = used(drawFigure(id, "L", 0, true)).filter((s) => s.color === FAR && s.w <= 3);
        expect(ghosts.length, id).toBeGreaterThan(0);
      }
    }
  });

  it("every text alternative names the side for one-sided figures", () => {
    expect(drawFigure("bridge", "L", 0, false).label).toContain("left foot planted");
    expect(drawFigure("kneel", "R", 0, false).label).toContain("right knee down");
    expect(drawFigure("hipflex", "R", 0, false).label).toContain("right leg");
  });
});

describe("exercise → figure map", () => {
  const lib = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "../../../public/data/exercises.json"), "utf8"),
  ) as { exercises: { id: string }[] };
  const ids = new Set(lib.exercises.map((e) => e.id));

  it("every mapped exercise exists in the shared library and every figure exists", () => {
    for (const [ex, fig] of Object.entries(EXERCISE_FIGURES)) {
      expect(ids.has(ex), ex).toBe(true);
      expect(FIGS[fig], fig).toBeDefined();
    }
  });

  // Every drill on the ad path (first-strict-pullup, handstand-walk, concurrent
  // strength) has a figure, except the few with no meaningful side-view pose.
  const NO_FIGURE_YET = new Set([
    "deliberate_mat_falls",
    "hs_video_review",
    "tuck_forward_roll_from_crow",
    "wall_cartwheel_exit",
  ]);
  it("every ad-path exercise has a figure", () => {
    const seen = new Set<string>();
    const walk = (o: unknown) => {
      if (Array.isArray(o)) o.forEach(walk);
      else if (o && typeof o === "object") {
        for (const [k, v] of Object.entries(o)) {
          if (k === "exercise_id" && typeof v === "string") seen.add(v);
          else walk(v);
        }
      }
    };
    for (const prog of ["first-strict-pullup", "handstand-walk", "concurrent-strength-maintenance"]) {
      walk(JSON.parse(fs.readFileSync(path.resolve(__dirname, `../../../public/data/programs/${prog}.json`), "utf8")));
    }
    expect(seen.size).toBeGreaterThan(40);
    const missing = [...seen].filter((id) => !EXERCISE_FIGURES[id] && !NO_FIGURE_YET.has(id));
    expect(missing).toEqual([]);
  });
});
