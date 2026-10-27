"use client";

import { useEffect, useRef } from "react";

/**
 * Cloudflare Turnstile bot check. Reads the site key from
 * NEXT_PUBLIC_TURNSTILE_SITE_KEY (inlined at build). With no key the widget
 * renders nothing and `captchaRequired` is false, so sign-up keeps working until
 * the key is set and Supabase captcha is switched on (they must go live together:
 * Supabase captcha without a token rejects sign-up, sign-in, resend and reset).
 *
 * Tokens are single-use. Bump `resetKey` after every submit to get a fresh one.
 */
export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
export const captchaRequired = TURNSTILE_SITE_KEY !== "";

type TurnstileApi = {
  render: (
    el: HTMLElement,
    opts: {
      sitekey: string;
      theme?: "light" | "dark" | "auto";
      callback: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
    },
  ) => string;
  remove: (id: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

function loadScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.turnstile) return resolve();
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    const s = existing ?? document.createElement("script");
    s.addEventListener("load", () => resolve());
    s.addEventListener("error", () => reject(new Error("turnstile script failed")));
    if (!existing) {
      s.src = SCRIPT_SRC;
      s.async = true;
      document.head.appendChild(s);
    }
  });
}

export function TurnstileWidget({
  onToken,
  resetKey = 0,
}: {
  onToken: (token: string | null) => void;
  resetKey?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const cb = useRef(onToken);
  cb.current = onToken;

  useEffect(() => {
    if (!captchaRequired) return;
    let widgetId: string | null = null;
    let cancelled = false;
    cb.current(null);
    loadScript()
      .then(() => {
        if (cancelled || !ref.current || !window.turnstile) return;
        widgetId = window.turnstile.render(ref.current, {
          sitekey: TURNSTILE_SITE_KEY,
          theme: "auto",
          callback: (t) => cb.current(t),
          "expired-callback": () => cb.current(null),
          "error-callback": () => cb.current(null),
        });
      })
      .catch(() => cb.current(null));
    return () => {
      cancelled = true;
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
    };
  }, [resetKey]);

  if (!captchaRequired) return null;
  return <div ref={ref} className="min-h-[65px]" />;
}
