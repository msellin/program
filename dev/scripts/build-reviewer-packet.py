#!/usr/bin/env python3
"""
Generate a self-contained reviewer packet per program domain (EVID-1).

Why generated rather than written
---------------------------------
A specialist audit is worth having only if it audits what actually ships. A
hand-written brief starts accurate and drifts — which is the failure mode this
project has hit repeatedly (the Extras tab, the KV line, a drift checker that
had itself drifted). Regenerating from `public/data` means the packet cannot
describe a program that no longer exists.

What a packet is for
--------------------
A named physiotherapist, coach or sport scientist should be able to read one
without repo access, in roughly ninety minutes, and hand back specific verdicts
we can act on. So it contains the claims and the citations behind them, and
asks closed questions — not "what do you think of this programme".

Run:  python3 dev/scripts/build-reviewer-packet.py
Out:  dev/audits/reviewer-packets/<domain>.md
"""
import json, pathlib, textwrap, datetime, hashlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
DATA = ROOT / "next-app" / "public" / "data"
OUT = ROOT / "dev" / "audits" / "reviewer-packets"

# One packet per review domain. A gymnastics coach should not be handed the
# rowing taper, and an exercise physiologist should not be asked about false
# grip.
DOMAINS = {
    "gymnastics-skill": {
        "title": "Gymnastics & upper-body skill",
        "who": "A gymnastics or calisthenics coach, or a physiotherapist who works with overhead athletes.",
        "programs": ["first-strict-pullup", "muscle-up", "handstand-walk"],
        "minutes": "About 90 minutes",
    },
    "endurance-engine": {
        "title": "Endurance — the Engine Builder arc",
        "who": "An exercise physiologist or endurance coach comfortable with threshold and VO2max programming.",
        "programs": ["engine-builder", "engine-builder-block-2"],
        "minutes": "About 90 minutes",
    },
    "endurance-race-concurrent": {
        "title": "Race prep & concurrent training",
        "who": "An endurance or strength-and-conditioning coach who works with concurrent athletes.",
        "programs": ["rowing-2k-test-prep", "concurrent-strength-maintenance"],
        "minutes": "About 60 minutes",
    },
    "mobility": {
        "title": "Shoulder mobility",
        "who": "A physiotherapist working in shoulder rehabilitation or overhead sport.",
        "programs": ["overhead-mobility"],
        "minutes": "About 40 minutes",
    },
}

CITATIONS = json.loads((DATA / "citations.json").read_text())
CITE_BY_ID = {c["id"]: c for c in (CITATIONS.get("citations") or CITATIONS.get("references") or [])
              if isinstance(c, dict) and "id" in c}

_MANIFEST_RAW = json.loads((DATA / "programs" / "manifest.json").read_text())
_MANIFEST_ENTRIES = (
    _MANIFEST_RAW if isinstance(_MANIFEST_RAW, list) else _MANIFEST_RAW.get("programs") or []
)
MANIFEST_BY_SLUG = {
    e["slug"]: e for e in _MANIFEST_ENTRIES if isinstance(e, dict) and e.get("slug")
}


def source_fingerprint(slugs: list) -> str:
    """SHA-256 over the exact data files a packet is built from.

    A packet is only trustworthy if it describes what currently ships, and the
    regeneration is manual — so a packet generated on Wednesday and a citation
    edited on Thursday leaves a document that quietly lies to a reviewer. That
    happened: the 2026-09-02 packets were sent-ready and by 2026-09-03 the
    gymnastics one still told a reviewer that a real paper's existence was
    "unconfirmed", after the citation had been corrected.

    `packet-freshness.test.ts` recomputes this from the same files and fails
    when it drifts. Kept in JS-recomputable form — sorted paths, raw bytes, no
    Python-specific serialisation — so the check does not need a Python
    runtime in CI.
    """
    h = hashlib.sha256()
    paths = [DATA / "citations.json", DATA / "programs" / "manifest.json"]
    paths += [DATA / "programs" / f"{slug}.json" for slug in sorted(slugs)]
    for path in paths:
        h.update(path.name.encode("utf-8"))
        h.update(b"\0")
        h.update(path.read_bytes())
        h.update(b"\0")
    return h.hexdigest()[:16]


