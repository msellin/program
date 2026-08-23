# Profile: "what Terav believes about you" — v1

Scope settled through back-and-forth with the user (2026-08-23), not a
formal plan-mode round — recording the agreed spec here per CLAUDE.md's
dev-docs mandate rather than re-deriving decisions already made.

## Scope (agreed)

Design package turn t2, screen 2b. Full reframe of Profile was NOT what
we're building — same "augment, don't replace" call as Plan's 3b. New
section inserted into the EXISTING Profile page (after the identity chip,
before "Your programs"), everything else on Profile (program list,
More nav, sign out, legal footer) untouched.

Two belief rows only, not the mockup's open-ended list:

1. **Training max** — one row per exercise with a set TM. Editable
   (reuses `setTM`, already exists). Why: pull the most recent accepted
   `tm_bump` entry from `store.proposal_history` that references this
   exercise id (composite ids are `tm-bump:<exId1>,<exId2>,...` — parse
   the comma-joined id string); if found, "Bumped N time(s), most
   recently {date}." If not, "Set from your intake baseline."
2. **Program tier** — one row (active program only). Read-only, by
   design, permanently — not a v1 shortcut. Letting a user self-declare
   tier would let them lie to the adaptive engine about earned
   progression, undermining the confirm-first/evidence model this app is
   built on. Why: latest `tier_history` entry
   (`{from_tier,to_tier,at,trigger}`) → "Promoted from {from} to {to} on
   {date} — {trigger === 'retest' ? 'you cleared the retest gate' :
   'set manually'}." No history yet → "Your intake answers put you
   here." Below the why: "Changes automatically when you clear your next
   retest gate" + link to /progress — the real path, so the absence of a
   Change button reads as intentional, not broken.

Explicitly dropped from v1: days/week commitment (no edit flow exists
anywhere in the app, not just Profile — a real separate feature, not a
Profile afterthought), the "Focus" card duplicate of the program list
(Profile already has an active-programs list; no need to build a second
summary of the same thing), the multi-value "measured vs estimated"
classifier per row (no reliable per-row signal to back that distinction
honestly — omitting rather than fabricating).

## Data confirmed to exist (read from schemas.ts)

- `store.training_maxes: Record<exId, number>`
- `store.proposal_history: Array<{id, kind, outcome, at, date,
  citation_snapshot?}>` — `id` for tm_bump is
  `tm-bump:<exId1>,<exId2>,...` (see `lib/proposals/select.ts`)
- `program_states[slug].tier_history: Array<{from_tier, to_tier, at,
  trigger: "retest"|"manual"}>`
- `program_states[slug].tier: string`

## Files

- New: `src/components/profile/BeliefsSection.tsx`
- Modified: `src/app/profile/page.tsx` — render it after the identity
  chip

## Verification

tsc/eslint/vitest clean, same bar as prior passes. Live check via the
e2e test account (it has a real TM set from earlier session testing —
first realistic chance this session to visually confirm a row like this
renders, unlike the Plan banner).
