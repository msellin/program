"use client";

import type { Store } from "@/lib/schemas";

/**
 * Batch 35 · 14-day readiness trail.
 *
 * Renders 14 tiny dots — one per day for the last two weeks — colored
 * by that day's derived_state (green / amber / red). Days with no
 * check saved show a muted hollow ring. Reads store.logs[date].derived_state.
 *
 * Positions on Today under the compact HeroStateCard strip so the user
 * sees not just TODAY's readiness but the recent trend. Data as
 * visualization, not text. R5 no-gamification: no streak count, no
 * "N days in a row" — just an honest history glance.
 */
export function ReadinessTrail({
  logs,
  activeDate,
  days = 14,
}: {
  logs: Store["logs"];
  activeDate: string;
  days?: number;
}) {
  const today = new Date(activeDate + "T00:00:00");
  const cells: Array<{ date: string; state: "green" | "amber" | "red" | null }> = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const state = (logs?.[iso]?.derived_state ?? null) as
      | "green"
      | "amber"
      | "red"
      | null;
    cells.push({ date: iso, state });
  }

  const anyState = cells.some((c) => c.state !== null);
  if (!anyState) return null;

  return (
    <div
      className="flex items-center gap-1"
      role="img"
      aria-label={`Readiness over the last ${days} days`}
    >
      {cells.map((c, idx) => (
        <span
          key={c.date}
          title={`${c.date}: ${c.state ?? "no check"}`}
          className={
            "h-1.5 w-1.5 rounded-full flex-shrink-0 " +
            (c.state === "green"
              ? "bg-green"
              : c.state === "amber"
                ? "bg-amber"
                : c.state === "red"
                  ? "bg-red"
                  : "bg-line-soft ring-1 ring-line-soft") +
            (idx === cells.length - 1 ? " ring-1 ring-strong/50" : "")
          }
        />
      ))}
    </div>
  );
}