def cite_block(cid: str, uses: list) -> str:
    c = CITE_BY_ID.get(cid, {})
    bits = [c.get("title", "(title missing from citations.json)")]
    if c.get("authors"):
        bits.append(str(c["authors"]))
    if c.get("year"):
        bits.append(str(c["year"]))
    head = " · ".join(str(b) for b in bits)
    lines = [f"**{cid}** — {head}\n"]
    for slug, used_for in uses:
        lines.append(f"- *{slug} says it supports:* {used_for}")
    lines.append("- **Does it? ☐ yes ☐ partly ☐ no —**\n")
    return "\n".join(lines)


def program_section(slug: str) -> str:
    d = json.loads((DATA / "programs" / f"{slug}.json").read_text())
    goal = d.get("program_goal") or {}
    out = [f"## {slug}\n"]
    out.append(f"**Goal the program sells:** {goal.get('display_name','—')} — "
               f"target {goal.get('target_value','—')} {goal.get('unit','')}, "
               f"stretch {goal.get('stretch_value','—')}.\n")
    # Was `status_note`, which is an AUTHORING note — nothing in the app reads
    # it, and three of nine programs use it to record internal scaffolding:
    # whitepaper filenames a reviewer cannot see, "will refine", and in
    # overhead-mobility's case "4 shoulder-specific citations that need
    # pre-launch URL verification". Opening a request for external review by
    # telling the reviewer our citations are unverified, in a document whose
    # whole purpose is to have them verified, is the wrong first paragraph.
    # The manifest carries the copy real users are shown; use that.
    entry = MANIFEST_BY_SLUG.get(slug, {})
    blurb = entry.get("short_description") or entry.get("who_this_is_for")
    if blurb:
        out.append(f"**What it tells users it does:** {blurb}\n")
    if entry.get("what_youll_achieve"):
        out.append(f"**What it promises by the end:** {entry['what_youll_achieve']}\n")

    tiers = d.get("plan_tiers") or []
    if tiers:
        out.append("### Entry tiers\n")
        for t in tiers:
            out.append(f"- **{t.get('id')}** — {t.get('name') or t.get('label') or ''}. "
                       f"{(t.get('description') or t.get('entry_criteria') or '')}\n")
        out.append("")

    out.append("### Phases and what each is for\n")
    for ph in d.get("phases", []):
        out.append(f"- **{ph.get('name')}** ({ph.get('duration_weeks','?')} wks) — {ph.get('goal','')}")
        if ph.get("template_note"):
            out.append(f"  - Method note: {ph['template_note']}")
    out.append("")

    rm = d.get("retest_metrics") or []
    if rm:
        out.append("### What it retests, and how often\n")
        for m in rm:
            out.append(f"- **{m.get('metric_id')}** — {m.get('display_name') or ''} "
                       f"({m.get('cadence_weeks','?')}-weekly)")
        out.append("")

    gates = (d.get("intake") or {}).get("safety_gates") or []
    out.append("### Who it refuses to take\n")
    if gates:
        for g in gates:
            out.append(f"- `{g.get('question_id')}` in {g.get('unsafe_values')} → blocked: "
                       f"\"{(g.get('block_title') or '')}\"")
    else:
        out.append("- **Nothing. This program screens nobody out.** Is that right for this population?")
    out.append("")
    out.append("**Is anything missing from that list? ☐ no ☐ yes —**\n")

    return "\n".join(out)


def dedup_citations(slugs: list[str]) -> dict[str, list[tuple[str, str]]]:
    """
    One entry per unique paper, carrying every claim any program hangs on it.

    The first version of this packet listed citations per program, so a reviewer
    would have met Wulf 1998 three times in one domain — 75 tick-boxes for what
    is really 40 papers. Deduplicating also makes cross-program overreach
    visible: a paper stretched to support two different claims is exactly how
    `beattie_2014` came to back a grip-dose claim it says nothing about.
    """
    merged: dict[str, list[tuple[str, str]]] = {}
    for slug in slugs:
        d = json.loads((DATA / "programs" / f"{slug}.json").read_text())
        for r in (d.get("evidence_base") or {}).get("references") or []:
            merged.setdefault(r.get("id", "?"), []).append((slug, r.get("used_for", "—")))
    return dict(sorted(merged.items()))


