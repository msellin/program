import { IntakeMockup } from "../mockups/IntakeMockup";
import { TodayMockup } from "../mockups/TodayMockup";
import { ProgressMockup } from "../mockups/ProgressMockup";
import { SectionHead } from "./ThreeWayContrast";
import type { LandingDict } from "@/i18n/dictionaries/types";

export function HowItWorks({ dict }: { dict: LandingDict }) {
  const t = dict.how;
  const steps = [
    { n: "01", title: t.step_01_title, body: t.step_01_body, Mock: IntakeMockup },
    { n: "02", title: t.step_02_title, body: t.step_02_body, Mock: TodayMockup },
    { n: "03", title: t.step_03_title, body: t.step_03_body, Mock: ProgressMockup },
  ];
  return (
    <section id="how-it-works" className="relative mx-auto max-w-6xl px-5 py-16 sm:px-6 sm:py-24">
      <SectionHead eyebrow={t.eyebrow} title={t.title} />

      <div className="mt-14 space-y-24">
        {steps.map((s, i) => (
          <div
            key={s.n}
            className={`grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-16 ${
              i % 2 === 1 ? "lg:[&>div:first-child]:order-2" : ""
            }`}
          >
            <div>
              <div className="mono-caps mb-3 flex items-center gap-3">
                <span className="text-[var(--color-bronze-hi)]">{s.n}</span>
                <span className="h-px flex-1 bg-white/[0.08]" />
              </div>
              <h3 className="text-2xl font-bold leading-tight text-white sm:text-3xl">
                {s.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-white/65 sm:text-base">
                {s.body}
              </p>
            </div>
            <div className="flex justify-center">{s.Mock ? <s.Mock /> : null}</div>
          </div>
        ))}
      </div>

      <a
        href={"/evidence"}
        className="mt-16 inline-flex items-center gap-1 text-[13px] text-white/55 underline decoration-white/20 underline-offset-4 hover:text-white hover:decoration-white/50"
      >
        {t.evidence_link}
      </a>
    </section>
  );
}
