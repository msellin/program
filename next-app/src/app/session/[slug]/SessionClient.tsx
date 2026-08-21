"use client";

import { useSearchParams } from "next/navigation";
import { TodaySession } from "@/components/session/TodaySession";

/**
 * F8-second (2026-08-19) — /session/[slug] client wrapper.
 *
 * Wraps TodaySession with a slug override so the session view narrows to
 * a single program. Client component split lets the outer page.tsx stay
 * server-rendered for static-param generation while the actual UI runs
 * on the client with store hydration.
 *
 * 2026-08-21 date-context bug fix (option A) — reads `?date=YYYY-MM-DD`
 * from the URL and passes it as `initialDate` so navigation from
 * Today's DateNav (e.g. tomorrow → tap "Open session") lands on the
 * date the user was viewing, not today. Was a real user-reported bug
 * where the session route always rendered today's plan regardless of
 * caller's active date. Full date-context refactor (option B) is
 * pending an expert brainstorm on Today/Week UX architecture — see
 * `dev/active/redesign-progress/` for the redesign context.
 */
export function SessionClient({ slug }: { slug: string }) {
  const params = useSearchParams();
  const dateParam = params.get("date");
  // Only accept ISO-shaped dates to keep the input trusted.
  const initialDate = dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)
    ? dateParam
    : undefined;
  return <TodaySession slugOverride={slug} initialDate={initialDate} />;
}
