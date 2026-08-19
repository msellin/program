"use client";

import { TodaySession } from "@/components/session/TodaySession";

/**
 * F8-second (2026-08-19) — /session/[slug] client wrapper.
 *
 * Wraps TodaySession with a slug override so the session view narrows to
 * a single program. Client component split lets the outer page.tsx stay
 * server-rendered for static-param generation while the actual UI runs
 * on the client with store hydration.
 */
export function SessionClient({ slug }: { slug: string }) {
  return <TodaySession slugOverride={slug} />;
}
