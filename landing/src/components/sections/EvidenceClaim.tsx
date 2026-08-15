import Link from "next/link";
import type { LandingDict } from "@/i18n/dictionaries/types";

export function EvidenceClaim({ dict }: { dict: LandingDict }) {
  const t = dict.evidence;
  const href = "/evidence";
  return (
    <section className="relative mx-auto max-w-3xl px-5 py-10 sm:px-6 sm:py-14">
      <Link
        href={href}
        className="group flex items-center justify-between gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-5 py-4 hover:border-white/25 hover:bg-white/[0.04] sm:px-6 sm:py-5"
      >
        <div>
          <div className="mono-caps text-[var(--color-bronze-hi)]">{t.eyebrow}</div>
          <p className="mt-1 text-[15px] font-semibold text-white sm:text-base">
            {t.title}
          </p>
        </div>
        <span className="text-[13px] text-white/60 transition-transform group-hover:translate-x-0.5">
          {t.read_link} →
        </span>
      </Link>
    </section>
  );
}
