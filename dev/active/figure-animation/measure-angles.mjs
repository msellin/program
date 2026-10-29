// Joint angles of every figure through one cycle, measured from the live rig's skeleton (not eyeballed).
//
//   cd next-app && node ../dev/active/figure-animation/measure-angles.mjs > ../dev/active/figure-animation/angles.md
//
// Per figure: the exercises that use it, then each limb chain's angles at start / 25% / 50% / 75% of the
// cycle and their min..max. Conventions (degrees): trunk = hip->shoulder line from vertical (0 upright,
// 90 horizontal); hip = shoulder-hip-knee included angle (180 = straight, smaller = more flexion); knee =
// hip-knee-ankle included angle (180 = straight); shin = knee->ankle from vertical; elbow = shoulder-
// elbow-hand included angle. Side views face right, so x grows forward. y grows DOWN (floor at 166-168).
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(path.resolve("package.json"));
const { createJiti } = require("jiti");
const jiti = createJiti(import.meta.url);
const rig = await jiti.import(path.resolve("src/lib/figures/rig.ts"));
const { EXERCISE_FIGURES } = await jiti.import(path.resolve("src/lib/figures/exercise-figures.ts"));
const { FIGS, drawFigure, FIGURE_COLORS, ACCENT } = rig;

const pts = (s) => s.split(" ").map((q) => q.split(",").map(Number));
const d = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const inc = (a, b, c) => {
  const v1 = [a[0] - b[0], a[1] - b[1]], v2 = [c[0] - b[0], c[1] - b[1]];
  const cos = (v1[0] * v2[0] + v1[1] * v2[1]) / (Math.hypot(...v1) * Math.hypot(...v2) || 1);
  return (Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI;
};
const fromVert = (a, b) => (Math.atan2(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1])) * 180) / Math.PI;
const colorName = (c) => (c === ACCENT ? "work" : c === FIGURE_COLORS.L ? "left" : c === FIGURE_COLORS.R ? "right" : c === FIGURE_COLORS.FAR ? "far" : c === FIGURE_COLORS.BODY ? "body" : "other");

function measure(frame) {
  const sk = frame.slots.filter((s) => s.w > 0 && !s.bg && !s.cue);
  const torso = sk.find((s) => s.w === 12 && pts(s.pts).length === 2);
  const head = sk.find((s) => s.w >= 18 && s.w <= 24 && pts(s.pts).length === 2 && d(...pts(s.pts)) < 1);
  if (!torso) return null;
  let [A, B] = pts(torso.pts);
  // Shoulder = trunk end nearer the head.
  if (head && d(A, pts(head.pts)[0]) < d(B, pts(head.pts)[0])) [A, B] = [B, A];
  const H = A, S = B, out = { trunk: fromVert(H, S) };
  for (const s of sk) {
    const p = pts(s.pts);
    if (s.w !== 8 || p.length !== 3) continue;
    const name = colorName(s.color);
    const atHip = d(p[0], H) < 8 || d(p[2], H) < 8, atSh = d(p[0], S) < 10 || d(p[2], S) < 10;
    const chain = d(p[2], H) < 8 || d(p[2], S) < 10 ? [p[2], p[1], p[0]] : p;
    if (atHip) {
      const k = `${name} leg`;
      if (out[k + " hip"] != null) continue;
      out[k + " hip"] = inc(S, chain[0], chain[1]);
      out[k + " knee"] = inc(chain[0], chain[1], chain[2]);
      out[k + " shin"] = fromVert(chain[1], chain[2]);
    } else if (atSh) {
      const k = `${name} arm`;
      if (out[k + " elbow"] != null) continue;
      out[k + " shoulder"] = inc(H, chain[0], chain[1]);
      out[k + " elbow"] = inc(chain[0], chain[1], chain[2]);
    }
  }
  return out;
}

const byFig = {};
for (const [ex, fig] of Object.entries(EXERCISE_FIGURES)) (byFig[fig] ??= []).push(ex);
const r = (x) => (x == null ? "" : Math.round(x));
let md = "# Figure joint angles (measured from rig.ts)\n\nConventions are in the header of `measure-angles.mjs`. Side views face right.\n";
for (const id of Object.keys(FIGS)) {
  const f = FIGS[id];
  const side = f.sided ? "L" : "B";
  const cycle = f.kind === "hold" ? 900 : f.dur;
  const ts = Array.from({ length: 41 }, (_, i) => (cycle * i) / 40);
  const ms = ts.map((t) => measure(drawFigure(id, side, t, false))).filter(Boolean);
  const at = (q) => measure(drawFigure(id, side, q * cycle, false));
  md += `\n## ${id} (${f.kind}${f.dur ? `, ${f.dur} ms` : ""}${f.tempo ? `, tempo ${f.tempo.join("/")}` : ""})\n`;
  md += `Exercises: ${(byFig[id] ?? ["(none mapped)"]).join(", ")}\n\n`;
  md += `Label: ${drawFigure(id, side, 0, false, true).label}\n\n`;
  if (!ms.length) { md += "(no trunk line: angles not measured)\n"; continue; }
  const keys = [...new Set(ms.flatMap((m) => Object.keys(m)))];
  const snaps = [0, 0.25, 0.5, 0.75].map(at);
  md += "| angle | start | 25% | 50% | 75% | min..max |\n|---|---|---|---|---|---|\n";
  for (const k of keys) {
    const vals = ms.map((m) => m[k]).filter((v) => v != null);
    md += `| ${k} | ${snaps.map((s) => r(s?.[k])).join(" | ")} | ${r(Math.min(...vals))}..${r(Math.max(...vals))} |\n`;
  }
}
process.stdout.write(md);
