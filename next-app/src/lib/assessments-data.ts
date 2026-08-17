/**
 * Assessment pack definitions.
 *
 * Declarative; body-region-tagged; cadence-driven. The engine treats each pack
 * uniformly (see `hip-check.ts` / future `assessment-engine.ts`) so adding a
 * shoulder or low-back pack is a data change, not a code change.
 *
 * Nothing here is medical advice. Every question is phrased as self-monitoring
 * with a numeric outcome the user is capable of scoring truthfully. The
 * clinician relationship is separate and named in the intro copy.
 */

export type AssessmentSide = "left" | "right";

export type AssessmentQuestion = {
  id: string;
  label: string;
  method: string;
  interpret: string;
  /** If set, the question is asked twice — once per side. Scores are keyed `${id}:left`, `${id}:right`. */
  paired?: "left_right";
  /** Video / demo search string, for a "learn what this looks like" link. */
  video_search?: string;
  /**
   * Direct video URL — if provided, embeds inline (YouTube iframe) instead of
   * routing through the search modal. Preferred over `video_search` when a
   * specific known-good demo exists.
   *
   * Accepts a YouTube URL in any format — `youtube.com/watch?v=ID`,
   * `youtu.be/ID`, or `youtube.com/embed/ID`. Extraction happens at render.
   */
  video_url?: string;
  /** Direction of "better". `lower` means 0 is healthy; `equal` means 0 is a symmetric baseline. */
  better: "lower";
  scale: { min: 0; max: 10; low_label: string; high_label: string };
};

export type AssessmentPack = {
  id: string;
  name: string;
  body_region: "hip" | "shoulder" | "back" | "knee" | "general";
  cadence_days: number;
  intro: string;
  safety: string;
  questions: AssessmentQuestion[];
};

/**
 * Hip flexor + balance pack.
 *
 * Six items, ~4 minutes. Covers: baseline rest, anterior impingement provocation
 * (FADIR), iliopsoas signal (resisted SLR), the specific finding documented on
 * hanging leg raise, stretch quality, and subjective L/R balance across the
 * month's unilateral work.
 */
export const HIP_FLEXOR_PACK: AssessmentPack = {
  id: "hip_flexor_balance",
  name: "Hip flexor + balance check",
  body_region: "hip",
  cadence_days: 28,
  intro:
    "Six short self-checks so we can chart how the hip is trending. Takes about 4 minutes. This is not a diagnosis — you already have an orthopaedist and physiatrist for that. The point is to catch changes between appointments.",
  safety:
    "Skip any test that produces sharp or shooting pain. Log the pain, don't push through it. If a test that was easy last month is suddenly a 7+ this month, that is exactly the sort of thing to bring to your next appointment.",
  questions: [
    {
      id: "groin_rest",
      label: "Groin discomfort at rest",
      method: "Sit still for ten seconds. Notice the front of your hip / groin area.",
      interpret:
        "0 means nothing there. 5 means a dull awareness. 10 means a persistent ache you can feel right now.",
      better: "lower",
      scale: { min: 0, max: 10, low_label: "clean", high_label: "aching" },
    },
    {
      id: "fadir",
      label: "Hip pinch — knee-to-opposite-shoulder press",
      method:
        "Lie on your back. Bend one knee, guide it inward across your body toward the opposite shoulder, then gently press it further with your opposite hand.",
      interpret:
        "You are testing for an anterior-hip pinch, not muscle stretch. 0 means the leg moves freely with no pinch. 10 means a sharp catch in the front of the hip that stops the movement. Log both sides — asymmetry is the interesting signal here.",
      paired: "left_right",
      video_search: "FADIR test hip impingement",
      video_url: "https://youtu.be/xyJUIhsL4lg",
      better: "lower",
      scale: { min: 0, max: 10, low_label: "clean", high_label: "sharp pinch" },
    },
    {
      id: "slr_resisted",
      label: "Straight-leg raise against light pressure",
      method:
        "Lie flat on your back. Straighten one leg and lift it about 15 cm off the floor. Press down on the front of your thigh with your own hand while you hold the leg up.",
      interpret:
        "You are looking for a hip-flexor / groin signal, not quad tiredness. 0 means the leg holds effortlessly. 10 means a sharp groin pain that makes you drop the leg. This test was documented as positive on both sides in your past evaluations — worth watching.",
      paired: "left_right",
      video_search: "resisted straight leg raise hip flexor test",
      video_url: "https://youtu.be/x8jQm3rRKCo",
      better: "lower",
      scale: { min: 0, max: 10, low_label: "strong", high_label: "sharp / drops" },
    },
    {
      id: "hlr_click",
      label: "Hanging leg raise — click during the lowering phase",
      method:
        "Hang from a pull-up bar. Raise your straight legs to 90°. Now lower them slowly. Listen for a click or catch in the front of your hip on the way down.",
      interpret:
        "This is the specific movement that documented the click. 0 means no click at all. 5 means a click, no pain. 10 means the click is loud or catches / gives way.",
      video_search: "hanging leg raise hip click",
      video_url: "https://youtu.be/Pr1ieGZ5atk",
      better: "lower",
      scale: { min: 0, max: 10, low_label: "silent", high_label: "clicks & catches" },
    },
    {
      id: "kneeling_stretch_quality",
      label: "Kneeling hip flexor stretch — clean or pinchy?",
      method:
        "Get into a half-kneeling position: one knee down, the other foot flat in front. Shift your hips forward until you feel a stretch in the front of the thigh of the back leg.",
      interpret:
        "You want a clean stretch in the front of the back thigh. 0 means exactly that. 10 means an anterior hip pinch — pain in the wrong spot, higher up in the hip crease. Log both sides.",
      paired: "left_right",
      video_search: "half kneeling hip flexor stretch technique",
      video_url: "https://youtu.be/F55tzqJggAY",
      better: "lower",
      scale: { min: 0, max: 10, low_label: "clean stretch", high_label: "pinchy" },
    },
    {
      id: "unilateral_balance",
      label: "Overall left-vs-right balance this month",
      method:
        "Think back over Bulgarian splits, single-leg RDLs, split squats, hip work over the past four weeks. How balanced did the two sides feel?",
      interpret:
        "0 means they feel equal — same strength, same range, same control. 10 means one side is dramatically weaker or more restricted than the other.",
      better: "lower",
      scale: { min: 0, max: 10, low_label: "equal", high_label: "very uneven" },
    },
  ],
};

export const ALL_PACKS: AssessmentPack[] = [HIP_FLEXOR_PACK];

export function findPack(packId: string): AssessmentPack | undefined {
  return ALL_PACKS.find((p) => p.id === packId);
}

/**
 * Return the flat list of score keys a pack produces. Paired questions expand
 * to `<id>:left` and `<id>:right`; solo questions stay as `<id>`.
 */
export function scoreKeysFor(pack: AssessmentPack): string[] {
  const out: string[] = [];
  for (const q of pack.questions) {
    if (q.paired === "left_right") {
      out.push(`${q.id}:left`, `${q.id}:right`);
    } else {
      out.push(q.id);
    }
  }
  return out;
}
