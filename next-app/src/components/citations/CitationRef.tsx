"use client";

import { useEffect, useId, useState } from "react";
import { getCitationById, loadCitations, type Citation } from "@/lib/engine/citations";

/**
 * Renders the inline citation line under a proposal reason:
 *   Source: {display_short} ↗
 *
 * Tap / Enter expands a detail panel with the full title, journal, and an
 * external link. Semantics: `aria-expanded` + `aria-controls` on the toggle;
 * detail panel keyboard-focusable when expanded.
 *
 * If the library hasn't loaded yet (or the id isn't found), renders `null`
 * — the calling proposal degrades to log-cited (Because line only).
 */
export function CitationRef({ id }: { id: string }) {
  const [citation, setCitation] = useState<Citation | null>(() => getCitationById(id));
  const [expanded, setExpanded] = useState(false);
  const panelId = useId();

  useEffect(() => {
    if (citation) return;
    let cancelled = false;
    loadCitations().then(() => {
      if (cancelled) return;
      setCitation(getCitationById(id));
    });
    return () => {
      cancelled = true;
    };
  }, [id, citation]);

  if (!citation) return null;

  return (
    <div className="text-[12px] leading-snug">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-controls={panelId}
        className="inline-flex items-center gap-1 text-muted hover:text-strong transition-colors min-h-[44px] py-2"
      >
        <span>
          <span className="text-muted">Source:</span>{" "}
          <span className="text-strong">{citation.display_short}</span>
        </span>
        <span aria-hidden="true" className={expanded ? "rotate-180 transition-transform" : "transition-transform"}>
          ▾
        </span>
      </button>
      {expanded ? (
        <div
          id={panelId}
          className="mt-1 pl-3 border-l border-line space-y-1 text-[12px] text-muted"
        >
          <p className="text-ink">{citation.title}</p>
          <p className="font-mono text-[11px]">{citation.display_line}</p>
          {citation.url ? (
            <p>
              <a
                href={citation.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-bronze hover:text-bronze-hover underline underline-offset-2"
              >
                Read the paper ↗
              </a>
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
