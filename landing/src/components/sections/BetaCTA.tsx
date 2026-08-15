import type { LandingDict } from "@/i18n/dictionaries/types";
import { APP_URL } from "@/config";

export function BetaCTA({ dict }: { dict: LandingDict }) {
  const t = dict.beta;
  return (
    <section className="relative mx-auto max-w-4xl px-5 py-16 text-center sm:px-6 sm:py-24">
      <h2 className="text-3xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl md:text-6xl">
        {t.h2_a}
        <br />
        <span className="bg-gradient-to-r from-[var(--color-bronze-hi)] via-[var(--color-bronze)] to-[var(--color-teal)] bg-clip-text text-transparent">
          {t.h2_b}
        </span>
      </h2>

      <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/60">
        {t.body}
      </p>

      <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <a
          href={`${APP_URL}/sign-up`}
          className="group inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[var(--color-bronze-hi)] to-[var(--color-bronze-lo)] px-7 py-4 text-base font-semibold text-black shadow-[0_10px_40px_-10px_rgba(208,154,104,0.6)] transition hover:brightness-110"
        >
          <span>{t.cta_primary}</span>
          <span className="ml-2 transition-transform group-hover:translate-x-0.5">→</span>
        </a>
        <a
          href="mailto:hello@terav.fit?subject=Terav%20beta"
          className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/[0.03] px-7 py-4 text-base font-medium text-white/85 backdrop-blur transition hover:border-white/40 hover:bg-white/[0.06]"
        >
          {t.cta_secondary}
        </a>
      </div>
    </section>
  );
}
