# Lanes handoff (hackathon 2026-10-27)

Append-only. Write here when an item needs a file another lane owns: `- [from lane X → lane Y] file:line — what is needed`.
The owning lane picks it up, does it in its own commit, and marks the line `✓ <sha>`.

## Split items: who owns what
- **G-01, new sign-up's day 1 is a rest day.** Lane 4 owns the schedule side (where `started_at` and day 1 are
  derived, so day 1 has a session). Lane 2b owns only the Today side ("Start your first session" CTA), and reads
  whatever lane 4 exposes. Lane 4 lands first; lane 2b codes against the existing data until then.
- **G-07, red does not change the session.** Lane 4 owns the derivation: a pure function in `lib/` that
  says "on red: hold, and this is the program's alternative". Lane 2a owns the session UI that consumes it.
  Lane 4 posts the function's name and signature below as soon as it exists.
- **A-UX-01, nothing sticky except the nav.** The feedback button moves into You: lane 2b owns it. G-10 (check
  screen sticky Save) is also lane 2b.

## Messages
