import { describe, it, expect } from "vitest";
import {
  GUEST_ROUTES,
  SEMI_PUBLIC_ROUTES,
  isGuestRoute,
  isSemiPublicRoute,
  isPublicRoute,
} from "./route-access";

describe("route access", () => {
  it("lets a signed-out visitor browse the catalog (BETA-2)", () => {
    // The landing deep-links here. Before the fix AuthGate said public,
    // AppShell redirected, and the stricter layer won.
    expect(isPublicRoute("/programs")).toBe(true);
    expect(isPublicRoute("/programs/first-strict-pullup")).toBe(true);
    expect(isSemiPublicRoute("/programs")).toBe(true);
  });

  it("keeps intake gated even though it sits under /programs", () => {
    expect(isPublicRoute("/programs/first-strict-pullup/intake")).toBe(false);
    expect(isSemiPublicRoute("/programs/first-strict-pullup/intake")).toBe(false);
  });

  it("lets someone who cannot sign in reach the password reset page", () => {
    expect(isPublicRoute("/reset-password")).toBe(true);
  });

  it("still gates the app itself", () => {
    for (const p of ["/", "/plan", "/record", "/profile", "/settings", "/session/x"]) {
      expect(isPublicRoute(p), p).toBe(false);
    }
  });

  it("does not match a route that merely shares a prefix", () => {
    expect(isPublicRoute("/sign-in-fake")).toBe(false);
    expect(isPublicRoute("/programsomething")).toBe(false);
  });

  /**
   * The drift guard. AuthGate wraps AppShell, so a route AuthGate lets through
   * must be renderable by AppShell — either as a bare guest column or as a
   * semi-public route. If the two ever disagree again, the stricter layer wins
   * silently and one list becomes dead code. That is the bug this file exists
   * to prevent, not merely to document.
   */
  it("every route AuthGate admits is one AppShell can render", () => {
    for (const p of [...GUEST_ROUTES, ...SEMI_PUBLIC_ROUTES]) {
      expect(isPublicRoute(p), p).toBe(true);
      expect(isGuestRoute(p) || isSemiPublicRoute(p), p).toBe(true);
    }
  });
});
