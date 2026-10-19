// ---- Exercise figures: one shared rig for every illustration ----
// Everything is a polyline slot so draw order (what is in front) is exact. A dot is a
// near-zero-length polyline with a round cap, width = diameter.
var COL = { L: "#5fa3b0", R: "#b58dbb", B: "#d6d9de" };
var WORK = ["#5fa3b0", "#b58dbb", "#d6d9de"];
var BODY = "#9aa0a8", FAR = "#6b717d", FLOOR = "#2e323b", PROP = "#3a3f48", WOOD = "#8a6f55";
var SLOTS = 18;
function ease(x) { return 0.5 - 0.5 * Math.cos(Math.PI * x); }
// rest → move → hold → return, as 0..1
function prog(t, k) {
  if (t < k[0]) return 0;
  if (t < k[1]) return ease((t - k[0]) / (k[1] - k[0]));
  if (t < k[2]) return 1;
  return 1 - ease((t - k[2]) / (1 - k[2]));
}
function lerp(a, b, p) { return a + (b - a) * p; }
function lerpP(a, b, p) { return [lerp(a[0], b[0], p), lerp(a[1], b[1], p)]; }
function P(o, len, deg) { var r = deg * Math.PI / 180; return [o[0] + len * Math.cos(r), o[1] + len * Math.sin(r)]; }
function add(a, d) { return [a[0] + d[0], a[1] + d[1]]; }
function beyond(a, b, d) { var dx = b[0] - a[0], dy = b[1] - a[1], n = Math.hypot(dx, dy) || 1; return [b[0] + dx / n * d, b[1] + dy / n * d]; }
function ik(H, F, L1, L2, up) {
  var dx = F[0] - H[0], dy = F[1] - H[1], d = Math.min(Math.hypot(dx, dy), L1 + L2 - 0.01);
  var a = (L1 * L1 - L2 * L2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, L1 * L1 - a * a));
  var n = Math.hypot(dx, dy) || 1, ux = dx / n, uy = dy / n;
  var mx = H[0] + a * ux, my = H[1] + a * uy;
  var k1 = [mx + h * uy, my - h * ux], k2 = [mx - h * uy, my + h * ux];
  return (k1[1] < k2[1]) === up ? k1 : k2;
}
function fmt(a) { return a.map(function (p) { return (Math.round(p[0] * 10) / 10) + "," + (Math.round(p[1] * 10) / 10); }).join(" "); }
function Scene() { this.items = []; this.badges = []; }
Scene.prototype.line = function (a, color, w, op, fill) { this.items.push({ pts: fmt(a), color: color, w: w || 8, op: op == null ? 1 : op, fill: fill || "none" }); };
Scene.prototype.dot = function (c, r, color, op) { this.line([c, [c[0] + 0.01, c[1]]], color, r * 2, op); };
Scene.prototype.badge = function (p, color, letter) { this.badges.push({ x: Math.round(p[0]), y: Math.round(p[1]), color: color, letter: letter, op: 1 }); };
Scene.prototype.floor = function () { this.line([[20, 168], [338, 168]], FLOOR, 2); };
function sideWord(s) { return s === "L" ? "left" : s === "R" ? "right" : "both"; }

