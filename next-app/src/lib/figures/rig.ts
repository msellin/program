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
 * Second panel (coach / motion / visual, 2026-10-28, dev/active/figure-review/)
 * reviewed all figures, not only the first nine:
 *
 * - Frame and stroke belong to the size drawn: `figureBounds` fits the viewBox
 *   to the whole cycle and `strokePx` sizes strokes in screen px (a limb is
 *   2.75px in a 40px thumbnail, 5px on the 144px tile). The fixed 358x201 box
 *   left a standing figure 26px tall in a thumbnail.
 * - A still figure shows its `poster` pose (chin over the bar), never the rest
 *   pose: at rest every pull-up variant was the same dead hang.
 * - Timing has a fourth key (return ends at k3, then a pause), so effort and
 *   return are not mirror images: pull-ups up ~1.3 s / down ~2.3 s, and a
 *   negative is RESET to the top in one cut (animating the way up taught a
 *   fast pull-up).
 * - Pull-up top: shoulders below the bar, so the elbows point down, not winged
 *   out level with it. Bar, handstand and wall figures share leg length 80.
 * - Variants must look different: ring rows differ by body angle, scap work
 *   keeps the arms full length while the trunk rises.
 * - Equipment is an outline (boxes, plates, balls are rings), so a bar end
 *   never reads as a second head; every colour >= 3:1 on the tile tint too.
 *
 * Body v2 (round A, same day): every figure still builds a SKELETON (the
 * rules above are about it, and the tests read it); `flesh` then gives it
 * tapered limbs, a pelvis–waist–ribcage trunk and a head sized to the trunk,
 * plus a contact shadow. Floor figures were re-proportioned to match (trunk
 * 100 -> 78, arms -> 78). Front views (`front: true`) get a wide trunk.
 *
 * Round C (2026-10-29): builds name joints (`sc.mark`) and each figure declares
 * ONE coaching cue (`cues`), a variant `glyph` and a progression `ladder`; see
 * `cueSlots`. A squat's parallel line is a hatched LIMIT, never a target.
 *
 * Everything is a polyline in a fixed slot list so draw order (what is in
 * front) is exact and the renderer can update attributes in place.
 */

export type Pt = number[]; // [x, y]; a plain array so literal coordinates need no casts
export type FigureSide = "L" | "R" | "B";
/** `bg`: floor, bar or wall: drawn long and left out of the figure's bounds, so the fitted frame crops it. */
/**
 * `pts` is the skeleton (joints; what the tests and limb-length rules read). `shape`, when set, is the
 * filled body drawn over it: a tapered limb, the trunk, the head (body v2, 2026-10-28).
 */
export type FigureSlot = { pts: string; color: string; w: number; op: number; fill: string; dash: string; bg?: boolean; shape?: string; cue?: boolean };
export type FigureBadge = { x: number; y: number; color: string; letter: string; op: number };
export type FigureFrame = { label: string; tf: string; floor: boolean; slots: FigureSlot[]; badges: FigureBadge[] };
/**
 * `gait` (motion round, 2026-10-29): a continuous walking cycle, `p` runs 0..1 over the whole `dur`
 * and each leg (or hand) takes its own stance and swing phase half a cycle apart. `move2` alternated
 * two poses, so carries and the sled read as a leg toggling rather than a walk.
 */
type Kind = "hold" | "move" | "move2" | "gait";
/** How a phase of a rep moves through time; see `TEMPO`. */
type Tempo = "control" | "drive";
type Fig = {
  kind: Kind;
  dur?: number;
  /** rest until k0, reach the end pose by k1, hold until k2, return by k3 (default 1), rest to the end. */
  k?: [number, number, number] | [number, number, number, number];
  /** Pose (0..1) shown when the figure is not playing: the frame a coach would pick to name the drill. */
  poster?: number;
  sided: boolean;
  scale?: number;
  /** Seen from the front (bar hangs, carries, Pallof): the trunk is drawn wide, the legs apart. */
  front?: boolean;
  /** The ONE thing to watch on this drill, drawn over the figure from its named joints (round C). */
  cues?: Cue[];
  /** The next rung of this drill's progression, drawn as a faint outline behind it (round C). */
  ladder?: string;
  /**
   * Tempo of the way out (k0 to k1) and the way back (k2 to k3). Unset = the cosine both ways. A rep's
   * lowering is `control`, its effort is `drive` (motion round, 2026-10-29).
   */
  tempo?: [Tempo, Tempo];
  build: (sc: Scene, side: FigureSide, p: number, rep?: number) => string;
};

// Brand bronze (--color-bronze in brand/tokens.css). SVG stroke attributes cannot read the CSS var, so the
// hex is mirrored here; 7:1 on the card. Working limb / implement of every unsided figure.
export const ACCENT = "#c89666";
// Figure review (2026-10-28): every colour is >= 3:1 on BOTH the card (#16181c) and the Today tile's
// bronze tint (#2a231f); the body went lighter (#9aa0a8 read as a thin grey wireframe).
const COL: Record<FigureSide, string> = { L: "#6db8c6", R: "#c79fcd", B: ACCENT };
const BODY = "#c9ced6", FAR = "#8a909c", FLOOR = "#9a8164", PROP = "#7d8590", WOOD = "#a8855f";
/** Fill for boxes and benches: equipment is an outline, so it never competes with the body. */
const BOX = "#2f333a";
/** Working-limb colours; the renderer draws these heavier. */
export const ACCENTS = [ACCENT, COL.L, COL.R];
/** For tests: side colours, the far-limb grey and the ground line. */
export const FIGURE_COLORS = { L: COL.L, R: COL.R, FAR, BODY, FLOOR, PROP };
const TORSO = 12;
const SLOTS = 28;
function ease(x: number) { return 0.5 - 0.5 * Math.cos(Math.PI * x); }
/**
 * A monotone 0..1 curve from a velocity profile (>= 0), tabulated once. Every joint already moved on one
 * cosine, so lowering and effort were mirror images and nothing showed where a rep is hard (motion round,
 * 2026-10-29, dev/active/figure-animation/: all four experts).
 */
function curve(v: (x: number) => number): (x: number) => number {
  const N = 96, acc = [0];
  for (let i = 1; i <= N; i++) acc.push(acc[i - 1] + v((i - 0.5) / N));
  const tot = acc[N];
  return (x) => {
    const u = Math.max(0, Math.min(1, x)) * N, i = Math.min(N - 1, Math.floor(u));
    return (acc[i] + (acc[i + 1] - acc[i]) * (u - i)) / tot;
  };
}
export const TEMPO: Record<Tempo, (x: number) => number> = {
  // Lowering under control: builds speed over the first fifth, steady through the middle, settles over the
  // last fifth. Never a drop, never a bounce at the bottom.
  control: curve((x) => Math.min(1, x / 0.2, (1 - x) / 0.2)),
  // Effort: quick out of the bottom, slows through a sticking point a little past halfway, then finishes and
  // settles into the lockout. The velocity never reaches zero, so there is no stall and never an overshoot.
  drive: curve((x) => Math.sin(Math.PI * x) * (1 - 0.6 * Math.exp(-(((x - 0.58) / 0.11) ** 2)))),
};
// rest → move → hold → return → rest, as 0..1
function prog(t: number, k: number[], tempo?: [Tempo, Tempo]) {
  const k3 = k[3] ?? 1, out = tempo ? TEMPO[tempo[0]] : ease, back = tempo ? TEMPO[tempo[1]] : ease;
  if (t < k[0]) return 0;
  if (t < k[1]) return out((t - k[0]) / (k[1] - k[0]));
  if (t < k[2]) return 1;
  if (t < k3) return 1 - back((t - k[2]) / (k3 - k[2]));
  return 0;
}
/**
 * A joint that moves ahead of the rest: reaches most of its travel early, all of it by the end. Used for the
 * hips going back first in a squat, which also makes them come forward last on the way up.
 */
function lead(p: number, k = 1.6) { return 1 - (1 - p) ** k; }
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
/**
 * Coaching cues (round C, 2026-10-29; biomechanist idea 5). Each names joints a build registered with
 * `sc.mark`. `plumb`: a vertical through a joint of the END pose (bar over mid-foot, trunk upright).
 * `level`: a horizontal at a joint's height in the end pose (parallel = hip at knee height). `angle`: an
 * arc at the middle joint (elbows at 90). `align`: a line through the joints, solid once they are in
 * line (shoulder-hip-knee on a bridge). `limit` hatches the forbidden side of a level line, so a
 * parallel marker reads as "no deeper than this", never "at least this deep" (coach, round C).
 * `tuck`: a curved arrow at the pelvis for a posterior tilt; it replaced a shoulder-over-hip plumb
 * on the kneeling stretch, which leaning back into lumbar extension also satisfies.
 * Thin, bronze, hidden in thumbnails.
 */
type Cue = { plumb: string; to: string } | { level: string; span: [string, string]; limit?: boolean } | { angle: [string, string, string] } | { align: string[] } | { tuck: string };
// Lines stay thin (2); the angle arc is bigger and bolder, it sits on a bronze forearm (visual round C).
const CUE_W = 2, CUE_OP = 0.85, CUE_DASH = "5 4", ARC_W = 3.5, ARC_R = 20;

