import { describe, it, expect } from "vitest";
import { FIGS, FIGURE_COLORS, ACCENT, drawFigure } from "./rig";

const pts = (s: string) => s.split(" ").map((p) => p.split(",").map(Number));
const used = (id: string, t: number) => drawFigure(id, "B", t, false).slots.filter((s) => s.w > 0 && !s.bg && !s.cue);
const trunk = (id: string, t: number) => { const [H, S] = pts(used(id, t).find((s) => s.w === 12)!.pts); return (Math.atan2(Math.abs(S[0] - H[0]), Math.abs(S[1] - H[1])) * 180) / Math.PI; };
const inc = (a: number[], b: number[], c: number[]) => {
  const v = [a[0] - b[0], a[1] - b[1]], w = [c[0] - b[0], c[1] - b[1]];
  return (Math.acos((v[0] * w[0] + v[1] * w[1]) / (Math.hypot(...v) * Math.hypot(...w))) * 180) / Math.PI;
};
const T = (id: string) => FIGS[id].dur!;

describe("handstand family (trainer lane, 2026-10-29)", () => {
  it("the incline ladder is monotonic and the three wall holds differ visibly", () => {
    const a = trunk("wallhs", 3000), b = trunk("wallhs_90", 3000), c = trunk("wallhs_lean", 3000);
    expect(b - a).toBeGreaterThan(10);
    expect(c - b).toBeGreaterThan(15);
    expect(c).toBeGreaterThan(40);
  });

  it("shrug: arms stay locked and the whole body rises ~9 px (15% of the arm)", () => {
    const hipY = (t: number) => pts(used("wallhs_shrug", t).find((s) => s.w === 12)!.pts)[0][1];
    const lo = hipY(0), hi = hipY(T("wallhs_shrug") * 0.35);
    expect(lo - hi).toBeGreaterThan(7);
    expect(lo - hi).toBeLessThan(11);
    for (const t of [0, 1000, 1400, 1700, 3000]) {
      const arm = used("wallhs_shrug", t).find((s) => s.color === ACCENT && s.w === 8 && pts(s.pts).length === 2 && Math.hypot(...pts(s.pts)[0].map((v, i) => v - pts(s.pts)[1][i])) > 50)!;
      const [a, b] = pts(arm.pts);
      expect(Math.hypot(a[0] - b[0], a[1] - b[1])).toBeCloseTo(62, 0);
    }
  });

  it("taps: the work arm starts locked and reaches the shoulder; the other arm stays locked", () => {
    const frame = (t: number) => used("wallhs_taps", t);
    const work = (t: number) => pts(frame(t).find((s) => s.color === ACCENT && s.w === 8)!.pts);
    const start = work(0);
    expect(start.length === 2 || inc(start[0], start[1], start[2]) > 174).toBe(true);
    const tTop = (T("wallhs_taps") / 2) * 0.4;
    const top = work(tTop);
    expect(inc(top[0], top[1], top[2])).toBeLessThan(40);
    const sup = pts(frame(tTop).find((s) => s.color === FIGURE_COLORS.FAR && s.w === 8)!.pts);
    expect(Math.hypot(sup[0][0] - sup[1][0], sup[0][1] - sup[1][1])).toBeCloseTo(62, 0);
  });

  it("tuck: hip folds to ~55-75 and knees to 30-40 at the top of the tuck", () => {
    const [H, K, F] = pts(used("hstuck", 3000).find((s) => s.color === ACCENT && s.w === 8)!.pts);
    const [S] = pts(used("hstuck", 3000).find((s) => s.w === 12)!.pts);
    expect(inc(S, H, K)).toBeGreaterThan(55); expect(inc(S, H, K)).toBeLessThan(75);
    expect(inc(H, K, F)).toBeGreaterThan(30); expect(inc(H, K, F)).toBeLessThan(42);
    const shin = (Math.atan2(Math.abs(F[0] - K[0]), Math.abs(F[1] - K[1])) * 180) / Math.PI;
    expect(shin).toBeGreaterThan(25); expect(shin).toBeLessThan(55);
  });

  it("handstand walk: the line leans 1 to 6 degrees through the step", () => {
    const vals = Array.from({ length: 36 }, (_, i) => trunk("hswalk", i * 100));
    expect(Math.min(...vals)).toBeLessThan(2); expect(Math.max(...vals)).toBeGreaterThan(5); expect(Math.max(...vals)).toBeLessThan(7);
  });

  it("kick-up: starts in a lunge (swing leg low behind, front knee 120-140), stacks over the hands, returns to the start", () => {
    const d = T("kickup");
    const front = pts(used("kickup", 0).find((s) => s.color === FIGURE_COLORS.FAR && s.w === 8 && pts(s.pts).length === 3)!.pts);
    expect(inc(front[0], front[1], front[2])).toBeGreaterThan(120); expect(inc(front[0], front[1], front[2])).toBeLessThan(140);
    const [H, F] = pts(used("kickup", 0).find((s) => s.color === ACCENT && s.w === 8)!.pts);
    expect(F[1]).toBeGreaterThan(H[1]);
    expect(F[0]).toBeLessThan(H[0]);
    expect(trunk("kickup", d * 0.3)).toBeLessThan(3);
    expect(JSON.stringify(used("kickup", 0))).toBe(JSON.stringify(used("kickup", d * 0.97)));
  });

  it("wall walk moves in steps: plateaus between six quick moves, plank start", () => {
    const d = T("wallwalk"), ts = Array.from({ length: 200 }, (_, i) => d * (0.08 + (0.52 * i) / 199));
    const tr = ts.map((t) => trunk("wallwalk", t));
    let still = 0; for (let i = 1; i < tr.length; i++) if (Math.abs(tr[i] - tr[i - 1]) < 0.05) still++;
    expect(still).toBeGreaterThan(60);
    expect(trunk("wallwalk", 0)).toBeGreaterThan(60);
    expect(trunk("wallwalk", d * 0.65)).toBeLessThan(25);
  });

  it("finger raises lift the fingers about 40 degrees; wrist prep moves the shoulders ~10 px past the wrists", () => {
    const f = pts(used("fingerraise", 4000 * 0.4).find((s) => s.w === 4)!.pts);
    const ang = (Math.atan2(f[1][1] - f[2][1], f[2][0] - f[1][0]) * 180) / Math.PI;
    expect(ang).toBeGreaterThan(35); expect(ang).toBeLessThan(45);
    const sx = (t: number) => pts(used("wristprep", t).find((s) => s.color === ACCENT && s.w === 8)!.pts)[1][0];
    expect(sx(6000 * 0.5) - sx(0)).toBeGreaterThan(8);
    expect(sx(6000 * 0.5) - sx(0)).toBeLessThan(13);
  });
});
