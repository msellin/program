"use client";

import { extractSignals } from "@/lib/engine/note-signals";

/**
 * Tiny read-only chip strip under a notes textarea that shows what the engine
 * picked up from the current text. Purely informational — it does not mutate
 * state and does not act on the user's behalf.
 *
 * Rendering the same signals here that drive the DayAdjustmentProposal banner
 * makes the causal chain visible: user types → chips appear → banner offers a
 * proposal → user accepts. Never silent.
 */
export function NoteSignalHint({ text }: { text: string | null | undefined }) {
  const sig = extractSignals(text);
  if (sig.matches.length === 0) return null;
  return (
    <div className="mt-1 flex flex-wrap gap-1.5" aria-label="Signals picked up from this note">
      {sig.matches.map((m) => (
        <span
          key={m}
          className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate/15 text-slate"
        >
          {m}
        </span>
      ))}
    </div>
  );
}
