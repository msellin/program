/**
 * Landing-owned program catalog. Editorial content, not the full program JSON.
 * Each entry mirrors the app's manifest fields the landing actually renders +
 * adds marketing copy the app doesn't need.
 *
 * When a new program ships to production the app manifest gets extended AND a
 * matching entry lands here.
 */
export type LandingProgram = {
  slug: string;
  name: string;
  tagline: string; // one-sentence hook, marketing tone
  /** Short "start here if" line shown under the tagline; links to another program when `prerequisiteLink` is set. */
  prerequisite?: { text: string; link?: { slug: string; label: string } };
  domain: "aerobic" | "concurrent" | "skill";
  domainLabel: string;
  status: "AVAILABLE" | "COMING" | "PERSONAL";
  /**
   * Mirrors the app's review ladder, which the landing previously flattened —
   * five programs have had the second audit pass and three have not, and saying nothing
   * implied all eight were. Must match the app manifest's `status`:
   * REFERENCED → "cited", REVIEWED / VERIFIED / stable → "verified".
   * Asserted in next-app/src/lib/data-integrity.test.ts.
   */
  review: "cited" | "verified";
  duration: string;
  difficulty: "beginner" | "intermediate" | "advanced" | "multi-tier";
  toneColor: "bronze" | "teal" | "green" | "amber";
  fitFor: string[]; // 3-4 "you are this person" bullets
  arcSummary: string; // short paragraph on the shape of the arc
  evidence: Array<{ label: string; source: string }>;
  retest: string;
  outcomes: Array<{ tier: string; expected: string }>;
  contraindications: string[];
  personal?: boolean;
};

