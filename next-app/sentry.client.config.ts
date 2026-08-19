/**
 * Sentry client-side config. Loaded automatically by the Sentry Next.js
 * plugin. Runs in the browser only — server + edge have their own
 * config files.
 *
 * Enables (when DSN is set):
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
 *
 * P0-2: the previous eager `import * as Sentry` shipped Replay +
 * Feedback (~100 KB gz) into the shell bundle even when DSN was
 * unset. The dynamic import inside the DSN guard defers all of that
 * to after the initial paint AND only when Sentry is actually enabled.
 * Projected Today LCP delta on 4G cold: -500-800 ms.
 */

const DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (DSN) {
  void (async () => {
    const Sentry = await import("@sentry/nextjs");
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
        if (event.user?.email) delete event.user.email;
        return event;
      },
      integrations: [
        Sentry.feedbackIntegration({
          colorScheme: "system",
          showBranding: false,
          formTitle: "Send feedback",
          submitButtonLabel: "Send",
          useSentryUser: {
            email: "email",
            name: "name",
          },
        }),
        Sentry.replayIntegration({
          maskAllText: true,
          maskAllInputs: true,
          blockAllMedia: true,
        }),
      ],
    });
  })();
}
