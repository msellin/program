import { describe, it, expect } from "vitest";
import { drawFigure, FIGURE_COLORS, ACCENT, type FigureFrame } from "./rig";

// Rehab family lane (trainer review 11 + physics review, 2026-10-29): angle and range targets as tests.
const pts = (s: string) => s.split(" ").map((p) => p.split(",").map(Number));
const used = (f: FigureFrame) => f.slots.filter((s) => s.w > 0 && !s.bg && !s.cue);
const ang = (a: number[], b: number[], c: number[]) => {
  const v = [a[0] - b[0], a[1] - b[1]], w = [c[0] - b[0], c[1] - b[1]];
  return (Math.acos((v[0] * w[0] + v[1] * w[1]) / (Math.hypot(...v) * Math.hypot(...w))) * 180) / Math.PI;
};
const T = (n: number, step: number) => Array.from({ length: n }, (_, i) => i * step);
// [hip, shoulder]: the shoulder is the trunk end nearer the head.
const trunk = (f: FigureFrame) => {
  const s = used(f).find((q) => q.w === 12)!, head = pts(used(f).find((q) => q.w === 22)!.pts)[0], [a, b] = pts(s.pts);
  return Math.hypot(a[0] - head[0], a[1] - head[1]) < Math.hypot(b[0] - head[0], b[1] - head[1]) ? [b, a] : [a, b];
};
const chains = (f: FigureFrame, color?: string) => used(f).filter((s) => s.w === 8 && pts(s.pts).length === 3 && (!color || s.color === color)).map((s) => pts(s.pts));

