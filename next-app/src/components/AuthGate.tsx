"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/lib/supabase/session";
import { isPublicRoute } from "@/lib/route-access";

/**
 * Client-side auth gate. Wrap the protected shell with this — guests are
 * redirected to /sign-in.
 *
 * Since this app is a static export (no SSR / no middleware runtime), auth
 * gating happens client-side. We accept the ~50 ms "loading" flash on first
 * paint; it's the trade-off for a fully static, edge-cached app.
 */
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
