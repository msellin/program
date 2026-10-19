"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { drawFigure, figureIsStatic, FIGURE_SLOTS, type FigureFrame, type FigureSide } from "@/lib/figures/rig";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

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
  const first: FigureFrame = useMemo(() => drawFigure(figure, side, 0, reduced), [figure, side, reduced]);

  const paint = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const f = drawFigure(figure, side, getElapsed(), reduced);
    const set = (el: Element | null, name: string, value: string) => {
      if (el && el.getAttribute(name) !== value) el.setAttribute(name, value);
    };
    set(svg, "aria-label", f.label);
    set(svg.querySelector("g"), "transform", f.tf);
    const polys = svg.querySelectorAll("polyline");
    f.slots.forEach((s, i) => {
      const el = polys[i];
      set(el, "points", s.pts);
      set(el, "stroke", s.color);
      set(el, "stroke-width", String(s.w));
      set(el, "opacity", String(s.op));
      set(el, "fill", s.fill);
      set(el, "stroke-dasharray", s.dash);
    });
    const circles = svg.querySelectorAll("circle");
    const texts = svg.querySelectorAll("text");
    f.badges.forEach((b, j) => {
      set(circles[j], "cx", String(b.x));
      set(circles[j], "cy", String(b.y));
      set(circles[j], "fill", b.color);
      set(circles[j], "opacity", String(b.op));
      set(texts[j], "x", String(b.x));
      set(texts[j], "y", String(b.y));
      set(texts[j], "opacity", String(b.op));
      if (texts[j] && texts[j].textContent !== b.letter) texts[j].textContent = b.letter;
    });
  }, [figure, side, reduced, getElapsed]);

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
      viewBox="0 0 358 201"
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
              points={s.pts}
              stroke={s.color}
              strokeWidth={s.w}
              opacity={s.op}
              fill={s.fill}
              strokeDasharray={s.dash}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        })}
        {first.badges.map((b, j) => (
          <circle key={`c${j}`} cx={b.x} cy={b.y} r={10} fill={b.color} opacity={b.op} />
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
            opacity={b.op}
          >
            {b.letter}
          </text>
        ))}
      </g>
    </svg>
  );
}
