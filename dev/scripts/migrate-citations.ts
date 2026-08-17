/**
 * migrate-citations.ts
 *
 * Phase 1 of the A2 design brief.
 * See: dev/design-briefs/2026-08-17-a2-study-citations-on-proposals.md
 *
 * Reads every program JSON under next-app/public/data/programs/, extracts
 * every entry in evidence_base.references[], deduplicates by `id`, and
 * emits a canonical library at next-app/public/data/citations.json.
 * Also rewrites each program to add evidence_base.reference_ids[] alongside
 * the legacy references[] block (one-release-cycle overlap).
 *
 * Adds three new refs (Halson 2014, Rhea 2003, ACSM 2002) that A1's
 * overperformer TM-bump proposal will cite.
 *
 * Idempotent — running twice produces identical output.
 *
 * Usage: npx tsx dev/scripts/migrate-citations.ts
 */

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

type RawRef = {
  id: string;
  authors: string;
  year: number;
  title: string;
  source: string;
  url?: string;
  used_for: string;
  display_short_override?: string;
};

type CanonicalCitation = {
  id: string;
  authors: string;
  year: number;
  title: string;
  source: string;
  url?: string;
  display_short: string;
  display_line: string;
};

const PROGRAMS_DIR = resolve(
  __dirname,
  "../../next-app/public/data/programs",
);
const CITATIONS_OUT = resolve(
  __dirname,
  "../../next-app/public/data/citations.json",
);

const NEW_REFS: RawRef[] = [
  {
    id: "halson_2014",
    authors: "Halson SL",
    year: 2014,
    title: "Monitoring training load to understand fatigue in athletes",
    source: "Sports Medicine 44(Suppl 2):S139-147",
    url: "https://pubmed.ncbi.nlm.nih.gov/25200666/",
    used_for: "readiness signals; layoff detection; deload triggers",
  },
  {
    id: "rhea_2003_meta",
    authors: "Rhea MR, Alvar BA, Burkett LN, Ball SD",
    year: 2003,
    title: "A meta-analysis to determine the dose response for strength development",
    source: "Medicine and Science in Sports and Exercise 35(3):456-464",
    url: "https://pubmed.ncbi.nlm.nih.gov/12618576/",
    used_for: "training-max progression; overperformer bump rule",
  },
  {
    id: "kraemer_2002_acsm_position_stand",
    authors: "American College of Sports Medicine",
    year: 2002,
    title: "Progression models in resistance training for healthy adults",
    source: "Medicine and Science in Sports and Exercise 34(2):364-380",
    url: "https://pubmed.ncbi.nlm.nih.gov/11828249/",
    used_for: "readiness-after-layoff; progression discipline; deload framing",
    display_short_override: "ACSM 2002",
  },
];

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

function writeJson(path: string, data: unknown): void {
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function pickFullerShape(a: RawRef, b: RawRef): RawRef {
  return {
    id: a.id,
    authors: (a.authors?.length ?? 0) >= (b.authors?.length ?? 0) ? a.authors : b.authors,
    year: a.year || b.year,
    title: (a.title?.length ?? 0) >= (b.title?.length ?? 0) ? a.title : b.title,
    source: (a.source?.length ?? 0) >= (b.source?.length ?? 0) ? a.source : b.source,
    url: a.url ?? b.url,
    used_for: a.used_for,
  };
}

const INSTITUTIONAL_HEAD = /^(American|European|International|British|National|World)\b/;

function shortAuthor(authors: string): string {
  if (INSTITUTIONAL_HEAD.test(authors)) return authors;
  const clean = authors.replace(/\s+et al\.?/i, "").trim();
  const first = clean.split(/,|;/)[0].trim();
  const lastName = first.split(/\s+/)[0];
  const multi = /,|;|\bet al\b/i.test(authors) || clean.split(/\s+/).length > 2;
  return multi ? `${lastName} et al.` : lastName;
}

function makeDisplayShort(r: RawRef): string {
  if (r.display_short_override) return r.display_short_override;
  return `${shortAuthor(r.authors)} ${r.year}`;
}

function makeDisplayLine(r: RawRef): string {
  const journal = r.source.split(/[;:,]/)[0].trim();
  const author = r.display_short_override
    ? r.display_short_override.replace(/\s+\d{4}$/, "")
    : shortAuthor(r.authors);
  return `${author} (${r.year}), ${journal}`.slice(0, 80);
}

function toCanonical(r: RawRef): CanonicalCitation {
  return {
    id: r.id,
    authors: r.authors,
    year: r.year,
    title: r.title,
    source: r.source,
    ...(r.url ? { url: r.url } : {}),
    display_short: makeDisplayShort(r),
    display_line: makeDisplayLine(r),
  };
}

function main(): void {
  const programFiles = readdirSync(PROGRAMS_DIR)
    .filter((f) => f.endsWith(".json") && f !== "manifest.json")
    .sort();

  const byId = new Map<string, RawRef>();
  const programToIds = new Map<string, string[]>();

  for (const file of programFiles) {
    const path = join(PROGRAMS_DIR, file);
    const doc = readJson<{ evidence_base?: { references?: RawRef[] } }>(path);
    const refs = doc.evidence_base?.references ?? [];
    programToIds.set(file, refs.map((r) => r.id));
    for (const r of refs) {
      if (!r.id) continue;
      const existing = byId.get(r.id);
      byId.set(r.id, existing ? pickFullerShape(existing, r) : r);
    }
  }

  for (const nr of NEW_REFS) {
    if (!byId.has(nr.id)) byId.set(nr.id, nr);
  }

  const canonical = Array.from(byId.values())
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(toCanonical);

  const library = {
    schema_version: "1.0",
    generated: new Date().toISOString().slice(0, 10),
    citations: canonical,
  };
  writeJson(CITATIONS_OUT, library);

  const diffReport: string[] = [];
  diffReport.push(`Programs scanned: ${programFiles.length}`);
  diffReport.push(`Raw refs: ${Array.from(programToIds.values()).reduce((n, ids) => n + ids.length, 0)}`);
  diffReport.push(`Unique after dedupe: ${byId.size - NEW_REFS.length}`);
  diffReport.push(`New refs added: ${NEW_REFS.length} (${NEW_REFS.map((r) => r.id).join(", ")})`);
  diffReport.push(`Canonical total: ${canonical.length}`);
  diffReport.push("");
  diffReport.push(`Wrote ${CITATIONS_OUT}`);
  diffReport.push("");

  for (const file of programFiles) {
    const path = join(PROGRAMS_DIR, file);
    const doc = readJson<{
      evidence_base?: {
        references?: RawRef[];
        reference_ids?: string[];
        [k: string]: unknown;
      };
      [k: string]: unknown;
    }>(path);

    const ids = programToIds.get(file) ?? [];
    if (ids.length === 0) {
      diffReport.push(`${file}: no references — skipped`);
      continue;
    }

    doc.evidence_base = doc.evidence_base ?? {};
    const before = doc.evidence_base.reference_ids ?? [];
    doc.evidence_base.reference_ids = ids;

    writeJson(path, doc);
    const changed = JSON.stringify(before) !== JSON.stringify(ids);
    diffReport.push(
      `${file}: ${ids.length} reference_ids ${changed ? "(updated)" : "(unchanged)"}`,
    );
  }

  console.log(diffReport.join("\n"));
}

main();
