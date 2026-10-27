#!/usr/bin/env node
// Builds every Terav brand asset from one geometry source and writes it to
// brand/ (the SVG masters) and to BOTH public folders (next-app + landing),
// so the app, terav.fit and the ads can never drift apart again.
//
//   node dev/scripts/brand/build-brand-assets.mjs
//
// Direction B · Lettermark, owner-approved 2026-10-27 (dev/active/brand/).
// The glyphs are Inter ExtraBold (800) outlines, extracted once with
// fontTools from the Google Fonts static TTF into brand/glyphs.json.
// Inter is OFL-licensed; outlining it into a logo is allowed.
// Re-run this script after any geometry or colour change and commit the output.
//
// Rendering uses sharp from next-app/node_modules (no extra dependency).

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../..");
const require = createRequire(path.join(ROOT, "next-app/package.json"));
const sharp = require("sharp");

// ── colours: must match brand/tokens.css ────────────────────────────────
const GROUND = "#0e0f12";
const STRONG = "#f4f5f7";
const BRONZE = "#c89666";
const INK_LIGHT = "#14110d"; // wordmark on cream / white

// ── Inter 800 outlines (font units, 2048 upm, y-up) ─────────────────────
// brand/glyphs.json holds t e r a v . as { adv, d }.
const G = JSON.parse(fs.readFileSync(path.join(ROOT, "brand/glyphs.json"), "utf8"));

const TRACK = -82; // −0.04em at 2048 upm
const ASC = 1384, DESC = -21; // bbox of the "t." group, y-up

// A run of glyphs laid out left to right; returns [{ch, x}] and total width.
function layout(text) {
  let x = 0;
  const out = [];
  for (const ch of text) {
    out.push({ ch, x });
    x += G[ch].adv + TRACK;
  }
  return out;
}

// SVG <path>s for a run, each glyph flipped from y-up into SVG space.
function runPaths(text, { ink, dot }) {
  return layout(text)
    .map(({ ch, x }) => `<path transform="translate(${x} 0)" fill="${ch === "." ? dot : ink}" d="${G[ch].d}"/>`)
    .join("");
}

// The "t." mark bbox in font units: t from x=20, the dot ends at its own xMax.
const MARK_X0 = 20;
const MARK_X1 = layout("t.")[1].x + 550;
const MARK_W = MARK_X1 - MARK_X0;
const MARK_H = ASC - DESC;

// The "t." mark placed so its glyph box is `h` px tall, centred in an S×S
// (or W×H) canvas. Optical nudge: the dot makes the group right-heavy, so
// shift it 2% of its width left of geometric centre.
function markGroup(W, H, h, { ink = STRONG, dot = BRONZE } = {}) {
  const k = h / MARK_H;
  const w = MARK_W * k;
  const x = (W - w) / 2 - 0.02 * w - MARK_X0 * k;
  const y = (H - h) / 2 + ASC * k;
  return `<g transform="translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${k.toFixed(5)} ${(-k).toFixed(5)})">${runPaths("t.", { ink, dot })}</g>`;
}

