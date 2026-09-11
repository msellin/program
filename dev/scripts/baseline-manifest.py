#!/usr/bin/env python3
"""Record and verify the integrity of a persona-artifact baseline.

Why this exists
---------------
`personas.baseline-pre-batch-36/` holds 14 persona directories and 910 files,
and was the "before" half of a comparison nobody could prove. There was a
`2026-08-20-batch-36-baseline-manifest.sha256` in the audits directory, which
looked like the record and was not: it names two paths under that tree out of
910. A baseline you cannot verify is a claim, not a baseline — and blind-walk
scoring, which has still never run, compares against exactly this tree.

Usage
-----
    python3 dev/scripts/baseline-manifest.py            # verify (default)
    python3 dev/scripts/baseline-manifest.py --write    # (re)generate

Verification is the default deliberately. Regenerating on drift is how a
manifest silently becomes a description of whatever is there now.
"""

import hashlib
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BASELINE = ROOT / "next-app/tests/e2e/artifacts/personas.baseline-pre-batch-36"
MANIFEST = ROOT / "dev/audits/app/personas.baseline-pre-batch-36.sha256"


def digest(p: Path) -> str:
    h = hashlib.sha256()
    with p.open("rb") as f:
        for chunk in iter(lambda: f.read(1 << 16), b""):
            h.update(chunk)
    return h.hexdigest()


def entries() -> list[tuple[str, str]]:
    if not BASELINE.exists():
        return []
    out = []
    for p in sorted(BASELINE.rglob("*")):
        if p.is_file() and p.name != ".DS_Store":
            out.append((digest(p), str(p.relative_to(ROOT))))
    return out


def main() -> int:
    write = "--write" in sys.argv
    now = entries()

    if not now:
        print(f"baseline-manifest: {BASELINE.relative_to(ROOT)} is missing — nothing to record")
        return 0 if not MANIFEST.exists() else 1

    if write:
        body = "".join(f"{h}  {rel}\n" for h, rel in now)
        MANIFEST.write_text(
            "# Terav · integrity record for personas.baseline-pre-batch-36\n"
            "# Regenerate ONLY when the baseline is deliberately replaced.\n"
            f"# {len(now)} files.\n" + body,
            encoding="utf-8",
        )
        print(f"baseline-manifest: wrote {len(now)} entries -> {MANIFEST.relative_to(ROOT)}")
        return 0

    if not MANIFEST.exists():
        print("baseline-manifest: NO MANIFEST — run with --write")
        return 1

    recorded = {}
    for line in MANIFEST.read_text(encoding="utf-8").splitlines():
        if line.startswith("#") or not line.strip():
            continue
        h, _, rel = line.partition("  ")
        recorded[rel] = h

    current = {rel: h for h, rel in now}
    added = sorted(set(current) - set(recorded))
    removed = sorted(set(recorded) - set(current))
    changed = sorted(r for r in set(recorded) & set(current) if recorded[r] != current[r])

    if not (added or removed or changed):
        print(f"baseline-manifest: OK — {len(now)} files match")
        return 0

    for label, rows in (("CHANGED", changed), ("ADDED", added), ("REMOVED", removed)):
        for r in rows[:10]:
            print(f"baseline-manifest: {label} {r}")
        if len(rows) > 10:
            print(f"baseline-manifest: ...and {len(rows) - 10} more {label}")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
