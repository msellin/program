/**
 * Terav wordmark — "terav." in outlined Inter 800 with a bronze full stop
 * (Direction B, 2026-10-27). The SVG is generated with every other brand
 * asset by dev/scripts/brand/build-brand-assets.mjs and served from /public,
 * the same file the app header uses, so the two cannot drift.
 */
export function Wordmark({ size = "sm" }: { size?: "sm" | "lg" }) {
  const h = size === "lg" ? 32 : 20;
  // eslint-disable-next-line @next/next/no-img-element -- static SVG, no optimisation needed
  return <img src="/wordmark.svg" alt="Terav" height={h} width={Math.round((h * 5477) / 1405)} className="block" />;
}
