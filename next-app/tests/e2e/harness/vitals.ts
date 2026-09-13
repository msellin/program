import type { Page } from "@playwright/test";

/**
 * Core Web Vitals capture for the persona tour.
 *
 * Nothing under `tests/e2e/` measured performance. Eight sweeps at full route
 * coverage produced screenshots, DOM and text for every surface and not one
 * number about how any of them loaded — so a regression that made Today a
 * second slower would have shipped invisibly, on a mobile-first app whose own
 * design brief benchmarks it against Linear and Runna.
 *
 * Three metrics, collected per route per viewport:
 *
 *   LCP  largest-contentful-paint, last entry wins. The real one.
 *   CLS  layout shifts excluding those within 500ms of an interaction, which
 *        is the standard exclusion — a shift the user caused is not a shift
 *        that surprised them.
 *   INP  honestly a MAX-INTERACTION-LATENCY, not INP. Real INP is the p98 of
 *        interaction latencies over a session; a tour visits a route, takes a
 *        screenshot and leaves, which is nowhere near enough interactions for
 *        a percentile to mean anything. The maximum over what the tour did do
 *        is the useful upper bound, and calling it `inp_max_ms` rather than
 *        `inp` keeps the difference visible to whoever reads the artifact.
 *
 * The observer is installed via `addInitScript`, so it is in place before any
 * of the page's own script runs. Installing it after navigation would miss the
 * LCP candidate on a fast route entirely — which is the route you would most
 * want to be sure about.
 */
export type RouteVitals = {
  route: string;
  viewport: string;
  lcp_ms: number | null;
  cls: number | null;
  inp_max_ms: number | null;
};

declare global {
  interface Window {
    __teravVitals?: { lcp: number | null; cls: number; inpMax: number | null };
  }
}

/** Install once per page, before any navigation. */
export async function installVitals(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const state = { lcp: null as number | null, cls: 0, inpMax: null as number | null };
    window.__teravVitals = state;

    try {
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) state.lcp = e.startTime;
      }).observe({ type: "largest-contentful-paint", buffered: true });

      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) {
          const shift = e as PerformanceEntry & { value: number; hadRecentInput: boolean };
          // The standard exclusion: a shift the user caused is not one that
          // surprised them.
          if (!shift.hadRecentInput) state.cls += shift.value;
        }
      }).observe({ type: "layout-shift", buffered: true });

      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) {
          const d = e.duration;
          if (typeof d === "number" && (state.inpMax == null || d > state.inpMax)) {
            state.inpMax = d;
          }
        }
        // 40ms: below this an interaction is not a problem and the entries are
        // mostly noise. The `event` type needs an explicit threshold or it
        // reports nothing at all.
      }).observe({ type: "event", buffered: true, durationThreshold: 40 } as PerformanceObserverInit);
    } catch {
      // An engine without one of these observers should degrade to nulls
      // rather than break the tour that is collecting screenshots.
    }
  });
}

/** Read what the observers collected for the route currently loaded. */
export async function readVitals(
  page: Page,
  route: string,
  viewport: string,
): Promise<RouteVitals> {
  const raw = await page
    .evaluate(() => window.__teravVitals ?? null)
    .catch(() => null);
  return {
    route,
    viewport,
    lcp_ms: raw?.lcp != null ? Math.round(raw.lcp) : null,
    // Three decimals: CLS budgets are 0.1 and 0.25, so rounding to two loses
    // the distinction between "fine" and "only just fine".
    cls: raw ? Math.round(raw.cls * 1000) / 1000 : null,
    inp_max_ms: raw?.inpMax != null ? Math.round(raw.inpMax) : null,
  };
}

/**
 * Budgets, for reading a run rather than for failing one.
 *
 * Google's "good" thresholds: LCP 2500ms, CLS 0.1, INP 200ms. They are not
 * asserted in the suite — a Playwright run on a laptop that is also running a
 * dev server and a browser measures the laptop as much as the app, and a
 * flaky performance gate gets disabled within a fortnight. The numbers are
 * recorded so a HUMAN comparing two sweeps can see movement.
 */
export const VITALS_BUDGET = { lcp_ms: 2500, cls: 0.1, inp_max_ms: 200 } as const;

export function overBudget(v: RouteVitals): string[] {
  const over: string[] = [];
  if (v.lcp_ms != null && v.lcp_ms > VITALS_BUDGET.lcp_ms) over.push(`LCP ${v.lcp_ms}ms`);
  if (v.cls != null && v.cls > VITALS_BUDGET.cls) over.push(`CLS ${v.cls}`);
  if (v.inp_max_ms != null && v.inp_max_ms > VITALS_BUDGET.inp_max_ms) {
    over.push(`INP(max) ${v.inp_max_ms}ms`);
  }
  return over;
}
