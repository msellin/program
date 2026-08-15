# program

Personal hip / lumbosacral rehab and leg strength tracker.

Target location: `/Users/margussellin/www/program/`

```
program/
  CLAUDE.md                    # project brief for Claude Code sessions
  README.md
  .gitignore
  index.html                   # single-file tracker, no build step
  validate.py                  # schema + referential integrity
  data/
    clinical-context.json      # findings, provocative positions, red flags — stable
    exercises.json             # movement library, 24 movements — stable
    open-questions.json        # 10 questions w/ rationale + impact mapping
    program.json               # blocks, phases, progression rules — PROVISIONAL
    log.example.json           # sample entries, shows the log shape
```

## Run it

The app fetches the JSON files, which `file://` blocks. Serve the folder:

```bash
cd /Users/margussellin/www/program
python3 -m http.server 8000
# open http://localhost:8000/
```

Logs live in `localStorage` under `program.log.v1`. Nothing leaves the browser.

## Validate

```bash
python3 validate.py
```

Checks JSON syntax, duplicate exercise ids, that every `exercise_id` resolves, that phase
and block references are real, and that `program.json` stays marked `PROVISIONAL` while
questions are unanswered. Exits non-zero on error, so it works as a pre-commit hook.

## Status

`clinical-context.json` and `exercises.json` are derived from the medical record and are
stable. `program.json` is `PROVISIONAL` — the schema is settled, the content is a
placeholder until `open-questions.json` is filled in. When it is, only that file's
`blocks[]` and `progression_rules[]` get regenerated; app code written against the current
shape won't change.

Four of the ten questions are marked `critical`. Q4 (inflammatory screen) is the one that
can invalidate the whole approach rather than just adjust it — check it first.

## Design notes

**De-identified on purpose.** No name, no isikukood, no provider names or codes. Health
data is Article 9 special category under GDPR; personal use falls under the household
exemption, but there's no reason for identifiers to live in an app database. If this ever
moves to Supabase, give it its own project rather than a table alongside anything
client-facing. The source PDFs are gitignored and should stay out of the repo.

**Progression is data, not prose.** `progression_rules.states[]` holds evaluable
conditions so the app derives `green | amber | red` from a logged symptom score.
`daily_log_schema.derived_state_rule` documents the exact expression the app implements.

**Laterality is the structural device.** The record is organised around it — left hip,
right shoulder, left gluteus maximus deficit — so the UI is too. Side-specific exercises
show an L/R spine with the priority side highlighted; symptom rows carry a laterality tag.

**Flags surface in the UI.** `monitor:click`, `monitor:knee_valgus`,
`historical_provocateur` render as visible chips rather than sitting in the data unread.

## Where to take it

The history view is the part worth building out properly. A multi-year symptom record
with load context is something none of the clinical notes contain, and it's what would
make the next specialist appointment productive rather than another round of "pain since
autumn 2020."

Not medical advice. A supplement to clinical care, not a substitute for it — the
physiotherapy referral in `clinical-context.json` remains the highest-value open action.
