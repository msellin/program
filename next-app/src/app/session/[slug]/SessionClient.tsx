"use client";

import { TodayView } from "@/app/page";

/**
 * F8-second (2026-08-19) — /session/[slug] client wrapper.
 *
 * Wraps TodayView with a slug override so the session view narrows to a
 * single program. Client component split lets the outer page.tsx stay
 * server-rendered for static-param generation while the actual UI runs
 * on the client with store hydration.
 */
export function SessionClient({ slug }: { slug: string }) {
  return <TodayView slugOverride={slug} />;
}
