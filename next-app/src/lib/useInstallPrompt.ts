"use client";

import { useEffect, useState } from "react";

// Chrome / Edge expose the install-prompt event; iOS Safari doesn't (users
// install via Share → Add to Home Screen manually). We only wire the
// Chrome path; iOS users get a static instruction on the same button
// when the event never fires.
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/**
 * P2-8 — capture the browser's install prompt so we can offer it from
 * Profile after the user has visited Today a few times. Auto-prompt is
 * deliberately disabled — Terav's calm register doesn't fit a modal
 * demanding home-screen install on first open.
 *
 * Returns a `promptInstall` callback + a `canInstall` flag. When
 * `canInstall` is false, the caller renders a static "Add manually via
 * Share → Add to Home Screen" message (iOS path).
 */
export function useInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault(); // Suppress the automatic mini-infobar.
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const promptInstall = async () => {
    if (!deferred) return "no-prompt" as const;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    setDeferred(null); // Chrome fires the event once per session.
    return outcome;
  };

  return { canInstall: deferred != null, promptInstall };
}
