"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { createClient } from "./client";

/**
 * Client-side auth state. Static-exported app so no server middleware —
 * auth gating is a client concern. Layouts use `useSession()` and either
 * render children (authenticated) or redirect to /sign-in (guest).
 *
 * Loading state matters: while we're checking session, we render nothing
 * (or a loading indicator) rather than briefly showing the guest UI.
 */
export type SessionState =
  | { status: "loading" }
  | { status: "guest" }
  | { status: "authenticated"; session: Session };

export function useSession(): SessionState {
  const [state, setState] = useState<SessionState>({ status: "loading" });

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setState(data.session ? { status: "authenticated", session: data.session } : { status: "guest" });
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setState(session ? { status: "authenticated", session } : { status: "guest" });
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}

/**
 * Get the current access token for calling protected APIs (like /api/state).
 * Returns null if not authenticated. Safe to call from any client component.
 */
export async function getAccessToken(): Promise<string | null> {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}
