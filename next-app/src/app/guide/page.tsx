export default function GuidePage() {
  return (
    <div className="space-y-6 pt-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-strong">Guide</h1>
        <p className="mt-1 text-sm text-muted">Everything the app assumes you know, in one place.</p>
      </header>

      <Section title="How Terav plans training">
        <p>
          <strong>Method:</strong> your active program picks the scheme. Strength programs use 5/3/1
          with training-max-based progression. Aerobic programs use zone-based prescriptions.
          Skill programs use tier gates. All of them progress off your logged data, not a calendar.
        </p>
        <p>
          <strong>Shape:</strong> every program is chunked into phases. Phases advance when the
          progression rule for that phase says green — a combination of adherence, symptom state,
          and any retest metric the program defines.
        </p>
        <p>
          <strong>Adjustments:</strong> the engine proposes changes after each session and each
          morning check. Nothing is applied until you tap Accept — you can ignore a proposal and
          the plan holds.
        </p>
      </Section>

      <Section title="Endurance terms">
        <Term term="Z1 / Zone 1">
          Very easy. Nose-breathing pace, could hold a conversation the whole session. Roughly
          65-75% max HR. This is where mitochondrial and capillary adaptation happens; feels
          slow because it is.
        </Term>
        <Term term="Z2 / Zone 2">
          Easy-moderate. Just above conversational — you could talk in short sentences but not
          sing. Roughly 75-85% max HR / below LT1. The bulk of endurance base work.
        </Term>
        <Term term="Threshold (LT2 / MLSS)">
          The pace where blood lactate stabilises at a moderately high level — sustainable
          for ~60 min in trained athletes. HR usually 85-92% max. Not race pace, not easy.
        </Term>
        <Term term="VO2max intervals (Norwegian 4x4)">
          4 minutes at ~90-95% max HR, 3 minutes easy, repeated 4 times. The most efficient
          protocol for raising VO2max in trained-but-not-elite athletes (Helgerud 2007).
        </Term>
        <Term term="500m split (rowing / erg)">
          Time to complete 500 metres, expressed as mm:ss. A 2K in 7:35 = ~1:53.7 avg split.
          Lower is faster. The universal rowing pace metric.
        </Term>
        <Term term="Taper">
          Deliberate reduction in training volume (usually 40-60%) with intensity held for
          the final 1-2 weeks before a test. Bosquet 2007 meta-analysis: correctly done, a
          taper adds ~3% to peak performance. Under-taper OR over-taper both cost.
        </Term>
      </Section>

      <Section title="Strength terms">
        <Term term="TM (Training Max)">
          The number all percentages calculate from. Roughly 90% of a solid 5RM or 85% of your 1RM.
          Deliberately submaximal — that headroom is what lets you progress without stalling. If TM
          is 110 kg, top set week 1 is 85% × 110 = 93.5 kg for 5+ reps.
        </Term>
        <Term term="1RM">Your one-rep max. Only tested at the end of a full 4-cycle block and at program-defined peak points.</Term>
        <Term term="5RM">
          Heaviest weight you can move for 5 clean reps. Used in evaluation week to set the initial TM.
          Formula: TM = 5RM × 0.90.
        </Term>
        <Term term="Sets × reps">&ldquo;5×5&rdquo; = five sets of five. Rest 2-3 min between working sets on main lifts.</Term>
        <Term term="AMRAP">
          As Many Reps As Possible. Week 1 top set is 5+; do at least 5, then go until form breaks. This
          is where strength jumps come from.
        </Term>
        <Term term="FSL (First Set Last)">
          After the top set, do 5 more sets of 5 at the first working weight of the day. Volume without
          more nervous-system output.
        </Term>
        <Term term="Cycle">One 4-week 5/3/1 block: week 1 (5s), week 2 (3s), week 3 (1+ AMRAP), week 4 (deload).</Term>
        <Term term="Deload">
          Week 4 of every cycle. Low load (40/50/60% TM). Not optional. It&apos;s what lets you keep progressing.
        </Term>
        <Term term="RPE (0–10) — Rate of Perceived Exertion">
          How hard the set felt = how many reps you had left in the tank.
          <br /><br />
          <span className="font-mono text-[12px] text-muted">
            10 = failure · 9 = one rep left · 8 = two left · 7 = three · 6 = four · 5 = half-effort
          </span>
          <br /><br />
          Example: <em>90 × 5 @ RPE 5</em> means you did 5 reps with 90 kg and could have done 5 more.
          The app reads RPE to decide next session&apos;s bump — RPE ≤ 5 gets +10 kg, RPE 7 gets +5,
          RPE 9 holds, RPE 10 usually means TM reset.
          <br /><br />
          Target RPE by scheme: warm-ups 4-6 · 5/3/1 top set week 1 = 7-8 · week 2 = 8 · week 3 AMRAP = 9-10 · FSL 5×5 = 6-7 · deload = 4-5.
        </Term>
        <Term term="Reset rule">
          If you fail to hit reps on the week-3 top set, drop TM by 10% next cycle. Normal — don&apos;t
          muscle through failed reps.
        </Term>
      </Section>

      <Section title="How to use the tabs">
        <Row label="Today">
          Today&apos;s prescribed session. Strength shows exercises with weight, reps,
          RPE per set, plate breakdown and a bar visual. Aerobic / rowing shows the block
          prescription plus a session-log card (duration, HR, splits, watts).
        </Row>
        <Row label="Week">The 7-day rhythm. Today is highlighted. Tap any date to view its session.</Row>
        <Row label="Progress">
          Training maxes, milestones, retest metrics + trend charts. Insights tab
          surfaces weekly narrative and program-specific progress.
        </Row>
        <Row label="History">Activity heatmap, symptom trend, strength progression, and an expandable day log with set-level detail.</Row>
        <Row label="Profile">Signed-in identity, active plan(s), and a compact menu.</Row>
        <p className="text-[14px] text-muted italic pt-2">
          These are the bottom-nav tabs. The rest live behind the ⋮ menu in the top right:
        </p>
        <Row label="Programs">The catalog. Browse, preview, start a program.</Row>
        <Row label="Check">Morning symptom scoring. Save it and today&apos;s prescription auto-adjusts (amber −5%, red −10%).</Row>
        <Row label="Extras">Accessories, home rehab, cardio / conditioning blocks — no calendar pressure.</Row>
        <Row label="Coach">
          Coming soon. When live, an AI coach that reads your logs, TMs, milestones and
          program evidence each turn. Ask about form, plan changes, symptom interpretation.
        </Row>
        <Row label="Report">Specialist-facing summary. Print / save as PDF for a clinician or coach.</Row>
        <Row label="Data">Manage data — import, export, wipe local.</Row>
        <Row label="Guide">This page.</Row>
      </Section>

      <Section title="Green / Amber / Red">
        <p>Symptom state, judged by the morning check the day after training.</p>
        <p>
          <strong className="text-green">Green.</strong> Nothing above 3/10, baseline within 24h. Progress load. TM +5-7.5 kg at cycle end.
        </p>
        <p>
          <strong className="text-amber">Amber.</strong> A 4-5/10 or morning stiffness over 30 min. Hold load. Repeat the week.
        </p>
        <p>
          <strong className="text-red">Red.</strong> Painful click, night pain, gait change, or anything over 5. Back off two steps. TM -10%. Three ambers in a row = same action. Real red flags = clinician, not the app.
        </p>
      </Section>

      <section id="red-flags" style={{ scrollMarginTop: "80px" }} />
      <Section title="Red flags — stop the app, call a clinician">
        <ul className="list-disc pl-5 space-y-1 text-[14px]">
          <li>Pain that wakes you at night, or is worse at rest than with movement</li>
          <li>Any pain that shortens your stride or changes how you walk</li>
          <li>Sharp catch, click or lock in a joint under load</li>
          <li>New neurological symptoms — numbness, tingling, weakness that doesn&apos;t recover</li>
          <li>Morning stiffness over 30 min that responds to movement not rest (screen for inflammatory pattern)</li>
          <li>Any injury with a clear mechanism you don&apos;t bounce back from in 72 h</li>
        </ul>
        <p className="text-[14px] text-muted italic pt-2">
          Programs that already carry a specific clinical context (e.g. the anterior-hip
          case study) apply extra program-specific red flags on top of this general list.
        </p>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-mono text-[14px] uppercase tracking-widest">{title}</h2>
      <div className="rounded border border-line bg-surface p-4 space-y-3 text-[14px] leading-relaxed">
        {children}
      </div>
    </section>
  );
}

function Term({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <p>
      <strong>{term}.</strong> {children}
    </p>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <p>
      <strong>{label}.</strong> {children}
    </p>
  );
}
