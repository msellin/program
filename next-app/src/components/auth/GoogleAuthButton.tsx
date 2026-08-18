"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * "Continue with Google" OAuth button. Same button for both sign-in and
 * sign-up — Google OAuth doesn't distinguish new vs. existing users, and
 * Supabase auto-merges by verified email if the user previously signed up
 * with email/password using the same address. Rendering one button
 * instead of "Sign in with Google" + "Sign up with Google" variants
 * halves the visual weight on both pages.
 *
 * PKCE flow (Supabase default):
 *   1. `signInWithOAuth` opens Google's consent screen
 *   2. Google → Supabase auth → back to `redirectTo` with a `?code=…`
 *   3. Supabase client on the landing page auto-exchanges the code for a
 *      session via `detectSessionInUrl` (default true)
 *   4. `onAuthStateChange` fires SIGNED_IN; StoreHydrator picks it up.
 *
 * We land back on /sign-in so any `next=` deep-link the user was heading
 * for before the OAuth hop gets honored by the sign-in page's mount
 * effect.
 *
 * Brand-mark compliance: Google requires "Continue with Google" wording +
 * their multi-color G logo. Logo is inline SVG so we don't ship an asset.
 */
export function GoogleAuthButton({ nextPath }: { nextPath?: string }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onClick = async () => {
    setError(null);
    setSubmitting(true);
    const supabase = createClient();
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    // Bounce back to /sign-in so a `next=` deep-link can be honored by
    // the page's mount effect. `/sign-in` (not `/sign-up`) for both
    // because either way the user ends up with an active session and
    // needs to land on their next path.
    const nextParam = nextPath ? `?next=${encodeURIComponent(nextPath)}` : "";
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/sign-in${nextParam}`,
      },
    });
    if (err) {
      setError(err.message);
      setSubmitting(false);
    }
    // On success, browser is already redirecting to Google — no further
    // state to update.
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onClick}
        disabled={submitting}
        className="w-full flex items-center justify-center gap-3 py-3 min-h-[44px] rounded border border-line bg-surface hover:bg-line-soft text-strong text-[14px] font-medium disabled:opacity-50 transition-colors"
        aria-label="Continue with Google"
      >
        <GoogleGlyph />
        <span>
          {submitting ? "Opening Google…" : "Continue with Google"}
        </span>
      </button>
      {error ? (
        <p className="text-[12px] text-red border-l-4 border-red pl-2">{error}</p>
      ) : null}
    </div>
  );
}

/**
 * Google's official "G" mark — multi-color inline SVG (24x24). Required by
 * Google's brand guidelines when offering "Sign in with Google" or
 * "Continue with Google."
 */
function GoogleGlyph() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 48 48"
      aria-hidden="true"
      className="flex-shrink-0"
    >
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}
