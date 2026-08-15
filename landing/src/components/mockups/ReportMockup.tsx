import { PhoneFrame } from "./PhoneFrame";
import { BottomNavStrip } from "./BottomNavStrip";

/**
 * Specialist report snippet — the artefact you print for your physio.
 * Cross-references symptom log with training load. Real trainers can't
 * assemble this.
 */
export function ReportMockup() {
  return (
    <PhoneFrame label="Specialist report · Nov 2026">
      <div className="space-y-3 px-4 pb-6 pt-3">
        <div>
          <div className="mono-caps">Report · 6 weeks · Terav</div>
          <div className="mt-1 text-base font-semibold text-white">
            Left hip / anterior · training-load cross-ref
          </div>
        </div>

        {/* Overview stats grid — matches the shipped report's opening */}
        <div className="grid grid-cols-4 gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
          <MiniStat label="Sessions" value="14" />
          <MiniStat label="Logged" value="12" />
          <MiniStat label="Rehab" value="8/17" />
          <MiniStat label="Avg RPE" value="6.8" />
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5">
          <div className="mono-caps mb-2">Symptom log</div>
          <div className="space-y-1.5 text-[11px] text-white/70">
            <LogLine date="Oct 04" note="click on lowering, 3/10 · leg raises" tone="amber" />
            <LogLine date="Oct 09" note="ache post-run, 2/10 · settled overnight" tone="amber" />
            <LogLine date="Oct 15" note="no flag" tone="green" />
            <LogLine date="Oct 22" note="mild stiffness AM · gone by warmup" tone="green" />
            <LogLine date="Nov 05" note="no flag · 2×squat session · loaded" tone="green" />
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5">
          <div className="mono-caps mb-2">Load context</div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <Stat label="Sessions" value="14 / 18" />
            <Stat label="Skipped" value="0" />
            <Stat label="Avg RPE" value="6.8" />
            <Stat label="Adj. load" value="×0.94" />
          </div>
        </div>

        <div className="rounded-xl border border-[var(--color-teal)]/25 bg-[var(--color-teal)]/[0.05] p-3.5">
          <div className="mono-caps mb-1.5 text-[var(--color-teal-hi)]">Interpretation</div>
          <div className="text-[11px] leading-relaxed text-white/75">
            Anterior click on lowering phase of hanging leg raises resolved by
            Oct 22 after removing eccentric hip flexion (see substitution log).
            No return in following 2 weeks at higher squat load.
          </div>
        </div>

        {/* Clinical constraints — the specialist-report differentiator no PT app prints */}
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5">
          <div className="mono-caps mb-1.5">Clinical constraints on file</div>
          <ul className="space-y-0.5 text-[10.5px] text-white/60">
            <li>· Deep hip flexion + adduction + internal rotation (FADIR+ bilat.)</li>
            <li>· Eccentric-loaded hip flexion (hanging leg raises, lowering phase)</li>
            <li>· Aggressive couch stretching (anterior capsule)</li>
          </ul>
        </div>

        <button className="mt-1 w-full rounded-xl border border-white/15 bg-white/[0.04] py-2.5 text-xs font-medium text-white/85">
          Export PDF for physio
        </button>
      </div>
      <BottomNavStrip active="history" />
    </PhoneFrame>
  );
}

function LogLine({
  date,
  note,
  tone,
}: {
  date: string;
  note: string;
  tone: "green" | "amber" | "red";
}) {
  const dot =
    tone === "green"
      ? "bg-[var(--color-green)]"
      : tone === "amber"
      ? "bg-[var(--color-amber)]"
      : "bg-[var(--color-red)]";
  return (
    <div className="flex items-start gap-2">
      <span className={`mt-1 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full ${dot}`} />
      <span className="w-14 flex-shrink-0 font-mono text-white/40">{date}</span>
      <span className="flex-1">{note}</span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mono-caps">{label}</div>
      <div className="font-mono text-sm text-white/85">{value}</div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="font-mono text-[13px] font-semibold text-white">{value}</div>
      <div className="mono-caps mt-0.5 text-[9px]">{label}</div>
    </div>
  );
}