def build(domain_key: str, meta: dict) -> str:
    today = datetime.date.today().isoformat()
    fingerprint = source_fingerprint(meta["programs"])
    head = textwrap.dedent(f"""\
    # Reviewer packet — {meta['title']}

    **Generated {today} from the shipping program data.** Regenerate with
    `python3 dev/scripts/build-reviewer-packet.py`; do not edit by hand, or it
    will start describing a program that no longer ships.

    <!-- source-fingerprint: {fingerprint} -->

    ## What we are asking

    Terav is a focused-improvement training app. Each program targets one
    capability and adapts against the user's log. Every claim it makes is
    supposed to cite a peer-reviewed paper.

    Those citations have been audited **only by us**. The app currently tells
    users that a VERIFIED badge means the citations were re-checked in a
    documented second pass, and states plainly that no outside clinician has
    signed off any program. We would like that to stop being true.

    **We are asking you to answer three questions**, program by program:

    1. **Does each cited paper support the claim attached to it?** Tick-boxes
       below. A "partly" with one line of why is more useful than a yes.
    2. **Is anything prescribed here you would not prescribe**, for the
       population described?
    3. **Is anything missing from the screening** — who should this refuse to
       take that it currently accepts?

    We are **not** asking for endorsement, and we will not describe it as one.
    The app will say what you checked and on what date, and that you flagged
    what you would change.

    ## Who this packet is for

    {meta['who']}

    ## Time

    {meta['minutes']}. The citation list is the bulk of it; skim anything
    outside your domain and say so rather than guessing.

    ## What happens to your answers

    Recorded in the program file as `specialist_review` — your name, credential,
    date and scope, plus every change you asked for and whether we made it. That
    record is public. If we disagree with something you flag, the disagreement
    is published too, not quietly dropped.

    ---

    """)
    body = "\n\n---\n\n".join(program_section(s) for s in meta["programs"])
    merged = dedup_citations(meta["programs"])
    cites = ["\n\n---\n\n# Citations for this domain\n",
             f"{len(merged)} unique papers across {len(meta['programs'])} programs. "
             "Where a paper backs more than one claim, every claim is listed under it — "
             "a paper stretched across two claims is worth a second look.\n"]
    for cid, uses in merged.items():
        cites.append(cite_block(cid, uses))
    body = body + "\n".join(cites)
    tail = textwrap.dedent("""

    ---

    ## Sign-off

    - Name and credential:
    - Date reviewed:
    - Anything you did **not** review (out of your domain):
    - Overall: ☐ ships as-is ☐ ships with the changes flagged ☐ do not ship until fixed
    """)
    return head + body + tail


KEEP = {"README.md", "outreach-email.md"}


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    # Remove packets for domains that no longer exist. Splitting the endurance
    # packet in two left an orphan `endurance.md` describing an ask nobody was
    # going to make — and the one thing worse than no packet is a stale one
    # someone sends by mistake.
    current = {f"{k}.md" for k in DOMAINS} | KEEP
    for f in OUT.glob("*.md"):
        if f.name not in current:
            f.unlink()
            print(f"  removed stale {f.name}")
    for key, meta in DOMAINS.items():
        path = OUT / f"{key}.md"
        path.write_text(build(key, meta))
        merged = dedup_citations(meta["programs"])
        raw = sum(len((json.loads((DATA / "programs" / f"{sl}.json").read_text())
                       .get("evidence_base") or {}).get("references") or [])
                  for sl in meta["programs"])
        print(f"  {path.relative_to(ROOT)} — {len(meta['programs'])} programs, "
              f"{len(merged)} unique papers (from {raw} references)")


if __name__ == "__main__":
    main()
