// cd next-app && node ../dev/active/figure-animation/new-r2/jumps.mjs <ids...>: max per-33 ms vertex jump (frames whose slot list changes are skipped)
import path from "node:path"; import { createRequire } from "node:module";
const require = createRequire(path.resolve("package.json")); const { createJiti } = require("jiti");
const rig = await createJiti(import.meta.url).import(path.resolve("src/lib/figures/rig.ts"));
for (const id of process.argv.slice(2)) {
  const f = rig.FIGS[id], side = f.sided ? "L" : "B";
  const dur = f.kind === "hold" ? 12000 : f.kind === "move2" ? f.dur : f.dur;
  let prev = null, max = 0, at = 0;
  for (let t = 0; t <= dur + 33; t += 33) {
    const fr = rig.drawFigure(id, side, t, false);
    const pts = fr.slots.map(s => (s.pts || "").split(" ").filter(Boolean).map(q => q.split(",").map(Number)));
    const ops = fr.slots.map(s => s.op), cols = fr.slots.map(s => s.color).join();
    if (prev && prev.cols === cols) for (let i = 0; i < pts.length; i++) {
      if (ops[i] < 0.9 || prev.ops[i] < 0.9) continue;
      if (pts[i].length !== prev.pts[i].length) continue;
      for (let j = 0; j < pts[i].length; j++) { const d = Math.hypot(pts[i][j][0] - prev.pts[i][j][0], pts[i][j][1] - prev.pts[i][j][1]); if (d > max) { max = d; at = t; } }
    }
    prev = { pts, ops, cols };
  }
  console.log(id.padEnd(14), "max jump", max.toFixed(1), "px at", at, "ms");
}
