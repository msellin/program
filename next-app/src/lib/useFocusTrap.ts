"use client";

import { useEffect, useRef } from "react";

/**
 * Focus trap for modal dialogs: on mount, focus first focusable element inside `ref`.
 * On Tab, cycle through focusable elements without escaping. On Escape, calls `onEscape`.
 * On unmount, restores focus to the element that was focused when the modal opened.
 */
export function useFocusTrap(
  ref: React.RefObject<HTMLElement | null>,
  onEscape: () => void,
  active = true,
) {
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;

    const container = ref.current;
    if (!container) return;

    const focusable = getFocusable(container);
    if (focusable.length) focusable[0].focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onEscape();
        return;
      }
      if (e.key !== "Tab") return;
      const list = getFocusable(container);
      if (!list.length) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      // A3 fix (2026-08-17): the element that was focused when the modal
      // opened may have unmounted (e.g. a ProposalCard button whose parent
      // proposal disappeared on Accept). Focus-on-detached-node falls through
      // to <body>, losing SR position. Verify still-connected, else fall
      // back to route-level landmarks.
      const prev = previouslyFocused.current;
      const stillConnected =
        prev && typeof prev.focus === "function" && prev.isConnected !== false;
      if (stillConnected) {
        prev.focus();
      } else if (typeof document !== "undefined") {
        const fallback =
          document.querySelector<HTMLElement>("main h1") ||
          document.querySelector<HTMLElement>("main a[href]") ||
          document.querySelector<HTMLElement>("main");
        fallback?.focus?.();
      }
    };
  }, [active, onEscape, ref]);
}

function getFocusable(root: HTMLElement): HTMLElement[] {
  const selector =
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
  return Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(
    (el) => el.offsetParent !== null || el === document.activeElement,
  );
}
