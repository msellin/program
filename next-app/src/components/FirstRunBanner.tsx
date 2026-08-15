"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useStore } from "@/lib/useStore";

const DISMISS_KEY = "program.firstrun.dismissed";

export function FirstRunBanner() {
  const [dismissed, setDismissed] = useState(true);
  const hydrated = useStore((s) => s.hydrated);
  const logsCount = useStore((s) => Object.keys(s.store.logs).length);
  const tmCount = useStore((s) => Object.keys(s.store.training_maxes).length);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const flag = localStorage.getItem(DISMISS_KEY);
    setDismissed(flag === "1");
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    setDismissed(true);
  };

  if (!hydrated || dismissed) return null;
  if (logsCount > 0 || tmCount > 0) return null;

  return (
    <div className="rounded-lg border border-line-soft bg-surface p-4 space-y-2.5">
      <div className="flex items-start justify-between gap-3">
        <p className="font-semibold text-strong text-[14px]">Five tabs, one flow</p>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="text-muted hover:text-ink w-10 h-10 -m-2 flex items-center justify-center"
        >
          <X size={16} />
        </button>
      </div>
      <ul className="text-[12.5px] text-muted space-y-1 leading-relaxed">
        <li><span className="text-ink">Today</span> — the session you&apos;re prescribed right now.</li>
        <li><span className="text-ink">Week</span> — the 7-day rhythm.</li>
        <li><span className="text-ink">Progress</span> — training maxes, retests, trends.</li>
        <li><span className="text-ink">History</span> — every logged session, replayable.</li>
        <li><span className="text-ink">Profile</span> — account, active plans, menu.</li>
      </ul>
      <p className="text-[12px] text-muted pt-1">
        More lives behind the <span className="font-mono">⋮</span> menu (top right): Programs, Check, Extras, Coach, Report, Guide.
      </p>
    </div>
  );
}
