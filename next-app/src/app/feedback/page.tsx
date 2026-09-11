"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/useStore";
import { createClient } from "@/lib/supabase/client";

/**
 * Beta feedback, from inside the app.
 *
 * Until now there was no channel at all. The app asks people to log symptoms
 * every morning and to Accept or Ignore what an engine proposes, and gave them
 * nowhere to say "this proposal made no sense" — the only route was knowing
 * the founder personally, which describes the current beta and not the next
 * one.
 *
 * Context is attached by THIS component, not read server-side: the active
 * programme slug and the app's build. A feedback form is not a reason to give
 * a mail function access to health data, and the two facts that make a report
 * actionable are which programme and which build.
 *
 * Deliberately not a modal. A considered bug report is not a thing to type
 * into a box that closes when you tap outside it, and an installed PWA has no
 * back button of its own.
 */
export default function FeedbackPage() {
  const router = useRouter();
  const activeProgram = useStore((s) => s.store.user_profile?.active_program_id);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const send = async () => {
    setSending(true);
    setError(null);
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setError("You're signed out. Sign in and try again — your text is still here.");
        setSending(false);
        return;
      }
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          authorization: `Bearer ${session.access_token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          message,
          context: [
            activeProgram ? `programme: ${activeProgram}` : "programme: none",
            `path: ${typeof window !== "undefined" ? window.location.pathname : "?"}`,
          ].join("\n"),
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        // The endpoint's messages are written to be shown, so show them
        // rather than replacing them with a generic failure.
        setError(body.error ?? `Could not send (${res.status}).`);
        setSending(false);
        return;
      }
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="mt-8 space-y-4">
        <h1 className="text-lg font-semibold text-strong">Sent</h1>
        <p className="text-sm text-muted">
          Thanks — it goes straight to Margus, and replies come back to the address you
          signed up with.
        </p>
        <button
          type="button"
          onClick={() => router.push("/profile")}
          className="min-h-[44px] rounded border border-line-soft px-4 py-2 text-sm"
        >
          Back to Profile
        </button>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-4">
      <header>
        <h1 className="text-lg font-semibold text-strong">Send feedback</h1>
        <p className="mt-1 text-sm text-muted">
          Bugs, confusing copy, a proposal that made no sense. It reaches a person, not a
          queue.
        </p>
      </header>

      <label htmlFor="feedback-message" className="block text-sm text-ink">
        What happened?
      </label>
      <textarea
        id="feedback-message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={8}
        maxLength={4000}
        placeholder="The bit that didn't work, and what you expected instead."
        className="w-full rounded border border-line-soft bg-surface p-3 text-sm"
      />
      <p className="text-[12px] text-muted">
        Your email and which programme you&rsquo;re on are attached automatically. Nothing from
        your log is sent.
      </p>

      {error ? (
        <p role="alert" className="text-sm text-red">
          {error}
        </p>
      ) : null}

      <button
        type="button"
        onClick={() => void send()}
        disabled={sending || !message.trim()}
        className="min-h-[48px] w-full rounded bg-bronze px-4 py-3 text-sm font-semibold text-ink-inverse disabled:opacity-50"
      >
        {sending ? "Sending…" : "Send"}
      </button>
    </div>
  );
}
