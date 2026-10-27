"use client";

import Link from "next/link";
import { useStore } from "@/lib/useStore";
import { peakRegionScore } from "@/lib/symptom-state";
import { SYMPTOM_REGIONS } from "@/lib/symptom-regions";

/**
 * The whole Today screen on a red day (P-01/P-02, 2026-10-27). One card, one
 * link: no session CTA, no "log it anyway", no extra-session tile. Display
 * only — the gate itself lives in `lib/symptom-state.ts` and is untouched.
 */
export function RedRestCard({ sourceDate }: { sourceDate: string }) {
  const symptoms = useStore((s) => s.store.logs[sourceDate]?.symptoms ?? null);
  const { value, regionId } = symptoms ? peakRegionScore(symptoms) : { value: 0, regionId: null };
  const region = regionId ? SYMPTOM_REGIONS.find((r) => r.id === regionId)?.short : null;
  const lead =
    region && value > 5
      ? `Your ${region.toLowerCase()} is ${value}/10, so hard training waits.`
      : "Your check flagged something, so hard training waits.";
  return (
    <div className="rounded border border-red/30 border-l-4 border-l-red bg-red/10 p-4 text-sm">
      <h2 className="text-[17px] font-semibold text-strong">Rest today.</h2>
      <p className="mt-1 text-muted">
        {lead} If it isn&rsquo;t settling, see a physio or doctor.
      </p>
      <Link
        href="/check/"
        className="mt-3 inline-flex min-h-[44px] items-center text-[14px] font-semibold text-strong underline underline-offset-4"
      >
        Log how it feels
      </Link>
    </div>
  );
}