describe("rehab figures", () => {
  it("hipflex: hip never past 90 of flexion (included >= 89.5), knees near 90, hand does not move", () => {
    const hands = new Set<string>();
    for (const t of [0, 450, 900, 3000]) {
      const f = drawFigure("hipflex", "L", t, false);
      const [H, S] = trunk(f);
      const leg = chains(f, FIGURE_COLORS.L)[0];
      expect(ang(S, H, leg[1])).toBeGreaterThanOrEqual(89.5);
      expect(ang(leg[0], leg[1], leg[2])).toBeGreaterThan(88);
      expect(ang(leg[0], leg[1], leg[2])).toBeLessThan(98);
      hands.add(JSON.stringify(chains(f, FIGURE_COLORS.BODY).find((c) => c[0][1] < 80)![2]));
    }
    expect(hands.size).toBe(1);
  });

  it("adductor: knee 90-100 included, extended lever 120-135, with a ball between the knees", () => {
    for (const [id, lo, hi] of [["adductor", 90, 100], ["adductor_ext", 120, 135]] as const) {
      const f = drawFigure(id, "B", 2000, false);
      const [H, K, F] = chains(f, ACCENT)[0];
      expect(ang(H, K, F)).toBeGreaterThanOrEqual(lo);
      expect(ang(H, K, F)).toBeLessThanOrEqual(hi);
      expect(used(f).some((s) => s.fill !== "none" && pts(s.pts).length > 20), id + " ball").toBe(true);
    }
  });

  it("adductor: the ball pulses 14 -> 12.5 px over 1 s of a 2 s cycle while the legs stay put", () => {
    for (const id of ["adductor", "adductor_ext"]) {
      const ball = (t: number) => { const s = used(drawFigure(id, "B", t, false)).find((q) => q.fill !== "none" && pts(q.pts).length > 20)!; const p = pts(s.pts); return (Math.max(...p.map((x) => x[0])) - Math.min(...p.map((x) => x[0]))) / 2; };
      const r = [3000, 3250, 3500, 3750, 4000, 4500, 5000].map(ball);
      expect(Math.max(...r)).toBeGreaterThan(13.8); expect(Math.min(...r)).toBeLessThan(12.7); expect(Math.min(...r)).toBeGreaterThan(12.4);
      expect(JSON.stringify(chains(drawFigure(id, "B", 3000, false), ACCENT))).toBe(JSON.stringify(chains(drawFigure(id, "B", 4000, false), ACCENT)));
    }
  });

  it("bridge: knee ~80-90 at the start and 90-100 at the top, hip ends in one line (175-180)", () => {
    const at = (t: number) => { const f = drawFigure("bridge", "L", t, false); const [H, S] = trunk(f); const [, K, F] = chains(f, FIGURE_COLORS.L)[0]; return { knee: ang(H, K, F), hip: ang(S, H, K) }; };
    const start = at(0), top = at(2000);
    expect(start.knee).toBeGreaterThan(78); expect(start.knee).toBeLessThan(92);
    expect(top.knee).toBeGreaterThanOrEqual(90); expect(top.knee).toBeLessThanOrEqual(100);
    expect(top.hip).toBeGreaterThanOrEqual(175);
  });

  it("dead bug: the lowering leg stays bent (knee 105-135 at its lowest, hip <= 150), never a straight leg", () => {
    let minKnee = 180, maxHip = 0;
    for (const t of T(48, 250)) {
      const f = drawFigure("deadbug", "B", t, false);
      for (const c of chains(f).filter((q) => Math.hypot(q[0][0] - q[1][0], q[0][1] - q[1][1]) > 55)) {
        const [S] = trunk(f);
        void S;
        const k = ang(c[0], c[1], c[2]);
        if (k < minKnee) minKnee = k;
        if (k > 135) throw new Error("straight leg at " + t);
        maxHip = Math.max(maxHip, ang([trunk(f)[1][0] + c[0][0] - trunk(f)[0][0], trunk(f)[1][1] + c[0][1] - trunk(f)[0][1]], c[0], c[1]));
      }
    }
    expect(minKnee).toBeGreaterThanOrEqual(88);
    expect(maxHip).toBeLessThanOrEqual(151);
  });

  it("kneel: front hip 90-110, front knee 90-112, front shin within 15 of vertical, rear thigh keeps its length", () => {
    for (const t of [0, 3000, 6000, 10000]) {
      const f = drawFigure("kneel", "L", t, false);
      const front = chains(f, FIGURE_COLORS.BODY).find((c) => c[0][1] < 130 && c[2][1] > 160 && c[2][0] > 190)!;
      const [H, S] = trunk(f);
      expect(ang(S, H, front[1])).toBeGreaterThanOrEqual(90); expect(ang(S, H, front[1])).toBeLessThanOrEqual(110);
      expect(ang(front[0], front[1], front[2])).toBeGreaterThanOrEqual(90); expect(ang(front[0], front[1], front[2])).toBeLessThanOrEqual(112);
      expect((Math.atan2(Math.abs(front[2][0] - front[1][0]), front[2][1] - front[1][1]) * 180) / Math.PI).toBeLessThanOrEqual(15);
      const back = chains(f, FIGURE_COLORS.L)[0];
      expect(Math.hypot(back[1][0] - back[2][0], back[1][1] - back[2][1])).toBeCloseTo(44, 0);
    }
  });

  it("ninety: knees never cross their hips, both legs stay in the capped range", () => {
    for (const t of T(32, 250)) {
      const legs = used(drawFigure("ninety", "B", t, false)).filter((s) => s.color === ACCENT).map((s) => pts(s.pts));
      for (const [h, k] of legs) {
        const out = (Math.atan2(Math.abs(k[0] - h[0]), k[1] - h[1]) * 180) / Math.PI; // thigh from straight forward
        expect(out).toBeLessThanOrEqual(62);
      }
    }
  });

  it("pallof: anchor fixed on the post, hands travel out >= 12 px, arms straighten, band thins", () => {
    const at = (t: number) => drawFigure("pallof", "B", t, false);
    const band = (f: FigureFrame) => used(f).find((s) => s.color === "#c29a64")!;
    const a = at(0), b = at(2600);
    expect(pts(band(a).pts)[0]).toEqual(pts(band(b).pts)[0]);
    const hand = (f: FigureFrame) => pts(band(f).pts)[1];
    expect(Math.hypot(hand(b)[0] - hand(a)[0], hand(b)[1] - hand(a)[1])).toBeGreaterThanOrEqual(12);
    expect(band(b).w).toBeLessThan(band(a).w);
    const straight = (f: FigureFrame) => { const c = chains(f, ACCENT)[0]; return ang(c[0], c[1], c[2]); };
    expect(straight(b)).toBeGreaterThan(straight(a) + 25);
  });

  it("amarch: opposite arm to ~65 forward with the elbow near 90", () => {
    const f = drawFigure("amarch", "B", 750, false);
    const arms = chains(f).filter((c) => Math.abs(c[0][1] - 24) < 1);
    expect(arms.some((c) => Math.abs(ang(c[0], c[1], c[2]) - 90) < 5)).toBe(true);
  });

  it("legswing: the still pose is the forward end of the swing, not the middle", () => {
    const f = drawFigure("legswing", "L", 0, false, true);
    const c = chains(f, FIGURE_COLORS.L)[0];
    expect(c[2][0] - c[0][0]).toBeGreaterThan(30);
  });

  it("hollowtuck: hip flexion capped near 96 (included >= 80); hollow pull arm moves monotonically 90 -> 175", () => {
    for (const t of [0, 900, 3000]) {
      const f = drawFigure("hollowtuck", "B", t, false);
      const [H, S] = trunk(f);
      const leg = chains(f, FIGURE_COLORS.BODY)[0];
      expect(ang(S, H, leg[1])).toBeGreaterThanOrEqual(80);
    }
    let prev = 0;
    for (let t = 360; t <= 3330; t += 90) {
      const f = drawFigure("hollowpull", "B", t, false);
      const [H, S] = trunk(f);
      const arm = used(f).find((s) => s.color === ACCENT && s.w === 8 && pts(s.pts).length === 2)!;
      const hand = pts(arm.pts).find((q) => Math.hypot(q[0] - S[0], q[1] - S[1]) > 1)!;
      const flex = ang(H, S, hand);
      expect(flex).toBeGreaterThanOrEqual(prev - 0.5);
      prev = flex;
    }
    expect(prev).toBeGreaterThan(170);
  });

  it("roller: the upper back extends 15-30 degrees past the lower-back line", () => {
    const at = (t: number) => {
      const f = drawFigure("roller", "B", t, false);
      const tr = used(f).filter((s) => s.w === 12).map((s) => pts(s.pts));
      const upper = tr.find((q) => q.length === 2 && Math.abs(q[0][0] - 136) < 0.1 && q[0][1] === 133 && q[1][0] < 136)!;
      const lower = tr.find((q) => Math.abs(q[1][0] - 186) < 0.1)!;
      const dir = (a: number[], b: number[]) => Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI;
      return Math.abs(dir(upper[0], upper[1]) - dir(lower[1], lower[0]));
    };
    expect(at(0)).toBeLessThan(2);
    expect(at(3000)).toBeGreaterThanOrEqual(15);
    expect(at(3000)).toBeLessThanOrEqual(30);
  });

  it("pullover: arm passes 90 -> ~170 and the knee is about 90", () => {
    const f = drawFigure("pullover", "B", 4500, false);
    const [, S] = trunk(f);
    const leg = chains(f, FIGURE_COLORS.BODY)[0];
    expect(ang(leg[0], leg[1], leg[2])).toBeGreaterThan(85);
    const arm = used(f).find((s) => s.color === ACCENT && s.w === 8)!;
    expect(S).toBeDefined();
    expect(pts(arm.pts)[1][0]).toBeLessThan(60);
  });
});

describe("rehab round 2", () => {
  it("hollowtuck: hip included angle stays >= 90 (flexion <= 90) through the whole hold", () => {
    for (const t of [0, 900, 2000, 4000]) {
      const f = drawFigure("hollowtuck", "B", t, false);
      const [H, S] = trunk(f);
      const leg = chains(f, FIGURE_COLORS.BODY)[0];
      expect(ang(S, H, leg[1])).toBeGreaterThanOrEqual(89.5);
    }
  });
});
