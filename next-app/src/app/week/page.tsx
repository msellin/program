"use client";

/**
 * Cut C · Week 4b redirect · /week → /plan
 *
 * Week tab renamed to "Plan" per D4 (locked decisions 2026-08-21). Route
 * follows label — external bookmarks + old share links get a client-side
 * redirect. Static-export-safe (same pattern as /progress + /history
 * stubs from Cut C Phase 3).
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WeekRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/plan/");
  }, [router]);
  return (
    <div className="mt-8 text-center">
      <p className="text-[14px] text-muted">
        Week moved to <a href="/plan/" className="text-bronze underline">Plan</a>.
      </p>
      <p className="text-[12px] text-muted mt-2 italic">Redirecting…</p>
    </div>
  );
}
