"use client";

import { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import { useStore } from "@/lib/useStore";
import type { Store } from "@/lib/schemas";
import { today as todayISO, iso } from "@/lib/utils";
import { cn } from "@/lib/utils";

/**
 * Persistent streak chip — Flame + day count. Turns bronze when today's
 * session hasn't been logged; muted once logged. No animation, no
 * urgency escalation (design research: restraint > gamification).
 */
export function StreakChip() {
  const hydrated = useStore((s) => s.hydrated);
  // Read raw slices so unrelated store changes don't force recompute
  const logs = useStore((s) => s.store.logs);
  const skipped = useStore((s) => s.store.skipped);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!hydrated || !mounted) return null;

  const { count, todayLogged } = computeStreak(logs, skipped);
  if (count === 0) return null;
  const pending = !todayLogged;
  return (
    <span
      aria-label={`${count}-day streak${pending ? ", today not yet logged" : ""}`}
      className={cn(
        "inline-flex items-center gap-1 px-2 py-1 rounded-full font-mono text-[11px] font-semibold tabular-nums",
        pending ? "bg-bronze/15 text-bronze" : "bg-line-soft text-muted",
      )}
    >
      <Flame size={12} strokeWidth={2.25} aria-hidden />
      {count}d
    </span>
  );
}

/**
 * A streak = a run of consecutive days ending today (or yesterday if today
 * is not yet logged) where the day has any completed exercise OR a saved
 * symptom check OR was intentionally skipped-with-reason (skip counts).
 */
function computeStreak(
  logs: Store["logs"],
  skipped: Store["skipped"],
): { count: number; todayLogged: boolean } {
  const l = logs;
  const sk = skipped;

  function dayCounts(date: string): boolean {
    const entry = l[date];
    const s = sk?.[date];
    if (entry) {
      const anyDone = Object.values(entry.exercises ?? {}).some((e) => e && e.done);
      if (anyDone || entry.symptoms) return true;
    }
    // A user-initiated skip preserves the streak (they engaged, chose to skip).
    // Even a skip with no reason recorded still counts — the user opened the app and tapped Skip.
    if (s) return true;
    return false;
  }

  const today = todayISO();
  const todayLogged = dayCounts(today);

  // Walk back from today (or yesterday if today isn't logged yet)
  let cursor = new Date(today + "T00:00:00");
  if (!todayLogged) cursor.setDate(cursor.getDate() - 1);
  let count = 0;
  for (let i = 0; i < 400; i++) {
    if (dayCounts(iso(cursor))) {
      count++;
      cursor.setDate(cursor.getDate() - 1);
    } else break;
  }
  return { count, todayLogged };
}
