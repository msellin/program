/**
 * StickyCta — v1.1.1 §2.14 sticky-CTA slot
 *
 * Surfaces that need a sticky primary CTA (Session, Preview, Intake,
 * Check) render <StickyCta> inline. The component fixed-positions itself
 * above the bottom nav with a 1px line-soft divider, safe-area padding,
 * and optional keyboard-aware repositioning.
 *
 * Layer order (top→bottom of viewport):
 *   [scroll content]
 *   [1px line-soft divider]
 *   [CTA-band — surface-2 fill, 56px + safe-area]
 *   [BottomNav — surface fill, 56px + safe-area]
 *
 * The CTA-band and nav are two distinct visual layers. The design-lead
 * rejected the Reels/Instagram autohide pattern because persona-harness
 * demonstrated "where's the nav?" resets on Session mid-scroll — nav
 * stays visible on all authenticated surfaces.
 *
 * Keyboard-aware variant (Intake, Check): sets bottom = keyboard-inset
 * height when the on-screen keyboard is up, so the CTA rides above the
 * keyboard. Uses VirtualKeyboard API (Chromium) with visualViewport
 * fallback (iOS Safari).
 */

"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type StickyCtaProps = {
  children: ReactNode;
  /**
   * When true, listens to visualViewport / VirtualKeyboard and lifts the
   * CTA above the on-screen keyboard. For Intake + Check where the CTA
   * must stay reachable while the Notes textarea is focused.
   */
  keyboardAware?: boolean;
  className?: string;
};

/**
 * NAV_HEIGHT_PX is the visible nav height (52px min-h + 2 * py-2 rounded)
 * plus a 4px gap. Matches BottomNav.tsx min-h-[52px] + py-2 baseline.
 * Not derived from CSS because we need it at layout time for the sticky
 * container's bottom offset math.
 */
const NAV_HEIGHT_PX = 64;

export function StickyCta({ children, keyboardAware = false, className }: StickyCtaProps) {
  const keyboardOffset = useKeyboardOffset(keyboardAware);
  return (
    <>
      {/* Spacer — prevents the sticky container from covering the last
          scrollable content. Height matches the sticky-container's total
          contribution (band + safe-area). */}
      <div
        aria-hidden
        className="pointer-events-none"
        style={{
          height: `calc(72px + env(safe-area-inset-bottom))`,
        }}
      />
      <div
        className={cn(
          "fixed left-0 right-0 z-30 border-t border-line-soft bg-surface-2",
          "px-4 sm:px-6 py-3",
          className,
        )}
        style={{
          bottom: `calc(${NAV_HEIGHT_PX}px + env(safe-area-inset-bottom) + ${keyboardOffset}px)`,
          paddingLeft: "max(1rem, env(safe-area-inset-left))",
          paddingRight: "max(1rem, env(safe-area-inset-right))",
        }}
      >
        <div className="mx-auto max-w-[760px]">{children}</div>
      </div>
    </>
  );
}

/**
 * Returns pixels the sticky container must lift by to stay above the
 * on-screen keyboard. 0 when keyboard is closed or keyboardAware=false.
 *
 * Prefers VirtualKeyboard API (Chromium 94+) — declares "overlaysContent"
 * mode so the browser doesn't resize the layout viewport; we handle it.
 * Falls back to visualViewport height delta on iOS Safari.
 */
function useKeyboardOffset(enabled: boolean): number {
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      setOffset(0);
      return;
    }
    // VirtualKeyboard API (Chromium)
    const vk = (navigator as unknown as { virtualKeyboard?: { overlaysContent: boolean; boundingRect: DOMRectReadOnly; addEventListener: (t: string, l: () => void) => void; removeEventListener: (t: string, l: () => void) => void } }).virtualKeyboard;
    if (vk) {
      vk.overlaysContent = true;
      const update = () => setOffset(vk.boundingRect.height);
      vk.addEventListener("geometrychange", update);
      update();
      return () => vk.removeEventListener("geometrychange", update);
    }
    // visualViewport fallback (iOS Safari, Firefox)
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => {
      const delta = window.innerHeight - vv.height;
      setOffset(delta > 100 ? delta : 0);
    };
    vv.addEventListener("resize", update);
    update();
    return () => vv.removeEventListener("resize", update);
  }, [enabled]);
  return offset;
}
