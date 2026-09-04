import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  exercisesFileSchema,
  programSchema,
  programManifestSchema,
  type Exercise,
  type Program,
} from "./schemas";
import { applyProgramExerciseOverrides } from "./data-loader";
import { REGION_BY_ID, FLAG_BY_ID } from "./symptom-regions";
import { metricHasDerivableSeries } from "./engine/retest-evaluator";
import { LOAD_SIGNALS, loadSignalsForProgram, axisUnitFor } from "./load-signals";

const DATA = path.resolve(__dirname, "../../public/data");
const read = (p: string) => JSON.parse(fs.readFileSync(path.join(DATA, p), "utf8"));

const library = exercisesFileSchema.parse(read("exercises.json"));
const manifest = programManifestSchema.parse(read("programs/manifest.json"));
const byId: Record<string, Exercise> = Object.fromEntries(
  library.exercises.map((e) => [e.id, e]),
);

const programs: Array<{ id: string; personal: boolean; program: Program }> =
  manifest.programs.map((entry) => ({
    id: entry.id,
    personal: entry.personal === true,
    program: programSchema.parse(read(`programs/${entry.slug ?? entry.id}.json`)),
  }));

function exerciseIdsIn(program: Program): string[] {
  const ids = new Set<string>();
  for (const b of program.blocks ?? []) {
    for (const it of b.items ?? []) if (it.exercise_id) ids.add(it.exercise_id);
  }
  for (const id of program.drill_library ?? []) ids.add(id);
  return [...ids];
}

describe("referential integrity", () => {
  it.each(programs.map((p) => p.id))("%s resolves every exercise_id", (id) => {
    const { program } = programs.find((p) => p.id === id)!;
    const missing = exerciseIdsIn(program).filter((eid) => !byId[eid]);
    expect(missing).toEqual([]);
  });

  it.each(programs.map((p) => p.id))("%s overrides target real exercises", (id) => {
    const { program } = programs.find((p) => p.id === id)!;
    const missing = Object.keys(program.exercise_overrides ?? {}).filter((eid) => !byId[eid]);
    expect(missing).toEqual([]);
  });
});

/**
 * The shared movement library ships to every user of every catalog-public
 * program. Copy that only makes sense for one person's clinical record —
 * a named side, a documented deficit, a specific diagnosis — belongs in that
 * program's `exercise_overrides`, not here.
 *
 * Regression guard for the CSM leak: `back_squat_highbar` and `front_squat` are
 * shared by `anterior-hip-rebuild` (personal) and `concurrent-strength-maintenance`
 * (catalog-public), and carried one person's shoulder diagnosis as generic cues.
 */
const PERSONAL_LANGUAGE = [
  /\bdocumented\b/i,
  /\bthis user\b/i,
  /\bthe (?:right|left) (?:shoulder|hip|glute|glute-max|SI|groin|side)\b/i,
  /\b(?:right|left) shoulder\b/i,
  /\bretroversion\b/i,
  /\bBertolotti\b/i,
  /\bSLAP\b/,
  /\blabral\b/i,
  /\bFADIR\b/,
  /\b(?:Left|Right) side (?:first|gets)\b/,
  /~\d+\s*kg/i,
];

