# Profile — Copy clarity review

Owner: content-design
Written: 2026-08-18
Reviewed file: `next-app/src/app/profile/page.tsx`
Cross-checked: `next-app/src/app/(auth)/sign-up/page.tsx`, `landing/src/i18n/dictionaries/en.ts`
Scope: microcopy only (no code changes).

---

## Overall verdict (3 sentences)

The design-lead pass got the shape right — Profile now reads as a switchboard, not a dashboard — and most strings hold cold, but a handful still leak Terav-jargon (`primary`, `admin`, "How this app works") or borrow tone from the wrong register (marketing verb in the empty state, encyclopedic verb in the nav). The two ConfirmSheets are tonally mismatched to each other: sign-out is warmly reassuring, delete-account is correctly grave, but delete's body sentence is doing three jobs and would land harder as two shorter beats. Fix the seven items below and the page reads like Linear/Stripe, not like a settings screen written by a developer.

---

## P0 — copy that misleads or blocks the promise

### 1. Empty-state CTA — wrong verb for a first-timer

`profile/page.tsx:204` — **Current:** `Pick a program →`

Landing hero already spent this exact phrase (`hero.cta_primary: "Start free — pick my focus"`; `beta.cta_primary: "Pick my focus"`). Landing's word is **focus**, not **program** — because "program" is what the app calls the artefact, and "focus" is what the user came here for. The Profile empty state is the second time this user has ever seen a CTA of this kind, and it should echo landing, not diverge.

**Rewrite:** `Pick your focus →`

Why: matches landing dictionary (`beta.cta_primary`), reminds the user this is a *focused-improvement* tool (per positioning), and removes the meta-word "program" which is inventory language.

---

### 2. Delete-account body sentence — three jobs, one breath

`profile/page.tsx:293` — **Current:** `"This deletes your account, all logs, training maxes, morning checks, and every synced entry on our server. You cannot recover any of it after this action."`

31 words, comma-listy, and the second sentence ("this action") is a legalism. Danger copy should be short, concrete, and end on the irreversibility beat.

**Rewrite:** `Everything goes — logs, training maxes, morning checks, server copies. This cannot be undone.` (14 words)

Why: same enumerated coverage but scannable; the final clause carries the danger without needing a second sentence.

---

## P1 — jargon + tone drift to fix this week

### 3. `admin` badge label — internal word, exposed to the user

`profile/page.tsx:151` — **Current:** badge text `admin`, tooltip `"Super admin — multi-plan enrollment unlocked."`

Only the founder sees this today, but the tooltip explains *what it unlocks* rather than *what it is*. And "Super admin" is developer language.

**Rewrite:** badge text `staff`; tooltip `"Staff account — you can enrol in multiple programs at once."`

Why: `staff` is Stripe/Linear/Notion's convention for internal accounts. Tooltip drops the "unlocked" gaming verb.

---

### 4. `primary` badge — accurate, but the wrong noun for a beta user

`profile/page.tsx:185` — **Current:** `primary`

A user with two active programs sees "primary" on one and nothing on the other. Without hover context they don't know what "primary" gates — does Today draw from it? Do proposals fire against it? The word is a database column leaking into UI.

**Rewrite:** `driving today` (or short form: `today's`)

Why: names the *effect* the user cares about (this is the program Today pulls from), not the internal role. If space is tight, `today's` fits under the same mono-10 badge and reads as a possessive, not a status.

---

### 5. `since Aug 2025` — cold and orphan

`profile/page.tsx:156` — **Current:** `since {memberSince}` → renders as e.g. `since Aug 2025`

There's no verb, no subject, and the reader has to reconstruct "you have been a member since". Fine for a receipt; on a Profile page it reads like debug output.

**Rewrite:** `joined Aug 2025`

Why: one word, past tense, complete thought. Matches how GitHub/Linear render this exact string.

---

### 6. `How this app works` — nav label written by the developer

`profile/page.tsx:227` — **Current:** `How this app works`

Five words for what every comparable product calls **Guide** or **Help**. It's also self-referential ("this app") in a way that landing never is — landing says "Terav". Users don't need meta-orientation once they're already inside.

