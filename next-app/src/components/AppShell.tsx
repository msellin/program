"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Stethoscope } from "lucide-react";
import { BottomNav } from "@/components/nav/BottomNav";
import { StoreHydrator } from "@/components/StoreHydrator";
import { RestTimerHost } from "@/components/workout/RestTimerHost";
import { Onboarding } from "@/components/Onboarding";
import { IntroGallery } from "@/components/IntroGallery";
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
      {isTodayRoute ? <Onboarding /> : null}
      <IntroGallery />
      {/* Global top-right utility strip — Stethoscope + ⋮ overflow. */}
      <div className="fixed top-3 right-3 z-30 flex items-center gap-1">
        <Link
          href="/check/"
          aria-label="Morning check"
          className="w-11 h-11 flex items-center justify-center rounded text-muted hover:text-ink hover:bg-line-soft"
        >
          <Stethoscope size={18} strokeWidth={1.75} />
        </Link>
        <HeaderQuickLinks />
      </div>
      <main
        className="max-w-[760px] mx-auto w-full px-4 sm:px-6 flex-1 py-6"
        style={{ paddingBottom: "calc(64px + env(safe-area-inset-bottom) + 1rem)" }}
      >
        {children}
      </main>
      <RestTimerHost />
      <BottomNav />
    </>
  );
}
