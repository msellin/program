import { PhoneFrame } from "./PhoneFrame";
import { BottomNavStrip } from "./BottomNavStrip";

/**
 * Plan preview — the weekly view. Bronze tag = strength, teal = aerobic,
 * green = recovery. Shows the rules from whitepaper Part 3 landing on the
 * schedule: lift-first on same-day, ≥6h separation on tough days, cycling/
 * rowing preferred over running (Wilson 2012 modality analysis).
 */
export function PlanMockup() {
  return (
    <PhoneFrame label="Week · Engine Builder block 1">
      <div className="space-y-2.5 px-4 pb-6 pt-3">
        {/* Week paginator — matches the shipped Week view */}
        <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2">
          <button className="text-[16px] text-white/40" aria-label="Previous week">‹</button>
          <div className="text-center">
            <div className="text-xs font-semibold text-white">10 Aug → 16 Aug</div>
            <div className="mono-caps text-[9px] text-white/60">This week</div>
          </div>
          <button className="text-[16px] text-white/40" aria-label="Next week">›</button>
        </div>

        {/* Week-intent banner — teal left accent, matches shipped app */}
        <div className="rounded-xl border border-l-4 border-white/[0.06] border-l-[var(--color-teal)]/60 bg-white/[0.02] px-3 py-2">
          <div className="text-[11px] font-semibold text-white">
            Aerobic block · concurrent strength
          </div>
          <div className="mt-0.5 text-[10.5px] text-white/55">
            Build the engine while holding the strength floor. Lift-first same day.
          </div>
        </div>

        <DayRow day="Mon" title="Zone 2 · row 45 min" tag="AEROBIC" tone="teal" />
        <DayRow
          day="Tue"
          title="Squat + press · RPE ≤ 7"
          tag="STRENGTH"
          tone="bronze"
          note="Lift first — same-day (Eddens 2018)"
        />
        <DayRow day="Wed" title="Rest · walk 30 min" tag="RECOVER" tone="green" />
        <DayRow
          day="Thu"
          title="Norwegian 4×4 · ski-erg"
          tag="INTERVAL"
          tone="teal"
          note="Helgerud 2007 — 4×4 drives SV"
        />
        <DayRow day="Fri" title="Deadlift + row · RPE ≤ 7" tag="STRENGTH" tone="bronze" />
        <DayRow day="Sat" title="Zone 2 · row 60 min" tag="AEROBIC" tone="teal" />
        <DayRow day="Sun" title="Rest" tag="OFF" tone="off" />

        <div className="mt-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--color-teal)]" />
            <div className="text-[11px] leading-snug text-white/70">
              Rowing over running for a strength athlete — less bidirectional
              damage (Doma 2019). <span className="text-white/60">Tap for source.</span>
            </div>
          </div>
        </div>
      </div>
      <BottomNavStrip active="week" />
    </PhoneFrame>
  );
}

function DayRow({
  day,
  title,
  tag,
  tone,
  note,
}: {
  day: string;
  title: string;
  tag: string;
  tone: "bronze" | "teal" | "green" | "off";
  note?: string;
}) {
  const tagStyle =
    tone === "bronze"
      ? "border-[var(--color-bronze)]/40 bg-[var(--color-bronze)]/[0.08] text-[var(--color-bronze-hi)]"
      : tone === "teal"
      ? "border-[var(--color-teal)]/30 bg-[var(--color-teal)]/[0.06] text-[var(--color-teal-hi)]"
      : tone === "green"
      ? "border-[var(--color-green)]/30 bg-[var(--color-green)]/[0.06] text-[var(--color-green)]"
      : "border-white/10 bg-white/[0.02] text-white/40";
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
      <div className="flex items-center gap-2.5">
        <span className="font-mono text-[10px] text-white/40 w-8">{day}</span>
        <span className="flex-1 text-xs text-white/85">{title}</span>
        <span className={`rounded-full border px-1.5 py-0.5 text-[9px] font-medium ${tagStyle}`}>
          {tag}
        </span>
      </div>
      {note ? (
        <div className="mt-1.5 pl-10 text-[10px] text-white/60">{note}</div>
      ) : null}
    </div>
  );
}
