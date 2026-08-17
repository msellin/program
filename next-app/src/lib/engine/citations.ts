/**
 * Canonical citation library loader.
 *
 * A2 (Phase 1): `next-app/public/data/citations.json` is the union of every
 * ref currently in program `evidence_base.references[]`, plus three new refs
 * that A1's engine rules cite. See `dev/design-briefs/2026-08-17-a2-...md`.
 *
 * Loaded once per session (module-level cache). Failures degrade gracefully:
 * `getCitationById` returns `null` if the library never loaded, and the
 * calling proposal component renders as log-cited (no Source: line).
 */

export type Citation = {
  id: string;
  authors: string;
  year: number;
  title: string;
  source: string;
  url?: string;
  display_short: string;
  display_line: string;
};

export type CitationSnapshot = {
  id: string;
  display_short: string;
  display_line: string;
  snapshotted_at: number;
};

type CitationLibrary = {
  schema_version: string;
  generated: string;
  citations: Citation[];
};

let cache: Map<string, Citation> | null = null;
let loadPromise: Promise<Map<string, Citation>> | null = null;

async function fetchLibrary(): Promise<Map<string, Citation>> {
  const res = await fetch("/data/citations.json", { cache: "force-cache" });
  if (!res.ok) throw new Error(`citations.json HTTP ${res.status}`);
  const doc = (await res.json()) as CitationLibrary;
  return new Map(doc.citations.map((c) => [c.id, c]));
}

export async function loadCitations(): Promise<Map<string, Citation>> {
  if (cache) return cache;
  if (!loadPromise) {
    loadPromise = fetchLibrary().then((m) => {
      cache = m;
      return m;
    });
  }
  return loadPromise;
}

export function getCitationById(id: string): Citation | null {
  return cache?.get(id) ?? null;
}

export function snapshotCitation(id: string): CitationSnapshot | null {
  const c = getCitationById(id);
  if (!c) return null;
  return {
    id: c.id,
    display_short: c.display_short,
    display_line: c.display_line,
    snapshotted_at: Date.now(),
  };
}
