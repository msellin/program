"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Settings } from "lucide-react";
import { BottomNav } from "@/components/nav/BottomNav";
import { StoreHydrator } from "@/components/StoreHydrator";
import { ResumeLastRoute } from "@/components/ResumeLastRoute";
import { RestTimerHost } from "@/components/workout/RestTimerHost";
import { OnboardingRunner } from "@/components/onboarding/OnboardingRunner";
import { createClient } from "@/lib/supabase/client";
import { isGuestRoute, isSemiPublicRoute } from "@/lib/route-access";

/**
 * App shell — the persistent chrome around every authenticated route.
 * Public routes (sign-in / sign-up / legal) render children directly without
 * the store hydrator, bottom nav, or onboarding trigger.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const publicRoute = isGuestRoute(pathname);

  // P2-26 (Batch 28) — focus <main> on every route change (including
  // browser back/forward via router.back()). Next.js App Router doesn't
  // restore focus after client-side navigation, so keyboard users lose
  // focus to <body>. `useEffect` on pathname is the cheapest cross-
  // route hook; skip the initial mount so hard-loads don't fight the
  // browser's default focus behavior.
  const didMount = useRef(false);
  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    if (publicRoute) return;
    const el = document.getElementById("main-content");
    el?.focus({ preventScroll: true });
  }, [pathname, publicRoute]);
  if (publicRoute) {
    return (
      <main className="max-w-[760px] mx-auto w-full px-4 sm:px-6 flex-1 py-6">
        {children}
      </main>
    );
  }
  return (
    <AuthGatedShell pathname={pathname} authOptional={isSemiPublicRoute(pathname)}>
      {children}
    </AuthGatedShell>
  );
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
  authOptional = false,
  children,
}: {
  pathname: string;
  authOptional?: boolean;
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
    // Semi-public route: a guest is allowed to be here, so don't bounce them.
    if (authOptional) return;
    const next = pathname && pathname !== "/" ? `?next=${encodeURIComponent(pathname)}` : "";
    router.replace(`/sign-in${next}`);
  }, [authState, pathname, router, authOptional]);

  // Guest on a semi-public route — render the same bare column a public route
  // gets. No StoreHydrator (there is no user state to hydrate) and no bottom
  // nav (every tab behind it would redirect).
  if (authOptional && authState === "unauth") {
    return (
      <main className="max-w-[760px] mx-auto w-full px-4 sm:px-6 flex-1 py-6">
        {children}
      </main>
    );
  }

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
      {/* P1-56 (Batch 26) — WCAG 2.4.1 bypass block. Keyboard-only users
          skip the header (brand, Settings) to reach content.
          `sr-only focus:not-sr-only` keeps it visually hidden until focused. */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-bronze focus:text-ground focus:px-3 focus:py-2 focus:rounded"
      >
        Skip to content
      </a>
      <StoreHydrator />
      <ResumeLastRoute />
      {/* Onboarding modal only makes sense on Today — the morning-check card
          is meaningless on catalog / program preview / progress pages, and
          firing it when a user arrives from the landing on /programs was
          the whole reason we shipped the /programs public preview. */}
      {isTodayRoute ? <OnboardingRunner /> : null}
      {/* F8 Batch 29 · IA restructure (2026-08-19). Header collapses to
          TERAV wordmark (left) + Settings icon (right). Programs / Morning-
          check / ⋮ overflow all deleted — bottom nav owns tab-switching,
          top owns identity + preferences (Whoop / Runna / Pliability
          model). Extras / Report / Evidence moved to Profile → More.
          Wordmark aligns with landing pattern: bronze pip + strong
          wordmark (P1-72). ReadinessDot removed 2026-08-19 (P1-78 · F8
          second push) — redundant with the MorningCheckBlock at the top
          of Today's dashboard, which is the primary signal now. */}
      <header
        className="max-w-[760px] mx-auto w-full"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="flex items-center justify-between px-4 pt-3 pb-2 sm:px-6">
          <Link
            href="/"
            aria-label="Terav — Today"
            className="flex items-center gap-2 font-sans font-semibold text-[14px] uppercase tracking-[0.22em] text-strong hover:opacity-80"
          >
            <span aria-hidden className="inline-block h-2 w-2 rounded-full bg-bronze" />
            TERAV
          </Link>
          <Link
            href="/settings/"
            aria-label="Settings"
            className="w-11 h-11 flex items-center justify-center rounded text-muted hover:text-ink hover:bg-line-soft focus-visible:text-ink focus-visible:bg-line-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-bronze focus-visible:outline-offset-2 active:bg-surface-2"
          >
            <Settings size={18} strokeWidth={1.75} />
          </Link>
        </div>
      </header>
      {/* Batch 36 Step 2 (v1.1.1 §2.14 P1-5) — Today gets
          overscroll-behavior-y: contain so iOS Safari's rubber-band →
          refresh gesture doesn't fire when the user overscrolls the
          readiness sparkline area. The SVG interferes with the browser's
          chrome heuristics and produces intermittent refreshes. Other
          routes keep default browser behavior. */}
      <main
        id="main-content"
        tabIndex={-1}
        className="max-w-[760px] mx-auto w-full px-4 sm:px-6 flex-1 focus:outline-none"
        style={{
          paddingBottom: "calc(64px + env(safe-area-inset-bottom) + 1rem)",
          overscrollBehaviorY: isTodayRoute ? "contain" : undefined,
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