class Scene {
  marks: Record<string, Pt> = {};
  /** Name a joint for the cue layer. */
  mark(name: string, p: Pt) { this.marks[name] = p; }
  items: FigureSlot[] = [];
  badges: FigureBadge[] = [];
  scale = 1;
  hasFloor = false;
  line(a: Pt[], color: string, w?: number, op?: number | null, fill?: string) {
    this.items.push({ pts: fmt(a), color, w: w || 8, op: op == null ? 1 : op, fill: fill || "none", dash: "none" });
  }
  /** Floor, bar or wall: drawn far past the figure; the fitted frame crops it. */
  bg(a: Pt[], color: string, w: number) {
    this.line(a, color, w); this.items[this.items.length - 1].bg = true;
  }
  /** Bench, box or sled: an outline on a dark fill. */
  box(x0: number, y0: number, x1: number, y1: number) {
    this.line([[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]], PROP, 2, 1, BOX);
  }
  /** Barbell end-on, a plate, a ball: a ring with a hub, so it never reads as a second head. */
  plate(c: Pt, r: number) { this.ring(c, r, PROP, 3); this.dot(c, 3, PROP); }
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
    this.hasFloor = true;
    this.bg([[-600, 168], [960, 168]], FLOOR, 2);
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
    sc.box(108, 128, 196, 167);
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
  adductor: adductorFig(false, "Adductor squeeze: lying on the back with knees bent, squeezing a ball between the knees at about 60% and holding"),
  adductor_ext: adductorFig(true, "Adductor squeeze, longer lever: lying on the back with the feet further out, squeezing a ball between the knees at about 60% and holding"),
  bridge: { dur: 5000, kind: "move", k: [0.08, 0.32, 0.64], sided: true, tempo: ["drive", "control"], scale: 1.15, cues: [{ align: ["shoulder", "hip", "knee"] }], build(sc, side, p) {
    // Foot under the knee at the top (vertical shin, no hamstring cramp). The free leg is held
    // bent (short lever): a straight raised leg is a resisted straight-leg-raise hold.
    const S = [120, 158], T = 78, F = [258, 164], th = lerp(0, 22.7, p) * Math.PI / 180;
    const H = [S[0] + T * Math.cos(th), S[1] - T * Math.sin(th)], K = ik(H, F, 66, 62, true);
    const thDeg = lerp(0, 22.7, p), FK = P(H, 60, -78 - thDeg * 0.5), FF = P(FK, 52, -78 - thDeg * 0.5 + 90);
    const planted = [H, K, F], free = [H, FK, FF];
    sc.mark("shoulder", S); sc.mark("hip", H); sc.mark("knee", K);
    sc.floor();
    if (side === "R") sc.line(free, FAR, 8);
    sc.line([[122, 162], [198, 166]], BODY, 8);
    sc.line([[98, 154], S], BODY, 8); sc.dot([90, 151], 11, BODY);
    sc.line([S, H], BODY, TORSO);
    if (side === "L") { sc.line(free, BODY, 8); sc.line(planted, COL.L, 8); }   // working limb drawn last
    else sc.line(planted, COL.R, 8);
    sc.badge([F[0] + 20, F[1] - 8], COL[side], side);
    return "Single-leg glute bridge, " + sideWord(side) + " foot planted: hips lift until shoulder, hip and knee form one straight line, the other knee stays bent and lifted";
  } },
  deadbug: { dur: 12000, kind: "move2", k: [0.06, 0.4, 0.52, 0.94], sided: false, build(sc, side, p, rep = 0) {
    const S = [128, 157], H = [208, 160], off = [-12, -8], fS = add(S, off), fH = add(H, off);
    const arm = function (o: Pt, q: number) { return [o, P(o, 78, lerp(-90, -160, q))]; };
    const leg = function (o: Pt, q: number) { const a = lerp(-90, -10, q), K = P(o, 62, a); return [o, K, P(K, 58, a + lerp(90, 0, q))]; };
    const nA = arm(S, rep === 0 ? p : 0), fA = arm(fS, rep === 1 ? p : 0), nL = leg(H, rep === 1 ? p : 0), fL = leg(fH, rep === 0 ? p : 0);
    sc.floor();
    sc.line(fA, rep === 1 ? COL.L : FAR, 8); sc.line(fL, rep === 0 ? COL.L : FAR, 8);
    sc.line([S, H], BODY, TORSO);
    sc.line(nA, rep === 0 ? COL.R : BODY, 8); sc.line(nL, rep === 1 ? COL.R : BODY, 8);
    sc.line([[108, 155], S], BODY, 8); sc.dot([98, 153], 11, BODY);   // head in front: the arm passes behind it
    const wa = rep === 0 ? nA : fA, wl = rep === 0 ? fL : nL, as = rep === 0 ? "R" : "L", ls = rep === 0 ? "L" : "R";
    sc.badge(beyond(wa[0], wa[1], 14), COL[as], as); sc.badge(beyond(wl[1], wl[2], 14), COL[ls], ls);
    return "Dead bug: lying on the back, arms up, knees over hips. The " + sideWord(as) + " arm reaches overhead while the " + sideWord(ls) + " leg straightens low, then return and switch to the other pair";
  } },
  kneel: { dur: 12000, kind: "move", k: [0.05, 0.25, 0.85], sided: true, cues: [{ tuck: "hip" }], build(sc, side, p) {
    // Trunk stays upright (never leans back: that cues lumbar extension). Start with the hip over the
    // back knee, end about 20° of hip extension: gentle, never couch-stretch depth.
    const work = COL[side], KB = [146, 164], BF = [94, 166], FF = [236, 166];
    const H = lerpP([148, 112], [164, 114], p), FK = ik(H, FF, 64, 56, true);
    const S = P(H, 58, lerp(-90, -88, p)), head = P(S, 20, -90);
    sc.mark("hip", H); sc.mark("shoulder", S);
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
  hang: { kind: "hold", sided: false, front: true, build(sc, side, q) {
    // Arms keep their length: the shoulders stay put and the body sinks below them (4px), which is
    // what shoulders rising toward the ears looks like.
    const dn = 4 * q, sL = [166, 78], sR = [192, 78];
    sc.line([[179, 80 + dn], [179, 136 + dn]], BODY, TORSO);
    sc.line([[172, 136 + dn], [171, 216 + dn]], BODY, 8); sc.line([[186, 136 + dn], [187, 216 + dn]], BODY, 8);
    sc.line([sL, sR], BODY, 8);
    sc.line([[152, 30], sL], COL.B, 8); sc.line([[206, 30], sR], COL.B, 8);
    sc.dot([179, 64 + dn], 11, BODY);
    sc.bg([[-600, 28], [960, 28]], PROP, 6);   // last: the hands wrap the bar
    return "Passive bar hang: hanging from the bar with straight arms, shoulders relaxed toward the ears, body long and still";
  } },
  pullover: { dur: 9000, kind: "move", k: [0.06, 0.33, 0.78], sided: false, scale: 1.15, build(sc, side, p) {
    const S = [128, 157], H = [208, 160], F = [280, 166], K = ik(H, F, 62, 58, true);
    const hand = P(S, 78, lerp(-90, -166, p));
    sc.floor();
    sc.line([S, H], BODY, TORSO); sc.line([H, K, F], BODY, 8);
    sc.line([S, hand], COL.B, 8); sc.dot(hand, 8.5, COL.B); sc.dot(hand, 7, WOOD);
    sc.line([[108, 155], S], BODY, 8); sc.dot([98, 153], 11, BODY);
    return "Supine dowel pullover: lying on the back, knees bent, both hands on a dowel; the arms travel slowly overhead toward the floor and hold";
  } },
  roller: { dur: 7000, kind: "move", k: [0.08, 0.4, 0.62], sided: false, scale: 1.15, build(sc, side, p) {
    const C = [136, 133], H = [186, 160], F = [272, 166], K = ik(H, F, 62, 58, true);
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

// ---------------------------------------------------------------------------
// Ad-path figures (2026-10-28): pull-up, handstand and barbell families. Each
// is built from the same fixed-length limbs; close variants share a pose and
// differ in range or timing (see exercise-figures.ts for the mapping).
// ---------------------------------------------------------------------------
const BAND = "#c29a64";

/** Elbow/knee solution on the requested horizontal side of the limb. */
function ikSide(a: Pt, b: Pt, L1: number, L2: number, sign: number): Pt {
  const k1 = ik(a, b, L1, L2, true), k2 = ik(a, b, L1, L2, false);
  const mx = (a[0] + b[0]) / 2;
  return (k1[0] - mx) * sign >= (k2[0] - mx) * sign ? k1 : k2;
}
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
/** A standing foot: heel just behind the ankle, toes in front (the shin ends at the ankle, not the toe). */
const foot = (sc: Scene, F: Pt, color = BODY) => sc.line([[F[0] - 4, 166], [F[0] + 12, 166]], color, 6);

// Upright proportions (2026-10-28 review: legs were 58 on the bar and in handstands, 86 standing):
// leg 80 (41 + 39) under a 56-58 trunk on every bar and handstand figure.
const LEG = 80;

type Glyph = "up" | "single" | "slow" | "short" | "down" | "downShort" | "hold" | "holdMid" | "lift" | "liftHold";
/**
 * Variant mark beside a bar figure (round C): the pull-up family's thumbnails were near-identical, so the
 * variant is said with one glyph that survives 56x40: an up arrow (pull), with ticks (slow tempo), with a
 * rest dot (one single), short (partial); a down arrow with tempo ticks (negative: three = 10 s, one =
 * 5 s; arrow length would read as range); two bars (hold, high or mid); a chevron (scapular lift), with
 * bars under it (active hang: shoulders held down).
 */
function glyph(sc: Scene, g: Glyph) {
  // Visual round-C review: W 6 -> 9, a filled head, closer to the body so it reads as part of the drawing.
  const x = 214, W = 9, c = ACCENT;
  const arrow = (y0: number, y1: number) => {
    const d = y1 < y0 ? -1 : 1;
    sc.line([[x, y0], [x, y1 - d * 8]], c, W);
    sc.line([[x - 9, y1 - d * 12], [x, y1 + d * 2], [x + 9, y1 - d * 12], [x - 9, y1 - d * 12]], c, 2, 1, c);
  };
  if (g === "up" || g === "single" || g === "slow") arrow(140, 92);
  if (g === "single") sc.dot([x, 158], 6, c);
  if (g === "slow") for (const y of [108, 120, 132]) sc.line([[x - 9, y], [x + 9, y]], c, 5);
  if (g === "short") arrow(140, 112);
  if (g === "down" || g === "downShort") arrow(84, 150);
  if (g === "down") for (const y of [100, 112, 124]) sc.line([[x - 9, y], [x + 9, y]], c, 5);
  if (g === "downShort") sc.line([[x - 9, 112], [x + 9, 112]], c, 5);
  if (g === "hold" || g === "holdMid") { const y = g === "hold" ? 60 : 92; sc.line([[x - 5, y], [x - 5, y + 22]], c, W); sc.line([[x + 5, y], [x + 5, y + 22]], c, W); }
  if (g === "lift" || g === "liftHold") sc.line([[x - 9, 104], [x, 94], [x + 9, 104]], c, W);
  if (g === "liftHold") { sc.line([[x - 5, 114], [x - 5, 134]], c, W); sc.line([[x + 5, 114], [x + 5, 134]], c, W); }
}

type PullOpts = {
  kind: Kind; dur?: number; k?: Fig["k"]; poster?: number;
  /** Shoulder height as 0 = dead hang .. 1 = chin over bar, at the pose's start and end. */
  from: number; to: number; band?: number; scap?: boolean; glyph?: Glyph; label: string;
};
function pullFig(o: PullOpts): Fig {
  const cues: Cue[] | undefined = o.to > 0 && o.to < 1 ? [{ angle: ["hand", "elbow", "shoulder"] }] : undefined;
  // Up is the effort, down is controlled; a negative's way out IS the lowering (its reset is a cut).
  const tempo: [Tempo, Tempo] | undefined = o.kind === "move" ? (o.from < o.to ? ["drive", "control"] : ["control", "control"]) : undefined;
  return { kind: o.kind, dur: o.dur, k: o.k, poster: o.poster, sided: false, front: true, cues, tempo, build(sc, _side, q) {
    const h = o.kind === "hold" ? o.to : lerp(o.from, o.to, q);
    // Chin over the bar at the top with the shoulders BELOW it, so the elbows point down and in
    // (the shoulders used to reach bar height and the elbows winged out level with it).
    // Scapular work: the arms stay straight and full length; the trunk rises 12 away from the
    // shoulder joints, which is what "shoulders away from the ears" looks like.
    const lift = o.scap ? lerp(0, 12, h) : 0;
    const Sy = o.scap ? 80 : lerp(78, 46, h), top = Sy - lift;
    // Toward the top the shoulder blades draw together (retraction), so the shoulders slide in a little.
    const r = o.scap ? 0 : 3 * h, hL = [152, 30], hR = [206, 30], sL = [166 + r, Sy], sR = [192 - r, Sy];
    const hip = top + 58;
    // Band thickness is the assistance: heavy (thick) carries more of the body than light.
    if (o.band) sc.line([[164, 30], [164, hip + 44], [194, hip + 44], [194, 30]], BAND, o.band, o.band > 4 ? 1 : 0.75);
    sc.line([[179, top + 2], [179, hip]], BODY, TORSO);
    sc.line([[172, hip], [171, hip + LEG]], BODY, 8); sc.line([[186, hip], [187, hip + LEG]], BODY, 8);
    sc.line([sL, sR], BODY, 8);
    if (o.scap) { sc.line([hL, sL], COL.B, 8); sc.line([hR, sR], COL.B, 8); }
    else {
      sc.line([hL, ikSide(hL, sL, 26, 26, -1), sL], COL.B, 8);
      const eR = ikSide(hR, sR, 26, 26, 1);
      sc.line([hR, eR, sR], COL.B, 8);
      sc.mark("hand", hR); sc.mark("elbow", eR); sc.mark("shoulder", sR);
    }
    if (o.glyph) glyph(sc, o.glyph);
    // Head in front of the arms, bar in front of everything: chin over the bar has to read.
    sc.dot([179, top - 28], 11, BODY);
    sc.bg([[-600, 28], [960, 28]], PROP, 6);
    return o.label;
  } };
}
// Timings from the motion review: up ~1.3 s, short top hold, down ~2.3 s, ~1 s still at the bottom.
const pullUp = (dur: number, k: Fig["k"], label: string, extra: Partial<PullOpts> = {}) =>
  pullFig({ kind: "move", dur, k, from: 0, to: 1, label, ...extra });
/** A negative is lowered, then RESET to the top in one cut: animating the way back up taught a fast pull-up. */
const negative = (lowerMs: number, label: string) => {
  const dur = lowerMs + 1500, k1 = (lowerMs + 200) / dur;
  return pullFig({ kind: "move", dur, k: [200 / dur, k1, 0.97, 0.975], poster: 0.4, from: 1, to: 0, glyph: lowerMs > 6000 ? "down" : "downShort", label });
};

function ringRow(yHand: number, feetUp: boolean, label: string, anchorY = 24, ladder?: string): Fig {
  // Ring height sets the body angle, and the angle is what tells the three variants apart:
  // flat ~10-26°, inclined ~32-53°, feet-up level with the box at the bottom.
  return { kind: "move", dur: 6500, k: [0.08, 0.36, 0.46, 0.86], sided: false, ladder, cues: [{ align: ["foot", "hip", "shoulder"] }], build(sc, _s, p) {
    const F = feetUp ? [268, 128] : [268, 164], L = 150, A = [118, anchorY];
    // Arms fully straight at the bottom (shoulder 51.5 from the ring), chest at the rings at the top.
    const hand = [A[0], yHand], S = ik(F, hand, L, lerp(51.5, 20, p), false);
    const u = [(S[0] - F[0]) / L, (S[1] - F[1]) / L], H = [F[0] + u[0] * 82, F[1] + u[1] * 82];
    sc.mark("foot", F); sc.mark("hip", H); sc.mark("shoulder", S);
    sc.floor();
    if (feetUp) sc.box(246, 128, 292, 167);
    sc.bg([[A[0], -600], hand], PROP, 3);
    sc.line([F, H], BODY, 8); sc.line([H, S], BODY, TORSO);
    sc.dot([S[0] + u[0] * 22, S[1] + u[1] * 22], 11, BODY);
    sc.line([S, ik(S, hand, 26, 26, false), hand], COL.B, 8);
    sc.ring(hand, 7, WOOD, 3);
    return label;
  } };
}

type HsOpts = { lean: number; kind: Kind; tuck?: boolean; wall?: boolean; hx?: number; act?: "shrug" | "taps"; ladder?: string; label: string };
function handstand(o: HsOpts): Fig {
  const moving = o.kind === "move";
  const cues: Cue[] | undefined = o.tuck ? undefined : [{ align: ["hand", "shoulder", "hip", "foot"] }];
  return { kind: o.kind, dur: moving ? (o.act ? 4000 : 6000) : undefined, k: [0.1, 0.4, 0.6, 0.9], sided: false, ladder: o.ladder, cues, build(sc, _s, p) {
    const lean = o.lean + (o.wall || o.act ? 0 : lerp(0, 3, p)), a = -90 + lean;
    const hand = [o.hx ?? 180, 168];
    // Shrug: arms stay full length, the trunk rises 8 out of the shoulders (the shoulders push to the ears).
    const S = P(hand, 46, a), rise = o.act === "shrug" ? lerp(0, 8, p) : 0, T = P(S, rise, a), H = P(T, 56, a);
    sc.floor();
    if (o.tuck) {
      // In and out of the tuck: the knees come down toward the chest and the shins fold back.
      const th = a + lerp(0, 75, p), K = P(H, 41, th);
      sc.line([H, K, P(K, 39, th - lerp(0, 150, p))], COL.B, 8);
    } else {
      const F = P(H, LEG, a);
      sc.mark("hand", hand); sc.mark("shoulder", S); sc.mark("hip", H); sc.mark("foot", F);
      if (o.wall) sc.bg([[F[0] + 5, 168], [F[0] + 5, -600]], PROP, 4);
      sc.line([H, F], BODY, 8);
    }
    sc.line([T, H], BODY, TORSO);
    sc.dot(P(T, 18, a + 155), 10, BODY);
    if (o.act === "taps") {
      // One hand lifts to tap the opposite shoulder while the other arm holds the body.
      sc.line([[hand[0] - 3, 168], S], FAR, 8);
      const tap = lerpP(hand, P(S, 10, a + 90), p);
      sc.line([S, ikSide(S, tap, 24, 24, 1), tap], COL.B, 8);
    } else sc.line([hand, S], COL.B, 8);
    sc.line([[hand[0] - 3, 167], [hand[0] + 13, 167]], BODY, 4);
    return o.label;
  } };
}

function wristFig(fingers: boolean, label: string): Fig {
  return { kind: "move", dur: fingers ? 4000 : 6000, k: [0.1, 0.45, 0.6], sided: false, build(sc, _s, p) {
    // The knees stay planted: the hip turns about the knee as the shoulders rock over the hands.
    const hand = [208, 166], a = fingers ? 8 : lerp(0, 26, p), S = P(hand, 52, -90 + a);
    const K = [112, 166], H = ik(K, S, 52, 98, true);
    sc.floor();
    sc.line([[K[0] - 50, 166], K, H], BODY, 8);
    sc.line([H, S], BODY, TORSO);
    sc.dot(add(S, [18, -10]), 11, BODY);
    sc.line([hand, S], COL.B, 8);
    const lift = fingers ? lerp(0, 7, p) : 0;
    sc.line([[hand[0] - 14, 167], [hand[0] + 2, 167], [hand[0] + 14, 167 - lift]], BODY, 4);
    if (!fingers) sc.ring(hand, 9, COL.B, 2, p);
    return label;
  } };
}

function adductorFig(extended: boolean, label: string): Fig {
  return { kind: "hold", sided: false, scale: 1.15, build(sc, _s, q) {
    // Both knees drawn (the far one a step behind), the ball squeezed between them.
    const S = [118, 158], H = [196, 160], F = extended ? [296, 166] : [266, 166], K = ik(H, F, 66, 62, true);
    const off = [-12, -3];
    sc.floor();
    sc.line([add(H, off), add(K, off), add(F, off)], FAR, 8);
    sc.line([S, [194, 166]], BODY, 8);
    sc.line([S, H], BODY, TORSO); sc.line([[98, 154], S], BODY, 8); sc.dot([90, 151], 11, BODY);
    const ball = add(K, [-6, 0]), r = lerp(10, 7, q);
    sc.ring(ball, r, PROP, 3);
    sc.line([H, K, F], COL.B, 8);
    return label;
  } };
}

function hollowFig(pull: boolean, label: string): Fig {
  return { kind: pull ? "move" : "hold", dur: pull ? 6000 : undefined, k: [0.1, 0.42, 0.55, 0.9], sided: false, scale: 1.15, build(sc, _s, q) {
    const a = pull ? 14 : lerp(0, 14, q), H = [190, 158];
    const S = P(H, 80, 180 + a), foot = P(H, 120, -a);
    // Pullover: the body holds the hollow while the arms travel from over the chest to overhead.
    const hand = pull ? P(S, 75, lerp(-80, 180 + a * 0.8, q)) : P(S, 75, 180 + a * 0.8);
    sc.floor();
    sc.line([H, foot], BODY, 8);
    sc.line([S, H], BODY, TORSO);
    sc.dot(P(S, 26, 180 + a), 11, BODY);
    sc.line([S, hand], COL.B, 8);
    sc.ring([H[0], 166], 6, COL.B, 2, pull ? 1 : q);
    return label;
  } };
}

const AD_FIGS: Record<string, Fig> = {
  pullup: pullUp(5200, [0.02, 0.27, 0.37, 0.82], "Pull-up: hanging from the bar with straight arms, pull the chest up until the chin clears the bar, elbows driving down, then lower under control", { glyph: "up" }),
  pullup_single: pullUp(6000, [0.02, 0.22, 0.3, 0.55], "Single pull-up: one crisp rep with the chin over the bar, lower under control, then let go and rest", { glyph: "single" }),
  pullup_slow: pullUp(9000, [0.02, 0.35, 0.42, 0.88], "Slow tempo pull-up: pull up smoothly until the chin clears the bar, pause, then lower slowly, arms fully straight at the bottom", { glyph: "slow" }),
  pullup_band: pullUp(5500, [0.02, 0.27, 0.36, 0.82], "Band-assisted pull-up: a band looped under the knees takes part of the load while you pull the chin over the bar and lower under control", { band: 9 }),
  pullup_band_light: pullUp(5500, [0.02, 0.27, 0.36, 0.82], "Light band-assisted pull-up: a thinner band under the knees takes a little of the load while you pull the chin over the bar and lower under control", { band: 3 }),
  pullup_partial: pullUp(4600, [0.02, 0.26, 0.34, 0.8], "Partial-range pull-up: pull from straight arms to about halfway, elbows at a right angle, then lower under control", { to: 0.35, glyph: "short" }),
  pullup_negative: negative(8000, "Negative pull-up, 10 seconds: start with the chin over the bar and lower as slowly as you can all the way to straight arms; step back up to the top"),
  pullup_negative5: negative(4500, "Negative pull-up, 5 seconds: start with the chin over the bar and lower slowly all the way to straight arms; step back up to the top"),
  pullup_top: pullFig({ kind: "hold", from: 1, to: 1, glyph: "hold", label: "Top hold: chin over the bar, elbows tucked in, shoulder blades pulled down and back, body still" }),
  pullup_mid: pullFig({ kind: "hold", from: 0.35, to: 0.35, glyph: "holdMid", label: "Mid-range hold: elbows at a right angle, shoulders pulled down, body still" }),
  scappull: pullFig({ kind: "move", dur: 4000, k: [0.1, 0.35, 0.55, 0.85], from: 0, to: 1, scap: true, glyph: "lift", label: "Scapular pull-up: hanging with straight arms, pull the shoulder blades down so the body rises a few centimetres, then relax back" }),
  activehang: pullFig({ kind: "hold", from: 1, to: 1, scap: true, glyph: "liftHold", label: "Active hang: straight arms, shoulder blades pulled down and away from the ears, body long and still" }),
  rowflat: ringRow(90, false, "Ring row, body horizontal: hanging under the rings with straight arms, pull the chest to the rings keeping the body in one line, then lower", 24, "rowfeet"),
  rowincline: ringRow(36, false, "Ring row, inclined: the body leans back at a steep angle under high rings; pull the chest to the rings keeping the body straight, then lower", -20, "rowflat"),
  rowfeet: ringRow(80, true, "Ring row, feet elevated: feet on a box, body level under the rings; pull the chest to the rings, then lower"),
  pullapart: { kind: "move", dur: 5000, k: [0.1, 0.45, 0.6], sided: false, front: true, build(sc, _s, p) {
    const a = lerp(20, 90, p) * Math.PI / 180, sL = [166, 78], sR = [192, 78], r = 52 * Math.sin(a);
    const hL = [sL[0] - r, 80], hR = [sR[0] + r, 80];
    sc.floor();
    sc.line([[179, 82], [179, 128]], BODY, TORSO);
    sc.line([[175, 128], [174, 166]], BODY, 8); sc.line([[183, 128], [184, 166]], BODY, 8);
    sc.dot([179, 62], 11, BODY);
    sc.line([sL, sR], BODY, 8);
    sc.line([hL, sL], COL.B, 8); sc.line([sR, hR], COL.B, 8);
    sc.line([hL, [hL[0], 90], [hR[0], 90], hR], BAND, 3);
    return "Band pull-apart: standing with a band held in front at shoulder height; the arms sweep out to the sides, the shoulder blades squeeze together, then return";
  } },
  hollow: hollowFig(false, "Hollow body hold: lying on the back, lower back pressed into the floor, arms overhead, shoulders and straight legs lifted off the floor"),
  hollowpull: hollowFig(true, "Hollow body pullover: holding the hollow, lower back pressed down, the arms travel slowly from over the chest to overhead and back"),
  wristprep: wristFig(false, "Wrist prep on hands and knees: hands flat on the floor, fingers forward; the shoulders rock slowly forward over the hands, then back"),
  fingerraise: wristFig(true, "Finger raises: on hands and knees with the hands flat, lift the fingers off the floor while the palm stays down, then set them back"),
  downdog: { kind: "hold", sided: false, build(sc, _s, q) {
    const hand = [120, 166], hip = [190, 70], foot = [260, 166], S = lerpP(hand, hip, 0.45);
    sc.floor();
    sc.line([hip, foot], BODY, 8);
    sc.line([S, hip], BODY, TORSO);
    sc.dot(add(S, [4, 17]), 10, BODY);
    sc.line([hand, S], COL.B, 8);
    sc.ring(hand, 9, COL.B, 2, q);
    return "Downward dog: hands and feet on the floor, hips high in an upside-down V, arms straight; breathe and let the wrists settle";
  } },
  child: { kind: "hold", sided: false, build(sc, _s, q) {
    const K = [210, 164], F = [268, 166], H = [258, 142], S = [186, 150], hand = [136, 164];
    sc.floor();
    sc.line([F, K, H], BODY, 8);
    sc.line([H, S], BODY, TORSO);
    sc.dot([166, 152], 10, BODY);
    sc.line([S, hand], COL.B, 8);
    sc.ring(hand, 8, COL.B, 2, q);
    return "Child's pose: kneeling, hips back toward the heels, chest low and arms stretched forward on the floor; breathe slowly";
  } },
  wallhs: handstand({ lean: 6, kind: "hold", wall: true, label: "Wall handstand, chest to the wall: hands a little off the wall, arms straight, body in one line with the chest facing the wall" }),
  wallhs_90: handstand({ lean: 15, hx: 168, kind: "hold", wall: true, ladder: "wallhs", label: "Wall handstand hold: hands a step from the wall, arms straight and shoulders open, body leaning slightly into the wall" }),
  wallhs_lean: handstand({ lean: 38, hx: 120, kind: "hold", wall: true, ladder: "wallhs_90", label: "Inclined handstand hold: hands well away from the wall, body leaning into it at an angle, arms straight and shoulders open" }),
  wallhs_shrug: handstand({ lean: 6, kind: "move", wall: true, act: "shrug", label: "Wall handstand shrugs: arms locked, push the floor away so the shoulders rise to the ears, then sink back a little" }),
  wallhs_taps: handstand({ lean: 6, kind: "move", wall: true, act: "taps", label: "Wall handstand shoulder taps: chest to the wall, shift onto one arm and tap the opposite shoulder, then switch" }),
  hsfree: handstand({ lean: 0, kind: "move", label: "Freestanding handstand: hands shoulder-width on the floor, arms straight, body stacked over the hands, small balance corrections through the fingers" }),
  hstuck: handstand({ lean: 0, kind: "move", tuck: true, label: "Tuck handstand: arms straight, knees drawn in toward the chest, hips stacked over the hands" }),
  hswalk: { kind: "gait", dur: 3600, k: [0, 1, 1], poster: 0.8, sided: false, scale: 0.95, build(sc, _s, p) {
    // One hand steps while the other stays planted; then they swap. The body holds its place and the
    // planted hand moves back under it, as on a treadmill, so the loop never jumps. The shoulders lean
    // over the planted hand (motion round): that weight shift is what frees the other hand to step.
    const hand = (q: number): Pt => {
      const st = stride(q, 0.55);
      return st.stance ? [lerp(189, 171, st.u), 168] : [lerp(171, 189, swingPos(st.u, 0.55)), 168 - Math.sin(st.u * Math.PI) * 8];
    };
    const near = hand(p), far = hand(p + 0.5);
    const S = [180 + 2 * Math.cos(2 * Math.PI * (p - 0.25)), 122], a = -88, H = P(S, 56, a);
    sc.floor();
    sc.line([far, S], FAR, 8);
    sc.line([H, P(H, LEG, a - 3)], BODY, 8); sc.line([S, H], BODY, TORSO);
    sc.dot(P(S, 18, a + 155), 10, BODY);
    sc.line([near, S], COL.B, 8);
    return "Handstand walking: from a balanced handstand, shift the weight over one hand and take a small step forward with the other, then the other hand follows";
  } },
  kickup: { kind: "move", dur: 4500, k: [0.06, 0.28, 0.45, 0.9], poster: 0.5, sided: false, scale: 0.95, build(sc, _s, p) {
    // The swing leg goes up straight and leads; the push leg leaves the floor bent, a beat later,
    // and straightens to meet it over the hands.
    const hand = [190, 168], S = P(hand, 46, -90), H = P(S, 56, lerp(-150, -92, p));
    const swing = P(H, LEG, lerp(-178, -92, p)), q = clamp01((p - 0.25) / 0.75);
    const push = lerpP([168, 166], P(H, LEG - 1, -92), ease(q));
    sc.floor();
    sc.line([H, ikSide(H, push, 41, 39, 1), push], FAR, 8);
    sc.line([S, H], BODY, TORSO);
    sc.line([H, swing], COL.B, 8);
    sc.dot(P(S, 18, -90 + 155), 10, BODY);
    sc.line([hand, S], BODY, 8);
    return "Kick-up: hands on the floor, one leg swings up straight and over the hips and the other follows, finishing stacked over the hands";
  } },
  wallwalk: { kind: "move", dur: 9000, k: [0.08, 0.6, 0.72], poster: 0.8, sided: false, scale: 0.85, build(sc, _s, p) {
    // Starts as a plank with the feet at the foot of the wall; the feet climb as the hands walk in.
    const L = 56 + LEG, fy = lerp(166, 122 - Math.sqrt(L * L - 46 * 46), p);
    const dx = Math.sqrt(Math.max(1, L * L - (122 - fy) ** 2)), hx = 300 - dx, S = [hx, 122], F = [300, fy];
    const u = [(F[0] - S[0]) / L, (F[1] - S[1]) / L], H = [S[0] + u[0] * 56, S[1] + u[1] * 56];
    sc.floor();
    sc.bg([[306, 168], [306, -600]], PROP, 4);
    sc.line([H, F], BODY, 8); sc.line([S, H], BODY, TORSO);
    sc.dot([S[0] - u[0] * 20 + 6, S[1] - u[1] * 20 + 8], 10, BODY);
    sc.line([[hx, 168], S], COL.B, 8);
    return "Wall walk: start in a plank with the feet at the wall; walk the feet up the wall while the hands walk in toward it, as far as you can hold with a tight body";
  } },
  squat: { kind: "move", dur: 5500, k: [0.05, 0.4, 0.46, 0.78], poster: 0.9, sided: false, tempo: ["control", "drive"], cues: [{ level: "knee", span: ["hip", "knee"], limit: true }, { plumb: "midfoot", to: "bar" }], build(sc, _s, p) { return squatPose(sc, p, 33, "back"); } },
  frontsquat: { kind: "move", dur: 5500, k: [0.05, 0.4, 0.46, 0.78], poster: 0.9, sided: false, tempo: ["control", "drive"], cues: [{ level: "knee", span: ["hip", "knee"], limit: true }], build(sc, _s, p) { return squatPose(sc, p, 12, "front"); } },
  deadlift: { kind: "move", dur: 5200, k: [0.05, 0.33, 0.43, 0.82], poster: 0, sided: false, tempo: ["drive", "control"], cues: [{ plumb: "midfoot", to: "bar" }], build(sc, _s, p) {
    // Start: hips above the knees, trunk about 35° above horizontal (a block pull, not an RDL).
    // Two phases (biomechanist, motion round): the knees straighten first and the hips and shoulders rise
    // together at one back angle; once the bar is past the knees the hips drive through to stand. The
    // bar stays over the foot until the lockout. Hips rising alone first would be the fault, not the lift.
    // 1.4, not steeper: mid-pull read RDL-ish at 1.7 (coach check, 05-check-coach.md).
    const late = p ** 1.4;
    const F = [172, 166], H = [lerp(134, 172, late), lerp(124, 82, lead(p, 1.7))], lean = lerp(55, 0, late) * Math.PI / 180;
    const S = [H[0] + 56 * Math.sin(lean), H[1] - 56 * Math.cos(lean)], B = [S[0], S[1] + 54];
    const K = ikSide(H, F, 44, 42, 1);
    sc.mark("midfoot", [F[0] + 4, 166]); sc.mark("bar", B);
    sc.floor();
    foot(sc, F);
    sc.line([F, K, H], BODY, 8);
    sc.line([H, S], BODY, TORSO);
    sc.dot([S[0] + 14 * Math.sin(lean) + 8, S[1] - 14 * Math.cos(lean)], 11, BODY);
    sc.line([S, B], COL.B, 8);
    sc.plate(B, 14);
    return "Block pull: bar at mid-shin, hips back, flat back and straight arms; push the floor away and stand tall with the bar close to the legs, then lower it back to the blocks";
  } },
};

// ---------------------------------------------------------------------------
// anterior-hip-rebuild figures (2026-10-28). The program's clinical record makes
// four rules here, each one a provocative position the figure must never teach:
// - no deep hip flexion + adduction + internal rotation (squats stop at about
//   parallel, the split-squat front shin stays near vertical);
// - no straight-leg-raise hold: `hollow_hold` is drawn as the TUCK hollow
//   (knees bent over the hips), the controlled leg swing keeps a soft knee and
//   a small front range, the A-march stops at a level thigh;
// - no lumbar extension: hip thrust and bridge finish with shoulder, hip and
//   knee in one line, never past it;
// - no heavy axial load drawn on the spine (none of these put a bar on the back).
// Standing figures use the squat proportions: shin 42, thigh 44, trunk 56, arm 54.
// ---------------------------------------------------------------------------
const dumbbell = (sc: Scene, c: Pt) => {
  sc.line([add(c, [-8, 0]), add(c, [8, 0])], PROP, 5);
  sc.dot(add(c, [-9, 0]), 6, PROP); sc.dot(add(c, [9, 0]), 6, PROP);
};
const kettlebell = (sc: Scene, hand: Pt) => {
  sc.ring(add(hand, [0, 4]), 4, PROP, 3);
  sc.ring(add(hand, [0, 15]), 8, PROP, 3);
};
/** Standing, facing right: stance foot `F`, hip `H`, knee bent forward. */
const leg = (H: Pt, F: Pt): Pt[] => [H, ikSide(H, F, 44, 42, 1), F];

/** Front view, standing tall, for the carries and the Pallof press. Shoulders at y 34, hips at y 88. */
function frontBody(sc: Scene, lift: [number, number], work: { l?: string; r?: string }, shift: Pt = [0, 0]) {
  // The figure faces us, so its RIGHT side is on the viewer's LEFT. `shift` moves everything above the
  // feet: the weight moving over the standing foot as a carry walks.
  const o = (q: Pt) => add(q, shift);
  const hR = o([170, 88]), hL = o([188, 88]);
  const fR = [164, 166 - lift[0]], fL = [194, 166 - lift[1]];
  sc.floor();
  sc.line([hR, ikSide(hR, fR, 40, 40, -1), fR], work.r ?? BODY, 8);
  sc.line([hL, ikSide(hL, fL, 40, 40, 1), fL], work.l ?? BODY, 8);
  sc.line([o([179, 90]), o([179, 36])], BODY, TORSO);
  sc.line([o([158, 36]), o([200, 36])], BODY, 8);
  sc.dot(o([179, 16]), 11, BODY);
}

/**
 * One foot's place in a walking cycle (motion round, 2026-10-29): planted for the first `duty` of it,
 * then a swing. `u` runs 0..1 through each part. The two feet run half a cycle apart, so there is
 * always a foot on the ground and, with `duty` > 0.5, a moment with both down.
 */
function stride(phi: number, duty = 0.6): { stance: boolean; u: number } {
  const x = ((phi % 1) + 1) % 1;
  return x < duty ? { stance: true, u: x / duty } : { stance: false, u: (x - duty) / (1 - duty) };
}
/**
 * Where a swinging foot is, 0 (back) to 1 (front), leaving and landing at the speed the planted foot travels
 * (animator check: an eased swing stopped dead at toe-off and touchdown). A Hermite curve with that end
 * speed runs about 2% past both ends, the way a real foot drifts back before it lands, so callers shrink
 * the span by `SWING_OVER` at each end to keep the extreme where it was.
 */
function swingPos(u: number, duty: number) {
  const m = -(1 - duty) / duty;
  return m * (2 * u ** 3 - 3 * u ** 2 + u) + (3 * u ** 2 - 2 * u ** 3);
}
const SWING_OVER = 0.025;
/** Front-view carry: foot lifts, and the trunk shifting over the standing foot and rising a little on it. */
function carryGait(phi: number): { lift: [number, number]; shift: Pt } {
  const lift = (q: number) => { const st = stride(q); return st.stance ? 0 : Math.sin(st.u * Math.PI) * 9; };
  // Right foot swings around phi 0.8, left around 0.3: the weight is over the other foot then.
  const dx = 2.5 * Math.cos(2 * Math.PI * (phi - 0.8)), dy = -1.2 * Math.cos(4 * Math.PI * (phi - 0.8));
  return { lift: [lift(phi), lift(phi + 0.5)], shift: [dx, dy] };
}

const HIP_FIGS: Record<string, Fig> = {
  bridge2: { dur: 4500, kind: "move", k: [0.08, 0.36, 0.6], sided: false, tempo: ["drive", "control"], scale: 1.15, cues: [{ align: ["shoulder", "hip", "knee"] }], build(sc, _s, p) {
    const S = [120, 158], T = 78, F = [258, 164], th = lerp(0, 22.7, p) * Math.PI / 180;
    const H = [S[0] + T * Math.cos(th), S[1] - T * Math.sin(th)];
    sc.mark("shoulder", S); sc.mark("hip", H); sc.mark("knee", ik(H, F, 66, 62, true));
    sc.floor();
    sc.line([H, ik(add(H, [-6, 0]), add(F, [-6, 0]), 66, 62, true), add(F, [-6, 0])], FAR, 8);
    sc.line([[122, 162], [198, 166]], BODY, 8);
    sc.line([[98, 154], S], BODY, 8); sc.dot([90, 151], 11, BODY);
    sc.line([S, H], BODY, TORSO);
    sc.line([H, ik(H, F, 66, 62, true), F], COL.B, 8);
    return "Glute bridge: lying on the back, knees bent and feet flat; ribs down, the hips lift until shoulder, hip and knee form one line, then lower";
  } },
  hipthrust: { dur: 4500, kind: "move", k: [0.08, 0.36, 0.6], sided: false, tempo: ["drive", "control"], scale: 1.1, cues: [{ align: ["shoulder", "hip", "knee"] }], build(sc, _s, p) {
    // Upper back pivots on the bench edge. At the top the trunk and thigh are level and in one line
    // with the shoulder: finished with the glutes, never arched past it.
    const S = [118, 106], F = [262, 167], th = lerp(40, 0, p);
    const H = P(S, 78, th), K = ik(H, F, 66, 62, true);
    sc.mark("shoulder", S); sc.mark("hip", H); sc.mark("knee", K);
    sc.floor();
    sc.box(52, 114, 126, 167);
    sc.line([add(H, [-6, 0]), ik(add(H, [-6, 0]), add(F, [-6, 0]), 66, 62, true), add(F, [-6, 0])], FAR, 8);
    sc.line([S, [84, 110]], BODY, 8);
    sc.line([S, H], BODY, TORSO);
    sc.dot(P(S, 26, -150 + th), 11, BODY);
    sc.line([H, K, F], COL.B, 8);
    const bar = add(H, [0, -16]);
    sc.plate(bar, 12);
    return "Barbell hip thrust: upper back on a bench, bar across the hips, feet flat; chin tucked and ribs down, drive the hips up until the thighs and trunk are level, then lower";
  } },
  splitsquat: { dur: 5000, kind: "move", k: [0.08, 0.42, 0.54], sided: true, tempo: ["control", "drive"], cues: [{ plumb: "ankle", to: "knee" }], build(sc, side, p) {
    // Front shin stays close to vertical (knee-forward drive loads the front of the hip).
    const work = COL[side], F = [192, 166], R = [110, 116], H = lerpP([162, 86], [150, 124], p);
    const S = P(H, 56, -80), front = leg(H, F), rear = [H, ik(H, R, 44, 42, false), R];
    sc.mark("ankle", F); sc.mark("knee", front[1]);
    sc.floor();
    sc.box(74, 122, 132, 167);
    const rest = () => sc.line(rear, side === "R" ? FAR : BODY, 8);
    sc.line([S, P(S, 52, 94)], FAR, 8);
    if (side === "R") rest();
    sc.line([H, S], BODY, TORSO); sc.dot(P(S, 22, -82), 11, BODY);
    if (side === "L") rest();
    sc.line(front, work, 8);
    const hand = P(S, 52, 90);
    sc.line([S, hand], BODY, 8); dumbbell(sc, hand);
    sc.badge(beyond(front[1], F, 14), work, side);
    return "Bulgarian split squat, " + sideWord(side) + " leg in front: rear foot on a bench, dumbbells at the sides; lower straight down with the front shin close to vertical, then stand";
  } },
  slrdl: { dur: 5500, kind: "move", k: [0.08, 0.44, 0.56], sided: true, tempo: ["control", "drive"], cues: [{ align: ["shoulder", "hip", "foot"] }], build(sc, side, p) {
    // Hinge to about 70°: the rear leg rises in one line with the trunk, spine long.
    const work = COL[side], F = [196, 166], lean = lerp(0, 70, p), H = lerpP([194, 82], [178, 90], p);
    const S = P(H, 56, -90 + lean), rearF = P(H, 86, 90 + lean), hand = P(S, 50, 90);
    sc.mark("shoulder", S); sc.mark("hip", H); sc.mark("foot", rearF);
    sc.floor();
    const rest = () => sc.line([H, P(H, 44, 90 + lean), rearF], side === "R" ? FAR : BODY, 8);
    // Load in the hand opposite the standing leg: a left stance holds it in the near (right) hand.
    if (side === "R") { sc.line([S, hand], BODY, 8); kettlebell(sc, hand); rest(); }
    else { sc.line([S, P(S, 50, 92)], FAR, 8); }
    sc.line([H, S], BODY, TORSO); sc.dot(P(S, 22, -90 + lean), 11, BODY);
    if (side === "L") rest();
    sc.line(leg(H, F), work, 8);
    if (side === "L") { sc.line([S, hand], BODY, 8); kettlebell(sc, hand); }
    sc.badge([F[0] + 18, F[1] - 8], work, side);
    return "Single-leg Romanian deadlift, standing on the " + sideWord(side) + " leg: weight in the opposite hand; hinge at the hip with a long spine while the free leg rises behind in one line, then stand";
  } },
  pallof: { dur: 5000, kind: "move", k: [0.1, 0.36, 0.64, 0.9], sided: false, front: true, cues: [{ plumb: "mid", to: "chest" }], build(sc, _s, p) {
    // Seen from the front with the band anchored to the viewer's left: the hands press straight out
    // (toward us, so the arms foreshorten) and stay on the midline while the trunk refuses to turn.
    // The hand dot grows as it comes toward us: that, and the arms straightening, is the press.
    const hand = [179, lerp(62, 46, p)], d = p;
    sc.mark("mid", [179, 88]); sc.mark("chest", hand);
    frontBody(sc, [0, 0], {});
    sc.line([[40, 30], [40, 167]], PROP, 4);
    sc.line([[42, hand[1]], hand], BAND, lerp(3, 5, p));
    const sR = [158, 36], sL = [200, 36];
    sc.line([sR, lerpP([156, 66], lerpP(sR, hand, 0.5), d), hand], COL.B, 8);
    sc.line([sL, lerpP([202, 66], lerpP(sL, hand, 0.5), d), hand], COL.B, 8);
    sc.dot(hand, lerp(5, 8.5, p), BODY);
    return "Pallof press: standing side-on to a band anchored at chest height; press the hands straight out from the chest and hold, the trunk refusing to turn toward the anchor, then bring them back";
  } },
  nordic: { dur: 8000, kind: "move", k: [0.05, 0.72, 0.8, 0.94], poster: 0.7, sided: false, tempo: ["control", "drive"], cues: [{ align: ["knee", "hip", "shoulder"] }], build(sc, _s, p) {
    // Slow lowering (the eccentric is the exercise), quick push back up with the hands.
    const K = [152, 162], A = [100, 162], a = lerp(-88, -22, p);
    // The hands land ON the floor at the bottom: the arm's end angle is solved from the lowest shoulder.
    const sLow = P(P(K, 44, -22), 56, -22), land = Math.asin(Math.min(1, (166 - sLow[1]) / 50)) * 180 / Math.PI;
    const H = P(K, 44, a), S = P(H, 56, a), hand = P(S, 50, lerp(a + 150, land, p));
    sc.mark("knee", K); sc.mark("hip", H); sc.mark("shoulder", S);
    sc.floor();
    sc.line([K, A, [92, 166]], BODY, 8);
    sc.ring(add(A, [0, -9]), 7, PROP, 3);
    sc.line([H, S], BODY, TORSO); sc.dot(P(S, 22, a), 11, BODY);
    sc.line([K, H], COL.B, 8);
    sc.line([S, hand], BODY, 8);
    return "Nordic curl: kneeling with the ankles held down; keep knee, hip and shoulder in one line and lower forward as slowly as you can, catch with the hands, push back up";
  } },
  sled: { dur: 2600, kind: "gait", k: [0, 1, 1], poster: 0.8, sided: false, build(sc, _s, p) {
    // Low drive into the sled: trunk about 45°, arms long, one knee drives through while the
    // other leg pushes back straight.
    // Front foot capped under the hip (about 90° hip flexion under load, not deeper).
    // A walk, not a toggle (motion round): each foot pushes back along the floor, then swings through
    // low and lands under the hip; the hips dip a little as the weight passes over each foot.
    const H = [150, 102 + 1.5 * Math.cos(4 * Math.PI * (p - 0.8))], S = P(H, 56, -42), hand = [232, 80];
    const back = 104 + 56 * SWING_OVER, front = 160 - 56 * SWING_OVER;   // the swing's drift stays inside 104..160
    const foot2 = (q: number): Pt[] => {
      const st = stride(q);
      return leg(H, st.stance ? [lerp(front, back, st.u), 166] : [lerp(back, front, swingPos(st.u, 0.6)), 166 - Math.sin(st.u * Math.PI) * 18]);
    };
    const near = foot2(p), far = foot2(p + 0.5);
    sc.floor();
    sc.line([[238, 76], [250, 166]], PROP, 5);
    sc.box(246, 136, 318, 166);
    sc.line(far, FAR, 8);
    sc.line([S, ikSide(S, hand, 28, 26, -1), hand], FAR, 8);
    sc.line([H, S], BODY, TORSO); sc.dot(P(S, 22, -38), 11, BODY);
    sc.line(near, COL.B, 8);
    sc.line([S, ikSide(S, add(hand, [0, 4]), 28, 26, -1), add(hand, [0, 4])], BODY, 8);
    return "Heavy sled push: hands high on the sled posts, trunk leaning in at about 45°, arms long; drive one knee through at a time with short powerful steps";
  } },
  suitcase: { dur: 2400, kind: "gait", k: [0, 1, 1], poster: 0.8, sided: true, front: true, cues: [{ plumb: "mid", to: "head" }], build(sc, side, p) {
    // Front view: the loaded arm hangs straight, the trunk stays vertical and does not lean toward it.
    // It shifts sideways over the standing foot as a whole, upright, which is not a lean.
    const work = COL[side], g = carryGait(p);
    sc.mark("mid", [179, 88]); sc.mark("head", [179, 6]);
    frontBody(sc, g.lift, {}, g.shift);
    const loaded = add(side === "R" ? [158, 36] : [200, 36], g.shift), free = add(side === "R" ? [200, 36] : [158, 36], g.shift);
    const fs = side === "R" ? 1 : -1;
    sc.line([free, add(free, [fs * 6, 50])], BODY, 8);
    const hand = add(loaded, [-fs * 6, 52]);
    sc.line([loaded, hand], work, 8); kettlebell(sc, hand);
    sc.badge(add(hand, [-fs * 22, 4]), work, side);
    return "Suitcase carry, weight in the " + sideWord(side) + " hand: walk tall with small steps, ribs down, the trunk staying upright instead of leaning toward the load";
  } },
  farmer: { dur: 2400, kind: "gait", k: [0, 1, 1], poster: 0.8, sided: false, front: true, build(sc, _s, p) {
    const g = carryGait(p);
    frontBody(sc, g.lift, {}, g.shift);
    for (const [s0, dx] of [[[158, 36], -6], [[200, 36], 6]] as [Pt, number][]) {
      const s = add(s0, g.shift), hand = add(s, [dx, 52]);
      sc.line([s, hand], COL.B, 8); kettlebell(sc, hand);
    }
    return "Farmer's carry: a heavy weight in each hand, arms long; walk tall with small fast steps and controlled breathing";
  } },
  airsquat: { kind: "move", dur: 5500, k: [0.05, 0.4, 0.46, 0.78], poster: 0.9, sided: false, tempo: ["control", "drive"], cues: [{ level: "knee", span: ["hip", "knee"], limit: true }], build(sc, _s, p) { return squatPose(sc, p, 30, "air"); } },
  goblet: { kind: "move", dur: 5500, k: [0.05, 0.4, 0.46, 0.78], poster: 0.9, sided: false, tempo: ["control", "drive"], cues: [{ level: "knee", span: ["hip", "knee"], limit: true }], build(sc, _s, p) { return squatPose(sc, p, 22, "goblet"); } },
  amarch: { dur: 3000, kind: "move2", k: [0.05, 0.4, 0.62], sided: false, cues: [{ angle: ["knee", "hip", "shoulder"] }], build(sc, _s, p, rep = 0) {
    // Knee to a level thigh (90°) and no higher; the opposite arm drives forward.
    const H = [178, 82], S = [178, 26];
    const up = (q: number): Pt[] => { const K = P(H, 44, lerp(92, 0, q)); return [H, K, P(K, 42, 90 - lerp(-4, 4, q))]; };
    const down = (): Pt[] => [H, P(H, 44, 92), [176, 166]];
    const arm = (q: number, fwd: boolean): Pt[] => {
      const a = fwd ? lerp(92, 50, q) : lerp(92, 128, q), E = P(S, 28, a);
      return [S, E, P(E, 26, a - 70)];
    };
    const nearLeg = rep === 0 ? up(p) : down(), farLeg = rep === 0 ? down() : up(p);
    sc.mark("hip", H); sc.mark("shoulder", S); sc.mark("knee", (rep === 0 ? nearLeg : farLeg)[1]);
    sc.floor();
    sc.line(farLeg, rep === 1 ? COL.B : FAR, 8);
    sc.line(arm(p, rep === 0), FAR, 8);
    sc.line([H, S], BODY, TORSO); sc.dot([180, 4], 11, BODY);
    sc.line(nearLeg, rep === 0 ? COL.B : BODY, 8);
    sc.line(arm(p, rep === 1), BODY, 8);
    return "A-march: standing tall, drive one knee up until the thigh is level, no higher, with the opposite arm forward; set it down and switch";
  } },
  legswing: { dur: 2600, kind: "move", k: [0, 0.5, 0.5], poster: 0.5, sided: true, build(sc, side, p) {
    // Small range with a soft knee: about 15° behind to 30° in front. A primer, not a stretch,
    // and never a held straight-leg raise.
    const work = COL[side], H = [176, 82], S = [178, 26], a = lerp(104, 60, p);
    const K = P(H, 44, a), swing = [H, K, P(K, 42, a + 16)], stand = [H, [176, 124], [176, 166]];
    sc.floor();
    sc.line([[222, 54], [222, 167]], PROP, 4);
    if (side === "L") sc.line(stand, BODY, 8); else sc.line(swing, work, 8);
    sc.line([H, S], BODY, TORSO); sc.dot([180, 4], 11, BODY);
    if (side === "L") sc.line(swing, work, 8); else sc.line(stand, FAR, 8);
    sc.line([S, [204, 50], [221, 58]], BODY, 8);
    sc.badge(beyond(K, swing[2], 14), work, side);
    return "Controlled leg swings, " + sideWord(side) + " leg: one hand on a support, the " + sideWord(side) + " leg swings front to back through a small, easy range with a soft knee";
  } },
  hollowtuck: { kind: "hold", sided: false, scale: 1.15, build(sc, _s, q) {
    // Tuck hollow: knees bent over the hips (short lever, not a straight-leg-raise hold), lower back
    // pressed down, shoulders curled up off the floor.
    const H = [196, 160], a = lerp(0, 16, q), S = P(H, 80, 180 + a);
    const K = P(H, 62, -98), F = P(K, 58, -8);
    sc.floor();
    sc.line([H, K, F], BODY, 8);
    sc.line([S, H], BODY, TORSO);
    sc.dot(P(S, 26, 180 + a + 6), 11, BODY);
    sc.line([S, P(S, 70, -26 + a * 0.3)], COL.B, 8);
    return "Hollow hold, tucked: lying on the back with knees bent over the hips, lower back pressed into the floor, shoulders curled up and arms reaching toward the knees";
  } },
};

function squatPose(sc: Scene, p: number, leanDeg: number, load: "back" | "front" | "air" | "goblet"): string {
  // Depth stops at about parallel (no deep flexion with the knees caving: a documented provocateur).
  // Hips sit back behind the heel and the shin tilts ~25° (it stood near vertical before review).
  // Sequenced (motion round, 2026-10-29): the hips start back before they go down, so they also come
  // forward last on the way up; the trunk angle is solved so the shoulders (and the bar) travel a straight
  // line between their two end positions instead of drifting.
  const F = [155, 166], H = [lerp(155, 129, lead(p)), lerp(80, 127, p)];
  const sx = lerp(155, 129 + 56 * Math.sin(leanDeg * Math.PI / 180), p);
  const lean = Math.asin(Math.max(0, Math.min(1, (sx - H[0]) / 56)));
  const K = ikSide(H, F, 44, 42, 1), S = [H[0] + 56 * Math.sin(lean), H[1] - 56 * Math.cos(lean)];
  sc.mark("midfoot", [F[0] + 4, 166]); sc.mark("hip", H); sc.mark("knee", K);
  sc.floor();
  foot(sc, F);
  sc.line([F, K, H], BODY, 8);
  sc.line([H, S], BODY, TORSO);
  sc.dot([S[0] + 22 * Math.sin(lean) + 4, S[1] - 24 * Math.cos(lean)], 11, BODY);
  if (load === "air") {
    // Arms hang at the top and reach forward as the hips sit back, for balance.
    const a = lerp(8, 82, p) * Math.PI / 180;
    sc.line([S, [S[0] + 52 * Math.sin(a), S[1] + 52 * Math.cos(a)]], COL.B, 8);
    return "Air squat: feet shoulder-width, slow tempo; sit down between the hips to about parallel and no deeper, pain-free, knees tracking over the toes, arms forward for balance, then stand";
  }
  if (load === "goblet") {
    const bell = [S[0] + 16, S[1] + 18];
    sc.mark("bar", bell);
    sc.line([S, [S[0] + 4, S[1] + 26], bell], COL.B, 8);
    sc.ring(bell, 9, PROP, 3); sc.ring(add(bell, [0, -11]), 4, PROP, 3);
    return "Goblet squat: a dumbbell or kettlebell held at the chest, elbows down; sit down between the hips keeping the chest tall and the knees out, then stand";
  }
  if (load === "front") {
    // Front rack: the upper arm points forward, nearly level (elbows high), the hand back at the bar.
    const bar = [S[0] + 10, S[1] + 2];
    sc.mark("bar", bar);
    sc.plate(bar, 11);
    sc.line([add(S, [2, 2]), [S[0] + 26, S[1] - 2], [S[0] + 12, S[1] - 8]], COL.B, 8);
    return "Front squat: bar resting on the front of the shoulders, elbows high; sit down between the hips keeping the chest tall, then stand";
  }
  // Back squat: hands grip the bar, elbows back and down.
  const bar = [S[0] - 4, S[1] - 4];
  sc.mark("bar", bar);
  sc.plate(bar, 11);
  sc.line([add(S, [-2, 4]), [S[0] - 14, S[1] + 16], bar], COL.B, 8);
  return "High-bar back squat: bar on the upper back, feet shoulder-width; sit down and back until the thighs are about parallel with the chest up, then stand";
}
Object.assign(FIGS, AD_FIGS, HIP_FIGS);

export const FIGURE_SLOTS = SLOTS;

// ---------------------------------------------------------------------------
// Body v2 (2026-10-28, dev/active/figure-review/ideas-00-synthesis.md round A): the skeleton every
// figure builds is given flesh AFTER the pose is solved, so no pose, test or limb-length rule changes.
// Roles are read from the skeleton: the trunk is the torso-width line, its shoulder end is the end
// nearest the head, a limb belongs to whichever end of the trunk it starts at. Every width is a
// fraction of the trunk length T (illustrator + biomechanist specs: thigh radius 0.12T tapering to
// 0.055T at the ankle, upper arm 0.085T to 0.048T, chest wider than waist, head radius 0.21T).
// ---------------------------------------------------------------------------
const FLESH = new Set([BODY, FAR, ACCENT, COL.L, COL.R]);
const parse = (s: string): Pt[] => s.split(" ").map((q) => q.split(",").map(Number));
const dist = (a: Pt, b: Pt) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const angOf = (a: Pt, b: Pt) => Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI;

/**
 * One tapered capsule per segment as ONE polygon: each capsule is a closed loop traced the same way
 * round (so overlaps at the joints fill, nonzero), joined by connectors that are walked back at the end
 * and so enclose nothing.
 */
function fleshChain(pts: Pt[], radii: number[]): Pt[] {
  const out: Pt[] = [], starts: Pt[] = [];
  for (let i = 0; i + 1 < pts.length; i++) {
    const a = pts[i], b = pts[i + 1], ra = radii[i], rb = radii[i + 1], g = angOf(a, b);
    const loop: Pt[] = [];
    for (let j = 0; j <= 4; j++) loop.push(P(a, ra, g + 90 + 45 * j));
    for (let j = 0; j <= 4; j++) loop.push(P(b, rb, g - 90 + 45 * j));
    out.push(...loop, loop[0]);
    starts.push(loop[0]);
  }
  for (let i = starts.length - 2; i >= 0; i--) out.push(starts[i]);
  return out;
}

/** Trunk from hip to shoulder: pelvis, a narrower waist, a wider ribcage, rounded at both ends. */
function fleshTrunk(H: Pt, S: Pt, front: boolean, breath = 0): Pt[] {
  const T = dist(H, S), g = angOf(H, S);
  // Near-horizontal trunks get a flatter ribcage: the full chest-waist step read as a sagging or
  // arched low back on bridges and hollows (coach, body v2 re-check). Front views are wider.
  // Front views: hips, a waist, then shoulders wide enough that the arms hang from the trunk itself.
  const flat = Math.abs(Math.sin(g * Math.PI / 180)) < 0.5 ? 0.5 : 1;
  const prof: [number, number][] = front
    ? [[0, 0.21], [0.2, 0.2], [0.45, 0.17], [0.72, 0.25], [0.9, 0.35], [1, 0.3]]
    : ([[0, 0.16], [0.18, 0.15], [0.42, 0.125], [0.7, 0.19], [0.9, 0.18], [1, 0.14]] as [number, number][])
      .map(([t, r]) => [t, 0.16 + (r - 0.16) * flat]);
  // A held breath cycle widens the ribcage (the upper part of the trunk) by up to 8%: the skeleton never moves.
  if (breath) for (const q of prof) if (q[0] >= 0.6) q[1] *= 1 + 0.08 * breath;
  const at = (t: number) => P(H, T * t, g);
  const right = prof.map(([t, r]) => P(at(t), r * T, g + 90));
  const left = prof.slice().reverse().map(([t, r]) => P(at(t), r * T, g - 90));
  const top: Pt[] = [1, 2, 3].map((j) => P(S, prof[5][1] * T, g + 90 - 45 * j));
  const bottom: Pt[] = [1, 2, 3].map((j) => P(H, prof[0][1] * T, g - 90 - 45 * j));
  return [...right, ...top, ...left, ...bottom, right[0]];
}

function circle(c: Pt, r: number): Pt[] { const a: Pt[] = []; for (let i = 0; i <= 16; i++) a.push(P(c, r, i * 22.5)); return a; }

function flesh(items: FigureSlot[], floor: boolean, front: boolean, breath = 0): FigureSlot[] {
  const body = items.filter((it) => !it.bg && FLESH.has(it.color));
  const isHead = (it: FigureSlot) => it.w >= 18 && it.w <= 24 && dist(...(parse(it.pts) as [Pt, Pt])) < 1;
  const heads = body.filter(isHead).map((it) => parse(it.pts)[0]);
  const trunks = body.filter((it) => it.w === TORSO && it.pts.split(" ").length === 2);
  if (!trunks.length || !heads.length) return items;
  const head = heads[0];
  // The trunk whose end is nearest the head; that end is the shoulder.
  let best = trunks[0], S: Pt = [0, 0], H: Pt = [0, 0], dBest = Infinity;
  for (const t of trunks) {
    const [a, b] = parse(t.pts);
    for (const [s0, h0] of [[a, b], [b, a]]) if (dist(s0, head) < dBest) { dBest = dist(s0, head); best = t; S = s0; H = h0; }
  }
  const T = Math.max(45, Math.min(120, dist(S, H)));
  const out = items.map((it) => {
    if (it.bg || !FLESH.has(it.color)) return it;
    const pts = parse(it.pts);
    if (it === best || (it.w === TORSO && pts.length === 2)) {
      const [a, b] = it === best ? [H, S] : pts;
      return { ...it, shape: fmt(fleshTrunk(a, b, front, it === best ? breath : 0)) };
    }
    if (it.w >= 18 && pts.length === 2 && dist(pts[0], head) < 1) return { ...it, shape: fmt(circle(pts[0], Math.max(9, Math.min(16, 0.21 * T)))) };
    if (it.w !== 8 || pts.length < 2) return it;
    const len = pts.slice(1).reduce((s0, q, i) => s0 + dist(pts[i], q), 0);
    const first = pts[0], last = pts[pts.length - 1];
    const dS = Math.min(dist(first, S), dist(last, S)), dH = Math.min(dist(first, H), dist(last, H));
    const near = dS <= dH ? S : H;
    const chain = dist(last, near) < dist(first, near) ? pts.slice().reverse() : pts;
    let r0: number, r1: number, r2: number;
    // Front views: the shoulder girdle is inside the wide trunk, so its bar is not drawn.
    if (front && pts.length === 2 && Math.max(dist(first, S), dist(last, S)) < 0.45 * T) return { ...it, op: 0 };
    if (len < 0.55 * T) { r0 = r1 = r2 = 0.075 * T; }                                 // neck, shoulder girdle
    // Knee and elbow pinch a little (r1), so a bent limb reads as two segments, not a sausage.
    // Front views slim the arms a little against the wider trunk.
    else if (dS <= dH && dS < 0.45 * T) { const k = front ? 0.85 : 1; r0 = 0.085 * T * k; r1 = 0.058 * T * k; r2 = 0.048 * T * k; }  // arm
    else if (dH < 0.45 * T) { r0 = 0.12 * T; r1 = 0.07 * T; r2 = 0.055 * T; }                // leg
    else { r0 = 0.09 * T; r1 = 0.07 * T; r2 = 0.05 * T; }
    const radii = chain.length === 2 ? [r0, r2] : chain.map((_, i) => (i === 0 ? r0 : i === chain.length - 1 ? r2 : r1));
    return { ...it, shape: fmt(fleshChain(chain, radii)) };
  });
  if (floor) {
    // Contact shadow under whatever touches the floor; not a meaningful stroke (w 0), not in the bounds.
    const xs = body.flatMap((it) => parse(it.pts)).filter((q) => q[1] >= 158).map((q) => q[0]);
    if (xs.length) {
      const x0 = Math.min(...xs), x1 = Math.max(...xs), c: Pt = [(x0 + x1) / 2, 169.5], rx = (x1 - x0) / 2 + 0.25 * T, ry = 0.05 * T;
      const e: Pt[] = []; for (let i = 0; i <= 20; i++) { const a = i * Math.PI / 10; e.push([c[0] + rx * Math.cos(a), c[1] + ry * Math.sin(a)]); }
      const shadow: FigureSlot = { pts: fmt([c, c]), color: "#000000", w: 0, op: 0.28, fill: "#000000", dash: "none", bg: true, shape: fmt(e) };
      const fi = out.findIndex((it) => it.bg && it.color === FLOOR);
      out.splice(fi + 1, 0, shadow);
    }
  }
  return out;
}

const endMarks = new Map<string, Record<string, Pt>>();
/** Joints of the end pose (p = 1, first rep), for cues that reference where the movement goes. */
function marksAtEnd(id: string, side: FigureSide): Record<string, Pt> {
  const key = id + side;
  if (!endMarks.has(key)) { const g = new Scene(); FIGS[id].build(g, side, 1, 0); endMarks.set(key, g.marks); }
  return endMarks.get(key)!;
}

function cueSlots(id: string, side: FigureSide, f: Fig, sc: Scene, p: number): FigureSlot[] {
  const end = marksAtEnd(id, side), now = sc.marks, out: FigureSlot[] = [];
  const push = (a: Pt[], dash = CUE_DASH, op = CUE_OP) => out.push({ pts: fmt(a), color: ACCENT, w: CUE_W, op, fill: "none", dash, cue: true });
  for (const c of f.cues!) {
    if ("plumb" in c) {
      const x = end[c.plumb][0], top = Math.min(end[c.to][1], now[c.to]?.[1] ?? Infinity) - 10;
      push([[x, 166], [x, top]]);
    } else if ("level" in c) {
      const y = end[c.level][1], x0 = Math.min(end[c.span[0]][0], end[c.span[1]][0]) - 14, x1 = Math.max(end[c.span[0]][0], end[c.span[1]][0]) + 14;
      push([[x0, y], [x1, y]], c.limit ? "none" : CUE_DASH);
      if (c.limit) for (let x = x0 + 4; x <= x1 - 2; x += 9) push([[x, y], [x - 5, y + 6]], "none", CUE_OP * 0.8);
    } else if ("tuck" in c) {
      // Pelvis tucks under: an arc behind and below the hip, arrowhead pointing down-forward.
      const h = now[c.tuck], arc: Pt[] = [];
      for (let i = 0; i <= 10; i++) arc.push(P(h, 18, lerp(-150, -250, i / 10)));
      const e = arc[arc.length - 1];
      out.push({ pts: fmt(arc), color: ACCENT, w: ARC_W, op: CUE_OP, fill: "none", dash: "none", cue: true });
      out.push({ pts: fmt([P(e, 7, 20), e, P(e, 7, -70)]), color: ACCENT, w: ARC_W, op: CUE_OP, fill: "none", dash: "none", cue: true });
    } else if ("angle" in c) {
      const [a, b, d] = c.angle.map((n) => now[n]);
      if (!a || !b || !d) continue;
      const a0 = angOf(b, a);
      let a1 = angOf(b, d);
      while (a1 - a0 > 180) a1 -= 360;
      while (a0 - a1 > 180) a1 += 360;
      const arc: Pt[] = []; for (let i = 0; i <= 12; i++) arc.push(P(b, ARC_R, lerp(a0, a1, i / 12)));
      out.push({ pts: fmt(arc), color: ACCENT, w: ARC_W, op: CUE_OP * (0.6 + 0.4 * p), fill: "none", dash: "none", cue: true });
    } else {
      const js = c.align.map((n) => now[n]);
      if (js.some((j) => !j)) continue;
      const a = js[0], b = js[js.length - 1], L = dist(a, b) || 1, u = [(b[0] - a[0]) / L, (b[1] - a[1]) / L];
      // Off-line distance of the middle joints; within 3 the line turns solid: "now you are in line".
      const off = Math.max(0, ...js.slice(1, -1).map((j) => Math.abs((j[0] - a[0]) * u[1] - (j[1] - a[1]) * u[0])));
      push([[a[0] - u[0] * 12, a[1] - u[1] * 12], [b[0] + u[0] * 12, b[1] + u[1] * 12]], off < 3 ? "none" : CUE_DASH);
    }
  }
  return out;
}

/** The next rung, as a faint outline of its poster pose behind this figure (variant ladders, idea 7). */
function ladderGhost(next: string, side: FigureSide): FigureSlot[] {
  const g = new Scene(), n = FIGS[next];
  n.build(g, n.sided ? side : "B", posterOf(n), 0);
  // Limbs and trunk only, dotted and faint: no head, so it reads as "the next angle", not a second person.
  return g.items
    .filter((it) => !it.bg && FLESH.has(it.color) && it.w >= 8 && !(parse(it.pts).length === 2 && dist(...(parse(it.pts) as [Pt, Pt])) < 1))
    .map((it) => ({ ...it, color: FAR, w: 2, op: 0.4, dash: "2 3", fill: "none", cue: true }));
}

/** The pose a still figure shows: the drill's defining frame, not the rest pose (dead hangs all look alike). */
function posterOf(f: Fig) { return f.poster ?? 1; }

/**
 * Frame for `elapsed` ms into the active set. `reduced` = prefers-reduced-motion.
 * `still` = not playing at all (brief thumbnails, a paused set before it starts): draws the poster pose.
 */
export function drawFigure(id: string, side: FigureSide | "E", elapsed: number, reduced: boolean, still = false): FigureFrame {
  const f = FIGS[id];
  let s: FigureSide = side === "R" ? "R" : side === "L" ? "L" : "B";
  if (f.sided && s === "B") s = "L";
  const sc = new Scene();
  sc.scale = f.scale || 1;
  let label: string, rep = 0, p: number, breath = 0;
  if (f.kind === "hold") {
    // Isometric: ease into the effort once (0.9 s, cosine: no jolt on the first frame), then hold.
    // Reduced motion and stills show full effort.
    p = reduced || still ? 1 : ease(Math.min(1, elapsed / 900));
    // Then breathe (motion round, 2026-10-29): a slow 4.5 s cycle in the ribcage only, so the pose that a
    // coach panel set never moves and a hold no longer reads as a photo.
    label = f.build(sc, s, p);
    // Not on a hold that cues ribs down (hollow, dead-bug family): a widening ribcage there would read as
    // the rib flare the cue is against (coach check).
    if (!reduced && !still && elapsed > 900 && !/ribs down|hollow/i.test(label)) breath = 0.5 - 0.5 * Math.cos((2 * Math.PI * (elapsed - 900)) / 4500);
  } else {
    const dur = f.kind === "move2" ? f.dur! / 2 : f.dur!;
    rep = f.kind === "move2" && !reduced && !still ? Math.floor(elapsed / dur) % 2 : 0;
    // Reduced motion: the poster pose, solid, with the opposite extreme as a thin outline (for a gait,
    // the same moment half a stride on: the other foot forward).
    const poster = posterOf(f), ghostP = f.kind === "gait" ? (poster + 0.5) % 1 : poster >= 0.5 ? 0 : 1;
    p = reduced || still ? poster : f.kind === "gait" ? (elapsed % dur) / dur : prog((elapsed % dur) / dur, f.k!, f.tempo);
    label = f.build(sc, s, p, rep);
    if (reduced) {
      // The other pose as a thin solid outline in FAR, behind the body: thin enough never to read
      // as a second figure, solid enough for 3:1. Dots become rings.
      const g = new Scene();
      g.scale = sc.scale;
      f.build(g, s, ghostP, rep);
      const ghosts: FigureSlot[] = [];
      g.items.forEach((it, i) => {
        const base = sc.items[i];
        if (it.bg || (base && base.pts === it.pts)) return;
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
  // Ladder ghost and cues go BEHIND the body (after the floor): an alignment line then shows only where
  // it runs past the joints, like a guide, and never draws over the figure.
  const behind = [...(f.ladder && !reduced ? ladderGhost(f.ladder, s) : []), ...(f.cues ? cueSlots(id, s, f, sc, reduced ? (f.kind === "hold" ? 1 : posterOf(f)) : p) : [])];
  if (behind.length) {
    const at = sc.items.findIndex((it) => !it.bg) < 0 ? sc.items.length : sc.items.findIndex((it) => !it.bg);
    sc.items.splice(at, 0, ...behind);
  }
  sc.items = flesh(sc.items, sc.hasFloor, !!f.front, breath);
  const empty: FigureSlot = { pts: "0,0", color: "none", w: 0, op: 0, fill: "none", dash: "none" };
  const noBadge: FigureBadge = { x: -50, y: -50, color: "none", letter: "", op: 0 };
  return {
    label,
    tf: tf(f.scale || 1),
    floor: sc.hasFloor,
    slots: Array.from({ length: SLOTS }, (_, i) => sc.items[i] ?? empty),
    badges: [0, 1].map((j) => sc.badges[j] ?? noBadge),
  };
}

/** True when the frame can no longer change. Holds breathe since the motion round, so only reduced motion. */
export function figureIsStatic(_id: string, _elapsed: number, reduced: boolean): boolean {
  return reduced;
}

export type FigureBox = { x: number; y: number; w: number; h: number };
const boxCache = new Map<string, FigureBox>();

/**
 * One frame for the whole cycle, fitted to the figure (2026-10-28 review). The old fixed 358x201
 * frame left a standing figure 46% of the Today tile's height and ~26px tall in a brief thumbnail.
 * The union over every frame (both reps, the poster, the reduced-motion ghost) keeps the frame
 * still while the figure moves. Floor, bars and walls (`bg`) are left out: they run past the frame
 * and get cropped, which is how a floor should look.
 */
export function figureBounds(id: string, side: FigureSide | "E"): FigureBox {
  const key = id + side;
  const hit = boxCache.get(key);
  if (hit) return hit;
  const f = FIGS[id];
  const cycle = f.kind === "hold" ? 900 : f.dur!;
  const frames = [drawFigure(id, side, 0, true), drawFigure(id, side, 0, false, true)];
  for (let i = 0; i <= 32; i++) frames.push(drawFigure(id, side, (cycle * i) / 32, false));
  const sc = f.scale || 1;
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const grow = (x: number, y: number, r: number) => {
    // Through the figure's own transform: translate(179 160) scale(s) translate(-179 -168).
    const X = 179 + sc * (x - 179), Y = 160 + sc * (y - 168), R = r * sc;
    x0 = Math.min(x0, X - R); x1 = Math.max(x1, X + R); y0 = Math.min(y0, Y - R); y1 = Math.max(y1, Y + R);
  };
  for (const fr of frames) {
    for (const s of fr.slots) {
      // Cues are hidden in thumbnails, so they must not shrink the frame the thumbnail uses.
      if (s.w <= 0 || s.bg || s.cue) continue;
      const pts = s.pts.split(" ").map((q) => q.split(",").map(Number));
      const r = pts.length === 2 && Math.hypot(pts[0][0] - pts[1][0], pts[0][1] - pts[1][1]) < 1 ? s.w / 2 : 5;
      for (const [x, y] of pts) grow(x, y, r);
      if (s.shape) for (const [x, y] of parse(s.shape)) grow(x, y, 1.5);
    }
    for (const b of fr.badges) if (b.op > 0) grow(b.x, b.y, 11);
  }
  const span = Math.max(x1 - x0, y1 - y0), pad = span * 0.08 + 6;
  let box = { x: x0 - pad, y: y0 - pad, w: x1 - x0 + 2 * pad, h: y1 - y0 + 2 * pad };
  // A minimum span, so a small pose is not blown up past the others.
  const min = 120;
  if (box.w < min) box = { ...box, x: box.x - (min - box.w) / 2, w: min };
  if (box.h < min) box = { ...box, y: box.y - (min - box.h) / 2, h: min };
  const round = (v: number) => Math.round(v * 10) / 10;
  const out = { x: round(box.x), y: round(box.y), w: round(box.w), h: round(box.h) };
  boxCache.set(key, out);
  return out;
}

/**
 * Edge of a filled body part. On the tile and in the player a thin near-black edge separates
 * overlapping parts (near limb over far limb, arm over trunk, head over arms: body v2 re-check). In a
 * thumbnail the edge is the part's own colour instead, which thickens it rather than eating into it.
 */
export function shapeEdge(color: string, heightPx: number): { color: string; px: number } {
  return heightPx <= 64 ? { color, px: 1.75 } : { color: "#0f1114", px: 1.25 };
}

/**
 * Stroke width in SCREEN px for an authored width, given the figure's rendered height in px
 * (strokes are drawn with vector-effect: non-scaling-stroke). Review spec: a limb (authored 8) is
 * 2.75px in a 40px thumbnail, 5px on the 144px tile, 8px in the 300px+ player; the head (22) 7.5 /
 * 14 / 22px. The working limb is drawn a quarter heavier, so it reads by weight as well as hue.
 */
export function strokePx(w: number, heightPx: number, working: boolean): number {
  const k = heightPx <= 40 ? 0.34 : heightPx <= 144 ? 0.34 + ((heightPx - 40) / 104) * 0.29 : Math.min(1, 0.63 + ((heightPx - 144) / 156) * 0.37);
  const px = Math.max(heightPx <= 64 ? 1.25 : 1.5, w * k);
  return Math.round((working && w >= 6 ? px * 1.25 : px) * 100) / 100;
}
