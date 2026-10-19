/**
 * Exercise illustrations: one shared jointed rig for every figure (2026-10-19).
 *
 * Interim media for the follow-along player until real clips exist (founder
 * films them once Terav has users; AI video was tested and paused — see
 * dev/active/exercise-media/). Reviewed by a coach / visual / motion / a11y
 * panel over two rounds; the constraints below are theirs and are not cosmetic:
 *
 * - Limbs ROTATE at joints, so segment lengths never change (the first draft
 *   interpolated points and limbs stretched up to 24%).
 * - Side views show the figure's RIGHT side nearest the viewer, so left limbs
 *   are drawn behind. A left set's working leg is therefore behind the near
 *   leg — the founder spotted the inverse on the glute bridge.
 * - The dead bug moves OPPOSITE arm and leg; the first draft taught same-side.
 * - Half-kneeling stretch: trunk never leans back (cues lumbar extension).
 * - 90/90: the inward knee never crosses its own hip — deep flexion +
 *   adduction + internal rotation is a documented provocative position.
 * - Glute bridge: free leg held bent — a straight raised leg is a resisted
 *   straight-leg-raise hold, another documented provocateur.
 * - Contrast: every meaningful stroke >= 3:1 on #16181c (WCAG 1.4.11),
 *   including props, the floor and the reduced-motion ghost.
 *
 * Everything is a polyline in a fixed slot list so draw order (what is in
 * front) is exact and the renderer can update attributes in place.
 */

export type Pt = number[]; // [x, y]; a plain array so literal coordinates need no casts
export type FigureSide = "L" | "R" | "B";
export type FigureSlot = { pts: string; color: string; w: number; op: number; fill: string; dash: string };
export type FigureBadge = { x: number; y: number; color: string; letter: string; op: number };
export type FigureFrame = { label: string; tf: string; slots: FigureSlot[]; badges: FigureBadge[] };
type Kind = "hold" | "move" | "move2";
type Fig = {
  kind: Kind;
  dur?: number;
  k?: [number, number, number];
  sided: boolean;
  scale?: number;
  build: (sc: Scene, side: FigureSide, p: number, rep?: number) => string;
};

const COL: Record<FigureSide, string> = { L: "#5fa3b0", R: "#b58dbb", B: "#d6d9de" };
const BODY = "#9aa0a8", FAR = "#6b717d", FLOOR = "#60656f", PROP = "#5f6570", WOOD = "#8a6f55";
const TORSO = 12;
const SLOTS = 20;
function ease(x: number) { return 0.5 - 0.5 * Math.cos(Math.PI * x); }
// rest → move → hold → return, as 0..1
function prog(t: number, k: [number, number, number]) {
  if (t < k[0]) return 0;
  if (t < k[1]) return ease((t - k[0]) / (k[1] - k[0]));
  if (t < k[2]) return 1;
  return 1 - ease((t - k[2]) / (1 - k[2]));
}
function lerp(a: number, b: number, p: number) { return a + (b - a) * p; }
function lerpP(a: Pt, b: Pt, p: number): Pt { return [lerp(a[0], b[0], p), lerp(a[1], b[1], p)]; }
function P(o: Pt, len: number, deg: number): Pt { const r = deg * Math.PI / 180; return [o[0] + len * Math.cos(r), o[1] + len * Math.sin(r)]; }
function add(a: Pt, d: Pt): Pt { return [a[0] + d[0], a[1] + d[1]]; }
function beyond(a: Pt, b: Pt, d: number): Pt { const dx = b[0] - a[0], dy = b[1] - a[1], n = Math.hypot(dx, dy) || 1; return [b[0] + dx / n * d, b[1] + dy / n * d]; }
function ik(H: Pt, F: Pt, L1: number, L2: number, up: boolean): Pt {
  const dx = F[0] - H[0], dy = F[1] - H[1], d = Math.min(Math.hypot(dx, dy), L1 + L2 - 0.01);
  const a = (L1 * L1 - L2 * L2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, L1 * L1 - a * a));
  const n = Math.hypot(dx, dy) || 1, ux = dx / n, uy = dy / n;
  const mx = H[0] + a * ux, my = H[1] + a * uy;
  const k1: Pt = [mx + h * uy, my - h * ux], k2: Pt = [mx - h * uy, my + h * ux];
  return (k1[1] < k2[1]) === up ? k1 : k2;
}
function fmt(a: Pt[]) { return a.map(function (p) { return (Math.round(p[0] * 10) / 10) + "," + (Math.round(p[1] * 10) / 10); }).join(" "); }
class Scene {
  items: FigureSlot[] = [];
  badges: FigureBadge[] = [];
  scale = 1;
  line(a: Pt[], color: string, w?: number, op?: number | null, fill?: string) {
    this.items.push({ pts: fmt(a), color, w: w || 8, op: op == null ? 1 : op, fill: fill || "none", dash: "none" });
  }
  ring(c: Pt, r: number, color: string, w?: number, op?: number) {
    const a: Pt[] = [];
    for (let i = 0; i <= 24; i++) a.push(P(c, r, i * 15));
    this.line(a, color, w || 2, op);
  }
  dot(c: Pt, r: number, color: string, op?: number) { this.line([c, [c[0] + 0.01, c[1]]], color, r * 2, op); }
  badge(p: Pt, color: string, letter: string) {
    this.badges.push({ x: Math.round(p[0]), y: Math.round(p[1]), color, letter, op: 1 });
  }
  floor() {
// Floor inset 24px from the card edge at every scale (lying figures are drawn scaled up).
    const k = this.scale || 1, x0 = 179 - (179 - 24) / k, x1 = 179 + (334 - 179) / k;
    this.line([[x0, 168], [x1, 168]], FLOOR, 2);
  }
}
function tf(scale: number) { return scale === 1 ? "" : "translate(179 160) scale(" + scale + ") translate(-179 -168)"; }
function sideWord(s: string) { return s === "L" ? "left" : s === "R" ? "right" : "both"; }

