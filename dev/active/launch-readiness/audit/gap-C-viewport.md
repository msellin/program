# Gap C viewport review (375x667, 393x852)
Source: `screens/gaps/C-viewport-375` and `-393` notes.md plus 10 PNGs. 03-session and 04-record top/bottom are byte-identical, read once. FAB is absent from notes sticky lists; measured from pixels.

| Route | Fixed/sticky element | Height px (375 / 393) | Overlaps |
|---|---|---|---|
| all | bottom nav `nav.fixed` (y613 / y798) | 54 / 54 | nothing; reserves bottom 54px |
| all | feedback FAB (circle, pixel-measured) | ~50, y545-595 / y730-780 | Check CTA right edge, Programs card title, Record sheet text, 393 off-plan last card corner |
| Today (375 first run) | onboarding `div.fixed inset-0 z-[60]` | 667 (full) | hides all Today content and nav |
| Record | sheet `div.fixed inset-0 z-50` | 635 / 820 | dims page; sheet bottom clips nav top 12px |
| Record | `header.sticky` (y267 / y475) | 53 | hidden under sheet; reported y unexplained |
| Check | Update-check CTA `div.fixed` (y526 / y711) | 77 | 10px above nav; FAB over its right edge |
| Plan, Session, Programs, Account, Off-plan | nav only | 54 | none beyond FAB |
Vertical space: 375x667 gives 613px above nav on Plan, Session (content ends y412) and Programs; 536px on Check after the CTA bar; Today unmeasurable under overlay. 393x852 gives 798px / 721px.

Findings:
- CONFUSING [HACKATHON] 375 Today first run: full-screen onboarding covers all Today content and nav. 393 capture of same route shows no overlay, so first-run state differs by viewport or persona. Verify.
- CONFUSING [HACKATHON] FAB floats above modal layers (onboarding, Record sheet) and covers sheet text ("in", "JSON" at 375).
- CONFUSING [HACKATHON] Check: FAB covers right ~46px of the Update-check CTA at 375 and its right edge at 393, so taps there open feedback. Nothing reserves space for the FAB.
- UGLY [HACKATHON] Record sheet at 375 clips the top of the bottom-nav icons.
- UGLY [BEFORE-SCALE] Programs at 375: FAB covers the "Handstand Walk" snap-peek card title. The peek is intentional; the FAB is not.
- POLISH [BEFORE-SCALE] Tap targets look under 44px (visual estimate): header gear ~24px both viewports, session info icon ~18px, plan chevrons ~16px, footer legal links at text height.
- POLISH Session rest-day page leaves ~200px empty at 375. No horizontal overflow on any capture; Programs horizontal scroll is intentional.
- No proposal bar or banner appears in any capture; the only sticky CTA is the Check bar.
- Caveat: 393 "01-today" is actually /off-plan/; its bottom image shows a "Lifts you did elsewhere" list absent from notes text. Treat 393 Today as unverified.
- No text truncated by width; clipping comes only from FAB and Record sheet.
