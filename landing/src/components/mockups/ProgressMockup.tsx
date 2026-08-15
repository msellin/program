import { PhoneFrame } from "./PhoneFrame";
import { BottomNavStrip } from "./BottomNavStrip";

/**
 * Progress mockup — weekly narrative + hip-check tile + a mini trend line.
 * Numbers are illustrative but hit the right effect-size range from the
 * whitepaper (VO2max +5-15%, submax HR -8-15 bpm).
 */
export function ProgressMockup() {
  return (
    <PhoneFrame label="Progress · Week 3">
      <div className="space-y-3 px-4 pb-6 pt-3">
        {/* Tab bar — matches shipped Progress view */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {["Lifts", "Hip", "Insights"].map((t) => {
              const isActive = t === "Hip";
              return (
                <div
                  key={t}
                  className={`text-[11px] font-medium ${
                    isActive
                      ? "border-b-2 border-[var(--color-bronze)] pb-1 text-white"
                      : "pb-1 text-white/60"
                  }`}
                >
                  {t}
                </div>
              );
            })}
          </div>
          <button className="rounded-full border border-white/12 bg-white/[0.03] px-2.5 py-1 text-[9px] font-medium uppercase tracking-wider text-white/70">
            Export report
          </button>
        </div>

        {/* Weekly narrative */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
          <div className="mono-caps mb-2">This week</div>
          <p className="text-sm leading-relaxed text-white/85">
            Submax HR down <span className="text-[var(--color-green)]">11 bpm</span> at
            row-pace-5. Left hip flags dropped from 4 to 1. Load held. Read as
            adaptation, not fluke.
          </p>
        </div>

        {/* Hip check tile */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
          <div className="flex items-center justify-between">
            <div className="mono-caps">Hip flexor · left</div>
            <span className="rounded-full border border-[var(--color-green)]/30 bg-[var(--color-green)]/[0.08] px-2 py-0.5 text-[10px] text-[var(--color-green)]">
              trending
            </span>
          </div>
          <div className="mt-3 flex items-end gap-1.5">
            {[3, 4, 4, 3, 2, 2, 1].map((v, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-sm bg-[var(--color-teal)]/60"
                style={{ height: `${v * 8 + 6}px` }}
              />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-white/40">
            <span>Mon</span>
            <span>Sun</span>
          </div>
        </div>

        {/* Trend line */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
          <div className="flex items-center justify-between">
            <div className="mono-caps">Submax HR · row pace 5</div>
            <div className="font-mono text-xs text-[var(--color-green)]">−11 bpm</div>
          </div>
          <svg viewBox="0 0 200 60" className="mt-3 w-full">
            <defs>
              <linearGradient id="hrGrad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#d09a68" stopOpacity="0.4" />
                <stop offset="1" stopColor="#d09a68" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0,15 L28,18 L56,22 L84,28 L112,34 L140,40 L168,44 L200,48"
              fill="none"
              stroke="#d09a68"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M0,15 L28,18 L56,22 L84,28 L112,34 L140,40 L168,44 L200,48 L200,60 L0,60 Z"
              fill="url(#hrGrad)"
            />
          </svg>
          <div className="mt-1 flex justify-between text-[10px] text-white/40">
            <span>W1</span>
            <span>W2</span>
            <span>W3</span>
          </div>
        </div>
      </div>
      <BottomNavStrip active="progress" />
    </PhoneFrame>
  );
}
