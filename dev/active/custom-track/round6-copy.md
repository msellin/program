# Round 6 — copy lens (2026-10-29)
Seen: every v5 PNG at 375x667 and 393x852 (01, 02, 02b, 02c, 03, 05, 06) + peers sheet-player. Q1 settled: opt-in autoplay built.

## Scores (10 = best peer at the job)
- Brief 9.0 — units now explicit in chips/card; why-card still best in set. Loses: "How to run this" / "Log an extra session" (G1), rows "3×5", "6×1" carry no unit.
- Player 8.9 — "N sets left today", "Per side 15 + 1.25 kg", autoplay row all clear. Loses: unexplained "Rep PR" on set 1 of a thin history; done chips "52.5×5" still bare dialect; autoplay prompt not fully honest (G3).
- Rest 9.1 — "Reps left in the tank?" + helper is peer-best. Loses: "Too hard" = effort word vs "Hard" family; "+30s".
- Done 8.4 — Best set hero + TM row good. Loses: bare "Done" H1; "Training max · Front squat" wraps at 375; "earn one" ambiguous; Front squat repeated 3x (hero, TM, list row) for a 1-exercise session.

## Changes to reach 10 (keep: Back to brief, More options, Done — set N · X kg, Missed X kg, Something hurt, Skip rest, Switch exercise, Start session, Back to Today)
G1 BriefView.tsx:441 "How to run this" -> "How this session works"; :458 "Log an extra session" -> "Add an extra session". (Carried from R5 G7, still unapplied.)
G2 SessionDone.tsx:85 "Done" -> "Session done" (G4 carried; "Session stopped" already parallel).
G3 SetView.tsx:547 "Play demo clips automatically? They load from YouTube." -> "Play clips automatically? YouTube will see your IP address." Buttons stay Yes / Not now. Same fact the Settings hint (settings/page.tsx:84) and privacy page already state; the prompt is where consent happens, so it must carry it.
G4 SessionDone.tsx:113 "Training max · {name}" -> "Training max" (name is the hero's subject; keep name only when >1 lift). Fixes the 375 wrap; value then reads "76.5 kg · no change".
G5 SessionDone.tsx:118 "Changes only when your top sets earn one. You decide." -> "Changes only when a top set earns it. You decide."
G6 SessionDone.tsx / DoneSections: hide the per-exercise list row ("Front squat  3 sets · best 52.5 kg × 5") when the session has one exercise; it repeats the hero verbatim.
G7 SetView.tsx:706 "Rep PR" -> "Rep PR if 5" (or show only after the set is logged). A PR badge before the lift reads as a claim the app cannot yet make; a thin-history persona gets it on set 1.
G8 SetView completed chips "52.5×5" (the "✓1 52.5×5" chips in 03): -> "52.5 × 5" at minimum; drop "×5" from chips when all sets share reps (header already says "× 5").
G9 RestTakeover.tsx:39 "Too hard" -> keep label (test-linked at :262) but sub-label "0–1 left" ok; change "+30s" to "+30 s" (same file, button label) — polish only.
G10 prescription-line.ts:25 "3×5" / "6×1" -> "3 × 5" with spaces to match "×" use elsewhere ("52.5 kg × 5"); one dialect.

## Autoplay prompt + privacy honesty
- Prompt (SetView.tsx:547): half honest. "They load from YouTube" is true but omits the cost (IP to Google); fix G3. Placement is good (after a manual tap, once, with Not now). One flaw: while the prompt shows, "Hide demo" is replaced (393 02c) — the user cannot close the clip until they answer; acceptable only if answering is one tap, which it is.
- Settings hint (settings/page.tsx:84): honest, names IP, says muted/first set. Keep.
- Privacy (legal/privacy/page.tsx:139-142, 176-179): honest — off by default, nocookie player, IP + device details named, trigger named. Keep; add "Not now" = stays off only if the page says so (it says "off unless you say yes"). Good.
- Q1 effect: motion was the player's one gap; with opt-in the player copy ceiling is 9.5. G3, G7, G8 reach it.
