"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

/**
 * Put you back where you were after the OS discards the app (2026-08-26).
 *
 * Founder-reported, mid-workout: backgrounding the installed PWA and
 * reopening it lands on Day rather than the set you were on — and only
 * sometimes, seemingly related to how long it was away.
 *
 * That is exactly iOS's behaviour. Under memory pressure it evicts a
 * backgrounded web view; relaunching then starts a COLD load at the
 * manifest's `start_url`, which is "/". Nothing in the app remembered the
 * route — no sessionStorage, no visibilitychange, no pageshow handler
 * anywhere — so the session you were three sets into simply vanished.
 * Short backgrounds keep the view alive, which is why it felt
 * intermittent.
 *
 * Restoring the route is enough to restore the workout: DaySession lands
 * on the first unfinished set, so returning to `/session/<slug>` puts you
 * back on the set you were about to do.
 *
 * Deliberately narrow, because a resume that hijacks navigation is worse
 * than none:
 *   - only on a COLD load (module-scope ref, set once per page load), so
 *     tapping Day in the nav is never redirected;
 *   - only when the cold load landed on "/", which is what start_url
 *     produces;
 *   - only within a few hours, so yesterday's session doesn't reopen;
 *   - never for public routes.
 */
const REMEMBER_KEY = "program.lastRoute.v1";
/** Long enough to survive a gym session and the trip home. */
const MAX_AGE_MS = 6 * 60 * 60 * 1000;

type Remembered = { path: string; at: number };

export function ResumeLastRoute() {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const restoreAttempted = useRef(false);

  // Restore — once, on the first render of a page load.
  useEffect(() => {
    if (restoreAttempted.current) return;
    restoreAttempted.current = true;
    if (pathname !== "/") return;
    try {
      const raw = localStorage.getItem(REMEMBER_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as Remembered;
      if (!saved?.path || saved.path === "/") return;
      if (!saved.path.startsWith("/")) return; // never follow an absolute URL
      if (Date.now() - (saved.at ?? 0) > MAX_AGE_MS) return;
      router.replace(saved.path);
    } catch {
      // A corrupt or unreadable value is not worth failing a cold start.
    }
  }, [pathname, router]);

  // Remember, on every route change.
  useEffect(() => {
    try {
      const withQuery = pathname + (typeof window !== "undefined" ? window.location.search : "");
      localStorage.setItem(
        REMEMBER_KEY,
        JSON.stringify({ path: withQuery, at: Date.now() } satisfies Remembered),
      );
    } catch {
      // Private mode, blocked storage — resume is a convenience, not a
      // feature anything else depends on.
    }
  }, [pathname]);

  return null;
}
