"use client";

import { TodaySession } from "@/components/session/TodaySession";

/**
 * Today route. Renders the shared TodaySession component in dashboard
 * mode (no slugOverride). The actual state + render lives in
 * `src/components/session/TodaySession.tsx` so /session/[slug] can
 * import + render the same view narrowed to a single program.
 *
 * File was 1497 lines before the F8-second extraction — Next.js App
 * Router disallows non-default named exports from page files, so the
 * shared component moved out to `src/components/session/`.
 */
export default function TodayPage() {
  return <TodaySession />;
}
