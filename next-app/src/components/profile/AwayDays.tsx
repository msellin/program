"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useStore } from "@/lib/useStore";

/**
 * Away days — dates with no prescribed session (2026-08-27).
 *
 * Replaces `HIP_RACE_DATE`, a single date hard-coded into the scheduler.
 * That constant blocked one Saturday for a race the founder then decided
 * to skip, and changing it needed a deploy; meanwhile a real away week —
 * travel, summer — had no representation at all.
 *
 * Blocks PRESCRIBED sessions only. Activity logging stays open on
 * purpose: an away day is usually not an empty day. The first real use of
 * this was a Saturday spent riding 90 km.
 */
export function AwayDays() {
  const periods = useStore((s) => s.store.user_profile?.away_periods ?? []);
  const addAwayPeriod = useStore((s) => s.addAwayPeriod);
  const removeAwayPeriod = useStore((s) => s.removeAwayPeriod);

  const today = new Date().toISOString().slice(0, 10);
  const [start, setStart] = useState(today);
  const [end, setEnd] = useState(today);
  const [reason, setReason] = useState("");

  const fmt = (iso: string) =>
    new Date(iso + "T12:00:00Z").toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });

  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-2">
        Away days
      </p>
      <div className="rounded border border-line-soft bg-surface p-3 space-y-3">
        <p className="text-[13px] text-muted leading-snug">
          Days you can&apos;t train. Nothing gets prescribed — you can still log a
          ride, a run or a class, and the engine still reads it.
        </p>

        {periods.length > 0 ? (
          <ul className="space-y-1.5">
            {periods.map((p) => (
              <li
                key={`${p.start}-${p.end}`}
                className="flex items-center justify-between gap-3 rounded border border-line-soft bg-ground px-3 py-2"
              >
                <span className="min-w-0 text-[14px]">
                  {p.start === p.end ? fmt(p.start) : `${fmt(p.start)} – ${fmt(p.end)}`}
                  {p.reason ? (
                    <span className="text-muted italic"> · {p.reason}</span>
                  ) : null}
                </span>
                <button
                  type="button"
                  onClick={() => removeAwayPeriod(p.start, p.end)}
                  aria-label={`Remove away period ${p.start} to ${p.end}`}
                  className="flex-shrink-0 text-muted hover:text-ink min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
                >
                  <X size={15} aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="flex flex-wrap items-end gap-2">
          <label className="flex-1 min-w-[120px]">
            <span className="block font-mono text-[10px] uppercase tracking-widest text-muted mb-1">
              From
            </span>
            <input
              type="date"
              value={start}
              onChange={(e) => {
                setStart(e.target.value);
                if (e.target.value > end) setEnd(e.target.value);
              }}
              className="w-full text-[14px] px-2 py-2 min-h-[44px] border border-line rounded bg-ground text-ink"
            />
          </label>
          <label className="flex-1 min-w-[120px]">
            <span className="block font-mono text-[10px] uppercase tracking-widest text-muted mb-1">
              To
            </span>
            <input
              type="date"
              value={end}
              min={start}
              onChange={(e) => setEnd(e.target.value)}
              className="w-full text-[14px] px-2 py-2 min-h-[44px] border border-line rounded bg-ground text-ink"
            />
          </label>
          <label className="flex-[2] min-w-[140px]">
            <span className="block font-mono text-[10px] uppercase tracking-widest text-muted mb-1">
              Why (optional)
            </span>
            <input
              type="text"
              maxLength={40}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Summer trip"
              className="w-full text-[14px] px-2 py-2 min-h-[44px] border border-line rounded bg-ground text-ink placeholder:text-muted"
            />
          </label>
          <button
            type="button"
            onClick={() => {
              addAwayPeriod(start, end, reason.trim() || undefined);
              setReason("");
            }}
            className="min-h-[44px] px-4 rounded bg-bronze text-ground text-sm font-semibold"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
