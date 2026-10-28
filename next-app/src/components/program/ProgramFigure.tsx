"use client";

import { useCallback, useEffect, useState } from "react";
import { figureFor } from "@/lib/figures/exercise-figures";
import { ExerciseFigure } from "@/components/follow-along/ExerciseFigure";

/**
 * Candidate exercise ids per program, in order of how well they stand for it.
 * The first one that has an SVG figure wins; none -> the caller degrades to a
 * title-only hero. Ids are checked against figureFor, not against the library,
 * so a candidate that has no figure yet is simply skipped.
 */
const HERO_CANDIDATES: Record<string, string[]> = {
  "first-strict-pullup": ["pu_active_hang", "pu_dead_hang", "pu_negative_pullup_5s", "pu_scap_pull"],
  "handstand-walk": ["hs_wall_hs_hold_chest", "hs_wall_walk", "hs_wall_shoulder_taps"],
  "muscle-up": ["mu_false_grip_hang", "mu_ring_dip_support_hold", "mu_false_grip_pullup"],
  "overhead-mobility": ["om_passive_bar_hang", "om_supine_dowel_pullover", "om_foam_roller_thoracic_ext"],
  "anterior-hip-rebuild": ["hip_flexor_iso_seated", "glute_bridge_single"],
  "concurrent-strength-maintenance": ["back_squat", "deadlift_conventional", "goblet_squat"],
  "engine-builder": [],
  "engine-builder-block-2": [],
  "rowing-2k-test-prep": [],
};

export function heroFigureId(slug: string): string | null {
  for (const ex of HERO_CANDIDATES[slug] ?? []) {
    const f = figureFor(ex);
    if (f) return f;
  }
  return null;
}

/** An animated figure that loops; renders nothing when the program has none. */
export function ProgramFigure({ slug, className }: { slug: string; className?: string }) {
  const figure = heroFigureId(slug);
  const [start, setStart] = useState(0);
  useEffect(() => setStart(Date.now()), []);
  const getElapsed = useCallback(() => Date.now() - start, [start]);
  if (!figure) return null;
  return (
    <div className={`relative ${className ?? ""}`}>
      <div aria-hidden className="absolute inset-0 bg-bronze/10" />
      <div className="relative h-full w-full">
        <ExerciseFigure figure={figure} side="B" playing getElapsed={getElapsed} />
      </div>
    </div>
  );
}
