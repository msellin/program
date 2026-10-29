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

  it("shrug: arms stay locked and the whole body rises ~13 px (21% of the arm, drawn large)", () => {
    const hipY = (t: number) => pts(used("wallhs_shrug", t).find((s) => s.w === 12)!.pts)[0][1];
    const lo = hipY(0), hi = hipY(T("wallhs_shrug") * 0.35);
    expect(lo - hi).toBeGreaterThan(11.5);
    expect(lo - hi).toBeLessThan(14.5);
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
    const [H, K] = pts(used("hstuck", 3000).find((s) => s.color === FIGURE_COLORS.BODY && s.w === 6)!.pts);
    const [, F] = pts(used("hstuck", 3000).find((s) => s.color === ACCENT && s.w === 8)!.pts);
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

  it("kick-up: starts in a lunge (swing leg low behind, front knee 120-130, trunk about 60), stacks over the hands, returns to the start", () => {
    const d = T("kickup");
    const front = pts(used("kickup", 0).find((s) => s.color === FIGURE_COLORS.FAR && s.w === 8 && pts(s.pts).length === 3)!.pts);
    expect(inc(front[0], front[1], front[2])).toBeGreaterThan(120); expect(inc(front[0], front[1], front[2])).toBeLessThan(130);
    expect(trunk("kickup", 0)).toBeGreaterThan(52); expect(trunk("kickup", 0)).toBeLessThan(68);
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
    const f = pts(used("fingerraise", 4000 * 0.4).find((s) => s.w === 4 && s.color === ACCENT)!.pts);
    const ang = (Math.atan2(f[0][1] - f[1][1], f[1][0] - f[0][0]) * 180) / Math.PI;
    expect(ang).toBeGreaterThan(35); expect(ang).toBeLessThan(45);
    const sx = (t: number) => pts(used("wristprep", t).find((s) => s.color === ACCENT && s.w === 8)!.pts)[1][0];
    expect(sx(6000 * 0.5) - sx(0)).toBeGreaterThan(8);
    expect(sx(6000 * 0.5) - sx(0)).toBeLessThan(13);
  });

  it("r2: hswalk arms never close past ~164 deg at the elbow and the hips shift ~3 px per step", () => {
    let min = 180; const hx: number[] = [];
    for (let t = 0; t < 3600; t += 40) {
      const f = used("hswalk", t);
      for (const sl of f.filter((x) => (x.color === ACCENT || x.color === FIGURE_COLORS.FAR) && x.w === 8 && pts(x.pts).length === 3)) {
        const [a, b, c] = pts(sl.pts); if (Math.hypot(a[0] - c[0], a[1] - c[1]) > 40) min = Math.min(min, inc(a, b, c));
      }
      hx.push(pts(f.find((x) => x.w === 12)!.pts)[0][0]);
    }
    expect(min).toBeGreaterThan(163);
    expect(Math.max(...hx) - Math.min(...hx)).toBeGreaterThan(2.5);
  });

  it("r2: tuck transit is a tuck, not a pike (knee < 60 while the hip is still > 150)", () => {
    let ok = false;
    for (let t = 600; t < 2400; t += 50) {
      const f = used("hstuck", t), [H, K] = pts(f.find((s) => s.color === FIGURE_COLORS.BODY && s.w === 6)!.pts), [, F] = pts(f.find((s) => s.color === ACCENT && s.w === 8)!.pts), [S] = pts(f.find((s) => s.w === 12)!.pts);
      if (inc(H, K, F) < 60 && inc(S, H, K) > 150) ok = true;
      if (inc(S, H, K) < 150) expect(inc(H, K, F)).toBeLessThan(60);
    }
    expect(ok).toBe(true);
  });

  it("r2: wallhs_90 is separated from the chest-in hold by 20+ deg; shrug head sinks; wall holds and free sway use the clock", () => {
    expect(trunk("wallhs_90", 3000) - trunk("wallhs", 3000)).toBeGreaterThan(18);
    expect(trunk("wallhs", 1500)).not.toBeCloseTo(trunk("wallhs", 2400), 3);
    expect(trunk("hsfree", 700)).not.toBeCloseTo(trunk("hsfree", 700 + 6000 / 3), 3);
  });

  it("r2: wall walk keeps one pair planted at a time (hand x constant while the feet move and the reverse)", () => {
    const d = T("wallwalk"), foot = (t: number) => pts(used("wallwalk", t).find((s) => s.w === 8 && pts(s.pts).length === 2 && pts(s.pts)[1][0] > 299)!.pts)[1][1];
    const hand = (t: number) => pts(used("wallwalk", t).find((s) => s.color === ACCENT && s.w === 8)!.pts)[0][0];
    let both = 0;
    for (let t = 0; t < d * 0.6; t += 20) {
      const dh = Math.abs(hand(t + 20) - hand(t)), df = Math.abs(foot(t + 20) - foot(t));
      if (dh > 0.3 && df > 0.3) both++;
    }
    expect(both).toBe(0);
    expect(trunk("wallwalk", 0)).toBeGreaterThan(65);
  });

  it("r2: wrist push-ups palms up: body still, wrist extension 0 to ~65 deg in 3 s, back in 1 s", () => {
    const hand = (t: number) => { const f = used("wristback", t).find((s) => s.w === 4)!; return pts(f.pts); };
    const ang = (t: number) => { const [w, tip] = hand(t); return 180 - Math.abs((Math.atan2(w[1] - tip[1], tip[0] - w[0]) * 180) / Math.PI); };
    const top = 4500 * 0.7;
    expect(Math.abs(ang(0))).toBeLessThan(2);
    expect(Math.abs(ang(top))).toBeGreaterThan(60); expect(Math.abs(ang(top))).toBeLessThan(70);
    expect(Math.abs(ang(4500 * 0.02 + 4500 * 0.67 * 0.5))).toBeLessThan(Math.abs(ang(top)));
    // r3: the hand is an accented 11 px segment and the shoulders drift 3 px forward over the press; the top holds >= 150 ms.
    const h0 = hand(top); expect(Math.hypot(h0[1][0] - h0[0][0], h0[1][1] - h0[0][1])).toBeCloseTo(11, 0);
    expect(used("wristback", top).find((s) => s.w === 4)!.color).toBe(ACCENT);
    const shx = (t: number) => pts(used("wristback", t).find((s) => s.w === 12)!.pts)[1][0];
    expect(shx(top) - shx(0)).toBeGreaterThan(2.5); expect(shx(top) - shx(0)).toBeLessThan(3.5);
    expect((FIGS.wristback.k![2] - FIGS.wristback.k![1]) * 4500).toBeGreaterThanOrEqual(150);
  });

  it("r3: kick-up hip stays within the push leg's reach (<= 80 px) while it kicks and the second leg keeps drifting in over the hold", () => {
    const d = T("kickup");
    const dist = (t: number) => {
      const f = used("kickup", t), H = pts(f.find((s) => s.w === 12)!.pts)[1], leg = pts(f.find((s) => s.color === FIGURE_COLORS.FAR && s.w === 8 && pts(s.pts).length === 3)!.pts)[2];
      return Math.hypot(leg[0] - H[0], leg[1] - H[1]);
    };
    for (let p = 0.05; p <= 0.15; p += 0.005) expect(dist(d * p)).toBeLessThanOrEqual(80.01);
    const tip = (t: number) => pts(used("kickup", t).find((s) => s.color === FIGURE_COLORS.FAR && s.w === 8 && pts(s.pts).length === 3)!.pts)[2][0];
    expect(Math.abs(tip(d * 0.3) - tip(d * 0.2))).toBeGreaterThan(0.3);   // no dead stop when the leg arrives
  });

  it("r3: hswalk lifts the free hand 8-10 px and the hip counter-drifts 3-4 px toward the planted hand before the lift", () => {
    let top = 0;
    for (let t = 0; t < 3600; t += 40) {
      for (const sl of used("hswalk", t).filter((x) => (x.color === ACCENT || x.color === FIGURE_COLORS.FAR) && x.w === 8 && pts(x.pts).length === 3)) top = Math.max(top, 168 - pts(sl.pts)[2][1]);
    }
    expect(top).toBeGreaterThan(8); expect(top).toBeLessThan(10.5);
    // Hip x minus the shoulder-and-lean part: the counter-drift is the only term that returns to 0 at v = 0.1..0.389,
    // so across the 0.4 s window before the first lift (p -0.061..0.05) the hip must move back by 3-4 px more than the lean term.
    const hipRel = (p: number) => { const f = used("hswalk", 3600 * ((p + 1) % 1)); return pts(f.find((x) => x.w === 12)!.pts)[1][0] - 180; };
    const lean = (p: number) => 2 + Math.cos(4 * Math.PI * (p - 0.275));
    const base = (p: number) => 1.5 + 1.5 * Math.cos(4 * Math.PI * (p - 0.275)) + 2 * Math.cos(2 * Math.PI * (p - 0.25)) + 56 * Math.sin(((lean(p) - 0) * Math.PI) / 180);
    const extra = (p: number) => hipRel(p) - base(p);
    expect(extra(0.05) - extra(0.05 - 0.111)).toBeLessThan(-3);
    expect(extra(0.05) - extra(0.05 - 0.111)).toBeGreaterThan(-4);
  });

  it("r3: wall walk, the planted pair holds x within 0.5 px (and y, for the feet) through the other pair's slot", () => {
    const d = T("wallwalk");
    const handX = (t: number) => pts(used("wallwalk", t).find((s) => s.color === ACCENT && s.w === 8)!.pts)[0][0];
    const foot = (t: number) => pts(used("wallwalk", t).find((s) => s.w === 8 && pts(s.pts).length === 2 && pts(s.pts)[1][0] > 299)!.pts)[1];
    // Walk the timeline in 10 ms steps; group steps into runs of "hands moving" and "feet moving". Inside a run of one pair
    // moving, the other pair's position must not change by more than 0.5 px, and the feet never leave the wall line.
    const ts = Array.from({ length: 540 }, (_, j) => d * 0.08 + j * 10 * (d / 9000) * 1.0);
    const hx = ts.map(handX), fy = ts.map((t) => foot(t)[1]), fx = ts.map((t) => foot(t)[0]);
    const rng = (v: number[], i: number, j: number) => Math.max(...v.slice(i, j + 1)) - Math.min(...v.slice(i, j + 1));
    let runs = 0, i = 1;
    while (i < ts.length) {
      const hm = Math.abs(hx[i] - hx[i - 1]) > 0.02, fm = Math.abs(fy[i] - fy[i - 1]) > 0.02;
      expect(hm && fm).toBe(false);
      if (!hm && !fm) { i++; continue; }
      let j = i; while (j + 1 < ts.length && (Math.abs(hx[j + 1] - hx[j]) > 0.02) === hm && (Math.abs(fy[j + 1] - fy[j]) > 0.02) === fm) j++;
      expect(hm ? rng(fy, i - 1, j) : rng(hx, i - 1, j)).toBeLessThanOrEqual(0.5);
      runs++; i = j + 1;
    }
    expect(runs).toBeGreaterThanOrEqual(10);
    expect(rng(fx, 0, ts.length - 1)).toBeLessThanOrEqual(0.5);
  });
});
