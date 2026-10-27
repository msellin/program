// Renders the ad headline cards. Run from the repo root:
//   node dev/active/launch-readiness/ads/make-creatives.mjs
// Uses sharp from the landing's node_modules; fonts are the system sans-serif.
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.resolve(here, "../../../../landing/package.json"));
const sharp = require("sharp");

const sets = {
  pullup: ["Pull-up progressions,", "with sources"],
  handstand: ["Handstand walk,", "step by step"],
  strengthcardio: ["Add cardio.", "Keep your strength."],
};
const out = path.join(here, "creatives");
mkdirSync(out, { recursive: true });

function svg(w, h, lines) {
  const cy = h / 2;
  const fs = w === 1080 ? 96 : 104;
  const text = lines
    .map((l, i) => `<text x="${w / 2}" y="${cy + (i - 0.5) * (fs * 1.15)}" text-anchor="middle" font-size="${fs}" font-weight="800" fill="#ffffff">${l}</text>`)
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" font-family="Helvetica, Arial, sans-serif">
  <defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#e0b184"/><stop offset="1" stop-color="#4fb8b0"/></linearGradient></defs>
  <rect width="${w}" height="${h}" fill="#0e0f12"/>
  <rect x="${w / 2 - 90}" y="${cy - fs * 1.9}" width="180" height="8" rx="4" fill="url(#g)"/>
  ${text}
  <text x="${w / 2}" y="${cy + fs * 1.45}" text-anchor="middle" font-size="40" fill="rgba(255,255,255,0.7)">Free during the beta</text>
  <text x="${w / 2}" y="${h - (h === 1920 ? 300 : 90)}" text-anchor="middle" font-size="48" font-weight="800" letter-spacing="10" fill="#d09a68">TERAV</text>
</svg>`;
}

for (const [name, lines] of Object.entries(sets)) {
  for (const [w, h] of [[1080, 1080], [1080, 1920]]) {
    await sharp(Buffer.from(svg(w, h, lines))).png().toFile(path.join(out, `${name}-${w}x${h}.png`));
  }
}
console.log("done");
