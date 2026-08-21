"use client";

/**
 * Cut C · Record surface · onboarding beacon (C5).
 *
 * One-time InfoSheet on first `/record` visit — dramatizes Terav's
 * genuine peer vacancy per matrix rec #4: "cite-per-adjustment as
 * first-class UI, not a tooltip." The product-design-lead panel
 * flagged that a cold-landing user wouldn't otherwise see why the
 * differentiator matters.
 *
 * Persistence: `localStorage["terav.record.beacon_seen"] = "1"`.
 * Survives page reload; private-browsing degrades gracefully (shows
 * beacon each visit, better than silent breakage).
 *
 * See dev/active/decisions-2026-08-21-locked.md C5 (locked ADD).
 */

import { useEffect, useState } from "react";
import { InfoSheet } from "@/components/InfoSheet";

const STORAGE_KEY = "terav.record.beacon_seen";

function readSeen(): boolean {
  if (typeof window === "undefined") return true; // SSR — treat as seen to avoid flash
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return true; // private browsing / storage blocked — don't nag
  }
}

function markSeen(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    /* no-op */
  }
}

export function CutCRecordOnboardingBeacon() {
  // Deferred to a client-side effect so the SSR-hydration matches
  // (server has no localStorage; render nothing on first paint, then
  // check + open if needed).
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!readSeen()) setOpen(true);
  }, []);

  const dismiss = () => {
    markSeen();
    setOpen(false);
  };

  if (!open) return null;

  return (
    <InfoSheet title="Every change here cites its source" onClose={dismiss}>
      <p className="text-[14px] text-ink leading-relaxed">
        Record shows your program&apos;s trend, retests, and log — but the piece Terav does differently is on every retest pin.
      </p>
      <p className="text-[14px] text-ink leading-relaxed mt-3">
        Tap any pin on the timeline or curve to see the study OR the log signal that triggered that reading. Every proposed change carries its citation inline — no black-box coach, no autonomous score.
      </p>
      <p className="text-[14px] text-ink leading-relaxed mt-3">
        Your record is portable — the Export button in the header downloads the whole thing as JSON, citations included, whenever you want it.
      </p>
    </InfoSheet>
  );
}
