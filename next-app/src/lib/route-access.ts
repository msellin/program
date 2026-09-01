/**
 * Route access rules — the single source of truth for "does this route need a
 * signed-in user", shared by the two layers that gate it.
 *
 * There used to be two hand-maintained lists: `AuthGate.PUBLIC_ROUTES` (the
 * outer wrapper) and `AppShell.PUBLIC_ROUTES` (the inner one). They disagreed
 * in both directions, and because AuthGate runs first, the stricter list
 * always won and the looser one became dead code:
 *
 *   - `/programs` was public in AuthGate only  → the catalog was sign-up-only,
 *     defeating the public preview the landing deep-links into (BETA-2).
 *   - `/reset-password` was public in AppShell only → AuthGate would bounce a
 *     signed-out visitor to /sign-in, which is the one page a person who
 *     cannot sign in has no use for.
 *
 * Two lists that must agree, maintained apart, drift. This module is the
 * agreement; `route-access.test.ts` is the proof.
 */

/** Never requires a session. */
export const GUEST_ROUTES = [
  "/sign-in",
  "/sign-up",
  "/reset-password",
  "/legal/privacy",
  "/legal/terms",
  "/legal/disclaimer",
];

/**
 * Renders for guests AND signed-in users, with different chrome for each:
 * a guest gets the bare column, a signed-in user gets the full app shell.
 */
export const SEMI_PUBLIC_ROUTES = ["/programs"];

/**
 * Always gated, even when nested under a public prefix. The intake wizard
 * lives at `/programs/[slug]/intake` and writes user state, so it needs auth
 * despite `/programs` being open.
 */
const ALWAYS_GATED_SEGMENTS = ["/intake"];

function matches(pathname: string, routes: string[]): boolean {
  return routes.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function isAlwaysGated(pathname: string): boolean {
  return ALWAYS_GATED_SEGMENTS.some((seg) => pathname.includes(seg));
}

/** No session needed, and no app chrome either. */
export function isGuestRoute(pathname: string): boolean {
  return matches(pathname, GUEST_ROUTES);
}

/** Open to guests, but a signed-in user should still get the full shell. */
export function isSemiPublicRoute(pathname: string): boolean {
  if (isAlwaysGated(pathname)) return false;
  return matches(pathname, SEMI_PUBLIC_ROUTES);
}

/** May render without a session — the union of the two above. */
export function isPublicRoute(pathname: string): boolean {
  if (isAlwaysGated(pathname)) return false;
  return isGuestRoute(pathname) || isSemiPublicRoute(pathname);
}
