# H08 app visuals, first pass (read-only)

Scope: persona shots dated 2026-10-01 (stale), 393px mobile. Images read: `dev/active/launch-readiness/screens/phone-app-sign-up.png`, `next-app/tests/e2e/artifacts/personas/persona-erratic/mobile/01-today.png`, `.../persona-pullup/mobile/06-programs.png`, `.../persona-pullup/mobile/19-intake.png`, `.../persona-pullup/mobile/16-session-today.png`, `.../persona-erratic/mobile/05-progress.png`, `dev/active/launch-readiness/screens/phone-landing-home.png` (thumbnail only).

## Verdict
One palette and type family (warm-dark, tan accent, tracked mono labels) runs across screens. It does not yet read as one finished product: card treatments vary, two screens show overlapping elements, dev-facing text leaks through, and the sign-up CTA departs from the landing.

## Top 5 fixes, ranked
1. [BLOCKS-ADS-TODAY] Today overlaps: the sticky "Apply 10% lighter / Ignore" bar and tab bar sit over the flagged card and check-first block (persona-erratic/01-today.png). Pad the scroll container by bar height or fold the actions into the card.
2. [BLOCKS-ADS-TODAY] Today contradicts itself: "0 drills available" heading sits above four listed drills (persona-erratic/01-today.png). Derive the count from the list.
3. [BEFORE-SCALE] Sign-up CTA is a square uppercase mono button with teal links; the landing uses tan pill CTAs in sentence case (phone-app-sign-up.png vs phone-landing-home.png). Reuse the landing button and link styles.
4. [BEFORE-SCALE] Session screen stacks research-paper paragraphs ("Fahs 2015 style...", "no direct dose-response study") above the first exercise (persona-pullup/16-session-today.png). Keep one cue line; put citations behind a disclosure.
5. [BEFORE-SCALE] Progress: the week card covers the italic caption, the internal id `block_pull_midshin` shows as a lift name, and the 30-day dot grid has no labels (persona-erratic/05-progress.png). Fix z-order, hide ids, label the grid.

Also [BEFORE-SCALE], programs picker (persona-pullup/06-programs.png): a CITED/VERIFIED methodology essay sits above the list, descriptions cut off mid-sentence, and badge styles differ between cards.

## Consistency notes
- [LATER] At least four card treatments: amber left rule (Today), tan outline (Extras), plain grey (Log extra), coloured left rails (programs).
- [LATER] Intake Yes/No buttons are unstyled grey boxes with no visible selected state (persona-pullup/19-intake.png).
- [LATER] Tracked mono uppercase is used for labels, buttons and numbers, which weakens scanning.
- [LATER] Jargon on Today ("Life load 7/10", "Source: Halson 2014") reads like a dev tool.

Not checked: desktop and light mode, sign-in, Coach/History/Profile, any state after 2026-10-01, interactions and motion, iOS keyboard behaviour, landing beyond the thumbnail, and a live browser run.
