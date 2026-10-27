/**
 * Concrete alternative to the abstract "Intake · Session · Sharpen" three-step
 * ladder. Shows Mon/Wed/Fri of First Strict Pull-Up week 1 (tier A) as three
 * cards, with the source behind each. No numbers: tier A layout is in the
 * program JSON, the per-set dose is picked at composition time.
 *
 * The founder's rule everyone else violates: "one concrete cite beats 100+
 * cited studies for conviction." (competitor audit).
 */
export function YourFirstWeek() {
  const days: {
    day: string;
    session: string;
    prescription: string;
    detail: string;
    cite: string;
  }[] = [
    {
      day: "Mon",
      session: "Hang session",
      prescription: "Dead hangs · active hollow",
      detail:
        "Grip endurance and shoulder position come first. No pull-up attempts yet.",
      cite: "Youdas 2010",
    },
    {
      day: "Wed",
      session: "Scap-pull session",
      prescription: "Scap pulls · ring rows",
      detail:
        "Learn to start the pull from the shoulder blades, the step before any rep.",
      cite: "Youdas 2010",
    },
    {
      day: "Fri",
      session: "Row session",
      prescription: "Ring rows · short hangs",
      detail:
        "Build the pulling strength that the first rep will draw on.",
      cite: "Roig 2009",
    },
  ];

  return (
    <section className="relative mx-auto max-w-6xl px-5 py-16 sm:px-6 sm:py-24" id="how-it-works">
      <div className="max-w-3xl">
        <div className="mono-caps mb-3">Your first week</div>
        <h2 className="text-[32px] font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
          This is First Strict Pull-Up, week&nbsp;1.
        </h2>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-[var(--color-muted)] sm:text-lg">
          Three sessions a week. The other four days are yours — keep your box, your coach, your own runs. Terav writes the focus. No mystery, no filler.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3 sm:gap-5">
        {days.map((d) => (
          <div
            key={d.day}
            className="rounded-2xl border border-white/[0.08] bg-[var(--color-ground-2)] p-5"
          >
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-bronze)]" />
              <span className="mono-caps">{d.day}</span>
            </div>
            <h3 className="mt-3 text-xl font-bold leading-tight text-white sm:text-2xl">
              {d.session}
            </h3>
            <p className="mt-2 font-mono text-[13px] text-[var(--color-bronze-hi)]">
              {d.prescription}
            </p>
            <p className="mt-3 text-[13.5px] leading-relaxed text-[var(--color-muted)]">
              {d.detail}
            </p>
            <div className="mt-4 border-t border-white/[0.06] pt-3">
              <div className="mono-caps mb-1">Cites</div>
              <div className="font-mono text-[11px] leading-relaxed text-[var(--color-muted)]">
                {d.cite}
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-6 max-w-2xl text-[13px] leading-relaxed text-[var(--color-muted)]">
        Every program shows the same shape: a concrete plan for each session, with
        the source behind it. Changes are proposed from your log; you Accept or
        Ignore.
      </p>
    </section>
  );
}
