import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { FIGS, ACCENT, drawFigure, figureBounds, FIGURE_COLORS, FIGURE_SLOTS, strokePx, type FigureFrame } from "./rig";
import { EXERCISE_FIGURES } from "./exercise-figures";

// The review panel's rules (2026-10-19), as tests. Each one is a defect an
// earlier draft actually had.

const TEAL = FIGURE_COLORS.L;
const PURPLE = FIGURE_COLORS.R;
const BOTH = ACCENT;
const FAR = FIGURE_COLORS.FAR;
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
    // Collect, then assert once: ~20k fleshed frames with an expect each timed out on CI.
    const bad: string[] = [];
    for (const id of Object.keys(FIGS)) {
      for (const side of ["L", "R", "B"] as const) {
        for (const reduced of [false, true]) {
          for (const t of TIMES) {
            const f = drawFigure(id, side, t, reduced);
            if (JSON.stringify(f).includes("NaN")) bad.push(`${id} ${side} ${t} NaN`);
            // A full slot list means items were silently dropped.
            if (f.slots.filter((s) => s.w > 0 || s.shape).length >= FIGURE_SLOTS) bad.push(`${id} ${side} ${t} slots full`);
          }
        }
      }
    }
    expect(bad).toEqual([]);
  }, 30000);

  it("keeps every meaningful stroke at 3:1 or better on the card AND the Today tile tint (WCAG 1.4.11)", () => {
    const colors = new Set<string>();
    for (const id of Object.keys(FIGS))
      for (const reduced of [false, true])
        for (const s of used(drawFigure(id, "L", 3000, reduced))) colors.add(s.color);
    // #2a231f = the tile's bronze/15 over the ground; props and floor failed it before the 2026-10-28 review.
    for (const c of colors) for (const bg of ["#16181c", "#2a231f"]) expect(contrast(c, bg), c + " on " + bg).toBeGreaterThanOrEqual(3);
  });

  it("the fitted frame holds every frame of the cycle, so the figure never leaves it or makes it jump", () => {
    for (const id of Object.keys(FIGS))
      for (const side of ["L", "R", "B"] as const) {
        const b = figureBounds(id, side), sc = FIGS[id].scale || 1;
        // Collect the extremes, then assert once: an expect per point timed out on CI.
        let out = 0;
        for (const t of TIMES.filter((_, i) => i % 3 === 0))
          for (const s of used(drawFigure(id, side, t, false)).filter((s) => !s.bg))
            for (const [x, y] of pts(s.pts)) {
              const X = 179 + sc * (x - 179), Y = 160 + sc * (y - 168);
              out = Math.max(out, b.x - X, X - b.x - b.w, b.y - Y, Y - b.y - b.h);
            }
        expect(out, id + side).toBeLessThanOrEqual(0);
      }
  }, 20000);

  it("strokes are sized for the size drawn: heavier in px on the tile than in a thumbnail, working limb heaviest", () => {
    expect(strokePx(8, 40, false)).toBeCloseTo(2.72, 1);
    expect(strokePx(8, 144, false)).toBeCloseTo(5.04, 1);
    expect(strokePx(8, 144, true)).toBeGreaterThan(strokePx(8, 144, false));
    expect(strokePx(2, 40, false)).toBeGreaterThanOrEqual(1.25);
  });

  it("body v2: every figure is drawn with a trunk and a head, and every body shape covers its skeleton", () => {
    for (const id of Object.keys(FIGS))
      for (const side of ["L", "R"] as const) {
        const f = drawFigure(id, side, 2000, false);
        expect(f.slots.some((s) => s.shape && s.w === 12), id + " trunk").toBe(true);
        expect(f.slots.some((s) => s.shape && s.w >= 18 && s.w <= 24), id + " head").toBe(true);
        for (const s of f.slots.filter((s) => s.shape && s.w > 0)) {
          const sh = pts(s.shape!), xs = sh.map((q) => q[0]), ys = sh.map((q) => q[1]);
          for (const [x, y] of pts(s.pts)) {
            expect(x, id).toBeGreaterThanOrEqual(Math.min(...xs) - 0.1); expect(x, id).toBeLessThanOrEqual(Math.max(...xs) + 0.1);
            expect(y, id).toBeGreaterThanOrEqual(Math.min(...ys) - 0.1); expect(y, id).toBeLessThanOrEqual(Math.max(...ys) + 0.1);
          }
        }
      }
  });

  it("body v2: an arm is drawn slimmer than a leg (roles read from the skeleton)", () => {
    // A part's radius at an end = nearest shape vertex to that skeleton joint; the larger end is proximal.
    const rProx = (s: { pts: string; shape?: string }) => {
      const q = pts(s.shape!), k = pts(s.pts);
      return Math.max(...[k[0], k[k.length - 1]].map((j) => Math.min(...q.map((v) => len(v, j)))));
    };
    const f = drawFigure("pullup", "B", 0, false, true);
    const legs = f.slots.filter((s) => s.shape && s.w === 8 && s.color === FIGURE_COLORS.BODY && pts(s.pts).length === 2 && len(...(pts(s.pts) as [number[], number[]])) > 60);
    const arms = f.slots.filter((s) => s.shape && s.w === 8 && s.color === BOTH);
    expect(legs.length).toBe(2); expect(arms.length).toBe(2);
    for (const a of arms) for (const l of legs) expect(rProx(a)).toBeLessThan(rProx(l) * 0.8);
  });

  it("a still figure shows its poster pose: the pull-up thumbnail is chin over the bar, not a dead hang", () => {
    const head = (f: FigureFrame) => pts(used(f).find((s) => s.w === 22)!.pts)[0][1];
    expect(head(drawFigure("pullup", "B", 0, false, true))).toBeLessThan(head(drawFigure("pullup", "B", 0, false)) - 20);
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

  // anterior-hip-rebuild: the program's provocative positions, as geometry (see the note above HIP_FIGS).
  const legOf = (id: string, color: string, t: number) => used(drawFigure(id, "B", t, false)).filter((s) => s.color === color && s.w === 8).map((s) => pts(s.pts)).find((p) => p.length === 3)!;
  const thighDeg = ([H, K]: number[][]) => (Math.atan2(K[1] - H[1], K[0] - H[0]) * 180) / Math.PI; // 90 = straight down, 0 = level forward

  it("squats stop at about parallel: the hip never drops below the knee", () => {
    for (const id of ["squat", "frontsquat", "airsquat", "goblet"])
      for (const t of TIMES) {
        const [, K, H] = used(drawFigure(id, "B", t, false)).filter((s) => s.color === FIGURE_COLORS.BODY && s.w === 8).map((s) => pts(s.pts)).find((p) => p.length === 3)!;
        expect(H[1], id).toBeLessThanOrEqual(K[1] + 6);
      }
  });

  it("A-march stops at a level thigh and leg swings stay small with a soft knee", () => {
    for (const t of TIMES) {
      const m = legOf("amarch", BOTH, t);
      if (m) expect(thighDeg(m)).toBeGreaterThanOrEqual(-0.5);
      const [H, K, F] = legOf("legswing", TEAL, t);
      expect(thighDeg([H, K])).toBeGreaterThanOrEqual(59.5); // at most ~30° of flexion
      expect(Math.abs(thighDeg([H, K]) - thighDeg([K, F]))).toBeGreaterThan(4); // never a locked straight leg
    }
  });

  it("hip thrust and bridge finish in one line with the shoulder: never arched past it", () => {
    for (const id of ["hipthrust", "bridge2"])
      for (const t of TIMES) {
        const f = used(drawFigure(id, "B", t, false));
        const [S, H] = pts(f.find((s) => s.w === 12)!.pts), [, K] = legOf(id, BOTH, t);
        // Hip at or below the shoulder-knee line (y grows downward).
        const lineY = S[1] + ((K[1] - S[1]) * (H[0] - S[0])) / (K[0] - S[0]);
        expect(H[1], id + "@" + t).toBeGreaterThanOrEqual(lineY - 1.5);
      }
  });

  it("hollow_hold is drawn tucked: the knees stay bent (no straight-leg-raise hold)", () => {
    expect(EXERCISE_FIGURES.hollow_hold).toBe("hollowtuck");
    const [H, K, F] = used(drawFigure("hollowtuck", "B", 2000, false)).filter((s) => s.color === FIGURE_COLORS.BODY && s.w === 8).map((s) => pts(s.pts)).find((p) => p.length === 3)!;
    expect(Math.abs(thighDeg([H, K]) - thighDeg([K, F]))).toBeGreaterThan(60);
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
  it("every anterior-hip-rebuild exercise has a figure", () => {
    const seen = new Set<string>();
    const walk = (o: unknown) => {
      if (Array.isArray(o)) o.forEach(walk);
      else if (o && typeof o === "object")
        for (const [k, v] of Object.entries(o)) {
          if (k === "exercise_id" && typeof v === "string") seen.add(v);
          else walk(v);
        }
    };
    walk(JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../../public/data/programs/anterior-hip-rebuild.json"), "utf8")));
    // Only real library ids: the program's schema block documents `"exercise_id": "string"`.
    expect([...seen].filter((id) => ids.has(id) && !EXERCISE_FIGURES[id])).toEqual([]);
  });

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