// Side views face RIGHT or lie with the head LEFT: either way we see her RIGHT side,
// so right limbs are near (drawn in front) and left limbs are far (drawn behind).
export const FIGS: Record<string, Fig> = {
  hipflex: { kind: "hold", sided: true, build(sc, side, q) {
    const work = COL[side], H = [176, 122], S = [171, 62];
    const wAng = lerp(-8, -14, q), wK = P(H, 64, wAng), wF = P(wK, 54, wAng + 98);
    const rK = P(H, 62, 2), rF = [rK[0] + 4, 166];
    const hand = add(lerpP(H, wK, 0.74), [0, -6]), elbow = ik(S, hand, 36, 34, false);
    const workLeg = function () { sc.line([H, wK, wF], work, 8); };
    const restLeg = function () { sc.line([H, rK, rF], side === "R" ? FAR : BODY, 8); };
    sc.line([[108, 128], [196, 128], [196, 167], [108, 167], [108, 128]], PROP, 2, 1, PROP);
    if (side === "L") { workLeg(); } else { restLeg(); }
    sc.line([H, S], BODY, TORSO); sc.line([S, [172, 52]], BODY, 8); sc.dot([173, 44], 11, BODY);
    if (side === "L") { restLeg(); } else { workLeg(); }
    sc.line([S, elbow, hand], BODY, 8);
    const top = add(wK, [0, -16]);
    sc.line([top, add(top, [0, -16])], work, 3, 0.6 + 0.4 * q);
    sc.line([add(top, [-5, -11]), add(top, [0, -17]), add(top, [5, -11])], work, 3, 0.6 + 0.4 * q);
    sc.badge(beyond(wK, wF, 16), work, side);
    return "Seated hip-flexor hold, " + sideWord(side) + " leg: sitting tall, the " + sideWord(side) + " thigh presses up into the hands at about 60% effort and holds";
  } },
  adductor: { kind: "hold", sided: false, scale: 1.15, build(sc, side, q) {
    const S = [98, 158], H = [196, 160], F = [266, 166], K = ik(H, F, 66, 62, true);
    sc.floor();
    sc.line([S, [164, 166]], BODY, 8);
    sc.line([S, H], BODY, TORSO); sc.line([[76, 154], S], BODY, 8); sc.dot([68, 151], 11, BODY);
    sc.line([H, K, F], COL.B, 8);
    const ball = add(K, [-4, 8]), r = lerp(10, 8.5, q);
    sc.dot(ball, r + 1.5, FAR); sc.dot(ball, r, PROP);
    return "Adductor squeeze: lying on the back with knees bent, squeezing a ball between the knees at about 60% and holding";
  } },
  bridge: { dur: 5000, kind: "move", k: [0.08, 0.32, 0.64], sided: true, scale: 1.15, build(sc, side, p) {
    // Foot under the knee at the top (vertical shin, no hamstring cramp). The free leg is held
    // bent (short lever): a straight raised leg is a resisted straight-leg-raise hold.
    const S = [98, 158], T = 100, F = [258, 164], th = lerp(0, 19.7, p) * Math.PI / 180;
    const H = [S[0] + T * Math.cos(th), S[1] - T * Math.sin(th)], K = ik(H, F, 66, 62, true);
    const thDeg = lerp(0, 19.7, p), FK = P(H, 60, -78 - thDeg * 0.5), FF = P(FK, 52, -78 - thDeg * 0.5 + 90);
    const planted = [H, K, F], free = [H, FK, FF];
    sc.floor();
    if (side === "R") sc.line(free, FAR, 8);
    sc.line([[100, 162], [164, 166]], BODY, 8);
    sc.line([[76, 154], S], BODY, 8); sc.dot([68, 151], 11, BODY);
    sc.line([S, H], BODY, TORSO);
    if (side === "L") { sc.line(free, BODY, 8); sc.line(planted, COL.L, 8); }   // working limb drawn last
    else sc.line(planted, COL.R, 8);
    sc.badge([F[0] + 20, F[1] - 8], COL[side], side);
    return "Single-leg glute bridge, " + sideWord(side) + " foot planted: hips lift until shoulder, hip and knee form one straight line, the other knee stays bent and lifted";
  } },
  deadbug: { dur: 14000, kind: "move2", k: [0.07, 0.43, 0.57], sided: false, build(sc, side, p, rep = 0) {
    const S = [112, 157], H = [208, 160], off = [-12, -8], fS = add(S, off), fH = add(H, off);
    const arm = function (o: Pt, q: number) { return [o, P(o, 62, lerp(-90, -160, q))]; };
    const leg = function (o: Pt, q: number) { const a = lerp(-90, -10, q), K = P(o, 62, a); return [o, K, P(K, 58, a + lerp(90, 0, q))]; };
    const nA = arm(S, rep === 0 ? p : 0), fA = arm(fS, rep === 1 ? p : 0), nL = leg(H, rep === 1 ? p : 0), fL = leg(fH, rep === 0 ? p : 0);
    sc.floor();
    sc.line(fA, rep === 1 ? COL.L : FAR, 8); sc.line(fL, rep === 0 ? COL.L : FAR, 8);
    sc.line([S, H], BODY, TORSO);
    sc.line(nA, rep === 0 ? COL.R : BODY, 8); sc.line(nL, rep === 1 ? COL.R : BODY, 8);
    sc.line([[92, 155], S], BODY, 8); sc.dot([82, 153], 11, BODY);   // head in front: the arm passes behind it
    const wa = rep === 0 ? nA : fA, wl = rep === 0 ? fL : nL, as = rep === 0 ? "R" : "L", ls = rep === 0 ? "L" : "R";
    sc.badge(beyond(wa[0], wa[1], 14), COL[as], as); sc.badge(beyond(wl[1], wl[2], 14), COL[ls], ls);
    return "Dead bug: lying on the back, arms up, knees over hips. The " + sideWord(as) + " arm reaches overhead while the " + sideWord(ls) + " leg straightens low, then return and switch to the other pair";
  } },
  kneel: { dur: 12000, kind: "move", k: [0.05, 0.25, 0.85], sided: true, build(sc, side, p) {
    // Trunk stays upright (never leans back: that cues lumbar extension). Start with the hip over the
    // back knee, end about 20° of hip extension: gentle, never couch-stretch depth.
    const work = COL[side], KB = [146, 164], BF = [94, 166], FF = [236, 166];
    const H = lerpP([148, 112], [164, 114], p), FK = ik(H, FF, 64, 56, true);
    const S = P(H, 58, lerp(-90, -88, p)), head = P(S, 20, -90);
    const back = function () { sc.line([BF, KB, H], work, 8); };
    const front = function () { sc.line([H, FK, FF], side === "R" ? FAR : BODY, 8); };
    sc.floor();
    if (side === "R") front();
    sc.line([H, S], BODY, TORSO); sc.line([S, add(S, [0, -8])], BODY, 8); sc.dot(head, 11, BODY);
    sc.line([S, add(S, [-18, 28]), add(H, [-4, -4])], BODY, 8);
    if (side === "L") front();
    back();
    sc.ring(lerpP(KB, H, 0.8), 9, work, 2, p);
    sc.badge(beyond(KB, BF, 16), work, side);
    return "Half-kneeling hip-flexor stretch, " + sideWord(side) + " knee down: tuck the pelvis, squeeze the back glute and shift the hips gently forward, trunk upright, then hold";
  } },
  ninety: { dur: 8000, kind: "move", k: [0.1, 0.4, 0.6], sided: false, build(sc, side, p) {
    // Seen from ABOVE: the knee rotates about the hip-foot axis with fixed 3D limb lengths, so in
    // this view it sweeps across the axis. Range clamped so the inward knee never crosses its own
    // hip line (no deep flexion + adduction + internal rotation).
    const phi = lerp(-55, 55, p) * Math.PI / 180, L = 58;
    const leg = function (h: Pt, f: Pt, toRight: (ux: number, uy: number) => Pt) {
      const dx = f[0] - h[0], dy = f[1] - h[1], d = Math.hypot(dx, dy), m = lerpP(h, f, 0.5);
      const r = Math.sqrt(Math.max(0, L * L - d * d / 4)), ux = dx / d, uy = dy / d;
      const n = toRight(ux, uy);
      return [h, [m[0] + r * Math.sin(phi) * n[0], m[1] + r * Math.sin(phi) * n[1]], f];
    };
    const hL = [166, 96], hR = [192, 96];
    const toRight = function (ux: number, uy: number): Pt { return [uy, -ux]; };   // perpendicular pointing to the viewer's right for both legs
    const left = leg(hL, [108, 172], toRight);
    const right = leg(hR, [250, 172], toRight);   // so one knee falls in while the other falls out
    sc.line([[160, 66], [148, 34]], FAR, 6); sc.line([[198, 66], [210, 34]], FAR, 6);
    sc.line([[179, 96], [179, 68]], BODY, TORSO); sc.line([[158, 66], [200, 66]], BODY, 8);
    sc.dot([179, 52], 11, BODY);
    sc.line([hL, hR], BODY, 10);
    sc.line(left, COL.B, 8); sc.line(right, COL.B, 8);
    return "90/90 hip switches, seen from above: sitting with feet wide and hands behind, both knees rotate slowly from one side to the other within a comfortable range";
  } },
  hang: { kind: "hold", sided: false, build(sc, side, q) {
    // Arms keep their length: the shoulders stay put and the body sinks below them (4px), which is
    // what shoulders rising toward the ears looks like.
    const dn = 4 * q, sL = [166, 78], sR = [192, 78];
    sc.line([[96, 28], [262, 28]], PROP, 6);
    sc.line([[179, 80 + dn], [179, 136 + dn]], BODY, TORSO);
    sc.line([[175, 136 + dn], [174, 192 + dn]], BODY, 8); sc.line([[183, 136 + dn], [184, 192 + dn]], BODY, 8);
    sc.dot([179, 64 + dn], 11, BODY);
    sc.line([[152, 30], sL], COL.B, 8); sc.line([[206, 30], sR], COL.B, 8);
    sc.line([sL, sR], BODY, 8);
    return "Passive bar hang: hanging from the bar with straight arms, shoulders relaxed toward the ears, body long and still";
  } },
  pullover: { dur: 9000, kind: "move", k: [0.06, 0.33, 0.78], sided: false, scale: 1.15, build(sc, side, p) {
    const S = [112, 157], H = [208, 160], F = [280, 166], K = ik(H, F, 62, 58, true);
    const hand = P(S, 60, lerp(-90, -166, p));
    sc.floor();
    sc.line([S, H], BODY, TORSO); sc.line([H, K, F], BODY, 8);
    sc.line([S, hand], COL.B, 8); sc.dot(hand, 8.5, COL.B); sc.dot(hand, 7, WOOD);
    sc.line([[92, 155], S], BODY, 8); sc.dot([82, 153], 11, BODY);
    return "Supine dowel pullover: lying on the back, knees bent, both hands on a dowel; the arms travel slowly overhead toward the floor and hold";
  } },
  roller: { dur: 7000, kind: "move", k: [0.08, 0.4, 0.62], sided: false, scale: 1.15, build(sc, side, p) {
    const C = [136, 133], H = [222, 160], F = [290, 166], K = ik(H, F, 62, 58, true);
    const ang = lerp(-172, -200, p), Sh = P(C, 36, ang), head = P(Sh, 20, ang);
    const E = P(Sh, 30, ang + 118), hand = P(head, 10, ang + 165);   // elbow up, hand cupping the back of the head
    sc.floor();
    sc.dot([136, 151], 17, PROP);
    sc.line([C, H], BODY, TORSO); sc.line([H, K, F], BODY, 8);
    sc.line([C, Sh], COL.B, TORSO);
    sc.dot(head, 11, BODY);
    sc.line([Sh, E, hand], BODY, 8);
    return "Foam roller thoracic extension: roller under the upper back, hands behind the head with elbows up; the upper back extends slowly over the roller and returns";
  } }
};
export const FIGURE_SLOTS = SLOTS;

