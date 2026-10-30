"use client";

import Link from "next/link";
import { useStore } from "@/lib/useStore";
import { deriveState, reasonForState } from "@/lib/symptom-state";
import { Card } from "@/components/ui/Card";

/**
 * The whole Today screen on a red day (P-01/P-02, 2026-10-27). One card, one
 * link: no session CTA, no "log it anyway", no extra-session tile. Display
 * only — the gate itself lives in `lib/symptom-state.ts` and is untouched.
 */
export function RedRestCard({ sourceDate }: { sourceDate: string }) {
  const symptoms = useStore((s) => s.store.logs[sourceDate]?.symptoms ?? null);
  // The same reason line the check shows (RECHECK-new-4), not a second wording.
  const lead =
    symptoms && deriveState(symptoms) === "red"
      ? `${reasonForState(symptoms, "red")} Hard training waits.`
      : "Your check flagged something, so hard training waits.";
  return (
    <Card status="red" className="bg-red/10 text-small">
      <h2 className="text-h3 text-strong">Rest today.</h2>
      <p className="mt-1 text-muted">
        {lead} If it isn&rsquo;t settling, see a physio or doctor.
      </p>
      <Link
        href="/check/"
        className="mt-3 inline-flex min-h-[44px] items-center text-small font-semibold text-strong underline underline-offset-4"
      >
        Log how it feels
      </Link>
    </Card>
  );
}
