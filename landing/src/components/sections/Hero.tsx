import { TodayMockup } from "../mockups/TodayMockup";
import type { LandingDict } from "@/i18n/dictionaries/types";
import { APP_URL } from "@/config";

/**
 * Bronze→teal chisel stroke that redraws itself under the H1 keyword.
 * Uses stroke-dashoffset animation — no JS. The `sharpen` metaphor named
 * by the product name (Terav = sharp) as a visual signature.
 */
function ChiselStroke() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 300 12"
      className="pointer-events-none absolute -bottom-1 left-0 h-2.5 w-full"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="chisel-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--color-bronze-hi)" />
          <stop offset="55%" stopColor="var(--color-bronze)" />
          <stop offset="100%" stopColor="var(--color-teal)" />
        </linearGradient>
      </defs>
      <path
        d="M4 8 L296 4"
        stroke="url(#chisel-gradient)"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
        className="chisel-path"
      />
      <style>{`
        .chisel-path {
          stroke-dasharray: 320;
          stroke-dashoffset: 320;
          animation: chisel-draw 1.2s cubic-bezier(0.65, 0, 0.35, 1) 0.4s forwards;
        }
        @keyframes chisel-draw {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </svg>
  );
}

export function Hero({ dict }: { dict: LandingDict }) {
  const t = dict.hero;
  return (
    <section className="relative mx-auto max-w-6xl px-5 pt-8 pb-16 sm:px-6 sm:pt-16 sm:pb-24">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-center lg:gap-16">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-bronze)]" />
            <span className="font-mono text-[10.5px] uppercase tracking-wider text-white/70">
              {t.beta_badge}
            </span>
          </div>

          <h1 className="text-5xl font-black leading-[1.08] tracking-tight text-white sm:text-6xl md:text-7xl">
            {t.h1_a}
            <br className="hidden sm:inline" />{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-[var(--color-bronze-hi)] via-[var(--color-bronze)] to-[var(--color-teal)] bg-clip-text text-transparent">
                {t.h1_b}
              </span>
              <ChiselStroke />
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
            {t.sub}
          </p>

          <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <a
              href={`${APP_URL}/sign-up`}
              className="group inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[var(--color-bronze-hi)] to-[var(--color-bronze-lo)] px-6 py-3.5 text-sm font-semibold text-black shadow-[0_10px_40px_-10px_rgba(208,154,104,0.6)] transition hover:brightness-110 sm:text-base"
            >
              <span>{t.cta_primary}</span>
              <span className="ml-2 transition-transform group-hover:translate-x-0.5">→</span>
            </a>
            <a
              href="/programs"
              className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/[0.03] px-6 py-3.5 text-sm font-medium text-white/85 backdrop-blur transition hover:border-white/40 hover:bg-white/[0.06] sm:text-base"
            >
              {t.browse_link}
            </a>
          </div>

          <a
            href="#how-it-works"
            className="mt-4 inline-flex items-center gap-1 text-[13px] text-white/60 underline decoration-white/20 underline-offset-4 hover:text-white hover:decoration-white/50"
          >
            {t.cta_secondary}
          </a>

          <div className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-white/[0.06] pt-6 sm:gap-6">
            <Stat value={t.stat_programs_value} label={t.stat_programs_label} />
            <Stat value={t.stat_studies_value} label={t.stat_studies_label} />
            <Stat value={t.stat_adapts_value} label={t.stat_adapts_label} />
          </div>
        </div>

        <div className="relative mt-4 lg:mt-0">
          <TodayMockup />
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="mb-1 h-px w-8 bg-white/30" />
      <div className="font-mono text-lg text-white sm:text-xl">{value}</div>
      <div className="mt-0.5 text-[11px] uppercase tracking-wider text-white/60">
        {label}
      </div>
    </div>
  );
}
