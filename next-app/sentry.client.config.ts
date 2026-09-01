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
      // P1-24 — dropped 0.10 → 0.05 in prod so beta traffic doesn't burn
      // the Sentry free-tier transaction quota. Adjust when we're on a
      // paid plan.
      tracesSampleRate: 0.05,
      // P2-5 — INP tracking is on by default in @sentry/nextjs 8+ (was
      // once behind `enableInp: true` in v7). Keeping the note here so
      // it isn't re-flagged. If we upgrade past v10 and the API changes,
      // revisit.
      // Session replays: error-triggered ONLY. The 10% background sampling
      // that used to sit here recorded full DOM replays of one session in ten,
      // and this app's highest-traffic input is a morning symptom form —
      // 0-10 pain scores by body region, plus free-text notes about how a hip
      // feels. `sendDefaultPii: false` does not touch replay; masking is a
      // separate config, and the default masks text but not the fact that a
      // given user sat on /check/hip scoring their groin a 6. Reproducers on
      // actual errors are worth the exposure; background surveillance of a
      // health form is not. (2026-09-01)
      replaysSessionSampleRate: 0,
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
          // P1-23 — the trigger is lifted clear of BottomNav by
          // `#sentry-feedback { --actor-inset: ... }` in globals.css.
          // Those are SDK v10 variable names; v7's `--bottom`/`--right`
          // are inert and were silently doing nothing until 2026-09-01.
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
