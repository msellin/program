"use client";

import { loadFor } from "@/lib/plates";

/**
 * Compact SVG of a bar loaded with plates. Bronze accent on the bar,
 * plate colours by weight (Olympic-ish palette: 25 red, 20 blue, 15 yellow,
 * 10 green, 5 white, 2.5 dark, 1.25 slate).
 */
export function BarVisualizer({ targetKg, barKg = 20 }: { targetKg: number; barKg?: number }) {
  const { plates } = loadFor(targetKg, barKg);
  if (targetKg <= barKg) return null;

  // Plate widths scale gently with plate weight
  const width = (kg: number) => Math.max(6, Math.min(14, 4 + kg * 0.4));
  const height = (kg: number) => 14 + Math.min(kg * 0.6, 12);

  const sideWidth = plates.reduce((sum, p) => sum + width(p) + 1, 0);

  // Total width: sleeve × 2 + bar-shaft + labels
  const shaftLen = 44; // fixed shaft length in SVG units
  const svgH = 34;
  const svgW = sideWidth * 2 + shaftLen + 24; // padding
  const cy = svgH / 2;
  const shaftY = cy - 1.5;

  return (
    <svg
      viewBox={`0 0 ${svgW} ${svgH}`}
      width="100%"
      height={svgH}
      aria-label={`Bar loaded to ${targetKg} kg with ${plates.map((p) => p + " kg").join(", ")} per side`}
      className="max-w-[220px]"
    >
      {/* bar shaft */}
      <rect x={12 + sideWidth} y={shaftY} width={shaftLen} height={3} fill="#C89666" rx={1.5} />
      {/* left sleeve base */}
      <rect x={10 + sideWidth - 6} y={cy - 4} width={8} height={8} fill="#8A8F9A" />
      {/* right sleeve base */}
      <rect x={10 + sideWidth + shaftLen - 2} y={cy - 4} width={8} height={8} fill="#8A8F9A" />

      {/* plates per side */}
      {renderPlates(plates, 10, cy, "left", width, height)}
      {renderPlates(plates, 10 + sideWidth + shaftLen + 8, cy, "right", width, height)}
    </svg>
  );
}

function renderPlates(
  plates: number[],
  startX: number,
  cy: number,
  side: "left" | "right",
  width: (kg: number) => number,
  height: (kg: number) => number,
) {
  const nodes: React.ReactElement[] = [];
  // Left: draw outermost first (heaviest plate against sleeve), moving inward → so heaviest is nearest bar
  const ordered = side === "left" ? [...plates] : [...plates];
  let x = startX;
  if (side === "left") {
    // draw from left edge inward
    for (let i = 0; i < ordered.length; i++) {
      const p = ordered[i];
      const w = width(p);
      const h = height(p);
      nodes.push(
        <rect
          key={i}
          x={x}
          y={cy - h / 2}
          width={w - 1}
          height={h}
          rx={1.5}
          fill={plateColour(p)}
          stroke="#2A2E37"
          strokeWidth={1.5}
        />,
      );
      x += w + 1;
    }
  } else {
    // right: mirror so heaviest closest to bar
    x = startX;
    const reversed = [...ordered].reverse();
    for (let i = 0; i < reversed.length; i++) {
      const p = reversed[i];
      const w = width(p);
      const h = height(p);
      nodes.push(
        <rect
          key={i}
          x={x}
          y={cy - h / 2}
          width={w - 1}
          height={h}
          rx={1.5}
          fill={plateColour(p)}
          stroke="#2A2E37"
          strokeWidth={1.5}
        />,
      );
      x += w + 1;
    }
  }
  return nodes;
}

function plateColour(kg: number): string {
  // Olympic-ish palette adapted for the dark theme
  if (kg >= 25) return "#E5654B"; // red
  if (kg >= 20) return "#4A8894"; // blue
  if (kg >= 15) return "#E0A63A"; // yellow/amber
  if (kg >= 10) return "#5FB37A"; // green
  if (kg >= 5) return "#D6D9DE"; // white/light
  if (kg >= 2.5) return "#3A3F4A"; // dark
  return "#79B8C4"; // slate/small
}
