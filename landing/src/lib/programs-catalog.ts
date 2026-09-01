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
  domain: "aerobic" | "concurrent" | "skill";
  domainLabel: string;
  status: "AVAILABLE" | "COMING" | "PERSONAL";
  /**
   * Mirrors the app's review ladder, which the landing previously flattened —
   * five programs are specialist-audited and three are not, and saying nothing
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
    status: "AVAILABLE",
    review: "verified",
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
      "Eight weeks of Zone 1/2 base with a single weekly hard session added in week 4. Norwegian 4×4 intervals appear once you can hold Z2 for 45 minutes without HR drift. Retest week 8 measures submax-HR at your intake pace — the aerobic gain is real and readable.",
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
    retest: "Week 8: submax HR at your intake pace should be 3-8 bpm lower. Resting HR drops 3-10 bpm.",
    outcomes: [
      { tier: "Foundation", expected: "Comfortable 60 min Z1. Submax HR −3 to −6 bpm. Modest VO2max gain (~3-6%)." },
      { tier: "Progression", expected: "Comfortable 75-90 min Z1. Submax HR −5 to −10 bpm. VO2max +5-8%." },
      { tier: "Push", expected: "90+ min Z1 comfortable, threshold pace clearly established. VO2max +4-7%." },
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
    domain: "concurrent",
    domainLabel: "Concurrent",
    status: "AVAILABLE",
    review: "verified",
    duration: "8 weeks",
    difficulty: "intermediate",
    toneColor: "amber",
    fitFor: [
      "You lift heavy and need cardio without losing your lifts.",
      "Your coach recommended it — you're skeptical of interference cost.",
      "You want a specific number to defend: how much strength am I risking?",
      "You already own a rower, bike or erg.",
    ],
    arcSummary:
      "Two lift days + three-to-four low-intensity aerobic sessions + one hard interval. Explicit 6-hour separation between hard cardio and heavy squat. Retest at week 8: back-squat 5RM should be held within 2.5 kg AND submax-HR at pace-5 should be down 5-10 bpm.",
    evidence: [
      {
        label: "Schumann 2022 meta-analysis",
        source: "Explosive-strength cost of concurrent training bounded at SMD −0.28 — the number this program is authored against.",
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
      { tier: "Foundation", expected: "Squat held ±2.5 kg, submax HR −5-10 bpm at pace-5." },
      { tier: "Progression", expected: "Squat held or +2.5 kg on a green cycle, HR −8-15 bpm." },
      { tier: "Push", expected: "VO2max +2-4% AND strength floor. Above this bar, response is stochastic." },
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
    tagline: "Six weeks. A cleaner pull. A faster 2K.",
    domain: "aerobic",
    domainLabel: "Aerobic",
    status: "AVAILABLE",
    review: "verified",
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
      "Six weeks with a race-anchored taper. Weeks 1-2: baseline + technique. Weeks 3-4: threshold builds. Weeks 5-6: volume drops 45%, intensity holds, then the peak 2K test on race day. Test-date-driven — enter your target date at intake and the whole phase structure shifts to end there.",
    evidence: [
      {
        label: "Mujika & Padilla 2000",
        source: "The taper is where the ~3% peak uplift comes from — not from more work in the final week.",
      },
      {
        label: "Joyner & Coyle 2008",
        source: "Threshold pace rises predictably in trained athletes with focused work. VO2max plateaus much earlier.",
      },
      {
        label: "Bosquet 2007",
        source: "Meta-analysis: 40-60% volume reduction with intensity held is the taper sweet spot.",
      },
    ],
    retest: "Weeks 3 (mid-block) and 6 (peak) 2K tests. Log via the app — pace, split, and target time surface on the block card.",
    outcomes: [
      { tier: "Foundation", expected: "2K time down 15-30 seconds. Personal target split derived from your intake." },
      { tier: "Progression", expected: "2K time down 8-15 seconds. Threshold pace visibly cleaner." },
      { tier: "Push", expected: "2K time down 3-8 seconds — a stretch, but achievable at this level." },
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
    domain: "skill",
    domainLabel: "Skill",
    status: "AVAILABLE",
    review: "verified",
    duration: "Multi-tier · 8-16 weeks",
    difficulty: "multi-tier",
    toneColor: "bronze",
    fitFor: [
      "You can kick to a wall handstand and hold 10+ seconds.",
      "You want structured drill progression, not \"do more walks\".",
      "You care about the science of skill acquisition — blocked vs random practice.",
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
      { tier: "Foundation", expected: "Wall hold 60s consistently. First 2-3 walking steps." },
      { tier: "Progression", expected: "Freestand hold 15-30s. 5-10 m walk under control." },
      { tier: "Push", expected: "Consistent 20 m walk. Introduction to turns + obstacles." },
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
    status: "AVAILABLE",
    review: "verified",
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
      { tier: "Foundation", expected: "+10° ROM. Overhead position holds under empty barbell." },
      { tier: "Progression", expected: "+15° ROM. Overhead squat with 30-40 kg feels supported." },
      { tier: "Push", expected: "+20° ROM. Snatch bottom feels stable." },
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
      "You have a bar and a band, and 15-30 minutes, three or four times a week.",
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
      { tier: "Hang", expected: "25-45 second dead hang. Clean scap pulls. First ring rows." },
      { tier: "Assisted", expected: "First strict rep, off a 10-second negative." },
      { tier: "First Rep", expected: "3-5 unbroken." },
      { tier: "Volume", expected: "8-10 unbroken, wide-grip variety unlocked." },
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
    status: "AVAILABLE",
    review: "cited",
    duration: "Multi-tier · 10 weeks",
    difficulty: "multi-tier",
    toneColor: "bronze",
    fitFor: [
      "You have strict pull-ups and ring dips, and the muscle-up still isn't there.",
      "You've worked out it's not the pull and not the dip — it's the bit between.",
      "You want the strict ring version, built deliberately.",
      "You have rings and 20-35 minutes, three or four times a week.",
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
      { tier: "Prep", expected: "3-5 strict ring dips. 15-second false-grip hang." },
      { tier: "Transition", expected: "Seated-band mastered, first low-ring muscle-up, first strict attempt." },
      { tier: "First Rep", expected: "2-3 strict ring muscle-ups unbroken." },
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
    status: "AVAILABLE",
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
      { tier: "Foundation", expected: "Threshold pace/power +2%. Submax HR -3 bpm at fixed pace." },
      { tier: "Progression", expected: "Threshold +3-4%. VO2max gains on top of Block 1." },
      { tier: "Push", expected: "Threshold +5%. Submax HR -8 bpm." },
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
