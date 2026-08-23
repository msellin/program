"use client";

import { OffPlanSession } from "@/components/offplan/OffPlanSession";

/**
 * Off-plan redesign (2026-08-24) — thin wrapper, matching how
 * SessionClient.tsx wraps DaySession for /session/[slug]. The actual
 * state + render lives in OffPlanSession, which brings this route onto
 * the same Brief/Set/Rest pattern the rest of the app now uses instead
 * of the pre-redesign ExerciseCard/SetRow/RestTimer stack.
 */
export default function OffPlanPage() {
  return <OffPlanSession />;
}