export const PROGRAMS: LandingProgram[] = [
  {
    slug: "engine-builder",
    name: "Engine Builder · Block 1",
    tagline: "The base your engine's been missing.",
    domain: "aerobic",
    domainLabel: "Aerobic",
    status: "COMING",
    review: "cited",
    duration: "8 weeks",
    difficulty: "beginner",
    toneColor: "teal",
    fitFor: [
      "You have decent strength but get gassed 15 min into a metcon.",
      "5 km feels harder than it should — HR runs away at moderate pace.",
      "You want a plan that builds the base, not just chases intervals.",
      "You'll swap rowing / cycling / ski-erg / running as your machine.",
    ],
    arcSummary:
      "Eight weeks of Zone 1/2 base with a single weekly hard session added in week 4. Norwegian 4×4 intervals appear once you can hold Z2 for 45 minutes without HR drift. Retest week 8 measures submax heart rate at your intake pace.",
    evidence: [
      {
        label: "Hickson 1980 · concurrent training",
        source: "The load-bearing concurrent-training result — interference is proportional to endurance volume.",
      },
      {
        label: "Helgerud 2007 · Norwegian 4×4",
        source: "The single most efficient protocol for raising VO2max in trained-not-elite athletes.",
      },
      {
        label: "Seiler 2010 · polarised training",
        source: "80/20 easy/hard is the honest volume distribution — this program follows it.",
      },
    ],
    retest: "Week 8: submax heart rate at your intake pace, compared with where you started.",
    outcomes: [
      { tier: "Foundation", expected: "Easy aerobic sessions feel comfortable for longer, and your heart rate sits lower at the same effort." },
      { tier: "Progression", expected: "Longer easy sessions, with a clear ability to hold the base before intervals are added." },
      { tier: "Push", expected: "Threshold pace is established and the weekly hard session is repeatable." },
    ],
    contraindications: [
      "Unmanaged high blood pressure (resting > 160/100).",
      "Exertional syncope or unexplained dizziness — stop and see a clinician.",
      "Recent post-COVID: return-to-exercise gate, not this program.",
      "Any flaring joint or tendon condition — resolve first.",
    ],
  },
  {
    slug: "concurrent-strength-maintenance",
    name: "Concurrent-Strength Maintenance",
    tagline: "Add cardio. Keep the squat.",
    prerequisite: {
      text: "Start here if you already lift and have a rower, bike or erg. New to lifting or pull-ups?",
      link: { slug: "first-strict-pullup", label: "Start with the pull-up program" },
    },
    domain: "concurrent",
    domainLabel: "Concurrent",
    status: "AVAILABLE",
    review: "cited",
    duration: "8 weeks",
    difficulty: "intermediate",
    toneColor: "amber",
    fitFor: [
      "You lift heavy and need cardio without losing your lifts.",
      "Your coach recommended it — you're skeptical of interference cost.",
      "You want to see whether your squat holds, with a retest at week 8.",
      "You already own a rower, bike or erg.",
    ],
    arcSummary:
      "Two lift days + three-to-four low-intensity aerobic sessions + one hard interval. Explicit 6-hour separation between hard cardio and heavy squat. Retest at week 8: back-squat 5RM held, and submax heart rate at pace-5 compared with intake.",
    evidence: [
      {
        label: "Schumann 2022 meta-analysis",
        source: "Meta-analysis of how much explosive strength concurrent training costs — the bound this program is authored against.",
      },
      {
        label: "Hickson 1980",
        source: "Original interference paper. Endurance-volume ceiling below which strength holds.",
      },
      {
        label: "Robineau 2016",
        source: "6-hour separation between hard cardio and strength — the minimum this program enforces.",
      },
    ],
    retest: "Week 8: 5RM back-squat + 5-min submax HR at rowing pace-5. Both trend-tracked cycle-to-cycle.",
    outcomes: [
      { tier: "Foundation", expected: "Your main lifts hold steady while easy cardio becomes routine." },
      { tier: "Progression", expected: "Lifts held or nudged up on a good cycle while your engine builds." },
      { tier: "Push", expected: "Cardio fitness keeps growing with the strength floor still intact." },
    ],
    contraindications: [
      "Peaking for a powerlifting meet — pause this until post-meet.",
      "Currently under an injury-management protocol on any main lift.",
      "Sleep <6 h/night for two weeks running — recovery capacity is compromised.",
    ],
  },
  {
    slug: "rowing-2k-test-prep",
    name: "Rowing 2K Test Prep",
    tagline: "A race-anchored plan for the 2K row.",
    domain: "aerobic",
    domainLabel: "Aerobic",
    status: "COMING",
    review: "cited",
    duration: "6 weeks",
    difficulty: "intermediate",
    toneColor: "teal",
    fitFor: [
      "You have a 2K PR and want it lower by an event date you already know.",
      "You own a Concept2 (home or box) and can commit 4-5 sessions/week.",
      "You want a real taper, not just \"take it easy\" the week before.",
      "You care about splits, watts, and HR zones — not just \"feel\".",
    ],
    arcSummary:
      "Six weeks with a race-anchored taper. Weeks 1-2: baseline + technique. Weeks 3-4: threshold builds. Weeks 5-6: volume drops, intensity holds, then the peak 2K test on race day. Test-date-driven — enter your target date at intake and the whole phase structure shifts to end there.",
    evidence: [
      {
        label: "Mujika & Padilla 2000",
        source: "The taper is where peak performance comes from — not from more work in the final week.",
      },
      {
        label: "Joyner & Coyle 2008",
        source: "Threshold pace rises predictably in trained athletes with focused work. VO2max plateaus much earlier.",
      },
      {
        label: "Bosquet 2007",
        source: "Meta-analysis: cutting volume while holding intensity is the taper sweet spot.",
      },
    ],
    retest: "Weeks 3 (mid-block) and 6 (peak) 2K tests. Log via the app — pace, split, and target time surface on the block card.",
    outcomes: [
      { tier: "Foundation", expected: "A clean baseline, pacing you can repeat, and a taper plan built around your date." },
      { tier: "Progression", expected: "Threshold pace holds more steadily across the block." },
      { tier: "Push", expected: "A well-paced test on race day, with the taper doing its job." },
    ],
    contraindications: [
      "Low-back injury in the last 90 days without physio clearance.",
      "Currently peaking for another endurance event.",
    ],
  },
  {
    slug: "handstand-walk",
    name: "Handstand Walk",
    tagline: "From wall-supported to consistent walk.",
    prerequisite: {
      text: "Start here if you can hold a wall handstand for about 10 seconds.",
    },
    domain: "skill",
    domainLabel: "Skill",
    status: "AVAILABLE",
    review: "cited",
    duration: "Multi-tier · 8-16 weeks",
    difficulty: "multi-tier",
    toneColor: "bronze",
    fitFor: [
      "You can kick to a wall handstand and hold 10+ seconds.",
      "You want structured drill progression, not \"do more walks\".",
      "You want drills picked from your weakest sub-skill, with practice that switches from blocked to random at week 3.",
      "You have wrist and shoulder mobility (or want to build them alongside).",
    ],
    arcSummary:
      "Four tiers — Foundation, Wall, Freestand, Advanced. Personalised drill selection reads your weakest sub-skill and gives you 2-3 drills per session at your level. Contextual interference switches on at week 3: blocked practice while learning, random once the drills are grooved.",
    evidence: [
      {
        label: "Shea & Morgan 1979",
        source: "Foundational contextual-interference paper. Blocked practice better in acquisition, random better in retention.",
      },
      {
        label: "Baker 2025 systematic review",
        source: "Current best synthesis of handstand biomechanics — the anchor for the whole progression.",
      },
      {
        label: "Wulf & Shea 2002",
        source: "External-focus cues outperform internal for skill retention.",
      },
    ],
    retest: "Freestand-hold duration + walk distance retested every 4 weeks. Tier gates unlock on measured thresholds.",
    outcomes: [
      { tier: "Foundation", expected: "Steady wall holds and your first controlled steps." },
      { tier: "Progression", expected: "Freestand holds you can repeat, with short walks under control." },
      { tier: "Push", expected: "Longer, steadier walks, plus an introduction to turns." },
    ],
    contraindications: [
      "Any acute wrist injury — build wrist tolerance first.",
      "Shoulder pain overhead — the program defers inversions until this resolves.",
      "Uncontrolled hypertension (inversion contraindicated).",
    ],
  },
  {
    slug: "overhead-mobility",
    name: "Overhead Mobility",
    tagline: "Stronger snatch, OHS, and press.",
    domain: "skill",
    domainLabel: "Skill",
    status: "COMING",
    review: "cited",
    duration: "10 weeks",
    difficulty: "intermediate",
    toneColor: "bronze",
    fitFor: [
      "Your snatch stalls at the catch, not the pull.",
      "Overhead squat looks like a mystery, not a lift.",
      "You lose the bar backwards on jerks and presses.",
      "You want structured mobility, not \"stretch more\".",
    ],
    arcSummary:
      "Ten weeks working the shoulder + thoracic + scap sequence in order. Weekly retest of supine shoulder flexion ROM. Every phase progresses conditional on measured mobility — not on adherence.",
    evidence: [
      {
        label: "Kibler & Sciascia 2013",
        source: "Scapular dyskinesis — the pattern that most limits overhead work.",
      },
      {
        label: "Kim 2013",
        source: "Supine flexion goniometer reliability — the anchor for the retest metric.",
      },
      {
        label: "Escamilla 2009",
        source: "EMG-guided drill selection for scap-activation.",
      },
    ],
    retest: "Every 2 weeks: supine shoulder flexion ROM (goniometer or phone-app angle). Improvement = phase advance.",
    outcomes: [
      { tier: "Foundation", expected: "Better overhead range, and a position you can hold under an empty barbell." },
      { tier: "Progression", expected: "Overhead squats that feel supported at light loads." },
      { tier: "Push", expected: "A stable bottom position in the snatch." },
    ],
    contraindications: [
      "Recent shoulder surgery or acute injury.",
      "Any sharp shoulder pain during test — pause and see physio.",
    ],
  },
  {
    slug: "first-strict-pullup",
    name: "First Strict Pull-Up",
    tagline: "From no hang to a rep you own.",
    domain: "skill",
    domainLabel: "Skill",
    status: "AVAILABLE",
    review: "cited",
    duration: "Multi-tier · 8 weeks",
    difficulty: "multi-tier",
    toneColor: "bronze",
    fitFor: [
      "You want a strict pull-up — not a kipping one. That's a different skill.",
      "You can't dead-hang 15 seconds yet, or you get 1-2 and want 5.",
      "You'd rather train the weakest link than just do more pull-ups.",
      "You have a bar and a band, and 20-35 minutes, three or four times a week.",
    ],
    arcSummary:
      "Four tiers — Hang, Assisted, First Rep, Volume. Intake places you, then each week targets whichever sub-capability is furthest behind: grip, scapular control, row strength, or negative control. A beginner spends weeks on hangs and scap pulls before touching a full rep; a first-repper goes straight to volume work.",
    evidence: [
      {
        label: "Youdas 2010 · EMG across pull-up variants",
        source: "Scapular phase precedes the concentric pull — the reason scap work comes before rep attempts.",
      },
      {
        label: "Roig 2009 · eccentric vs concentric",
        source: "Eccentric training produces greater strength gains at matched work. Negatives are the main driver in the assisted tier.",
      },
      {
        label: "Sinnett 2019 · band-assisted pull-up",
        source: "Band assistance transfers to unassisted performance — the evidence behind the assisted ladder.",
      },
    ],
    retest:
      "Hang time retested weekly at the lower tiers, max reps weekly at the upper. Full assessment every 4 weeks — dead hang, scap pull, ring row, negative control.",
    outcomes: [
      { tier: "Hang", expected: "A steady dead hang, clean scap pulls and your first ring rows." },
      { tier: "Assisted", expected: "Controlled negatives and band-assisted reps, building toward a first strict rep." },
      { tier: "First Rep", expected: "Your first strict reps, with the pattern grooved." },
      { tier: "Volume", expected: "Sets of unbroken reps, with grip variations unlocked." },
    ],
    contraindications: [
      "Active shoulder or elbow pain under load — see a clinician before hanging.",
      "This is not a kipping pull-up programme and won't prepare you for one.",
    ],
  },
  {
    slug: "muscle-up",
    name: "Muscle-Up Acquisition",
    tagline: "The transition is the bottleneck. Train it directly.",
    domain: "skill",
    domainLabel: "Skill",
    status: "COMING",
    review: "cited",
    duration: "Multi-tier · 10 weeks",
    difficulty: "multi-tier",
    toneColor: "bronze",
    fitFor: [
      "You have strict pull-ups and ring dips, and the muscle-up still isn't there.",
      "You've worked out it's not the pull and not the dip — it's the bit between.",
      "You want the strict ring version, built deliberately.",
      "You have rings and 20-30 minutes, three or four times a week.",
    ],
    arcSummary:
      "Three tiers — Prep, Transition, First Rep. The transition gets isolated and drilled on its own: seated-band, low-ring negatives, then full attempts, while false-grip strength and ring-dip capacity are built alongside so the rep isn't gated on them.",
    evidence: [
      {
        label: "Roig 2009 · eccentric vs concentric",
        source: "Why the transition is trained through negatives before it is attempted at full speed.",
      },
      {
        label: "Reinold 2007 · shoulder loading",
        source: "The rationale for the false-grip and ring-dip prep tier rather than straight to attempts.",
      },
      {
        label: "Kibler 2013 · scapular dyskinesis",
        source: "Scapular control precedes overhead load — the basis for the non-optional prep block.",
      },
    ],
    retest:
      "False-grip hang and ring-dip capacity retested weekly at the lower tiers, max reps at the top. Full assessment battery every 4 weeks.",
    outcomes: [
      { tier: "Prep", expected: "Solid strict ring dips and a steady false-grip hang." },
      { tier: "Transition", expected: "The seated-band transition, low-ring muscle-ups and first strict attempts." },
      { tier: "First Rep", expected: "Strict ring muscle-ups, built deliberately." },
    ],
    contraindications: [
      "Requires an existing strict pull-up and ring dip — start with First Strict Pull-Up if you don't have them.",
      "Active shoulder or elbow pain under load — see a clinician first.",
    ],
  },
  {
    slug: "engine-builder-block-2",
    name: "Engine Builder · Block 2",
    tagline: "Where the threshold gains actually land.",
    domain: "aerobic",
    domainLabel: "Aerobic",
    status: "COMING",
    review: "cited",
    duration: "Multi-tier · 10 weeks",
    difficulty: "multi-tier",
    toneColor: "teal",
    fitFor: [
      "You finished Block 1, or you already have the aerobic base it builds.",
      "You want the sharp end — threshold work and VO2max intervals, not more Z2.",
      "You can give it 5-6 hours a week across four or five sessions.",
      "You'll swap rowing / cycling / ski-erg / running as your machine.",
    ],
    arcSummary:
      "Volume expansion with a threshold-dominant middle. Cruise intervals expand toward 3×12 minutes and Norwegian 4×4 returns on top. Declare an equivalent base at intake if you're arriving without Block 1 — the block assumes the base is already in and doesn't rebuild it.",
    evidence: [
      {
        label: "Seiler 2010 · intensity distribution",
        source: "The polarised distribution this block's easy/hard split is built on.",
      },
      {
        label: "Helgerud 2007 · 4×4 intervals",
        source: "The specific interval protocol behind the VO2max sessions.",
      },
      {
        label: "Rønnestad 2020 · threshold work",
        source: "Evidence for the cruise-interval structure that dominates the middle weeks.",
      },
    ],
    retest:
      "20-minute time trial plus submax HR at a fixed pace, at week 4 and again at week 8-10. Modality-specific TT (2K row / 5K run) at the end if it applies.",
    outcomes: [
      { tier: "Foundation", expected: "Threshold work feels more controlled at the same effort." },
      { tier: "Progression", expected: "Longer cruise intervals, with high-end intervals added on top." },
      { tier: "Push", expected: "Higher threshold output, with the base still in place." },
    ],
    contraindications: [
      "Not a starting point — do Block 1 first, or declare an equivalent base at intake.",
      "Cardiac or respiratory conditions: clear the intensity work with a clinician.",
    ],
  },
];

export function findProgram(slug: string): LandingProgram | undefined {
  return PROGRAMS.find((p) => p.slug === slug);
}

export const PUBLIC_PROGRAMS = PROGRAMS.filter((p) => !p.personal);