const svgDoc = (W, H, body, extra = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"${extra}>${body}</svg>\n`;

// ── masters ─────────────────────────────────────────────────────────────
// icon (purpose "any", apple-touch): full-bleed ground, glyph 56% tall.
const iconAny = svgDoc(512, 512, `<rect width="512" height="512" fill="${GROUND}"/>${markGroup(512, 512, 0.56 * 512)}`);
// maskable: every point of the glyph box inside the central circle of radius
// 0.33·S (stricter than the spec's 0.4), so no launcher mask can clip it.
const maskH = (2 * 0.33 * 512) / Math.hypot(MARK_W / MARK_H, 1);
const iconMaskable = svgDoc(512, 512, `<rect width="512" height="512" fill="${GROUND}"/>${markGroup(512, 512, maskH)}`);
// favicon.svg: rounded tile so the mark sits on its own ground in a light tab.
const faviconSvg = svgDoc(64, 64, `<rect width="64" height="64" rx="14" fill="${GROUND}"/>${markGroup(64, 64, 0.62 * 64)}`);
// 16px favicon, hand-tuned to the pixel grid (vector downscaling smears it).
const favicon16 = svgDoc(16, 16, [
  `<rect width="16" height="16" rx="3" fill="${GROUND}"/>`,
  `<g fill="${STRONG}" shape-rendering="crispEdges">`,
  `<rect x="4" y="2" width="3" height="11"/>`, // stem
  `<rect x="3" y="5" width="6" height="2"/>`, // crossbar, overhangs the stem like Inter's
  `<rect x="7" y="11" width="2" height="2"/>`, // foot
  `</g>`,
  // dot: a solid 2×2 — at 16px a 3px "round" dot reads as a plus sign
  `<rect x="10" y="11" width="2" height="2" fill="${BRONZE}" shape-rendering="crispEdges"/>`,
].join(""));

// mark only, transparent — for splash, ads, slides.
const markSvg = (ink, dot) => svgDoc(MARK_W, MARK_H, `<g transform="translate(${-MARK_X0} ${ASC}) scale(1 -1)">${runPaths("t.", { ink, dot })}</g>`);

// wordmark "terav." — transparent, tight box from the t's top to the descender.
const WORD = layout("terav.");
const WORD_W = WORD.at(-1).x + 550;
const wordSvg = (ink, dot) =>
  svgDoc(WORD_W, MARK_H, `<g transform="translate(0 ${ASC}) scale(1 -1)">${runPaths("terav.", { ink, dot })}</g>`, ' role="img" aria-label="Terav"');

const masters = {
  "icon.svg": iconAny,
  "icon-maskable.svg": iconMaskable,
  "favicon.svg": faviconSvg,
  "favicon-16.svg": favicon16,
  "mark.svg": markSvg(STRONG, BRONZE),
  "mark-light.svg": markSvg(INK_LIGHT, BRONZE),
  "mark-mono.svg": markSvg("currentColor", "currentColor"),
  "wordmark.svg": wordSvg(STRONG, BRONZE),
  "wordmark-light.svg": wordSvg(INK_LIGHT, BRONZE),
  "wordmark-mono.svg": wordSvg("currentColor", "currentColor"),
};
for (const [f, s] of Object.entries(masters)) fs.writeFileSync(path.join(ROOT, "brand", f), s);

// ── rasters ─────────────────────────────────────────────────────────────
const png = (svg, size) => sharp(Buffer.from(svg), { density: 72 * Math.max(1, size / 64) }).resize(size, size).png({ compressionLevel: 9 }).toBuffer();

const rasters = {
  "favicon-16.png": await png(favicon16, 16),
  "favicon-32.png": await png(faviconSvg, 32),
  "favicon-48.png": await png(faviconSvg, 48),
  "apple-touch-icon.png": await sharp(await png(iconAny, 180)).flatten({ background: GROUND }).png().toBuffer(),
  "icon-192.png": await png(iconAny, 192),
  "icon-512.png": await png(iconAny, 512),
  "icon-maskable-192.png": await png(iconMaskable, 192),
  "icon-maskable-512.png": await png(iconMaskable, 512),
};

// favicon.ico: PNG-in-ICO container with the 16/32/48 frames.
function ico(frames) {
  const head = Buffer.alloc(6 + 16 * frames.length);
  head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(frames.length, 4);
  let offset = head.length;
  frames.forEach(([size, buf], i) => {
    const o = 6 + 16 * i;
    head.writeUInt8(size % 256, o); head.writeUInt8(size % 256, o + 1);
    head.writeUInt16LE(1, o + 4); head.writeUInt16LE(32, o + 6);
    head.writeUInt32LE(buf.length, o + 8); head.writeUInt32LE(offset, o + 12);
    offset += buf.length;
  });
  return Buffer.concat([head, ...frames.map(([, b]) => b)]);
}
rasters["favicon.ico"] = ico([[16, rasters["favicon-16.png"]], [32, rasters["favicon-32.png"]], [48, rasters["favicon-48.png"]]]);

// ── iOS splash (apple-touch-startup-image), portrait iPhones ───────────
// iOS shows a blank white screen while an installed PWA launches unless one
// of these matches the device exactly. CSS size × DPR. Android builds its own
// splash from the manifest (name + background_color + icon).
export const SPLASH = [
  [440, 956, 3], // 16 Pro Max, 17 Pro Max
  [420, 912, 3], // iPhone Air
  [402, 874, 3], // 16 Pro, 17, 17 Pro
  [430, 932, 3], // 14 Pro Max, 15 Plus/Pro Max, 16 Plus
  [393, 852, 3], // 14 Pro, 15, 15 Pro, 16
  [428, 926, 3], // 12/13 Pro Max, 14 Plus
  [390, 844, 3], // 12, 13, 14, 12/13 Pro
  [375, 812, 3], // X, XS, 11 Pro, 12/13 mini
  [414, 896, 3], // XS Max, 11 Pro Max
  [414, 896, 2], // XR, 11
  [414, 736, 3], // 6+/7+/8 Plus
  [375, 667, 2], // SE 2/3, 8
];
const splash = {};
for (const [w, h, r] of SPLASH) {
  const W = w * r, H = h * r;
  const svg = svgDoc(W, H, `<rect width="${W}" height="${H}" fill="${GROUND}"/>${markGroup(W, H, 0.2 * W)}`);
  splash[`splash/iphone-${W}x${H}.png`] = await sharp(Buffer.from(svg)).png({ compressionLevel: 9, palette: true }).toBuffer();
}

// ── write ───────────────────────────────────────────────────────────────
const shared = { ...rasters, "icon.svg": faviconSvg, "wordmark.svg": masters["wordmark.svg"], "mark.svg": masters["mark.svg"] };
const targets = {
  "next-app/public": { ...shared, ...splash },
  "landing/public": shared,
};
for (const [dir, files] of Object.entries(targets)) {
  for (const [f, buf] of Object.entries(files)) {
    const p = path.join(ROOT, dir, f);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, buf);
  }
}

// The app's layout reads this list for metadata.appleWebApp.startupImage.
const ts = `// GENERATED by dev/scripts/brand/build-brand-assets.mjs — do not edit.
// iOS PWA launch screens: one per portrait iPhone size (CSS px × DPR).
export const SPLASH_SCREENS = ${JSON.stringify(
  SPLASH.map(([w, h, r]) => ({
    url: `/splash/iphone-${w * r}x${h * r}.png`,
    media: `(device-width: ${w}px) and (device-height: ${h}px) and (-webkit-device-pixel-ratio: ${r}) and (orientation: portrait)`,
  })),
  null,
  2,
)};
`;
fs.writeFileSync(path.join(ROOT, "next-app/src/lib/brand-splash.ts"), ts);

console.log(`brand: ${Object.keys(masters).length} masters, ${Object.keys(rasters).length} rasters, ${Object.keys(splash).length} splash screens`);
