"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ACCENTS,
  drawFigure,
  figureBounds,
  figureIsStatic,
  FIGURE_SLOTS,
  shapeEdge,
  strokePx,
  type FigureFrame,
  type FigureSide,
  type FigureSlot,
} from "@/lib/figures/rig";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

/** Below this drawn height (a brief thumbnail) the L/R badges are noise: the name row says the side. */
const BADGE_MIN_PX = 64;

/**
 * Renders one exercise illustration (see lib/figures/rig.ts).
 *
 * The SVG nodes are rendered ONCE and then updated in place from a single
 * requestAnimationFrame loop, gated to 30 fps, writing an attribute only when
 * its value changed (motion review, 2026-10-19). Re-rendering 22 elements
 * through React every frame would compete with the set timer for nothing,
 * and holds — which stop changing after 0.9 s — would keep painting.
 *
 * The loop runs only while `playing`. Time comes from the player's clock
 * (`getElapsed`), never accumulated frame deltas, so resuming after a pause or
 * a backgrounded app never jumps. rAF itself stops while the page is hidden.
 *
 * Figure review (2026-10-28): the viewBox is fitted to the figure's whole
 * cycle instead of a fixed 358x201, and strokes are sized in SCREEN px for the
 * size the figure is actually drawn at (`strokePx`), so a 40px brief thumbnail
 * and the 144px Today tile both read as a figure. A figure that is not playing
 * and has not started shows its poster pose (chin over the bar, not a dead hang).
 */
export function ExerciseFigure({
  figure,
  side,
  playing,
  getElapsed,
}: {
  figure: string;
  side: FigureSide | "E";
  playing: boolean;
  getElapsed: () => number;
}) {
  const reduced = usePrefersReducedMotion();
  const svgRef = useRef<SVGSVGElement>(null);
  const box = figureBounds(figure, side);
  // Drawn height of the fitted box in px; the tile is the default until measured.
  const [drawnPx, setDrawnPx] = useState(144);
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const measure = () => {
      const r = svg.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) setDrawnPx(Math.round(Math.min(r.width / box.w, r.height / box.h) * box.h));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(svg);
    return () => ro.disconnect();
  }, [box.w, box.h]);
  // A filled body part (`shape`) takes its mass from geometry; its stroke is only a thin edge that keeps
  // a thumbnail from breaking up. A skeleton-only slot (prop, ring, ghost) keeps px-sized strokes.
  const width = useCallback(
    (s: FigureSlot) =>
      s.w <= 0 ? "0" : s.shape ? String(shapeEdge(s.color, drawnPx).px) : String(strokePx(s.w, drawnPx, ACCENTS.includes(s.color))),
    [drawnPx],
  );
  const edge = useCallback(
    (s: FigureSlot) => (s.w <= 0 ? "none" : s.shape ? shapeEdge(s.color, drawnPx).color : s.color),
    [drawnPx],
  );
  const showBadges = drawnPx >= BADGE_MIN_PX;
  const still = !playing && getElapsed() <= 0;
  const first: FigureFrame = useMemo(() => drawFigure(figure, side, 0, reduced, still), [figure, side, reduced, still]);

  const paint = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const t = getElapsed();
    const f = drawFigure(figure, side, t, reduced, !playing && t <= 0);
    const set = (el: Element | null, name: string, value: string) => {
      if (el && el.getAttribute(name) !== value) el.setAttribute(name, value);
    };
    set(svg, "aria-label", f.label);
    set(svg.querySelector("g"), "transform", f.tf);
    const polys = svg.querySelectorAll("polyline");
    f.slots.forEach((s, i) => {
      const el = polys[i];
      set(el, "points", s.shape ?? s.pts);
      set(el, "stroke", edge(s));
      set(el, "stroke-width", width(s));
      set(el, "opacity", String(s.op));
      set(el, "fill", s.shape ? s.color : s.fill);
      set(el, "stroke-dasharray", s.dash);
    });
    const circles = svg.querySelectorAll("circle");
    const texts = svg.querySelectorAll("text");
    f.badges.forEach((b, j) => {
      set(circles[j], "cx", String(b.x));
      set(circles[j], "cy", String(b.y));
      set(circles[j], "fill", b.color);
      set(circles[j], "opacity", String(showBadges ? b.op : 0));
      set(texts[j], "x", String(b.x));
      set(texts[j], "y", String(b.y));
      set(texts[j], "opacity", String(showBadges ? b.op : 0));
      if (texts[j] && texts[j].textContent !== b.letter) texts[j].textContent = b.letter;
    });
  }, [figure, side, reduced, getElapsed, playing, width, edge, showBadges]);

  useEffect(() => {
    paint();
    if (!playing || reduced) return;
    let raf = 0;
    let last = 0;
    const loop = (ts: number) => {
      if (ts - last >= 33) {
        last = ts;
        paint();
        if (figureIsStatic(figure, getElapsed(), reduced)) return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [paint, playing, reduced, figure, getElapsed]);

  return (
    <svg
      ref={svgRef}
      viewBox={`${box.x} ${box.y} ${box.w} ${box.h}`}
      className="h-full w-full"
      role="img"
      aria-label={first.label}
    >
      <g transform={first.tf || undefined}>
        {Array.from({ length: FIGURE_SLOTS }, (_, i) => {
          const s = first.slots[i];
          return (
            <polyline
              key={i}
              points={s.shape ?? s.pts}
              stroke={edge(s)}
              strokeWidth={width(s)}
              vectorEffect="non-scaling-stroke"
              opacity={s.op}
              fill={s.shape ? s.color : s.fill}
              strokeDasharray={s.dash}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        })}
        {first.badges.map((b, j) => (
          <circle key={`c${j}`} cx={b.x} cy={b.y} r={10} fill={b.color} opacity={showBadges ? b.op : 0} />
        ))}
        {first.badges.map((b, j) => (
          <text
            key={`t${j}`}
            x={b.x}
            y={b.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={12}
            fontWeight={800}
            fill="#0e0f12"
            opacity={showBadges ? b.op : 0}
          >
            {b.letter}
          </text>
        ))}
      </g>
    </svg>
  );
}
