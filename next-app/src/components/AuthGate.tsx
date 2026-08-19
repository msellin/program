"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/lib/supabase/session";

/**
 * Client-side auth gate. Wrap the protected shell with this — guests are
 * redirected to /sign-in.
 *
 * Since this app is a static export (no SSR / no middleware runtime), auth
 * gating happens client-side. We accept the ~50 ms "loading" flash on first
 * paint; it's the trade-off for a fully static, edge-cached app.
 */
const PUBLIC_ROUTES = [
  "/sign-in",
  "/sign-up",
  "/legal/privacy",
  "/legal/terms",
  "/legal/disclaimer",
  // Program browsing + preview is public — users need to see what they're
  // signing up for. Intake ('/programs/[slug]/intake') stays gated: it
  // persists real state, which requires auth to make sense.
  "/programs",
];

/**
 * Some routes UNDER /programs are still gated (specifically the intake
 * wizard, which writes user state). This carve-out lets AuthGate treat
 * /programs and /programs/[slug] as public while pushing intake through
 * the sign-in redirect.
 */
const GATED_UNDER_PUBLIC: string[] = ["/programs/", "/intake"];

function isPublicRoute(pathname: string): boolean {
  // Intake wizard under /programs/[slug]/intake stays gated even though
  // /programs is public — we need auth to persist intake answers meaningfully.
  if (pathname.includes("/intake")) return false;
  return PUBLIC_ROUTES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    if (isPublicRoute(pathname)) return;
    if (session.status === "guest") {
      router.replace(`/sign-in?next=${encodeURIComponent(pathname)}`);
    }
  }, [session.status, pathname, router]);

  // Public routes render regardless of session state.
  if (isPublicRoute(pathname)) return <>{children}</>;

  // Protected routes: show nothing while checking, redirect will fire.
  if (session.status === "loading") {
    return (
      <div className="mt-16 text-center text-[14px] text-muted">Loading…</div>
    );
  }
  if (session.status === "guest") {
    return null; // redirect in flight
  }
  return <>{children}</>;
}