**Rewrite:** `Guide` (matches the route name `/guide`)

Why: 1 word (per your own style rules on nav labels), matches the URL, matches the H1 on that page, matches how landing treats naming (never says "this app").

---

### 7. Sign-out ConfirmSheet body — one word too warm

`profile/page.tsx:282` — **Current:** `"Your data stays synced — you can sign back in any time."`

The em-dash promise reads as reassurance-with-a-wink. It's slightly over-warm for a sheet the user only sees when they've deliberately tapped a destructive-looking button. Landing's voice (`wontdo.not_streak_body: "Skip a week. The plan sharpens against that too."`) is calmer and shorter.

**Rewrite:** `Your data is synced. Sign in from any device to pick back up.` (13 words)

Why: two clean sentences, no em-dash flourish, matches landing's short-sentence cadence. "Any device" is more useful than "any time" — it answers the actual worry ("did I just lock myself out of this laptop?").

---

## P2 — polish

### 8. Coach nav hidden vs. placeholder — **keep hidden**

`profile/page.tsx:209` — the row only renders when `coachConfigured()`.

Correct call. A "Coach coming soon" placeholder would violate landing's `wontdo.not_certain` posture (Terav quotes ranges, not promises). Shipping an inert row would train users to ignore nav. Leave as-is; when Coach lands, the row appears with no announcement needed.

No change.

---

### 9. Footer verb consistency — "Export my data (JSON)" vs. "Delete my account"

`profile/page.tsx:260, 271` — both use the same possessive ("my"), same voice, both muted underlines. This is good — matches the ConfirmSheet's use of "your" and lands as consistent first-person-from-the-user framing.

Small nit: `Export my data (JSON)` — the format hint in parens is helpful but breaks the visual pair with `Delete my account`. If you want tighter symmetry:

**Rewrite:** `Export my data` (drop the JSON hint; put it in the ConfirmSheet or filename toast if needed)

Why: symmetry with `Delete my account`; the file downloads as `terav-data-2026-08-18.json` anyway, so the format reveals itself. Optional — not blocking.

---

### 10. Sign-up consent → Profile continuity — hold

`sign-up/page.tsx:213-218` — **Current:** `"I consent to storing my training log and symptom scores. See the privacy policy — you can export or delete everything from Profile."`

This is already excellent. It uses "you can export or delete everything from Profile" — which is the exact promise the Profile footer must honour. The current footer labels (`Export my data`, `Delete my account`) do honour it. Continuity holds; no change needed.

Note for later: if the export label loses `(JSON)` per item 9, the consent line stays accurate.

---

## Cross-persona check

- **persona-recover** — the rehab user reads "Delete forever" and the P0 rewrite ("Everything goes … cannot be undone") as appropriately grave, not scolding. `driving today` (P1 item 4) reassures them their hip program is the one Today respects. No dogpile.
- **persona-strength** — the overperformer will hit the empty state least often but will fat-finger between programs; `driving today` tells them at a glance which one their Accept/Ignore prompts run against. `joined Aug 2025` reads as a stat, not a scold.
- **persona-erratic** — the skipper is the persona this page must not moralise at. Current copy already avoids streak/compliance language (compliance card is gone). Sign-out's shorter body ("Sign in from any device to pick back up") lands as invitation, not obligation. No "welcome back!" surface. Safe.

---

## What NOT to change

- `Sign out?` title — perfect. One word + question mark.
- `Delete your account permanently?` title — the adverb "permanently" is doing real work; keep it.
- `Delete forever` confirm label — 2 words, danger-red, correct.
- Footer legal labels (`Privacy / Terms / Medical disclaimer`) — matches sign-in footer (`sign-in/page.tsx:220`) and the disclaimer route H1 (`legal/disclaimer/page.tsx:10`). Consistent. Hold.
- Loading skeleton `aria-label="Loading email"` — plain, correct.

---

## One thing if you only fix one

Rename the empty-state CTA from `Pick a program →` to `Pick your focus →` (P0 item 1). It's the single string on this page that a user reads *before* they've committed to Terav's positioning, and right now it uses the app's internal noun instead of the promise landing sold them.
