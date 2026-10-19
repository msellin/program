/**
 * Which illustration each exercise uses. An exercise with no entry has no
 * figure yet; the player shows its name and the "Full tutorial" video link.
 *
 * Keyed by exercise id from the shared library (public/data/exercises.json).
 * `data-integrity`-style guard: `exercise-figures.test.ts` fails if a key stops
 * resolving or a figure id stops existing.
 */
import { FIGS } from "./rig";

export const EXERCISE_FIGURES: Record<string, keyof typeof FIGS> = {
  hip_flexor_iso_seated: "hipflex",
  adductor_iso_bent: "adductor",
  adductor_iso_extended: "adductor",
  glute_bridge_single: "bridge",
  dead_bug: "deadbug",
  hip_flexor_stretch_kneeling: "kneel",
  hip_switch_9090: "ninety",
  om_passive_bar_hang: "hang",
  om_supine_dowel_pullover: "pullover",
  om_foam_roller_thoracic_ext: "roller",
};

export function figureFor(exerciseId: string): string | null {
  return EXERCISE_FIGURES[exerciseId] ?? null;
}
