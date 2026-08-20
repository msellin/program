"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StatusPill } from "@/components/ui/StatusPill";

type Citation = {
  id: string;
  authors: string;
  year: number;
  title: string;
  source: string;
  url?: string;
  display_short?: string;
  display_line?: string;
  /**
   * Batch 36 Step 14 · v1.1.1 §7.5 status ladder collapse.
   * REFERENCED = cited but not verified. VERIFIED = cited + confirmed
   * against source by a specialist audit. Older schemas used a 3-tier
   * REFERENCED/REVIEWED/VERIFIED — collapsed to 2 tiers here.
   */
  status?: "REFERENCED" | "VERIFIED" | "REVIEWED";
};

/**
 * P1-54 — the in-app bibliography.
 *
 * Landing claims "every change cites a study." Guide covers terminology.
 * This page is the walled-garden version of the landing's evidence
 * promise — the actual reference list, one screen, alphabetical.
 * Not marketing prose; just the citations. If a claim in the app can't
 * be traced back to something here, it's engineering-choice, not
 * cited.
 */
export default function EvidencePage() {
  const [citations, setCitations] = useState<Citation[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/data/citations.json")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: { citations: Citation[] }) => {
        const sorted = [...d.citations].sort((a, b) =>
          a.authors.localeCompare(b.authors),
        );
        setCitations(sorted);
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, []);

  if (error) {
    return (
      <div className="mt-8 rounded border border-red bg-surface p-4">
        <h2 className="mb-2 text-lg font-semibold">Couldn&apos;t load evidence library</h2>
        <p className="text-sm text-muted">{error}</p>
      </div>
    );
  }
  if (!citations) return <div className="mt-8 text-sm text-muted">Loading…</div>;

  return (
    <div className="space-y-6 pt-4">
      <header>
        <h1 className="text-[32px] font-semibold tracking-tight text-strong leading-none">
          Evidence
        </h1>
        <p className="mt-2 text-sm text-muted">
          {citations.length} cited studies — the full bibliography behind every
          program, proposal, and progression rule in the app.
        </p>
        <p className="mt-2 text-[13px] text-muted">
          If a claim in the app can&apos;t be traced back to something here,
          it&apos;s engineering-choice, not cited. See{" "}
          <Link href="/guide" className="underline underline-offset-2 hover:text-ink">
            Guide
          </Link>{" "}
          for terminology.
        </p>
      </header>

      <ul className="rounded border border-line-soft bg-surface divide-y divide-line-soft">
        {citations.map((c) => {
          // Batch 36 P0 (audit 2026-08-21 · app-copy-clarity) —
          // 2-tier ladder per v1.1.1 §7.5. REFERENCED → CITED (slate);
          // REVIEWED + VERIFIED + stable → VERIFIED (green). Aligned
          // with Programs catalog + Program preview label maps so the
          // same program shows the same label on every surface.
          const status = c.status ?? "REFERENCED";
          const label =
            status === "REVIEWED" || status === "VERIFIED" ? "VERIFIED" : "CITED";
          const tone: "slate" | "green" = label === "VERIFIED" ? "green" : "slate";
          return (
            <li key={c.id} className="px-4 py-3 space-y-1.5">
              <div className="flex items-start justify-between gap-3">
                <p className="text-[14px] text-ink leading-snug min-w-0 flex-1">
                  <span className="font-semibold text-strong">
                    {c.authors} ({c.year}).
                  </span>{" "}
                  {c.title}
                  {c.source ? <span className="text-muted"> — {c.source}</span> : null}
                  {c.url ? (
                    <>
                      {" "}
                      <a
                        href={c.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate underline underline-offset-2 hover:text-ink"
                      >
                        link
                      </a>
                    </>
                  ) : null}
                </p>
                <StatusPill label={label} tone={tone} className="flex-shrink-0 mt-0.5" />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
