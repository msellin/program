// Contact sheets of every exercise figure, rendered from the live rig (lib/figures/rig.ts).
//
//   cd next-app && node ../dev/active/figure-review/render-figures.mjs <out-dir> [figure ...]
//
// Per figure: frames through one cycle at review size, the reduced-motion frame, the 144px Today
// tile and the 56x40 brief thumbnail (both at their real pixel size, then shown 2x so a reviewer can
// see what a phone shows). Stroke widths come from the renderer's own `strokeWidth`, so a sheet is
// what the app draws, not an approximation.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

// Resolve jiti and sharp from next-app/node_modules (the cwd), not from this file's folder.
const require = createRequire(path.resolve("package.json"));
const { createJiti } = require("jiti");
const sharp = require("sharp");

const jiti = createJiti(import.meta.url);
const rig = await jiti.import(path.resolve("src/lib/figures/rig.ts"));
const map = (await jiti.import(path.resolve("src/lib/figures/exercise-figures.ts"))).EXERCISE_FIGURES;
const { FIGS, drawFigure } = rig;
// Before the 2026-10-28 review: fixed 358x201 box, widths x1.2. After: fitted box, screen-px strokes.
const fitted = typeof rig.figureBounds === "function";

const out = path.resolve(process.argv[2] ?? "../dev/active/figure-review/png");
const only = process.argv.slice(3);
fs.mkdirSync(out, { recursive: true });

const SURFACE = "#16181c", GROUND = "#0e0f12", TILE = "#2a241e"; // tile ≈ bronze/15 over ground

function figSvg(f, x, y, w, h, bg, id, side, zoom = 1) {
  const box = fitted ? rig.figureBounds(id, side) : { x: 0, y: 0, w: 358, h: 201 };
  const scale = Math.min(w / box.w, h / box.h), drawn = (scale * box.h) / zoom;
  const sw = (s) => fitted ? (rig.strokePx(s.w, drawn, rig.ACCENTS.includes(s.color)) * zoom) / scale : (s.w <= 4 ? s.w * 1.25 : s.w * 1.2);
  const polys = f.slots
    .filter((s) => s.w > 0 || s.shape)
    .map((s) => `<polyline points="${s.shape ?? s.pts}" stroke="${s.w <= 0 ? "none" : s.shape && rig.shapeEdge ? rig.shapeEdge(s.color, drawn).color : s.color}" stroke-width="${s.shape ? (rig.shapeEdge ? rig.shapeEdge(s.color, drawn).px : 1) * zoom / scale : sw(s)}" opacity="${s.op}" fill="${s.shape ? s.color : s.fill}" stroke-dasharray="${s.dash}" stroke-linecap="round" stroke-linejoin="round"/>`)
    .join("");
  const badges = f.badges
    .filter((b) => b.op > 0 && (!fitted || drawn >= 64))
    .map((b) => `<circle cx="${b.x}" cy="${b.y}" r="10" fill="${b.color}"/><text x="${b.x}" y="${b.y + 4}" text-anchor="middle" font-size="12" font-weight="800" font-family="Helvetica" fill="#0e0f12">${b.letter}</text>`)
    .join("");
  const floor = f.floor && !fitted ? `<ellipse cx="179" cy="169" rx="118" ry="5" fill="#c89666" opacity="0.14"/>` : "";
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${bg}"/><svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${box.x} ${box.y} ${box.w} ${box.h}"><g transform="${f.tf}">${floor}${polys}${badges}</g></svg>`;
}

function times(fig) {
  if (fig.kind === "hold") return [0, 300, 2000];
  const dur = fig.kind === "move2" ? fig.dur / 2 : fig.dur, k = fig.k;
  const fr = [0, (k[0] + k[1]) / 2, k[1] + 0.01, (k[2] + 1) / 2];
  const t = fr.map((x) => Math.round(x * dur));
  return fig.kind === "move2" ? [...t, ...t.map((x) => x + dur)] : t;
}

async function sheet(name, ids) {
  const FW = 268, FH = 151, rowH = FH + 34, cols = 9;
  const W = 16 + cols * (FW + 10) + 2 * 112 + 2 * 288 + 40;
  let body = "", y = 10;
  for (const id of ids) {
    const fig = FIGS[id];
    const side = fig.sided ? "L" : "B";
    const exs = Object.entries(map).filter(([, v]) => v === id).map(([k]) => k);
    body += `<text x="16" y="${y + 14}" font-family="Helvetica" font-size="15" font-weight="700" fill="#e8e4dc">${id}</text>`;
    body += `<text x="${16 + 10 + id.length * 9}" y="${y + 14}" font-family="Helvetica" font-size="12" fill="#9aa0a8">${fig.kind}${fig.dur ? " " + fig.dur + "ms" : ""} — ${exs.join(", ").slice(0, 170) || "(no exercise mapped)"}</text>`;
    let x = 16;
    const ts = times(fig);
    for (const t of ts) {
      body += figSvg(drawFigure(id, side, t, false), x, y + 22, FW, FH, SURFACE, id, side);
      body += `<text x="${x + 6}" y="${y + 36}" font-family="Helvetica" font-size="11" fill="#6b717d">${t}ms</text>`;
      x += FW + 10;
    }
    body += figSvg(drawFigure(id, side, 0, true), x, y + 22, FW, FH, SURFACE, id, side);
    body += `<text x="${x + 6}" y="${y + 36}" font-family="Helvetica" font-size="11" fill="#6b717d">reduced</text>`;
    x += FW + 20;
    // Today tile: 144px square (before: the 358x201 box letterboxed to 144x81), drawn 2x. Brief thumb: 56x40, drawn 2x.
    body += figSvg(drawFigure(id, side, ts[2] ?? 2000, false), x, y + 22 + 40, fitted ? 288 : 288, fitted ? 288 : 162, TILE, id, side, 2);
    body += `<text x="${x}" y="${y + 50}" font-family="Helvetica" font-size="11" fill="#6b717d">Today tile 144px (2x)</text>`;
    x += 300;
    body += figSvg(drawFigure(id, side, 0, false, true), x, y + 22 + 40, 112, 80, GROUND, id, side, 2);
    body += `<text x="${x}" y="${y + 50}" font-family="Helvetica" font-size="11" fill="#6b717d">brief 56x40 (2x)</text>`;
    y += Math.max(rowH, 40 + (fitted ? 288 : 162) + 34);
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${y + 10}"><rect width="100%" height="100%" fill="#0b0c0e"/>${body}</svg>`;
  await sharp(Buffer.from(svg)).png().toFile(path.join(out, name + ".png"));
  // The real-size thumbnails, side by side: the "do variants look different" test.
  return name;
}

