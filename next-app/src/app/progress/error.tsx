"use client";

/**
 * Next.js route-level error boundary for /progress. Catches any client-render
 * exception thrown by ProgressBody, RetestMetricsPanel, WeeklyNarrativeTile,
 * or the WeeklyHeatmap/ReadinessTrail additions and renders a graceful
 * fallback instead of Next's blank "This page couldn't load" shell.
 *
 * Batch 36 audit round 2026-08-21 found /progress crashing on 8 of 10
 * non-hip personas. Root cause still under investigation; this boundary
 * ensures users see something informative and can navigate away.
 */

import { useEffect } from "react";
import Link from "next/link";

export default function ProgressError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("[/progress error boundary]", error);
  }, [error]);

  return (
    <div className="space-y-6 pt-4">
      <header>
        <h1 className="text-[32px] font-semibold tracking-tight text-strong leading-none">
          Progress
        </h1>
        <p className="mt-2 text-[14px] text-muted">
          Something on this page couldn&apos;t render.
        </p>
      </header>

      <div className="rounded border border-line-soft bg-surface p-4 space-y-3">
        <p className="text-[14px] text-ink">
          We caught the error and stopped it from breaking the app. Your logs
          are safe. Try one of these:
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider px-3 py-2 rounded border border-line-strong text-ink hover:bg-line-soft min-h-[44px]"
          >
            Retry
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider px-3 py-2 rounded border border-line-strong text-ink hover:bg-line-soft min-h-[44px]"
          >
            Back to Today
          </Link>
          <Link
            href="/history"
            className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider px-3 py-2 rounded border border-line-strong text-ink hover:bg-line-soft min-h-[44px]"
          >
            Open History instead
          </Link>
        </div>
        {error.digest ? (
          <p className="font-mono text-[10px] text-muted uppercase tracking-widest">
            Error ref: {error.digest}
          </p>
        ) : null}
      </div>
    </div>
  );
}
