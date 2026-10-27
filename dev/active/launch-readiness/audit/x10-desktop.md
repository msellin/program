# X10 desktop visual audit (2026-10-27)
Scope: 8 desktop screenshots (persona-concurrent, persona-pullup), read-only. Paths relative to A.
- CONFUSING · persona-pullup/desktop/06-programs.png · [HACKATHON]: Category card rows are a mobile snap carousel that bleeds past the ~712px column on desktop, cards clipped at both edges, no arrows or scroll cue.
- UGLY · persona-pullup/desktop/02-plan.png (all screens) · [BEFORE-SCALE]: Bottom tab bar spans the full 1280px viewport while header and content sit in a centred ~712px column; nav and content do not share a width.
- CONFUSING · persona-concurrent/desktop/01-today.png · [HACKATHON]: Sticky "Apply 5% lighter / Ignore" bar floats mid-page. Probably a fixed-bar full-page capture artifact; verify in a live viewport before fixing.
- CONFUSING · persona-pullup/desktop/13-check.png · [HACKATHON]: "Update check" sticky button overlays the Regions list. Same capture-artifact question as above.
- UGLY · persona-pullup/desktop/05b-record.png · [LATER]: Latest retest card shows "0 reps 0.0" beside "0.0 reps since baseline", which reads as zero-value clutter.
- POLISH · persona-pullup/desktop/05b-record.png · [BEFORE-SCALE]: Micro mono labels (~10-11px) and low-contrast meta text across heatmap, retest card and session list.
- POLISH · persona-pullup/desktop/16-session-today.png · [LATER]: "Log extra session" icon sits left of the title, which is indented differently from the body text.
- POLISH · persona-pullup/desktop/16-session-today.png · [LATER]: Rest-day screen is two cards with the rest of the viewport empty; no desktop use of the space.
- POLISH · persona-pullup/desktop/19-intake.png · [LATER]: One question per screen with ~300px empty below; Yes/No buttons are small and the disabled Next state is low contrast.
- POLISH · persona-pullup/desktop/02-plan.png · [LATER]: Plan rows fill only the left part of the 712px column; the right half of each row is empty.
- POLISH · persona-pullup/desktop/03-account.png · [LATER]: Account page is a narrow stack with a large empty lower half; acceptable, but the desktop layout is still the phone layout.
Good: The content column width is consistent (~712px) across Today, Plan, Programs, Record, Check, Account and Intake, so no screen looks boxed differently from the others. Text is not clipped in any content card, and the red reserved for "Delete my account" keeps destructive action visually distinct.
Not checked: live viewport behaviour of fixed/sticky bars, hover and focus states, widths other than 1280, light mode, horizontal carousel scrolling, the Session past/future and legal screenshots (17, 18, 21-24), reset-password, Import GPX and the session-log form, keyboard navigation, and any desktop-specific nav (none exists in the captures).
