// cd next-app && node ../dev/active/figure-animation/new-r2/trace.mjs <id> <slot> <t0> <t1> <step>: points of one slot over time
import path from "node:path"; import { createRequire } from "node:module";
const require = createRequire(path.resolve("package.json")); const { createJiti } = require("jiti");
const rig = await createJiti(import.meta.url).import(path.resolve("src/lib/figures/rig.ts"));
const [id, slot, t0, t1, st] = [process.argv[2], +process.argv[3], +process.argv[4], +process.argv[5], +process.argv[6]];
for (let t = t0; t <= t1; t += st) console.log(t, rig.drawFigure(id, "B", t, false).slots[slot].pts);
