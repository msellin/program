"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useStore } from "@/lib/useStore";
import { blocksForDate } from "@/lib/engine/plan-generator";
import { activePhaseFor } from "@/lib/engine/schedule";
import type { Program } from "@/lib/schemas";

type Stage = "prompt" | "skipChoice";

/**
 * When today loads and yesterday was a scheduled STRENGTH day with nothing
 * logged (no exercise `done`, no run, not marked skipped), show a prompt that
 * asks the user to either backdate a log or skip the day. Prevents the
 * "silent-lose-a-session" trap where users don't realise skipping without
 * marking it means missing progression waves.
 *
 * Dismissed per-device per-day via localStorage.
 */
export function MissedSessionPrompt({
  program,
  todayISO,
  onLogYesterday,
  onSkipYesterday,
}: {
  program: Program | null | undefined;
  todayISO: string;
  onLogYesterday: () => void;
  onSkipYesterday: () => void;
}) {
  const store = useStore((s) => s.store);
  const hydrated = useStore((s) => s.hydrated);
  const skipDay = useStore((s) => s.skipDay);
  const skipAndShiftWeek = useStore((s) => s.skipAndShiftWeek);
  const [dismissed, setDismissed] = useState(true);
  const [stage, setStage] = useState<Stage>("prompt");

  const yesterdayISO = (() => {
    const d = new Date(todayISO + "T00:00:00");
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  })();

  const dismissKey = `program.missed-session-prompt.dismissed.${yesterdayISO}`;

  useEffect(() => {
    if (typeof window === "undefined") return;
    setDismissed(window.localStorage.getItem(dismissKey) === "1");
  }, [dismissKey]);

  if (!hydrated || dismissed || !program) return null;

  // Was yesterday a scheduled strength day?
  const phase = activePhaseFor(program, yesterdayISO, store.user_profile);
  const blocks = blocksForDate(program, store.user_profile, phase, yesterdayISO);
  const strengthBlocks = blocks.filter(
    (b) => (b.category ?? "strength") === "strength",
  );
  if (strengthBlocks.length === 0) return null;

  // Anything logged for yesterday?
  const yLog = store.logs[yesterdayISO];
  const anyExerciseDone = yLog
    ? Object.values(yLog.exercises ?? {}).some((e) => e.done)
    : false;
  const anyRunLogged = (yLog?.runs?.length ?? 0) > 0;
  const alreadySkipped = !!store.skipped?.[yesterdayISO];
  if (anyExerciseDone || anyRunLogged || alreadySkipped) return null;

  const dismiss = () => {
    try {
      window.localStorage.setItem(dismissKey, "1");
    } catch {
      /* ignore */
    }
    setDismissed(true);
  };

  return (
    <div className="rounded border border-amber/40 border-l-4 border-l-amber bg-amber/10 p-3 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-strong text-sm">
            Yesterday was a strength day — nothing logged.
          </p>
          <p className="text-[12px] text-muted mt-0.5 leading-snug">
            {stage === "prompt"
              ? "Log what you did so history stays honest, or mark it skipped so the week's progression can respond correctly."
              : "Pick how the week responds. Both options mark yesterday skipped."}
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="text-muted hover:text-ink w-9 h-9 -m-2 flex items-center justify-center flex-shrink-0"
        >
          <X size={16} />
        </button>
      </div>

      {stage === "prompt" ? (
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            onClick={() => {
              dismiss();
              onLogYesterday();
            }}
            className="font-mono text-[11px] uppercase tracking-wider px-3 py-2 rounded bg-bronze text-ground hover:bg-bronze-hover min-h-[36px]"
          >
            Log yesterday now
          </button>
          <button
            type="button"
            onClick={() => setStage("skipChoice")}
            className="font-mono text-[11px] uppercase tracking-wider px-3 py-2 rounded border border-line text-ink hover:bg-line-soft min-h-[36px]"
          >
            Mark yesterday skipped
          </button>
        </div>
      ) : (
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={() => {
              skipDay(yesterdayISO, "not completed");
              dismiss();
            }}
            className="w-full text-left rounded border border-line hover:border-slate/40 bg-surface p-3 space-y-1"
          >
            <p className="font-semibold text-[13px] text-strong">Skip only</p>
            <p className="text-[11px] text-muted leading-snug">
              This session is lost. Rest of the week runs as scheduled. Progression order breaks if you&apos;re on a wave.
            </p>
          </button>
          <button
            type="button"
            onClick={() => {
              if (program) skipAndShiftWeek(yesterdayISO, program, "not completed — shifted week");
              dismiss();
            }}
            className="w-full text-left rounded border border-bronze/50 bg-bronze/[0.06] p-3 space-y-1"
          >
            <p className="font-semibold text-[13px] text-strong">Skip &amp; shift the week</p>
            <p className="text-[11px] text-muted leading-snug">
              This session takes over the next scheduled strength day. Last day of the week drops. Recommended for wave-based programs.
            </p>
          </button>
          <button
            type="button"
            onClick={() => setStage("prompt")}
            className="text-[11px] text-muted underline decoration-muted/40 hover:text-ink"
          >
            ← Back
          </button>
        </div>
      )}
    </div>
  );
}
