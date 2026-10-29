"use client";

import { useStore } from "@/lib/useStore";
import { CutCLogList } from "@/components/record/CutCLogList";
import { downloadRecordExport } from "@/lib/engine/record-export";
import { Button } from "@/components/ui/Button";

/**
 * Every logged day, paginated, with Export (founder-feedback round 4, 2026-10-29). Record shows the last few days
 * and links here; the full list used to fill the bottom of Record.
 */
export default function RecordHistoryPage() {
  const hydrated = useStore((s) => s.hydrated);
  const store = useStore((s) => s.store);
  if (!hydrated) return <div className="mt-8 text-small text-muted">Loading…</div>;
  return (
    <div className="space-y-6">
      <header className="flex items-baseline justify-between gap-3">
        <h1 className="text-h1 tracking-[-0.03em] text-strong leading-none">All sessions</h1>
        <Button variant="tertiary" onClick={() => downloadRecordExport(store)} aria-label="Export your record as JSON">
          Export
        </Button>
      </header>
      <CutCLogList store={store} />
    </div>
  );
}
