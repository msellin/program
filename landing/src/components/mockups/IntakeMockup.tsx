import { PhoneFrame } from "./PhoneFrame";
import { BottomNavStrip } from "./BottomNavStrip";

/**
 * Intake mockup — visualises the app's strongest differentiator: honest refusal.
 * User answered YES to a screening question and the intake refuses to program
 * the movement in this cycle. The whitepaper's safety_gates config drives this
 * per-program; the amber card is the shipped-code behaviour.
 */
export function IntakeMockup() {
  return (
    <PhoneFrame label="Intake · Handstand Walk">
      <div className="space-y-4 px-4 pb-6 pt-4">
        <div>
          <div className="mono-caps">Section 1 · Screening</div>
          <div className="mt-1 text-lg font-semibold leading-snug text-white">
            Osteoporosis diagnosed?
          </div>
        </div>

        <div className="space-y-2">
          <Option label="No" />
          <Option label="Unsure" />
          <Option label="Yes" selected />
        </div>

        {/* Safety-refusal card — amber, informative, cites the reason */}
        <div className="rounded-2xl border border-[var(--color-amber)]/40 bg-[var(--color-amber)]/[0.08] p-3.5">
          <div className="mono-caps mb-1.5 flex items-center gap-2 text-[var(--color-amber)]">
            <span aria-hidden className="text-[13px]">⚠</span>
            <span>Terav won&rsquo;t start this program</span>
          </div>
          <p className="text-[11.5px] leading-relaxed text-white/75">
            Freestanding handstands and bail landings load the distal radius and
            vertebrae — common fracture sites in osteoporosis.
          </p>
          <div className="mt-2 text-[10.5px] text-[var(--color-muted)]">
            Not clinical advice. See your specialist first.
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <button className="text-xs text-[var(--color-muted)]">Change answer</button>
          <button
            disabled
            className="rounded-full bg-white/[0.06] px-4 py-2 text-xs font-semibold text-white/40"
          >
            Continue blocked
          </button>
        </div>
      </div>
      <BottomNavStrip active="today" />
    </PhoneFrame>
  );
}

function Option({ label, selected }: { label: string; selected?: boolean }) {
  return (
    <div
      className={`flex items-center justify-between rounded-xl border px-3.5 py-3 ${
        selected
          ? "border-[var(--color-amber)]/50 bg-[var(--color-amber)]/[0.08]"
          : "border-white/[0.08] bg-white/[0.02]"
      }`}
    >
      <div className="text-sm text-white">{label}</div>
      <div
        className={`h-4 w-4 rounded-full border ${
          selected
            ? "border-[var(--color-amber)] bg-[var(--color-amber)]"
            : "border-white/25"
        }`}
      />
    </div>
  );
}