/** Frame for `elapsed` ms into the active set. `reduced` = prefers-reduced-motion. */
export function drawFigure(id: string, side: FigureSide | "E", elapsed: number, reduced: boolean): FigureFrame {
  const f = FIGS[id];
  let s: FigureSide = side === "R" ? "R" : side === "L" ? "L" : "B";
  if (f.sided && s === "B") s = "L";
  const sc = new Scene();
  sc.scale = f.scale || 1;
  let label: string, rep = 0, p: number;
  if (f.kind === "hold") {
    // Isometric: ease into the effort once (0.9 s), then hold. Reduced motion shows full effort.
    p = reduced ? 1 : 1 - Math.pow(1 - Math.min(1, elapsed / 900), 3);
    label = f.build(sc, s, p);
  } else {
    const dur = f.kind === "move2" ? f.dur! / 2 : f.dur!;
    rep = f.kind === "move2" ? Math.floor(elapsed / dur) % 2 : 0;
    p = reduced ? 0 : prog((elapsed % dur) / dur, f.k!);
    label = f.build(sc, s, p, rep);
    if (reduced) {
      // The end pose as a thin solid outline in FAR (#6b717d, 3.6:1), behind the body: thin
      // enough never to read as a second figure, solid enough for 3:1. Dots become rings.
      const g = new Scene();
      g.scale = sc.scale;
      f.build(g, s, 1, rep);
      const ghosts: FigureSlot[] = [];
      g.items.forEach((it, i) => {
        const base = sc.items[i];
        if (base && base.pts === it.pts) return;
        const pp = it.pts.split(" ");
        if (pp.length === 2 && it.w >= 10) {
          const c = pp[0].split(",").map(Number) as Pt;
          const rg = new Scene();
          rg.ring(c, it.w / 2, FAR, 2, 1);
          ghosts.push(rg.items[0]);
        } else ghosts.push({ ...it, color: FAR, w: 3, op: 1, dash: "none", fill: "none" });
      });
      sc.items = [sc.items[0], ...ghosts, ...sc.items.slice(1)];
    }
  }
  const empty: FigureSlot = { pts: "0,0", color: "none", w: 0, op: 0, fill: "none", dash: "none" };
  const noBadge: FigureBadge = { x: -50, y: -50, color: "none", letter: "", op: 0 };
  return {
    label,
    tf: tf(f.scale || 1),
    slots: Array.from({ length: SLOTS }, (_, i) => sc.items[i] ?? empty),
    badges: [0, 1].map((j) => sc.badges[j] ?? noBadge),
  };
}

/** True when the frame can no longer change (a hold that reached full effort). */
export function figureIsStatic(id: string, elapsed: number, reduced: boolean): boolean {
  const f = FIGS[id];
  return reduced || (f.kind === "hold" && elapsed >= 900);
}
