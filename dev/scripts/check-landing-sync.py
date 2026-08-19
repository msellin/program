#!/usr/bin/env python3
"""
QA-2 · landing↔app sync check.

Verifies that hard claims on the landing page (program counts, citation
counts, category coverage) match the current app data. Run before every
batch that touches the catalog or citations. Wire as a pre-commit hook
if you want the check enforced.

Usage:
    python3 dev/scripts/check-landing-sync.py

Exit codes:
    0 · all claims match
    1 · one or more claims drift (details printed to stderr)

Sync points covered (as of 2026-08-19):

    landing/src/i18n/dictionaries/en.ts:
      hero.stat_programs_value  — "5 programs"           ← manifest REVIEWED public count
      hero.stat_studies_value   — "126"                  ← citations.json row count
      programs.title            — "Five programs live."  ← manifest REVIEWED public count (word form)
      programs.title            — "Three more in build." ← manifest DRAFT count (word form)
      programs.roadmap_link     — "Three more in build"  ← manifest DRAFT count (word form)
      evidence.title            — "126 primary studies"  ← citations.json row count

Not covered (soft claims — positioning, tone):
    "cited studies" plural — presence of a citations claim, not a number
    "not a clinician" — positioning claim, no data source
    "not a streak game" — positioning claim, no data source
    Program pitches (engine_builder_pitch, csm_pitch, ...) — semantic
        match with each program's short_description, requires a semantic
        compare that this script doesn't attempt.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
MANIFEST = ROOT / "next-app/public/data/programs/manifest.json"
CITATIONS = ROOT / "next-app/public/data/citations.json"
LANDING_EN = ROOT / "landing/src/i18n/dictionaries/en.ts"

NUM_WORDS = {
    1: "one", 2: "two", 3: "three", 4: "four", 5: "five",
    6: "six", 7: "seven", 8: "eight", 9: "nine", 10: "ten",
    11: "eleven", 12: "twelve",
}


def count_from_manifest() -> tuple[int, int]:
    m = json.loads(MANIFEST.read_text())
    reviewed_public = [
        p for p in m["programs"]
        if p.get("status") in ("REVIEWED", "VERIFIED", "stable")
        and not p.get("personal")
    ]
    draft = [
        p for p in m["programs"]
        if p.get("status") in ("DRAFT", "PROVISIONAL", "draft")
    ]
    return len(reviewed_public), len(draft)


def count_citations() -> int:
    c = json.loads(CITATIONS.read_text())
    if isinstance(c, dict) and "citations" in c:
        return len(c["citations"])
    if isinstance(c, list):
        return len(c)
    raise ValueError("citations.json shape unrecognized")


def check(assertion: bool, ok_msg: str, fail_msg: str, drifts: list[str]) -> None:
    if assertion:
        print(f"  ✓ {ok_msg}")
    else:
        print(f"  ✗ {fail_msg}", file=sys.stderr)
        drifts.append(fail_msg)


def main() -> int:
    reviewed_count, draft_count = count_from_manifest()
    citations_count = count_citations()
    text = LANDING_EN.read_text()

    print(f"App state: {reviewed_count} REVIEWED public programs · "
          f"{draft_count} DRAFT · {citations_count} citations")
    print()
    print("Checking landing/src/i18n/dictionaries/en.ts against app state:")

    drifts: list[str] = []

    # hero.stat_programs_value — "N programs" (digit form)
    check(
        f'"{reviewed_count} programs"' in text,
        f'hero.stat_programs_value shows "{reviewed_count} programs"',
        f'hero.stat_programs_value expected "{reviewed_count} programs" · '
        f'landing has different digit or wording',
        drifts,
    )

    # hero.stat_studies_value + evidence.title — "N" (studies count)
    check(
        f'"{citations_count}"' in text,
        f'hero.stat_studies_value shows "{citations_count}"',
        f'hero.stat_studies_value expected "{citations_count}" · '
        f'landing has different count',
        drifts,
    )
    check(
        f"{citations_count} primary studies" in text,
        f'evidence.title shows "{citations_count} primary studies"',
        f'evidence.title expected "{citations_count} primary studies"',
        drifts,
    )

    # programs.title — "Five programs live." (word form)
    reviewed_word = NUM_WORDS.get(reviewed_count, str(reviewed_count)).capitalize()
    expected_live = f"{reviewed_word} programs live."
    check(
        expected_live in text,
        f'programs.title shows "{expected_live}"',
        f'programs.title expected "{expected_live}"',
        drifts,
    )

    # programs.title / roadmap_link — "Three more in build" (word form)
    draft_word = NUM_WORDS.get(draft_count, str(draft_count)).capitalize()
    expected_build = f"{draft_word} more in build"
    check(
        expected_build in text,
        f'programs.title / roadmap_link show "{expected_build}"',
        f'programs.title / roadmap_link expected "{expected_build}"',
        drifts,
    )

    # Bonus: check category coverage claim on hero.stat_programs_label —
    # only warn on missing categories, don't fail (positioning is
    # curated, not comprehensive).
    label_match = re.search(
        r'stat_programs_label:\s*"([^"]+)"', text,
    )
    if label_match:
        claimed_cats = [c.strip() for c in label_match.group(1).split(",")]
        m = json.loads(MANIFEST.read_text())
        catalog_cats = sorted(set(
            p.get("category") for p in m["programs"]
            if p.get("status") in ("REVIEWED", "VERIFIED", "stable")
            and not p.get("personal")
        ))
        # Map catalog category ids → landing-friendly words. Landing uses
        # curated words ("engine" for endurance, "strength" for strength,
        # "skill" for skill, "mobility" for asymmetry/mobility).
        catalog_words = {
            "endurance": "engine",
            "strength": "strength",
            "skill": "skill",
            "gymnastics": "skill",
            "mobility": "mobility",
            "asymmetry": "mobility",
            "hyrox": "hyrox",
            "rehab": "rehab",
        }
        catalog_landing_words = sorted(set(
            catalog_words.get(c, c) for c in catalog_cats if c
        ))
        missing = [w for w in catalog_landing_words if w not in claimed_cats]
        if missing:
            print(
                f"  ⚠ hero.stat_programs_label doesn't mention: "
                f"{', '.join(missing)} · catalog has these categories but "
                f"landing curated set omits them (may be intentional)",
                file=sys.stderr,
            )

    print()
    if drifts:
        print(f"❌ {len(drifts)} sync drift{'s' if len(drifts) > 1 else ''} found. "
              f"Fix landing/src/i18n/dictionaries/en.ts before shipping.",
              file=sys.stderr)
        return 1

    print("✓ landing↔app in sync")
    return 0


if __name__ == "__main__":
    sys.exit(main())
