"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [consentSymptom, setConsentSymptom] = useState(false);
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
        emailRedirectTo:
          typeof window !== "undefined" ? `${window.location.origin}/sign-in` : undefined,
      },
    });
    setResending(false);
    if (err) {
      setError(err.message);
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
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          accepted_terms_at: new Date().toISOString(),
          consented_symptom_data_at: new Date().toISOString(),
        },
        emailRedirectTo:
          typeof window !== "undefined"
            ? `${window.location.origin}/sign-in`
            : undefined,
      },
    });
    setSubmitting(false);
    if (err) {
      setError(err.message);
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <div className="max-w-sm mx-auto pt-8 space-y-4">
        <h1 className="text-2xl font-semibold text-strong">Check your email</h1>
        <p className="text-sm text-ink">
          We sent a confirmation link to <strong>{email}</strong>. Tap it, then sign in.
        </p>
        <p className="text-[12px] text-muted">
          Nothing arrived after a couple of minutes? Check the spam folder, or resend below.
        </p>
        {error ? <p className="text-[14px] text-red">{error}</p> : null}
        {resent ? (
          <p className="text-[14px] text-green">Sent again — check your inbox.</p>
        ) : null}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={resendConfirmation}
            disabled={resending || resent}
            className="inline-flex items-center gap-1.5 min-h-[44px] font-mono text-[11px] uppercase tracking-wider px-3 py-2 rounded bg-bronze text-ground hover:bg-bronze-hover disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {resending ? "Sending…" : resent ? "Sent" : "Resend confirmation"}
          </button>
          <Link
            href="/sign-in"
            className="inline-flex items-center min-h-[44px] font-mono text-[11px] uppercase tracking-wider px-3 py-2 rounded border border-line hover:bg-line-soft"
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
        <span className="font-mono text-[14px] uppercase tracking-[0.2em] text-bronze">Terav</span>
      </div>
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-strong">Sign up</h1>
      </header>

      <GoogleAuthButton />

      <p className="text-[11px] text-muted leading-relaxed -mt-1">
        Continuing accepts the{" "}
        <Link href="/legal/terms" target="_blank" className="text-slate border-b border-slate">
          terms
        </Link>
        ,{" "}
        <Link href="/legal/disclaimer" target="_blank" className="text-slate border-b border-slate">
          medical disclaimer
        </Link>
        , and consent to store training + symptom data (
        <Link href="/legal/privacy" target="_blank" className="text-slate border-b border-slate">
          privacy
        </Link>
        ).
      </p>

      <div className="flex items-center gap-3 pt-1">
        <span className="flex-1 h-px bg-line-soft" aria-hidden />
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
          or with email
        </span>
        <span className="flex-1 h-px bg-line-soft" aria-hidden />
      </div>

      <form onSubmit={submit} className="space-y-3" noValidate>
        <label htmlFor="signup-email" className="block text-[14px]">
          <span className="block text-muted mb-1">Email</span>
          <input
            id="signup-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full text-[14px] px-3 py-2.5 min-h-[44px] border border-line rounded bg-surface focus:outline-none focus:ring-2 focus:ring-bronze focus:border-bronze"
          />
        </label>
        <label htmlFor="signup-password" className="block text-[14px]">
          <span className="block text-muted mb-1">
            Password <span className="text-[11px] text-muted">(8+ characters)</span>
          </span>
          <input
            id="signup-password"
            type="password"
            required
            autoComplete="new-password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full text-[14px] px-3 py-2.5 min-h-[44px] border border-line rounded bg-surface focus:outline-none focus:ring-2 focus:ring-bronze focus:border-bronze"
          />
        </label>

        <label className="flex items-start gap-2 text-[14px] pt-1">
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

        <label className="flex items-start gap-2 text-[14px]">
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

        {error ? (
          <p className="text-[14px] text-red border-l-4 border-red pl-2">{error}</p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="w-full font-mono text-[14px] uppercase tracking-wider py-3 rounded bg-bronze text-ground hover:bg-bronze/90 disabled:opacity-50 min-h-[44px]"
        >
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="text-[14px] text-muted">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-slate border-b border-slate">
          Sign in
        </Link>
      </p>
    </div>
  );
}