describe("shared exercise library carries no person-specific clinical copy", () => {
  const COPY_FIELDS = ["cues", "cues_external_focus", "cues_internal_focus"] as const;

  it("cue arrays are general coaching copy", () => {
    const offenders: string[] = [];
    for (const e of library.exercises) {
      for (const field of COPY_FIELDS) {
        for (const [i, cue] of (e[field] ?? []).entries()) {
          const hit = PERSONAL_LANGUAGE.find((re) => re.test(cue));
          if (hit) offenders.push(`${e.id}.${field}[${i}] :: ${cue}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it("rationale is general coaching copy", () => {
    const offenders = library.exercises
      .filter((e) => e.rationale && PERSONAL_LANGUAGE.some((re) => re.test(e.rationale!)))
      .map((e) => `${e.id}.rationale :: ${e.rationale}`);
    expect(offenders).toEqual([]);
  });

  it("laterality emphasis is program-scoped, not baked into the library", () => {
    const offenders = library.exercises
      .filter((e) => e.default?.extra_set_side != null)
      .map((e) => e.id);
    expect(offenders).toEqual([]);
  });
});

describe("catalog-public programs render only general copy", () => {
  const publicPrograms = programs.filter((p) => !p.personal);

  it("no catalog-public program has any exercise_overrides", () => {
    // Overrides exist to hold personal constraints. If a catalog-public program
    // ever needs one, revisit this test — but it must not smuggle clinical copy.
    expect(publicPrograms.filter((p) => p.program.exercise_overrides).map((p) => p.id)).toEqual([]);
  });

  it.each(publicPrograms.map((p) => p.id))("%s renders no personal language", (id) => {
    const { program } = publicPrograms.find((p) => p.id === id)!;
    const resolved = applyProgramExerciseOverrides(byId, program);
    const offenders: string[] = [];
    for (const eid of exerciseIdsIn(program)) {
      const e = resolved[eid];
      if (!e) continue;
      for (const text of [...(e.cues ?? []), ...(e.cues_external_focus ?? []), e.rationale ?? ""]) {
        if (PERSONAL_LANGUAGE.some((re) => re.test(text))) offenders.push(`${eid} :: ${text}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});

describe("anterior-hip-rebuild keeps its clinical constraints", () => {
  const hip = programs.find((p) => p.id === "anterior-hip-rebuild")!.program;
  const resolved = applyProgramExerciseOverrides(byId, hip);

  it.each([
    ["back_squat_highbar", "shoulder retroversion"],
    ["back_squat_highbar", "the right shoulder"],
    ["front_squat", "the right shoulder"],
    ["block_pull_midshin", "symptom-free"],
    ["deadlift_conventional", "150 kg"],
    ["deadlift_conventional", "left SI"],
    ["glute_bridge_single", "documented left gluteus maximus deficit"],
    ["bulgarian_split_squat_db", "documented left glute-max"],
    ["single_leg_rdl", "Left side gets the extra set"],
    ["banded_march_standing", "clicking was documented"],
    ["split_squat_rfe", "FADIR"],
  ])("%s still surfaces %s", (eid, needle) => {
    const e = resolved[eid];
    expect(e, `${eid} missing from library`).toBeDefined();
    expect((e.cues ?? []).join(" | ")).toContain(needle);
  });

  it.each([
    ["back_squat_highbar", "Bertolotti"],
    ["dead_bug", "Bertolotti"],
    ["bulgarian_split_squat_db", "the record documents"],
    ["single_leg_rdl", "left glute-max gap"],
  ])("%s rationale still says %s", (eid, needle) => {
    expect(resolved[eid].rationale ?? "").toContain(needle);
  });

  it("restores the left-side emphasis the library no longer carries", () => {
    for (const eid of [
      "glute_bridge_single",
      "split_squat_rfe",
      "bulgarian_split_squat_db",
      "single_leg_rdl",
    ]) {
      expect(byId[eid].default?.extra_set_side, `${eid} library`).toBeUndefined();
      expect(resolved[eid].default?.extra_set_side, `${eid} resolved`).toBe("left");
    }
  });

  it("leaves the cached library untouched", () => {
    expect(byId.back_squat_highbar.cues?.[0]).toBe("Bar sits on the traps, not the rear delts");
  });

});

/**
 * Six library entries have never carried cue copy. That predates the
 * general/personal split and is tracked separately — pinning the set here means
 * moving a cue out of the shared library can never silently add a seventh.
 */
const KNOWN_CUELESS = [
  "back_squat",
  "hollow_hold",
  "nordic_curl",
  "pallof_press",
  "sled_push",
  "trap_bar_dl_floor",
];

describe("no program lost its cue rendering", () => {
  const hasCopy = (e: Exercise) =>
    (e.cues?.length ?? 0) > 0 ||
    (e.cues_external_focus?.length ?? 0) > 0 ||
    (e.cues_internal_focus?.length ?? 0) > 0 ||
    !!e.setup;

  it("the set of cue-less library entries has not grown", () => {
    expect(library.exercises.filter((e) => !hasCopy(e)).map((e) => e.id).sort()).toEqual(
      KNOWN_CUELESS,
    );
  });

  it.each(programs.map((p) => p.id))("%s renders cues for every exercise it uses", (id) => {
    const { program } = programs.find((p) => p.id === id)!;
    const resolved = applyProgramExerciseOverrides(byId, program);
    const silent = exerciseIdsIn(program)
      .filter((eid) => resolved[eid] && !hasCopy(resolved[eid]))
      .filter((eid) => !KNOWN_CUELESS.includes(eid));
    expect(silent).toEqual([]);
  });
});

/**
 * Structural drift checks (merged in 2026-09-01 from a parallel branch).
 *
 * These cover a different failure class from the de-identification rules
 * above: references that are well-typed but point at nothing. Zod cannot see
 * them because both sides are `z.string()`. Each one below is here because it
 * caught a real defect on the day it was written.
 */
const citationIds = new Set(
  (read("citations.json") as { citations: Array<{ id: string }> }).citations.map((c) => c.id),
);
const programFilesOnDisk = fs
  .readdirSync(path.join(DATA, "programs"))
  .filter((f) => f.endsWith(".json") && f !== "manifest.json")
  .map((f) => f.replace(/\.json$/, ""));

describe("structural drift", () => {
  it("exercise library has no duplicate ids", () => {
    const seen = new Set<string>();
    const dupes = library.exercises
      .map((e) => e.id)
      .filter((id) => (seen.has(id) ? true : (seen.add(id), false)));
    expect(dupes).toEqual([]);
  });

  it("manifest slugs and program files agree in both directions", () => {
    const manifestSlugs = new Set(manifest.programs.map((p) => p.slug ?? p.id));
    const missingFile = [...manifestSlugs].filter((s) => !programFilesOnDisk.includes(s));
    const missingManifest = programFilesOnDisk.filter((s) => !manifestSlugs.has(s));
    expect({ missingFile, missingManifest }).toEqual({ missingFile: [], missingManifest: [] });
  });

  // muscle-up shipped four capability_slot values that no drill could satisfy.
  // composeSlotDrills falls back to authored items SILENTLY when candidates is
  // empty, so the program renders a normal session while the multi-dimensional
  // composer — the thing it is sold on — never fires.
  it.each(programs.map((p) => p.id))("%s: every capability_slot can be filled", (id) => {
    const { program } = programs.find((p) => p.id === id)!;
    const slots = (program.blocks ?? []).filter((b) => b.capability_slot);
    if (slots.length === 0) return;
    const domains = new Set<string>();
    for (const drillId of program.drill_library ?? []) {
      for (const d of byId[drillId]?.capability_domains ?? []) domains.add(d);
    }
    const dead = slots
      .filter((b) => !domains.has(b.capability_slot as string))
      .map((b) => `${b.id} → ${b.capability_slot}`)
      .sort();
    expect(dead).toEqual([]);
  });

  // A hand-edit added a citation to references[] but not reference_ids[].
  // Every other program keeps them in sync; nothing enforced it.
  it.each(programs.map((p) => p.id))("%s: citation lists agree and resolve", (id) => {
    const { program } = programs.find((p) => p.id === id)!;
    const eb = program.evidence_base as
      | { references?: Array<{ id: string }>; reference_ids?: string[] }
      | undefined;
    if (!eb) return;
    const refIds = new Set((eb.references ?? []).map((r) => r.id));
    const listed = new Set(eb.reference_ids ?? []);
    if (refIds.size === 0 && listed.size === 0) return;
    expect({
      onlyInReferences: [...refIds].filter((r) => !listed.has(r)).sort(),
      onlyInReferenceIds: [...listed].filter((r) => !refIds.has(r)).sort(),
      unresolvable: [...listed].filter((r) => !citationIds.has(r)).sort(),
    }).toEqual({ onlyInReferences: [], onlyInReferenceIds: [], unresolvable: [] });
  });
});

/**
 * Landing ↔ app catalog agreement (added 2026-09-01).
 *
 * The landing is a separate Next app with its own deploy, and it keeps its own
 * editorial catalog in `landing/src/lib/programs-catalog.ts` — marketing copy
 * the app has no use for. Nothing connected the two, so on 2026-09-01 three
 * programs were promoted in the app manifest and shipped, while
 * `terav.fit/programs/<slug>` 404'd for all three: `PUBLIC_PROGRAMS` and
 * `generateStaticParams` both derive from that file and it still held five.
 *
 * This runs in the app's suite, not the landing's, because the app's suite is
 * the one wired into the pre-commit hook and `npm run deploy`. Parsed by regex
 * rather than imported — crossing the package boundary for a list of slugs is
 * not worth a build-tool change.
 */
describe("display names", () => {
  it("every manifest slug has an explicit short display name", () => {
    // Without an entry, `programDisplayName` falls back to title-casing the
    // slug, which produced "First Strict Pullup" for a program actually called
    // "First Strict Pull-Up". A new program must not inherit that silently.
    const src = fs.readFileSync(
      path.join(process.cwd(), "src", "lib", "day-format.ts"),
      "utf8",
    );
    const block = src.slice(
      src.indexOf("const DISPLAY_NAMES"),
      src.indexOf("export function programDisplayName"),
    );
    const mapped = new Set([...block.matchAll(/"([a-z0-9-]+)":/g)].map((m) => m[1]));
    const missing = manifest.programs.map((p) => p.slug).filter((s) => !mapped.has(s));
    expect(missing).toEqual([]);
  });
});

describe("landing catalog matches the app manifest", () => {
  const LANDING_CATALOG = path.resolve(
    process.cwd(),
    "..",
    "landing",
    "src",
    "lib",
    "programs-catalog.ts",
  );

  it("every public app program has a landing entry, and vice versa", () => {
    if (!fs.existsSync(LANDING_CATALOG)) return; // landing not checked out

    const src = fs.readFileSync(LANDING_CATALOG, "utf8");
    const landingSlugs = new Set(
      [...src.matchAll(/^\s{4}slug:\s*"([^"]+)"/gm)].map((m) => m[1]),
    );
    // `personal: true` entries are deliberately excluded from PUBLIC_PROGRAMS
    // on both sides — anterior-hip-rebuild carries one person's clinical record.
    const landingPersonal = new Set(
      [...src.matchAll(/slug:\s*"([^"]+)"[\s\S]{0,4000}?personal:\s*true/g)].map((m) => m[1]),
    );
    const landingPublic = [...landingSlugs].filter((s) => !landingPersonal.has(s));

    const appPublic = manifest.programs
      .filter((p) => !p.personal && p.status !== "DRAFT" && p.status !== "draft" && p.status !== "PROVISIONAL")
      .map((p) => p.slug);

    const missingFromLanding = appPublic.filter((s) => !landingPublic.includes(s)).sort();
    const missingFromApp = landingPublic.filter((s) => !appPublic.includes(s)).sort();

    expect({ missingFromLanding, missingFromApp }).toEqual({
      missingFromLanding: [],
      missingFromApp: [],
    });
  });

  it("landing review badges match the app's REFERENCED/REVIEWED ladder", () => {
    if (!fs.existsSync(LANDING_CATALOG)) return;
    const src = fs.readFileSync(LANDING_CATALOG, "utf8");

    // slug → review, read in document order from the same entry block.
    const landingReview = new Map<string, string>();
    for (const m of src.matchAll(
      /slug:\s*"([^"]+)"[\s\S]{0,4000}?review:\s*"(cited|verified)"/g,
    )) {
      if (!landingReview.has(m[1])) landingReview.set(m[1], m[2]);
    }

    const expected = (status?: string) =>
      status === "REVIEWED" || status === "VERIFIED" || status === "stable"
        ? "verified"
        : "cited";

    const mismatches = manifest.programs
      .filter((p) => !p.personal && landingReview.has(p.slug))
      .map((p) => ({
        slug: p.slug,
        app: expected(p.status),
        landing: landingReview.get(p.slug),
      }))
      .filter((r) => r.app !== r.landing);

    expect(mismatches).toEqual([]);
  });
});

/**
 * The landing's headline numbers.
 *
 * `dev/scripts/check-landing-sync.py` used to assert these. It was manual —
 * QA-2 shipped it with a note to "wire to pre-commit or CI later", and later
 * never came — so when its own rule went stale nobody found out. On 2026-09-01
 * it was reporting three failures, all of them wrong: it counted only REVIEWED
 * programs and demanded the landing say "Five programs live", a rule from
 * before the catalog shipped CITED programs publicly. A drift checker that
 * drifts, and cries wolf where nobody hears it, is worse than none.
 *
 * These assertions now live in the suite that runs on every commit and every
 * deploy, and the script is gone.
 */
const NUMBER_WORDS = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight",
  "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen",
];

describe("landing headline numbers match the app", () => {
  const DICT = path.resolve(
    __dirname, "..", "..", "..", "landing", "src", "i18n", "dictionaries", "en.ts",
  );
  const pick = (src: string, key: string) => {
    const m = src.match(new RegExp(`${key}:\\s*"([^"]*)"`));
    return m ? m[1] : null;
  };

  it("program counts on the landing equal the public catalog", () => {
    if (!fs.existsSync(DICT)) return; // landing not checked out
    const src = fs.readFileSync(DICT, "utf8");
    // Every non-personal manifest program ships publicly, CITED or VERIFIED.
    // The ladder is a confidence label, not a gate on being listed.
    const publicCount = manifest.programs.filter((p) => p.personal !== true).length;

    const statDigit = Number((pick(src, "stat_programs_value") ?? "").match(/\d+/)?.[0]);
    expect(statDigit, "hero.stat_programs_value").toBe(publicCount);

    // Match the sentence, not the key: `pick` would return contrast.title,
    // which is the first `title:` in the file.
    const titleWord = src.match(/title:\s*"([A-Za-z]+) programs live/)?.[1]?.toLowerCase();
    expect(titleWord, "programs.title spells the count").toBe(NUMBER_WORDS[publicCount]);
  });

  it("citation counts on the landing equal citations.json", () => {
    if (!fs.existsSync(DICT)) return;
    const src = fs.readFileSync(DICT, "utf8");
    const cites = read("citations.json");
    const total = (cites.citations ?? cites.references ?? []).length;

    expect(Number(pick(src, "stat_studies_value")), "hero.stat_studies_value").toBe(total);
    const evidenceNum = Number((src.match(/(\d+) primary studies/) ?? [])[1]);
    expect(evidenceNum, "evidence.title").toBe(total);
  });

  /**
   * The product contract is "every change cites a study OR names its log
   * signal" (CLAUDE.md). The landing said only the first half, which promises
   * a citation behind changes that are driven by the user's own log instead.
   */
  it("the hero does not promise a citation behind every single change", () => {
    if (!fs.existsSync(DICT)) return;
    const src = fs.readFileSync(DICT, "utf8");
    const sub = pick(src, "sub") ?? "";
    if (/cites a study/.test(sub)) {
      expect(sub, "hero.sub must carry the log-signal half of the claim").toMatch(/log/i);
    }
  });
});

/**
 * Contact address, one value across two deploys.
 *
 * The app used `sellinmargus@gmail.com` in four places; the landing used
 * `hello@terav.fit` in ten. Nobody had confirmed that alias was routed, and it
 * carried more than the beta CTA: the landing's privacy page put it behind
 * "Delete my Terav data" and the terms page behind its contact clause. An
 * unrouted alias there is a GDPR Art. 17 request with nowhere to land — the
 * kind of failure that is silent by construction, since a mail that vanishes
 * generates no error for either side.
 */
describe("contact address does not fork between the two apps", () => {
  const LANDING_SRC = path.resolve(__dirname, "..", "..", "..", "landing", "src");
  const CONTACT = "sellinmargus@gmail.com";

  const walk = (dir: string): string[] =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) return walk(full);
      return /\.tsx?$/.test(e.name) ? [full] : [];
    });

  it("no source file offers an address other than the founder's", () => {
    const roots = [path.resolve(__dirname, "..")];
    if (fs.existsSync(LANDING_SRC)) roots.push(LANDING_SRC);
    const offenders: string[] = [];
    for (const root of roots) {
      for (const file of walk(root)) {
        if (file.endsWith(".test.ts") || file.endsWith(".test.tsx")) continue;
        for (const m of fs.readFileSync(file, "utf8").matchAll(/mailto:([^"'?&\s]+)/g)) {
          if (m[1] !== CONTACT) offenders.push(`${path.basename(file)} :: ${m[1]}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});

/**
 * Symptom regions: declared by programs, resolved against the shared library.
 *
 * This is the pair of rules that keeps `symptom_regions[]` from becoming what
 * `progression_rules.states[]` was — authored in every program file, read by
 * nothing, and wrong for years without a single failing test.
 */
describe("symptom regions", () => {
  it("every program declares the regions its users will be asked about", () => {
    const undeclared = programs
      .filter((p) => !(p.program as { symptom_regions?: string[] }).symptom_regions?.length)
      .map((p) => p.id);
    expect(undeclared).toEqual([]);
  });

  it("every declared region id resolves against the shared library", () => {
    const offenders: string[] = [];
    for (const { id, program } of programs) {
      for (const rid of (program as { symptom_regions?: string[] }).symptom_regions ?? []) {
        if (!REGION_BY_ID[rid]) offenders.push(`${id} :: ${rid}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("a program asks about something, and not so much that nobody reads it", () => {
    // The morning check is answered daily; its cost is attention. Four was the
    // historical count and is the hip program's clinical map.
    for (const { id, program } of programs) {
      const n = ((program as { symptom_regions?: string[] }).symptom_regions ?? []).length;
      expect(n, `${id} region count`).toBeGreaterThanOrEqual(1);
      expect(n, `${id} region count`).toBeLessThanOrEqual(5);
    }
  });

  it("the gymnastics programs can see the injuries they actually cause", () => {
    // The whole point of the change. Regression guard with teeth: medial
    // epicondylitis for pull-ups, false-grip wrist strain for muscle-ups.
    const regionsOf = (slug: string) =>
      (programs.find((p) => p.id === slug)!.program as { symptom_regions?: string[] })
        .symptom_regions ?? [];
    expect(regionsOf("first-strict-pullup")).toContain("elbow");
    expect(regionsOf("muscle-up")).toContain("wrist");
  });

  it("the personal program keeps its own clinical map", () => {
    expect(
      (programs.find((p) => p.id === "anterior-hip-rebuild")!.program as {
        symptom_regions?: string[];
      }).symptom_regions,
    ).toEqual(["groin_left", "low_back", "buttock_left", "shoulder_right"]);
  });
});

/**
 * Authored keys the runtime throws away.
 *
 * Zod strips unknown keys by default, so a program can declare anything and it
 * simply vanishes at `programSchema.parse` with no error, no warning and no
 * failing test. That is the shared mechanism behind a run of bugs found on
 * 2026-08-18 and 2026-09-02:
 *
 *   - `phase_gates[]` — a documented skip rule, read by nothing
 *   - `progression_rules.states[]` — every program's green/amber/red ladder,
 *     read by nothing, while a hardcoded ladder ran instead
 *   - `daily_log_schema` — every program's symptom inputs, read by nothing
 *
 * Each was authored in good faith by someone who believed it took effect. This
 * test is the thing that would have said otherwise on day one.
 */
describe("programs do not author top-level keys the runtime discards", () => {
  /**
   * Keys that are deliberately documentation for humans rather than input to
   * code. Each needs a reason; an entry here is a claim that nothing is
   * supposed to read it.
   */
  const DOCUMENTED_ONLY: Record<string, string> = {
    status_note: "prose shown in audits and the program file header",
    status_history: "provenance trail for status transitions",
    review_evidence: "paths to audit documents",
    reviewed_by: "who audited, surfaced in the ladder disclosure",
    reviewed_at: "when",
    evidence_base: "citation bundle; consumed via references[]",
    daily_log_schema:
      "DEAD as of 2026-09-02 — describes the log shape but nothing reads it. " +
      "Superseded for symptoms by symptom_regions[]. Kept only as authoring " +
      "documentation; see 2026-09-02-readiness-input-P0.md",
    progression_rules:
      "DEAD — per-program green/amber/red ladder that no code evaluates. " +
      "Thresholds are central and audited in lib/symptom-state.ts by design: " +
      "a program declares what feeds the gate, not how lenient it is",
  };

  it.each(programs.map((p) => p.id))("%s authors nothing that is silently dropped", (id) => {
    const entry = manifest.programs.find((p) => p.id === id)!;
    const raw = read(`programs/${entry.slug ?? entry.id}.json`) as Record<string, unknown>;
    const known = new Set(Object.keys(programSchema.shape));
    const dropped = Object.keys(raw).filter(
      (k) => !known.has(k) && !(k in DOCUMENTED_ONLY),
    );
    expect(dropped).toEqual([]);
  });
});

/**
 * Intake-driven deferrals.
 *
 * These exist because `elbow_tendon_pain` and `shoulder_pain_overhead` were
 * required intake questions whose help text promised specific programming
 * changes — "we defer heavy negatives", "we defer ring dip work and use
 * band-assisted dip only" — and nothing read the answers.
 *
 * Every assertion here guards a way the rule could silently never fire, which
 * is the failure mode this codebase produces over and over: a `question_id`
 * that matches no question, a value that is not one of that question's options,
 * an exercise id that resolves to nothing.
 */
describe("intake exclusions", () => {
  type Rule = {
    id: string;
    question_id: string;
    when_value_in: string[];
    exclude_exercise_ids: string[];
    substitute_with?: string;
    reason: string;
  };
  const withRules = programs
    .map((p) => ({
      id: p.id,
      rules: ((p.program as { intake_exclusions?: Rule[] }).intake_exclusions ?? []),
      program: p.program,
    }))
    .filter((p) => p.rules.length);

  it("at least one program declares them (otherwise this suite is vacuous)", () => {
    expect(withRules.length).toBeGreaterThan(0);
  });

  it("every excluded and substituted exercise id resolves", () => {
    const offenders: string[] = [];
    for (const { id, rules } of withRules) {
      for (const r of rules) {
        for (const eid of r.exclude_exercise_ids) {
          if (!byId[eid]) offenders.push(`${id}/${r.id} excludes unknown ${eid}`);
        }
        if (r.substitute_with && !byId[r.substitute_with]) {
          offenders.push(`${id}/${r.id} substitutes unknown ${r.substitute_with}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it("every rule names a question the program actually asks", () => {
    const offenders: string[] = [];
    for (const { id, rules, program } of withRules) {
      const qs = (program as { intake?: { questions?: Array<{ id: string }> } }).intake?.questions ?? [];
      const qids = new Set(qs.map((q) => q.id));
      for (const r of rules) {
        if (!qids.has(r.question_id)) offenders.push(`${id}/${r.id} → ${r.question_id}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("every trigger value is one the question can actually produce", () => {
    // The subtlest way a rule dies: a valid question, a value it never returns.
    // Booleans are stored as the strings "true"/"false" (IntakeClient), selects
    // as their declared option values.
    const offenders: string[] = [];
    for (const { id, rules, program } of withRules) {
      const qs =
        (program as {
          intake?: { questions?: Array<{ id: string; type?: string; options?: Array<{ value: string }> }> };
        }).intake?.questions ?? [];
      for (const r of rules) {
        const q = qs.find((x) => x.id === r.question_id);
        if (!q) continue;
        const allowed =
          q.type === "boolean"
            ? new Set(["true", "false"])
            : new Set((q.options ?? []).map((o) => o.value));
        if (!allowed.size) continue;
        for (const v of r.when_value_in) {
          if (!allowed.has(v)) {
            offenders.push(`${id}/${r.id}: "${v}" not in {${[...allowed].join(", ")}}`);
          }
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it("a substitute is not itself excluded by the same rule", () => {
    const offenders = withRules.flatMap(({ id, rules }) =>
      rules
        .filter((r) => r.substitute_with && r.exclude_exercise_ids.includes(r.substitute_with))
        .map((r) => `${id}/${r.id}`),
    );
    expect(offenders).toEqual([]);
  });

  it("carries a user-facing reason — a silent deferral reads as a bug", () => {
    for (const { id, rules } of withRules) {
      for (const r of rules) {
        expect(r.reason?.length ?? 0, `${id}/${r.id}`).toBeGreaterThan(20);
      }
    }
  });

  it("the promises the intake copy makes are the ones the rules keep", () => {
    // Regression guard with teeth: these three help texts are why the feature
    // exists. If a rule is dropped, the copy starts lying again.
    const pull = withRules.find((p) => p.id === "first-strict-pullup")!;
    expect(pull.rules.map((r) => r.question_id).sort()).toEqual([
      "elbow_tendon_pain",
      "shoulder_pain_overhead",
    ]);
    const mu = withRules.find((p) => p.id === "muscle-up")!;
    expect(mu.rules[0].substitute_with).toBe("mu_band_assisted_ring_dip");
  });
});

/**
 * Tier-aware phase selection.
 *
 * Multi-tier skill programs author one phase per tier at the same start date,
 * so `activePhaseFor` cannot use dates to choose — it matches `for_tier_ids`
 * against the user's tier and falls back to the first match otherwise. The
 * 2026-08-18 audit found that fallback silently handing Tier B/C/D users Tier
 * A's programming (P0-6, since fixed).
 *
 * Both failure modes left are silent in the same way: a `for_tier_ids` naming a
 * tier that does not exist, or a declared tier with no phase of its own. Either
 * one drops the user back to Tier A with nothing logged and nothing rendered
 * differently enough to notice.
 */
describe("tier-aware phase selection cannot fall back silently", () => {
  const tiered = programs
    .map((p) => ({
      id: p.id,
      tiers: ((p.program as { plan_tiers?: Array<{ id: string }> }).plan_tiers ?? []).map((t) => t.id),
      phases: (p.program.phases ?? []) as Array<{ id: string; for_tier_ids?: string[] }>,
    }))
    .filter((p) => p.tiers.length > 0);

  it("there are tiered programs to check", () => {
    expect(tiered.length).toBeGreaterThan(0);
  });

  it("every for_tier_ids entry names a declared tier", () => {
    const offenders: string[] = [];
    for (const { id, tiers, phases } of tiered) {
      const known = new Set(tiers);
      for (const ph of phases) {
        for (const t of ph.for_tier_ids ?? []) {
          if (!known.has(t)) offenders.push(`${id}/${ph.id} → ${t}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it("every declared tier has a phase, or an untagged one to inherit", () => {
    const offenders: string[] = [];
    for (const { id, tiers, phases } of tiered) {
      const hasUntagged = phases.some((ph) => !ph.for_tier_ids?.length);
      if (hasUntagged) continue; // shared phases cover every tier
      for (const t of tiers) {
        if (!phases.some((ph) => ph.for_tier_ids?.includes(t))) {
          offenders.push(`${id}: tier "${t}" has no phase`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});

describe("symptom flags", () => {
  it("every program declares its red-flag chips", () => {
    const undeclared = programs
      .filter((p) => !(p.program as { symptom_flags?: string[] }).symptom_flags?.length)
      .map((p) => p.id);
    expect(undeclared).toEqual([]);
  });

  it("every declared flag id resolves against the shared library", () => {
    const offenders: string[] = [];
    for (const { id, program } of programs) {
      for (const fid of (program as { symptom_flags?: string[] }).symptom_flags ?? []) {
        if (!FLAG_BY_ID[fid]) offenders.push(`${id} :: ${fid}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("night pain is asked on every program", () => {
    // The one flag a program must not be able to drop by omission: pain that
    // wakes you is a red flag whatever you are training for.
    for (const { id, program } of programs) {
      expect(
        (program as { symptom_flags?: string[] }).symptom_flags,
        `${id} must ask about night pain`,
      ).toContain("night_pain");
    }
  });

  it("the hip-labral flags stay on the hip program and nowhere else", () => {
    // These came from one person's clinical record. A pull-up user being asked
    // about gait change is the same category error the region maps made.
    for (const { id, program } of programs) {
      const flags = (program as { symptom_flags?: string[] }).symptom_flags ?? [];
      const hipOnly = flags.filter((f) => f === "gait_change" || f === "painful_click");
      if (id === "anterior-hip-rebuild") expect(hipOnly.sort()).toEqual(["gait_change", "painful_click"]);
      else expect(hipOnly, `${id} should not ask hip-labral flags`).toEqual([]);
    }
  });
});

/**
 * Specialist review (EVID-1).
 *
 * The ladder disclosure on /programs states plainly that no outside clinician
 * has signed off any program in the catalog. That sentence is currently true.
 * The day it stops being true, it has to come off the page — and the failure
 * mode of this codebase is exactly that: copy which was accurate when written
 * and which nobody re-checked. So the two are pinned to each other.
 */
describe("specialist review and the claim that there isn't one", () => {
  const LADDER = path.resolve(__dirname, "..", "app", "programs", "page.tsx");
  const reviewed = programs.filter(
    (p) => (p.program as { specialist_review?: unknown }).specialist_review,
  );

  it("a recorded review carries who, what and when — no anonymous sign-off", () => {
    for (const { id, program } of reviewed) {
      const r = (program as { specialist_review?: Record<string, unknown> }).specialist_review!;
      for (const field of ["name", "credential", "date", "scope", "verdict"]) {
        expect(r[field], `${id}.specialist_review.${field}`).toBeTruthy();
      }
    }
  });

  it("publishes what the reviewer asked for, including anything we declined", () => {
    // A review that only records the findings we agreed with is marketing.
    for (const { id, program } of reviewed) {
      const r = (program as {
        specialist_review?: { verdict?: string; changes?: Array<{ finding: string; our_response: string }> };
      }).specialist_review!;
      if (r.verdict === "ships_with_changes") {
        expect(r.changes?.length, `${id} says "ships with changes" but lists none`).toBeGreaterThan(0);
      }
      for (const c of r.changes ?? []) {
        expect(c.our_response?.length ?? 0, `${id}: a finding with no response`).toBeGreaterThan(10);
      }
    }
  });

  it("the ladder stops saying 'no outside clinician' once one has signed off", () => {
    if (!fs.existsSync(LADDER)) return;
    const copy = fs.readFileSync(LADDER, "utf8");
    const claimsNone = /No\s*\{?"?\s*\}?\s*physiotherapist, coach or sport\s*\n?\s*scientist has independently/.test(
      copy.replace(/&apos;/g, "'"),
    );
    if (reviewed.length > 0) {
      expect(
        claimsNone,
        `${reviewed.length} program(s) now carry a specialist review — the ladder disclosure must be updated`,
      ).toBe(false);
    } else {
      // Nothing reviewed yet, so the disclosure must still be there and honest.
      expect(claimsNone, "the ladder must disclose that no specialist has reviewed").toBe(true);
    }
  });
});

/**
 * Citation bylines must look like bylines.
 *
 * `sci_reports_2026_handstand_shoulder` shipped in a REVIEWED programme with
 * `authors: "Sci Reports handstand-walk shoulder pain team"` and
 * `display_short: "Sci et al. 2026"` — a description where a byline belongs,
 * rendering "Sci" to users as a surname. Its own `used_for` carried
 * "paper existence at claimed URL unconfirmed", which one HTTP request
 * disproved: the paper is real (Angioi et al., Sci Rep, doi 10.1038/
 * s41598-026-51612-w).
 *
 * So the defect was never the paper. It was placeholder metadata that survived
 * authoring, an internal audit, and a REVIEWED badge whose whole meaning is
 * that the citations were re-checked. A caveat saying "we did not verify this"
 * is not a substitute for verifying it, and it is worse than nothing: it makes
 * shipping the unverified thing feel accounted for.
 */
describe("citations carry real bylines", () => {
  const cites = (read("citations.json").citations ?? read("citations.json").references ?? []) as Array<{
    id: string; authors?: string; display_short?: string; used_for?: string;
  }>;

  it("no byline is a prose description of a research group", () => {
    const offenders = cites
      .filter((c) => /\b(team|group|study authors|collaborat)\b/i.test(c.authors ?? ""))
      .map((c) => `${c.id}: ${c.authors}`);
    expect(offenders).toEqual([]);
  });

  it("every citation has authors at all", () => {
    expect(cites.filter((c) => !c.authors?.trim()).map((c) => c.id)).toEqual([]);
  });

  it("display_short starts with a surname, not a journal or a word", () => {
    // "Sci et al. 2026" rendered a journal name as an author to users.
    const offenders = cites
      .filter((c) => c.display_short)
      .filter((c) => /^(sci|nature|the|journal|report)\b/i.test(c.display_short!))
      .map((c) => `${c.id}: ${c.display_short}`);
    expect(offenders).toEqual([]);
  });
});

describe("no programme ships a citation it has not verified", () => {
  it("no used_for admits the source is unconfirmed", () => {
    // Shipping a citation whose own note says nobody checked it exists, inside a
    // programme badged as having had its citations re-checked, is the badge
    // overclaiming in the most literal way available.
    const offenders: string[] = [];
    for (const { id, program } of programs) {
      for (const r of (program.evidence_base?.references ?? []) as Array<{ id: string; used_for?: string }>) {
        if (/\b(unconfirmed|unverified|existence not|could not (?:be )?verif)/i.test(r.used_for ?? "")) {
          offenders.push(`${id} :: ${r.id}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});

/**
 * The shared exercise library's citation pointers.
 *
 * `exercises.json` drills carry `evidence_refs[]`. Nothing renders them — the
 * field is in the schema and read by no source file — so eight ids pointing at
 * citations that do not exist went unnoticed across eighteen drills. Three were
 * id drift (`ludewig_2000` for `ludewig_cook_2000`, `ronnestad_2020` for
 * `ronnestad_hansen_2020`); five named sources never added to citations.json at
 * all, two of them books rather than papers.
 *
 * Harmless while unrendered, and a landmine the moment anyone builds the
 * obvious feature — "show me the papers behind this drill" — on top of it.
 * Found by the 2026-09-03 mobility panel; the referential-integrity suite had
 * covered `reference_ids` but never this second pointer set.
 */
describe("exercise evidence_refs resolve", () => {
  const cites = read("citations.json");
  const known = new Set(
    ((cites.citations ?? cites.references ?? []) as Array<{ id: string }>).map((c) => c.id),
  );

  it("every evidence_ref names a citation that exists", () => {
    const offenders: string[] = [];
    for (const e of library.exercises) {
      for (const r of ((e as { evidence_refs?: string[] }).evidence_refs) ?? []) {
        if (!known.has(r)) offenders.push(`${e.id} → ${r}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});

/**
 * Citation display strings are shown to users on the evidence page, so the
 * conventions matter the way they would in any published reference list.
 */
describe("citation display strings follow citation convention", () => {
  const cites = (read("citations.json").citations ?? read("citations.json").references ?? []) as Array<{
    id: string; authors?: string; url?: string; display_short?: string; display_line?: string;
  }>;

  it("a two-author paper is 'A & B', never 'A et al.'", () => {
    // 46 display strings across 24 entries had this wrong — Achten &
    // Jeukendrup rendered as "Achten et al.".
    const offenders: string[] = [];
    for (const c of cites) {
      const a = c.authors ?? "";
      if (/et al/i.test(a)) continue; // byline itself is truncated
      const names = a.split(/,(?![^()]*\))/).map((n) => n.trim()).filter(Boolean);
      if (names.length !== 2) continue;
      for (const key of ["display_short", "display_line"] as const) {
        if (/et al\./i.test(c[key] ?? "")) offenders.push(`${c.id}.${key}: ${c[key]}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("no url is a search query instead of the article", () => {
    // Seven pointed at PubMed search pages. A link that tells the reader to go
    // and find the paper is not a citation to it.
    const offenders = cites
      .filter((c) => typeof c.url === "string" && /[?&]term=/.test(c.url))
      .map((c) => `${c.id}: ${c.url}`);
    expect(offenders).toEqual([]);
  });
});

describe("retest metrics can actually reach their data", () => {
  // A metric whose `source_ref` doesn't parse resolves to nothing forever and
  // renders as "this metric will land once its data source is wired" — which
  // reads like a roadmap note, not a defect, so nobody investigates. Three
  // separate parsers of this grammar existed before 2026-09-03; consolidating
  // them made it worth asserting that every shipped ref is understood by the
  // one that remains.
  const declared: Array<{ slug: string; metric: Record<string, unknown> }> = [];
  for (const { id, program } of programs) {
    const p = program as unknown as {
      retest_metrics?: Array<Record<string, unknown>>;
      retest_metrics_mid_block?: Array<Record<string, unknown>>;
    };
    for (const m of [...(p.retest_metrics ?? []), ...(p.retest_metrics_mid_block ?? [])]) {
      declared.push({ slug: id, metric: m });
    }
  }

  it("every declared source_ref either parses or is a manual physical test", () => {
    const offenders: string[] = [];
    for (const { slug, metric } of declared) {
      const source = typeof metric.source === "string" ? metric.source : undefined;
      const ref = typeof metric.source_ref === "string" ? metric.source_ref : undefined;
      // Mid-block entries legitimately omit source metadata and inherit it
      // from their end-of-block sibling (see evaluateRetestMetrics).
      if (!source && !ref) continue;
      if (source === "physical_test" || source === "assessment_pack" || source === "capability_level") continue;
      if (!ref) {
        offenders.push(`${slug}/${metric.metric_id}: declares source "${source}" with no source_ref`);
        continue;
      }
      if (/^training_maxes\.[a-z0-9_]+$/i.test(ref)) continue;
      if (metricHasDerivableSeries({ source, source_ref: ref })) continue;
      offenders.push(`${slug}/${metric.metric_id}: unparsed source_ref "${ref}"`);
    }
    expect(offenders).toEqual([]);
  });

  it("every metric a classifier reads is one the program declares", () => {
    // The classifier gates the Cluster chip on readings for its own metric
    // ids. An id it names that no metric declares can never accumulate a
    // reading, so the chip would stay silent with no way to tell why.
    const offenders: string[] = [];
    for (const { id, program } of programs) {
      const c = (program as unknown as {
        non_responder_classifier?: {
          primary_signal_metric_id?: string;
          secondary_signal_metric_ids?: string[];
        };
      }).non_responder_classifier;
      if (!c) continue;
      const p = program as unknown as {
        retest_metrics?: Array<{ metric_id?: string }>;
        retest_metrics_mid_block?: Array<{ metric_id?: string }>;
      };
      const ids = new Set(
        [...(p.retest_metrics ?? []), ...(p.retest_metrics_mid_block ?? [])]
          .map((m) => m.metric_id)
          .filter(Boolean) as string[],
      );
      for (const wanted of [
        c.primary_signal_metric_id,
        ...(c.secondary_signal_metric_ids ?? []),
      ].filter(Boolean) as string[]) {
        if (!ids.has(wanted)) offenders.push(`${id}: classifier reads "${wanted}", no such retest metric`);
      }
    }
    expect(offenders).toEqual([]);
  });
});

describe("every program's load axis can actually draw", () => {
  // The original defect: `SymptomLoadChart` hardcoded three squat and four
  // deadlift exercise ids, which only two of nine programs prescribe. The
  // other seven rendered a symptom line against an empty load line on both
  // /record and /report. Nothing failed, because an empty chart series is
  // indistinguishable from a user who hasn't trained yet.
  //
  // Same contract as symptom_regions: declare or fail. The legacy fallback in
  // loadSignalsForProgram exists so a bad deploy degrades to the old
  // behaviour rather than to nothing — it is not somewhere a shipped program
  // is allowed to live.
  it("every program declares load_signals", () => {
    const missing = programs
      .filter(({ program }) => {
        const ids = (program as unknown as { load_signals?: string[] }).load_signals;
        return !ids?.length;
      })
      .map(({ id }) => id);
    expect(missing).toEqual([]);
  });

  it("every declared load signal id resolves", () => {
    const known = new Set(LOAD_SIGNALS.map((s) => s.id));
    const offenders: string[] = [];
    for (const { id, program } of programs) {
      for (const sig of (program as unknown as { load_signals?: string[] }).load_signals ?? []) {
        if (!known.has(sig)) offenders.push(`${id}: unknown load signal "${sig}"`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("a program's load signals share one unit", () => {
    // The chart has a single load axis with a single label. Kilograms and
    // minutes plotted on one scale is a chart that lies about both.
    const offenders: string[] = [];
    for (const { id, program } of programs) {
      const sigs = loadSignalsForProgram(program as unknown as { load_signals?: string[] });
      if (sigs.length && axisUnitFor(sigs) == null) {
        offenders.push(`${id}: mixed units — ${sigs.map((s) => `${s.id}:${s.unit}`).join(", ")}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("a program's load signal matches the kind of work it prescribes", () => {
    // The specific way the original bug hid: a kg signal on a program that
    // prescribes no barbell work resolves fine and extracts nothing forever.
    // Block `category` is what decides where the work gets logged —
    // DaySession skips `category: "run"` blocks, so run programs never write
    // to exercises[] and a set-based signal can never see them.
    const SET_BASED = new Set(["squat_top_kg", "pull_top_kg", "working_reps", "hold_seconds"]);
    const offenders: string[] = [];
    for (const { id, program } of programs) {
      const cats = new Set(
        (program.blocks ?? []).map(
          (b) => (b as unknown as { category?: string }).category ?? "strength",
        ),
      );
      const hasNonRun = [...cats].some((c) => c !== "run");
      const ids = (program as unknown as { load_signals?: string[] }).load_signals ?? [];
      for (const sig of ids) {
        if (sig === "aerobic_minutes" && !cats.has("run")) {
          offenders.push(`${id}: declares aerobic_minutes but has no run-category block`);
        }
        if (SET_BASED.has(sig) && !hasNonRun) {
          offenders.push(`${id}: declares "${sig}" but every block is run-category`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it("a kg load signal is only declared by a program that prescribes those lifts", () => {
    // This is the assertion that would have caught the original defect.
    const KG_LIFTS: Record<string, string[]> = {
      squat_top_kg: ["back_squat_highbar", "back_squat_ssb", "front_squat"],
      pull_top_kg: [
        "block_pull_midshin",
        "deadlift_conventional",
        "trap_bar_dl_blocks",
        "trap_bar_dl_floor",
      ],
    };
    const offenders: string[] = [];
    for (const { id, program } of programs) {
      const prescribed = new Set<string>();
      for (const b of program.blocks ?? []) {
        for (const item of b.items ?? []) {
          if (item.exercise_id) prescribed.add(item.exercise_id);
        }
      }
      for (const sig of (program as unknown as { load_signals?: string[] }).load_signals ?? []) {
        const lifts = KG_LIFTS[sig];
        if (!lifts) continue;
        if (!lifts.some((l) => prescribed.has(l))) {
          offenders.push(`${id}: declares "${sig}" but prescribes none of ${lifts.join(", ")}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});

describe("intake screening reaches the answers it collects", () => {
  /**
   * Found 2026-09-03 by the simulated shoulder reviewer (SR-1) and verified
   * against the shipped JSON. Two distinct gaps, both systemic:
   *
   * 1. A question offers a risk-valued option that no safety gate reads.
   *    `overhead-mobility` asks "does anything hurt in the last 30 degrees of
   *    overhead reach?" and has no gate on it at all — someone answering yes
   *    is describing painful end-range flexion and is enrolled in a programme
   *    whose entire content is end-range flexion. `rotator_cuff_dx` offers
   *    "unsure", the honest answer of someone with pain and no diagnosis, and
   *    only "yes" blocks. Five other programmes let `hypertension_unmanaged:
   *    "unsure"` through the same way.
   *
   * 2. `evidence_base.contraindications` names more conditions than the gates
   *    can detect. The authors already decided those people should not be
   *    here; nothing asks. first-strict-pullup lists five and gates one.
   *
   * What to do about each gap is a clinical decision and the founder's — an
   * "unsure" might warrant a block, a warning, or nothing depending on the
   * question. What is NOT a decision is whether the set may grow silently.
   * The baseline below is every gap that existed when this test was written,
   * each one visible; anything new fails. Same contract as KNOWN_CUELESS.
   *
   * Do not add to these lists to make a failing build pass. A new entry means
   * a new way for someone to answer honestly and be enrolled anyway.
   */
  const RISK_VALUES = new Set(["yes", "unsure"]);

  /**
   * Empty, as of the 2026-09-03 screening pass. Every question in the catalog
   * that offers "yes" or "unsure" now has a gate that acts on it.
   *
   * It is empty because the gaps were closed, NOT because the list is
   * decorative — the sibling test below fails on a stale entry, so this
   * cannot quietly become a place to park new gaps.
   */
  const KNOWN_UNGATED: string[] = [];

  /** Programmes whose documented contraindications outnumber their gates. */
  const KNOWN_UNDER_GATED: Record<string, { contraindications: number; gates: number }> = {
    "concurrent-strength-maintenance": { contraindications: 5, gates: 3 },
    "engine-builder-block-2": { contraindications: 6, gates: 4 },
    "first-strict-pullup": { contraindications: 5, gates: 1 },
    "handstand-walk": { contraindications: 7, gates: 3 },
    "muscle-up": { contraindications: 6, gates: 3 },
    "overhead-mobility": { contraindications: 5, gates: 3 },
    "rowing-2k-test-prep": { contraindications: 5, gates: 4 },
  };

  type Q = { id?: string; options?: Array<{ value?: string }> };
  type Gate = { question_id?: string; unsafe_values?: string[] };

  function ungatedFor(id: string, program: Program): string[] {
    const intake = (program as unknown as {
      intake?: { questions?: Q[]; safety_gates?: Gate[] };
    }).intake;
    if (!intake) return [];
    const gates = intake.safety_gates ?? [];
    const out: string[] = [];
    for (const q of intake.questions ?? []) {
      if (!q.id) continue;
      const values = new Set(
        (q.options ?? []).map((o) => o?.value).filter((v): v is string => !!v),
      );
      const risky = [...values].filter((v) => RISK_VALUES.has(v)).sort();
      if (risky.length === 0) continue;
      // Union across EVERY gate on this question, not just the first. Once
      // `severity` existed, a question routinely carries two — block on
      // "yes", warn on "unsure" — and a `find()` here silently reported the
      // warned value as ungated. Caught by this test disagreeing with a
      // hand-run survey of the same data.
      const forQuestion = gates.filter((g) => g.question_id === q.id);
      if (forQuestion.length === 0) {
        out.push(`${id}: ${q.id}=<no gate>`);
        continue;
      }
      const covered = new Set(forQuestion.flatMap((g) => g.unsafe_values ?? []));
      for (const v of risky) if (!covered.has(v)) out.push(`${id}: ${q.id}=${v}`);
    }
    return out;
  }

  it("no NEW question collects a risk answer that nothing acts on", () => {
    const found = programs.flatMap(({ id, program }) => ungatedFor(id, program));
    const unexpected = found.filter((f) => !KNOWN_UNGATED.includes(f));
    expect(unexpected).toEqual([]);
  });

  it("the known-ungated list has no stale entries", () => {
    // A gap that was fixed must leave this list, or the list stops describing
    // the app and starts being decoration — the failure mode this whole suite
    // exists to catch.
    const found = new Set(programs.flatMap(({ id, program }) => ungatedFor(id, program)));
    const stale = KNOWN_UNGATED.filter((k) => !found.has(k));
    expect(stale).toEqual([]);
  });

  it("no NEW programme documents a contraindication it cannot detect", () => {
    const offenders: string[] = [];
    for (const { id, program } of programs) {
      const contra =
        ((program as unknown as { evidence_base?: { contraindications?: string[] } })
          .evidence_base?.contraindications ?? []).length;
      const gates =
        ((program as unknown as { intake?: { safety_gates?: Gate[] } }).intake
          ?.safety_gates ?? []).length;
      if (contra <= gates) continue;
      const known = KNOWN_UNDER_GATED[id];
      if (known && known.contraindications === contra && known.gates === gates) continue;
      offenders.push(`${id}: ${contra} contraindications, ${gates} gates`);
    }
    expect(offenders).toEqual([]);
  });
});

describe("user_profile fields nothing reads are declared, not discovered", () => {
  /**
   * The catalog's dead-key test covers program JSON. The store's own profile
   * had the same problem and no equivalent guard, which is how
   * `consent_symptom_data_at` sat unwritten while the privacy page named the
   * consent it records as a lawful basis.
   *
   * An entry here is a claim that nothing is SUPPOSED to read the field. It
   * needs a reason, and the sibling test fails if the field turns out to be
   * live after all — so this cannot become a parking space.
   */
  const KNOWN_INERT: Record<string, string> = {
    tier:
      "ACCOUNT tier (free/trial/paid/beta_forever) — NOT program_states[].tier, " +
      "which is live. Billing (S3) is deferred, not cancelled, and the cap it " +
      "would gate is already enforced by MULTI_MAIN_ENABLED in " +
      "useStore.addSecondaryProgram. Wiring it would give one rule two mechanisms.",
    trial_ends_at: "Same deferral as `tier`; meaningless without it.",
  };

  const SRC = path.resolve(__dirname, "..");
  /**
   * Matches a PROFILE-qualified read only. A bare `tier` substring matches
   * `program_states[slug].tier` and `tier_id` in dozens of places, which
   * would report the account tier as live and defeat the point.
   */
  function isReadOutsideSchemas(field: string): boolean {
    const re = new RegExp(String.raw`(user_)?profile\??\.${field}\b`);
    const hits: string[] = [];
    const walk = (dir: string) => {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walk(p);
        else if (/\.tsx?$/.test(e.name) && !e.name.includes(".test.") && e.name !== "schemas.ts") {
          if (re.test(fs.readFileSync(p, "utf8"))) hits.push(p);
        }
      }
    };
    walk(SRC);
    return hits.length > 0;
  }

  it("every field listed as inert really is inert", () => {
    // A stale entry is worse than none: it tells the next reader a live field
    // is dead, which is exactly how the last four dead keys survived.
    const stale = Object.keys(KNOWN_INERT).filter((f) => isReadOutsideSchemas(f));
    expect(stale).toEqual([]);
  });

  it("consent_symptom_data_at is written, because a lawful basis depends on it", () => {
    expect(isReadOutsideSchemas("consent_symptom_data_at")).toBe(true);
  });
});

describe("training_maxes.starting_values_kg is decorative, and says so", () => {
  /**
   * Found 2026-09-04 while closing out `deadlift_conventional`.
   *
   * Nine programmes author `training_maxes.starting_values_kg` with real
   * numbers — anterior-hip-rebuild carries 110 / 90 / 130, with a
   * `starting_values_note` explaining how they were arrived at. Nothing
   * reads the values. The ONLY runtime read of the object is
   * `Boolean(tms.starting_values_kg)` in adapt.ts's `hasStrengthProgression`,
   * which uses its mere presence as a shape check for "does this programme
   * have a strength surface at all".
   *
   * Training maxes reach a store from intake and `setTM`, nowhere else.
   *
   * This is not the top-level dead-key case the test above covers — the key
   * is nested, and it is not fully dead, which is worse: it is a field that
   * demonstrably does something, so nobody checks whether it does the thing
   * its contents imply. The founder's front squat sat at a copied 110 while
   * the programme he was running authored 90.
   *
   * The test pins the current reality. Wiring the values up is a
   * programming decision (it changes what every new user is seeded with);
   * whoever makes it should delete this block, not edit around it.
   */
  const SRC_DIR = path.resolve(__dirname, "..");

  function readsOf(needle: string): string[] {
    const hits: string[] = [];
    const walk = (dir: string) => {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walk(p);
        else if (/\.tsx?$/.test(e.name) && !e.name.includes(".test.")) {
          if (fs.readFileSync(p, "utf8").includes(needle)) {
            hits.push(path.relative(SRC_DIR, p));
          }
        }
      }
    };
    walk(SRC_DIR);
    return hits.sort();
  }

  it("is read in exactly one place, and only for its presence", () => {
    // If this list grows, either someone wired the values up — in which
    // case this whole block is obsolete — or a second shape check appeared
    // and the two can disagree.
    expect(readsOf("starting_values_kg")).toEqual(["lib/engine/adapt.ts"]);
    const adapt = fs.readFileSync(path.join(SRC_DIR, "lib/engine/adapt.ts"), "utf8");
    expect(adapt).toContain("Boolean(tms && tms.starting_values_kg)");
  });

  it("authors real numbers that nothing consumes", () => {
    // The reason this is worth a test rather than a comment: the values
    // look authoritative in the JSON and a reader has no way to tell they
    // are inert.
    const withValues = programs.filter(({ program }) => {
      const tms = (program as unknown as {
        training_maxes?: { starting_values_kg?: Record<string, unknown> };
      }).training_maxes;
      return Object.values(tms?.starting_values_kg ?? {}).some((v) => typeof v === "number");
    });
    expect(withValues.length).toBeGreaterThan(0);
  });
});
