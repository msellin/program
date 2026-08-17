import type { Metadata } from "next";
import { Ambient } from "@/components/Ambient";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

const EVIDENCE_TITLE = "Evidence — the primary sources Terav builds on";
const EVIDENCE_DESC =
  "The peer-reviewed studies behind Terav's engine. Grouped by domain: aerobic physiology, concurrent training, motor learning.";

export const metadata: Metadata = {
  title: EVIDENCE_TITLE,
  description: EVIDENCE_DESC,
  openGraph: {
    title: `${EVIDENCE_TITLE} · Terav`,
    description: EVIDENCE_DESC,
    type: "article",
    url: "https://terav.fit/evidence",
  },
  twitter: {
    card: "summary_large_image",
    title: `${EVIDENCE_TITLE} · Terav`,
    description: EVIDENCE_DESC,
  },
  alternates: { canonical: "https://terav.fit/evidence" },
};

type Citation = {
  cite: string;
  claim: string;
};

type Group = {
  domain: string;
  eyebrow: string;
  summary: string;
  citations: Citation[];
};

const groups: Group[] = [
  {
    domain: "Aerobic physiology",
    eyebrow: "28 primary sources",
    summary:
      "The base for Engine Builder. What actually adapts in the first 8 weeks of aerobic work, at what dose, and which metric to track.",
    citations: [
      { cite: "Little JP et al. 2010, J Physiol 588(6):1011-1022", claim: "HIIT drives PGC-1α +25% and mitochondrial protein content in 2 weeks (n=7)" },
      { cite: "Perry CG et al. 2010, Appl Physiol Nutr Metab 35(6):837-844", claim: "7 weeks 3×/wk HIIT: citrate synthase / β-HAD / COXIV +28-36%" },
      { cite: "Konopka AR et al. 2014, J Gerontol A 69(4):371-378", claim: "12 wks progressive cycling: PGC-1α +55-62%, CS +65-102%, COXIV +80-126%; no age difference" },
      { cite: "Bishop DJ et al. 2019, Physiology 34(1):56-70", claim: "Molecular pathway synthesis for mitochondrial biogenesis (AMPK, Ca²⁺/CaMKII, p38 MAPK)" },
      { cite: "Egan B, Zierath JR 2013, Cell Metab 17(2):162-184", claim: "Molecular exercise-adaptation review — the definitive reference for the pathway map" },
      { cite: "Andersen P, Henriksson J 1977, J Physiol 270(3):677-690", claim: "Foundational: capillary density +20%, VO2max +16% in 8 weeks of endurance training" },
      { cite: "Cocks M et al. 2013, J Physiol 591(3):641-656", claim: "SIT and MICT both produce comparable capillary-to-fibre ratio + eNOS gains" },
      { cite: "Helgerud J et al. 2007, MSSE 39(4):665-671", claim: "Norwegian 4×4: stroke volume +10% only in the interval group; the canonical intensity anchor" },
      { cite: "Wisløff U et al. 2007, Circulation 115(24):3086-3094", claim: "12 wks 4×4 in post-MI heart failure: VO2peak +46%, LV EF +35%" },
      { cite: "Baggish AL, Wood MJ 2011, Circulation 123(23):2723-2735", claim: "Endurance drives eccentric LV hypertrophy; strength drives concentric" },
      { cite: "Brooks GA 2018, Cell Metab 27(4):757-785", claim: "Lactate shuttle theory synthesis — the update on Z2 substrate physiology" },
      { cite: "San-Millán I, Brooks GA 2018, Sports Med 48(2):467-479", claim: "Metabolic flexibility, Zone 2 lactate clamp — practical basis for Z2 pacing" },
      { cite: "Achten J et al. 2002, MSSE 34(1):92-97", claim: "Fatmax at ~64% VO2max / ~74% HRmax — Z2 anchor" },
      { cite: "Tanaka H et al. 2001, JACC 37(1):153-156", claim: "HRmax = 208 − 0.7 × age, SEE ~10 bpm" },
      { cite: "Nes BM et al. 2013, SJMSS 23(6):697-704", claim: "HUNT: HRmax = 211 − 0.64 × age — the modern replacement" },
      { cite: "Karvonen MJ et al. 1957, Ann Med Exp Biol Fenn 35(3):307-315", claim: "%HRR (heart rate reserve) — foundational for zone determination" },
      { cite: "Bouchard C et al. 1999 HERITAGE, JAP 87(3):1003-1008", claim: "Individual heritability of VO2max response 47%; ~10× range in individual gains" },
      { cite: "Bouchard C et al. 2011, JAP 110(5):1160-1170", claim: "21-SNP model explains 49% of VO2max response variance" },
      { cite: "Joyner MJ, Coyle EF 2008, J Physiol 586(1):35-44", claim: "VO2max plateaus but threshold + running economy keep improving — track threshold, not VO2max" },
      { cite: "Coyle EF et al. 1984, JAP 57(6):1857-1864", claim: "Detraining: VO2max −7% at 12 days, −16% at 12 weeks" },
      { cite: "Mujika I, Padilla S 2000, Sports Med 30(2):79-87", claim: "Detraining Part I; short-term losses" },
      { cite: "Mujika I, Padilla S 2000, Sports Med 30(3):145-154", claim: "Detraining Part II; intensity > volume for maintenance" },
      { cite: "Ross R et al. 2015, Mayo Clin Proc 90(11):1506-1514", claim: "Non-response at 50% intensity drops to 0% at 75% — often dose, not genotype" },
      { cite: "Hecksteden A et al. 2015, BJSM 49(23):1520-1526", claim: "≥2 baselines required to classify non-responder" },
      { cite: "Trappe S et al. 2013, JAP 114(1):3-10", claim: "Octogenarian lifelong endurance athletes: VO2max ~38 mL/kg/min (~2× age-matched sedentary)" },
      { cite: "McNulty KL et al. 2020, Sports Med 50(10):1813-1827", claim: "Menstrual cycle effect on performance: SMD ~0.06 (trivial average)" },
      { cite: "Seiler S 2010, IJSPP 5(3):276-291", claim: "Polarised distribution — the 80/20 easy-vs-hard split behind the app's aerobic prescription" },
      { cite: "Bosquet L et al. 2007, MSSE 39(8):1358-1365", claim: "Taper meta-analysis: −41-60% volume with intensity held adds ~3% to peak performance; the source for the app's taper protocol" },
    ],
  },
  {
    domain: "Concurrent training",
    eyebrow: "23 primary sources",
    summary:
      "How strength and aerobic work coexist without interference — session order, modality, dose, protein floor. What we ban PR-chasing during an aerobic block.",
    citations: [
      { cite: "Hickson RC 1980, Eur J Appl Physiol 45:255-263", claim: "The original 10-week concurrent study; strength plateaued at week 7 (design flaws acknowledged)" },
      { cite: "Atherton PJ et al. 2005, FASEB J 19:786-788", claim: "AMPK-PKB molecular switch mechanism for the interference effect" },
      { cite: "Coffey VG, Hawley JA 2007, Sports Med 37:737-763", claim: "Foundational integrative review of concurrent adaptation" },
      { cite: "Baar K 2014, Sports Med 44(S2):S117-S125", claim: "3-hour AMPK window post-endurance; mTORC1 sensitised 18-24 h post-lifting" },
      { cite: "Fyfe JJ, Bishop DJ, Stepto NK 2014, Sports Med 44:743-762", claim: "Definitive review of interference mechanism and its modulators" },
      { cite: "Wilson JM et al. 2012, JSCR 26:2293-2307", claim: "21 studies, 422 ES: concurrent reduced strength ES ~18%, hypertrophy ~31%, power ~40%; running > cycling for interference" },
      { cite: "Murach KA, Bagley JR 2016, Sports Med 46:1029-1039", claim: "Contrary evidence: hypertrophy not consistently reduced in ecologically valid protocols" },
      { cite: "Schumann M et al. 2022, Sports Med 52:601-612", claim: "Modern reconciliation: max strength SMD −0.06 (n.s.); hypertrophy SMD −0.01 (n.s.); explosive strength SMD −0.28 (p=0.007)" },
      { cite: "Eddens L et al. 2018, Sports Med 48:177-188", claim: "Resistance-before-endurance produced +6.91% lower-body dynamic strength gain vs endurance-first" },
      { cite: "Robineau J et al. 2016, JSCR 30:672-683", claim: "≥6 h separation preserves strength; 24 h optimises VO2max — the dose-response the app applies" },
      { cite: "Doma K et al. 2019, Sports Med 49:669-682", claim: "Bidirectional damage: running-induced damage impairs subsequent squat/deadlift force for 24-48 h" },
      { cite: "Berryman N et al. 2018, IJSPP 13:57-64", claim: "Cycling shows cleanest bidirectional compatibility with strength" },
      { cite: "Fyfe JJ et al. 2016, Front Physiol 7:487", claim: "HIT+RT and MICT+RT produced same strength decrement — endurance INTENSITY does not mediate interference, VOLUME does" },
      { cite: "Petré H et al. 2018, JSSM 17:167-173", claim: "Highly trained lifters: HIIT vs continuous produced same squat gains" },
      { cite: "Aragon AA, Schoenfeld BJ 2013, JISSN 10:5", claim: "&ldquo;Anabolic window&rdquo; is 4-6 h, not 30 min" },
      { cite: "Morton RW et al. 2018, BJSM 52:376-384", claim: "Meta-analysis: no further hypertrophy benefit above 1.62 g/kg/day protein" },
      { cite: "Jäger R et al. 2017, JISSN 14:20", claim: "ISSN position stand: 1.4-2.0 g/kg/day for exercising individuals" },
      { cite: "Bartlett JD et al. 2015, Eur J Sport Sci 15:3-12", claim: "&ldquo;Train low, compete high&rdquo; — low-CHO amplifies AMPK/PGC-1α/p53" },
      { cite: "Impey SG et al. 2018, Sports Med 48:1031-1048", claim: "&ldquo;Fuel for the Work Required&rdquo; framework — the app's carb-around-session guidance" },
      { cite: "Butcher SJ et al. 2015, Open Access J Sports Med 6:241-247", claim: "CrossFit Total is strongest predictor of Fran/Grace times" },
      { cite: "Meyer J et al. 2017, Workplace Health Saf 65:612-618", claim: "CrossFit systematic review: VO2max, body comp, strength all improve concurrently in ~10 wk protocols" },
      { cite: "Feito Y et al. 2018, Sports 6:76", claim: "16 weeks HIFT: strength AND VO2max improved concurrently" },
      { cite: "Brandt K et al. 2025, Front Physiol 16:1519240", claim: "First HYROX physiological profiling: VO2max is strongest performance predictor" },
    ],
  },
  {
    domain: "Motor learning + skill acquisition",
    eyebrow: "37 primary sources",
    summary:
      "The base for skill programs — handstand, HSPU, muscle-up. Multi-dimensional generation, external-focus cues, contextual interference, spacing.",
    citations: [
      { cite: "Fitts PM, Posner MI 1967", claim: "Cognitive → associative → autonomous stages (descriptive framework)" },
      { cite: "Bernstein NA 1967, The Co-ordination and Regulation of Movements", claim: "Mastery of redundant degrees of freedom; freeze → release → exploit" },
      { cite: "Newell KM 1985", claim: "Constraints-led framework: organismic, task, environmental constraints" },
      { cite: "Karni A et al. 1998, PNAS 95:861-868", claim: "Fast (within-session) vs slow (across-session) learning; M1 remapping over ~3 weeks" },
      { cite: "Doyon J, Benali H 2005, Curr Opin Neurobiol 15:161-167", claim: "Cortico-striatal vs cortico-cerebellar loop — the two skill-learning circuits" },
      { cite: "Krakauer JW et al. 2019, Compr Physiol 9:613-663", claim: "Best modern synthesis: use-dependent + error-based + reinforcement + strategic learning simultaneously" },
      { cite: "Wolpert DM, Ghahramani Z 2000, Nat Neurosci 3(Suppl):1212-1217", claim: "Forward + inverse internal models" },
      { cite: "Shea JB, Morgan RL 1979, JEP Human Learning 5:179-187", claim: "Contextual interference — blocked better in acquisition, random better in retention" },
      { cite: "Brady F 2004, PMS 99:116-126", claim: "Meta-analysis d=0.38 overall; d=0.57 lab, d=0.19 applied/sport" },
      { cite: "Wulf G, Shea CH 2002, Psychonom Bull Rev 9:185-211", claim: "Complex-skill principles differ from simple lab; reduce challenge early, add later" },
      { cite: "Zeng X et al. 2024, Sci Rep 14", claim: "Modern meta confirming moderate CI benefit for retention" },
      { cite: "Henry FM 1968", claim: "Specificity hypothesis; motor abilities are task-specific" },
      { cite: "Proteau L et al. 1992, QJEP 44A:557-575", claim: "Learning specific to sensory conditions of practice" },
      { cite: "Kerwin DG, Trewartha G 2001, MSSE 33:1182-1188", claim: "Handstand hold characterised as wrist-torque-dominated" },
      { cite: "Schmidt RA 1975, Psychol Rev 82:225-260", claim: "Schema theory — variability builds recall and recognition schemas" },
      { cite: "Wulf G, Höß M, Prinz W 1998, JMB 30:169-179", claim: "External focus outperforms internal (stabilometer, ski-simulator)" },
      { cite: "Wulf G 2013, Int Rev Sport Ex Psychol 6:77-104", claim: "15-year review: external focus reliably better across ~100 studies" },
      { cite: "McNevin NH et al. 2003, Psychol Res 67:22-29", claim: "Farther external targets → larger effect" },
      { cite: "Wulf G, Lewthwaite R 2016, PBR 23:1382-1414", claim: "OPTIMAL theory — external focus + enhanced expectancies + autonomy" },
      { cite: "Halperin I et al. 2019, Front Sports Act Living 1:7", claim: "Weightlifting: external focus improves 1RM, force, velocity in most studies" },
      { cite: "Salmoni AW, Schmidt RA, Walter CB 1984, Psych Bull 95:355-386", claim: "Guidance hypothesis: 100% KR hurts retention" },
      { cite: "Winstein CJ, Schmidt RA 1990, JEP LMC 16:677-691", claim: "50% faded KR ≥ 100% during acquisition; better on retention" },
      { cite: "Kernodle MW, Carlton LG 1992, JMB 24:187-195", claim: "For complex tasks: KP > KR" },
      { cite: "Chiviacowsky S, Wulf G 2002, RQES 73:408-415", claim: "Self-controlled KR beats yoked schedules" },
      { cite: "Chiviacowsky S, Wulf G 2005, RQES 76:42-48", claim: "Post-trial choices > pre-trial" },
      { cite: "Ericsson KA et al. 1993, Psych Rev 100:363-406", claim: "Original deliberate practice paper (elite violinists ~10,000 h)" },
      { cite: "Macnamara BN, Hambrick DZ, Oswald FL 2014, Psych Sci 25:1608-1618", claim: "Deliberate practice explains 26% variance in games, 18% sports — 10k-hour rule not defensible" },
      { cite: "Macnamara BN, Maitra M 2019, Royal Soc Open Sci 6:190327", claim: "Direct replication of Ericsson 1993 failed to reproduce strong effect" },
      { cite: "Walker MP et al. 2002, Neuron 35:205-211", claim: "Sleep-dependent motor consolidation, ~20% overnight gain" },
      { cite: "Robertson EM, Pascual-Leone A, Miall RC 2004, Nat Rev Neurosci 5:576-582", claim: "4-6 h post-practice consolidation window vulnerable to similar-task interference" },
      { cite: "Shea CH et al. 2000, Human Mov Sci 19:737-760", claim: "Spacing across days > massing within day" },
      { cite: "Sleeper MD et al. 2012, Int J Sports Phys Ther 7:124-138", claim: "Gymnastics Functional Measurement Tool, test-retest r=0.99" },
      { cite: "Sands WA 2000, Sports Med 30:359-373", claim: "Women's gymnastics injury prevention — skill-readiness assessment" },
      { cite: "Gabbett TJ 2016, BJSM 50:273-280", claim: "Acute-to-chronic workload ratio predicts injury (general mechanism)" },
      { cite: "Ackerman PL 1988, JEP Gen 117:288-318", claim: "Cognitive ability predicts early stage; psychomotor autonomous" },
      { cite: "Wu HG et al. 2014, Nat Neurosci 17:312-321", claim: "3× variance in visuomotor rotation learning; correlates with baseline motor variability" },
      { cite: "Kelso JAS 1995, Dynamic Patterns", claim: "Sub-skills stabilise on their own attractors" },
    ],
  },
];

