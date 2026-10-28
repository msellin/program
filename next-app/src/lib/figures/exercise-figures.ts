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
  // Ad path (2026-10-28): first-strict-pullup, handstand-walk, concurrent-strength-maintenance.
  pu_dead_hang: "hang",
  pu_active_hang: "activehang",
  pu_scap_retraction_hold: "activehang",
  pu_scap_pull: "scappull",
  pu_band_pullup_heavy: "pullup_band",
  pu_band_pullup_light: "pullup_band",
  pu_negative_pullup_5s: "pullup_negative",
  pu_negative_pullup_10s: "pullup_negative",
  pu_partial_rom_pullup: "pullup_partial",
  pu_isometric_top_hold: "pullup_top",
  pu_isometric_mid_hold: "pullup_mid",
  pu_slow_tempo_pullup: "pullup_slow",
  pu_first_strict_attempt: "pullup",
  pu_grease_the_groove_singles: "pullup",
  pu_ring_row_horizontal: "rowflat",
  pu_ring_row_incline: "rowincline",
  pu_ring_row_feet_elevated: "rowfeet",
  pu_shoulder_prep_band: "pullapart",
  pu_hollow_body_hold: "hollow",
  hs_hollow_body_hold: "hollow",
  pu_hollow_body_pullover: "pullover",
  hs_wrist_ext_prep: "wristprep",
  hs_wrist_pushups_floor: "wristprep",
  hs_finger_raises: "wristprep",
  hs_wrist_downdog_recovery: "downdog",
  hs_wrist_childs_recovery: "child",
  hs_wall_hs_hold_chest: "wallhs",
  hs_wall_hs_hold_belly: "wallhs",
  hs_wall_shoulder_taps: "wallhs",
  hs_wall_supported_shrugs: "wallhs",
  hs_half_pirouette_wall: "wallhs",
  quarter_pirouette_exit: "wallhs",
  hs_incline_90_hold: "wallhs",
  hs_incline_135_hold: "wallhs_lean",
  hs_wall_walk: "wallwalk",
  hs_kickup_practice: "kickup",
  hs_freestand_attempt: "hsfree",
  hs_half_pirouette_free: "hsfree",
  hs_full_pirouette_free: "hsfree",
  hs_tuck_freestand: "hstuck",
  hs_single_step_attempt: "hswalk",
  hs_walk_shuttle_2_3: "hswalk",
  hs_walk_continuous_line: "hswalk",
  hs_walk_marker_path: "hswalk",
  hs_walk_precision_path: "hswalk",
  hs_walk_through_cones: "hswalk",
  hs_walk_over_plate: "hswalk",
  back_squat_highbar: "squat",
  front_squat: "frontsquat",
  block_pull_midshin: "deadlift",
};

export function figureFor(exerciseId: string): string | null {
  return EXERCISE_FIGURES[exerciseId] ?? null;
}
