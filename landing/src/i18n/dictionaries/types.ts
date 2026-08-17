/**
 * Landing dictionary schema. All copy strings on the landing route through here.
 * When adding a new string: add it in EN first, then Estonian. Runtime type
 * enforces both dictionaries stay in sync.
 */
export type LandingDict = {
  locale: "en" | "et";
  // Hero
  hero: {
    beta_badge: string;
    h1_a: string;
    h1_b: string;
    h1_c: string;
    sub: string;
    cta_primary: string;
    cta_secondary: string;
    browse_link: string;
    stat_programs_value: string;
    stat_programs_label: string;
    stat_studies_value: string;
    stat_studies_label: string;
    stat_adapts_value: string;
    stat_adapts_label: string;
  };
  // Three-way contrast
  contrast: {
    eyebrow: string;
    title: string;
    col_template: string;
    col_trainer: string;
    col_terav: string;
    row_scope_label: string;
    row_scope_template: string;
    row_scope_trainer: string;
    row_scope_terav: string;
    row_what_label: string;
    row_what_template: string;
    row_what_trainer: string;
    row_what_terav: string;
    row_when_label: string;
    row_when_template: string;
    row_when_trainer: string;
    row_when_terav: string;
  };
  // How it works
  how: {
    eyebrow: string;
    title: string;
    step_01_title: string;
    step_01_body: string;
    step_02_title: string;
    step_02_body: string;
    step_03_title: string;
    step_03_body: string;
    evidence_link: string;
  };
  // Programs
  programs: {
    eyebrow: string;
    title: string;
    sub: string;
    // Card pitches — program names stay in English (brand consistency)
    engine_builder_pitch: string;
    csm_pitch: string;
    rowing_pitch: string;
    handstand_pitch: string;
    overhead_pitch: string;
    roadmap_link: string;
    domain_aerobic: string;
    domain_concurrent: string;
    domain_skill: string;
  };
  // Evidence
  evidence: {
    eyebrow: string;
    title: string;
    read_link: string;
  };
  // WontDo
  wontdo: {
    summary: string;
    not_a_clinician_title: string;
    not_a_clinician_body: string;
    not_certain_title: string;
    not_certain_body: string;
    not_streak_title: string;
    not_streak_body: string;
  };
  // Origin story
  origin: {
    eyebrow: string;
    quote: string;
    body: string;
  };
  // Final CTA
  beta: {
    h2_a: string;
    h2_b: string;
    body: string;
    cta_primary: string;
    cta_secondary: string;
  };
};
