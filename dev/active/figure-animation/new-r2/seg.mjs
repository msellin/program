// cd next-app && node ../dev/active/figure-animation/new-r2/seg.mjs <ids>: max jump in 1.0-1.5 s and the top jumps
import path from "node:path"; import { createRequire } from "node:module";
const require = createRequire(path.resolve("package.json")); const { createJiti } = require("jiti");
const rig = await createJiti(import.meta.url).import(path.resolve("src/lib/figures/rig.ts"));
for (const id of process.argv.slice(2)) {
  let prev = null; const rows = [];
  for (let t = 0; t <= 6500; t += 33) {
    const fr = rig.drawFigure(id, "B", t, false);
    const pts = fr.slots.map(s => (s.pts || "").split(" ").filter(Boolean).map(q => q.split(",").map(Number)));
    if (prev && prev.length === pts.length) {
      let m = 0;
      for (let i = 0; i < pts.length; i++) { if (pts[i].length !== prev[i].length) continue; for (let j = 0; j < pts[i].length; j++) m = Math.max(m, Math.hypot(pts[i][j][0] - prev[i][j][0], pts[i][j][1] - prev[i][j][1])); }
      rows.push([t, m]);
    }
    prev = pts;
  }
  const w = (a, b) => Math.max(...rows.filter(r => r[0] >= a && r[0] <= b).map(r => r[1])).toFixed(1);
  console.log(id, "1.0-1.5s", w(1000, 1500), "top", rows.filter(r => r[0] < 6200).sort((a, b) => b[1] - a[1]).slice(0, 4).map(r => r[0] + ":" + r[1].toFixed(1)).join(" "));
}
