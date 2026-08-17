/**
 * Concrete alternative to the abstract "Intake · Session · Sharpen" three-step
 * ladder. Shows Mon/Wed/Fri of Engine Builder Week 1 as three cards with
 * real prescriptions and their source citations.
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
      session: "Z2 base row",
      prescription: "40 min · HR 75–85% max",
      detail:
        "Easy — conversational. The block where mitochondrial density and capillary work quietly compound.",
      cite: "Seiler 2010 · Brooks 2018",
    },
    {
      day: "Wed",
      session: "Norwegian 4×4",
      prescription: "4 × 4 min @ 90–95% HRmax · 3 min recovery",
      detail:
        "The canonical VO2max interval. The single most studied protocol in the program.",
      cite: "Helgerud 2007 · Wisløff 2007",
    },
    {
      day: "Fri",
      session: "Threshold row",
      prescription: "3 × 8 min @ pace-5 · 2 min rest",
      detail:
        "Just under LT2 — the number that keeps improving after VO2max plateaus.",
      cite: "Joyner & Coyle 2008",
    },
  ];

  return (
    <section className="relative mx-auto max-w-6xl px-5 py-16 sm:px-6 sm:py-24" id="how-it-works">
      <div className="max-w-3xl">
        <div className="mono-caps mb-3">Your first week</div>
        <h2 className="text-[32px] font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
          This is Engine Builder, Week&nbsp;1.
        </h2>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-[var(--color-muted)] sm:text-lg">
          Three sessions a week. The other four days are yours — keep your box, your coach, your own runs. Terav writes the focus arc. No mystery, no filler.
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
        Every other program shows the same shape — a concrete prescription for
        each session, cited to the primary source. Adaptive changes propose
        against your log; you Accept or Ignore.
      </p>
    </section>
  );
}
