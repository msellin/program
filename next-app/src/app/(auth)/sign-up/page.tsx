"use client";

import { Suspense, useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { mapAuthError } from "@/lib/auth-errors";
import { TurnstileWidget, captchaRequired } from "@/components/auth/TurnstileWidget";
import { captureAttribution, signupMetadata, stashPendingSignupMeta } from "@/lib/attribution";
import { Button } from "@/components/ui/Button";
import { Wordmark } from "@/components/ui/Wordmark";
import { cardClass } from "@/components/ui/Card";

/**
 * Sign-up requires:
 * - Terms of service acceptance
 * - Explicit consent to store symptom / health-related data (GDPR — this is
 *   special-category data; needs an affirmative, separate opt-in)
 *
 * We save consent timestamps to the user_profiles row after first sign-in so
 * the record shows exactly when the user agreed to what.
 */
export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="pt-8 text-small text-muted">Loading…</div>}>
      <SignUpInner />
    </Suspense>
  );
}

function SignUpInner() {
  const searchParams = useSearchParams();
  const rawNext = searchParams?.get("next") ?? "";
  // Relative paths only: this lands in an emailRedirectTo and a router push.
  const nextPath = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/";
  const signInUrl = (origin: string) =>
    `${origin}/sign-in${nextPath !== "/" ? `?next=${encodeURIComponent(nextPath)}` : ""}`;

  useEffect(() => {
    captureAttribution();
  }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [consentSymptom, setConsentSymptom] = useState(false);
  const [confirmAge, setConfirmAge] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaReset, setCaptchaReset] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const resendConfirmation = async () => {
    setError(null);
    setResending(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        captchaToken: captchaToken ?? undefined,
        emailRedirectTo:
          typeof window !== "undefined" ? signInUrl(window.location.origin) : undefined,
      },
    });
    setResending(false);
    setCaptchaReset((n) => n + 1);
    if (err) {
      setError(mapAuthError(err.message).message);
      return;
    }
    setResent(true);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!acceptTerms) {
      setError("Please accept the terms of service and medical disclaimer.");
      return;
    }
    if (!consentSymptom) {
      setError("Please tick the health-data consent — the app can't work without it.");
      return;
    }
    if (!confirmAge) {
      setError("Please confirm you are 16 or older.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (captchaRequired && !captchaToken) {
      setError("Please complete the bot check below first.");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        captchaToken: captchaToken ?? undefined,
        data: signupMetadata(),
        emailRedirectTo:
          typeof window !== "undefined" ? signInUrl(window.location.origin) : undefined,
      },
    });
    setSubmitting(false);
    setCaptchaReset((n) => n + 1);
    if (err) {
      setError(mapAuthError(err.message).message);
      return;
    }
    setSent(true);
  };

  const signInHref = nextPath !== "/" ? `/sign-in?next=${encodeURIComponent(nextPath)}` : "/sign-in";
  const consentsComplete = acceptTerms && consentSymptom && confirmAge;

  if (sent) {
    return (
      <div className="max-w-sm mx-auto pt-8 space-y-4">
        <h1 className="text-h1 text-strong">Check your email</h1>
        <p className="text-small text-ink">
          We sent a confirmation link to <strong>{email}</strong>. Tap it, then sign in.
        </p>
        <div className={`${cardClass()} space-y-1.5`}>
          <p className="text-eyebrow uppercase tracking-widest text-muted">What happens next</p>
          <ol className="list-decimal pl-5 text-caption text-ink space-y-1">
            <li>Tap the link in the email, then sign in.</li>
            <li>Answer a few questions about where you are now (a few minutes, one per screen). Physical tests are optional.</li>
            <li>Your first session is ready on Today. Terav sharpens it against your log as you go.</li>
          </ol>
          <p className="text-caption text-muted">
            Terav is a training log, not a clinician or medical advice. Stop if something hurts.
          </p>
        </div>
        <p className="text-caption text-muted">
          Nothing arrived after a couple of minutes? Check the spam folder, or resend below.
        </p>
        {error ? <p className="text-small text-red">{error}</p> : null}
        <TurnstileWidget onToken={setCaptchaToken} resetKey={captchaReset} />
        {resent ? (
          <p className="text-small text-green">Sent again — check your inbox.</p>
        ) : null}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={resendConfirmation}
            disabled={resending || resent || (captchaRequired && !captchaToken)}
            className="inline-flex items-center gap-1.5 min-h-[44px] text-eyebrow uppercase tracking-wider px-3 py-2 rounded-lg bg-bronze text-ground hover:bg-bronze-hover disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {resending ? "Sending…" : resent ? "Sent" : "Resend confirmation"}
          </button>
          <Link
            href={signInHref}
            className="inline-flex items-center min-h-[44px] text-eyebrow uppercase tracking-wider px-3 py-2 rounded-lg border border-line hover:bg-line-soft"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto pt-8 space-y-5">
      <div className="flex items-center gap-1.5 mb-4">
        <Wordmark />
      </div>
      <header className="space-y-1">
        <h1 className="text-h1 tracking-tight text-strong">Sign up</h1>
      </header>

      <div className="space-y-3">
        <label className="flex items-start gap-2 text-small ">
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-bronze flex-shrink-0"
          />
          <span>
            I accept the{" "}
            <Link href="/legal/terms" target="_blank" className="text-slate border-b border-slate">
              terms
            </Link>{" "}
            and{" "}
            <Link href="/legal/disclaimer" target="_blank" className="text-slate border-b border-slate">
              medical disclaimer
            </Link>
            . Terav is a training log — not medical advice.
          </span>
        </label>

        <label className="flex items-start gap-2 text-small">
          <input
            type="checkbox"
            checked={consentSymptom}
            onChange={(e) => setConsentSymptom(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-bronze flex-shrink-0"
          />
          <span>
            I consent to storing my training log and symptom scores. See the{" "}
            <Link href="/legal/privacy" target="_blank" className="text-slate border-b border-slate">
              privacy policy
            </Link>
            {" "}— you can export or delete everything from Profile.
          </span>
        </label>

        <label className="flex items-start gap-2 text-small">
          <input
            type="checkbox"
            checked={confirmAge}
            onChange={(e) => setConfirmAge(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-bronze flex-shrink-0"
          />
          <span>I am 16 or older.</span>
        </label>
      </div>

      <GoogleAuthButton
        nextPath={nextPath}
        disabled={!consentsComplete}
        onBeforeRedirect={stashPendingSignupMeta}
      />
      {!consentsComplete ? (
        <p className="text-eyebrow text-muted -mt-2">Tick the three boxes above to continue with Google or email.</p>
      ) : null}

      <div className="flex items-center gap-3 pt-1">
        <span className="flex-1 h-px bg-line-soft" aria-hidden />
        <span className="text-eyebrow uppercase tracking-widest text-muted">
          or with email
        </span>
        <span className="flex-1 h-px bg-line-soft" aria-hidden />
      </div>

      <form onSubmit={submit} className="space-y-3" noValidate>
        <label htmlFor="signup-email" className="block text-small">
          <span className="block text-muted mb-1">Email</span>
          <input
            id="signup-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full text-small px-3 py-2.5 min-h-[44px] border border-line rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-bronze focus:border-bronze"
          />
        </label>
        <label htmlFor="signup-password" className="block text-small">
          <span className="block text-muted mb-1">
            Password <span className="text-eyebrow text-muted">(8+ characters)</span>
          </span>
          <input
            id="signup-password"
            type="password"
            required
            autoComplete="new-password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full text-small px-3 py-2.5 min-h-[44px] border border-line rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-bronze focus:border-bronze"
          />
        </label>

        {error ? (
          <p className="text-small text-red border-l-4 border-red pl-2">{error}</p>
        ) : null}

        <TurnstileWidget onToken={setCaptchaToken} resetKey={captchaReset} />

        <Button
          type="submit"
          disabled={submitting}
          block
        >
          {submitting ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="text-small text-muted">
        Already have an account?{" "}
        <Link href={signInHref} className="text-slate border-b border-slate">
          Sign in
        </Link>
      </p>
    </div>
  );
}
