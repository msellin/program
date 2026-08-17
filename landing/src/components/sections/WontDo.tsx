import type { LandingDict } from "@/i18n/dictionaries/types";

export function WontDo({ dict }: { dict: LandingDict }) {
  const t = dict.wontdo;
  return (
    <section className="relative mx-auto max-w-3xl px-5 py-10 sm:px-6 sm:py-16">
      <details className="group rounded-2xl border border-white/[0.06] bg-[var(--color-ground-2)] px-5 open:pb-5">
        <summary className="flex min-h-[44px] cursor-pointer items-center justify-between list-none py-3">
          <span className="text-[14.5px] font-semibold text-white">{t.summary}</span>
          <span className="text-[13px] text-white/40 transition-transform group-open:rotate-180">
            ↓
          </span>
        </summary>
        <ul className="mt-4 space-y-3 text-[13px] leading-relaxed text-white/70">
          <li>
            <span className="font-semibold text-white/90">{t.not_a_clinician_title}</span>{" "}
            {t.not_a_clinician_body}
          </li>
          <li>
            <span className="font-semibold text-white/90">{t.not_certain_title}</span>{" "}
            {t.not_certain_body}
          </li>
          <li>
            <span className="font-semibold text-white/90">{t.not_streak_title}</span>{" "}
            {t.not_streak_body}
          </li>
        </ul>
      </details>
    </section>
  );
}
