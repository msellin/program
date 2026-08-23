"use client";

import { useSearchParams } from "next/navigation";
import { DaySession } from "@/components/session/DaySession";

/**
 * F8-second (2026-08-19), repointed for the Day redesign (2026-08-23) —
 * /session/[slug] client wrapper. Client component split lets the outer
 * page.tsx stay server-rendered for static-param generation while the
 * actual UI runs on the client with store hydration.
 *
 * Was `<TodaySession slugOverride={slug} .../>` — the shared-component
 * approach; now points at `DaySession`, the dedicated Brief/Set/Rest
 * shell (see dev/active/day-redesign-plan.md).
 *
 * 2026-08-21 date-context bug fix — reads `?date=YYYY-MM-DD` from the
 * URL and passes it as `initialDate` so navigation from a browsed date
 * (e.g. tomorrow → tap "Open session") lands on the date the user was
 * viewing, not today.
 */
export function SessionClient({ slug }: { slug: string }) {
  const params = useSearchParams();
  const dateParam = params.get("date");
  // Only accept ISO-shaped dates to keep the input trusted.
  const initialDate = dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)
    ? dateParam
    : undefined;
  return <DaySession slug={slug} initialDate={initialDate} />;
}
