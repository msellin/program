"use client";

/**
 * Cut C · Redirect stub · /history → /record
 *
 * The History surface collapsed into the unified `/record` surface per
 * locked decisions. The old LogList + BlockHistorySection + heatmap
 * pattern is now `CutCLogList` + `CutCActivityHeatmap` on Record.
 *
 * Client-side redirect for static-export compat. See /progress/page.tsx
 * for the same pattern + rationale.
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HistoryRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/record/");
  }, [router]);
  return (
    <div className="mt-8 text-center">
      <p className="text-[14px] text-muted">
        History moved to <a href="/record/" className="text-bronze underline">Record</a>.
      </p>
      <p className="text-[12px] text-muted mt-2 italic">
        Redirecting…
      </p>
    </div>
  );
}
