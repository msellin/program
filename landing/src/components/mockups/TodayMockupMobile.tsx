import { PhoneFrame } from "./PhoneFrame";

/**
 * Condensed 3-surface Today mockup for mobile.
 *
 * The full TodayMockup has five surfaces (signals, program header, exercise
 * card header, 4×4 set table, note detected + Accept/Skip). At 340px width
 * on a 375–393 viewport the set table becomes a chart-shaped smudge and
 * the exercise card header restates the program header. This variant keeps
 * only the three surfaces that do 3-second proof work:
 *
 *   #1 Signals strip     — adaptive, cites your body
 *   #2 Program header    — cited protocol (Norwegian 4×4 = real study name)
 *   #5 Note + Accept     — confirm-first mechanic, the differentiator
 *
 * Swaps in via md:hidden / hidden md:block in Hero.tsx.
 */
export function TodayMockupMobile() {
  return (
    <PhoneFrame label="Today · Tuesday">
      <div className="space-y-3 px-4 pb-5 pt-3">
        {/* Signals strip — collapsed with active proposal */}
        <div className="rounded-2xl border border-[var(--color-teal)]/40 bg-[var(--color-teal)]/[0.06] px-3.5 py-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-teal)]" />
            <span className="text-white/85">2 updates from yesterday</span>
            <span className="ml-auto text-white/40">tap</span>
          </div>
          <div className="mt-2 text-[11px] leading-snug text-[var(--color-muted)]">
            Left hip stiffness noted 2× · load ×0.90 proposed
          </div>
        </div>

        {/* Program header */}
        <div>
          <div className="mono-caps">Engine Builder · Week 3 of 8</div>
          <div className="mt-1 font-semibold text-white">
            Aerobic base · Norwegian 4×4
          </div>
        </div>

        {/* Note detected → Accept / Skip — the confirm-first money shot */}
        <div className="rounded-2xl border border-white/[0.08] bg-[var(--color-ground-2)] p-4">
          <div className="mono-caps mb-1.5">Note detected</div>
          <div className="text-[12.5px] leading-snug text-white/80">
            &ldquo;legs feeling flat, low fuel this morning&rdquo;
          </div>
          <div className="mt-1.5 text-[11.5px] text-[var(--color-amber)]">
            → fatigue signal · load ×0.90 proposed
          </div>
          <div className="mt-3 flex gap-2">
            <span className="rounded-md bg-[var(--color-bronze)]/20 px-2.5 py-1 text-[11px] font-semibold text-[var(--color-bronze-hi)]">
              Accept
            </span>
            <span className="rounded-md border border-white/10 px-2.5 py-1 text-[11px] text-[var(--color-muted)]">
              Skip
            </span>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}
