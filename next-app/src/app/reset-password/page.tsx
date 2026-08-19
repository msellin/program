"use client";

import { useState, FormEvent, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Landing point for the "reset password" email link. Supabase routes the user
 * here with a recovery session in the URL hash; the auth client picks it up
 * automatically, and we let them set a new password.
 */
export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // The Supabase JS client parses the recovery token from the URL hash
    // (#access_token=...&type=recovery) automatically on load. We just need to
    // wait for onAuthStateChange to say we have a valid recovery session.
    const supabase = createClient();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    // Also handle the case where the recovery session was already established
    // before the listener attached.
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setSubmitting(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.push("/");
  };

  return (
    <div className="max-w-sm mx-auto pt-8 space-y-5">
      <div className="flex items-center gap-1.5 mb-4">
        <span className="font-mono text-[14px] uppercase tracking-[0.2em] text-bronze">Terav</span>
        <span className="text-[11px] text-muted mt-0.5">— sharp</span>
      </div>
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-strong">Set a new password</h1>
        <p className="text-sm text-muted">
          {ready
            ? "Pick a new one. You'll be signed in on this device once you save."
            : "Waiting for the reset link to validate — hold on."}
        </p>
      </header>

      <form onSubmit={submit} className="space-y-3" noValidate>
        <label htmlFor="reset-new-password" className="block text-[14px]">
          <span className="block text-muted mb-1">
            New password <span className="text-[11px] text-muted">(8+ characters)</span>
          </span>
          <input
            id="reset-new-password"
            type="password"
            required
            autoComplete="new-password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={!ready}
            className="block w-full text-[14px] px-3 py-2.5 min-h-[44px] border border-line rounded bg-surface focus:outline-none focus:ring-2 focus:ring-bronze focus:border-bronze disabled:opacity-50"
          />
        </label>
        <label htmlFor="reset-confirm-password" className="block text-[14px]">
          <span className="block text-muted mb-1">Repeat new password</span>
          <input
            id="reset-confirm-password"
            type="password"
            required
            minLength={8}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            disabled={!ready}
            className="block w-full text-[14px] px-3 py-2.5 min-h-[44px] border border-line rounded bg-surface focus:outline-none focus:ring-2 focus:ring-bronze focus:border-bronze disabled:opacity-50"
          />
        </label>
        {error ? (
          <p className="text-[14px] text-red border-l-4 border-red pl-2">{error}</p>
        ) : null}
        <button
          type="submit"
          disabled={submitting || !ready}
          className="w-full font-mono text-[14px] uppercase tracking-wider py-3 rounded bg-bronze text-ground hover:bg-bronze/90 disabled:opacity-50 min-h-[44px]"
        >
          {submitting ? "Saving…" : "Save new password"}
        </button>
      </form>

      <p className="text-[14px] text-muted">
        Back to{" "}
        <Link href="/sign-in" className="text-slate border-b border-slate">
          sign in
        </Link>
      </p>
    </div>
  );
}
