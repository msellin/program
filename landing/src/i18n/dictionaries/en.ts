import type { LandingDict } from "./types";

export const en: LandingDict = {
  locale: "en",
  hero: {
    beta_badge: "Free open beta",
    h1_a: "Improve your",
    h1_b: "weakest area.",
    h1_c: "Keep your training.",
    sub: "For CrossFit and functional-fitness athletes. Pick a skill or a lift. Terav adjusts each session from your log and tells you why. You approve every change.",
    cta_primary: "Start free",
    cta_secondary: "See how it works ↓",
    browse_link: "Browse programs",
    stat_programs_value: "Free",
    stat_programs_label: "during the beta",
    stat_studies_value: "You approve",
    stat_studies_label: "every change",
    stat_adapts_value: "Your log",
    stat_adapts_label: "drives each session",
  },
  contrast: {
    eyebrow: "Where Terav sits",
    title: "Templates. Trainers. Then us.",
    col_template: "Template apps",
    col_trainer: "A trainer",
    col_terav: "Terav",
    row_scope_label: "Scope",
    row_scope_template: "Your whole week",
    row_scope_trainer: "Your whole week",
    row_scope_terav: "A focus arc. Rest stays yours.",
    row_what_label: "What you get",
    row_what_template: "A session from a library",
    row_what_trainer: "A plan every two weeks",
    row_what_terav: "A plan sharpened every session",
    row_when_label: "When it adjusts",
    row_when_template: "Next cycle, maybe",
    row_when_trainer: "Next Tuesday, in bulk",
    row_when_terav: "Every session, against your log",
  },
  how: {
    eyebrow: "How it works",
    title: "Intake. Session. Sharpen.",
    step_01_title: "A short intake, one profile.",
    step_01_body: "About five minutes of questions, then your first session.",
    step_02_title: "A session, with reasons.",
    step_02_body: "Tomorrow's plan, written against your history.",
    step_03_title: "Log. Engine sharpens.",
    step_03_body: "You log a note. Engine proposes. You apply the change or ignore it.",
    evidence_link: "See the sources →",
  },
  programs: {
    eyebrow: "Pick one program",
    title: "Three programs open. More coming.",
    sub: "Each program targets one skill or lift. Short sessions that run alongside your other training.",
    engine_builder_pitch: "For lifters who can't yet run 5k.",
    csm_pitch: "Add cardio without losing your squat.",
    rowing_pitch: "A race-anchored plan for the 2K row.",
    handstand_pitch: "Build a handstand walk, step by step.",
    overhead_pitch: "Stronger snatch, OHS, and press.",
    pullup_pitch: "Get your first strict pull-up.",
    muscleup_pitch: "The transition is the bottleneck.",
    engine_block2_pitch: "Block 1 done? This is the sharp end.",
    roadmap_link: "See what's coming — the roadmap →",
    domain_aerobic: "Engine",
    domain_concurrent: "Strength",
    domain_skill: "Skill",
  },
  evidence: {
    eyebrow: "The evidence",
    title: "Built on published sport science. Every change shows its reason and source.",
    read_link: "Read",
  },
  wontdo: {
    summary: "What Terav is not",
    not_a_clinician_title: "Not a clinician.",
    not_a_clinician_body:
      "Red-flag patterns surface a banner, not a diagnosis.",
    not_certain_title: "Not certain about you.",
    not_certain_body:
      "People respond to training differently. We show the reasoning, not a promised result.",
    not_streak_title: "Not a streak game.",
    not_streak_body: "Skip a week. The plan sharpens against that too.",
  },
  origin: {
    eyebrow: "Where the rigor comes from",
    // 2026-09-01 — the previous quote ("A blade gets sharper by grinding against
    // something harder than itself") was typeset as a blockquote and signed
    // "— Margus, founder", so it read as something the founder had said. He
    // hadn't. It was brand copy (terav = sharp) in a person's mouth, and it put
    // the founder at the centre of a section that works better pointed at the
    // reader. Replaced with what actually happened, in his own words.
    quote:
      "It started with my own training log. Then I realised everyone is working around something.",
    body:
      "The engine was built against one real training log: years of strength work, with every retest gate, safety rule and confirm-first mechanic proving itself there before it shipped. Your weak spot will be a different one. Terav is a focused-improvement tool, not a full training plan — it runs alongside your box, your coach, or your own week. If you have a specific medical issue, work with a clinician.",
  },
  beta: {
    h2_a: "One short intake.",
    h2_b: "Then it adjusts to your log.",
    body: "A few minutes of questions. Then your first session lands, written around your log, with the reason behind every change. You approve each change or ignore it.",
    cta_primary: "Start free",
    cta_secondary: "Talk to the founder",
  },
};
