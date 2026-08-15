"use client";

import { Suspense, useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="pt-8 text-sm text-muted">Loading…</div>}>
      <SignInInner />
    </Suspense>
  );
}

function SignInInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams?.get("next") ?? "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetting, setResetting] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (err) {
      setError(err.message);
      return;
    }
    // Bounce back to the deep link the user was trying to reach — guard
    // against open-redirect by only accepting relative paths.
    const safeNext = nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/";
    router.push(safeNext);
  };

  const sendPasswordReset = async () => {
    setError(null);
    if (!email) {
      setError("Enter your email above first, then tap Forgot password.");
      return;
    }
    setResetting(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo:
        typeof window !== "undefined"
          ? `${window.location.origin}/reset-password`
          : undefined,
    });
    setResetting(false);
    if (err) {
      setError(err.message);
      return;
    }
    setResetSent(true);
  };

  return (
    <div className="max-w-sm mx-auto pt-8 space-y-5">
      <div className="flex items-center gap-1.5 mb-4">
        <span className="font-mono text-[13px] uppercase tracking-[0.2em] text-bronze">Terav</span>
      </div>
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-strong">Sign in</h1>
        <p className="text-[13.5px] text-muted">Continue your training.</p>
      </header>

      <form onSubmit={submit} className="space-y-3" noValidate>
        <label className="block text-[13px]">
          <span className="block text-muted mb-1">Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full text-[14px] px-3 py-2.5 min-h-[44px] border border-line rounded bg-surface focus:outline-none focus:ring-2 focus:ring-bronze/40 focus:border-bronze"
          />
        </label>
        <label className="block text-[13px]">
          <span className="block text-muted mb-1">Password</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full text-[14px] px-3 py-2.5 min-h-[44px] border border-line rounded bg-surface focus:outline-none focus:ring-2 focus:ring-bronze/40 focus:border-bronze"
          />
        </label>
        {error ? (
          <p className="text-[13px] text-red border-l-4 border-red pl-2">{error}</p>
        ) : null}
        <button
          type="submit"
          disabled={submitting}
          className="w-full font-mono text-[12.5px] uppercase tracking-wider py-3 rounded bg-bronze text-ground hover:bg-bronze/90 disabled:opacity-50 min-h-[44px]"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>

      {resetSent ? (
        <p className="text-[12.5px] text-green border-l-4 border-green pl-2">
          Password reset email sent to <strong>{email}</strong>. Check inbox (and spam).
          The link opens a reset form.
        </p>
      ) : (
        <button
          type="button"
          onClick={sendPasswordReset}
          disabled={resetting}
          className="text-[12.5px] text-muted underline decoration-muted/40 underline-offset-4 hover:text-ink hover:decoration-ink/60 disabled:opacity-50"
        >
          {resetting ? "Sending…" : "Forgot password?"}
        </button>
      )}

      <p className="text-[13px] text-muted">
        No account?{" "}
        <Link href="/sign-up" className="text-slate border-b border-slate">
          Sign up
        </Link>
      </p>

      <footer className="pt-6 border-t border-line-soft text-[11.5px] text-muted space-x-3">
        <Link href="/legal/privacy" className="hover:text-ink">Privacy</Link>
        <Link href="/legal/terms" className="hover:text-ink">Terms</Link>
        <Link href="/legal/disclaimer" className="hover:text-ink">Medical disclaimer</Link>
      </footer>
    </div>
  );
}
