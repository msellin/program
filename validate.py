#!/usr/bin/env python3
"""Validate the program data files.

Usage:  python3 validate.py
Exits non-zero on any error, so it works as a pre-commit hook.
"""
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent
DATA = ROOT / "data"

errors: list[str] = []
warnings: list[str] = []

# Keys whose values reference an exercise id. "sequence" is a list of ids.
REF_KEYS = {"exercise_id", "progress_to", "progression", "regression", "prerequisite"}
# Type-annotation placeholders inside daily_log_schema, not real references.
PLACEHOLDERS = {"string", "int", "number", "boolean", "ISO date"}


def load(name):
    path = DATA / f"{name}.json"
    if not path.exists():
        errors.append(f"missing file: data/{name}.json")
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        errors.append(f"data/{name}.json is not valid JSON: {e}")
        return None


def collect_refs(node, found):
    if isinstance(node, dict):
        for k, v in node.items():
            if k in REF_KEYS and isinstance(v, str):
                found.add(v)
            elif k == "sequence" and isinstance(v, list):
                found.update(x for x in v if isinstance(x, str))
            else:
                collect_refs(v, found)
    elif isinstance(node, list):
        for item in node:
            collect_refs(item, found)


def main():
    program = load("program")
    exercises = load("exercises")
    clinical = load("clinical-context")
    questions = load("open-questions")

    if errors:
        report()
        return

    ids = {e["id"] for e in exercises["exercises"]}
    if len(ids) != len(exercises["exercises"]):
        errors.append("duplicate exercise ids in exercises.json")

    refs = set()
    collect_refs(program, refs)
    collect_refs(exercises, refs)
    for missing in sorted(refs - ids - PLACEHOLDERS):
        errors.append(f"unresolved exercise reference: {missing!r}")

    # every phase must reference real blocks
    block_ids = {b["id"] for b in program["blocks"]}
    for phase in program["phases"]:
        for b in phase["blocks"]:
            if b not in block_ids:
                errors.append(f"phase {phase['id']}: unknown block {b!r}")

    # phase gates must name a real phase
    phase_ids = {p["id"] for p in program["phases"]}
    for block in program["blocks"]:
        gate = block.get("phase_gated")
        if gate and gate not in phase_ids:
            errors.append(f"block {block['id']}: unknown phase gate {gate!r}")

    # provocative positions should not be silently reintroduced
    prov = {p["id"] for p in clinical["provocative_positions"]}
    if not prov:
        warnings.append("clinical-context.json has no provocative_positions")

    # unanswered questions keep the program provisional
    unanswered = [q["id"] for q in questions["questions"] if q.get("answer") is None]
    if unanswered and program.get("status") != "PROVISIONAL":
        errors.append(
            f"program.json is not marked PROVISIONAL but {len(unanswered)} questions are unanswered"
        )
    if not unanswered and program.get("status") == "PROVISIONAL":
        warnings.append("all questions answered — program.json can be regenerated and status flipped")

    critical = [q["id"] for q in questions["questions"]
                if q.get("priority") == "critical" and q.get("answer") is None]
    if critical:
        warnings.append(f"{len(critical)} critical questions unanswered: {', '.join(critical)}")

    report(len(ids), len(refs))


def report(n_ex=0, n_refs=0):
    for w in warnings:
        print(f"warn   {w}")
    for e in errors:
        print(f"ERROR  {e}")
    if not errors:
        print(f"ok     {n_ex} exercises, {n_refs} references, all resolved")
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