export default function EvidencePage() {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-[var(--color-ground)] text-white">
      <Ambient />
      <div className="relative">
        <Nav />

        <section className="mx-auto max-w-4xl px-5 pt-10 pb-16 sm:px-6 sm:pt-16">
          <div className="mono-caps mb-3">Evidence</div>
          <h1 className="text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl">
            The primary sources
            <br />
            <span className="bg-gradient-to-r from-[var(--color-bronze-hi)] via-[var(--color-bronze)] to-[var(--color-teal)] bg-clip-text text-transparent">
              Terav is built on.
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/65 sm:text-lg">
            Every rule the engine applies traces to one of these. Where the
            literature isn&rsquo;t there — session length, exact retest cadence,
            specific cue phrasing — we tag the choice as{" "}
            <em>engineering</em> in the app, not science.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6">
            <Stat n="28" label="Aerobic physiology" />
            <Stat n="23" label="Concurrent training" />
            <Stat n="37" label="Motor learning" />
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-5 pb-24 sm:px-6">
          <div className="space-y-16">
            {groups.map((g) => (
              <GroupBlock key={g.domain} group={g} />
            ))}
          </div>

          <div className="mt-20 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 sm:p-8">
            <div className="mono-caps mb-3">Sources we explicitly flag as anecdotal</div>
            <p className="text-sm leading-relaxed text-[var(--color-muted)]">
              We reference (but do not cite as evidence) certain coach
              literature that is not peer-reviewed: Alex Viada&rsquo;s{" "}
              <em>The Hybrid Athlete</em>; Fergus Crawley and Nick Bare&rsquo;s
              personal training practice; HYROX coach commentary; Vladimir
              Uzunov&rsquo;s Four Stage Training Model; the FIG Age Group
              Development Program; USA Gymnastics J.O. Compulsory levels;
              Balyi&rsquo;s LTAD framework; GymnasticBodies, Bar Brothers,
              Progressive Calisthenics. When these appear in the app they
              are labelled &ldquo;coaching consensus,&rdquo; never
              &ldquo;evidence.&rdquo;
            </p>
          </div>

          <div className="mt-8 text-xs leading-relaxed text-[var(--color-muted)]">
            Full source reports are versioned in the codebase at{" "}
            <code className="rounded bg-white/[0.05] px-1.5 py-0.5 font-mono text-[11px]">
              dev/whitepapers/
            </code>{" "}
            — living documents that update as new primary sources land.
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}

function GroupBlock({ group }: { group: Group }) {
  return (
    <div>
      <div className="mb-6 border-b border-white/[0.08] pb-4">
        <div className="mono-caps mb-2">{group.eyebrow}</div>
        <h2 className="text-2xl font-bold text-white sm:text-3xl">
          {group.domain}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--color-muted)]">
          {group.summary}
        </p>
      </div>
      <ul className="divide-y divide-white/[0.04]">
        {group.citations.map((c, i) => (
          <li key={i} className="py-3">
            <div className="text-xs font-mono leading-relaxed text-white/85">
              {c.cite}
            </div>
            <div
              className="mt-1 text-sm leading-relaxed text-white/55"
              dangerouslySetInnerHTML={{ __html: c.claim }}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
      <div className="font-mono text-2xl text-[var(--color-bronze-hi)]">{n}</div>
      <div className="mt-1 text-xs text-[var(--color-muted)]">{label}</div>
    </div>
  );
}
