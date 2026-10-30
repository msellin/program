// cd next-app && node ../dev/active/figure-animation/new-r2/foot.mjs <ids>: x of the lowest line ends at the end of the cycle (feet) and time of first foot contact
import path from "node:path"; import { createRequire } from "node:module";
const require = createRequire(path.resolve("package.json")); const { createJiti } = require("jiti");
const rig = await createJiti(import.meta.url).import(path.resolve("src/lib/figures/rig.ts"));
for (const id of process.argv.slice(2)) {
  const fr = rig.drawFigure(id, "B", 5200, false);
  const ends = [];
  for (const s of fr.slots) { const q = (s.pts || "").split(" ").filter(Boolean).map(z => z.split(",").map(Number)); if (q.length === 3 && q[2][1] >= 165 && q[2][1] <= 167.5) ends.push(q[2][0]); }
  let first = null;
  for (let t = 0; t < 6500 && first === null; t += 33) { const f = rig.drawFigure(id, "B", t, false); for (const s of f.slots) { const q = (s.pts || "").split(" ").filter(Boolean).map(z => z.split(",").map(Number)); if (q.length === 3 && Math.abs(q[2][1] - 166) < 0.6 && s.color !== "#d2a76a") { first = [t, q[2][0]]; break; } } }
  console.log(id, "final feet x", ends.map(x => x.toFixed(1)).join(" "), "first contact", first && first.map(x => x.toFixed(1)).join(" @x"), "handA x 166");
}
