import { describe, it, expect } from "vitest";
import { FIGS, drawFigure, FIGURE_COLORS, ACCENT } from "./rig";

// Strength family: trainer + physics review, 2026-10-29 (dev/active/figure-animation/20-lane-strength.md).

type Pt = number[];
const pts = (s: string): Pt[] => s.split(" ").map((p) => p.split(",").map(Number));
const used = (id: string, t: number, side: "L" | "R" | "B" = "B") => drawFigure(id, side, t, false).slots.filter((s) => s.w > 0 && !s.bg && !s.cue);
const deg = (r: number) => (r * 180) / Math.PI;
const inc = (a: Pt, b: Pt, c: Pt) => {
  const v1 = [a[0] - b[0], a[1] - b[1]], v2 = [c[0] - b[0], c[1] - b[1]];
  return deg(Math.acos(Math.max(-1, Math.min(1, (v1[0] * v2[0] + v1[1] * v2[1]) / (Math.hypot(...v1) * Math.hypot(...v2))))));
};
const mid = (a: Pt, b: Pt, f: number): Pt => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
/** Time at the end of the way out (the deepest / most effortful pose). */
const endT = (id: string) => FIGS[id].dur! * FIGS[id].k![1];
const times = (id: string, n = 60) => Array.from({ length: n + 1 }, (_, i) => (FIGS[id].dur! * i) / n);

/** Winter-segment centre of mass x of body plus load for a squat-family frame (both legs drawn as one). */
function comX(id: string, t: number, loadMass: number): number {
  const sl = used(id, t);
  const chain = pts(sl.find((s) => s.w === 8 && s.color === FIGURE_COLORS.BODY && pts(s.pts).length === 3)!.pts);
  const trunk = pts(sl.find((s) => s.w === 12)!.pts);
  const head = sl.find((s) => s.w >= 18 && s.w <= 24 && pts(s.pts).length === 2 && Math.hypot(pts(s.pts)[0][0] - pts(s.pts)[1][0], pts(s.pts)[0][1] - pts(s.pts)[1][1]) < 1)!;
  const hipFirst = chain[0][1] < chain[2][1];
  const [Hh, K, F] = hipFirst ? chain : [chain[2], chain[1], chain[0]];
  const [hip, sh] = trunk[0][1] > trunk[1][1] ? [trunk[1], trunk[0]] : [trunk[0], trunk[1]];
  let M = 0, X = 0;
  const add = (m: number, x: number) => { M += m; X += m * x; };
  for (let i = 0; i < 2; i++) { add(0.2, mid(Hh, K, 0.43)[0]); add(0.093, mid(K, F, 0.43)[0]); add(0.029, F[0] + 4); }
  add(0.497, mid(hip, sh, 0.55)[0]); add(0.081, pts(head.pts)[0][0]);
  const arm = sl.find((s) => s.w === 8 && s.color === ACCENT);
  if (arm) { const p = pts(arm.pts); add(0.1, mid(p[0], p[p.length - 1], 0.5)[0]); }
  const ring = sl.filter((s) => s.color === FIGURE_COLORS.PROP && s.w === 3 && pts(s.pts).length > 10).pop();
  if (loadMass && ring) add(loadMass, pts(ring.pts).reduce((a, q) => a + q[0], 0) / pts(ring.pts).length);
  return X / M;
}

