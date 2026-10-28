"use client";

/**
 * Next.js route-level error boundary for /report. Same pattern as
 * /progress/error.tsx — catches client-render exceptions and renders a
 * graceful fallback instead of Next's blank "This page couldn't load"
 * shell.
 *
 * Batch 36 audit round 2026-08-21 found /report crashing on all 14
 * personas. Root cause overlaps with /progress (both use
 * RetestMetricsPanel + SymptomLoadChart). Contain first, investigate
 * next.
 */

import { useEffect } from "react";
import Link from "next/link";
import { cardClass } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export default function ReportError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("[/report error boundary]", error);
  }, [error]);

  return (
    <div className="space-y-6 pt-4">
      <header>
        <h1 className="text-h1 tracking-tight text-strong leading-none">
          Training summary
        </h1>
        <p className="mt-2 text-small text-muted">
          Something on this page couldn&apos;t render.
        </p>
      </header>

      <div className={cn(cardClass(), "space-y-3")}>
        <p className="text-small text-ink">
          The report couldn&apos;t assemble. Your logs are safe. Try one of these:
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 text-eyebrow uppercase tracking-wider px-3 py-2 rounded-lg border border-line-strong text-ink hover:bg-line-soft min-h-[44px]"
          >
            Retry
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-eyebrow uppercase tracking-wider px-3 py-2 rounded-lg border border-line-strong text-ink hover:bg-line-soft min-h-[44px]"
          >
            Back to Today
          </Link>
          <Link
            href="/progress"
            className="inline-flex items-center gap-1.5 text-eyebrow uppercase tracking-wider px-3 py-2 rounded-lg border border-line-strong text-ink hover:bg-line-soft min-h-[44px]"
          >
            Open Progress
          </Link>
        </div>
        {error.digest ? (
          <p className="text-eyebrow text-muted uppercase tracking-widest">
            Error ref: {error.digest}
          </p>
        ) : null}
      </div>
    </div>
  );
}
