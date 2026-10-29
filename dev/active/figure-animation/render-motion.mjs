// Before/after motion clips: the same figure from two rig.ts files, side by side, at 30 fps.
//
//   cd next-app && node ../dev/active/figure-animation/render-motion.mjs <old-rig.ts> <out-dir> [figure ...]
//
// Writes <out-dir>/<figure>.mp4 and .gif. The old rig is usually `git show <rev>:next-app/src/lib/figures/rig.ts`.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(path.resolve("package.json"));
const { createJiti } = require("jiti");
const sharp = require("sharp");
const jiti = createJiti(import.meta.url);

const [oldPath, outDir, ...ids] = process.argv.slice(2);
const before = await jiti.import(path.resolve(oldPath));
const after = await jiti.import(path.resolve("src/lib/figures/rig.ts"));
const figs = ids.length ? ids : ["squat", "deadlift", "sled", "farmer", "hswalk", "hipflex"];
fs.mkdirSync(outDir, { recursive: true });

const W = 360, H = 300, FPS = 30, BG = "#16181c";

function panel(rig, id, t, x0, title) {
  const f = rig.drawFigure(id, "B", t, false);
  const box = rig.figureBounds(id, "B");
  const s = Math.min((W - 20) / box.w, (H - 50) / box.h), drawn = s * box.h;
  const polys = f.slots
    .filter((sl) => sl.w > 0 || sl.shape)
    .map((sl) => {
      const edge = sl.shape ? rig.shapeEdge(sl.color, drawn) : null;
      const sw = sl.shape ? edge.px / s : rig.strokePx(sl.w, drawn, rig.ACCENTS.includes(sl.color)) / s;
      return `<polyline points="${sl.shape ?? sl.pts}" stroke="${sl.shape ? edge.color : sl.color}" stroke-width="${sw}" opacity="${sl.op}" fill="${sl.shape ? sl.color : sl.fill}" stroke-dasharray="${sl.dash === "none" ? "none" : sl.dash}" stroke-linecap="round" stroke-linejoin="round"/>`;
    })
    .join("");
  const ox = x0 + (W - s * box.w) / 2, oy = 40 + (H - 50 - s * box.h) / 2;
  return `<text x="${x0 + W / 2}" y="26" fill="#c9ced6" font-family="Helvetica" font-size="16" text-anchor="middle">${title}</text>
<svg x="${ox}" y="${oy}" width="${s * box.w}" height="${s * box.h}" viewBox="${box.x} ${box.y} ${box.w} ${box.h}" overflow="hidden"><g transform="${f.tf}">${polys}</g></svg>`;
}

for (const id of figs) {
  const f = after.FIGS[id];
  const cycle = f.kind === "hold" ? 6000 : f.kind === "move2" ? f.dur : f.dur * (f.kind === "gait" ? 2 : 1);
  const n = Math.round((cycle / 1000) * FPS), dir = path.join(outDir, `.frames-${id}`);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir);
  for (let i = 0; i < n; i++) {
    const t = (i * 1000) / FPS;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W * 2}" height="${H}"><rect width="100%" height="100%" fill="${BG}"/>
${panel(before, id, t, 0, "before")}${panel(after, id, t, W, "after")}<line x1="${W}" y1="10" x2="${W}" y2="${H - 10}" stroke="#2f333a"/></svg>`;
    await sharp(Buffer.from(svg)).png().toFile(path.join(dir, `${String(i).padStart(4, "0")}.png`));
  }
  const mp4 = path.join(outDir, `${id}.mp4`), gif = path.join(outDir, `${id}.gif`);
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-framerate", String(FPS), "-i", path.join(dir, "%04d.png"), "-pix_fmt", "yuv420p", "-vf", "scale=720:-2", mp4]);
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-framerate", String(FPS), "-i", path.join(dir, "%04d.png"), "-vf", "fps=20,scale=540:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=48[p];[b][p]paletteuse", gif]);
  fs.rmSync(dir, { recursive: true, force: true });
  console.log("wrote", id);
}
