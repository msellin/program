"use client";

import { useStore } from "@/lib/useStore";
import { today as todayKey } from "@/lib/utils";

/**
 * Read-only line for away periods that already exist (the add form left
 * Profile — not in the MVP). The engine still honours them; this only lets
 * the user clear one. Renders nothing when there is no active/future period.
 */
export function TimeOffLine() {
  // Raw selector, derive outside — a `?? []` inside the selector refires
  // forever (React #185).
  const periodsRaw = useStore((s) => s.store.user_profile?.away_periods);
  const removeAwayPeriod = useStore((s) => s.removeAwayPeriod);
  const today = todayKey();
  const upcoming = (periodsRaw ?? []).filter((p) => p.end >= today);
  if (upcoming.length === 0) return null;

  const fmt = (iso: string) =>
    new Date(iso + "T12:00:00Z").toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    });

  return (
    <ul className="space-y-1">
      {upcoming.map((p) => (
        <li key={`${p.start}-${p.end}`} className="text-caption text-muted flex items-center flex-wrap">
          <span>Time off: {p.start === p.end ? fmt(p.start) : `${fmt(p.start)}–${fmt(p.end)}`}</span>
          <span className="mx-1.5" aria-hidden>·</span>
          <button
            type="button"
            onClick={() => removeAwayPeriod(p.start, p.end)}
            aria-label={`Remove time off ${p.start} to ${p.end}`}
            className="min-h-11 inline-flex items-center underline decoration-line hover:text-red hover:decoration-red"
          >
            Remove
          </button>
        </li>
      ))}
    </ul>
  );
}
