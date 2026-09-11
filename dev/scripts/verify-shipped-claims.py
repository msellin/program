#!/usr/bin/env python3
"""Check that files named in DONE lines actually exist.

Why this exists (QA-1)
----------------------
On 2026-08-18 a batch's "Shipped" section claimed eleven fixes. A rerun found
at least three only partially executed — the plan was archived as complete
while the data still said otherwise. The request was a "verify shipped is not
the same as archive" step: either a checklist of grep proofs, or a check that
re-reads what the claim refers to.

This is the cheapest honest version. It does not try to verify that a fix is
CORRECT — that needs a reader. It verifies the one thing a machine can: a line
marked `- [x]` that names a source file in backticks should name a file that
exists. A "done" item pointing at a file nobody ever wrote is a claim that can
be falsified for free, and it is exactly what was found in `saas-launch`, where
`functions/api/state.ts`, `middleware.ts` and `src/lib/sync.ts` are all ticked
and none of the three is in the tree.

Resolution is by basename anywhere in the repo, not by exact path — docs name
files loosely ("`OffPlanSheet.tsx`") and demanding full paths would produce
noise rather than findings.

Usage:
    python3 dev/scripts/verify-shipped-claims.py          # report
    python3 dev/scripts/verify-shipped-claims.py --check  # exit 1 on a NEW one
"""

from __future__ import annotations

import collections
import pathlib
import re
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parents[2]

# A file reference: at least one name character before the extension, so
# `.test.ts` inside a longer token is not read as a filename of its own.
REF = re.compile(r"`([A-Za-z0-9_-][A-Za-z0-9_./-]*\.(?:ts|tsx|py|json|sh))`")

# Claims that are knowingly unresolvable, each with the reason. OPEN, not
# approved: shrink it. A deliberate deletion belongs here; a fix that never
# landed belongs on the task list instead.
BASELINE = {
    "dev/scripts/check-landing-sync.py": "deleted 2026-09-01, assertions moved into data-integrity.test.ts (QA-2)",
    "lib/engine/daily-plan.ts": "deleted 2026-09-11 — composeDailyPlan had zero callers",
    "GraduationCard.tsx": "consolidated into components/session/shared/StatusCards.tsx",
    "coverage.json": "harness artifact, generated and gitignored",
    "lib/video/calibrate.ts": "video analysis is gated on V0-5 and unbuilt",
    "functions/api/state.ts": "STALE CLAIM — ticked in saas-launch, never existed; the KV design it belonged to was replaced by Postgres",
    "middleware.ts": "STALE CLAIM — ticked in saas-launch for the Clerk design that was replaced by Supabase",
    "src/lib/sync.ts": "STALE CLAIM — ticked in saas-launch, no such module",
}


def tracked_files() -> list[str]:
    out = subprocess.run(
        ["git", "ls-files"], cwd=ROOT, capture_output=True, text=True, check=False
    )
    return out.stdout.split()


def unresolved() -> dict[str, list[str]]:
    tracked = tracked_files()
    exact = set(tracked)
    by_base: dict[str, list[str]] = collections.defaultdict(list)
    for f in tracked:
        by_base[pathlib.Path(f).name].append(f)

    refs: dict[str, list[str]] = collections.defaultdict(list)
    for md in sorted(ROOT.glob("dev/**/*.md")):
        if any(p in ("archive", "completed") for p in md.parts):
            continue
        for i, line in enumerate(
            md.read_text(encoding="utf-8", errors="replace").splitlines(), 1
        ):
            if not line.lstrip().startswith("- [x]"):
                continue
            for m in REF.finditer(line):
                refs[m.group(1)].append(f"{md.relative_to(ROOT)}:{i}")

    return {
        ref: locs
        for ref, locs in refs.items()
        if ref not in exact and not by_base.get(pathlib.Path(ref).name)
    }


def main() -> int:
    check = "--check" in sys.argv
    missing = unresolved()
    new = {r: locs for r, locs in missing.items() if r not in BASELINE}
    fixed = [r for r in BASELINE if r not in missing]

    for ref, locs in sorted(new.items()):
        print(f"verify-shipped: DONE claims `{ref}` — no such file   ({locs[0]})")
    for ref in sorted(fixed):
        print(f"verify-shipped: `{ref}` resolves now — delist it from BASELINE")

    if not new and not fixed:
        print(f"verify-shipped: OK — {len(missing)} known unresolved, no new ones")
        return 0
    return 1 if check else 0


if __name__ == "__main__":
    raise SystemExit(main())
