"use client";

/**
 * Cut C · Redirect stub · /progress → /record
 *
 * The Progress surface collapsed into the unified `/record` surface per
 * locked decisions (dev/active/decisions-2026-08-21-locked.md D2 · matrix
 * rec #5 · brief §1 IA decision). This client-side redirect preserves
 * external bookmarks and old share links.
 *
 * Static export doesn't emit HTTP 3xx redirects — we hand back a page
 * that route-changes on mount. Users see a very brief "Moved" flash
 * (usually invisible on modern hardware) then land on /record.
 *
 * Once we're confident no external bookmarks remain (~90 days after
 * ship per QA-1 protocol) this stub can be deleted entirely and
 * `/progress` returns 404 gracefully via the standard not-found.
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProgressRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/record/");
  }, [router]);
  return (
    <div className="mt-8 text-center">
      <p className="text-[14px] text-muted">
        Progress moved to <a href="/record/" className="text-bronze underline">Record</a>.
      </p>
      <p className="text-[12px] text-muted mt-2 italic">
        Redirecting…
      </p>
    </div>
  );
}
