"use client";

import { useState } from "react";
import type { LandingDict } from "@/i18n/dictionaries/types";

/**
 * Three-way contrast — templates, trainers, then us.
 *
 * Mobile: segmented control switches "vs. Templates" / "vs. Trainers", showing
 * only two columns at a time — Terav always on the right. Fixes the
 * horizontal-scroll overflow that previously buried the Terav column offscreen.
 *
 * Desktop (sm+): the original 3-column table.
 */
export function ThreeWayContrast({ dict }: { dict: LandingDict }) {
  const t = dict.contrast;
  const [compare, setCompare] = useState<"template" | "trainer">("template");

  const rows = [
    {
      // Scope row FIRST — answers the "what container is this" question the
      // reader didn't know they had. Kills the "Terav = smarter version of
      // your whole plan" misread before any other row loads.
      label: t.row_scope_label,
      template: t.row_scope_template,
      trainer: t.row_scope_trainer,
      us: t.row_scope_terav,
    },
    {
      label: t.row_what_label,
      template: t.row_what_template,
      trainer: t.row_what_trainer,
      us: t.row_what_terav,
    },
    {
      label: t.row_when_label,
      template: t.row_when_template,
      trainer: t.row_when_trainer,
      us: t.row_when_terav,
    },
  ];

  return (
    <section className="relative mx-auto max-w-6xl px-5 py-16 sm:px-6 sm:py-24">
      <SectionHead eyebrow={t.eyebrow} title={t.title} />

      {/* Mobile: toggle buttons + 2-column comparison. aria-pressed keeps this
          semantically honest without pretending it's a full ARIA tablist
          (would need aria-controls + tabpanel + arrow-key handler). */}
      <div className="mt-8 sm:hidden">
        <div
          role="group"
          aria-label="Compare Terav to"
          className="inline-flex rounded-full border border-white/15 bg-white/[0.03] p-1"
        >
          <button
            type="button"
            aria-pressed={compare === "template"}
            onClick={() => setCompare("template")}
            className={`min-h-[44px] px-4 py-2 rounded-full text-[12px] font-medium transition ${
              compare === "template"
                ? "bg-white/10 text-white"
                : "text-[var(--color-muted)] hover:text-white/85"
            }`}
          >
            vs. {t.col_template}
          </button>
          <button
            type="button"
            aria-pressed={compare === "trainer"}
            onClick={() => setCompare("trainer")}
            className={`min-h-[44px] px-4 py-2 rounded-full text-[12px] font-medium transition ${
              compare === "trainer"
                ? "bg-white/10 text-white"
                : "text-[var(--color-muted)] hover:text-white/85"
            }`}
          >
            vs. {t.col_trainer}
          </button>
        </div>

        <div className="mt-5 rounded-2xl border border-white/[0.08] bg-[var(--color-ground-2)] p-4 space-y-4">
          {rows.map((row) => (
            <div key={row.label} className="space-y-2">
              <p className="text-[11px] uppercase tracking-widest text-[var(--color-muted)]">
                {row.label}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3">
                  <p className="mono-caps mb-1">
                    {compare === "template" ? t.col_template : t.col_trainer}
                  </p>
                  <p className="text-[13.5px] text-white/70 leading-snug">
                    {compare === "template" ? row.template : row.trainer}
                  </p>
                </div>
                <div className="rounded-lg bg-[var(--color-bronze)]/[0.08] border border-[var(--color-bronze)]/30 p-3">
                  <p className="mono-caps mb-1 text-[var(--color-bronze-hi)]">
                    {t.col_terav}
                  </p>
                  <p className="text-[13.5px] text-white font-medium leading-snug">
                    {row.us}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: original 3-column table */}
      <div className="mt-10 hidden sm:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-[11px] uppercase tracking-widest text-[var(--color-muted)]">
              <th scope="col" className="w-[28%] py-4 pr-4 font-normal"></th>
              <th scope="col" className="w-[24%] py-4 pr-4 font-normal">{t.col_template}</th>
              <th scope="col" className="w-[24%] py-4 pr-4 font-normal">{t.col_trainer}</th>
              <th
                scope="col"
                className="w-[24%] py-4 pr-4 font-normal text-[var(--color-bronze-hi)]"
              >
                {t.col_terav}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {rows.map((row) => (
              <tr key={row.label} className="text-white/70">
                <th
                  scope="row"
                  className="py-4 pr-4 text-[13px] uppercase tracking-wider text-[var(--color-muted)] font-normal text-left"
                >
                  {row.label}
                </th>
                <td className="py-4 pr-4">{row.template}</td>
                <td className="py-4 pr-4">{row.trainer}</td>
                <td className="py-4 pr-4 font-medium text-white">{row.us}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function SectionHead({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
}) {
  return (
    <div className="max-w-3xl">
      <div className="mono-caps mb-3">{eyebrow}</div>
      <h2 className="text-[32px] font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {sub ? (
        <p className="mt-4 text-base leading-relaxed text-[var(--color-muted)] sm:text-lg">
          {sub}
        </p>
      ) : null}
    </div>
  );
}
