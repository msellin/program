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
  /**
   * A one-frame cut in the cycle (start, end as fractions), e.g. a negative's reset to the top: the figure
   * fades out over ~80 ms before it and back in after, so the cut reads as a cut, not a glitch (physics r1).
   */
  fade?: [number, number];
  /** `t`: ms into the set, for motion that is not a function of p (a hold's balance corrections). 0 when still. */
  build: (sc: Scene, side: FigureSide, p: number, rep?: number, t?: number) => string;
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
  /**
   * Ground marks under the floor line that scroll backward by `scroll` (physics review, 2026-10-29): the
   * camera follows a walking figure, so a planted foot moves back with the ground and sits on one mark for
   * its whole stance. A plain line under a sliding foot read as a moonwalk. `gap` must divide the scroll of
   * one cycle so the loop is seamless.
   */
  ground(scroll: number, gap: number) {
    const off = ((scroll % gap) + gap) % gap;
    this.bg([[-600 - off, 172], [960, 172]], FLOOR, 2);
    this.items[this.items.length - 1].dash = `6 ${gap - 6}`;
  }
}
function tf(scale: number) { return scale === 1 ? "" : "translate(179 160) scale(" + scale + ") translate(-179 -168)"; }
function sideWord(s: string) { return s === "L" ? "left" : s === "R" ? "right" : "both"; }

