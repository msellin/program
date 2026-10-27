"use client";

import { useEffect, useState } from "react";

/**
 * One line for iPhone visitors in Safari: the app installs from the Share
 * sheet, and nothing else on the page says so. Hidden on every other
 * browser and once the page runs as an installed app.
 */
export function IosHint() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const ua = navigator.userAgent;
    const ios = /iPhone|iPad|iPod/.test(ua);
    const standalone =
      (navigator as Navigator & { standalone?: boolean }).standalone === true ||
      window.matchMedia("(display-mode: standalone)").matches;
    setShow(ios && !standalone);
  }, []);
  if (!show) return null;
  return (
    <p className="mt-6 text-[13px] leading-relaxed text-[var(--color-muted)]">
      On iPhone: after you sign up, tap Share, then &ldquo;Add to Home Screen&rdquo; to keep
      Terav one tap away.
    </p>
  );
}
