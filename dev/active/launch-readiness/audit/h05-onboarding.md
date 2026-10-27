# H05 onboarding path (read-only, 2026-10-27)
**Verdict:** The landing's program choice is lost for new sign-ups. Path = 7 steps, 1 email round-trip, 16 required inputs for first-strict-pullup before first session.

**Path (file refs):**
1. Landing CTA: `landing/src/components/sections/Hero.tsx:81`, `BetaCTA.tsx:22` → `app.terav.fit/sign-up` (no program). Program page `landing/src/app/programs/[slug]/page.tsx:159` → `/sign-up?next=/programs/<slug>`.
2. Sign-up `next-app/src/app/(auth)/sign-up/page.tsx`: 4 required (email, password ≥8, terms box, health-data consent box). Google alt. Not skippable.
3. Email confirm: "Check your email" screen; link → `/sign-in` (emailRedirectTo hard-coded, page.tsx ~L87). Wait = user's inbox.
4. Today `/` → `NoActiveProgram` "Pick your focus" (`components/session/TodaySession.tsx:663`).
5. `/programs` (semi-public, `lib/route-access.ts:34`) → `/programs/[slug]` `ProgramPreviewClient.tsx` "Start" → `/programs/<slug>/intake`.
6. Intake `programs/[slug]/intake/IntakeClient.tsx`: first-strict-pullup = 10 required answers + 2 required consent ticks, 3 block-severity safety gates (acute shoulder, cervical radiculopathy, hypertension). 5 physical tests optional (skip-all exists). Tier pre-inferred, one-tap confirm. Catalog range: 9–14 required questions (manifest scan).
7. Commit (~L514) → `/` Today → session.

**Program carry-through: LOST.** Sign-up never reads `?next`; emailRedirectTo and GoogleAuthButton take no next. Sign-in does honour next (`sign-in/page.tsx:21,71`), and guest→intake redirect works in-app, but the ad path starts at sign-up.

**Top drop-off risks:**
1. [BLOCKS-ADS-TODAY] Closed beta: signup is a Supabase dashboard toggle; when closed, every click ends at "invite-only, email Margus" (`lib/auth-errors.ts:26-33`). No invite code in repo. Live toggle not checked.
2. [BLOCKS-ADS-TODAY] Program lost + email round-trip: paid click for a named program lands on "Pick your focus" after confirming. Fix: carry next through sign-up → emailRedirectTo → sign-in, and GoogleAuthButton. Also `sign-in/page.tsx:215` "Sign up" link drops next.
3. [BEFORE-SCALE] 16 required inputs + safety blocks before first session, while BetaCTA.tsx promises "first session on Today within two minutes". Block screens are dead ends for cold traffic (no alternative program found in code).

**Other:**
- [LATER] Browse→Start path works for guests (sign-in?next=intake) only if user already has an account or finds the sign-in link.

Not checked: live Supabase signup and email-confirm settings, redirect URL allowlist (does `?next=` survive), session/KV sync on commit, Today content after commit, phone-width rendering, safety-block alternatives, ad/analytics attribution.