async function thumbs(ids) {
  const per = 8, cw = 56, ch = 40, gap = 10, lab = 14;
  const rows = Math.ceil(ids.length / per);
  let body = "";
  ids.forEach((id, i) => {
    const x = 8 + (i % per) * (cw + gap + 40), y = 8 + Math.floor(i / per) * (ch + lab + gap);
    const sd = FIGS[id].sided ? "L" : "B";
    body += figSvg(drawFigure(id, sd, 0, false, true), x, y, cw, ch, GROUND, id, sd);
    body += `<text x="${x}" y="${y + ch + 11}" font-family="Helvetica" font-size="9" fill="#9aa0a8">${id}</text>`;
  });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${8 + per * (cw + gap + 40)}" height="${16 + rows * (ch + lab + gap)}"><rect width="100%" height="100%" fill="#16181c"/>${body}</svg>`;
  await sharp(Buffer.from(svg)).png().toFile(path.join(out, "thumbs-actual-size.png"));
}

const ids = only.length ? only : Object.keys(FIGS);
const groups = {};
ids.forEach((id, i) => ((groups["sheet-" + String(Math.floor(i / 6) + 1).padStart(2, "0")] ??= []).push(id)));
for (const [n, g] of Object.entries(groups)) await sheet(n, g);
await thumbs(ids);
fs.writeFileSync(path.join(out, "index.txt"), Object.entries(groups).map(([n, g]) => n + ": " + g.join(", ")).join("\n") + "\n");
console.log("wrote", Object.keys(groups).length, "sheets for", ids.length, "figures to", out);
