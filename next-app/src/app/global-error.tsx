"use client";

import { useEffect } from "react";

/**
 * Root error boundary. Two things were missing without it:
 *
 * 1. A React render error produced Next's default error screen with no route
 *    back — same dead end as the missing 404, and worse in an installed PWA.
 * 2. Sentry never heard about it. The build has warned about this on every
 *    run ("It seems like you don't have a global error handler set up"):
 *    `Sentry.init` catches unhandled window errors, but React swallows render
 *    errors into the nearest boundary, and there wasn't one. So the single
 *    most user-visible failure — a screen that won't paint — was the one
 *    class of bug that never reached the dashboard.
 *
 * global-error.tsx replaces the root layout when it fires, so it has to bring
 * its own <html> and <body>. Fonts come from CSS variables set on <html> in
 * layout.tsx, which is exactly what is being replaced — hence the explicit
 * font-family fallback rather than font-sans.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Imported lazily and guarded, matching sentry.client.config.ts: with no
    // DSN configured this is a no-op rather than a second failure on top of
    // the one we are already reporting.
    if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return;
    void import("@sentry/nextjs").then((Sentry) => Sentry.captureException(error));
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          background: "#0E0F12",
          color: "#E7E4DF",
          minHeight: "100vh",
          margin: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ maxWidth: "26rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "20px", fontWeight: 600, margin: "0 0 12px" }}>
            Something broke on this screen.
          </h1>
          <p style={{ fontSize: "14px", lineHeight: 1.6, color: "#A8A29B", margin: "0 0 20px" }}>
            Your logged training is safe — it is stored on this device and synced
            separately from whatever failed here.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              minHeight: "44px",
              padding: "0 20px",
              borderRadius: "4px",
              border: "none",
              background: "#B87333",
              color: "#0E0F12",
              fontSize: "12px",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          {error.digest ? (
            <p style={{ fontSize: "11px", color: "#6B6862", marginTop: "20px" }}>
              Reference: {error.digest}
            </p>
          ) : null}
        </div>
      </body>
    </html>
  );
}
