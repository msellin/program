# Round 4: design lead (2026-10-28), 1-10, 10 = best of GOWOD/Runna/Pliability at that job

Looked at: v3 393x852 + 375x667 (both sheets), peers sheet-player + sheet-overview, SetView/RestTakeover/SessionDone code.
Scores: brief 7.5 | player 7.0 | rest 7.5 | done 6.5. (round 3: 6.5 / 6.5 / 6.0 / 5.5). Honesty/logging already beats peers; richness and
"this is a workout" feel still trail Runna/GOWOD.

## Player (7.0 -> 10)
G1 SetView.tsx:~518-536 + chip rail: 393x852 still has ~130px void between rail and the number (stage is a dark box, figure floats small).
   Make the media band `flex-1` (min 22vh, max 38vh) so it absorbs the void, and drop the figure's own bg: bg-surface -> bg-surface-raised
   plus `shadow-[inset_0_-40px_60px_-30px_rgb(var(--bronze)/.10)]` floor glow; full-bleed (-mx-4, rounded-none) at >=760px.
G2 SetView.tsx:~440 header: progress is 4 grey dashes next to "Something hurt"; make filled segments bronze, 3px high, one per exercise,
   full width above the header row (GOWOD), not between back and chip. Chip stays right.
G3 SetView.tsx:949-956: Missed / Change weight are equal heavy buttons under Done. Change weight -> text-style link (h-11, no border, text-muted);
   Missed -> same, aligned right, so Done is the only filled/bordered object. At 375x667 this frees the crowded bottom row.
G4 SetView.tsx:~530: merge "18 sets left today" into the rail's right edge as "3/8 . 18 left"; one line, removes a row at 667.
G5 SetView.tsx:~505 (667px): "Watch demo" pill sits alone on its own row at 11 caption weight; put it inside the band corner on every height (absolute top-2 left-2),
   band 667 = 15vh always visible, so the figure is never hidden on short phones (reverses round-3 X1; band is 100px, cost is fine).
G6 Reps grid (3 rows of 5) on set 3 pushes the cue block; show the grid as 1 row of 5 + "6-10+" chip that expands (Hevy). Keeps number+Done above the fold at 667.

## Rest (7.5 -> 10)
G7 RestTakeover.tsx:339-405: order is Next up, then How did that feel, then +30s/Skip. Make How did that feel directly under the ring (ring is the
   timer, effort is the product), Next up below it. Drop the second caption line to one: "Sets your training max" (or "We'll use it next week").
G8 RestTakeover.tsx:393-420: remove border on unselected chips (bg-surface-2 only); selected = bronze fill. Height 66 -> 56 at 667.
G9 RestTakeover.tsx:339: Next up gets the 40px figure left of "Set 2 of 8 . 90 kg x 5" (Runna next-card); figure-less exercises show nothing (no placeholder).
G10 RestTakeover.tsx "Add a note" row: move into the ... menu on <760px; it competes with Skip rest for the bottom thumb zone.

## Brief (7.5 -> 10)
G11 BriefView.tsx cards (~200-300): only card 1 has figure and chips. Give every card the 40px figure and its top-set line; collapsed cards show
    "4x8 . 60 kg", not just "4x8". Missing figures render nothing, no blank box.
G12 BriefView.tsx hero: add week dots (Pliability "1 of 7"): 7 dots, filled = trained this week from the log; plus one line "Last week 100 x 5, 2 left"
    on card 1 (names the log signal, core promise).
G13 BriefView.tsx:"Start session" sits behind a 24px gap and clipped "How to run this" on 667: make Start sticky above nav with a gradient fade;
    move "How to run this" / "Log an extra session" into one "More" row.
G14 Header "Top set at 81% of your 126 kg training max" is a hairline row; promote to a 2-line card with a visible "Why this load" chevron label.

## Done (6.5 -> 10)
G15 SessionDone.tsx DoneStats: three bordered boxes -> borderless trio (Runna): 40px numerals, 12px caps labels, hairline dividers.
G16 SessionDone.tsx:~92: when no proposal exists the engine says nothing. Always render one engine line above BestSet: with proposal -> ProposalCard;
    without -> "Log signal: top set 102.5 x 5, 2 left. Training max unchanged, review in 2 sessions." Core promise shown even on a quiet day.
G17 SessionDone.tsx:~112 movement list: add the 40px figure and best set per row (90 x 5), not "2 sets". Merge BestSetCard into it (one list, no 3 stacked cards).
G18 SessionDone.tsx:146: "Back to Today" fine; add a muted "Undo last set" only if <60s since finish? NO (out of scope). Instead, pin the button above the nav on 667.

## Q1 (owner): opt-in muted autoplay
Player 7.0 -> 8.0 only if G1/G5 are also done; autoplay adds motion, but our figure already animates (playing={!demoOpen}) and covers the job.
Recommend NO: the privacy promise ("nothing from YouTube before a tap") is a differentiator no peer has, and a YouTube autoplay in a rehab
session adds a third-party tracker, data use, and mobile data cost for +0.5-1 point. If the owner says yes: once-only sheet in Profile (not mid-session),
default off, per-exercise 15 s muted loop via DemoVideo `start`/`end`, reduced-motion = still poster, and Wi-Fi-only if navigator.connection allows.
