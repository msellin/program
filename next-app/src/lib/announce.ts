/**
 * Screen-reader announcer. Writes plaintext to a shell-level `aria-live="polite"`
 * region so SR users hear state changes from proposal acceptance, PR fires,
 * mark-done toggles, etc.
 *
 * The container is a `<div id="app-status" aria-live="polite" aria-atomic="true"
 * class="sr-only" />` rendered by AppShell. It must exist at page load
 * (NOT be injected on the fly) — otherwise most SRs miss the polite update.
 *
 * We clear then set (with a microtask) so identical consecutive messages
 * re-announce; some engines (VoiceOver) skip a repeat if the text hasn't
 * changed.
 */
const REGION_ID = "app-status";

export function announce(message: string): void {
  if (typeof document === "undefined" || !message) return;
  const el = document.getElementById(REGION_ID);
  if (!el) return;
  el.textContent = "";
  // Yield a microtask so the DOM change registers as two mutations.
  queueMicrotask(() => {
    el.textContent = message;
  });
}
