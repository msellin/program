"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Stethoscope, Layers } from "lucide-react";
import { BottomNav } from "@/components/nav/BottomNav";
import { StoreHydrator } from "@/components/StoreHydrator";
import { RestTimerHost } from "@/components/workout/RestTimerHost";
import { OnboardingRunner } from "@/components/onboarding/OnboardingRunner";
import { IntroGallery } from "@/components/IntroGallery";
import { useStore } from "@/lib/useStore";
import { today as todayISO } from "@/lib/utils";
import { HeaderQuickLinks } from "@/components/nav/HeaderQuickLinks";
import { createClient } from "@/lib/supabase/client";

/**
 * App shell — the persistent chrome around every authenticated route.
 * Public routes (sign-in / sign-up / legal) render children directly without
 * the store hydrator, bottom nav, or onboarding trigger.
 */
const PUBLIC_ROUTES = ["/sign-in", "/sign-up", "/reset-password", "/legal/privacy", "/legal/terms", "/legal/disclaimer"];

function isPublic(pathname: string): boolean {
  return PUBLIC_ROUTES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const publicRoute = isPublic(pathname);
  if (publicRoute) {
    return (
      <main className="max-w-[760px] mx-auto w-full px-4 sm:px-6 flex-1 py-6">
        {children}
      </main>
    );
  }
  return <AuthGatedShell pathname={pathname}>{children}</AuthGatedShell>;
}

/**
 * Any non-public route must have an authenticated Supabase session. This
 * component blocks the render on `unknown` (spinner) and redirects to
 * /sign-in with a `?next=` param when unauth'd. The check runs on mount and
 * re-runs on session change. Sign-out mid-session bounces the user
 * immediately.
 */
function AuthGatedShell({
  pathname,
  children,
}: {
  pathname: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authState, setAuthState] = useState<"unknown" | "authed" | "unauth">(
    "unknown",
  );

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    const check = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setAuthState(data.session ? "authed" : "unauth");
    };
    void check();

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === "SIGNED_OUT" || !session) setAuthState("unauth");
      else setAuthState("authed");
      // Defensive: if Supabase's Site URL is misconfigured (redirects the
      // recovery link to `/` instead of `/reset-password`), catch the recovery
      // event and route the user to the password-set form.
      if (event === "PASSWORD_RECOVERY" && pathname !== "/reset-password") {
        router.replace("/reset-password");
      }
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (authState !== "unauth") return;
    const next = pathname && pathname !== "/" ? `?next=${encodeURIComponent(pathname)}` : "";
    router.replace(`/sign-in${next}`);
  }, [authState, pathname, router]);

  if (authState !== "authed") {
    return (
      <main className="max-w-[760px] mx-auto w-full px-4 sm:px-6 flex-1 py-6 flex items-center justify-center min-h-[50vh]">
        <p className="text-sm text-muted">Loading…</p>
      </main>
    );
  }

  const isTodayRoute = pathname === "/" || pathname === "";
  return (
    <>
      <StoreHydrator />
      {/* Onboarding modal only makes sense on Today — the morning-check card
          is meaningless on catalog / program preview / progress pages, and
          firing it when a user arrives from the landing on /programs was
          the whole reason we shipped the /programs public preview. */}
      {isTodayRoute ? <OnboardingRunner /> : null}
      <IntroGallery />
      {/* Top nav — in-flow, scrolls with content. Whoop / Strava / Runna
          convention: only the bottom tab bar is fixed; the top chrome
          (brand + utilities) appears on load and scrolls away so content
          dominates. Reclaims 48px of scroll real estate + eliminates the
          "two fixed bars compound weirdly on pinch-zoom" issue. */}
      <header
        className="max-w-[760px] mx-auto w-full"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="flex items-center justify-between px-4 pt-3 pb-2 sm:px-6">
          <Link
            href="/"
            aria-label="Terav — Today"
            className="flex items-center gap-2 font-mono text-[13px] uppercase tracking-[0.22em] text-bronze hover:text-ink"
          >
            TERAV
            <ReadinessDot />
          </Link>
          <div className="flex items-center gap-0.5">
            <Link
              href="/programs/"
              aria-label="Programs"
              className="w-11 h-11 flex items-center justify-center rounded text-muted hover:text-ink hover:bg-line-soft"
            >
              <Layers size={18} strokeWidth={1.75} />
            </Link>
            <Link
              href="/check/"
              aria-label="Morning check"
              className="w-11 h-11 flex items-center justify-center rounded text-muted hover:text-ink hover:bg-line-soft"
            >
              <Stethoscope size={18} strokeWidth={1.75} />
            </Link>
            <HeaderQuickLinks />
          </div>
        </div>
      </header>
      <main
        className="max-w-[760px] mx-auto w-full px-4 sm:px-6 flex-1"
        style={{
          paddingBottom: "calc(64px + env(safe-area-inset-bottom) + 1rem)",
        }}
      >
        {children}
      </main>
      {/* Screen-reader announcer. Used by lib/announce.ts to surface proposal
          acceptance, PR fires, etc. to SR users. Must exist at load time —
          NVDA/JAWS skip late-injected aria-live containers. */}
      <div id="app-status" aria-live="polite" aria-atomic="true" className="sr-only" />
      <RestTimerHost />
      <BottomNav />
    </>
  );
}

/**
 * Colored dot next to the TERAV wordmark reflecting today's derived symptom
 * state (green / amber / red). Whoop / Ultrahuman convention — persistent
 * readiness at-a-glance without a whole panel. Hidden if no check saved.
 */
function ReadinessDot() {
  const derived = useStore((s) => s.store.logs[todayISO()]?.derived_state);
  if (!derived) return null;
  const bg =
    derived === "green"
      ? "bg-green"
      : derived === "amber"
        ? "bg-amber"
        : "bg-red";
  return (
    <span
      aria-label={`Today: ${derived}`}
      title={`Today's state: ${derived}`}
      className={`h-2 w-2 rounded-full ${bg}`}
    />
  );
}
