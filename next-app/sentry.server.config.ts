/**
 * Sentry server-side config. For SSR routes if any + build tooling.
 * Since we use `output: "export"` (static export to Cloudflare Pages),
 * there is no persistent Node server — this config runs only during
 * the Next build itself. Kept minimal.
 */

import * as Sentry from "@sentry/nextjs";

const DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (DSN) {
  Sentry.init({
    dsn: DSN,
    tracesSampleRate: 0.1,
    sendDefaultPii: false,
  });
}
