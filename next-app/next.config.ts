import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";
import { withSentryConfig } from "@sentry/nextjs";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

// Sentry wraps the config to upload source maps at build time. When
// SENTRY_AUTH_TOKEN isn't set (local dev), it's a no-op — no upload
// attempted, no error. In CI it uses SENTRY_AUTH_TOKEN + SENTRY_ORG +
// SENTRY_PROJECT to attach source maps to the release.
export default withSentryConfig(withSerwist(nextConfig), {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  // We're a static export → don't tunnel Sentry through a Next route
  // (which would require server-side runtime). Direct browser → Sentry
  // works fine on Cloudflare Pages.
  tunnelRoute: undefined,
  sourcemaps: { deleteSourcemapsAfterUpload: true },
  disableLogger: true,
});
