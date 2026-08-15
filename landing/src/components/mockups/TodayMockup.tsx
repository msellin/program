import { PhoneFrame } from "./PhoneFrame";
import { BottomNavStrip } from "./BottomNavStrip";

/**
 * Today view — SignalsStrip + program header + first ExerciseCard preview.
 * Copy taken from the actual Engine Builder programme naming ("Norwegian 4×4")
 * and phrasing from SignalsStrip's real signals.
 */
export function TodayMockup() {
  return (
    <PhoneFrame label="Today · Tuesday">
      <div className="space-y-3 px-4 pb-6 pt-3">
        {/* Signals strip — collapsed with active proposal */}
        <div className="rounded-2xl border border-[var(--color-teal)]/40 bg-[var(--color-teal)]/[0.06] px-3.5 py-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-teal)]" />
            <span className="text-white/85">2 updates from yesterday</span>
            <span className="ml-auto text-white/40">tap</span>
          </div>
          <div className="mt-2 text-[11px] text-white/60 leading-snug">
            Left hip stiffness noted 2× · load ×0.90 proposed
          </div>
        </div>

        {/* Program header */}
        <div>
          <div className="mono-caps">Engine Builder · Week 3 of 8</div>
          <div className="mt-1 font-semibold text-white">Aerobic base · Norwegian 4×4</div>
          <div className="mt-0.5 text-xs text-white/60">
            HR 90-95% · row or ski-erg · fuelled
          </div>
        </div>

        {/* Exercise card */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm font-semibold text-white">4 × 4 min interval</div>
              <div className="mt-0.5 text-[11px] text-white/60">3 min active rest</div>
            </div>
            <span className="rounded-full border border-[var(--color-bronze)]/40 bg-[var(--color-bronze)]/[0.08] px-2 py-0.5 text-[10px] font-medium text-[var(--color-bronze-hi)]">
              Interval
            </span>
          </div>

          <div className="mt-3 grid grid-cols-4 gap-1.5 text-[10px]">
            <div className="mono-caps text-white/40">Set</div>
            <div className="mono-caps text-white/40">Time</div>
            <div className="mono-caps text-white/40">HR</div>
            <div className="mono-caps text-white/40">RPE</div>

            <SetRow set="1" time="1:32" hr="182" rpe="8" done />
            <SetRow set="2" time="1:34" hr="184" rpe="8" done />
            <SetRow set="3" time="—" hr="—" rpe="—" />
            <SetRow set="4" time="—" hr="—" rpe="—" />
          </div>

          <div className="mt-3 rounded-lg border border-white/[0.06] bg-black/20 p-2.5">
            <div className="mono-caps mb-1 text-[9px]">Note detected</div>
            <div className="text-[11px] leading-snug text-white/70">
              &ldquo;legs feeling flat, low fuel this morning&rdquo;
              <span className="mt-1 block text-[10px] text-[var(--color-amber)]">
                → fatigue signal · load ×0.90 proposed
              </span>
              <div className="mt-2 flex gap-1.5">
                <span className="rounded-md bg-[var(--color-bronze)]/20 px-2 py-1 text-[9.5px] font-semibold text-[var(--color-bronze-hi)]">
                  Accept
                </span>
                <span className="rounded-md border border-white/10 px-2 py-1 text-[9.5px] text-white/60">
                  Skip
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
      <BottomNavStrip active="today" />
    </PhoneFrame>
  );
}

function SetRow({
  set,
  time,
  hr,
  rpe,
  done,
}: {
  set: string;
  time: string;
  hr: string;
  rpe: string;
  done?: boolean;
}) {
  const cls = done ? "text-white/85" : "text-white/40";
  return (
    <>
      <div className={`font-mono text-[11px] ${cls}`}>{set}</div>
      <div className={`font-mono text-[11px] ${cls}`}>{time}</div>
      <div className={`font-mono text-[11px] ${cls}`}>{hr}</div>
      <div className={`font-mono text-[11px] ${cls}`}>{rpe}</div>
    </>
  );
}
