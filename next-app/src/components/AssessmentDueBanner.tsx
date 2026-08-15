"use client";

import Link from "next/link";
import { useStore } from "@/lib/useStore";
import { isDue } from "@/lib/engine/assessment-engine";
import { HIP_FLEXOR_PACK } from "@/lib/assessments-data";

/**
 * Shown on Today when the monthly hip check is due (or has never been done).
 * Persistent — does not auto-dismiss. Removes itself once the check is logged.
 */
export function AssessmentDueBanner({ date }: { date: string }) {
  const store = useStore((s) => s.store);
  const pack = HIP_FLEXOR_PACK;
  const status = isDue(store, pack.id, date);

  if (!status.due) return null;

  const headline =
    status.lastDate == null
      ? "First hip check"
      : `Hip check due (${status.daysSince} days since last)`;

  const subheadline =
    status.lastDate == null
      ? "Six short self-tests so we can start charting the hip trend. About 4 minutes."
      : `Cadence is every ${status.cadence} days. Log another so the trend line stays honest.`;

  return (
    <section
      aria-label="Assessment due"
      className="border border-slate/40 bg-slate/10 rounded-md p-3 space-y-2"
    >
      <p className="font-mono text-[10px] uppercase tracking-widest text-slate">
        Monthly check · due
      </p>
      <p className="font-semibold text-strong text-[15px]">{headline}</p>
      <p className="text-[13px] text-ink leading-snug">{subheadline}</p>
      <div className="pt-1">
        <Link
          href="/check/hip"
          className="inline-block font-mono text-[11.5px] uppercase tracking-wider px-3 py-2 rounded bg-slate text-surface hover:bg-slate/90"
        >
          Start check →
        </Link>
      </div>
    </section>
  );
}