// Side views face RIGHT or lie with the head LEFT: either way we see her RIGHT side,
// so right limbs are near (drawn in front) and left limbs are far (drawn behind).
export const FIGS: Record<string, Fig> = {
  hipflex: { kind: "hold", sided: true, build(sc, side, q) {
    // Seated on a chair set-up: hip and knee both near 90, trunk upright. The thigh presses UP into the hand
    // and the hand does not give (3 degrees of thigh, none of hand), so the hip never goes past 90 of flexion
    // (FADIR range, trainer review 11). Standard leg 44 + 42 and ARM86 like the other upright figures.
    const work = COL[side], H = [176, 123], S = [176, 65];
    const wAng = lerp(3, 0, q), wK = P(H, 44, wAng), wF = P(wK, 42, wAng + 87);
    const rK = P(H, 44, 4), rF = P(rK, 42, 90);
    const hand = add(lerpP(H, P(H, 44, 0), 0.72), [0, -6]), elbow = ikSide(S, hand, ARM86[0], ARM86[1], -1);
    const workLeg = function () { sc.line([H, wK, wF], work, 8); };
    const restLeg = function () { sc.line([H, rK, rF], side === "R" ? FAR : BODY, 8); };
    sc.box(116, 128, 212, 167);
    if (side === "L") { workLeg(); } else { restLeg(); }
    sc.line([H, S], BODY, TORSO); sc.line([S, [176, 56]], BODY, 8); sc.dot([176, 48], 11, BODY);
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
    // Shoulder, hip and knee end in ONE line (never past it), 20 degrees up. The foot is placed so that line
    // and the floor agree: knee about 82 included at the start and 95 at the top, shin ~25 off vertical
    // (trainer review 11: the foot was too close, knee 56 to 72). The free leg is held bent (short lever):
    // a straight raised leg is a resisted straight-leg-raise hold.
    const S = [120, 158], T = 78, SL = 20.3 * Math.PI / 180, th = lerp(0, 20.3, p) * Math.PI / 180;
    const F = [S[0] + 144 * Math.cos(SL) + 62 * Math.cos(85 * Math.PI / 180 - SL), S[1] - 144 * Math.sin(SL) + 62 * Math.sin(85 * Math.PI / 180 - SL)];
    const H = [S[0] + T * Math.cos(th), S[1] - T * Math.sin(th)], K = ik(H, F, 66, 62, true);
    const thDeg = lerp(0, 20.3, p), FK = P(H, 60, -78 - thDeg * 0.5), FF = P(FK, 52, -78 - thDeg * 0.5 + 90);
    const planted = [H, K, F], free = [H, FK, FF];
    sc.mark("shoulder", S); sc.mark("hip", H); sc.mark("knee", K);
    sc.floor();
    if (side === "R") sc.line(free, FAR, 8);
    sc.line([[122, 162], [S[0] + ARMLY, 166]], BODY, 8);
    sc.line([[98, 154], S], BODY, 8); sc.dot([90, 151], 11, BODY);
    sc.line([S, H], BODY, TORSO);
    if (side === "L") { sc.line(free, BODY, 8); sc.line(planted, COL.L, 8); }   // working limb drawn last
    else sc.line(planted, COL.R, 8);
    sc.badge([F[0] + 20, F[1] - 8], COL[side], side);
    return "Single-leg glute bridge, " + sideWord(side) + " foot planted: hips lift until shoulder, hip and knee form one straight line, the other knee stays bent and lifted";
  } },
  deadbug: { dur: 12000, kind: "move2", k: [0.06, 0.4, 0.52, 0.94], sided: false, build(sc, side, p, rep = 0) {
    // Default is the bent-knee heel tap: the opposite leg lowers with the knee bent (hip ~150, knee ~112 at
    // the lowest point, heel just touching the floor), never the straight low leg, which is a long-lever
    // resisted straight-leg-raise hold on the iliopsoas (trainer review 11; CLAUDE.md). Arms are the
    // anthropometric length (ARMLY) and reach to about 168 of shoulder flexion.
    const S = [128, 157], H = [208, 160], off = [-12, -8], fS = add(S, off), fH = add(H, off);
    const arm = function (o: Pt, q: number) { return [o, P(o, ARMLY, lerp(-90, -168, q))]; };
    const leg = function (o: Pt, q: number) { const a = lerp(-90, -30, q), K = P(o, 62, a); return [o, K, P(K, 58, a + lerp(90, 68, q))]; };
    const nA = arm(S, rep === 0 ? p : 0), fA = arm(fS, rep === 1 ? p : 0), nL = leg(H, rep === 1 ? p : 0), fL = leg(fH, rep === 0 ? p : 0);
    sc.floor();
    sc.line(fA, rep === 1 ? COL.L : FAR, 8); sc.line(fL, rep === 0 ? COL.L : FAR, 8);
    sc.line([S, H], BODY, TORSO);
    sc.line(nA, rep === 0 ? COL.R : BODY, 8); sc.line(nL, rep === 1 ? COL.R : BODY, 8);
    sc.line([[108, 155], S], BODY, 8); sc.dot([98, 153], 11, BODY);   // head in front: the arm passes behind it
    const wa = rep === 0 ? nA : fA, wl = rep === 0 ? fL : nL, as = rep === 0 ? "R" : "L", ls = rep === 0 ? "L" : "R";
    sc.badge(beyond(wa[0], wa[1], 14), COL[as], as); sc.badge(beyond(wl[1], wl[2], 14), COL[ls], ls);
    return "Dead bug: lying on the back, arms up, knees over hips. The " + sideWord(as) + " arm reaches overhead while the " + sideWord(ls) + " heel lowers toward the floor with the knee bent, then return and switch to the other pair";
  } },
  kneel: { dur: 12000, kind: "move", k: [0.05, 0.25, 0.85], sided: true, cues: [{ tuck: "hip" }], build(sc, side, p) {
    // Standard leg 44 + 42. Trunk stays upright (never leans back: that cues lumbar extension). The hip
    // starts over the back knee and travels 8 px (about 10 degrees of rear-hip extension): gentle, never
    // couch-stretch depth. Front shin near vertical, front hip ~95 (trainer review 11: the front leg was
    // 64 + 56 and folded to a 31 degree hip). The back thigh keeps its length (a circle about the knee).
    const work = COL[side], KB = [146, 164], BF = [KB[0] - Math.sqrt(42 * 42 - 4), 166], FF = [200, 166];
    const ext = lerp(0, Math.asin(8 / 44), p), H = [KB[0] + 44 * Math.sin(ext), KB[1] - 44 * Math.cos(ext)], FK = ik(H, FF, 44, 42, true);
    const S = P(H, 56, lerp(-90, -88, p)), head = P(S, 20, -90), hand = add(H, [-3, -9]);
    sc.mark("hip", H); sc.mark("shoulder", S);
    const back = function () { sc.line([BF, KB, H], work, 8); };
    const front = function () { sc.line([H, FK, FF], side === "R" ? FAR : BODY, 8); };
    sc.floor();
    if (side === "R") front();
    sc.line([H, S], BODY, TORSO); sc.line([S, add(S, [0, -8])], BODY, 8); sc.dot(head, 11, BODY);
    sc.line([S, ikSide(S, hand, ARM86[0], ARM86[1], -1), hand], BODY, 8);
    if (side === "L") front();
    back();
    sc.ring(lerpP(KB, H, 0.8), 9, work, 2, p);
    // Pelvic tuck arc behind the hip, drawn heavy so it still reads on the 56x40 tile.
    const tk: Pt[] = []; for (let i = 0; i <= 10; i++) tk.push(P(H, 18, lerp(-150, -250, i / 10)));
    sc.line(tk, ACCENT, 5, 0.9);
    sc.badge(beyond(KB, BF, 16), work, side);
    return "Half-kneeling hip-flexor stretch, " + sideWord(side) + " knee down: tuck the pelvis, squeeze the back glute and shift the hips gently forward, trunk upright, then hold";
  } },
  ninety: { dur: 8000, kind: "move", k: [0.1, 0.4, 0.6], sided: false, build(sc, side, p) {
    // Seen from ABOVE: the knee rotates about the hip-foot axis with fixed 3D limb lengths, so in
    // this view it sweeps across the axis. Range capped at +-38 degrees (the thigh turns about 23 degrees
    // either side of the hip-foot line): a comfortable range, not a full 90/90, and the inward knee never
    // crosses its own hip line (no deep flexion + adduction + internal rotation). Hands are on the floor
    // behind the hips, arms straight (trainer review 11).
    const phi = lerp(-38, 38, p) * Math.PI / 180, L = 58;
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
    sc.line([[160, 66], [150, 91]], BODY, 8); sc.line([[198, 66], [208, 91]], BODY, 8);
    sc.line([[179, 96], [179, 68]], BODY, TORSO); sc.line([[158, 66], [200, 66]], BODY, 8);
    sc.dot([179, 52], 11, BODY);
    sc.line([hL, hR], BODY, 10);
    sc.line(left, COL.B, 8); sc.line(right, COL.B, 8);
    return "90/90 hip switches, seen from above: sitting with feet wide and hands behind, both knees rotate slowly from one side to the other within a comfortable range";
  } },
  hang: { kind: "hold", sided: false, front: true, build(sc, side, q) {
    // Arms straight (ARM80 = 62, elbow ~180) and the shoulder joints fixed. A passive hang lets the shoulders
    // shrug up to the ears: the head sinks 7 into the shoulders and the shoulder line and arm-trunk joint
    // stay joined (physics: the torso used to drift away from the fixed shoulder points).
    const sy = PULL_SY0, shrug = 7 * q, sL = [166, sy], sR = [192, sy];
    sc.line([[179, sy + 2], [179, sy + 58]], BODY, TORSO);
    sc.line([[172, sy + 58], [171, sy + 58 + LEG]], BODY, 8); sc.line([[186, sy + 58], [187, sy + 58 + LEG]], BODY, 8);
    sc.line([sL, sR], BODY, 8);
    sc.line([[PULL_HL, 30], sL], COL.B, 8); sc.line([[PULL_HR, 30], sR], COL.B, 8);
    sc.dot([179, sy - 21 + shrug], 11, BODY);
    sc.bg([[-600, 28], [960, 28]], PROP, 6);   // last: the hands wrap the bar
    return "Passive bar hang: hanging from the bar with straight arms, shoulders relaxed toward the ears, body long and still";
  } },
  pullover: { dur: 9000, kind: "move", k: [0.06, 0.34, 0.56, 0.96], sided: false, scale: 1.15, build(sc, side, p) {
    // Arms travel from vertical (90 of shoulder flexion) to ~170 and stop there: past it the ribs flare. A 2 s
    // hold at the end. Knees about 90 (trainer review 11: they were tight at 74).
    const S = [128, 157], H = [208, 160], F = [293, 166], K = ik(H, F, 62, 58, true);
    const hand = P(S, ARMLY, lerp(-90, -170, p));
    sc.floor();
    sc.line([S, H], BODY, TORSO); sc.line([H, K, F], BODY, 8);
    sc.line([S, hand], COL.B, 8); sc.dot(hand, 8.5, COL.B); sc.dot(hand, 7, WOOD);
    sc.line([[108, 155], S], BODY, 8); sc.dot([98, 153], 11, BODY);
    return "Supine dowel pullover: lying on the back, knees bent, both hands on a dowel; the arms travel slowly overhead toward the floor and hold";
  } },
  roller: { dur: 7000, kind: "move", k: [0.08, 0.4, 0.62], sided: false, scale: 1.15, build(sc, side, p) {
    // The upper back really extends: the segment above the roller turns 22 degrees past the line of the
    // lower back (straight at the start), the head heads toward the floor, hips stay down (trainer review
    // 11: the measured trunk never moved). The upper segment is drawn first so it is the one that is read.
    const C = [136, 133], H = [186, 160], F = [272, 166], K = ik(H, F, 62, 58, true);
    const ang = lerp(-152, -174, p), Sh = P(C, 36, ang), head = P(Sh, 20, ang);
    const hand = add(head, [5, 7]), E = ik(Sh, hand, ARMLY / 2 + 2, ARMLY / 2 - 2, true);   // elbow up, hand cupping the back of the head
    sc.floor();
    sc.dot([136, 151], 19, COL.B); sc.dot([136, 151], 16, PROP);   // outlined so it is not grey on grey
    sc.line([C, Sh], COL.B, TORSO);
    sc.line([C, H], BODY, TORSO); sc.line([H, K, F], BODY, 8);
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
/** Piecewise-linear through [x, y] knots. */
function pwl(x: number, k: number[][]): number {
  for (let i = 1; i < k.length; i++) if (x <= k[i][0]) return lerp(k[i - 1][1], k[i][1], (x - k[i - 1][0]) / (k[i][0] - k[i - 1][0]));
  return k[k.length - 1][1];
}
/** The intersection of circle (c0, r0) and circle (c1, r1) that lies further back (smaller x). */
function circleHit(c0: Pt, r0: number, c1: Pt, r1: number): Pt {
  const dx = c1[0] - c0[0], dy = c1[1] - c0[1], d = Math.hypot(dx, dy) || 1;
  const a = (r0 * r0 - r1 * r1 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, r0 * r0 - a * a));
  const mx = c0[0] + a * dx / d, my = c0[1] + a * dy / d;
  const p1: Pt = [mx + h * dy / d, my - h * dx / d], p2: Pt = [mx - h * dy / d, my + h * dx / d];
  return p1[0] < p2[0] ? p1 : p2;
}
/** A standing foot: heel just behind the ankle, toes in front (the shin ends at the ankle, not the toe). */
const foot = (sc: Scene, F: Pt, color = BODY) => sc.line([[F[0] - 4, 166], [F[0] + 12, 166]], color, 6);

// Upright proportions (2026-10-28 review: legs were 58 on the bar and in handstands, 86 standing):
// leg 80 (41 + 39) under a 56-58 trunk on every bar and handstand figure.
const LEG = 80;
/**
 * Arm lengths from anthropometry (Winter, Biomechanics and Motor Control of Human Movement: shoulder to grip
 * is about 0.78 of hip to ankle). Upright arms had been 52-54 under an 86 leg (0.62), which put a farmer's
 * kettlebells at hip height, bent the sled pusher's elbows and made a mid-shin deadlift unreachable
 * (trainer + physics review, 2026-10-29). Upper arm, then forearm to the grip centre.
 */
const ARM86: [number, number] = [35, 32];   // standing figures, leg 44 + 42
const ARM80: [number, number] = [32, 30];   // bar and handstand figures, leg 80

/** Arm length of a LYING figure (leg 62 + 58 = 120, so 0.78 x 120): the old 70-78 was ~18% short. */
const ARMLY = 94;

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
  const x = 224, W = 6, c = ACCENT;
  const arrow = (y0: number, y1: number) => {
    const d = y1 < y0 ? -1 : 1;
    sc.line([[x, y0], [x, y1 - d * 6]], c, W);
    sc.line([[x - 6, y1 - d * 8], [x, y1 + d * 2], [x + 6, y1 - d * 8], [x - 6, y1 - d * 8]], c, 2, 1, c);
  };
  if (g === "up" || g === "single" || g === "slow") arrow(136, 104);
  if (g === "single") sc.dot([x, 150], 4, c);
  if (g === "slow") for (const y of [114, 122, 130]) sc.line([[x - 6, y], [x + 6, y]], c, 4);
  if (g === "short") arrow(136, 116);
  if (g === "down" || g === "downShort") arrow(90, 146);
  if (g === "down") for (const y of [102, 112, 122]) sc.line([[x - 6, y], [x + 6, y]], c, 4);
  if (g === "downShort") sc.line([[x - 6, 112], [x + 6, 112]], c, 4);
  if (g === "hold" || g === "holdMid") { const y = g === "hold" ? 60 : 92; sc.line([[x - 4, y], [x - 4, y + 16]], c, W); sc.line([[x + 4, y], [x + 4, y + 16]], c, W); }
  if (g === "lift" || g === "liftHold") sc.line([[x - 6, 104], [x, 96], [x + 6, 104]], c, W);
  if (g === "liftHold") { sc.line([[x - 4, 112], [x - 4, 126]], c, W); sc.line([[x + 4, 112], [x + 4, 126]], c, W); }
}

/** Shoulder-joint height at a dead hang: hand (y 30, x 149) to shoulder (x 166) = 62 = ARM80, so the elbow is straight. */
const PULL_SY0 = 89.6;
/** Grip on the bar (x), wide of the shoulders (166/192) so the forearms and elbows flare clear of the head and chest. */
const PULL_HL = 149, PULL_HR = 209;
type PullOpts = {
  kind: Kind; dur?: number; k?: Fig["k"]; poster?: number; fade?: Fig["fade"];
  /** Shoulder height as 0 = dead hang .. 1 = chin over bar, at the pose's start and end. */
  from: number; to: number; band?: number; scap?: boolean; glyph?: Glyph; label: string;
};
function pullFig(o: PullOpts): Fig {
  const cues: Cue[] | undefined = o.to > 0 && o.to < 1 ? [{ angle: ["hand", "elbow", "shoulder"] }] : undefined;
  // Up is the effort, down is controlled; a negative's way out IS the lowering (its reset is a cut).
  const tempo: [Tempo, Tempo] | undefined = o.kind === "move" ? (o.from < o.to ? ["drive", "control"] : ["control", "control"]) : undefined;
  return { kind: o.kind, dur: o.dur, k: o.k, poster: o.poster, fade: o.fade, sided: false, front: true, cues, tempo, build(sc, _side, q) {
    const h = o.kind === "hold" ? o.to : lerp(o.from, o.to, q);
    // Shoulder-joint height by phase (arms ARM80 = 32 + 30, hands on the bar at y 30): straight arms to h = 0.12
    // (the scapular start: the trunk rises, the arms do not bend), elbow ~90 deg at h = 0.35, and at h = 1 the
    // shoulders ~11 under the bar with the elbow ~38 (strict pull-up, trainer 2026-10-29). The head then sits
    // clearly above the bar: chin ~16 px over it.
    // Scapular work: the arms stay straight and full length; the trunk rises 7 away from the
    // shoulder joints, which is what "shoulders away from the ears" looks like.
    const jy = o.scap ? PULL_SY0 : h <= 0.12 ? PULL_SY0 : h <= 0.35 ? lerp(PULL_SY0, 71.2, (h - 0.12) / 0.23) : lerp(71.2, 41, (h - 0.35) / 0.65);
    const lift = o.scap ? lerp(0, 7, h) : lerp(6, 2, clamp01((h - 0.35) / 0.65)) * clamp01(h / 0.12);
    const Sy = jy, top = Sy - lift;
    // Toward the top the shoulder blades draw together (retraction), so the shoulders slide in a little.
    const r = o.scap ? 0 : 2 * h, hL = [PULL_HL, 30], hR = [PULL_HR, 30], sL = [166 + r, Sy], sR = [192 - r, Sy];
    const hip = top + 58;
    // Band (assistance): looped over the bar OUTSIDE the arms and under both knees. It is stretched at the bottom
    // (thinner, straight) and slackens, bowing outward, as the knees rise toward the bar.
    if (o.band) {
      const kn = hip + 44, t = clamp01((kn - 30 - 108) / 50), bow = (1 - t) * 9;
      sc.line([[138, 30], [138 - bow, (30 + kn) / 2], [142, kn + 6], [216, kn + 6], [220 + bow, (30 + kn) / 2], [220, 30]], BAND, o.band * lerp(1, 0.78, t), 1);
    }
    sc.line([[179, top + 2], [179, hip]], BODY, TORSO);
    sc.line([[172, hip], [171, hip + LEG]], BODY, 8); sc.line([[186, hip], [187, hip + LEG]], BODY, 8);
    sc.line([sL, sR], BODY, 8);
    if (o.scap) { sc.line([hL, sL], COL.B, 8); sc.line([hR, sR], COL.B, 8); }
    else {
      sc.line([hL, ikSide(hL, sL, ARM80[0], ARM80[1], -1), sL], COL.B, 8);
      const eR = ikSide(hR, sR, ARM80[0], ARM80[1], 1);
      sc.line([hR, eR, sR], COL.B, 8);
      sc.mark("hand", hR); sc.mark("elbow", eR); sc.mark("shoulder", sR);
    }
    if (o.glyph) glyph(sc, o.glyph);
    // Head in front of the arms, bar in front of everything: chin over the bar has to read. The neck is
    // short until the pull is under way, so mid-range the head stays below the bar line.
    const neck = o.scap ? 28 : lerp(21, 30.5, clamp01((h - 0.4) / 0.6));
    sc.dot([179, top - neck], 11, BODY);
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
  return pullFig({ kind: "move", dur, k: [200 / dur, k1, 0.97, 0.975], fade: [0.97, 0.975], poster: 0.4, from: 1, to: 0, glyph: lowerMs > 6000 ? "down" : "downShort", label });
};

function ringRow(yHand: number, feetUp: boolean, label: string, anchorY = 24, ladder?: string, feetX = 268): Fig {
  // Ring height sets the body angle, and the angle is what tells the three variants apart:
  // flat ~10-26 deg, inclined ~35-50, feet-up level with the box at the bottom.
  return { kind: "move", dur: 6500, k: [0.08, 0.36, 0.46, 0.86], sided: false, ladder, tempo: ["drive", "control"], cues: [{ align: ["foot", "hip", "shoulder"] }], build(sc, _s, p) {
    const F = feetUp ? [feetX, 128] : [feetX, 164], L = 150, hand = [118, yHand];
    // A loaded rope tilts toward the feet (physics: the hands pull the rope toward the body; ~18 deg for a 66 rope).
    const A = [hand[0] + 0.32 * (yHand - anchorY), anchorY];
    // Arms straight at the bottom (shoulder to hand = ARM80 = 62), chest at the rings at the top. The hand to
    // foot distance (<= 170 on every row) is what keeps the top reachable.
    const S = ik(F, hand, L, lerp(ARM80[0] + ARM80[1] - 0.01, 20, p), false);
    const u = [(S[0] - F[0]) / L, (S[1] - F[1]) / L], H = [F[0] + u[0] * 82, F[1] + u[1] * 82];
    sc.mark("foot", F); sc.mark("hip", H); sc.mark("shoulder", S);
    sc.floor();
    if (feetUp) sc.box(246, 128, 292, 167);
    sc.bg([[A[0], -600], A, hand], PROP, 3);
    sc.line([F, H], BODY, 8); sc.line([H, S], BODY, TORSO);
    sc.dot([S[0] + u[0] * 22, S[1] + u[1] * 22], 11, BODY);
    // The elbow travels back along the ribs: of the two elbow positions take the one nearer the feet, so the
    // upper arm points down the body toward them at the top (shoulder angle ~25-45), never overhead.
    const e1 = ik(S, hand, ARM80[0], ARM80[1], true), e2 = ik(S, hand, ARM80[0], ARM80[1], false);
    const toward = (e: Pt) => (e[0] - S[0]) * -u[0] + (e[1] - S[1]) * -u[1];
    sc.line([S, toward(e1) >= toward(e2) ? e1 : e2, hand], COL.B, 8);
    sc.ring(hand, 7, WOOD, 3);
    return label;
  } };
}

type HsOpts = { lean: number; kind: Kind; tuck?: boolean; wall?: boolean; act?: "shrug" | "taps"; ladder?: string; label: string };
function handstand(o: HsOpts): Fig {
  const moving = o.kind === "move";
  const taps = o.act === "taps";
  const cues: Cue[] | undefined = o.tuck ? undefined : [{ align: ["hand", "shoulder", "hip", "foot"] }];
  // Trainer lane (2026-10-29): shrug 1 s up / 0.5 s hold / 1.5 s down; a tap and its return ~1 s each and
  // the two arms alternate (`move2`); the tuck holds ~1 s. Arms are ARM80 and stay locked everywhere.
  const k: Fig["k"] = o.act === "shrug" ? [0.05, 0.3, 0.425, 0.8] : taps ? [0.08, 0.33, 0.45, 0.78] : [0.1, 0.4, 0.6, 0.9];
  return { kind: taps ? "move2" : o.kind, dur: moving ? (o.act === "shrug" ? 4000 : taps ? 8000 : 6000) : undefined, k, sided: false, ladder: o.ladder, cues,
    tempo: o.act === "shrug" ? ["drive", "control"] : taps ? ["control", "control"] : undefined, build(sc, _s, p, rep = 0, t = 0) {
    const arm = ARM80[0] + ARM80[1];
    // Free tuck: the knees come in ahead of the chest, so the whole line leans back 4 degrees to keep the
    // hips over the hands. Taps: the shoulders press forward over the support hand before the other lifts.
    // Balance corrections from the clock (r2): a wall hold rocks a fraction of a degree as the toes press (3.2 s);
    // a free handstand adds a second, smaller harmonic three times per cycle so the sway is not one sine.
    const wob = t > 0 ? (o.wall && !o.act ? 0.5 * Math.sin((2 * Math.PI * t) / 3200) : o.kind === "move" && !o.wall && !o.tuck ? 0.75 * Math.sin((2 * Math.PI * 3 * (t % 6000)) / 6000) : 0) : 0;
    const lean = o.lean + wob + (o.wall || o.act ? 0 : o.tuck ? lerp(0, -4, p) : lerp(0, 3, p)) + (taps ? 3 * Math.min(1, p / 0.4) : 0), a = -90 + lean;
    const hand: Pt = [180, 168];
    // Shrug: arms stay full length and the trunk rises 13 (21% of the arm, drawn large so it reads at 144 px) out of the shoulders: the shoulders push the floor away.
    const S = P(hand, arm, a), rise = o.act === "shrug" ? lerp(0, 13, p) : 0, T = P(S, rise, a), H = P(T, 56, a);
    sc.floor();
    if (o.tuck) {
      // Knees close first and fast (knee < 60 while the hip is still > 150: a tuck in transit, never a pike), then the hips fold (hip 180 -> 65): thighs end 25 deg below
      // level toward the chest, shins about 30 deg from vertical, heels by the seat.
      const kp = ease(clamp01(p / 0.4)), hp = ease(clamp01((p - 0.3) / 0.7));
      const th = a + lerp(0, 115, hp), K = P(H, 41, th);
      sc.mark("hip", H);
      sc.line([H, K, P(K, 39, th - lerp(0, 145, kp))], COL.B, 8);
    } else {
      const F = P(H, LEG, a);
      sc.mark("hand", hand); sc.mark("shoulder", S); sc.mark("hip", H); sc.mark("foot", F);
      if (o.wall) sc.bg([[F[0] + 5, 168], [F[0] + 5, -600]], PROP, 4);
      sc.line([H, F], BODY, 8);
    }
    if (rise > 0.5) sc.line([S, T], COL.B, 8);
    sc.line([T, H], BODY, TORSO);
    // Shrug: the head sinks between the ears as the shoulders rise.
    sc.dot(P(T, o.act === "shrug" ? lerp(18, 11, p) : 18, a + 155), 10, BODY);
    if (taps) {
      // The support arm is locked throughout; the other hand leaves the floor and taps the opposite
      // shoulder (elbow 180 -> ~25), rep 0 with the near arm, rep 1 with the far one.
      const tap = lerpP(hand, P(S, 12, a + 90), p);
      const work: Pt[] = [S, ikSide(S, tap, ARM80[0], ARM80[1], 1), tap], support: Pt[] = [hand, S];
      if (rep === 0) { sc.line(support, FAR, 8); sc.line([[hand[0] - 3, 167], [hand[0] + 13, 167]], FAR, 4); sc.line(work, COL.B, 8); }
      else { sc.line(work, COL.B, 8); sc.line(support, BODY, 8); sc.line([[hand[0] - 3, 167], [hand[0] + 13, 167]], BODY, 4); }
    } else {
      sc.line([hand, S], COL.B, 8);
      // Freestanding: the fingertips press a hair at the end of the sway (the visible correction).
      const press = o.wall || o.act || o.tuck ? 0 : 1.2 * p;
      sc.line([[hand[0] - 3, 167 - press], [hand[0] + 13, 167]], BODY, 4);
    }
    return o.label;
  } };
}

function wristFig(fingers: boolean, label: string): Fig {
  // Wrist prep: shoulders travel ~11 px (about 10 deg of arm) past the wrists and the hips follow, the
  // trunk keeps its angle. Finger raises: 1 s up, 1 s hold, ~1.5 s down, fingers 40 deg off the floor.
  return { kind: "move", dur: fingers ? 4000 : 6000, k: fingers ? [0.05, 0.3, 0.55, 0.92] : [0.08, 0.4, 0.62, 0.94], sided: false, build(sc, _s, p) {
    const hand: Pt = [208, 166], arm = ARM80[0] + ARM80[1], a = fingers ? 0 : lerp(0, 10, p), S = P(hand, arm, -90 + a);
    const K: Pt = [152, 160], H = ik(K, S, 41, 56, true);
    sc.floor();
    sc.line([[K[0] - 39, 166], K, H], BODY, 8);
    sc.line([H, S], BODY, TORSO);
    sc.dot(add(S, [16, -8]), 11, BODY);
    sc.line([hand, S], COL.B, 8);
    if (fingers) {
      const base: Pt = [hand[0] + 2, 167];
      sc.line([[hand[0] - 14, 167], base, P(base, 14, -lerp(0, 40, p))], BODY, 4);
    } else sc.line([[hand[0] - 14, 167], [hand[0] + 14, 167]], BODY, 4);
    if (!fingers) sc.ring(hand, 9, COL.B, 2, p);
    return label;
  } };
}

/**
 * Palms-up wrist push-up (coach 33, r2): kneeling, the forearm turned over so the BACKS of the hands are on the
 * floor, fingers pointing back toward the knees. The body stays still; the wrist extends from 0 to 65 deg
 * (the hand pivots up about the wrist, palm facing up, marked with a short tick) over 3 s and returns in 1 s.
 */
function wristBackFig(): Fig {
  return { kind: "move", dur: 4500, k: [0.02, 0.69, 0.71, 0.93], sided: false, build(sc, _s, p) {
    const hand: Pt = [208, 166], arm = ARM80[0] + ARM80[1], S = P(hand, arm, -90), K: Pt = [152, 160], H = ik(K, S, 41, 56, true);
    sc.floor();
    sc.line([[K[0] - 39, 166], K, H], BODY, 8);
    sc.line([H, S], BODY, TORSO);
    sc.dot(add(S, [16, -8]), 11, BODY);
    sc.line([hand, S], COL.B, 8);
    const tip = P(hand, 16, 180 + lerp(0, 65, p));
    sc.line([hand, tip], BODY, 4);
    // Palm side: a short tick on the face of the hand that points up (away from the floor).
    sc.line([lerpP(hand, tip, 0.45), P(lerpP(hand, tip, 0.45), 5, 90 + lerp(0, 65, p))], ACCENT, 3);
    return "Wrist push-ups, palms up: kneeling with the backs of the hands flat on the floor, fingers pointing toward the knees; press slowly onto the knuckles for three seconds, then ease back in one";
  } };
}

function adductorFig(extended: boolean, label: string): Fig {
  return { kind: "hold", sided: false, scale: 1.15, build(sc, _s, q) {
    // Both knees drawn (the far one a step behind), the ball squeezed between them: a filled disc that sits
    // in front of the far leg and behind the near one, and compresses as the knees press in. The foot
    // sits where the knee angle puts it (about 92 included, or 122 for the longer lever); the hip angle
    // follows from feet on the floor (trainer review 11: heel almost at the buttock, knee 66).
    const S = [118, 158], H = [196, 160], kn = (extended ? 122 : 92) * Math.PI / 180;
    const d = Math.sqrt(66 * 66 + 62 * 62 - 2 * 66 * 62 * Math.cos(kn)), F = [H[0] + Math.sqrt(d * d - 36), 166], K = ik(H, F, 66, 62, true);
    const off = [lerp(-12, -9, q), -3];
    sc.floor();
    sc.line([add(H, off), add(K, off), add(F, off)], FAR, 8);
    const ball: Pt[] = []; const r = lerp(14, 11, q), c = add(K, [off[0] / 2, off[1] / 2]);
    for (let i = 0; i <= 24; i++) ball.push(P(c, r, i * 15));
    sc.line(ball, BODY, 3.5, 1, PROP);   // light rim on a mid-grey disc: legible at the 56x40 tile
    sc.line([S, [S[0] + ARMLY, 166]], BODY, 8);
    sc.line([S, H], BODY, TORSO); sc.line([[98, 154], S], BODY, 8); sc.dot([90, 151], 11, BODY);
    sc.line([H, K, F], COL.B, 8);
    return label;
  } };
}

function hollowFig(pull: boolean, label: string): Fig {
  const k: [number, number, number, number] = pull ? [0.04, 0.37, 0.45, 0.78] : [0.1, 0.42, 0.55, 0.9];
  return { kind: pull ? "move" : "hold", dur: pull ? 9000 : undefined, k, sided: false, scale: 1.15, build(sc, _s, q) {
    const a = pull ? 14 : lerp(0, 14, q), H = [190, 158];
    const S = P(H, 80, 180 + a), foot = P(H, 120, -a);
    // Pullover: the body holds the hollow while the arms travel in ONE arc, 90 -> 175 of shoulder flexion
    // (measured from the trunk), 3 s out and 3 s back: from vertical over the chest to overhead in line
    // with the trunk, never sweeping through the torso (trainer review 11). The hold keeps them overhead.
    const hand = P(S, ARMLY, a - (pull ? lerp(90, 175, q) : 172));
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
  pullup_single: pullUp(7000, [0.02, 0.2, 0.26, 0.6], "Single pull-up: one crisp rep with the chin over the bar, lower under control, then hang and rest", { glyph: "single" }),
  pullup_slow: pullUp(9000, [0.02, 0.35, 0.46, 0.9], "Slow tempo pull-up: pull up smoothly until the chin clears the bar, pause, then lower slowly, arms fully straight at the bottom", { glyph: "slow" }),
  pullup_band: pullUp(5500, [0.02, 0.27, 0.36, 0.82], "Band-assisted pull-up: a band looped under the knees takes part of the load while you pull the chin over the bar and lower under control", { band: 9 }),
  pullup_band_light: pullUp(5500, [0.02, 0.27, 0.36, 0.82], "Light band-assisted pull-up: a thinner band under the knees takes a little of the load while you pull the chin over the bar and lower under control", { band: 4 }),
  pullup_partial: pullUp(4600, [0.02, 0.26, 0.34, 0.8], "Partial-range pull-up: pull from straight arms to about halfway, elbows at a right angle, then lower under control", { to: 0.35, glyph: "short" }),
  pullup_negative: negative(10000, "Negative pull-up, 10 seconds: start with the chin over the bar and lower as slowly as you can all the way to straight arms; step back up to the top"),
  pullup_negative5: negative(5000, "Negative pull-up, 5 seconds: start with the chin over the bar and lower slowly all the way to straight arms; step back up to the top"),
  pullup_top: pullFig({ kind: "hold", from: 1, to: 1, glyph: "hold", label: "Top hold: chin over the bar, shoulder blades pulled down and back, body still" }),
  pullup_mid: pullFig({ kind: "hold", from: 0.35, to: 0.35, glyph: "holdMid", label: "Mid-range hold: elbows at a right angle, shoulders pulled down, body still" }),
  scappull: pullFig({ kind: "move", dur: 4500, k: [0.02, 0.24, 0.46, 0.9], from: 0, to: 1, scap: true, glyph: "lift", label: "Scapular pull-up: hanging with straight arms, pull the shoulder blades down so the body rises a few centimetres, then relax back" }),
  activehang: pullFig({ kind: "hold", from: 1, to: 1, scap: true, glyph: "liftHold", label: "Active hang: straight arms, shoulder blades pulled down and away from the ears, body long and still" }),
  rowflat: ringRow(90, false, "Ring row, body horizontal: hanging under the rings with straight arms, pull the chest to the rings keeping the body in one line, then lower", 24, "rowfeet"),
  rowincline: ringRow(42, false, "Ring row, inclined: the body leans back at a steep angle under high rings; pull the chest to the rings keeping the body straight, then lower", -26, "rowflat", 228),
  rowfeet: ringRow(80, true, "Ring row, feet elevated: feet on a box, body level under the rings; pull the chest to the rings, then lower"),
  pullapart: { kind: "move", dur: 5000, k: [0.1, 0.45, 0.6], sided: false, front: true, tempo: ["drive", "control"], build(sc, _s, p) {
    // Front view: the arms start level and forward (hands ~shoulder width apart, foreshortened) and sweep out to
    // 90 deg of abduction, so the drawn arm lengthens from ~2 to its full ARM86 = 67 (foreshortening, not
    // stretch). The blades squeeze: the shoulders slide in 3 each side.
    const a = lerp(2, 90, p) * Math.PI / 180, sq = 3 * p, sL = [166 + sq, 78], sR = [192 - sq, 78], r = (ARM86[0] + ARM86[1]) * Math.sin(a);
    const hL = [sL[0] - r, 80], hR = [sR[0] + r, 80];
    sc.floor();
    sc.line([[179, 82], [179, 128]], BODY, TORSO);
    sc.line([[175, 128], [174, 166]], BODY, 8); sc.line([[183, 128], [184, 166]], BODY, 8);
    sc.dot([179, 62], 11, BODY);
    sc.line([sL, sR], BODY, 8);
    sc.line([hL, sL], COL.B, 8); sc.line([sR, hR], COL.B, 8);
    // A loaded band is a straight line between the hands, thinner as it stretches; only near the start (< 30 deg)
    // is it slack, with a small sag.
    const sag = Math.max(0, (30 - lerp(2, 90, p)) / 28) * 5;
    sc.line([hL, [(hL[0] + hR[0]) / 2, 80 + sag], hR], BAND, lerp(4, 2.5, p));
    return "Band pull-apart: standing with a band held in front at shoulder height; the arms sweep out to the sides, the shoulder blades squeeze together, then return";
  } },
  hollow: hollowFig(false, "Hollow body hold: lying on the back, lower back pressed into the floor, arms overhead, shoulders and straight legs lifted off the floor"),
  hollowpull: hollowFig(true, "Hollow body pullover: holding the hollow, lower back pressed down, the arms travel slowly from over the chest to overhead and back"),
  wristprep: wristFig(false, "Wrist prep on hands and knees: hands flat on the floor, fingers forward; the shoulders rock slowly forward over the hands, then back"),
  fingerraise: wristFig(true, "Finger raises: on hands and knees with the hands flat, lift the fingers off the floor while the palm stays down, then set them back"),
  wristback: wristBackFig(),
  downdog: { kind: "hold", sided: false, build(sc, _s, q) {
    // Arms and trunk are one straight line (shoulder ~180) rising 40 deg to the hips; the legs are the library's 80
    // (the old 119 was a 40% longer limb) and steep, heels reaching down, head hanging between the arms.
    const arm = ARM80[0] + ARM80[1], hand: Pt = [120, 166], up = 40 * Math.PI / 180;
    const hip: Pt = [hand[0] + (arm + 56) * Math.cos(up), hand[1] - (arm + 56) * Math.sin(up)];
    const foot: Pt = [hip[0] + Math.sqrt(LEG * LEG - (166 - hip[1]) ** 2), 166], S = lerpP(hand, hip, arm / (arm + 56));
    sc.floor();
    sc.line([hip, foot], BODY, 8);
    sc.line([S, hip], BODY, TORSO);
    sc.dot(add(S, [2, 19]), 10, BODY);
    sc.line([hand, S], COL.B, 8);
    sc.ring(hand, 9, COL.B, 2, q);
    return "Downward dog: hands and feet on the floor, hips high in an upside-down V, arms straight; breathe and let the wrists settle";
  } },
  child: { kind: "hold", sided: false, build(sc, _s, q) {
    // Hips to the heels, chest low, arms (62) reaching forward, forehead resting on the floor between and ahead of the arms.
    const K = [210, 164], F = [268, 166], H = [258, 142], S = [186, 150], hand = P(S, ARM80[0] + ARM80[1], 164);
    sc.floor();
    sc.line([F, K, H], BODY, 8);
    sc.line([H, S], BODY, TORSO);
    sc.dot([164, 158], 10, BODY);
    sc.line([S, hand], COL.B, 8);
    sc.ring(hand, 8, COL.B, 2, q);
    return "Child's pose: kneeling, hips back toward the heels, chest low and arms stretched forward on the floor; breathe slowly";
  } },
  wallhs: handstand({ lean: 6, kind: "hold", wall: true, label: "Wall handstand, chest to the wall: hands a little off the wall, arms straight, body in one line with the chest facing the wall" }),
  wallhs_90: handstand({ lean: 27, kind: "hold", wall: true, ladder: "wallhs", label: "Incline hold, first step: hands a step further from the wall than the chest-to-wall hold, one straight line from hands to feet, arms straight and shoulders open" }),
  wallhs_lean: handstand({ lean: 45, kind: "hold", wall: true, ladder: "wallhs_90", label: "Incline hold, steeper step: hands about a metre from the wall, one straight line from hands to feet leaning at an angle, arms straight and shoulders open" }),
  wallhs_shrug: handstand({ lean: 6, kind: "move", wall: true, act: "shrug", label: "Wall handstand shrugs: arms locked, push the floor away so the shoulders rise to the ears, then sink back a little" }),
  wallhs_taps: handstand({ lean: 6, kind: "move", wall: true, act: "taps", label: "Wall handstand shoulder taps: chest to the wall, shift onto one arm and tap the opposite shoulder, then switch" }),
  hsfree: handstand({ lean: 0, kind: "move", label: "Freestanding handstand: hands shoulder-width on the floor, arms straight, body stacked over the hands, small balance corrections through the fingers" }),
  hstuck: handstand({ lean: 0, kind: "move", tuck: true, label: "Tuck handstand: arms straight, knees drawn in toward the chest, hips stacked over the hands" }),
  hswalk: { kind: "gait", dur: 3600, k: [0, 1, 1], poster: 0.8, sided: false, scale: 0.95, build(sc, _s, p) {
    // One hand steps (24 px, ~25 cm) while the other stays planted; then they swap. The body holds its place
    // and the planted hand moves back under it, as on a treadmill, so the loop never jumps. The line leans
    // 1 -> 6 deg toward the step as a hand leaves the floor (weight shift) and returns after; the legs scissor
    // a little to counterbalance; arms stay straight and shoulders open (trainer lane, 2026-10-29).
    const arm = ARM80[0] + ARM80[1], STEP = 24;
    const hand = (q: number): Pt => {
      const st = stride(q, 0.55);
      return st.stance ? [lerp(180 + STEP / 2, 180 - STEP / 2, st.u), 168] : [lerp(180 - STEP / 2, 180 + STEP / 2, swingPos(st.u, 0.55)), 168 - Math.sin(st.u * Math.PI) * 5];
    };
    const near = hand(p), far = hand(p + 0.5);
    const lean = 2 + 1 * Math.cos(4 * Math.PI * (p - 0.275)), a = -90 + lean;
    const sx = 180 + 2 * Math.cos(2 * Math.PI * (p - 0.25));
    // Shoulder height: the arm of the hand that is on the floor is straight (the one further from under the shoulder fixes it).
    const planted = [near, far].filter((h) => h[1] > 167.9), dx = Math.max(...planted.map((h) => Math.abs(h[0] - sx)));
    const S: Pt = [sx, 168 - Math.sqrt(arm * arm - dx * dx)];
    // Weight shift: the hips drift 3 px toward the step as the lean peaks (r2 animator), the legs scissor ~12 deg.
    const H = add(P(S, 56, a), [1.5 + 1.5 * Math.cos(4 * Math.PI * (p - 0.275)), 0]);
    const split = 12 * Math.sin(2 * Math.PI * p);
    // A walking hand leaves the floor with a locked elbow: the arm hangs from the shoulder, which lifts up to
    // 7 px on the free side (shoulder-girdle elevation), so the elbow never closes past ~165 (r2 trainer).
    const armOf = (h: Pt): Pt[] => {
      const ddx = h[0] - S[0], need = Math.sqrt(Math.max(0, 61.8 * 61.8 - ddx * ddx)) - (h[1] - S[1]);
      const So: Pt = [S[0], S[1] - clamp01(need / 7) * 7];
      return [So, ikSide(So, h, ARM80[0], ARM80[1], 1), h];
    };
    sc.floor();
    sc.ground(p * STEP / 0.55, STEP / 1.1);
    sc.line(armOf(far), FAR, 8);
    sc.line([H, P(H, LEG, a - split)], FAR, 8);
    sc.line([H, P(H, LEG, a + split)], BODY, 8); sc.line([S, H], BODY, TORSO);
    sc.dot(P(S, 18, a + 155), 10, BODY);
    sc.line(armOf(near), COL.B, 8);
    return "Handstand walking: from a balanced handstand, shift the weight over one hand and take a small step forward with the other, then the other hand follows";
  } },
  kickup: { kind: "gait", dur: 4500, k: [0, 1, 1], poster: 0.45, sided: false, scale: 0.95, build(sc, _s, p) {
    // Lunge start (front knee ~130, swing leg low behind), then a quick drive of the swing leg (~0.5 s) with
    // the push leg leaving the floor bent a beat later and joining over the hands; the stack is held ~1.3 s;
    // the way down is a step-down with the legs together, the push leg landing first as the front foot.
    // A gait cycle so the way down can differ from the way up (a `move` retraces its path).
    // r2: front knee ~112 (was 129) with the hands 6 px further forward, so the hips start lower and the body
    // reads as a real lunge; the push foot sits under the hip; a 6 px countdown dip precedes the kick.
    const arm = ARM80[0] + ARM80[1], hand: Pt = [196, 168];
    const S0 = P(hand, arm, -110), S1 = P(hand, arm, -90), F: Pt = [120, 166];
    const kd = Math.sqrt(41 * 41 + 39 * 39 - 2 * 41 * 39 * Math.cos(112 * Math.PI / 180)), H0 = circleHit(F, kd, S0, 56);
    const D = Math.PI / 180, ph0 = Math.atan2(H0[1] - S0[1], H0[0] - S0[0]) / D + 360;   // hips behind and a little above the shoulders
    const kick = (x: number) => clamp01(x), r = (x: number) => ease(clamp01(x));
    let g: number, back = 0;
    if (p < 0.05) g = 0;
    else if (p < 0.17) g = TEMPO.drive(kick((p - 0.05) / 0.12));
    else if (p < 0.47) g = 1;
    else if (p < 0.93) { back = TEMPO.control(kick((p - 0.47) / 0.46)); g = 1 - back; }
    else g = 0;
    const dip = p < 0.05 ? 6.3 * Math.sin((Math.PI / 2) * (p / 0.05)) : p < 0.09 ? 6.3 * (1 - ease((p - 0.05) / 0.04)) : 0;
    const S = lerpP(S0, S1, g), phi = (lerp(ph0, 270, g) - dip) * D, H: Pt = [S[0] + 56 * Math.cos(phi), S[1] + 56 * Math.sin(phi)];
    const swing = P(H, LEG, lerp(155, 268, g));
    // Push foot: planted until the hip is a leg's length away, then it follows the hip up (or, coming down, lands last).
    const dF = Math.hypot(H[0] - F[0], H[1] - F[1]);
    let push: Pt;
    if (back > 0) {
      const together = P(H, 79, lerp(155, 268, g) - 6 * (1 - g)), w = r((back - 0.7) / 0.3);
      push = lerpP(together, F, w);
    } else if (dF <= 78.5) push = F;
    else {
      // r2: how far the push leg has travelled from the floor to the stack; reuse the swing leg's progress after the foot leaves.
      let gL = 0; for (let i = 0; i <= 100; i++) { const gg = i / 100, SS = lerpP(S0, S1, gg), ff = lerp(ph0, 270, gg) * D; if (Math.hypot(SS[0] + 56 * Math.cos(ff) - F[0], SS[1] + 56 * Math.sin(ff) - F[1]) > 78.5) { gL = gg; break; } }
      const r2 = clamp01((g - gL) / (1 - gL)), SL = lerpP(S0, S1, gL), fl = lerp(ph0, 270, gL) * D, HL: Pt = [SL[0] + 56 * Math.cos(fl), SL[1] + 56 * Math.sin(fl)];
      const dirL = Math.atan2(F[1] - HL[1], F[0] - HL[0]) / D, dir = lerp(dirL, 268, ease(r2));
      push = P(H, 79 - 16 * Math.sin(Math.PI * r2), dir);
    }
    sc.floor();
    sc.line([H, ikSide(H, push, 41, 39, 1), push], FAR, 8);
    sc.line([S, H], BODY, TORSO);
    sc.line([H, swing], COL.B, 8);
    sc.dot(P(S, 18, phi / D - 180 + lerp(5, -25, g)), 10, BODY);
    sc.line([hand, S], BODY, 8);
    return "Kick-up: hands on the floor, one leg swings up straight and over the hips and the other follows, finishing stacked over the hands";
  } },
  wallwalk: { kind: "move", dur: 9000, k: [0.08, 0.6, 0.72], poster: 0.8, sided: false, scale: 0.85, build(sc, _s, p) {
    // Starts as a plank with the feet 12 px (~15 cm) up the wall (the arms are 62 high, so a floor-level plank
    // would need a trunk of 64; this one is ~70). Then six steps; in each ONE pair moves while the other stays
    // planted: the feet climb with the hands fixed (the hips pike up), then the hands walk in (the body
    // straightens), or hands first when the feet would otherwise have to stretch past the body length.
    const arm = ARM80[0] + ARM80[1], L = 56 + LEG, N = 6, sy = 168 - arm, fy0 = 154, fyN = sy - Math.sqrt(L * L - 46 * 46);
    const fyAt = (i: number) => lerp(fy0, fyN, i / N), hxAt = (i: number) => 300 - Math.sqrt(Math.max(1, L * L - (sy - fyAt(i)) ** 2));
    const i = p >= 1 ? N - 1 : Math.min(N - 1, Math.floor(p * N)), x = p >= 1 ? 1 : p * N - i;
    const feetFirst = Math.abs(sy - fyAt(i + 1)) <= Math.abs(sy - fyAt(i));
    const m1 = ease(clamp01(x / 0.3)), m2 = ease(clamp01((x - 0.45) / 0.3));
    const fm = feetFirst ? m1 : m2, hm = feetFirst ? m2 : m1;
    const fy = lerp(fyAt(i), fyAt(i + 1), fm), hx = lerp(hxAt(i), hxAt(i + 1), hm), S: Pt = [hx, sy], F: Pt = [300, fy];
    // The hip: the point 56 from the shoulder and 80 from the foot that sits above the line between them.
    const H: Pt = ik(F, S, LEG, 56, true).slice() as Pt;
    const hu = Math.hypot(H[0] - S[0], H[1] - S[1]) || 1, u = [(H[0] - S[0]) / hu, (H[1] - S[1]) / hu];
    sc.floor();
    sc.bg([[306, 168], [306, -600]], PROP, 4);
    sc.line([H, F], BODY, 8); sc.line([S, H], BODY, TORSO);
    sc.dot([S[0] - u[0] * 20 + 6, S[1] - u[1] * 20 + 8], 10, BODY);
    sc.line([[hx, 168], S], COL.B, 8);
    return "Wall walk: start in a plank with the feet just up the wall; walk the feet up the wall while the hands walk in toward it, as far as you can hold with a tight body";
  } },
  squat: { kind: "move", dur: 5500, k: [0.05, 0.4, 0.5, 0.8], poster: 0.9, sided: false, tempo: ["control", "drive"], cues: [{ level: "knee", span: ["hip", "knee"], limit: true }, { plumb: "midfoot", to: "bar" }], build(sc, _s, p) { return squatPose(sc, p, 37, "back", 133, 127); } },
  frontsquat: { kind: "move", dur: 5500, k: [0.05, 0.4, 0.5, 0.8], poster: 0.9, sided: false, tempo: ["control", "drive"], cues: [{ level: "knee", span: ["hip", "knee"], limit: true }], build(sc, _s, p) { return squatPose(sc, p, 22, "front", 135, 127); } },
  deadlift: { kind: "move", dur: 5200, k: [0.05, 0.33, 0.43, 0.82], poster: 0, sided: false, tempo: ["drive", "control"], cues: [{ plumb: "midfoot", to: "bar" }], build(sc, _s, p) {
    // Round 2: the exercise is a block pull "mid-shin, ~10-15 cm elevated": the plate sits on 14 px blocks, bar
    // centre 32 px up, which solves to hip ~70, knee ~115, trunk ~55, shin 10 (floor height gave 52/97/59/14).
    // Earlier note: floor-height setup (trainer + physics review, 2026-10-29): the bar started 18 px up (a plate on the floor,
    // about mid-shin), the arms are ARM86 long and vertical, so the bar x never moves. With the arms that long a
    // mid-shin pull solves to hip ~53, knee ~97, trunk ~58, shin ~14; the trainer's knee 110-130 is for a higher
    // bar and is not reachable here. The knee is driven, not left to the hips: the shin stands up to ~5 deg while
    // the bar rises past it, so the knee travels back and clears the bar by 10+ px (it used to pass through it).
    // Trunk angle is the result, and holds ~55-59 until the bar is past the knees; then the hips drive through.
    const BX = 172 + 17, arm = ARM86[0] + ARM86[1];
    const F = [172, 166], S0 = [BX, lerp(134, 92.5, p) - arm];
    const shin = pwl(p, [[0, 10], [0.3, 6], [0.5, 5], [0.75, 7], [1, 9.4]]);
    const K0 = [F[0] + 42 * Math.sin(shin * Math.PI / 180), 166 - 42 * Math.cos(shin * Math.PI / 180)];
    const H0 = circleHit(K0, 44, S0, 56), w = ease(clamp01((p - 0.8) / 0.2));
    const H = lerpP(H0, [F[0] + 14.2, 166 - 84.79], w);
    const ud = Math.hypot(S0[0] - H[0], S0[1] - H[1]) || 1;
    const S = [H[0] + 56 * (S0[0] - H[0]) / ud, H[1] + 56 * (S0[1] - H[1]) / ud], lean = Math.atan2(S[0] - H[0], H[1] - S[1]);
    const B = [S[0], S[1] + arm], K = ikSide(H, F, 44, 42, 1);
    sc.mark("midfoot", [BX, 166]); sc.mark("bar", B);
    sc.floor();
    // The blocks and the plate sit behind the legs (far plane): the plate used to be drawn over the knee.
    sc.box(BX - 22, 152, BX + 22, 167);
    sc.plate(B, 18);
    sc.line([[F[0] - 6, 166], [F[0] + 28, 166]], BODY, 6);
    sc.line([F, K, H], BODY, 8);
    sc.line([H, S], BODY, TORSO);
    sc.dot([S[0] + 14 * Math.sin(lean) + 8, S[1] - 14 * Math.cos(lean)], 11, BODY);
    sc.line([S, B], COL.B, 8);
    return "Block pull: bar at mid-shin on low blocks, hips back, flat back and straight arms; push the floor away and stand tall with the bar close to the legs, then lower it back to the blocks";
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
 * Front view for the carries: `frontBody` with the feet at hip width (16 px apart; the shared body stands 30
 * apart, a wide stance for a walk) and the whole upper body moved by `shift` over them.
 */
function carryBody(sc: Scene, lift: [number, number], shift: Pt) {
  const o = (q: Pt) => add(q, shift);
  const hR = o([170, 88]), hL = o([188, 88]);
  const fR = [171, 166 - lift[0]], fL = [187, 166 - lift[1]];
  sc.floor();
  sc.line([hR, ikSide(hR, fR, 40, 40, -1), fR], BODY, 8);
  sc.line([hL, ikSide(hL, fL, 40, 40, 1), fL], BODY, 8);
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
/** A loaded carry breathes: the ribcage rises about 1 px on a 4 s cycle (trainer r1: the label says controlled breathing). */
const breathe = (t: number) => -0.9 * Math.sin((2 * Math.PI * t) / 4000);
/** Front-view carry: foot lifts, and the trunk shifting over the standing foot and rising a little on it. */
function carryGait(phi: number): { lift: [number, number]; shift: Pt } {
  const lift = (q: number) => { const st = stride(q); return st.stance ? 0 : Math.sin(st.u * Math.PI) * 6; };   // carries keep the feet low (S&C r1: 9 px read as marching)
  // Right foot swings around phi 0.8, left around 0.3: the weight is over the other foot then.
  const dx = 2.5 * Math.cos(2 * Math.PI * (phi - 0.8)), dy = -1.2 * Math.cos(4 * Math.PI * (phi - 0.8));
  return { lift: [lift(phi), lift(phi + 0.5)], shift: [dx, dy] };
}

const HIP_FIGS: Record<string, Fig> = {
  bridge2: { dur: 4500, kind: "move", k: [0.08, 0.36, 0.6], sided: false, tempo: ["drive", "control"], scale: 1.15, cues: [{ align: ["shoulder", "hip", "knee"] }], build(sc, _s, p) {
    const S = [120, 158], T = 78, F = [270, 164], th = lerp(0, 22.2, p) * Math.PI / 180;
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
    // Trainer review: the shin should change little because the feet are planted. The top is fixed (knee 90,
    // shin vertical); at the bottom the shoulder slides 7 px down the bench and the trunk is 32 deg (was 40), so
    // the shin is ~18 deg (was 32). Knee 100-110 at the bottom is not reachable with the feet fixed: the hips
    // are nearer the feet at the bottom than at the top, so the knee closes, it cannot open.
    const S = [lerp(125, 118, p), 106], F = [268, 167], th = lerp(32, 0, p);
    const H = P(S, 78, th), K = ik(H, F, 66, 62, true);
    sc.mark("shoulder", S); sc.mark("hip", H); sc.mark("knee", K);
    sc.floor();
    sc.box(58, 114, 132, 167);
    sc.line([add(H, [-6, 0]), ik(add(H, [-6, 0]), add(F, [-6, 0]), 66, 62, true), add(F, [-6, 0])], FAR, 8);
    sc.line([S, [S[0] - 34, 110]], BODY, 8);
    sc.line([S, H], BODY, TORSO);
    sc.dot(P(S, 26, -150 + th), 11, BODY);
    sc.line([H, K, F], COL.B, 8);
    const bar = add(H, [0, -16]);
    sc.plate(bar, 12);
    return "Barbell hip thrust: upper back on a bench, bar across the hips, feet flat; chin tucked and ribs down, drive the hips up until the thighs and trunk are level, then lower";
  } },
  splitsquat: { dur: 5000, kind: "move", k: [0.08, 0.42, 0.54], sided: true, tempo: ["control", "drive"], cues: [{ plumb: "ankle", to: "knee" }], build(sc, side, p) {
    // Front shin stays close to vertical (knee-forward drive loads the front of the hip).
    // Round 2 (searched numerically over bench height, stance and hip path): the stance is 100 px, the hip
    // ends 40 px behind the front foot (a forward trunk, 18 deg), so with the front shin at ~5 deg the rear knee
    // is ~90 and the rear shin ~34 at the bottom, the standing top has both legs ~178 (front knee was 153)
    // and the rear foot carries ~34% of the load (was ~45%; a real split squat is 15-35%).
    const work = COL[side], F = [192, 166], R = [92, 108], H = lerpP([174, 78], [152, 118], p);
    const ta = lerp(-82, -72, p), S = P(H, 56, ta), front = leg(H, F), rear = [H, ik(H, R, 44, 42, false), R];
    sc.mark("ankle", F); sc.mark("knee", front[1]);
    sc.floor();
    sc.box(58, 114, 124, 167);
    const rest = () => sc.line(rear, side === "R" ? FAR : BODY, 8);
    sc.line([S, P(S, ARM86[0] + ARM86[1], 92)], FAR, 8);
    if (side === "R") rest();
    sc.line([H, S], BODY, TORSO); sc.dot(P(S, 22, ta - 2), 11, BODY);
    if (side === "L") rest();
    sc.line(front, work, 8);
    const hand = P(S, ARM86[0] + ARM86[1], 90);
    sc.line([S, hand], BODY, 8); dumbbell(sc, hand);
    sc.badge(beyond(front[1], F, 14), work, side);
    return "Bulgarian split squat, " + sideWord(side) + " leg in front: rear foot on a bench, dumbbells at the sides; lower straight down with the front shin close to vertical, then stand";
  } },
  slrdl: { dur: 5500, kind: "move", k: [0.08, 0.44, 0.56], sided: true, tempo: ["control", "drive"], cues: [{ align: ["shoulder", "hip", "foot"] }], build(sc, side, p) {
    // Hinge to about 70°: the rear leg rises in one line with the trunk, spine long. A hinge, not a squat
    // (trainer review, 2026-10-29): the stance leg stays long and near vertical (knee 178 -> ~163, a soft
    // knee) and the hip travels BACK, 6 px, not down; the stance thigh does not pitch forward.
    const work = COL[side], F = [196, 166], lean = lerp(0, 70, p);
    const hx = lerp(194, 188, p), hd = lerp(85.95, 84.9, p), H = [hx, 166 - Math.sqrt(hd * hd - (F[0] - hx) ** 2)];
    const S = P(H, 56, -90 + lean), rearF = P(H, 86, 90 + lean), hand = P(S, ARM86[0] + ARM86[1], 90);
    sc.mark("shoulder", S); sc.mark("hip", H); sc.mark("foot", rearF);
    sc.floor();
    const rest = () => sc.line([H, P(H, 44, 90 + lean), rearF], side === "R" ? FAR : BODY, 8);
    // Load in the hand opposite the standing leg: a left stance holds it in the near (right) hand.
    if (side === "R") { sc.line([S, hand], BODY, 8); kettlebell(sc, hand); rest(); }
    else { sc.line([S, P(S, ARM86[0] + ARM86[1], 92)], FAR, 8); }
    sc.line([H, S], BODY, TORSO); sc.dot(P(S, 22, -90 + lean), 11, BODY);
    if (side === "L") rest();
    sc.line(leg(H, F), work, 8);
    if (side === "L") { sc.line([S, hand], BODY, 8); kettlebell(sc, hand); }
    sc.badge([F[0] + 18, F[1] - 8], work, side);
    return "Single-leg Romanian deadlift, standing on the " + sideWord(side) + " leg: weight in the opposite hand; hinge at the hip with a long spine while the free leg rises behind in one line, then stand";
  } },
  pallof: { dur: 7000, kind: "move", k: [0.06, 0.26, 0.57, 0.84], sided: false, front: true, cues: [{ plumb: "mid", to: "chest" }], build(sc, _s, p) {
    // Seen from the front with the band anchored to the viewer's left; the press goes TOWARD the viewer, so
    // depth is drawn as an oblique offset (down and right) and the arms are solved in 3D (upper arm 35,
    // forearm 32): the hands travel ~35 px straight out from the sternum, elbows 72 -> ~173, trunk and
    // pelvis square, feet hip-width, knees ~170. The band is anchored at ONE height on the post and runs
    // slightly slanted to the hands; it thins as it stretches (trainer + physics reviews).
    const OB = [0.3, 0.38], proj = (q: number[]): Pt => [q[0] + OB[0] * q[2], q[1] + OB[1] * q[2]];
    const z = lerp(23.5, 58.7, p), hand3 = [179, 50, z], hand = proj(hand3);
    const arm = function (s3: number[], out: number): Pt[] {
      const v = [hand3[0] - s3[0], hand3[1] - s3[1], hand3[2] - s3[2]], L = Math.hypot(v[0], v[1], v[2]), d = Math.min(L, ARM86[0] + ARM86[1] - 0.01);
      const u = v.map((x) => x / L), a = (ARM86[0] ** 2 - ARM86[1] ** 2 + d * d) / (2 * d), hh = Math.sqrt(Math.max(0, ARM86[0] ** 2 - a * a));
      const pole = [out * 0.5, 1, 0], dot = pole[0] * u[0] + pole[1] * u[1] + pole[2] * u[2], n = pole.map((x, i) => x - dot * u[i]), nl = Math.hypot(n[0], n[1], n[2]);
      const e3 = [0, 1, 2].map((i) => s3[i] + u[i] * a + (n[i] / nl) * hh);
      return [proj(s3), proj(e3), hand];
    };
    sc.mark("mid", [179, 88]); sc.mark("chest", hand);
    const hR = [170, 80.4], hL = [188, 80.4], fR = [168, 166], fL = [190, 166];
    sc.floor();
    sc.line([hR, ikSide(hR, fR, 44, 42, -1), fR], BODY, 8);
    sc.line([hL, ikSide(hL, fL, 44, 42, 1), fL], BODY, 8);
    sc.line([[179, 80.4], [179, 24]], BODY, TORSO);
    sc.line([[158, 24], [200, 24]], BODY, 8);
    sc.dot([179, 4], 11, BODY);
    sc.line([[40, 30], [40, 167]], PROP, 4);
    sc.line([[42, 54], hand], BAND, lerp(6, 3.5, p)); sc.dot([42, 54], 6, BAND);   // heavier band and an anchor knob: readable at 56x40
    sc.line(arm([158, 24, 0], -1), COL.B, 8);
    sc.line(arm([200, 24, 0], 1), COL.B, 8);
    sc.dot(hand, lerp(7, 10, p), BODY);
    return "Pallof press: standing side-on to a band anchored at chest height; press the hands straight out from the chest and hold, the trunk refusing to turn toward the anchor, then bring them back";
  } },
  nordic: { dur: 8000, kind: "move", k: [0.05, 0.52, 0.58, 0.95], poster: 0.7, sided: false, tempo: ["control", "drive"], cues: [{ align: ["knee", "hip", "shoulder"] }], build(sc, _s, p) {
    // The eccentric is the exercise: ~3.9 s down (was 5.4 s of an 8 s cycle), then a quick push back up with the
    // hands. The body falls to ~85 deg from vertical (trainer review: it stopped at 68), the chest ~13 px off
    // the floor, and the hands catch there, elbows bent like the bottom of a push-up; they stay planted from
    // the moment they land while the shoulder rises over them (physics review).
    const K = [152, 162], A = [100, 162], a = lerp(-88, -5, p), arm = ARM86;
    const H = P(K, 44, a), S = P(H, 56, a);
    const free = (q: number): Pt => { const aq = lerp(-88, -5, q), Sq = P(P(K, 44, aq), 56, aq); return P(Sq, arm[0] + arm[1], aq + 150); };
    let pc = 1;   // first moment the swinging hand reaches the floor
    for (let i = 0; i <= 100; i++) if (free(i / 100)[1] >= 166) { pc = i / 100; break; }
    const hc = free(pc), plant: Pt = [hc[0], 166];
    // On the way back up the hands stay planted and push until the arm is straight, then let go and hang
    // (they used to be released the instant the body passed the catch point: elbow 117 -> 178 in one frame).
    let pr = 0;
    for (let i = Math.round(pc * 100); i >= 0; i--) { const q = i / 100, aq = lerp(-88, -5, q), Sq = P(P(K, 44, aq), 56, aq); if (Math.hypot(Sq[0] - plant[0], Sq[1] - plant[1]) >= (arm[0] + arm[1]) * 0.97) { pr = q; break; } }
    const hand: Pt = p >= pr ? plant : lerpP(plant, free(p), ease(clamp01((pr - p) / 0.15)));
    sc.mark("knee", K); sc.mark("hip", H); sc.mark("shoulder", S);
    sc.floor();
    sc.line([K, A, [92, 166]], BODY, 8);
    sc.ring(add(A, [0, -9]), 7, PROP, 3);
    sc.line([H, S], BODY, TORSO); sc.dot(P(S, 22, a), 11, BODY);
    sc.line([K, H], COL.B, 8);
    sc.line([S, ikSide(S, hand, arm[0], arm[1], -1), hand], BODY, 8);
    return "Nordic curl: kneeling with the ankles held down; keep knee, hip and shoulder in one line and lower forward as slowly as you can, catch with the hands, push back up";
  } },
  sled: { dur: 2000, kind: "gait", k: [0, 1, 1], poster: 0.8, sided: false, build(sc, _s, p) {
    // Low drive into the sled: trunk about 45°, arms long, one knee drives through while the
    // other leg pushes back straight.
    // Front foot capped under the hip (about 90° hip flexion under load, not deeper).
    // A walk, not a toggle (motion round): each foot pushes back along the floor, then swings through
    // low and lands under the hip; the hips dip a little as the weight passes over each foot.
    // Round 2: ~1.0 s a step (cycle 2.0 s, was 1.3 s a step), a short stride (46 px between the feet, was 67) with
    // the hips higher (91 px up), so the trailing shin tops at ~56 deg, the swing knee never drives deeper than
    // hip ~95 / knee ~102, and the drive leg still reaches knee ~168.
    // Trainer + physics review (2026-10-29): the push-off foot sat 57 px behind the hip, so the drive leg
    // reaches knee ~170 with ankle, hip and shoulder nearly in one line (it stopped at knee 133); the arms are
    // ARM86 long and reach the posts at elbow ~165 (they were bent ~110, 43 px for a 67 px arm); the swing foot
    // clears the ground by 8 px, a short heavy step (it was 18, a shin up to 85 deg).
    const H = [150, 91 + 1.5 * Math.cos(4 * Math.PI * (p - 0.8))], S = P(H, 56, -42), hand = P(S, 66, 19);
    const back = 110 + 47 * SWING_OVER, front = 157 - 47 * SWING_OVER;   // the swing's drift stays inside 110..157
    const foot2 = (q: number): Pt[] => {
      const st = stride(q);
      return leg(H, st.stance ? [lerp(front, back, st.u), 166] : [lerp(back, front, swingPos(st.u, 0.6)), 166 - Math.sin(st.u * Math.PI) * 8]);
    };
    const near = foot2(p), far = foot2(p + 0.5);
    sc.floor();
    sc.ground(p * (front - back) / 0.6, (front - back) / 1.2);
    sc.line([[hand[0] - 4, 66], [hand[0] + 8, 166]], PROP, 5);
    sc.box(hand[0] + 8, 136, hand[0] + 80, 166);
    sc.line(far, FAR, 8);
    sc.line([S, ikSide(S, hand, ARM86[0], ARM86[1], -1), hand], FAR, 8);
    sc.line([H, S], BODY, TORSO); sc.dot(P(S, 22, -38), 11, BODY);
    sc.line(near, COL.B, 8);
    const h2 = add(hand, [0, 4]);
    sc.line([S, ikSide(S, h2, ARM86[0], ARM86[1], -1), h2], BODY, 8);
    return "Heavy sled push: hands high on the sled posts, trunk leaning in at about 45°, arms long; drive one knee through at a time with short, heavy steps of about a second each";
  } },
  suitcase: { dur: 1100, kind: "gait", k: [0, 1, 1], poster: 0.8, sided: true, front: true, cues: [{ plumb: "mid", to: "head" }], build(sc, side, p, _r, t = 0) {
    // Front view: the loaded arm hangs straight, the trunk stays vertical and does not lean toward it.
    // It shifts sideways over the standing foot as a whole, upright, which is not a lean.
    // Cadence ~0.55 s a step (trainer review; it was 1.2 s), feet at hip width and the trunk swaying
    // +-7 px so the weight is over the stance foot in single support (physics review).
    const work = COL[side], g = carryGait(p), sh: Pt = [g.shift[0] * 2.8, g.shift[1] + breathe(t)];
    sc.mark("mid", [179, 88]); sc.mark("head", [179, 6]);
    carryBody(sc, g.lift, sh);
    const loaded = add(side === "R" ? [158, 36] : [200, 36], sh), free = add(side === "R" ? [200, 36] : [158, 36], sh);
    const fs = side === "R" ? 1 : -1, reach = ARM86[0] + ARM86[1];
    sc.line([free, add(free, [fs * 5, reach])], BODY, 8);
    const hand = add(loaded, [-fs * 5, reach]);
    sc.line([loaded, hand], work, 8); kettlebell(sc, hand);
    sc.badge(add(hand, [-fs * 22, 4]), work, side);
    return "Suitcase carry, weight in the " + sideWord(side) + " hand: walk tall with small steps, ribs down, the trunk staying upright instead of leaning toward the load";
  } },
  farmer: { dur: 1100, kind: "gait", k: [0, 1, 1], poster: 0.8, sided: false, front: true, build(sc, _s, p, _r, t = 0) {
    const g = carryGait(p), sh: Pt = [g.shift[0] * 2.8, g.shift[1] + breathe(t)];
    carryBody(sc, g.lift, sh);
    for (const [s0, dx] of [[[158, 36], -5], [[200, 36], 5]] as [Pt, number][]) {
      const s = add(s0, sh), hand = add(s, [dx, ARM86[0] + ARM86[1]]);
      sc.line([s, hand], COL.B, 8); kettlebell(sc, hand);
    }
    return "Farmer's carry: a heavy weight in each hand, arms long; walk tall with small fast steps and controlled breathing";
  } },
  airsquat: { kind: "move", dur: 5500, k: [0.05, 0.4, 0.5, 0.8], poster: 0.9, sided: false, tempo: ["control", "drive"], cues: [{ level: "knee", span: ["hip", "knee"], limit: true }], build(sc, _s, p) { return squatPose(sc, p, 30, "air", 134, 119); } },
  goblet: { kind: "move", dur: 5500, k: [0.05, 0.4, 0.5, 0.8], poster: 0.9, sided: false, tempo: ["control", "drive"], cues: [{ level: "knee", span: ["hip", "knee"], limit: true }], build(sc, _s, p) { return squatPose(sc, p, 26, "goblet", 137, 127); } },
  amarch: { dur: 3000, kind: "move2", k: [0.05, 0.4, 0.62], sided: false, cues: [{ angle: ["knee", "hip", "shoulder"] }], build(sc, _s, p, rep = 0) {
    // Knee to a level thigh (90°) and no higher; the opposite arm drives forward to ~65° of shoulder flexion
    // with the elbow at ~90, the other arm swings back ~40° (ARM86; trainer review 11).
    const H = [178, 80], S = [178, 24];
    const up = (q: number): Pt[] => { const K = P(H, 44, lerp(92, 0, q)); return [H, K, P(K, 42, 90 - lerp(-4, 4, q))]; };
    const down = (): Pt[] => { const K = P(H, 44, 92); return [H, K, P(K, 42, 88)]; };
    const arm = (q: number, fwd: boolean): Pt[] => {
      const a = fwd ? lerp(90, 25, q) : lerp(90, 130, q), E = P(S, ARM86[0], a);
      return [S, E, P(E, ARM86[1], a - (fwd ? lerp(30, 90, q) : lerp(30, 45, q)))];
    };
    const nearLeg = rep === 0 ? up(p) : down(), farLeg = rep === 0 ? down() : up(p);
    sc.mark("hip", H); sc.mark("shoulder", S); sc.mark("knee", (rep === 0 ? nearLeg : farLeg)[1]);
    sc.floor();
    sc.line(farLeg, rep === 1 ? COL.B : FAR, 8);
    sc.line(arm(p, rep === 0), FAR, 8);
    sc.line([H, S], BODY, TORSO); sc.dot([180, 3], 11, BODY);
    sc.line(nearLeg, rep === 0 ? COL.B : BODY, 8);
    sc.line(arm(p, rep === 1), BODY, 8);
    return "A-march: standing tall, drive one knee up until the thigh is level, no higher, with the opposite arm forward; set it down and switch";
  } },
  legswing: { dur: 2600, kind: "move", k: [0, 0.5, 0.5], poster: 1, sided: true, build(sc, side, p) {
    // Small range with a soft knee: about 15° behind to 30° in front. A primer, not a stretch,
    // and never a held straight-leg raise. The still frame is the forward end (it was the middle of the
    // swing, where both legs overlap and the amplitude read as 3 px; trainer review 11).
    const work = COL[side], H = [176, 80], S = [178, 24], a = lerp(105, 60, p), grip = [222, 56];
    const K = P(H, 44, a), swing = [H, K, P(K, 42, a + 16)], stand = [H, [176, 124], [176, 166]];
    sc.floor();
    sc.line([[222, 54], [222, 167]], PROP, 4);
    for (const ga of [105, 60]) { const gk = P(H, 44, ga); sc.line([H, gk, P(gk, 42, ga + 16)], work, 6, 0.22); }   // faint ghosts of both ends of the range
    if (side === "L") sc.line(stand, BODY, 8); else sc.line(swing, work, 8);
    sc.line([H, S], BODY, TORSO); sc.dot([180, 3], 11, BODY);
    if (side === "L") sc.line(swing, work, 8); else sc.line(stand, FAR, 8);
    sc.line([S, ik(S, grip, ARM86[0], ARM86[1], false), grip], BODY, 8);
    sc.badge(beyond(K, swing[2], 14), work, side);
    return "Controlled leg swings, " + sideWord(side) + " leg: one hand on a support, the " + sideWord(side) + " leg swings front to back through a small, easy range with a soft knee";
  } },
  hollowtuck: { kind: "hold", sided: false, scale: 1.15, build(sc, _s, q) {
    // Tuck hollow: knees bent over the hips (short lever, not a straight-leg-raise hold), lower back
    // pressed down, shoulders curled up off the floor. Hip flexion is capped at 90 degrees (included >= 90
    // even at the end of the shoulder lift): FADIR-positive hips must not cross it by default (physio r1).
    const H = [196, 160], a = lerp(0, 16, q), S = P(H, 80, 180 + a);
    const K = P(H, 62, -74), F = P(K, 58, -2);
    sc.floor();
    sc.line([H, K, F], BODY, 8);
    sc.line([S, H], BODY, TORSO);
    sc.dot(P(S, 26, 180 + a + 6), 11, BODY);
    sc.line([S, P(S, ARMLY, -20 + a * 0.3)], COL.B, 8);
    return "Hollow hold, tucked: lying on the back with knees bent over the hips, lower back pressed into the floor, shoulders curled up and arms reaching toward the knees";
  } },
};

function squatPose(sc: Scene, p: number, leanDeg: number, load: "back" | "front" | "air" | "goblet", hipX: number, hipY: number): string {
  // Depth stops at about parallel (no deep flexion with the knees caving: a documented provocateur).
  // Hips sit back behind the heel and the shin tilts ~25° (it stood near vertical before review).
  // Sequenced (motion round, 2026-10-29): the hips start back before they go down, so they also come
  // forward last on the way up; the trunk angle is solved so the shoulders (and the bar) travel a straight
  // line between their two end positions instead of drifting.
  // Balance (physics review, 2026-10-29): hip and lean at depth put the centre of mass of body plus load over
  // the mid-foot (156-160), not on the heel. The trunk keeps most of its lean until the knees pass ~130 on the
  // way up (hips and chest rise together), so it is a concave function of the depth.
  const F = [155, 166], H = [lerp(155, hipX, lead(p)), lerp(80, hipY, p)];
  const lean = leanDeg * p ** 0.6 * Math.PI / 180;
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
    sc.ring(bell, 11, PROP, 3); sc.ring(add(bell, [0, -13]), 5, PROP, 3);
    return "Goblet squat: a dumbbell or kettlebell held at the chest, elbows down; sit down between the hips keeping the chest tall, pressing the knees out with the elbows inside them, then stand";
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
    label = f.build(sc, s, p, 0, reduced || still ? 0 : elapsed);
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
    label = f.build(sc, s, p, rep, reduced || still ? 0 : elapsed);
    if (f.fade && !reduced && !still) {
      const x = (elapsed % dur) / dur, w = 80 / dur, [c0, c1] = f.fade;
      const gap = x < c0 ? c0 - x : x > c1 ? x - c1 : 0;
      const op = Math.min(1, 0.15 + 0.85 * (gap / w));
      if (op < 1) for (const it of sc.items) if (!it.bg) it.op *= op;
      for (const b of sc.badges) b.op *= op;
    }
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