// Side views face RIGHT or lie with the head LEFT: either way we see her RIGHT side,
// so right limbs are near (drawn in front) and left limbs are far (drawn behind).
var FIGS = {
  hipflex: { dur: 2400, kind: "pulse", sided: true, build: function (sc, side, q) {
    var work = COL[side], H = [176, 122], S = [171, 62];
    var wAng = lerp(-8, -14, q), wK = P(H, 64, wAng), wF = P(wK, 54, wAng + 98);
    var rK = P(H, 62, 2), rF = [rK[0] + 4, 166];
    var hand = add(lerpP(H, wK, 0.74), [0, -6]), elbow = ik(S, hand, 36, 34, false);
    var workLeg = function () { sc.line([H, wK, wF], work, 8); };
    var restLeg = function () { sc.line([H, rK, rF], side === "R" ? FAR : BODY, 8); };
    sc.line([[108, 128], [196, 128], [196, 167], [108, 167], [108, 128]], PROP, 2, 1, PROP);
    if (side === "L") { workLeg(); } else { restLeg(); }
    sc.line([H, S], BODY, 10); sc.line([S, [172, 52]], BODY, 8); sc.dot([173, 44], 11, BODY);
    if (side === "L") { restLeg(); } else { workLeg(); }
    sc.line([S, elbow, hand], BODY, 8);
    var top = add(wK, [0, -16]);
    sc.line([top, add(top, [0, -16])], work, 3, 0.35 + 0.65 * q);
    sc.line([add(top, [-5, -11]), add(top, [0, -17]), add(top, [5, -11])], work, 3, 0.35 + 0.65 * q);
    sc.badge(beyond(wK, wF, 16), work, side);
    return "Seated hip-flexor hold, " + sideWord(side) + " leg: sitting tall, the " + sideWord(side) + " thigh presses up into both hands at about 60% effort and holds";
  } },
  adductor: { dur: 2400, kind: "pulse", sided: false, build: function (sc, side, q) {
    var S = [98, 158], H = [196, 160], F = [278, 166], K = ik(H, F, 66, 62, true);
    sc.floor();
    sc.line([add(H, [-6, -6]), add(K, [-6, -6]), add(F, [-8, 0])], FAR, 8);
    sc.line([S, [164, 166]], BODY, 8);
    sc.line([S, H], BODY, 10); sc.line([[76, 154], S], BODY, 8); sc.dot([68, 151], 11, BODY);
    var ball = add(K, [-6, -3]);
    sc.dot(ball, 13 + 6 * q, COL.B, 0.18 * q);
    sc.dot(ball, lerp(13, 10.5, q), COL.B, 0.9);
    sc.line([H, K, F], COL.B, 8);
    return "Adductor squeeze: lying on the back with knees bent, squeezing a ball between the knees at about 60% and holding";
  } },
  bridge: { dur: 5000, kind: "move", k: [0.08, 0.32, 0.64], sided: true, build: function (sc, side, p) {
    var S = [98, 158], T = 100, F = [276, 164], th = lerp(0, 18.2, p) * Math.PI / 180;
    var H = [S[0] + T * Math.cos(th), S[1] - T * Math.sin(th)], K = ik(H, F, 66, 62, true);
    var r0 = Math.atan2(K[1] - H[1], K[0] - H[0]) - 10 * Math.PI / 180;
    var FK = [H[0] + 66 * Math.cos(r0), H[1] + 66 * Math.sin(r0)], FF = [H[0] + 128 * Math.cos(r0), H[1] + 128 * Math.sin(r0)];
    sc.floor();
    if (side === "L") sc.line([H, K, F], COL.L, 8); else sc.line([H, FK, FF], FAR, 8);
    sc.line([[100, 162], [164, 166]], BODY, 8);
    sc.line([[76, 154], S], BODY, 8); sc.dot([68, 151], 11, BODY);
    sc.line([S, H], BODY, 10);
    if (side === "L") sc.line([H, FK, FF], BODY, 8); else sc.line([H, K, F], COL.R, 8);
    sc.badge([F[0] + 20, F[1] - 8], COL[side], side);
    return "Single-leg glute bridge, " + sideWord(side) + " foot planted: hips lift until shoulder, hip and knee form one straight line, the other leg stays straight";
  } },
  deadbug: { dur: 14000, kind: "move2", k: [0.07, 0.43, 0.57], sided: false, build: function (sc, side, p, rep) {
    var S = [112, 157], H = [208, 160], off = [-12, -8], fS = add(S, off), fH = add(H, off);
    var arm = function (o, q) { return [o, P(o, 62, lerp(-90, -132, q))]; };
    var leg = function (o, q) { var a = lerp(-90, -10, q), K = P(o, 62, a); return [o, K, P(K, 58, a + lerp(90, 0, q))]; };
    var nA = arm(S, rep === 0 ? p : 0), fA = arm(fS, rep === 1 ? p : 0), nL = leg(H, rep === 1 ? p : 0), fL = leg(fH, rep === 0 ? p : 0);
    sc.floor();
    sc.line(fA, rep === 1 ? COL.L : FAR, 8); sc.line(fL, rep === 0 ? COL.L : FAR, 8);
    sc.line([S, H], BODY, 10);
    sc.line(nA, rep === 0 ? COL.R : BODY, 8); sc.line(nL, rep === 1 ? COL.R : BODY, 8);
    sc.line([[92, 155], S], BODY, 8); sc.dot([82, 153], 11, BODY);   // head in front: the arm passes behind it
    var wa = rep === 0 ? nA : fA, wl = rep === 0 ? fL : nL, as = rep === 0 ? "R" : "L", ls = rep === 0 ? "L" : "R";
    sc.badge(beyond(wa[0], wa[1], 14), COL[as], as); sc.badge(beyond(wl[1], wl[2], 14), COL[ls], ls);
    return "Dead bug: lying on the back, arms up, knees over hips. The " + sideWord(as) + " arm reaches overhead while the " + sideWord(ls) + " leg straightens low, then return and switch to the other pair";
  } },
  kneel: { dur: 9000, kind: "move", k: [0.06, 0.33, 0.78], sided: true, build: function (sc, side, p) {
    var work = COL[side], KB = [146, 164], BF = [94, 166], FF = [240, 166];
    var H = lerpP([162, 112], [173, 116], p), FK = ik(H, FF, 64, 56, true);
    var S = P(H, 58, lerp(-90, -93, p)), head = P(S, 20, -90);
    var back = function () { sc.line([BF, KB, H], work, 8); };
    var front = function () { sc.line([H, FK, FF], side === "R" ? FAR : BODY, 8); };
    sc.floor();
    if (side === "L") back(); else front();
    sc.dot(lerpP(KB, H, 0.78), 9, work, 0.4 * p);
    sc.line([H, S], BODY, 10); sc.line([S, add(S, [0, -8])], BODY, 8); sc.dot(head, 11, BODY);
    if (side === "L") front(); else back();
    sc.line([S, add(S, [-18, 28]), add(H, [-4, -4])], BODY, 8);
    sc.badge(beyond(KB, BF, 16), work, side);
    return "Half-kneeling hip-flexor stretch, " + sideWord(side) + " knee down: tuck the pelvis, squeeze the back glute and shift the hips gently forward, then hold";
  } },
  ninety: { dur: 8000, kind: "move", k: [0.1, 0.4, 0.6], sided: false, build: function (sc, side, p) {
    var phi = lerp(-60, 60, p) * Math.PI / 180;
    var hipL = [170, 156], hipR = [188, 156], fL = [106, 166], fR = [252, 166];
    var knee = function (h, f) { var m = lerpP(h, f, 0.5); return [m[0] + 46 * Math.sin(phi), m[1] - 46 * Math.cos(phi)]; };
    sc.floor();
    sc.line([[163, 102], [146, 160]], FAR, 6); sc.line([[195, 102], [212, 160]], FAR, 6);   // arms behind, dim
    sc.line([[179, 156], [179, 100]], BODY, 10); sc.line([[162, 101], [196, 101]], BODY, 8);
    sc.line([[179, 100], [179, 92]], BODY, 8); sc.dot([179, 82], 11, BODY);
    sc.line([hipL, knee(hipL, fL), fL], COL.B, 8); sc.line([hipR, knee(hipR, fR), fR], COL.B, 8);
    return "90/90 hip switches, seen from the front: sitting with feet wide, both knees rotate slowly from one side to the other";
  } },
  hang: { dur: 4000, kind: "pulse", sided: false, build: function (sc, side, q) {
    var drop = 3 * q;
    sc.line([[96, 22], [262, 22]], PROP, 6);
    var sL = [166, 72 + drop * 0.3], sR = [192, 72 + drop * 0.3];
    sc.line([[179, 74], [179, 130 + drop]], BODY, 10);
    sc.line([[173, 130 + drop], [171, 188 + drop]], BODY, 8); sc.line([[185, 130 + drop], [187, 188 + drop]], BODY, 8);
    sc.dot([179, 58], 11, BODY);
    sc.line([[152, 24], sL], COL.B, 8); sc.line([[206, 24], sR], COL.B, 8);
    sc.line([sL, sR], BODY, 8);
    return "Passive bar hang: hanging from the bar with straight arms, shoulders relaxed, body long and still";
  } },
  pullover: { dur: 9000, kind: "move", k: [0.06, 0.33, 0.78], sided: false, build: function (sc, side, p) {
    var S = [112, 157], H = [208, 160], F = [286, 166], K = ik(H, F, 62, 58, true);
    var hand = P(S, 60, lerp(-90, -166, p));
    sc.floor();
    sc.line([add(H, [-8, -6]), add(K, [-8, -6]), add(F, [-10, 0])], FAR, 8);
    sc.line([S, H], BODY, 10); sc.line([H, K, F], BODY, 8);
    sc.line([S, hand], COL.B, 8); sc.dot(hand, 6, WOOD);
    sc.line([[92, 155], S], BODY, 8); sc.dot([82, 153], 11, BODY);
    return "Supine dowel pullover: lying on the back, knees bent, both hands on a dowel; the arms travel slowly overhead toward the floor and hold";
  } },
  roller: { dur: 5000, kind: "move", k: [0.1, 0.4, 0.6], sided: false, build: function (sc, side, p) {
    var C = [136, 133], H = [222, 160], F = [296, 166], K = ik(H, F, 62, 58, true);
    var ang = lerp(-172, -200, p), Sh = P(C, 36, ang), head = P(Sh, 20, ang), E = P(Sh, 32, ang + 112);
    sc.floor();
    sc.dot([136, 151], 17, PROP);
    sc.line([add(H, [-8, -6]), add(K, [-8, -6]), add(F, [-10, 0])], FAR, 8);
    sc.line([C, H], BODY, 10); sc.line([H, K, F], BODY, 8);
    sc.line([C, Sh], COL.B, 10);
    sc.dot(head, 11, BODY);
    sc.line([Sh, E, head], BODY, 8);
    return "Foam roller thoracic extension: roller under the upper back, hands behind the head; the upper back extends slowly over the roller and returns";
  } }
};
// Returns { p0..p17, b0, b1, label } ready for the fixed SVG slots.
function drawFigure(id, side, elapsed, reduced) {
  var f = FIGS[id], s = side === "R" ? "R" : side === "L" ? "L" : "B";
  if (f.sided && s === "B") s = "L";
  var sc = new Scene(), label, rep = 0, p;
  if (f.kind === "pulse") {
    p = reduced ? 0.5 : 0.5 - 0.5 * Math.cos(2 * Math.PI * ((elapsed % f.dur) / f.dur));
    label = f.build(sc, s, p);
  } else {
    var dur = f.kind === "move2" ? f.dur / 2 : f.dur;
    rep = f.kind === "move2" ? Math.floor(elapsed / dur) % 2 : 0;
    p = reduced ? 0 : prog((elapsed % dur) / dur, f.k);
    label = f.build(sc, s, p, rep);
    if (reduced) {
      var g = new Scene(); f.build(g, s, 1, rep);
      var ghosts = g.items.filter(function (it) { return WORK.indexOf(it.color) >= 0 && it.w < 12; });
      ghosts.forEach(function (it) { it.op = 0.3; });
      sc.items = [sc.items[0]].concat(ghosts, sc.items.slice(1));
    }
  }
  var out = { label: label };
  for (var i = 0; i < SLOTS; i++) out["p" + i] = sc.items[i] || { pts: "0,0", color: "none", w: 0, op: 0, fill: "none" };
  for (var j = 0; j < 2; j++) out["b" + j] = sc.badges[j] || { x: -50, y: -50, color: "none", letter: "", op: 0 };
  return out;
}