describe("strength figures", () => {
  it("squats balance: the centre of mass (body + load) stays over the foot, mid-foot at depth", () => {
    // Sole is ankle-4 .. ankle+12 = 151..167, mid-foot 159.
    for (const [id, load] of [["squat", 0.5], ["frontsquat", 0.5], ["goblet", 0.1], ["airsquat", 0]] as const) {
      for (const t of times(id)) {
        const x = comX(id, t, load);
        expect(x, `${id}@${t}`).toBeGreaterThan(152);
        expect(x, `${id}@${t}`).toBeLessThan(166);
      }
      expect(comX(id, endT(id), load), id).toBeGreaterThan(155);
    }
  });

  it("squat trunk leans like each variant at depth and stays inclined on the way up", () => {
    const trunkLean = (id: string, t: number) => { const [a, b] = pts(used(id, t).find((s) => s.w === 12)!.pts); const [H, S] = a[1] > b[1] ? [a, b] : [b, a]; return deg(Math.atan2(S[0] - H[0], H[1] - S[1])); };
    expect(trunkLean("squat", endT("squat"))).toBeGreaterThan(33);
    expect(trunkLean("frontsquat", endT("frontsquat"))).toBeGreaterThan(15);
    expect(trunkLean("frontsquat", endT("frontsquat"))).toBeLessThan(26);
    expect(trunkLean("goblet", endT("goblet"))).toBeGreaterThan(20);
    expect(trunkLean("goblet", endT("goblet"))).toBeLessThan(31);
    // Halfway back up (knee ~100-130) the squat torso still has a clear lean: chest and hips rise together.
    const f = FIGS.squat, ts = Array.from({ length: 200 }, (_, i) => f.dur! * (f.k![2] + ((f.k![3] ?? 1) - f.k![2]) * i / 200));
    const t130 = ts.find((t) => { const c = pts(used("squat", t).find((s) => s.w === 8 && s.color === FIGURE_COLORS.BODY && pts(s.pts).length === 3)!.pts); return inc(c[0], c[1], c[2]) > 120 || inc(c[2], c[1], c[0]) > 120; })!;
    expect(trunkLean("squat", t130)).toBeGreaterThan(10);
  });

  it("the block pull starts at mid-shin on low blocks, reaches lockout and keeps the knee clear of the bar", () => {
    const dl = (t: number) => {
      const sl = used("deadlift", t);
      const leg = pts(sl.find((s) => s.w === 8 && s.color === FIGURE_COLORS.BODY && pts(s.pts).length === 3)!.pts);
      const [F, K, H] = leg[0][1] > leg[2][1] ? leg : [leg[2], leg[1], leg[0]];
      const [h2, S] = pts(sl.find((s) => s.w === 12)!.pts).sort((a, b) => b[1] - a[1]);
      const ring = pts(sl.find((s) => s.color === FIGURE_COLORS.PROP && s.w === 3 && pts(s.pts).length > 10)!.pts);
      const B = [ring.reduce((a, q) => a + q[0], 0) / ring.length, ring.reduce((a, q) => a + q[1], 0) / ring.length];
      return { F, K, H: h2, S, B, hip: inc(S, H, K), knee: inc(H, K, F), shin: deg(Math.atan2(Math.abs(K[0] - F[0]), F[1] - K[1])) };
    };
    const top = dl(endT("deadlift"));
    expect(top.hip).toBeGreaterThanOrEqual(174);
    expect(top.knee).toBeGreaterThanOrEqual(174);
    expect(deg(Math.atan2(Math.abs(top.S[0] - top.H[0]), top.H[1] - top.S[1]))).toBeLessThanOrEqual(4);
    const bottom = dl(0);
    expect(bottom.knee).toBeGreaterThan(110); expect(bottom.knee).toBeLessThan(126);
    expect(bottom.hip).toBeGreaterThan(62); expect(bottom.hip).toBeLessThan(78);
    expect(bottom.shin).toBeGreaterThan(6); expect(bottom.shin).toBeLessThan(18);
    expect(166 - bottom.B[1]).toBeGreaterThan(28); expect(166 - bottom.B[1]).toBeLessThan(36);   // plate on ~14 px blocks: bar centre ~32 px up
    for (const t of times("deadlift", 120)) { const f = dl(t); expect(Math.hypot(f.B[0] - f.K[0], f.B[1] - f.K[1]), `knee@${t}`).toBeGreaterThanOrEqual(9); }
  });

  it("the sled pusher's arms reach the posts and the drive leg extends at push-off", () => {
    let maxKnee = 0, maxElbow = 0;
    for (const t of times("sled", 80)) {
      for (const s of used("sled", t)) {
        const p = pts(s.pts);
        if (s.w !== 8 || p.length !== 3) continue;
        if (s.color === ACCENT) maxKnee = Math.max(maxKnee, inc(p[0], p[1], p[2]));
        if (s.color === FIGURE_COLORS.BODY && p[0][1] < 100 && p[2][0] > 230) maxElbow = Math.max(maxElbow, inc(p[0], p[1], p[2]));
      }
    }
    expect(maxKnee).toBeGreaterThanOrEqual(165);
    expect(maxElbow).toBeGreaterThanOrEqual(160);
    // Heavy steps are low: the swing foot never rises more than ~10 px (round 3: it reaches ~10, the carries keep 6).
    for (const t of times("sled", 80)) {
      const feet = used("sled", t).filter((s) => s.w === 8 && pts(s.pts).length === 3 && (s.color === ACCENT || s.color === FIGURE_COLORS.FAR) && pts(s.pts)[2][1] > 120).map((s) => pts(s.pts)[2][1]);
      for (const y of feet) expect(y).toBeGreaterThanOrEqual(166 - 10.01);
    }
    const lowest = Math.min(...times("sled", 160).flatMap((t) => used("sled", t).filter((s) => s.w === 8 && pts(s.pts).length === 3 && (s.color === ACCENT || s.color === FIGURE_COLORS.FAR) && pts(s.pts)[2][1] > 120).map((s) => pts(s.pts)[2][1])));
    expect(lowest).toBeLessThanOrEqual(166 - 9.5);
  });

  it("carries step at walking cadence and keep the bell hanging from a long arm", () => {
    expect(FIGS.farmer.dur).toBeLessThanOrEqual(1200);
    expect(FIGS.suitcase.dur).toBeLessThanOrEqual(1200);
    const arm = used("farmer", 0).find((s) => s.w === 8 && s.color === ACCENT)!;
    const [a, b] = pts(arm.pts);
    expect(Math.hypot(a[0] - b[0], a[1] - b[1])).toBeGreaterThan(64);
  });

  it("the nordic lowers to ~85 degrees from vertical and the hand stays planted once down", () => {
    const trunk = (t: number) => { const [a, b] = pts(used("nordic", t).find((s) => s.w === 12)!.pts); const [H, S] = a[1] > b[1] ? [a, b] : [b, a]; return deg(Math.atan2(Math.abs(S[0] - H[0]), H[1] - S[1])); };
    expect(trunk(endT("nordic"))).toBeGreaterThan(80);
    // The way down is 3-5 s.
    expect(FIGS.nordic.dur! * (FIGS.nordic.k![1] - FIGS.nordic.k![0])).toBeGreaterThanOrEqual(3000);
    expect(FIGS.nordic.dur! * (FIGS.nordic.k![1] - FIGS.nordic.k![0])).toBeLessThanOrEqual(5000);
    const handX = (t: number) => { const arm = used("nordic", t).filter((s) => s.w === 8 && s.color === FIGURE_COLORS.BODY && pts(s.pts).length === 3).pop()!; return pts(arm.pts)[2]; };
    const end = endT("nordic"), h1 = handX(end), h2 = handX(end * 0.97);
    expect(h1[1]).toBeCloseTo(166, 0);
    expect(h2[0]).toBeCloseTo(h1[0], 0);
  });

  it("the single-leg RDL is a hinge: the stance knee stays long and the hip goes back", () => {
    for (const t of times("slrdl", 40)) {
      const leg = used("slrdl", t, "L").find((s) => s.w === 8 && s.color === FIGURE_COLORS.L && pts(s.pts).length === 3)!;
      const [H, K, F] = pts(leg.pts);
      expect(inc(H, K, F), `knee@${t}`).toBeGreaterThanOrEqual(160);
      expect(H[1], `hipY@${t}`).toBeLessThanOrEqual(86);   // never drops toward a squat
    }
  });

  it("the split squat's rear leg flexes past 80 at the bottom and the front shin stays near vertical", () => {
    const sl = used("splitsquat", endT("splitsquat"), "L");
    const front = pts(sl.find((s) => s.color === FIGURE_COLORS.L && s.w === 8 && pts(s.pts).length === 3)!.pts);
    const rear = pts(sl.find((s) => s.color === FIGURE_COLORS.BODY && s.w === 8 && pts(s.pts).length === 3 && pts(s.pts)[2][0] < 120)!.pts);
    const shinFromVert = (c: Pt[]) => deg(Math.atan2(Math.abs(c[1][0] - c[2][0]), Math.abs(c[1][1] - c[2][1])));
    expect(shinFromVert(front)).toBeLessThan(10);
    expect(inc(rear[0], rear[1], rear[2])).toBeGreaterThanOrEqual(78);
    expect(shinFromVert(rear)).toBeGreaterThan(18);
  });

  it("round 2: sled steps are ~1 s, the carries breathe, the nordic pushes before the hands let go", () => {
    expect(FIGS.sled.dur! / 2).toBeGreaterThanOrEqual(900);
    expect(FIGS.sled.dur! / 2).toBeLessThanOrEqual(1100);
    let maxShin = 0;
    for (const t of times("sled", 80)) for (const s of used("sled", t)) {
      const p = pts(s.pts);
      if (s.w === 8 && p.length === 3 && p[2][1] > 150 && (s.color === ACCENT || s.color === FIGURE_COLORS.FAR)) maxShin = Math.max(maxShin, deg(Math.atan2(Math.abs(p[1][0] - p[2][0]), Math.abs(p[1][1] - p[2][1]))));
    }
    expect(maxShin).toBeLessThan(62);
    // Breathing: the whole upper body moves about 1 px over 4 s without changing the step.
    const y = (t: number) => pts(used("farmer", t).find((s) => s.w === 12)!.pts)[0][1];
    expect(Math.abs(y(1000 + 4400) - y(1000 + 400))).toBeGreaterThan(0);
    // Nordic: the elbow never jumps more than 45 deg between 40 ms frames.
    let prev = 0;
    for (let t = 0; t <= FIGS.nordic.dur!; t += 40) {
      const arm = used("nordic", t).filter((s) => s.w === 8 && s.color === FIGURE_COLORS.BODY && pts(s.pts).length === 3).pop()!;
      const q = pts(arm.pts), e = inc(q[0], q[1], q[2]);
      if (t > 0) expect(Math.abs(e - prev), `elbow@${t}`).toBeLessThan(45);
      prev = e;
    }
  });

  it("round 2: the split squat has both legs long on top, a ~90 degree rear knee and a ~30 degree rear shin at depth", () => {
    const top = used("splitsquat", 0, "L"), bot = used("splitsquat", endT("splitsquat"), "L");
    const legs = (sl: ReturnType<typeof used>) => sl.filter((s) => s.w === 8 && pts(s.pts).length === 3 && (s.color === FIGURE_COLORS.L || (s.color === FIGURE_COLORS.BODY && pts(s.pts)[2][0] < 120))).map((s) => pts(s.pts));
    for (const c of legs(top)) expect(inc(c[0], c[1], c[2])).toBeGreaterThanOrEqual(160);
    const rear = legs(bot).find((c) => c[2][0] < 120)!;
    expect(inc(rear[0], rear[1], rear[2])).toBeGreaterThan(84); expect(inc(rear[0], rear[1], rear[2])).toBeLessThan(100);
    expect(deg(Math.atan2(Math.abs(rear[1][0] - rear[2][0]), Math.abs(rear[1][1] - rear[2][1])))).toBeGreaterThan(28);
  });

  it("round 3: hip thrust starts with the trunk ~50 deg from vertical, the goblet presses the elbows out in its pause, the nordic tile is the half-way frame", () => {
    const hip = (t: number) => { const [S, H] = pts(used("hipthrust", t).find((s) => s.w === 12)!.pts); return { trunk: deg(Math.atan2(Math.abs(S[0] - H[0]), Math.abs(S[1] - H[1]))) }; };
    expect(hip(0).trunk).toBeGreaterThan(48); expect(hip(0).trunk).toBeLessThan(52);
    const bell = (t: number) => { const r = used("goblet", t).filter((s) => s.color === FIGURE_COLORS.PROP && s.w === 3 && pts(s.pts).length > 10)[0]; return pts(r.pts)[0]; };
    const f = FIGS.goblet, e0 = bell(f.dur! * f.k![1]), e1 = bell(f.dur! * (f.k![2] - 0.001));
    expect(Math.hypot(e0[0] - e1[0], e0[1] - e1[1])).toBeGreaterThan(1.5);   // the arm opens during the pause
    expect(FIGS.nordic.poster).toBeGreaterThanOrEqual(0.45); expect(FIGS.nordic.poster).toBeLessThanOrEqual(0.55);
    // Carries sway +-5 px.
    const xs = times("farmer", 110).map((t) => pts(used("farmer", t).find((s) => s.w === 12)!.pts)[0][0]);
    expect(Math.max(...xs) - Math.min(...xs)).toBeLessThan(11);
  });
});
