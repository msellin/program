// cd next-app && node ../dev/active/figure-animation/new-r2/who.mjs <id> <t0> <t1>: per-slot max jump in a window
import path from "node:path"; import { createRequire } from "node:module";
const require = createRequire(path.resolve("package.json")); const { createJiti } = require("jiti");
const rig = await createJiti(import.meta.url).import(path.resolve("src/lib/figures/rig.ts"));
const [id, t0, t1] = [process.argv[2], +process.argv[3], +process.argv[4]];
let prev = null; const m = {};
for (let t = t0; t <= t1; t += 33) {
  const fr = rig.drawFigure(id, "B", t, false);
  const pts = fr.slots.map(s => (s.pts || "").split(" ").filter(Boolean).map(q => q.split(",").map(Number)));
  if (prev) pts.forEach((p, i) => { if (!prev[i] || p.length !== prev[i].length) return; p.forEach((v, j) => { const d = Math.hypot(v[0] - prev[i][j][0], v[1] - prev[i][j][1]); if (d > (m[i] || [0])[0]) m[i] = [d, j, t]; }); });
  prev = pts;
}
const cs = rig.drawFigure(id, "B", t0, false).slots;
console.log(Object.entries(m).map(([i, v]) => `slot${i} ${cs[i].color} w${cs[i].w} ${v[0].toFixed(1)} pt${v[1]} @${v[2]}`).join("\n"));
