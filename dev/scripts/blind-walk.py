#!/usr/bin/env python3
"""
blind-walk.py — randomizer for the Batch 36 blind-walk gate.

Per `dev/audits/app/2026-08-20-terav-design-system-v1.1.md` §9 (design-lead
synthesis condition 1): the founder scores post-Batch-36 personas against
baseline in randomized order with anonymized filenames, so numeric ≥ 7.0/10
scoring can't be biased by "I know this is the new one."

Usage:
    ./dev/scripts/blind-walk.py \\
        --baseline next-app/tests/e2e/artifacts/personas.baseline-pre-batch-36 \\
        --post next-app/tests/e2e/artifacts/personas.post-batch-36 \\
        --out /tmp/terav-blind-walk-YYYYMMDD

Produces:
    /tmp/terav-blind-walk-YYYYMMDD/
        screen-001.png
        screen-002.png
        ...
        MAPPING.json        # decoded mapping — DO NOT read until scoring is complete
        SCORESHEET.md       # empty scoresheet with slots 1..N + binary "2026 peer?" question

Assumes:
    - Both baseline and post directories have the same persona subtree structure
    - Screens named the same in both (harness produces deterministic filenames)
    - Founder scores each anonymized slot 1..10 and writes YES/NO on the binary Q
"""

from __future__ import annotations

import argparse
import json
import random
import shutil
import sys
from datetime import datetime
from pathlib import Path


def collect_screens(root: Path) -> list[Path]:
    """Return every PNG under root, sorted for reproducibility."""
    return sorted(root.rglob("*.png"))


def pair_screens(baseline: Path, post: Path) -> list[tuple[str, Path, Path]]:
    """
    Pair each baseline screen with its post counterpart.

    Returns list of (rel_path_str, baseline_abs, post_abs). Screens present
    only in one side get logged to stderr but skipped.
    """
    base_screens = {p.relative_to(baseline): p for p in collect_screens(baseline)}
    post_screens = {p.relative_to(post): p for p in collect_screens(post)}

    only_baseline = base_screens.keys() - post_screens.keys()
    only_post = post_screens.keys() - base_screens.keys()

    if only_baseline:
        print(f"[warn] {len(only_baseline)} screens only in baseline (removed after Batch 36):", file=sys.stderr)
        for p in sorted(only_baseline)[:10]:
            print(f"       {p}", file=sys.stderr)
    if only_post:
        print(f"[warn] {len(only_post)} screens only in post (new after Batch 36):", file=sys.stderr)
        for p in sorted(only_post)[:10]:
            print(f"       {p}", file=sys.stderr)

    shared = sorted(base_screens.keys() & post_screens.keys())
    return [(str(k), base_screens[k], post_screens[k]) for k in shared]


def anonymize(
    pairs: list[tuple[str, Path, Path]],
    out: Path,
    seed: int,
) -> dict:
    """
    Shuffle every screen into a flat anonymized sequence.

    Each pair contributes TWO slots — one for baseline, one for post — so the
    founder can't infer which set they're scoring from position. Slots are
    interleaved randomly then given sequential names screen-001.png ...

    Returns the mapping dict (never printed to stdout until scoring done).
    """
    entries: list[tuple[str, str, Path]] = []
    for rel, base_abs, post_abs in pairs:
        entries.append((rel, "baseline", base_abs))
        entries.append((rel, "post", post_abs))

    rng = random.Random(seed)
    rng.shuffle(entries)

    mapping = {"seed": seed, "generated_at": datetime.utcnow().isoformat() + "Z", "slots": []}
    out.mkdir(parents=True, exist_ok=True)

    for idx, (rel, side, src) in enumerate(entries, start=1):
        anon_name = f"screen-{idx:03d}.png"
        dst = out / anon_name
        shutil.copy2(src, dst)
        mapping["slots"].append({
            "slot": idx,
            "anon_name": anon_name,
            "original_rel": rel,
            "side": side,
        })

    return mapping


def write_scoresheet(out: Path, n_slots: int) -> None:
    lines = [
        "# Terav Batch 36 · blind-walk scoresheet",
        "",
        f"**Generated**: {datetime.utcnow().isoformat()}Z",
        f"**Total slots**: {n_slots}",
        "",
        "## Instructions",
        "",
        "For each screen, give a numeric score 1–10 (higher = better) based on:",
        "",
        "1. Does this read as a 2026 app? (Peer benchmark: Linear, The Outsiders, Runna, Anthropic Console)",
        "2. Is the primary emphasis clear? (Workout name largest on Today, single primary CTA per surface)",
        "3. Honest in worst state? (Amber weeks look amber, no glow/confetti)",
        "4. Accent economy? (One bronze accent per surface, never two competing)",
        "",
        "## Scores",
        "",
        "| Slot | Score (1–10) | Notes |",
        "|---|---|---|",
    ]
    lines.extend(f"| {i:03d} | | |" for i in range(1, n_slots + 1))
    lines.extend([
        "",
        "## Binary gate (§8 v1.1.1)",
        "",
        "**Q1**: Does the Today surface read as a 2026 peer app to you?",
        "",
        "- [ ] YES · ship gate PASSES",
        "- [ ] NO  · ship gate BLOCKS · unwind to bento fallback per §4",
        "",
        "## Ship-gate decision",
        "",
        "- Numeric mean ≥ 7.0/10 (no surface < 6.0) AND Q1 = YES → ship",
        "- Numeric mean 6.0-6.9/10 → §4 bento-fallback unwind",
        "- Numeric mean < 6.0/10 OR Q1 = NO → pause and re-brief",
    ])
    (out / "SCORESHEET.md").write_text("\n".join(lines), encoding="utf-8")


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--baseline", type=Path, required=True, help="Baseline persona artifacts dir")
    ap.add_argument("--post", type=Path, required=True, help="Post-Batch-36 persona artifacts dir")
    ap.add_argument("--out", type=Path, required=True, help="Output dir for anonymized set")
    ap.add_argument("--seed", type=int, default=None, help="Random seed (default: current unix timestamp)")
    args = ap.parse_args()

    if not args.baseline.is_dir():
        print(f"error: baseline dir not found: {args.baseline}", file=sys.stderr)
        return 1
    if not args.post.is_dir():
        print(f"error: post dir not found: {args.post}", file=sys.stderr)
        return 1
    if args.out.exists():
        print(f"error: output dir already exists: {args.out}", file=sys.stderr)
        return 1

    seed = args.seed if args.seed is not None else int(datetime.utcnow().timestamp())
    pairs = pair_screens(args.baseline, args.post)
    if not pairs:
        print("error: no shared screens between baseline and post", file=sys.stderr)
        return 1

    mapping = anonymize(pairs, args.out, seed)
    (args.out / "MAPPING.json").write_text(json.dumps(mapping, indent=2), encoding="utf-8")
    write_scoresheet(args.out, len(mapping["slots"]))

    print(f"[ok] Wrote {len(mapping['slots'])} anonymized slots to {args.out}")
    print(f"[ok] Seed: {seed}")
    print(f"[ok] MAPPING.json contains the decode key — do NOT read until scoring is complete")
    return 0


if __name__ == "__main__":
    sys.exit(main())
