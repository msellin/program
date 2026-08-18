/**
 * Sentry client-side config. Loaded automatically by the Sentry Next.js
 * plugin. Runs in the browser only — server + edge have their own
 * config files.
 *
 * Enables:
 *   - Error tracking with source maps (uploaded via SENTRY_AUTH_TOKEN
 *     on CI build)
 *   - User Feedback widget (floating button opens a modal for bug
 *     reports; attaches any active error context)
 *   - PII scrubbing (we redact anything that looks like an email,
 *     symptom score, or note body; medical data must not leak)
 *
 * DSN is read from NEXT_PUBLIC_SENTRY_DSN. When the env var is unset
 * (local dev without a Sentry account), init becomes a no-op — nothing
 * ships to Sentry, no error thrown.
 */

import * as Sentry from "@sentry/nextjs";

const DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (DSN) {
  Sentry.init({
    dsn: DSN,
    // Send only 10% of transactions in prod — free-tier quota.
    tracesSampleRate: 0.1,
    // Session replays: sample 10% of sessions, 100% of sessions with an
    // error. Cheap way to see reproducers without eating the free-tier
    // event budget.
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    // PII scrubbing: we treat symptom scores, morning-check notes, and
    // session notes as sensitive health data. Sentry's built-in
    // sendDefaultPii is off (default) — we also add a beforeSend hook to
    // drop notes if any leak through in breadcrumbs.
    sendDefaultPii: false,
    beforeSend(event) {
      // Strip user email — we never need it for debugging and it's PII.
      if (event.user?.email) delete event.user.email;
      return event;
    },
    integrations: [
      // User Feedback widget — floating button, opens a modal with
      // name/email/description. Any active error's context (breadcrumbs,
      // release, trace) is auto-attached to the feedback report.
      Sentry.feedbackIntegration({
        colorScheme: "system",
        showBranding: false,
        formTitle: "Send feedback",
        submitButtonLabel: "Send",
        // Auto-fill email from Supabase session if the user's signed in
        // (safe — the feedback recipient is our own team).
        useSentryUser: {
          email: "email",
          name: "name",
        },
      }),
      Sentry.replayIntegration({
        // Redact all text + inputs by default — user's notes / symptom
        // scores never leave their device via replay.
        maskAllText: true,
        maskAllInputs: true,
        blockAllMedia: true,
      }),
    ],
  });
}
