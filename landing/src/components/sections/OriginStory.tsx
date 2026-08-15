import type { LandingDict } from "@/i18n/dictionaries/types";

export function OriginStory({ dict }: { dict: LandingDict }) {
  const t = dict.origin;
  return (
    <section className="relative mx-auto max-w-3xl px-5 py-12 sm:px-6 sm:py-16">
      <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-transparent p-6 sm:p-10">
        <div className="mono-caps mb-3 text-[var(--color-bronze-hi)]">{t.eyebrow}</div>
        <blockquote className="text-xl font-semibold leading-snug tracking-tight text-white sm:text-2xl">
          &ldquo;{t.quote}&rdquo;
        </blockquote>
      </div>
    </section>
  );
}
