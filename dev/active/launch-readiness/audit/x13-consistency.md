# X13 design-consistency audit (2026-10-27)
Scope: persona-pullup mobile, 12 screens + landing home + sign-up (visual read of thumbnails, no CSS audit).

## Inventory
- **Headers (3):** (a) wordmark bar "• TERAV" + gear: Day, Plan, Profile, Settings, Check, Session. (b) back link + H1: Account, Settings, Report, Intake (intake adds mono step bar). (c) Record: wordmark + boxed EXPORT button, H1 visibly smaller. Sign-up: wordmark only, no gear.
- **H1:** bold sans ~32px on Day/Plan/Account/Profile/Check/Settings/Report; Record smaller; landing larger still.
- **Cards (4):** (1) filled, 1px border, no accent (Account, Profile, Settings, Plan stack); (2) left accent bar, 4+ colours (Day grey, Check green, Plan blue, Record white, Programs per category); (3) metric tiles 2x grid (Report, Record); (4) hairline list rows, no card (Profile, Record log).
- **Primary button (3 treatments):** tan rect r8 sentence case ("Update check", "Add"); tan rect uppercase tracked mono ("CREATE ACCOUNT", "SIGN OUT", "PRINT / SAVE PDF", "NEXT"); tan pill sentence case (landing "Start free").
- **Secondary (3):** outlined grey rect (Google, Back, Yes/No, Export); teal text links ("Log session", "Why?"); tan uppercase link ("Browse all programs").
- **Active-state idioms (3):** teal filled range pill (Progress), tan filled chip (Programs), white underline tab (Record 30D/90D).
- **Type:** eyebrows mono 11px uppercase tracked, in two forms (plain on Profile/Settings; ruled "— NOW ——" on Record/Check). Numerals mono on Report/Check, sans on Profile/Settings.
- **Accent:** tan (brand, primary, toggles, progress); teal (links, active range, chart); green (ready, CITED, GRADUATED); amber (status and ACTIVE tag, close to tan); red (Delete, RED-FLAG).
- **Icons:** thin line set consistent in nav, rows, gear. Chevron meaning split: down = expand (Profile, Plan), right = navigate (Account, Programs). Typed "→" used inside link copy (Log extra session, Retest).
- **Spacing:** 16px gutter held on all 12 screens. Card gaps 12-16px; Plan rows flush.
- **Bottom nav:** same 4 tabs and tan top indicator everywhere. Backdrop looks translucent on Plan/Report and solid on Day/Settings (unverified in pixels).

## Five changes, ranked by visual impact
1. [HACKATHON] One primary button: tan rect r8, sentence case, full width on forms. Drop uppercase mono and the landing pill. Hits Check, Intake, Sign-up, Report, Sign out, landing CTA.
2. [HACKATHON] One header rule: wordmark bar on tab roots only; sub-pages use back link + H1 at one size. Record takes the same H1, and EXPORT becomes a row action.
3. [BEFORE-SCALE] Left accent bar means status only (green ready, amber check, red flag). Remove decorative blue, grey, white bars and per-category Programs tints.
4. [BEFORE-SCALE] One eyebrow style (ruled or plain, pick one). Mono reserved for numbers and dates; sans for other values.
5. [LATER] Link grammar: teal = navigate, tan uppercase retired, typed "→" removed, down-chevron only for expand.

Not checked: 20-evidence and landing-home are too tall to read at thumbnail scale, so evidence density and landing sections were not judged. Not read: 04, 05, 07, 12, 17, 18, legal pages, other intake steps. No CSS or token audit; no 375px vs 393px comparison; nav backdrop unverified.
