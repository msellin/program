# Wire motor-learning refs into Overhead Mobility — plan

Founder decision 2026-08-18 (Q4, path A · Tier 3): elevate Overhead
Mobility from "mobility program that cites motor-learning literature"
to "mobility program that USES motor-learning principles in drill
design." Currently Chiviacowsky-Wulf 2002, Wulf-Shea 2002, Shea-Morgan
1979, Salmoni 1984, Sands 2000 are in `reference_ids` but nothing in
the program operates on them.

## The claim we're trying to earn

*"This isn't the same overhead-mobility program you'd get on YouTube.
It uses evidence-based motor-learning principles — you drill positions
blocked in early weeks (Shea & Morgan 1979: better acquisition), then
random in later weeks (better retention). You choose when to review
the demo (Chiviacowsky & Wulf 2002: self-controlled feedback beats
prescribed feedback). Contextual interference is a feature, not a
bug."*

Right now the program has none of those mechanics.

## What each cited paper actually says (and what we'd do)

### Shea & Morgan 1979 · contextual interference
- **Finding**: blocked practice → better acquisition; random practice
  → better retention.
- **Currently used**: nothing.
- **New use**: weekly template gains a `practice_mode` flag per week —
  `blocked` (weeks 1-2), `random` (weeks 3-10). Drill order + demo
  cadence differs.

### Wulf & Shea 2002 · complex skill acquisition
- **Finding**: contextual interference effects generalize to complex
  motor skills, not just lab tasks.
- **Currently used**: nothing.
- **New use**: justifies applying Shea & Morgan to a skill like
  scapular upward-rotation timing (not just finger sequences).

### Chiviacowsky & Wulf 2002 · self-controlled feedback
- **Finding**: learners who CHOOSE when to see feedback outperform
  learners who receive it on a fixed schedule.
- **Currently used**: nothing.
- **New use**: drill card gets a **"Show me the position"** button.
  Never auto-plays a demo. User taps if they want to see the target.
  Log: how often the user requested feedback per session (motivation
  signal for the engine).

### Salmoni, Schmidt & Walter 1984 · knowledge of results (KR)
- **Finding**: KR bandwidth (giving feedback only when performance is
  outside a threshold) beats giving it every rep.
- **Currently used**: nothing.
- **New use**: drill retest scoring — user rates the position quality
  1-10, we only show "feedback text" if the score < 6. Reinforces
  self-assessment.

### Sands 2000 · gymnastics-specific motor learning
- **Finding**: elite gymnasts use progression, part-whole, and
  variability principles.
- **Currently used**: nothing.
- **New use**: overhead mobility weekly template gains a `variability`
  weekly rotation (different overhead loaded implement per week —
  KB, DB, PVC) once the fundamentals are stable.

## Data model additions

New per-program field on Overhead Mobility only (for now):

```jsonc
"motor_learning_mechanics": {
  "practice_mode_by_week": {
    "1": "blocked",
    "2": "blocked",
    "3": "random",
    "4": "random",
    "5": "random",
    "6": "random",
    "7": "random",
    "8": "random",
    "9": "random",
    "10": "random"
  },
  "self_controlled_feedback": true,
  "kr_bandwidth_threshold": 6,
  "variability_rotation": ["kettlebell", "dumbbell", "pvc"],
  "variability_starts_week": 4
}
```

## UI additions

- **DrillCard** — new "Show me the position" button (self-controlled
  feedback). Only appears when `motor_learning_mechanics.self_controlled_feedback === true`.
- **DrillCard** — post-set rating input (1-10). When the rating < the
  `kr_bandwidth_threshold`, an inline paragraph appears with the KR
  text (drill-specific corrective cues).
- **DrillCard** — the drill's variability implement rotates by
  `week % rotation.length` when the current week ≥
  `variability_starts_week`.
- **Weekly template** — blocked vs random practice mode drives block
  ordering in `strengthBlocksForDate` for overhead-mobility only.

## Reader migration

The drill card in the app currently doesn't have a rating input, a
demo button, or a variability rotation. All three are new UI. This
is not a "flip flag" fix — it's a small feature project.

## Effort estimate

**~8-12h**:

- Schema + program JSON: 1.5h (declare all mechanics on overhead-mobility)
- Plan generator changes: 2h (blocked→random mode drives block ordering;
  variability rotation drives implement swap)
- DrillCard UI additions: 3h (Show-me-the-position button, rating input,
  variability implement swap)
- Copy in overhead-mobility drill cards: 1h (KR-bandwidth text per drill)
- Log schema: 1h (record ratings, feedback-request count per session)
- Tests: 1.5h

## Phased ship

- **Phase 1** (2h) — data model + program JSON. Zero UI. Ships as
  metadata that the reader can consume in Phase 2.
- **Phase 2** (4h) — DrillCard: rating input + Show-me-the-position
  button + variability rotation. Feature flag OFF.
- **Phase 3** (2h) — plan generator: blocked→random mode drives block
  ordering.
- **Phase 4** (1h) — copy on each drill (KR-bandwidth corrective text).
- **Phase 5** (0.5h) — flip flag ON for founder account, validate.

## Founder decisions still open

- **Do we start with self-controlled feedback + rating only, defer
  blocked→random**? Fastest path to "motor learning is real here." My
  recommendation: yes — that's Phase 2 alone (~4h). Ships the demo
  button and the rating input; blocked→random is deferred to a follow-on.
  Then we know if the mechanic is even valuable before adding more.
- **Show-me-the-position content** — video, animation, or annotated
  photo? Video is best (Chiviacowsky-Wulf's protocols used video). But
  video authoring is a separate project (see F-brief). Interim: an
  annotated diagram or the existing drill card copy expanded — cheap
  and unblocks the mechanic.
- **Variability rotation** — do we own the language ("weekly implement
  swap") or defer to the drills themselves declaring their variability
  set? My recommendation: latter — declarative per drill, engine reads.

## Not doing

- Wiring motor-learning into other programs (First Pull-Up in draft,
  Muscle-Up in draft, Handstand Walk). Those live in Skill-programs
  land and have their own drill scaffolding — separate project.
- Video authoring for the Show-me-the-position button. Belongs in
  F-brief video library queue.
- Coach-chat integration that references motor-learning principles.
  Follows naturally once the data is there; not blocking.

## Success criteria

- User taps "Show me the position" > 0 times per session in first 3
  sessions. If never, self-controlled feedback isn't earning its UI.
- Rating input landed on > 60% of drill instances after session 4. If
  not, the input is friction not signal.
- Blocked→random progression detectable in a session log at week 3.
