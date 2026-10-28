// Before/after strip for the founder: the same figures from the pre-review rig (git HEAD before
// 2026-10-28, copied to .old/rig.ts) and the current one, at the two sizes users actually see.
//
//   cd next-app && git show <before>:next-app/src/lib/figures/rig.ts > ../dev/active/figure-review/.old/rig.ts
//   node ../dev/active/figure-review/compare-figures.mjs <out.png> fig[:side] ...
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(path.resolve("package.json"));
const { createJiti } = require("jiti");
const sharp = require("sharp");
const jiti = createJiti(import.meta.url);
const here = path.dirname(new URL(import.meta.url).pathname);
const before = await jiti.import(path.join(here, ".old/rig.ts"));
const after = await jiti.import(path.resolve("src/lib/figures/rig.ts"));
const [out, ...want] = process.argv.slice(2);

function svgFor(rig, id, side, x, y, w, h, bg, still) {
  const fitted = typeof rig.figureBounds === "function";
  if (!rig.FIGS[id]) return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${bg}"/><text x="${x + w / 2}" y="${y + h / 2}" text-anchor="middle" font-family="Helvetica" font-size="${Math.max(9, h / 8)}" fill="#6b717d">no figure</text>`;
  const f = fitted ? rig.drawFigure(id, side, still ? 0 : 2400, false, still) : rig.drawFigure(id, side, still ? 0 : 2400, false);
  const box = fitted ? rig.figureBounds(id, side) : { x: 0, y: 0, w: 358, h: 201 };
  const s = Math.min(w / box.w, h / box.h), drawn = s * box.h;
  const sw = (q) => (fitted ? rig.strokePx(q.w, drawn, rig.ACCENTS.includes(q.color)) / s : q.w <= 4 ? q.w * 1.25 : q.w * 1.2);
  const polys = f.slots.filter((q) => q.w > 0).map((q) => `<polyline points="${q.pts}" stroke="${q.color}" stroke-width="${sw(q)}" opacity="${q.op}" fill="${q.fill}" stroke-linecap="round" stroke-linejoin="round"/>`).join("");
  const badges = f.badges.filter((b) => b.op > 0 && (!fitted || drawn >= 64)).map((b) => `<circle cx="${b.x}" cy="${b.y}" r="10" fill="${b.color}"/>`).join("");
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${bg}"/><svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${box.x} ${box.y} ${box.w} ${box.h}"><g transform="${f.tf}">${polys}${badges}</g></svg>`;
}

// Drawn at 2x so the PNG shows what a phone's 144px tile and 56x40 brief row show.
const Z = 2, TILE = 144 * Z, TW = 56 * Z, TH = 40 * Z, rowH = TILE + 46;
let body = `<text x="20" y="30" font-family="Helvetica" font-size="20" font-weight="700" fill="#e8e4dc">Before</text><text x="${40 + TILE + TW + 30}" y="30" font-family="Helvetica" font-size="20" font-weight="700" fill="#c89666">After (figure review, 2026-10-28)</text>`;
want.forEach((spec, i) => {
  const [id, side = "B"] = spec.split(":"), y = 50 + i * rowH;
  body += `<text x="20" y="${y + 14}" font-family="Helvetica" font-size="14" fill="#9aa0a8">${id}</text>`;
  body += svgFor(before, id, side, 20, y + 22, TILE, TILE, "#2a231f", false);
  body += svgFor(before, id, side, 30 + TILE, y + 22 + TILE - TH, TW, TH, "#0e0f12", true);
  const ax = 40 + TILE + TW + 30;
  body += svgFor(after, id, side, ax, y + 22, TILE, TILE, "#2a231f", false);
  body += svgFor(after, id, side, ax + TILE + 10, y + 22 + TILE - TH, TW, TH, "#0e0f12", true);
});
const W = 2 * (40 + TILE + TW + 30), H = 60 + want.length * rowH;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="100%" height="100%" fill="#16181c"/>${body}</svg>`;
await sharp(Buffer.from(svg)).png().toFile(out);
console.log("wrote", out);
